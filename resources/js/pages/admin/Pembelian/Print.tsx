import { useEffect } from 'react';
import { formatTgl, formatDigit, formatDateTime } from '../../../lib/formatters';

interface PembelianDetail {
    id: string;
    sku: string;
    barcode: string;
    qty: number;
    satuan_beli: string;
    harga_beli: number;
    total: number;
    barang: {
        deskripsi: string;
        alias: string;
        satuan: string;
        isi: number;
    };
}

interface PembelianPrintProps {
    data: {
        id: string;
        tgl_faktur: string;
        is_lunas: boolean;
        grand_total: number;
        created_at: string;
        user: {
            name: string;
        };
        details: PembelianDetail[];
    };
}

export default function PembelianPrint({ data }: PembelianPrintProps) {
    useEffect(() => {
        // Auto print on load setelah data tersedia
        if (data && data.id) {
            window.print();
        }
    }, [data]);

    // Validasi data sebelum render
    if (!data || !data.id) {
        return <div>Memuat data...</div>;
    }

    return (
        <div className="print-container">
            <style>{`
                @media print {
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: white;
                        color: #000;
                        line-height: 1.4;
                    }

                    .page {
                        size: A4;
                        width: 210mm;
                        height: 297mm;
                        padding: 15mm;
                        background: white;
                        overflow: hidden;
                    }

                    .page-break {
                        page-break-before: always;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    th, td {
                        border: 1px solid #000;
                        padding: 8px;
                        text-align: left;
                        font-size: 10pt;
                    }

                    th {
                        background-color: #f3f4f6;
                        font-weight: 600;
                    }

                    td {
                        background-color: #ffffff;
                    }

                    .text-right {
                        text-align: right;
                    }

                    .text-center {
                        text-align: center;
                    }

                    .header {
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                    }

                    .title {
                        font-size: 16pt;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }

                    .subtitle {
                        font-size: 11pt;
                        color: #666;
                        margin-bottom: 3px;
                    }

                    .info-section {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 15px;
                        font-size: 10pt;
                    }

                    .info-row {
                        display: flex;
                        justify-content: space-between;
                    }

                    .info-label {
                        font-weight: 600;
                        width: 40%;
                    }

                    .info-value {
                        width: 60%;
                    }

                    .footer {
                        margin-top: 20px;
                        border-top: 1px solid #000;
                        padding-top: 10px;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                    }

                    .signature-box {
                        text-align: center;
                        margin-top: 30px;
                    }

                    .signature-line {
                        border-bottom: 1px solid #000;
                        height: 50px;
                        margin-bottom: 5px;
                    }

                    .total-row {
                        font-weight: bold;
                        background-color: #e5e7eb;
                    }

                    .no-print {
                        display: none !important;
                    }
                }

                @media screen {
                    .page {
                        background: #f5f5f5;
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                }
            `}</style>

            <div className="page">
                {/* Header */}
                <div className="header text-center">
                    <div className="title">FAKTUR PEMBELIAN</div>
                    <div className="subtitle">No. Ref: {data.id}</div>
                </div>

                {/* Info Section */}
                <div className="info-section">
                    <div>
                        <div className="info-row">
                            <span className="info-label">Tgl Faktur:</span>
                            <span className="info-value">{formatTgl(data.tgl_faktur || data.created_at)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Input Oleh:</span>
                            <span className="info-value">{data.user.name}</span>
                        </div>
                    </div>
                    <div>
                        <div className="info-row">
                            <span className="info-label">Status:</span>
                            <span className="info-value">{data.is_lunas ? '✓ Lunas' : '⏳ Belum Lunas'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Tgl Input:</span>
                            <span className="info-value">{formatDateTime(data.created_at)}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }}>No</th>
                            <th style={{ width: '15%' }}>SKU</th>
                            <th style={{ width: '35%' }}>Nama Barang</th>
                            <th className="text-center" style={{ width: '10%' }}>Qty</th>
                            <th className="text-right" style={{ width: '18%' }}>Harga</th>
                            <th className="text-right" style={{ width: '17%' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.details.map((item, idx) => (
                            <tr key={item.id}>
                                <td className="text-center">{idx + 1}</td>
                                <td>{item.sku}</td>
                                <td>
                                    <div>{item.barang.deskripsi}</div>
                                    <div style={{ fontSize: '8pt', color: '#666' }}>
                                        {item.qty} {item.satuan_beli}
                                    </div>
                                </td>
                                <td className="text-center">{item.qty}</td>
                                <td className="text-right">Rp {formatDigit(item.harga_beli)}</td>
                                <td className="text-right">Rp {formatDigit(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="total-row">
                            <td colSpan={5} className="text-right" style={{ borderLeft: 'none', borderTop: '2px solid #000' }}>
                                TOTAL:
                            </td>
                            <td className="text-right" style={{ borderRight: 'none', borderTop: '2px solid #000' }}>
                                Rp {formatDigit(data.grand_total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer */}
                <div className="footer">
                    <div className="signature-box">
                        <div style={{ fontSize: '9pt', marginBottom: '10px' }}>Pembuat</div>
                        <div className="signature-line"></div>
                        <div style={{ fontSize: '9pt' }}>{data.user.name}</div>
                    </div>
                    <div className="signature-box">
                        <div style={{ fontSize: '9pt', marginBottom: '10px' }}>Penerima</div>
                        <div className="signature-line"></div>
                        <div style={{ fontSize: '9pt' }}>Tanda Tangan</div>
                    </div>
                    <div className="signature-box">
                        <div style={{ fontSize: '9pt', marginBottom: '10px' }}>Diketahui</div>
                        <div className="signature-line"></div>
                        <div style={{ fontSize: '9pt' }}>Manager</div>
                    </div>
                </div>

                {/* Print Info */}
                <div style={{ marginTop: '20px', fontSize: '8pt', color: '#999', textAlign: 'center' }}>
                    Dicetak: {formatDateTime(new Date().toString())}
                </div>
            </div>
        </div>
    );
}
