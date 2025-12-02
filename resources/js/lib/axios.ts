import axios from 'axios';

// Configure axios defaults for optimal and secure requests
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Set timeout untuk prevent hanging requests (30 seconds)
axios.defaults.timeout = 30000;

// Function to get CSRF token
const getCsrfToken = (): string => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    return token?.getAttribute('content') || '';
};

// Set CSRF token immediately
const csrfToken = getCsrfToken();
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
} else {
    console.warn('CSRF token not found. Please ensure meta tag exists in HTML head.');
}

// Add request interceptor untuk logging dan validation
axios.interceptors.request.use(
    (config) => {
        // Re-check CSRF token setiap request dan update header
        const currentToken = getCsrfToken();
        if (currentToken && config.headers) {
            config.headers['X-CSRF-TOKEN'] = currentToken;
        }
        // Ensure withCredentials for session-based auth
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for comprehensive error handling
axios.interceptors.response.use(
    (response) => {
        // Update CSRF token from response header if provided
        if (response.headers['x-csrf-token']) {
            const newToken = response.headers['x-csrf-token'];
            axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;
            // Also update meta tag
            const metaTag = document.head.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', newToken);
            }
        }
        return response;
    },
    (error) => {
        // Handle specific error codes
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Unauthorized
                    console.error('Unauthorized access.');
                    break;
                case 419:
                    // CSRF token mismatch or session expired
                    console.warn('CSRF token expired, reloading page to get fresh token.');
                    // Reload page to get fresh CSRF token
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                    break;
                case 429:
                    // Too many requests - rate limiting
                    console.error('Too many requests. Please wait before trying again.');
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    // Server errors
                    console.error('Server error. Please try again later.');
                    break;
            }
        } else if (error.request) {
            // Request was made but no response received (network error)
            console.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default axios;

