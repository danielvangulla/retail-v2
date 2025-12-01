/**
 * Kasir Theme Component
 *
 * Theme dan styling untuk halaman Kasir/POS
 * Menggunakan gradien slate dengan accent blue
 *
 * Design System:
 * - Background: linear-gradient slate-900 -> slate-800 -> slate-900
 * - Cards: slate-800 -> slate-700 dengan border slate-600
 * - Primary Action: blue-600 -> blue-500
 * - Secondary: emerald, amber, orange untuk berbagai actions
 * - Destructive: red-600 -> red-500
 * - Text: white/slate-200 dengan hierarchy
 * - Shadows: 2xl untuk elevation
 * - Rounded: xl untuk modern look
 * - Transitions: 200ms untuk smooth interactions
 */

export const kasirTheme = {
    // Background colors
    background: {
        main: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
        card: 'bg-gradient-to-br from-slate-800 to-slate-700',
        header: 'bg-gradient-to-br from-slate-700 to-slate-600',
        input: 'bg-slate-700/50',
        modal: 'bg-slate-800',
    },

    // Border styles
    border: {
        default: 'border border-slate-600',
        focus: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    },

    // Text colors
    text: {
        primary: 'text-white',
        secondary: 'text-slate-200',
        muted: 'text-slate-400',
        accent: 'text-blue-400',
    },

    // Button variants
    button: {
        primary: 'bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white',
        success: 'bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white',
        warning: 'bg-gradient-to-br from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white',
        danger: 'bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white',
        secondary: 'bg-gradient-to-br from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white',
        orange: 'bg-gradient-to-br from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white',
    },

    // Common styles
    common: {
        rounded: 'rounded-xl',
        roundedLg: 'rounded-lg',
        shadow: 'shadow-2xl',
        shadowLg: 'shadow-lg',
        transition: 'transition-all duration-200',
        hover: 'hover:shadow-xl hover:scale-105',
    },

    // Input styles
    input: {
        base: 'w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400',
        focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    },

    // Table styles
    table: {
        header: 'sticky top-0 bg-gradient-to-br from-slate-700 to-slate-600 shadow-md',
        headerCell: 'px-3 py-3 text-sm font-semibold uppercase tracking-wider text-slate-200',
        row: 'bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-slate-200',
        cell: 'px-3 py-2.5',
        divider: 'divide-y divide-slate-700',
    },

    // Search result styles
    searchResult: {
        selected: 'bg-blue-600 text-white shadow-lg',
        unselected: 'bg-slate-800/50 hover:bg-slate-700 text-slate-200',
    },

    // Badge/Tag styles
    badge: {
        charge: 'text-amber-400',
        discount: 'text-green-400',
    },
};

// Helper function untuk combine classes
export const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
};

export default kasirTheme;
