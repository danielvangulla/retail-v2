import KategorisubForm from './Form';

interface CreateProps {
    kategoris: Array<{
        id: string;
        nama: string;
    }>;
}

export default function Create({ kategoris }: CreateProps) {
    return <KategorisubForm kategoris={kategoris} mode="create" />;
}
