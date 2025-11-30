<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barang', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sku', 50)->unique();
            $table->string('barcode', 50)->index();
            $table->string('deskripsi', 100);
            $table->string('alias', 100);
            $table->tinyInteger('st_aktif')->default(1);
            $table->string('satuan', 20);
            $table->integer('isi')->default(1);
            $table->string('volume', 20);
            $table->integer('min_stock')->default(1);
            $table->decimal('harga_beli', 14, 2)->default(0);
            $table->decimal('harga_jual1', 14, 2)->default(0);
            $table->decimal('harga_jual2', 14, 2)->default(0);
            $table->boolean('multiplier')->nullable()->default(false);
            $table->tinyInteger('printer_id')->default(0);
            $table->tinyInteger('checker_id')->default(0);
            $table->tinyInteger('block_disc')->default(0);
            $table->uuid('kategori_id')->index();
            $table->uuid('kategorisub_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barang');
    }
};
