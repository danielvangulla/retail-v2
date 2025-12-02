<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pembelian_dets', function (Blueprint $table) {
            $table->boolean('stok_processed')->default(false)->after('total')->comment('Flag untuk tracking apakah stok sudah ditambah');
            $table->uuid('kartu_stok_id')->nullable()->after('stok_processed')->comment('ID dari barang_stock_movements untuk referensi');
        });

        Schema::table('barang_retur_details', function (Blueprint $table) {
            $table->boolean('stok_processed')->default(false)->after('total')->comment('Flag untuk tracking apakah stok sudah dikurangi');
            $table->uuid('kartu_stok_id')->nullable()->after('stok_processed')->comment('ID dari barang_stock_movements untuk referensi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembelian_dets', function (Blueprint $table) {
            $table->dropColumn('stok_processed');
            $table->dropColumn('kartu_stok_id');
        });

        Schema::table('barang_retur_details', function (Blueprint $table) {
            $table->dropColumn('stok_processed');
            $table->dropColumn('kartu_stok_id');
        });
    }
};
