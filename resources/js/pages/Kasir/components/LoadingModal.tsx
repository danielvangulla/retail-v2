import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
    show: boolean;
    message?: string;
}

export default function LoadingModal({ show, message = 'Memproses...' }: LoadingModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-linear-to-br from-slate-800 to-slate-700 border-2 border-slate-600 rounded-2xl shadow-2xl p-8 max-w-sm w-11/12 sm:w-full">
                {/* Spinner */}
                <div className="flex justify-center mb-4">
                    <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                </div>

                {/* Message */}
                <p className="text-white text-center text-lg font-semibold">
                    {message}
                </p>
            </div>
        </div>
    );
}
