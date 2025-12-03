<?php

namespace App\Http\Controllers\Admin;

use App\Models\BarangCostHistory;
use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class CostHistoryController
{
    /**
     * Display cost history page
     */
    public function index(): Response
    {
        return Inertia::render('admin/CostHistory/Index');
    }

    /**
     * Get cost history for specific barang
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
        $barang = Barang::select('id', 'sku', 'barcode', 'deskripsi', 'harga_beli', 'satuan')
            ->findOrFail($barangId);

        // Get cost history dengan filter tanggal dan pagination
        $query = BarangCostHistory::where('barang_id', $barangId)
            ->with(['user:id,name']);

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $history = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'ok',
            'data' => [
                'barang' => $barang,
                'history' => $history->items(),
                'pagination' => [
                    'total' => $history->total(),
                    'per_page' => $history->perPage(),
                    'current_page' => $history->currentPage(),
                    'last_page' => $history->lastPage(),
                    'has_more' => $history->hasMorePages(),
                ],
            ],
        ]);
    }

    /**
     * Get cost history summary for barang
     */
    public function getSummary(Request $request): JsonResponse
    {
        $request->validate([
            'barang_id' => 'required|uuid|exists:barang,id',
        ]);

        $barangId = $request->get('barang_id');

        // Get first and last cost record
        $first = BarangCostHistory::where('barang_id', $barangId)
            ->orderBy('created_at', 'asc')
            ->first();

        $last = BarangCostHistory::where('barang_id', $barangId)
            ->orderBy('created_at', 'desc')
            ->first();

        // Count changes
        $changeCount = BarangCostHistory::where('barang_id', $barangId)->count();

        // Get current cost from barang_stock
        $barangStock = \App\Models\BarangStock::where('barang_id', $barangId)->first();
        $currentCost = $barangStock?->harga_rata_rata ?? 0;

        return response()->json([
            'status' => 'ok',
            'data' => [
                'initial_cost' => $first?->harga_rata_rata_lama ?? 0,
                'current_cost' => (int) $currentCost,
                'total_changes' => $changeCount,
                'first_change_at' => $first?->created_at,
                'last_change_at' => $last?->created_at,
                'total_change' => ($last?->harga_rata_rata_baru ?? 0) - ($first?->harga_rata_rata_lama ?? 0),
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
