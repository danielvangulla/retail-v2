import KategorisubForm from './Form';

interface EditProps {
    kategorisub: {
        id: string;
        ket: string;
        kategori_id: string;
    };
    kategoris: Array<{
        id: string;
        nama: string;
    }>;
}

export default function Edit({ kategorisub, kategoris }: EditProps) {
    return <KategorisubForm kategorisub={kategorisub} kategoris={kategoris} mode="edit" />;
}
