import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import axios from 'axios';

interface Barang {
    id: number;
    sku: string;
    barcode: string;
    deskripsi: string;
    alias: string;
    satuan: string;
    isi: number;
    volume: number;
    stock: number;
    min_stock: number;
    harga_jual1: number;
    harga_jual2: number;
    kategori: string;
    created_at: string;
}

interface Props {
    show: number;
}

export default function Index({ show }: Props) {
    const [barang, setBarang] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBarang();
    }, [show]);

    const loadBarang = async () => {
        try {
            const response = await axios.get(`/api/barang-list?show=${show}`);
            if (response.data.status === 'ok') {
                setBarang(response.data.data);
            }
        } catch (error) {
            console.error('Error loading barang:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus barang ini?')) return;

        try {
            await axios.delete(`/api/barang/${id}`);
            loadBarang();
        } catch (error) {
            console.error('Error deleting barang:', error);
        }
    };

    const handleRestore = async (id: number) => {
        try {
            await axios.post(`/api/barang/${id}/restore`);
            loadBarang();
        } catch (error) {
            console.error('Error restoring barang:', error);
        }
    };

    const filteredBarang = barang.filter(item =>
        item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.includes(searchTerm) ||
        item.barcode.includes(searchTerm)
    );

    return (
        <AuthenticatedLayout>
            <Head title={show ? "Data Barang" : "Data Barang Terhapus"} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {show ? "Data Barang" : "Data Barang Terhapus"}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => router.visit('/barang/low-stock')}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    >
                                        Stok Minimum
                                    </button>
                                    {show ? (
                                        <>
                                            <button
                                                onClick={() => router.visit('/barang/create')}
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Tambah Barang
                                            </button>
                                            <button
                                                onClick={() => router.visit('/barang/deleted')}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                Lihat Terhapus
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => router.visit('/barang')}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Kembali
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Cari barang (nama, SKU, barcode)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredBarang.map((item) => (
                                                <tr key={item.id} className={item.stock <= item.min_stock ? 'bg-red-50' : ''}>
                                                    <td className="px-6 py-4 text-sm">{item.sku}</td>
                                                    <td className="px-6 py-4 text-sm">{item.barcode}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">{item.deskripsi}</td>
                                                    <td className="px-6 py-4 text-sm">{item.kategori}</td>
                                                    <td className="px-6 py-4 text-sm text-right">
                                                        <span className={item.stock <= item.min_stock ? 'text-red-600 font-bold' : ''}>
                                                            {item.stock} {item.satuan}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-right">
                                                        Rp {item.harga_jual1.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        {show ? (
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => router.visit(`/barang/${item.id}/edit`)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRestore(item.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Restore
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
