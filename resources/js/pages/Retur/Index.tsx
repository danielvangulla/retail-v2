import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface Retur {
    id: number;
    tgl: string;
    total: number;
}

interface Props {
    data: Retur[];
}

export default function Index({ data }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Retur Barang" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-2xl font-bold">Retur Barang</h2>
                            <button onClick={() => router.visit('/retur/create')} className="px-4 py-2 bg-blue-500 text-white rounded">Tambah Retur</button>
                        </div>
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">Tanggal</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-4">{r.tgl}</td>
                                        <td className="px-6 py-4 text-right">Rp {r.total.toLocaleString('id-ID')}</td>
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
