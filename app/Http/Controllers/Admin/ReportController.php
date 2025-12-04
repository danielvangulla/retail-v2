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

    public function salesByDate(Request $request): JsonResponse
    {
        $from = Carbon::parse($request->date_from)->startOfDay();
        $to = Carbon::parse($request->date_to)->endOfDay();

        // Query to get sales data with cost calculation using historical purchase price from stock movements
        $sql = "
            SELECT
                DATE(t.jam_mulai) as date,
                COUNT(DISTINCT t.id) as total_transactions,
                COALESCE(SUM(td.qty), 0) as total_items,
                SUM(td.brutto) as total_sales,
                SUM(td.disc_spv + td.disc_promo) as total_discount,
                SUM(td.netto) as net_sales,
                SUM(td.qty * COALESCE(
                    (SELECT harga_beli FROM barang_stock_movements
                     WHERE barang_id = b.id AND created_at <= t.jam_mulai
                     ORDER BY created_at DESC LIMIT 1),
                    b.harga_beli, 0
                )) as total_cost
            FROM transaksis t
            LEFT JOIN transaksi_dets td ON t.id = td.transaksi_id
            LEFT JOIN barang b ON td.sku = b.id
            WHERE t.jam_mulai BETWEEN ? AND ?
            GROUP BY DATE(t.jam_mulai)
            ORDER BY date DESC
        ";

        $data = DB::connection()->select($sql, [$from, $to]);

        // Convert to collection and format dates
        $data = collect($data)->map(function ($item) {
            $item->display_date = \Carbon\Carbon::createFromFormat('Y-m-d', $item->date)->translatedFormat('d M Y');
            return $item;
        });

        return response()->json([
            'status' => 'ok',
            'data' => $data,
        ]);
    }

    public function salesByCategory(Request $request): JsonResponse
    {
        $from = Carbon::parse($request->date_from)->startOfDay();
        $to = Carbon::parse($request->date_to)->endOfDay();
        $page = $request->page ?? 1;

        // Query to get sales by category with cost calculation using historical purchase price from stock movements
        $sql = "
            SELECT
                k.id as kategori_id,
                k.ket as kategori_name,
                COUNT(DISTINCT t.id) as total_transactions,
                SUM(td.qty) as total_items,
                SUM(td.brutto) as total_sales,
                SUM(td.disc_spv + td.disc_promo) as total_discount,
                SUM(td.netto) as net_sales,
                SUM(td.qty * COALESCE(
                    (SELECT harga_beli FROM barang_stock_movements
                     WHERE barang_id = b.id AND created_at <= t.jam_mulai
                     ORDER BY created_at DESC LIMIT 1),
                    b.harga_beli, 0
                )) as total_cost
            FROM transaksis t
            INNER JOIN transaksi_dets td ON t.id = td.transaksi_id
            INNER JOIN barang b ON td.sku = b.id
            INNER JOIN kategori k ON b.kategori_id = k.id
            WHERE t.jam_mulai BETWEEN ? AND ?
            GROUP BY k.id, k.ket
            ORDER BY total_sales DESC
        ";

        $query = DB::connection()->select($sql, [$from, $to]);

        // Convert to collection
        $collection = collect($query);

        // Manual pagination
        $perPage = 15;
        $currentPage = $page;
        $total = $collection->count();
        $items = $collection->slice(($currentPage - 1) * $perPage, $perPage)->values();

        $data = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $currentPage,
            [
                'path' => '',
                'query' => [],
                'pageName' => 'page',
            ]
        );

        return response()->json([
            'status' => 'ok',
            'data' => $data,
        ]);
    }

    public function salesByItem(Request $request): JsonResponse
    {
        $from = Carbon::parse($request->date_from)->startOfDay();
        $to = Carbon::parse($request->date_to)->endOfDay();
        $page = $request->page ?? 1;

        // Query to get sales by item with cost calculation using historical purchase price from stock movements
        $sql = "
            SELECT
                b.id as barang_id,
                b.sku,
                b.deskripsi,
                SUM(td.qty) as total_qty,
                SUM(td.brutto) as total_sales,
                SUM(td.disc_spv + td.disc_promo) as total_discount,
                SUM(td.netto) as net_sales,
                SUM(td.qty * COALESCE(
                    (SELECT harga_beli FROM barang_stock_movements
                     WHERE barang_id = b.id AND created_at <= t.jam_mulai
                     ORDER BY created_at DESC LIMIT 1),
                    b.harga_beli, 0
                )) as total_cost
            FROM transaksis t
            INNER JOIN transaksi_dets td ON t.id = td.transaksi_id
            INNER JOIN barang b ON td.sku = b.id
            WHERE t.jam_mulai BETWEEN ? AND ?
            GROUP BY b.id, b.sku, b.deskripsi
            ORDER BY total_sales DESC
        ";

        $query = DB::connection()->select($sql, [$from, $to]);

        // Convert to collection
        $collection = collect($query);

        // Manual pagination
        $perPage = 15;
        $currentPage = $page;
        $total = $collection->count();
        $items = $collection->slice(($currentPage - 1) * $perPage, $perPage)->values();

        $data = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $currentPage,
            [
                'path' => '',
                'query' => [],
                'pageName' => 'page',
            ]
        );

        return response()->json([
            'status' => 'ok',
            'data' => $data,
        ]);
    }
}
