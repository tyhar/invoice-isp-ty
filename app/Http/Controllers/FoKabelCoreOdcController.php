<?php

namespace App\Http\Controllers;

use App\Models\FoKabelCoreOdc;
use Illuminate\Http\Request;

class FoKabelCoreOdcController extends Controller
{
    protected $model = FoKabelCoreOdc::class;


    public function getKabelWithoutODP()
    {
        $availableCores = FoKabelCoreOdc::whereDoesntHave('odps')->get();
        return response()->json(['data' => $availableCores]);
    }


    /**
     * List all Kabel-Core-ODC entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-kabel-core-odcs
     */
    public function index(Request $request)
    {
        // 1) Parse the `status` parameter into an array
        $statusParam = $request->query('status', 'active');
        $requested = collect(explode(',', $statusParam))
            ->map(fn($s) => trim(strtolower($s)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $validStatuses = ['active', 'archived', 'deleted'];
        $statuses = array_values(array_intersect($requested, $validStatuses));
        if (empty($statuses)) {
            $statuses = ['active'];
        }

        // 2) Base query including trashed (so we can filter "deleted")
        $query = FoKabelCoreOdc::withTrashed();

        // 3) Filter by status
        $query->where(function ($q) use ($statuses) {
            // a) include soft-deleted if "deleted" requested
            if (in_array('deleted', $statuses, true)) {
                $q->orWhereNotNull('deleted_at');
            }
            // b) include active/archived where deleted_at IS NULL
            $nonDeleted = array_values(array_intersect($statuses, ['active', 'archived']));
            if (!empty($nonDeleted)) {
                $q->orWhere(function ($sub) use ($nonDeleted) {
                    $sub->whereNull('deleted_at')
                        ->whereIn('status', $nonDeleted);
                });
            }
        });

        // 4) Optional text filter on warna_core, deskripsi, tube color, or ODC name
        if ($request->filled('filter')) {
            $term = $request->query('filter');
            $query->where(function ($q) use ($term) {
                $q->where('warna_core', 'LIKE', "%{$term}%")
                    ->orWhere('deskripsi', 'LIKE', "%{$term}%")
                    ->orWhereHas('kabelTubeOdc', function ($q2) use ($term) {
                        $q2->where('warna_tube', 'LIKE', "%{$term}%")
                            ->orWhereHas('kabelOdc', function ($q3) use ($term) {
                                $q3->where('nama_kabel', 'LIKE', "%{$term}%");
                            });
                    });
            });
        }

        // 5) Optional sorting: "column|asc" or "column|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = ['id', 'warna_core', 'created_at', 'updated_at', 'status'];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            // Default ordering: newest ID first
            $query->orderBy('id', 'desc');
        }

        // 6) Pagination (default 15 per page)
        $perPage = (int) $request->query('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }

        // 7) Eager-load relationships (tube + parent ODC + odps) and paginate
        $paginator = $query
            ->with(['kabelTubeOdc.kabelOdc', 'odps'])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform results into JSON structure
        $items = array_map(function ($c) {
            $tube = $c->kabelTubeOdc;
            $kabelOdc = $tube?->kabelOdc;
            $odps = $c->odps;
            return [
                'id' => $c->id,
                'kabel_tube_odc_id' => $c->kabel_tube_odc_id,
                'kabel_tube_odc' => $tube ? [
                    'id' => $tube->id,
                    'warna_tube' => $tube->warna_tube,
                ] : null,
                'kabel_odc' => $kabelOdc ? [
                    'id' => $kabelOdc->id,
                    'nama_kabel' => $kabelOdc->nama_kabel,
                ] : null,
                'warna_core' => $c->warna_core,
                'deskripsi' => $c->deskripsi,
                'status' => $c->status,
                'odp_ids' => $c->odps->pluck('id')->toArray(),
                'created_at' => $c->created_at?->toDateTimeString(),
                'updated_at' => $c->updated_at->toDateTimeString(),
                'deleted_at' => $c->deleted_at?->toDateTimeString(),
            ];
        }, $paginator->items());

        return response()->json([
            'status' => 'success',
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ], 200);
    }

    /**
     * Create a new Kabel-Core-ODC (default status = active).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'kabel_tube_odc_id' => 'required|exists:fo_kabel_tube_odcs,id',
            'warna_core' => 'required|in:biru,jingga,hijau,coklat,abu_abu,putih,merah,hitam,kuning,ungu,merah_muda,aqua',
            'deskripsi' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,archived',
        ]);

        // Enforce max core per tube
        $tube = \App\Models\FoKabelTubeOdc::with('kabelOdc')->findOrFail($data['kabel_tube_odc_id']);
        $maxCores = $tube->kabelOdc->jumlah_core_in_tube;
        $currentCores = $tube->kabelCoreOdcs()->whereNull('deleted_at')->count();
        if ($maxCores !== null && $currentCores >= $maxCores) {
            return response()->json([
                'status' => 'error',
                'message' => 'This tube already has the maximum number of cores ('.$maxCores.').',
                'errors' => [
                    'kabel_tube_odc_id' => ['This tube already has the maximum number of cores ('.$maxCores.').'],
                ],
            ], 422);
        }

        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }

        $c = FoKabelCoreOdc::create($data);
        $c->load(['kabelTubeOdc.kabelOdc', 'odps']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $c->id,
                'kabel_tube_odc_id' => $c->kabel_tube_odc_id,
                'kabel_tube_odc' => [
                    'id' => $c->kabelTubeOdc->id,
                    'warna_tube' => $c->kabelTubeOdc->warna_tube,
                ],
                'kabel_odc' => [
                    'id' => $c->kabelTubeOdc->kabelOdc->id,
                    'nama_kabel' => $c->kabelTubeOdc->kabelOdc->nama_kabel,
                ],
                'warna_core' => $c->warna_core,
                'deskripsi' => $c->deskripsi,
                'status' => $c->status,
                'odp_ids' => $c->odps->pluck('id')->toArray(),
                'created_at' => $c->created_at->toDateTimeString(),
                'updated_at' => $c->updated_at->toDateTimeString(),
            ],
            'message' => 'Core ODC created.',
        ], 201);
    }

    /**
     * Show a single Kabel-Core-ODC by ID (including soft-deleted).
     */
    public function show($id)
    {
        $c = FoKabelCoreOdc::withTrashed()->findOrFail($id);
        $c->load(['kabelTubeOdc.kabelOdc', 'odps']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $c->id,
                'kabel_tube_odc_id' => $c->kabel_tube_odc_id,
                'kabel_tube_odc' => [
                    'id' => $c->kabelTubeOdc->id,
                    'warna_tube' => $c->kabelTubeOdc->warna_tube,
                ],
                'kabel_odc' => [
                    'id' => $c->kabelTubeOdc->kabelOdc->id,
                    'nama_kabel' => $c->kabelTubeOdc->kabelOdc->nama_kabel,
                ],
                'warna_core' => $c->warna_core,
                'deskripsi' => $c->deskripsi,
                'status' => $c->status,
                'odp_ids' => $c->odps->pluck('id')->toArray(),
                'created_at' => $c->created_at->toDateTimeString(),
                'updated_at' => $c->updated_at->toDateTimeString(),
                'deleted_at' => $c->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing Kabel-Core-ODC by ID.
     */
    public function update(Request $request, $id)
    {
        $c = FoKabelCoreOdc::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'kabel_tube_odc_id' => 'sometimes|exists:fo_kabel_tube_odcs,id',
            'warna_core' => 'sometimes|in:biru,jingga,hijau,coklat,abu_abu,putih,merah,hitam,kuning,ungu,merah_muda,aqua',
            'deskripsi' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,archived',
        ]);

        // If tube is being changed or not, always check max core per tube
        $tubeId = $data['kabel_tube_odc_id'] ?? $c->kabel_tube_odc_id;
        $tube = \App\Models\FoKabelTubeOdc::with('kabelOdc')->findOrFail($tubeId);
        $maxCores = $tube->kabelOdc->jumlah_core_in_tube;
        $currentCores = $tube->kabelCoreOdcs()->whereNull('deleted_at')->where('id', '!=', $c->id)->count();
        if ($maxCores !== null && $currentCores >= $maxCores) {
            return response()->json([
                'status' => 'error',
                'message' => 'This tube already has the maximum number of cores ('.$maxCores.').',
                'errors' => [
                    'kabel_tube_odc_id' => ['This tube already has the maximum number of cores ('.$maxCores.').'],
                ],
            ], 422);
        }

        $c->update($data);
        $c->refresh()->load(['kabelTubeOdc.kabelOdc', 'odps']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $c->id,
                'kabel_tube_odc_id' => $c->kabel_tube_odc_id,
                'kabel_tube_odc' => [
                    'id' => $c->kabelTubeOdc->id,
                    'warna_tube' => $c->kabelTubeOdc->warna_tube,
                ],
                'kabel_odc' => [
                    'id' => $c->kabelTubeOdc->kabelOdc->id,
                    'nama_kabel' => $c->kabelTubeOdc->kabelOdc->nama_kabel,
                ],
                'warna_core' => $c->warna_core,
                'deskripsi' => $c->deskripsi,
                'status' => $c->status,
                'odp_ids' => $c->odps->pluck('id')->toArray(),
                'created_at' => $c->created_at->toDateTimeString(),
                'updated_at' => $c->updated_at->toDateTimeString(),
            ],
            'message' => 'Core ODC updated.',
        ], 200);
    }

