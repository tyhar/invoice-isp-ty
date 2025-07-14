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
        // Only 1 main lokasi for testing
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
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedOdpLokasis(): array
    {
        // Only 1 ODP lokasi for testing
        $lokasis = [
            [
                'id' => 2,
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
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedClientLokasis(): array
    {
        // Only 1 client lokasi for testing
        $lokasis = [
            [
                'id' => 3,
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
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedJointBoxLokasis(): array
    {
        // Only 1 jointbox lokasi for testing
        $lokasis = [
            [
                'id' => 4,
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
        ];
        DB::table('fo_lokasis')->insert($lokasis);
        return $lokasis;
    }

    protected function seedKabelOdcs(array $mainLokasis, array $jointBoxLokasis, array $odpLokasis): array
    {
        $kabelOdcs = [];
        $id = 1;

        // Only 1 kabel ODC for main lokasi
        $kabelOdcs[] = [
            'id' => $id++,
            'nama_kabel' => 'Kabel ' . $mainLokasis[0]['nama_lokasi'] . ' (2 core)',
            'tipe_kabel' => 'multicore',
            'panjang_kabel' => 1000.0,
            'jumlah_tube' => 1,
            'jumlah_core_in_tube' => 2,
            'jumlah_total_core' => 2,
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        // Only 1 kabel ODC for jointbox lokasi
        $kabelOdcs[] = [
            'id' => $id++,
            'nama_kabel' => 'Kabel ' . $jointBoxLokasis[0]['nama_lokasi'],
            'tipe_kabel' => 'multicore',
            'panjang_kabel' => 500.0,
            'jumlah_tube' => 1,
            'jumlah_core_in_tube' => 2,
            'jumlah_total_core' => 2,
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
        // Only 1 kabel ODC for ODP lokasi
        $kabelOdcs[] = [
            'id' => $id++,
            'nama_kabel' => 'Kabel ' . $odpLokasis[0]['nama_lokasi'],
            'tipe_kabel' => 'multicore',
            'panjang_kabel' => 750.0,
            'jumlah_tube' => 1,
            'jumlah_core_in_tube' => 2,
            'jumlah_total_core' => 2,
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
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
        $colors = ['biru']; // Only 1 color needed

        foreach ($kabelOdcs as $kabelOdc) {
            // Only 1 tube per kabel
            $tubeOdcs[] = [
                'id' => $id++,
                'kabel_odc_id' => $kabelOdc['id'],
                'warna_tube' => $colors[0],
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('fo_kabel_tube_odcs')->insert($tubeOdcs);
        return $tubeOdcs;
    }

    protected function seedKabelCoreOdcs(array $tubeOdcs, array $kabelOdcs): array
    {
        $coreOdcs = [];
        $id = 1;
        $colors = ['biru', 'jingga']; // Only 2 colors needed

        foreach ($tubeOdcs as $tubeOdc) {
            // Only 2 cores per tube
            for ($i = 0; $i < 2; $i++) {
                $coreOdcs[] = [
                    'id' => $id++,
                    'kabel_tube_odc_id' => $tubeOdc['id'],
                    'warna_core' => $colors[$i],
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
