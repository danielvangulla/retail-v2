import { useEffect, RefObject } from 'react';
import { BarangItem } from '@/components/kasir/types';

interface DiskonModalProps {
    show: boolean;
    item: BarangItem | null;
    diskonInput: string;
    spvPin: string;
    diskonInputRef: RefObject<HTMLInputElement | null>;
    spvPinRef: RefObject<HTMLInputElement | null>;
    onDiskonChange: (value: string) => void;
    onSpvPinChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    formatNumber: (num: number) => string;
}

export default function DiskonModal({
    show,
    item,
    diskonInput,
    spvPin,
    diskonInputRef,
    spvPinRef,
    onDiskonChange,
    onSpvPinChange,
    onSave,
    onCancel,
    formatNumber,
}: DiskonModalProps) {
    useEffect(() => {
        if (show) {
            setTimeout(() => diskonInputRef.current?.focus(), 100);
        }
    }, [show, diskonInputRef]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Input Diskon Supervisor</h3>
                <div className="mb-4">
                    <p className="text-slate-300 text-sm mb-2">{item?.deskripsi}</p>
                    <p className="text-slate-400 text-xs mb-3">Harga: Rp {formatNumber(item?.hargaJual || 0)}</p>

                    <label className="block text-slate-300 text-sm mb-2">Jumlah Diskon (Rp)</label>
                    <input
                        ref={diskonInputRef}
                        type="number"
                        inputMode="numeric"
                        value={diskonInput}
                        onChange={(e) => onDiskonChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-xl sm:text-2xl text-center font-bold
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                        placeholder="0"
                    />

                    <label className="block text-slate-300 text-sm mb-2">PIN Supervisor</label>
                    <input
                        ref={spvPinRef}
                        type="password"
                        inputMode="numeric"
                        value={spvPin}
                        onChange={(e) => onSpvPinChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                onSave();
                            }
                        }}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-center
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan PIN SPV"
                    />
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
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}
