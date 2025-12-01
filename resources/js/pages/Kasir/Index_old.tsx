import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import axios from '@/lib/axios';

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
    const [showQtyModal, setShowQtyModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BarangItem | null>(null);
    const [qtyInput, setQtyInput] = useState('');

    // Modal states
    const [showDiskonModal, setShowDiskonModal] = useState(false);
    const [diskonItem, setDiskonItem] = useState<BarangItem | null>(null);
    const [diskonInput, setDiskonInput] = useState('');
    const [spvPin, setSpvPin] = useState('');

    const [showKomplemenModal, setShowKomplemenModal] = useState(false);
    const [komplemenSearch, setKomplemenSearch] = useState('');
    const [spvPinKomplemen, setSpvPinKomplemen] = useState('');

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [memberId, setMemberId] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const canSelectSearchResultRef = useRef<boolean>(false);
    const qtyInputRef = useRef<HTMLInputElement>(null);
    const diskonInputRef = useRef<HTMLInputElement>(null);
    const spvPinRef = useRef<HTMLInputElement>(null);
    const spvPinKomplemenRef = useRef<HTMLInputElement>(null);
    const paymentInputRef = useRef<HTMLInputElement>(null);

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

            // Tab - edit qty item terakhir yang ditambahkan
            if (e.key === 'Tab' && selectedItems.length > 0 && !showSearchResults && !showQtyModal) {
                e.preventDefault();
                const lastAdded = selectedItems[selectedItems.length - 1];
                handleEditQty(lastAdded);
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

            // Enter - save qty from modal
            if (e.key === 'Enter' && showQtyModal) {
                e.preventDefault();
                handleSaveQty();
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

            // Escape - reset all atau close modal
            if (e.key === 'Escape') {
                if (showQtyModal) {
                    setShowQtyModal(false);
                    setEditingItem(null);
                    setQtyInput('');
                    inputRef.current?.focus();
                } else if (showDiskonModal) {
                    setShowDiskonModal(false);
                    setDiskonItem(null);
                    setDiskonInput('');
                    setSpvPin('');
                    inputRef.current?.focus();
                } else if (showKomplemenModal) {
                    setShowKomplemenModal(false);
                    setKomplemenSearch('');
                    inputRef.current?.focus();
                } else if (showPaymentModal) {
                    setShowPaymentModal(false);
                    setPaymentAmount('');
                    setCustomerName('');
                    inputRef.current?.focus();
                } else if (!showSearchResults && selectedItems.length > 0) {
                    resetAll();
                }
            }

            // F5 - Diskon
            if (e.key === 'F5') {
                e.preventDefault();
                handleDiskon();
            }

            // F7 - Komplemen
            if (e.key === 'F7') {
                e.preventDefault();
                handleKomplemen();
            }

            // F8 - Piutang
            if (e.key === 'F8') {
                e.preventDefault();
                handleTogglePiutang();
            }

            // F9 - Pembayaran
            if (e.key === 'F9') {
                e.preventDefault();
                handlePayment();
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
    }, [showSearchResults, searchResults, selectedResult, selectedItems, searchQuery, showQtyModal, showDiskonModal, showKomplemenModal, showPaymentModal, grandTotal]);

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
                // Allow immediate Enter key selection
                canSelectSearchResultRef.current = true;

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

    const handleEditQty = (item: BarangItem) => {
        setEditingItem(item);
        setQtyInput(String(item.qty || 0));
        setShowQtyModal(true);
        setTimeout(() => qtyInputRef.current?.focus(), 100);
    };

    const handleSaveQty = () => {
        if (editingItem && qtyInput) {
            const newQty = parseInt(qtyInput);
            if (!isNaN(newQty) && newQty > 0) {
                setSelectedItems(prev =>
                    prev.map(v =>
                        v.id === editingItem.id ? { ...v, qty: newQty } : v
                    )
                );
            } else if (newQty === 0) {
                // Remove item jika qty = 0
                setSelectedItems(prev => prev.filter(v => v.id !== editingItem.id));
            }
        }
        setShowQtyModal(false);
        setEditingItem(null);
        setQtyInput('');
        inputRef.current?.focus();
    };

    const handlePrintLast = () => {
        if (lastTrxId) {
            window.open(`/print-bill/${lastTrxId}`, '_blank');
        }
    };

    const handleDiskon = (item?: BarangItem) => {
        if (selectedItems.length === 0) return;

        // Jika tidak ada item spesifik, ambil item terakhir yang ditambahkan
        const targetItem = item || selectedItems[selectedItems.length - 1];
        setDiskonItem(targetItem);
        setDiskonInput('');
        setSpvPin('');
        setShowDiskonModal(true);
        setTimeout(() => diskonInputRef.current?.focus(), 100);
    };

    const handleSaveDiskon = async () => {
        if (!diskonItem || !diskonInput) return;

        const diskonValue = parseFloat(diskonInput);
        if (isNaN(diskonValue) || diskonValue < 0) return;

        // Validasi PIN SPV
        if (!spvPin) {
            alert('PIN supervisor diperlukan untuk memberikan diskon');
            spvPinRef.current?.focus();
            return;
        }

        try {
            const response = await axios.post('/validate-spv', {
                pin: spvPin
            });

            if (response.data.status === 'ok') {
                // Update diskon item
                setSelectedItems(prev =>
                    prev.map(v =>
                        v.id === diskonItem.id
                            ? { ...v, disc_spv: diskonValue }
                            : v
                    )
                );

                setShowDiskonModal(false);
                setDiskonItem(null);
                setDiskonInput('');
                setSpvPin('');
                inputRef.current?.focus();
            } else {
                alert('PIN supervisor salah');
                setSpvPin('');
                spvPinRef.current?.focus();
            }
        } catch (error) {
            console.error('Error validating SPV:', error);
            alert('Gagal validasi PIN supervisor');
        }
    };

    const handleKomplemen = () => {
        setShowKomplemenModal(true);
        setKomplemenSearch('');
        setSpvPinKomplemen('');
    };

    const handleSelectKomplemen = async (item: BarangItem) => {
        // Validasi PIN SPV untuk komplemen
        if (!spvPinKomplemen) {
            alert('PIN supervisor diperlukan untuk komplemen');
            spvPinKomplemenRef.current?.focus();
            return;
        }

        try {
            const response = await axios.post('/validate-spv', {
                pin: spvPinKomplemen
            });

            if (response.data.status === 'ok') {
                // Tambahkan sebagai item gratis (harga 0)
                const komplemenItem = {
                    ...item,
                    qty: 1,
                    hargaJual: 0,
                    harga_jual1: 0,
                    disc_spv: 0,
                    disc_promo: 0,
                    charge: 0,
                    total: 0
                };

                setSelectedItems(prev => [...prev, komplemenItem]);
                setShowKomplemenModal(false);
                setKomplemenSearch('');
                setSpvPinKomplemen('');
                inputRef.current?.focus();
            } else {
                alert('PIN supervisor salah');
                setSpvPinKomplemen('');
                spvPinKomplemenRef.current?.focus();
            }
        } catch (error) {
            console.error('Error validating SPV:', error);
            alert('Gagal validasi PIN supervisor');
        }
    };

    const handleTogglePiutang = () => {
        setIsPiutang(prev => !prev);
    };

    const handlePayment = () => {
        if (selectedItems.length === 0) {
            alert('Keranjang masih kosong');
            return;
        }

        if (grandTotal === 0) {
            alert('Total transaksi tidak valid');
            return;
        }

        setSelectedPaymentType(paymentTypes[0] || null);
        setPaymentAmount('');
        setCustomerName('');
        setShowPaymentModal(true);
        setTimeout(() => paymentInputRef.current?.focus(), 100);
    };

    const handleSavePayment = async () => {
        if (!selectedPaymentType) {
            alert('Pilih metode pembayaran');
            return;
        }

        const payment = parseFloat(paymentAmount);
        if (isNaN(payment) || payment < grandTotal) {
            alert(`Pembayaran minimal Rp ${formatNumber(grandTotal)}`);
            paymentInputRef.current?.focus();
            return;
        }

        try {
            const trxData = {
                items: selectedItems.map(item => ({
                    id: item.id,
                    qty: item.qty,
                    harga: item.hargaJual,
                    disc_spv: item.disc_spv || 0,
                    disc_promo: item.disc_promo || 0,
                    charge: item.charge || 0,
                    total: item.total
                })),
                payment_type_id: selectedPaymentType.id,
                payment_amount: payment,
                grand_total: grandTotal,
                customer_name: customerName,
                is_piutang: isPiutang,
                is_staff: isStaff
            };

            const response = await axios.post('/proses-bayar', trxData);

            if (response.data.status === 'ok') {
                setLastTrxId(response.data.trx_id);

                // Show change
                const change = payment - grandTotal;
                if (change > 0) {
                    alert(`Pembayaran berhasil!\nKembalian: Rp ${formatNumber(change)}`);
                } else {
                    alert('Pembayaran berhasil!');
                }

                // Auto print
                if (response.data.trx_id) {
                    window.open(`/print-bill/${response.data.trx_id}`, '_blank');
                }

                // Reset all
                resetAll();
                setShowPaymentModal(false);
                setPaymentAmount('');
                setCustomerName('');
            } else {
                alert('Gagal memproses pembayaran: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Gagal memproses pembayaran');
        }
    };

    const handleDeleteItem = (itemId: string) => {
        if (confirm('Hapus item dari keranjang?')) {
            setSelectedItems(prev => prev.filter(v => v.id !== itemId));
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('id-ID');
    };

    return (
        <>
            <Head title="Kasir - POS" />

            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-1 sm:p-2">
                {/* Main Container */}
                <div className="h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-1rem)] flex flex-col gap-1 sm:gap-2">

                    {/* Header Section */}
                    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg sm:rounded-xl shadow-2xl border border-slate-600 p-2 sm:p-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            {/* Search Box */}
                            <div className="flex-1 sm:max-w-md">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                    <input
                                        ref={inputRef}
                                        id="inputBarcode"
                                        type="text"
                                        placeholder="Scan barcode..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm sm:text-base placeholder-slate-400
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                                 transition-all duration-200 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Total Display */}
                            <div className="flex items-center gap-2 sm:gap-3 bg-linear-to-br from-blue-600 to-blue-500 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg">
                                <div className="text-right flex-1">
                                    <div className="text-blue-100 text-[10px] sm:text-xs font-medium uppercase tracking-wider">Grand Total</div>
                                    <div className="text-white text-xl sm:text-3xl font-bold tracking-tight">
                                        Rp {formatNumber(grandTotal)}
                                    </div>
                                </div>
                                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                        <th className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wider w-16">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {calculatedData.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-20 text-center text-slate-400">
                                                <svg className="mx-auto h-16 w-16 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                                </svg>
                                                <div className="text-lg font-medium">Keranjang masih kosong</div>
                                                <div className="text-sm mt-1">Scan atau cari barang untuk memulai transaksi</div>
                                            </td>
                                        </tr>
                                    ) : (
                                        calculatedData.items.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-200"
                                                onDoubleClick={() => handleDiskon(item)}
                                                title="Double-click untuk diskon item ini"
                                            >
                                                <td className="px-3 py-2.5 text-center text-slate-400 font-medium">{index + 1}</td>
                                                <td className="px-3 py-2.5 font-medium">{item.deskripsi}</td>
                                                <td className="px-3 py-2.5 text-center text-sm text-slate-300">{item.volume}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span
                                                        onClick={() => handleEditQty(item)}
                                                        className="inline-flex items-center justify-center min-w-12 px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold cursor-pointer transition-colors"
                                                    >
                                                        {formatNumber(item.qty || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-mono text-sm">Rp {formatNumber(item.hargaJual || 0)}</td>
                                                <td className="px-3 py-2.5 text-right font-mono text-sm text-amber-400">{item.charge ? `Rp ${formatNumber(item.charge)}` : '-'}</td>
                                                <td className="px-3 py-2.5 text-right font-mono text-sm text-green-400">{(item.disc_spv || 0) + (item.disc_promo || 0) > 0 ? `Rp ${formatNumber((item.disc_spv || 0) + (item.disc_promo || 0))}` : '-'}</td>
                                                <td className="px-3 py-2.5 text-right font-bold text-lg">Rp {formatNumber(item.total || 0)}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-1.5 hover:bg-red-600/20 rounded-md transition-colors group"
                                                        title="Hapus item"
                                                    >
                                                        <svg className="h-4 w-4 text-slate-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg sm:rounded-xl shadow-2xl border border-slate-600 p-2 sm:p-3">
                        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                            {showResetButton && (
                                <button
                                    onClick={resetAll}
                                    className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
                                             text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
                                >
                                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    <span className="hidden sm:inline">Reset</span>
                                    <span className="sm:hidden">RST</span>
                                </button>
                            )}

                            <button
                                onClick={handlePrintLast}
                                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400
                                         text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                </svg>
                                <span className="hidden sm:inline">Print</span>
                                <span className="sm:hidden">PRT</span>
                            </button>

                            <button
                                onClick={() => handleDiskon()}
                                disabled={selectedItems.length === 0}
                                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400
                                         text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap shrink-0"
                            >
                                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span className="hidden sm:inline">Diskon</span>
                                <span className="sm:hidden">DSK</span>
                            </button>

                            <button
                                onClick={handleKomplemen}
                                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400
                                         text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                                </svg>
                                <span className="hidden sm:inline">Komplemen</span>
                                <span className="sm:hidden">KOM</span>
                            </button>

                            <button
                                onClick={handleTogglePiutang}
                                className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0 ${
                                    isPiutang
                                        ? 'from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500 ring-2 ring-orange-400'
                                        : 'from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400'
                                } text-white`}
                            >
                                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                <span className="hidden sm:inline">{isPiutang ? 'Piutang: ON' : 'Piutang'}</span>
                                <span className="sm:hidden">{isPiutang ? 'ON' : 'PIU'}</span>
                            </button>

                            <button
                                onClick={handlePayment}
                                disabled={selectedItems.length === 0}
                                className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 bg-linear-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                                         text-white rounded-md sm:rounded-lg font-semibold text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 ring-2 ring-blue-400/50 cursor-pointer
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap shrink-0"
                            >
                                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                </svg>
                                <span className="hidden sm:inline">Pembayaran</span>
                                <span className="sm:hidden">BAYAR</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Qty Edit Modal */}
                {showQtyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                        <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Edit Quantity</h3>
                            <div className="mb-4">
                                <p className="text-slate-300 text-sm mb-2">{editingItem?.deskripsi}</p>
                                <input
                                    ref={qtyInputRef}
                                    type="number"
                                    inputMode="numeric"
                                    value={qtyInput}
                                    onChange={(e) => setQtyInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl sm:text-2xl text-center font-bold
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowQtyModal(false);
                                        setEditingItem(null);
                                        setQtyInput('');
                                        inputRef.current?.focus();
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveQty}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diskon Modal */}
                {showDiskonModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Input Diskon Supervisor</h3>
                            <div className="mb-4">
                                <p className="text-slate-300 text-sm mb-2">{diskonItem?.deskripsi}</p>
                                <p className="text-slate-400 text-xs mb-3">Harga: Rp {formatNumber(diskonItem?.hargaJual || 0)}</p>

                                <label className="block text-slate-300 text-sm mb-2">Jumlah Diskon (Rp)</label>
                                <input
                                    ref={diskonInputRef}
                                    type="number"
                                    value={diskonInput}
                                    onChange={(e) => setDiskonInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl text-center font-bold
                                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent mb-3"
                                    placeholder="0"
                                />

                                <label className="block text-slate-300 text-sm mb-2">PIN Supervisor</label>
                                <input
                                    ref={spvPinRef}
                                    type="password"
                                    inputMode="numeric"
                                    value={spvPin}
                                    onChange={(e) => setSpvPin(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSaveDiskon();
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white
                                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="••••••"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowDiskonModal(false);
                                        setDiskonItem(null);
                                        setDiskonInput('');
                                        setSpvPin('');
                                        inputRef.current?.focus();
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveDiskon}
                                    className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Komplemen Modal */}
                {showKomplemenModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                        <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Pilih Barang Komplemen / Hadiah</h3>
                            <div className="mb-3">
                                <label className="block text-slate-300 text-sm mb-2">Cari Barang</label>
                                <input
                                    type="text"
                                    value={komplemenSearch}
                                    onChange={(e) => setKomplemenSearch(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white
                                             focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-3"
                                    placeholder="Cari barang..."
                                    autoFocus
                                />

                                <label className="block text-slate-300 text-sm mb-2">PIN Supervisor</label>
                                <input
                                    ref={spvPinKomplemenRef}
                                    type="password"
                                    inputMode="numeric"
                                    value={spvPinKomplemen}
                                    onChange={(e) => setSpvPinKomplemen(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white
                                             focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                    placeholder="••••••"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto mb-4">
                                <table className="w-full">
                                    <thead className="sticky top-0 bg-slate-700">
                                        <tr className="text-slate-200">
                                            <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm">Barcode</th>
                                            <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm">Deskripsi</th>
                                            <th className="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm hidden sm:table-cell">Satuan</th>
                                            <th className="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {items
                                            .filter(item =>
                                                item.barcode.toLowerCase().includes(komplemenSearch.toLowerCase()) ||
                                                item.deskripsi.toLowerCase().includes(komplemenSearch.toLowerCase())
                                            )
                                            .slice(0, 10)
                                            .map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-700/50 text-slate-200">
                                                    <td className="px-2 sm:px-3 py-2 font-mono text-xs sm:text-sm">{item.barcode}</td>
                                                    <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.deskripsi}</td>
                                                    <td className="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm hidden sm:table-cell">{item.volume}</td>
                                                    <td className="px-2 sm:px-3 py-2 text-center">
                                                        <button
                                                            onClick={() => handleSelectKomplemen(item)}
                                                            className="px-2 sm:px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs sm:text-sm cursor-pointer"
                                                        >
                                                            Pilih
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowKomplemenModal(false);
                                        setKomplemenSearch('');
                                        setSpvPinKomplemen('');
                                        inputRef.current?.focus();
                                    }}
                                    className="px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                        <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] overflow-y-auto">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Pembayaran</h3>

                            {/* Grand Total Display */}
                            <div className="bg-linear-to-br from-blue-600 to-blue-500 rounded-lg p-3 sm:p-4 mb-4">
                                <div className="text-blue-100 text-xs sm:text-sm">Total Pembayaran</div>
                                <div className="text-white text-2xl sm:text-3xl font-bold">Rp {formatNumber(grandTotal)}</div>
                            </div>

                            {/* Payment Type Selection */}
                            <div className="mb-4">
                                <label className="block text-slate-300 text-sm mb-2">Metode Pembayaran</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {paymentTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedPaymentType(type)}
                                            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all cursor-pointer ${
                                                selectedPaymentType?.id === type.id
                                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                        >
                                            {type.ket}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Name (for Piutang) */}
                            {isPiutang && (
                                <div className="mb-4">
                                    <label className="block text-slate-300 text-sm mb-2">Nama Customer</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm sm:text-base
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nama customer..."
                                    />
                                </div>
                            )}

                            {/* Payment Amount */}
                            <div className="mb-4">
                                <label className="block text-slate-300 text-sm mb-2">Jumlah Bayar</label>
                                <input
                                    ref={paymentInputRef}
                                    type="number"
                                    inputMode="numeric"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSavePayment();
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl sm:text-2xl text-center font-bold
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>

                            {/* Change Display */}
                            {paymentAmount && parseFloat(paymentAmount) >= grandTotal && (
                                <div className="bg-emerald-600/20 border border-emerald-500 rounded-lg p-3 mb-4">
                                    <div className="text-emerald-300 text-xs sm:text-sm">Kembalian</div>
                                    <div className="text-emerald-100 text-lg sm:text-xl font-bold">
                                        Rp {formatNumber(parseFloat(paymentAmount) - grandTotal)}
                                    </div>
                                </div>
                            )}

                            {/* Quick Amount Buttons */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[50000, 100000, 200000].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setPaymentAmount(String(amount))}
                                        className="px-2 sm:px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs sm:text-sm font-medium cursor-pointer"
                                    >
                                        {formatNumber(amount)}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentAmount('');
                                        setCustomerName('');
                                        inputRef.current?.focus();
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSavePayment}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                                >
                                    Proses
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