    /**
     * Soft‐delete a Kabel‐Core‐ODC by ID.
     *
     * DELETE /api/v1/fo-kabel-core-odcs/{id}
     */
    public function destroy($id)
    {
        $c = FoKabelCoreOdc::findOrFail($id);
        $c->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Core ODC soft-deleted.',
        ], 200);
    }

    /**
     * Archive a Kabel‐Core‐ODC (set status = "archived").
     *
     * PATCH /api/v1/fo-kabel-core-odcs/{id}/archive
     */
    public function archive($id)
    {
        $c = FoKabelCoreOdc::withTrashed()->findOrFail($id);
        $c->update(['status' => 'archived']);

        return response()->json([
            'status' => 'success',
            'message' => 'Core ODC archived.',
        ], 200);
    }

    /**
     * Unarchive a Kabel‐Core‐ODC (set status = "active").
     *
     * PATCH /api/v1/fo-kabel-core-odcs/{id}/unarchive
     */
    public function unarchive($id)
    {
        $c = FoKabelCoreOdc::withTrashed()->findOrFail($id);
        $c->update(['status' => 'active']);
        $c->cascadeUnarchive();

        return response()->json([
            'status' => 'success',
            'message' => 'Core ODC set to active.',
        ], 200);
    }

    /**
     * Restore a soft‐deleted Kabel‐Core‐ODC (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-kabel-core-odcs/{id}/restore
     */
    public function restore($id)
    {
        $c = FoKabelCoreOdc::onlyTrashed()->findOrFail($id);
        $c->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'Core ODC restored from deletion.',
        ], 200);
    }

    /**
     * Bulk operation: archive | delete | restore.
     *
     * POST /api/v1/…/bulk
     * {
     *   "action":  "archive"|"delete"|"restore",
     *   "ids":      [1,2,3]
     * }
     */
    public function bulk(Request $request)
    {
        $data = $request->validate([
            'action' => 'required|in:archive,delete,restore,unarchive',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|distinct',
        ]);

        $ids = $data['ids'];
        $action = $data['action'];

        switch ($action) {
            case 'archive':
                foreach ($ids as $id) {
                    $model = $this->model::withTrashed()->find($id);
                    if ($model) {
                        $model->status = 'archived';
                        $model->save();
                    }
                }
                $message = 'Items archived.';
                break;
            case 'unarchive':
                foreach ($ids as $id) {
                    $model = $this->model::withTrashed()->find($id);
                    if ($model) {
                        $model->status = 'active';
                        $model->save();
                        $model->cascadeUnarchive();
                    }
                }
                $message = 'Items unarchived.';
                break;
            case 'delete':
                foreach ($ids as $id) {
                    $model = $this->model::withTrashed()->find($id);
                    if ($model && !$model->trashed()) {
                        $model->delete();
                    }
                }
                $message = 'Items soft‐deleted.';
                break;
            case 'restore':
                $skipped = [];
                foreach ($ids as $id) {
                    $model = $this->model::withTrashed()->find($id);
                    if ($model) {
                        $parent = $model->kabelTubeOdc()->withTrashed()->first();
                        if (!$parent || $parent->trashed() || $parent->status === 'archived') {
                            $skipped[] = $model->id;
                            continue;
                        }
                        if ($model->trashed()) {
                            $model->restore();
                        } elseif ($model->status === 'archived') {
                            $model->status = 'active';
                            $model->save();
                            if (method_exists($model, 'cascadeUnarchive')) {
                                $model->cascadeUnarchive();
                            }
                        }
                    }
                }
                $message = 'Items restored to active.';
                $extra = [];
                if (!empty($skipped)) {
                    $extra['skipped'] = $skipped;
                    $message .= ' Some items were skipped because their parent is archived or deleted.';
                }
                return response()->json([
                    'status'  => 'success',
                    'message' => $message,
                    ...$extra,
                ], 200);

            default:
                // Should never happen due to validation
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid action.',
                ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => $message,
        ], 200);
    }
}
