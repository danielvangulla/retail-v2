export interface PaymentType {
    id: string;
    ket: string;
    urutan: number;
}

export interface BarangItem {
    id: string;
    sku: string;
    barcode: string;
    deskripsi: string;
    alias?: string;
    satuan: string;
    volume: string;
    harga_jual1: number;
    harga_jual2: number;
    stock: number;
    quantity?: number;
    reserved?: number;
    prices?: any[];
    promo?: any;
    trx_details?: any[];
    multiplier?: boolean;
    allow_sold_zero_stock?: boolean; // Izinkan penjualan saat stok habis
    qty?: number;
    disc_spv?: number;
    disc_promo?: number;
    namaPromo?: string;
    charge?: number;
    hargaJual?: number;
    hargaPromo?: number;
    total?: number;
    scanned?: boolean; // true=scan barcode, false=search nama. Scan boleh minus stok, search tidak.
}
