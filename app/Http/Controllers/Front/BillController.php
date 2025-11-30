<?php

namespace App\Http\Controllers\Front;

use App\Events\ShowNotification;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Services\PrinterBillServices;
use App\Models\Meja;
use App\Models\Printer;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillController extends Controller
{
    protected $printer;

    public function __construct(PrinterBillServices $printer)
    {
        $this->printer = $printer;
    }

    public function billOrderList(Request $r)
    {
        try {
            $trx = Transaksi::find($r->transaksi_id);
            $trxDet = TransaksiDetail::getBillOrders($r->transaksi_id);

            if ($trxDet->count() == 0) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Meja $trx->meja tidak memiliki Orderan !",
                ], 403);
            }

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'trx' => $trx,
                'trxDet' => $trxDet,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => "error",
                "error" => "Server Error: Bill Order List",
            ], 500);
        }
    }

    public function printBill(Request $r)
    {
        if (env("PRINT_BILL", false)) {
            $printer = Printer::kasir();
            if (!$printer) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Error: Printer Kasir tidak terkoneksi dengan server !",
                ], 403);
            }
        }

        $trx = Transaksi::find($r->transaksi_id);
        $trx->user_kasir_id = Auth::user()->id;
        $trx->user_cetak_id = Auth::user()->id;
        $trx->status = Meja::$PRINT_BILL;
        $trx->save();

        if (env("PRINT_BILL", false)) {
            $this->printer->printBill($printer, $trx->id, false);
        }

        $msg = Auth::user()->name . " : Mencetak Bill Meja $trx->meja";
        event(new ShowNotification($msg, 'primary'));
    }
}
