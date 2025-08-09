<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FoJointBox extends Model
{
    use SoftDeletes;

    protected $table = 'fo_joint_boxes';

    protected $fillable = [
        'lokasi_id',
        'kabel_odc_id',
        'odc_id',
        'odp_id',
        'nama_joint_box',
        'deskripsi',
        'status',
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deskripsi'  => 'string',
        'odc_id'     => 'integer',
        'odp_id'     => 'integer',
    ];

    /**
     * Each JointBox belongs to one Lokasi.
     */
    public function lokasi()
    {
        return $this->belongsTo(FoLokasi::class, 'lokasi_id');
    }

    /**
     * Each JointBox belongs to one KabelOdc.
     */
    public function kabelOdc()
    {
        return $this->belongsTo(FoKabelOdc::class, 'kabel_odc_id');
    }

    /**
     * Each JointBox may connect FROM one ODC.
     */
    public function odc()
    {
        return $this->belongsTo(FoOdc::class, 'odc_id');
    }

    /**
     * Each JointBox may connect TO one ODP.
     */
    public function odp()
    {
        return $this->belongsTo(FoOdp::class, 'odp_id');
    }
}
