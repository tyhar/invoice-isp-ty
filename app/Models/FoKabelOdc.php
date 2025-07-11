<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\FoOdc;
use App\Models\FoKabelTubeOdc;

class FoKabelOdc extends Model
{
    use SoftDeletes;

    protected $table = 'fo_kabel_odcs';

    // Remove jumlah_total_core from fillable
    protected $fillable = [
        'odc_id',
        'nama_kabel',
        'tipe_kabel',
        'panjang_kabel',
        'jumlah_tube',
        'jumlah_core_in_tube', // nullable
        'status',
    ];

    protected $casts = [
        'panjang_kabel' => 'float',
        'jumlah_core_in_tube' => 'integer',
        'jumlah_total_core' => 'integer',
        'status'        => 'string',
        'deleted_at'    => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        // Before every save (create or update), recalc jumlah_total_core
        static::saving(function (FoKabelOdc $model) {
            if ($model->jumlah_tube !== null && $model->jumlah_core_in_tube !== null) {
                $model->jumlah_total_core = $model->jumlah_tube * $model->jumlah_core_in_tube;
            } else {
                $model->jumlah_total_core = null;
            }
        });

        // Cascade soft-delete to tubes
        static::deleting(function (FoKabelOdc $model) {
            foreach ($model->kabelTubeOdcs()->withTrashed()->get() as $tube) {
                if (!$tube->trashed()) {
                    $tube->delete();
                }
            }
        });

        // Robust cascade restore: for each tube, if trashed call restore(), else manually restore all cores
        static::restoring(function (FoKabelOdc $model) {
            foreach ($model->kabelTubeOdcs()->withTrashed()->get() as $tube) {
                if ($tube->trashed()) {
                    $tube->restore();
                }
                if ($tube->status === 'archived') {
                    $tube->status = 'active';
                    $tube->save();
                }
                foreach ($tube->kabelCoreOdcs()->withTrashed()->get() as $core) {
                    if ($core->trashed()) {
                        $core->restore();
                    }
                    if ($core->status === 'archived') {
                        $core->status = 'active';
                        $core->save();
                    }
                }
            }
        });

        // Cascade archive/unarchive to tubes and cores
        static::updating(function (FoKabelOdc $model) {
            if ($model->isDirty('status')) {
                $newStatus = $model->status;
                foreach ($model->kabelTubeOdcs()->withTrashed()->get() as $tube) {
                    $tube->status = $newStatus;
                    $tube->save();
                    foreach ($tube->kabelCoreOdcs()->withTrashed()->get() as $core) {
                        $core->status = $newStatus;
                        $core->save();
                    }
                }
            }
        });
        // DO NOT nullify foreign keys on forceDeleted or anywhere else!
    }

    /**
     * Each KabelOdc has many ODCs.
     */
    public function odcs()
    {
        return $this->hasMany(FoOdc::class, 'kabel_odc_id');
    }

    public function kabelTubeOdcs()
    {
        return $this->hasMany(FoKabelTubeOdc::class, 'kabel_odc_id');
    }

    /**
     * Recursively unarchive all tubes and cores.
     */
    public function cascadeUnarchive()
    {
        // \Log::info('cascadeUnarchive called on KabelOdc', ['id' => $this->id]);
        foreach ($this->kabelTubeOdcs()->withTrashed()->get() as $tube) {
            if ($tube->status === 'archived') {
                $tube->status = 'active';
                $tube->save();
            }
            if (method_exists($tube, 'cascadeUnarchive')) {
                $tube->cascadeUnarchive();
            }
            foreach ($tube->kabelCoreOdcs()->withTrashed()->get() as $core) {
                if ($core->status === 'archived') {
                    $core->status = 'active';
                    $core->save();
                }
                if (method_exists($core, 'cascadeUnarchive')) {
                    $core->cascadeUnarchive();
                }
            }
        }
    }
}
