import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';

interface PaymentType {
    id: string;
    ket: string;
    urutan: number;
}

interface Props {
    paymentTypes: PaymentType[];
    keysArray: string[][];
}

interface BarangItem {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    alias?: string;
    satuan: string;
    volume: string;
    harga_jual1: number;
    harga_jual2: number;
    stock: number;
    prices?: any[];
    promo?: any;
    trx_details?: any[];
    multiplier?: boolean;
    qty?: number;
    disc_spv?: number;
    disc_promo?: number;
    namaPromo?: string;
    charge?: number;
    hargaJual?: number;
    hargaPromo?: number;
    total?: number;
}

export default function KasirIndex({ paymentTypes, keysArray }: Props) {
    const [items, setItems] = useState<BarangItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<BarangItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BarangItem[]>([]);
    const [selectedResult, setSelectedResult] = useState<BarangItem | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isPiutang, setIsPiutang] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const [lastTrxId, setLastTrxId] = useState('');
    const [grandTotal, setGrandTotal] = useState(0);
    const [totalDisc, setTotalDisc] = useState(0);
    const [totalPromo, setTotalPromo] = useState(0);
    const [totalCharge, setTotalCharge] = useState(0);
    const [showResetButton, setShowResetButton] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadBarangList();
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (selectedItems.length > 0) {
            setShowResetButton(true);
        } else {
            setShowResetButton(false);
        }
    }, [selectedItems]);

    const loadBarangList = async () => {
        try {
            const response = await axios.post('/barang-list', { show: 1 });
            if (response.data.status === 'ok') {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error loading barang:', error);
        }
    };

    const handleSearchInput = (value: string) => {
        setSearchQuery(value);
        const searchString = value.toLowerCase();

        if (searchString.length >= 2) {
            const filtered = items.filter(item =>
                item.barcode.toLowerCase().includes(searchString) ||
                item.deskripsi.toLowerCase().includes(searchString) ||
                item.sku.toLowerCase().includes(searchString) ||
                item.alias?.toLowerCase().includes(searchString)
            );

            setSearchResults(filtered);
            setSelectedResult(filtered[0] || null);

            if (filtered.length === 1) {
                if (searchTimeout.current) clearTimeout(searchTimeout.current);

                searchTimeout.current = setTimeout(() => {
                    const itemFound = items.find(item =>
                        item.barcode.toLowerCase() === searchString ||
                        item.sku.toLowerCase() === searchString
                    );

                    if (itemFound) {
                        selectItemJual(itemFound.id);
                        setShowSearchResults(false);
                        setSearchQuery('');
                    }
                }, 500);
            }

            setShowSearchResults(filtered.length > 0);
        } else {
            setShowSearchResults(false);
        }
    };

    const selectItemJual = (id: string) => {
        const exist = selectedItems.find(v => v.id === id);

        if (exist) {
            setSelectedItems(prev => prev.map(v =>
                v.id === id ? { ...v, qty: (v.qty || 1) + 1 } : v
            ));
        } else {
            const selected = items.find(v => v.id === id);
            if (selected) {
                setSelectedItems(prev => [...prev, { ...selected, qty: 1 }]);
            }
        }

        inputRef.current?.focus();
    };

    const calculateTotals = () => {
        let newTotalDisc = 0;
        let newTotalPromo = 0;
        let newTotalCharge = 0;
        let newGrandTotal = 0;

        const updatedItems = selectedItems.map(item => {
            const v = { ...item };

            if (!v.disc_spv) v.disc_spv = 0;
            v.hargaJual = v.harga_jual1;
            v.namaPromo = '';
            v.disc_promo = 0;
            v.charge = 0;

            if (isPiutang) {
                v.charge = v.harga_jual2;
            }

            if (isStaff) {
                v.charge = 0;
            }

            if (v.multiplier && v.charge) {
                v.charge *= (v.qty || 1);
            }

            v.total = ((v.qty || 1) * v.hargaJual) - v.disc_spv - v.disc_promo;

            if (isPiutang) {
                v.total += parseFloat(String(v.charge || 0));
            }

            newTotalDisc += parseFloat(String(v.disc_spv));
            newTotalPromo += parseFloat(String(v.disc_promo));
            newTotalCharge += parseFloat(String(v.charge || 0));
            newGrandTotal += parseFloat(String(v.total || 0));

            return v;
        });

        setSelectedItems(updatedItems);
        setTotalDisc(newTotalDisc);
        setTotalPromo(newTotalPromo);
        setTotalCharge(newTotalCharge);
        setGrandTotal(newGrandTotal);
    };

    useEffect(() => {
        calculateTotals();
    }, [selectedItems.length, isPiutang, isStaff]);

    const resetAll = () => {
        setSelectedItems([]);
        setIsPiutang(false);
        setIsStaff(false);
        setSearchQuery('');
        setShowSearchResults(false);
        inputRef.current?.focus();
    };

    const handlePrintLast = () => {
        if (lastTrxId) {
            window.open(`/print-bill/${lastTrxId}`, '_blank');
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('id-ID');
    };

    return (
        <>
            <Head title="Kasir - POS" />

            <div className="grow flex flex-col gap-1 p-1">
                {/* Main Screen */}
                <div className="grow flex flex-col bg-blue-200 p-2 rounded-md border-2 border-orange-400 text-white h-[calc(80vh)]">
                    <div className="flex flex-row justify-between items-center p-1 m-1">
                        <div className="relative pl-4">
                            <input
                                ref={inputRef}
                                id="inputBarcode"
                                type="text"
                                placeholder="Ketik / Scan Barcode.."
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                className="border border-gray-300 rounded-md py-1 pl-10 pr-4 bg-white text-black focus:outline-none focus:border-ocean-accent focus:ring-1 focus:ring-ocean-accent"
                            />
                            <span className="absolute inset-y-0 left-7 flex items-center">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l5 5m0 0l-5-5m5 5L15 10M4 6a8 8 0 110 12 8 8 0 010-12z"></path>
                                </svg>
                            </span>
                        </div>

                        <div className="relative pr-4">
                            <p className="text-blue-600 text-4xl">
                                Total Rp. <span className="font-extrabold">{formatNumber(grandTotal)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Search Results */}
                    {showSearchResults && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSearchResults(false)}>
                            <div
                                className="bg-slate-300 border-2 border-blue-300 shadow-lg rounded-md p-1 h-[70vh] max-w-fit overflow-hidden flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="overflow-y-auto flex-1">
                                    <table className="table table-auto w-full">
                                        <thead className="sticky top-0 bg-slate-600 text-white">
                                            <tr>
                                                <th className="px-4 py-2 text-center">Barcode</th>
                                                <th className="px-4 py-2 text-left">Deskripsi</th>
                                                <th className="px-4 py-2 text-center">Satuan</th>
                                                <th className="px-4 py-2 text-right">Harga Jual</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResults.length === 0 ? (
                                                <tr><td colSpan={4} className="p-2 text-center text-black">No Data..</td></tr>
                                            ) : (
                                                searchResults.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => {
                                                            selectItemJual(item.id);
                                                            setShowSearchResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className={`cursor-pointer hover:bg-blue-700 hover:text-white ${selectedResult?.id === item.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-black'}`}
                                                    >
                                                        <td className="border border-slate-500 px-4 py-1 text-center whitespace-nowrap">{item.barcode}</td>
                                                        <td className="border border-slate-500 px-4 py-1 text-left whitespace-nowrap">{item.deskripsi}</td>
                                                        <td className="border border-slate-500 px-4 py-1 text-center whitespace-nowrap">{item.volume}</td>
                                                        <td className="border border-slate-500 px-4 py-1 text-right whitespace-nowrap">{formatNumber(item.harga_jual1)}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cart Items Table */}
                    <div id="kasirScreen" className="overflow-y-scroll">
                        <table className="w-full table table-auto border-2 bg-slate-600">
                            <thead>
                                <tr>
                                    <th className="border-2 border-white py-3">No.</th>
                                    <th className="border-2 border-white py-3">Nama Barang</th>
                                    <th className="border-2 border-white py-3">Satuan</th>
                                    <th className="border-2 border-white py-3">Qty</th>
                                    <th className="border-2 border-white py-3">Harga Rp.</th>
                                    <th className="border-2 border-white py-3 w-36">Add. Charge</th>
                                    <th className="border-2 border-white py-3 w-36">Disc.</th>
                                    <th className="border-2 border-white py-3">Total Rp.</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-500">
                                {selectedItems.length === 0 ? (
                                    <tr>
                                        <td className="border-2 border-white p-2" colSpan={8}>No Data..</td>
                                    </tr>
                                ) : (
                                    selectedItems.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="border-2 border-slate-300 px-2 py-1 text-center">{index + 1}</td>
                                            <td className="border-2 border-slate-300 px-2">{item.deskripsi}</td>
                                            <td className="border-2 border-slate-300 px-2 text-center">{item.volume}</td>
                                            <td className="border-2 border-slate-300 px-2 text-center hover:bg-blue-500 cursor-pointer">{formatNumber(item.qty || 0)}</td>
                                            <td className="border-2 border-slate-300 px-2 text-center">{formatNumber(item.hargaJual || 0)}</td>
                                            <td className="border-2 border-slate-300 px-2 text-center">{formatNumber(item.charge || 0)}</td>
                                            <td className="border-2 border-slate-300 px-2 text-center">{formatNumber((item.disc_spv || 0) + (item.disc_promo || 0))}</td>
                                            <td className="border-2 border-slate-300 px-2 text-center">{formatNumber(item.total || 0)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col bg-slate-300 p-2 rounded-md border-2 border-blue-400 text-black">
                    <div className="flex flex-row gap-4 justify-center content-center">
                        {showResetButton && (
                            <button
                                onClick={resetAll}
                                className="rounded-lg bg-red-700 hover:bg-red-500 text-white px-2 py-1 border-2 border-slate-500"
                            >
                                <i className="fa-solid fa-refresh"></i> Reset (Esc)
                            </button>
                        )}

                        <button
                            onClick={handlePrintLast}
                            className="rounded-lg bg-green-700 hover:bg-green-500 text-white px-2 py-1 border-2 border-slate-500"
                        >
                            <i className="fa-solid fa-print"></i> Print Last (PgUp)
                        </button>

                        <button
                            className="rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 border-2 border-slate-500"
                        >
                            <i className="fa-solid fa-percent"></i> Diskon (F5)
                        </button>

                        <button
                            className="rounded-lg bg-slate-700 hover:bg-slate-500 text-white px-2 py-1 border-2 border-slate-500"
                        >
                            <i className="fa-solid fa-gift"></i> Komplemen (F7)
                        </button>

                        <button
                            className="rounded-lg bg-orange-700 hover:bg-orange-500 text-white px-2 py-1 border-2 border-slate-500"
                        >
                            <i className="fa-solid fa-hand"></i> Piutang (F8)
                        </button>

                        <button
                            className="rounded-lg bg-blue-700 hover:bg-blue-500 text-white px-2 py-1 border-2 border-slate-500"
                        >
                            <i className="fa-solid fa-sack-dollar"></i> Pembayaran (F9)
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
