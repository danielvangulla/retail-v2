import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function Index() {
    const { show } = usePage().props as any;

    return (
        <>
            <Head title="Barang — Index" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Manajemen Barang</h1>
                <p className="mb-4">Status view: {String(show)}</p>
                <div className="rounded border p-4">This is a scaffolded page for Back → Barang → Index. Port the original blade UI here.</div>
            </div>
        </>
    );
}
