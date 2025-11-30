<?php

namespace App\Http\Controllers\Front;

use App\Events\OmsetCode;
use App\Events\ShowNotification;
use App\Http\Controllers\Controller;
use App\Models\LogLogin;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\TransaksiVoid;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderVoidController extends Controller
{
    public function orderVoidStore(Request $r)
    {
        try {
            $spv = User::where('pin', $r->pin)->where('level', 1)->first();
            if (!$spv) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Invalid PIN Supervisor..!",
                ], 403);
            }

            $transaksi_id = 0;
            $rateService = env("RATE_SERVICE", 0);
            $rateTax = env("RATE_TAX", 0);
            $user = Auth::user();

            foreach ($r->orders as $k => $v) {
                $v = (object) $v;
                $order = TransaksiDetail::where('sku', $v->sku)->where('note', $v->note)->first();

                if ($transaksi_id === 0) {
                    $transaksi_id = $order->transaksi_id;
                }

                $void = [
                    "tgl" => $order->tgl,
                    "no_co" => $order->no_co,
                    "transaksi_id" => $order->transaksi_id,
                    "transaksi_det_id" => $order->id,
                    "sku" => $v->sku,
                    "qty" => $v->qty,
                    "brutto" => $order->harga * $order->qty,
                    "disc_spv" => 0,
                    "disc_promo" => 0,
                    "netto" => $order->brutto - $order->disc_spv - $order->disc_promo,
                    "service" => $order->netto / 100 * $rateService,
                    "tax" => $order->netto / 100 * $rateTax,
                    "bayar" => $order->netto + $order->service + $order->tax,
                    "note" => $order->note,
                    "alasan" => $r->alasan,
                    "user_order_id" => $order->user_order_id,
                    "user_void_id" => $user->id,
                    "user_spv_id" => $spv->id,
                    "printer_name" => $order->printer_name,
                    "printed_at" => $order->printed_at,
                ];
                TransaksiVoid::create($void);

                $this->decreaseQtyOnVoid($v);
            }

            if ($transaksi_id !== 0) {
                Transaksi::recountTrx($transaksi_id);
            }

            $msg = $user->name . " : Void menu di Meja $r->meja";
            event(new ShowNotification($msg, "danger"));
            event(new OmsetCode());

            return response()->json([
                "status" => "ok",
                "msg" => "-",
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "status" => "error",
                "msg" => "Error to Store Void..!",
            ], 500);
        }
    }

    private function decreaseQtyOnVoid($v)
    {
        $qtyVoid = $v->qty;
        $rateService = env("RATE_SERVICE", 0);
        $rateTax = env("RATE_TAX", 0);

        while ($qtyVoid > 0) {
            $order = TransaksiDetail::where('sku', $v->sku)
                ->where('note', $v->note)
                ->where('qty', '>', 0)
                ->first();

            if (!$order) {
                break;
            }

            $qtyToVoid = min($qtyVoid, $order->qty);

            $order->qty -= $qtyToVoid;
            $order->brutto = $order->harga * $order->qty;
            $order->disc_spv = 0;
            $order->disc_promo = 0;
            $order->netto = $order->brutto - $order->disc_spv - $order->disc_promo;
            $order->service = $order->netto / 100 * $rateService;
            $order->tax = $order->netto / 100 * $rateTax;
            $order->bayar = $order->netto + $order->service + $order->tax;
            $order->save();

            $qtyVoid -= $qtyToVoid;
        }
    }
}
