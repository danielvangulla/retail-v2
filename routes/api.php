<?php

use App\Http\Controllers\Back\SyncController;
use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/sync-getter', [SyncController::class, 'getter']);

// API for getting barang list (requires authentication)
Route::middleware('auth')->group(function () {
    Route::get('/barang-list', function () {
        $barangs = Barang::select('id', 'sku', 'barcode', 'deskripsi', 'alias', 'satuan', 'isi', 'volume', 'harga_beli', 'harga_jual1')
            ->where('st_aktif', 1)
            ->orderBy('deskripsi')
            ->get();

        return response()->json([
            'status' => 'ok',
            'data' => $barangs
        ]);
    });
});
