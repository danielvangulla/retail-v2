import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '@/pages/admin/Layout';
import AlertModal from '@/pages/Kasir/components/AlertModal';
import { formatDateTime, formatDigit } from '@/lib/formatters';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

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
        await fetchHistory(barang.id, 1);
    };

    // Fetch history
    const fetchHistory = async (barangId: string, page: number = 1) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/admin/kartu-stok/history', {
                barang_id: barangId,
                page,
                per_page: 50,
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

                            {/* Movements Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-white/60 overflow-hidden">
                                {/* Table Header */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Tanggal</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Tipe</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Sebelum</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Qty</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Sesudah</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Referensi</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">User</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyData.movements.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                                        Tidak ada history pergerakan stok
                                                    </td>
                                                </tr>
                                            ) : (
                                                historyData.movements.map((movement) => (
                                                    <tr key={movement.id} className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {formatDateTime(movement.movement_date)}
                                                        </td>
                                                        <td className="px-4 py-3">{getTypeBadge(movement.type)}</td>
                                                        <td className="px-4 py-3 text-right font-semibold text-gray-700">{movement.quantity_before}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-blue-600">{movement.quantity}</td>
                                                        <td className="px-4 py-3 text-right font-semibold text-gray-700">{movement.quantity_after}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {movement.reference_type && movement.reference_id ? (
                                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                                    {movement.reference_type}: {movement.reference_id}
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {movement.user?.name || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{movement.notes || '-'}</td>
                                                    </tr>
                                                ))
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
        </AdminLayout>
    );
}
