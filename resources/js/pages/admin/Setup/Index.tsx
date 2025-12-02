import { Head, usePage, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import AdminLayout from '../Layout';
import AlertModal from '@/pages/Kasir/components/AlertModal';

interface SetupData {
    nama: string;
    alamat1: string;
    alamat2: string;
    telepon?: string;
    email?: string;
    npwp?: string;
}

interface Props {
    setup: SetupData | null;
    setupId: string | null;
}

export default function SetupIndex({ setup, setupId }: Props) {
    const [formData, setFormData] = useState<SetupData>(
        setup || {
            nama: '',
            alamat1: '',
            alamat2: '',
            telepon: '',
            email: '',
            npwp: '',
        }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [alertState, setAlertState] = useState({
        show: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'success' | 'warning' | 'error',
        onConfirm: () => {},
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', onConfirm?: () => void) => {
        setAlertState({
            show: true,
            title,
            message,
            type,
            onConfirm: onConfirm || (() => setAlertState(prev => ({ ...prev, show: false }))),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/back/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.status === 'ok') {
                showAlert('Sukses', data.msg, 'success', () => {
                    setAlertState(prev => ({ ...prev, show: false }));
                });
            } else {
                showAlert('Error', data.msg, 'error', () => {
                    setAlertState(prev => ({ ...prev, show: false }));
                });
            }
        } catch (error) {
            showAlert('Error', 'Terjadi kesalahan saat menyimpan data', 'error', () => {
                setAlertState(prev => ({ ...prev, show: false }));
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Setup Basic" />

            <AdminLayout title={'Basic Setup'}>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Setup Basic</h1>
                                <p className="text-sm sm:text-base text-gray-600">Konfigurasi informasi toko dan personalisasi aplikasi</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-white/60 p-4 sm:p-6 sm:p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Nama Toko */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Nama Toko <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="nama"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        placeholder="Contoh: Toko ABC"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                {/* Alamat 1 */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="alamat1" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Alamat Jalan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="alamat1"
                                        name="alamat1"
                                        value={formData.alamat1}
                                        onChange={handleChange}
                                        placeholder="Contoh: Jl. Merdeka No. 123"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                {/* Alamat 2 (Kota) */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="alamat2" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Kota / Kabupaten <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="alamat2"
                                        name="alamat2"
                                        value={formData.alamat2}
                                        onChange={handleChange}
                                        placeholder="Contoh: Jakarta Pusat"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                {/* Telepon */}
                                <div>
                                    <label htmlFor="telepon" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Telepon
                                    </label>
                                    <input
                                        type="text"
                                        id="telepon"
                                        name="telepon"
                                        value={formData.telepon || ''}
                                        onChange={handleChange}
                                        placeholder="Contoh: 021-1234567"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        placeholder="Contoh: toko@email.com"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* NPWP */}
                                <div className="sm:col-span-2">
                                    <label htmlFor="npwp" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        NPWP
                                    </label>
                                    <input
                                        type="text"
                                        id="npwp"
                                        name="npwp"
                                        value={formData.npwp || ''}
                                        onChange={handleChange}
                                        placeholder="Contoh: 12.345.678.9-012.345"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
                                <p className="text-sm text-blue-900">
                                    <span className="font-semibold">💡 Informasi:</span> Data yang Anda masukkan di sini akan ditampilkan di struk, laporan, dan halaman cetak lainnya.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 sm:px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 sm:px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Alert Modal */}
                {alertState.show && (
                    <AlertModal
                        show={alertState.show}
                        title={alertState.title}
                        message={alertState.message}
                        type={alertState.type}
                        onConfirm={() => {
                            alertState.onConfirm();
                        }}
                    />
                )}
            </AdminLayout>
        </>
    );
}
