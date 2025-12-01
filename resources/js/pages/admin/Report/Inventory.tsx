import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { AlertTriangle, Search, Download } from 'lucide-react';

interface BarangItem {
    id: string;
    barcode: string;
    deskripsi: string;
    min_stock: number;
    harga_jual1: number;
    kategori: {
        nama: string;
    };
}

interface InventoryReportProps {
    barang: BarangItem[];
    summary: {
        total_items: number;
        total_stok: number;
        low_stock_items: number;
    };
    search: string;
    lowStock: boolean;
}

export default function InventoryReport({ barang, summary, search: initialSearch, lowStock: initialLowStock }: InventoryReportProps) {
    const [filters, setFilters] = useState({
        search: initialSearch || '',
        low_stock: initialLowStock ? '1' : '0',
    });

    const [loading, setLoading] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setLoading(true);
        router.get('/back/report/inventory', {
            search: filters.search,
            low_stock: filters.low_stock === '1' ? '1' : undefined,
        });
    };

    const handleExport = () => {
        // Simple CSV export
        let csv = 'Laporan Inventaris Barang\n\n';
        csv += 'Barcode,Deskripsi,Kategori,Stok,Min Stok,Nilai Barang,Status\n';

        barang.forEach((item) => {
            const nilai = item.stok * item.harga_jual;
            const status = item.stok <= item.min_stok ? 'RENDAH' : 'BAIK';
            csv += `"${item.barcode}","${item.deskripsi}","${item.kategori.nama}",${item.stok},${item.min_stok},${nilai},"${status}"\n`;
        });

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        element.setAttribute('download', `laporan_inventaris_${new Date().toISOString().split('T')[0]}.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <AdminLayout title="Laporan Inventaris">
            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                name="search"
                                placeholder="Cari barang..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>

                        {/* Low Stock Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Filter</label>
                            <select
                                name="low_stock"
                                value={filters.low_stock}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="0">Semua Barang</option>
                                <option value="1">Stok Rendah Saja</option>
                            </select>
                        </div>

                        {/* Search Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {loading ? 'Memuat...' : 'Cari'}
                            </button>
                        </div>

                        {/* Export Button */}
                        <div className="flex items-end">
                            <button
                                onClick={handleExport}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                                <Download className="h-5 w-5" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Total Barang</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_items}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Total Stok</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{summary.total_stok}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" /> Stok Rendah
                        </p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">{summary.low_stock_items}</p>
                    </div>
                </div>

                {/* Alert for Low Stock */}
                {summary.low_stock_items > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-orange-900">
                                Perhatian: {summary.low_stock_items} barang memiliki stok yang rendah!
                            </p>
                            <p className="text-sm text-orange-700 mt-1">
                                Silakan pesan barang lebih banyak atau update stok minimum.
                            </p>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Barcode
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Deskripsi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Min Stok
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Harga Jual
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Nilai Barang
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {barang.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada data barang
                                        </td>
                                    </tr>
                                ) : (
                                    barang.map((item) => {
                                        const nilai = 0; // We can't calculate without actual stok data
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-mono text-gray-900">
                                                    {item.barcode}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{item.deskripsi}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.kategori.nama}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 text-center">
                                                    {item.min_stock}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                                                    Rp {item.harga_jual1.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">
                                                    Rp {nilai.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                        Stok Terbatas
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
