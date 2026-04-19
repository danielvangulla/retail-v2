import { useState } from 'react';
import { LogIn } from 'lucide-react';

interface OpenShiftModalProps {
    show: boolean;
    onConfirm: (saldoAwal: number) => void;
}

export default function OpenShiftModal({ show, onConfirm }: OpenShiftModalProps) {
    const [saldo, setSaldo] = useState('');
    const [loading, setLoading] = useState(false);

    if (!show) return null;

    const handleSubmit = () => {
        const val = parseFloat(saldo.replace(/\./g, '').replace(',', '.')) || 0;
        setLoading(true);
        onConfirm(val);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-slate-600 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-11/12 sm:w-full">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-500/20 rounded-full p-4">
                        <LogIn className="h-10 w-10 text-green-400" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white text-center mb-1">Buka Shift</h2>
                <p className="text-slate-400 text-sm text-center mb-5">Masukkan saldo kas awal untuk shift ini</p>

                <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-medium mb-1">Saldo Kas Awal (Rp)</label>
                    <input
                        type="number"
                        min="0"
                        value={saldo}
                        onChange={(e) => setSaldo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                        autoFocus
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
                >
                    {loading ? 'Membuka...' : '✓ Buka Shift'}
                </button>
            </div>
        </div>
    );
}
