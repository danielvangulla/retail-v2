<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Pembelian;
use App\Models\PembelianDet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PembelianController extends Controller
{
    public function index(Request $r)
    {
        $search = $r->search ?? '';

        $pembelians = Pembelian::with('details', 'user')
            ->when($search, function ($q) use ($search) {
                $q->where('tgl_faktur', 'like', "%$search%")
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query->where('name', 'like', "%$search%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('back/Pembelian/IndexNew', ['pembelians' => $pembelians]);
    }

    public function create()
    {
        return Inertia::render('back/Pembelian/CreateNew');
    }

    public function store(Request $r)
    {
        $data = $r->data;
        $tglFaktur = $r->tgl_faktur ?? date('Y-m-d');

        $pembelian = Pembelian::create([
            'user_id' => Auth::user()->id,
            'tgl_faktur' => $tglFaktur,
            'is_lunas' => 1,
            'grand_total' => 0,
        ]);

        foreach ($data as $v) {
            $v = (object) $v;

            $barang = Barang::where('sku', $v->sku)->first();
            if ($barang) {
                // Update harga beli barang
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
        $data = Pembelian::with('details', 'details.barang', 'user')->find($id);
        return Inertia::render('back/Pembelian/ShowNew', ['data' => $data]);
    }
}
