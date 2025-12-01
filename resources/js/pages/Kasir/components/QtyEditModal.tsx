import { useEffect, RefObject } from 'react';
import { BarangItem } from '@/components/kasir/types';

interface QtyEditModalProps {
    show: boolean;
    item: BarangItem | null;
    qtyInput: string;
    qtyInputRef: RefObject<HTMLInputElement | null>;
    onQtyChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function QtyEditModal({
    show,
    item,
    qtyInput,
    qtyInputRef,
    onQtyChange,
    onSave,
    onCancel,
}: QtyEditModalProps) {
    useEffect(() => {
        if (show) {
            setTimeout(() => qtyInputRef.current?.focus(), 100);
        }
    }, [show, qtyInputRef]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Edit Quantity</h3>
                <div className="mb-4">
                    <p className="text-slate-300 text-sm mb-2">{item?.deskripsi}</p>
                    <input
                        ref={qtyInputRef}
                        type="number"
                        inputMode="numeric"
                        value={qtyInput}
                        onChange={(e) => onQtyChange(e.target.value)}
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
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onSave}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}
