import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Trash2, Eye, Printer } from 'lucide-react';
import { formatTgl } from '../../../lib/formatters';
import AdminLayout from '../Layout';

interface ReturData {
    id: string;
    ket: string;
    created_at: string;
    user: {
        name: string;
    };
    details: {
        qty: number;
    }[];
}

interface IndexNewProps {
    returs: {
        data: ReturData[];
        links: {
            next: string | null;
            prev: string | null;
        };
        current_page: number;
        last_page: number;
    };
}

export default function ReturIndexNew({ returs }: IndexNewProps) {
    const [search, setSearch] = useState('');

    const handleView = (id: string) => {
        router.visit(`/admin/retur/${id}`);
    };

    const handlePrint = (id: string) => {
        const width = 800;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const print = window.open(`/admin/retur/${id}/print`, '_blank', `width=${width},height=${height},left=${left},top=${top}`);

        setTimeout(() => {
            print?.focus();
            print?.print();
            print?.close();
        }, 1000);
    };

    const handleDelete = (id: string) => {
        if (confirm('Yakin ingin menghapus retur ini?')) {
            fetch(`/admin/retur/${id}`, {
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
        <AdminLayout title="Retur Pembelian">
            <div className="max-w-7xl">
                {/* Search & Create */}
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Cari retur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Link
                        href="/admin/retur/create"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                        + Retur Baru
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-white/60 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-linear-to-r from-blue-100 to-blue-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">Tgl Retur</th>
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">Keterangan</th>
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">Input Oleh</th>
                                <th className="px-6 py-3 text-center text-sm font-600 text-gray-700">Jumlah Item</th>
                                <th className="px-6 py-3 text-center text-sm font-600 text-gray-700">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {returs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Belum ada data retur
                                    </td>
                                </tr>
                            ) : (
                                returs.data.map((retur, idx) => (
                                    <tr key={retur.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">{formatTgl(retur.created_at)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{retur.ket || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{retur.user.name}</td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className="inline-block bg-linear-to-r from-blue-400 to-purple-400 text-white px-3 py-1 rounded-full text-xs font-600">
                                                {retur.details.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleView(retur.id)}
                                                    className="text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-200 transition-all cursor-pointer p-1"
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(retur.id)}
                                                    className="text-purple-600 hover:text-purple-800 transition rounded-full hover:bg-red-200 cursor-pointer p-1"
                                                    title="Hapus"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(retur.id)}
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
                {returs.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {returs.links.prev && (
                            <Link href={returs.links.prev} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                ← Prev
                            </Link>
                        )}
                        <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                            {returs.current_page} / {returs.last_page}
                        </span>
                        {returs.links.next && (
                            <Link href={returs.links.next} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                Next →
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
