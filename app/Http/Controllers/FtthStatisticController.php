<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\FoClientFtth;
use App\Models\FoOdc;
use App\Models\FoOdp;
use App\Models\FoKabelOdc;
use App\Models\FoKabelCoreOdc;
use App\Models\FoKabelTubeOdc;
use App\Models\FoLokasi;
use Illuminate\Http\JsonResponse;

class FtthStatisticController extends Controller
{
    public function index(): JsonResponse
    {
        // Basic counts
        $lokasiCount = FoLokasi::count();
        $odcCount = FoOdc::count();
        $odpCount = FoOdp::count();
        $kabelOdcCount = FoKabelOdc::count();
        $kabelCoreOdcCount = FoKabelCoreOdc::count();
        $kabelTubeOdcCount = FoKabelTubeOdc::count();
        $clientFtthCount = FoClientFtth::count();

        // Calculate total kabel length
        $totalKabelLength = FoKabelOdc::sum('panjang_kabel');

        // Utilization calculations
        $assignedCores = FoKabelCoreOdc::whereHas('odp')->count();
        $coreUtilization = $kabelCoreOdcCount > 0 ? round(($assignedCores / $kabelCoreOdcCount) * 100, 2) : 0;

        // Tubes with at least one assigned core
        $usedTubes = FoKabelTubeOdc::whereHas('kabelCoreOdcs.odp')->count();
        $tubeUtilization = $kabelTubeOdcCount > 0 ? round(($usedTubes / $kabelTubeOdcCount) * 100, 2) : 0;

        // ODPs with clients
        $odpsWithClient = FoOdp::whereHas('clientFtth')->count();
        $odpUtilization = $odpCount > 0 ? round(($odpsWithClient / $odpCount) * 100, 2) : 0;

        // Status breakdowns
        $odcStatusCounts = $this->getStatusCounts(FoOdc::all(), 'status');
        $odpStatusCounts = $this->getStatusCounts(FoOdp::all(), 'status');
        $kabelStatusCounts = $this->getStatusCounts(FoKabelOdc::all(), 'status');
        $lokasiStatusCounts = $this->getStatusCounts(FoLokasi::all(), 'status');
        $clientStatusCounts = $this->getStatusCounts(FoClientFtth::all(), 'status');

        // Calculate active counts for status summary
        $activeLokasi = FoLokasi::where('status', 'active')->count();
        $activeOdc = FoOdc::where('status', 'active')->count();
        $activeOdp = FoOdp::where('status', 'active')->count();
        $activeKabel = FoKabelOdc::where('status', 'active')->count();
        $activeClients = FoClientFtth::where('status', 'active')->count();

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
                'statusBreakdown' => array_merge($lokasiStatusCounts, $odcStatusCounts, $odpStatusCounts, $kabelStatusCounts, $clientStatusCounts),
            ],
            'detailed' => $detailedData,
        ];

        return response()->json(['data' => $data]);
    }

    private function getStatusCounts($collection, $statusField = 'status')
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

    private function getOdpsPerOdc()
    {
        // Use the new KabelOdc->odcs relationship (plural)
        $odcs = \App\Models\FoKabelOdc::with('odcs')->get();
        $odpsByOdc = [];
        foreach ($odcs as $kabelOdc) {
            $odcName = $kabelOdc->nama_kabel ?? 'Unknown';
            $odpCount = 0;
            foreach ($kabelOdc->odcs as $odc) {
                // Each ODC can have multiple ODPs via KabelCoreOdc->ODP, but for stats, count ODPs linked to this ODC's KabelOdc
                $odpCount += \App\Models\FoOdp::whereHas('kabelCoreOdc.kabelTubeOdc.kabelOdc', function($q) use ($kabelOdc) {
                    $q->where('id', $kabelOdc->id);
                })->count();
            }
            $odpsByOdc[$odcName] = $odpCount;
        }
        return array_map(function($name, $count) {
            return ['name' => $name, 'ODPs' => $count];
        }, array_keys($odpsByOdc), array_values($odpsByOdc));
    }

    private function getClientsPerOdp()
    {
        $clients = FoClientFtth::with('odp')->get();
        $clientsByOdp = [];

        foreach ($clients as $client) {
            $odpName = $client->odp->nama_odp ?? 'Unknown';
            $clientsByOdp[$odpName] = ($clientsByOdp[$odpName] ?? 0) + 1;
        }

        return array_map(function($name, $count) {
            return ['name' => $name, 'Clients' => $count];
        }, array_keys($clientsByOdp), array_values($clientsByOdp));
    }

    private function getDetailedData()
    {
        // Eager load all relationships for detailed drill-down using new structure
        $lokasis = \App\Models\FoLokasi::with([
            'odcs.kabelOdc',
            'odps.kabelCoreOdc.kabelTubeOdc.kabelOdc',
            'odps.clientFtth',
            'clientFtths.odp'
        ])->get();
        return $lokasis->map(function($lokasi) {
            return [
                'id' => $lokasi->id,
                'nama_lokasi' => $lokasi->nama_lokasi,
                'deskripsi' => $lokasi->deskripsi,
                'latitude' => $lokasi->latitude,
                'longitude' => $lokasi->longitude,
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
                }),
                'odps' => $lokasi->odps->map(function($odp) {
                    $core = $odp->kabelCoreOdc;
                    $tube = $core?->kabelTubeOdc;
                    $kabelOdc = $tube?->kabelOdc;
                    return [
                        'id' => $odp->id,
                        'nama_odp' => $odp->nama_odp,
                        'status' => $odp->status,
                        'created_at' => $odp->created_at?->toDateTimeString(),
                        'updated_at' => $odp->updated_at?->toDateTimeString(),
                        'deleted_at' => $odp->deleted_at?->toDateTimeString(),
                        'kabel_core_odc' => $core ? [
                            'id' => $core->id,
                            'warna_core' => $core->warna_core,
                            'kabel_tube_odc' => $tube ? [
                                'id' => $tube->id,
                                'warna_tube' => $tube->warna_tube,
                                'kabel_odc' => $kabelOdc ? [
                                    'id' => $kabelOdc->id,
                                    'nama_kabel' => $kabelOdc->nama_kabel,
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
                }),
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
                }),
            ];
        });
    }
}
