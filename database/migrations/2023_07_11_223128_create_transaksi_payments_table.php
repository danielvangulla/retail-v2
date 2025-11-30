<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaksi_id')->index();
            $table->uuid('type_id')->default(1);
            $table->double('nominal', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_payments');
    }
};
