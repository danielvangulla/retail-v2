<?php

namespace App\Http\Controllers\Front;

use App\Events\OmsetCode;
use App\Events\ShowNotification;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Http\Controllers\Services\PrinterCOServices;
use App\Models\Barang;
use App\Models\BarangExt;
use App\Models\Kategori;
use App\Models\Kategorisub;
use App\Models\LogLogin;
use App\Models\LogMenu;
use App\Models\Printer;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function pindahMenu(Request $r)
    {
        try {
            $spv = User::where("pin", $r->pin)->where("level", 1)->first();
            if (!$spv) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Invalid PIN Supervisor..!",
                ], 403);
            }

            $trxTujuan = Transaksi::where("meja", $r->meja_tujuan)->where("status", 1)->first();
            if (!$trxTujuan) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Meja $r->meja_tujuan harus dalam keadaan check-in.",
                ], 403);
            }

            $user = Auth::user();
            foreach ($r->orders as $v) {
                $v = (object) $v;
                $co = TransaksiDetail::where("transaksi_id", $r->transaksi_id)->where("sku", $v->sku)->first();

                LogMenu::create([
                    "transaksi_det_id" => $co->id,
                    "transaksi_id_awal" => $r->transaksi_id,
                    "transaksi_id_tujuan" => $trxTujuan->id,
                    "meja_awal" => $r->meja_awal,
                    "meja_tujuan" => $r->meja_tujuan,
                    "user_id" => $user->id,
                    "name" => $user->name,
                    "spv_id" => $spv->id,
                    "spv_name" => $spv->name,
                ]);

                $co->transaksi_id = $trxTujuan->id;
                $co->save();
            }

            Transaksi::recountTrx($r->transaksi_id);
            Transaksi::recountTrx($trxTujuan->id);

            $msg = Auth::user()->name . " : Pindah Menu dari $r->meja_awal ke Meja $r->meja_tujuan.";
            event(new ShowNotification($msg, 'success'));

            return response()->json([
                "status" => "ok",
                "msg" => "Menu berhasil dipindahkan ke Meja $r->meja_tujuan",
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => "Error saat proses Pindah Menu..!",
                "error" => "$th",
            ], 500);
        }
    }

    public function orderedList(Request $r)
    {
        try {
            $trxDet = TransaksiDetail::select(["transaksi_dets.transaksi_id", "transaksi_dets.sku", "transaksi_dets.note", "barang.deskripsi"])
                ->selectRaw("SUM(transaksi_dets.qty) as qty")
                ->join("barang", "barang.sku", "=", "transaksi_dets.sku")
                ->where("transaksi_id", $r->transaksi_id)
                ->where("qty", ">", 0)
                ->groupBy("transaksi_dets.transaksi_id", "transaksi_dets.sku", "transaksi_dets.note", "barang.deskripsi")
                ->orderBy("transaksi_dets.sku")
                ->get();

            return response()->json([
                "status" => "ok",
                "msg" => "-",
                "orders" => $trxDet,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => "error",
                "msg" => "Error to get Order Void List..!",
            ], 500);
        }
    }

    public function orderList(Request $r)
    {
        $kategori = Kategori::getUsed();
        $kategorisub = Kategorisub::getUsed();

        $ordered = TransaksiDetail::join("barang", "barang.sku", "=", "transaksi_dets.sku")
            ->select(["transaksi_dets.sku", DB::raw("sum(transaksi_dets.qty) as qty"), "barang.deskripsi", "transaksi_dets.note"])
            ->where("transaksi_id", $r->transaksi_id)
            ->where("qty", ">", 0)
            ->groupBy(["transaksi_dets.sku", "barang.deskripsi", "transaksi_dets.note"])
            ->orderBy(DB::raw("transaksi_dets.sku", "transaksi_dets.jam"))
            ->get();

        $barang = Barang::select(["sku", "kategori_id", "kategorisub_id", "deskripsi", "satuan", "harga_jual"])
            ->orderBy(DB::raw("kategori_id", "kategorisub_id", "sku"))
            ->where("kategori_id", ">", 0)
            ->where("kategorisub_id", ">", 0)
            ->where("harga_jual", ">=", 1)
            ->where("st_aktif", 1)
            ->get();

        return response()->json([
            "status" => "ok",
            "msg" => "-",
            "kategori" => $kategori,
            "kategorisub" => $kategorisub,
            "barang" => $barang,
            "ordered" => $ordered,
        ], 200);
    }

    public function orderStore(Request $r)
    {
        $transaksi = Transaksi::find($r->transaksi_id);
        $orders = $r->orders;
        $noCo = Helpers::generateNoCO();
        $rateService = env("RATE_SERVICE", 0) / 100;
        $rateTax = env("RATE_TAX", 0) / 100;

        foreach ($orders as $k => $v) {
            $v = (object) $v;
            $barang = Barang::where("sku", $v->sku)->first();

            $brutto = $barang->harga_jual * $v->qty;
            $netto = $brutto;
            $service = $netto * $rateService;
            $tax = $netto * $rateTax;
            $bayar = $netto + $service + $tax;

            $payload = [
                "transaksi_id" => $transaksi->id,
                "tgl" => $transaksi->tgl,
                "jam" => DB::raw("CURRENT_TIMESTAMP"),
                "no_co" => $noCo,
                "sku" => $barang->sku,
                "qty" => $v->qty,
                "harga" => $barang->harga_jual,
                "brutto" => $brutto,
                "netto" => $netto,
                "service" => $service,
                "tax" => $tax,
                "bayar" => $bayar,
                "user_order_id" => Auth::user()->id,
                "note" => $v->note != null ? $v->note : "-",
            ];

            TransaksiDetail::create($payload);
        }

        Transaksi::recountTrx($transaksi->id);

        if (env("PRINT_ORDER", false)) {
            $this->cetakCO($noCo);
        }

        if (env("PRINT_CHECKLIST", false)) {
            $this->cetakChecklist($noCo);
        }

        $msg = Auth::user()->name . " : Mencetak CO Meja $transaksi->meja";
        event(new ShowNotification($msg, "primary"));
        event(new OmsetCode());

        return response()->json([
            "status" => "ok",
            "msg" => "-",
        ], 200);
    }

    public function cetakCO($noCo)
    {
        $group = TransaksiDetail::select(
            "transaksis.meja",
            "users.name as captain",
            "barang.printer_id",
            "printers.nama as printer_name",
            "printers.ip_address"
        )
            ->join("barang", "barang.sku", "=", "transaksi_dets.sku")
            ->join("printers", "printers.id", "=", "barang.printer_id")
            ->join("transaksis", "transaksis.id", "=", "transaksi_dets.transaksi_id")
            ->join("users", "users.id", "=", "transaksi_dets.user_order_id")
            ->where("transaksi_dets.no_co", $noCo)
            ->whereNull("transaksi_dets.printed_at")
            ->where("barang.printer_id", ">", 0)
            ->groupBy("transaksis.meja", "users.name", "barang.printer_id", "printers.nama", "printers.ip_address")
            ->get();

        foreach ($group as $v) {
            $qtyCetak = env("PRINT_ORDER_QTY", 1);

            $print = false;
            for ($i = 0; $i < $qtyCetak; $i++) {
                $print = $this->prosesCetakCo($noCo, $v, $i + 1);
            }

            if ($print === true) {
                TransaksiDetail::where("no_co", $noCo)
                    ->whereHas("barang", function ($query) use ($v) {
                        $query->where("printer_id", $v->printer_id);
                    })
                    ->update([
                        "printer_name" => $v->nama,
                        "printed_at" => DB::raw("CURRENT_TIMESTAMP"),
                    ]);
            }
        }
    }

    public function prosesCetakCo($noCo, $group, $copy): bool
    {
        $co = TransaksiDetail::with(["barang", "barang.printer"])
            ->where("no_co", $noCo)
            ->whereHas("barang", function ($query) use ($group) {
                $query->where("printer_id", $group->printer_id);
            })->get();

        $data = (object) [
            "captain" => $group->captain,
            "printer_name" => "CO $group->printer_name",
            "printer_ip" => $group->ip_address,
            "no_co" => $noCo,
            "meja" => $group->meja,
            "items" => []
        ];

        foreach ($co as $v) {
            $data->items[] = [
                "qty" => $v->qty,
                "deskripsi" => $v->barang->deskripsi,
                "note" => $v->note,
            ];
        }

        PrinterCOServices::dispatch($data, $copy);
        return true;
    }

    public function cetakChecklist($noCo): void
    {
        $printer = Printer::kasir();

        $co = TransaksiDetail::with(["transaksi", "barang", "barang.printer", "captain"])
            ->where("no_co", $noCo)
            ->whereHas("barang", function ($query) {
                $query->where("checker_id", 1);
            })->get();

        $data = (object) [
            "captain" => "",
            "printer_name" => "Order Checklist",
            "printer_ip" => "",
            "no_co" => $noCo,
            "meja" => "",
            "items" => []
        ];

        foreach ($co as $k => $v) {
            if ($k == 0) {
                $data->captain = $v->captain->name;
                $data->printer_ip = $printer->ip_address;
                $data->meja = $v->transaksi->meja;
            }

            $data->items[] = [
                "qty" => $v->qty,
                "deskripsi" => $v->barang->deskripsi,
                "note" => $v->note,
            ];
        }

        PrinterCOServices::dispatch($data);
    }
}
