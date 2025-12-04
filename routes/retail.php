<?php

use App\Http\Controllers\FrontRetail\KasirController;
use App\Http\Controllers\FrontRetail\KomplemenController;
use Illuminate\Support\Facades\Route;

if (env('APP_TYPE') === 'retail') {
    Route::middleware('auth')->group(function () {

        // Kasir page (main kasir endpoint)
        Route::get('/home-space', [KasirController::class, 'index'])->name('home.space');
        Route::get('/kasir', [KasirController::class, 'index'])->name('kasir'); // Alias untuk /kasir

        Route::post('/proses-bayar', [KasirController::class, 'store']);
        Route::post('/update-bayar', [KasirController::class, 'update']);
        Route::post('/reduce-stock', [KasirController::class, 'reduceStock']);
        Route::post('/restore-stock', [KasirController::class, 'restoreStock']);

        // Reserved stock endpoints (untuk Kasir realtime)
        Route::post('/check-stock-availability', [KasirController::class, 'checkStockAvailability']);
        Route::post('/check-bulk-stock', [KasirController::class, 'checkBulkStockAvailability']);
        Route::post('/reserve-stock-item', [KasirController::class, 'reserveStockItem']);
        Route::post('/release-reserved-items', [KasirController::class, 'releaseReservedItems']);

        Route::get('/print-bill', [KasirController::class, 'printBill']);
        Route::get('/print-bill/{trxId}', [KasirController::class, 'printBill']);

        Route::post('/validate-spv', [KasirController::class, 'validateSpv']);

        Route::post('/komplemen-list', [KomplemenController::class, 'list']);
        Route::post('/komplemen-proses', [KomplemenController::class, 'proses']);
        Route::get('/transaksi-detail/{id}', [KomplemenController::class, 'detail']);
        Route::post('/komplemen-finish/{id}', [KomplemenController::class, 'finish']);

    });
}
