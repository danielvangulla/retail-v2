import { FormEvent, useState } from 'react';
import AdminLayout from '../Layout';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface UserFormProps {
    user?: {
        id: string;
        name: string;
        username: string;
        email: string;
        level: number;
    };
    mode: 'create' | 'edit';
}

export default function UserForm({ user, mode }: UserFormProps) {
    const { props } = usePage();
    const errors = (props as any).errors || {};

    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        level: user?.level || 2,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'level' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            level: formData.level,
        } as any;

        // Only include password if provided (for create) or if changing (for edit)
        if (mode === 'create' || formData.password) {
            data.password = formData.password;
            data.password_confirmation = formData.password_confirmation;
        }

        if (mode === 'create') {
            router.post('/back/user', data);
        } else if (user) {
            router.put(`/back/user/${user.id}`, data);
        }
    };

    const pageTitle = mode === 'create' ? 'Tambah User' : 'Edit User';
    const isPasswordRequired = mode === 'create';

    return (
        <AdminLayout title={pageTitle}>
            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-lg p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Nama</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Masukkan nama"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.username ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Masukkan username"
                            required
                        />
                        {errors.username && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.email ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Masukkan email"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Password {!isPasswordRequired && '(Kosongkan jika tidak ingin mengubah)'}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.password ? 'border-red-500' : 'border-slate-600'
                                }`}
                                placeholder="Masukkan password"
                                required={isPasswordRequired}
                            />
                            {errors.password && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" /> {errors.password}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Konfirmasi Password
                            </label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.password_confirmation ? 'border-red-500' : 'border-slate-600'
                                }`}
                                placeholder="Konfirmasi password"
                                required={isPasswordRequired}
                            />
                            {errors.password_confirmation && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" /> {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Level */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Level</label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.level ? 'border-red-500' : 'border-slate-600'
                            }`}
                        >
                            <option value={1}>Supervisor</option>
                            <option value={2}>Kasir</option>
                        </select>
                        {errors.level && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.level}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah User' : 'Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/back/user')}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
