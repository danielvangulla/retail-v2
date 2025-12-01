import { useState, useEffect } from 'react';
import AdminLayout from '../../admin/Layout';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save, Search, Package, DollarSign, AlertCircle } from 'lucide-react';
import { formatDigit } from '../../../lib/formatters';
import axios from 'axios';

interface BarangItem {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    alias: string;
    satuan: string;
    isi: number;
    volume: string;
    harga_beli: number;
}

interface PembelianItem {
    tempId: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    satuan: string;
    isi: number;
    volume: string;
    qty: number;
    hargaBeli: number;
    total: number;
}

export default function PembelianCreateNew() {
    const [barangList, setBarangList] = useState<BarangItem[]>([]);
    const [filteredBarang, setFilteredBarang] = useState<BarangItem[]>([]);
    const [searchBarang, setSearchBarang] = useState('');
    const [selectedBarang, setSelectedBarang] = useState<BarangItem | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const [items, setItems] = useState<PembelianItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [tglFaktur, setTglFaktur] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        // Load barang list
        fetchBarangList();
    }, []);

    const fetchBarangList = async () => {
        try {
            const response = await axios.get('/back/barang-all');
            setBarangList(response.data.data || []);
        } catch (error) {
            console.error('Error fetching barang:', error);
        }
    };

    const handleSearchBarang = (value: string) => {
        setSearchBarang(value);
        if (value.length >= 2) {
            const filtered = barangList.filter(
                (b) =>
                    b.sku.toLowerCase().includes(value.toLowerCase()) ||
                    b.barcode.toLowerCase().includes(value.toLowerCase()) ||
                    b.deskripsi.toLowerCase().includes(value.toLowerCase()) ||
                    b.alias.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredBarang(filtered);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleSelectBarang = (barang: BarangItem) => {
        setSelectedBarang(barang);
        setSearchBarang(barang.deskripsi);
        setShowDropdown(false);
    };

    const handleAddItem = () => {
        if (!selectedBarang) {
            alert('Pilih barang terlebih dahulu');
            return;
        }

        const newItem: PembelianItem = {
            tempId: Date.now().toString(),
            sku: selectedBarang.sku,
            barcode: selectedBarang.barcode,
            deskripsi: selectedBarang.deskripsi,
            satuan: selectedBarang.satuan,
            isi: selectedBarang.isi,
            volume: selectedBarang.volume,
            qty: 1,
            hargaBeli: selectedBarang.harga_beli || 0,
            total: selectedBarang.harga_beli || 0,
        };

        setItems([...items, newItem]);
        setSearchBarang('');
        setSelectedBarang(null);
    };

    const handleRemoveItem = (tempId: string) => {
        setItems(items.filter((item) => item.tempId !== tempId));
    };

    const handleUpdateItem = (tempId: string, field: keyof PembelianItem, value: any) => {
        setItems(
            items.map((item) => {
                if (item.tempId === tempId) {
                    const updated = { ...item, [field]: value };
                    if (field === 'qty' || field === 'hargaBeli') {
                        updated.total = updated.qty * updated.hargaBeli;
                    }
                    return updated;
                }
                return item;
            })
        );
    };

    const calculateGrandTotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            alert('Tambahkan minimal 1 barang');
            return;
        }

        setLoading(true);

        const data = {
            tgl_faktur: tglFaktur,
            data: items.map((item) => ({
                sku: item.sku,
                barcode: item.barcode,
                qtyBeli: item.qty,
                hargaBeli: item.hargaBeli,
                total: item.total,
            })),
        };

        try {
            await axios.post('/back/pembelian', data);
            router.visit('/back/pembelian');
        } catch (error: any) {
            setLoading(false);
            alert(error.response?.data?.msg || 'Terjadi kesalahan');
        }
    };

    return (
        <AdminLayout title="Input Pembelian">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50">
                    <h3 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        Input Pembelian Barang
                    </h3>
                    <p className="text-gray-500 text-sm">Tambahkan barang yang dibeli untuk update stok dan harga</p>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900">Tanggal Faktur</label>
                            <input
                                type="date"
                                value={tglFaktur}
                                onChange={(e) => setTglFaktur(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Search Barang */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100/50">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-600" />
                        Cari Barang
                    </h4>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchBarang}
                            onChange={(e) => handleSearchBarang(e.target.value)}
                            placeholder="Cari berdasarkan SKU, Barcode, atau Nama..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {showDropdown && filteredBarang.length > 0 && (
                            <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                                {filteredBarang.map((barang) => (
                                    <button
                                        key={barang.id}
                                        onClick={() => handleSelectBarang(barang)}
                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                                    >
                                        <div className="font-semibold text-gray-900">{barang.deskripsi}</div>
                                        <div className="text-sm text-gray-500">
                                            SKU: {barang.sku} | Barcode: {barang.barcode} | Harga: Rp{' '}
                                            {formatDigit(barang.harga_beli)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAddItem}
                        disabled={!selectedBarang}
                        className="mt-4 flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah ke Daftar
                    </button>
                </div>

                {/* Items Table */}
                {items.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100/50">
                        <div className="p-6 border-b border-gray-100">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Daftar Barang ({items.length} item)
                            </h4>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-linear-to-r from-gray-50 to-blue-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama Barang</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Satuan</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Qty</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Harga Beli</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <tr key={item.tempId} className="hover:bg-blue-50/50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sku}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{item.deskripsi}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {item.volume} ({item.isi} {item.satuan})
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        handleUpdateItem(item.tempId, 'qty', parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={item.hargaBeli}
                                                    onChange={(e) =>
                                                        handleUpdateItem(item.tempId, 'hargaBeli', parseFloat(e.target.value) || 0)
                                                    }
                                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-green-700">
                                                Rp {formatDigit(item.total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleRemoveItem(item.tempId)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                                                    title="Hapus item"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Grand Total */}
                        <div className="p-6 bg-linear-to-r from-blue-50 to-gray-50 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                    <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                                </div>
                                <span className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    Rp {formatDigit(calculateGrandTotal())}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Menyimpan...' : 'Simpan Pembelian'}
                    </button>
                    <button
                        onClick={() => router.visit('/back/pembelian')}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-4 rounded-xl font-semibold transition-all cursor-pointer"
                    >
                        Batal
                    </button>
                </div>

                {/* Info */}
                {items.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Belum ada barang ditambahkan</p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Gunakan form pencarian di atas untuk mencari dan menambahkan barang ke daftar pembelian.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
