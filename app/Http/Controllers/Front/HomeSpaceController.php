<?php

namespace App\Http\Controllers\Front;

use App\Models\Meja;
use App\Events\ChangeStatusMejaAll;
use App\Events\OmsetCode;
use App\Events\ShowNotification;
use App\Events\SyncBarang;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Transaksi;
use App\Models\TransaksiPaymentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeSpaceController extends Controller
{
    public function index()
    {
        $macId = (object) Helpers::macId();
        if ($macId->status !== "registered.") {
            return response()->json($macId, 403);
        }

        $data = Meja::where("st_aktif", 1)->get();
        $trx = Transaksi::getActives();

        foreach ($data as $k => $v) {
            $colors = Helpers::colors();
            $v->bg = $colors[Meja::$EMPTY];

            $v->transaksi_id = 0;
            foreach ($trx as $kk => $vv) {
                if ($v->no === $vv->meja) {
                    $v->transaksi_id = $vv->id;
                    $v->bg = $colors[$vv->status];
                }
            }

            if ($v->is_used) {
                $v->bg = $colors[Meja::$USED];
            }
        }

        $paymentTypes = TransaksiPaymentType::orderBy("urutan")->orderBy("ket")->get();

        $keysArray = [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
            ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
            ["z", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
        ];

        // $msg = Auth::user()->name . " : Login Successfully.";
        // event(new ShowNotification($msg, "primary"));

        return Inertia::render('front/HomeSpace', compact('data', 'paymentTypes', 'keysArray'));
    }

    public function syncBarang()
    {
        event(new OmsetCode());
        event(new SyncBarang());

        return response()->json([
            "status" => "ok",
            "msg" => "-",
        ], 200);
    }

    public function cekMeja(Request $r)
    {
        try {
            $nomor_meja = $r->data;
            $meja = Meja::select("no", "is_used", "used_by")->where("no", $nomor_meja)->first();

            $meja->note = "Available";

            if ($meja->used_by === Auth::user()->name) {
                $meja->is_used = 0;
            }

            if ($meja->is_used) {
                $meja->note = "Mohon Tunggu!! Sedang digunakan oleh $meja->used_by";
            }

            $trx = Transaksi::getActive($meja->no);

            $meja->status = 0;
            if (isset($trx)) {
                $meja->status = $trx->status;
            }

            return response()->json([
                "status" => "ok",
                "msg" => "-",
                "meja" => $meja,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => "error",
                "msg" => "Server Error: Proses Cek Meja",
            ], 500);
        }
    }

    public function statusMeja(Request $r)
    {
        try {
            $nomor = $r->no_meja;
            $status = $r->status;
            $user = Auth::user();
            $meja = Meja::where("no", $nomor)->first();

            if ($meja->is_used == 1 and $meja->used_by != $user->name) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Meja sedang digunakan..",
                ], 403);
            }

            $name = $status == 1 ? $user->name : "-";
            $payload = [
                "is_used" => $status,
                "used_by" => $name,
            ];
            Meja::where("no", $nomor)->update($payload);

            event(new ChangeStatusMejaAll());
            return response()->json([
                "status" => "ok",
                "msg" => "-",
                "broadcast" => true,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => "error",
                "msg" => "Server Error: Proses Update Status Meja",
            ], 500);
        }
    }
}
