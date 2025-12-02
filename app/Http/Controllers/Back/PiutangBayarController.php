<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\PiutangBayar;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PiutangBayarController extends Controller
{
    public function piutangList()
    {
        $data = Transaksi::select('id', 'tgl', 'piutang_id', 'user_spv_id', 'bayar')
            ->with(['piutang' => function ($q) {
                $q->select('id', 'name');
            }])
            ->with(['piutangBayar' => function ($q) {
                $q->select('transaksi_id', 'bayar');
            }])
            ->with(['spv' => function ($q) {
                $q->select('id', 'name');
            }])
            ->where('is_cancel', 0)
            ->where('is_piutang', 1)
            ->orderBy('piutang_id')
            ->get();

        $data->each(function ($v) {
            $v->st = "Belum Lunas";

            if (isset($v->piutangBayar->bayar)) {
                $v->st = "Lunas";
            }
        });

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $data,
        ], 200);
    }

    public function index()
    {
        return Inertia::render('back/Piutang/PiutangBayar/Index');
    }

    public function store(Request $r)
    {
        $user = Auth::user();

        $data = $r->data;
        foreach ($data as $v) {
            $v = (object) $v;
            $cek = PiutangBayar::where('transaksi_id', $v->id)->exists();

            if (!$cek) {
                PiutangBayar::create([
                    'piutang_id' => $v->piutang_id,
                    'transaksi_id' => $v->id,
                    'bayar' => $v->bayar,
                    'user_id' => $user->id,
                ]);
            }
        }

        return response()->json([
            'status' => 'ok',
            'msg' => 'Pelunasan Piutang Berhasil !',
        ], 200);
    }
}
