import { FormEvent, useState } from 'react';
import AdminLayout from '../Layout';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface KategoriFormProps {
    kategori?: {
        id: string;
        nama: string;
    };
    mode: 'create' | 'edit';
}

export default function KategoriForm({ kategori, mode }: KategoriFormProps) {
    const { props } = usePage();
    const errors = (props as any).errors || {};

    const [formData, setFormData] = useState({
        nama: kategori?.nama || '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (mode === 'create') {
            router.post('/back/kategori', formData);
        } else if (kategori) {
            router.put(`/back/kategori/${kategori.id}`, formData);
        }
    };

    const pageTitle = mode === 'create' ? 'Tambah Kategori' : 'Edit Kategori';

    return (
        <AdminLayout title={pageTitle}>
            <div className="max-w-lg">
                <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-lg p-6 space-y-6">
                    {/* Nama */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Nama Kategori</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.nama ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Masukkan nama kategori"
                            required
                        />
                        {errors.nama && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.nama}
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
                            {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Kategori' : 'Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/back/kategori')}
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
