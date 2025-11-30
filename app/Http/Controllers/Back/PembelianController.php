<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Pembelian;
use App\Models\PembelianDet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PembelianController extends Controller
{
    public function index()
    {
        $data = Pembelian::with('details')->orderBy('created_at', 'desc')->get();
        return View('back.pembelian.index', compact('data'));
    }

    public function create()
    {
        return View('back.pembelian.create');
    }

    public function store(Request $r)
    {
        $data = $r->data;

        $pembelian = Pembelian::create([
            'user_id' => Auth::user()->id,
            'tgl_faktur' => Date('Y-m-d'),
            'is_lunas' => 1,
            'grand_total' => 0,
        ]);

        foreach ($data as $v) {
            $v = (object) $v;

            $barang = Barang::where('sku', $v->sku)->first();
            $barang->harga_beli = $v->hargaBeli / $barang->isi;
            $barang->save();

            PembelianDet::create([
                'pembelian_id' => $pembelian->id,
                'sku' => $v->sku,
                'barcode' => $v->barcode,
                'qty' => $v->qtyBeli * $barang->isi,
                'satuan_beli' => $barang->volume,
                'harga_beli' => $v->hargaBeli,
                'total' => $v->total,
            ]);

            $pembelian->grand_total += $v->total;
        }

        $pembelian->save();

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Pembelian berhasil disimpan !'
        ], 200);
    }

    public function show($id)
    {
        $data = Pembelian::with('details', 'details.barang')->find($id);
        return View('back.pembelian.show', compact('data'));
    }
}
