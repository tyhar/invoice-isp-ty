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
        Schema::create('fo_odps', function (Blueprint $table) {
            $table->id();

            // Foreign key to fo_kabel_core_odcs.id
            $table->foreignId('kabel_core_odc_id')
                ->nullable()
                ->constrained('fo_kabel_core_odcs')
                ->cascadeOnDelete()
                ->cascadeOnUpdate(); // enable nullable - one core can have many ODPs

            // Foreign key to fo_odcs.id (nullable, represents the ODC this ODP is connected to)
            $table->foreignId('odc_id')
                ->nullable()
                ->constrained('fo_odcs')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Foreign key to fo_lokasis.id
            $table->foreignId('lokasi_id')
                ->constrained('fo_lokasis')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->string('nama_odp');
            $table->string('deskripsi')->nullable();
            // NEW: add "status" column (active/archived)
            $table->enum('status', ['active', 'archived'])->default('active');

            // NEW: soft deletes (adds deleted_at column)
            $table->softDeletes();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fo_odps', function (Blueprint $table) {
            $table->dropForeign(['odc_id']);
            $table->dropColumn('odc_id');
        });
        Schema::dropIfExists('fo_odps');
    }
};
