import { router } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';

interface KasirMenuBarProps {
    userName?: string;
}

export default function KasirMenuBar({ userName = 'Kasir' }: KasirMenuBarProps) {
    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            router.post('/logout');
        }
    };

    return (
        <div className="bg-linear-to-r from-slate-800 to-slate-700 border-b border-slate-600 px-3 sm:px-4 py-2 flex items-center justify-between shadow-lg">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 bg-blue-600 rounded-lg shadow-md">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                </div>
                <div>
                    <h1 className="text-sm sm:text-base font-bold text-white">Point of Sale</h1>
                    <p className="text-[10px] sm:text-xs text-slate-300">Kasir</p>
                </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <User className="h-4 w-4 text-slate-300" />
                    <span className="text-sm text-slate-200">{userName}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md transition-all duration-200 group"
                    title="Logout"
                >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs sm:text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
