<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Pembelian;
use App\Models\PembelianDet;
use App\Traits\ManageStok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
                // Update harga beli barang
                $barang->harga_beli = $v->hargaBeli / $barang->isi;
                $barang->save();

                $qty = $v->qtyBeli * $barang->isi;

                $detail = PembelianDet::create([
                    'pembelian_id' => $pembelian->id,
                    'sku' => $v->sku,
                    'barcode' => $v->barcode,
                    'qty' => $qty,
                    'satuan_beli' => $barang->volume,
                    'harga_beli' => $v->hargaBeli,
                    'total' => $v->total,
                    'stok_processed' => false,
                ]);

                // Add stock and capture movement ID
                try {
                    $movementId = ManageStok::addStok($barang->id, $qty, 'in', 'pembelian', $pembelian->id, 'Pembelian #' . $pembelian->id, Auth::id());
                    $detail->update([
                        'stok_processed' => true,
                        'kartu_stok_id' => $movementId,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to process stock for pembelian', [
                        'barang_id' => $barang->id,
                        'qty' => $qty,
                        'error' => $e->getMessage()
                    ]);
                    // Leave stok_processed as false for reprocessing
                }

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

    public function print($id)
    {
        $data = Pembelian::with('details', 'details.barang', 'user')->find($id);
        return Inertia::render('admin/Pembelian/Print', ['data' => $data]);
    }
}
