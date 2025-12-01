import { useMemo, useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';

interface BarangItem {
    id: string;
    barcode: string;
    deskripsi: string;
    kategori: { nama: string };
    harga_beli: number;
    harga_jual1: number;
    min_stock: number;
    st_aktif: number;
}

interface PaginationData {
    data: BarangItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface BarangIndexProps {
    barang: PaginationData;
    kategoris: Array<{ id: string; nama: string }>;
}

export default function BarangIndex({ barang, kategoris }: BarangIndexProps) {
    const [search, setSearch] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('');
    const [showFilter, setShowFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/back/barang', {
            search,
            kategori_id: kategoriFilter || undefined,
            show: showFilter || undefined,
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            setLoading(true);
            router.delete(`/back/barang/${id}`);
        }
    };

    const handleEdit = (id: string) => {
        router.visit(`/back/barang/${id}/edit`);
    };

    return (
        <AdminLayout title="Manajemen Barang">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Daftar Barang</h2>
                    <button
                        onClick={() => router.visit('/back/barang/create')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Barang
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-slate-800 rounded-lg shadow-lg-lg p-4 space-y-4 border border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari barang..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-2 border border-slate-600 rounded-lg text-sm bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-500" />
                        </div>

                        {/* Kategori Filter */}
                        <select
                            value={kategoriFilter}
                            onChange={(e) => setKategoriFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-600 rounded-lg text-sm bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Kategori</option>
                            {kategoris.map((kat) => (
                                <option key={kat.id} value={kat.id}>
                                    {kat.nama}
                                </option>
                            ))}
                        </select>

                        {/* Show Filter */}
                        <select
                            value={showFilter}
                            onChange={(e) => setShowFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-600 rounded-lg text-sm bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Status</option>
                            <option value="1">Aktif</option>
                            <option value="0">Nonaktif</option>
                        </select>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Mencari...' : 'Cari'}
                        </button>
                    </div>

                    {/* Results Info */}
                    <div className="text-sm text-slate-400">
                        Total: <span className="font-bold">{barang.total}</span> barang
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-800 rounded-lg shadow-lg-lg overflow-hidden border border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700 border-b border-slate-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Barcode
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Deskripsi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Harga Beli
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Harga Jual
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Stok
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {barang.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 text-center text-slate-400">
                                            Tidak ada data barang
                                        </td>
                                    </tr>
                                ) : (
                                    barang.data.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700">
                                            <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                                                {item.barcode}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white">{item.deskripsi}</td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {item.kategori?.nama || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white">
                                                Rp {item.harga_beli.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white font-bold">
                                                Rp {item.harga_jual1.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs font-medium">
                                                    Stok Aktif
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                                        item.st_aktif === 1
                                                            ? 'bg-blue-900/30 text-blue-400'
                                                            : 'bg-slate-700 text-slate-400'
                                                    }`}
                                                >
                                                    {item.st_aktif === 1 ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
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
                    {barang.last_page > 1 && (
                        <div className="border-t border-slate-700 px-6 py-4 flex items-center justify-between bg-slate-800">
                            <div className="text-sm text-slate-400">
                                Halaman {barang.current_page} dari {barang.last_page}
                            </div>
                            <div className="flex gap-2">
                                {barang.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/barang', {
                                                page: barang.current_page - 1,
                                                search,
                                                kategori_id: kategoriFilter || undefined,
                                                show: showFilter || undefined,
                                            })
                                        }
                                        className="px-3 py-1 border border-slate-600 rounded text-sm text-slate-300 hover:bg-slate-700"
                                    >
                                        Sebelumnya
                                    </button>
                                )}
                                {barang.current_page < barang.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/barang', {
                                                page: barang.current_page + 1,
                                                search,
                                                kategori_id: kategoriFilter || undefined,
                                                show: showFilter || undefined,
                                            })
                                        }
                                        className="px-3 py-1 border border-slate-600 rounded text-sm text-slate-300 hover:bg-slate-700"
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
