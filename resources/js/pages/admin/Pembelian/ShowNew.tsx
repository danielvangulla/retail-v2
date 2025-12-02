import AdminLayout from '../../admin/Layout';
import { router } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, DollarSign, Package, Printer } from 'lucide-react';
import { formatTgl, formatDigit, formatDateTime } from '../../../lib/formatters';

interface PembelianDetail {
    id: string;
    sku: string;
    barcode: string;
    qty: number;
    satuan_beli: string;
    harga_beli: number;
    total: number;
    barang: {
        deskripsi: string;
        alias: string;
        satuan: string;
        isi: number;
    };
}

interface PembelianShowProps {
    data: {
        id: string;
        tgl_faktur: string;
        is_lunas: boolean;
        grand_total: number;
        created_at: string;
        user: {
            name: string;
        };
        details: PembelianDetail[];
    };
}

export default function PembelianShowNew({ data }: PembelianShowProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout title="Detail Pembelian">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.visit('/back/pembelian')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition cursor-pointer"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Kembali ke Daftar</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 cursor-pointer print:hidden"
                    >
                        <Printer className="h-5 w-5" />
                        Cetak
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                    {/* Header Info */}
                    <div className="p-8 bg-linear-to-r from-blue-50 to-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Detail Pembelian
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Informasi lengkap transaksi pembelian</p>
                            </div>
                            {data.is_lunas ? (
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 border border-green-200/50">
                                    ✓ Lunas
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-orange-100 text-orange-700 border border-orange-200/50">
                                    ⏳ Belum Lunas
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal Faktur</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">
                                        {formatTgl(data.tgl_faktur || data.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <User className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Diinput Oleh</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{data.user?.name || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Package className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Jumlah Item</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{data.details?.length || 0} item</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package className="h-6 w-6 text-blue-600" />
                            Daftar Barang
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-linear-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            No
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            SKU
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Nama Barang
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Satuan
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Qty
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Harga Beli
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.details?.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.sku}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{item.barang?.deskripsi}</div>
                                                <div className="text-xs text-gray-500">{item.barang?.alias}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {item.satuan_beli}
                                                {item.barang?.isi && ` (${item.barang.isi} ${item.barang.satuan})`}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{item.qty}</td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-700">
                                                Rp {formatDigit(item.harga_beli)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-green-700">
                                                Rp {formatDigit(item.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Grand Total */}
                    <div className="p-8 bg-linear-to-r from-blue-50 to-gray-50 border-t-2 border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                    <span className="text-xl font-bold text-gray-900">Grand Total</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Total keseluruhan pembelian</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    Rp {formatDigit(data.grand_total)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Dibuat pada: <span className="font-medium text-gray-700">{formatDateTime(data.created_at)}</span>
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
