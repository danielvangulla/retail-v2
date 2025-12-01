import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';

interface UserItem {
    id: string;
    name: string;
    username: string;
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
    if (level === 1) return { text: 'Supervisor', color: 'bg-purple-100 text-purple-800' };
    if (level === 2) return { text: 'Kasir', color: 'bg-blue-100 text-blue-800' };
    return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
};

export default function UserIndex({ users }: UserIndexProps) {
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        router.get('/back/user', {
            search,
            level: levelFilter || undefined,
        });
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) {
            setLoading(true);
            router.delete(`/back/user/${id}`);
        }
    };

    const handleEdit = (id: string) => {
        router.visit(`/back/user/${id}/edit`);
    };

    return (
        <AdminLayout title="Manajemen User">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Daftar User</h2>
                    <button
                        onClick={() => router.visit('/back/user/create')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah User
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>

                        {/* Level Filter */}
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        Total: <span className="font-bold">{users.total}</span> user
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada data user
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((item) => {
                                        const levelBadge = getLevelBadge(item.level);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                    {item.username}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelBadge.color}`}>
                                                        {levelBadge.text}
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
                                                        onClick={() => handleDelete(item.id, item.name)}
                                                        className="text-red-600 hover:text-red-800 font-medium inline-flex items-center gap-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Hapus
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
                        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Halaman {users.current_page} dari {users.last_page}
                            </div>
                            <div className="flex gap-2">
                                {users.current_page > 1 && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/user', {
                                                page: users.current_page - 1,
                                                search,
                                                level: levelFilter || undefined,
                                            })
                                        }
                                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                                    >
                                        Sebelumnya
                                    </button>
                                )}
                                {users.current_page < users.last_page && (
                                    <button
                                        onClick={() =>
                                            router.get('/back/user', {
                                                page: users.current_page + 1,
                                                search,
                                                level: levelFilter || undefined,
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
