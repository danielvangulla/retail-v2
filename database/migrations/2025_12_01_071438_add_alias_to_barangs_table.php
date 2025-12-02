<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            if (!Schema::hasColumn('barang', 'alias')) {
                $table->string('alias', 100)->nullable()->after('deskripsi');
                $table->index('alias');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            if (Schema::hasColumn('barang', 'alias')) {
                // Get existing indexes
                $indexes = DB::select("SHOW INDEX FROM barang WHERE Key_name = 'barang_alias_index'");
                if (!empty($indexes)) {
                    $table->dropIndex('barang_alias_index');
                }
                $table->dropColumn('alias');
            }
        });
    }
};
