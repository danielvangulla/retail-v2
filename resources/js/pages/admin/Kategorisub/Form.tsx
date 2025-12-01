import { FormEvent, useState } from 'react';
import AdminLayout from '../Layout';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface KategoriItem {
    id: string;
    ket: string;
}

interface KategorisubFormProps {
    kategorisub?: {
        id: string;
        ket: string;
        kategori_id: string;
    };
    kategoris: KategoriItem[];
    mode: 'create' | 'edit';
}

export default function KategorisubForm({ kategorisub, kategoris, mode }: KategorisubFormProps) {
    const { props } = usePage();
    const errors = (props as any).errors || {};

    const [formData, setFormData] = useState({
        ket: kategorisub?.ket || '',
        kategori_id: kategorisub?.kategori_id || '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (mode === 'create') {
            router.post('/back/kategorisub', formData);
        } else if (kategorisub) {
            router.put(`/back/kategorisub/${kategorisub.id}`, formData);
        }
    };

    const pageTitle = mode === 'create' ? 'Tambah Sub Kategori' : 'Edit Sub Kategori';

    return (
        <AdminLayout title={pageTitle}>
            <div className="max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-8 border border-gray-100/50 backdrop-blur-sm">
                    <div>
                        <h3 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{pageTitle}</h3>
                        <p className="text-gray-500 text-sm">Silakan isi form di bawah dengan benar</p>
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Kategori</label>
                        <select
                            name="kategori_id"
                            value={formData.kategori_id}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors.kategori_id ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            required
                        >
                            <option value="">📂 Pilih Kategori</option>
                            {kategoris.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.ket}
                                </option>
                            ))}
                        </select>
                        {errors.kategori_id && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> {errors.kategori_id}
                            </p>
                        )}
                    </div>

                    {/* Nama Sub Kategori */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">Nama Sub Kategori</label>
                        <input
                            type="text"
                            name="ket"
                            value={formData.ket}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                errors.ket ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            placeholder="Masukkan nama sub kategori"
                            required
                        />
                        {errors.ket && (
                            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> {errors.ket}
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30 cursor-pointer"
                        >
                            {loading ? 'Menyimpan...' : mode === 'create' ? '✨ Tambah Sub Kategori' : '✨ Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/back/kategorisub')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
