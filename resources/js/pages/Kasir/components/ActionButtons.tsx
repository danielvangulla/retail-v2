interface ActionButtonsProps {
    showResetButton: boolean;
    isPiutang: boolean;
    selectedItemsCount: number;
    onReset: () => void;
    onPrintLast: () => void;
    onDiskon: () => void;
    onKomplemen: () => void;
    onTogglePiutang: () => void;
    onPayment: () => void;
}

export default function ActionButtons({
    showResetButton,
    isPiutang,
    selectedItemsCount,
    onReset,
    onPrintLast,
    onDiskon,
    onKomplemen,
    onTogglePiutang,
    onPayment,
}: ActionButtonsProps) {
    return (
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 whitespace-nowrap">
            {showResetButton && (
                <button
                    onClick={onReset}
                    className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400
                             text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
                >
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <span className="hidden sm:inline">Reset</span>
                    <span className="sm:hidden">RST</span>
                </button>
            )}

            <button
                onClick={onPrintLast}
                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400
                         text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
            >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                <span className="hidden sm:inline">Last Struk</span>
                <span className="sm:hidden">PRT</span>
            </button>

            <button
                onClick={onDiskon}
                disabled={selectedItemsCount === 0}
                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400
                         text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap shrink-0"
            >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="hidden sm:inline">Diskon</span>
                <span className="sm:hidden">DSK</span>
            </button>

            <button
                onClick={onKomplemen}
                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400
                         text-white rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
            >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                </svg>
                <span className="hidden sm:inline">Komplemen</span>
                <span className="sm:hidden">KOM</span>
            </button>

            <button
                onClick={onTogglePiutang}
                className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-linear-to-br rounded-md sm:rounded-lg font-medium text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer whitespace-nowrap shrink-0 ${
                    isPiutang
                        ? 'from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500 ring-2 ring-orange-400'
                        : 'from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400'
                } text-white`}
            >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span className="hidden sm:inline">{isPiutang ? 'Piutang: ON' : 'Piutang'}</span>
                <span className="sm:hidden">{isPiutang ? 'ON' : 'PIU'}</span>
            </button>

            <button
                onClick={onPayment}
                disabled={selectedItemsCount === 0}
                className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 bg-linear-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                         text-white rounded-md sm:rounded-lg font-semibold text-xs sm:text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 ring-2 ring-blue-400/50 cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap shrink-0"
            >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                <span className="hidden sm:inline">Pembayaran</span>
                <span className="sm:hidden">BAYAR</span>
            </button>
        </div>
    );
}
