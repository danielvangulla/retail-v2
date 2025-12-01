import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface Barang {
    id: number;
    sku: string;
    barcode: string;
    deskripsi: string;
    satuan: string;
    stock: number;
    min_stock: number;
    harga_jual1: number;
    kategori: string;
}

interface Props {
    barang: Barang[];
}

export default function LowStock({ barang }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Barang Stok Minimum" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-red-600">
                                    ⚠️ Barang Stok Minimum
                                </h2>
                                <button
                                    onClick={() => router.visit('/barang')}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Kembali
                                </button>
                            </div>

                            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-yellow-800">
                                    <strong>Perhatian:</strong> Barang-barang berikut memiliki stok yang sama atau kurang dari batas minimum.
                                    Segera lakukan pembelian untuk mengisi stok.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-red-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase">
                                                SKU
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase">
                                                Barcode
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase">
                                                Nama Barang
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase">
                                                Kategori
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase">
                                                Min Stock
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase">
                                                Harga
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-red-700 uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {barang.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                                    Tidak ada barang dengan stok minimum
                                                </td>
                                            </tr>
                                        ) : (
                                            barang.map((item) => (
                                                <tr key={item.id} className="bg-red-50 hover:bg-red-100">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        {item.sku}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {item.barcode}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {item.deskripsi}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {item.kategori}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right">
                                                        <span className="font-bold text-red-600">
                                                            {item.stock} {item.satuan}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                                                        {item.min_stock} {item.satuan}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                                                        Rp {item.harga_jual1.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <button
                                                            onClick={() => router.visit('/pembelian/create')}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                                        >
                                                            Beli
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
