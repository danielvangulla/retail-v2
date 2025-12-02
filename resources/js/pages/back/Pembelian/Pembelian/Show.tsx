import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface Props {
    data: any;
}

export default function Show({ data }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Detail Pembelian" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Detail Pembelian #{data.id}</h2>
                        <p>Tanggal: {data.tgl}</p>
                        <p>Total: Rp {data.total?.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
