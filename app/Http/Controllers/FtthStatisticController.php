<?php

namespace App\Http\Controllers;

use App\Models\FoClientFtth;
use App\Models\FoOdc;
use App\Models\FoOdp;
use App\Models\FoKabelOdc;
use App\Models\FoKabelCoreOdc;
use App\Models\FoKabelTubeOdc;
use App\Models\FoLokasi;
use App\Models\FoJointBox;
use Illuminate\Http\JsonResponse;

class FtthStatisticController extends Controller
{
    public function index(): JsonResponse
    {
        // Basic counts (only active and non-deleted)
        $lokasiCount = FoLokasi::where('status', 'active')->whereNull('deleted_at')->count();
        $odcCount = FoOdc::where('status', 'active')->whereNull('deleted_at')->count();
        $odpCount = FoOdp::where('status', 'active')->whereNull('deleted_at')->count();
        $kabelOdcCount = FoKabelOdc::where('status', 'active')->whereNull('deleted_at')->count();
        $kabelCoreOdcCount = FoKabelCoreOdc::where('status', 'active')->whereNull('deleted_at')->count();
        $kabelTubeOdcCount = FoKabelTubeOdc::where('status', 'active')->whereNull('deleted_at')->count();
        $clientFtthCount = FoClientFtth::where('status', 'active')->whereNull('deleted_at')->count();
        $jointBoxCount = FoJointBox::where('status', 'active')->whereNull('deleted_at')->count();

        // Calculate total kabel length (only active)
        $totalKabelLength = FoKabelOdc::where('status', 'active')
            ->whereNull('deleted_at')
            ->sum('panjang_kabel');

        // Utilization calculations
        $assignedCores = FoKabelCoreOdc::where('status', 'active')
            ->whereNull('deleted_at')
            ->whereHas('odps', function ($query) {
                $query->where('status', 'active')->whereNull('deleted_at');
            })->count();

        $coreUtilization = $kabelCoreOdcCount > 0 ? round(($assignedCores / $kabelCoreOdcCount) * 100, 2) : 0;

        // Tubes with at least one assigned core
        $usedTubes = FoKabelTubeOdc::where('status', 'active')
            ->whereNull('deleted_at')
            ->whereHas('kabelCoreOdcs.odps', function ($query) {
                $query->where('status', 'active')->whereNull('deleted_at');
            })->count();

        $tubeUtilization = $kabelTubeOdcCount > 0 ? round(($usedTubes / $kabelTubeOdcCount) * 100, 2) : 0;

        // ODPs with clients
        $odpsWithClient = FoOdp::where('status', 'active')
            ->whereNull('deleted_at')
            ->whereHas('clientFtth', function ($query) {
                $query->where('status', 'active')->whereNull('deleted_at');
            })->count();

        $odpUtilization = $odpCount > 0 ? round(($odpsWithClient / $odpCount) * 100, 2) : 0;

        // Status breakdowns (including soft-deleted for complete picture)
        $odcStatusCounts = $this->getStatusCounts(FoOdc::withTrashed()->get(), 'status');
        $odpStatusCounts = $this->getStatusCounts(FoOdp::withTrashed()->get(), 'status');
        $kabelStatusCounts = $this->getStatusCounts(FoKabelOdc::withTrashed()->get(), 'status');
        $lokasiStatusCounts = $this->getStatusCounts(FoLokasi::withTrashed()->get(), 'status');
        $clientStatusCounts = $this->getStatusCounts(FoClientFtth::withTrashed()->get(), 'status');
        $jointBoxStatusCounts = $this->getStatusCounts(FoJointBox::withTrashed()->get(), 'status');

        // Calculate active counts for status summary
        $activeLokasi = FoLokasi::where('status', 'active')->whereNull('deleted_at')->count();
        $activeOdc = FoOdc::where('status', 'active')->whereNull('deleted_at')->count();
        $activeOdp = FoOdp::where('status', 'active')->whereNull('deleted_at')->count();
        $activeKabel = FoKabelOdc::where('status', 'active')->whereNull('deleted_at')->count();
        $activeClients = FoClientFtth::where('status', 'active')->whereNull('deleted_at')->count();
        $activeJointBox = FoJointBox::where('status', 'active')->whereNull('deleted_at')->count();

        // ODPs per ODC (for bar chart)
        $odpsPerOdc = $this->getOdpsPerOdc();

        // Clients per ODP (for bar chart)
        $clientsPerOdp = $this->getClientsPerOdp();

        // Core utilization pie data
        $coreUtilizationData = [
            ['name' => 'Assigned', 'value' => $assignedCores],
            ['name' => 'Unassigned', 'value' => $kabelCoreOdcCount - $assignedCores],
        ];

        // Tube utilization pie data
        $tubeUtilizationData = [
            ['name' => 'Used', 'value' => $usedTubes],
            ['name' => 'Unused', 'value' => $kabelTubeOdcCount - $usedTubes],
        ];

        // ODP utilization pie data
        $odpUtilizationData = [
            ['name' => 'With Client', 'value' => $odpsWithClient],
            ['name' => 'No Client', 'value' => $odpCount - $odpsWithClient],
        ];

        // Detailed data for drill-down (with eager loading)
        $detailedData = $this->getDetailedData();

        $data = [
            'summary' => [
                'lokasi' => $lokasiCount,
                'odc' => $odcCount,
                'odp' => $odpCount,
                'kabel' => $kabelOdcCount,
                'kabelLength' => $totalKabelLength,
                'clientFtth' => $clientFtthCount,
                'tubes' => $kabelTubeOdcCount,
                'cores' => $kabelCoreOdcCount,
                'jointbox' => $jointBoxCount,
                'odpUtilization' => $odpUtilization,
                'kabelUtilization' => $tubeUtilization,
            ],
            'status' => [
                'totalLokasi' => $lokasiCount,
                'activeLokasi' => $activeLokasi,
                'totalOdc' => $odcCount,
                'activeOdc' => $activeOdc,
                'totalOdp' => $odpCount,
                'activeOdp' => $activeOdp,
                'totalKabel' => $kabelOdcCount,
                'activeKabel' => $activeKabel,
                'totalClients' => $clientFtthCount,
                'activeClients' => $activeClients,
                'totalJointBox' => $jointBoxCount,
                'activeJointBox' => $activeJointBox,
            ],
            'utilization' => [
                'totalCores' => $kabelCoreOdcCount,
                'assignedCores' => $assignedCores,
                'totalTubes' => $kabelTubeOdcCount,
                'usedTubes' => $usedTubes,
                'totalOdps' => $odpCount,
                'withClient' => $odpsWithClient,
                'coreUtilization' => $coreUtilization,
                'tubeUtilization' => $tubeUtilization,
                'odpUtilization' => $odpUtilization,
            ],
            'charts' => [
                'odpsPerOdc' => $odpsPerOdc,
                'clientsPerOdp' => $clientsPerOdp,
                'odpStatusPie' => $odpStatusCounts,
                'coreUtilization' => $coreUtilizationData,
                'tubeUtilization' => $tubeUtilizationData,
                'odpUtilization' => $odpUtilizationData,
                'lokasiStatus' => $lokasiStatusCounts,
                'odcStatus' => $odcStatusCounts,
                'kabelStatus' => $kabelStatusCounts,
                'clientStatus' => $clientStatusCounts,
                'jointBoxStatus' => $jointBoxStatusCounts,
                'statusBreakdown' => array_merge(
                    $lokasiStatusCounts,
                    $odcStatusCounts,
                    $odpStatusCounts,
                    $kabelStatusCounts,
                    $clientStatusCounts,
                    $jointBoxStatusCounts
                ),
            ],
            'detailed' => $detailedData,
        ];

        return response()->json(['data' => $data]);
    }

