<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('piutang_bayars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('piutang_id')->index();
            $table->uuid('transaksi_id')->index();
            $table->decimal('bayar', 14, 2)->default(0);
            $table->uuid('user_id')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('piutang_bayars');
    }
};
