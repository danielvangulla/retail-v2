<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setup;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SetupController extends Controller
{
    public function index()
    {
        $setup = Setup::where('config_name', 'perusahaan')->first();

        return Inertia::render('admin/Setup/Index', [
            'setup' => $setup ? json_decode($setup->config_json, true) : null,
            'setupId' => $setup ? $setup->id : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'alamat1' => 'required|string|max:255',
            'alamat2' => 'required|string|max:255',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'npwp' => 'nullable|string|max:20',
        ], [
            'nama.required' => 'Nama toko harus diisi',
            'alamat1.required' => 'Alamat 1 harus diisi',
            'alamat2.required' => 'Alamat 2 (kota) harus diisi',
        ]);

        try {
            $configJson = json_encode($validated);

            $setup = Setup::where('config_name', 'perusahaan')->first();

            if ($setup) {
                $setup->update([
                    'config_json' => $configJson,
                ]);
            } else {
                Setup::create([
                    'config_name' => 'perusahaan',
                    'config_json' => $configJson,
                ]);
            }

            return response()->json([
                'status' => 'ok',
                'msg' => 'Setup berhasil disimpan',
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Gagal menyimpan setup: ' . $th->getMessage(),
            ], 500);
        }
    }
}
