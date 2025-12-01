import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';

interface CategoryOmset {
    tgl: string;
    kategori: string;
    total: number;
}

interface Props {
    omset: CategoryOmset[];
    start_date: string;
    end_date: string;
}

export default function OmsetByTglKategori({ omset, start_date, end_date }: Props) {
    const grandTotal = omset.reduce((sum, item) => sum + item.total, 0);

    // Group by date
    const groupedByDate = omset.reduce((acc, item) => {
        if (!acc[item.tgl]) {
            acc[item.tgl] = [];
        }
        acc[item.tgl].push(item);
        return acc;
    }, {} as Record<string, CategoryOmset[]>);

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Omset by Tanggal & Kategori" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Laporan Omset by Tanggal & Kategori</h2>
                            <p className="text-gray-600 mb-6">
                                Periode: {start_date} s/d {end_date}
                            </p>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Kategori
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(groupedByDate).map(([date, items]) => (
                                            <>
                                                {items.map((item, index) => (
                                                    <tr key={`${date}-${index}`}>
                                                        {index === 0 && (
                                                            <td
                                                                rowSpan={items.length}
                                                                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50"
                                                            >
                                                                {date}
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {item.kategori}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                            Rp {item.total.toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-100">
                                                    <td colSpan={2} className="px-6 py-2 text-sm font-semibold text-gray-700">
                                                        Subtotal {date}
                                                    </td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                                        Rp {items.reduce((sum, i) => sum + i.total, 0).toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            </>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">
                                                Grand Total
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                                                Rp {grandTotal.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
