import Link from 'next/link';
import { requireUser } from 'lib/session';
import { db } from 'lib/db';
import { CandidateCard } from './candidate-card';

export const metadata = {
    title: 'Revisar candidatos'
};

export const dynamic = 'force-dynamic';

export default async function Page() {
    await requireUser();
    const candidates = await db.importQueue.list();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="mb-4">Revisar candidatos a imóvel</h1>
                <p className="text-lg">
                    Esses links foram descobertos automaticamente lendo os sitemaps públicos configurados em{' '}
                    <code>IMPORT_SOURCES</code> (ver README). Nada aparece na busca ou dispara alertas até alguém
                    revisar e publicar aqui.
                </p>
            </div>

            {candidates.length === 0 ? (
                <p className="text-neutral-400">
                    Nenhum candidato no momento. Configure fontes em <code>IMPORT_SOURCES</code> para a descoberta
                    automática rodar a cada hora, ou importe um link manualmente em{' '}
                    <Link href="/imoveis/importar">Importar imóvel</Link>.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {candidates.map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            )}
        </div>
    );
}
