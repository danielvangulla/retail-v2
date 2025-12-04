import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { formatDigit, formatTgl } from '@/lib/formatters';
import { Download, Search, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../Layout';

interface TransactionDetail {
    id: string;
    barang_id: string;
    qty: number;
    harga_satuan: number;
    subtotal: number;
    barang: {
        deskripsi: string;
        sku: string;
    };
}

interface Transaction {
    id: string;
    ref_kasir: string;
    bayar: number;
    diskon: number;
    created_at: string;
    user_kasir_id: string;
    kasir: {
        name: string;
    };
    details: TransactionDetail[];
}

interface DailySalesSummary {
    date: string;
    display_date: string;
    total_transactions: number;
    total_items: number;
    total_sales: number;
    total_discount: number;
    net_sales: number;
    total_cost: number;
    profit: number;
}

interface CategorySalesSummary {
    kategori_id: string;
    kategori_name: string;
    total_transactions: number;
    total_items: number;
    total_sales: number;
    total_discount: number;
    net_sales: number;
    total_cost: number;
    profit: number;
}

interface ItemSalesSummary {
    barang_id: string;
    sku: string;
    deskripsi: string;
    total_qty: number;
    total_sales: number;
    total_discount: number;
    net_sales: number;
    total_cost: number;
    profit: number;
}

interface Summary {
    total_transactions: number;
    total_sales: number;
    avg_sales: number;
    total_discount?: number;
}

type TabType = 'by-date' | 'by-category' | 'by-item';

export default function SalesReport() {
    const [activeTab, setActiveTab] = useState<TabType>('by-date');
    const [loading, setLoading] = useState(false);

    // Shared filter states
    const [dateFrom, setDateFrom] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [activeButton, setActiveButton] = useState<'7days' | 'month' | 'year' | null>('7days');

    // By Date
    const [dailySales, setDailySales] = useState<DailySalesSummary[]>([]);
    const [dailySummary, setDailySummary] = useState<Summary | null>(null);

    // By Category
    const [categorySales, setCategorySales] = useState<CategorySalesSummary[]>([]);
    const [categorySummary, setCategorySummary] = useState<Summary | null>(null);
    const [categoryPagination, setCategoryPagination] = useState({ current_page: 1, last_page: 1 });

    // By Item
    const [itemSales, setItemSales] = useState<ItemSalesSummary[]>([]);
    const [itemSummary, setItemSummary] = useState<Summary | null>(null);
    const [itemPagination, setItemPagination] = useState({ current_page: 1, last_page: 1 });

    const fetchDailySales = async () => {
        try {
            setLoading(true);
            const response = await axios.post('/admin/report/sales-by-date', {
                date_from: dateFrom,
                date_to: dateTo,
            });

            if (response.data.status === 'ok') {
                // Sort by date descending and calculate profit for each row
                const sortedData = (response.data.data || []).sort((a: any, b: any) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });

                const dataWithProfit = sortedData.map((row: any) => ({
                    ...row,
                    profit: (row.net_sales || 0) - (row.total_cost || 0),
                }));
                setDailySales(dataWithProfit || []);
                setDailySummary(response.data.summary);
            }
        } catch (error) {
            console.error('Error fetching daily sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategorySales = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await axios.post('/admin/report/sales-by-category', {
                date_from: dateFrom,
                date_to: dateTo,
                page,
            });

            if (response.data.status === 'ok') {
                const dataWithProfit = response.data.data.data.map((row: any) => ({
                    ...row,
                    profit: (row.net_sales || 0) - (row.total_cost || 0),
                }));
                setCategorySales(dataWithProfit || []);
                setCategorySummary(response.data.summary);
                setCategoryPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                });
            }
        } catch (error) {
            console.error('Error fetching category sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchItemSales = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await axios.post('/admin/report/sales-by-item', {
                date_from: dateFrom,
                date_to: dateTo,
                page,
            });

            if (response.data.status === 'ok') {
                const dataWithProfit = response.data.data.data.map((row: any) => ({
                    ...row,
                    profit: (row.net_sales || 0) - (row.total_cost || 0),
                }));
                setItemSales(dataWithProfit || []);
                setItemSummary(response.data.summary);
                setItemPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                });
            }
        } catch (error) {
            console.error('Error fetching item sales:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'by-date') {
            fetchDailySales();
        } else if (activeTab === 'by-category') {
            fetchCategorySales(1);
        } else if (activeTab === 'by-item') {
            fetchItemSales(1);
        }
    }, [dateFrom, dateTo, activeTab]);

    const handleQuickFilter = (type: '7days' | 'month' | 'year') => {
        setActiveButton(type);
        const date = new Date();
        if (type === '7days') {
            date.setDate(date.getDate() - 7);
        } else if (type === 'month') {
            date.setMonth(date.getMonth() - 1);
        } else if (type === 'year') {
            date.setFullYear(date.getFullYear() - 1);
        }
        setDateFrom(date.toISOString().split('T')[0]);
        setDateTo(new Date().toISOString().split('T')[0]);
    };

    const getButtonClasses = (buttonType: '7days' | 'month' | 'year'): string => {
        const isActive = activeButton === buttonType;
        return isActive
            ? 'px-4 py-2 w-24 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow-lg ring-2 ring-offset-2 cursor-not-allowed opacity-100 transition-all'
            : 'px-4 py-2 w-24 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all cursor-pointer';
    };

    const handleDownload = (data: any[], filename: string) => {
        const csv = JSON.stringify(data, null, 2);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <AdminLayout title="Sales Report">
            <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            📊 Laporan Penjualan
                        </h1>
                        <p className="text-gray-600 mt-2">Monitor dan analisis penjualan dengan berbagai perspektif</p>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                        <div className="space-y-4">
                            {/* Date Range and Quick Filters */}
                            <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dari</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => {
                                            setDateFrom(e.target.value);
                                            setActiveButton(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sampai</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => {
                                            setDateTo(e.target.value);
                                            setActiveButton(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                                    />
                                </div>

                                {/* Quick Filters */}
                                <button
                                    onClick={() => handleQuickFilter('7days')}
                                    disabled={activeButton === '7days'}
                                    className={getButtonClasses('7days')}
                                >
                                    7 Hari
                                </button>
                                <button
                                    onClick={() => handleQuickFilter('month')}
                                    disabled={activeButton === 'month'}
                                    className={getButtonClasses('month')}
                                >
                                    1 Bulan
                                </button>
                                <button
                                    onClick={() => handleQuickFilter('year')}
                                    disabled={activeButton === 'year'}
                                    className={getButtonClasses('year')}
                                >
                                    1 Tahun
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('by-date')}
                                className={`flex-1 px-6 py-3 font-semibold transition-all ${
                                    activeTab === 'by-date'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                📅 Laporan per Tanggal
                            </button>
                            <button
                                onClick={() => setActiveTab('by-category')}
                                className={`flex-1 px-6 py-3 font-semibold transition-all ${
                                    activeTab === 'by-category'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                🏷️ Laporan per Kategori
                            </button>
                            <button
                                onClick={() => setActiveTab('by-item')}
                                className={`flex-1 px-6 py-3 font-semibold transition-all ${
                                    activeTab === 'by-item'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                📦 Laporan per Item
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            )}

                            {/* By Date Tab */}
                            {activeTab === 'by-date' && !loading && (
                                <div className="space-y-4">
                                    {dailySales.length > 0 && (() => {
                                        // Calculate summary from daily sales data
                                        const summary = {
                                            total_transactions: dailySales.reduce((sum, row) => sum + (row.total_transactions || 0), 0),
                                            total_sales: Math.round(dailySales.reduce((sum, row) => sum + +row.net_sales, 0)),
                                            total_cost: Math.round(dailySales.reduce((sum, row) => sum + +row.total_cost, 0)),
                                            total_profit: 0,
                                        };

                                        summary.total_profit = Math.round(dailySales.reduce((sum, row) => {
                                            const profit = +row.net_sales - +row.total_cost;
                                            return sum + profit;
                                        }, 0));

                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                                <div className="text-center bg-linear-to-br from-purple-100 to-purple-50 rounded-lg p-4 border border-white/60">
                                                    <p className="text-gray-600 text-sm">Total Struk</p>
                                                    <p className="font-mono text-2xl font-bold text-purple-700 mt-1">{summary.total_transactions}</p>
                                                </div>
                                                <div className="text-center bg-linear-to-br from-blue-100 to-blue-50 rounded-lg p-4 border border-white/60">
                                                    <p className="text-gray-600 text-sm">Total Penjualan</p>
                                                    <p className="font-mono text-2xl font-bold text-blue-700 mt-1">{formatDigit(summary.total_sales || 0)}</p>
                                                </div>
                                                <div className="text-center bg-linear-to-br from-orange-100 to-orange-50 rounded-lg p-4 border border-white/60">
                                                    <p className="text-gray-600 text-sm">Total Cost</p>
                                                    <p className="font-mono text-2xl font-bold text-orange-700 mt-1">{formatDigit(summary.total_cost || 0)}</p>
                                                </div>
                                                <div className="text-center bg-linear-to-br from-green-100 to-green-50 rounded-lg p-4 border border-white/60">
                                                    <p className="text-gray-600 text-sm">Total Profit</p>
                                                    <p className={`font-mono text-2xl font-bold mt-1 ${summary.total_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                        {formatDigit(summary.total_profit || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}


                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={() => handleDownload(dailySales, 'sales-by-date')}
                                            disabled={dailySales.length === 0}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export
                                        </button>
                                    </div>

                                    {dailySales.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-200">
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-700">Tanggal</th>
                                                        <th className="text-center p-3 text-sm font-semibold text-gray-700">Struk</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Brutto</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Diskon</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Netto</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Cost</th>
                                                        <th className="text-right p-3 text-sm font-semibold text-gray-700">Profit</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dailySales.map((row) => (
                                                        <tr key={row.date} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="p-3 font-mono text-center text-sm font-medium text-gray-900">{row.display_date}</td>
                                                            <td className="p-3 font-mono text-center text-sm text-gray-700">{row.total_transactions}</td>
                                                            <td className="p-3 font-mono text-right text-sm font-bold text-blue-600">{formatDigit(row.total_sales)}</td>
                                                            <td className="p-3 font-mono text-right text-sm text-amber-600 font-semibold">{formatDigit(row.total_discount)}</td>
                                                            <td className="p-3 font-mono text-right text-sm font-bold text-black">{formatDigit(row.net_sales)}</td>
                                                            <td className="p-3 font-mono text-right text-sm text-gray-700">{formatDigit(row.total_cost)}</td>
                                                            <td className="p-3 font-mono text-right text-sm font-bold" style={{color: row.profit >= 0 ? '#059669' : '#dc2626'}}>
                                                                {formatDigit(row.profit)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* By Category Tab */}
                            {activeTab === 'by-category' && !loading && (
                                <div className="space-y-4">
                                    {categorySummary && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-lg p-4 border border-white/60">
                                                <p className="text-gray-600 text-sm">Total Penjualan</p>
                                                <p className="text-2xl font-bold text-blue-700 mt-1">Rp {formatDigit(categorySummary.total_sales || 0)}</p>
                                            </div>
                                            <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-lg p-4 border border-white/60">
                                                <p className="text-gray-600 text-sm">Kategori Terjual</p>
                                                <p className="text-2xl font-bold text-purple-700 mt-1">{categorySales.length}</p>
                                            </div>
                                            <div className="bg-linear-to-br from-pink-100 to-pink-50 rounded-lg p-4 border border-white/60">
                                                <p className="text-gray-600 text-sm">Total Item</p>
                                                <p className="text-2xl font-bold text-pink-700 mt-1">{categorySummary.total_transactions}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={() => handleDownload(categorySales, 'sales-by-category')}
                                            disabled={categorySales.length === 0}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export
                                        </button>
                                    </div>

                                    {categorySales.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b-2 border-gray-200">
                                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Kategori</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Transaksi</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Brutto</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Diskon</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Netto</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Cost</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Profit</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {categorySales.map((row) => (
                                                            <tr key={row.kategori_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                                <td className="p-3 text-sm font-medium text-gray-900">{row.kategori_name}</td>
                                                                <td className="p-3 text-right text-sm text-gray-700">{row.total_transactions}</td>
                                                                <td className="p-3 text-right text-sm font-bold text-blue-600">Rp {formatDigit(row.total_sales)}</td>
                                                                <td className="p-3 text-right text-sm text-amber-600 font-semibold">Rp {formatDigit(row.total_discount)}</td>
                                                                <td className="p-3 text-right text-sm font-bold text-green-600">Rp {formatDigit(row.net_sales)}</td>
                                                                <td className="p-3 text-right text-sm text-gray-700">Rp {formatDigit(row.total_cost)}</td>
                                                                <td className="p-3 text-right text-sm font-bold" style={{color: row.profit >= 0 ? '#059669' : '#dc2626'}}>
                                                                    Rp {formatDigit(row.profit)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {categoryPagination.last_page > 1 && (
                                                <div className="flex items-center justify-center gap-4 mt-6">
                                                    <button
                                                        onClick={() => fetchCategorySales(categoryPagination.current_page - 1)}
                                                        disabled={categoryPagination.current_page === 1}
                                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <span className="text-sm text-gray-600">
                                                        {categoryPagination.current_page} / {categoryPagination.last_page}
                                                    </span>
                                                    <button
                                                        onClick={() => fetchCategorySales(categoryPagination.current_page + 1)}
                                                        disabled={categoryPagination.current_page === categoryPagination.last_page}
                                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* By Item Tab */}
                            {activeTab === 'by-item' && !loading && (
                                <div className="space-y-4">
                                    {itemSummary && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-lg p-4 border border-white/60">
                                                <p className="text-gray-600 text-sm">Total Penjualan</p>
                                                <p className="text-2xl font-bold text-blue-700 mt-1">Rp {formatDigit(itemSummary.total_sales || 0)}</p>
                                            </div>
                                            <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-lg p-4 border border-white/60">
                                                <p className="text-gray-600 text-sm">Item Terjual</p>
                                                <p className="text-2xl font-bold text-purple-700 mt-1">{itemSales.length}</p>
                                            </div>
                                            <div className="bg-linear-to-br from-pink-100 to-pink-50 rounded-lg p-4 border border-white/60">
                                                <p className="text-gray-600 text-sm">Total Qty</p>
                                                <p className="text-2xl font-bold text-pink-700 mt-1">{itemSummary.total_transactions}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end mb-4">
                                        <button
                                            onClick={() => handleDownload(itemSales, 'sales-by-item')}
                                            disabled={itemSales.length === 0}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export
                                        </button>
                                    </div>

                                    {itemSales.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">Tidak ada data</div>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b-2 border-gray-200">
                                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">SKU</th>
                                                            <th className="text-left p-3 text-sm font-semibold text-gray-700">Item</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Qty</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Brutto</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Diskon</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Netto</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Cost</th>
                                                            <th className="text-right p-3 text-sm font-semibold text-gray-700">Profit</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {itemSales.map((row) => (
                                                            <tr key={row.barang_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                                <td className="p-3 text-sm font-mono text-gray-700">{row.sku}</td>
                                                                <td className="p-3 text-sm font-medium text-gray-900">{row.deskripsi}</td>
                                                                <td className="p-3 text-right text-sm text-gray-700">{row.total_qty}</td>
                                                                <td className="p-3 text-right text-sm font-bold text-blue-600">Rp {formatDigit(row.total_sales)}</td>
                                                                <td className="p-3 text-right text-sm text-amber-600 font-semibold">Rp {formatDigit(row.total_discount)}</td>
                                                                <td className="p-3 text-right text-sm font-bold text-green-600">Rp {formatDigit(row.net_sales)}</td>
                                                                <td className="p-3 text-right text-sm text-gray-700">Rp {formatDigit(row.total_cost)}</td>
                                                                <td className="p-3 text-right text-sm font-bold" style={{color: row.profit >= 0 ? '#059669' : '#dc2626'}}>
                                                                    Rp {formatDigit(row.profit)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {itemPagination.last_page > 1 && (
                                                <div className="flex items-center justify-center gap-4 mt-6">
                                                    <button
                                                        onClick={() => fetchItemSales(itemPagination.current_page - 1)}
                                                        disabled={itemPagination.current_page === 1}
                                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <span className="text-sm text-gray-600">
                                                        {itemPagination.current_page} / {itemPagination.last_page}
                                                    </span>
                                                    <button
                                                        onClick={() => fetchItemSales(itemPagination.current_page + 1)}
                                                        disabled={itemPagination.current_page === itemPagination.last_page}
                                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
