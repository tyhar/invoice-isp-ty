<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('fo_client_ftths', function (Blueprint $table) {
            $table->unique('nama_client', 'unique_nama_client');
        });

        Schema::table('fo_odps', function (Blueprint $table) {
            $table->unique('nama_odp', 'unique_nama_odp');
        });

        Schema::table('fo_odcs', function (Blueprint $table) {
            $table->unique('nama_odc', 'unique_nama_odc');
        });
    }

    public function down(): void
    {
        Schema::table('fo_client_ftths', function (Blueprint $table) {
            $table->dropUnique('unique_nama_client');
        });

        Schema::table('fo_odps', function (Blueprint $table) {
            $table->dropUnique('unique_nama_odp');
        });

        Schema::table('fo_odcs', function (Blueprint $table) {
            $table->dropUnique('unique_nama_odc');
        });
    }
};
