<?php

namespace App\Http\Controllers;

use App\Models\FoOdc;
use Illuminate\Http\Request;

class FoOdcController extends Controller
{
    protected $model = FoOdc::class;
    /**
     * List all ODC entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-odcs
     *
     * Query parameters (all optional):
     *   - page (int)
     *   - per_page (int)
     *   - filter (string)           // searches nama_odc OR tipe_splitter
     *   - sort (string)             // format "column|asc" or "column|dsc"
     *   - status (string)           // comma-separated: "active,archived,deleted"
     */
    public function index(Request $request)
    {
        // 1) Parse the `status` query param into an array
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

        // 2) Start a base query including soft‐deleted rows (withTrashed)
        $query = FoOdc::withTrashed();

        // 3) Filter by status
        $query->where(function ($q) use ($statuses) {
            // a) include soft‐deleted if "deleted" is requested
            if (in_array('deleted', $statuses, true)) {
                $q->orWhereNotNull('deleted_at');
            }
            // b) include active/archived rows where deleted_at IS NULL
            $nonDeleted = array_values(array_intersect($statuses, ['active', 'archived']));
            if (!empty($nonDeleted)) {
                $q->orWhere(function ($sub) use ($nonDeleted) {
                    $sub->whereNull('deleted_at')
                        ->whereIn('status', $nonDeleted);
                });
            }
        });

        // 4) Optional text filtering by nama_odc, deskripsi, or tipe_splitter
        if ($request->filled('filter')) {
            $term = $request->query('filter');
            $query->where(function ($q) use ($term) {
                $q->where('nama_odc', 'LIKE', "%{$term}%")
                    ->orWhere('deskripsi', 'LIKE', "%{$term}%")
                    ->orWhere('tipe_splitter', 'LIKE', "%{$term}%");
            });
        }

        // 5) Optional sorting: "column|asc" or "column|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = ['id', 'nama_odc', 'tipe_splitter', 'created_at', 'updated_at', 'status'];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            // Default ordering: newest first by id
            $query->orderBy('id', 'desc');
        }

        // 6) Pagination: default 15 per page
        $perPage = (int) $request->query('per_page', 15);
        if ($perPage <= 0) {
            $perPage = 15;
        }

