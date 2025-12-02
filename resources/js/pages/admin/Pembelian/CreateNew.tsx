import { useState, useEffect } from 'react';
import AdminLayout from '../Layout';
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
            const response = await axios.get('/admin/barang-all');
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
            await axios.post('/admin/pembelian', data);
            router.visit('/admin/pembelian');
        } catch (error: any) {
            setLoading(false);
            alert(error.response?.data?.msg || 'Terjadi kesalahan');
        }
    };

    return (
        <AdminLayout title="Input Pembelian">
            <div className="max-w-7xl mx-auto space-y-3">
                {/* Header + Date */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100/50 flex items-end gap-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Input Pembelian</h3>
                        <p className="text-xs text-gray-500">Tambahkan barang yang dibeli</p>
                    </div>
                    <div className="flex items-end gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Tgl Faktur</label>
                            <input
                                type="date"
                                value={tglFaktur}
                                onChange={(e) => setTglFaktur(e.target.value)}
                                className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Search & Add */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100/50">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Cari Barang</label>
                            <input
                                type="text"
                                value={searchBarang}
                                onChange={(e) => handleSearchBarang(e.target.value)}
                                placeholder="SKU, Barcode, atau Nama..."
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {showDropdown && filteredBarang.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredBarang.map((barang) => (
                                        <button
                                            key={barang.id}
                                            onClick={() => handleSelectBarang(barang)}
                                            className="w-full px-2 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer text-xs"
                                        >
                                            <div className="font-medium text-gray-900">{barang.deskripsi}</div>
                                            <div className="text-xs text-gray-500">
                                                SKU: {barang.sku} | {barang.barcode} | Rp {formatDigit(barang.harga_beli)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddItem}
                            disabled={!selectedBarang}
                            className="flex items-center gap-1 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah
                        </button>
                    </div>
                </div>

                {/* Items Table */}
                {items.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100/50">
                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                            <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                                <Package className="h-4 w-4 text-blue-600" />
                                Daftar Barang ({items.length})
                            </h4>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left font-semibold text-gray-700">SKU</th>
                                        <th className="px-2 py-2 text-left font-semibold text-gray-700">Nama Barang</th>
                                        <th className="px-2 py-2 text-left font-semibold text-gray-700">Satuan</th>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Qty</th>
                                        <th className="px-2 py-2 text-right font-semibold text-gray-700">Harga Beli</th>
                                        <th className="px-2 py-2 text-right font-semibold text-gray-700">Total</th>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <tr key={item.tempId} className="hover:bg-blue-50/50">
                                            <td className="px-2 py-2 font-medium text-gray-900">{item.sku}</td>
                                            <td className="px-2 py-2 text-gray-700">{item.deskripsi}</td>
                                            <td className="px-2 py-2 text-gray-600">
                                                {item.volume} ({item.isi} {item.satuan})
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        handleUpdateItem(item.tempId, 'qty', parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-right">
                                                <input
                                                    type="number"
                                                    value={item.hargaBeli}
                                                    onChange={(e) =>
                                                        handleUpdateItem(item.tempId, 'hargaBeli', parseFloat(e.target.value) || 0)
                                                    }
                                                    className="w-24 px-1.5 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-right font-bold text-green-700">
                                                Rp {formatDigit(item.total)}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(item.tempId)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded transition cursor-pointer"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Grand Total */}
                        <div className="px-3 py-2 bg-blue-50 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-900">Grand Total:</span>
                                <span className="text-lg font-bold text-blue-700">
                                    Rp {formatDigit(calculateGrandTotal())}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                        onClick={() => router.visit('/admin/pembelian')}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                    >
                        Batal
                    </button>
                </div>

                {/* Info */}
                {items.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 text-xs">
                        <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-800">Belum ada barang ditambahkan</p>
                            <p className="text-yellow-700">Gunakan form pencarian untuk menambahkan barang ke daftar pembelian.</p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
