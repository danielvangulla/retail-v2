<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Kategori;
use App\Models\Kategorisub;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    public function index()
    {
        $kategori = Kategori::whereNot('ket', 'No Category')->get();
        $kategorisub = Kategorisub::with('kategori')->orderBy('kategori_id')->get();

        return View('back.kategori.index', compact('kategori', 'kategorisub'));
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
            'ket' => 'required | min:2 | max:30 | regex:/^[a-zA-Z0-9\s]+$/',
            'sku_from' => 'required | numeric',
            'sku_to' => 'required | numeric',
        ], Helpers::customErrorMsg());

        if ($r->state === 'kategori-create') {
            Kategori::create($data);

            return response()->json([
                'status' => 'ok',
                'msg' => 'Kategori berhasil disimpan !'
            ], 200);
        }

        if ($r->state === 'kategori-edit') {
            Kategori::where('id', $r->id)->update($data);

            return response()->json([
                'status' => 'ok',
                'msg' => 'Kategori berhasil dirubah !'
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'msg' => 'Terjadi kesalahan Request !'
        ], 400);
    }
}
