import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Trash2, Edit2, Plus, Search, Tag } from 'lucide-react';

interface KategorisubItem {
    id: string;
    ket: string;
    kategori_id: string;
    kategori: {
        id: string;
        ket: string;
    };
    created_at: string;
}

interface KategoriItem {
    id: string;
    ket: string;
}

interface PaginationData {
    data: KategorisubItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface KategorisubIndexProps {
    kategorisub: PaginationData;
    kategoris: KategoriItem[];
}

export default function KategorisubIndex({ kategorisub, kategoris }: KategorisubIndexProps) {
    const [search, setSearch] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/back/kategorisub', { search, kategori_id: kategoriFilter });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus sub kategori ini?')) {
            setLoading(true);
            router.delete(`/back/kategorisub/${id}`);
        }
    };

    const handleEdit = (id: string) => {
        router.visit(`/back/kategorisub/${id}/edit`);
    };

    return (
        <AdminLayout title="Manajemen Sub Kategori">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-bold bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">Daftar Sub Kategori</h2>
                        <p className="text-gray-500 text-sm mt-1">Kelola sub kategori untuk setiap kategori produk</p>
                    </div>
                    <button
                        onClick={() => router.visit('/back/kategorisub/create')}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Sub Kategori
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50 space-y-4 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari sub kategori..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={kategoriFilter}
                            onChange={(e) => setKategoriFilter(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="">📦 Semua Kategori</option>
                            {kategoris.map((k) => (
                                <option key={k.id} value={k.id}>
                                    📂 {k.ket}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 cursor-pointer"
                        >
                            {loading ? 'Mencari...' : 'Cari'}
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        <span className="text-blue-600 font-bold text-base">{kategorisub.total}</span>
                        <span> sub kategori ditemukan</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100/50">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-linear-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Nama Sub Kategori
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {kategorisub.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Tag className="h-12 w-12 text-gray-300" />
                                                <p className="text-gray-500 font-medium">Tidak ada data sub kategori</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    kategorisub.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.ket}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-linear-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200/50">
                                                    📂 {item.kategori?.ket || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2 flex">
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
                                                    title="Edit sub kategori"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                                    title="Hapus sub kategori"
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
                    {kategorisub.last_page > 1 && (
                        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-linear-to-r from-gray-50 to-blue-50">
                            <div className="text-sm text-gray-600 font-medium">
                                Halaman <span className="font-bold text-gray-900">{kategorisub.current_page}</span> dari <span className="font-bold text-gray-900">{kategorisub.last_page}</span>
                            </div>
                            <div className="flex gap-2">
                                {kategorisub.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/kategorisub', {
                                                page: kategorisub.current_page - 1,
                                                search,
                                                kategori_id: kategoriFilter,
                                            })
                                        }
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all font-medium cursor-pointer"
                                    >
                                        ← Sebelumnya
                                    </button>
                                )}
                                {kategorisub.current_page < kategorisub.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/kategorisub', {
                                                page: kategorisub.current_page + 1,
                                                search,
                                                kategori_id: kategoriFilter,
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
