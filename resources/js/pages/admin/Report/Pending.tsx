import { useState } from 'react';
import AdminLayout from '../Layout';
import { Search, RefreshCw, FileText, User, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from '@/lib/axios';

interface Kasir {
    id: string;
    name: string;
}

interface Piutang {
    id: string;
    nama: string;
}

interface TransaksiItem {
    id: string;
    tgl: string;
    bayar: number;
    status: number;
    created_at: string;
    kasir?: Kasir;
    piutang?: Piutang;
}

interface PaginationData {
    data: TransaksiItem[];
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
}

interface Summary {
    total_pending: number;
    total_lunas: number;
    nilai_pending: number;
}

const STATUS_PENDING = 5;

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

const formatDate = (dateStr: string) => {
    if (!dateStr) { return '-'; }
    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

const StatusBadge = ({ status }: { status: number }) => {
    if (status === STATUS_PENDING) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                <Clock className="h-3 w-3" />
                PENDING
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="h-3 w-3" />
            LUNAS
        </span>
    );
};

export default function PendingReport() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState(firstOfMonth);
    const [dateTo, setDateTo] = useState(today);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'lunas'>('all');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PaginationData | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.post('/admin/report/pending-data', {
                date_from: dateFrom,
                date_to: dateTo,
                search: search || undefined,
                status_filter: statusFilter,
                page,
            });
            if (response.data.status === 'ok') {
                setData(response.data.data);
                setSummary(response.data.summary);
            }
        } catch (e) {
            console.error('Gagal memuat laporan pending', e);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { fetchData(); }
    };

    return (
        <AdminLayout title="Laporan Pending">
            <div className="space-y-4 sm:space-y-6 bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 -m-4 sm:-m-6 p-4 sm:p-6 rounded-xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        Laporan Transaksi Pending
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Riwayat transaksi yang dibayar nanti (bayar pending)</p>
                </div>

                {/* Filter */}
                <div className="rounded-xl border border-white/60 bg-linear-to-br from-white to-amber-50/40 p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Dari Tanggal</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'lunas')}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                            >
                                <option value="all">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="lunas">Lunas</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Cari</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="ID transaksi / nama member..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={() => fetchData()}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-60"
                        >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            {loading ? 'Memuat...' : 'Tampilkan'}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Masih Pending</p>
                            </div>
                            <p className="text-3xl font-bold text-amber-600">{summary.total_pending}</p>
                            <p className="text-xs text-gray-400 mt-1">transaksi belum dibayar</p>
                        </div>
                        <div className="rounded-xl border border-green-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sudah Lunas</p>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{summary.total_lunas}</p>
                            <p className="text-xs text-gray-400 mt-1">transaksi sudah dibayar</p>
                        </div>
                        <div className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nilai Pending</p>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">{formatRupiah(summary.nilai_pending)}</p>
                            <p className="text-xs text-gray-400 mt-1">tagihan belum terbayar</p>
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
                            <Clock className="h-12 w-12 mb-3 opacity-30" />
                            <p className="font-medium">Tidak ada transaksi pending pada periode ini</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Waktu Transaksi</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">ID Transaksi</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Kasir</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Member / Customer</th>
                                        <th className="text-right px-4 py-3 font-semibold text-gray-600">Total Tagihan</th>
                                        <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.data.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                                                {formatDate(trx.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded" title={trx.id}>
                                                    {trx.id.slice(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                    {trx.kasir?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {trx.piutang ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                        <span className="font-medium text-gray-800">{trx.piutang.nama}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                {formatRupiah(trx.bayar)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={trx.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                <span>Total: {data.total} record</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => fetchData(data.current_page - 1)}
                                        disabled={data.current_page <= 1 || loading}
                                        className="px-3 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        &laquo; Prev
                                    </button>
                                    <span className="text-xs">Hal {data.current_page} / {data.last_page}</span>
                                    <button
                                        onClick={() => fetchData(data.current_page + 1)}
                                        disabled={data.current_page >= data.last_page || loading}
                                        className="px-3 py-1 rounded border border-gray-200 text-xs hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next &raquo;
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
