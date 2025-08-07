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
        Schema::create('fo_joint_boxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lokasi_id')->constrained('fo_lokasis')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('kabel_odc_id')->constrained('fo_kabel_odcs')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('nama_joint_box');
            $table->string('deskripsi')->nullable();
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
        Schema::dropIfExists('fo_joint_boxes');
    }
};
