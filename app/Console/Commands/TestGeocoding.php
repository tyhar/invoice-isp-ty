<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GeocodingService;
use Illuminate\Support\Facades\Http;

class TestGeocoding extends Command
{
    protected $signature = 'test:geocoding';
    protected $description = 'Test the geocoding service';

    public function handle()
    {
        $this->info('Testing Geocoding Service...');

        // Test 1: Direct HTTP call
        $this->info("\n1. Testing direct HTTP call to Nominatim:");
        try {
            $response = Http::timeout(10)->get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => -7.575069,
                'lon' => 110.828565,
                'format' => 'json',
                'addressdetails' => 1,
                'accept-language' => 'en',
            ]);

            $this->info("Status: " . $response->status());
            $this->info("Response: " . $response->body());

            if ($response->successful()) {
                $data = $response->json();
                $this->info("Parsed data: " . json_encode($data, JSON_PRETTY_PRINT));
            }
        } catch (\Exception $e) {
            $this->error("HTTP Error: " . $e->getMessage());
        }

        // Test 2: GeocodingService
        $this->info("\n2. Testing GeocodingService:");
        try {
            $service = new GeocodingService();
            $result = $service->reverseGeocode(-7.575069, 110.828565);
            $this->info("Result: " . json_encode($result, JSON_PRETTY_PRINT));
        } catch (\Exception $e) {
            $this->error("Service Error: " . $e->getMessage());
        }

        $this->info("\nTest completed.");
    }
}
