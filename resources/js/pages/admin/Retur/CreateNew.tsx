import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, Trash2 } from 'lucide-react';
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
    const [alertModal, setAlertModal] = useState({ show: false, title: '', msg: '', type: 'info' as 'info' | 'success' | 'warning' | 'error' });
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; title: string; msg: string }>({ show: false, title: '', msg: '' });
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
            setAlertModal({
                show: true,
                title: 'Duplikat Item',
                msg: `Barang "${barang.deskripsi}" sudah ada di list`,
                type: 'warning'
            });
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

    // Total
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    // Handle save
    const handleSave = () => {
        if (items.length === 0) {
            setAlertModal({
                show: true,
                title: 'Peringatan',
                msg: 'Tambahkan minimal 1 item retur',
                type: 'warning'
            });
            return;
        }

        setConfirmModal({
            show: true,
            title: 'Konfirmasi Simpan',
            msg: `Simpan ${items.length} item retur dengan total Rp ${formatDigit(grandTotal)}?`
        });
    };

    // Confirm save
    const handleConfirmSave = async () => {
        setConfirmModal({ show: false, title: '', msg: '' });

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
                setAlertModal({
                    show: true,
                    title: 'Berhasil',
                    msg: result.msg,
                    type: 'success'
                });
                setTimeout(() => {
                    router.visit('/admin/retur');
                }, 1500);
            }
        } catch (error) {
            setAlertModal({
                show: true,
                title: 'Error',
                msg: 'Gagal menyimpan retur',
                type: 'error'
            });
        }
    };

    // Handle reset
    const handleReset = () => {
        setConfirmModal({
            show: true,
            title: 'Konfirmasi Reset',
            msg: 'Hapus semua data yang sudah diinput?'
        });
    };

    return (
        <AdminLayout title="Input Retur Barang">
            <div className="max-w-6xl">
                {/* Keterangan */}
                <div className="bg-white rounded-xl shadow-sm border border-white/60 p-6 mb-6">
                    <label className="block text-sm font-600 text-gray-700 mb-2">Keterangan (Optional)</label>
                    <input
                        type="text"
                        placeholder="Contoh: Barang rusak, kemasan penyok, dll"
                        value={ket}
                        onChange={(e) => setKet(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-white/60 p-6 mb-6">
                    <label className="block text-sm font-600 text-gray-700 mb-3">Cari Barang (Min. 2 karakter)</label>
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Barcode / SKU / Nama Barang"
                            value={search}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoComplete="off"
                        />

                        {/* Search Results */}
                        {results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                {results.map((result, idx) => (
                                    <button
                                        key={result.id}
                                        onClick={() => addItem(result)}
                                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0 ${
                                            idx === highlightedIndex ? 'bg-blue-100' : ''
                                        }`}
                                    >
                                        <div className="font-600 text-gray-900">{result.deskripsi}</div>
                                        <div className="text-sm text-gray-600">SKU: {result.sku} | Barcode: {result.barcode || '—'}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg p-4 text-center text-gray-500">
                                Mencari...
                            </div>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-white/60 overflow-hidden mb-6">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-linear-to-r from-blue-100 to-blue-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">SKU</th>
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">Nama Barang</th>
                                <th className="px-6 py-3 text-center text-sm font-600 text-gray-700">Qty</th>
                                <th className="px-6 py-3 text-right text-sm font-600 text-gray-700">Harga</th>
                                <th className="px-6 py-3 text-right text-sm font-600 text-gray-700">Total</th>
                                <th className="px-6 py-3 text-center text-sm font-600 text-gray-700">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Belum ada item retur
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-600 text-gray-900">{item.sku}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{item.deskripsi}</td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.qtyRetur}
                                                onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-700">Rp {formatDigit(item.hargaBeli)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-600 text-gray-900">Rp {formatDigit(item.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                className="text-red-600 hover:text-red-800 transition"
                                                title="Hapus"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {items.length > 0 && (
                            <tfoot>
                                <tr className="bg-linear-to-r from-blue-100 to-blue-50 border-t-2 border-gray-200">
                                    <td colSpan={4} className="px-6 py-4 text-right font-600 text-gray-900">
                                        TOTAL:
                                    </td>
                                    <td className="px-6 py-4 text-right font-600 text-lg text-blue-600">
                                        Rp {formatDigit(grandTotal)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 justify-end">
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                        Simpan Retur
                    </button>
                </div>
            </div>

            {/* Alerts */}
            <AlertModal
                show={alertModal.show}
                title={alertModal.title}
                message={alertModal.msg}
                type={alertModal.type}
                onConfirm={() => setAlertModal({ show: false, title: '', msg: '', type: 'info' })}
            />

            <ConfirmModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.msg}
                onConfirm={() => {
                    if (confirmModal.title === 'Konfirmasi Simpan') {
                        handleConfirmSave();
                    } else if (confirmModal.title === 'Konfirmasi Reset') {
                        setItems([]);
                        setKet('');
                        setConfirmModal({ show: false, title: '', msg: '' });
                    }
                }}
                onCancel={() => setConfirmModal({ show: false, title: '', msg: '' })}
            />
        </AdminLayout>
    );
}
