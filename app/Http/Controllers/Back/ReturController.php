<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangRetur;
use App\Models\BarangReturDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReturController extends Controller
{
    public function index()
    {
        $data = BarangRetur::with('user')->with('details')->orderBy('created_at', 'desc')->get();
        return Inertia::render('back/Retur/Index', ['data' => $data]);
    }

    public function create()
    {
        return Inertia::render('back/Retur/Create');
    }

    public function store(Request $r)
    {
        $data = $r->data;
        $ket = $r->ket;

        $retur = BarangRetur::create([
            'user_id' => Auth::user()->id,
            'ket' => $ket,
        ]);

        foreach ($data as $v) {
            $v = (object) $v;
            $harga = Barang::getHargaBeli($v->id);
            $total = $v->qtyRetur * $harga;

            $arr = [
                'barang_retur_id' => $retur->id,
                'barang_id' => $v->id,
                'qty' => $v->qtyRetur,
                'volume' => $v->volume,
                'harga_beli' => $harga,
                'total' => $total,
            ];
            BarangReturDetail::create($arr);
        }

        return response()->json([
            'status' => 'ok',
            'msg' => 'Barang Retur berhasil disimpan !'
        ], 200);
    }
}
