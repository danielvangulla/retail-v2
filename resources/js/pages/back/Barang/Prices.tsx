import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function Prices() {
    const { data } = usePage().props as any;

    return (
        <>
            <Head title="Barang — Prices" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Harga Barang</h1>
                <div className="rounded border p-4">Placeholder for barang prices. Data length: {Array.isArray(data) ? data.length : 0}</div>
            </div>
        </>
    );
}
