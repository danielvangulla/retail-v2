import { useState, useRef, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import { PaymentType } from '@/components/kasir/types';
import { PaymentLine } from './PaymentModal';
import { formatDigit, formatTgl, formatTime } from '@/lib/formatters';

interface PendingTrxDetail {
    sku: string;
    qty: number;
    harga: number;
    brutto: number;
    barang?: { deskripsi?: string; alias?: string };
}

interface PendingTrx {
    id: string;
    tgl: string;
    created_at: string;
    bayar: number;
    details: PendingTrxDetail[];
    kasir?: { name: string };
}

interface PendingPaymentModalProps {
    show: boolean;
    paymentTypes: PaymentType[];
    onSuccess: (trxId: string, kembali: number) => void;
    onClose: () => void;
    formatNumber: (num: number) => string;
}

export default function PendingPaymentModal({
    show,
    paymentTypes,
    onSuccess,
    onClose,
    formatNumber,
}: PendingPaymentModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingTrx, setPendingTrx] = useState<PendingTrx | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([]);
    const [processError, setProcessError] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (show) {
            setSearchQuery('');
            setPendingTrx(null);
            setSearchError('');
            setPaymentLines([]);
            setProcessError('');
            setTimeout(() => searchRef.current?.focus(), 100);
        }
    }, [show]);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 4) return;
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            searchPending(searchQuery);
        }, 400);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchQuery]);

    const searchPending = useCallback(
        async (q: string) => {
            setIsSearching(true);
            setSearchError('');
            setPendingTrx(null);
            setPaymentLines([]);
            try {
                const res = await axios.post('/get-pending-transaction', { q });
                if (res.data.status === 'ok') {
                    const trx: PendingTrx = res.data.data;
                    setPendingTrx(trx);
                    setPaymentLines([{ type: paymentTypes[0] ?? null, amount: String(trx.bayar) }]);
                } else {
                    setSearchError(res.data.msg || 'Transaksi tidak ditemukan');
                }
            } catch (err: any) {
                setSearchError(err.response?.data?.msg || 'Transaksi pending tidak ditemukan');
            } finally {
                setIsSearching(false);
            }
        },
        [paymentTypes],
    );

    const totalDibayar = paymentLines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
    const kembalian = pendingTrx ? Math.max(0, totalDibayar - pendingTrx.bayar) : 0;
    const kurang = pendingTrx ? Math.max(0, pendingTrx.bayar - totalDibayar) : 0;
    const isPayValid =
        pendingTrx !== null &&
        totalDibayar >= pendingTrx.bayar &&
        paymentLines.every((l) => l.type !== null && parseFloat(l.amount || '0') > 0);

    const updateLine = (index: number, field: keyof PaymentLine, value: string | PaymentType | null) => {
        setPaymentLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
    };

    const addLine = () => {
        const remaining = Math.max(0, (pendingTrx?.bayar ?? 0) - totalDibayar);
        setPaymentLines((prev) => [
            ...prev,
            { type: paymentTypes[0] ?? null, amount: remaining > 0 ? String(remaining) : '' },
        ]);
    };

    const removeLine = (index: number) => {
        if (paymentLines.length <= 1) return;
        setPaymentLines((prev) => prev.filter((_, i) => i !== index));
    };

    const setExactAmount = (index: number) => {
        const paid = paymentLines.reduce((s, l, i) => (i !== index ? s + (parseFloat(l.amount) || 0) : s), 0);
        updateLine(index, 'amount', String(Math.max(0, (pendingTrx?.bayar ?? 0) - paid)));
    };

    const handleProcess = async () => {
        if (!pendingTrx || !isPayValid) return;
        setIsProcessing(true);
        setProcessError('');
        try {
            const res = await axios.post('/bayar-pending', {
                trxId: pendingTrx.id,
                payments: paymentLines.map((l) => ({ type_id: l.type!.id, nominal: parseFloat(l.amount) })),
                totalBayar: totalDibayar,
            });
            if (res.data.status === 'ok') {
                onSuccess(pendingTrx.id, kembalian);
            } else {
                setProcessError(res.data.msg || 'Gagal memproses pembayaran');
            }
        } catch (err: any) {
            setProcessError(err.response?.data?.msg || 'Gagal memproses pembayaran');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between bg-amber-600/20 border-b border-slate-600 px-5 py-4 rounded-t-xl">
                    <div>
                        <h3 className="text-lg font-bold text-white">Bayar Transaksi Pending</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Scan atau ketik kode transaksi dari struk</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Search */}
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">Kode Transaksi</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (searchTimeout.current) clearTimeout(searchTimeout.current);
                                        if (searchQuery.length >= 4) searchPending(searchQuery);
                                    }
                                    if (e.key === 'Escape') {
                                        e.preventDefault();
                                        onClose();
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-500 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Scan barcode struk atau ketik kode..."
                            />
                            {isSearching && (
                                <div className="absolute inset-y-0 right-3 flex items-center">
                                    <div className="animate-spin h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                        {searchError && <p className="text-red-400 text-xs mt-1">{searchError}</p>}
                    </div>

                    {/* Transaction Detail + Payment */}
                    {pendingTrx && (
                        <>
                            <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded">PENDING</span>
                                    <span className="text-slate-400 text-xs font-mono">{pendingTrx.id.substring(0, 18)}…</span>
                                </div>
                                <div className="text-xs text-slate-400 mb-3">
                                    {formatTgl(pendingTrx.created_at)} {formatTime(pendingTrx.created_at)} | Kasir:{' '}
                                    {pendingTrx.kasir?.name ?? '-'}
                                </div>
                                <div className="space-y-1 max-h-36 overflow-y-auto mb-3">
                                    {pendingTrx.details.map((d, i) => (
                                        <div key={i} className="flex justify-between text-xs text-slate-300">
                                            <span className="truncate max-w-[55%]">
                                                {d.barang?.deskripsi || d.barang?.alias || d.sku}
                                            </span>
                                            <span className="text-slate-400">
                                                {d.qty} x {formatDigit(d.harga)}
                                            </span>
                                            <span className="font-semibold">{formatDigit(d.brutto)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-amber-500/30 pt-2 flex justify-between items-center">
                                    <span className="text-slate-300 text-sm">Total Tagihan</span>
                                    <span className="text-white text-lg font-bold">Rp {formatNumber(pendingTrx.bayar)}</span>
                                </div>
                            </div>

                            {/* Payment Lines */}
                            <div className="space-y-2">
                                <label className="block text-slate-300 text-sm font-medium">Metode Pembayaran</label>
                                {paymentLines.map((line, index) => (
                                    <div key={index} className="bg-slate-700/60 border border-slate-600 rounded-lg p-3">
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {paymentTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => updateLine(index, 'type', type)}
                                                    className={
                                                        'px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all ' +
                                                        (line.type?.id === type.id
                                                            ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                                                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500')
                                                    }
                                                >
                                                    {type.ket}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={line.amount}
                                                    onChange={(e) => updateLine(index, 'amount', e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && isPayValid) handleProcess();
                                                    }}
                                                    className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white text-lg font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                            {paymentLines.length > 1 && (
                                                <button
                                                    onClick={() => removeLine(index)}
                                                    className="p-2 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer"
                                                >
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex gap-1 mt-2">
                                            <button
                                                onClick={() => setExactAmount(index)}
                                                className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded text-xs cursor-pointer"
                                            >
                                                Pas
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addLine}
                                    className="w-full py-2 border border-dashed border-slate-500 text-slate-400 hover:text-white hover:border-blue-500 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Tambah Metode Bayar
                                </button>
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-700/40 rounded-lg p-3 text-sm space-y-1">
                                <div className="flex justify-between text-slate-300">
                                    <span>Total Tagihan</span>
                                    <span className="font-semibold">Rp {formatNumber(pendingTrx.bayar)}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Total Dibayar</span>
                                    <span
                                        className={
                                            'font-semibold ' +
                                            (totalDibayar >= pendingTrx.bayar ? 'text-emerald-400' : 'text-yellow-400')
                                        }
                                    >
                                        Rp {formatNumber(totalDibayar)}
                                    </span>
                                </div>
                                {totalDibayar >= pendingTrx.bayar ? (
                                    <div className="flex justify-between font-bold border-t border-slate-600 pt-1">
                                        <span className="text-emerald-300">Kembalian</span>
                                        <span className="text-emerald-300">Rp {formatNumber(kembalian)}</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between font-bold border-t border-slate-600 pt-1">
                                        <span className="text-yellow-300">Kurang</span>
                                        <span className="text-yellow-300">Rp {formatNumber(kurang)}</span>
                                    </div>
                                )}
                            </div>

                            {processError && (
                                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 text-red-300 text-sm">
                                    {processError}
                                </div>
                            )}

                            <button
                                onClick={handleProcess}
                                disabled={!isPayValid || isProcessing}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Lunasi Pembayaran
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {!pendingTrx && !isSearching && !searchError && (
                        <div className="text-center py-8 text-slate-500">
                            <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01"
                                />
                            </svg>
                            <p className="text-sm">Scan barcode struk atau ketik kode transaksi</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
