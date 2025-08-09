<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FoTableSeeder extends Seeder
{
    public function run()
    {
        $companyId = 1; // Default company ID

        $this->command->info('Starting FoTableSeeder (Surakarta, Jawa Tengah) - Mapping-ready with ODC↔ODC + ODC→ODP via Joint Boxes...');
        $this->disableForeignKeys();
        $this->truncateAll();
        $this->enableForeignKeys();

        // 1. Seed Lokasi (locations for ODCs, ODPs, and Clients) - Surakarta area
        $odcLokasis = $this->seedOdcLokasis();
        $odpLokasis = $this->seedOdpLokasis();
        $clientLokasis = $this->seedClientLokasis();

        // 2. Seed KabelOdcs (Solo rings)
        $kabelOdcs = $this->seedKabelOdcs();

        // 3. Seed ODCs (two ODCs share the same kabel_odc for ODC↔ODC visualization)
        $odcs = $this->seedOdcs($odcLokasis, $kabelOdcs);

        // 4. Seed KabelTubeOdcs (tubes within cables)
        $tubeOdcs = $this->seedKabelTubeOdcs($kabelOdcs);

        // 5. Seed KabelCoreOdcs (fiber cores within tubes)
        $coreOdcs = $this->seedKabelCoreOdcs($tubeOdcs);

        // 6. Seed ODPs (each ODP gets a unique core and links back to an ODC)
        $odps = $this->seedOdps($odpLokasis, $coreOdcs, $odcs);

        // 7. Seed Client FTTH (each client gets a unique ODP)
        $this->seedClients($clientLokasis, $odps, $companyId);

        // 8. Seed Joint Box Locations (independent locations around Surakarta)
        $this->seedJointBoxLokasis();

        // 9. Seed Joint Boxes (connecting ODC↔ODC and ODC→ODP)
        $this->seedJointBoxes($odcs, $odps, $kabelOdcs);

        $this->command->info('FoTableSeeder completed successfully (Surakarta dataset)!');
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
                'fo_joint_boxes',
                'fo_lokasis',
            ] as $table
        ) {
            DB::table($table)->truncate();
        }
    }

    protected function seedOdcLokasis(): array
    {
        // ODC locations around Surakarta
        $lokasis = [
            [
                'id' => 1,
                'nama_lokasi' => 'ODC Banjarsari (Utara Solo)',
                'deskripsi' => 'ODC Banjarsari - Utara Solo',
                'latitude' => -7.55113,
                'longitude' => 110.81373,
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
                'id' => 2,
                'nama_lokasi' => 'ODC Laweyan (Barat Solo)',
                'deskripsi' => 'ODC Laweyan - Barat Solo',
                'latitude' => -7.56194,
                'longitude' => 110.80167,
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
                'id' => 3,
                'nama_lokasi' => 'ODC Jebres (Timur Solo)',
                'deskripsi' => 'ODC Jebres - Timur Solo',
                'latitude' => -7.55889,
                'longitude' => 110.85727,
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
        return $lokasis;
    }

    protected function seedOdpLokasis(): array
    {
        // ODP locations distributed around Surakarta
        $lokasis = [
            [
                'id' => 4,
                'nama_lokasi' => 'ODP Manahan',
                'deskripsi' => 'ODP area Manahan',
                'latitude' => -7.55084,
                'longitude' => 110.79889,
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
                'id' => 5,
                'nama_lokasi' => 'ODP Serengan',
                'deskripsi' => 'ODP area Serengan',
                'latitude' => -7.57795,
                'longitude' => 110.82635,
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
                'id' => 6,
                'nama_lokasi' => 'ODP Pasar Kliwon',
                'deskripsi' => 'ODP area Pasar Kliwon',
                'latitude' => -7.57756,
                'longitude' => 110.84087,
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
        return $lokasis;
    }

    protected function seedClientLokasis(): array
    {
        // Client locations around Surakarta
        $lokasis = [
            [
                'id' => 7,
                'nama_lokasi' => 'Client Kleco',
                'deskripsi' => 'Client area Kleco',
                'latitude' => -7.5750,
                'longitude' => 110.8085,
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
                'id' => 8,
                'nama_lokasi' => 'Client Palur',
                'deskripsi' => 'Client area Palur',
                'latitude' => -7.5695,
                'longitude' => 110.8973,
                'city' => 'Karanganyar',
                'province' => 'Jawa Tengah',
                'country' => 'Indonesia',
                'geocoded_at' => now(),
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'nama_lokasi' => 'Client Colomadu',
                'deskripsi' => 'Client area Colomadu',
                'latitude' => -7.5297,
                'longitude' => 110.7500,
                'city' => 'Karanganyar',
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
        return $lokasis;
    }

    protected function seedKabelOdcs(): array
    {
        // Two cables: Solo Ring A shared between ODC1 & ODC2; Solo Ring B for ODC3
        $kabelOdcs = [
            [
                'id' => 1,
                'nama_kabel' => 'Solo Ring A',
                'deskripsi' => 'Cable shared by ODC Banjarsari and ODC Laweyan',
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 2200.0,
                'jumlah_tube' => 2,
                'jumlah_core_in_tube' => 3,
                'jumlah_total_core' => 6,
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'nama_kabel' => 'Solo Ring B',
                'deskripsi' => 'Cable dedicated to ODC Jebres',
                'tipe_kabel' => 'multicore',
                'panjang_kabel' => 1600.0,
                'jumlah_tube' => 2,
                'jumlah_core_in_tube' => 3,
                'jumlah_total_core' => 6,
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
        // ODC1 and ODC2 share kabel_odc_id=1 (Solo Ring A), ODC3 uses kabel_odc_id=2 (Solo Ring B)
        $odcs = [
            [
                'id' => 1,
                'lokasi_id' => $odcLokasis[0]['id'],
                'kabel_odc_id' => $kabelOdcs[0]['id'],
                'nama_odc' => 'ODC Banjarsari',
                'deskripsi' => 'ODC di kawasan Banjarsari',
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
                'nama_odc' => 'ODC Laweyan',
                'deskripsi' => 'ODC di kawasan Laweyan',
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
                'nama_odc' => 'ODC Jebres',
                'deskripsi' => 'ODC di kawasan Jebres',
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
            $colorCounts = ['biru' => 0, 'jingga' => 0, 'hijau' => 0, 'coklat' => 0, 'abu_abu' => 0, 'putih' => 0, 'merah' => 0, 'hitam' => 0, 'kuning' => 0, 'ungu' => 0, 'merah_muda' => 0, 'aqua' => 0];
            $colors = ['biru', 'jingga'];

            for ($tubeIndex = 0; $tubeIndex < $kabelOdc['jumlah_tube']; $tubeIndex++) {
                $warna = $colors[$tubeIndex % count($colors)];
                $colorCounts[$warna]++;
                $tubeOdcs[] = [
                    'id' => $id++,
                    'kabel_odc_id' => $kabelOdc['id'],
                    'deskripsi' => "Tube {$warna} ({$colorCounts[$warna]}) for {$kabelOdc['nama_kabel']}",
                    'warna_tube' => $warna,
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

        // Use jumlah_core_in_tube from fo_kabel_odcs
        $kabelOdcs = DB::table('fo_kabel_odcs')->get()->keyBy('id');

        foreach ($tubeOdcs as $tubeOdc) {
            $colorCounts = ['biru' => 0, 'jingga' => 0, 'hijau' => 0, 'coklat' => 0, 'abu_abu' => 0, 'putih' => 0, 'merah' => 0, 'hitam' => 0, 'kuning' => 0, 'ungu' => 0, 'merah_muda' => 0, 'aqua' => 0];

            preg_match('/\((\d+)\)/', $tubeOdc['deskripsi'], $matches);
            $tubeColorIndex = $matches[1] ?? 1;

            $kabelOdc = $kabelOdcs[$tubeOdc['kabel_odc_id']];
            $jumlahCorePerTube = $kabelOdc->jumlah_core_in_tube;

            for ($coreIndex = 0; $coreIndex < $jumlahCorePerTube; $coreIndex++) {
                $warna = $coreIndex === 0 ? 'biru' : ($coreIndex === 1 ? 'jingga' : 'hijau');
                $colorCounts[$warna]++;
                $coreOdcs[] = [
                    'id' => $id++,
                    'kabel_tube_odc_id' => $tubeOdc['id'],
                    'deskripsi' => "Core {$warna}({$colorCounts[$warna]}) for tube {$tubeOdc['warna_tube']}({$tubeColorIndex})",
                    'warna_core' => $warna,
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

        // Map each ODP to a core and to a related ODC (so ODC→ODP lines appear)
        foreach ($odpLokasis as $index => $lokasi) {
            $coreOdc = $coreOdcs[$index] ?? null; // first few cores
            // Alternate ODCs: first two ODPs to ODC1, last to ODC3
            $odc = $index < 2 ? $odcs[0] : $odcs[2];

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
            $odp = $odps[$index] ?? $odps[0];
            $clients[] = [
                'id' => $id++,
                'lokasi_id' => $lokasi['id'],
                'odp_id' => $odp['id'] ?? null,
                'client_id' => null,
                'company_id' => $companyId,
                'nama_client' => 'Client ' . $lokasi['nama_lokasi'],
                'alamat' => 'Jl. ' . $lokasi['nama_lokasi'] . ', Surakarta',
                'status' => 'active',
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('fo_client_ftths')->insert($clients);
    }

    protected function seedJointBoxLokasis(): array
    {
        // Joint box locations around Surakarta
        $lokasis = [
            [
                'nama_lokasi' => 'Joint Box Gladag',
                'deskripsi' => 'Joint box near Gladag (center of Solo)',
                'latitude' => -7.5733,
                'longitude' => 110.8236,
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
                'nama_lokasi' => 'Joint Box Gilingan',
                'deskripsi' => 'Joint box in Gilingan area',
                'latitude' => -7.5457,
                'longitude' => 110.8160,
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
                'nama_lokasi' => 'Joint Box Palur',
                'deskripsi' => 'Joint box towards Palur (east)',
                'latitude' => -7.5710,
                'longitude' => 110.8810,
                'city' => 'Karanganyar',
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

        // Get the inserted records with their auto-generated IDs
        $insertedLokasis = DB::table('fo_lokasis')
            ->whereIn('nama_lokasi', array_column($lokasis, 'nama_lokasi'))
            ->orderBy('id')
            ->get()
            ->toArray();

        return $insertedLokasis;
    }

    protected function seedJointBoxes(array $odcs, array $odps, array $kabelOdcs): void
    {
        $jointBoxes = [];
        $id = 1;

        // Create joint box locations first (returns inserted lokasi rows)
        $jointBoxLokasis = $this->seedJointBoxLokasis();

        // 1) Joint box for ODC↔ODC: between ODC Banjarsari and ODC Laweyan (shared Solo Ring A)
        $jointBoxes[] = [
            'id' => $id++,
            'lokasi_id' => $jointBoxLokasis[0]->id, // Gladag
            'kabel_odc_id' => $kabelOdcs[0]['id'], // Solo Ring A
            'odc_id' => $odcs[0]['id'], // ODC Banjarsari
            'odp_id' => null,
            'nama_joint_box' => 'Joint Box Banjarsari-Laweyan',
            'deskripsi' => 'Joint box connecting ODC Banjarsari and ODC Laweyan via Solo Ring A',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // 2) Joint box for ODC→ODP: ODC Banjarsari to ODP Manahan
        $jointBoxes[] = [
            'id' => $id++,
            'lokasi_id' => $jointBoxLokasis[1]->id, // Gilingan
            'kabel_odc_id' => $kabelOdcs[0]['id'],
            'odc_id' => $odcs[0]['id'], // ODC Banjarsari
            'odp_id' => $odps[0]['id'], // ODP Manahan
            'nama_joint_box' => 'Joint Box Manahan',
            'deskripsi' => 'Joint box routing ODC Banjarsari to ODP Manahan',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // 3) Joint box for ODC→ODP: ODC Jebres to ODP Pasar Kliwon (east side)
        $jointBoxes[] = [
            'id' => $id++,
            'lokasi_id' => $jointBoxLokasis[2]->id, // Palur
            'kabel_odc_id' => $kabelOdcs[1]['id'], // Solo Ring B
            'odc_id' => $odcs[2]['id'], // ODC Jebres
            'odp_id' => $odps[2]['id'], // ODP Pasar Kliwon
            'nama_joint_box' => 'Joint Box Pasar Kliwon',
            'deskripsi' => 'Joint box routing ODC Jebres to ODP Pasar Kliwon',
            'status' => 'active',
            'deleted_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('fo_joint_boxes')->insert($jointBoxes);
    }
}
