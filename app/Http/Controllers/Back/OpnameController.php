<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Opname;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OpnameController extends Controller
{
    public function index()
    {
        return View('back.opname.index');
    }

    public function opnameJson()
    {
        $data = Opname::with('barang')->with('user')->orderBy('tgl', 'desc')->where('is_sistem', 0)->get();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $data,
        ], 200);
    }

    public function create()
    {
        return View('back.opname.create');
    }

    public function store(Request $r)
    {
        $data = $r->data;

        foreach ($data as $v) {
            $v = (object) $v;
            $opname = [
                'user_id' => Auth::user()->id,
                'barang_id' => $v->id,
                'tgl' => Date("Y-m-d"),
                'sistem' => $v->qtySistem,
                'fisik' => $v->qtyFisik,
                'selisih' => $v->qtySelisih,
            ];
            Opname::create($opname);
        }

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Opname berhasil disimpan !',
        ], 200);
    }
}
