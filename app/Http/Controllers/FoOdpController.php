<?php

namespace App\Http\Controllers;

use App\Models\FoOdp;
use Illuminate\Http\Request;

class FoOdpController extends Controller
{
    protected $model = FoOdp::class;
    /**
     * List all ODP entries with pagination, filtering, sorting, and status.
     *
     * GET /api/v1/fo-odps
     *
     * Query string parameters (all optional):
     *   • page (int)
     *   • per_page (int)
     *   • filter (string)      // partial match on nama_odp
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
        $query = FoOdp::withTrashed();

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

        // 4) Optional text filtering on nama_odp or related kabelCoreOdc (and even its tube)
        if ($request->filled('filter')) {
            $term = $request->query('filter');

            $query->where(function ($q) use ($term) {
                // a) match on the ODP name
                $q->where('nama_odp', 'LIKE', "%{$term}%")
                    // b) or on the core's own warna_core
                    ->orWhereHas('kabelCoreOdc', function ($q2) use ($term) {
                        $q2->where('warna_core', 'LIKE', "%{$term}%")
                            // c) optionally also on the parent tube's warna_tube
                            ->orWhereHas('kabelTubeOdc', function ($q3) use ($term) {
                                $q3->where('warna_tube', 'LIKE', "%{$term}%");
                            });
                    });
            });
        }


        // 5) Optional sorting: "column|asc" or "column|dsc"
        if ($request->filled('sort')) {
            [$column, $dir] = array_pad(explode('|', $request->query('sort')), 2, null);
            $dir = (strtolower($dir) === 'dsc') ? 'desc' : 'asc';

            $allowedSorts = [
                'id',
                'nama_odp',
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
            ->with([
                'lokasi',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.lokasi',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.lokasi',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.client',
                'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.company',
                'clientFtth.lokasi',
                'clientFtth.client',
                'clientFtth.company'
            ])
            ->paginate($perPage)
            ->appends($request->only(['filter', 'sort', 'per_page', 'status']));

        // 8) Transform each FoOdp into JSON structure
        $items = array_map(function ($o) {
            $core = $o->kabelCoreOdc;
            $tube = $core?->kabelTubeOdc;
            $kabelOdc = $tube?->kabelOdc;
            $odcs = $kabelOdc?->odcs ?? collect();
            $firstOdc = $odcs->first();
            return [
                'id' => $o->id,
                'nama_odp' => $o->nama_odp,
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
                'kabel_core_odc' => $core ? [
                    'id' => $core->id,
                    'warna_core' => $core->warna_core,
                    'status' => $core->status,
                    'created_at' => $core->created_at?->toDateTimeString(),
                    'updated_at' => $core->updated_at?->toDateTimeString(),
                    'deleted_at' => $core->deleted_at?->toDateTimeString(),
                    'kabel_tube_odc' => $tube ? [
                        'id' => $tube->id,
                        'warna_tube' => $tube->warna_tube,
                        'status' => $tube->status,
                        'created_at' => $tube->created_at?->toDateTimeString(),
                        'updated_at' => $tube->updated_at?->toDateTimeString(),
                        'deleted_at' => $tube->deleted_at?->toDateTimeString(),
                    ] : null,
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
                ] : null,
                // Show the first ODC for this KabelOdc (if any)
                'odc' => $firstOdc ? [
                    'id' => $firstOdc->id,
                    'nama_odc' => $firstOdc->nama_odc,
                    'tipe_splitter' => $firstOdc->tipe_splitter ?? null,
                    'status' => $firstOdc->status ?? null,
                    'created_at' => $firstOdc->created_at?->toDateTimeString(),
                    'updated_at' => $firstOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $firstOdc->deleted_at?->toDateTimeString(),
                    'lokasi' => $firstOdc->lokasi ? [
                        'id' => $firstOdc->lokasi->id,
                        'nama_lokasi' => $firstOdc->lokasi->nama_lokasi,
                        'deskripsi' => $firstOdc->lokasi->deskripsi,
                        'latitude' => $firstOdc->lokasi->latitude,
                        'longitude' => $firstOdc->lokasi->longitude,
                        'status' => $firstOdc->lokasi->status,
                    ] : null,
                    'kabel_odc' => $firstOdc->kabelOdc ? [
                        'id' => $firstOdc->kabelOdc->id,
                        'nama_kabel' => $firstOdc->kabelOdc->nama_kabel,
                        'tipe_kabel' => $firstOdc->kabelOdc->tipe_kabel,
                        'panjang_kabel' => $firstOdc->kabelOdc->panjang_kabel,
                        'jumlah_tube' => $firstOdc->kabelOdc->jumlah_tube,
                        'jumlah_core_in_tube' => $firstOdc->kabelOdc->jumlah_core_in_tube,
                        'jumlah_total_core' => $firstOdc->kabelOdc->jumlah_total_core,
                        'status' => $firstOdc->kabelOdc->status,
                        'created_at' => $firstOdc->kabelOdc->created_at?->toDateTimeString(),
                        'updated_at' => $firstOdc->kabelOdc->updated_at?->toDateTimeString(),
                        'deleted_at' => $firstOdc->kabelOdc->deleted_at?->toDateTimeString(),
                    ] : null,
                ] : null,
                'client_ftth' => $o->clientFtth ? [
                    'id' => $o->clientFtth->id,
                    'nama_client' => $o->clientFtth->nama_client,
                    'alamat' => $o->clientFtth->alamat,
                    'status' => $o->clientFtth->status,
                    'created_at' => $o->clientFtth->created_at?->toDateTimeString(),
                    'updated_at' => $o->clientFtth->updated_at?->toDateTimeString(),
                    'deleted_at' => $o->clientFtth->deleted_at?->toDateTimeString(),
                    'lokasi' => $o->clientFtth->lokasi ? [
                        'id' => $o->clientFtth->lokasi->id,
                        'nama_lokasi' => $o->clientFtth->lokasi->nama_lokasi,
                        'deskripsi' => $o->clientFtth->lokasi->deskripsi,
                        'latitude' => $o->clientFtth->lokasi->latitude,
                        'longitude' => $o->clientFtth->lokasi->longitude,
                        'status' => $o->clientFtth->lokasi->status,
                    ] : null,
                    'client' => $o->clientFtth->client ? [
                        'id' => $o->clientFtth->client->id,
                        'name' => $o->clientFtth->client->name,
                        'phone' => $o->clientFtth->client->phone,
                        'email' => $o->clientFtth->client->email,
                        'address1' => $o->clientFtth->client->address1,
                        'address2' => $o->clientFtth->client->address2,
                        'city' => $o->clientFtth->client->city,
                        'state' => $o->clientFtth->client->state,
                        'postal_code' => $o->clientFtth->client->postal_code,
                        'country_id' => $o->clientFtth->client->country_id,
                        'status_id' => $o->clientFtth->client->status_id,
                    ] : null,
                    'company' => $o->clientFtth->company ? [
                        'id' => $o->clientFtth->company->id,
                        'name' => $o->clientFtth->company->name,
                    ] : null,
                ] : null,
                'status' => $o->status,
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
     * Create a new ODP (default status = active).
     *
     * POST /api/v1/fo-odps
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'lokasi_id' => 'required|exists:fo_lokasis,id',
            'kabel_core_odc_id' => 'nullable|exists:fo_kabel_core_odcs,id',
            'nama_odp' => 'required|string|max:255|unique:fo_odps,nama_odp',
            'status' => 'sometimes|in:active,archived',
        ]);

        // Check if the kabel_core_odc_id already has an associated FoOdp
        if (isset($data['kabel_core_odc_id'])) {
            $exists = FoOdp::where('kabel_core_odc_id', $data['kabel_core_odc_id'])->exists();
            if ($exists) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This core is already associated with another ODP.',
                    'errors' => [
                        'kabel_core_odc_id' => ['This core is already associated with another ODP.'],
                    ],
                ], 422);
            }
        }

        $data['status'] = $data['status'] ?? 'active';

        // 1) Create
        $o = FoOdp::create($data);

        // 2) Eager‑load the full chain: Lokasi, Core→Tube→ODC, and clientFtth
        $o->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.client',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs.kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odp.clientFtth.company',
            'clientFtth.lokasi',
            'clientFtth.client',
            'clientFtth.company'
        ]);

        // 3) Build the response exactly like in update()
        // Build same mapping as index
        $core = $o->kabelCoreOdc;
        $tube = $core?->kabelTubeOdc;
        $kabelOdc = $tube?->kabelOdc;
        $odcs = $kabelOdc?->odcs ?? collect();
        $firstOdc = $odcs->first();

        $responseData = [
            'id' => $o->id,
            'nama_odp' => $o->nama_odp,
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

            'kabel_core_odc' => $core ? [
                'id' => $core->id,
                'warna_core' => $core->warna_core,
                'status' => $core->status,
                'created_at' => $core->created_at?->toDateTimeString(),
                'updated_at' => $core->updated_at?->toDateTimeString(),
                'deleted_at' => $core->deleted_at?->toDateTimeString(),
                'kabel_tube_odc' => $tube ? [
                    'id' => $tube->id,
                    'warna_tube' => $tube->warna_tube,
                    'status' => $tube->status,
                    'created_at' => $tube->created_at?->toDateTimeString(),
                    'updated_at' => $tube->updated_at?->toDateTimeString(),
                    'deleted_at' => $tube->deleted_at?->toDateTimeString(),
                ] : null,
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
            ] : null,

            // Show the first ODC for this KabelOdc (if any)
            'odc' => $firstOdc ? [
                'id' => $firstOdc->id,
                'nama_odc' => $firstOdc->nama_odc,
                'tipe_splitter' => $firstOdc->tipe_splitter,
                'status' => $firstOdc->status,
                'created_at' => $firstOdc->created_at?->toDateTimeString(),
                'updated_at' => $firstOdc->updated_at?->toDateTimeString(),
                'deleted_at' => $firstOdc->deleted_at?->toDateTimeString(),
                'lokasi' => $firstOdc->lokasi ? [
                    'id' => $firstOdc->lokasi->id,
                    'nama_lokasi' => $firstOdc->lokasi->nama_lokasi,
                    'deskripsi' => $firstOdc->lokasi->deskripsi,
                    'latitude' => $firstOdc->lokasi->latitude,
                    'longitude' => $firstOdc->lokasi->longitude,
                    'status' => $firstOdc->lokasi->status,
                ] : null,
                'kabel_odc' => $firstOdc->kabelOdc ? [
                    'id' => $firstOdc->kabelOdc->id,
                    'nama_kabel' => $firstOdc->kabelOdc->nama_kabel,
                    'tipe_kabel' => $firstOdc->kabelOdc->tipe_kabel,
                    'panjang_kabel' => $firstOdc->kabelOdc->panjang_kabel,
                    'jumlah_tube' => $firstOdc->kabelOdc->jumlah_tube,
                    'jumlah_core_in_tube' => $firstOdc->kabelOdc->jumlah_core_in_tube,
                    'jumlah_total_core' => $firstOdc->kabelOdc->jumlah_total_core,
                    'status' => $firstOdc->kabelOdc->status,
                    'created_at' => $firstOdc->kabelOdc->created_at?->toDateTimeString(),
                    'updated_at' => $firstOdc->kabelOdc->updated_at?->toDateTimeString(),
                    'deleted_at' => $firstOdc->kabelOdc->deleted_at?->toDateTimeString(),
                ] : null,
            ] : null,

            'client_ftth' => $o->clientFtth ? [
                'id' => $o->clientFtth->id,
                'nama_client' => $o->clientFtth->nama_client,
                'alamat' => $o->clientFtth->alamat,
                'status' => $o->clientFtth->status,
                'created_at' => $o->clientFtth->created_at?->toDateTimeString(),
                'updated_at' => $o->clientFtth->updated_at?->toDateTimeString(),
                'deleted_at' => $o->clientFtth->deleted_at?->toDateTimeString(),
                'lokasi' => $o->clientFtth->lokasi ? [
                    'id' => $o->clientFtth->lokasi->id,
                    'nama_lokasi' => $o->clientFtth->lokasi->nama_lokasi,
                    'deskripsi' => $o->clientFtth->lokasi->deskripsi,
                    'latitude' => $o->clientFtth->lokasi->latitude,
                    'longitude' => $o->clientFtth->lokasi->longitude,
                    'status' => $o->clientFtth->lokasi->status,
                ] : null,
                'client' => $o->clientFtth->client ? [
                    'id' => $o->clientFtth->client->id,
                    'name' => $o->clientFtth->client->name,
                    'phone' => $o->clientFtth->client->phone,
                    'email' => $o->clientFtth->client->email,
                    'address1' => $o->clientFtth->client->address1,
                    'address2' => $o->clientFtth->client->address2,
                    'city' => $o->clientFtth->client->city,
                    'state' => $o->clientFtth->client->state,
                    'postal_code' => $o->clientFtth->client->postal_code,
                    'country_id' => $o->clientFtth->client->country_id,
                    'status_id' => $o->clientFtth->client->status_id,
                ] : null,
                'company' => $o->clientFtth->company ? [
                    'id' => $o->clientFtth->company->id,
                    'name' => $o->clientFtth->company->name,
                ] : null,
            ] : null,

            'status' => $o->status,
            'created_at' => $o->created_at?->toDateTimeString(),
            'updated_at' => $o->updated_at?->toDateTimeString(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $responseData,
            'message' => 'ODP created.',
        ], 201);
    }

    /**
     * Show a single ODP by ID (including soft-deleted).
     *
     * GET /api/v1/fo-odps/{id}
     */
    public function show($id)
    {
        $o = FoOdp::withTrashed()->findOrFail($id);
        $o->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs',
            'clientFtth',
        ]);

        // Null‐safety chain
        $core = $o->kabelCoreOdc;
        $tube = $core?->kabelTubeOdc;
        $kabelOdc = $tube?->kabelOdc;
        $odcs = $kabelOdc?->odcs ?? collect();
        $firstOdc = $odcs->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $o->id,
                'nama_odp' => $o->nama_odp,

                'lokasi' => $o->lokasi ? [
                    'id' => $o->lokasi->id,
                    'nama_lokasi' => $o->lokasi->nama_lokasi,
                ] : null,

                'kabel_core_odc' => $core ? [
                    'id' => $core->id,
                    'warna_core' => $core->warna_core,
                    'kabel_tube_odc' => $tube ? [
                        'id' => $tube->id,
                        'warna_tube' => $tube->warna_tube,
                    ] : null,
                    'kabel_odc' => $kabelOdc ? [
                        'id' => $kabelOdc->id,
                        'nama_kabel' => $kabelOdc->nama_kabel,
                    ] : null,
                ] : null,

                // Show the first ODC for this KabelOdc (if any)
                'odc' => $firstOdc ? [
                    'id' => $firstOdc->id,
                    'nama_odc' => $firstOdc->nama_odc,
                ] : null,

                'client_ftth' => $o->clientFtth ? [
                    'id' => $o->clientFtth->id,
                    'nama_client' => $o->clientFtth->nama_client,
                    'alamat' => $o->clientFtth->alamat,
                ] : null,

                'status' => $o->status,
                'created_at' => $o->created_at?->toDateTimeString(),
                'updated_at' => $o->updated_at?->toDateTimeString(),
                'deleted_at' => $o->deleted_at?->toDateTimeString(),
            ],
        ], 200);
    }

    /**
     * Update an existing ODP by ID (can also change status and unlink core).
     *
     * PUT/PATCH /api/v1/fo-odps/{id}
     */
    public function update(Request $request, $id)
    {
        $odp = FoOdp::withTrashed()->findOrFail($id);

        $data = $request->validate([
            'lokasi_id' => 'sometimes|exists:fo_lokasis,id',
            'kabel_core_odc_id' => 'nullable|exists:fo_kabel_core_odcs,id',
            'nama_odp' => 'nullable|string|max:255|unique:fo_odps,nama_odp,' . $id,
            'status' => 'sometimes|in:active,archived',
        ]);

        // Check core linkage conflict
        if (array_key_exists('kabel_core_odc_id', $data) && $data['kabel_core_odc_id'] !== null) {
            $conflict = FoOdp::where('kabel_core_odc_id', $data['kabel_core_odc_id'])
                ->where('id', '!=', $odp->id)
                ->exists();

            if ($conflict) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This core is already associated with another ODP.',
                    'errors' => [
                        'kabel_core_odc_id' => ['This core is already associated with another ODP.'],
                    ],
                ], 422);
            }
        }

        // Perform update (allows unlinking if null)
        $odp->update($data);

        // Reload nested relations
        $odp->refresh()->load([
            'lokasi',
            'kabelCoreOdc.kabelTubeOdc.kabelOdc.odcs',
            'clientFtth',
        ]);

        // Safely build JSON, guarding against null relations
        $core = $odp->kabelCoreOdc;
        $tube = $core?->kabelTubeOdc;
        $kabelOdc = $tube?->kabelOdc;
        $odcs = $kabelOdc?->odcs ?? collect();
        $firstOdc = $odcs->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $odp->id,
                'nama_odp' => $odp->nama_odp,
                'lokasi' => $odp->lokasi ? [
                    'id' => $odp->lokasi->id,
                    'nama_lokasi' => $odp->lokasi->nama_lokasi,
                ] : null,

                // core/tube/odc chain
                'kabel_core_odc' => $core ? [
                    'id' => $core->id,
                    'warna_core' => $core->warna_core,
                    'kabel_tube_odc' => $tube ? [
                        'id' => $tube->id,
                        'warna_tube' => $tube->warna_tube,
                    ] : null,
                    'kabel_odc' => $kabelOdc ? [
                        'id' => $kabelOdc->id,
                        'nama_kabel' => $kabelOdc->nama_kabel,
                    ] : null,
                ] : null,

                // top-level ODC via tube -> kabelOdc -> odc
                'odc' => $firstOdc ? [
                    'id' => $firstOdc->id,
                    'nama_odc' => $firstOdc->nama_odc,
                ] : null,

                'client_ftth' => $odp->clientFtth ? [
                    'id' => $odp->clientFtth->id,
                    'nama_client' => $odp->clientFtth->nama_client,
                    'alamat' => $odp->clientFtth->alamat,
                ] : null,

                'status' => $odp->status,
                'created_at' => $odp->created_at?->toDateTimeString(),
                'updated_at' => $odp->updated_at?->toDateTimeString(),
            ],
            'message' => 'ODP updated successfully.',
        ], 200);
    }

    /**
     * Soft‐delete an ODP by ID.
     *
     * DELETE /api/v1/fo-odps/{id}
     */
    public function destroy($id)
    {
        $o = FoOdp::findOrFail($id);
        $o->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'ODP soft-deleted.',
        ], 200);
    }

    /**
     * Archive an ODP (set status = "archived").
     *
     * PATCH /api/v1/fo-odps/{id}/archive
     */
    public function archive($id)
    {
        $o = FoOdp::withTrashed()->findOrFail($id);
        $o->update(['status' => 'archived']);

        return response()->json([
            'status' => 'success',
            'message' => 'ODP archived.',
        ], 200);
    }

    /**
     * Unarchive an ODP (set status = "active").
     *
     * PATCH /api/v1/fo-odps/{id}/unarchive
     */
    public function unarchive($id)
    {
        $o = FoOdp::withTrashed()->findOrFail($id);
        $o->update(['status' => 'active']);

        return response()->json([
            'status' => 'success',
            'message' => 'ODP set to active.',
        ], 200);
    }

    /**
     * Restore a soft‐deleted ODP (deleted_at = NULL).
     *
     * PATCH /api/v1/fo-odps/{id}/restore
     */
    public function restore($id)
    {
        $o = FoOdp::onlyTrashed()->findOrFail($id);
        $o->restore();

        return response()->json([
            'status' => 'success',
            'message' => 'ODP restored from deletion.',
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
