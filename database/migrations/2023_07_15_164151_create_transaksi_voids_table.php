<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_voids', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaksi_id')->index();
            $table->date('tgl')->index();
            $table->dateTime('jam')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->string('no_co', 20)->index();
            $table->string('sku', 8)->index();
            $table->integer('qty')->default(1);
            $table->double('harga', 14, 2)->default(0);
            $table->double('brutto', 14, 2)->default(0);
            $table->decimal('disc_spv', 14, 2)->default(0);
            $table->decimal('disc_promo', 14, 2)->default(0);
            $table->string('nama_promo', 100)->default("");
            $table->decimal('netto', 14, 2)->default(0);
            $table->decimal('service', 14, 2)->default(0);
            $table->decimal('tax', 14, 2)->default(0);
            $table->decimal('bayar', 14, 2)->default(0);
            $table->uuid('user_order_id')->nullable()->index();
            $table->uuid('user_void_id')->nullable()->index();
            $table->uuid('user_spv_id')->nullable()->index();
            $table->string('note', 250)->nullable()->default("");
            $table->string('alasan', 250)->nullable()->default("");
            $table->integer('is_locked')->default(0);
            $table->string('printer_name', 20)->nullable();
            $table->dateTime('printed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_voids');
    }
};
