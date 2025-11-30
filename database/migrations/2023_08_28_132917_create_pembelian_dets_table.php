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
        Schema::create('pembelian_dets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pembelian_id')->index();
            $table->string('sku', 8)->index();
            $table->string('barcode', 30)->index();
            $table->integer('qty')->default(1);
            $table->string('satuan_beli', 30)->nullable();
            $table->decimal('harga_beli', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembelian_dets');
    }
};
