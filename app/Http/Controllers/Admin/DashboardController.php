<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\User;
use App\Models\Transaksi;
use App\Models\BarangStock;
use App\Traits\ManageStok;
use App\Services\StokProcessingService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    use ManageStok;
    public function index(): Response
    {
        // Process any unprocessed stok items first
        StokProcessingService::processAll();
        // Get today's sales (only completed transactions, not cancelled)
        $todaySales = Transaksi::whereDate('created_at', today())
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->sum('bayar');

        // Get this month's sales
        $monthSales = Transaksi::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->sum('bayar');

        // Get total inventory value
        $totalItems = Barang::where('st_aktif', 1)->count();
        $lowStockItems = BarangStock::join('barang', 'barang_stock.barang_id', '=', 'barang.id')
            ->whereRaw('barang_stock.quantity - barang_stock.reserved < barang.min_stock')
            ->count();

        // Get total users
        $totalUsers = User::count();
        $supervisors = User::where('level', 1)->count();
        $kasirs = User::where('level', '>=', 2)->count();

        // Get sales trend (last 7 days)
        $salesTrend = Transaksi::selectRaw('DATE(created_at) as date, SUM(bayar) as total')
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->whereBetween('created_at', [now()->subDays(6), now()])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get top selling products
        $topProducts = DB::table('transaksi_dets as td')
            ->join('barang as b', 'td.sku', '=', 'b.id')
            ->join('transaksis as t', 'td.transaksi_id', '=', 't.id')
            ->where('t.is_cancel', 0)
            ->where('t.status', '!=', 0)
            ->whereBetween('t.created_at', [now()->subDays(30), now()])
            ->select('b.id', 'b.deskripsi', DB::raw('SUM(td.qty) as total_sold'), DB::raw('SUM(td.qty * td.harga) as total_revenue'))
            ->groupBy('b.id', 'b.deskripsi')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        // Get low stock items with monthly sales
        $lowStockList = DB::table('barang_stock')
            ->join('barang', 'barang_stock.barang_id', '=', 'barang.id')
            ->leftJoin(
                DB::raw('(SELECT td.sku, SUM(td.qty) as monthly_sold FROM transaksi_dets td INNER JOIN transaksis t ON td.transaksi_id = t.id WHERE t.is_cancel = 0 AND t.status != 0 AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY td.sku) as sales'),
                'barang.id',
                '=',
                'sales.sku'
            )
            ->whereRaw('barang_stock.quantity - barang_stock.reserved < barang.min_stock')
            ->select([
                'barang.id',
                'barang.deskripsi',
                'barang.satuan',
                'barang.min_stock',
                'barang_stock.quantity',
                'barang_stock.reserved',
                DB::raw('(barang_stock.quantity - barang_stock.reserved) as available'),
                DB::raw('COALESCE(sales.monthly_sold, 0) as monthly_sold'),
            ])
            ->orderBy('available', 'asc')
            ->limit(10)
            ->get();

        return Inertia::render('admin/Dashboard', [
            'todaySales' => (int) $todaySales,
            'monthSales' => (int) $monthSales,
            'totalItems' => $totalItems,
            'lowStockItems' => $lowStockItems,
            'totalUsers' => $totalUsers,
            'supervisors' => $supervisors,
            'kasirs' => $kasirs,
            'salesTrend' => $salesTrend->map(fn($item) => [
                'date' => $item->date ? Carbon::parse($item->date)->translatedFormat('d M Y') : '-',
                'total' => (int) $item->total,
            ]),
            'topProducts' => $topProducts,
            'lowStockList' => $lowStockList,
        ]);
    }

    /**
     * Get dashboard data as JSON for real-time updates
     */
    public function getData(): JsonResponse
    {
        // Process any unprocessed stok items first
        StokProcessingService::processAll();
        // Get today's sales
        $todaySales = Transaksi::whereDate('created_at', today())
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->sum('bayar');

        // Get this month's sales
        $monthSales = Transaksi::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->sum('bayar');

        // Get sales trend (last 7 days)
        $salesTrend = Transaksi::selectRaw('DATE(created_at) as date, SUM(bayar) as total')
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->whereBetween('created_at', [now()->subDays(6), now()])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get top selling products
        $topProducts = DB::table('transaksi_dets as td')
            ->join('barang as b', 'td.sku', '=', 'b.id')
            ->join('transaksis as t', 'td.transaksi_id', '=', 't.id')
            ->where('t.is_cancel', 0)
            ->where('t.status', '!=', 0)
            ->whereBetween('t.created_at', [now()->subDays(30), now()])
            ->select('b.id', 'b.deskripsi', DB::raw('SUM(td.qty) as total_sold'), DB::raw('SUM(td.qty * td.harga) as total_revenue'))
            ->groupBy('b.id', 'b.deskripsi')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        // Get low stock items
        $lowStockList = DB::table('barang_stock')
            ->join('barang', 'barang_stock.barang_id', '=', 'barang.id')
            ->leftJoin(
                DB::raw('(SELECT td.sku, SUM(td.qty) as monthly_sold FROM transaksi_dets td INNER JOIN transaksis t ON td.transaksi_id = t.id WHERE t.is_cancel = 0 AND t.status != 0 AND t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY td.sku) as sales'),
                'barang.id',
                '=',
                'sales.sku'
            )
            ->whereRaw('barang_stock.quantity - barang_stock.reserved < barang.min_stock')
            ->select([
                'barang.id',
                'barang.deskripsi',
                'barang.satuan',
                'barang.min_stock',
                'barang_stock.quantity',
                'barang_stock.reserved',
                DB::raw('(barang_stock.quantity - barang_stock.reserved) as available'),
                DB::raw('COALESCE(sales.monthly_sold, 0) as monthly_sold'),
            ])
            ->orderBy('available', 'asc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'todaySales' => (int) $todaySales,
                'monthSales' => (int) $monthSales,
                'salesTrend' => $salesTrend->map(fn($item) => [
                    'date' => $item->date ? Carbon::parse($item->date)->translatedFormat('j M') : '-',
                    'total' => (int) $item->total,
                ]),
                'topProducts' => $topProducts,
                'lowStockList' => $lowStockList,
            ]
        ]);
    }
}
