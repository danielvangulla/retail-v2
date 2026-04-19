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
        Schema::table('opnames', function (Blueprint $table) {
            if (! Schema::hasColumn('opnames', 'keterangan')) {
                $table->text('keterangan')->nullable()->comment('Catatan/alasan selisih')->after('selisih');
            }
            if (! Schema::hasColumn('opnames', 'deleted_at')) {
                $table->softDeletes()->after('keterangan');
            }
        });
    }

    public function down(): void
    {
        Schema::table('opnames', function (Blueprint $table) {
            $table->dropColumn(['keterangan', 'deleted_at']);
        });
    }
};
