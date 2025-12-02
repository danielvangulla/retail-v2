<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Promo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromoController extends Controller
{
    public function index()
    {
        return Inertia::render('back/Promo/Index');
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
        return Inertia::render('back/Promo/Create');
    }

    public function store(Request $r)
    {
        $data = $r->data;

        foreach ($data as $v) {
            Promo::setPromo((object) $v);
        }

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

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
        ], 200);
    }

    public function promoDestroy(Request $r)
    {
        $promo = Promo::find($r->id);
        $promo->delete();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
        ], 200);
    }
}
