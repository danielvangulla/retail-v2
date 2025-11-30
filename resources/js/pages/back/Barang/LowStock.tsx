import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function LowStock() {
    const { barang } = usePage().props as any;

    return (
        <>
            <Head title="Barang — Low Stock" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Barang Low Stock</h1>
                <div className="rounded border p-4">Found: {Array.isArray(barang) ? barang.length : 0} items with low stock.</div>
            </div>
        </>
    );
}
