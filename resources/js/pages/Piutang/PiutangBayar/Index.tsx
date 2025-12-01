import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import axios from 'axios';

interface PiutangItem {
    id: number;
    tgl: string;
    piutang_id: number;
    piutang: { id: number; name: string };
    bayar: number;
    st: string;
    spv: { id: number; name: string };
}

export default function Index() {
    const [data, setData] = useState<PiutangItem[]>([]);
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await axios.get('/api/piutang-list');
        setData(res.data.data);
    };

    const handleLunas = async () => {
        const items = data.filter(d => selected.includes(d.id));
        await axios.post('/api/piutang-bayar', { data: items });
        router.reload();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pembayaran Piutang" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-2xl font-bold">Pembayaran Piutang</h2>
                            <button onClick={handleLunas} disabled={selected.length === 0} className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300">
                                Lunasi ({selected.length})
                            </button>
                        </div>
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3"><input type="checkbox" /></th>
                                    <th className="px-6 py-3 text-left">Tanggal</th>
                                    <th className="px-6 py-3 text-left">Member</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((d) => (
                                    <tr key={d.id}>
                                        <td className="px-6 py-4">
                                            <input type="checkbox" checked={selected.includes(d.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, d.id] : selected.filter(s => s !== d.id))} />
                                        </td>
                                        <td className="px-6 py-4">{d.tgl}</td>
                                        <td className="px-6 py-4">{d.piutang.name}</td>
                                        <td className="px-6 py-4 text-right">Rp {d.bayar.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-4"><span className={d.st === 'Lunas' ? 'text-green-600' : 'text-yellow-600'}>{d.st}</span></td>
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
