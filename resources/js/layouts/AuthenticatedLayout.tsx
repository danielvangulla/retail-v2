import AppLayout from '@/layouts/app-layout';
import { type ReactNode } from 'react';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    return <AppLayout>{children}</AppLayout>;
}
