import { Head, router } from '@inertiajs/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface UnauthorizedProps {
    status?: number;
    message?: string;
    userLevel?: number;
}

export default function Unauthorized({ status = 403, message, userLevel }: UnauthorizedProps) {
    const defaultMessages: Record<number, string> = {
        403: message || 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        401: 'Silakan login terlebih dahulu.',
        404: 'Halaman tidak ditemukan.',
    };

    const displayMessage = message || defaultMessages[status] || 'Akses ditolak.';
    return (
        <>
            <Head title={`${status} - ${message}`} />
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Error Card */}
                <div className="relative w-full max-w-md">
                    {/* Card with glow effect */}
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Header */}
                        <div className="bg-linear-to-br from-red-600 to-orange-500 px-6 sm:px-8 py-8 sm:py-10">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                                    <ShieldAlert className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">{status}</h1>
                            <p className="text-red-100 text-center text-sm mt-1">Access Denied</p>
                        </div>

                        {/* Body */}
                        <div className="px-6 sm:px-8 py-8 sm:py-10">
                            <div className="text-center space-y-4">
                                <p className="text-gray-700 font-medium">
                                    {displayMessage}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    Silakan hubungi administrator jika Anda percaya ini adalah kesalahan.
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => router.visit('/')}
                                className="w-full mt-6 py-3 px-4 bg-linear-to-br from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 flex items-center justify-center gap-2 hover:cursor-pointer"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Kembali ke Beranda</span>
                            </button>

                            {/* Footer Info */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-center text-xs sm:text-sm text-gray-600">
                                    NOVAQUILA.ID • <span className="font-semibold">Retail v1.2</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-2xl"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl"></div>
                </div>
            </div>
        </>
    );
}
