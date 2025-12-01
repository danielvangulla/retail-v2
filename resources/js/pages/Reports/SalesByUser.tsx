import { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function SalesByUser({ title }: { title: string }) {
    const [fullSales, setFullSales] = useState<any[]>([]);
    const [piutangSales, setPiutangSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/sales-by-user');
            setFullSales(response.data.full);
            setPiutangSales(response.data.piutang);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    useState(() => {
        loadData();
    });

    const totalFull = fullSales.reduce((sum, item) => sum + (item.bayar || 0), 0);
    const totalPiutang = piutangSales.reduce((sum, item) => sum + (item.bayar || 0), 0);

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold mb-4">{title}</h1>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Full Payment Sales */}
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-green-700">Penjualan Cash/Payment</h2>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-green-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Barang</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {fullSales.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2">
                                                        <div className="font-medium">{item.barang?.deskripsi}</div>
                                                        <div className="text-sm text-gray-500">{item.barang?.barcode}</div>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">{item.qty}</td>
                                                    <td className="px-4 py-2 text-right font-semibold">
                                                        Rp {item.bayar?.toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-green-100 font-bold">
                                            <tr>
                                                <td className="px-4 py-3" colSpan={2}>Total</td>
                                                <td className="px-4 py-3 text-right">Rp {totalFull.toLocaleString('id-ID')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Piutang Sales */}
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-orange-700">Penjualan Piutang</h2>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-orange-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Barang</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {piutangSales.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2">
                                                        <div className="font-medium">{item.barang?.deskripsi}</div>
                                                        <div className="text-sm text-gray-500">{item.barang?.barcode}</div>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">{item.qty}</td>
                                                    <td className="px-4 py-2 text-right font-semibold">
                                                        Rp {item.bayar?.toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-orange-100 font-bold">
                                            <tr>
                                                <td className="px-4 py-3" colSpan={2}>Total</td>
                                                <td className="px-4 py-3 text-right">Rp {totalPiutang.toLocaleString('id-ID')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold">Grand Total:</span>
                                <span className="text-3xl font-bold text-blue-700">
                                    Rp {(totalFull + totalPiutang).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
