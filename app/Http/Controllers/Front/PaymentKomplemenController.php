<?php

namespace App\Http\Controllers\Front;

use App\Events\ShowNotification;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Services\PrinterKomplemenServices;
use App\Models\Komplemen;
use App\Models\Meja;
use App\Models\Printer;
use App\Models\Transaksi;
use App\Models\TransaksiPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentKomplemenController extends Controller
{
    public function komplemenList()
    {
        try {
            $komplemen = Komplemen::select('id', 'name')->where('is_aktif', 1)->orderBy('name')->get();
            if (!$komplemen) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Data Komplemen tidak ditemukan !",
                ], 404);
            }

            if ($komplemen->count() === 0) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Fitur Komplemen tidak diijinkan di Outlet ini. <br><br>Hubungi Owner/Admin untuk info.",
                ], 404);
            }

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'data' => $komplemen,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'ok',
                'msg' => 'Server Error: Komplemen List',
            ], 200);
        }
    }

    public function komplemenProses(Request $r)
    {
        $spv = User::where('pin', $r->pin)->where('level', 1)->first();
        if (!$spv) {
            $msg = Auth::user()->name . " : Invalid PIN SPV! Komplemen Meja $r->meja";
            event(new ShowNotification($msg, 'danger'));
            return response()->json([
                "status" => "error",
                "msg" => "Invalid PIN Supervisor..!",
            ], 403);
        }

        if (env("PRINT_PAYMENT", false)) {
            $printer = Printer::kasir();
            if (!$printer) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Error: Printer Kasir tidak terkoneksi dengan server !",
                ], 403);
            }
        }

        $user = Auth::user();
        TransaksiPayment::where('transaksi_id', $r->transaksi_id)->delete();

        $trx = Transaksi::find($r->transaksi_id);
        $trx->jam_selesai = Date("Y-m-d H:i:s");
        $trx->kembali = 0;
        $trx->is_piutang = 0;
        $trx->piutang_id = null;
        $trx->is_komplemen = 1;
        $trx->komplemen_id = $r->komplemen_id;
        $trx->status = Meja::$PAID;
        $trx->user_kasir_id = $user->id;
        $trx->user_spv_id = $spv->id;
        $trx->save();

        if (env("PRINT_PAYMENT", false)) {
            PrinterKomplemenServices::dispatch($printer, $trx->id);
        }

        $msg = $user->name . " : Proses Komplemen Meja $trx->meja";
        event(new ShowNotification($msg, 'primary'));

        return response()->json([
            'status' => 'ok',
            'msg' => $msg,
        ], 200);
    }
}
