<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoLokasi;
use App\Models\FoKabelOdc;

class FoOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_odcs';

    protected $fillable = [
        'lokasi_id',
        'kabel_odc_id', // now nullable
        'nama_odc',
        'deskripsi', // <-- add this
        'tipe_splitter',
        'status',    // allow "active" or "archived"
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
        'deskripsi'  => 'string', // <-- add this
    ];

    /**
     * Each ODC belongs to exactly one Lokasi.
     */
    public function lokasi()
    {
        return $this->belongsTo(FoLokasi::class, 'lokasi_id');
    }

    /**
     * Each ODC belongs to exactly one KabelOdc.
     */
    public function kabelOdc()
    {
        // kabel_odc_id is now nullable
        return $this->belongsTo(FoKabelOdc::class, 'kabel_odc_id');
    }
}
