import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    level: number;
    levelStr: string;
    permissions: any[];
    created: string;
    updated: string;
}

export default function Index() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const res = await axios.get('/api/users-json');
        setUsers(res.data.data);
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Permissions" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">User Permissions</h2>
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">Name</th>
                                    <th className="px-6 py-3 text-left">Level</th>
                                    <th className="px-6 py-3 text-left">Created</th>
                                    <th className="px-6 py-3 text-left">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4">{u.name}</td>
                                        <td className="px-6 py-4">{u.levelStr}</td>
                                        <td className="px-6 py-4">{u.created}</td>
                                        <td className="px-6 py-4">{u.updated}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
