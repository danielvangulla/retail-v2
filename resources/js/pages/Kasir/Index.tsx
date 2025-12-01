import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

interface PaymentType {
    id: string;
    ket: string;
    urutan: number;
}

interface Props {
    paymentTypes: PaymentType[];
    keysArray: string[][];
}

interface BarangItem {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    alias?: string;
    satuan: string;
    volume: string;
    harga_jual1: number;
    harga_jual2: number;
    stock: number;
    prices?: any[];
    promo?: any;
    trx_details?: any[];
    multiplier?: boolean;
    qty?: number;
    disc_spv?: number;
    disc_promo?: number;
    namaPromo?: string;
    charge?: number;
    hargaJual?: number;
    hargaPromo?: number;
    total?: number;
}

export default function KasirIndex({ paymentTypes, keysArray }: Props) {
    const [items, setItems] = useState<BarangItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<BarangItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BarangItem[]>([]);
    const [selectedResult, setSelectedResult] = useState<BarangItem | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isPiutang, setIsPiutang] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const [lastTrxId, setLastTrxId] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const [totalDisc, setTotalDisc] = useState(0);
    const [totalPromo, setTotalPromo] = useState(0);
    const [totalCharge, setTotalCharge] = useState(0);
    const [showResetButton, setShowResetButton] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const canSelectSearchResultRef = useRef<boolean>(false);

    useEffect(() => {
        loadBarangList();
        inputRef.current?.focus();

        // Keyboard event handlers
        const handleKeyDown = (e: KeyboardEvent) => {
            const blockedKeys = [
                'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10',
            ];

            if (blockedKeys.includes(e.key)) {
                e.preventDefault();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // Arrow Up - navigate search results
            if (e.key === 'ArrowUp' && showSearchResults) {
                e.preventDefault();
                const currentIndex = searchResults.indexOf(selectedResult!);
                if (currentIndex === 0) {
                    setSelectedResult(searchResults[searchResults.length - 1]);
                } else {
                    setSelectedResult(searchResults[currentIndex - 1]);
                }
            }

            // Arrow Down - navigate search results
            if (e.key === 'ArrowDown' && showSearchResults) {
                e.preventDefault();
                const currentIndex = searchResults.indexOf(selectedResult!);
                if (currentIndex === searchResults.length - 1) {
                    setSelectedResult(searchResults[0]);
                } else {
                    setSelectedResult(searchResults[currentIndex + 1]);
                }
            }

            // Enter - select highlighted result
            if (e.key === 'Enter' && showSearchResults) {
                e.preventDefault();
                if (canSelectSearchResultRef.current && selectedResult) {
                    selectItemJual(selectedResult.id);
                    setShowSearchResults(false);
                    setSearchQuery('');
                    inputRef.current?.focus();
                }
            }

            // Backspace - auto focus input
            if (e.key === 'Backspace') {
                if (document.activeElement !== inputRef.current && !showSearchResults) {
                    inputRef.current?.focus();
                    const currentVal = searchQuery;
                    const remLastStr = currentVal.slice(0, -1);
                    setSearchQuery(remLastStr);
                    handleSearchInput(remLastStr);
                }
            }

            // Delete - clear search
            if (e.key === 'Delete' && !showSearchResults) {
                setSearchQuery('');
                handleSearchInput('');
                inputRef.current?.focus();
            }

            // Escape - reset all
            if (e.key === 'Escape' && !showSearchResults && selectedItems.length > 0) {
                resetAll();
            }

            // F5 - Diskon
            if (e.key === 'F5') {
                // TODO: implement diskon modal
            }

            // F7 - Komplemen
            if (e.key === 'F7') {
                // TODO: implement komplemen modal
            }

            // F8 - Piutang
            if (e.key === 'F8') {
                // TODO: implement piutang modal
            }

            // F9 - Pembayaran
            if (e.key === 'F9') {
                // TODO: implement payment modal
            }

            // PageUp - Print last
            if (e.key === 'PageUp') {
                handlePrintLast();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [showSearchResults, searchResults, selectedResult, selectedItems, searchQuery]);

    useEffect(() => {
        if (selectedItems.length > 0) {
            setShowResetButton(true);
        } else {
            setShowResetButton(false);
        }
    }, [selectedItems]);

    const loadBarangList = async () => {
        try {
            const response = await axios.post('/barang-list', { show: 1 });
            if (response.data.status === 'ok') {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error loading barang:', error);
        }
    };

    const handleSearchInput = useCallback((value: string) => {
        setSearchQuery(value);
        const searchString = value.toLowerCase();

        if (searchString.length >= 2) {
            // Filter hanya barcode dan deskripsi (sesuai retail original)
            const filtered = items.filter(item =>
                item.barcode.toLowerCase().includes(searchString) ||
                item.deskripsi.toLowerCase().includes(searchString)
            ).slice(0, 10); // Limit 10 items seperti retail original

            setSearchResults(filtered);
            setSelectedResult(filtered[0] || null);

            if (filtered.length === 1) {
                if (searchTimeout.current) clearTimeout(searchTimeout.current);

                // Find exact match untuk auto-select
                const exactMatch = items.find(item =>
                    item.barcode.toLowerCase() === searchString ||
                    item.deskripsi.toLowerCase() === searchString
                );

                searchTimeout.current = setTimeout(() => {
                    if (exactMatch) {
                        selectItemJual(exactMatch.id);
                        setShowSearchResults(false);
                        setSearchQuery('');
                    }
                }, 500); // 500ms seperti retail original
            } else {
                canSelectSearchResultRef.current = false;

                setTimeout(() => {
                    canSelectSearchResultRef.current = true;
                }, 500);
            }

            setShowSearchResults(filtered.length > 0);
        } else {
            setShowSearchResults(false);
            setSearchResults([]);
        }
    }, [items]);

    const selectItemJual = useCallback((id: string) => {
        setSelectedItems(prev => {
            const exist = prev.find(v => v.id === id);

            if (exist) {
                return prev.map(v =>
                    v.id === id ? { ...v, qty: (v.qty || 1) + 1 } : v
                );
            } else {
                const selected = items.find(v => v.id === id);
                if (selected) {
                    return [...prev, { ...selected, qty: 1 }];
                }
                return prev;
            }
        });

        inputRef.current?.focus();
    }, [items]);

    // Memoized calculation untuk avoid unnecessary recalculation
    const calculatedData = useMemo(() => {
        let newTotalDisc = 0;
        let newTotalPromo = 0;
        let newTotalCharge = 0;
        let newGrandTotal = 0;

        const updatedItems = selectedItems.map(item => {
            const v = { ...item };

            if (!v.disc_spv) v.disc_spv = 0;
            v.hargaJual = v.harga_jual1;
            v.namaPromo = '';
            v.disc_promo = 0;
            v.charge = 0;

            if (isPiutang) {
                v.charge = v.harga_jual2;
            }

            if (isStaff) {
                v.charge = 0;
            }

            if (v.multiplier && v.charge) {
                v.charge *= (v.qty || 1);
            }

            v.total = ((v.qty || 1) * v.hargaJual) - v.disc_spv - v.disc_promo;

            if (isPiutang) {
                v.total += parseFloat(String(v.charge || 0));
            }

            newTotalDisc += parseFloat(String(v.disc_spv));
            newTotalPromo += parseFloat(String(v.disc_promo));
            newTotalCharge += parseFloat(String(v.charge || 0));
            newGrandTotal += parseFloat(String(v.total || 0));

            return v;
        });

        return {
            items: updatedItems,
            totalDisc: newTotalDisc,
            totalPromo: newTotalPromo,
            totalCharge: newTotalCharge,
            grandTotal: newGrandTotal
        };
    }, [selectedItems, isPiutang, isStaff]);

    // Update states ketika calculatedData berubah
    useEffect(() => {
        setTotalDisc(calculatedData.totalDisc);
        setTotalPromo(calculatedData.totalPromo);
        setTotalCharge(calculatedData.totalCharge);
        setGrandTotal(calculatedData.grandTotal);
    }, [calculatedData]);

    const resetAll = useCallback(() => {
        setSelectedItems([]);
        setIsPiutang(false);
        setIsStaff(false);
        setSearchQuery('');
        setShowSearchResults(false);
        inputRef.current?.focus();
    }, []);

    const handlePrintLast = () => {
        if (lastTrxId) {
            window.open(`/print-bill/${lastTrxId}`, '_blank');
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('id-ID');
    };

    return (
        <>
            <Head title="Kasir - POS" />

            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-2">
                {/* Main Container */}
                <div className="h-[calc(100vh-1rem)] flex flex-col gap-2">

                    {/* Header Section */}
                    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-xl shadow-2xl border border-slate-600 p-3">
                        <div className="flex items-center justify-between">
                            {/* Search Box */}
                            <div className="flex-1 max-w-md">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                    <input
                                        ref={inputRef}
                                        id="inputBarcode"
                                        type="text"
                                        placeholder="Scan barcode atau ketik nama barang..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                                 transition-all duration-200 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Total Display */}
                            <div className="flex items-center gap-3 bg-linear-to-br from-blue-600 to-blue-500 px-6 py-3 rounded-xl shadow-lg">
                                <div className="text-right">
                                    <div className="text-blue-100 text-xs font-medium uppercase tracking-wider">Grand Total</div>
                                    <div className="text-white text-3xl font-bold tracking-tight">
                                        Rp {formatNumber(grandTotal)}
                                    </div>
                                </div>
                                <svg className="h-8 w-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Search Results Modal */}
                    {showSearchResults && (
                        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
                            <div className="bg-slate-800 border border-slate-600 shadow-2xl rounded-xl overflow-hidden h-[70vh] w-full max-w-4xl">
                                <div className="overflow-y-auto h-full">
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-linear-to-br from-slate-700 to-slate-600 shadow-md">
                                            <tr className="text-slate-200">
                                                <th className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider">Barcode</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Deskripsi</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold uppercase tracking-wider">Satuan</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider">Harga</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {searchResults.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                                                        <svg className="mx-auto h-12 w-12 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                                        </svg>
                                                        Tidak ada hasil pencarian
                                                    </td>
                                                </tr>
                                            ) : (
                                                searchResults.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => {
                                                            selectItemJual(item.id);
                                                            setShowSearchResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className={`cursor-pointer transition-all duration-150 ${
                                                            selectedResult?.id === item.id
                                                                ? 'bg-blue-600 text-white shadow-lg'
                                                                : 'bg-slate-800/50 hover:bg-slate-700 text-slate-200'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3 text-center font-mono text-sm">{item.barcode}</td>
                                                        <td className="px-4 py-3 font-medium">{item.deskripsi}</td>
                                                        <td className="px-4 py-3 text-center text-sm">{item.volume}</td>
                                                        <td className="px-4 py-3 text-right font-semibold">Rp {formatNumber(item.harga_jual1)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cart Table */}
                    <div className="flex-1 bg-slate-800 rounded-xl shadow-2xl border border-slate-600 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto flex-1" id="kasirScreen">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-linear-to-br from-slate-700 to-slate-600 shadow-md">
                                    <tr className="text-slate-200">
                                        <th className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wider w-16">No</th>
                                        <th className="px-3 py-3 text-left text-sm font-semibold uppercase tracking-wider">Nama Barang</th>
                                        <th className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wider w-24">Satuan</th>
                                        <th className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wider w-20">Qty</th>
                                        <th className="px-3 py-3 text-right text-sm font-semibold uppercase tracking-wider w-32">Harga</th>
                                        <th className="px-3 py-3 text-right text-sm font-semibold uppercase tracking-wider w-28">Charge</th>
                                        <th className="px-3 py-3 text-right text-sm font-semibold uppercase tracking-wider w-28">Disc</th>
                                        <th className="px-3 py-3 text-right text-sm font-semibold uppercase tracking-wider w-36">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {calculatedData.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-20 text-center text-slate-400">
                                                <svg className="mx-auto h-16 w-16 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                                </svg>
                                                <div className="text-lg font-medium">Keranjang masih kosong</div>
                                                <div className="text-sm mt-1">Scan atau cari barang untuk memulai transaksi</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        calculatedData.items.map((item, index) => (
                                            <tr key={item.id} className="bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-200">
                                                <td className="px-3 py-2.5 text-center text-slate-400 font-medium">{index + 1}</td>
                                                <td className="px-3 py-2.5 font-medium">{item.deskripsi}</td>
                                                <td className="px-3 py-2.5 text-center text-sm text-slate-300">{item.volume}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-12 px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold cursor-pointer transition-colors">
                                                        {formatNumber(item.qty || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-mono text-sm">Rp {formatNumber(item.hargaJual || 0)}</td>
                                                <td className="px-3 py-2.5 text-right font-mono text-sm text-amber-400">{item.charge ? `Rp ${formatNumber(item.charge)}` : '-'}</td>
                                                <td className="px-3 py-2.5 text-right font-mono text-sm text-green-400">{(item.disc_spv || 0) + (item.disc_promo || 0) > 0 ? `Rp ${formatNumber((item.disc_spv || 0) + (item.disc_promo || 0))}` : '-'}</td>
                                                <td className="px-3 py-2.5 text-right font-bold text-lg">Rp {formatNumber(item.total || 0)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-xl shadow-2xl border border-slate-600 p-3">
                        <div className="flex items-center justify-center gap-2">
                            {showResetButton && (
                                <button
                                    onClick={resetAll}
                                    className="group flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
                                             text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    <span>Reset</span>
                                    <span className="text-xs opacity-75">(Esc)</span>
                                </button>
                            )}

                            <button
                                onClick={handlePrintLast}
                                className="group flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400
                                         text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                </svg>
                                <span>Print Last</span>
                                <span className="text-xs opacity-75">(PgUp)</span>
                            </button>

                            <button
                                className="group flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400
                                         text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>Diskon</span>
                                <span className="text-xs opacity-75">(F5)</span>
                            </button>

                            <button
                                className="group flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400
                                         text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                                </svg>
                                <span>Komplemen</span>
                                <span className="text-xs opacity-75">(F7)</span>
                            </button>

                            <button
                                className="group flex items-center gap-2 px-4 py-2.5 bg-linear-to-br from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400
                                         text-white rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                <span>Piutang</span>
                                <span className="text-xs opacity-75">(F8)</span>
                            </button>

                            <button
                                className="group flex items-center gap-2 px-5 py-2.5 bg-linear-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                                         text-white rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 ring-2 ring-blue-400/50"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                </svg>
                                <span>Pembayaran</span>
                                <span className="text-xs opacity-75">(F9)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
