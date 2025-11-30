import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function PrintBill() {
    const props = usePage().props as any;

    return (
        <>
            <Head title="Print Bill" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Print Bill</h1>
                <div className="rounded border p-4">Placeholder for print bill view.</div>
            </div>
        </>
    );
}
