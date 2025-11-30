<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meja', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no', 3)->nullable()->default('')->unique();
            $table->tinyInteger('floor')->default(1);
            $table->tinyInteger('st_aktif')->default(1);
            $table->integer('top')->default(10);
            $table->integer('left')->default(10);
            $table->integer('height')->default(40);
            $table->integer('width')->default(40);
            $table->tinyInteger('is_used')->default(0);
            $table->string('used_by')->default('-');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meja');
    }
};
