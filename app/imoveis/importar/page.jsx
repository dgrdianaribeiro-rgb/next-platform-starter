import { requireUser } from 'lib/session';
import { ImportForm } from './import-form';

export const metadata = {
    title: 'Importar imóvel'
};

export default async function Page() {
    await requireUser();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="mb-4">Importar imóvel por link</h1>
                <p className="text-lg">
                    Encontrou um anúncio de aluguel em outro site (ZAP Imóveis, OLX, QuintoAndar, grupo do
                    WhatsApp...)? Cole o link abaixo para trazê-lo para a busca. Assim que salvo, os usuários com
                    alertas compatíveis são notificados automaticamente.
                </p>
            </div>
            <ImportForm />
        </div>
    );
}
