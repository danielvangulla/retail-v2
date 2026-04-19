import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/pages/admin/Layout';
import axios from '@/lib/axios';
import { formatDateTime } from '@/lib/formatters';
import AlertModal from '@/pages/Kasir/components/AlertModal';

interface ConnectionStats {
    status: string;
    total_connections: number;
    active_connections: number;
    idle_connections: number;
    timestamp: string;
    health: string;
    error?: string;
}

interface Config {
    enabled: boolean;
    max_retries: number;
    retry_delay_ms: number;
    total_timeout_secs: number;
}

export default function DatabaseMonitoring() {
    const [stats, setStats] = useState<ConnectionStats | null>(null);
    const [config, setConfig] = useState<Config | null>(null);
    const [isPoolingEnabled, setIsPoolingEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editMaxRetries, setEditMaxRetries] = useState(5);
    const [editRetryDelayMs, setEditRetryDelayMs] = useState(2000);
    const [editPoolingEnabled, setEditPoolingEnabled] = useState(true);
    const [editPassword, setEditPassword] = useState('');
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [isSaving, setIsSaving] = useState(false);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        fetchConfig();
        fetchStats();

        // Setup polling every 2 seconds
        pollIntervalRef.current = setInterval(() => {
            fetchStats();
        }, 2000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/admin/database-monitoring/stats');
            if (response.data.status === 'ok') {
                setStats(response.data.data);
                setLastUpdated(new Date().toLocaleTimeString('id-ID'));
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/admin/database-monitoring/config');
            if (response.data.status === 'ok') {
                setConfig(response.data.data);
                setIsPoolingEnabled(response.data.data.enabled);
                setEditMaxRetries(response.data.data.max_retries);
                setEditRetryDelayMs(response.data.data.retry_delay_ms);
                setEditPoolingEnabled(response.data.data.enabled);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const handleTogglePooling = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/admin/database-monitoring/toggle-pooling', {
                enabled: !isPoolingEnabled,
            });
            if (response.data.status === 'ok') {
                setIsPoolingEnabled(response.data.enabled);
                fetchConfig();
                setAlertMessage(response.data.message);
                setAlertType('success');
                setShowAlertModal(true);
            }
        } catch (error) {
            console.error('Error toggling pooling:', error);
            setAlertMessage('Gagal mengubah status pooling');
            setAlertType('error');
            setShowAlertModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditModal = () => {
        setEditPassword('');
        setShowEditModal(true);
    };

    const handleSaveConfig = async () => {
        if (!editPassword.trim()) {
            setAlertMessage('Password tidak boleh kosong');
            setAlertType('warning');
            setShowAlertModal(true);
            return;
        }

        setIsSaving(true);
        try {
            const response = await axios.post('/admin/database-monitoring/config', {
                max_retries: editMaxRetries,
                retry_delay_ms: editRetryDelayMs,
                enabled: editPoolingEnabled,
                password: editPassword,
            });

            if (response.data.status === 'ok') {
                setConfig(response.data.data);
                setIsPoolingEnabled(response.data.data.enabled);
                setShowEditModal(false);
                setAlertMessage(response.data.message);
                setAlertType('success');
                setShowAlertModal(true);
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gagal menyimpan konfigurasi';
            setAlertMessage(message);
            setAlertType('error');
            setShowAlertModal(true);
        } finally {
            setIsSaving(false);
        }
    };

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'healthy':
                return 'text-emerald-600';
            case 'warning':
                return 'text-amber-600';
            case 'unhealthy':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getHealthBg = (health: string) => {
        switch (health) {
            case 'healthy':
                return 'bg-emerald-50 border-emerald-200';
            case 'warning':
                return 'bg-amber-50 border-amber-200';
            case 'unhealthy':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <>
            <Head title="Database Monitoring" />

            <AdminLayout title="Database Connection Monitoring">
                <div className="max-w-6xl mx-auto text-black">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">📊 Database Connection Monitoring</h1>
                        <p className="text-gray-600 mt-2">Real-time monitoring koneksi database dengan connection pooling</p>
                    </div>

                    {/* Control Panel */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-6xl">
                                {isPoolingEnabled ? (
                                    <span className="text-emerald-600" title="Connection Pooling Enabled">✅</span>
                                ) : (
                                    <span className="text-red-600" title="Connection Pooling Disabled">❌</span>
                                )}
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Connection Pooling</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {isPoolingEnabled ? 'Enabled - Koneksi akan queue saat limit tercapai' : '❌ Disabled - Koneksi akan error saat limit'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Configuration */}
                    {config && (
                        <div className="bg-white text-black rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">⚙️ Configuration</h3>
                                <button
                                    onClick={handleOpenEditModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                                >
                                    ✏️ Edit
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-sm text-gray-600">Max Retries</p>
                                    <p className="text-2xl font-bold text-blue-600">{config.max_retries}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <p className="text-sm text-gray-600">Retry Delay</p>
                                    <p className="text-2xl font-bold text-purple-600">{config.retry_delay_ms}ms</p>
                                </div>
                                <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                                    <p className="text-sm text-gray-600">Total Timeout</p>
                                    <p className="text-2xl font-bold text-pink-600">{config.total_timeout_secs}s</p>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-2xl font-bold text-amber-600">{config.enabled ? 'ON' : 'OFF'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Connection Stats */}
                    {stats && (
                        <div className={`rounded-xl border shadow-sm p-6 mb-6 ${getHealthBg(stats.health)}`}>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🔗 Connection Status</h3>
                                    <p className={`text-sm font-semibold ${getHealthColor(stats.health)}`}>
                                        {stats.health === 'healthy'
                                            ? '✅ Healthy - Database responsif'
                                            : stats.health === 'warning'
                                            ? '⚠️ Warning - Database mulai sibuk'
                                            : '❌ Unhealthy - Database tidak responsif'}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-600">Last update: {lastUpdated}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Total Connections */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Total Connections</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-gray-900">{stats.total_connections}</p>
                                        <p className="text-xs text-gray-500">/100</p>
                                    </div>
                                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-linear-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(stats.total_connections / 100) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {Math.round((stats.total_connections / 100) * 100)}% utilized
                                    </p>
                                </div>

                                {/* Active Connections */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Active Connections</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-emerald-600">{stats.active_connections}</p>
                                        <p className="text-xs text-gray-500">executing</p>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-600">
                                            {stats.active_connections === 0
                                                ? '✅ No queries running'
                                                : `⚙️ ${stats.active_connections} query running`}
                                        </p>
                                    </div>
                                </div>

                                {/* Idle Connections */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Idle Connections</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-bold text-orange-600">{stats.idle_connections}</p>
                                        <p className="text-xs text-gray-500">waiting</p>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-600">
                                            Ready for use ({stats.idle_connections} available)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info Card */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-6">
                        <h4 className="font-semibold text-blue-900 mb-3">ℹ️ How It Works</h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li>✅ <strong>Pooling ON:</strong> Ketika koneksi penuh, request baru akan queue dan wait hingga timeout (10 detik)</li>
                            <li>✅ <strong>Monitoring:</strong> Dashboard update setiap 2 detik dengan status real-time</li>
                            <li>✅ <strong>Logging:</strong> Semua retry dan timeout di-log untuk troubleshooting</li>
                            <li>✅ <strong>WebSocket:</strong> Status update di-broadcast ke semua user yang monitoring</li>
                        </ul>
                    </div>
                </div>
            </AdminLayout>

            {/* Edit Configuration Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white text-black rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Edit Configuration</h2>

                        {/* Connection Pooling Toggle */}
                        <div className="mb-6 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-gray-900">Connection Pooling</label>
                                <button
                                    onClick={() => setEditPoolingEnabled(!editPoolingEnabled)}
                                    disabled={isSaving}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        editPoolingEnabled
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    } disabled:opacity-50`}
                                >
                                    {isSaving ? '...' : editPoolingEnabled ? '✅ ON' : '❌ OFF'}
                                </button>
                            </div>
                            <p className="text-xs text-blue-700">
                                {isPoolingEnabled ? '✅ Enabled - Request akan queue saat limit' : '❌ Disabled - Request akan error saat limit'}
                            </p>
                        </div>

                        {/* Max Retries */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Max Retries</label>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Current: {config?.max_retries}</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={editMaxRetries}
                                onChange={(e) => setEditMaxRetries(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Berapa kali attempt koneksi (1-20)</p>
                        </div>

                        {/* Retry Delay */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Retry Delay (ms)</label>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Current: {config?.retry_delay_ms}ms</span>
                            </div>
                            <input
                                type="number"
                                min="500"
                                max="10000"
                                step="500"
                                value={editRetryDelayMs}
                                onChange={(e) => setEditRetryDelayMs(Math.max(500, parseInt(e.target.value) || 500))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Delay antar retry attempt dalam milliseconds (500-10000)</p>
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password (Konfirmasi)</label>
                            <input
                                type="password"
                                placeholder="Masukkan password Anda"
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Masukkan password untuk konfirmasi perubahan</p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditPassword('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveConfig}
                                disabled={isSaving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AlertModal
                title="Notifikasi"
                message={alertMessage}
                type={alertType}
                show={showAlertModal}
                onConfirm={() => setShowAlertModal(false)}
            />
        </>
    );
}
