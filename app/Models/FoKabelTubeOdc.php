<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoKabelOdc;
use App\Models\FoKabelCoreOdc;

class FoKabelTubeOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_kabel_tube_odcs';

    protected $fillable = [
        'kabel_odc_id',
        'warna_tube',
        'deskripsi',
        'status',             // allow setting "active" or "archived"
    ];

    protected $casts = [
        'status'     => 'string',
        'deleted_at' => 'datetime',
        'deskripsi'  => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        // Cascade soft-delete to cores
        static::deleting(function (FoKabelTubeOdc $model) {
            foreach ($model->kabelCoreOdcs()->withTrashed()->get() as $core) {
                if (!$core->trashed()) {
                    $core->delete();
                }
            }
        });

        // Robust cascade restore: for each core, if trashed call restore(), and set status to active if archived
        static::restoring(function (FoKabelTubeOdc $model) {
            foreach ($model->kabelCoreOdcs()->withTrashed()->get() as $core) {
                if ($core->trashed()) {
                    $core->restore();
                }
                if ($core->status === 'archived') {
                    $core->status = 'active';
                    $core->save();
                }
            }
        });

        // Cascade archive/unarchive to cores
        static::updating(function (FoKabelTubeOdc $model) {
            if ($model->isDirty('status')) {
                $newStatus = $model->status;
                foreach ($model->kabelCoreOdcs()->withTrashed()->get() as $core) {
                    $core->status = $newStatus;
                    $core->save();
                }
            }
        });
        // DO NOT nullify foreign keys on forceDeleted or anywhere else!
    }

    /**
     * Belongs to one KabelOdc.
     */
    public function kabelOdc()
    {
        return $this->belongsTo(FoKabelOdc::class, 'kabel_odc_id');
    }

    /**
     * Has many KabelCoreOdcs.
     */
    public function kabelCoreOdcs()
    {
        return $this->hasMany(FoKabelCoreOdc::class, 'kabel_tube_odc_id');
    }

    /**
     * Recursively unarchive all cores.
     */
    public function cascadeUnarchive()
    {
        // \Log::info('cascadeUnarchive called on KabelTubeOdc', ['id' => $this->id]);
        foreach ($this->kabelCoreOdcs()->withTrashed()->get() as $core) {
            if ($core->status === 'archived') {
                $core->status = 'active';
                $core->save();
            }
            if (method_exists($core, 'cascadeUnarchive')) {
                $core->cascadeUnarchive();
            }
        }
    }

    /**
     * Returns true if parent Kabel ODC is active and not deleted.
     */
    public function parentIsRestorable()
    {
        $parent = $this->kabelOdc()->withTrashed()->first();
        return $parent && !$parent->trashed() && $parent->status === 'active';
    }
}
