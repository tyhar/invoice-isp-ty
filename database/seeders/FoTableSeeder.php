<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoTableSeeder extends Seeder
{
    public function run()
    {
        $companyId = 1; // Default company ID

        $this->command->info('Starting FoTableSeeder...');
        $this->disableForeignKeys();
        $this->truncateAll();
        $this->enableForeignKeys();

        // 1. Seed all lokasi (main, ODP, client, jointbox)
        $mainLokasis = $this->seedMainLokasis();
        $odpLokasis = $this->seedOdpLokasis();
        $clientLokasis = $this->seedClientLokasis();
        $jointBoxLokasis = $this->seedJointBoxLokasis();

        // 2. Seed KabelOdcs (must come before ODCs)
        $kabelOdcs = $this->seedKabelOdcs($mainLokasis, $jointBoxLokasis, $odpLokasis);

        // 3. Seed ODCs (now require kabel_odc_id)
        $odcs = $this->seedOdcs($mainLokasis, $kabelOdcs);

        // 4. Seed KabelTubeOdcs
        $tubeOdcs = $this->seedKabelTubeOdcs($kabelOdcs);

        // 5. Seed KabelCoreOdcs
        $coreOdcs = $this->seedKabelCoreOdcs($tubeOdcs, $kabelOdcs);

        // 6. Seed ODPs
        $odps = $this->seedOdps($odpLokasis, $coreOdcs);

        // 7. Seed JointBoxes
        $jointBoxes = $this->seedJointBoxes($jointBoxLokasis, $kabelOdcs);

        // 8. Seed Client FTTH
        $this->seedClients($clientLokasis, $odps, $companyId);

        $this->command->info('FoTableSeeder completed successfully.');
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
                'fo_odps',
                'fo_kabel_core_odcs',
                'fo_kabel_tube_odcs',
                'fo_kabel_odcs',
                'fo_odcs',
                'fo_lokasis',
                'fo_joint_boxes',
            ] as $table
        ) {
            DB::table($table)->truncate();
        }
    }

    protected function seedMainLokasis(): array
    {
        // 3 real Indonesian locations for reference
        $lokasis = [
            [
                'id' => 1,
                'nama_lokasi' => 'Monas',
                'deskripsi' => 'Monumen Nasional',
                'latitude' => -6.175392,
                'longitude' => 106.827153,
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nama_lokasi' => 'Gedung Sate',
                'deskripsi' => 'Kantor Gubernur Jawa Barat',
                'latitude' => -6.902477,
                'longitude' => 107.618782,
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'nama_lokasi' => 'Tugu Pahlawan',
                'deskripsi' => 'Monumen Pahlawan',
                'latitude' => -7.245971,
                'longitude' => 112.737797,
                'city' => 'Surabaya',
                'province' => 'Jawa Timur',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedOdpLokasis(): array
    {
        // 3 unique lokasi for ODPs
        $lokasis = [
            [
                'id' => 4,
                'nama_lokasi' => 'ODP Jaktim',
                'deskripsi' => 'ODP Area Jakarta Timur',
                'latitude' => -6.225,
                'longitude' => 106.900,
                'city' => 'Jakarta Timur',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'nama_lokasi' => 'ODP Cimahi',
                'deskripsi' => 'ODP Area Cimahi',
                'latitude' => -6.872,
                'longitude' => 107.542,
                'city' => 'Cimahi',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'nama_lokasi' => 'ODP Sidoarjo',
                'deskripsi' => 'ODP Area Sidoarjo',
                'latitude' => -7.446,
                'longitude' => 112.718,
                'city' => 'Sidoarjo',
                'province' => 'Jawa Timur',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedClientLokasis(): array
    {
        // 3 unique lokasi for FTTH clients
        $lokasis = [
            [
                'id' => 7,
                'nama_lokasi' => 'Client Jaksel',
                'deskripsi' => 'Client Area Jakarta Selatan',
                'latitude' => -6.208,
                'longitude' => 106.845,
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'nama_lokasi' => 'Client Bandung Barat',
                'deskripsi' => 'Client Area Bandung Barat',
                'latitude' => -6.917,
                'longitude' => 107.583,
                'city' => 'Bandung Barat',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'nama_lokasi' => 'Client Gresik',
                'deskripsi' => 'Client Area Gresik',
                'latitude' => -7.155,
                'longitude' => 112.656,
                'city' => 'Gresik',
                'province' => 'Jawa Timur',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedJointBoxLokasis(): array
    {
        // 3 unique lokasi for Joint Boxes
        $lokasis = [
            [
                'id' => 10,
                'nama_lokasi' => 'JointBox Jakpus',
                'deskripsi' => 'Joint Box Area Jakarta Pusat',
                'latitude' => -6.175,
                'longitude' => 106.827,
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 11,
                'nama_lokasi' => 'JointBox Bandung Timur',
                'deskripsi' => 'Joint Box Area Bandung Timur',
                'latitude' => -6.902,
                'longitude' => 107.619,
                'city' => 'Bandung Timur',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 12,
                'nama_lokasi' => 'JointBox Surabaya Barat',
                'deskripsi' => 'Joint Box Area Surabaya Barat',
                'latitude' => -7.246,
                'longitude' => 112.738,
                'city' => 'Surabaya Barat',
                'province' => 'Jawa Timur',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedKabelOdcs(array $mainLokasis, array $jointBoxLokasis, array $odpLokasis): array
    {
        $kabelOdcs = [];
        $id = 1;

        // Create kabel ODCs for main lokasis
        foreach ($mainLokasis as $index => $lokasi) {
            // For the first Kabel ODC, set total core to 8 (2 tubes x 4 core)
            if ($index === 0) {
                $kabelOdcs[] = [
                    'id' => $id++,
                    'nama_kabel' => 'Kabel ' . $lokasi['nama_lokasi'] . ' (8 core)',
                    'tipe_kabel' => 'multicore',
                    'panjang_kabel' => 1000.0,
                    'jumlah_tube' => 2,
                    'jumlah_core_in_tube' => 4,
                    'jumlah_total_core' => 8,
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            } elseif ($index === 1) {
                // Second Kabel ODC: 12 core (3 tubes x 4 core)
                $kabelOdcs[] = [
                    'id' => $id++,
                    'nama_kabel' => 'Kabel ' . $lokasi['nama_lokasi'] . ' (12 core)',
                    'tipe_kabel' => 'multicore',
                    'panjang_kabel' => 1200.0,
                    'jumlah_tube' => 3,
                    'jumlah_core_in_tube' => 4,
                    'jumlah_total_core' => 12,
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            } elseif ($index === 2) {
                // Third Kabel ODC: 16 core (4 tubes x 4 core)
                $kabelOdcs[] = [
                    'id' => $id++,
                    'nama_kabel' => 'Kabel ' . $lokasi['nama_lokasi'] . ' (16 core)',
                    'tipe_kabel' => 'multicore',
                    'panjang_kabel' => 1500.0,
                    'jumlah_tube' => 4,
                    'jumlah_core_in_tube' => 4,
                    'jumlah_total_core' => 16,
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            } else {
                // For any additional, alternate between 8, 12, and 16 core
                $coreOptions = [
                    ['tube' => 2, 'core' => 4, 'total' => 8],
                    ['tube' => 3, 'core' => 4, 'total' => 12],
                    ['tube' => 4, 'core' => 4, 'total' => 16],
                ];
                $opt = $coreOptions[($index - 3) % 3];
                $kabelOdcs[] = [
                    'id' => $id++,
                    'nama_kabel' => 'Kabel ' . $lokasi['nama_lokasi'] . ' (' . $opt['total'] . ' core)',
                    'tipe_kabel' => 'multicore',
                    'panjang_kabel' => 1000.0 + $index * 100,
                    'jumlah_tube' => $opt['tube'],
                    'jumlah_core_in_tube' => $opt['core'],
                    'jumlah_total_core' => $opt['total'],
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Create kabel ODCs for joint box lokasis
        foreach ($jointBoxLokasis as $lokasi) {
            $kabelOdcs[] = [
                'id' => $id++,
                'nama_kabel' => 'Kabel ' . $lokasi['nama_lokasi'],
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 500.0,
                'jumlah_tube' => 4,
                'jumlah_core_in_tube' => 8,
                'jumlah_total_core' => 32,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Create kabel ODCs for ODP lokasis
        foreach ($odpLokasis as $lokasi) {
            $kabelOdcs[] = [
                'id' => $id++,
                'nama_kabel' => 'Kabel ' . $lokasi['nama_lokasi'],
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 750.0,
                'jumlah_tube' => 5,
                'jumlah_core_in_tube' => 10,
                'jumlah_total_core' => 50,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('fo_kabel_odcs')->insert($kabelOdcs);
        return $kabelOdcs;
    }

    protected function seedOdcs(array $mainLokasis, array $kabelOdcs): array
    {
        $odcs = [];
        $id = 1;

        foreach ($mainLokasis as $index => $lokasi) {
            $kabelOdcId = $kabelOdcs[$index]['id'] ?? null;

            $odcs[] = [
                'id' => $id++,
                'lokasi_id' => $lokasi['id'],
                'kabel_odc_id' => $kabelOdcId,
                'nama_odc' => 'ODC ' . $lokasi['nama_lokasi'],
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('fo_odcs')->insert($odcs);
        return $odcs;
    }

    protected function seedKabelTubeOdcs(array $kabelOdcs): array
    {
        $tubeOdcs = [];
        $id = 1;
        $colors = ['biru', 'jingga', 'hijau', 'coklat', 'abu_abu', 'putih'];

        foreach ($kabelOdcs as $kabelOdc) {
            $tubeCount = $kabelOdc['jumlah_tube'];
            for ($i = 0; $i < $tubeCount; $i++) {
                $tubeOdcs[] = [
                    'id' => $id++,
                    'kabel_odc_id' => $kabelOdc['id'],
                    'warna_tube' => $colors[$i % count($colors)],
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('fo_kabel_tube_odcs')->insert($tubeOdcs);
        return $tubeOdcs;
    }

    protected function seedKabelCoreOdcs(array $tubeOdcs, array $kabelOdcs): array
    {
        $coreOdcs = [];
        $id = 1;
        $colors = ['biru', 'jingga', 'hijau', 'coklat', 'abu_abu', 'putih', 'merah', 'hitam', 'kuning', 'ungu', 'merah_muda', 'aqua'];

        foreach ($tubeOdcs as $tubeOdc) {
            // Find the corresponding kabel ODC to get core count
            $kabelOdc = collect($kabelOdcs)->firstWhere('id', $tubeOdc['kabel_odc_id']);
            $coreCount = $kabelOdc['jumlah_core_in_tube'] ?? 12;

            for ($i = 0; $i < $coreCount; $i++) {
                $coreOdcs[] = [
                    'id' => $id++,
                    'kabel_tube_odc_id' => $tubeOdc['id'],
                    'warna_core' => $colors[$i % count($colors)],
                    'status' => 'active',
                    'deleted_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('fo_kabel_core_odcs')->insert($coreOdcs);
        return $coreOdcs;
    }

    protected function seedOdps(array $odpLokasis, array $coreOdcs): array
    {
        $odps = [];
        $id = 1;

        foreach ($odpLokasis as $index => $lokasi) {
            // Assign a core ODC to each ODP
            $coreOdc = $coreOdcs[$index] ?? null;

            $odps[] = [
                'id' => $id++,
                'lokasi_id' => $lokasi['id'],
                'kabel_core_odc_id' => $coreOdc['id'] ?? null,
                'nama_odp' => 'ODP ' . $lokasi['nama_lokasi'],
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('fo_odps')->insert($odps);
        return $odps;
    }

    protected function seedJointBoxes(array $jointBoxLokasis, array $kabelOdcs): array
    {
        $jointBoxes = [];
        $id = 1;

        foreach ($jointBoxLokasis as $index => $lokasi) {
            // Assign a kabel ODC to each joint box
            $kabelOdc = $kabelOdcs[count($jointBoxLokasis) + $index] ?? null;

            $jointBoxes[] = [
                'id' => $id++,
                'lokasi_id' => $lokasi['id'],
                'kabel_odc_id' => $kabelOdc['id'] ?? null,
                'nama_joint_box' => $lokasi['nama_lokasi'],
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('fo_joint_boxes')->insert($jointBoxes);
        return $jointBoxes;
    }

    protected function seedClients(array $clientLokasis, array $odps, int $companyId): void
    {
        $clients = [];
        $id = 1;

        foreach ($clientLokasis as $index => $lokasi) {
            // Assign an ODP to each client
            $odp = $odps[$index] ?? null;

            $clients[] = [
                'id' => $id++,
                'lokasi_id' => $lokasi['id'],
                'odp_id' => $odp['id'] ?? null,
                'client_id' => null, // No linked client for now
                'company_id' => $companyId,
                'nama_client' => $lokasi['nama_lokasi'],
                'alamat' => 'Jl. ' . $lokasi['nama_lokasi'],
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('fo_client_ftths')->insert($clients);
    }
}
