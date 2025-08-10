<?php

namespace App\Http\Controllers;

use App\Models\FoJointBox;
use Illuminate\Http\Request;

class FoJointBoxController extends Controller
{
    protected $model = FoJointBox::class;

    /**
     * List all Joint Box entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-joint-boxes
     *
     * Query string parameters (all optional):
     *   • page (int)
     *   • per_page (int)
     *   • filter (string)      // partial match on nama_joint_box
     *   • sort (string)        // format "column|asc" or "column|dsc"
     *   • status (string)      // comma-separated: "active,archived,deleted"
     */
    public function index(Request $request)
    {
        // 1) Parse 'status' parameter into an array
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

        // 2) Base query including soft-deleted rows
        $query = FoJointBox::withTrashed();

        // 3) Filter by status
        $query->where(function ($q) use ($statuses) {
            // a) include soft-deleted if 'deleted' requested
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

        // 4) Optional text filtering on nama_joint_box
        if ($request->filled('filter')) {
            $term = $request->query('filter');
            $query->where('nama_joint_box', 'LIKE', "%{$term}%");
        }

        // 5) Optional sorting: "column|asc" or "column|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = [
                'id',
                'nama_joint_box',
                'created_at',
                'updated_at',
                'status',
            ];
            if (in_array($column, $allowedSorts, true)) {
                $query->orderBy($column, $dir);
            }
        } else {
            // Default: newest first by id
            $query->orderBy('id', 'desc');
        }

        // 6) Pagination (default 15 per page)
        $perPage = max(1, (int) $request->query('per_page', 15));

        // 7) Eager-load relationships and paginate
        $paginator = $query
            ->with(['lokasi', 'kabelOdc.kabelTubeOdcs.kabelCoreOdcs', 'odc.lokasi', 'odc2.lokasi', 'odp.lokasi'])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform each FoJointBox into JSON structure
        $items = array_map(function ($j) {
            return [
                'id' => $j->id,
                'nama_joint_box' => $j->nama_joint_box,
                'deskripsi' => $j->deskripsi,
                'odc_id' => $j->odc_id,
                'odc_2_id' => $j->odc_2_id,
                'odp_id' => $j->odp_id,
                'lokasi' => $j->lokasi ? [
                    'id' => $j->lokasi->id,
                    'nama_lokasi' => $j->lokasi->nama_lokasi,
                    'deskripsi' => $j->lokasi->deskripsi,
                    'latitude' => $j->lokasi->latitude,
                    'longitude' => $j->lokasi->longitude,
                    'status' => $j->lokasi->status,
                    'created_at' => $j->lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $j->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->lokasi->deleted_at?->toDateTimeString(),
                ] : null,
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
                ] : null,
                'odc' => $j->odc ? [
                    'id' => $j->odc->id,
                    'nama_odc' => $j->odc->nama_odc,
                    'tipe_splitter' => $j->odc->tipe_splitter,
                    'status' => $j->odc->status,
                    'created_at' => $j->odc->created_at?->toDateTimeString(),
                    'updated_at' => $j->odc->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->odc->deleted_at?->toDateTimeString(),
                    'lokasi' => $j->odc->lokasi ? [
                        'id' => $j->odc->lokasi->id,
                        'nama_lokasi' => $j->odc->lokasi->nama_lokasi,
                        'deskripsi' => $j->odc->lokasi->deskripsi,
                        'latitude' => $j->odc->lokasi->latitude,
                        'longitude' => $j->odc->lokasi->longitude,
                        'status' => $j->odc->lokasi->status,
                    ] : null,
                ] : null,
                'odc2' => $j->odc2 ? [
                    'id' => $j->odc2->id,
                    'nama_odc' => $j->odc2->nama_odc,
                    'tipe_splitter' => $j->odc2->tipe_splitter,
                    'status' => $j->odc2->status,
                    'created_at' => $j->odc2->created_at?->toDateTimeString(),
                    'updated_at' => $j->odc2->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->odc2->deleted_at?->toDateTimeString(),
                    'lokasi' => $j->odc2->lokasi ? [
                        'id' => $j->odc2->lokasi->id,
                        'nama_lokasi' => $j->odc2->lokasi->nama_lokasi,
                        'deskripsi' => $j->odc2->lokasi->deskripsi,
                        'latitude' => $j->odc2->lokasi->latitude,
                        'longitude' => $j->odc2->lokasi->longitude,
                        'status' => $j->odc2->lokasi->status,
                    ] : null,
                ] : null,
                'odp' => $j->odp ? [
                    'id' => $j->odp->id,
                    'nama_odp' => $j->odp->nama_odp,
                    'deskripsi' => $j->odp->deskripsi,
                    'status' => $j->odp->status,
                    'created_at' => $j->odp->created_at?->toDateTimeString(),
                    'updated_at' => $j->odp->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->odp->deleted_at?->toDateTimeString(),
                    'lokasi' => $j->odp->lokasi ? [
                        'id' => $j->odp->lokasi->id,
                        'nama_lokasi' => $j->odp->lokasi->nama_lokasi,
                        'deskripsi' => $j->odp->lokasi->deskripsi,
                        'latitude' => $j->odp->lokasi->latitude,
                        'longitude' => $j->odp->lokasi->longitude,
                        'status' => $j->odp->lokasi->status,
                    ] : null,
                ] : null,
                'status' => $j->status,
                'created_at' => $j->created_at?->toDateTimeString(),
                'updated_at' => $j->updated_at?->toDateTimeString(),
                'deleted_at' => $j->deleted_at?->toDateTimeString(),
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
     * Create a new Joint Box (default status = active).
     *
     * POST /api/v1/fo-joint-boxes
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'lokasi_id' => 'required|exists:fo_lokasis,id',
            'kabel_odc_id' => 'required|exists:fo_kabel_odcs,id',
            'odc_id' => 'nullable|exists:fo_odcs,id',
            'odc_2_id' => 'nullable|exists:fo_odcs,id',
            'odp_id' => 'nullable|exists:fo_odps,id',
            'nama_joint_box' => 'required|string|max:255|unique:fo_joint_boxes,nama_joint_box',
            'deskripsi' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,archived',
        ]);

        // Validate that we have either ODC→ODC connection or ODC→ODP connection, but not both
        if (isset($data['odc_2_id']) && isset($data['odp_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Joint box cannot connect both ODC→ODC and ODC→ODP simultaneously.',
                'errors' => [
                    'odc_2_id' => ['Cannot have both ODC→ODC and ODC→ODP connections.'],
                    'odp_id' => ['Cannot have both ODC→ODC and ODC→ODP connections.'],
                ],
            ], 422);
        }

        // Validate that for ODC→ODC, we need both odc_id and odc_2_id
        if (isset($data['odc_2_id']) && !isset($data['odc_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'For ODC→ODC connections, both odc_id and odc_2_id are required.',
                'errors' => [
                    'odc_id' => ['Required when odc_2_id is specified.'],
                ],
            ], 422);
        }

        // Validate that for ODC→ODP, we need odc_id but not odc_2_id
        if (isset($data['odp_id']) && !isset($data['odc_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'For ODC→ODP connections, odc_id is required.',
                'errors' => [
                    'odc_id' => ['Required when odp_id is specified.'],
                ],
            ], 422);
        }

        $data['status'] = $data['status'] ?? 'active';

        // 1) Create
        $j = FoJointBox::create($data);

        // 2) Eager‑load the relationships
        $j->load(['lokasi', 'kabelOdc.kabelTubeOdcs.kabelCoreOdcs', 'odc.lokasi', 'odc2.lokasi', 'odp.lokasi']);

        // 3) Build the response
        $responseData = [
            'id' => $j->id,
            'nama_joint_box' => $j->nama_joint_box,
            'deskripsi' => $j->deskripsi,
            'odc_id' => $j->odc_id,
            'odc_2_id' => $j->odc_2_id,
            'odp_id' => $j->odp_id,
            'lokasi' => $j->lokasi ? [
                'id' => $j->lokasi->id,
                'nama_lokasi' => $j->lokasi->nama_lokasi,
                'deskripsi' => $j->lokasi->deskripsi,
                'latitude' => $j->lokasi->latitude,
                'longitude' => $j->lokasi->longitude,
                'status' => $j->lokasi->status,
                'created_at' => $j->lokasi->created_at?->toDateTimeString(),
                'updated_at' => $j->lokasi->updated_at?->toDateTimeString(),
                'deleted_at' => $j->lokasi->deleted_at?->toDateTimeString(),
            ] : null,
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
            ] : null,
            'odc' => $j->odc ? [
                'id' => $j->odc->id,
                'nama_odc' => $j->odc->nama_odc,
                'tipe_splitter' => $j->odc->tipe_splitter,
                'status' => $j->odc->status,
                'created_at' => $j->odc->created_at?->toDateTimeString(),
                'updated_at' => $j->odc->updated_at?->toDateTimeString(),
                'deleted_at' => $j->odc->deleted_at?->toDateTimeString(),
                'lokasi' => $j->odc->lokasi ? [
                    'id' => $j->odc->lokasi->id,
                    'nama_lokasi' => $j->odc->lokasi->nama_lokasi,
                    'deskripsi' => $j->odc->lokasi->deskripsi,
                    'latitude' => $j->odc->lokasi->latitude,
                    'longitude' => $j->odc->lokasi->longitude,
                    'status' => $j->odc->lokasi->status,
                ] : null,
            ] : null,
            'odc2' => $j->odc2 ? [
                'id' => $j->odc2->id,
                'nama_odc' => $j->odc2->nama_odc,
                'tipe_splitter' => $j->odc2->tipe_splitter,
                'status' => $j->odc2->status,
                'created_at' => $j->odc2->created_at?->toDateTimeString(),
                'updated_at' => $j->odc2->updated_at?->toDateTimeString(),
                'deleted_at' => $j->odc2->deleted_at?->toDateTimeString(),
                'lokasi' => $j->odc2->lokasi ? [
                    'id' => $j->odc2->lokasi->id,
                    'nama_lokasi' => $j->odc2->lokasi->nama_lokasi,
                    'deskripsi' => $j->odc2->lokasi->deskripsi,
                    'latitude' => $j->odc2->lokasi->latitude,
                    'longitude' => $j->odc2->lokasi->longitude,
                    'status' => $j->odc2->lokasi->status,
                ] : null,
            ] : null,
            'odp' => $j->odp ? [
                'id' => $j->odp->id,
                'nama_odp' => $j->odp->nama_odp,
                'deskripsi' => $j->odp->deskripsi,
                'status' => $j->odp->status,
                'created_at' => $j->odp->created_at?->toDateTimeString(),
                'updated_at' => $j->odp->updated_at?->toDateTimeString(),
                'deleted_at' => $j->odp->deleted_at?->toDateTimeString(),
                'lokasi' => $j->odp->lokasi ? [
                    'id' => $j->odp->lokasi->id,
                    'nama_lokasi' => $j->odp->lokasi->nama_lokasi,
                    'deskripsi' => $j->odp->lokasi->deskripsi,
                    'latitude' => $j->odp->lokasi->latitude,
                    'longitude' => $j->odp->lokasi->longitude,
                    'status' => $j->odp->lokasi->status,
                ] : null,
            ] : null,
            'status' => $j->status,
            'created_at' => $j->created_at?->toDateTimeString(),
            'updated_at' => $j->updated_at?->toDateTimeString(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $responseData,
            'message' => 'Joint Box created.',
        ], 201);
    }

    /**
     * Show a single Joint Box by ID (including soft-deleted).
     *
     * GET /api/v1/fo-joint-boxes/{id}
     */
    public function show($id)
    {
        $j = FoJointBox::withTrashed()->findOrFail($id);
        $j->load(['lokasi', 'kabelOdc.kabelTubeOdcs.kabelCoreOdcs', 'odc.lokasi', 'odc2.lokasi', 'odp.lokasi']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $j->id,
                'nama_joint_box' => $j->nama_joint_box,
                'deskripsi' => $j->deskripsi,
                'odc_id' => $j->odc_id,
                'odc_2_id' => $j->odc_2_id,
                'odp_id' => $j->odp_id,
                'lokasi' => $j->lokasi ? [
                    'id' => $j->lokasi->id,
                    'nama_lokasi' => $j->lokasi->nama_lokasi,
                    'deskripsi' => $j->lokasi->deskripsi,
                    'latitude' => $j->lokasi->latitude,
                    'longitude' => $j->lokasi->longitude,
                    'status' => $j->lokasi->status,
                    'created_at' => $j->lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $j->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->lokasi->deleted_at?->toDateTimeString(),
                ] : null,
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
                ] : null,
                'odc' => $j->odc ? [
                    'id' => $j->odc->id,
                    'nama_odc' => $j->odc->nama_odc,
                    'tipe_splitter' => $j->odc->tipe_splitter,
                    'status' => $j->odc->status,
                    'created_at' => $j->odc->created_at?->toDateTimeString(),
                    'updated_at' => $j->odc->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->odc->deleted_at?->toDateTimeString(),
                    'lokasi' => $j->odc->lokasi ? [
                        'id' => $j->odc->lokasi->id,
                        'nama_lokasi' => $j->odc->lokasi->nama_lokasi,
                        'deskripsi' => $j->odc->lokasi->deskripsi,
                        'latitude' => $j->odc->lokasi->latitude,
                        'longitude' => $j->odc->lokasi->longitude,
                        'status' => $j->odc->lokasi->status,
                    ] : null,
                ] : null,
                'odc2' => $j->odc2 ? [
                    'id' => $j->odc2->id,
                    'nama_odc' => $j->odc2->nama_odc,
                    'tipe_splitter' => $j->odc2->tipe_splitter,
                    'status' => $j->odc2->status,
                    'created_at' => $j->odc2->created_at?->toDateTimeString(),
                    'updated_at' => $j->odc2->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->odc2->deleted_at?->toDateTimeString(),
                    'lokasi' => $j->odc2->lokasi ? [
                        'id' => $j->odc2->lokasi->id,
                        'nama_lokasi' => $j->odc2->lokasi->nama_lokasi,
                        'deskripsi' => $j->odc2->lokasi->deskripsi,
                        'latitude' => $j->odc2->lokasi->latitude,
                        'longitude' => $j->odc2->lokasi->longitude,
                        'status' => $j->odc2->lokasi->status,
                    ] : null,
                ] : null,
                'odp' => $j->odp ? [
                    'id' => $j->odp->id,
                    'nama_odp' => $j->odp->nama_odp,
                    'deskripsi' => $j->odp->deskripsi,
                    'status' => $j->odp->status,
                    'created_at' => $j->odp->created_at?->toDateTimeString(),
                    'updated_at' => $j->odp->updated_at?->toDateTimeString(),
                    'deleted_at' => $j->odp->deleted_at?->toDateTimeString(),
                    'lokasi' => $j->odp->lokasi ? [
                        'id' => $j->odp->lokasi->id,
                        'nama_lokasi' => $j->odp->lokasi->nama_lokasi,
                        'deskripsi' => $j->odp->lokasi->deskripsi,
                        'latitude' => $j->odp->lokasi->latitude,
                        'longitude' => $j->odp->lokasi->longitude,
                        'status' => $j->odp->lokasi->status,
                    ] : null,
                ] : null,
                'status' => $j->status,
                'created_at' => $j->created_at?->toDateTimeString(),
                'updated_at' => $j->updated_at?->toDateTimeString(),
                'deleted_at' => $j->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing Joint Box by ID.
     *
     * PUT/PATCH /api/v1/fo-joint-boxes/{id}
     */
    public function update(Request $request, $id)
    {
        $jointBox = FoJointBox::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'lokasi_id' => 'sometimes|exists:fo_lokasis,id',
            'kabel_odc_id' => 'sometimes|exists:fo_kabel_odcs,id',
            'odc_id' => 'nullable|sometimes|exists:fo_odcs,id',
            'odc_2_id' => 'nullable|sometimes|exists:fo_odcs,id',
            'odp_id' => 'nullable|sometimes|exists:fo_odps,id',
            'nama_joint_box' => 'sometimes|string|max:255|unique:fo_joint_boxes,nama_joint_box,' . $id,
            'deskripsi' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|in:active,archived',
        ]);

        // Validate that we have either ODC→ODC connection or ODC→ODP connection, but not both
        if (isset($data['odc_2_id']) && isset($data['odp_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Joint box cannot connect both ODC→ODC and ODC→ODP simultaneously.',
                'errors' => [
                    'odc_2_id' => ['Cannot have both ODC→ODC and ODC→ODP connections.'],
                    'odp_id' => ['Cannot have both ODC→ODC and ODC→ODP connections.'],
                ],
            ], 422);
        }

        // Validate that for ODC→ODC, we need both odc_id and odc_2_id
        if (isset($data['odc_2_id']) && !isset($data['odc_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'For ODC→ODC connections, both odc_id and odc_2_id are required.',
                'errors' => [
                    'odc_id' => ['Required when odc_2_id is specified.'],
                ],
            ], 422);
        }

        // Validate that for ODC→ODP, we need odc_id but not odc_2_id
        if (isset($data['odp_id']) && !isset($data['odc_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'For ODC→ODP connections, odc_id is required.',
                'errors' => [
                    'odc_id' => ['Required when odp_id is specified.'],
                ],
            ], 422);
        }

        // Perform update
        $jointBox->update($data);

        // Reload nested relations
        $jointBox->refresh()->load(['lokasi', 'kabelOdc.kabelTubeOdcs.kabelCoreOdcs', 'odc.lokasi', 'odc2.lokasi', 'odp.lokasi']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $jointBox->id,
                'nama_joint_box' => $jointBox->nama_joint_box,
                'deskripsi' => $jointBox->deskripsi,
                'odc_id' => $jointBox->odc_id,
                'odc_2_id' => $jointBox->odc_2_id,
                'odp_id' => $jointBox->odp_id,
                'lokasi' => $jointBox->lokasi ? [
                    'id' => $jointBox->lokasi->id,
                    'nama_lokasi' => $jointBox->lokasi->nama_lokasi,
                    'deskripsi' => $jointBox->lokasi->deskripsi,
                    'latitude' => $jointBox->lokasi->latitude,
                    'longitude' => $jointBox->lokasi->longitude,
                    'status' => $jointBox->lokasi->status,
                    'created_at' => $jointBox->lokasi->created_at?->toDateTimeString(),
                    'updated_at' => $jointBox->lokasi->updated_at?->toDateTimeString(),
                    'deleted_at' => $jointBox->lokasi->deleted_at?->toDateTimeString(),
                ] : null,
                'kabel_odc' => $jointBox->kabelOdc ? [
                    'id' => $jointBox->kabelOdc->id,
                    'nama_kabel' => $jointBox->kabelOdc->nama_kabel,
                    'tipe_kabel' => $jointBox->kabelOdc->tipe_kabel,
                    'panjang_kabel' => $jointBox->kabelOdc->panjang_kabel,
                    'jumlah_tube' => $jointBox->kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $jointBox->kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $jointBox->kabelOdc->jumlah_total_core,
                    'status' => $jointBox->kabelOdc->status,
                    'created_at' => $jointBox->kabelOdc->created_at?->toDateTimeString(),
                    'updated_at' => $jointBox->kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $jointBox->kabelOdc->deleted_at?->toDateTimeString(),
                ] : null,
                'odc' => $jointBox->odc ? [
                    'id' => $jointBox->odc->id,
                    'nama_odc' => $jointBox->odc->nama_odc,
                    'tipe_splitter' => $jointBox->odc->tipe_splitter,
                    'status' => $jointBox->odc->status,
                    'created_at' => $jointBox->odc->created_at?->toDateTimeString(),
                    'updated_at' => $jointBox->odc->updated_at?->toDateTimeString(),
                    'deleted_at' => $jointBox->odc->deleted_at?->toDateTimeString(),
                    'lokasi' => $jointBox->odc->lokasi ? [
                        'id' => $jointBox->odc->lokasi->id,
                        'nama_lokasi' => $jointBox->odc->lokasi->nama_lokasi,
                        'deskripsi' => $jointBox->odc->lokasi->deskripsi,
                        'latitude' => $jointBox->odc->lokasi->latitude,
                        'longitude' => $jointBox->odc->lokasi->longitude,
                        'status' => $jointBox->odc->lokasi->status,
                    ] : null,
                ] : null,
                'odc2' => $jointBox->odc2 ? [
                    'id' => $jointBox->odc2->id,
                    'nama_odc' => $jointBox->odc2->nama_odc,
                    'tipe_splitter' => $jointBox->odc2->tipe_splitter,
                    'status' => $jointBox->odc2->status,
                    'created_at' => $jointBox->odc2->created_at?->toDateTimeString(),
                    'updated_at' => $jointBox->odc2->updated_at?->toDateTimeString(),
                    'deleted_at' => $jointBox->odc2->deleted_at?->toDateTimeString(),
                    'lokasi' => $jointBox->odc2->lokasi ? [
                        'id' => $jointBox->odc2->lokasi->id,
                        'nama_lokasi' => $jointBox->odc2->lokasi->nama_lokasi,
                        'deskripsi' => $jointBox->odc2->lokasi->deskripsi,
                        'latitude' => $jointBox->odc2->lokasi->latitude,
                        'longitude' => $jointBox->odc2->lokasi->longitude,
                        'status' => $jointBox->odc2->lokasi->status,
                    ] : null,
                ] : null,
                'odp' => $jointBox->odp ? [
                    'id' => $jointBox->odp->id,
                    'nama_odp' => $jointBox->odp->nama_odp,
                    'deskripsi' => $jointBox->odp->deskripsi,
                    'status' => $jointBox->odp->status,
                    'created_at' => $jointBox->odp->created_at?->toDateTimeString(),
                    'updated_at' => $jointBox->odp->updated_at?->toDateTimeString(),
                    'deleted_at' => $jointBox->odp->deleted_at?->toDateTimeString(),
                    'lokasi' => $jointBox->odp->lokasi ? [
                        'id' => $jointBox->odp->lokasi->id,
                        'nama_lokasi' => $jointBox->odp->lokasi->nama_lokasi,
                        'deskripsi' => $jointBox->odp->lokasi->deskripsi,
                        'latitude' => $jointBox->odp->lokasi->latitude,
                        'longitude' => $jointBox->odp->lokasi->longitude,
                        'status' => $jointBox->odp->lokasi->status,
                    ] : null,
                ] : null,
                'status' => $jointBox->status,
                'created_at' => $jointBox->created_at?->toDateTimeString(),
                'updated_at' => $jointBox->updated_at?->toDateTimeString(),
            ],
            'message' => 'Joint Box updated successfully.',
        ], 200);
    }

    /**
     * Soft‐delete a Joint Box by ID.
     *
     * DELETE /api/v1/fo-joint-boxes/{id}
     */
    public function destroy($id)
    {
        $j = FoJointBox::findOrFail($id);
        $j->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Joint Box soft-deleted.',
        ], 200);
    }

    /**
     * Archive a Joint Box (set status = "archived").
     *
     * PATCH /api/v1/fo-joint-boxes/{id}/archive
     */
    public function archive($id)
    {
        $j = FoJointBox::withTrashed()->findOrFail($id);
        $j->update(['status' => 'archived']);

        return response()->json([
            'status' => 'success',
            'message' => 'Joint Box archived.',
        ], 200);
    }

    /**
     * Unarchive a Joint Box (set status = "active").
     *
     * PATCH /api/v1/fo-joint-boxes/{id}/unarchive
     */
    public function unarchive($id)
    {
        $j = FoJointBox::withTrashed()->findOrFail($id);
        $j->update(['status' => 'active']);

        return response()->json([
            'status' => 'success',
            'message' => 'Joint Box set to active.',
        ], 200);
    }

    /**
     * Restore a soft‐deleted Joint Box (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-joint-boxes/{id}/restore
     */
    public function restore($id)
    {
        $j = FoJointBox::onlyTrashed()->findOrFail($id);
        $j->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'Joint Box restored from deletion.',
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
                // Set status = 'archived'
                $this->model::withTrashed()
                    ->whereIn('id', $ids)
                    ->update(['status' => 'archived']);
                $message = 'Items archived.';
                break;

            case 'delete':
                // Soft‐delete all (mark deleted_at)
                $this->model::whereIn('id', $ids)->delete();
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
