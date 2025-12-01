import KategoriForm from './Form';

interface EditProps {
    kategori: {
        id: string;
        nama: string;
    };
}

export default function Edit({ kategori }: EditProps) {
    return <KategoriForm kategori={kategori} mode="edit" />;
}
