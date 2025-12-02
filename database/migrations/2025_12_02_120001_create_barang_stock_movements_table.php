<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barang_stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barang_id')->index();
            $table->enum('type', ['in', 'out', 'adjustment', 'return', 'expire']); // Tipe pergerakan
            $table->integer('quantity'); // Jumlah keluar/masuk
            $table->integer('quantity_before'); // Stok sebelum
            $table->integer('quantity_after'); // Stok sesudah
            $table->string('reference_type')->nullable(); // Tipe referensi (pembelian, penjualan, dll)
            $table->string('reference_id')->nullable()->index(); // ID referensi
            $table->text('notes')->nullable(); // Catatan
            $table->uuid('user_id')->nullable(); // User yang melakukan
            $table->timestamp('movement_date')->useCurrent(); // Waktu pergerakan
            $table->timestamps();

            // Foreign keys
            $table->foreign('barang_id')
                ->references('id')
                ->on('barang')
                ->onDelete('cascade');

            // Indexes untuk performa query
            $table->index(['barang_id', 'movement_date']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barang_stock_movements');
    }
};
