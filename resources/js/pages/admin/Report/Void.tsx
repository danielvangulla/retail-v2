import { useState } from 'react';
import AdminLayout from '../Layout';
import { router } from '@inertiajs/react';
import { Search, RefreshCw, FileText, User, Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';

interface Kasir {
    id: string;
    name: string;
}

interface Spv {
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
    cancel_note: string;
    created_at: string;
    updated_at: string;
    kasir?: Kasir;
    spv?: Spv;
    details?: any[];
}

interface PaginationData {
    data: TransaksiItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface Summary {
    total_void: number;
    total_nilai: number;
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

const formatDate = (dateStr: string) => {
    if (!dateStr) { return '-'; }
    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

export default function VoidReport() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState(firstOfMonth);
    const [dateTo, setDateTo] = useState(today);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PaginationData | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch('/admin/report/void-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
            });
            const json = await response.json();
            if (json.status === 'ok') {
                setData(json.data);
                setSummary(json.summary);
            }
        } catch (e) {
            console.error('Gagal memuat laporan void', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Laporan Void">
            <div className="space-y-4 sm:space-y-6 bg-linear-to-br from-orange-50 via-red-50 to-pink-50 -m-4 sm:-m-6 p-4 sm:p-6 rounded-xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.visit('/admin/void')}
                        className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                            Laporan Void
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Riwayat semua transaksi yang dibatalkan</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-orange-50/40 p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Dari Tanggal</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sampai Tanggal</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-60"
                        >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            {loading ? 'Memuat...' : 'Tampilkan'}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Void</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{summary.total_void}</p>
                            <p className="text-xs text-gray-400 mt-1">transaksi dibatalkan</p>
                        </div>
                        <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Nilai Void</p>
                            <p className="text-2xl font-bold text-orange-600 mt-1">{formatRupiah(summary.total_nilai)}</p>
                            <p className="text-xs text-gray-400 mt-1">nilai transaksi dibatalkan</p>
                        </div>
                    </div>
                )}

                {/* Tabel */}
                <div className="rounded-xl border border-white/60 bg-white shadow-sm overflow-hidden">
                    {data === null ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <FileText className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-medium">Pilih periode dan klik "Tampilkan"</p>
                        </div>
                    ) : data.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <AlertTriangle className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-medium">Tidak ada transaksi void pada periode ini</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Waktu Transaksi</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Meja/ID</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Kasir</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Di-void Oleh</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Nilai Bayar</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Alasan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.data.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-red-50/20 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                                                <div>{formatDate(trx.created_at)}</div>
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
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-orange-400" />
                                                    <span className="text-orange-700 font-medium">{trx.spv?.name || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-red-600">
                                                {formatRupiah(trx.bayar)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs max-w-48 truncate" title={trx.cancel_note}>
                                                {trx.cancel_note || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
                                <span>Total: {data.total} record</span>
                                <span>Hal {data.current_page} / {data.last_page}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
