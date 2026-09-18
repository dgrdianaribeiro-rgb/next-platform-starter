import Link from 'next/link';
import { RegisterForm } from './register-form';

export const metadata = {
    title: 'Criar conta'
};

export default function Page() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="mb-4">Criar conta</h1>
                <p className="text-lg">Crie uma conta para salvar buscas e receber alertas de novos imóveis.</p>
            </div>
            <RegisterForm />
            <p>
                Já tem conta?{' '}
                <Link href="/entrar" className="font-bold">
                    Entrar
                </Link>
            </p>
        </div>
    );
}
