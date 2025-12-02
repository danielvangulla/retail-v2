<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\BarangController;
use App\Http\Controllers\Admin\KategoriController;
use App\Http\Controllers\Admin\KategorisubController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SetupController;
use App\Http\Controllers\Admin\PembelianController;
use Illuminate\Support\Facades\Route;

// Admin routes - protected by auth + supervisor middleware
Route::middleware(['auth', 'supervisor'])->group(function () {
    // Dashboard
    Route::get('/back', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/back/dashboard-data', [DashboardController::class, 'getData'])->name('admin.dashboard-data');

    // Barang management
    Route::resource('/back/barang', BarangController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/back/barang-list', [BarangController::class, 'list'])->name('barang.list');
    Route::post('/back/barang-low-stock', [BarangController::class, 'lowStock'])->name('barang.lowStock');

    // Get all active barang for pembelian form
    Route::get('/back/barang-all', function () {
        $barangs = \App\Models\Barang::select('id', 'sku', 'barcode', 'deskripsi', 'alias', 'satuan', 'isi', 'volume', 'harga_beli', 'harga_jual1')
            ->where('st_aktif', 1)
            ->orderBy('deskripsi')
            ->get();

        return response()->json([
            'status' => 'ok',
            'data' => $barangs
        ]);
    });

    // Kategori management
    Route::resource('/back/kategori', KategoriController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/back/kategori-list', [KategoriController::class, 'list'])->name('kategori.list');

    // Kategorisub management
    Route::resource('/back/kategorisub', KategorisubController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/back/kategorisub-list', [KategorisubController::class, 'list'])->name('kategorisub.list');

    // User management
    Route::resource('/back/user', UserController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/back/user-list', [UserController::class, 'list'])->name('user.list');

    // Reports
    Route::get('/back/report/sales', [ReportController::class, 'sales'])->name('report.sales');
    Route::post('/back/report/sales-data', [ReportController::class, 'salesData'])->name('report.sales-data');
    Route::get('/back/report/inventory', [ReportController::class, 'inventory'])->name('report.inventory');
    Route::post('/back/report/inventory-data', [ReportController::class, 'inventoryData'])->name('report.inventory-data');

    // Pembelian management
    Route::resource('/back/pembelian', PembelianController::class)->only(['index', 'create', 'store', 'show']);

    // Setup / Basic Settings
    Route::get('/back/setup', [SetupController::class, 'index'])->name('setup.index');
    Route::post('/back/setup', [SetupController::class, 'store'])->name('setup.store');
});
