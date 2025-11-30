<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_tables', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaksi_id');
            $table->string('meja_awal', 10);
            $table->string('meja_tujuan', 10);
            $table->uuid('user_id');
            $table->string('name', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_tables');
    }
};
