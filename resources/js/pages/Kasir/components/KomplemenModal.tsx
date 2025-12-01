import { RefObject } from 'react';
import { BarangItem } from '@/components/kasir/types';

interface KomplemenModalProps {
    show: boolean;
    items: BarangItem[];
    komplemenSearch: string;
    spvPinKomplemen: string;
    spvPinKomplemenRef: RefObject<HTMLInputElement | null>;
    onSearchChange: (value: string) => void;
    onSpvPinChange: (value: string) => void;
    onSelectItem: (item: BarangItem) => void;
    onClose: () => void;
}

export default function KomplemenModal({
    show,
    items,
    komplemenSearch,
    spvPinKomplemen,
    spvPinKomplemenRef,
    onSearchChange,
    onSpvPinChange,
    onSelectItem,
    onClose,
}: KomplemenModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Pilih Barang Komplemen / Hadiah</h3>
                <div className="mb-3">
                    <label className="block text-slate-300 text-sm mb-2">Cari Barang</label>
                    <input
                        type="text"
                        value={komplemenSearch}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white
                                 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-3"
                        placeholder="Cari barang..."
                        autoFocus
                    />

                    <label className="block text-slate-300 text-sm mb-2">PIN Supervisor</label>
                    <input
                        ref={spvPinKomplemenRef}
                        type="password"
                        inputMode="numeric"
                        value={spvPinKomplemen}
                        onChange={(e) => onSpvPinChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white
                                 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        placeholder="••••••"
                    />
                </div>
                <div className="flex-1 overflow-y-auto mb-4">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-slate-700">
                            <tr className="text-slate-200">
                                <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm">Barcode</th>
                                <th className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm">Deskripsi</th>
                                <th className="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm hidden sm:table-cell">Satuan</th>
                                <th className="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {items
                                .filter(item =>
                                    item.barcode.toLowerCase().includes(komplemenSearch.toLowerCase()) ||
                                    item.deskripsi.toLowerCase().includes(komplemenSearch.toLowerCase())
                                )
                                .slice(0, 10)
                                .map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-700/50 text-slate-200">
                                        <td className="px-2 sm:px-3 py-2 font-mono text-xs sm:text-sm">{item.barcode}</td>
                                        <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{item.deskripsi}</td>
                                        <td className="px-2 sm:px-3 py-2 text-center text-xs sm:text-sm hidden sm:table-cell">{item.volume}</td>
                                        <td className="px-2 sm:px-3 py-2 text-center">
                                            <button
                                                onClick={() => onSelectItem(item)}
                                                className="px-2 sm:px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs sm:text-sm cursor-pointer"
                                            >
                                                Pilih
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
