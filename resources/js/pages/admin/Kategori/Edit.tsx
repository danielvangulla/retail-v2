import KategoriForm from './Form';

interface EditProps {
    kategori: {
        id: string;
        ket: string;
    };
}

export default function Edit({ kategori }: EditProps) {
    return <KategoriForm kategori={kategori} mode="edit" />;
}