    private function getStatusCounts($collection, $statusField = 'status'): array
    {
        $counts = [];
        foreach ($collection as $item) {
            $status = $item->$statusField ?? 'unknown';
            $counts[$status] = ($counts[$status] ?? 0) + 1;
        }

        return array_map(function($name, $value) {
            return ['name' => $name, 'value' => $value];
        }, array_keys($counts), array_values($counts));
    }

    private function getOdpsPerOdc(): array
    {
        // Get ODCs with their associated ODPs
        $odcs = FoOdc::where('status', 'active')
            ->whereNull('deleted_at')
            ->with(['kabelOdc.kabelTubeOdcs.kabelCoreOdcs.odps' => function ($query) {
                $query->where('status', 'active')->whereNull('deleted_at');
            }])
            ->get();

        $odpsByOdc = [];
        foreach ($odcs as $odc) {
            $odcName = $odc->nama_odc ?? 'Unknown';
            $odpCount = 0;

            if ($odc->kabelOdc) {
                foreach ($odc->kabelOdc->kabelTubeOdcs as $tube) {
                    foreach ($tube->kabelCoreOdcs as $core) {
                        $odpCount += $core->odps->count();
                    }
                }
            }

            $odpsByOdc[$odcName] = $odpCount;
        }

        return array_map(function($name, $count) {
            return ['name' => $name, 'ODPs' => $count];
        }, array_keys($odpsByOdc), array_values($odpsByOdc));
    }

