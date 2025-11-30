<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_payment_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->integer('urutan')->default(99);
            $table->string('ket', 100)->default('');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_payment_types');
    }
};
