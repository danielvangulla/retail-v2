import { ReactNode, useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Menu, X, LogOut, Home, Package, Tag, Users, BarChart3, Settings, Loader, ChevronDown } from 'lucide-react';

interface AdminLayoutProps {
    title: string;
    children: ReactNode;
}

interface NavItem {
    label: string;
    href?: string;
    icon: React.ElementType;
    submenu?: NavSubItem[];
}

interface NavSubItem {
    label: string;
    href: string;
}

export default function AdminLayout({ title, children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const { props } = usePage();
    const auth = (props as any).auth;
    const currentUrl = (props as any).url || window.location.pathname;

    const navigationItems: NavItem[] = [
        { label: 'Dashboard', href: '/back', icon: Home },
        {
            label: 'Setup',
            icon: Settings,
            submenu: [
                { label: 'Kategori', href: '/back/kategori' },
                { label: 'Sub-Kategori', href: '/back/kategorisub' },
                { label: 'Barang', href: '/back/barang' },
            ],
        },
        {
            label: 'Pembelian',
            icon: Package,
            submenu: [
                { label: 'Input Baru', href: '/back/pembelian/create' },
                { label: 'History', href: '/back/pembelian' },
            ],
        },
        { label: 'User', href: '/back/user', icon: Users },
        { label: 'Laporan', href: '/back/report/sales', icon: BarChart3 },
    ];

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

    // Determine which menu should be expanded based on current URL
    useEffect(() => {
        navigationItems.forEach((item) => {
            if (item.submenu) {
                // Check if any submenu item matches the current URL
                const isActive = item.submenu.some((sub) => {
                    // Match both exact and starting paths
                    return currentUrl === sub.href || currentUrl.startsWith(sub.href + '/');
                });
                if (isActive) {
                    setExpandedMenu(item.label);
                }
            }
        });
    }, [currentUrl]);

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin logout?')) {
            router.post('/logout');
        }
    };

    const toggleMenu = (label: string) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    const handleNavClick = (href: string) => {
        router.visit(href);
        setSidebarOpen(false);
    };

    return (
        <>
            <Head title={`Admin - ${title}`} />
            <div className={`flex h-screen bg-slate-900 ${isLoading ? 'opacity-60' : ''} transition-opacity duration-200`}>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                        <div className="bg-slate-800 rounded-lg shadow-lg-lg p-8 flex flex-col items-center gap-4 border border-slate-700">
                            <Loader className="h-8 w-8 text-blue-400 animate-spin" />
                            <p className="text-white font-medium">Memuat halaman...</p>
                        </div>
                    </div>
                )}
                {/* Sidebar */}
                <aside
                    className={`${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } fixed left-0 top-0 z-40 h-full w-64 bg-slate-800 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:relative overflow-y-auto`}
                >
                    {/* Logo */}
                    <div className="border-b border-slate-700 p-6 sticky top-0 bg-slate-800">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-blue-400" />
                            <span className="text-lg font-bold">Retail Admin</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 pb-24">
                        <ul className="space-y-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const hasSubmenu = !!item.submenu;
                                const isExpanded = expandedMenu === item.label;
                                
                                // Check if current item is active
                                const isItemActive = item.href ? (currentUrl === item.href || currentUrl.startsWith(item.href + '/')) && item.href !== '/back' : false;
                                const isSubmenuActive = item.submenu ? item.submenu.some((sub) => currentUrl === sub.href || currentUrl.startsWith(sub.href + '/')) : false;

                                return (
                                    <li key={item.label}>
                                        {hasSubmenu ? (
                                            <>
                                                <button
                                                    onClick={() => toggleMenu(item.label)}
                                                    className={`w-full flex items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                                        isSubmenuActive || isExpanded
                                                            ? 'bg-slate-700 text-blue-400'
                                                            : 'hover:bg-slate-700 text-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="h-5 w-5" />
                                                        <span>{item.label}</span>
                                                    </div>
                                                    <ChevronDown
                                                        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    />
                                                </button>

                                                {isExpanded && item.submenu && (
                                                    <ul className="mt-1 space-y-1 pl-6 border-l border-slate-700">
                                                        {item.submenu.map((subitem) => {
                                                            const isSubActive = currentUrl === subitem.href || currentUrl.startsWith(subitem.href + '/');
                                                            return (
                                                                <li key={subitem.href}>
                                                                    <a
                                                                        href={subitem.href}
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleNavClick(subitem.href);
                                                                        }}
                                                                        className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                                                                            isSubActive
                                                                                ? 'bg-blue-600 text-white font-medium'
                                                                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {subitem.label}
                                                                    </a>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </>
                                        ) : (
                                            <a
                                                href={item.href}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleNavClick(item.href!);
                                                }}
                                                className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                                    isItemActive
                                                        ? 'bg-blue-600 text-white'
                                                        : 'hover:bg-slate-700 text-white'
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{item.label}</span>
                                            </a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout - Bottom */}
                    <div className="absolute bottom-0 w-full border-t border-slate-700 p-4 bg-slate-800">
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
                    <header className="border-b border-slate-700 bg-slate-800 shadow-lg">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition"
                            >
                                {sidebarOpen ? (
                                    <X className="h-6 w-6 text-white" />
                                ) : (
                                    <Menu className="h-6 w-6 text-white" />
                                )}
                            </button>

                            <h1 className="text-2xl font-bold text-white">{title}</h1>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-white">{auth?.user?.name}</p>
                                    <p className="text-xs text-slate-400">
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
                    <main className="flex-1 overflow-auto bg-slate-900">
                        <div className="p-4 sm:p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
