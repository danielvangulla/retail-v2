import { Head, usePage } from '@inertiajs/react';
import { ShoppingCart, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import axios from '@/lib/axios';

interface LoginChoiceProps {
    userName: string;
    csrf_token?: string;
}

export default function LoginChoice({ userName, csrf_token }: LoginChoiceProps) {
    const { props } = usePage();
    const [isLoading, setIsLoading] = useState(false);

    async function handleChoice(destination: 'kasir' | 'admin') {
        try {
            setIsLoading(true);
            const response = await axios.post('/login-choice', { 
                destination,
                _token: csrf_token || (props as any)?.csrf_token
            });

            // If successful, redirect based on response
            if (response.status === 200 && response.data?.redirect) {
                setTimeout(() => {
                    window.location.href = response.data.redirect;
                }, 300);
            }
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    }

    async function handleLogout() {
        try {
            setIsLoading(true);
            const response = await axios.post('/logout', {
                _token: csrf_token || (props as any)?.csrf_token
            });

            if (response.status === 200 || response.status === 204) {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 300);
            }
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    }

    return (
        <>
            <Head title="Pilih Halaman - POS System" />
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Choice Card */}
                <div className="relative w-full max-w-lg">
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Header */}
                        <div className="bg-linear-to-r from-blue-600 to-cyan-500 px-6 sm:px-8 py-8">
                            <div className="text-center">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Selamat Datang</h1>
                                <p className="text-blue-100 text-lg font-semibold">{userName}</p>
                                <p className="text-blue-100 text-sm mt-1">Silakan pilih halaman untuk diakses</p>
                            </div>
                        </div>

                        {/* Choice Buttons */}
                        <div className="px-6 sm:px-8 py-8 sm:py-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {/* Kasir Button */}
                                <button
                                    onClick={() => handleChoice('kasir')}
                                    disabled={isLoading}
                                    className="group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 rounded-xl transition-all"></div>
                                    <div className="relative flex flex-col items-center gap-2">
                                        <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                            <ShoppingCart className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm">Halaman Kasir</span>
                                        <span className="text-xs text-gray-600">Proses transaksi penjualan</span>
                                    </div>
                                </button>

                                {/* Admin Button */}
                                <button
                                    onClick={() => handleChoice('admin')}
                                    disabled={isLoading}
                                    className="group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 rounded-xl transition-all"></div>
                                    <div className="relative flex flex-col items-center gap-2">
                                        <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                                            <Settings className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm">Halaman Admin</span>
                                        <span className="text-xs text-gray-600">Kelola sistem & barang</span>
                                    </div>
                                </button>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 px-4 border border-red-600 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 sm:px-8 py-4 bg-gray-50">
                            <p className="text-center text-xs sm:text-sm text-gray-600">
                                Sistem Kasir Modern • retail-v2
                            </p>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-2xl"></div>
                </div>
            </div>
        </>
    );
}
