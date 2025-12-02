<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barang_stock', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barang_id')->unique()->index();
            $table->integer('quantity')->default(0); // Stok saat ini
            $table->integer('reserved')->default(0); // Stok yang sudah dipesan/pending
            $table->integer('available')->default(0); // Stok yang tersedia (quantity - reserved)
            $table->timestamp('last_updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();

            // Foreign key
            $table->foreign('barang_id')
                ->references('id')
                ->on('barang')
                ->onDelete('cascade');

            // Index untuk performa query
            $table->index('quantity');
            $table->index('available');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barang_stock');
    }
};
