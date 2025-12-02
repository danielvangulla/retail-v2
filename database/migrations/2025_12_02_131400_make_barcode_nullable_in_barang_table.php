<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            // Make barcode nullable
            $table->string('barcode', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        // Cannot reliably revert to NOT NULL due to potential NULL values
        // Keep it nullable as the original schema didn't strictly enforce NOT NULL in all cases
        Schema::table('barang', function (Blueprint $table) {
            // Do nothing - keep nullable for data integrity
        });
    }
};
