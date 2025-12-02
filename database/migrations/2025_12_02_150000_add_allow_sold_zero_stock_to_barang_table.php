<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->boolean('allow_sold_zero_stock')->default(true)->after('block_disc')->comment('Izinkan penjualan saat stok habis/nol');
        });
    }

    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('allow_sold_zero_stock');
        });
    }
};
