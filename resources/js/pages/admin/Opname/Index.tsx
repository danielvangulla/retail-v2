import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { formatTgl } from '@/lib/formatters';
import axios from '@/lib/axios';

interface OpnameItem {
    id: string;
    user_id: string;
    barang_id: string;
    tgl: string;
    sistem: number;
    fisik: number;
    selisih: number;
    keterangan?: string;
    user?: { name: string };
    barang?: { deskripsi: string; sku: string };
}

interface Props {
    opnames: {
        data: OpnameItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function OpnameIndex({ opnames }: Props) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm('Hapus opname ini? Stok akan dikembalikan ke status sebelumnya.')) {
            try {
                setIsDeleting(id);
                await axios.delete(`/admin/opname/${id}`);
                router.visit('/admin/opname');
            } catch (error) {
                alert('Gagal menghapus opname');
                setIsDeleting(null);
            }
        }
    };

    const totalSelisih = useMemo(
        () => opnames.data.reduce((sum, item) => sum + item.selisih, 0),
        [opnames.data]
    );

    const itemsWithDifference = useMemo(
        () => opnames.data.filter(item => item.selisih !== 0).length,
        [opnames.data]
    );

    return (
        <>
            <Head title="Opname Stok" />

            <AdminLayout title="Opname Stok">
                <div className="max-w-6xl mx-auto text-black">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                📋 Opname Stok
                            </h1>
                            <p className="text-gray-600 mt-2">Kelola audit stok barang</p>
                        </div>
                        <Link
                            href="/admin/opname/create"
                            className="bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                        >
                            ➕ Opname Baru
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-xl p-6 border border-white/60 shadow-sm">
                            <p className="text-gray-600 text-sm">Total Opname</p>
                            <p className="text-3xl font-bold text-blue-700 mt-2">{opnames.total}</p>
                        </div>
                        <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-xl p-6 border border-white/60 shadow-sm">
                            <p className="text-gray-600 text-sm">Dengan Selisih</p>
                            <p className="text-3xl font-bold text-purple-700 mt-2">{itemsWithDifference}</p>
                        </div>
                        <div className="bg-linear-to-br from-pink-100 to-pink-50 rounded-xl p-6 border border-white/60 shadow-sm">
                            <p className="text-gray-600 text-sm">Total Selisih</p>
                            <p className="text-3xl font-bold text-pink-700 mt-2">{totalSelisih}</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-linear-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Barang</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Sistem</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Fisik</th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Selisih</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {opnames.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada opname
                                        </td>
                                    </tr>
                                ) : (
                                    opnames.data.map((opname) => (
                                        <tr
                                            key={opname.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {formatTgl(opname.tgl)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="font-medium text-gray-900">
                                                    {opname.barang?.deskripsi}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    SKU: {opname.barang?.sku}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-semibold">
                                                {opname.sistem}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-semibold">
                                                {opname.fisik}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        opname.selisih === 0
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : opname.selisih > 0
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {opname.selisih > 0 ? '+' : ''}{opname.selisih}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {opname.user?.name}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/opname/${opname.id}`}
                                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                    >
                                                        Lihat
                                                    </Link>
                                                    <Link
                                                        href={`/admin/opname/${opname.id}/edit`}
                                                        className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(opname.id)}
                                                        disabled={isDeleting === opname.id}
                                                        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {isDeleting === opname.id ? 'Menghapus...' : 'Hapus'}
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
                    {opnames.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Halaman {opnames.current_page} dari {opnames.last_page}
                            </p>
                            <div className="flex gap-2">
                                {opnames.current_page > 1 && (
                                    <Link
                                        href={`/admin/opname?page=${opnames.current_page - 1}`}
                                        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
                                    >
                                        ← Sebelumnya
                                    </Link>
                                )}
                                {opnames.current_page < opnames.last_page && (
                                    <Link
                                        href={`/admin/opname?page=${opnames.current_page + 1}`}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Selanjutnya →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
