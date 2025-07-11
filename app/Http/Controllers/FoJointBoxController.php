<?php

namespace App\Http\Controllers;

use App\Models\FoJointBox;
use Illuminate\Http\Request;

class FoJointBoxController extends Controller
{
    protected $model = FoJointBox::class;

    /**
     * List all JointBox entries with pagination, filtering, sorting, and status.
     */
    public function index(Request $request)
    {
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

        $query = FoJointBox::withTrashed();

        $query->where(function ($q) use ($statuses) {
            if (in_array('deleted', $statuses, true)) {
                $q->orWhereNotNull('deleted_at');
            }
            $nonDeleted = array_values(array_intersect($statuses, ['active', 'archived']));
            if (!empty($nonDeleted)) {
                $q->orWhere(function ($sub) use ($nonDeleted) {
                    $sub->whereNull('deleted_at')
                        ->whereIn('status', $nonDeleted);
                });
            }
        });

        // Optional text filtering on nama_joint_box, lokasi.nama_lokasi, lokasi.deskripsi, kabelOdc.nama_kabel
        if ($request->filled('filter')) {
            $term = $request->query('filter');
            $query->where(function ($q) use ($term) {
                $q->where('nama_joint_box', 'LIKE', "%{$term}%")
                  ->orWhereHas('lokasi', function ($q2) use ($term) {
                      $q2->where('nama_lokasi', 'LIKE', "%{$term}%")
                         ->orWhere('deskripsi', 'LIKE', "%{$term}%");
                  })
                  ->orWhereHas('kabelOdc', function ($q3) use ($term) {
                      $q3->where('nama_kabel', 'LIKE', "%{$term}%");
                  });
            });
        }

        // Optional sorting
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';
            $allowedSorts = ['id', 'nama_joint_box', 'created_at', 'updated_at', 'status'];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            $query->orderBy('id', 'desc');
        }

