import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from '@/lib/axios';
import { PaymentType, BarangItem } from '@/components/kasir/types';
import QtyEditModal from './components/QtyEditModal';
import DiskonModal from './components/DiskonModal';
import KomplemenModal from './components/KomplemenModal';
import PaymentModal from './components/PaymentModal';
import ActionButtons from './components/ActionButtons';
import CartTable from './components/CartTable';
import KasirMenuBar from './components/KasirMenuBar';
import SessionExpiredModal from './components/SessionExpiredModal';
import AlertModal from './components/AlertModal';
import ConfirmModal from './components/ConfirmModal';
import LoadingModal from './components/LoadingModal';
import useKasirKeyboard from './hooks/useKasirKeyboard';
import useKasirCalculations from './hooks/useKasirCalculations';

interface Props {
    paymentTypes: PaymentType[];
    keysArray: string[][];
    lastTrxId?: string;
    auth?: {
        user?: {
            name?: string;
        };
    };
}

export default function KasirIndex({ paymentTypes, keysArray, lastTrxId: initialLastTrxId = '', auth }: Props) {
    // State management
    const [items, setItems] = useState<BarangItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<BarangItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BarangItem[]>([]);
    const [selectedResult, setSelectedResult] = useState<BarangItem | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isPiutang, setIsPiutang] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const [lastTrxId, setLastTrxId] = useState(initialLastTrxId);
    const [showResetButton, setShowResetButton] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Memproses...');

    // Alert modal state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        onConfirm?: () => void;
    }>({ title: '', message: '', type: 'info' });

    // Confirm modal state
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        onConfirm: () => void;
        onCancel?: () => void;
    }>({ title: '', message: '', type: 'warning', onConfirm: () => {} });

    // Modal states
    const [showQtyModal, setShowQtyModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BarangItem | null>(null);
    const [qtyInput, setQtyInput] = useState('');

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

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const canSelectSearchResultRef = useRef<boolean>(false);
    const qtyInputRef = useRef<HTMLInputElement>(null);
    const diskonInputRef = useRef<HTMLInputElement>(null);
    const spvPinRef = useRef<HTMLInputElement>(null);
    const spvPinKomplemenRef = useRef<HTMLInputElement>(null);
    const paymentInputRef = useRef<HTMLInputElement>(null);

    // Custom hooks for calculations
    const { grandTotal, totalDisc, totalPromo, totalCharge, calculatedItems, totalQty } = useKasirCalculations(
        selectedItems,
        isPiutang,
        isStaff
    );

    // Load barang list
    useEffect(() => {
        loadBarangList();
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        setShowResetButton(selectedItems.length > 0);
    }, [selectedItems]);

    // Helper functions for modal
    const showAlertModal = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', onConfirm?: () => void) => {
        setAlertConfig({ title, message, type, onConfirm });
        setShowAlert(true);
    };

    const showConfirmModal = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'info' = 'warning', onCancel?: () => void) => {
        setConfirmConfig({ title, message, type, onConfirm, onCancel });
        setShowConfirm(true);
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        if (alertConfig.onConfirm) {
            alertConfig.onConfirm();
        }
    };

    const handleConfirmYes = () => {
        setShowConfirm(false);
        confirmConfig.onConfirm();
    };

    const handleConfirmNo = () => {
        setShowConfirm(false);
        if (confirmConfig.onCancel) {
            confirmConfig.onCancel();
        }
    };

    const loadBarangList = async () => {
        try {
            const response = await axios.post('/barang-list', { show: 1 });
            if (response.data.status === 'ok') {
                setItems(response.data.data);
            } else {
                console.error('Failed to load items:', response.data.message);
            }
        } catch (error: any) {
            console.error('Error loading barang:', error);
            if (error.response?.status === 403) {
                setSessionExpired(true);
            }
        }
    };

    const handleSearchInput = useCallback((value: string) => {
        setSearchQuery(value);
        const searchString = value.toLowerCase();

        if (searchString.length >= 2) {
            const filtered = items.filter(item =>
                item.barcode.toLowerCase().includes(searchString) ||
                item.deskripsi.toLowerCase().includes(searchString)
            ).slice(0, 10);

            setSearchResults(filtered);
            setSelectedResult(filtered[0] || null);

            if (filtered.length === 1) {
                canSelectSearchResultRef.current = true;

                if (searchTimeout.current) clearTimeout(searchTimeout.current);

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
                }, 500);
            } else {
                canSelectSearchResultRef.current = false;
                setTimeout(() => { canSelectSearchResultRef.current = true; }, 500);
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
            const width = 400;
            const height = 500;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            const size = `width=${width},height=${height},left=${left},top=${top}`;
            const url = `/print-bill/${lastTrxId}`;
            const popupWindow = window.open(url, '_blank', size);
            if (popupWindow) {
                popupWindow.print();
                setTimeout(() => {
                    // popupWindow.close();
                }, 1000);
            }
        }
    };

    const handleDiskon = (item?: BarangItem) => {
        if (selectedItems.length === 0) return;

        const targetItem = item || selectedItems[selectedItems.length - 1];
        setDiskonItem(targetItem);
        setDiskonInput('');
        setSpvPin('');
        setShowDiskonModal(true);
    };

    const handleSaveDiskon = async () => {
        if (!diskonItem || !diskonInput) return;

        const diskonValue = parseFloat(diskonInput);
        if (isNaN(diskonValue) || diskonValue < 0) return;

        if (!spvPin) {
            showAlertModal('PIN Diperlukan', 'PIN supervisor diperlukan untuk memberikan diskon', 'warning', () => {
                spvPinRef.current?.focus();
            });
            return;
        }

        try {
            setIsLoading(true);
            setLoadingMessage('Validasi PIN...');
            const response = await axios.post('/validate-spv', { pin: spvPin });

            if (response.data.status === 'ok') {
                setSelectedItems(prev =>
                    prev.map(v =>
                        v.id === diskonItem.id ? { ...v, disc_spv: diskonValue } : v
                    )
                );

                setShowDiskonModal(false);
                setDiskonItem(null);
                setDiskonInput('');
                setSpvPin('');
                inputRef.current?.focus();
            } else {
                showAlertModal('PIN Salah', 'PIN supervisor salah', 'error', () => {
                    setSpvPin('');
                    spvPinRef.current?.focus();
                });
            }
        } catch (error: any) {
            console.error('Error validating SPV:', error);
            if (error.response?.status === 403) {
                setSessionExpired(true);
            } else {
                showAlertModal('Gagal Validasi', 'Gagal validasi PIN supervisor', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKomplemen = () => {
        setShowKomplemenModal(true);
        setKomplemenSearch('');
        setSpvPinKomplemen('');
    };

    const handleSelectKomplemen = async (item: BarangItem) => {
        if (!spvPinKomplemen) {
            showAlertModal('PIN Diperlukan', 'PIN supervisor diperlukan untuk komplemen', 'warning', () => {
                spvPinKomplemenRef.current?.focus();
            });
            return;
        }

        try {
            setIsLoading(true);
            setLoadingMessage('Validasi PIN...');
            const response = await axios.post('/validate-spv', { pin: spvPinKomplemen });

            if (response.data.status === 'ok') {
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
                showAlertModal('PIN Salah', 'PIN supervisor salah', 'error', () => {
                    setSpvPinKomplemen('');
                    spvPinKomplemenRef.current?.focus();
                });
            }
        } catch (error: any) {
            console.error('Error validating SPV:', error);
            if (error.response?.status === 403) {
                setSessionExpired(true);
            } else {
                showAlertModal('Gagal Validasi', 'Gagal validasi PIN supervisor', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePiutang = () => {
        setIsPiutang(prev => !prev);
    };

    const handlePayment = () => {
        if (selectedItems.length === 0) {
            showAlertModal('Keranjang Kosong', 'Keranjang masih kosong', 'warning');
            return;
        }

        if (grandTotal === 0) {
            showAlertModal('Total Tidak Valid', 'Total transaksi tidak valid', 'error');
            return;
        }

        setSelectedPaymentType(paymentTypes[0] || null);
        setPaymentAmount('');
        setCustomerName('');
        setShowPaymentModal(true);
    };

    const handleSavePayment = async () => {
        if (!selectedPaymentType) {
            showAlertModal('Metode Pembayaran', 'Pilih metode pembayaran', 'warning');
            return;
        }

        const payment = parseFloat(paymentAmount);
        if (isNaN(payment) || payment < grandTotal) {
            showAlertModal('Pembayaran Kurang', `Pembayaran minimal Rp ${formatNumber(grandTotal)}`, 'warning', () => {
                paymentInputRef.current?.focus();
            });
            return;
        }

        try {
            setIsLoading(true);
            setLoadingMessage('Memproses pembayaran...');

            const trxData = {
                state: isPiutang ? 'piutang' : 'full',
                items: calculatedItems.map(item => ({
                    id: item.id,
                    qty: item.qty,
                    harga: item.hargaJual,
                    disc_spv: item.disc_spv || 0,
                    disc_promo: item.disc_promo || 0,
                    charge: item.charge || 0,
                    total: item.total
                })),
                discSpv: totalDisc,
                discPromo: totalPromo,
                charge: totalCharge,
                total: grandTotal,
                bayar: payment,
                typeId: selectedPaymentType.id,
                memberId: customerName || ''
            };

            const response = await axios.post('/proses-bayar', trxData);

            if (response.data.status === 'ok') {
                const trxId = response.data.trxId || response.data.trx_id;
                setLastTrxId(trxId);

                const change = payment - grandTotal;
                const message = change > 0
                    ? `Pembayaran berhasil!\nKembalian: Rp ${formatNumber(change)}`
                    : 'Pembayaran berhasil!';

                showAlertModal('Sukses', message, 'success', () => {
                    if (trxId) {
                        // Open print window in center of screen
                        const width = 400;
                        const height = 500;
                        const left = (window.screen.width - width) / 2;
                        const top = (window.screen.height - height) / 2;
                        const size = `width=${width},height=${height},left=${left},top=${top}`;

                        const popupWindow = window.open(`/print-bill/${trxId}`, '_blank', size);
                        if (popupWindow) {
                            popupWindow.print();
                            setTimeout(() => {
                                // popupWindow.close();
                            }, 1000);
                        }
                    }
                });

                resetAll();
                setShowPaymentModal(false);
                setPaymentAmount('');
                setCustomerName('');
            } else {
                showAlertModal('Gagal', 'Gagal memproses pembayaran: ' + (response.data.message || 'Unknown error'), 'error');
            }
        } catch (error: any) {
            console.error('Error processing payment:', error);
            if (error.response?.status === 403) {
                setSessionExpired(true);
            } else if (error.response?.status === 422) {
                showAlertModal('Data Tidak Valid', 'Data tidak valid: ' + (error.response.data.message || 'Validation error'), 'error');
            } else {
                showAlertModal('Gagal', 'Gagal memproses pembayaran. Silakan coba lagi.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = (itemId: string) => {
        showConfirmModal(
            'Hapus Item',
            'Hapus item dari keranjang?',
            () => {
                setSelectedItems(prev => prev.filter(v => v.id !== itemId));
            },
            'warning'
        );
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('id-ID');
    };

    // Keyboard shortcuts
    useKasirKeyboard({
        showSearchResults,
        searchResults,
        selectedResult,
        selectedItems,
        searchQuery,
        showQtyModal,
        showDiskonModal,
        showKomplemenModal,
        showPaymentModal,
        grandTotal,
        onArrowUp: () => {
            const currentIndex = searchResults.indexOf(selectedResult!);
            if (currentIndex === 0) {
                setSelectedResult(searchResults[searchResults.length - 1]);
            } else {
                setSelectedResult(searchResults[currentIndex - 1]);
            }
        },
        onArrowDown: () => {
            const currentIndex = searchResults.indexOf(selectedResult!);
            if (currentIndex === searchResults.length - 1) {
                setSelectedResult(searchResults[0]);
            } else {
                setSelectedResult(searchResults[currentIndex + 1]);
            }
        },
        onTab: () => {
            if (selectedItems.length > 0) {
                const lastAdded = selectedItems[selectedItems.length - 1];
                handleEditQty(lastAdded);
            }
        },
        onEnter: () => {
            if (canSelectSearchResultRef.current && selectedResult) {
                selectItemJual(selectedResult.id);
                setShowSearchResults(false);
                setSearchQuery('');
                inputRef.current?.focus();
            }
        },
        onBackspace: () => {
            if (document.activeElement !== inputRef.current) {
                inputRef.current?.focus();
            }
        },
        onEscape: () => {
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
        },
        onDelete: () => {
            if (selectedItems.length > 0 && !showSearchResults) {
                const lastItem = selectedItems[selectedItems.length - 1];
                handleDeleteItem(lastItem.id);
            }
        },
        onF5: handleDiskon,
        onF7: handleKomplemen,
        onF8: handleTogglePiutang,
        onF9: handlePayment,
        onPageUp: handlePrintLast,
        inputRef
    });

    return (
        <>
            <Head title="Kasir - POS" />

            <div className="h-screen flex flex-col bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Menu Bar */}
                <KasirMenuBar userName={auth?.user?.name} />

                {/* Main Content - No Scroll */}
                <div className="flex-1 flex flex-col gap-1 sm:gap-2 p-1 sm:p-2 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg sm:rounded-xl shadow-2xl border border-slate-600 p-2 sm:p-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
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
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-inner"
                                    />
                                </div>
                            </div>

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

                    {/* Cart Section */}
                    <div className="flex-1 bg-slate-800 rounded-xl shadow-2xl border border-slate-600 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto flex-1" id="kasirScreen">
                            <CartTable
                                items={calculatedItems}
                                onQtyClick={handleEditQty}
                                onRowDoubleClick={handleDiskon}
                                onDeleteClick={handleDeleteItem}
                                formatNumber={formatNumber}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg sm:rounded-xl shadow-2xl border border-slate-600 p-2 sm:p-3">
                        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                            <ActionButtons
                                showResetButton={showResetButton}
                                isPiutang={isPiutang}
                                selectedItemsCount={selectedItems.length}
                                onReset={resetAll}
                                onPrintLast={handlePrintLast}
                                onDiskon={() => handleDiskon()}
                                onKomplemen={handleKomplemen}
                                onTogglePiutang={handleTogglePiutang}
                                onPayment={handlePayment}
                            />
                        </div>
                    </div>
                </div>
                {/* End Main Content */}
            </div>
            {/* End h-screen container */}

            {/* Modals */}
            <QtyEditModal
                show={showQtyModal}
                item={editingItem}
                qtyInput={qtyInput}
                qtyInputRef={qtyInputRef}
                onQtyChange={setQtyInput}
                onSave={handleSaveQty}
                onCancel={() => {
                    setShowQtyModal(false);
                    setEditingItem(null);
                    setQtyInput('');
                    inputRef.current?.focus();
                }}
            />

            <DiskonModal
                show={showDiskonModal}
                item={diskonItem}
                diskonInput={diskonInput}
                spvPin={spvPin}
                diskonInputRef={diskonInputRef}
                spvPinRef={spvPinRef}
                onDiskonChange={setDiskonInput}
                onSpvPinChange={setSpvPin}
                onSave={handleSaveDiskon}
                onCancel={() => {
                    setShowDiskonModal(false);
                    setDiskonItem(null);
                    setDiskonInput('');
                    setSpvPin('');
                    inputRef.current?.focus();
                }}
                formatNumber={formatNumber}
            />

            <KomplemenModal
                show={showKomplemenModal}
                items={items}
                komplemenSearch={komplemenSearch}
                spvPinKomplemen={spvPinKomplemen}
                spvPinKomplemenRef={spvPinKomplemenRef}
                onSearchChange={setKomplemenSearch}
                onSpvPinChange={setSpvPinKomplemen}
                onSelectItem={handleSelectKomplemen}
                onClose={() => {
                    setShowKomplemenModal(false);
                    setKomplemenSearch('');
                    setSpvPinKomplemen('');
                    inputRef.current?.focus();
                }}
            />

            <PaymentModal
                show={showPaymentModal}
                grandTotal={grandTotal}
                paymentTypes={paymentTypes}
                selectedPaymentType={selectedPaymentType}
                isPiutang={isPiutang}
                customerName={customerName}
                paymentAmount={paymentAmount}
                paymentInputRef={paymentInputRef}
                onPaymentTypeSelect={setSelectedPaymentType}
                onCustomerNameChange={setCustomerName}
                onPaymentAmountChange={setPaymentAmount}
                onSave={handleSavePayment}
                onCancel={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount('');
                    setCustomerName('');
                    inputRef.current?.focus();
                }}
                formatNumber={formatNumber}
            />

            {/* Session Expired Modal */}
            <SessionExpiredModal show={sessionExpired} />

            {/* Alert Modal */}
            <AlertModal
                show={showAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={handleAlertClose}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                show={showConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                onConfirm={handleConfirmYes}
                onCancel={handleConfirmNo}
            />

            {/* Loading Modal */}
            <LoadingModal
                show={isLoading}
                message={loadingMessage}
            />
        </>
    );
}
