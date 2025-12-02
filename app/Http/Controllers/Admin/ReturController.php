<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangRetur;
use App\Models\BarangReturDetail;
use App\Traits\ManageStok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReturController extends Controller
{
    public function index(Request $r)
    {
        $search = $r->search ?? '';

        $returs = BarangRetur::with('details', 'user')
            ->when($search, function ($q) use ($search) {
                $q->where('ket', 'like', "%$search%")
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query->where('name', 'like', "%$search%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/Retur/IndexNew', ['returs' => $returs]);
    }

    public function create()
    {
        return Inertia::render('admin/Retur/CreateNew');
    }

    public function store(Request $r)
    {
        $data = $r->data;
        $ket = $r->ket ?? '';

        $retur = BarangRetur::create([
            'user_id' => Auth::user()->id,
            'ket' => $ket,
        ]);

        foreach ($data as $v) {
            $v = (object) $v;

            $barang = Barang::where('sku', $v->sku)->first();
            if ($barang) {
                $detail = BarangReturDetail::create([
                    'barang_retur_id' => $retur->id,
                    'barang_id' => $barang->id,
                    'qty' => $v->qtyRetur,
                    'volume' => $barang->volume,
                    'harga_beli' => $v->hargaBeli,
                    'total' => $v->total,
                    'stok_processed' => false,
                ]);

                // Reduce stock and capture movement ID
                $result = ManageStok::reduceStok($barang->id, $v->qtyRetur, 'out', 'retur', $retur->id, 'Retur #' . $retur->id, Auth::id());
                if ($result['success']) {
                    $detail->update([
                        'stok_processed' => true,
                        'kartu_stok_id' => $result['movement_id'],
                    ]);
                }
            }
        }

        return response()->json([
            'status' => 'ok',
            'msg' => 'Retur berhasil disimpan!'
        ], 200);
    }

    public function show($id)
    {
        $data = BarangRetur::with('details', 'details.barang', 'user')->find($id);
        return Inertia::render('admin/Retur/ShowNew', ['data' => $data]);
    }

    public function print($id)
    {
        $data = BarangRetur::with('details', 'details.barang', 'user')->find($id);
        return Inertia::render('admin/Retur/Print', ['data' => $data]);
    }

    public function destroy($id)
    {
        BarangRetur::find($id)->delete();
        BarangReturDetail::where('barang_retur_id', $id)->delete();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Retur berhasil dihapus!'
        ], 200);
    }
}
