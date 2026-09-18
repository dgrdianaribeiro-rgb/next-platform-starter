import { requireUser } from 'lib/session';
import { db } from 'lib/db';
import { deleteAlertAction } from './actions';
import { AlertForm } from './alert-form';
import { Card } from 'components/card';
import { PushSubscribe } from 'components/push-subscribe';

export const metadata = {
    title: 'Meus alertas'
};

export const dynamic = 'force-dynamic';

function describeFilters(filters) {
    const parts = [];
    parts.push(filters.type && filters.type !== 'qualquer' ? filters.type : 'casa ou apartamento');
    parts.push(filters.neighborhoods?.length ? filters.neighborhoods.join(', ') : 'qualquer bairro');
    if (filters.minPrice) parts.push(`a partir de R$ ${filters.minPrice}`);
    if (filters.maxPrice) parts.push(`até R$ ${filters.maxPrice}`);
    if (filters.minBedrooms) parts.push(`${filters.minBedrooms}+ quarto(s)`);
    return parts.join(' · ');
}

export default async function Page() {
    const user = await requireUser();
    const alerts = await db.alerts.listByUser(user.id);

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="mb-4">Meus alertas</h1>
                <p className="text-lg">
                    Salve os critérios do imóvel que você procura em Fortaleza e ative as notificações para ser
                    avisado assim que alguém importar um anúncio compatível.
                </p>
            </div>

            <section className="flex flex-col gap-4">
                <h2>Notificações</h2>
                <PushSubscribe vapidPublicKey={process.env.VAPID_PUBLIC_KEY || ''} />
            </section>

            <section className="flex flex-col gap-4">
                <h2>Novo alerta</h2>
                <AlertForm />
            </section>

            <section className="flex flex-col gap-4">
                <h2>Alertas salvos</h2>
                {alerts.length === 0 ? (
                    <p className="text-neutral-400">Você ainda não criou nenhum alerta.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {alerts.map((alert) => (
                            <Card key={alert.id} title={alert.name}>
                                <p className="text-sm text-neutral-500">{describeFilters(alert.filters)}</p>
                                <form action={deleteAlertAction}>
                                    <input type="hidden" name="id" value={alert.id} />
                                    <button type="submit" className="text-sm text-rose-600 underline">
                                        Excluir alerta
                                    </button>
                                </form>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
