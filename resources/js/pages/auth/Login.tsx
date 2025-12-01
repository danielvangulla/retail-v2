import { Head, useForm } from '@inertiajs/react';
import { Lock, User, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({ status }: LoginProps) {
    const form = useForm({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/login', {
            onError: () => {
                // Error handling
            }
        });
    }

    return (
        <>
            <Head title="Sign in - POS System" />
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
                </div>

                {/* Login Card */}
                <div className="relative w-full max-w-md">
                    {/* Card with glow effect */}
                    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Header */}
                        <div className="bg-linear-to-br from-blue-600 to-cyan-500 px-6 sm:px-8 py-8 sm:py-10">
                            <div className="flex items-center justify-center mb-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                                    <ShoppingCart className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Point of Sale</h1>
                            <p className="text-blue-100 text-center text-sm mt-1">Sistem Kasir Modern</p>
                        </div>

                        {/* Form Body */}
                        <div className="px-6 sm:px-8 py-8 sm:py-10">
                            {/* Status/Error Message */}
                            {status && (
                                <div className="mb-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-800 text-xs sm:text-sm font-medium">{status}</p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* Username Field */}
                                <div>
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={form.data.username}
                                            onChange={(e) => form.setData('username', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all duration-200"
                                            placeholder="Masukkan username"
                                            autoFocus
                                            disabled={form.processing}
                                        />
                                    </div>
                                    {form.errors.username && (
                                        <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{form.errors.username}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all duration-200"
                                            placeholder="Masukkan password"
                                            disabled={form.processing}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {form.errors.password && (
                                        <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">{form.errors.password}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full py-3 px-4 bg-linear-to-br from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-6 flex items-center justify-center gap-2 hover:cursor-pointer"
                                >
                                    {form.processing ? (
                                        <>
                                            <div className="animate-spin">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </div>
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-5 w-5" />
                                            <span>Masuk</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer Info */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-center text-xs sm:text-sm text-gray-600">
                                    NOVAQUILA • <span className="font-semibold">Retail v1.2</span>
                                </p>
                            </div>
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
