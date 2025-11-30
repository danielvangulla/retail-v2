<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barang_ext', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sku')->unique();
            $table->tinyInteger('st_senin')->default(1);
            $table->tinyInteger('st_selasa')->default(1);
            $table->tinyInteger('st_rabu')->default(1);
            $table->tinyInteger('st_kamis')->default(1);
            $table->tinyInteger('st_jumat')->default(1);
            $table->tinyInteger('st_sabtu')->default(1);
            $table->tinyInteger('st_minggu')->default(1);
            $table->tinyInteger('st_seharian')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barang_ext');
    }
};
