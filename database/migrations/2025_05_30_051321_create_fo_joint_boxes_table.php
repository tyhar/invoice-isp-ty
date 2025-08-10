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

            // For ODC→ODC connections: specify which two ODCs this joint box connects
            $table->foreignId('odc_id')->nullable()->constrained('fo_odcs')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('odc_2_id')->nullable()->constrained('fo_odcs')->cascadeOnDelete()->cascadeOnUpdate();

            // For ODC→ODP connections: specify which ODP this joint box connects TO
            $table->foreignId('odp_id')->nullable()->constrained('fo_odps')->cascadeOnDelete()->cascadeOnUpdate();

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
        Schema::table('fo_joint_boxes', function (Blueprint $table) {
            $table->dropForeign(['odc_id']);
            $table->dropForeign(['odc_2_id']);
            $table->dropForeign(['odp_id']);
            $table->dropColumn(['odc_id', 'odc_2_id', 'odp_id']);
        });
        Schema::dropIfExists('fo_joint_boxes');
    }
};
