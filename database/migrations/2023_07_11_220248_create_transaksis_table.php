<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('tgl')->nullable()->index();
            $table->dateTime('jam_mulai')->nullable()->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('jam_selesai')->nullable();
            $table->integer('pax_tamu')->default(1);
            $table->string('nama_tamu')->default('');
            $table->string('meja')->index();
            $table->decimal('brutto', 14, 2)->default(0);
            $table->decimal('disc_spv', 14, 2)->default(0);
            $table->decimal('disc_promo', 14, 2)->default(0);
            $table->string('nama_promo', 250)->nullable()->default('');
            $table->decimal('netto', 14, 2)->default(0);
            $table->decimal('charge', 14, 2)->default(0);
            $table->decimal('service', 14, 2)->default(0);
            $table->decimal('tax', 14, 2)->default(0);
            $table->decimal('bayar', 14, 2)->default(0);
            $table->decimal('payment', 14, 2)->default(0);
            $table->decimal('kembali', 14, 2)->default(0);
            $table->tinyInteger('status')->index();
            $table->uuid('user_cetak_id')->nullable()->index();
            $table->uuid('user_kasir_id')->nullable()->index();
            $table->uuid('user_spv_id')->nullable()->index();
            $table->tinyInteger('is_cancel')->default(0);
            $table->string('cancel_note', 250)->default('');
            $table->tinyInteger('is_komplemen')->default(0);
            $table->uuid('komplemen_id')->nullable()->index();
            $table->tinyInteger('is_piutang')->default(0);
            $table->uuid('piutang_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
