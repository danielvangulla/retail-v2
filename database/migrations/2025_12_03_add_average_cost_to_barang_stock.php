<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barang_stock', function (Blueprint $table) {
            $table->bigInteger('harga_rata_rata')->default(0)->comment('Weighted average cost (integer, no decimal)');
            $table->timestamp('harga_rata_rata_updated_at')->nullable()->comment('Last time average cost was updated');
        });
    }

    public function down(): void
    {
        Schema::table('barang_stock', function (Blueprint $table) {
            $table->dropColumn(['harga_rata_rata', 'harga_rata_rata_updated_at']);
        });
    }
};
