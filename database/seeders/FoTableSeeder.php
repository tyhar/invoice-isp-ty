<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoTableSeeder extends Seeder
{
    public function run()
    {
        // Get the first company (fail if not found)
        $company = DB::table('companies')->first();
        if (!$company) {
            throw new \Exception('No company found. Please seed companies table first.');
        }
        $companyId = $company->id;

        $this->disableForeignKeys();
        $this->truncateAll();
        $this->enableForeignKeys();

<<<<<<< Updated upstream
        $lokasis = $this->seedLokasis();
        $odcs = $this->seedOdcs($lokasis);
        $kabelOdcs = $this->seedKabelOdcs($odcs);
        $tubeOdcs = $this->seedKabelTubeOdcs($kabelOdcs);
        $coreOdcs = $this->seedKabelCoreOdcs($tubeOdcs);
        $odps = $this->seedOdps($lokasis, $coreOdcs);
        $this->seedClients($lokasis, $odps);
=======
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
>>>>>>> Stashed changes

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

    protected function seedLokasis(): array
    {
<<<<<<< Updated upstream
        $rows = [];
        for ($i = 1; $i <= 3; $i++) {
            $rows[] = [
                'id'           => $i,
                'nama_lokasi'  => "Lokasi {$i}",
                'deskripsi'    => "Deskripsi lokasi {$i}",
                'latitude'     => -6.2 + $i * 0.01,
                'longitude'    => 106.8 + $i * 0.01,
                'status'       => 'active',
                'deleted_at'   => null, // soft delete default
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }
        DB::table('fo_lokasis')->insert($rows);
        return $rows;
=======
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
                'nama_lokasi' => 'ODP Lokasi Jakarta Timur',
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
                'nama_lokasi' => 'ODP Lokasi Cimahi',
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
                'nama_lokasi' => 'ODP Lokasi Sidoarjo',
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
                'nama_lokasi' => 'Client Lokasi Depok',
                'deskripsi' => 'Client Area Depok',
                'latitude' => -6.402,
                'longitude' => 106.794,
                'city' => 'Depok',
                'province' => 'Jawa Barat',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'nama_lokasi' => 'Client Lokasi Bekasi',
                'deskripsi' => 'Client Area Bekasi',
                'latitude' => -6.238,
                'longitude' => 106.975,
                'city' => 'Bekasi',
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
                'nama_lokasi' => 'Client Lokasi Gresik',
                'deskripsi' => 'Client Area Gresik',
                'latitude' => -7.156,
                'longitude' => 112.651,
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
>>>>>>> Stashed changes
    }

    protected function seedJointBoxLokasis(): array
    {
        // Add 2 joint box locations
        $lokasis = [
            [
                'id' => 10,
                'nama_lokasi' => 'JointBox Lokasi 1',
                'deskripsi' => 'JointBox Area 1',
                'latitude' => -6.200,
                'longitude' => 106.800,
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
                'id' => 11,
                'nama_lokasi' => 'JointBox Lokasi 2',
                'deskripsi' => 'JointBox Area 2',
                'latitude' => -6.900,
                'longitude' => 107.600,
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
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

    protected function seedOdcs(array $lokasis, array $kabelOdcs): array
    {
        $rows = [];
<<<<<<< Updated upstream
        foreach ($lokasis as $lokasi) {
            for ($i = 1; $i <= 2; $i++) {
                $rows[] = [
                    'id'           => (($lokasi['id'] - 1) * 2) + $i,
                    'lokasi_id'    => $lokasi['id'],
                    'nama_odc'     => "ODC {$lokasi['id']}-{$i}",
                    'tipe_splitter' => collect(['1:2', '1:4', '1:8', '1:16', '1:32', '1:64', '1:128'])->random(),
                    'status'       => 'active',
                    'deleted_at'   => null,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            }
=======
        $id = 1;
        foreach ($lokasis as $i => $lokasi) {
            $rows[] = [
                'id' => $id,
                'lokasi_id' => $lokasi['id'],
                'kabel_odc_id' => $kabelOdcs[$i]['id'], // assign kabel_odc_id
                'nama_odc' => "ODC-{$lokasi['city']}",
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            $id++;
>>>>>>> Stashed changes
        }
        DB::table('fo_odcs')->insert($rows);
        return $rows;
    }

    protected function seedKabelOdcs(array $mainLokasis, array $jointBoxLokasis, array $odpLokasis): array
    {
        // Create cables between ODC, JointBox, ODP
        $rows = [];
<<<<<<< Updated upstream
        foreach ($odcs as $odc) {
            for ($i = 1; $i <= 2; $i++) {
                $jumlahTube       = rand(1, 6);
                $jumlahCoreInTube = rand(2, 12);
                $rows[] = [
                    'id'                 => count($rows) + 1,
                    'odc_id'             => $odc['id'],
                    'nama_kabel'         => "KabelODC {$odc['id']}-{$i}",
                    'tipe_kabel'         => collect(['singlecore', 'multicore'])->random(),
                    'panjang_kabel'      => rand(100, 500),
                    'jumlah_tube'        => $jumlahTube,
                    'jumlah_core_in_tube' => $jumlahCoreInTube,
                    'jumlah_total_core'  => $jumlahTube * $jumlahCoreInTube,
                    'status'             => 'active',
                    'deleted_at'         => null,
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ];
            }
        }
=======
        $id = 1;
        // Cable 1: ODC (Monas) to JointBox 1
        $rows[] = [
            'id' => $id++,
            'nama_kabel' => 'KabelODC-Monas-JointBox1',
            'tipe_kabel' => 'multicore',
            'panjang_kabel' => 100,
            'jumlah_tube' => 2,
            'jumlah_core_in_tube' => 4,
            'jumlah_total_core' => 8,
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        // Cable 2: JointBox 1 to ODP (Jakarta Timur)
        $rows[] = [
            'id' => $id++,
            'nama_kabel' => 'KabelODC-JointBox1-ODP1',
            'tipe_kabel' => 'multicore',
            'panjang_kabel' => 80,
            'jumlah_tube' => 2,
            'jumlah_core_in_tube' => 4,
            'jumlah_total_core' => 8,
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        // Cable 3: ODP (Jakarta Timur) to Client (Depok)
        $rows[] = [
            'id' => $id++,
            'nama_kabel' => 'KabelODC-ODP1-Client1',
            'tipe_kabel' => 'multicore',
            'panjang_kabel' => 60,
            'jumlah_tube' => 2,
            'jumlah_core_in_tube' => 4,
            'jumlah_total_core' => 8,
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        // Add more cables for other ODC/ODP/JointBox as needed
>>>>>>> Stashed changes
        DB::table('fo_kabel_odcs')->insert($rows);
        return $rows;
    }

    protected function seedKabelTubeOdcs(array $kabelOdcs): array
    {
        $colors = ['biru', 'jingga', 'hijau', 'coklat', 'abu_abu', 'putih', 'merah', 'hitam', 'kuning', 'ungu', 'merah_muda', 'aqua'];
        $rows = [];
        foreach ($kabelOdcs as $kabel) {
            for ($i = 0; $i < $kabel['jumlah_tube']; $i++) {
                $rows[] = [
                    'id'             => count($rows) + 1,
                    'kabel_odc_id'   => $kabel['id'],
                    'warna_tube'     => $colors[$i % count($colors)],
                    'status'         => 'active',
                    'deleted_at'     => null,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ];
            }
        }
        DB::table('fo_kabel_tube_odcs')->insert($rows);
        return $rows;
    }

    protected function seedKabelCoreOdcs(array $tubeOdcs, array $kabelOdcs): array
    {
        $colors = ['biru', 'jingga', 'hijau', 'coklat', 'abu_abu', 'putih', 'merah', 'hitam', 'kuning', 'ungu', 'merah_muda', 'aqua'];
        $rows = [];
<<<<<<< Updated upstream
        foreach ($tubeOdcs as $tube) {
            // Tetap random antara 2–12 core per tube, meski migrasi tidak memaksa jumlah pasti
            for ($i = 0; $i < rand(2, 12); $i++) {
=======
        $id = 1;

        // Create a map of kabel_odc_id to jumlah_core_in_tube for consistency
        $kabelCoreMap = [];
        foreach ($kabelOdcs as $kabel) {
            $kabelCoreMap[$kabel['id']] = $kabel['jumlah_core_in_tube'];
        }

        foreach ($tubeOdcs as $tube) {
            // Get the correct jumlah_core_in_tube from the parent kabel_odc
            $jumlah_core = $kabelCoreMap[$tube['kabel_odc_id']] ?? 4;

            for ($i = 0; $i < $jumlah_core; $i++) {
>>>>>>> Stashed changes
                $rows[] = [
                    'id'               => count($rows) + 1,
                    'kabel_tube_odc_id' => $tube['id'],
                    'warna_core'       => $colors[$i % count($colors)],
                    'status'           => 'active',
                    'deleted_at'       => null,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            }
        }
        DB::table('fo_kabel_core_odcs')->insert($rows);
        return $rows;
    }

    protected function seedOdps(array $lokasis, array $coreOdcs): array
    {
        $rows = [];
        foreach ($lokasis as $lokasi) {
            foreach ($coreOdcs as $core) {
                // Contoh logika relasi: kalau id core mod id lokasi == 0
                if ($core['id'] % $lokasi['id'] === 0) {
                    $rows[] = [
                        'id'                 => count($rows) + 1,
                        'kabel_core_odc_id'  => $core['id'],
                        'lokasi_id'          => $lokasi['id'],
                        'nama_odp'           => "ODP {$lokasi['id']}-{$core['id']}",
                        'status'             => 'active',
                        'deleted_at'         => null,
                        'created_at'         => now(),
                        'updated_at'         => now(),
                    ];
                }
            }
        }
        DB::table('fo_odps')->insert($rows);
        return $rows;
    }

<<<<<<< Updated upstream
    protected function seedClients(array $lokasis, array $odps): void
=======
    protected function seedJointBoxes(array $jointBoxLokasis, array $kabelOdcs): array
    {
        // For each cable, create 1-2 joint boxes at different locations
        $rows = [];
        $id = 1;
        // Defensive: fallback to first lokasi if not enough jointBoxLokasis
        $lokasiA = $jointBoxLokasis[0]['id'] ?? 1;
        $lokasiB = $jointBoxLokasis[1]['id'] ?? $lokasiA;
        // Kabel 1: JointBox at LokasiA and LokasiB
        $rows[] = [
            'id' => $id++,
            'lokasi_id' => $lokasiA,
            'kabel_odc_id' => $kabelOdcs[0]['id'],
            'nama_joint_box' => 'JointBox-1A',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        $rows[] = [
            'id' => $id++,
            'lokasi_id' => $lokasiB,
            'kabel_odc_id' => $kabelOdcs[0]['id'],
            'nama_joint_box' => 'JointBox-1B',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        // Kabel 2: JointBox at LokasiA
        $rows[] = [
            'id' => $id++,
            'lokasi_id' => $lokasiA,
            'kabel_odc_id' => $kabelOdcs[1]['id'],
            'nama_joint_box' => 'JointBox-2A',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        // Kabel 3: JointBox at LokasiB
        $rows[] = [
            'id' => $id++,
            'lokasi_id' => $lokasiB,
            'kabel_odc_id' => $kabelOdcs[2]['id'],
            'nama_joint_box' => 'JointBox-3A',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        DB::table('fo_joint_boxes')->insert($rows);
        return $rows;
    }

    protected function seedClients(array $clientLokasis, array $odps, int $companyId): void
>>>>>>> Stashed changes
    {
        $rows = [];
<<<<<<< Updated upstream
        foreach ($lokasis as $lokasi) {
            foreach ($odps as $odp) {
                if ($odp['id'] % $lokasi['id'] === 0) {
                    $rows[] = [
                        'id'           => count($rows) + 1,
                        'lokasi_id'    => $lokasi['id'],
                        'odp_id'       => $odp['id'],
                        'nama_client'  => "Client {$lokasi['id']}-{$odp['id']}",
                        'alamat'       => "Jl. Dummy {$lokasi['id']}-{$odp['id']}",
                        'status'       => 'active',
                        'deleted_at'   => null,
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ];
                }
            }
=======
        for ($i = 0; $i < 3; $i++) {
            $rows[] = [
                'id' => $i + 1,
                'lokasi_id' => $clientLokasis[$i]['id'],
                'odp_id' => $odps[$i]['id'],
                'client_id' => null,
                'company_id' => $companyId,
                'nama_client' => "Client-{$clientLokasis[$i]['city']}",
                'alamat' => "Alamat {$clientLokasis[$i]['city']}",
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
>>>>>>> Stashed changes
        }
        DB::table('fo_client_ftths')->insert($rows);
    }
}
