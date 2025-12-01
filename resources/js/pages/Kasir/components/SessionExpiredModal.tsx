import { router } from '@inertiajs/react';

interface SessionExpiredModalProps {
    show: boolean;
}

export default function SessionExpiredModal({ show }: SessionExpiredModalProps) {
    if (!show) return null;

    const handleRedirectToLogin = () => {
        router.visit('/login');
    };

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-linear-to-br from-slate-800 to-slate-700 border-2 border-red-500 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-11/12 sm:w-full">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-red-500/20 rounded-full p-4">
                        <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">
                    Sesi Berakhir
                </h2>

                {/* Message */}
                <p className="text-slate-300 text-center mb-6 text-sm sm:text-base">
                    Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.
                </p>

                {/* Button */}
                <button
                    onClick={handleRedirectToLogin}
                    className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Login Kembali
                </button>
            </div>
        </div>
    );
}
