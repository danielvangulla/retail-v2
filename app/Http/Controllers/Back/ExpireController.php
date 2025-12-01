<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangExpire;
use App\Models\BarangExpireDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpireController extends Controller
{
    public function index()
    {
        $data = BarangExpire::with('user')->with('details')->orderBy('created_at', 'desc')->get();
        return Inertia::render('Expire/Index', compact('data'));
    }

    public function create()
    {
        return Inertia::render('Expire/Create');
    }

    public function store(Request $r)
    {
        $data = $r->data;
        $ket = $r->ket;

        $expire = BarangExpire::create([
            'user_id' => Auth::user()->id,
            'ket' => $ket,
        ]);

        foreach ($data as $v) {
            $v = (object) $v;
            $harga = Barang::getHargaBeli($v->id);
            $total = $v->qtyExpire * $harga;

            $arr = [
                'barang_expire_id' => $expire->id,
                'barang_id' => $v->id,
                'qty' => $v->qtyExpire,
                'volume' => $v->volume,
                'harga_beli' => $harga,
                'total' => $total,
            ];
            BarangExpireDetail::create($arr);
        }

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Barang Expire berhasil disimpan !'
        ], 200);
    }
}
