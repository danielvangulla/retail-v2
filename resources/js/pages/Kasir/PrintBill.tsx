import { Head } from '@inertiajs/react';

interface Transaction {
    id: string;
    payments: any[];
    details: any[];
    piutang?: any;
    komplemen?: any;
    brutto: number;
    disc_spv: number;
    disc_promo: number;
    netto: number;
    tax: number;
    service: number;
    bayar: number;
    payment: number;
    kembali: number;
}

interface Setup {
    perusahaan: string;
    alamat1: string;
    alamat2: string;
}

interface Props {
    trx: Transaction;
    setup: Setup;
}

export default function PrintBill({ trx, setup }: Props) {
    return (
        <>
            <Head title="Print Bill" />

            <div className="min-h-screen bg-white p-8">
                <div className="max-w-md mx-auto border-2 border-dashed border-gray-800 p-6 font-mono text-sm">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold mb-2">{setup.perusahaan}</h1>
                        <p>{setup.alamat1}</p>
                        <p>{setup.alamat2}</p>
                        <div className="border-t-2 border-dashed border-gray-800 my-4"></div>
                    </div>

                    {/* Transaction Details */}
                    <div className="mb-4">
                        <div className="flex justify-between">
                            <span>ID Transaksi:</span>
                            <span className="font-bold">{trx.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal:</span>
                            <span>{new Date().toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-800 my-4"></div>

                    {/* Items */}
                    <table className="w-full mb-4">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left py-2">Item</th>
                                <th className="text-center py-2">Qty</th>
                                <th className="text-right py-2">Harga</th>
                                <th className="text-right py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trx.details?.map((detail, index) => (
                                <tr key={index} className="border-b border-gray-300">
                                    <td className="py-2">{detail.barang?.deskripsi || '-'}</td>
                                    <td className="text-center">{detail.qty}</td>
                                    <td className="text-right">{detail.harga?.toLocaleString('id-ID')}</td>
                                    <td className="text-right font-bold">{detail.bayar?.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t-2 border-dashed border-gray-800 my-4"></div>

                    {/* Summary */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>Rp {trx.brutto?.toLocaleString('id-ID')}</span>
                        </div>
                        {trx.disc_spv > 0 && (
                            <div className="flex justify-between">
                                <span>Disc. SPV:</span>
                                <span>- Rp {trx.disc_spv?.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        {trx.disc_promo > 0 && (
                            <div className="flex justify-between">
                                <span>Disc. Promo:</span>
                                <span>- Rp {trx.disc_promo?.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Netto:</span>
                            <span>Rp {trx.netto?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>PPN:</span>
                            <span>Rp {trx.tax?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Service:</span>
                            <span>Rp {trx.service?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="border-t-2 border-gray-800 pt-2 flex justify-between font-bold text-lg">
                            <span>TOTAL:</span>
                            <span>Rp {trx.bayar?.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-800 my-4"></div>

                    {/* Payment */}
                    <div className="space-y-2 mb-4">
                        {trx.payments?.map((payment, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{payment.type?.ket || 'Pembayaran'}:</span>
                                <span>Rp {payment.nominal?.toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold">
                            <span>Total Bayar:</span>
                            <span>Rp {trx.payment?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Kembali:</span>
                            <span>Rp {trx.kembali?.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="border-t-2 border-dashed border-gray-800 my-4"></div>

                    {/* Footer */}
                    <div className="text-center">
                        <p className="font-bold">Terima Kasih</p>
                        <p>Atas Kunjungan Anda</p>
                    </div>
                </div>

                {/* Print Button */}
                <div className="text-center mt-6 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Print Struk
                    </button>
                    <button
                        onClick={() => window.close()}
                        className="ml-4 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </>
    );
}
