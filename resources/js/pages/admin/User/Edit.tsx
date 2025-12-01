import UserForm from './Form';

interface EditProps {
    user: {
        id: string;
        name: string;
        email: string;
        level: number;
        pin: string;
    };
}

export default function Edit({ user }: EditProps) {
    return <UserForm user={user} mode="edit" />;
}
