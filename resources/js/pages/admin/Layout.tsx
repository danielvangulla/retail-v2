import { ReactNode, useState, useEffect, useRef } from 'react';
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
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { props } = usePage();
    const auth = (props as any).auth;
    const currentUrl = (props as any).url || window.location.pathname;

    const navigationItems: NavItem[] = [
        { label: 'Dashboard', href: '/admin', icon: Home },
        {
            label: 'Setup',
            icon: Settings,
            submenu: [
                { label: 'Basic Settings', href: '/admin/setup' },
                { label: 'Kategori', href: '/admin/kategori' },
                { label: 'Sub-Kategori', href: '/admin/kategorisub' },
                { label: 'Barang', href: '/admin/barang' },
            ],
        },
        {
            label: 'Pembelian',
            icon: Package,
            submenu: [
                { label: 'Input Baru', href: '/admin/pembelian-create' },
                { label: 'History', href: '/admin/pembelian' },
                { label: 'Retur', href: '/admin/pembelian-retur' },
            ],
        },
        {
            label: 'Inventory',
            icon: Package,
            submenu: [
                { label: 'Stok Opname', href: '/admin/opname' },
                { label: 'Kartu Stok', href: '/admin/kartu-stok' },
            ],
        },
        { label: 'User', href: '/admin/user', icon: Users },
        { label: 'Laporan', href: '/admin/report/sales', icon: BarChart3 },
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
                    {/* Removed - moved to user badge in top bar */}
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

                            <div className="flex items-center gap-4 relative" ref={userMenuRef}>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">{auth?.user?.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {auth?.user?.level === 1 ? '👑 Supervisor' : '🛒 Kasir'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="w-11 h-11 bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 ring-2 ring-white/50 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 cursor-pointer"
                                >
                                    {auth?.user?.name?.charAt(0).toUpperCase()}
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden z-50 w-48">
                                        <button
                                            onClick={() => {
                                                router.visit('/kasir');
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer"
                                        >
                                            <span>🛒</span>
                                            <span>Halaman Kasir</span>
                                        </button>

                                        <div className="border-t border-gray-100/50"></div>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50/50 transition-colors duration-200 cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
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
