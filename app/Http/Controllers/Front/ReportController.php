<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Services\PrinterSalesReportServices;
use App\Models\LogLogin;
use App\Models\Printer;
use App\Models\TransaksiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function salesByShift(Request $r)
    {
        $shift = LogLogin::with("user")->find($r->shift_id);
        if (!$shift) {
            return response()->json([
                "status" => "error",
                "msg" => "Shift tidak ditemukan !",
            ], 404);
        }

        $trxDets = TransaksiDetail::selectRaw("sku, sum(qty) as qty")
            ->whereHas("transaksi", function ($q) use ($shift) {
                $q->where("tgl", $shift->tgl);
                $q->where("user_kasir_id", $shift->user_id);
            })
            ->with(["barang" => function ($q) {
                $q->select("sku", "deskripsi");
            }])
            ->groupBy("sku")
            ->get();

        if (!$trxDets) {
            return response()->json([
                "status" => "error",
                "msg" => "Data tidak ditemukan !",
            ], 404);
        }

        return response()->json([
            "status" => "ok",
            "msg" => "-",
            "shift" => [
                "shift" => $shift->shift,
                "user" => $shift->user->name,
                "tgl" => $shift->tgl,
                "open" => $shift->open_time,
                "close" => $shift->close_time,
            ],
            "items" => $trxDets,
        ], 200);
    }

    public function salesByTgl(Request $r)
    {
        $trxDets = TransaksiDetail::selectRaw("sku, sum(qty) as qty")
            ->whereHas("transaksi", function ($q) use ($r) {
                $q->where("tgl", $r->tgl);
            })
            ->with(["barang" => function ($q) {
                $q->select("sku", "deskripsi");
            }])
            ->groupBy("sku")
            ->get();

        if (!$trxDets) {
            return response()->json([
                "status" => "error",
                "msg" => "Data tanggal $r->tgl tidak ditemukan !",
            ], 404);
        }

        return response()->json([
            "status" => "ok",
            "msg" => "-",
            "items" => $trxDets,
        ], 200);
    }

    public function salesByItemsPrint(Request $r)
    {
        $user = Auth::user();
        if ($user->level === 3) {
            return response()->json([
                "status" => "error",
                "msg" => "User $user->name tidak diijinkan mencetak laporan ini !",
            ], 403);
        }

        $printer = Printer::kasir();
        if (!$printer) {
            return response()->json([
                "status" => "error",
                "msg" => "Printer Kasir tidak ditemukan !",
            ], 404);
        }

        if (env("PRINT_REPORT", false)) {
            PrinterSalesReportServices::dispatch((object) $r->data, $printer);
        }

        return response()->json([
            "status" => "ok",
            "msg" => "-",
        ], 200);
    }
}
