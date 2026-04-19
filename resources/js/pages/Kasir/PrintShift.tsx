import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface Shift {
    id: string;
    open_time: string;
    close_time: string | null;
    saldo_awal: string;
    saldo_akhir: string;
    total_penjualan: string;
    total_tunai: string;
    total_nontunai: string;
    jumlah_transaksi: number;
    keterangan: string | null;
    kasir: { name: string };
}

interface Summary {
    jumlah_transaksi: number;
    total_penjualan: number;
    by_payment_type: Record<string, number>;
}

interface Setup {
    nama: string;
    alamat1: string;
    alamat2: string;
}

interface Props {
    shift: Shift;
    setup: Setup;
    summary: Summary;
}

function fmt(n: number | string) {
    return Number(n).toLocaleString('id-ID');
}

function fmtDatetime(d: string | null) {
    if (!d) return '-';
    return new Date(d).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PrintShift({ shift, setup, summary }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => window.print(), 500);
        return () => clearTimeout(timer);
    }, []);

    const saldoAwal = Number(shift.saldo_awal);
    const totalTunai = Number(shift.total_tunai);
    const saldoAkhir = Number(shift.saldo_akhir);
    const selisih = saldoAkhir - (saldoAwal + totalTunai);

    return (
        <>
            <Head title="Close Shift" />

            <style>{`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body { margin: 0; }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* Print button (hidden on print) */}
            <div className="no-print fixed top-4 right-4 flex gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow"
                >
                    🖨️ Cetak
                </button>
                <button
                    onClick={() => window.close()}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow"
                >
                    ✕ Tutup
                </button>
            </div>

            <div className="flex justify-center min-h-screen bg-gray-100 py-8 print:p-0 print:bg-white">
                <div className="w-[80mm] p-[3mm] bg-white text-black font-mono text-[11px] leading-tight">

                    {/* Header */}
                    <div className="text-center font-bold text-sm mb-0.5">{setup.nama}</div>
                    <div className="text-center text-[10px]">{setup.alamat1}</div>
                    <div className="text-center text-[10px] mb-1">{setup.alamat2}</div>

                    <div className="border-t border-black my-1"></div>

                    <div className="text-center font-bold text-sm mb-1">LAPORAN CLOSE SHIFT</div>

                    <div className="border-t border-dashed border-black my-1"></div>

                    {/* Info Shift */}
                    <div className="space-y-0.5 text-[10px] mb-1">
                        <div className="flex justify-between">
                            <span>Kasir</span>
                            <span className="font-bold">{shift.kasir?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Buka Shift</span>
                            <span>{fmtDatetime(shift.open_time)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tutup Shift</span>
                            <span>{fmtDatetime(shift.close_time)}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-black my-1"></div>

                    {/* Ringkasan Penjualan */}
                    <div className="text-center font-bold text-[10px] mb-0.5">RINGKASAN PENJUALAN</div>
                    <div className="space-y-0.5 text-[10px] mb-1">
                        <div className="flex justify-between">
                            <span>Jumlah Transaksi</span>
                            <span className="font-bold">{summary.jumlah_transaksi}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Penjualan</span>
                            <span className="font-bold">Rp {fmt(shift.total_penjualan)}</span>
                        </div>
                    </div>

                    {/* By payment type */}
                    {Object.keys(summary.by_payment_type).length > 0 && (
                        <>
                            <div className="text-[10px] font-bold mt-0.5 mb-0.5">Per Jenis Pembayaran:</div>
                            {Object.entries(summary.by_payment_type).map(([type, amount]) => (
                                <div key={type} className="flex justify-between text-[10px] pl-1">
                                    <span>{type}</span>
                                    <span>Rp {fmt(amount)}</span>
                                </div>
                            ))}
                        </>
                    )}

                    <div className="border-t border-dashed border-black my-1"></div>

                    {/* Kas */}
                    <div className="text-center font-bold text-[10px] mb-0.5">POSISI KAS</div>
                    <div className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between">
                            <span>Saldo Awal</span>
                            <span>Rp {fmt(saldoAwal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>+ Tunai Masuk</span>
                            <span>Rp {fmt(totalTunai)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-dashed border-black pt-0.5 mt-0.5">
                            <span>Saldo Akhir (sistem)</span>
                            <span>Rp {fmt(saldoAwal + totalTunai)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Saldo Akhir (aktual)</span>
                            <span>Rp {fmt(saldoAkhir)}</span>
                        </div>
                        <div className={`flex justify-between font-bold ${selisih !== 0 ? 'text-red-700' : ''}`}>
                            <span>Selisih</span>
                            <span>{selisih >= 0 ? '+' : ''}Rp {fmt(selisih)}</span>
                        </div>
                    </div>

                    {shift.keterangan && (
                        <>
                            <div className="border-t border-dashed border-black my-1"></div>
                            <div className="text-[10px]">
                                <div className="font-bold">Keterangan:</div>
                                <div>{shift.keterangan}</div>
                            </div>
                        </>
                    )}

                    <div className="border-t border-black my-1"></div>
                    <div className="text-center text-[10px]">Terima Kasih</div>
                    <div className="text-center text-[10px]">{fmtDatetime(new Date().toISOString())}</div>
                </div>
            </div>
        </>
    );
}
