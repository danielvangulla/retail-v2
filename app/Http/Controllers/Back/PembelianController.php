<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Pembelian;
use App\Models\PembelianDet;
use App\Traits\ManageStok;
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

        return Inertia::render('admin/Pembelian/IndexNew', ['pembelians' => $pembelians]);
    }

    public function create()
    {
        return Inertia::render('admin/Pembelian/CreateNew');
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
                $qty = (int) ($v->qtyBeli * $barang->isi);
                $hargaBeli = (int) $v->hargaBeli;

                // Calculate harga per unit for weighted average cost
                $hargaBeliPerUnit = (int) ($hargaBeli / $qty);

                // Create pembelian detail
                $detail = PembelianDet::create([
                    'pembelian_id' => $pembelian->id,
                    'sku' => $v->sku,
                    'barcode' => $v->barcode,
                    'qty' => $qty,
                    'satuan_beli' => $barang->volume,
                    'harga_beli' => $hargaBeli,
                    'total' => $v->total,
                ]);

                // Add stock using ManageStok trait for weighted average calculation
                $movementId = ManageStok::addStok(
                    $barang->id,
                    $qty,
                    'in',
                    'pembelian',
                    $pembelian->id,
                    'Pembelian #' . $pembelian->id,
                    Auth::user()->id,
                    $hargaBeliPerUnit
                );

                // Update harga_beli barang dengan harga terbaru
                $barang->update([
                    'harga_beli' => $hargaBeliPerUnit,
                ]);

                $pembelian->grand_total += $v->total;
            }
        }

        $pembelian->save();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Pembelian berhasil disimpan !'
        ], 200);
    }

    public function show($id)
    {
        $data = Pembelian::with('details', 'details.barang', 'user')->find($id);
        return Inertia::render('admin/Pembelian/ShowNew', ['data' => $data]);
    }
}
