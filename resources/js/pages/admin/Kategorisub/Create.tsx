import KategorisubForm from './Form';

interface CreateProps {
    kategoris: Array<{
        id: string;
        ket: string;
    }>;
}

export default function Create({ kategoris }: CreateProps) {
    return <KategorisubForm kategoris={kategoris} mode="create" />;
}
