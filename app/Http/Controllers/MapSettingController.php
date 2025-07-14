<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MapSetting;

class MapSettingController extends Controller
{
    public function getMapCenter()
    {
        $setting = MapSetting::latest()->first();
        return response()->json([
            'latitude' => $setting?->latitude ?? -7.56526,
            'longitude' => $setting?->longitude ?? 110.81653,
        ]);
    }

    public function updateMapCenter(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $setting = MapSetting::create([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json(['message' => 'Map center updated.', 'data' => $setting]);
    }
}
