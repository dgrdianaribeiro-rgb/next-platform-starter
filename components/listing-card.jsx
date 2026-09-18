import Link from 'next/link';
import { Card } from 'components/card';

function formatPrice(price) {
    if (!price) return 'Preço a combinar';
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ListingCard({ listing }) {
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3>
                        <Link href={`/imoveis/${listing.id}`}>{listing.title}</Link>
                    </h3>
                    <span className="shrink-0 px-2 py-1 text-xs font-bold uppercase rounded-sm bg-secondary text-white">
                        {listing.type === 'casa' ? 'Casa' : 'Apartamento'}
                    </span>
                </div>
                <p className="text-sm text-neutral-500">{listing.neighborhood} · Fortaleza</p>
                <p className="text-lg font-bold">{formatPrice(listing.price)}/mês</p>
                <p className="flex flex-wrap gap-x-4 text-sm text-neutral-500">
                    {listing.bedrooms != null && <span>{listing.bedrooms} quarto(s)</span>}
                    {listing.area != null && <span>{listing.area} m²</span>}
                </p>
                <Link href={`/imoveis/${listing.id}`} className="btn mt-2">
                    Ver detalhes
                </Link>
            </div>
        </Card>
    );
}
