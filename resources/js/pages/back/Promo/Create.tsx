import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function Create() {
    const props = usePage().props as any;

    return (
        <>
            <Head title="Promo — Create" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Promo — Create</h1>
                <div className="rounded border p-4">Placeholder for Promo create form.</div>
            </div>
        </>
    );
}
