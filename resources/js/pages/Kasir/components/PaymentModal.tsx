import { useEffect, useRef, RefObject } from 'react';
import { PaymentType } from '@/components/kasir/types';

export interface PaymentLine {
    type: PaymentType | null;
    amount: string;
}

interface PaymentModalProps {
    show: boolean;
    grandTotal: number;
    paymentTypes: PaymentType[];
    isPiutang: boolean;
    customerName: string;
    paymentLines: PaymentLine[];
    paymentInputRef: RefObject<HTMLInputElement | null>;
    onPaymentLinesChange: (lines: PaymentLine[]) => void;
    onCustomerNameChange: (value: string) => void;
    onSave: () => void;
    onSavePending: () => void;
    onCancel: () => void;
    formatNumber: (num: number) => string;
}

export default function PaymentModal({
    show,
    grandTotal,
    paymentTypes,
    isPiutang,
    customerName,
    paymentLines,
    paymentInputRef,
    onPaymentLinesChange,
    onCustomerNameChange,
    onSave,
    onSavePending,
    onCancel,
    formatNumber,
}: PaymentModalProps) {
    const firstAmountRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (show) {
            setTimeout(() => firstAmountRef.current?.focus(), 100);
        }
    }, [show]);

    if (!show) return null;

    const totalDibayar = paymentLines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
    const kembalian = totalDibayar - grandTotal;
    const kurang = grandTotal - totalDibayar;
    const isValid =
        totalDibayar >= grandTotal &&
        paymentLines.length > 0 &&
        paymentLines.every((l) => l.type !== null && parseFloat(l.amount || '0') > 0);

    const updateLine = (index: number, field: keyof PaymentLine, value: string | PaymentType | null) => {
        const updated = paymentLines.map((l, i) => (i === index ? { ...l, [field]: value } : l));
        onPaymentLinesChange(updated);
    };

    const addLine = () => {
        const remaining = Math.max(0, grandTotal - totalDibayar);
        onPaymentLinesChange([
            ...paymentLines,
            { type: paymentTypes[0] ?? null, amount: remaining > 0 ? String(remaining) : '' },
        ]);
    };

    const removeLine = (index: number) => {
        if (paymentLines.length <= 1) return;
        onPaymentLinesChange(paymentLines.filter((_, i) => i !== index));
    };

    const setExactAmount = (index: number = 0) => {
        const paid = paymentLines.reduce((s, l, i) => (i !== index ? s + (parseFloat(l.amount) || 0) : s), 0);
        const sisa = Math.max(0, grandTotal - paid);
        updateLine(index, 'amount', String(sisa));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-5 w-full max-w-lg max-h-[95vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-3">Pembayaran</h3>

                {/* Grand Total */}
                <div className="bg-linear-to-br from-blue-600 to-blue-500 rounded-lg p-3 mb-4">
                    <div className="text-blue-100 text-xs">Total Tagihan</div>
                    <div className="text-white text-2xl sm:text-3xl font-bold">Rp {formatNumber(grandTotal)}</div>
                </div>

                {/* Customer Name (for Piutang) */}
                {isPiutang && (
                    <div className="mb-4">
                        <label className="block text-slate-300 text-sm mb-1">Nama Customer</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => onCustomerNameChange(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nama customer..."
                        />
                    </div>
                )}

                {/* Payment Lines */}
                <div className="mb-3 space-y-2">
                    <label className="block text-slate-300 text-sm mb-1 font-medium">Metode Pembayaran</label>
                    {paymentLines.map((line, index) => (
                        <div key={index} className="bg-slate-700/60 border border-slate-600 rounded-lg p-3">
                            {/* Type selector buttons */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {paymentTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => updateLine(index, 'type', type)}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                                            line.type?.id === type.id
                                                ? 'bg-blue-600 text-white ring-1 ring-blue-400'
                                                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                        }`}
                                    >
                                        {type.ket}
                                    </button>
                                ))}
                            </div>

                            {/* Amount row */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                                    <input
                                        ref={index === 0 ? firstAmountRef : undefined}
                                        type="number"
                                        inputMode="numeric"
                                        value={line.amount}
                                        onChange={(e) => updateLine(index, 'amount', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (isValid) onSave();
                                            }
                                        }}
                                        className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-500 rounded-lg text-white text-lg font-bold text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                                {paymentLines.length > 1 && (
                                    <button
                                        onClick={() => removeLine(index)}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer shrink-0"
                                        title="Hapus"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Quick presets */}
                            <div className="flex gap-1 mt-2 flex-wrap">
                                <button
                                    onClick={() => setExactAmount(index)}
                                    className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded text-xs cursor-pointer"
                                >
                                    Pas
                                </button>
                                {index === 0 &&
                                    [50000, 100000, 200000].map((a) => (
                                        <button
                                            key={a}
                                            onClick={() => updateLine(0, 'amount', String(a))}
                                            className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs cursor-pointer"
                                        >
                                            {formatNumber(a)}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Payment Line */}
                <button
                    onClick={addLine}
                    className="w-full mb-4 py-2 border border-dashed border-slate-500 text-slate-400 hover:text-white hover:border-blue-500 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Metode Bayar
                </button>

                {/* Summary */}
                <div className="bg-slate-700/40 rounded-lg p-3 mb-4 space-y-1 text-sm">
                    <div className="flex justify-between text-slate-300">
                        <span>Total Tagihan</span>
                        <span className="font-semibold">Rp {formatNumber(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                        <span>Total Dibayar</span>
                        <span className={`font-semibold ${totalDibayar >= grandTotal ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            Rp {formatNumber(totalDibayar)}
                        </span>
                    </div>
                    {totalDibayar >= grandTotal ? (
                        <div className="flex justify-between font-bold border-t border-slate-600 pt-1 mt-1">
                            <span className="text-emerald-300">Kembalian</span>
                            <span className="text-emerald-300">Rp {formatNumber(kembalian)}</span>
                        </div>
                    ) : (
                        <div className="flex justify-between font-bold border-t border-slate-600 pt-1 mt-1">
                            <span className="text-yellow-300">Kurang</span>
                            <span className="text-yellow-300">Rp {formatNumber(kurang)}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={onCancel}
                        className="flex-1 min-w-[70px] px-3 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onSavePending}
                        className="flex-1 min-w-[90px] px-3 py-2.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Cetak struk, bayar nanti saat customer kembali"
                    >
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Bayar Nanti
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!isValid}
                        className="flex-1 min-w-[70px] px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Proses
                    </button>
                </div>
            </div>
        </div>
    );
}
