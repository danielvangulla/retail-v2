<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProfitAnalysisService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfitAnalysisController extends Controller
{
    /**
     * Get daily profit breakdown
     * GET /api/profit-analysis/daily?date=2024-12-02
     */
    public function dailyAnalysis(Request $r)
    {
        try {
            $date = $r->query('date') ?? now()->format('Y-m-d');

            $analysis = ProfitAnalysisService::getDailyProfitAnalysis($date);

            return response()->json([
                'status' => 'ok',
                'data' => $analysis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get profit trend for date range
     * GET /api/profit-analysis/trend?start=2024-11-01&end=2024-12-02
     */
    public function trendAnalysis(Request $r)
    {
        try {
            $startDate = $r->query('start') ?? now()->subDays(30)->format('Y-m-d');
            $endDate = $r->query('end') ?? now()->format('Y-m-d');

            $trend = ProfitAnalysisService::getProfitTrend($startDate, $endDate);

            return response()->json([
                'status' => 'ok',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'data' => $trend,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get product profitability ranking
     * GET /api/profit-analysis/products?limit=20
     */
    public function productProfitability(Request $r)
    {
        try {
            $limit = $r->query('limit', 20);

            $products = ProfitAnalysisService::getProductProfitability($limit);

            return response()->json([
                'status' => 'ok',
                'count' => count($products),
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific product margin
     * GET /api/profit-analysis/product/{barangId}/margin
     */
    public function productMargin($barangId)
    {
        try {
            $margin = ProfitAnalysisService::getProductMargin($barangId);

            if (!$margin) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Barang not found',
                ], 404);
            }

            return response()->json([
                'status' => 'ok',
                'data' => $margin,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get total inventory value
     * GET /api/profit-analysis/inventory-value
     */
    public function inventoryValue()
    {
        try {
            $value = ProfitAnalysisService::getInventoryValue();

            return response()->json([
                'status' => 'ok',
                'data' => $value,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Dashboard view for profit analysis
     * GET /profit-dashboard
     */
    public function dashboard()
    {
        try {
            $todayAnalysis = ProfitAnalysisService::getDailyProfitAnalysis();
            $trendData = ProfitAnalysisService::getProfitTrend(
                now()->subDays(30)->format('Y-m-d'),
                now()->format('Y-m-d')
            );
            $topProducts = ProfitAnalysisService::getProductProfitability(10);
            $inventoryValue = ProfitAnalysisService::getInventoryValue();

            return Inertia::render('admin/ProfitDashboard', [
                'todayAnalysis' => $todayAnalysis,
                'trendData' => $trendData,
                'topProducts' => $topProducts,
                'inventoryValue' => $inventoryValue,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('admin/ProfitDashboard', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
