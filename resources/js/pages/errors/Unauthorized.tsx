import { Head, router } from '@inertiajs/react';
import { AlertCircle, Home, LogOut } from 'lucide-react';

interface UnauthorizedProps {
    message: string;
    userLevel: number;
}

export default function Unauthorized({ message, userLevel }: UnauthorizedProps) {
    const handleGoHome = () => {
        if (userLevel !== 1) {
            router.visit('/kasir');
        } else {
            router.visit('/login-choice');
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Head title="Akses Ditolak" />
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Header */}
                        <div className="bg-linear-to-r from-red-600 to-orange-500 px-6 sm:px-8 py-8 sm:py-10">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                                    <AlertCircle className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Akses Ditolak</h1>
                            <p className="text-red-100 text-center text-sm mt-1">403 - Unauthorized</p>
                        </div>

                        {/* Content */}
                        <div className="px-6 sm:px-8 py-8 sm:py-10">
                            <div className="mb-6">
                                <p className="text-gray-700 text-center text-sm sm:text-base leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleGoHome}
                                    className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <Home className="h-5 w-5" />
                                    Kembali ke Halaman Utama
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 px-6 sm:px-8 py-4 bg-gray-50">
                            <p className="text-center text-xs sm:text-sm text-gray-600">
                                Anda tidak memiliki izin untuk mengakses halaman ini
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
