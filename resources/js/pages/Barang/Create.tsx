import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface Kategori {
    id: number;
    ket: string;
    sku_from: string;
    sku_to: string;
    auto_sku?: string;
}

interface Kategorisub {
    id: number;
    kategori_id: number;
    ket: string;
}

interface Barang {
    id?: number;
    sku: string;
    barcode: string;
    deskripsi: string;
    alias: string;
    satuan: string;
    isi: number;
    volume: number;
    min_stock: number;
    harga_jual1: number;
    harga_jual2: number;
    kategori_id: number;
    kategorisub_id: number | null;
}

interface Props {
    var: {
        page: string;
        title: string;
        btnTitle: string;
    };
    kategori: Kategori[];
    kategorisub: Kategorisub[];
    barang?: Barang;
}

export default function Create({ var: pageVar, kategori, kategorisub, barang }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<Barang>({
        sku: barang?.sku || '',
        barcode: barang?.barcode || '',
        deskripsi: barang?.deskripsi || '',
        alias: barang?.alias || '',
        satuan: barang?.satuan || 'Pcs',
        isi: barang?.isi || 1,
        volume: barang?.volume || 0,
        min_stock: barang?.min_stock || 0,
        harga_jual1: barang?.harga_jual1 || 0,
        harga_jual2: barang?.harga_jual2 || 0,
        kategori_id: barang?.kategori_id || 0,
        kategorisub_id: barang?.kategorisub_id || null,
    });

    const filteredKategorisub = kategorisub.filter(
        (ks) => ks.kategori_id === data.kategori_id
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (pageVar.page === 'barang-create') {
            post('/api/barang', {
                onSuccess: () => router.visit('/barang'),
            });
        } else {
            put(`/api/barang/${barang?.id}`, {
                onSuccess: () => router.visit('/barang'),
            });
        }
    };

    const handleKategoriChange = (kategoriId: number) => {
        setData('kategori_id', kategoriId);

        // Auto-fill SKU if creating new
        if (pageVar.page === 'barang-create') {
            const selectedKategori = kategori.find(k => k.id === kategoriId);
            if (selectedKategori?.auto_sku) {
                const nextSku = (parseInt(selectedKategori.auto_sku) + 1).toString();
                setData('sku', nextSku);
            }
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={pageVar.title} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">{pageVar.title}</h2>
                                <button
                                    onClick={() => router.visit('/barang')}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Kembali
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kategori *
                                        </label>
                                        <select
                                            value={data.kategori_id}
                                            onChange={(e) => handleKategoriChange(Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded"
                                            required
                                        >
                                            <option value={0}>Pilih Kategori</option>
                                            {kategori.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.ket}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.kategori_id && (
                                            <span className="text-red-500 text-sm">{errors.kategori_id}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sub Kategori
                                        </label>
                                        <select
                                            value={data.kategorisub_id || ''}
                                            onChange={(e) => setData('kategorisub_id', e.target.value ? Number(e.target.value) : null)}
                                            className="w-full px-3 py-2 border rounded"
                                        >
                                            <option value="">Tidak Ada</option>
                                            {filteredKategorisub.map((ks) => (
                                                <option key={ks.id} value={ks.id}>
                                                    {ks.ket}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            SKU *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value)}
                                            className="w-full px-3 py-2 border rounded"
                                            required
                                        />
                                        {errors.sku && <span className="text-red-500 text-sm">{errors.sku}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Barcode *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.barcode}
                                            onChange={(e) => setData('barcode', e.target.value)}
                                            className="w-full px-3 py-2 border rounded"
                                            required
                                        />
                                        {errors.barcode && <span className="text-red-500 text-sm">{errors.barcode}</span>}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Barang *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.deskripsi}
                                            onChange={(e) => setData('deskripsi', e.target.value)}
                                            className="w-full px-3 py-2 border rounded"
                                            required
                                        />
                                        {errors.deskripsi && <span className="text-red-500 text-sm">{errors.deskripsi}</span>}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Alias
                                        </label>
                                        <input
                                            type="text"
                                            value={data.alias}
                                            onChange={(e) => setData('alias', e.target.value)}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Satuan *
                                        </label>
                                        <select
                                            value={data.satuan}
                                            onChange={(e) => setData('satuan', e.target.value)}
                                            className="w-full px-3 py-2 border rounded"
                                        >
                                            <option value="Pcs">Pcs</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Liter">Liter</option>
                                            <option value="Pack">Pack</option>
                                            <option value="Box">Box</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Isi
                                        </label>
                                        <input
                                            type="number"
                                            value={data.isi}
                                            onChange={(e) => setData('isi', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Volume (ml/gram)
                                        </label>
                                        <input
                                            type="number"
                                            value={data.volume}
                                            onChange={(e) => setData('volume', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Stok Minimum
                                        </label>
                                        <input
                                            type="number"
                                            value={data.min_stock}
                                            onChange={(e) => setData('min_stock', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Harga Jual 1 *
                                        </label>
                                        <input
                                            type="number"
                                            value={data.harga_jual1}
                                            onChange={(e) => setData('harga_jual1', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded"
                                            required
                                        />
                                        {errors.harga_jual1 && <span className="text-red-500 text-sm">{errors.harga_jual1}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Harga Jual 2
                                        </label>
                                        <input
                                            type="number"
                                            value={data.harga_jual2}
                                            onChange={(e) => setData('harga_jual2', Number(e.target.value))}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => router.visit('/barang')}
                                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                                    >
                                        {processing ? 'Menyimpan...' : pageVar.btnTitle}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
