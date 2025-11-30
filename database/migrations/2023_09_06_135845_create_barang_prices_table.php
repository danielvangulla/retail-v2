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
        Schema::create('barang_prices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barang_id')->index();
            $table->integer('qty')->default(0);
            $table->decimal('harga1', 14, 2)->default(0);
            $table->decimal('harga2', 14, 2)->default(0);
            $table->boolean('multiplier')->nullable()->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barang_prices');
    }
};
