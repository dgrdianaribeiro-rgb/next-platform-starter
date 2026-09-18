import Link from 'next/link';
import { LoginForm } from './login-form';

export const metadata = {
    title: 'Entrar'
};

export default function Page() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="mb-4">Entrar</h1>
                <p className="text-lg">Entre para gerenciar seus alertas de imóveis para alugar em Fortaleza.</p>
            </div>
            <LoginForm />
            <p>
                Ainda não tem conta?{' '}
                <Link href="/registrar" className="font-bold">
                    Criar conta
                </Link>
            </p>
        </div>
    );
}
