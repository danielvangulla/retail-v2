<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Piutang;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PiutangController extends Controller
{
    public function memberList()
    {
        $now = strtotime(Date("Y-m-d"));

        $piutang = Piutang::with(['transaksis' => function ($q) {
            $q->where('is_cancel', 0);
            $q->with('piutangBayar');
        }])->orderBy('name')->get();

        foreach ($piutang as $v) {
            $v->piutang = 0;
            $v->terbayar = 0;
            $v->oldestPiutang = 0;

            foreach ($v->transaksis as $trx) {
                if (!$trx->is_cancel && $trx->is_piutang) {
                    $isPaid = false;

                    if ($trx->piutangBayar && $trx->id === $trx->piutangBayar->transaksi_id) {
                        $isPaid = true;
                    }

                    if (!$isPaid) {
                        $trxDate = strtotime($trx->tgl);
                        $dateDiff = $now - $trxDate;
                        $dayDiff = round($dateDiff / (60 * 60 * 24));

                        if ($v->oldestPiutang < $dayDiff) {
                            $v->oldestPiutang = $dayDiff;
                        }
                    }
                }

                if ($v->is_staff) {
                    $currentMonth = Carbon::now()->month;
                    $transactionMonth = Carbon::parse($trx->tgl)->month;

                    if ($transactionMonth == $currentMonth) {
                        $v->piutang += $trx->bayar;
                    }
                } else {
                    $v->piutang += $trx->bayar;

                    if (!$trx->is_cancel && $trx->piutangBayar) {
                        $v->terbayar += $trx->piutangBayar->bayar;
                    }
                }
            }

            $v->sisa = $v->piutang - $v->terbayar - $v->deposit;
        }

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $piutang
        ], 200);
    }

    public function index()
    {
        return View('back.piutang-member.index');
    }

    public function store(Request $r)
    {
        if (!$r->state) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Akses ditolak !'
            ], 403);
        }

        $data = $r->validate([
            'name' => 'required | min:2 | max:30 | regex:/^[a-zA-Z0-9\s]+$/',
            'is_staff' => 'required | boolean',
            'deposit' => 'required | numeric',
            'limit' => 'required | numeric',
        ], Helpers::customErrorMsg());

        if ($r->state === 'piutang-member-create') {
            Piutang::create($data);

            return response()->json([
                'status' => 'ok',
                'msg' => 'Member berhasil disimpan !'
            ], 200);
        }

        if ($r->state === 'piutang-member-edit') {
            Piutang::where('id', $r->id)->update($data);

            return response()->json([
                'status' => 'ok',
                'msg' => 'Member berhasil dirubah !'
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'msg' => 'Terjadi kesalahan Request !'
        ], 400);
    }
}
