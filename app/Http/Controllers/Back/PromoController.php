<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index()
    {
        return View('back.promo.index');
    }

    public function promoJson()
    {
        $data = Promo::with('barang')->orderBy('tgl_from')->get();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $data,
        ], 200);
    }

    public function create()
    {
        return View('back.promo.create');
    }

    public function store(Request $r)
    {
        $data = $r->data;

        foreach ($data as $v) {
            Promo::setPromo((object) $v);
        }

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Promo berhasil disimpan !',
        ], 200);
    }

    public function promoSetStatus(Request $r)
    {
        $promo = Promo::find($r->id);
        $promo->is_aktif = $r->is_aktif;
        $promo->save();

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
        ], 200);
    }

    public function promoDestroy(Request $r)
    {
        $promo = Promo::find($r->id);
        $promo->delete();

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
        ], 200);
    }
}
