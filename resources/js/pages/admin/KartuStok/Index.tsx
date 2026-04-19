import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/pages/admin/Layout';
import AlertModal from '@/pages/Kasir/components/AlertModal';
import { formatDateTime, formatDigit, formatTgl } from '@/lib/formatters';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, RotateCcw, Filter } from 'lucide-react';

interface Barang {
    id: string;
    sku: string;
    barcode: string | null;
    deskripsi: string;
    satuan: string;
    harga_beli: number;
    harga_jual1: number;
}

interface Movement {
    id: string;
    type: 'in' | 'out' | 'adjustment' | 'return' | 'expire';
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    reference_type: string | null;
    reference_id: string | null;
    notes: string | null;
    movement_date: string;
    user: { id: string; name: string } | null;
    harga_beli: number | null;
    harga_jual: number | null;
}

interface HistoryData {
    barang: Barang;
    movements: Movement[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        has_more: boolean;
    };
}

interface AggregatedDay {
    date: string;
    movements: Movement[];
    beliQty: number;
    jualQty: number;
    returQty: number;
    opnameQty: number;
    saldo: number;
}

export default function KartuStokIndex() {
    const [searchQuery, setSearchQuery] = useState('');
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [historyData, setHistoryData] = useState<HistoryData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [selectedDetailRow, setSelectedDetailRow] = useState<AggregatedDay | null>(null);
    const [detailTab, setDetailTab] = useState<'beli' | 'jual' | 'retur' | 'opname'>('beli');

    // Default dates: 01 bulan berjalan hingga hari ini
    const getDefaultDates = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const dateFromStr = firstDay.toISOString().split('T')[0];
        const dateToStr = today.toISOString().split('T')[0];
        return { dateFromStr, dateToStr };
    };

    const { dateFromStr: defaultDateFrom, dateToStr: defaultDateTo } = getDefaultDates();
    const [dateFrom, setDateFrom] = useState(defaultDateFrom);
    const [dateTo, setDateTo] = useState(defaultDateTo);

    // Search barang
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setBarangList([]);
            return;
        }

        try {
            const response = await axios.post('/admin/kartu-stok/barang-list', { q: query, limit: 20 });
            if (response.data.status === 'ok') {
                setBarangList(response.data.data);
            }
        } catch (error) {
            console.error('Error searching barang:', error);
        }
    };

    // Select barang and fetch history
    const handleSelectBarang = async (barang: Barang) => {
        setSelectedBarang(barang);
        setSearchQuery('');
        setBarangList([]);
        setCurrentPage(1);
        await fetchHistory(barang.id, 1, dateFrom, dateTo);
    };

    // Fetch history
    const fetchHistory = async (barangId: string, page: number = 1, dFrom?: string, dTo?: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/admin/kartu-stok/history', {
                barang_id: barangId,
                page,
                per_page: 50,
                date_from: dFrom || dateFrom || null,
                date_to: dTo || dateTo || null,
            });

            if (response.data.status === 'ok') {
                setHistoryData(response.data.data);
                setCurrentPage(page);
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gagal memuat history stok';
            setAlertMessage(message);
            setAlertType('error');
            setShowAlertModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filter
    const handleApplyFilter = () => {
        if (selectedBarang) {
            setCurrentPage(1);
            fetchHistory(selectedBarang.id, 1);
        }
    };

    // Type badge
    const getTypeBadge = (type: string) => {
        const types: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            in: { label: 'Masuk', color: 'bg-emerald-100 text-emerald-700', icon: <ArrowDown className="w-4 h-4" /> },
            out: { label: 'Keluar', color: 'bg-red-100 text-red-700', icon: <ArrowUp className="w-4 h-4" /> },
            adjustment: { label: 'Penyesuaian', color: 'bg-blue-100 text-blue-700', icon: <RotateCcw className="w-4 h-4" /> },
            return: { label: 'Retur', color: 'bg-amber-100 text-amber-700', icon: <RotateCcw className="w-4 h-4" /> },
            expire: { label: 'Kadaluarsa', color: 'bg-gray-100 text-gray-700', icon: <RotateCcw className="w-4 h-4" /> },
        };
        const typeData = types[type] || types.adjustment;
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${typeData.color}`}>
                {typeData.icon}
                {typeData.label}
            </div>
        );
    };

    // Aggregate movements by date
    const getAggregatedByDate = () => {
        if (!historyData) return [];

        const grouped: Record<string, Movement[]> = {};

        [...historyData.movements].reverse().forEach((movement) => {
            const dateKey = movement.movement_date.split('T')[0]; // YYYY-MM-DD
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(movement);
        });

        return Object.entries(grouped)
            .map(([date, movements]) => {
                const beliQty = movements.filter((m) => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
                const jualQty = movements.filter((m) => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0);
                const returQty = movements.filter((m) => m.type === 'return').reduce((sum, m) => sum + m.quantity, 0);
                const opnameQty = movements
                    .filter((m) => m.type === 'adjustment' || m.type === 'expire')
                    .reduce((sum, m) => sum + m.quantity, 0);
                const lastMovement = movements[movements.length - 1]; // Last movement of the day

                return {
                    date,
                    movements,
                    beliQty,
                    jualQty,
                    returQty,
                    opnameQty,
                    saldo: lastMovement.quantity_after,
                };
            });
    };

    return (
        <AdminLayout title="Kartu Stok">
            <div className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Kartu Stok</h1>
                        <p className="text-gray-600">Lihat history pergerakan stok untuk setiap item</p>
                    </div>

                    {/* Search Barang */}
                    <div className="bg-white text-black rounded-xl shadow-sm border border-white/60 p-4 sm:p-6 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari SKU, Barcode, atau nama produk..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Barang List */}
                        {barangList.length > 0 && (
                            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                {barangList.map((barang) => (
                                    <button
                                        key={barang.id}
                                        onClick={() => handleSelectBarang(barang)}
                                        className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition-colors"
                                    >
                                        <div className="font-semibold text-gray-900">{barang.deskripsi}</div>
                                        <div className="text-sm text-gray-600">SKU: {barang.sku} | Barcode: {barang.barcode || '-'}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Barang Info */}
                    {selectedBarang && historyData && (
                        <>
                            {/* Barang Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-white/60 p-4 sm:p-6 mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-lg p-4 border border-blue-200">
                                        <div className="text-xs text-gray-600 mb-1">SKU</div>
                                        <div className="font-bold text-blue-700">{selectedBarang.sku}</div>
                                    </div>
                                    <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-lg p-4 border border-purple-200">
                                        <div className="text-xs text-gray-600 mb-1">Barcode</div>
                                        <div className="font-bold text-purple-700">{selectedBarang.barcode || '-'}</div>
                                    </div>
                                    <div className="bg-linear-to-br from-pink-100 to-pink-50 rounded-lg p-4 border border-pink-200">
                                        <div className="text-xs text-gray-600 mb-1">Harga Beli</div>
                                        <div className="font-bold text-pink-700">Rp {formatDigit(selectedBarang.harga_beli)}</div>
                                    </div>
                                    <div className="bg-linear-to-br from-amber-100 to-amber-50 rounded-lg p-4 border border-amber-200">
                                        <div className="text-xs text-gray-600 mb-1">Harga Jual</div>
                                        <div className="font-bold text-amber-700">Rp {formatDigit(selectedBarang.harga_jual1)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Minimal Filter */}
                            <div className="bg-white rounded-xl shadow-sm border border-white/60 p-4 mb-6 flex flex-col sm:flex-row gap-3 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyFilter}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold"
                                >
                                    <Filter className="w-4 h-4" /> Filter
                                </button>
                                <button
                                    onClick={() => {
                                        const { dateFromStr, dateToStr } = getDefaultDates();
                                        setDateFrom(dateFromStr);
                                        setDateTo(dateToStr);
                                        if (selectedBarang) {
                                            setCurrentPage(1);
                                            fetchHistory(selectedBarang.id, 1, dateFromStr, dateToStr);
                                        }
                                    }}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-semibold border border-gray-300"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Movements Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-white/60 overflow-hidden">
                                {/* Table Header */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Tanggal</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Beli</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Jual</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Retur</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Opname</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Saldo</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700">Act.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyData && historyData.movements.length > 0 ? (
                                                <>
                                                    {/* Saldo Awal */}
                                                    <tr className="border-b-2 border-blue-200 bg-blue-50 font-semibold">
                                                        <td colSpan={7} className="px-4 py-3 text-blue-900">
                                                            📊 Saldo Awal: {historyData.movements[historyData.movements.length - 1]?.quantity_before || 0} {selectedBarang?.satuan}
                                                        </td>
                                                    </tr>
                                                    {/* Aggregated by Date */}
                                                    {getAggregatedByDate().map((dayData) => (
                                                        <tr key={dayData.date} className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors">
                                                            <td className="px-4 py-3 text-gray-700 font-medium">
                                                                {formatTgl(dayData.date)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-emerald-600 font-semibold">
                                                                {dayData.beliQty > 0 ? dayData.beliQty : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-red-600 font-semibold">
                                                                {dayData.jualQty > 0 ? dayData.jualQty : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-amber-600 font-semibold">
                                                                {dayData.returQty > 0 ? dayData.returQty : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-purple-600 font-semibold">
                                                                {dayData.opnameQty > 0 ? dayData.opnameQty : '-'}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-bold ${dayData.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {dayData.saldo}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() => setSelectedDetailRow(dayData)}
                                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold hover:bg-blue-200 transition-colors"
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                                        Tidak ada history pergerakan stok
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {historyData.pagination.total > 0 && (
                                    <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Total: {historyData.pagination.total} | Halaman {historyData.pagination.current_page} dari{' '}
                                            {historyData.pagination.last_page}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchHistory(selectedBarang.id, currentPage - 1)}
                                                disabled={currentPage === 1 || isLoading}
                                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" /> Sebelumnya
                                            </button>
                                            <button
                                                onClick={() => fetchHistory(selectedBarang.id, currentPage + 1)}
                                                disabled={!historyData.pagination.has_more || isLoading}
                                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Berikutnya <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!selectedBarang && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="text-gray-600">Pilih produk untuk melihat history pergerakan stoknya</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Alert Modal */}
            <AlertModal
                show={showAlertModal}
                title={alertType === 'error' ? 'Error' : 'Info'}
                message={alertMessage}
                type={alertType}
                onConfirm={() => setShowAlertModal(false)}
            />

            {/* Detail Modal */}
            {selectedDetailRow && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full h-screen md:h-[80vh] flex flex-col">

                        <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4 text-white rounded-t-xl shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">📋 Detail Pergerakan Stok - {formatTgl(selectedDetailRow.date)}</h3>
                                <button
                                    onClick={() => setSelectedDetailRow(null)}
                                    className="text-white hover:text-gray-200 hover:scale-110 hover:rotate-90 text-2xl transition-all duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="px-6 pt-6 pb-0 overflow-hidden flex flex-col flex-1">
                            {/* Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                    <div className="text-xs text-gray-600 font-semibold">Beli</div>
                                    <div className="text-lg font-bold text-emerald-600">
                                        {selectedDetailRow.beliQty > 0 ? selectedDetailRow.beliQty : '-'}
                                    </div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="text-xs text-gray-600 font-semibold">Jual</div>
                                    <div className="text-lg font-bold text-red-600">
                                        {selectedDetailRow.jualQty > 0 ? selectedDetailRow.jualQty : '-'}
                                    </div>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <div className="text-xs text-gray-600 font-semibold">Retur</div>
                                    <div className="text-lg font-bold text-amber-600">
                                        {selectedDetailRow.returQty > 0 ? selectedDetailRow.returQty : '-'}
                                    </div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <div className="text-xs text-gray-600 font-semibold">Opname</div>
                                    <div className="text-lg font-bold text-purple-600">
                                        {selectedDetailRow.opnameQty > 0 ? selectedDetailRow.opnameQty : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-2">
                                <div className="flex flex-wrap gap-2 -mb-0.5">
                                    <button
                                        onClick={() => setDetailTab('beli')}
                                        className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all ${
                                            detailTab === 'beli'
                                                ? 'border-emerald-600 text-emerald-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        📥 Beli ({selectedDetailRow.movements.filter(m => m.type === 'in').length})
                                    </button>
                                    <button
                                        onClick={() => setDetailTab('jual')}
                                        className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all ${
                                            detailTab === 'jual'
                                                ? 'border-red-600 text-red-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        📤 Jual ({selectedDetailRow.movements.filter(m => m.type === 'out').length})
                                    </button>
                                    <button
                                        onClick={() => setDetailTab('retur')}
                                        className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all ${
                                            detailTab === 'retur'
                                                ? 'border-amber-600 text-amber-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        🔄 Retur ({selectedDetailRow.movements.filter(m => m.type === 'return').length})
                                    </button>
                                    <button
                                        onClick={() => setDetailTab('opname')}
                                        className={`px-4 py-2 font-semibold text-sm border-b-2 transition-all ${
                                            detailTab === 'opname'
                                                ? 'border-purple-600 text-purple-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        ⚙️ Opname ({selectedDetailRow.movements.filter(m => m.type === 'adjustment').length})
                                    </button>
                                </div>
                            </div>

                            {/* Movements List */}
                            <div className="border-t py-2 flex flex-col min-h-0 flex-1">
                                <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                                    {selectedDetailRow.movements
                                        .filter(m => {
                                            if (detailTab === 'beli') return m.type === 'in';
                                            if (detailTab === 'jual') return m.type === 'out';
                                            if (detailTab === 'retur') return m.type === 'return';
                                            if (detailTab === 'opname') return m.type === 'adjustment';
                                            return false;
                                        })
                                        .length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-4xl mb-2">📭</div>
                                            <p>Tidak ada transaksi dalam kategori ini</p>
                                        </div>
                                    ) : (
                                        selectedDetailRow.movements
                                            .filter(m => {
                                                if (detailTab === 'beli') return m.type === 'in';
                                                if (detailTab === 'jual') return m.type === 'out';
                                                if (detailTab === 'retur') return m.type === 'return';
                                                if (detailTab === 'opname') return m.type === 'adjustment';
                                                return false;
                                            })
                                            .map((movement, idx) => {
                                                const typeColors = {
                                                    in: { bg: 'bg-emerald-50', border: 'border-l-4 border-l-emerald-500', icon: '📥', color: 'text-emerald-700' },
                                                    out: { bg: 'bg-red-50', border: 'border-l-4 border-l-red-500', icon: '📤', color: 'text-red-700' },
                                                    return: { bg: 'bg-amber-50', border: 'border-l-4 border-l-amber-500', icon: '🔄', color: 'text-amber-700' },
                                                    adjustment: { bg: 'bg-blue-50', border: 'border-l-4 border-l-blue-500', icon: '⚙️', color: 'text-blue-700' },
                                                    expire: { bg: 'bg-gray-50', border: 'border-l-4 border-l-gray-500', icon: '⏰', color: 'text-gray-700' },
                                                };
                                                const typeStyle = typeColors[movement.type] || typeColors.adjustment;
                                                const qtyColor = movement.type === 'in' ? 'text-emerald-600' : movement.type === 'out' ? 'text-red-600' : 'text-blue-600';
                                                const totalValue = movement.type === 'out' ? (movement.quantity * movement.harga_jual!) : (movement.quantity * movement.harga_beli!);

                                                return (
                                                    <div key={movement.id} className={`${typeStyle.bg} ${typeStyle.border} rounded-lg p-3 hover:shadow-md transition-all border border-gray-200`}>
                                                        <div className="flex items-start gap-3">
                                                            {/* Icon */}
                                                            <div className="text-2xl shrink-0">{typeStyle.icon}</div>

                                                            {/* Main Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                                                    <div className={`font-bold text-sm ${typeStyle.color}`}>
                                                                        {movement.type === 'in' ? 'Masuk' : movement.type === 'out' ? 'Keluar' : movement.type === 'return' ? 'Retur' : movement.type === 'adjustment' ? 'Penyesuaian' : 'Kadaluarsa'}
                                                                    </div>
                                                                    <div className={`font-bold text-lg ${qtyColor}`}>
                                                                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-gray-500 mb-2">
                                                                    {new Date(movement.movement_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                                </div>

                                                                {/* Details Grid */}
                                                                <div className="space-y-1.5">
                                                                    {/* Prices */}
                                                                    {(movement.harga_beli || movement.harga_jual) && (
                                                                        <div className="grid grid-cols-2 gap-2 text-xs bg-white/50 rounded p-2 border border-white/80">
                                                                            {movement.harga_beli && (
                                                                                <div>
                                                                                    <span className="text-gray-600">💰 Beli:</span>
                                                                                    <div className="font-bold text-gray-900">Rp {formatDigit(movement.harga_beli)}</div>
                                                                                </div>
                                                                            )}
                                                                            {movement.harga_jual && (
                                                                                <div>
                                                                                    <span className="text-gray-600">💵 Jual:</span>
                                                                                    <div className="font-bold text-gray-900">Rp {formatDigit(movement.harga_jual)}</div>
                                                                                </div>
                                                                            )}
                                                                            {movement.type === 'out' && movement.harga_jual && (
                                                                                <div className="col-span-2 border-t border-white/60 pt-2 mt-1">
                                                                                    <span className="text-gray-600">📊 Total:</span>
                                                                                    <div className="font-bold text-lg text-emerald-700">Rp {formatDigit(totalValue)}</div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Reference & User */}
                                                                    {movement.reference_id && (
                                                                        <div className="flex items-center gap-2 text-xs">
                                                                            <span className="text-gray-500">📎</span>
                                                                            <span className="text-gray-700">
                                                                                <span className="font-semibold text-gray-900">{movement.reference_type}</span>
                                                                                {' '}: {movement.reference_id}
                                                                            </span>
                                                                            {movement.type === 'out' && (
                                                                                <button
                                                                                    onClick={() => alert(`Struk: ${movement.reference_id}`)}
                                                                                    className="ml-auto px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 font-semibold hover:cursor-pointer transition-colors"
                                                                                >
                                                                                    📄 Struk
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {movement.user && (
                                                                        <div className="flex items-center gap-2 text-xs">
                                                                            <span className="text-gray-500">👤</span>
                                                                            <span className="text-gray-700 font-medium">{movement.user.name}</span>
                                                                        </div>
                                                                    )}
                                                                    {movement.notes && (
                                                                        <div className="flex items-start gap-2 text-xs border-t border-gray-200 pt-2 mt-1">
                                                                            <span className="text-gray-500 shrink-0">📝</span>
                                                                            <span className="text-gray-700 italic wrap-break-word">{movement.notes}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
