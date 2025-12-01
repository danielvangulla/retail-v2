import { ReactNode, useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Menu, X, LogOut, Home, Package, Tag, Users, BarChart3, Settings, Loader } from 'lucide-react';

interface AdminLayoutProps {
    title: string;
    children: ReactNode;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { props } = usePage();
    const auth = (props as any).auth;

    useEffect(() => {
        const handleBefore = () => setIsLoading(true);
        const handleFinish = () => setIsLoading(false);

        const unsubscribeBefore = router.on('before', handleBefore);
        const unsubscribeFinish = router.on('finish', handleFinish);

        return () => {
            unsubscribeBefore();
            unsubscribeFinish();
        };
    }, []);

    const navigationItems = [
        { label: 'Dashboard', href: '/back', icon: Home },
        { label: 'Barang', href: '/back/barang', icon: Package },
        { label: 'Kategori', href: '/back/kategori', icon: Tag },
        { label: 'User', href: '/back/user', icon: Users },
        { label: 'Laporan', href: '/back/report/sales', icon: BarChart3 },
    ];

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin logout?')) {
            router.post('/logout');
        }
    };

    return (
        <>
            <Head title={`Admin - ${title}`} />
            <div className={`flex h-screen bg-gray-100 ${isLoading ? 'opacity-60' : ''} transition-opacity duration-200`}>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
                            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                            <p className="text-gray-900 font-medium">Memuat halaman...</p>
                        </div>
                    </div>
                )}
                {/* Sidebar */}
                <aside
                    className={`${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } fixed left-0 top-0 z-40 h-full w-64 bg-slate-800 text-white shadow-lg transition-transform duration-300 lg:translate-x-0 lg:relative`}
                >
                    {/* Logo */}
                    <div className="border-b border-slate-700 p-6">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-blue-400" />
                            <span className="text-lg font-bold">Retail Admin</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <a
                                            href={item.href}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.visit(item.href);
                                                setSidebarOpen(false);
                                            }}
                                            className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors"
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout - Bottom */}
                    <div className="absolute bottom-0 w-full border-t border-slate-700 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600/10 text-red-400 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <header className="border-b border-gray-200 bg-white shadow">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                {sidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>

                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">{auth?.user?.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {auth?.user?.level === 1 ? 'Supervisor' : 'Kasir'}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {auth?.user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto">
                        <div className="p-4 sm:p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
