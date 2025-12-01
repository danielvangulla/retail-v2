<?php

namespace App\Http\Controllers;

use App\Models\Setup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $setup = Helpers::getSetup('perusahaan');

        return Inertia::render('Settings/Index', compact('setup'));
    }

    public function updateSetup(Request $r)
    {
        $config = [
            'nama' => $r->nama,
            'alamat1' => $r->alamat1,
            'alamat2' => $r->alamat2,
            'operasional' => '00:00:00',
            'tax' => '0',
            'service' => '0'
        ];

        $data = [
            'config_json' => json_encode($config)
        ];

        Setup::where('config_name', 'perusahaan')->update($data);

        return response()->json([
            'status' => 'ok',
            'msg' => 'Pengaturan Berhasil diupdate !',
        ], 200);
    }
}
