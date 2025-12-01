import BarangForm from './Form';

interface CreateProps {
    kategoris: Array<{ id: string; nama: string }>;
}

export default function Create({ kategoris }: CreateProps) {
    return <BarangForm kategoris={kategoris} mode="create" />;
}