        $perPage = (int) $request->query('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }

        $paginator = $query
            ->with(['lokasi', 'kabelOdc.kabelTubeOdcs.kabelCoreOdcs'])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        $data = array_map(function ($j) {
            return [
                'id' => $j->id,
                'nama_joint_box' => $j->nama_joint_box,
                'lokasi' => $j->lokasi ? [
                    'id' => $j->lokasi->id,
                    'nama_lokasi' => $j->lokasi->nama_lokasi,
                    'deskripsi' => $j->lokasi->deskripsi,
                    'latitude' => $j->lokasi->latitude,
                    'longitude' => $j->lokasi->longitude,
                    'city' => $j->lokasi->city,
                    'province' => $j->lokasi->province,
                    'country' => $j->lokasi->country,
                    'geocoded_at' => $j->lokasi->geocoded_at?->toDateTimeString(),
                ] : null,
                'kabel_odc' => $j->kabelOdc ? [
                    'id' => $j->kabelOdc->id,
                    'nama_kabel' => $j->kabelOdc->nama_kabel,
                    'tipe_kabel' => $j->kabelOdc->tipe_kabel,
                    'panjang_kabel' => $j->kabelOdc->panjang_kabel,
                    'jumlah_tube' => $j->kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $j->kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $j->kabelOdc->jumlah_total_core,
                    'kabel_tube_odcs' => $j->kabelOdc->kabelTubeOdcs->map(function ($tube) {
                        return [
                            'id' => $tube->id,
                            'warna_tube' => $tube->warna_tube,
                            'kabel_core_odcs' => $tube->kabelCoreOdcs->map(function ($core) {
                                return [
                                    'id' => $core->id,
                                    'warna_core' => $core->warna_core,
                                ];
                            })->toArray(),
                        ];
                    })->toArray(),
                ] : null,
            ];
        }, $paginator->items());

        return response()->json([
            'status' => 'success',
            'data' => $data,
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
     * Create a new JointBox (default status = active).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'lokasi_id' => 'required|exists:fo_lokasis,id',
            'kabel_odc_id' => 'required|exists:fo_kabel_odcs,id',
            'nama_joint_box' => 'required|string|max:255',
            'status' => 'sometimes|in:active,archived',
        ]);
        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }
        $j = FoJointBox::create($data);
        $j->load(['lokasi', 'kabelOdc']);
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $j->id,
                'lokasi_id' => $j->lokasi_id,
                'kabel_odc_id' => $j->kabel_odc_id,
                'nama_joint_box' => $j->nama_joint_box,
                'status' => $j->status,
                'created_at' => $j->created_at?->toDateTimeString(),
                'updated_at' => $j->updated_at?->toDateTimeString(),
            ],
            'message' => 'JointBox created.',
        ], 201);
    }

    /**
     * Show a single JointBox by ID (including soft-deleted).
     */
    public function show($id)
    {
        $j = FoJointBox::withTrashed()->findOrFail($id);
        // Deep eager-load: kabelOdc > kabelTubeOdcs > kabelCoreOdcs
        $j->load(['lokasi', 'kabelOdc.kabelTubeOdcs.kabelCoreOdcs']);
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $j->id,
                'lokasi_id' => $j->lokasi_id,
                'lokasi' => $j->lokasi ? [
                    'id' => $j->lokasi->id,
                    'nama_lokasi' => $j->lokasi->nama_lokasi,
                    'deskripsi' => $j->lokasi->deskripsi,
                    'latitude' => $j->lokasi->latitude,
                    'longitude' => $j->lokasi->longitude,
                    'city' => $j->lokasi->city,
                    'province' => $j->lokasi->province,
                    'country' => $j->lokasi->country,
                    'geocoded_at' => $j->lokasi->geocoded_at?->toDateTimeString(),
                    'status' => $j->lokasi->status,
                    'created_at' => $j->lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $j->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->lokasi->deleted_at?->toDateTimeString(),
                ] : null,
                'kabel_odc_id' => $j->kabel_odc_id,
                'kabel_odc' => $j->kabelOdc ? [
                    'id' => $j->kabelOdc->id,
                    'nama_kabel' => $j->kabelOdc->nama_kabel,
                    'tipe_kabel' => $j->kabelOdc->tipe_kabel,
                    'panjang_kabel' => $j->kabelOdc->panjang_kabel,
                    'jumlah_tube' => $j->kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $j->kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $j->kabelOdc->jumlah_total_core,
                    'status' => $j->kabelOdc->status,
                    'created_at' => $j->kabelOdc->created_at?->toDateTimeString(),
                    'updated_at' => $j->kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->kabelOdc->deleted_at?->toDateTimeString(),
                    // Tubes and cores
                    'kabel_tube_odcs' => $j->kabelOdc->kabelTubeOdcs->map(function ($tube) {
                        return [
                            'id' => $tube->id,
                            'warna_tube' => $tube->warna_tube,
                            'status' => $tube->status,
                            'created_at' => $tube->created_at?->toDateTimeString(),
                            'updated_at' => $tube->updated_at?->toDateTimeString(),
                            'deleted_at' => $tube->deleted_at?->toDateTimeString(),
                            'kabel_core_odcs' => $tube->kabelCoreOdcs->map(function ($core) {
                                return [
                                    'id' => $core->id,
                                    'warna_core' => $core->warna_core,
                                    'status' => $core->status,
                                    'created_at' => $core->created_at?->toDateTimeString(),
                                    'updated_at' => $core->updated_at?->toDateTimeString(),
                                    'deleted_at' => $core->deleted_at?->toDateTimeString(),
                                ];
                            })->toArray(),
                        ];
                    })->toArray(),
                ] : null,
                'nama_joint_box' => $j->nama_joint_box,
                'status' => $j->status,
                'created_at' => $j->created_at?->toDateTimeString(),
                'updated_at' => $j->updated_at?->toDateTimeString(),
                'deleted_at' => $j->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing JointBox by ID.
     */
    public function update(Request $request, $id)
    {
        $j = FoJointBox::withTrashed()->findOrFail($id);
        $data = $request->validate([
            'lokasi_id' => 'sometimes|exists:fo_lokasis,id',
            'kabel_odc_id' => 'sometimes|exists:fo_kabel_odcs,id',
            'nama_joint_box' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,archived',
        ]);
        $j->update($data);
        $j->refresh()->load(['lokasi', 'kabelOdc']);
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $j->id,
                'lokasi_id' => $j->lokasi_id,
                'kabel_odc_id' => $j->kabel_odc_id,
                'nama_joint_box' => $j->nama_joint_box,
                'status' => $j->status,
                'created_at' => $j->created_at?->toDateTimeString(),
                'updated_at' => $j->updated_at?->toDateTimeString(),
                'deleted_at' => $j->deleted_at?->toDateTimeString(),
            ],
            'message' => 'JointBox updated.',
        ], 200);
    }

    /**
     * Soft-delete a JointBox by ID.
     */
    public function destroy($id)
    {
        $j = FoJointBox::findOrFail($id);
        $j->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'JointBox soft-deleted.',
        ], 200);
    }

    /**
     * Archive a JointBox (set status = "archived").
     */
    public function archive($id)
    {
        $j = FoJointBox::withTrashed()->findOrFail($id);
        $j->update(['status' => 'archived']);
        return response()->json([
            'status' => 'success',
            'message' => 'JointBox archived.',
        ], 200);
    }

    /**
     * Unarchive a JointBox (set status = "active").
     */
    public function unarchive($id)
    {
        $j = FoJointBox::withTrashed()->findOrFail($id);
        $j->update(['status' => 'active']);
        return response()->json([
            'status' => 'success',
            'message' => 'JointBox set to active.',
        ], 200);
    }

    /**
     * Restore a soft-deleted JointBox (deleted_at = NULL).
     */
    public function restore($id)
    {
        $j = FoJointBox::onlyTrashed()->findOrFail($id);
        $j->restore();
        return response()->json([
            'status' => 'success',
            'message' => 'JointBox restored from deletion.',
        ], 200);
    }

    /**
     * Bulk operation: archive | delete | restore.
     */
    public function bulk(Request $request)
    {
        $data = $request->validate([
            'action' => 'required|in:archive,delete,restore',
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|distinct',
        ]);

        $ids = $data['ids'];
        $action = $data['action'];
        $message = '';

        switch ($action) {
            case 'archive':
                FoJointBox::withTrashed()->whereIn('id', $ids)->update(['status' => 'archived']);
                $message = 'Items archived.';
                break;
            case 'delete':
                FoJointBox::whereIn('id', $ids)->delete();
                $message = 'Items soft-deleted.';
                break;
            case 'restore':
                FoJointBox::onlyTrashed()->whereIn('id', $ids)->restore();
                FoJointBox::whereIn('id', $ids)->update(['status' => 'active']);
                $message = 'Items restored to active.';
                break;
            default:
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
