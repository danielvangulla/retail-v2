import BarangForm from './Form';

interface EditProps {
    barang: {
        id: string;
        barcode: string;
        deskripsi: string;
        kategori_id: string;
        harga_beli: number;
        harga_jual1: number;
        min_stock: number;
        st_aktif: number;
    };
    kategoris: Array<{ id: string; nama: string }>;
}

export default function Edit({ barang, kategoris }: EditProps) {
    return <BarangForm barang={barang} kategoris={kategoris} mode="edit" />;
}
