import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface Pembelian {
    id: number;
    tgl: string;
    total: number;
    user: string;
}

interface Props {
    data: Pembelian[];
}

export default function Index({ data }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Data Pembelian" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-2xl font-bold">Data Pembelian</h2>
                            <button onClick={() => router.visit('/pembelian/create')} className="px-4 py-2 bg-blue-500 text-white rounded">
                                Tambah Pembelian
                            </button>
                        </div>
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">Tanggal</th>
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4">{p.tgl}</td>
                                        <td className="px-6 py-4">{p.user}</td>
                                        <td className="px-6 py-4 text-right">Rp {p.total.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => router.visit(`/pembelian/${p.id}`)} className="text-blue-600">Detail</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