        // 7) Eager‐load relationships and paginate
        $paginator = $query
            ->with([
                'lokasi',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc',
                'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.lokasi',
                'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.client',
                'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.company',
                'connectedOdc.lokasi',
                'connectedFromOdcs.lokasi'
            ])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform each FoOdc to the desired JSON structure
        $items = array_map(function ($o) {
            $lokasi = $o->lokasi;
            $kabelOdc = $o->kabelOdc;
            $connectedOdc = $o->connectedOdc;
            return [
                'id' => $o->id,
                'lokasi_id' => $o->lokasi_id,
                'kabel_odc_id' => $o->kabel_odc_id, // <-- add this
                'odc_id' => $o->odc_id, // direct connection to another ODC
                'kabel_core_odc' => $o->kabelCoreOdc ? [
                    'id' => $o->kabelCoreOdc->id,
                    'warna_core' => $o->kabelCoreOdc->warna_core,
                    'status' => $o->kabelCoreOdc->status,
                    'created_at' => $o->kabelCoreOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->kabelCoreOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->kabelCoreOdc->deleted_at?->toDateTimeString(),
                    'kabel_tube_odc' => $o->kabelCoreOdc->kabelTubeOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->id,
                        'warna_tube' => $o->kabelCoreOdc->kabelTubeOdc->warna_tube,
                    ] : null,
                    'kabel_odc' => $o->kabelCoreOdc->kabelTubeOdc?->kabelOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->id,
                        'nama_kabel' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->nama_kabel,
                    ] : null,
                ] : null,
                'lokasi' => $lokasi ? [
                    'id' => $lokasi->id,
                    'nama_lokasi' => $lokasi->nama_lokasi,
                    'deskripsi' => $lokasi->deskripsi,
                    'latitude' => $lokasi->latitude,
                    'longitude' => $lokasi->longitude,
                    'status' => $lokasi->status,
                    'created_at' => $lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $lokasi->deleted_at?->toDateTimeString(),
                ] : null,
                'nama_odc' => $o->nama_odc,
                'deskripsi' => $o->deskripsi,
                'tipe_splitter' => $o->tipe_splitter,
                'status' => $o->status,
                'kabel_odc' => $kabelOdc ? [
                    'id' => $kabelOdc->id,
                    'nama_kabel' => $kabelOdc->nama_kabel,
                    'tipe_kabel' => $kabelOdc->tipe_kabel,
                    'panjang_kabel' => $kabelOdc->panjang_kabel,
                    'jumlah_tube' => $kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $kabelOdc->jumlah_total_core,
                    'status' => $kabelOdc->status,
                    'created_at' => $kabelOdc->created_at?->toDateTimeString(),
                    'updated_at' => $kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $kabelOdc->deleted_at?->toDateTimeString(),
                ] : null,
                'connected_odc' => $connectedOdc ? [
                    'id' => $connectedOdc->id,
                    'nama_odc' => $connectedOdc->nama_odc,
                    'tipe_splitter' => $connectedOdc->tipe_splitter,
                    'status' => $connectedOdc->status,
                    'created_at' => $connectedOdc->created_at?->toDateTimeString(),
                    'updated_at' => $connectedOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $connectedOdc->deleted_at?->toDateTimeString(),
                    'lokasi' => $connectedOdc->lokasi ? [
                        'id' => $connectedOdc->lokasi->id,
                        'nama_lokasi' => $connectedOdc->lokasi->nama_lokasi,
                        'deskripsi' => $connectedOdc->lokasi->deskripsi,
                        'latitude' => $connectedOdc->lokasi->latitude,
                        'longitude' => $connectedOdc->lokasi->longitude,
                        'status' => $connectedOdc->lokasi->status,
                    ] : null,
                ] : null,
                'connected_from_odcs' => $o->connectedFromOdcs->map(function ($fromOdc) {
                    return [
                        'id' => $fromOdc->id,
                        'nama_odc' => $fromOdc->nama_odc,
                        'tipe_splitter' => $fromOdc->tipe_splitter,
                        'status' => $fromOdc->status,
                        'created_at' => $fromOdc->created_at?->toDateTimeString(),
                        'updated_at' => $fromOdc->updated_at?->toDateTimeString(),
                        'deleted_at' => $fromOdc->deleted_at?->toDateTimeString(),
                        'lokasi' => $fromOdc->lokasi ? [
                            'id' => $fromOdc->lokasi->id,
                            'nama_lokasi' => $fromOdc->lokasi->nama_lokasi,
                            'deskripsi' => $fromOdc->lokasi->deskripsi,
                            'latitude' => $fromOdc->lokasi->latitude,
                            'longitude' => $fromOdc->lokasi->longitude,
                            'status' => $fromOdc->lokasi->status,
                        ] : null,
                    ];
                })->toArray(),
                'created_at' => $o->created_at?->toDateTimeString(),
                'updated_at' => $o->updated_at?->toDateTimeString(),
                'deleted_at' => $o->deleted_at?->toDateTimeString(),
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
     * Create a new ODC (default status = active).
     *
     * POST /api/v1/fo-odcs
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'lokasi_id' => 'required|exists:fo_lokasis,id',
            'kabel_odc_id' => 'nullable|exists:fo_kabel_odcs,id',
            'odc_id' => 'nullable|exists:fo_odcs,id',
            'kabel_core_odc_id' => 'nullable|exists:fo_kabel_core_odcs,id',
            'nama_odc' => 'required|string|max:255|unique:fo_odcs,nama_odc',
            'deskripsi' => 'nullable|string|max:255',
            'tipe_splitter' => 'required|in:1:2,1:4,1:8,1:16,1:32,1:64,1:128',
            'status' => 'sometimes|in:active,archived',
        ]);

        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }

        $o = FoOdc::create($data);
        $o->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.lokasi',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.client',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.company',
            'connectedOdc.lokasi',
            'connectedFromOdcs.lokasi'
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $o->id,
                'lokasi_id' => $o->lokasi_id,
                'kabel_odc_id' => $o->kabel_odc_id,
                'odc_id' => $o->odc_id,
                'lokasi' => $o->lokasi ? [
                    'id' => $o->lokasi->id,
                    'nama_lokasi' => $o->lokasi->nama_lokasi,
                    'deskripsi' => $o->lokasi->deskripsi,
                    'latitude' => $o->lokasi->latitude,
                    'longitude' => $o->lokasi->longitude,
                    'status' => $o->lokasi->status,
                    'created_at' => $o->lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $o->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->lokasi->deleted_at?->toDateTimeString(),
                ] : null,
                'nama_odc' => $o->nama_odc,
                'deskripsi' => $o->deskripsi,
                'tipe_splitter' => $o->tipe_splitter,
                'status' => $o->status,
                'kabel_core_odc' => $o->kabelCoreOdc ? [
                    'id' => $o->kabelCoreOdc->id,
                    'warna_core' => $o->kabelCoreOdc->warna_core,
                    'status' => $o->kabelCoreOdc->status,
                    'created_at' => $o->kabelCoreOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->kabelCoreOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->kabelCoreOdc->deleted_at?->toDateTimeString(),
                    'kabel_tube_odc' => $o->kabelCoreOdc->kabelTubeOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->id,
                        'warna_tube' => $o->kabelCoreOdc->kabelTubeOdc->warna_tube,
                    ] : null,
                    'kabel_odc' => $o->kabelCoreOdc->kabelTubeOdc?->kabelOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->id,
                        'nama_kabel' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->nama_kabel,
                    ] : null,
                ] : null,
                'kabel_odc' => $o->kabelOdc ? [
                    'id' => $o->kabelOdc->id,
                    'nama_kabel' => $o->kabelOdc->nama_kabel,
                    'tipe_kabel' => $o->kabelOdc->tipe_kabel,
                    'panjang_kabel' => $o->kabelOdc->panjang_kabel,
                    'jumlah_tube' => $o->kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $o->kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $o->kabelOdc->jumlah_total_core,
                    'status' => $o->kabelOdc->status,
                    'created_at' => $o->kabelOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->kabelOdc->deleted_at?->toDateTimeString(),
                ] : null,
                'connected_odc' => $o->connectedOdc ? [
                    'id' => $o->connectedOdc->id,
                    'nama_odc' => $o->connectedOdc->nama_odc,
                    'tipe_splitter' => $o->connectedOdc->tipe_splitter,
                    'status' => $o->connectedOdc->status,
                    'created_at' => $o->connectedOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->connectedOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->connectedOdc->deleted_at?->toDateTimeString(),
                    'lokasi' => $o->connectedOdc->lokasi ? [
                        'id' => $o->connectedOdc->lokasi->id,
                        'nama_lokasi' => $o->connectedOdc->lokasi->nama_lokasi,
                        'deskripsi' => $o->connectedOdc->lokasi->deskripsi,
                        'latitude' => $o->connectedOdc->lokasi->latitude,
                        'longitude' => $o->connectedOdc->lokasi->longitude,
                        'status' => $o->connectedOdc->lokasi->status,
                    ] : null,
                ] : null,
                'connected_from_odcs' => $o->connectedFromOdcs->map(function ($fromOdc) {
                    return [
                        'id' => $fromOdc->id,
                        'nama_odc' => $fromOdc->nama_odc,
                        'tipe_splitter' => $fromOdc->tipe_splitter,
                        'status' => $fromOdc->status,
                        'created_at' => $fromOdc->created_at?->toDateTimeString(),
                        'updated_at' => $fromOdc->updated_at?->toDateTimeString(),
                        'deleted_at' => $fromOdc->deleted_at?->toDateTimeString(),
                        'lokasi' => $fromOdc->lokasi ? [
                            'id' => $fromOdc->lokasi->id,
                            'nama_lokasi' => $fromOdc->lokasi->nama_lokasi,
                            'deskripsi' => $fromOdc->lokasi->deskripsi,
                            'latitude' => $fromOdc->lokasi->latitude,
                            'longitude' => $fromOdc->lokasi->longitude,
                            'status' => $fromOdc->lokasi->status,
                        ] : null,
                    ];
                })->toArray(),
                'created_at' => $o->created_at->toDateTimeString(),
                'updated_at' => $o->updated_at->toDateTimeString(),
            ],
            'message' => 'ODC created.',
        ], 201);
    }

    /**
     * Show a single ODC by ID (including soft‐deleted).
     *
     * GET /api/v1/fo-odcs/{id}
     */
    public function show($id)
    {
        $o = FoOdc::withTrashed()->findOrFail($id);
        $o->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.lokasi',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.client',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.company',
            'connectedOdc.lokasi',
            'connectedFromOdcs.lokasi'
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $o->id,
                'lokasi_id' => $o->lokasi_id,
                'kabel_odc_id' => $o->kabel_odc_id,
                'odc_id' => $o->odc_id,
                'lokasi' => $o->lokasi ? [
                    'id' => $o->lokasi->id,
                    'nama_lokasi' => $o->lokasi->nama_lokasi,
                    'deskripsi' => $o->lokasi->deskripsi,
                    'latitude' => $o->lokasi->latitude,
                    'longitude' => $o->lokasi->longitude,
                    'status' => $o->lokasi->status,
                    'created_at' => $o->lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $o->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->lokasi->deleted_at?->toDateTimeString(),
                ] : null,
                'nama_odc' => $o->nama_odc,
                'deskripsi' => $o->deskripsi,
                'tipe_splitter' => $o->tipe_splitter,
                'status' => $o->status,
                'kabel_core_odc' => $o->kabelCoreOdc ? [
                    'id' => $o->kabelCoreOdc->id,
                    'warna_core' => $o->kabelCoreOdc->warna_core,
                    'status' => $o->kabelCoreOdc->status,
                    'created_at' => $o->kabelCoreOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->kabelCoreOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->kabelCoreOdc->deleted_at?->toDateTimeString(),
                    'kabel_tube_odc' => $o->kabelCoreOdc->kabelTubeOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->id,
                        'warna_tube' => $o->kabelCoreOdc->kabelTubeOdc->warna_tube,
                    ] : null,
                    'kabel_odc' => $o->kabelCoreOdc->kabelTubeOdc?->kabelOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->id,
                        'nama_kabel' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->nama_kabel,
                    ] : null,
                ] : null,
                'kabel_odc' => $o->kabelOdc ? [
                    'id' => $o->kabelOdc->id,
                    'nama_kabel' => $o->kabelOdc->nama_kabel,
                    'tipe_kabel' => $o->kabelOdc->tipe_kabel,
                    'panjang_kabel' => $o->kabelOdc->panjang_kabel,
                    'jumlah_tube' => $o->kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $o->kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $o->kabelOdc->jumlah_total_core,
                    'status' => $o->kabelOdc->status,
                    'created_at' => $o->kabelOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->kabelOdc->deleted_at?->toDateTimeString(),
                ] : null,
                'connected_odc' => $o->connectedOdc ? [
                    'id' => $o->connectedOdc->id,
                    'nama_odc' => $o->connectedOdc->nama_odc,
                    'tipe_splitter' => $o->connectedOdc->tipe_splitter,
                    'status' => $o->connectedOdc->status,
                    'created_at' => $o->connectedOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->connectedOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->connectedOdc->deleted_at?->toDateTimeString(),
                    'lokasi' => $o->connectedOdc->lokasi ? [
                        'id' => $o->connectedOdc->lokasi->id,
                        'nama_lokasi' => $o->connectedOdc->lokasi->nama_lokasi,
                        'deskripsi' => $o->connectedOdc->lokasi->deskripsi,
                        'latitude' => $o->connectedOdc->lokasi->latitude,
                        'longitude' => $o->connectedOdc->lokasi->longitude,
                        'status' => $o->connectedOdc->lokasi->status,
                    ] : null,
                ] : null,
                'connected_from_odcs' => $o->connectedFromOdcs->map(function ($fromOdc) {
                    return [
                        'id' => $fromOdc->id,
                        'nama_odc' => $fromOdc->nama_odc,
                        'tipe_splitter' => $fromOdc->tipe_splitter,
                        'status' => $fromOdc->status,
                        'created_at' => $fromOdc->created_at?->toDateTimeString(),
                        'updated_at' => $fromOdc->updated_at?->toDateTimeString(),
                        'deleted_at' => $fromOdc->deleted_at?->toDateTimeString(),
                        'lokasi' => $fromOdc->lokasi ? [
                            'id' => $fromOdc->lokasi->id,
                            'nama_lokasi' => $fromOdc->lokasi->nama_lokasi,
                            'deskripsi' => $fromOdc->lokasi->deskripsi,
                            'latitude' => $fromOdc->lokasi->latitude,
                            'longitude' => $fromOdc->lokasi->longitude,
                            'status' => $fromOdc->lokasi->status,
                        ] : null,
                    ];
                })->toArray(),
                'created_at' => $o->created_at->toDateTimeString(),
                'updated_at' => $o->updated_at->toDateTimeString(),
                'deleted_at' => $o->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing ODC by ID (can also change status).
     *
     * PUT/PATCH /api/v1/fo-odcs/{id}
     */
    public function update(Request $request, $id)
    {
        $o = FoOdc::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'lokasi_id' => 'sometimes|exists:fo_lokasis,id',
            'kabel_odc_id' => 'nullable|sometimes|exists:fo_kabel_odcs,id',
            'odc_id' => 'nullable|sometimes|exists:fo_odcs,id',
            'kabel_core_odc_id' => 'nullable|sometimes|exists:fo_kabel_core_odcs,id',
            'nama_odc' => 'sometimes|string|max:255|unique:fo_odcs,nama_odc,' . $id,
            'deskripsi' => 'sometimes|nullable|string|max:255',
            'tipe_splitter' => 'sometimes|in:1:2,1:4,1:8,1:16,1:32,1:64,1:128',
            'status' => 'sometimes|in:active,archived',
        ]);

        $o->update($data);
        $o->refresh()->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.lokasi',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.client',
            'kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps.clientFtth.company',
            'connectedOdc.lokasi',
            'connectedFromOdcs.lokasi'
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $o->id,
                'lokasi_id' => $o->lokasi_id,
                'kabel_odc_id' => $o->kabel_odc_id,
                'odc_id' => $o->odc_id,
                'lokasi' => $o->lokasi ? [
                    'id' => $o->lokasi->id,
                    'nama_lokasi' => $o->lokasi->nama_lokasi,
                    'deskripsi' => $o->lokasi->deskripsi,
                    'latitude' => $o->lokasi->latitude,
                    'longitude' => $o->lokasi->longitude,
                    'status' => $o->lokasi->status,
                    'created_at' => $o->lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $o->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->lokasi->deleted_at?->toDateTimeString(),
                ] : null,
                'nama_odc' => $o->nama_odc,
                'deskripsi' => $o->deskripsi,
                'tipe_splitter' => $o->tipe_splitter,
                'status' => $o->status,
                'kabel_core_odc' => $o->kabelCoreOdc ? [
                    'id' => $o->kabelCoreOdc->id,
                    'warna_core' => $o->kabelCoreOdc->warna_core,
                    'status' => $o->kabelCoreOdc->status,
                    'created_at' => $o->kabelCoreOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->kabelCoreOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->kabelCoreOdc->deleted_at?->toDateTimeString(),
                    'kabel_tube_odc' => $o->kabelCoreOdc->kabelTubeOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->id,
                        'warna_tube' => $o->kabelCoreOdc->kabelTubeOdc->warna_tube,
                    ] : null,
                    'kabel_odc' => $o->kabelCoreOdc->kabelTubeOdc?->kabelOdc ? [
                        'id' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->id,
                        'nama_kabel' => $o->kabelCoreOdc->kabelTubeOdc->kabelOdc->nama_kabel,
                    ] : null,
                ] : null,
                'kabel_odc' => $o->kabelOdc ? [
                    'id' => $o->kabelOdc->id,
                    'nama_kabel' => $o->kabelOdc->nama_kabel,
                    'tipe_kabel' => $o->kabelOdc->tipe_kabel,
                    'panjang_kabel' => $o->kabelOdc->panjang_kabel,
                    'jumlah_tube' => $o->kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $o->kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $o->kabelOdc->jumlah_total_core,
                    'status' => $o->kabelOdc->status,
                    'created_at' => $o->kabelOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->kabelOdc->deleted_at?->toDateTimeString(),
                ] : null,
                'connected_odc' => $o->connectedOdc ? [
                    'id' => $o->connectedOdc->id,
                    'nama_odc' => $o->connectedOdc->nama_odc,
                    'tipe_splitter' => $o->connectedOdc->tipe_splitter,
                    'status' => $o->connectedOdc->status,
                    'created_at' => $o->connectedOdc->created_at?->toDateTimeString(),
                    'updated_at' => $o->connectedOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->connectedOdc->deleted_at?->toDateTimeString(),
                    'lokasi' => $o->connectedOdc->lokasi ? [
                        'id' => $o->connectedOdc->lokasi->id,
                        'nama_lokasi' => $o->connectedOdc->lokasi->nama_lokasi,
                        'deskripsi' => $o->connectedOdc->lokasi->deskripsi,
                        'latitude' => $o->connectedOdc->lokasi->latitude,
                        'longitude' => $o->connectedOdc->lokasi->longitude,
                        'status' => $o->connectedOdc->lokasi->status,
                    ] : null,
                ] : null,
                'connected_from_odcs' => $o->connectedFromOdcs->map(function ($fromOdc) {
                    return [
                        'id' => $fromOdc->id,
                        'nama_odc' => $fromOdc->nama_odc,
                        'tipe_splitter' => $fromOdc->tipe_splitter,
                        'status' => $fromOdc->status,
                        'created_at' => $fromOdc->created_at?->toDateTimeString(),
                        'updated_at' => $fromOdc->updated_at?->toDateTimeString(),
                        'deleted_at' => $fromOdc->deleted_at?->toDateTimeString(),
                        'lokasi' => $fromOdc->lokasi ? [
                            'id' => $fromOdc->lokasi->id,
                            'nama_lokasi' => $fromOdc->lokasi->nama_lokasi,
                            'deskripsi' => $fromOdc->lokasi->deskripsi,
                            'latitude' => $fromOdc->lokasi->latitude,
                            'longitude' => $fromOdc->lokasi->longitude,
                            'status' => $fromOdc->lokasi->status,
                        ] : null,
                    ];
                })->toArray(),
                'created_at' => $o->created_at->toDateTimeString(),
                'updated_at' => $o->updated_at->toDateTimeString(),
            ],
            'message' => 'ODC updated.',
        ], 200);
    }

    /**
     * Soft‐delete an ODC by ID.
     *
     * DELETE /api/v1/fo-odcs/{id}
     */
    public function destroy($id)
    {
        $o = FoOdc::findOrFail($id);
        $o->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'ODC soft-deleted.',
        ], 200);
    }

    /**
     * Archive an ODC (set status = "archived").
     *
     * PATCH /api/v1/fo-odcs/{id}/archive
     */
    public function archive($id)
    {
        $o = FoOdc::withTrashed()->findOrFail($id);
        $o->update(['status' => 'archived']);

        return response()->json([
            'status' => 'success',
            'message' => 'ODC archived.',
        ], 200);
    }

    /**
     * Unarchive an ODC (set status = "active").
     *
     * PATCH /api/v1/fo-odcs/{id}/unarchive
     */
    public function unarchive($id)
    {
        $o = FoOdc::withTrashed()->findOrFail($id);
        $o->update(['status' => 'active']);

        return response()->json([
            'status' => 'success',
            'message' => 'ODC set to active.',
        ], 200);
    }

    /**
     * Restore a soft‐deleted ODC (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-odcs/{id}/restore
     */
    public function restore($id)
    {
        $o = FoOdc::onlyTrashed()->findOrFail($id);
        $o->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'ODC restored from deletion.',
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
            'action' => 'required|in:archive,delete,restore',
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
                // Loop and call restore() for trashed, or cascadeUnarchive for archived
                foreach ($ids as $id) {
                    $model = $this->model::withTrashed()->find($id);
                    if ($model) {
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
                break;

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
