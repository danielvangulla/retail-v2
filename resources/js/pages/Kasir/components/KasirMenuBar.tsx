import { router } from '@inertiajs/react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface KasirMenuBarProps {
    userName?: string;
    userLevel?: number;
    onLogoutClick?: () => void;
}

export default function KasirMenuBar({ userName = 'Kasir', userLevel = 2, onLogoutClick }: KasirMenuBarProps) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    const handleLogout = () => {
        if (onLogoutClick) {
            onLogoutClick();
        } else {
            // Fallback: direct logout if no handler provided
            router.post('/logout');
        }
    };

    const handleAdminClick = () => {
        router.visit('/admin');
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
                    <p className="text-[10px] sm:text-xs text-slate-300">Novaquila.id</p>
                </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 relative" ref={userMenuRef}>
                <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <User className="h-4 w-4 text-slate-300" />
                    <span className="text-sm text-slate-200">{userName}</span>
                </div>

                {/* User Badge Button */}
                <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 ring-2 ring-white/50 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                >
                    {userName?.charAt(0).toUpperCase()}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-slate-700 rounded-xl shadow-2xl border border-slate-600 overflow-hidden z-50 w-48">

                        {/* Admin Menu - Only for Supervisor */}
                        {userLevel === 1 && (
                            <>
                                <button
                                    onClick={() => {
                                        handleAdminClick();
                                        setUserMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-600/50 transition-colors duration-200 cursor-pointer"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Halaman Admin</span>
                                </button>

                                <div className="border-t border-slate-600"></div>
                            </>
                        )}

                        <button
                            onClick={() => {
                                handleLogout();
                                setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
