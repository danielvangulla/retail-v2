<?php

namespace App\Services;

use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\Barang;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ProfitAnalysisService
{
    /**
     * Calculate daily profit breakdown
     * Returns revenue, COGS, gross profit, and key metrics
     */
    public static function getDailyProfitAnalysis($date = null)
    {
        $date = $date ?? now()->format('Y-m-d');
        $cacheKey = "profit_analysis_{$date}";

        return Cache::remember($cacheKey, 3600, function () use ($date) {
            // Get all transactions for the day
            $transactions = Transaksi::whereDate('created_at', $date)
                ->with(['details', 'details.barang'])
                ->get();

            $totalRevenue = 0;
            $totalCOGS = 0;
            $totalDiscount = 0;
            $totalCharge = 0;
            $totalTax = 0;
            $itemCount = 0;
            $transactionCount = $transactions->count();

            $productMetrics = [];

            foreach ($transactions as $trx) {
                foreach ($trx->details as $detail) {
                    $itemCount += $detail->qty;
                    $revenue = $detail->bayar ?? 0;
                    $cogs = ($detail->barang?->harga_beli ?? 0) * $detail->qty;
                    $discount = ($detail->disc_spv ?? 0) + ($detail->disc_promo ?? 0);

                    $totalRevenue += $revenue;
                    $totalCOGS += $cogs;
                    $totalDiscount += $discount;
                    $totalCharge += $detail->charge ?? 0;
                    $totalTax += $detail->tax ?? 0;

                    // Track per-product metrics
                    $sku = $detail->sku;
                    if (!isset($productMetrics[$sku])) {
                        $productMetrics[$sku] = [
                            'sku' => $sku,
                            'deskripsi' => $detail->barang?->deskripsi ?? 'Unknown',
                            'qty' => 0,
                            'revenue' => 0,
                            'cogs' => 0,
                            'profit' => 0,
                        ];
                    }

                    $productMetrics[$sku]['qty'] += $detail->qty;
                    $productMetrics[$sku]['revenue'] += $revenue;
                    $productMetrics[$sku]['cogs'] += $cogs;
                    $productMetrics[$sku]['profit'] += ($revenue - $cogs);
                }
            }

            // Calculate totals
            $grossProfit = $totalRevenue - $totalCOGS;
            $netProfit = $grossProfit - $totalDiscount - ($totalCharge ?? 0) + ($totalTax ?? 0);
            $grossMargin = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0;
            $netMargin = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 2) : 0;
            $avgTransactionValue = $transactionCount > 0 ? round($totalRevenue / $transactionCount, 0) : 0;
            $avgItemPrice = $itemCount > 0 ? round($totalRevenue / $itemCount, 0) : 0;

            // Sort products by profit (descending)
            usort($productMetrics, function ($a, $b) {
                return $b['profit'] <=> $a['profit'];
            });

            // Top 10 products by profit
            $topProducts = array_slice($productMetrics, 0, 10);

            return [
                'date' => $date,
                'summary' => [
                    'total_revenue' => round($totalRevenue, 2),
                    'total_cogs' => round($totalCOGS, 2),
                    'gross_profit' => round($grossProfit, 2),
                    'total_discount' => round($totalDiscount, 2),
                    'total_charge' => round($totalCharge, 2),
                    'total_tax' => round($totalTax, 2),
                    'net_profit' => round($netProfit, 2),
                    'gross_margin_pct' => $grossMargin,
                    'net_margin_pct' => $netMargin,
                ],
                'statistics' => [
                    'transaction_count' => $transactionCount,
                    'item_count' => $itemCount,
                    'avg_transaction_value' => $avgTransactionValue,
                    'avg_item_price' => $avgItemPrice,
                ],
                'top_products' => $topProducts,
            ];
        });
    }

    /**
     * Get profit trend for date range
     * Returns daily breakdown for dashboard charts
     */
    public static function getProfitTrend($startDate, $endDate)
    {
        $cacheKey = "profit_trend_{$startDate}_{$endDate}";

        return Cache::remember($cacheKey, 1800, function () use ($startDate, $endDate) {
            $trend = [];
            $current = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);

            while ($current->lte($end)) {
                $dateStr = $current->format('Y-m-d');
                $analysis = self::getDailyProfitAnalysis($dateStr);

                $trend[] = [
                    'date' => $dateStr,
                    'display_date' => $current->format('d/m'),
                    'revenue' => $analysis['summary']['total_revenue'],
                    'cogs' => $analysis['summary']['total_cogs'],
                    'profit' => $analysis['summary']['net_profit'],
                    'margin_pct' => $analysis['summary']['net_margin_pct'],
                ];

                $current->addDay();
            }

            return $trend;
        });
    }

    /**
     * Get product profitability analysis
     * Identifies best and worst performing products
     */
    public static function getProductProfitability($limit = 20)
    {
        // Query all products with sales data
        $products = DB::table('transaksi_dets')
            ->join('barang', 'transaksi_dets.sku', '=', 'barang.id')
            ->select(
                'barang.id',
                'barang.sku',
                'barang.deskripsi',
                'barang.harga_beli',
                DB::raw('COUNT(*) as times_sold'),
                DB::raw('SUM(transaksi_dets.qty) as total_qty'),
                DB::raw('SUM(transaksi_dets.bayar) as total_revenue'),
                DB::raw('SUM(transaksi_dets.bayar) - (SUM(transaksi_dets.qty) * barang.harga_beli) as total_profit'),
                DB::raw('AVG(transaksi_dets.bayar) as avg_sale_price')
            )
            ->groupBy('barang.id', 'barang.sku', 'barang.deskripsi', 'barang.harga_beli')
            ->havingRaw('SUM(transaksi_dets.qty) > 0')
            ->orderBy('total_profit', 'DESC')
            ->limit($limit)
            ->get();

        $formatted = [];
        foreach ($products as $product) {
            $profitMargin = $product->total_revenue > 0
                ? round(($product->total_profit / $product->total_revenue) * 100, 2)
                : 0;

            $formatted[] = [
                'sku' => $product->sku,
                'deskripsi' => $product->deskripsi,
                'harga_beli' => $product->harga_beli,
                'times_sold' => $product->times_sold,
                'total_qty' => $product->total_qty,
                'total_revenue' => round($product->total_revenue, 2),
                'total_profit' => round($product->total_profit, 2),
                'profit_margin_pct' => $profitMargin,
                'avg_sale_price' => round($product->avg_sale_price, 2),
            ];
        }

        return $formatted;
    }

    /**
     * Calculate margin for a single product
     * Returns cost, sale price, and profit margin %
     */
    public static function getProductMargin($barangId)
    {
        $barang = Barang::find($barangId);
        if (!$barang) {
            return null;
        }

        $hargaBeli = $barang->harga_beli ?? 0;
        $hargaJual = $barang->harga_jual1 ?? 0;
        $profit = $hargaJual - $hargaBeli;
        $margin = $hargaBeli > 0 ? round(($profit / $hargaBeli) * 100, 2) : 0;

        return [
            'sku' => $barang->sku,
            'deskripsi' => $barang->deskripsi,
            'harga_beli' => $hargaBeli,
            'harga_jual' => $hargaJual,
            'profit_per_unit' => round($profit, 2),
            'margin_pct' => $margin,
            'margin_type' => $margin >= 30 ? 'excellent' : ($margin >= 20 ? 'good' : ($margin >= 10 ? 'fair' : 'low')),
        ];
    }

    /**
     * Calculate inventory value metrics
     * Stock worth based on cost price
     */
    public static function getInventoryValue()
    {
        $cacheKey = 'inventory_value_total';

        return Cache::remember($cacheKey, 3600, function () {
            $data = DB::table('barang_stock')
                ->join('barang', 'barang_stock.barang_id', '=', 'barang.id')
                ->select(
                    DB::raw('SUM(barang_stock.quantity * barang.harga_beli) as cost_value'),
                    DB::raw('SUM(barang_stock.quantity * barang.harga_jual1) as retail_value'),
                    DB::raw('SUM(barang_stock.quantity) as total_items'),
                    DB::raw('COUNT(DISTINCT barang_stock.barang_id) as unique_items')
                )
                ->first();

            $costValue = $data->cost_value ?? 0;
            $retailValue = $data->retail_value ?? 0;
            $potentialProfit = $retailValue - $costValue;
            $markupPct = $costValue > 0 ? round(($potentialProfit / $costValue) * 100, 2) : 0;

            return [
                'cost_value' => round($costValue, 2),
                'retail_value' => round($retailValue, 2),
                'potential_profit' => round($potentialProfit, 2),
                'markup_pct' => $markupPct,
                'total_items' => $data->total_items ?? 0,
                'unique_items' => $data->unique_items ?? 0,
            ];
        });
    }

    /**
     * Clear profit cache (call after stock adjustments)
     */
    public static function clearProfitCache($date = null)
    {
        $date = $date ?? now()->format('Y-m-d');
        Cache::forget("profit_analysis_{$date}");
        Cache::forget("profit_trend_*");
        Cache::forget("inventory_value_total");
    }
}
