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
        $page = $request->get('page', 1);
        $perPage = 50; // Always 50, max 50 latest records
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        // Get barang info
        $barang = Barang::select('id', 'sku', 'barcode', 'deskripsi', 'harga_beli', 'satuan')
            ->findOrFail($barangId);

        // Get cost history dengan filter tanggal dan pagination
        // Order by created_at DESC untuk data terbaru
        $query = BarangCostHistory::where('barang_id', $barangId)
            ->with(['user:id,name']);

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $history = $query->orderBy('created_at', 'desc')->orderBy('id', 'desc')->paginate($perPage, ['*'], 'page', $page);

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

        // Get all cost records ordered by created_at DESC to get latest first
        $allRecords = BarangCostHistory::where('barang_id', $barangId)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        // Get current cost from barang_stock
        $barangStock = \App\Models\BarangStock::where('barang_id', $barangId)->first();
        $currentCost = (int) ($barangStock?->harga_rata_rata ?? 0);

        if ($allRecords->isEmpty()) {
            // Jika tidak ada history, gunakan current cost sebagai cost sebelumnya dan terendah/tertinggi
            return response()->json([
                'status' => 'ok',
                'data' => [
                    'cost_sebelumnya' => $currentCost,
                    'current_cost' => $currentCost,
                    'cost_terendah' => $currentCost,
                    'cost_tertinggi' => $currentCost,
                    'total_changes' => 0,
                    'first_change_at' => null,
                    'last_change_at' => null,
                    'total_change' => 0,
                ],
            ]);
        }

        // Get latest and oldest cost record
        $latest = $allRecords->first();  // Latest because ordered DESC
        $oldest = $allRecords->last();   // Oldest because ordered DESC

        // Get min and max cost from ALL values (lama + baru)
        $allCostValues = [];
        foreach ($allRecords as $record) {
            if ($record->harga_rata_rata_lama > 0) {
                $allCostValues[] = $record->harga_rata_rata_lama;
            }
            if ($record->harga_rata_rata_baru > 0) {
                $allCostValues[] = $record->harga_rata_rata_baru;
            }
        }

        $minCost = !empty($allCostValues) ? (int) min($allCostValues) : $currentCost;
        $maxCost = !empty($allCostValues) ? (int) max($allCostValues) : $currentCost;

        // Count changes
        $changeCount = $allRecords->count();

        // cost_sebelumnya = harga_baru dari oldest record (cost sebelum semua perubahan terjadi)
        $costSebelumnya = (int) ($oldest?->harga_rata_rata_baru ?? 0);
        $totalChange = $currentCost - $costSebelumnya;

        return response()->json([
            'status' => 'ok',
            'data' => [
                'cost_sebelumnya' => $costSebelumnya,
                'current_cost' => $currentCost,
                'cost_terendah' => $minCost,
                'cost_tertinggi' => $maxCost,
                'total_changes' => $changeCount,
                'first_change_at' => $oldest?->created_at,
                'last_change_at' => $latest?->created_at,
                'total_change' => $totalChange,
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
