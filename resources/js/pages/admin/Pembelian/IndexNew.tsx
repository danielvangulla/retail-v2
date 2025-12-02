import { useState } from 'react';
import AdminLayout from '../Layout';
import { Link, router } from '@inertiajs/react';
import { Plus, Search, ShoppingCart, Calendar, DollarSign, User, Eye, Loader2, Printer, Trash2 } from 'lucide-react';
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

    const handlePrint = (id: string) => {
        const width = 800;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const print = window.open(`/admin/pembelian/${id}/print`, '_blank', `width=${width},height=${height},left=${left},top=${top}`);

        setTimeout(() => {
            print?.focus();
            print?.print();
            print?.close();
        }, 1000);
    };

    const handleDelete = (id: string) => {
        if (confirm('Yakin ingin menghapus retur ini?')) {
            fetch(`/admin/pembelian/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            })
                .then(() => {
                    window.location.reload();
                });
        }
    };

    return (
        <AdminLayout title="Daftar Pembelian">
            <div className="space-y-6">
                {/* Search & Create */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan tanggal atau user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                        <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={() => router.visit('/admin/pembelian/create')}
                        className="flex items-center gap-1 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-2 py-1 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Input Pembelian
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-500/50 relative">
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
                            <thead className="bg-linear-to-r from-gray-200 to-blue-200 border-b border-gray-200/50">
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
                                        <tr key={item.id} className="hover:bg-blue-100/50 transition-colors duration-150">
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
                                                <div className="flex gap-1 justify-center items-center">
                                                    <button
                                                        onClick={() => handleView(item.id)}
                                                        className="text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-200 transition-all cursor-pointer p-1"
                                                        title="Lihat detail"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrint(item.id)}
                                                        className="text-purple-600 hover:text-purple-800 transition rounded-full hover:bg-red-200 cursor-pointer p-1"
                                                        title="Hapus"
                                                    >
                                                        <Printer size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-800 transition rounded-full hover:bg-red-200 cursor-pointer p-1"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
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
