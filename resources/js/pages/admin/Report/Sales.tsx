import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Calendar, Download } from 'lucide-react';

interface TransaksiDetail {
    id: string;
    qty: number;
    harga: number;
    diskon: number;
    barang: {
        deskripsi: string;
        barcode: string;
    };
}

interface TransaksiItem {
    id: string;
    bayar: number;
    tax: number;
    service: number;
    status: number;
    created_at: string;
    details: TransaksiDetail[];
    kasir: {
        name: string;
    };
}

interface SalesReportProps {
    transactions: TransaksiItem[];
    summary: {
        total_transactions: number;
        total_sales: number;
        avg_sales: number;
    };
    dateFrom: string;
    dateTo: string;
}

export default function SalesReport({ transactions, summary, dateFrom, dateTo }: SalesReportProps) {
    const [filters, setFilters] = useState({
        date_from: dateFrom || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        date_to: dateTo || new Date().toISOString().split('T')[0],
    });

    const [loading, setLoading] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setLoading(true);
        router.get('/admin/report/sales', filters);
    };

    const handleExport = () => {
        // Simple CSV export
        let csv = 'Laporan Penjualan\n';
        csv += `Periode: ${filters.date_from} hingga ${filters.date_to}\n\n`;
        csv += 'ID Transaksi,Kasir,Tanggal,Qty Item,Total,Tax,Service,Pembayaran\n';

        transactions.forEach((trans) => {
            const itemCount = trans.details.reduce((sum, d) => sum + d.qty, 0);
            const total = trans.details.reduce((sum, d) => sum + d.qty * d.harga - d.diskon, 0);
            csv += `${trans.id},"${trans.kasir.name}","${new Date(trans.created_at).toLocaleDateString('id-ID')}",${itemCount},${total},${trans.tax},${trans.service},${trans.bayar}\n`;
        });

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        element.setAttribute('download', `laporan_penjualan_${filters.date_from}_${filters.date_to}.csv`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <AdminLayout title="Laporan Penjualan">
            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-slate-800 rounded-lg shadow-lg-lg p-4 space-y-4 border border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Date From */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Dari Tanggal</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-slate-600 rounded-lg text-sm bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Sampai Tanggal</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-slate-600 rounded-lg text-sm bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {loading ? 'Memuat...' : 'Lihat'}
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
                    <div className="bg-slate-800 rounded-lg shadow-lg-lg p-4 border border-slate-700">
                        <p className="text-sm text-slate-400">Total Transaksi</p>
                        <p className="text-3xl font-bold text-white mt-2">{summary.total_transactions}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg shadow-lg-lg p-4 border border-slate-700">
                        <p className="text-sm text-slate-400">Total Penjualan</p>
                        <p className="text-3xl font-bold text-green-400 mt-2">
                            Rp {summary.total_sales.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="bg-slate-800 rounded-lg shadow-lg p-4">
                        <p className="text-sm text-slate-400">Rata-rata Penjualan</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            Rp {summary.avg_sales.toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        ID Transaksi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Kasir
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Item
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                                        PPN
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                                        Service
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                                        Pembayaran
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 text-center text-slate-300">
                                            Tidak ada data transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trans) => {
                                        const itemCount = trans.details.reduce((sum, d) => sum + d.qty, 0);
                                        const total = trans.details.reduce((sum, d) => sum + d.qty * d.harga - d.diskon, 0);
                                        return (
                                            <tr key={trans.id} className="hover:bg-slate-700">
                                                <td className="px-6 py-4 text-sm font-mono text-white">
                                                    {trans.id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">{trans.kasir.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-400">
                                                    {new Date(trans.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400">{itemCount}</td>
                                                <td className="px-6 py-4 text-sm text-white text-right font-medium">
                                                    Rp {total.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400 text-right">
                                                    Rp {trans.tax.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400 text-right">
                                                    Rp {trans.service.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white text-right font-bold">
                                                    Rp {trans.bayar.toLocaleString('id-ID')}
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
