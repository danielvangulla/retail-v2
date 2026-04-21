import '../css/app.css';
import './lib/axios'; // Initialize axios configuration

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { router } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Function to get CSRF token from meta tag
const getCsrfToken = (): string => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    return token?.getAttribute('content') || '';
};

// Refresh CSRF token meta tag from page props on each navigation
router.on('success', () => {
    // CSRF token is managed by Inertia via cookies/session automatically
});

// Handle validation errors
router.on('error', (event) => {
    const errors = event.detail.errors;
    if (errors && Object.keys(errors).length > 0) {
        console.warn('Validation errors:', errors);
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

