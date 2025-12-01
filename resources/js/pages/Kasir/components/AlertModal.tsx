import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertModalProps {
    show: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    confirmText?: string;
    onConfirm: () => void;
}

export default function AlertModal({
    show,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    onConfirm
}: AlertModalProps) {
    if (!show) return null;

    const icons = {
        info: <Info className="h-12 w-12 text-blue-500" />,
        success: <CheckCircle className="h-12 w-12 text-green-500" />,
        warning: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
        error: <XCircle className="h-12 w-12 text-red-500" />
    };

    const bgColors = {
        info: 'bg-blue-500/20',
        success: 'bg-green-500/20',
        warning: 'bg-yellow-500/20',
        error: 'bg-red-500/20'
    };

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-linear-to-br from-slate-800 to-slate-700 border-2 border-slate-600 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-11/12 sm:w-full">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`${bgColors[type]} rounded-full p-4`}>
                        {icons[type]}
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-slate-300 text-center mb-6 text-sm sm:text-base whitespace-pre-line">
                    {message}
                </p>

                {/* Button */}
                <button
                    onClick={onConfirm}
                    className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    );
}
