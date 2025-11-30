import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { type SharedData } from '@/types';

export default function HomeSpace() {
    const { data, paymentTypes, keysArray } = usePage<SharedData>().props as any;

    return (
        <>
            <Head title="Home Space" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Home Space</h1>
                <p className="mb-4">This is a scaffolded Inertia React page for the Home Space view.</p>

                <section className="mb-6">
                    <h2 className="font-medium">Tables</h2>
                    <div className="grid grid-cols-4 gap-3 mt-3">
                        {Array.isArray(data) && data.length ? (
                            data.map((m: any) => (
                                <div key={m.no} className="rounded border p-3">
                                    <div className="font-medium">Table {m.no}</div>
                                    <div className="text-sm">Status: {m.status ?? 'N/A'}</div>
                                </div>
                            ))
                        ) : (
                            <div>No tables available</div>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="font-medium">Payment Types</h2>
                    <ul className="mt-3 list-disc pl-6">
                        {Array.isArray(paymentTypes) && paymentTypes.length ? (
                            paymentTypes.map((p: any) => <li key={p.id}>{p.ket}</li>)
                        ) : (
                            <li>No payment types</li>
                        )}
                    </ul>
                </section>
            </div>
        </>
    );
}
