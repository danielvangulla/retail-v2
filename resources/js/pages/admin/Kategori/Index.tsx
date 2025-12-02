import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Trash2, Edit2, Plus, Search, Package, Loader2 } from 'lucide-react';

interface KategoriItem {
    id: string;
    ket: string;
    barangs_count?: number;
    created_at: string;
}

interface PaginationData {
    data: KategoriItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface KategoriIndexProps {
    kategoris: PaginationData;
}

export default function KategoriIndex({ kategoris }: KategoriIndexProps) {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/admin/kategori', { search });
    };

    const handleDelete = (id: string, barangCount: number) => {
        if (barangCount > 0) {
            alert(`Tidak dapat menghapus kategori yang masih memiliki ${barangCount} barang.`);
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            setLoading(true);
            router.delete(`/admin/kategori/${id}`);
        }
    };

    const handleEdit = (id: string) => {
        router.visit(`/admin/kategori/${id}/edit`);
    };

    return (
        <AdminLayout title="Manajemen Kategori">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-bold bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">Daftar Kategori</h2>
                        <p className="text-gray-500 text-sm mt-1">Kelola semua kategori produk dengan mudah</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/kategori/create')}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Kategori
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Cari kategori..."
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
                        <span className="text-blue-600 font-bold text-base">{kategoris.total}</span>
                        <span>kategori ditemukan</span>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Nama Kategori
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Jumlah Barang
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {kategoris.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-12 w-12 text-gray-300" />
                                                <p className="text-gray-500 font-medium">Tidak ada data kategori</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    kategoris.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.ket}</td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-linear-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200/50">
                                                    📦 {item.barangs_count || 0} barang
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm flex justify-center items-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                                                    title="Edit kategori"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.barangs_count || 0)}
                                                    disabled={(item.barangs_count || 0) > 0}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        (item.barangs_count || 0) > 0
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer'
                                                    }`}
                                                    title="Hapus kategori"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {kategoris.last_page > 1 && (
                        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-linear-to-r from-gray-50 to-blue-50">
                            <div className="text-sm text-gray-600 font-medium">
                                Halaman <span className="font-bold text-gray-900">{kategoris.current_page}</span> dari <span className="font-bold text-gray-900">{kategoris.last_page}</span>
                            </div>
                            <div className="flex gap-2">
                                {kategoris.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/kategori', {
                                                page: kategoris.current_page - 1,
                                                search,
                                            })
                                        }
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all font-medium cursor-pointer"
                                    >
                                        ← Sebelumnya
                                    </button>
                                )}
                                {kategoris.current_page < kategoris.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/kategori', {
                                                page: kategoris.current_page + 1,
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
