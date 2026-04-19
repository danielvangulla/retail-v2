<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_module_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('module_code', 50); // 'barang', 'pembelian', 'piutang', 'reports', 'settings', etc.
            $table->string('module_name', 100); // 'Inventory Management', 'Purchasing', etc.

            // Permissions: can_view, can_create, can_edit, can_delete
            $table->boolean('can_view')->default(false);
            $table->boolean('can_create')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->boolean('can_export')->default(false);

            // Optional: advanced permissions
            $table->boolean('can_approve')->default(false); // For approval workflows
            $table->boolean('can_manage_users')->default(false); // For role management

            // Soft access control (not just off/on, but time-based)
            $table->timestamp('access_until')->nullable(); // Grant access until this date
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes for fast queries
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'module_code']);
            $table->index('module_code');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_module_permissions');
    }
};
