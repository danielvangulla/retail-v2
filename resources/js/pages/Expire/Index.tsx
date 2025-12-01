import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface ExpireData {
    id: number;
    user: { name: string };
    ket: string;
    created_at: string;
    details: any[];
}

interface Props {
    data: ExpireData[];
}

export default function Index({ data }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Barang Expire" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-2xl font-bold">Barang Expire</h2>
                            <button onClick={() => router.visit('/expire/create')} className="px-4 py-2 bg-blue-500 text-white rounded">Tambah Expire</button>
                        </div>
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">Tanggal</th>
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-left">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((d) => (
                                    <tr key={d.id}>
                                        <td className="px-6 py-4">{d.created_at}</td>
                                        <td className="px-6 py-4">{d.user.name}</td>
                                        <td className="px-6 py-4">{d.ket}</td>
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
