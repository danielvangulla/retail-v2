<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\BarangController;
use App\Http\Controllers\Admin\KategoriController;
use App\Http\Controllers\Admin\KategorisubController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReportController;
use Illuminate\Support\Facades\Route;

// Admin routes - protected by auth + supervisor middleware
Route::middleware(['auth', 'supervisor'])->group(function () {
    // Dashboard
    Route::get('/back', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Barang management
    Route::resource('/back/barang', BarangController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    Route::post('/back/barang-list', [BarangController::class, 'list'])->name('barang.list');
    Route::post('/back/barang-low-stock', [BarangController::class, 'lowStock'])->name('barang.lowStock');

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
});
