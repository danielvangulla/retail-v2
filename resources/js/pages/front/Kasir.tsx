import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function Kasir() {
    const props = usePage().props as any;

    return (
        <>
            <Head title="Kasir" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Kasir (POS)</h1>
                <div className="rounded border p-4">Scaffolded Kasir page — port the kasir blade UI/JS here.</div>
            </div>
        </>
    );
}
