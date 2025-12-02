import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { formatDigit, formatTgl } from '@/lib/formatters';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from './Layout';

interface ProfitData {
    date: string;
    summary: {
        total_revenue: number;
        total_cogs: number;
        gross_profit: number;
        total_discount: number;
        total_charge: number;
        total_tax: number;
        net_profit: number;
        gross_margin_pct: number;
        net_margin_pct: number;
    };
    statistics: {
        transaction_count: number;
        item_count: number;
        avg_transaction_value: number;
        avg_item_price: number;
    };
    top_products: Array<{
        sku: string;
        deskripsi: string;
        qty: number;
        revenue: number;
        cogs: number;
        profit: number;
    }>;
}

interface TrendData {
    date: string;
    display_date: string;
    revenue: number;
    cogs: number;
    profit: number;
    margin_pct: number;
}

interface ProductData {
    sku: string;
    deskripsi: string;
    harga_beli: number;
    times_sold: number;
    total_qty: number;
    total_revenue: number;
    total_profit: number;
    profit_margin_pct: number;
    avg_sale_price: number;
}

interface InventoryValue {
    cost_value: number;
    retail_value: number;
    potential_profit: number;
    markup_pct: number;
    total_items: number;
    unique_items: number;
}

export default function ProfitDashboard() {
    const [loading, setLoading] = useState(true);
    const [todayData, setTodayData] = useState<ProfitData | null>(null);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [topProducts, setTopProducts] = useState<ProductData[]>([]);
    const [inventoryValue, setInventoryValue] = useState<InventoryValue | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [todayRes, trendRes, productsRes, inventoryRes] = await Promise.all([
                    axios.get('/api/profit-analysis/daily'),
                    axios.get('/api/profit-analysis/trend?start=' +
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] +
                        '&end=' + new Date().toISOString().split('T')[0]),
                    axios.get('/api/profit-analysis/products?limit=10'),
                    axios.get('/api/profit-analysis/inventory-value'),
                ]);

                setTodayData(todayRes.data.data);
                setTrendData(trendRes.data.data || []);
                setTopProducts(productsRes.data.data || []);
                setInventoryValue(inventoryRes.data.data);
            } catch (error) {
                console.error('Error fetching profit data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading profit analysis...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout title="Profit Analysis Dashboard">
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            📊 Profit Analysis Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">{formatTgl(new Date().toISOString())}</p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Revenue Card */}
                        <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Today's Revenue</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">
                                        Rp {formatDigit(todayData?.summary.total_revenue || 0)}
                                    </p>
                                </div>
                                <div className="bg-blue-200 rounded-full p-3">
                                    <span className="text-2xl">💰</span>
                                </div>
                            </div>
                        </div>

                        {/* COGS Card */}
                        <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">COGS</p>
                                    <p className="text-2xl font-bold text-purple-700 mt-1">
                                        Rp {formatDigit(todayData?.summary.total_cogs || 0)}
                                    </p>
                                </div>
                                <div className="bg-purple-200 rounded-full p-3">
                                    <span className="text-2xl">📦</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Profit Card */}
                        <div className="bg-linear-to-br from-pink-100 to-pink-50 rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Net Profit</p>
                                    <p className="text-2xl font-bold text-pink-700 mt-1">
                                        Rp {formatDigit(todayData?.summary.net_profit || 0)}
                                    </p>
                                </div>
                                <div className="bg-pink-200 rounded-full p-3">
                                    <span className="text-2xl">📈</span>
                                </div>
                            </div>
                        </div>

                        {/* Margin Card */}
                        <div className="bg-linear-to-br from-amber-100 to-amber-50 rounded-xl p-6 border border-white/60 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">Net Margin</p>
                                    <p className="text-2xl font-bold text-amber-700 mt-1">
                                        {todayData?.summary.net_margin_pct || 0}%
                                    </p>
                                </div>
                                <div className="bg-amber-200 rounded-full p-3">
                                    <span className="text-2xl">📊</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Trend Chart */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">💹 30-Day Profit Trend</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="display_date" stroke="#999" />
                                    <YAxis stroke="#999" />
                                    <Tooltip
                                        formatter={(value: any) => `Rp ${formatDigit(value)}`}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="profit" stroke="#ec4899" strokeWidth={2} name="Profit" dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="margin_pct" stroke="#a855f7" strokeWidth={2} name="Margin %" dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Revenue vs COGS */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Revenue vs COGS Trend</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="display_date" stroke="#999" />
                                    <YAxis stroke="#999" />
                                    <Tooltip
                                        formatter={(value: any) => `Rp ${formatDigit(value)}`}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                                    <Bar dataKey="cogs" fill="#a855f7" name="COGS" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products & Inventory Value */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Top 10 Products */}
                        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">🏆 Top 10 Products by Profit</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left p-2 text-sm font-semibold text-gray-700">#</th>
                                            <th className="text-left p-2 text-sm font-semibold text-gray-700">Product</th>
                                            <th className="text-right p-2 text-sm font-semibold text-gray-700">Profit</th>
                                            <th className="text-right p-2 text-sm font-semibold text-gray-700">Margin %</th>
                                            <th className="text-right p-2 text-sm font-semibold text-gray-700">Qty Sold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map((product, index) => (
                                            <tr key={product.sku} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-2">
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-linear-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-sm text-gray-900 font-medium">{product.deskripsi}</td>
                                                <td className="p-2 text-right text-sm font-semibold text-pink-600">
                                                    Rp {formatDigit(product.total_profit)}
                                                </td>
                                                <td className="p-2 text-right text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${product.profit_margin_pct >= 30 ? 'bg-emerald-100 text-emerald-700' :
                                                            product.profit_margin_pct >= 20 ? 'bg-blue-100 text-blue-700' :
                                                                'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {product.profit_margin_pct}%
                                                    </span>
                                                </td>
                                                <td className="p-2 text-right text-sm text-gray-600">{product.total_qty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Inventory Value */}
                        <div className="bg-linear-to-br from-emerald-100 to-emerald-50 rounded-xl p-6 border border-white/60 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">🏪 Inventory Value</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Cost Value</p>
                                    <p className="text-2xl font-bold text-emerald-700">
                                        Rp {formatDigit(inventoryValue?.cost_value || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Retail Value</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        Rp {formatDigit(inventoryValue?.retail_value || 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Potential Profit</p>
                                    <p className="text-2xl font-bold text-pink-700">
                                        Rp {formatDigit(inventoryValue?.potential_profit || 0)}
                                    </p>
                                </div>
                                <div className="bg-white/50 rounded-lg p-3 border border-white/80">
                                    <p className="text-gray-600 text-sm">Markup %</p>
                                    <p className="text-xl font-bold text-purple-700">{inventoryValue?.markup_pct || 0}%</p>
                                    <p className="text-xs text-gray-500 mt-2">Items: {inventoryValue?.total_items || 0} | SKUs: {inventoryValue?.unique_items || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Statistics */}
                    {todayData && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">📈 Today's Statistics</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-gray-600 text-sm">Total Transactions</p>
                                    <p className="text-2xl font-bold text-blue-700">{todayData.statistics.transaction_count}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-gray-600 text-sm">Items Sold</p>
                                    <p className="text-2xl font-bold text-purple-700">{todayData.statistics.item_count}</p>
                                </div>
                                <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                                    <p className="text-gray-600 text-sm">Avg Transaction</p>
                                    <p className="text-2xl font-bold text-pink-700">Rp {formatDigit(todayData.statistics.avg_transaction_value)}</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <p className="text-gray-600 text-sm">Avg Item Price</p>
                                    <p className="text-2xl font-bold text-amber-700">Rp {formatDigit(todayData.statistics.avg_item_price)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </AdminLayout>
    );
}
