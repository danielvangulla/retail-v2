import { useEffect, RefObject } from 'react';
import { PaymentType } from '@/components/kasir/types';

interface PaymentModalProps {
    show: boolean;
    grandTotal: number;
    paymentTypes: PaymentType[];
    selectedPaymentType: PaymentType | null;
    isPiutang: boolean;
    customerName: string;
    paymentAmount: string;
    paymentInputRef: RefObject<HTMLInputElement | null>;
    onPaymentTypeSelect: (type: PaymentType) => void;
    onCustomerNameChange: (value: string) => void;
    onPaymentAmountChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    formatNumber: (num: number) => string;
}

export default function PaymentModal({
    show,
    grandTotal,
    paymentTypes,
    selectedPaymentType,
    isPiutang,
    customerName,
    paymentAmount,
    paymentInputRef,
    onPaymentTypeSelect,
    onCustomerNameChange,
    onPaymentAmountChange,
    onSave,
    onCancel,
    formatNumber,
}: PaymentModalProps) {
    useEffect(() => {
        if (show) {
            setTimeout(() => paymentInputRef.current?.focus(), 100);
        }
    }, [show, paymentInputRef]);

    if (!show) return null;

    return (
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
                                onClick={() => onPaymentTypeSelect(type)}
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
                            onChange={(e) => onCustomerNameChange(e.target.value)}
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
                        onChange={(e) => onPaymentAmountChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSave();
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
                            onClick={() => onPaymentAmountChange(String(amount))}
                            className="px-2 sm:px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs sm:text-sm font-medium cursor-pointer"
                        >
                            {formatNumber(amount)}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                        Proses
                    </button>
                </div>
            </div>
        </div>
    );
}
