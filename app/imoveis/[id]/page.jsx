import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from 'lib/db';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const listing = await db.listings.getById(id);
    return { title: listing ? listing.title : 'Imóvel não encontrado' };
}

export const dynamic = 'force-dynamic';

function formatPrice(price) {
    if (!price) return 'Preço a combinar';
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function Page({ params }) {
    const { id } = await params;
    const listing = await db.listings.getById(id);
    if (!listing) notFound();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <Link href="/buscar">&larr; Voltar para a busca</Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {listing.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="object-cover w-full rounded-sm max-h-96"
                    />
                )}
                <div className="flex flex-col gap-4">
                    <h1>{listing.title}</h1>
                    <p className="text-lg text-neutral-400">
                        {listing.neighborhood} · Fortaleza · {listing.type === 'casa' ? 'Casa' : 'Apartamento'}
                    </p>
                    <p className="text-2xl font-bold">{formatPrice(listing.price)}/mês</p>
                    <p className="flex flex-wrap gap-x-6 text-neutral-300">
                        {listing.bedrooms != null && <span>{listing.bedrooms} quarto(s)</span>}
                        {listing.area != null && <span>{listing.area} m²</span>}
                    </p>
                    {listing.description && <p>{listing.description}</p>}
                    <Link href={listing.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn w-fit">
                        Ver anúncio original em {listing.sourceName}
                    </Link>
                </div>
            </div>
        </div>
    );
}
