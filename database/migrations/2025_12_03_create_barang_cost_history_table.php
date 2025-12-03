<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barang_cost_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barang_id')->index();
            $table->bigInteger('harga_rata_rata_lama')->comment('Previous weighted average cost');
            $table->bigInteger('harga_rata_rata_baru')->comment('New weighted average cost');
            $table->string('trigger_type')->comment('Trigger: pembelian, penyesuaian, opname, dll');
            $table->uuid('reference_id')->nullable()->comment('Movement ID or reference ID');
            $table->string('reference_type')->nullable()->comment('Type of reference');
            $table->text('notes')->nullable();
            $table->uuid('changed_by')->nullable();
            $table->timestamps();

            $table->foreign('barang_id')->references('id')->on('barang')->onDelete('cascade');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barang_cost_history');
    }
};
