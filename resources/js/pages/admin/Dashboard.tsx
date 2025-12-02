import AdminLayout from './Layout';
import { DollarSign, Package, Users, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';

interface DashboardProps {
    todaySales: number;
    monthSales: number;
    totalItems: number;
    lowStockItems: number;
    totalUsers: number;
    supervisors: number;
    kasirs: number;
    salesTrend: Array<{
        date: string;
        total: number;
    }>;
    topProducts: Array<{
        id: string;
        deskripsi: string;
        total_sold: number;
        total_revenue: number;
    }>;
    lowStockList: Array<{
        id: string;
        deskripsi: string;
        satuan: string;
        min_stock: number;
        quantity: number;
        reserved: number;
        available: number;
        monthly_sold: number;
    }>;
}

export default function Dashboard({
    todaySales: initialTodaySales,
    monthSales: initialMonthSales,
    totalItems,
    lowStockItems: initialLowStockItems,
    totalUsers,
    supervisors,
    kasirs,
    salesTrend: initialSalesTrend,
    topProducts: initialTopProducts,
    lowStockList: initialLowStockList,
}: DashboardProps) {
    // State for real-time data
    const [todaySales, setTodaySales] = useState(initialTodaySales);
    const [monthSales, setMonthSales] = useState(initialMonthSales);
    const [lowStockItems, setLowStockItems] = useState(initialLowStockItems);
    const [salesTrend, setSalesTrend] = useState(initialSalesTrend);
    const [topProducts, setTopProducts] = useState(initialTopProducts);
    const [lowStockList, setLowStockList] = useState(initialLowStockList);

    // Setup real-time updates
    const { isConnected } = useDashboardRealtime((data) => {
        if (data.todaySales !== undefined) setTodaySales(data.todaySales);
        if (data.monthSales !== undefined) setMonthSales(data.monthSales);
        if (data.salesTrend) setSalesTrend(data.salesTrend);
        if (data.topProducts) setTopProducts(data.topProducts);
        if (data.lowStockList) {
            setLowStockList(data.lowStockList);
            setLowStockItems(data.lowStockList.length);
        }
    });

    // Calculate daily average and growth
    const dailyAverage = Math.round(monthSales / 30);
    const monthGrowth = ((todaySales - dailyAverage) / dailyAverage * 100).toFixed(1);
    const isGrowthPositive = parseFloat(monthGrowth) >= 0;

    const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendUp, bgColor, iconColor }: any) => (
        <div className={`group relative overflow-hidden rounded-xl border border-white/60 ${bgColor} p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:border-white/80 shadow-sm`}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 -mr-8 -mt-8 rounded-full blur-xl" style={{ background: iconColor }} />
            <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2.5 text-white transition-colors`} style={{ background: iconColor }}>
                        <Icon className="h-5 w-5" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trendUp ? 'text-emerald-600 bg-emerald-100' : 'text-rose-600 bg-rose-100'}`}>
                            <TrendingUp className="h-3 w-3" style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }} />
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-4 sm:space-y-6 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 -m-4 sm:-m-6 p-4 sm:p-6 rounded-xl">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Dashboard</h1>
                    <p className="text-sm text-gray-600">Pantau performa bisnis Anda dengan gaya yang lebih ceria ✨</p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                        icon={DollarSign}
                        title="Penjualan Hari Ini"
                        value={`Rp ${todaySales.toLocaleString('id-ID')}`}
                        trend={`${isGrowthPositive ? '+' : ''}${monthGrowth}%`}
                        trendUp={isGrowthPositive}
                        bgColor="bg-linear-to-br from-blue-100 to-blue-50"
                        iconColor="#3B82F6"
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Penjualan Bulan Ini"
                        value={`Rp ${monthSales.toLocaleString('id-ID')}`}
                        subtitle={`Rata-rata/hari: Rp ${dailyAverage.toLocaleString('id-ID')}`}
                        bgColor="bg-linear-to-br from-purple-100 to-purple-50"
                        iconColor="#A855F7"
                    />
                    <StatCard
                        icon={Package}
                        title="Total Barang"
                        value={totalItems}
                        subtitle={lowStockItems > 0 ? `⚠️ ${lowStockItems} stok rendah` : 'Stok optimal'}
                        trend={lowStockItems > 0 ? '!' : '✓'}
                        trendUp={lowStockItems === 0}
                        bgColor="bg-linear-to-br from-pink-100 to-pink-50"
                        iconColor="#EC4899"
                    />
                    <StatCard
                        icon={Users}
                        title="Total User"
                        value={totalUsers}
                        subtitle={`${supervisors} SPV, ${kasirs} kasir`}
                        bgColor="bg-linear-to-br from-amber-100 to-amber-50"
                        iconColor="#F59E0B"
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Sales Trend Chart */}
                    <div className="lg:col-span-2 rounded-xl border border-white/60 bg-linear-to-br from-white to-blue-50/40 p-4 sm:p-6 shadow-sm">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        Tren Penjualan 7 Hari
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Performa harian Anda</p>
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                {salesTrend.length > 0 ? (
                                    salesTrend.map((day, idx) => {
                                        const maxTotal = Math.max(...salesTrend.map((d) => d.total));
                                        const percentage = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0;
                                        return (
                                            <div key={`${day.date}-${idx}`} className="group">
                                                <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                                                    <span className="text-gray-600 font-medium">{day.date}</span>
                                                    <span className="text-gray-900 font-semibold">Rp {day.total.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-300 group-hover:shadow-md"
                                                        style={{ width: `${Math.max(percentage, 5)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-400 text-center py-4">Tidak ada data penjualan</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Sidebar */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Info Cards */}
                        <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-purple-50/40 p-4 sm:p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-purple-100">
                                    <BarChart3 className="h-4 w-4 text-purple-600" />
                                </div>
                                Ringkasan
                            </h3>
                            <div className="space-y-2.5 text-xs sm:text-sm">
                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-linear-to-r from-blue-100 to-blue-50">
                                    <span className="text-gray-600">Penjualan Hari Ini</span>
                                    <span className="font-bold text-blue-600">Rp {todaySales.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-linear-to-r from-emerald-100 to-emerald-50">
                                    <span className="text-gray-600">Rata-rata/Hari</span>
                                    <span className="font-bold text-emerald-600">Rp {dailyAverage.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-linear-to-r from-purple-100 to-purple-50">
                                    <span className="text-gray-600">Bulan Ini</span>
                                    <span className="font-bold text-purple-600">Rp {monthSales.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        {lowStockItems > 0 && (
                            <div className="rounded-xl border-2 border-amber-200 bg-linear-to-br from-amber-50 to-amber-100/50 p-4 sm:p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-amber-100">
                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    </div>
                                    Peringatan Stok
                                </h3>
                                <p className="text-xs sm:text-sm text-amber-800">{lowStockItems} produk memiliki stok rendah. Segera lakukan pembelian! 📦</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-pink-50/40 p-4 sm:p-6 shadow-sm">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-pink-100">
                            <TrendingUp className="h-5 w-5 text-pink-600" />
                        </div>
                        Produk Terlaris 30 Hari
                    </h2>
                    <div className="space-y-2">
                        {topProducts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-2 text-gray-600 font-semibold">Produk</th>
                                            <th className="text-right py-3 px-2 text-gray-600 font-semibold">Terjual</th>
                                            <th className="text-right py-3 px-2 text-gray-600 font-semibold">Pendapatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map((product, idx) => (
                                            <tr key={product.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                <td className="py-3 px-2 text-gray-700">
                                                    <span className="inline-block w-6 h-6 rounded-full bg-linear-to-r from-blue-400 to-purple-400 text-center text-xs text-white font-semibold mr-2 leading-6">
                                                        {idx + 1}
                                                    </span>
                                                    {product.deskripsi}
                                                </td>
                                                <td className="text-right py-3 px-2 text-gray-700 font-medium">{product.total_sold}x</td>
                                                <td className="text-right py-3 px-2 font-bold text-emerald-600">Rp {product.total_revenue.toLocaleString('id-ID')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">Tidak ada data produk 📊</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-rose-50/40 p-4 sm:p-6 shadow-sm">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-rose-100">
                            <AlertTriangle className="h-5 w-5 text-rose-600" />
                        </div>
                        Barang Stok Rendah ({lowStockList.length})
                    </h2>
                    <div className="space-y-2">
                        {lowStockList.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-2 text-gray-600 font-semibold">Produk</th>
                                            <th className="text-center py-3 px-2 text-gray-600 font-semibold">Stok</th>
                                            <th className="text-center py-3 px-2 text-gray-600 font-semibold">Min Stok</th>
                                            <th className="text-center py-3 px-2 text-gray-600 font-semibold">Penjualan/Bln</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowStockList.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-rose-50/50 transition-colors">
                                                <td className="py-3 px-2 text-gray-700">
                                                    <span className="text-sm font-medium">{item.deskripsi}</span>
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                                                        item.available === 0
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : item.available < item.min_stock / 2
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {item.available} {item.satuan}
                                                    </span>
                                                </td>
                                                <td className="text-center py-3 px-2 text-gray-700 font-medium">{item.min_stock} {item.satuan}</td>
                                                <td className="text-center py-3 px-2 text-gray-700 font-semibold">{item.monthly_sold} {item.satuan}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-6">✅ Semua barang memiliki stok yang cukup!</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
