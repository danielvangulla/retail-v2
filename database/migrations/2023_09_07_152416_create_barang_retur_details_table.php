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
        Schema::create('barang_retur_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barang_retur_id')->index();
            $table->uuid('barang_id')->index();
            $table->integer('qty')->default(0);
            $table->string('volume', 20)->default('Pcs');
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
        Schema::dropIfExists('barang_retur_details');
    }
};
