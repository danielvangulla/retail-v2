import React, { useMemo, useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Trash2, Edit2, Plus, Search, Package, TrendingUp, Layers, Tag } from 'lucide-react';
import { formatDigit } from '@/lib/formatters';

interface PriceItem {
    qty: number;
    harga1: number;
    harga2: number;
    multiplier: boolean;
}

interface BarangItem {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    alias: string;
    satuan: string;
    isi: number;
    volume: string;
    kategori: { ket: string };
    harga_beli: number;
    harga_jual1: number;
    harga_jual2: number;
    min_stock: number;
    st_aktif: number;
    prices?: PriceItem[];
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
    filters: {
        search?: string;
        kategori_id?: string;
        show?: string;
    };
}

export default function BarangIndex({ barang, kategoris, filters }: BarangIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori_id || '');
    const [showFilter, setShowFilter] = useState(filters.show || '');
    const [loading, setLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const handleSearch = () => {
        router.get('/admin/barang', {
            search: search || undefined,
            kategori_id: kategoriFilter || undefined,
            show: showFilter || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            router.delete(`/admin/barang/${id}`);
        }
    };

    const handleEdit = (id: string) => {
        router.visit(`/admin/barang/${id}/edit`);
    };

    return (
        <AdminLayout title="Manajemen Barang">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Daftar Barang</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola produk dan harga bertingkat</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/barang/create')}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Barang
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Produk</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="SKU, barcode, nama..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-2 top-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                    Cari
                                </button>
                            </div>
                        </div>

                        {/* Kategori Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                            <select
                                value={kategoriFilter}
                                onChange={(e) => {
                                    setKategoriFilter(e.target.value);
                                    handleSearch();
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                            >
                                <option value="">📂 Semua Kategori</option>
                                {kategoris.map((kat) => (
                                    <option key={kat.id} value={kat.id}>
                                        {kat.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Show Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                            <select
                                value={showFilter}
                                onChange={(e) => {
                                    setShowFilter(e.target.value);
                                    handleSearch();
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                            >
                                <option value="">⚡ Semua Status</option>
                                <option value="1">✅ Aktif</option>
                                <option value="0">❌ Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Info & Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                            Menampilkan <span className="font-bold text-gray-900">{barang.data.length}</span> dari <span className="font-bold text-gray-900">{barang.total}</span> produk
                        </div>
                        {(search || kategoriFilter || showFilter) && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setKategoriFilter('');
                                    setShowFilter('');
                                    router.get('/admin/barang');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Info Produk
                                    </th>
                                    <th className="w-32 px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {barang.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-12 text-center">
                                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">Tidak ada data barang</p>
                                            <p className="text-sm text-gray-400 mt-1">Tambahkan produk baru untuk memulai</p>
                                        </td>
                                    </tr>
                                ) : (
                                    barang.data.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <tr
                                                key={item.id}
                                                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                                                onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                            >
                                                {/* Info Produk */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-start gap-4">
                                                        {/* Icon */}
                                                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                                                            <Package className="h-7 w-7 text-white" />
                                                        </div>

                                                        {/* Main Info */}
                                                        <div className="flex-1 min-w-0 space-y-3">
                                                            {/* Header: Nama & Badges */}
                                                            <div>
                                                                <div className="flex items-start gap-2 mb-2">
                                                                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                                                                        {item.deskripsi}
                                                                    </h3>
                                                                    <span
                                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                                                                            item.st_aktif === 1
                                                                                ? 'bg-green-100 text-green-700'
                                                                                : 'bg-gray-100 text-gray-600'
                                                                        }`}
                                                                    >
                                                                        {item.st_aktif === 1 ? '✓ Aktif' : '✕ Nonaktif'}
                                                                    </span>
                                                                    {item.prices && item.prices.length > 0 && (
                                                                        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                                                            <TrendingUp className="h-3 w-3" />
                                                                            {item.prices.length}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* SKU, Barcode, Kategori */}
                                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                                    <span className="font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-semibold">
                                                                        {item.sku}
                                                                    </span>
                                                                    {item.barcode && (
                                                                        <span className="font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold">
                                                                            {item.barcode}
                                                                        </span>
                                                                    )}
                                                                    {item.kategori?.ket && (
                                                                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-bold">
                                                                            📂 {item.kategori.ket}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Grid Info: Satuan, Harga, Stock */}
                                                            <div className="grid grid-cols-3 gap-4">
                                                                {/* Satuan */}
                                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <Layers className="h-4 w-4 text-blue-600" />
                                                                        <span className="text-xs font-semibold text-blue-900">Satuan</span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-blue-700">
                                                                        {item.satuan}
                                                                    </div>
                                                                    {item.isi > 1 && item.volume && (
                                                                        <div className="text-xs text-blue-600 mt-1">
                                                                            1 {item.volume} = {item.isi} {item.satuan}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Harga */}
                                                                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                                                    <div className="text-xs font-semibold text-green-900 mb-1">💰 Harga</div>
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs text-green-700">Beli:</span>
                                                                            <span className="text-xs font-bold text-green-900">
                                                                                Rp {formatDigit(item.harga_beli)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs text-green-700">Jual 1:</span>
                                                                            <span className="text-sm font-bold text-green-600">
                                                                                Rp {formatDigit(item.harga_jual1)}
                                                                            </span>
                                                                        </div>
                                                                        {item.harga_jual2 > 0 && (
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-xs text-green-700">Jual 2:</span>
                                                                                <span className="text-xs font-bold text-blue-600">
                                                                                    Rp {formatDigit(item.harga_jual2)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Margin & Stock */}
                                                                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                                                    <div className="text-xs font-semibold text-orange-900 mb-1">📊 Info</div>
                                                                    {item.harga_beli > 0 && item.harga_jual1 > 0 && (
                                                                        <div className="w-full mb-2 flex flex-row items-center justify-between">
                                                                            <span className="text-xs text-orange-700">Margin:</span>
                                                                            <div className="text-sm font-bold text-orange-600">
                                                                                {((item.harga_jual1 - item.harga_beli) / item.harga_beli * 100).toFixed(1)}%
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {item.min_stock > 0 && (
                                                                        <div className="w-full mb-2 flex flex-row items-center justify-between">
                                                                            <span className="text-xs text-orange-700">Min Stok:</span>
                                                                            <div className="text-sm font-bold text-orange-600">
                                                                                {item.min_stock} {item.satuan}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(item.id);
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(item.id);
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Row - Harga Bertingkat */}
                                            {expandedRow === item.id && item.prices && item.prices.length > 0 && (
                                                <tr className="bg-linear-to-r from-purple-50/50 to-blue-50/50">
                                                    <td colSpan={2} className="px-6 py-5">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Tag className="h-5 w-5 text-purple-600" />
                                                            <h4 className="text-sm font-bold text-purple-900">Harga Bertingkat</h4>
                                                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                                                {item.prices.length} tier pricing
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-7">
                                                            {item.prices.map((price, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="bg-linear-to-br from-purple-100/50 to-blue-100/50 border-2 border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                                                                >
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <span className="text-sm font-bold text-purple-900">
                                                                            Min {price.qty} {item.satuan}
                                                                        </span>
                                                                        {price.multiplier && (
                                                                            <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-lg font-semibold">
                                                                                × Multiplier
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-gray-600 font-medium">Jual 1:</span>
                                                                            <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                                                                                Rp {formatDigit(price.harga1)}
                                                                            </span>
                                                                        </div>
                                                                        {price.harga2 > 0 && (
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-600 font-medium">Jual 2:</span>
                                                                                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                                                                    Rp {formatDigit(price.harga2)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {barang.last_page > 1 && (
                        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50">
                            <div className="text-sm text-gray-600 font-medium">
                                Halaman <span className="font-bold text-gray-900">{barang.current_page}</span> dari <span className="font-bold text-gray-900">{barang.last_page}</span>
                            </div>
                            <div className="flex gap-3">
                                {barang.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/barang', {
                                                page: barang.current_page - 1,
                                                search: search || undefined,
                                                kategori_id: kategoriFilter || undefined,
                                                show: showFilter || undefined,
                                            }, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            })
                                        }
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 font-medium transition cursor-pointer shadow-sm"
                                    >
                                        ← Sebelumnya
                                    </button>
                                )}
                                {barang.current_page < barang.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/barang', {
                                                page: barang.current_page + 1,
                                                search: search || undefined,
                                                kategori_id: kategoriFilter || undefined,
                                                show: showFilter || undefined,
                                            }, {
                                                preserveState: true,
                                                preserveScroll: true,
                                            })
                                        }
                                        className="px-4 py-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-blue-500/30 cursor-pointer"
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
