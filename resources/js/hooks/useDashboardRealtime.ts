import { useEffect, useState } from 'react';

interface DashboardData {
    todaySales: number;
    monthSales: number;
    salesTrend: Array<{
        date: string;
        total: number;
    }>;
    topProducts: Array<{
        id: string;
        deskripsi: string;
        total_sold: number;
        total_revenue: number;
    }>;
    lowStockList: Array<{
        id: string;
        deskripsi: string;
        satuan: string;
        min_stock: number;
        quantity: number;
        reserved: number;
        available: number;
        monthly_sold: number;
    }>;
}

/**
 * Hook untuk real-time dashboard updates via WebSocket atau Polling
 * Mencoba WebSocket terlebih dahulu, fallback ke polling jika tidak tersedia
 */
export function useDashboardRealtime(onUpdate: (data: DashboardData) => void) {
    const [isConnected, setIsConnected] = useState(false);
    const [usePolling, setUsePolling] = useState(false);
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    useEffect(() => {
        let echoInstance: any = null;

        // Fetch dashboard data dari API
        const fetchDashboardData = async (): Promise<DashboardData | void> => {
            try {
                const response = await fetch('/admin/dashboard-data');
                if (!response.ok) return;
                const data = await response.json();
                if (data.success && data.data) {
                    return data.data;
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            }
        };

        // Start polling as backup
        const startPolling = () => {
            // Jangan start polling jika sudah ada
            if (pollInterval) return;

            setUsePolling(true);
            pollInterval = setInterval(async () => {
                console.log('📡 Starting polling ...');
                const data = await fetchDashboardData();
                if (data) {
                    onUpdate(data);
                }
            }, 30000);
        };

        // Stop polling
        const stopPolling = () => {
            if (pollInterval) {
                console.log('🛑 Stopping polling ...');
                clearInterval(pollInterval);
                pollInterval = null;
                setUsePolling(false);
            }
        };

        // Setup WebSocket dengan retry logic
        const setupWebSocket = async () => {
            try {
                const { default: Echo } = await import('laravel-echo');
                const socketIo = await import('socket.io-client');

                // console.log('🔗 Attempting WebSocket connection...');

                echoInstance = new Echo({
                    broadcaster: 'socket.io',
                    client: socketIo.io || socketIo.default || socketIo,
                    host: window.location.host,
                    path: '/socket.io',
                    transports: ['websocket', 'polling'],
                    logging: false,
                });

                // Listen to stock updates immediately
                echoInstance.channel('stock').listen('StockUpdated', (data: any) => {
                    console.log('📦 Stock updated event received:', data);
                    fetchDashboardData().then((updatedData) => {
                        if (updatedData) {
                            console.log('✅ Dashboard data updated from broadcast');
                            onUpdate(updatedData);
                        }
                    });
                });

                // Setup socket event handlers
                echoInstance.connector.socket.on('connect', () => {
                    console.log('✅ WebSocket connected!');
                    setIsConnected(true);
                    stopPolling(); // Stop polling ketika WebSocket konek
                });

                echoInstance.connector.socket.on('connect_error', (error: any) => {
                    // console.warn('⚠️ Connection error:', error);
                });

                echoInstance.connector.socket.on('disconnect', (reason: string) => {
                    // console.warn('⚠️ WebSocket disconnected:', reason);
                    setIsConnected(false);
                    startPolling(); // Auto fallback ke polling ketika disconnect
                });

                // Wait for initial connection with timeout
                const connectTimeout = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('WebSocket timeout')), 8000);
                });

                await Promise.race([
                    new Promise((resolve) => {
                        echoInstance.connector.socket.on('connect', resolve);
                    }),
                    connectTimeout,
                ]);
            } catch (error) {
                console.warn('⚠️ WebSocket setup failed:', error);
                setIsConnected(false);
                startPolling(); // Fallback ke polling jika WebSocket gagal
            }
        };

        // Initial setup
        setupWebSocket();

        // Start polling after 5 seconds if WebSocket gagal connect
        const pollingTimer = setTimeout(() => {
            if (!isConnected) {
                startPolling();
            }
        }, 5000);

        return () => {
            clearTimeout(pollingTimer);
            if (pollInterval) clearInterval(pollInterval);
            if (echoInstance) {
                echoInstance.leaveChannel('stock');
                echoInstance.disconnect();
            }
        };
    }, [onUpdate]);

    return { isConnected, usePolling };
}
