import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function Create() {
    const { var: v, kategori, kategorisub, barang } = usePage().props as any;

    return (
        <>
            <Head title={v?.title ?? 'Create Barang'} />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">{v?.title ?? 'Create / Edit Barang'}</h1>
                <div className="rounded border p-4">This is a scaffolded page for Back → Barang → Create. Port the original blade form here.</div>

                <section className="mt-4">
                    <h2 className="font-medium">Kategori ({Array.isArray(kategori) ? kategori.length : 0})</h2>
                    <h3 className="font-medium mt-2">Sub Kategori ({Array.isArray(kategorisub) ? kategorisub.length : 0})</h3>
                    {barang && <pre className="mt-4 bg-gray-100 p-2 rounded">{JSON.stringify(barang, null, 2)}</pre>}
                </section>
            </div>
        </>
    );
}
