<?php

namespace App\Http\Controllers\Admin;

use App\Models\Barang;
use App\Models\BarangStockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KartuStokController
{
    /**
     * Display kartu stok list page
     */
    public function index(): Response
    {
        return Inertia::render('admin/KartuStok/Index');
    }

    /**
     * Get kartu stok (history) untuk specific barang
     */
    public function getHistory(Request $request): JsonResponse
    {
        $request->validate([
            'barang_id' => 'required|uuid|exists:barang,id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:5|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $barangId = $request->get('barang_id');
        $perPage = $request->get('per_page', 50);
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        // Get barang info
        $barang = Barang::select('id', 'sku', 'barcode', 'deskripsi', 'harga_beli', 'harga_jual1', 'satuan')
            ->findOrFail($barangId);

        // Get movements dengan filter tanggal dan pagination
        $query = BarangStockMovement::where('barang_id', $barangId)
            ->with(['user:id,name'])
            ->select('id', 'barang_id', 'type', 'quantity', 'movement_date', 'reference_type', 'reference_id', 'notes', 'user_id', 'harga_beli', 'harga_jual');

        if ($dateFrom) {
            $query->whereDate('movement_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('movement_date', '<=', $dateTo);
        }

        $movements = $query->orderBy('movement_date', 'asc')->paginate($perPage);

        return response()->json([
            'status' => 'ok',
            'data' => [
                'barang' => $barang,
                'movements' => $movements->items(),
                'pagination' => [
                    'total' => $movements->total(),
                    'per_page' => $movements->perPage(),
                    'current_page' => $movements->currentPage(),
                    'last_page' => $movements->lastPage(),
                    'has_more' => $movements->hasMorePages(),
                ],
            ],
        ]);
    }

    /**
     * List barang untuk search
     */
    public function barangList(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $limit = $request->get('limit', 20);

        $barangs = Barang::where('st_aktif', 1)
            ->where(function ($q) use ($query) {
                $q->where('sku', 'like', "%{$query}%")
                    ->orWhere('barcode', 'like', "%{$query}%")
                    ->orWhere('deskripsi', 'like', "%{$query}%")
                    ->orWhere('alias', 'like', "%{$query}%");
            })
            ->select('id', 'sku', 'barcode', 'deskripsi', 'satuan')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 'ok',
            'data' => $barangs,
        ]);
    }
}
