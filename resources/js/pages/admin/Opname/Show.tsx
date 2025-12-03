import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../Layout';
import { formatTgl } from '@/lib/formatters';

interface OpnameItem {
    id: string;
    user_id: string;
    barang_id: string;
    tgl: string;
    sistem: number;
    fisik: number;
    selisih: number;
    keterangan?: string;
    user?: { id: string; name: string };
    barang?: { id: string; deskripsi: string; sku: string; satuan: string };
}

interface Props {
    opname: OpnameItem;
}

export default function OpnameShow({ opname }: Props) {
    const getStatusColors = () => {
        if (opname.selisih === 0) {
            return { bg: 'from-emerald-100 to-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
        } else if (opname.selisih > 0) {
            return { bg: 'from-blue-100 to-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        } else {
            return { bg: 'from-red-100 to-red-50', text: 'text-red-700', border: 'border-red-200' };
        }
    };

    const colors = getStatusColors();

    return (
        <>
            <Head title={`Opname ${opname.barang?.deskripsi}`} />

            <AdminLayout title="Detail Opname">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">📋 Detail Opname</h1>
                            <p className="text-gray-600 mt-1">{formatTgl(opname.tgl)}</p>
                        </div>
                        <Link
                            href="/admin/opname"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ← Kembali
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className={`bg-linear-to-r ${colors.bg} border-b border-gray-200 px-6 py-4`}>
                            <h2 className="text-xl font-bold text-gray-900">{opname.barang?.deskripsi}</h2>
                            <p className="text-sm text-gray-600 mt-1">SKU: {opname.barang?.sku}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Grid Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Stok Sistem</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{opname.sistem}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Stok Fisik</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{opname.fisik}</p>
                                </div>
                            </div>

                            {/* Selisih */}
                            <div className={`bg-linear-to-br ${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                                <p className="text-sm text-gray-600">Selisih (Fisik - Sistem)</p>
                                <p className={`text-3xl font-bold mt-2 ${colors.text}`}>
                                    {opname.selisih > 0 ? '+' : ''}{opname.selisih}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {opname.selisih === 0
                                        ? 'Stok sesuai'
                                        : opname.selisih > 0
                                        ? 'Stok lebih dari sistem'
                                        : 'Stok kurang dari sistem'}
                                </p>
                            </div>

                            {/* User & Date */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-600">User</p>
                                    <p className="font-semibold text-gray-900 mt-1">{opname.user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Satuan</p>
                                    <p className="font-semibold text-gray-900 mt-1">{opname.barang?.satuan}</p>
                                </div>
                            </div>

                            {/* Keterangan */}
                            {opname.keterangan && (
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Keterangan</p>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-gray-900">{opname.keterangan}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
                            <Link
                                href={`/admin/opname/${opname.id}/edit`}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center"
                            >
                                ✏️ Edit
                            </Link>
                            <Link
                                href="/admin/opname"
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center"
                            >
                                Tutup
                            </Link>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
