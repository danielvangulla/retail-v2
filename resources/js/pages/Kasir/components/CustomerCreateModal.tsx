import { useState, useRef, useEffect } from 'react';
import axios from '@/lib/axios';
import type { CustomerOption } from './CustomerSelect';

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: (customer: CustomerOption) => void;
}

export default function CustomerCreateModal({ show, onClose, onSuccess }: Props) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (show) {
            setName('');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [show]);

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Nama customer wajib diisi.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            const res = await axios.post('/customer-store', { name: trimmed });
            if (res.data.status === 'ok') {
                const d = res.data.data;
                onSuccess({ value: d.id, label: d.name, is_staff: d.is_staff });
                onClose();
            } else {
                setError(res.data.msg ?? 'Gagal menyimpan customer.');
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.errors?.name?.[0] ||
                err?.response?.data?.msg ||
                'Gagal menyimpan customer.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-5 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">Tambah Customer Baru</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded cursor-pointer"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 text-sm mb-1.5 font-medium">
                        Nama Customer <span className="text-red-400">*</span>
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        maxLength={100}
                        placeholder="Masukkan nama customer..."
                        className={`w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            error ? 'border-red-500' : 'border-slate-600'
                        }`}
                    />
                    {error && <p className="mt-1.5 text-red-400 text-xs">{error}</p>}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading || !name.trim()}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
