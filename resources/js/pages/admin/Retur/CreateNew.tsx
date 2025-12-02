import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, Trash2, Package, Save } from 'lucide-react';
import { formatDigit } from '../../../lib/formatters';
import AlertModal from '../../Kasir/components/AlertModal';
import ConfirmModal from '../../Kasir/components/ConfirmModal';
import AdminLayout from '../Layout';

interface SearchResult {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    satuan: string;
    isi: number;
    volume: string;
    harga_beli: number;
    alias?: string;
    stock?: number;
}

interface ReturItem {
    sku: string;
    barcode: string;
    deskripsi: string;
    satuan: string;
    isi: number;
    volume: string;
    hargaBeli: number;
    qtyRetur: number;
    total: number;
}

export default function ReturCreateNew() {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [items, setItems] = useState<ReturItem[]>([]);
    const [ket, setKet] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'reset' | 'save' | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Search barang
    const handleSearchInput = async (value: string) => {
        setSearch(value);
        setHighlightedIndex(-1);

        if (value.length < 2) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/admin/barang-all');
            const data = await response.json();

            const filtered = data.data.filter((b: SearchResult) =>
                b.barcode?.includes(value) ||
                b.sku?.includes(value) ||
                b.deskripsi?.toLowerCase().includes(value.toLowerCase()) ||
                b.alias?.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 20);

            setResults(filtered);
            if (filtered.length > 0) {
                setHighlightedIndex(0);
            }
        } finally {
            setLoading(false);
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < results.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev > 0 ? prev - 1 : results.length - 1
            );
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && results[highlightedIndex]) {
                addItem(results[highlightedIndex]);
            }
        }
    };

    // Add item to table
    const addItem = (barang: SearchResult) => {
        // Check duplicate
        if (items.some(item => item.sku === barang.sku)) {
            setAlertMessage(`"${barang.deskripsi}" sudah ada di daftar retur.`);
            setShowAlertModal(true);
            return;
        }

        const item: ReturItem = {
            sku: barang.sku,
            barcode: barang.barcode || '',
            deskripsi: barang.deskripsi,
            satuan: barang.satuan,
            isi: barang.isi,
            volume: barang.volume,
            hargaBeli: barang.harga_beli,
            qtyRetur: 1,
            total: barang.harga_beli,
        };

        setItems([...items, item]);
        setSearch('');
        setResults([]);
        setHighlightedIndex(-1);
        searchInputRef.current?.focus();
    };

    // Update qty
    const handleQtyChange = (idx: number, qty: number) => {
        const updated = [...items];
        updated[idx].qtyRetur = Math.max(1, qty);
        updated[idx].total = updated[idx].qtyRetur * updated[idx].hargaBeli;
        setItems(updated);
    };

    // Remove item
    const handleRemoveItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    // Handle save
    const handleSave = () => {
        if (items.length === 0) {
            setAlertMessage('Tambahkan minimal 1 item retur');
            setShowAlertModal(true);
            return;
        }

        setConfirmAction('save');
        setShowConfirmModal(true);
    };

    // Confirm save
    const handleConfirmSave = async () => {
        setShowConfirmModal(false);
        setConfirmAction(null);

        try {
            const response = await fetch('/admin/retur', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    data: items,
                    ket: ket,
                }),
            });

            const result = await response.json();
            if (result.status === 'ok') {
                router.visit('/admin/retur');
            } else {
                setAlertMessage(result.msg || 'Gagal menyimpan retur');
                setShowAlertModal(true);
            }
        } catch (error: any) {
            setAlertMessage(error.message || 'Terjadi kesalahan');
            setShowAlertModal(true);
        }
    };

    // Handle reset
    const handleReset = () => {
        setConfirmAction('reset');
        setShowConfirmModal(true);
    };

    const handleResetConfirm = () => {
        setSearch('');
        setResults([]);
        setItems([]);
        setKet('');
        setHighlightedIndex(-1);
        setShowConfirmModal(false);
        setConfirmAction(null);
        searchInputRef.current?.focus();
    };

    // Total
    const grandTotal = items.reduce((sum, item) => sum + +item.total, 0);

    return (
        <AdminLayout title="Input Retur Barang">
            <div className="max-w-7xl mx-auto space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100/50">
                    <h3 className="text-lg font-bold text-gray-900">Input Retur Barang</h3>
                    <p className="text-xs text-gray-500">Tambahkan barang retur yang dikembalikan</p>
                </div>

                {/* Keterangan */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100/50">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Keterangan (Optional)</label>
                    <input
                        type="text"
                        placeholder="Contoh: Barang rusak, kemasan penyok, dll"
                        value={ket}
                        onChange={(e) => setKet(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Search & Add */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100/50">
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Cari Barang</label>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="SKU, Barcode, atau Nama... (↑↓ navigasi, Enter tambah)"
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {results.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {results.map((barang, index) => (
                                        <button
                                            key={barang.id}
                                            onClick={() => addItem(barang)}
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

                            {loading && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs text-gray-500 text-center">
                                    Mencari...
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
                                Daftar Retur ({items.length})
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
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Harga</th>
                                        <th className="px-2 py-2 text-right font-semibold text-gray-700">Total</th>
                                        <th className="px-2 py-2 text-center font-semibold text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/50">
                                            <td className="px-2 py-2 font-medium text-gray-900 text-center">{item.sku}</td>
                                            <td className="px-2 py-2 text-gray-700 w-48 truncate">{item.deskripsi}</td>
                                            <td className="px-2 py-2 text-center">
                                                <input
                                                    type="number"
                                                    value={item.qtyRetur}
                                                    onChange={(e) =>
                                                        handleQtyChange(idx, (+e.target.value || 0))
                                                    }
                                                    className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs text-center text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-gray-600 text-center">
                                                {item.satuan}
                                            </td>
                                            <td className="px-2 py-2 text-center text-xs font-medium text-gray-700">
                                                Rp {formatDigit(item.hargaBeli)}
                                            </td>
                                            <td className="px-2 py-2 text-right font-bold text-green-700 w-32">
                                                Rp {formatDigit(item.total)}
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(idx)}
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
                                    Rp. {formatDigit(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => router.visit('/admin/retur')}
                        className="w-auto md:w-48 bg-gray-400 hover:bg-gray-600 text-gray-900 hover:text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-auto md:w-48 bg-red-400 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer"
                    >
                        Reset Form
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || items.length === 0}
                        className="w-auto md:w-48 flex items-center justify-center gap-1.5 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Menyimpan...' : 'Simpan Retur'}
                    </button>
                </div>

                {/* Info */}
                {items.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2 text-xs">
                        <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-800">Belum ada barang ditambahkan</p>
                            <p className="text-yellow-700">Gunakan form pencarian untuk menambahkan barang ke daftar retur.</p>
                        </div>
                    </div>
                )}

                {/* Alert Modal */}
                <AlertModal
                    show={showAlertModal}
                    title="Perhatian"
                    message={alertMessage}
                    type="warning"
                    confirmText="Tutup"
                    onConfirm={() => {
                        setShowAlertModal(false);
                        searchInputRef.current?.focus();
                    }}
                />

                {/* Confirmation Modal */}
                <ConfirmModal
                    show={showConfirmModal}
                    title={confirmAction === 'reset' ? 'Reset Form?' : 'Simpan Retur?'}
                    message={
                        confirmAction === 'reset'
                            ? 'Apakah Anda yakin ingin reset form? Semua data akan dihapus.'
                            : `Apakah Anda yakin ingin menyimpan retur dengan ${items.length} barang?`
                    }
                    type={confirmAction === 'reset' ? 'warning' : 'info'}
                    confirmText={confirmAction === 'reset' ? 'Reset' : 'Simpan'}
                    cancelText="Batal"
                    onConfirm={confirmAction === 'reset' ? handleResetConfirm : handleConfirmSave}
                    onCancel={() => {
                        setShowConfirmModal(false);
                        setConfirmAction(null);
                    }}
                />
            </div>
        </AdminLayout>
    );
}
