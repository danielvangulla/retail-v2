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
use App\Http\Controllers\FrontRetail\KasirController;
use App\Http\Controllers\FrontRetail\KomplemenController;
use App\Http\Controllers\FrontRetail\ReportRetailController;
use Illuminate\Support\Facades\Route;

if (env('APP_TYPE') === 'retail') {
    Route::middleware('auth')->group(function () {
        Route::resource('/setup-users', UserPermissionController::class)->only(['index', 'store']);
        Route::post('/setup-users-json', [UserPermissionController::class, 'usersJson']);

        // Kasir page (main kasir endpoint)
        Route::get('/home-space', [KasirController::class, 'index'])->name('home.space');
        Route::get('/kasir', [KasirController::class, 'index'])->name('kasir'); // Alias untuk /kasir

        Route::post('/proses-bayar', [KasirController::class, 'store']);
        Route::post('/update-bayar', [KasirController::class, 'update']);

        Route::get('/print-bill', [KasirController::class, 'printBill']);
        Route::get('/print-bill/{trxId}', [KasirController::class, 'printBill']);

        Route::post('/validate-spv', [KasirController::class, 'validateSpv']);

        Route::get('/trx-edit/{id}', [KasirController::class, 'trxEdit']);
        Route::post('/trx-edit-data', [KasirController::class, 'trxEditJson']);
        Route::post('/trx-edit', [KasirController::class, 'update']);

        Route::post('/trx-delete', [KasirController::class, 'trxDelete']);

        Route::post('/member-list', [PiutangController::class, 'memberList']);
        Route::resource('/piutang', PiutangController::class)->only(['index', 'store']);

        Route::post('/piutang-list', [PiutangBayarController::class, 'piutangList']);
        Route::resource('/piutang-bayar', PiutangBayarController::class)->only(['index', 'store']);

        Route::post('/komplemen-list', [KomplemenController::class, 'list']);
        Route::post('/komplemen-proses', [KomplemenController::class, 'proses']);
        Route::get('/transaksi-detail/{id}', [KomplemenController::class, 'detail']);
        Route::post('/komplemen-finish/{id}', [KomplemenController::class, 'finish']);

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

        Route::get('/sales-by-user', [ReportRetailController::class, 'salesByUser']);
        Route::post('/sales-by-user', [ReportRetailController::class, 'salesByUserJson']);

        Route::get('/sales-by-tgl', [ReportRetailController::class, 'salesByTgl']);
        Route::post('/sales-by-tgl', [ReportRetailController::class, 'salesByTglJson']);

        Route::get('/sales-by-trx', [ReportRetailController::class, 'salesByTrx']);
        Route::post('/sales-by-trx', [ReportRetailController::class, 'salesByTrxJson']);

        Route::get('/omset-by-tgl', [ReportRetailController::class, 'omsetByTgl']);
        Route::get('/omset-by-tgl/{tgl1}/{tgl2}', [ReportRetailController::class, 'omsetByTgl']);

        Route::get('/omset-by-tgl-kategori', [ReportRetailController::class, 'omsetByTglKategori']);
        Route::get('/omset-by-tgl-kategori/{tgl1}/{tgl2}', [ReportRetailController::class, 'omsetByTglKategori']);

        Route::resource('/cashflow', CashflowController::class)->only(['index', 'create', 'store']);

        Route::resource('/promo', PromoController::class)->only(['index', 'create', 'store']);
        Route::post('/promo-list', [PromoController::class, 'promoJson']);
        Route::post('/promo-set-status', [PromoController::class, 'promoSetStatus']);
        Route::post('/promo-destroy', [PromoController::class, 'promoDestroy']);
    });
}
