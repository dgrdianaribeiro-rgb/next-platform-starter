import Image from 'next/image';
import Link from 'next/link';
import netlifyLogo from 'public/netlify-logo.svg';
import githubLogo from 'public/images/github-mark-white.svg';
import { getCurrentUser } from 'lib/session';
import { logoutAction } from 'lib/session-actions';

const navItems = [
    { linkText: 'Buscar', href: '/buscar' },
    { linkText: 'Alertas', href: '/alertas' },
    { linkText: 'Importar imóvel', href: '/imoveis/importar' },
    { linkText: 'Revisar', href: '/imoveis/revisar' }
];

export async function Header() {
    const user = await getCurrentUser();

    return (
        <nav className="flex flex-wrap items-center gap-4 pt-6 pb-12 sm:pt-12 md:pb-24">
            <Link href="/">
                <Image src={netlifyLogo} alt="Netlify logo" />
            </Link>
            {!!navItems?.length && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href} className="inline-flex px-1.5 py-1 sm:px-3 sm:py-2">
                                {item.linkText}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex items-center gap-3 ml-auto">
                {user ? (
                    <>
                        <span className="text-sm">Olá, {user.name}</span>
                        <form action={logoutAction}>
                            <button type="submit" className="text-sm underline">
                                Sair
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <Link href="/entrar" className="text-sm">
                            Entrar
                        </Link>
                        <Link href="/registrar" className="text-sm">
                            Criar conta
                        </Link>
                    </>
                )}
                <Link href="https://github.com/netlify-templates/next-platform-starter" target="_blank" rel="noopener noreferrer">
                    <Image src={githubLogo} alt="GitHub logo" className="w-7" />
                </Link>
            </div>
        </nav>
    );
}
