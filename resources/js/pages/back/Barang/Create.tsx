import { Head, usePage, router } from '@inertiajs/react';
import React, { useState } from 'react';
import axios from '@/lib/axios';

export default function Create() {
    const { var: v, kategori, kategorisub, barang } = usePage().props as any;
    const [formData, setFormData] = useState({
        sku: barang?.sku ?? '',
        barcode: barang?.barcode ?? '',
        deskripsi: barang?.deskripsi ?? '',
        alias: barang?.alias ?? '',
        kategori_id: barang?.kategori_id ?? '',
        satuan: barang?.satuan ?? '',
        isi: barang?.isi ?? 1,
        volume: barang?.volume ?? '',
        harga_jual1: barang?.harga_jual1 ?? 0,
        harga_jual2: barang?.harga_jual2 ?? 0,
        multiplier: barang?.multiplier ?? false,
        min_stock: barang?.min_stock ?? 1,
        allow_sold_zero_stock: barang?.allow_sold_zero_stock ?? true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const url = v.page === 'barang-create' ? '/back/barang' : `/back/barang/${barang?.id}`;
            const method = v.page === 'barang-create' ? 'post' : 'put';

            const response = await axios({
                method,
                url,
                data: formData,
            });

            if (response.data.status === 'ok') {
                router.visit('/back/barang');
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ submit: error.response?.data?.msg || error.response?.data?.message || 'Terjadi kesalahan' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title={v?.title ?? 'Create Barang'} />
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{v?.title ?? 'Create / Edit Barang'}</h1>
                        <p className="text-gray-600">Kelola informasi barang dengan pengaturan stok yang fleksibel</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-white/60 p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Section 1: SKU & Barcode */}
                            {v.page === 'barang-create' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">SKU *</label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                            placeholder="SKU Code (4-8 karakter)"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode *</label>
                                        <input
                                            type="text"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleInputChange}
                                            placeholder="Barcode"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        {errors.barcode && <p className="text-red-500 text-sm mt-1">{errors.barcode}</p>}
                                    </div>
                                </div>
                            )}

                            {v.page === 'barang-edit' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode *</label>
                                    <input
                                        type="text"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleInputChange}
                                        placeholder="Barcode"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.barcode && <p className="text-red-500 text-sm mt-1">{errors.barcode}</p>}
                                </div>
                            )}

                            {/* Section 2: Deskripsi & Alias */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi *</label>
                                    <input
                                        type="text"
                                        name="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={handleInputChange}
                                        placeholder="Deskripsi barang"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.deskripsi && <p className="text-red-500 text-sm mt-1">{errors.deskripsi}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alias</label>
                                    <input
                                        type="text"
                                        name="alias"
                                        value={formData.alias}
                                        onChange={handleInputChange}
                                        placeholder="Alias"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.alias && <p className="text-red-500 text-sm mt-1">{errors.alias}</p>}
                                </div>
                            </div>

                            {/* Section 3: Kategori & Satuan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori *</label>
                                    <select
                                        name="kategori_id"
                                        value={formData.kategori_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {kategori?.map((k: any) => (
                                            <option key={k.id} value={k.id}>{k.ket}</option>
                                        ))}
                                    </select>
                                    {errors.kategori_id && <p className="text-red-500 text-sm mt-1">{errors.kategori_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Satuan Beli *</label>
                                    <input
                                        type="text"
                                        name="satuan"
                                        value={formData.satuan}
                                        onChange={handleInputChange}
                                        placeholder="Satuan (Karton, Pcs, etc)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.satuan && <p className="text-red-500 text-sm mt-1">{errors.satuan}</p>}
                                </div>
                            </div>

                            {/* Section 4: Isi & Volume */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Isi (per Satuan Beli) *</label>
                                    <input
                                        type="number"
                                        name="isi"
                                        value={formData.isi}
                                        onChange={handleInputChange}
                                        placeholder="Jumlah isi"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.isi && <p className="text-red-500 text-sm mt-1">{errors.isi}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Satuan Jual *</label>
                                    <input
                                        type="text"
                                        name="volume"
                                        value={formData.volume}
                                        onChange={handleInputChange}
                                        placeholder="Satuan Jual (Pcs, Kg, etc)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume}</p>}
                                </div>
                            </div>

                            {/* Section 5: Harga */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Jual 1 *</label>
                                    <input
                                        type="number"
                                        name="harga_jual1"
                                        value={formData.harga_jual1}
                                        onChange={handleInputChange}
                                        placeholder="Harga Jual"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.harga_jual1 && <p className="text-red-500 text-sm mt-1">{errors.harga_jual1}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Jual 2 / Charge *</label>
                                    <input
                                        type="number"
                                        name="harga_jual2"
                                        value={formData.harga_jual2}
                                        onChange={handleInputChange}
                                        placeholder="Charge Piutang"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.harga_jual2 && <p className="text-red-500 text-sm mt-1">{errors.harga_jual2}</p>}
                                </div>
                            </div>

                            {/* Section 6: Settings */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Multiplier *</label>
                                    <select
                                        name="multiplier"
                                        value={formData.multiplier ? '1' : '0'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, multiplier: e.target.value === '1' }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="0">Tidak Aktif</option>
                                        <option value="1">Aktif</option>
                                    </select>
                                    {errors.multiplier && <p className="text-red-500 text-sm mt-1">{errors.multiplier}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min. Stok *</label>
                                    <input
                                        type="number"
                                        name="min_stock"
                                        value={formData.min_stock}
                                        onChange={handleInputChange}
                                        placeholder="Minimal Stok"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.min_stock && <p className="text-red-500 text-sm mt-1">{errors.min_stock}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jual saat Stok Habis</label>
                                    <div className="flex items-center gap-3 h-10">
                                        <input
                                            type="checkbox"
                                            name="allow_sold_zero_stock"
                                            checked={formData.allow_sold_zero_stock}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-600">
                                            {formData.allow_sold_zero_stock ? '✓ Diizinkan' : '✗ Tidak Diizinkan'}
                                        </span>
                                    </div>
                                    {errors.allow_sold_zero_stock && <p className="text-red-500 text-sm mt-1">{errors.allow_sold_zero_stock}</p>}
                                </div>
                            </div>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => router.visit('/barang')}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                >
                                    {loading ? 'Menyimpan...' : v.btnTitle}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
