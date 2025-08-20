<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoKabelTubeOdc;
use App\Models\FoKabelOdc;
use App\Models\FoOdp;
use App\Models\FoOdc;

class FoKabelCoreOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_kabel_core_odcs';

    protected $fillable = [
        'kabel_tube_odc_id',
        'warna_core',
        'deskripsi',
        'status',   // 'active' or 'archived'
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
        'deskripsi'  => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        // Cascade restore to ODPs and set status to active if archived
        static::restoring(function (FoKabelCoreOdc $model) {
            foreach ($model->odps()->withTrashed()->get() as $odp) {
                if ($odp->trashed()) {
                    $odp->restore();
                }
                if ($odp->status === 'archived') {
                    $odp->status = 'active';
                    $odp->save();
                }
            }
        });
        // DO NOT nullify foreign keys on forceDeleted or anywhere else!
    }

    /**
     * Belongs to one KabelTubeOdc.
     */
    public function kabelTubeOdc()
    {
        return $this->belongsTo(FoKabelTubeOdc::class, 'kabel_tube_odc_id');
    }

    /**
     * Has many ODPs.
     */
    public function odps()
    {
        return $this->hasMany(FoOdp::class, 'kabel_core_odc_id', 'id');
    }

    /**
     * Has one ODP (for backward compatibility).
     */
    public function odp()
    {
        return $this->hasOne(FoOdp::class, 'kabel_core_odc_id', 'id');
    }

    /**
     * Unarchive ODPs (if any).
     */
    public function cascadeUnarchive()
    {
        // \Log::info('cascadeUnarchive called on KabelCoreOdc', ['id' => $this->id]);
        foreach ($this->odps()->withTrashed()->get() as $odp) {
            if ($odp->status === 'archived') {
                $odp->status = 'active';
                $odp->save();
            }
        }
    }

    /**
     * Returns true if parent Tube is active and not deleted.
     */
    public function parentIsRestorable()
    {
        $parent = $this->kabelTubeOdc()->withTrashed()->first();
        return $parent && !$parent->trashed() && $parent->status === 'active';
    }

    /**
     * Child ODCs fed by this core (optional, one core can feed many child ODCs).
     */
    public function childOdcs()
    {
        return $this->hasMany(FoOdc::class, 'kabel_core_odc_id', 'id');
    }
}