    private function getClientsPerOdp(): array
    {
        $clients = FoClientFtth::where('status', 'active')
            ->whereNull('deleted_at')
            ->with(['odp' => function ($query) {
                $query->where('status', 'active')->whereNull('deleted_at');
            }])
            ->get();

        $clientsByOdp = [];

        foreach ($clients as $client) {
            if ($client->odp) {
                $odpName = $client->odp->nama_odp ?? 'Unknown';
                $clientsByOdp[$odpName] = ($clientsByOdp[$odpName] ?? 0) + 1;
            }
        }

        return array_map(function($name, $count) {
            return ['name' => $name, 'Clients' => $count];
        }, array_keys($clientsByOdp), array_values($clientsByOdp));
    }

    private function getDetailedData(): array
    {
        // Eager load all relationships for detailed drill-down using new structure
        $lokasis = FoLokasi::where('status', 'active')
            ->whereNull('deleted_at')
            ->with([
                'odcs' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'odcs.kabelOdc' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'odps' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'odps.kabelCoreOdc' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'odps.kabelCoreOdc.kabelTubeOdc' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'odps.kabelCoreOdc.kabelTubeOdc.kabelOdc' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'odps.clientFtth' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'clientFtths' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'clientFtths.odp' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'jointBoxes' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
                'jointBoxes.kabelOdc' => function ($query) {
                    $query->where('status', 'active')->whereNull('deleted_at');
                },
            ])
            ->get();

        return $lokasis->map(function($lokasi) {
            return [
                'id' => $lokasi->id,
                'nama_lokasi' => $lokasi->nama_lokasi,
                'deskripsi' => $lokasi->deskripsi,
                'latitude' => $lokasi->latitude,
                'longitude' => $lokasi->longitude,
                'city' => $lokasi->city,
                'province' => $lokasi->province,
                'country' => $lokasi->country,
                'geocoded_at' => $lokasi->geocoded_at?->toDateTimeString(),
                'status' => $lokasi->status,
                'created_at' => $lokasi->created_at?->toDateTimeString(),
                'updated_at' => $lokasi->updated_at?->toDateTimeString(),
                'deleted_at' => $lokasi->deleted_at?->toDateTimeString(),
                'odcs' => $lokasi->odcs->map(function($odc) {
                    return [
                        'id' => $odc->id,
                        'nama_odc' => $odc->nama_odc,
                        'tipe_splitter' => $odc->tipe_splitter,
                        'status' => $odc->status,
                        'created_at' => $odc->created_at?->toDateTimeString(),
                        'updated_at' => $odc->updated_at?->toDateTimeString(),
                        'deleted_at' => $odc->deleted_at?->toDateTimeString(),
                        'kabel_odc' => $odc->kabelOdc ? [
                            'id' => $odc->kabelOdc->id,
                            'nama_kabel' => $odc->kabelOdc->nama_kabel,
                            'tipe_kabel' => $odc->kabelOdc->tipe_kabel,
                            'panjang_kabel' => $odc->kabelOdc->panjang_kabel,
                            'jumlah_tube' => $odc->kabelOdc->jumlah_tube,
                            'jumlah_core_in_tube' => $odc->kabelOdc->jumlah_core_in_tube,
                            'jumlah_total_core' => $odc->kabelOdc->jumlah_total_core,
                            'status' => $odc->kabelOdc->status,
                            'created_at' => $odc->kabelOdc->created_at?->toDateTimeString(),
                            'updated_at' => $odc->kabelOdc->updated_at?->toDateTimeString(),
                            'deleted_at' => $odc->kabelOdc->deleted_at?->toDateTimeString(),
                        ] : null,
                    ];
                })->toArray(),
                'odps' => $lokasi->odps->map(function($odp) {
                    $core = $odp->kabelCoreOdc;
                    $tube = $core?->kabelTubeOdc;
                    $kabelOdc = $tube?->kabelOdc;
                    return [
                        'id' => $odp->id,
                        'nama_odp' => $odp->nama_odp,
                        'deskripsi' => $odp->deskripsi,
                        'odc_id' => $odp->odc_id,
                        'status' => $odp->status,
                        'created_at' => $odp->created_at?->toDateTimeString(),
                        'updated_at' => $odp->updated_at?->toDateTimeString(),
                        'deleted_at' => $odp->deleted_at?->toDateTimeString(),
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
                        ] : null,
                        'client_ftth' => $odp->clientFtth ? [
                            'id' => $odp->clientFtth->id,
                            'nama_client' => $odp->clientFtth->nama_client,
                            'alamat' => $odp->clientFtth->alamat,
                            'status' => $odp->clientFtth->status,
                            'created_at' => $odp->clientFtth->created_at?->toDateTimeString(),
                            'updated_at' => $odp->clientFtth->updated_at?->toDateTimeString(),
                            'deleted_at' => $odp->clientFtth->deleted_at?->toDateTimeString(),
                        ] : null,
                    ];
                })->toArray(),
                'client_ftths' => $lokasi->clientFtths->map(function($client) {
                    return [
                        'id' => $client->id,
                        'nama_client' => $client->nama_client,
                        'alamat' => $client->alamat,
                        'status' => $client->status,
                        'created_at' => $client->created_at?->toDateTimeString(),
                        'updated_at' => $client->updated_at?->toDateTimeString(),
                        'deleted_at' => $client->deleted_at?->toDateTimeString(),
                        'odp' => $client->odp ? [
                            'id' => $client->odp->id,
                            'nama_odp' => $client->odp->nama_odp,
                            'status' => $client->odp->status,
                        ] : null,
                    ];
                })->toArray(),
                'jointboxes' => $lokasi->jointBoxes->map(function($jointbox) {
                    return [
                        'id' => $jointbox->id,
                        'nama_joint_box' => $jointbox->nama_joint_box,
                        'deskripsi' => $jointbox->deskripsi,
                        'status' => $jointbox->status,
                        'created_at' => $jointbox->created_at?->toDateTimeString(),
                        'updated_at' => $jointbox->updated_at?->toDateTimeString(),
                        'deleted_at' => $jointbox->deleted_at?->toDateTimeString(),
                        'kabel_odc' => $jointbox->kabelOdc ? [
                            'id' => $jointbox->kabelOdc->id,
                            'nama_kabel' => $jointbox->kabelOdc->nama_kabel,
                            'tipe_kabel' => $jointbox->kabelOdc->tipe_kabel,
                            'panjang_kabel' => $jointbox->kabelOdc->panjang_kabel,
                            'jumlah_tube' => $jointbox->kabelOdc->jumlah_tube,
                            'jumlah_core_in_tube' => $jointbox->kabelOdc->jumlah_core_in_tube,
                            'jumlah_total_core' => $jointbox->kabelOdc->jumlah_total_core,
                            'status' => $jointbox->kabelOdc->status,
                            'created_at' => $jointbox->kabelOdc->created_at?->toDateTimeString(),
                            'updated_at' => $jointbox->kabelOdc->updated_at?->toDateTimeString(),
                            'deleted_at' => $jointbox->kabelOdc->deleted_at?->toDateTimeString(),
                        ] : null,
                    ];
                })->toArray(),
            ];
        })->toArray();
    }
}
