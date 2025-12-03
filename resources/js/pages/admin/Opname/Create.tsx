import { useState, useCallback, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Layout';
import axios from '@/lib/axios';
import { formatDigit } from '@/lib/formatters';
import AlertModal from '../../Kasir/components/AlertModal';

interface Barang {
    id: string;
    sku: string;
    alias: string;
    barcode: string;
    deskripsi: string;
    satuan: string;
    harga_beli: number;
    harga_jual1: number;
}

interface OpnameItem {
    id: string;
    deskripsi: string;
    satuan: string;
    qtySistem: number;
    qtyFisik: number;
    qtySelisih: number;
    keterangan: string;
    harga_beli?: number;
}

interface Props {
    barangs: Barang[];
}

export default function OpnameCreate({ barangs }: Props) {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [filteredBarang, setFilteredBarang] = useState<Barang[]>([]);
    const [opnameItems, setOpnameItems] = useState<OpnameItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load barang list dari API
        fetchBarangList();
    }, []);

    const fetchBarangList = async () => {
        try {
            const response = await axios.get('/admin/barang-all');
            setBarangList(response.data.data || []);
        } catch (error) {
            console.error('Error fetching barang:', error);
        }
    };

    const handleAddItem = (barang: Barang) => {
        const exists = opnameItems.find(item => item.id === barang.id);

        if (exists) {
            setInfoMessage(`"${barang.deskripsi}" sudah ada di daftar opname.`);
            setShowInfoModal(true);
            return;
        }

        console.log('Adding barang with harga_beli:', barang.harga_beli);

        // Fetch current stock dari barang_stock
        fetchStockReal(barang.id).then((stockReal) => {
            setOpnameItems([
                ...opnameItems,
                {
                    id: barang.id,
                    deskripsi: barang.deskripsi,
                    satuan: barang.satuan,
                    qtySistem: stockReal, // Ambil dari stock real
                    qtyFisik: 0,
                    qtySelisih: 0,
                    keterangan: '',
                    harga_beli: barang.harga_beli,
                },
            ]);

            setSearchQuery('');
            setFilteredBarang([]);
            setShowDropdown(false);
            setHighlightedIndex(-1);
            searchInputRef.current?.focus();
        });
    };

    const fetchStockReal = async (barangId: string): Promise<number> => {
        try {
            const response = await axios.get(`/admin/barang-stock/${barangId}`);
            return response.data.data?.quantity || 0;
        } catch (error) {
            console.error('Error fetching stock:', error);
            return 0;
        }
    };

    const handleSearchBarang = (value: string) => {
        setSearchQuery(value);
        if (value.length >= 2) {
            const filtered = barangList.filter(
                (b) =>
                    b.sku.toLowerCase().includes(value.toLowerCase()) ||
                    b.barcode.toLowerCase().includes(value.toLowerCase()) ||
                    b.deskripsi.toLowerCase().includes(value.toLowerCase()) ||
                    b.alias.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredBarang(filtered);
            setShowDropdown(true);
            setHighlightedIndex(filtered.length > 0 ? 0 : -1);
        } else {
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || filteredBarang.length === 0) {
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredBarang.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredBarang.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleAddItem(filteredBarang[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleUpdateQty = (index: number, field: 'qtySistem' | 'qtyFisik' | 'keterangan', value: any) => {
        const newItems = [...opnameItems];
        (newItems[index][field as keyof OpnameItem] as any) = value;

        if (field !== 'keterangan') {
            newItems[index].qtySelisih = newItems[index].qtyFisik - newItems[index].qtySistem;
        }

        setOpnameItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setOpnameItems(opnameItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (opnameItems.length === 0) {
            setInfoMessage('Tambahkan minimal 1 barang untuk opname');
            setShowInfoModal(true);
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post('/admin/opname', {
                data: opnameItems,
            });

            if (response.data.status === 'ok') {
                router.visit('/admin/opname');
            }
        } catch (error: any) {
            setInfoMessage(error.response?.data?.message || 'Gagal menyimpan opname');
            setShowInfoModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const totalValue = opnameItems.reduce((sum, item) => sum + item.qtySelisih, 0);
    const itemsWithDifference = opnameItems.filter(item => item.qtySelisih !== 0).length;
    const totalValueRp = opnameItems.reduce((sum, item) => {
        const nilaiItem = item.qtySelisih * (item.harga_beli || 0);
        return sum + nilaiItem;
    }, 0);

    // Debug
    if (opnameItems.length > 0) {
        console.log('First item:', opnameItems[0], 'Total Value Rp:', totalValueRp);
    }

    return (
        <>
            <Head title="Buat Opname Stok" />

            <AdminLayout title="Buat Opname Stok Baru">
                <div className="max-w-6xl mx-auto text-black">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">📋 Buat Opname Stok Baru</h1>
                        <p className="text-gray-600 mt-2">Audit dan sesuaikan stok barang</p>
                    </div>

                    {/* Search & Add */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Cari Barang</label>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="SKU, Barcode, atau Nama... (↑↓ navigasi, Enter tambah)"
                                value={searchQuery}
                                onChange={(e) => handleSearchBarang(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {showDropdown && filteredBarang.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                                    {filteredBarang.map((barang, index) => (
                                        <button
                                            key={barang.id}
                                            onClick={() => handleAddItem(barang)}
                                            className={`w-full px-4 py-3 text-left border-b last:border-b-0 cursor-pointer transition-colors ${
                                                highlightedIndex === index
                                                    ? 'bg-blue-500 text-white'
                                                    : 'hover:bg-blue-50 text-gray-900'
                                            }`}
                                        >
                                            <div className="font-medium">{barang.deskripsi}</div>
                                            <div className={`text-xs ${highlightedIndex === index ? 'text-blue-100' : 'text-gray-500'}`}>
                                                SKU: {barang.sku} | {barang.barcode} | {barang.satuan}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    {opnameItems.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                            <table className="w-full text-sm">
                                <thead className="bg-linear-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Barang</th>
                                        <th className="px-3 py-2 text-center font-semibold text-gray-900 w-18">Sistem</th>
                                        <th className="px-3 py-2 text-center font-semibold text-gray-900 w-20">Fisik</th>
                                        <th className="px-3 py-2 text-center font-semibold text-gray-900 w-18">Selisih</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-900 w-24">Harga Beli</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-900">Ket</th>
                                        <th className="px-3 py-2 text-center font-semibold text-gray-900 w-12">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {opnameItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <div className="font-medium text-gray-900 text-xs">{item.deskripsi}</div>
                                                <div className="text-xs text-gray-500">{item.satuan}</div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700`}
                                                >
                                                    {item.qtySistem}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="number"
                                                    value={item.qtyFisik}
                                                    onChange={(e) =>
                                                        handleUpdateQty(index, 'qtyFisik', parseInt(e.target.value) || '')
                                                    }
                                                    className="w-full px-1 py-0.5 border border-gray-300 rounded text-center text-xs"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                                        item.qtySelisih === 0
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : item.qtySelisih > 0
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {item.qtySelisih > 0 ? '+' : ''}{item.qtySelisih}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {formatDigit(item.harga_beli || 0)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.keterangan}
                                                    onChange={(e) =>
                                                        handleUpdateQty(index, 'keterangan', e.target.value)
                                                    }
                                                    placeholder="Ket"
                                                    className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
                                                    maxLength={50}
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Summary */}
                            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {opnameItems.length} item, {itemsWithDifference} dengan selisih
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total Selisih</p>
                                    <p className="text-2xl font-bold text-purple-700">{totalValue}</p>
                                    <p className="text-sm text-gray-600 mt-2">Nilai Persediaan</p>
                                    <p className="text-xl font-bold text-orange-600">Rp {formatDigit(totalValueRp)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {opnameItems.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center mb-6">
                            <p className="text-gray-600 mb-2">Belum ada barang yang ditambahkan</p>
                            <p className="text-sm text-gray-500">Gunakan pencarian di atas untuk menambahkan barang</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Link
                            href="/admin/opname"
                            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Batal
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || opnameItems.length === 0}
                            className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Menyimpan...' : '✅ Simpan Opname'}
                        </button>
                    </div>
                </div>
            </AdminLayout>

            <AlertModal
                title="Informasi"
                message={infoMessage}
                type="info"
                show={showInfoModal}
                onConfirm={() => setShowInfoModal(false)}
            />
        </>
    );
}
