import { Head } from '@inertiajs/react';
import React from 'react';
import { formatTgl, formatTime, formatDigit } from '@/lib/formatters';

interface Barang {
    sku: string;
    deskripsi?: string;
    alias?: string;
    volume?: string;
    multiplier?: boolean;
}

interface TransaksiDetail {
    sku: string;
    qty: number;
    harga: number;
    brutto: number;
    charge?: number;
    disc_spv?: number;
    disc_promo?: number;
    nama_promo?: string;
    barang?: Barang;
}

interface Transaction {
    id: string;
    payments: any[];
    details: TransaksiDetail[];
    piutang?: any;
    komplemen?: any;
    brutto: number;
    disc_spv: number;
    disc_promo: number;
    netto: number;
    tax: number;
    service: number;
    bayar: number;
    payment: number;
    kembali: number;
    created_at: string;
    kasir: {
        name: string;
    };
}

interface Setup {
    nama: string;
    alamat1: string;
    alamat2: string;
}

interface Props {
    trx: Transaction;
    setup: Setup;
}

export default function PrintBill({ trx, setup }: Props) {
    return (
        <>
            <Head title="Print Bill" />

            <style>
                {`
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                    }
                `}
            </style>

            <div className="flex justify-center min-h-screen bg-gray-100">
                <div className="w-[80mm] p-[2mm] bg-white text-black font-mono text-[11px] leading-tight">
                    {/* Header */}
                    <div className="text-center text-base font-bold mb-0.5">{setup.nama}</div>
                    
                    <div className="text-center text-[10px] mb-1">
                        {setup.alamat1}<br />
                        {setup.alamat2}
                    </div>

                    <div className="border-t border-black my-0.5"></div>

                    <div className="text-center text-[10px] my-0.5">
                        {formatTgl(trx.created_at)} {formatTime(trx.created_at)}<br />
                        Kasir: {trx.kasir?.name}
                    </div>

                    <div className="border-t border-black my-0.5"></div>

                    {/* Items */}
                    <div className="my-1">
                        {trx.details?.map((v, index) => (
                            <div key={index} className="mb-1">
                                <div className="text-[11px] font-bold mb-px">
                                    {v.barang?.deskripsi || v.barang?.alias || 'Item'}
                                </div>
                                <div className="flex justify-between text-[10px] pl-1">
                                    <span>
                                        {v.qty} {v.barang?.volume || 'pcs'} x {formatDigit(v.harga || 0)}
                                        {(v.charge || 0) > 0 && ` +${formatDigit(v.charge || 0)}`}
                                    </span>
                                    <span>{formatDigit((v.brutto || 0) + (v.charge || 0))}</span>
                                </div>
                                {((v.disc_spv || 0) + (v.disc_promo || 0) > 0) && (
                                    <div className="flex justify-between text-[10px] pl-1">
                                        <span>Diskon {v.nama_promo || ''}</span>
                                        <span>-{formatDigit((v.disc_spv || 0) + (v.disc_promo || 0))}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-black my-0.5"></div>

                    {/* Total */}
                    <div className="flex justify-between text-xs font-bold my-1">
                        <span>TOTAL</span>
                        <span>Rp {formatDigit(trx.bayar || 0)}</span>
                    </div>

                    <div className="border-t border-black my-0.5"></div>

                    {/* Payment Details */}
                    <div className="text-[10px] my-0.5">
                        {trx.piutang ? (
                            trx.piutang.is_staff ? (
                                <div className="text-center">
                                    <div>Sisa Deposit {trx.piutang.name}</div>
                                    <div className="font-bold">
                                        Rp {formatDigit(trx.piutang.deposit_sisa || 0)}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div>Piutang {trx.piutang.name}</div>
                                    <div className="font-bold">
                                        Rp {formatDigit(trx.bayar || 0)}
                                    </div>
                                </div>
                            )
                        ) : trx.komplemen ? (
                            <div className="text-center">
                                Komplemen by: {trx.komplemen.name}
                            </div>
                        ) : (
                            <>
                                {trx.payments?.map((v, index) => (
                                    <div key={index} className="flex justify-between my-px">
                                        <span>Bayar {v.type?.ket}</span>
                                        <span className="font-bold">
                                            Rp {formatDigit(trx.payment || 0)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between my-px">
                                    <span>Kembali</span>
                                    <span className="font-bold">
                                        Rp {formatDigit(trx.kembali || 0)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="border-t border-black my-0.5"></div>

                    {/* Transaction ID */}
                    <div className="text-center text-[8px] my-2">No.Ref: {trx.id}</div>

                    {/* Footer */}
                    <div className="text-center text-[10px] mt-1">==== Terima Kasih ====</div>
                </div>
            </div>
        </>
    );
}
