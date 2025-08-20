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
        Schema::create('fo_odcs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lokasi_id')->constrained('fo_lokasis')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('kabel_odc_id')->nullable()->constrained('fo_kabel_odcs')->cascadeOnDelete()->cascadeOnUpdate();

            // Direct ODC-to-ODC connection (for ODC chains without joint boxes)
            $table->foreignId('odc_id')->nullable()->constrained('fo_odcs')->cascadeOnDelete()->cascadeOnUpdate();

            // Optional: core used to feed this child ODC from its parent ODC (one core per child ODC)
            $table->foreignId('kabel_core_odc_id')->nullable()->constrained('fo_kabel_core_odcs')->cascadeOnDelete()->cascadeOnUpdate();

            $table->string('nama_odc');
            $table->string('deskripsi')->nullable();
            $table->enum('tipe_splitter', ['1:2', '1:4', '1:8', '1:16', '1:32', '1:64', '1:128']);
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fo_odcs');
    }
};
