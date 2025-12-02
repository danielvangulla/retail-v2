<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\BarangController;
use App\Http\Controllers\Admin\KategoriController;
use App\Http\Controllers\Admin\KategorisubController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SetupController;
use App\Http\Controllers\Admin\PembelianController;
use App\Http\Controllers\Admin\ReturController;
use Illuminate\Support\Facades\Route;

// Admin routes - protected by auth + supervisor middleware
Route::middleware(['auth', 'supervisor'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/dashboard-data', [DashboardController::class, 'getData'])->name('admin.dashboard-data');
    Route::post('/process-stok', function() {
        $result = \App\Services\StokProcessingService::processAll();
        return response()->json(['status' => 'ok', 'data' => $result]);
    })->name('admin.process-stok');

    // Setup / Basic Settings
    Route::get('/setup', [SetupController::class, 'index'])->name('setup.index');
    Route::post('/setup', [SetupController::class, 'store'])->name('setup.store');

    // Barang management
    Route::resource('/barang', BarangController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/barang-list', [BarangController::class, 'list'])->name('barang.list');
    Route::post('/barang-low-stock', [BarangController::class, 'lowStock'])->name('barang.lowStock');
    Route::get('/barang-all', function () {
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
    Route::resource('/kategori', KategoriController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/kategori-list', [KategoriController::class, 'list'])->name('kategori.list');

    // Kategorisub management
    Route::resource('/kategorisub', KategorisubController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/kategorisub-list', [KategorisubController::class, 'list'])->name('kategorisub.list');

    // Pembelian management
    Route::get('/pembelian', [PembelianController::class, 'index'])->name('pembelian.index');
    Route::get('/pembelian-create', [PembelianController::class, 'create'])->name('pembelian.create');
    Route::post('/pembelian', [PembelianController::class, 'store'])->name('pembelian.store');
    Route::get('/pembelian/{id}', [PembelianController::class, 'show'])->name('pembelian.show');
    Route::get('/pembelian/{id}/print', [PembelianController::class, 'print'])->name('pembelian.print');

    // Retur management
    Route::get('/retur', [ReturController::class, 'index'])->name('retur.index');
    Route::get('/retur-create', [ReturController::class, 'create'])->name('retur.create');
    Route::post('/retur', [ReturController::class, 'store'])->name('retur.store');
    Route::get('/retur/{id}', [ReturController::class, 'show'])->name('retur.show');
    Route::get('/retur/{id}/print', [ReturController::class, 'print'])->name('retur.print');
    Route::delete('/retur/{id}', [ReturController::class, 'destroy'])->name('retur.destroy');

    // User management
    Route::resource('/user', UserController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/user-list', [UserController::class, 'list'])->name('user.list');

    // Reports
    Route::get('/report/sales', [ReportController::class, 'sales'])->name('report.sales');
    Route::post('/report/sales-data', [ReportController::class, 'salesData'])->name('report.sales-data');
    Route::get('/report/inventory', [ReportController::class, 'inventory'])->name('report.inventory');
    Route::post('/report/inventory-data', [ReportController::class, 'inventoryData'])->name('report.inventory-data');
});

