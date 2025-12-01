import { BarangItem } from '@/components/kasir/types';

interface CartTableProps {
    items: BarangItem[];
    onQtyClick: (item: BarangItem) => void;
    onRowDoubleClick: (item: BarangItem) => void;
    onDeleteClick: (itemId: string) => void;
    formatNumber: (num: number) => string;
}

export default function CartTable({
    items,
    onQtyClick,
    onRowDoubleClick,
    onDeleteClick,
    formatNumber,
}: CartTableProps) {
    if (items.length === 0) {
        return (
            <div className="flex-1 overflow-auto">
                <table className="w-full">
                    <thead className="sticky top-0 bg-linear-to-br from-slate-700 to-slate-600 shadow-md">
                        <tr className="text-slate-200">
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-10 sm:w-16">No</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-sm font-semibold uppercase tracking-wider">Nama</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-16 sm:w-24 hidden md:table-cell">Satuan</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-14 sm:w-20">Qty</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-20 sm:w-32">Harga</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-20 sm:w-28 hidden lg:table-cell">Charge</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-20 sm:w-28 hidden lg:table-cell">Disc</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-24 sm:w-36">Total</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-10 sm:w-16">Del</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={9} className="px-4 py-20 text-center text-slate-400">
                                <svg className="mx-auto h-16 w-16 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                <div className="text-lg font-medium">Keranjang masih kosong</div>
                                <div className="text-sm mt-1">Scan atau cari barang untuk memulai transaksi</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto">
            <table className="w-full">
                <thead className="sticky top-0 bg-linear-to-br from-slate-700 to-slate-600 shadow-md">
                    <tr className="text-slate-200">
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-10 sm:w-16">No</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-sm font-semibold uppercase tracking-wider">Nama</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-16 sm:w-24 hidden md:table-cell">Satuan</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-14 sm:w-20">Qty</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-20 sm:w-32">Harga</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-20 sm:w-28 hidden lg:table-cell">Charge</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-20 sm:w-28 hidden lg:table-cell">Disc</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-24 sm:w-36">Total</th>
                        <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold uppercase tracking-wider w-10 sm:w-16">Del</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {items.map((item, idx) => (
                        <tr
                            key={item.id}
                            className="bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-200"
                            onDoubleClick={() => onRowDoubleClick(item)}
                            title="Double-click untuk diskon item ini"
                        >
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-center text-slate-400 text-[10px] sm:text-sm font-medium">{idx + 1}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm font-medium">{item.deskripsi}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-center text-[10px] sm:text-sm text-slate-300 hidden md:table-cell">{item.volume}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-center">
                                <span
                                    onClick={() => onQtyClick(item)}
                                    className="inline-flex items-center justify-center min-w-8 sm:min-w-12 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-600 hover:bg-blue-500 rounded text-[10px] sm:text-sm font-semibold cursor-pointer transition-colors"
                                >
                                    {formatNumber(item.qty || 0)}
                                </span>
                            </td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-right font-mono text-[10px] sm:text-sm">Rp {formatNumber(item.hargaJual || 0)}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-right font-mono text-[10px] sm:text-sm text-amber-400 hidden lg:table-cell">{item.charge ? `Rp ${formatNumber(item.charge)}` : '-'}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-right font-mono text-[10px] sm:text-sm text-green-400 hidden lg:table-cell">{(item.disc_spv || 0) + (item.disc_promo || 0) > 0 ? `Rp ${formatNumber((item.disc_spv || 0) + (item.disc_promo || 0))}` : '-'}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-right font-bold text-xs sm:text-lg">Rp {formatNumber(item.total || 0)}</td>
                            <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-center">
                                <button
                                    onClick={() => onDeleteClick(item.id)}
                                    className="p-1 sm:p-1.5 hover:bg-red-600/20 rounded-md transition-colors group"
                                    title="Hapus item"
                                >
                                    <svg className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
