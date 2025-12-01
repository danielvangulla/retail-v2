import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface Komplemen {
    id: string;
    name: string;
}

interface TransaksiDetail {
    sku: string;
    qty: number;
    harga_dasar: number;
    disc_item: number;
    subtotal: number;
    barang?: {
        id: string;
        deskripsi: string;
        alias: string;
    };
}

interface TransaksiData {
    id: string;
    netto: number;
    tax: number;
    service: number;
    bayar: number;
    details?: TransaksiDetail[];
}

interface KomplemenModalProps {
    show: boolean;
    transaksiId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function KomplemenModal({
    show,
    transaksiId,
    onClose,
    onSuccess,
}: KomplemenModalProps) {
    const passwordRef = useRef<HTMLInputElement>(null);
    const [komplemens, setKomplemens] = useState<Komplemen[]>([]);
    const [transaksiData, setTransaksiData] = useState<TransaksiData | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedKomplemen, setSelectedKomplemen] = useState<string>('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState<'input' | 'confirm'>('input');

    useEffect(() => {
        if (show) {
            fetchKomplemens();
            fetchTransaksi();
            setPassword('');
            setSelectedKomplemen('');
            setError('');
            setStep('input');
            setTimeout(() => passwordRef.current?.focus(), 100);
        }
    }, [show]);

    const fetchTransaksi = async () => {
        try {
            const response = await axios.get(`/transaksi-detail/${transaksiId}`);
            if (response.data.status === 'ok') {
                setTransaksiData(response.data.data);
            }
        } catch (err: any) {
            console.error('Error fetching transaksi:', err);
        }
    };

    const fetchKomplemens = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/komplemen-list');
            console.log('Komplemen response:', response);
            if (response.data.status === 'ok') {
                setKomplemens(response.data.data);
            } else {
                setError(response.data.msg || 'Gagal memuat data komplemen');
            }
        } catch (err: any) {
            console.error('Komplemen API Error:', err);
            setError(err.response?.data?.msg || err.message || 'Error memuat data komplemen');
        } finally {
            setLoading(false);
        }
    };

    const handleProses = async () => {
        if (!selectedKomplemen || !password) {
            setError('Pilih komplemen dan masukkan password');
            return;
        }

        setProcessing(true);
        setError('');
        try {
            const response = await axios.post('/komplemen-proses', {
                transaksi_id: transaksiId,
                komplemen_id: selectedKomplemen,
                pin: password,
            });

            if (response.data.status === 'ok') {
                setStep('confirm');
                setProcessing(false);
            } else {
                setError(response.data.msg || 'Gagal memproses komplemen');
                setProcessing(false);
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Error memproses komplemen');
            setProcessing(false);
        }
    };

    const handleConfirmFinish = async () => {
        setProcessing(true);
        try {
            // Panggil API untuk final confirmation/update status
            const response = await axios.post(`/komplemen-finish/${transaksiId}`);
            
            if (response.data.status === 'ok') {
                setPassword('');
                setSelectedKomplemen('');
                setStep('input');
                onSuccess?.();
                onClose();
            } else {
                setError(response.data.msg || 'Gagal menyelesaikan komplemen');
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Error menyelesaikan komplemen');
        } finally {
            setProcessing(false);
        }
    };

    const handleBackToInput = () => {
        setStep('input');
        setPassword('');
        setError('');
        setTimeout(() => passwordRef.current?.focus(), 100);
    };

    if (!show) return null;

    const getKomplemenName = () => {
        const komplemen = komplemens.find(k => k.id === selectedKomplemen);
        return komplemen?.name || '';
    };

    // Step 1: Input Password
    if (step === 'input') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                <div className="bg-white text-black rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Proses Komplemen</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Memuat data komplemen...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Disetujui Oleh</label>
                                <select
                                    value={selectedKomplemen}
                                    onChange={(e) => setSelectedKomplemen(e.target.value)}
                                    disabled={processing}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                >
                                    <option value="">-- Pilih --</option>
                                    {komplemens.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password Supervisor</label>
                                <input
                                    ref={passwordRef}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={processing}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && selectedKomplemen && password) {
                                            handleProses();
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="••••••"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleProses}
                                    disabled={processing || !selectedKomplemen || !password}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                                >
                                    {processing ? 'Proses...' : 'Proses'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Step 2: Confirmation
    if (step === 'confirm') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
                <div className="bg-white text-black rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Konfirmasi Komplemen</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Transaksi ID:</span>
                            <span className="font-medium">{transaksiId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Disetujui Oleh:</span>
                            <span className="font-medium">{getKomplemenName()}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 mt-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span>Rp {(transaksiData?.netto || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax:</span>
                                <span>Rp {(transaksiData?.tax || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Service:</span>
                                <span>Rp {(transaksiData?.service || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
                                <span>Total:</span>
                                <span>Rp {(transaksiData?.bayar || 0).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    {transaksiData?.details && transaksiData.details.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Item Transaksi:</p>
                            <div className="max-h-48 overflow-y-auto bg-gray-50 rounded p-2 space-y-1">
                                {transaksiData.details.map((detail, idx) => (
                                    <div key={idx} className="text-sm flex justify-between">
                                        <span className="flex-1">{detail.barang?.deskripsi || detail.barang?.alias || detail.sku}</span>
                                        <span className="text-right">
                                            {detail.qty}x Rp {(detail.harga_dasar).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleBackToInput}
                            disabled={processing}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 font-medium"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={handleConfirmFinish}
                            disabled={processing}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                        >
                            {processing ? 'Selesaikan...' : 'Selesaikan'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
