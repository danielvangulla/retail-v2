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

// Add response interceptor to update CSRF token from response header
router.on('success', (event) => {
    // Check if response has new CSRF token in headers
    const csrfHeader = event.detail.response?.headers?.['x-csrf-token'];
    if (csrfHeader) {
        const metaTag = document.head.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            metaTag.setAttribute('content', csrfHeader);
        }
    }
});

// Add error handler for 419 errors
router.on('error', (error) => {
    if (error.status === 419) {
        console.warn('Session expired. Please refresh and try again.');
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

