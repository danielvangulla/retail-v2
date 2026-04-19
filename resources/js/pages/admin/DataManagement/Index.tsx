import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Database, Lock, CheckCircle2, XCircle, Loader } from 'lucide-react';
import AdminLayout from '../Layout';

interface RecountResponse {
    success: boolean;
    message: string;
    data?: {
        total_processed: number;
        total_failed: number;
        duration_seconds: number;
    };
}

export default function DataManagementIndex() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<RecountResponse | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleRecountClick = () => {
        setPassword('');
        setShowPasswordModal(true);
    };

    const handleConfirmRecount = async () => {
        if (!password.trim()) {
            alert('Masukkan password terlebih dahulu');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/admin/data-management/recount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ password }),
            });

            const data: RecountResponse = await response.json();
            setResult(data);
            setShowResult(true);
            setShowPasswordModal(false);
            setPassword('');
        } catch (error) {
            setResult({
                success: false,
                message: 'Terjadi kesalahan: ' + (error instanceof Error ? error.message : 'Unknown error'),
            });
            setShowResult(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout title="Data Management">
            <Head title="Data Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-linear-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg">
                            <Database className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Management</h2>
                            <p className="text-gray-600">Kelola dan optimalkan data stok dan biaya produk</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recount Stok & Cost Card */}
                    <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-all duration-300 hover:border-blue-200/50">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-linear-to-br from-blue-100 to-blue-50 rounded-xl">
                                <Database className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Recount Stok & Cost</h3>
                                <p className="text-sm text-gray-600">
                                    Hitung ulang semua data stok dan COGS dari transaksi original
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 bg-blue-50/50 border border-blue-200/30 rounded-xl p-4">
                            <p className="text-sm text-gray-700 font-medium">Fitur ini akan:</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                                    <span>Mereset semua data stok dan history cost</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                                    <span>Memproses ulang 4 tipe transaksi: Pembelian, Penjualan, Retur, Opname</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                                    <span>Menghitung ulang weighted average cost dengan akurat</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                                    <span>Menjaga tanggal dan user asli dari setiap transaksi</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleRecountClick}
                            disabled={isLoading}
                            className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="h-5 w-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Database className="h-5 w-5" />
                                    <span>Mulai Recount</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info Card */}
                    <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200/50 p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-linear-to-br from-amber-100 to-amber-50 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Informasi Penting</h3>
                                <p className="text-sm text-gray-600">
                                    Perhatian sebelum menjalankan recount
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700">
                            <p className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold mt-0.5">⚠️</span>
                                <span>Operasi ini memerlukan akses supervisor (password)</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold mt-0.5">⚠️</span>
                                <span>Proses akan memakan waktu beberapa menit tergantung jumlah transaksi</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold mt-0.5">⚠️</span>
                                <span>Pastikan backup database tersedia sebelum melanjutkan</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold mt-0.5">⚠️</span>
                                <span>Jangan tutup halaman selama proses berlangsung</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Result Display */}
                {showResult && result && (
                    <div
                        className={`rounded-2xl shadow-lg border-2 p-6 animate-in fade-in slide-in-from-top-4 duration-300 ${
                            result.success
                                ? 'bg-linear-to-br from-emerald-50 to-green-50 border-emerald-200/50'
                                : 'bg-linear-to-br from-red-50 to-rose-50 border-red-200/50'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                                result.success
                                    ? 'bg-linear-to-br from-emerald-100 to-emerald-50'
                                    : 'bg-linear-to-br from-red-100 to-red-50'
                            }`}>
                                {result.success ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-lg font-bold mb-2 ${
                                    result.success ? 'text-emerald-900' : 'text-red-900'
                                }`}>
                                    {result.success ? 'Recount Berhasil!' : 'Recount Gagal'}
                                </h4>
                                <p className={`text-sm mb-3 ${
                                    result.success ? 'text-emerald-700' : 'text-red-700'
                                }`}>
                                    {result.message}
                                </p>
                                {result.data && (
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        <div className={`p-3 rounded-lg ${
                                            result.success ? 'bg-emerald-100/50' : 'bg-red-100/50'
                                        }`}>
                                            <p className="text-xs text-gray-600 font-medium">Berhasil</p>
                                            <p className={`text-lg font-bold ${
                                                result.success ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {result.data.total_processed}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${
                                            result.success ? 'bg-emerald-100/50' : 'bg-red-100/50'
                                        }`}>
                                            <p className="text-xs text-gray-600 font-medium">Gagal</p>
                                            <p className={`text-lg font-bold ${
                                                result.success ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {result.data.total_failed}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${
                                            result.success ? 'bg-emerald-100/50' : 'bg-red-100/50'
                                        }`}>
                                            <p className="text-xs text-gray-600 font-medium">Durasi</p>
                                            <p className={`text-lg font-bold ${
                                                result.success ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {result.data.duration_seconds}s
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in scale-95 duration-200">
                        {/* Header */}
                        <div className="bg-linear-to-r from-red-600 to-red-500 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Lock className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Konfirmasi Password</h3>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <p className="text-gray-600">
                                Masukkan password supervisor untuk melanjutkan operasi recount data:
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password Supervisor
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleConfirmRecount();
                                        }
                                    }}
                                    placeholder="Masukkan password"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Warning */}
                            <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-4">
                                <p className="text-sm text-amber-800">
                                    <span className="font-bold">⚠️ Perhatian:</span> Operasi ini akan mereset dan menghitung ulang semua data stok. Pastikan Anda memiliki backup database.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 border-t border-gray-200/50 flex gap-3 p-6">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPassword('');
                                }}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmRecount}
                                disabled={isLoading || !password.trim()}
                                className="flex-1 px-4 py-2.5 bg-linear-to-r from-red-600 to-red-500 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        <span>Lanjutkan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
