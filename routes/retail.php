<?php

use App\Http\Controllers\Back\BarangController;
use App\Http\Controllers\Back\CashflowController;
use App\Http\Controllers\Back\ExpireController;
use App\Http\Controllers\Back\KategoriController;
use App\Http\Controllers\Back\KategorisubController;
use App\Http\Controllers\Back\OpnameController;
use App\Http\Controllers\Back\PembelianController;
use App\Http\Controllers\Back\PiutangBayarController;
use App\Http\Controllers\Back\PiutangController;
use App\Http\Controllers\Back\PromoController;
use App\Http\Controllers\Back\ReturController;
use App\Http\Controllers\Back\UserPermissionController;
use App\Http\Controllers\Front\HomeSpaceController;
use App\Http\Controllers\Front\OrderController;
use App\Http\Controllers\Front\BillController;
use App\Http\Controllers\Front\PaymentController;
use App\Http\Controllers\Front\ReportController;
use Illuminate\Support\Facades\Route;

if (env('APP_TYPE') === 'retail') {
    Route::middleware('auth')->group(function () {
        Route::resource('/setup-users', UserPermissionController::class)->only(['index', 'store']);
        Route::post('/setup-users-json', [UserPermissionController::class, 'usersJson']);

        Route::get('/home-space', [HomeSpaceController::class, 'index'])->name('home.space');

        Route::post('/proses-bayar', [PaymentController::class, 'billPayment']);
        Route::post('/update-bayar', [PaymentController::class, 'billPayment']);

        Route::get('/print-bill', [BillController::class, 'printBill']);
        Route::get('/print-bill/{trxId}', [BillController::class, 'printBill']);

        Route::post('/validate-spv', [HomeSpaceController::class, 'cekMeja']);

        Route::get('/trx-edit/{id}', [OrderController::class, 'trxEdit']);
        Route::post('/trx-edit-data', [OrderController::class, 'trxEditJson']);
        Route::post('/trx-edit', [OrderController::class, 'trxUpdate']);

        Route::post('/trx-delete', [OrderController::class, 'trxDelete']);

        Route::post('/member-list', [PiutangController::class, 'memberList']);
        Route::resource('/piutang', PiutangController::class)->only(['index', 'store']);

        Route::post('/piutang-list', [PiutangBayarController::class, 'piutangList']);
        Route::resource('/piutang-bayar', PiutangBayarController::class)->only(['index', 'store']);

        Route::resource('/kategori', KategoriController::class)->only(['index', 'store']);
        Route::resource('/kategorisub', KategorisubController::class)->only(['index', 'store']);

        Route::resource('/barang', BarangController::class)->only(['index', 'create', 'edit', 'store']);
        Route::post('/barang-list', [BarangController::class, 'barangList']);

        Route::post('/barang-from-csv', [BarangController::class, 'importCsv']);
        Route::post('/barang-from-excel', [BarangController::class, 'importExcel']);

        Route::resource('/barang-retur', ReturController::class)->only(['index', 'create', 'store']);
        Route::resource('/barang-expire', ExpireController::class)->only(['index', 'create', 'store']);

        Route::resource('/barang-opname', OpnameController::class)->only(['index', 'create', 'store']);
        Route::post('/opname-list', [OpnameController::class, 'opnameJson']);

        Route::post('/barang-get-prices', [BarangController::class, 'barangGetPrices']);
        Route::post('/barang-set-prices', [BarangController::class, 'barangSetPrices']);
        Route::post('/barang-remove-price', [BarangController::class, 'barangRemovePrice']);

        Route::get('/barang-low-stok', [BarangController::class, 'barangLowStock']);
        Route::post('/cek-low-stok', [BarangController::class, 'cekLowStock']);
        Route::post('/reset-stok', [BarangController::class, 'resetStok']);

        Route::resource('/pembelian', PembelianController::class)->only(['index', 'create', 'show', 'store']);

        Route::get('/barang-deleted', [BarangController::class, 'indexDeleted']);
        Route::post('/barang-list-deleted', [BarangController::class, 'barangListDeleted']);

        Route::get('/sales-by-user', [ReportController::class, 'salesByUser']);
        Route::post('/sales-by-user', [ReportController::class, 'salesByUserJson']);

        Route::get('/sales-by-tgl', [ReportController::class, 'salesByTgl']);
        Route::post('/sales-by-tgl', [ReportController::class, 'salesByTglJson']);

        Route::get('/sales-by-trx', [ReportController::class, 'salesByTrx']);
        Route::post('/sales-by-trx', [ReportController::class, 'salesByTrxJson']);

        Route::get('/omset-by-tgl', [ReportController::class, 'omsetByTgl']);
        Route::get('/omset-by-tgl/{tgl1}/{tgl2}', [ReportController::class, 'omsetByTgl']);

        Route::get('/omset-by-tgl-kategori', [ReportController::class, 'omsetByTglKategori']);
        Route::get('/omset-by-tgl-kategori/{tgl1}/{tgl2}', [ReportController::class, 'omsetByTglKategori']);

        Route::resource('/cashflow', CashflowController::class)->only(['index', 'create', 'store']);

        Route::resource('/promo', PromoController::class)->only(['index', 'create', 'store']);
        Route::post('/promo-list', [PromoController::class, 'promoJson']);
        Route::post('/promo-set-status', [PromoController::class, 'promoSetStatus']);
        Route::post('/promo-destroy', [PromoController::class, 'promoDestroy']);
    });
}
