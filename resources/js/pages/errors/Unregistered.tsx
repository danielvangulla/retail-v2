import { Head } from '@inertiajs/react';
import { ShieldX, Monitor, Cpu, AlertTriangle } from 'lucide-react';

interface UnregisteredProps {
    os?: string;
    status?: string;
    message?: string;
}

export default function Unregistered({
    os = 'Unknown',
    status = 'Unregistered.',
    message = 'Contact developer to Register the App to this Machine.',
}: UnregisteredProps) {
    const osIcons: Record<string, string> = {
        macOS: '🍎',
        Windows: '🪟',
        Linux: '🐧',
        Unknown: '💻',
    };

    const osEmoji = osIcons[os] ?? '💻';

    return (
        <>
            <Head title="Aplikasi Belum Terdaftar" />
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
                </div>

                <div className="relative w-full max-w-lg">
                    {/* Main card */}
                    <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                        {/* Header gradient */}
                        <div className="bg-linear-to-br from-amber-500 via-orange-500 to-red-500 px-6 sm:px-8 py-10 sm:py-12 relative overflow-hidden">
                            {/* Subtle pattern */}
                            <div className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                    backgroundSize: '24px 24px',
                                }}
                            ></div>

                            <div className="relative flex flex-col items-center gap-4">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur shadow-inner">
                                    <ShieldX className="h-10 w-10 text-white" />
                                </div>
                                <div className="text-center">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                        Aplikasi Tidak Terdaftar
                                    </h1>
                                    <p className="text-amber-100 text-sm mt-1.5 font-medium">License Verification Failed</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 sm:px-8 py-8 space-y-6">
                            {/* Machine info */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <Monitor className="h-4 w-4 text-slate-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Platform</span>
                                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                        <span>{osEmoji}</span>
                                        <span>{os}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <Cpu className="h-4 w-4 text-slate-500 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Status</span>
                                    <span className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
                                        {status}
                                    </span>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 font-medium leading-relaxed">{message}</p>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Langkah Selanjutnya</p>
                                <ol className="space-y-2">
                                    {[
                                        'Hubungi developer atau administrator sistem.',
                                        'Berikan informasi mesin/komputer ini kepada developer.',
                                        'Developer akan mendaftarkan mesin ini ke dalam lisensi.',
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Footer */}
                            <div className="pt-4 border-t border-slate-200">
                                <p className="text-center text-xs text-slate-500">
                                    NOVAQUILA.ID &bull; <span className="font-semibold">Retail v1.2</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative glows */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute -top-8 -left-8 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>
            </div>
        </>
    );
}
