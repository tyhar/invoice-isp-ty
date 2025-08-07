<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoTableSeeder extends Seeder
{
    public function run()
    {
        $companyId = 1; // Default company ID

        $this->command->info('Starting FoTableSeeder - Mapping-Ready, Unique Core, ODC-to-ODC Connections...');
        $this->disableForeignKeys();
        $this->truncateAll();
        $this->enableForeignKeys();

        // 1. Seed Lokasi (locations for ODCs, ODPs, and Clients)
        $odcLokasis = $this->seedOdcLokasis();
        $odpLokasis = $this->seedOdpLokasis();
        $clientLokasis = $this->seedClientLokasis();

        // 2. Seed KabelOdcs (2 cables)
        $kabelOdcs = $this->seedKabelOdcs();

        // 3. Seed ODCs (ODC1 and ODC2 share kabel_odc_id=1, ODC3 uses kabel_odc_id=2)
        $odcs = $this->seedOdcs($odcLokasis, $kabelOdcs);

        // 4. Seed KabelTubeOdcs (tubes within cables)
        $tubeOdcs = $this->seedKabelTubeOdcs($kabelOdcs);

        // 5. Seed KabelCoreOdcs (fiber cores within tubes)
        $coreOdcs = $this->seedKabelCoreOdcs($tubeOdcs);

        // 6. Seed ODPs (each ODP gets a unique core and unique ODC)
        $odps = $this->seedOdps($odpLokasis, $coreOdcs, $odcs);

        // 7. Seed Client FTTH (each client gets a unique ODP)
        $this->seedClients($clientLokasis, $odps, $companyId);

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
                'fo_odps',
                'fo_kabel_core_odcs',
                'fo_kabel_tube_odcs',
                'fo_kabel_odcs',
                'fo_odcs',
                'fo_lokasis',
            ] as $table
        ) {
            DB::table($table)->truncate();
        }
    }

    protected function seedOdcLokasis(): array
    {
        $lokasis = [
            [
                'id' => 1,
                'nama_lokasi' => 'ODC North Jakarta',
                'deskripsi' => 'ODC 1 Location - North Jakarta',
                'latitude' => -6.1149,
                'longitude' => 106.8451,
                'city' => 'Jakarta Utara',
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
                'nama_lokasi' => 'ODC South Jakarta',
                'deskripsi' => 'ODC 2 Location - South Jakarta',
                'latitude' => -6.3033,
                'longitude' => 106.8150,
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
                'id' => 3,
                'nama_lokasi' => 'ODC East Jakarta',
                'deskripsi' => 'ODC 3 Location - East Jakarta',
                'latitude' => -6.2265,
                'longitude' => 106.9005,
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

    protected function seedOdpLokasis(): array
    {
        $lokasis = [
            [
                'id' => 4,
                'nama_lokasi' => 'ODP West Jakarta',
                'deskripsi' => 'ODP 1 Location - West Jakarta',
                'latitude' => -6.1658,
                'longitude' => 106.7778,
                'city' => 'Jakarta Barat',
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
                'nama_lokasi' => 'ODP South Tangerang',
                'deskripsi' => 'ODP 2 Location - BSD Area',
                'latitude' => -6.3054,
                'longitude' => 106.6520,
                'city' => 'Tangerang Selatan',
                'province' => 'Banten',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'nama_lokasi' => 'ODP Bekasi Barat',
                'deskripsi' => 'ODP 3 Location - Bekasi West Side',
                'latitude' => -6.2455,
                'longitude' => 106.9900,
                'city' => 'Bekasi',
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

    protected function seedClientLokasis(): array
    {
        $lokasis = [
            [
                'id' => 7,
                'nama_lokasi' => 'Client Ancol',
                'deskripsi' => 'Client 1 Location - Ancol Seaside',
                'latitude' => -6.1231,
                'longitude' => 106.8480,
                'city' => 'Jakarta Utara',
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
                'nama_lokasi' => 'Client Pondok Indah',
                'deskripsi' => 'Client 2 Location - South Jakarta Elite Area',
                'latitude' => -6.2752,
                'longitude' => 106.7839,
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
                'id' => 9,
                'nama_lokasi' => 'Client Cibubur',
                'deskripsi' => 'Client 3 Location - East Side Suburb',
                'latitude' => -6.3658,
                'longitude' => 106.8955,
                'city' => 'Depok',
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

    protected function seedKabelOdcs(): array
    {
        $kabelOdcs = [
            [
                'id' => 1,
                'nama_kabel' => 'Main Cable A',
                'deskripsi' => 'Cable shared by ODC1 and ODC2',
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 2000.0,
                'jumlah_tube' => 1,
                'jumlah_core_in_tube' => 3,
                'jumlah_total_core' => 3,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nama_kabel' => 'Main Cable B',
                'deskripsi' => 'Cable for ODC3',
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 1500.0,
                'jumlah_tube' => 1,
                'jumlah_core_in_tube' => 1,
                'jumlah_total_core' => 1,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_kabel_odcs')->insert($kabelOdcs);
        return $kabelOdcs;
    }

    protected function seedOdcs(array $odcLokasis, array $kabelOdcs): array
    {
        // ODC1 and ODC2 share kabel_odc_id=1, ODC3 uses kabel_odc_id=2
        $odcs = [
            [
                'id' => 1,
                'lokasi_id' => $odcLokasis[0]['id'],
                'kabel_odc_id' => $kabelOdcs[0]['id'],
                'nama_odc' => 'ODC 1',
                'deskripsi' => 'ODC 1 sharing cable with ODC 2',
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'lokasi_id' => $odcLokasis[1]['id'],
                'kabel_odc_id' => $kabelOdcs[0]['id'],
                'nama_odc' => 'ODC 2',
                'deskripsi' => 'ODC 2 sharing cable with ODC 1',
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'lokasi_id' => $odcLokasis[2]['id'],
                'kabel_odc_id' => $kabelOdcs[1]['id'],
                'nama_odc' => 'ODC 3',
                'deskripsi' => 'ODC 3 with its own cable',
                'tipe_splitter' => '1:8',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('fo_odcs')->insert($odcs);
        return $odcs;
    }

    protected function seedKabelTubeOdcs(array $kabelOdcs): array
    {
        $tubeOdcs = [];
        $id = 1;
        foreach ($kabelOdcs as $kabelOdc) {
            for ($tubeIndex = 0; $tubeIndex < $kabelOdc['jumlah_tube']; $tubeIndex++) {
                $tubeOdcs[] = [
                    'id' => $id++,
                    'kabel_odc_id' => $kabelOdc['id'],
                    'deskripsi' => 'Tube ' . ($tubeIndex + 1) . ' for ' . $kabelOdc['nama_kabel'],
                    'warna_tube' => $tubeIndex === 0 ? 'biru' : 'jingga',
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

    protected function seedKabelCoreOdcs(array $tubeOdcs): array
    {
        $coreOdcs = [];
        $id = 1;
        foreach ($tubeOdcs as $tubeOdc) {
            for ($coreIndex = 0; $coreIndex < 3; $coreIndex++) {
                $coreOdcs[] = [
                    'id' => $id++,
                    'kabel_tube_odc_id' => $tubeOdc['id'],
                    'deskripsi' => 'Core ' . ($coreIndex + 1) . ' for tube ' . $tubeOdc['id'],
                    'warna_core' => $coreIndex === 0 ? 'biru' : ($coreIndex === 1 ? 'jingga' : 'hijau'),
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

    protected function seedOdps(array $odpLokasis, array $coreOdcs, array $odcs): array
    {
        $odps = [];
        $id = 1;
        // Each ODP gets a unique core and unique ODC
        foreach ($odpLokasis as $index => $lokasi) {
            $coreOdc = $coreOdcs[$index] ?? null;
            $odc = $odcs[$index] ?? null;
            $odps[] = [
                'id' => $id++,
                'lokasi_id' => $lokasi['id'],
                'kabel_core_odc_id' => $coreOdc['id'] ?? null,
                'odc_id' => $odc['id'] ?? null,
                'nama_odp' => 'ODP ' . $lokasi['nama_lokasi'],
                'deskripsi' => 'ODP serving ' . $lokasi['nama_lokasi'],
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('fo_odps')->insert($odps);
        return $odps;
    }

    protected function seedClients(array $clientLokasis, array $odps, int $companyId): void
    {
        $clients = [];
        $id = 1;
        foreach ($clientLokasis as $index => $lokasi) {
            $odp = $odps[$index] ?? null;
            $clients[] = [
                'id' => $id++,
                'lokasi_id' => $lokasi['id'],
                'odp_id' => $odp['id'] ?? null,
                'client_id' => null,
                'company_id' => $companyId,
                'nama_client' => 'Client ' . $lokasi['nama_lokasi'],
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
