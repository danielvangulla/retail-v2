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
        Schema::create('log_menus', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaksi_det_id');
            $table->uuid('transaksi_id_awal');
            $table->uuid('transaksi_id_tujuan');
            $table->string('meja_awal', 10);
            $table->string('meja_tujuan', 10);
            $table->uuid('user_id');
            $table->string('name', 50);
            $table->uuid('spv_id');
            $table->string('spv_name', 50);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_menus');
    }
};
