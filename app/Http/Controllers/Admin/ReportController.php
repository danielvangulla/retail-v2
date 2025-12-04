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

        // Query to get sales data with cost calculation
        $data = DB::select(DB::raw("
            SELECT
                DATE(t.jam_mulai) as date,
                COUNT(DISTINCT t.id) as total_transactions,
                COALESCE(SUM(td.qty), 0) as total_items,
                SUM(td.bayar) as total_sales,
                SUM(td.disc_spv + td.disc_promo) as total_discount,
                SUM(td.netto) as net_sales,
                SUM(td.qty * COALESCE(
                    (SELECT harga_rata_rata_hpp FROM barang_stock_movements
                     WHERE barang_id = b.id AND movement_date <= t.jam_mulai
                     ORDER BY movement_date DESC LIMIT 1),
                    b.harga_beli, 0
                )) as total_cost
            FROM transaksis t
            LEFT JOIN transaksi_dets td ON t.id = td.transaksi_id
            LEFT JOIN barang b ON td.sku = b.id
            WHERE t.jam_mulai BETWEEN ? AND ?
            GROUP BY DATE(t.jam_mulai)
            ORDER BY date DESC
        "), [$from, $to]);

        // Convert to collection and format
        $data = collect($data)->map(function ($item) {
            $item->display_date = \Carbon\Carbon::createFromFormat('Y-m-d', $item->date)->translatedFormat('d M Y');
            $item->profit = $item->net_sales - ($item->total_cost ?? 0);
            return $item;
        });

        $summary = DB::table('transaksis')
            ->leftJoin('transaksi_dets', 'transaksis.id', '=', 'transaksi_dets.transaksi_id')
            ->selectRaw('COUNT(DISTINCT transaksis.id) as total_transactions, SUM(transaksi_dets.bayar) as total_sales, AVG(transaksi_dets.bayar) as avg_sales')
            ->whereBetween('transaksis.jam_mulai', [$from, $to])
            ->first();

        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'summary' => $summary,
        ]);
    }

    public function salesByCategory(Request $request): JsonResponse
    {
        $from = Carbon::parse($request->date_from)->startOfDay();
        $to = Carbon::parse($request->date_to)->endOfDay();
        $page = $request->page ?? 1;

        $data = DB::table('transaksis')
            ->selectRaw('
                kategori.id,
                kategori.ket,
                COUNT(DISTINCT transaksis.id) as total_transactions,
                SUM(transaksi_dets.qty) as total_items,
                SUM(transaksi_dets.bayar) as total_sales,
                SUM(transaksi_dets.disc_spv + transaksi_dets.disc_promo) as total_discount,
                SUM(transaksi_dets.netto) as net_sales
            ')
            ->join('transaksi_dets', 'transaksis.id', '=', 'transaksi_dets.transaksi_id')
            ->join('barang', 'transaksi_dets.sku', '=', 'barang.id')
            ->join('kategori', 'barang.kategori_id', '=', 'kategori.id')
            ->whereBetween('transaksis.jam_mulai', [$from, $to])
            ->groupByRaw('kategori.id, kategori.ket')
            ->orderByDesc('total_sales')
            ->paginate(15, ['*'], 'page', $page);

        // Rename columns for API response consistency
        $data->getCollection()->transform(function ($item) {
            $item->kategori_id = $item->id;
            $item->kategori_name = $item->ket;
            unset($item->id);
            unset($item->ket);
            return $item;
        });

        $summary = DB::table('transaksis')
            ->join('transaksi_dets', 'transaksis.id', '=', 'transaksi_dets.transaksi_id')
            ->selectRaw('COUNT(*) as total_transactions, SUM(transaksi_dets.bayar) as total_sales, AVG(transaksi_dets.bayar) as avg_sales')
            ->whereBetween('transaksis.jam_mulai', [$from, $to])
            ->first();

        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'summary' => $summary,
        ]);
    }

    public function salesByItem(Request $request): JsonResponse
    {
        $from = Carbon::parse($request->date_from)->startOfDay();
        $to = Carbon::parse($request->date_to)->endOfDay();
        $page = $request->page ?? 1;

        $data = DB::table('transaksis')
            ->selectRaw('
                barang.id as barang_id,
                barang.sku,
                barang.deskripsi,
                SUM(transaksi_dets.qty) as total_qty,
                SUM(transaksi_dets.bayar) as total_sales,
                SUM(transaksi_dets.disc_spv + transaksi_dets.disc_promo) as total_discount,
                SUM(transaksi_dets.netto) as net_sales
            ')
            ->join('transaksi_dets', 'transaksis.id', '=', 'transaksi_dets.transaksi_id')
            ->join('barang', 'transaksi_dets.sku', '=', 'barang.id')
            ->whereBetween('transaksis.jam_mulai', [$from, $to])
            ->groupByRaw('barang.id, barang.sku, barang.deskripsi')
            ->orderByDesc('total_sales')
            ->paginate(15, ['*'], 'page', $page);

        $summary = DB::table('transaksis')
            ->join('transaksi_dets', 'transaksis.id', '=', 'transaksi_dets.transaksi_id')
            ->join('barang', 'transaksi_dets.sku', '=', 'barang.id')
            ->selectRaw('COUNT(DISTINCT barang.id) as total_transactions, SUM(transaksi_dets.qty) as total_sales, AVG(transaksi_dets.bayar) as avg_sales')
            ->whereBetween('transaksis.jam_mulai', [$from, $to])
            ->first();

        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'summary' => $summary,
        ]);
    }
}
