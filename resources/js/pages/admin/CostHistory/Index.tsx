import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { Search, ChevronDown, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatTgl, formatDigit, formatDateTime, formatTime } from '@/lib/formatters';

interface BarangOption {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    satuan: string;
}

interface CostHistoryItem {
    id: string;
    barang_id: string;
    harga_rata_rata_lama: number;
    harga_rata_rata_baru: number;
    trigger_type: string;
    reference_id: string;
    changed_by: string;
    created_at: string;
    user?: {
        id: string;
        name: string;
    };
}

interface CostSummary {
    cost_sebelumnya: number;
    current_cost: number;
    cost_terendah: number;
    cost_tertinggi: number;
    total_changes: number;
    first_change_at: string | null;
    last_change_at: string | null;
    total_change: number;
}

interface PaginationData {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    has_more: boolean;
}

interface HistoryResponse {
    status: string;
    data: {
        barang: BarangOption;
        history: CostHistoryItem[];
        pagination: PaginationData;
    };
}

interface SummaryResponse {
    status: string;
    data: CostSummary;
}

export default function CostHistoryIndex() {
    const [barangs, setBarangs] = useState<BarangOption[]>([]);
    const [selectedBarang, setSelectedBarang] = useState<BarangOption | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoadingBarangs, setIsLoadingBarangs] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [history, setHistory] = useState<CostHistoryItem[]>([]);
    const [summary, setSummary] = useState<CostSummary | null>(null);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Search barang
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setBarangs([]);
            return;
        }

        setIsLoadingBarangs(true);
        try {
            const response = await fetch('/admin/cost-history/barang-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ q: query, limit: 20 }),
            });

            const data = await response.json();
            setBarangs(data.data || []);
            setShowDropdown(true);
        } catch (error) {
            console.error('Error searching barang:', error);
        } finally {
            setIsLoadingBarangs(false);
        }
    }, []);

    // Load history when barang selected
    const loadHistory = useCallback(async (barangId: string, page: number = 1) => {
        setIsLoadingHistory(true);
        try {
            const [historyRes, summaryRes] = await Promise.all([
                fetch(`/admin/cost-history/history`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        barang_id: barangId,
                        page: page,
                        per_page: 50,
                        ...(dateFrom && { date_from: dateFrom }),
                        ...(dateTo && { date_to: dateTo }),
                    }),
                }),
                fetch('/admin/cost-history/summary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ barang_id: barangId }),
                }),
            ]);

            const historyData: HistoryResponse = await historyRes.json();
            const summaryData: SummaryResponse = await summaryRes.json();

            if (historyData.status === 'ok') {
                setHistory(historyData.data.history);
                setPagination(historyData.data.pagination);
                setCurrentPage(page);
            }

            if (summaryData.status === 'ok') {
                setSummary(summaryData.data);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    }, [dateFrom, dateTo]);

    const handleBarangSelect = (barang: BarangOption) => {
        setSelectedBarang(barang);
        setShowDropdown(false);
        setSearchQuery('');
        setBarangs([]);
        setCurrentPage(1);
        loadHistory(barang.id);
    };

    const handleFilterChange = () => {
        if (selectedBarang) {
            setCurrentPage(1);
            loadHistory(selectedBarang.id);
        }
    };

    const getTriggerLabel = (triggerType: string): string => {
        const labels: Record<string, string> = {
            pembelian: '📥 Pembelian',
            penjualan: '📤 Penjualan',
            retur: '↩️ Retur',
            opname: '📋 Opname',
            opname_update: '📋 Update Opname',
            opname_cancel: '🚫 Batal Opname',
        };
        return labels[triggerType] || triggerType;
    };

    return (
        <>
            <Head title="Cost History Cost" />
            <AdminLayout title="COGS - Average Perpetual">
                <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                    {/* Header */}
                    <div className="mb-2">
                        <h1 className="text-lg font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            💰 Track weighted average cost changes for all products
                        </h1>
                    </div>

                    {/* Search Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-white/60 p-2 mb-4">
                        <div className="relative">
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by SKU, Barcode, atau Nama Produk..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => searchQuery && setShowDropdown(true)}
                                    className="flex-1 outline-none text-gray-700"
                                />
                            </div>

                            {/* Dropdown */}
                            {showDropdown && barangs.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                                    {barangs.map((barang) => (
                                        <button
                                            key={barang.id}
                                            onClick={() => handleBarangSelect(barang)}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-semibold text-gray-900">{barang.deskripsi}</div>
                                            <div className="text-sm text-gray-600">SKU: {barang.sku} | Barcode: {barang.barcode}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected Barang & Summary */}
                    {selectedBarang && (
                        <>
                            {/* Product Header */}
                            <div className="bg-white rounded-xl shadow-sm border border-white/60 p-6 mb-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedBarang.deskripsi}</h2>
                                        <div className="text-sm text-gray-600 mt-2">
                                            SKU: <span className="font-mono font-semibold">{selectedBarang.sku}</span> | Barcode:{' '}
                                            <span className="font-mono font-semibold">{selectedBarang.barcode}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedBarang(null);
                                            setSummary(null);
                                            setHistory([]);
                                            setPagination(null);
                                        }}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Ubah Produk
                                    </button>
                                </div>

                                {/* Summary Cards */}
                                {summary && (
                                    <div className="space-y-3 mt-6">
                                        {/* Row 1 */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Cost Terendah */}
                                            <div className="bg-linear-to-br from-emerald-100 to-emerald-50 rounded-lg p-4 border border-white/60">
                                                <div className="text-xs text-gray-600 font-semibold">Cost Terendah</div>
                                                <div className="text-lg font-bold text-emerald-700 mt-2">
                                                    Rp {formatDigit(summary.cost_terendah)}
                                                </div>
                                            </div>

                                            {/* Cost Tertinggi */}
                                            <div className="bg-linear-to-br from-rose-100 to-rose-50 rounded-lg p-4 border border-white/60">
                                                <div className="text-xs text-gray-600 font-semibold">Cost Tertinggi</div>
                                                <div className="text-lg font-bold text-rose-700 mt-2">
                                                    Rp {formatDigit(summary.cost_tertinggi)}
                                                </div>
                                            </div>

                                            {/* Selisih Cost (Tertinggi - Terendah) */}
                                            <div
                                                className={`bg-linear-to-br ${
                                                    summary.cost_tertinggi > summary.cost_terendah
                                                        ? 'from-orange-100 to-orange-50'
                                                        : 'from-cyan-100 to-cyan-50'
                                                } rounded-lg p-4 border border-white/60`}
                                            >
                                                <div className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                                                    {summary.cost_tertinggi > summary.cost_terendah ? (
                                                        <>
                                                            <TrendingUp className="w-3 h-3" />
                                                            Selisih Cost
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown className="w-3 h-3" />
                                                            Selisih Cost
                                                        </>
                                                    )}
                                                </div>
                                                <div className={`text-lg font-bold mt-2 ${summary.cost_tertinggi > summary.cost_terendah ? 'text-orange-700' : 'text-cyan-700'}`}>
                                                    Rp {formatDigit(Math.abs(summary.cost_tertinggi - summary.cost_terendah))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2 */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Cost Sebelumnya */}
                                            <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-lg p-4 border border-white/60">
                                                <div className="text-xs text-gray-600 font-semibold">Cost Sebelumnya</div>
                                                <div className="text-lg font-bold text-blue-700 mt-2">
                                                    Rp {formatDigit(summary.cost_sebelumnya)}
                                                </div>
                                            </div>

                                            {/* Current Cost */}
                                            <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-lg p-4 border border-white/60">
                                                <div className="text-xs text-gray-600 font-semibold">Cost Sekarang</div>
                                                <div className="text-lg font-bold text-purple-700 mt-2">
                                                    Rp {formatDigit(summary.current_cost)}
                                                </div>
                                            </div>

                                            {/* Total Change */}
                                            <div
                                                className={`bg-linear-to-br ${
                                                    summary.total_change > 0
                                                        ? 'from-orange-100 to-orange-50'
                                                        : 'from-cyan-100 to-cyan-50'
                                                } rounded-lg p-4 border border-white/60`}
                                            >
                                                <div className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                                                    {summary.total_change > 0 ? (
                                                        <>
                                                            <TrendingUp className="w-3 h-3" />
                                                            Total Naik
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown className="w-3 h-3" />
                                                            Total Turun
                                                        </>
                                                    )}
                                                </div>
                                                <div className={`text-lg font-bold mt-2 ${summary.total_change > 0 ? 'text-orange-700' : 'text-cyan-700'}`}>
                                                    Rp {formatDigit(Math.abs(summary.total_change))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* History Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-white/60 overflow-hidden">
                                {isLoadingHistory ? (
                                    <div className="p-8 text-center text-gray-500">Loading history...</div>
                                ) : history.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No cost history found</div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200 bg-gray-50">
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Tanggal</th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Old Cost</th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">New Cost</th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Change</th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Trigger</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {history.map((item, idx) => {
                                                        const change = item.harga_rata_rata_baru - item.harga_rata_rata_lama;
                                                        const isIncrease = change > 0;

                                                        return (
                                                            <tr key={item.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 text-center`}>
                                                                <td className="p-2 text-sm text-gray-900">
                                                                    {formatTgl(item.created_at)}
                                                                    <br />
                                                                    {formatTime(item.created_at)}
                                                                </td>
                                                                <td className="p-2 text-sm font-mono text-gray-700 text-center">
                                                                    Rp {formatDigit(item.harga_rata_rata_lama)}
                                                                </td>
                                                                <td className="p-2 text-sm font-mono text-gray-700 text-center">
                                                                    Rp {formatDigit(item.harga_rata_rata_baru)}
                                                                </td>
                                                                <td className="p-2 text-sm text-center">
                                                                    <div className={`flex items-center justify-center gap-1 font-semibold ${!isIncrease ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                        {isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                                        Rp {formatDigit(Math.abs(change))}
                                                                    </div>
                                                                </td>
                                                                <td className="-2 text-sm text-center text-black">
                                                                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                                        {getTriggerLabel(item.trigger_type)}
                                                                    </span>
                                                                    <br />by {item.user?.name || 'System'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {pagination && pagination.last_page > 1 && (
                                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                                                <div className="text-sm text-gray-600">
                                                    Showing page {pagination.current_page} of {pagination.last_page}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => loadHistory(selectedBarang.id, currentPage - 1)}
                                                        disabled={currentPage === 1 || isLoadingHistory}
                                                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm disabled:opacity-50"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => loadHistory(selectedBarang.id, currentPage + 1)}
                                                        disabled={!pagination.has_more || isLoadingHistory}
                                                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!selectedBarang && (
                        <div className="bg-white rounded-xl shadow-sm border border-white/60 p-12 text-center">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Pilih Produk</h3>
                            <p className="text-gray-600">Gunakan pencarian di atas untuk memilih produk dan lihat riwayat perubahan biaya rata-rata.</p>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
