import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Plus, Search, ShoppingCart, Calendar, DollarSign, User, Eye, Loader2 } from 'lucide-react';
import { formatTgl, formatDigit } from '../../../lib/formatters';

interface PembelianItem {
    id: string;
    tgl_faktur: string;
    is_lunas: boolean;
    grand_total: number;
    created_at: string;
    user: {
        name: string;
    };
    details: Array<{
        id: string;
        sku: string;
        qty: number;
        harga_beli: number;
        total: number;
    }>;
}

interface PaginationData {
    data: PembelianItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface PembelianIndexProps {
    pembelians: PaginationData;
}

export default function PembelianIndexNew({ pembelians = { data: [], current_page: 1, total: 0, per_page: 20, last_page: 1 } }: PembelianIndexProps) {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/admin/pembelian', { search });
    };

    const handleView = (id: string) => {
        router.visit(`/admin/pembelian/${id}`);
    };

    return (
        <AdminLayout title="History Pembelian">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-bold bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
                            History Pembelian
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Kelola dan pantau semua transaksi pembelian barang</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/pembelian-create')}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Input Pembelian
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan tanggal atau user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                        >
                            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                            {loading ? 'Mencari...' : 'Cari'}
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 mt-4 flex items-center gap-2">
                        <span className="text-blue-600 font-bold text-base">{pembelians.total}</span>
                        <span>transaksi pembelian</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100/50 relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                <p className="text-sm font-medium text-gray-600">Memuat data...</p>
                            </div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Input by
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Jumlah Item
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pembelians.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShoppingCart className="h-12 w-12 text-gray-300" />
                                                <p className="text-gray-500 font-medium">Belum ada data pembelian</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pembelians.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                            <td className="px-6 py-4 text-sm text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="font-semibold text-gray-900">
                                                        {formatTgl(item.tgl_faktur || item.created_at)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">{item.user?.name || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200/50">
                                                    <span className='font-bold mr-1'>{item.details?.length || 0}</span> item(s)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className="font-bold text-green-700">
                                                        Rp {formatDigit(item.grand_total)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                {item.is_lunas ? (
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200/50">
                                                        ✓ Lunas
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200/50">
                                                        ⏳ Belum Lunas
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center">
                                                <button
                                                    onClick={() => handleView(item.id)}
                                                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pembelians.last_page > 1 && (
                        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-linear-to-r from-gray-50 to-blue-50">
                            <div className="text-sm text-gray-600 font-medium">
                                Halaman <span className="font-bold text-gray-900">{pembelians.current_page}</span> dari{' '}
                                <span className="font-bold text-gray-900">{pembelians.last_page}</span>
                            </div>
                            <div className="flex gap-2">
                                {pembelians.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/pembelian', {
                                                page: pembelians.current_page - 1,
                                                search,
                                            })
                                        }
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all font-medium cursor-pointer"
                                    >
                                        ← Sebelumnya
                                    </button>
                                )}
                                {pembelians.current_page < pembelians.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/pembelian', {
                                                page: pembelians.current_page + 1,
                                                search,
                                            })
                                        }
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all font-medium cursor-pointer"
                                    >
                                        Selanjutnya →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
