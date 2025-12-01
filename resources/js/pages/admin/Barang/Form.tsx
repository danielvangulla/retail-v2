import { FormEvent, useState } from 'react';
import AdminLayout from '../Layout';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

interface BarangFormProps {
    barang?: {
        id: string;
        barcode: string;
        deskripsi: string;
        kategori_id: string;
        harga_beli: number;
        harga_jual1: number;
        min_stock: number;
        st_aktif: number;
    };
    kategoris: Array<{ id: string; nama: string }>;
    mode: 'create' | 'edit';
}

export default function BarangForm({ barang, kategoris, mode }: BarangFormProps) {
    const { props } = usePage();
    const errors = (props as any).errors || {};

    const [formData, setFormData] = useState({
        barcode: barang?.barcode || '',
        deskripsi: barang?.deskripsi || '',
        kategori_id: barang?.kategori_id || '',
        harga_beli: barang?.harga_beli || '',
        harga_jual: barang?.harga_jual1 || '',
        min_stock: barang?.min_stock || '',
        st_aktif: barang?.st_aktif !== undefined ? barang.st_aktif.toString() : '1',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            barcode: formData.barcode,
            deskripsi: formData.deskripsi,
            kategori_id: formData.kategori_id,
            harga_beli: parseFloat(formData.harga_beli as any) || 0,
            harga_jual: parseFloat(formData.harga_jual as any) || 0,
            min_stock: parseInt(formData.min_stock as any) || 0,
            st_aktif: parseInt(formData.st_aktif) || 1,
        };

        if (mode === 'create') {
            router.post('/back/barang', data);
        } else if (barang) {
            router.put(`/back/barang/${barang.id}`, data);
        }
    };

    const pageTitle = mode === 'create' ? 'Tambah Barang' : 'Edit Barang';

    return (
        <AdminLayout title={pageTitle}>
            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Barcode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Barcode</label>
                        <input
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.barcode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Masukkan barcode"
                            required
                        />
                        {errors.barcode && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.barcode}
                            </p>
                        )}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Deskripsi</label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.deskripsi ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Masukkan deskripsi barang"
                            required
                        />
                        {errors.deskripsi && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.deskripsi}
                            </p>
                        )}
                    </div>

                    {/* Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Kategori</label>
                        <select
                            name="kategori_id"
                            value={formData.kategori_id}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.kategori_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            {kategoris.map((kat) => (
                                <option key={kat.id} value={kat.id}>
                                    {kat.nama}
                                </option>
                            ))}
                        </select>
                        {errors.kategori_id && (
                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" /> {errors.kategori_id}
                            </p>
                        )}
                    </div>

                    {/* Price Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Harga Beli</label>
                            <input
                                type="number"
                                name="harga_beli"
                                value={formData.harga_beli}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.harga_beli ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                required
                            />
                            {errors.harga_beli && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" /> {errors.harga_beli}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Harga Jual</label>
                            <input
                                type="number"
                                name="harga_jual"
                                value={formData.harga_jual}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.harga_jual ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                required
                            />
                            {errors.harga_jual && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" /> {errors.harga_jual}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stock Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Min Stok</label>
                            <input
                                type="number"
                                name="min_stock"
                                value={formData.min_stock}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.min_stock ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0"
                                min="0"
                                required
                            />
                            {errors.min_stock && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" /> {errors.min_stock}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                            <select
                                name="st_aktif"
                                value={formData.st_aktif}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Barang' : 'Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/back/barang')}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
