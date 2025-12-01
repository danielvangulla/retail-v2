import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface Setup {
    nama: string;
    alamat1: string;
    alamat2: string;
}

interface Props {
    setup: Setup;
}

export default function Index({ setup }: Props) {
    const { data, setData, post, processing } = useForm({
        nama: setup.nama,
        alamat1: setup.alamat1,
        alamat2: setup.alamat2,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/settings/update');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Pengaturan Perusahaan</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Perusahaan</label>
                                <input
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alamat 1</label>
                                <input
                                    type="text"
                                    value={data.alamat1}
                                    onChange={(e) => setData('alamat1', e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alamat 2</label>
                                <input
                                    type="text"
                                    value={data.alamat2}
                                    onChange={(e) => setData('alamat2', e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
