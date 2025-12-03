<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barang_stock_movements', function (Blueprint $table) {
            $table->decimal('harga_beli', 14, 2)->nullable()->after('quantity_after')->comment('Harga beli saat transaksi');
            $table->decimal('harga_jual', 14, 2)->nullable()->after('harga_beli')->comment('Harga jual saat transaksi (untuk penjualan)');
        });
    }

    public function down(): void
    {
        Schema::table('barang_stock_movements', function (Blueprint $table) {
            $table->dropColumn(['harga_beli', 'harga_jual']);
        });
    }
};
