import AdminLayout from './Layout';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';

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
}

export default function Dashboard({
    todaySales,
    monthSales,
    totalItems,
    lowStockItems,
    totalUsers,
    supervisors,
    kasirs,
    salesTrend,
    topProducts,
}: DashboardProps) {
    const StatCard = ({ icon: Icon, title, value, subtitle }: any) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Dashboard">
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={DollarSign}
                        title="Penjualan Hari Ini"
                        value={`Rp ${todaySales.toLocaleString('id-ID')}`}
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Penjualan Bulan Ini"
                        value={`Rp ${monthSales.toLocaleString('id-ID')}`}
                    />
                    <StatCard
                        icon={Package}
                        title="Total Barang"
                        value={totalItems}
                        subtitle={`${lowStockItems} stok rendah`}
                    />
                    <StatCard
                        icon={Users}
                        title="Total User"
                        value={totalUsers}
                        subtitle={`${supervisors} supervisor, ${kasirs} kasir`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Trend */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Tren Penjualan 7 Hari</h2>
                        <div className="space-y-3">
                            {salesTrend.map((day) => (
                                <div key={day.date} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{day.date}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((day.total / Math.max(...salesTrend.map((d) => d.total))) * 100, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            Rp {day.total.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Produk Terlaris</h2>
                        <div className="space-y-3">
                            {topProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between border-b border-gray-100 pb-3"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{product.deskripsi}</p>
                                        <p className="text-xs text-gray-500">{product.total_sold} terjual</p>
                                    </div>
                                    <p className="text-sm font-bold text-green-600">
                                        Rp {product.total_revenue.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
