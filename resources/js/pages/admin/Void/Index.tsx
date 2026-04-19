import { useState, useCallback } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Search, AlertTriangle, CheckCircle2, XCircle, Calendar, User, Receipt, RefreshCw } from 'lucide-react';

interface Kasir {
    id: string;
    name: string;
}

interface TransaksiItem {
    id: string;
    tgl: string;
    meja: string;
    bayar: number;
    brutto: number;
    disc_spv: number;
    disc_promo: number;
    netto: number;
    is_cancel: number;
    created_at: string;
    kasir?: Kasir;
    details?: any[];
}

interface PaginationData {
    data: TransaksiItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function VoidIndex() {
    const today = new Date().toISOString().split('T')[0];

    const [date, setDate] = useState(today);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [transaksis, setTransaksis] = useState<PaginationData | null>(null);

    const [voidModal, setVoidModal] = useState<{ open: boolean; transaksi: TransaksiItem | null }>({ open: false, transaksi: null });
    const [alasan, setAlasan] = useState('');
    const [voidLoading, setVoidLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const fetchTransaksis = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ date });
            if (search) { params.append('search', search); }

            const response = await fetch(`/admin/void/transactions?${params.toString()}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            const json = await response.json();
            if (json.status === 'ok') {
                setTransaksis(json.data);
            }
        } catch (e) {
            setAlert({ type: 'error', msg: 'Gagal memuat data transaksi' });
        } finally {
            setLoading(false);
        }
    }, [date, search]);

    const handleSearch = () => { fetchTransaksis(); };

    const openVoidModal = (trx: TransaksiItem) => {
        setVoidModal({ open: true, transaksi: trx });
        setAlasan('');
    };

    const closeVoidModal = () => {
        setVoidModal({ open: false, transaksi: null });
        setAlasan('');
    };

    const handleVoid = async () => {
        if (!voidModal.transaksi) { return; }
        if (!alasan.trim()) {
            setAlert({ type: 'error', msg: 'Alasan void wajib diisi' });
            return;
        }

        setVoidLoading(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const response = await fetch('/admin/void', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    transaksi_id: voidModal.transaksi.id,
                    alasan: alasan.trim(),
                }),
            });

            const json = await response.json();

            if (json.status === 'ok') {
                setAlert({ type: 'success', msg: json.msg });
                closeVoidModal();
                fetchTransaksis();
            } else {
                setAlert({ type: 'error', msg: json.msg || 'Gagal memvoid transaksi' });
            }
        } catch (e) {
            setAlert({ type: 'error', msg: 'Terjadi kesalahan jaringan' });
        } finally {
            setVoidLoading(false);
        }
    };

    return (
        <AdminLayout title="Void Transaksi">
            <div className="space-y-4 sm:space-y-6 bg-linear-to-br from-orange-50 via-red-50 to-pink-50 -m-4 sm:-m-6 p-4 sm:p-6 rounded-xl">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                            Void Transaksi
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Batalkan transaksi yang sudah dibayar. Stok akan dikembalikan otomatis.</p>
                    </div>
                    <button
                        onClick={() => router.visit('/admin/report/void')}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-medium transition shadow-sm text-sm"
                    >
                        <Receipt className="h-4 w-4" />
                        Laporan Void
                    </button>
                </div>

                {/* Alert */}
                {alert && (
                    <div className={`flex items-center gap-3 rounded-xl p-4 ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                        {alert.type === 'success'
                            ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                            : <XCircle className="h-5 w-5 shrink-0" />}
                        <span className="text-sm font-medium">{alert.msg}</span>
                        <button onClick={() => setAlert(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                            <XCircle className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Filter */}
                <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-orange-50/40 p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari meja / kasir..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-60"
                        >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            {loading ? 'Memuat...' : 'Cari Transaksi'}
                        </button>
                    </div>
                </div>

                {/* Tabel Transaksi */}
                <div className="rounded-xl border border-white/60 bg-white shadow-sm overflow-hidden">
                    {transaksis === null ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Search className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-medium">Klik "Cari Transaksi" untuk memuat data</p>
                            <p className="text-sm mt-1">Pilih tanggal dan klik tombol cari</p>
                        </div>
                    ) : transaksis.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Receipt className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-medium">Tidak ada transaksi ditemukan</p>
                            <p className="text-sm mt-1">Coba ubah filter tanggal atau kata kunci pencarian</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Waktu</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Meja/ID</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Kasir</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Total Bayar</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {transaksis.data.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-orange-50/30 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                {formatDateTime(trx.created_at)}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {trx.meja || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-gray-400" />
                                                    {trx.kasir?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                {formatRupiah(trx.bayar || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => openVoidModal(trx)}
                                                    className="inline-flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                                >
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    VOID
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination info */}
                            <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
                                <span>Total: {transaksis.total} transaksi</span>
                                <span>Halaman {transaksis.current_page} dari {transaksis.last_page}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Void */}
                {voidModal.open && voidModal.transaksi && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeVoidModal} />
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                            {/* Icon */}
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <AlertTriangle className="h-7 w-7 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Konfirmasi Void</h2>
                                    <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                                </div>
                            </div>

                            {/* Detail Transaksi */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Waktu</span>
                                    <span className="font-medium">{formatDateTime(voidModal.transaksi.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Meja/ID</span>
                                    <span className="font-medium">{voidModal.transaksi.meja || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Kasir</span>
                                    <span className="font-medium">{voidModal.transaksi.kasir?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                    <span className="text-gray-700 font-semibold">Total Bayar</span>
                                    <span className="font-bold text-red-600">{formatRupiah(voidModal.transaksi.bayar || 0)}</span>
                                </div>
                            </div>

                            {/* Alasan */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Alasan Void <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={alasan}
                                    onChange={(e) => setAlasan(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                    placeholder="Tuliskan alasan pembatalan transaksi..."
                                    maxLength={250}
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">{alasan.length}/250</p>
                            </div>

                            {/* Error */}
                            {alert?.type === 'error' && (
                                <p className="text-sm text-red-600 flex items-center gap-1.5">
                                    <XCircle className="h-4 w-4" /> {alert.msg}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeVoidModal}
                                    disabled={voidLoading}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-60"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleVoid}
                                    disabled={voidLoading || !alasan.trim()}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {voidLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-4 w-4" />
                                            Ya, Void Transaksi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
