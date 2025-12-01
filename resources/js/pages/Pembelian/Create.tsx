import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Create() {
    const { data, setData, post, processing } = useForm({
        items: [],
        total: 0,
    });

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Pembelian" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Tambah Pembelian</h2>
                        <p className="text-gray-600">Form pembelian barang</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
