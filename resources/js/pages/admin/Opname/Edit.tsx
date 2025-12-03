import { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../Layout';
import axios from '@/lib/axios';
import { formatTgl } from '@/lib/formatters';
import AlertModal from '../../Kasir/components/AlertModal';

interface Barang {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    satuan: string;
    harga_beli: number;
    harga_jual1: number;
}

interface OpnameItem {
    id: string;
    user_id: string;
    barang_id: string;
    tgl: string;
    sistem: number;
    fisik: number;
    selisih: number;
    keterangan?: string;
    user?: { id: string; name: string };
    barang?: Barang;
}

interface Props {
    opname: OpnameItem;
    barangs: Barang[];
}

export default function OpnameEdit({ opname, barangs }: Props) {
    const [sistem, setSistem] = useState(opname.sistem);
    const [fisik, setFisik] = useState(opname.fisik);
    const [keterangan, setKeterangan] = useState(opname.keterangan || '');
    const [isLoading, setIsLoading] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(opname.barang || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBarang, setFilteredBarang] = useState<Barang[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load barang list
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

    const handleSelectBarang = (barang: Barang) => {
        setSelectedBarang(barang);
        setSearchQuery('');
        setFilteredBarang([]);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        searchInputRef.current?.focus();
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
                    handleSelectBarang(filteredBarang[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const selisih = fisik - sistem;

    const getStatusColors = () => {
        if (selisih === 0) {
            return { bg: 'from-emerald-100 to-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
        } else if (selisih > 0) {
            return { bg: 'from-blue-100 to-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
        } else {
            return { bg: 'from-red-100 to-red-50', text: 'text-red-700', border: 'border-red-200' };
        }
    };

    const colors = getStatusColors();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBarang) {
            setInfoMessage('Pilih barang terlebih dahulu');
            setShowInfoModal(true);
            return;
        }

        try {
            setIsLoading(true);
            await axios.patch(`/admin/opname/${opname.id}`, {
                barang_id: selectedBarang.id,
                sistem,
                fisik,
                keterangan,
            });

            router.visit(`/admin/opname/${opname.id}`);
        } catch (error: any) {
            setInfoMessage(error.response?.data?.message || 'Gagal menyimpan perubahan');
            setShowInfoModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title={`Edit Opname ${opname.barang?.deskripsi}`} />

            <AdminLayout title="Edit Opname">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">✏️ Edit Opname</h1>
                        <p className="text-gray-600 mt-1">{formatTgl(opname.tgl)}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Barang Info / Search */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Barang</label>
                                <div className="relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Cari barang (SKU, Barcode, Nama)... (↑↓ navigasi, Enter pilih)"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchBarang(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {showDropdown && filteredBarang.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                            {filteredBarang.map((barang, index) => (
                                                <button
                                                    key={barang.id}
                                                    type="button"
                                                    onClick={() => handleSelectBarang(barang)}
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
                                {selectedBarang && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm font-medium text-blue-900">{selectedBarang.deskripsi}</p>
                                        <p className="text-xs text-blue-700">SKU: {selectedBarang.sku} | {selectedBarang.satuan}</p>
                                    </div>
                                )}
                            </div>

                            {/* Stok Sistem */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Stok Sistem
                                </label>
                                <input
                                    type="number"
                                    value={sistem}
                                    onChange={(e) => setSistem(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Stok dari database/sistem</p>
                            </div>

                            {/* Stok Fisik */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Stok Fisik
                                </label>
                                <input
                                    type="number"
                                    value={fisik}
                                    onChange={(e) => setFisik(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Stok hasil penghitungan fisik</p>
                            </div>

                            {/* Selisih */}
                            <div className={`bg-linear-to-br ${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                                <p className="text-sm text-gray-600">Selisih (Fisik - Sistem)</p>
                                <p className={`text-3xl font-bold mt-2 ${colors.text}`}>
                                    {selisih > 0 ? '+' : ''}{selisih}
                                </p>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Keterangan
                                </label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Alasan atau catatan selisih stok"
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {keterangan.length}/500 karakter
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
                            <Link
                                href={`/admin/opname/${opname.id}`}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Menyimpan...' : '✅ Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </AdminLayout>

            <AlertModal
                title="Informasi"
                message={infoMessage}
                type="info"
                isOpen={showInfoModal}
                onClose={() => setShowInfoModal(false)}
            />
        </>
    );
}
