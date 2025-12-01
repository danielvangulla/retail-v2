import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="Piutang Member" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Piutang Member</h2>
                        <p className="text-gray-600">Daftar piutang member</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
