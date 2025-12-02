<?php

namespace App\Http\Controllers\FrontRetail;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\Request;

class BarangController extends Controller
{
    /**
     * Search barang on-demand dengan realtime stock
     * Dipanggil dari kasir search box, max 20 hasil
     */
    public function barangSearch(Request $r)
    {
        try {
            $query = $r->q ?? '';

            if (strlen($query) < 2) {
                return response()->json([
                    'status' => 'ok',
                    'data' => []
                ], 200);
            }

            $results = Barang::searchBarang($query);

            return response()->json([
                'status' => 'ok',
                'data' => $results
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error searching barang: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Get all barang list untuk admin/export
     */
    public function barangList(Request $r)
    {
        try {
            $show = $r->show ?? 1; // 1 = aktif, 0 = nonaktif, null = semua

            $results = Barang::getBarangList();

            if ($show === 0) {
                $results = Barang::where('st_aktif', 0)->get();
            } elseif ($show === 1) {
                $results = Barang::where('st_aktif', 1)->get();
            }

            return response()->json([
                'status' => 'ok',
                'data' => $results
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error loading barang list: ' . $th->getMessage()
            ], 500);
        }
    }
}
