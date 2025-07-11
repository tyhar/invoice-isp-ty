<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\FilterLokasi;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FilterLokasiControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_method_returns_success_response()
    {
        // Create some test data
        FilterLokasi::create([
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'negara' => 'Indonesia',
            'provinsi' => 'DKI Jakarta',
            'kota' => 'Jakarta',
            'jalan' => 'Jl. Sudirman',
            'desa' => 'Kebayoran Baru',
            'kodepos' => '12190'
        ]);

        $response = $this->get('/api/v1/filter-lokasi');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data' => [
                        '*' => [
                            'latitude',
                            'longitude',
                            'negara',
                            'provinsi',
                            'kota',
                            'jalan',
                            'desa',
                            'kodepos'
                        ]
                    ]
                ]);
    }

    public function test_statistik_per_daerah_method_returns_success_response()
    {
        $response = $this->get('/api/v1/filter-lokasi/statistik');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data'
                ]);
    }
}
