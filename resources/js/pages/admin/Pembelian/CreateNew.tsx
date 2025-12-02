import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Plus, Trash2, Save, Search, Package, DollarSign, AlertCircle } from 'lucide-react';
import { formatDigit } from '../../../lib/formatters';
import ConfirmModal from '../../Kasir/components/ConfirmModal';
import AlertModal from '../../Kasir/components/AlertModal';
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
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    const [items, setItems] = useState<PembelianItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [tglFaktur, setTglFaktur] = useState(new Date().toISOString().split('T')[0]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'reset' | 'save' | null>(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');

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
            setHighlightedIndex(filtered.length > 0 ? 0 : -1); // Auto-highlight first item
        } else {
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    };

    const handleSelectBarang = (barang: BarangItem) => {
        // Check apakah barang sudah ada di tabel
        const isDuplicate = items.some((item) => item.sku === barang.sku);

        if (isDuplicate) {
            setInfoMessage(`"${barang.deskripsi}" sudah ada di daftar pembelian.`);
            setShowInfoModal(true);
            return;
        }

        // Langsung tambah ke tabel tanpa perlu pilih dulu
        const newItem: PembelianItem = {
            tempId: Date.now().toString(),
            sku: barang.sku,
            barcode: barang.barcode,
            deskripsi: barang.deskripsi,
            satuan: barang.satuan,
            isi: barang.isi,
            volume: barang.volume,
            qty: 1,
            hargaBeli: Math.floor(barang.harga_beli) || 0,
            total: Math.floor(barang.harga_beli) || 0,
        };

        setItems([...items, newItem]);
        setSearchBarang('');
        setShowDropdown(false);
        setHighlightedIndex(-1);
        // Focus back to input for quick continuous adding
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || filteredBarang.length === 0) {
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredBarang.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredBarang.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelectBarang(filteredBarang[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleReset = () => {
        setConfirmAction('reset');
        setShowConfirmModal(true);
    };

    const handleResetConfirm = () => {
        setSearchBarang('');
        setSelectedBarang(null);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        setItems([]);
        setTglFaktur(new Date().toISOString().split('T')[0]);
        setShowConfirmModal(false);
        setConfirmAction(null);
        inputRef.current?.focus();
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

        setConfirmAction('save');
        setShowConfirmModal(true);
    };

    const handleSubmitConfirm = async () => {
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
            setShowConfirmModal(false);
            setConfirmAction(null);
            router.visit('/admin/pembelian');
        } catch (error: any) {
            setLoading(false);
            setShowConfirmModal(false);
            setConfirmAction(null);
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
                                ref={inputRef}
                                type="text"
                                value={searchBarang}
                                onChange={(e) => handleSearchBarang(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="SKU, Barcode, atau Nama... (↑↓ navigasi, Enter tambah)"
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {showDropdown && filteredBarang.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredBarang.map((barang, index) => (
                                        <button
                                            key={barang.id}
                                            onClick={() => handleSelectBarang(barang)}
                                            className={`w-full px-2 py-2 text-left transition-colors border-b border-gray-100 last:border-0 cursor-pointer text-xs ${
                                                highlightedIndex === index
                                                    ? 'bg-blue-500 text-white'
                                                    : 'hover:bg-blue-50 text-gray-900'
                                            }`}
                                        >
                                            <div className="font-medium">{barang.deskripsi}</div>
                                            <div className={`text-xs ${highlightedIndex === index ? 'text-blue-100' : 'text-gray-500'}`}>
                                                SKU: {barang.sku} | {barang.barcode} | Rp {formatDigit(barang.harga_beli)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">SKU</th>
                                        <th className="px-2 py-2 text-left font-semibold text-gray-700">Nama Barang</th>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Qty</th>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Satuan</th>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Harga Beli</th>
                                        <th className="px-2 py-2 text-right font-semibold text-gray-700">Total</th>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <tr key={item.tempId} className="hover:bg-blue-50/50">
                                            <td className="px-2 py-2 font-medium text-gray-900 text-center">{item.sku}</td>
                                            <td className="px-2 py-2 text-gray-700 w-48 truncate-48">{item.deskripsi} asf asdf asdf asdf </td>
                                            <td className="px-2 py-2 text-center">
                                                <input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        handleUpdateItem(item.tempId, 'qty', parseInt(e.target.value) || '')
                                                    }
                                                    className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs text-center text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-gray-600 text-center">
                                                {item.satuan}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <input
                                                    type="number"
                                                    value={item.hargaBeli || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? Math.floor(Number(e.target.value)) : 0;
                                                        handleUpdateItem(item.tempId, 'hargaBeli', value);
                                                    }}
                                                    className="w-24 px-1.5 py-1 border border-gray-300 rounded text-xs text-center text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                    step="1"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-right font-bold text-green-700 w-32">
                                                {formatDigit(item.total)}
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
                            <div className="flex items-center justify-center gap-6">
                                <span className="text-md font-semibold text-gray-900">Grand Total:</span>
                                <span className="text-lg font-bold text-blue-700">
                                    Rp. {formatDigit(calculateGrandTotal())}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={handleReset}
                        className="w-auto md:w-48 bg-gray-400 hover:bg-red-600 text-gray-900 hover:text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                    >
                        Reset Form
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                        className="w-auto md:w-48 flex items-center justify-center gap-1.5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Menyimpan...' : 'Simpan'}
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

                {/* Info Modal - Barang Duplikat */}
                <AlertModal
                    show={showInfoModal}
                    title="Barang Sudah Ada"
                    message={infoMessage}
                    type="warning"
                    confirmText="Tutup"
                    onConfirm={() => {
                        setShowInfoModal(false);
                        inputRef.current?.focus();
                    }}
                />

                {/* Confirmation Modal */}
                <ConfirmModal
                    show={showConfirmModal}
                    title={confirmAction === 'reset' ? 'Reset Form?' : 'Simpan Pembelian?'}
                    message={
                        confirmAction === 'reset'
                            ? 'Apakah Anda yakin ingin reset form? Semua data akan dihapus.'
                            : `Apakah Anda yakin ingin menyimpan pembelian dengan ${items.length} barang?`
                    }
                    type={confirmAction === 'reset' ? 'warning' : 'info'}
                    confirmText={confirmAction === 'reset' ? 'Reset' : 'Simpan'}
                    cancelText="Batal"
                    onConfirm={confirmAction === 'reset' ? handleResetConfirm : handleSubmitConfirm}
                    onCancel={() => {
                        setShowConfirmModal(false);
                        setConfirmAction(null);
                    }}
                />
            </div>
        </AdminLayout>
    );
}
