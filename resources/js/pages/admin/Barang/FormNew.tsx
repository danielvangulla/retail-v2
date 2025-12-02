import { FormEvent, useState } from 'react';
import AdminLayout from '../Layout';
import { router, usePage } from '@inertiajs/react';
import { AlertCircle, Plus, Trash2, DollarSign, Package2, Layers, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface PriceItem {
    id?: string;
    qty: number;
    harga1: number;
    harga2: number;
    multiplier: boolean;
}

interface BarangFormProps {
    barang?: {
        id: string;
        sku: string;
        barcode: string;
        deskripsi: string;
        alias: string;
        satuan: string;
        isi: number;
        volume: string;
        kategori_id: string;
        kategorisub_id?: string;
        harga_beli: number;
        harga_jual1: number;
        harga_jual2: number;
        min_stock: number;
        multiplier: boolean;
        st_aktif: number;
        allow_sold_zero_stock: boolean;
        prices?: PriceItem[];
    };
    kategoris: Array<{ id: string; ket: string }>;
    kategoriSubs: Array<{ id: string; ket: string; kategori_id: string }>;
}

export default function BarangFormNew({ barang, kategoris, kategoriSubs }: BarangFormProps) {
    const mode = barang ? 'edit' : 'create';
    const { props } = usePage();
    const errors = (props as any).errors || {};

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        sku: barang?.sku || '',
        barcode: barang?.barcode || '',
        deskripsi: barang?.deskripsi || '',
        alias: barang?.alias || '',
        satuan: barang?.satuan || 'Pcs',
        isi: barang?.isi || 1,
        volume: barang?.volume || '',
        kategori_id: barang?.kategori_id || '',
        kategorisub_id: barang?.kategorisub_id || '',
        harga_beli: barang?.harga_beli || 0,
        harga_jual1: barang?.harga_jual1 || 0,
        harga_jual2: barang?.harga_jual2 || 0,
        min_stock: barang?.min_stock || 1,
        multiplier: barang?.multiplier || false,
        st_aktif: barang?.st_aktif !== undefined ? barang.st_aktif.toString() : '1',
        allow_sold_zero_stock: barang?.allow_sold_zero_stock !== undefined ? barang.allow_sold_zero_stock : true,
    });

    const [prices, setPrices] = useState<PriceItem[]>(
        barang?.prices && barang.prices.length > 0
            ? barang.prices
            : []
    );

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddPrice = () => {
        setPrices([...prices, { qty: 0, harga1: 0, harga2: 0, multiplier: false }]);
    };

    const handleRemovePrice = (index: number) => {
        setPrices(prices.filter((_, i) => i !== index));
    };

    const handlePriceChange = (index: number, field: keyof PriceItem, value: any) => {
        const newPrices = [...prices];
        newPrices[index] = { ...newPrices[index], [field]: value };
        setPrices(newPrices);
    };

    const handleSubmit = async (e?: FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        // Hanya submit jika di step terakhir
        if (currentStep !== totalSteps) {
            return;
        }

        setLoading(true);

        const data = {
            ...formData,
            isi: parseInt(formData.isi as any) || 1,
            harga_beli: parseFloat(formData.harga_beli as any) || 0,
            harga_jual1: parseFloat(formData.harga_jual1 as any) || 0,
            harga_jual2: parseFloat(formData.harga_jual2 as any) || 0,
            min_stock: parseInt(formData.min_stock as any) || 0,
            st_aktif: parseInt(formData.st_aktif) || 1,
            prices: prices.map(p => ({
                ...p,
                qty: parseInt(p.qty as any) || 0,
                harga1: parseFloat(p.harga1 as any) || 0,
                harga2: parseFloat(p.harga2 as any) || 0,
            })),
        };

        if (mode === 'create') {
            router.post('/admin/barang', data, {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                }
            });
        } else if (barang) {
            router.put(`/admin/barang/${barang.id}`, data, {
                onSuccess: () => {
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                }
            });
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Prevent default form submit, hanya submit via button click
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        // Prevent form submit on Enter key
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
            e.preventDefault();
        }
    };

    // Validasi per step
    const isStep1Valid = () => {
        return formData.deskripsi && formData.kategori_id;
    };

    const isStep2Valid = () => {
        return formData.satuan && formData.isi > 0 && formData.harga_beli > 0 && formData.harga_jual1 > 0;
    };

    const isStep3Valid = () => {
        return formData.min_stock >= 0;
    };

    const canProceed = () => {
        if (currentStep === 1) return isStep1Valid();
        if (currentStep === 2) return isStep2Valid();
        if (currentStep === 3) return isStep3Valid();
        return true;
    };

    const handleNext = () => {
        if (canProceed() && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const pageTitle = mode === 'create' ? 'Tambah Barang' : 'Edit Barang';

    const filteredKategorisubs = (kategoriSubs || []).filter(
        (sub) => sub.kategori_id === formData.kategori_id
    );

    const steps = [
        { num: 1, title: 'Info Dasar', desc: 'Informasi produk' },
        { num: 2, title: 'Satuan & Harga', desc: 'Harga & konversi' },
        { num: 3, title: 'Stok', desc: 'Minimum stok' },
        { num: 4, title: 'Harga Bertingkat', desc: 'Opsional' }
    ];

    return (
        <AdminLayout title={pageTitle}>
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="bg-white rounded-2xl shadow-sm p-8 space-y-8 border border-gray-100/50 backdrop-blur-sm">
                    {/* <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                                {pageTitle}
                            </h3>
                            <p className="text-gray-500 text-sm">Kelola data barang dan harga bertingkat</p>
                        </div>
                        {mode === 'edit' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-xl">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-blue-900">Mode Edit</span>
                            </div>
                        )}
                        {mode === 'create' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-xl">
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-green-900">Mode Tambah</span>
                            </div>
                        )}
                    </div> */}

                    {/* Progress Steps */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            {steps.map((step, idx) => (
                                <div key={step.num} className="flex-1 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                            currentStep > step.num
                                                ? 'bg-green-500 text-white'
                                                : currentStep === step.num
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {currentStep > step.num ? <Check className="h-6 w-6" /> : step.num}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <div className={`text-xs font-semibold ${currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-400">{step.desc}</div>
                                        </div>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`absolute top-6 left-1/2 w-full h-1 -z-10 transition-all ${
                                            currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
                                        }`} style={{ transform: 'translateY(-50%)' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[400px]">
                        {/* STEP 1: Info Dasar */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">Informasi Dasar</h4>
                                    {mode === 'edit' && formData.sku && (
                                        <span className="text-xs font-mono bg-gray-100 px-3 py-1 rounded-lg border border-gray-300">
                                            SKU: {formData.sku}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            SKU {mode === 'create' && <span className="text-xs text-gray-500">(auto-generate jika kosong)</span>}
                                        </label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                                errors.sku ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                            } ${mode === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            placeholder={mode === 'create' ? "Kosongkan untuk auto-generate" : formData.sku}
                                            disabled={mode === 'edit'}
                                        />
                                        {errors.sku && (
                                            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" /> {errors.sku}
                                            </p>
                                        )}
                                        {mode === 'edit' && (
                                            <p className="text-xs text-gray-500">🔒 SKU tidak dapat diubah saat edit</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">Barcode</label>
                                        <input
                                            type="text"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                                errors.barcode ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                            }`}
                                            placeholder="Barcode (opsional)"
                                        />
                                        {errors.barcode && (
                                            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" /> {errors.barcode}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">Deskripsi <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                            errors.deskripsi ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                        }`}
                                        placeholder="Nama lengkap barang"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-900">Alias (Nama Pendek)</label>
                                    <input
                                        type="text"
                                        name="alias"
                                        value={formData.alias}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Nama pendek untuk tampilan"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">Kategori <span className="text-red-500">*</span></label>
                                        <select
                                            name="kategori_id"
                                            value={formData.kategori_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                                            required
                                        >
                                            <option value="">📂 Pilih Kategori</option>
                                            {kategoris.map((k) => (
                                                <option key={k.id} value={k.id}>{k.ket}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">Sub Kategori</label>
                                        <select
                                            name="kategorisub_id"
                                            value={formData.kategorisub_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                                            disabled={!formData.kategori_id}
                                        >
                                            <option value="">📑 Pilih Sub Kategori</option>
                                            {filteredKategorisubs.map((k) => (
                                                <option key={k.id} value={k.id}>{k.ket}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Satuan & Harga */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <Layers className="h-5 w-5 text-blue-600" />
                                    <h4 className="text-lg font-semibold text-gray-900">Satuan & Konversi</h4>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-900">Satuan Terkecil <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="satuan"
                                                value={formData.satuan}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Pcs, Botol, Sachet"
                                            />
                                            <p className="text-xs text-gray-600">Contoh: Pcs, Botol, Sachet</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-900">Isi per {formData.volume || 'Volume'} <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                name="isi"
                                                value={formData.isi}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="1"
                                            />
                                            <p className="text-xs text-gray-600">1 {formData.volume || 'Volume'} = {formData.isi || '?'} {formData.satuan || 'Satuan'}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-900">Volume/Kemasan</label>
                                            <input
                                                type="text"
                                                name="volume"
                                                value={formData.volume}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Box, Karton, Dus"
                                            />
                                            <p className="text-xs text-gray-600">Contoh: Box, Karton, Dus</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-blue-300">
                                        <div className="text-sm font-medium text-blue-900 mb-2">💡 Contoh Konversi:</div>
                                        <div className="text-sm text-gray-700 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">1 {formData.volume || 'Volume'}</span>
                                                <span>=</span>
                                                <span className="font-semibold text-blue-700">{formData.isi || '?'} {formData.satuan || 'Satuan'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Contoh: 1 Karton = 24 Botol</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 border-b pb-2 mt-8">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <h4 className="text-lg font-semibold text-gray-900">Harga per Satuan</h4>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            Harga Beli (per {formData.satuan || 'Satuan Terkecil'}) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-500 text-sm">Rp</span>
                                            <input
                                                type="number"
                                                name="harga_beli"
                                                value={formData.harga_beli}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        {formData.isi > 1 && formData.harga_beli > 0 && (
                                            <p className="text-xs text-gray-600">
                                                Harga per {formData.volume}: <span className="font-bold text-green-700">Rp {(formData.harga_beli * formData.isi).toLocaleString('id-ID')}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-900">
                                                Harga Jual 1 (per {formData.satuan || 'Satuan'}) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3.5 text-gray-500 text-sm">Rp</span>
                                                <input
                                                    type="number"
                                                    name="harga_jual1"
                                                    value={formData.harga_jual1}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </div>
                                            {formData.harga_beli > 0 && formData.harga_jual1 > 0 && (
                                                <p className="text-xs text-gray-600">
                                                    Margin: <span className={`font-bold ${formData.harga_jual1 > formData.harga_beli ? 'text-green-700' : 'text-red-700'}`}>
                                                        {((formData.harga_jual1 - formData.harga_beli) / formData.harga_beli * 100).toFixed(1)}%
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-900">
                                                Harga Jual 2 (per {formData.satuan || 'Satuan'})
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3.5 text-gray-500 text-sm">Rp</span>
                                                <input
                                                    type="number"
                                                    name="harga_jual2"
                                                    value={formData.harga_jual2}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                            {formData.harga_beli > 0 && formData.harga_jual2 > 0 && (
                                                <p className="text-xs text-gray-600">
                                                    Margin: <span className={`font-bold ${formData.harga_jual2 > formData.harga_beli ? 'text-green-700' : 'text-red-700'}`}>
                                                        {((formData.harga_jual2 - formData.harga_beli) / formData.harga_beli * 100).toFixed(1)}%
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Stok */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <Package2 className="h-5 w-5 text-orange-600" />
                                    <h4 className="text-lg font-semibold text-gray-900">Stok & Status</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 bg-orange-50 border border-orange-200 rounded-xl p-4">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            Minimum Stok (dalam {formData.satuan || 'Satuan'}) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="min_stock"
                                            value={formData.min_stock}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            min="0"
                                        />
                                        <p className="text-xs text-gray-600">
                                            Sistem akan memberi peringatan jika stok di bawah nilai ini
                                        </p>
                                        {formData.isi > 1 && formData.min_stock > 0 && (
                                            <p className="text-xs text-orange-700 font-semibold">
                                                ≈ {Math.ceil(formData.min_stock / formData.isi)} {formData.volume || 'Volume'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <label className="block text-sm font-semibold text-gray-900">Status Barang</label>
                                        <select
                                            name="st_aktif"
                                            value={formData.st_aktif}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        >
                                            <option value="1">✅ Aktif (Dapat Dijual)</option>
                                            <option value="0">❌ Nonaktif (Tidak Dapat Dijual)</option>
                                        </select>
                                        <p className="text-xs text-gray-600">
                                            Barang nonaktif tidak akan muncul di kasir
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="allow_sold_zero_stock"
                                            checked={formData.allow_sold_zero_stock}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-900">
                                                📦 Izinkan Penjualan saat Stok 0 atau Negatif
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Jika diaktifkan, barang tetap dapat dijual meskipun stok habis (backorder). Jika dimatikan, penjualan akan ditolak saat stok tidak cukup.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Harga Bertingkat */}
                        {currentStep === 4 && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">Harga Bertingkat (Quantity Based)</h4>
                                        <p className="text-sm text-gray-500 mt-1">Harga khusus berdasarkan jumlah pembelian minimum (opsional)</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddPrice}
                                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/30 text-sm cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Tambah Harga
                                    </button>
                                </div>

                                {prices.length > 0 ? (
                                    <div className="space-y-3">
                                        {prices.map((price, index) => (
                                            <div key={index} className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                                <div className="flex-1 grid grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Qty Min (dalam {formData.satuan || 'Satuan'})
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={price.qty}
                                                            onChange={(e) => handlePriceChange(index, 'qty', parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Harga Jual 1</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-gray-500 text-xs">Rp</span>
                                                            <input
                                                                type="number"
                                                                value={price.harga1}
                                                                onChange={(e) => handlePriceChange(index, 'harga1', parseFloat(e.target.value))}
                                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Harga Jual 2</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-gray-500 text-xs">Rp</span>
                                                            <input
                                                                type="number"
                                                                value={price.harga2}
                                                                onChange={(e) => handlePriceChange(index, 'harga2', parseFloat(e.target.value))}
                                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-end">
                                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={price.multiplier}
                                                                onChange={(e) => handlePriceChange(index, 'multiplier', e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 rounded"
                                                            />
                                                            Multiplier
                                                        </label>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePrice(index)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition cursor-pointer"
                                                    title="Hapus harga bertingkat"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 font-medium">Belum ada harga bertingkat</p>
                                        <p className="text-xs text-gray-500 mt-1">Klik tombol "Tambah Harga" untuk menambahkan harga khusus berdasarkan qty</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 pt-6 border-t">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-semibold transition-all cursor-pointer"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                Sebelumnya
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => router.visit('/admin/barang')}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all cursor-pointer"
                        >
                            Batal
                        </button>

                        <div className="flex-1" />

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 cursor-pointer"
                            >
                                Selanjutnya
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-green-500/30 cursor-pointer"
                            >
                                <Check className="h-5 w-5" />
                                {loading ? 'Menyimpan...' : (mode === 'create' ? '✨ Simpan Barang Baru' : '💾 Update Barang')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
