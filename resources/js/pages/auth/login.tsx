import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({ status }: LoginProps) {
    const form = useForm({ username: '', password: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/login');
    }

    return (
        <AuthLayout>
            <Head title="Sign in" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {/* Username Field */}
                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                        Username
                    </Label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={form.data.username}
                        onChange={(e) => form.setData('username', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                        placeholder="Enter username"
                        autoFocus
                    />
                    <InputError message={form.errors.username as string} />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                        Password
                    </Label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                        placeholder="Enter password"
                    />
                    <InputError message={form.errors.password as string} />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="w-full mt-2 py-2.5 font-medium"
                >
                    {form.processing ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
        </AuthLayout>
    );
}
