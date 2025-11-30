<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Kategorisub;
use Illuminate\Http\Request;

class KategorisubController extends Controller
{
    public function store(Request $r)
    {
        if (!$r->state) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Akses ditolak !'
            ], 403);
        }

        $data = $r->validate([
            'kategori_id' => 'required',
            'ket' => 'required | min:2 | max:30 | regex:/^[a-zA-Z0-9\s]+$/',
        ], Helpers::customErrorMsg());

        if ($r->state === 'kategorisub-create') {
            Kategorisub::create($data);

            return response()->json([
                'status' => 'ok',
                'msg' => 'Kategori berhasil disimpan !'
            ], 200);
        }

        if ($r->state === 'kategorisub-edit') {
            Kategorisub::where('id', $r->id)->update($data);

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
