<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\Barang;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function sales(): Response
    {
        return Inertia::render('admin/Report/Sales');
    }

    public function salesData(Request $request): JsonResponse
    {
        $query = Transaksi::query()
            ->where('is_cancel', 0)
            ->where('status', '!=', 0);

        if ($request->date_from && $request->date_to) {
            $from = Carbon::parse($request->date_from)->startOfDay();
            $to = Carbon::parse($request->date_to)->endOfDay();
            $query->whereBetween('created_at', [$from, $to]);
        }

        if ($request->user_id) {
            $query->where('user_kasir_id', $request->user_id);
        }

        $data = $query->with(['details.barang', 'kasir'])
            ->orderByDesc('created_at')
            ->paginate(20);

        $summary = Transaksi::query()
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->when($request->date_from, function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->date_to, function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->selectRaw('COUNT(*) as total_transactions, SUM(bayar) as total_sales, AVG(bayar) as avg_sales')
            ->first();

        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'summary' => $summary,
        ]);
    }

    public function inventory(): Response
    {
        return Inertia::render('admin/Report/Inventory');
    }

    public function inventoryData(Request $request): JsonResponse
    {
        $query = Barang::where('show', 1);

        if ($request->search) {
            $query->where('deskripsi', 'LIKE', "%{$request->search}%")
                ->orWhere('barcode', 'LIKE', "%{$request->search}%");
        }

        if ($request->low_stock) {
            $query->whereRaw('stok <= min_stok');
        }

        $data = $query->with('kategori')
            ->paginate(20);

        $summary = Barang::where('show', 1)
            ->selectRaw('COUNT(*) as total_items, SUM(stok) as total_stok, COUNT(CASE WHEN stok <= min_stok THEN 1 END) as low_stock_items')
            ->first();

        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'summary' => $summary,
        ]);
    }
}
