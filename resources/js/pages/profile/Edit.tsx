import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function Edit() {
    const props = usePage().props as any;

    return (
        <>
            <Head title="Edit Profile" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Edit Profile</h1>
                <div className="rounded border p-4">Placeholder for profile edit page.</div>
            </div>
        </>
    );
}
