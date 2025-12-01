import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';

interface KategoriItem {
    id: string;
    nama: string;
    barang_count: number;
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
        router.get('/back/kategori', { search });
    };

    const handleDelete = (id: string, barangCount: number) => {
        if (barangCount > 0) {
            alert(`Tidak dapat menghapus kategori yang masih memiliki ${barangCount} barang.`);
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            setLoading(true);
            router.delete(`/back/kategori/${id}`);
        }
    };

    const handleEdit = (id: string) => {
        router.visit(`/back/kategori/${id}/edit`);
    };

    return (
        <AdminLayout title="Manajemen Kategori">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Daftar Kategori</h2>
                    <button
                        onClick={() => router.visit('/back/kategori/create')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Kategori
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Cari kategori..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Mencari...' : 'Cari'}
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 mt-3">
                        Total: <span className="font-bold">{kategoris.total}</span> kategori
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Nama Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Jumlah Barang
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {kategoris.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada data kategori
                                        </td>
                                    </tr>
                                ) : (
                                    kategoris.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nama}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {item.barang_count} barang
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.barang_count)}
                                                    disabled={item.barang_count > 0}
                                                    className={`font-medium inline-flex items-center gap-1 ${
                                                        item.barang_count > 0
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-red-600 hover:text-red-800'
                                                    }`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Hapus
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
                        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Halaman {kategoris.current_page} dari {kategoris.last_page}
                            </div>
                            <div className="flex gap-2">
                                {kategoris.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/kategori', {
                                                page: kategoris.current_page - 1,
                                                search,
                                            })
                                        }
                                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                                    >
                                        Sebelumnya
                                    </button>
                                )}
                                {kategoris.current_page < kategoris.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/kategori', {
                                                page: kategoris.current_page + 1,
                                                search,
                                            })
                                        }
                                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                                    >
                                        Selanjutnya
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
