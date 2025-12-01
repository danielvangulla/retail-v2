import { BarangItem } from '@/components/kasir/types';

interface SearchResultsProps {
    show: boolean;
    results: BarangItem[];
    selectedResult: BarangItem | null;
    onSelect: (item: BarangItem) => void;
    formatNumber: (num: number) => string;
}

export default function SearchResults({
    show,
    results,
    selectedResult,
    onSelect,
    formatNumber,
}: SearchResultsProps) {
    if (!show || results.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
            {results.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`p-3 border-b border-slate-700 cursor-pointer transition-colors ${
                        selectedResult?.id === item.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-700 text-slate-200'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="font-medium text-sm">{item.deskripsi}</div>
                            <div className="text-xs mt-1 opacity-75">
                                {item.barcode} • {item.volume}
                            </div>
                        </div>
                        <div className="text-right ml-4">
                            <div className="font-semibold text-sm">
                                Rp {formatNumber(item.harga_jual1)}
                            </div>
                            <div className="text-xs opacity-75">
                                Stok: {item.stock}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
