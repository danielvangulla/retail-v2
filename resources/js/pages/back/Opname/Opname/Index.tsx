import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Opname Stock" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-2xl font-bold">Opname Stock</h2>
                            <button onClick={() => router.visit('/opname/create')} className="px-4 py-2 bg-blue-500 text-white rounded">Tambah Opname</button>
                        </div>
                        <p className="text-gray-600">Riwayat opname stock</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
