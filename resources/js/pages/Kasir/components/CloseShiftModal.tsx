import { useState, useEffect } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';

interface Shift {
    id: string;
    open_time: string;
    saldo_awal: string;
}

interface Summary {
    jumlah_transaksi: number;
    total_penjualan: number;
    by_payment_type: Record<string, number>;
}

interface CloseShiftModalProps {
    show: boolean;
    shift: Shift | null;
    onClose: () => void;
    onConfirm: (saldoAkhir: number, keterangan: string) => void;
}

function fmt(n: number | string) {
    return Number(n).toLocaleString('id-ID');
}

function fmtDatetime(d: string) {
    return new Date(d).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function CloseShiftModal({ show, shift, onClose, onConfirm }: CloseShiftModalProps) {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [saldoAkhir, setSaldoAkhir] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    useEffect(() => {
        if (show && shift) {
            setSummaryLoading(true);
            axios.get('/shift/summary')
                .then((res) => setSummary(res.data.summary))
                .finally(() => setSummaryLoading(false));
        }
    }, [show, shift]);

    if (!show || !shift) return null;

    const handleConfirm = () => {
        const val = parseFloat(saldoAkhir.replace(/\./g, '').replace(',', '.')) || 0;
        setLoading(true);
        onConfirm(val, keterangan);
    };

    const totalTunai = summary?.by_payment_type
        ? Object.entries(summary.by_payment_type)
            .filter(([k]) => k.toLowerCase().includes('tunai') || k.toLowerCase().includes('cash'))
            .reduce((a, [, v]) => a + v, 0)
        : 0;

    const expectedSaldo = Number(shift.saldo_awal) + totalTunai;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-slate-600 rounded-2xl shadow-2xl p-5 max-w-sm w-11/12 sm:w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-center mb-3">
                    <div className="bg-orange-500/20 rounded-full p-3">
                        <LogOut className="h-8 w-8 text-orange-400" />
                    </div>
                </div>

                <h2 className="text-lg font-bold text-white text-center mb-1">Tutup Shift</h2>
                <p className="text-slate-400 text-xs text-center mb-3">
                    Dibuka: {fmtDatetime(shift.open_time)}
                </p>

                {summaryLoading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                    </div>
                ) : summary && (
                    <div className="bg-slate-700/50 rounded-xl p-3 mb-3 space-y-1 text-sm">
                        <div className="flex justify-between text-slate-300">
                            <span>Jumlah Transaksi</span>
                            <span className="font-bold text-white">{summary.jumlah_transaksi}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                            <span>Total Penjualan</span>
                            <span className="font-bold text-white">Rp {fmt(summary.total_penjualan)}</span>
                        </div>
                        {Object.entries(summary.by_payment_type).map(([type, amount]) => (
                            <div key={type} className="flex justify-between text-slate-400 text-xs pl-2">
                                <span>{type}</span>
                                <span>Rp {fmt(amount)}</span>
                            </div>
                        ))}
                        <div className="border-t border-slate-600 pt-1 flex justify-between text-slate-300">
                            <span>Saldo Awal</span>
                            <span>Rp {fmt(shift.saldo_awal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                            <span>Ekspektasi Kas</span>
                            <span className="text-green-400 font-bold">Rp {fmt(expectedSaldo)}</span>
                        </div>
                    </div>
                )}

                <div className="mb-3">
                    <label className="block text-slate-300 text-xs font-medium mb-1">Saldo Kas Aktual (Rp)</label>
                    <input
                        type="number"
                        min="0"
                        value={saldoAkhir}
                        onChange={(e) => setSaldoAkhir(e.target.value)}
                        placeholder={String(Math.round(expectedSaldo))}
                        className="w-full px-4 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-right"
                        autoFocus
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-slate-300 text-xs font-medium mb-1">Keterangan (opsional)</label>
                    <textarea
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                        placeholder="Catatan shift..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-slate-600 hover:bg-slate-500 transition disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Menutup...' : 'Tutup Shift'}
                    </button>
                </div>
            </div>
        </div>
    );
}
