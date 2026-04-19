<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('kasir_id');
            $table->dateTime('open_time');
            $table->dateTime('close_time')->nullable();
            $table->decimal('saldo_awal', 14, 2)->default(0);
            $table->decimal('saldo_akhir', 14, 2)->default(0);
            $table->decimal('total_penjualan', 14, 2)->default(0);
            $table->decimal('total_tunai', 14, 2)->default(0);
            $table->decimal('total_nontunai', 14, 2)->default(0);
            $table->integer('jumlah_transaksi')->default(0);
            $table->text('keterangan')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            $table->foreign('kasir_id')
                ->references('id')
                ->on('users');

            $table->index('kasir_id');
            $table->index('is_closed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
