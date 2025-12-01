import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

interface PaymentType {
    id: string;
    ket: string;
    urutan: number;
}

interface Props {
    paymentTypes: PaymentType[];
    keysArray: string[][];
}

interface CartItem {
    sku: string;
    barcode: string;
    deskripsi: string;
    qty: number;
    hargaJual: number;
    disc_spv: number;
    disc_promo: number;
    namaPromo: string;
    charge: number;
}

export default function KasirIndex({ paymentTypes, keysArray }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPaymentType, setSelectedPaymentType] = useState(paymentTypes[0]?.id || '');
    const [paymentAmount, setPaymentAmount] = useState(0);

    const total = cart.reduce((sum, item) => {
        const brutto = item.qty * item.hargaJual;
        const netto = brutto - item.disc_spv - item.disc_promo;
        return sum + netto + item.charge;
    }, 0);

    const handleAddItem = async () => {
        if (!searchQuery) return;

        try {
            const response = await axios.post('/api/barang/search', { query: searchQuery });
            const item = response.data;

            setCart([...cart, {
                sku: item.sku,
                barcode: item.barcode,
                deskripsi: item.deskripsi,
                qty: 1,
                hargaJual: item.harga_jual,
                disc_spv: 0,
                disc_promo: 0,
                namaPromo: '',
                charge: 0,
            }]);
            setSearchQuery('');
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleCheckout = async () => {
        try {
            const response = await axios.post('/proses-bayar', {
                state: 'full',
                items: cart,
                discSpv: 0,
                discPromo: 0,
                charge: 0,
                total: total,
                bayar: paymentAmount,
                typeId: selectedPaymentType,
            });

            if (response.data.status === 'ok') {
                // Print bill
                window.open(`/print-bill/${response.data.trxId}`, '_blank');
                // Reset cart
                setCart([]);
                setPaymentAmount(0);
            }
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    return (
        <>
            <Head title="Kasir - POS" />

            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-3xl font-bold mb-6">Point of Sale</h1>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                                    placeholder="Scan barcode atau cari barang..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddItem}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    Tambah
                                </button>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="mb-6 border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Barang</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Harga</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {cart.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                Keranjang kosong
                                            </td>
                                        </tr>
                                    ) : (
                                        cart.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{item.deskripsi}</div>
                                                    <div className="text-sm text-gray-500">{item.barcode}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => {
                                                            const newCart = [...cart];
                                                            newCart[index].qty = parseInt(e.target.value) || 1;
                                                            setCart(newCart);
                                                        }}
                                                        className="w-20 px-2 py-1 border rounded text-center"
                                                        min="1"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    Rp {item.hargaJual.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">
                                                    Rp {(item.qty * item.hargaJual).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setCart(cart.filter((_, i) => i !== index))}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Section */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Metode Pembayaran
                                </label>
                                <select
                                    value={selectedPaymentType}
                                    onChange={(e) => setSelectedPaymentType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {paymentTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.ket}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Jumlah Bayar
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="mt-6 bg-gray-50 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-2xl font-bold text-gray-700">Total:</span>
                                <span className="text-3xl font-bold text-blue-600">
                                    Rp {total.toLocaleString('id-ID')}
                                </span>
                            </div>
                            {paymentAmount > 0 && (
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-semibold text-gray-700">Kembali:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        Rp {Math.max(0, paymentAmount - total).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || paymentAmount < total}
                                className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-xl"
                            >
                                Proses Pembayaran
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
