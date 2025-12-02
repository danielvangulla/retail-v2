import { Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { formatTgl, formatDateTime, formatDigit } from '../../../lib/formatters';
import AdminLayout from '../Layout';

interface ReturDetail {
    id: string;
    qty: number;
    volume: string;
    harga_beli: number;
    total: number;
    barang: {
        deskripsi: string;
        sku: string;
    };
}

interface ReturShowProps {
    data: {
        id: string;
        ket: string;
        created_at: string;
        user: {
            name: string;
        };
        details: ReturDetail[];
    };
}

export default function ReturShowNew({ data }: ReturShowProps) {
    const handlePrint = () => {
        const width = 900;
        const height = 1200;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(`/admin/retur/${data.id}/print`, '_blank', `width=${width},height=${height},left=${left},top=${top}`);
    };

    const grandTotal = data.details.reduce((sum, item) => sum + item.total, 0);

    return (
        <AdminLayout title="Detail Retur">
            <div className="max-w-4xl">
                {/* Print Button */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                    >
                        <Printer size={20} />
                        Print
                    </button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm border border-white/60 p-6">
                        <div className="text-sm text-gray-600 mb-1">Tanggal Retur</div>
                        <div className="text-2xl font-bold text-blue-600">{formatTgl(data.created_at)}</div>
                    </div>
                    <div className="bg-linear-to-br from-purple-100 to-purple-50 rounded-xl shadow-sm border border-white/60 p-6">
                        <div className="text-sm text-gray-600 mb-1">Input Oleh</div>
                        <div className="text-2xl font-bold text-purple-600">{data.user.name}</div>
                    </div>
                    <div className="bg-linear-to-br from-pink-100 to-pink-50 rounded-xl shadow-sm border border-white/60 p-6">
                        <div className="text-sm text-gray-600 mb-1">Waktu Input</div>
                        <div className="text-sm font-bold text-pink-600">{formatDateTime(data.created_at)}</div>
                    </div>
                </div>

                {/* Keterangan */}
                {data.ket && (
                    <div className="bg-white rounded-xl shadow-sm border border-white/60 p-6 mb-6">
                        <div className="text-sm font-600 text-gray-700 mb-2">Keterangan</div>
                        <div className="text-gray-900">{data.ket}</div>
                    </div>
                )}

                {/* Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-white/60 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-linear-to-r from-blue-100 to-blue-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">No</th>
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">Barang</th>
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">SKU</th>
                                <th className="px-6 py-3 text-center text-sm font-600 text-gray-700">Qty</th>
                                <th className="px-6 py-3 text-left text-sm font-600 text-gray-700">Satuan</th>
                                <th className="px-6 py-3 text-right text-sm font-600 text-gray-700">Harga</th>
                                <th className="px-6 py-3 text-right text-sm font-600 text-gray-700">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {data.details.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-600 text-gray-900">{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{item.barang.deskripsi}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{item.barang.sku}</td>
                                    <td className="px-6 py-4 text-sm text-center text-gray-900 font-600">{item.qty}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{item.volume}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-700">Rp {formatDigit(item.harga_beli)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-600 text-gray-900">Rp {formatDigit(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-linear-to-r from-blue-100 to-blue-50 border-t-2 border-gray-200">
                                <td colSpan={4} className="px-6 py-4 text-right font-600 text-gray-900">
                                    TOTAL:
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-lg text-blue-600">
                                    Rp {formatDigit(grandTotal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
