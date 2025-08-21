<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FilterLokasi;
use Illuminate\Support\Facades\DB;

class FilterLokasiController extends Controller
{
    public function index(Request $request)
    {
        // 1) Base: derive unique province/city from fo_lokasis (always include all cities)
        $base = DB::table('fo_lokasis')
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

        // Build a map of base entries keyed by normalized provinsi|kota
        $baseMap = [];
        foreach ($base as $row) {
            if (!empty($row['provinsi']) && !empty($row['kota'])) {
                $key = strtolower(trim($row['provinsi'])) . '|' . strtolower(trim($row['kota']));
                $baseMap[$key] = $row;
            }
        }

        // 2) Optional curated overlay from filter_lokasi: overlay coordinates and extra fields
        $curated = FilterLokasi::select('latitude','longitude','negara','provinsi','kota','jalan','desa','kodepos')->get();
        foreach ($curated as $c) {
            if (!$c->provinsi || !$c->kota) {
                continue; // skip incomplete keys
            }
            $key = strtolower(trim($c->provinsi)) . '|' . strtolower(trim($c->kota));
            $payload = [
                'latitude' => $c->latitude,
                'longitude' => $c->longitude,
                'negara' => $c->negara,
                'provinsi' => $c->provinsi,
                'kota' => $c->kota,
                'jalan' => $c->jalan,
                'desa' => $c->desa,
                'kodepos' => $c->kodepos,
            ];
            // Overlay if exists, otherwise add as new entry
            $baseMap[$key] = array_merge($baseMap[$key] ?? [], $payload);
        }

        $merged = array_values($baseMap);

        return response()->json([
            'status' => 'success',
            'data' => $merged,
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
