<?php

namespace App\Http\Controllers\Front;

use App\Events\ChangeStatusMejaAll;
use App\Events\ShowNotification;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Http\Controllers\Services\PrinterShiftServices;
use App\Models\LogLogin;
use App\Models\Printer;
use App\Models\Transaksi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShiftController extends Controller
{
    protected $printer;

    public function __construct(PrinterShiftServices $printer)
    {
        $this->printer = $printer;
    }

    public function getShifts()
    {
        $shift = LogLogin::select('id', 'user_id', 'tgl', 'shift')
            ->with(['user' => function ($q) {
                $q->select('id', 'name');
            }])
            ->orderBy('tgl', 'desc')->orderBy('shift', 'desc')->get();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $shift,
        ], 200);
    }

    public function openShift()
    {
        try {
            $msg = "testing broadcast";
            event(new ShowNotification($msg, 'primary'));
            // event(new ChangeStatusMejaAll());

            return response()->json([
                "status" => "ok",
                "msg" => $msg,
            ], 200);

            $user = Auth::user();
            $tgl = Helpers::transactionDate();

            $log = LogLogin::with('user')->whereNull('close_time')->first();
            if (isset($log)) {
                $tglTrx = Helpers::transactionDate();
                if ($log->tgl !== $tglTrx) {
                    return response()->json([
                        "status" => "error",
                        "msg" => "Shift hari sebelumnya belum ditutup oleh Kasir: {$log->user->name} !",
                    ], 403);
                }

                return response()->json([
                    "status" => "error",
                    "msg" => "Shift saat ini masih terbuka oleh Kasir: {$log->user->name} !",
                ], 403);
            }

            $log = LogLogin::with('user')->where('user_id', $user->id)->where('tgl', $tgl)->first();
            if (isset($log)) {
                return response()->json([
                    "status" => "error",
                    "msg" => "User {$log->user->name} sudah pernah Open Shift: {$log->shift} !",
                ], 403);
            }

            $shift = LogLogin::where('tgl', $tgl)->whereNotNull('close_time')->count();

            $payload = [
                "user_id" => $user->id,
                "tgl" => $tgl,
                "shift" => $shift + 1,
            ];

            $logLogin = LogLogin::create($payload);

            $msg = $user->name . " : Open Shift $logLogin->shift Success.";
            event(new ShowNotification($msg, 'primary'));
            event(new ChangeStatusMejaAll());

            return response()->json([
                "status" => "ok",
                "msg" => $msg,
            ], 200);
        } catch (\Throwable $th) {
            $msg = "Server Error: Open Shift!";
            if (env("APP_DEBUG")) {
                $msg = "Server Error: $th";
            }

            return response()->json([
                "status" => "error",
                "msg" => $msg,
            ], 500);
        }
    }

    public function closeShift(Request $r): JsonResponse
    {
        $user = Auth::user();

        $shift = LogLogin::whereNull('close_time')->first();
        if (!isset($shift)) {
            return response()->json([
                "status" => "error",
                "msg" => "Tidak ada Shift yang terbuka !",
            ], 403);
        }

        $trxWaitingPayment = Transaksi::where('status', 3)->exists();
        if ($trxWaitingPayment and $shift->shift > 1) {
            return response()->json([
                "status" => "error",
                "msg" => "Error: Transaksi hari sebelumnya belum dibayar !",
            ], 403);
        }

        $printer = Printer::kasir();
        if (!$printer) {
            return response()->json([
                "status" => "error",
                "msg" => "Error: Printer Kasir tidak terkoneksi dengan server !",
            ], 403);
        }

        try {
            $omset = $this->getOmset($shift);

            $payload = [
                "close_time" => Date("Y-m-d H:i:s"),
                "s_cash" => $r->cash,
                "s_card" => $r->card,
                "s_total" => $r->cash + $r->card,
                "o_cash" => $omset->cash,
                "o_card" => $omset->card,
                "o_total" => $omset->total,
                "selisih" => $this->selisih($r, $omset),
                "komplemen" => $this->komplemen($shift),
                "piutang" => $this->piutang($shift),
            ];
            $shift->update($payload);

            if (env("PRINT_CLOSESHIFT", false)) {
                $this->printer->printCloseShift($shift, $printer);
            }

            $msg = $user->name . " : Close Shift $shift->shift Success.";
            event(new ShowNotification($msg, 'primary'));
            event(new ChangeStatusMejaAll());

            return response()->json([
                "status" => "ok",
                "msg" => $shift,
            ], 200);
        } catch (\Throwable $th) {
            $shift->close_time = null;
            $shift->save();

            $msg = "Server Error: Pastikan Printer Ready !";
            if (env("APP_DEBUG") === true) {
                $err = substr($th, 0, 250);
                $msg = "Server Error: $err";
            }

            return response()->json([
                "status" => "error",
                "msg" => $msg,
            ], 500);
        }
    }

    private function getOmset($shift): object
    {
        $trx = Transaksi::select('id', 'user_kasir_id', 'tgl', 'kembali')
            ->with(['payments' => function ($q) {
                $q->select('transaksi_id', 'type_id', 'nominal');
            }])
            ->whereNotNull('jam_selesai')
            ->where('user_kasir_id', $shift->user_id)
            ->where('is_cancel', 0)
            ->where('is_komplemen', 0)
            ->where('is_piutang', 0)
            ->get();

        $omset = (object) [
            'cash' => 0,
            'card' => 0,
        ];

        foreach ($trx as $v) {
            foreach ($v->payments as $vv) {
                if ($vv->type_id === 1) {
                    $omset->cash += $vv->nominal;
                } else {
                    $omset->card += $vv->nominal;
                }
            }
            $omset->cash -= $v->kembali;
        }

        $omset->total = $omset->cash + $omset->card;

        return $omset;
    }

    private function selisih(object $r, object $omset): int
    {
        $selisih = $r->cash + $r->card - $omset->total;
        return $selisih;
    }

    private function komplemen($shift): int
    {
        $trx = Transaksi::selectRaw('user_kasir_id, sum(bayar) as komplemen')
            ->whereNotNull('jam_selesai')
            ->where('user_kasir_id', $shift->user_id)
            ->where('is_komplemen', 1)
            ->groupBy('user_kasir_id')
            ->first();

        if (!$trx) {
            return 0;
        }

        return $trx->komplemen;
    }

    private function piutang($shift): int
    {
        $trx = Transaksi::selectRaw('user_kasir_id, sum(bayar) as piutang')
            ->whereNotNull('jam_selesai')
            ->where('user_kasir_id', $shift->user_id)
            ->where('is_piutang', 1)
            ->groupBy('user_kasir_id')
            ->first();

        if (!$trx) {
            return 0;
        }

        return $trx->piutang;
    }
}
