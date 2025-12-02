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

    useEffect(() => {
        let echoInstance: any = null;
        let pollInterval: ReturnType<typeof setInterval> | null = null;

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

        // Setup WebSocket dengan retry logic
        const setupWebSocket = async () => {
            try {
                const { default: Echo } = await import('laravel-echo');
                const socketIo = await import('socket.io-client');

                console.log('🔗 Attempting WebSocket connection...');

                echoInstance = new Echo({
                    broadcaster: 'socket.io',
                    client: socketIo.io || socketIo.default || socketIo,
                    host: window.location.host,
                    path: '/socket.io',
                    transports: ['websocket', 'polling'],
                });

                // Wait for connection - with timeout
                const connectTimeout = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('WebSocket timeout')), 8000);
                });

                await Promise.race([
                    new Promise((resolve) => {
                        echoInstance.connector.socket.on('connect', () => {
                            console.log('✅ WebSocket connected!');
                            setIsConnected(true);
                            resolve(true);

                            // Listen to stock updates
                            echoInstance.channel('stock').listen('StockUpdated', (data: any) => {
                                console.log('📦 Stock updated:', data);
                                fetchDashboardData().then((updatedData) => {
                                    if (updatedData) onUpdate(updatedData);
                                });
                            });
                        });

                        echoInstance.connector.socket.on('connect_error', (error: any) => {
                            console.warn('⚠️ Connection error:', error);
                        });

                        echoInstance.connector.socket.on('disconnect', (reason: string) => {
                            console.warn('⚠️ WebSocket disconnected:', reason);
                            setIsConnected(false);
                        });
                    }),
                    connectTimeout,
                ]);
            } catch (error) {
                console.warn('⚠️ WebSocket setup failed:', error);
                setIsConnected(false);
                setUsePolling(true);
            }
        };

        // Start polling as backup
        const startPolling = () => {
            console.log('📡 Starting polling as backup (every 30s)...');
            pollInterval = setInterval(async () => {
                const data = await fetchDashboardData();
                if (data) {
                    onUpdate(data);
                }
            }, 30000);
        };

        // Initial setup
        setupWebSocket();

        // Start polling after 2 seconds if WebSocket not connected
        const pollingTimer = setTimeout(() => {
            if (!isConnected) {
                startPolling();
            }
        }, 2000);

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
