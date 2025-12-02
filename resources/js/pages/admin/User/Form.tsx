import { FormEvent, useState } from 'react';
import AdminLayout from '../Layout';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface UserFormProps {
    user?: {
        id: string;
        name: string;
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
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        level: user?.level || 2,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newData = {
            ...formData,
            [name]: name === 'level' ? parseInt(value) : value,
        };

        // Auto-generate email from name (if create mode)
        if (mode === 'create' && name === 'name') {
            newData.email = value.toLowerCase().replace(/\s+/g, '') + '@mail.com';
        }

        setFormData(newData);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            name: formData.name,
            email: formData.email,
            level: formData.level,
        } as any;

        // Only include password if provided (for create) or if changing (for edit)
        if (mode === 'create' || formData.password) {
            data.password = formData.password;
            data.password_confirmation = formData.password_confirmation;
        }

        if (mode === 'create') {
            router.post('/admin/user', data);
        } else if (user) {
            router.put(`/admin/user/${user.id}`, data);
        }
    };

    const pageTitle = mode === 'create' ? 'Tambah User' : 'Edit User';
    const isPasswordRequired = mode === 'create';

    return (
        <AdminLayout title={pageTitle}>
            <div className="text-black max-w-2xl space-y-4 sm:space-y-6 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 -m-4 sm:-m-6 p-4 sm:p-6 rounded-xl">
                {/* Header */}
                <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {pageTitle}
                </h1>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="rounded-xl border border-white/60 bg-linear-to-br from-white to-blue-50/40 p-4 sm:p-6 shadow-sm space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Username</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-400' : 'border-gray-200'
                            }`}
                            placeholder="Username (tanpa spasi)"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email (Read-only for create, editable for edit) */}
                    <div className="hidden">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={mode === 'create'}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.email ? 'border-red-400' : 'border-gray-200'
                            } ${mode === 'create' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            placeholder="Auto-generated dari nama"
                            required
                        />
                        {mode === 'create' && (
                            <p className="text-gray-500 text-xs mt-1">Otomatis dihasilkan dari nama</p>
                        )}
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Password {!isPasswordRequired && <span className="font-normal text-gray-600">(Kosongkan jika tidak ingin mengubah)</span>}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.password ? 'border-red-400' : 'border-gray-200'
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
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Konfirmasi Password
                            </label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.password_confirmation ? 'border-red-400' : 'border-gray-200'
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
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Level</label>
                        <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.level ? 'border-red-400' : 'border-gray-200'
                            }`}
                        >
                            <option value={1}>👑 Supervisor</option>
                            <option value={2}>🛒 Kasir</option>
                        </select>
                        {errors.level && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.level}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah User' : 'Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/user')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-medium transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
