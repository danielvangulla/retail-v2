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
            <div className={`flex h-screen bg-linear-to-br from-gray-50 via-blue-50 to-gray-100 ${isLoading ? 'opacity-90' : ''} transition-opacity duration-200`}>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="bg-white/95 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 border border-white/20 ">
                            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                            <p className="text-gray-900 font-semibold">Loading...</p>
                        </div>
                    </div>
                )}
                {/* Sidebar */}
                <aside
                    className={`${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } fixed left-0 top-0 z-40 h-full w-64 bg-linear-to-b from-white via-blue-50/50 to-gray-50 text-gray-900 shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:relative overflow-y-auto border-r border-gray-200/50`}
                >
                    {/* Logo */}
                    <div className="border-b border-gray-200/50 p-6 sticky top-0 bg-linear-to-r from-white to-blue-50/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-linear-to-br from-blue-600 to-blue-500 rounded-lg shadow-lg">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Retail</span>
                                <p className="text-xs text-gray-500 font-medium">Admin Dashboard</p>
                            </div>
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
                                                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                                                        isSubmenuActive || isExpanded
                                                            ? 'bg-linear-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border border-blue-200/50 shadow-sm'
                                                            : 'hover:bg-gray-100/50 text-gray-700 hover:shadow-sm'
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
                                                    <ul className="mt-2 space-y-1 pl-6 border-l-2 border-blue-300/30">
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
                                                                        className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                                                                            isSubActive
                                                                                ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                                                                                : 'text-gray-600 hover:bg-linear-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 hover:shadow-sm'
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
                                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                                                    isItemActive
                                                        ? 'bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                                                        : 'hover:bg-gray-100/50 text-gray-700 hover:shadow-sm'
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
                    <div className="absolute bottom-0 w-full border-t border-gray-200/50 p-4 bg-linear-to-t from-gray-50 to-transparent backdrop-blur-sm">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-red-50 hover:shadow-md text-red-600 transition-all duration-200 cursor-pointer"
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
                    <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-lg shadow-sm">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100/50 rounded-lg transition-colors duration-200 cursor-pointer"
                            >
                                {sidebarOpen ? (
                                    <X className="h-6 w-6 text-gray-700" />
                                ) : (
                                    <Menu className="h-6 w-6 text-gray-700" />
                                )}
                            </button>

                            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h1>

                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">{auth?.user?.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {auth?.user?.level === 1 ? '👑 Supervisor' : '🛒 Kasir'}
                                    </p>
                                </div>
                                <div className="w-11 h-11 bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 ring-2 ring-white/50">
                                    {auth?.user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-100">
                        <div className="p-4 sm:p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
