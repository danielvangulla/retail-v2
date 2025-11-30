<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('command', ['insert', 'update'])->default('insert');
            $table->integer('updated')->default(0);
            $table->integer('try')->default(0);
            $table->tinyInteger('sent')->default(0);
            $table->string('table_name', 100)->nullable();
            $table->uuid('key');
            $table->json('data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
