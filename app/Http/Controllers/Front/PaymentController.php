<?php

namespace App\Http\Controllers\Front;

use App\Events\ShowNotification;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Services\PrinterBillServices;
use App\Models\LogLogin;
use App\Models\Meja;
use App\Models\Printer;
use App\Models\Transaksi;
use App\Models\TransaksiPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    protected $printer;

    public function __construct(PrinterBillServices $printer)
    {
        $this->printer = $printer;
    }

    public function billPayment(Request $r)
    {
        if (env("PRINT_PAYMENT", false)) {
            $printer = Printer::kasir();
            if (!$printer) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Error: Printer Kasir tidak terkoneksi dengan server !",
                ], 403);
            }
        }

        $payment = 0;
        $user = Auth::user();
        TransaksiPayment::where('transaksi_id', $r->transaksi_id)->delete();

        foreach ($r->payments as $k => $v) {
            $v = (object) $v;
            TransaksiPayment::create([
                'transaksi_id' => $r->transaksi_id,
                'type_id' => $v->type_id,
                'nominal' => $v->nominal,
            ]);
            $payment += $v->nominal;
        }

        $trx = Transaksi::find($r->transaksi_id);
        $trx->jam_selesai = Date("Y-m-d H:i:s");
        $trx->payment = $payment;
        $trx->kembali = $trx->payment - $trx->bayar;
        $trx->status = Meja::$PAID;
        $trx->user_kasir_id = $user->id;
        $trx->save();

        if (env("PRINT_PAYMENT", false)) {
            $this->printer->printBill($printer, $trx->id, true);
        }

        $msg = $user->name . " : Pembayaran Meja $trx->meja Selesai";
        event(new ShowNotification($msg, 'primary'));

        return response()->json([
            'status' => 'ok',
            'msg' => $msg,
        ], 200);
    }
}
