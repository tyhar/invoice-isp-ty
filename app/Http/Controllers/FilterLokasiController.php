<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FilterLokasi;
use Illuminate\Support\Facades\DB;

class FilterLokasiController extends Controller
{
    public function index(Request $request)
    {
        // Primary source: precomputed filter_lokasi table
        $lokasi = FilterLokasi::select(
            'latitude',
            'longitude',
            'negara',
            'provinsi',
            'kota',
            'jalan',
            'desa',
            'kodepos'
        )->get();

        // Fallback: derive unique province/city from fo_lokasis when filter_lokasi is empty
        if ($lokasi->isEmpty()) {
            $derived = DB::table('fo_lokasis')
                ->whereNull('fo_lokasis.deleted_at')
                ->whereNotNull('fo_lokasis.province')
                ->whereNotNull('fo_lokasis.city')
                ->select(
                    DB::raw('MIN(fo_lokasis.latitude) as latitude'),
                    DB::raw('MIN(fo_lokasis.longitude) as longitude'),
                    DB::raw('fo_lokasis.province as provinsi'),
                    DB::raw('fo_lokasis.city as kota')
                )
                ->groupBy('fo_lokasis.province', 'fo_lokasis.city')
                ->get()
                ->map(function ($row) {
                    return [
                        'latitude' => $row->latitude,
                        'longitude' => $row->longitude,
                        'negara' => null,
                        'provinsi' => $row->provinsi,
                        'kota' => $row->kota,
                        'jalan' => null,
                        'desa' => null,
                        'kodepos' => null,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $derived,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $lokasi
        ]);
    }

    public function statistikPerDaerah()
    {
        // Compute statistics directly from fo_lokasis for robustness
        $data = DB::table('fo_lokasis')
            ->leftJoin('fo_client_ftths', function ($join) {
                $join->on('fo_client_ftths.lokasi_id', '=', 'fo_lokasis.id')
                    ->whereNull('fo_client_ftths.deleted_at');
            })
            ->leftJoin('fo_odps', function ($join) {
                $join->on('fo_odps.lokasi_id', '=', 'fo_lokasis.id')
                    ->whereNull('fo_odps.deleted_at');
            })
            ->leftJoin('fo_odcs', function ($join) {
                $join->on('fo_odcs.lokasi_id', '=', 'fo_lokasis.id')
                    ->whereNull('fo_odcs.deleted_at');
            })
            ->whereNull('fo_lokasis.deleted_at')
            ->select(
                DB::raw('fo_lokasis.province as provinsi'),
                DB::raw('fo_lokasis.city as kota'),
                DB::raw('COUNT(DISTINCT fo_client_ftths.id) as total_client'),
                DB::raw('COUNT(DISTINCT fo_odps.id) as total_odp'),
                DB::raw('COUNT(DISTINCT fo_odcs.id) as total_odc')
            )
            ->groupBy('fo_lokasis.province', 'fo_lokasis.city')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}
