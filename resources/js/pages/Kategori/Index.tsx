import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import axios from 'axios';

interface Kategori {
    id: number;
    ket: string;
    sku_from: string;
    sku_to: string;
}

interface Kategorisub {
    id: number;
    kategori_id: number;
    ket: string;
}

interface Props {
    kategori: Kategori[];
    kategorisub: Kategorisub[];
}

export default function Index({ kategori, kategorisub }: Props) {
    const [selectedKategori, setSelectedKategori] = useState<number | null>(null);
    const [newKategori, setNewKategori] = useState('');
    const [newKategorisub, setNewKategorisub] = useState('');
    const [editingKategorisub, setEditingKategorisub] = useState<number | null>(null);

    const handleCreateKategorisub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKategori) return;

        try {
            await axios.post('/api/kategorisub', {
                state: 'kategorisub-create',
                kategori_id: selectedKategori,
                ket: newKategorisub,
            });
            setNewKategorisub('');
            router.reload();
        } catch (error) {
            console.error('Error creating kategorisub:', error);
        }
    };

    const handleUpdateKategorisub = async (id: number, ket: string) => {
        try {
            await axios.post('/api/kategorisub', {
                state: 'kategorisub-edit',
                id,
                kategori_id: selectedKategori,
                ket,
            });
            setEditingKategorisub(null);
            router.reload();
        } catch (error) {
            console.error('Error updating kategorisub:', error);
        }
    };

    const filteredKategorisub = selectedKategori
        ? kategorisub.filter((ks) => ks.kategori_id === selectedKategori)
        : [];

    return (
        <AuthenticatedLayout>
            <Head title="Kategori & Sub Kategori" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Kategori List */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">Kategori</h2>
                                <div className="space-y-2">
                                    {kategori.map((k) => (
                                        <div
                                            key={k.id}
                                            onClick={() => setSelectedKategori(k.id)}
                                            className={`p-4 border rounded cursor-pointer transition ${
                                                selectedKategori === k.id
                                                    ? 'bg-blue-50 border-blue-500'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="font-medium">{k.ket}</div>
                                            <div className="text-sm text-gray-500">
                                                SKU Range: {k.sku_from} - {k.sku_to}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sub Kategori List */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">Sub Kategori</h2>
                                {selectedKategori ? (
                                    <>
                                        <form onSubmit={handleCreateKategorisub} className="mb-4">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newKategorisub}
                                                    onChange={(e) => setNewKategorisub(e.target.value)}
                                                    placeholder="Nama sub kategori baru"
                                                    className="flex-1 px-3 py-2 border rounded"
                                                    minLength={2}
                                                    maxLength={30}
                                                    required
                                                />
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Tambah
                                                </button>
                                            </div>
                                        </form>

                                        <div className="space-y-2">
                                            {filteredKategorisub.length === 0 ? (
                                                <p className="text-gray-500 text-center py-8">
                                                    Belum ada sub kategori
                                                </p>
                                            ) : (
                                                filteredKategorisub.map((ks) => (
                                                    <div
                                                        key={ks.id}
                                                        className="p-3 border rounded hover:bg-gray-50"
                                                    >
                                                        {editingKategorisub === ks.id ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    defaultValue={ks.ket}
                                                                    onBlur={(e) => handleUpdateKategorisub(ks.id, e.target.value)}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleUpdateKategorisub(ks.id, e.currentTarget.value);
                                                                        }
                                                                    }}
                                                                    className="flex-1 px-2 py-1 border rounded"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => setEditingKategorisub(ks.id)}
                                                                className="cursor-pointer"
                                                            >
                                                                {ks.ket}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        Pilih kategori untuk melihat sub kategori
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
