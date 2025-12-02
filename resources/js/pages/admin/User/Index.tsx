import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';

interface UserItem {
    id: string;
    name: string;
    email: string;
    level: number;
    created_at: string;
}

interface PaginationData {
    data: UserItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface UserIndexProps {
    users: PaginationData;
}

const getLevelBadge = (level: number) => {
    if (level === 0) return { text: 'Administrator', color: 'bg-green-100 text-black' };
    if (level === 1) return { text: 'Supervisor', color: 'bg-purple-100 text-purple-800' };
    if (level === 2) return { text: 'Kasir', color: 'bg-blue-100 text-blue-800' };
    return { text: 'Unknown', color: 'bg-slate-700/30 text-gray-800' };
};

export default function UserIndex({ users }: UserIndexProps) {
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/admin/user', {
            search,
            level: levelFilter || undefined,
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) {
            setLoading(true);
            router.delete(`/admin/user/${id}`);
        }
    };

    const handleEdit = (id: string) => {
        router.visit(`/admin/user/${id}/edit`);
    };

    return (
        <AdminLayout title="Manajemen User">
            <div className="space-y-4 sm:space-y-6 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 -m-4 sm:-m-6 p-4 sm:p-6 rounded-xl">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Manajemen User
                    </h1>
                    <button
                        onClick={() => router.visit('/admin/user/create')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah User
                    </button>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-blue-50/40 p-4 sm:p-5 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search */}
                        <div className="relative lg:col-span-2">
                            <input
                                type="text"
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>                        {/* Level Filter */}
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Level</option>
                            <option value="1">Supervisor</option>
                            <option value="2">Kasir</option>
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
                    <div className="text-sm text-gray-600">
                        Total: <span className="font-bold text-gray-900">{users.total}</span> user
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-pink-50/40 p-4 sm:p-5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Level</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                                            Tidak ada data user
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((item) => {
                                        const levelBadge = getLevelBadge(item.level);
                                        return (
                                            <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3 text-gray-900 font-medium">{item.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelBadge.color}`}>
                                                        {levelBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 space-x-2 text-center">
                                                    <button
                                                        onClick={() => handleEdit(item.id)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 text-sm hover:cursor-pointer bg-blue-100 hover:bg-blue-500/60 p-2 rounded-full"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.name)}
                                                        className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1 text-sm hover:cursor-pointer bg-red-100 hover:bg-red-500/60 p-2 rounded-full"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-between text-sm">
                            <div className="text-gray-600">
                                Halaman {users.current_page} dari {users.last_page}
                            </div>
                            <div className="flex gap-2">
                                {users.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/user', {
                                                page: users.current_page - 1,
                                                search,
                                                level: levelFilter || undefined,
                                            })
                                        }
                                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-blue-50"
                                    >
                                        ← Sebelumnya
                                    </button>
                                )}
                                {users.current_page < users.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/admin/user', {
                                                page: users.current_page + 1,
                                                search,
                                                level: levelFilter || undefined,
                                            })
                                        }
                                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-blue-50"
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
