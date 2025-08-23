<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoTableSeeder extends Seeder
{
    public function run()
    {
        $companyId = 1; // Default company ID

        $this->command->info('Starting FoTableSeeder - Updated Schema with Surakarta Locations and Proper Core Assignments...');
        $this->disableForeignKeys();
        $this->truncateAll();
        $this->enableForeignKeys();

        // 1. Seed Lokasi (locations) - Each location is unique with different coordinates around Surakarta
        $lokasis = $this->seedLokasis();

        // 2. Seed KabelOdcs (cables)
        $kabelOdcs = $this->seedKabelOdcs();

        // 3. Seed ODCs with proper relationships
        $odcs = $this->seedOdcs($lokasis, $kabelOdcs);

        // 4. Seed KabelTubeOdcs (tubes within cables)
        $tubeOdcs = $this->seedKabelTubeOdcs($kabelOdcs);

        // 5. Seed KabelCoreOdcs (fiber cores within tubes)
        $coreOdcs = $this->seedKabelCoreOdcs($tubeOdcs);

        // 6. Update ODCs with proper kabel_core_odc_id assignments
        $this->updateOdcCoreAssignments($odcs, $coreOdcs);

        // 7. Seed ODPs with proper relationships
        $odps = $this->seedOdps($lokasis, $coreOdcs, $odcs);

        // 8. Seed Client FTTH
        $this->seedClients($lokasis, $odps, $companyId);

        // 9. Seed Joint Boxes with proper relationships
        $this->seedJointBoxes($lokasis, $odcs, $odps, $kabelOdcs);

        $this->command->info('FoTableSeeder completed successfully!');
    }

    protected function disableForeignKeys()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    }

    protected function enableForeignKeys()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    protected function truncateAll()
    {
        foreach (
            [
                'fo_client_ftths',
                'fo_joint_boxes',
                'fo_odps',
                'fo_odcs',
                'fo_kabel_core_odcs',
                'fo_kabel_tube_odcs',
                'fo_kabel_odcs',
                'fo_lokasis',
            ] as $table
        ) {
            DB::table($table)->truncate();
        }
    }

    protected function seedLokasis(): array
    {
        // Create unique locations with different coordinates around Surakarta
        $lokasis = [
            // ODC Locations (0-2)
            [
                'nama_lokasi' => 'ODC Central Surakarta',
                'deskripsi' => 'Main ODC in Central Surakarta',
                'latitude' => -7.56526,
                'longitude' => 110.81653,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'ODC Laweyan Surakarta',
                'deskripsi' => 'Secondary ODC in Laweyan area',
                'latitude' => -7.57222,
                'longitude' => 110.80833,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'ODC Serengan Surakarta',
                'deskripsi' => 'Tertiary ODC in Serengan area',
                'latitude' => -7.55833,
                'longitude' => 110.82500,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // ODP Locations (3-5)
            [
                'nama_lokasi' => 'ODP Pasar Kliwon',
                'deskripsi' => 'ODP serving Pasar Kliwon area',
                'latitude' => -7.57000,
                'longitude' => 110.82000,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'ODP Jebres',
                'deskripsi' => 'ODP serving Jebres area',
                'latitude' => -7.56000,
                'longitude' => 110.81000,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'ODP Banjarsari',
                'deskripsi' => 'ODP serving Banjarsari area',
                'latitude' => -7.55000,
                'longitude' => 110.83000,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Client Locations (6-8)
            [
                'nama_lokasi' => 'Client Solo Paragon',
                'deskripsi' => 'Client in Solo Paragon Mall area',
                'latitude' => -7.56500,
                'longitude' => 110.82500,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'Client Solo Grand Mall',
                'deskripsi' => 'Client in Solo Grand Mall area',
                'latitude' => -7.57500,
                'longitude' => 110.81500,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'Client Hartono Mall',
                'deskripsi' => 'Client in Hartono Mall area',
                'latitude' => -7.55500,
                'longitude' => 110.83500,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Joint Box Locations (9-12)
            [
                'nama_lokasi' => 'Joint Box Central-Laweyan',
                'deskripsi' => 'Joint box between Central and Laweyan ODCs',
                'latitude' => -7.56874,
                'longitude' => 110.81243,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'Joint Box Central-Serengan',
                'deskripsi' => 'Joint box between Central and Serengan ODCs',
                'latitude' => -7.56180,
                'longitude' => 110.82077,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'Joint Box Central-Pasar Kliwon',
                'deskripsi' => 'Joint box routing from Central ODC to Pasar Kliwon ODP',
                'latitude' => -7.56763,
                'longitude' => 110.81827,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_lokasi' => 'Joint Box Laweyan-Jebres',
                'deskripsi' => 'Joint box routing from Laweyan ODC to Jebres ODP',
                'latitude' => -7.56611,
                'longitude' => 110.80917,
                'city' => 'Surakarta',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('fo_lokasis')->insert($lokasis);

        // Return the inserted records with their IDs
        return DB::table('fo_lokasis')->orderBy('id')->get()->toArray();
    }

    protected function seedKabelOdcs(): array
    {
        $kabelOdcs = [
            [
                'nama_kabel' => 'Main Cable Surakarta A',
                'deskripsi' => 'Primary cable connecting Central and Laweyan ODCs',
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 2500.0,
                'jumlah_tube' => 2,
                'jumlah_core_in_tube' => 3,
                'jumlah_total_core' => 6,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nama_kabel' => 'Main Cable Surakarta B',
                'deskripsi' => 'Secondary cable connecting Central and Serengan ODCs',
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 1800.0,
                'jumlah_tube' => 2,
                'jumlah_core_in_tube' => 2,
                'jumlah_total_core' => 4,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_kabel_odcs')->insert($kabelOdcs);
        return DB::table('fo_kabel_odcs')->orderBy('id')->get()->toArray();
    }

    protected function seedOdcs(array $lokasis, array $kabelOdcs): array
    {
        $odcs = [
            [
                'lokasi_id' => $lokasis[0]->id, // ODC Central Surakarta
                'kabel_odc_id' => $kabelOdcs[0]->id, // Main Cable Surakarta A
                'odc_id' => null, // Will be updated after all ODCs are created
                'kabel_core_odc_id' => null, // Will be updated after cores are created
                'nama_odc' => 'ODC Central Surakarta',
                'deskripsi' => 'Main ODC serving Central Surakarta area',
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'lokasi_id' => $lokasis[1]->id, // ODC Laweyan Surakarta
                'kabel_odc_id' => $kabelOdcs[0]->id, // Main Cable Surakarta A (shared with Central)
                'odc_id' => null, // Will be updated after all ODCs are created
                'kabel_core_odc_id' => null, // Will be updated after cores are created
                'nama_odc' => 'ODC Laweyan Surakarta',
                'deskripsi' => 'Secondary ODC serving Laweyan area',
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'lokasi_id' => $lokasis[2]->id, // ODC Serengan Surakarta
                'kabel_odc_id' => $kabelOdcs[1]->id, // Main Cable Surakarta B
                'odc_id' => null, // Will be updated after all ODCs are created
                'kabel_core_odc_id' => null, // Will be updated after cores are created
                'nama_odc' => 'ODC Serengan Surakarta',
                'deskripsi' => 'Tertiary ODC serving Serengan area',
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_odcs')->insert($odcs);

        // Get the inserted ODCs
        $insertedOdcs = DB::table('fo_odcs')->orderBy('id')->get()->toArray();

        // Update ODC connections to create a realistic topology
        // ODC Central connects to ODC Laweyan (forming the main ring)
        DB::table('fo_odcs')->where('id', $insertedOdcs[0]->id)->update(['odc_id' => $insertedOdcs[1]->id]);
        // ODC Laweyan connects to ODC Serengan (continuing the ring)
        DB::table('fo_odcs')->where('id', $insertedOdcs[1]->id)->update(['odc_id' => $insertedOdcs[2]->id]);
        // ODC Serengan connects back to ODC Central (completing the ring)
        DB::table('fo_odcs')->where('id', $insertedOdcs[2]->id)->update(['odc_id' => $insertedOdcs[0]->id]);

        return $insertedOdcs;
    }

    protected function seedKabelTubeOdcs(array $kabelOdcs): array
    {
        $tubeOdcs = [];
        $id = 1;

        foreach ($kabelOdcs as $kabelOdc) {
            $colorCounts = ['biru' => 0, 'jingga' => 0, 'hijau' => 0, 'coklat' => 0, 'abu_abu' => 0, 'putih' => 0, 'merah' => 0, 'hitam' => 0, 'kuning' => 0, 'ungu' => 0, 'merah_muda' => 0, 'aqua' => 0];
            $colors = ['biru', 'jingga'];

            for ($tubeIndex = 0; $tubeIndex < $kabelOdc->jumlah_tube; $tubeIndex++) {
                $warna = $colors[$tubeIndex % count($colors)];
                $colorCounts[$warna]++;
                $tubeOdcs[] = [
                    'id' => $id++,
                    'kabel_odc_id' => $kabelOdc->id,
                    'deskripsi' => "Tube {$warna} ({$colorCounts[$warna]}) for {$kabelOdc->nama_kabel}",
                    'warna_tube' => $warna,
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('fo_kabel_tube_odcs')->insert($tubeOdcs);
        return DB::table('fo_kabel_tube_odcs')->orderBy('id')->get()->toArray();
    }

    protected function seedKabelCoreOdcs(array $tubeOdcs): array
    {
        $coreOdcs = [];
        $id = 1;

        // Get cable configurations
        $kabelOdcs = DB::table('fo_kabel_odcs')->get()->keyBy('id');

        foreach ($tubeOdcs as $tubeOdc) {
            $colorCounts = ['biru' => 0, 'jingga' => 0, 'hijau' => 0, 'coklat' => 0, 'abu_abu' => 0, 'putih' => 0, 'merah' => 0, 'hitam' => 0, 'kuning' => 0, 'ungu' => 0, 'merah_muda' => 0, 'aqua' => 0];

            // Extract the color index from the tube description
            preg_match('/\((\d+)\)/', $tubeOdc->deskripsi, $matches);
            $tubeColorIndex = $matches[1] ?? 1;

            // Get the number of cores for this tube from the cable configuration
            $kabelOdc = $kabelOdcs[$tubeOdc->kabel_odc_id];
            $jumlahCorePerTube = $kabelOdc->jumlah_core_in_tube;

            for ($coreIndex = 0; $coreIndex < $jumlahCorePerTube; $coreIndex++) {
                $warna = $coreIndex === 0 ? 'biru' : ($coreIndex === 1 ? 'jingga' : 'hijau');
                $colorCounts[$warna]++;
                $coreOdcs[] = [
                    'id' => $id++,
                    'kabel_tube_odc_id' => $tubeOdc->id,
                    'deskripsi' => "Core {$warna}({$colorCounts[$warna]}) for tube {$tubeOdc->warna_tube}({$tubeColorIndex})",
                    'warna_core' => $warna,
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('fo_kabel_core_odcs')->insert($coreOdcs);
        return DB::table('fo_kabel_core_odcs')->orderBy('id')->get()->toArray();
    }

    protected function updateOdcCoreAssignments(array $odcs, array $coreOdcs): void
    {
        // Group cores by their cable (via tube)
        $coresByCable = [];
        foreach ($coreOdcs as $core) {
            $tubeOdc = DB::table('fo_kabel_tube_odcs')->find($core->kabel_tube_odc_id);
            if ($tubeOdc) {
                $kabelOdcId = $tubeOdc->kabel_odc_id;
                if (!isset($coresByCable[$kabelOdcId])) {
                    $coresByCable[$kabelOdcId] = [];
                }
                $coresByCable[$kabelOdcId][] = $core;
            }
        }

        // Assign cores to ODCs based on their cable
        foreach ($odcs as $index => $odc) {
            if (isset($coresByCable[$odc->kabel_odc_id])) {
                $availableCores = $coresByCable[$odc->kabel_odc_id];
                // Assign the first available core from the same cable
                if (!empty($availableCores)) {
                    $assignedCore = array_shift($availableCores);
                    DB::table('fo_odcs')->where('id', $odc->id)->update([
                        'kabel_core_odc_id' => $assignedCore->id
                    ]);
                }
            }
        }
    }

    protected function seedOdps(array $lokasis, array $coreOdcs, array $odcs): array
    {
        $odps = [];
        $id = 1;

        // Map each ODP to a unique core and to a related ODC
        foreach ([3, 4, 5] as $lokasiIndex) { // ODP locations
            $coreIndex = $lokasiIndex - 3; // Map to first few cores
            $odcIndex = $lokasiIndex - 3; // Map to first few ODCs

            $odps[] = [
                'lokasi_id' => $lokasis[$lokasiIndex]->id,
                'kabel_core_odc_id' => $coreOdcs[$coreIndex]->id,
                'odc_id' => $odcs[$odcIndex]->id, // Logical connection to ODC
                'nama_odp' => $lokasis[$lokasiIndex]->nama_lokasi,
                'deskripsi' => 'ODP serving ' . $lokasis[$lokasiIndex]->nama_lokasi,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('fo_odps')->insert($odps);
        return DB::table('fo_odps')->orderBy('id')->get()->toArray();
    }

    protected function seedClients(array $lokasis, array $odps, int $companyId): void
    {
        $clients = [];
        $id = 1;

        // Map clients to ODPs (one client per ODP)
        foreach ([6, 7, 8] as $lokasiIndex) { // Client locations
            $odpIndex = $lokasiIndex - 6; // Map to first few ODPs
            $odp = $odps[$odpIndex];

            $clients[] = [
                'lokasi_id' => $lokasis[$lokasiIndex]->id,
                'odp_id' => $odp->id,
                'client_id' => null,
                'company_id' => $companyId,
                'nama_client' => $lokasis[$lokasiIndex]->nama_lokasi,
                'alamat' => 'Jl. ' . $lokasis[$lokasiIndex]->nama_lokasi . ', Surakarta',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('fo_client_ftths')->insert($clients);
    }

    protected function seedJointBoxes(array $lokasis, array $odcs, array $odps, array $kabelOdcs): void
    {
        $jointBoxes = [];
        $id = 1;

        // 1. Joint box for ODC↔ODC: between Central and Laweyan (Main Cable Surakarta A)
        $jointBoxes[] = [
            'lokasi_id' => $lokasis[9]->id, // Joint Box Central-Laweyan
            'kabel_odc_id' => $kabelOdcs[0]->id, // Main Cable Surakarta A
            'odc_id' => $odcs[0]->id, // ODC Central Surakarta
            'odc_2_id' => $odcs[1]->id, // ODC Laweyan Surakarta
            'odp_id' => null, // No ODP connection
            'nama_joint_box' => 'JB-Central-Laweyan',
            'deskripsi' => 'Joint box connecting Central and Laweyan ODCs via Main Cable Surakarta A',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // 2. Joint box for ODC↔ODC: between Central and Serengan (Main Cable Surakarta B)
        $jointBoxes[] = [
            'lokasi_id' => $lokasis[10]->id, // Joint Box Central-Serengan
            'kabel_odc_id' => $kabelOdcs[1]->id, // Main Cable Surakarta B
            'odc_id' => $odcs[0]->id, // ODC Central Surakarta
            'odc_2_id' => $odcs[2]->id, // ODC Serengan Surakarta
            'odp_id' => null, // No ODP connection
            'nama_joint_box' => 'JB-Central-Serengan',
            'deskripsi' => 'Joint box connecting Central and Serengan ODCs via Main Cable Surakarta B',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // 3. Joint box for ODC→ODP: Central ODC to Pasar Kliwon ODP
        $jointBoxes[] = [
            'lokasi_id' => $lokasis[11]->id, // Joint Box Central-Pasar Kliwon
            'kabel_odc_id' => $kabelOdcs[0]->id, // Main Cable Surakarta A
            'odc_id' => $odcs[0]->id, // ODC Central Surakarta
            'odc_2_id' => null, // No second ODC
            'odp_id' => $odps[0]->id, // ODP Pasar Kliwon
            'nama_joint_box' => 'JB-Central-Pasar Kliwon',
            'deskripsi' => 'Joint box routing from Central ODC to Pasar Kliwon ODP',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // 4. Joint box for ODC→ODP: Laweyan ODC to Jebres ODP
        $jointBoxes[] = [
            'lokasi_id' => $lokasis[12]->id, // Joint Box Laweyan-Jebres
            'kabel_odc_id' => $kabelOdcs[0]->id, // Main Cable Surakarta A
            'odc_id' => $odcs[1]->id, // ODC Laweyan Surakarta
            'odc_2_id' => null, // No second ODC
            'odp_id' => $odps[1]->id, // ODP Jebres
            'nama_joint_box' => 'JB-Laweyan-Jebres',
            'deskripsi' => 'Joint box routing from Laweyan ODC to Jebres ODP',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('fo_joint_boxes')->insert($jointBoxes);
    }
}
