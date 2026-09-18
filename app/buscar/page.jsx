import Link from 'next/link';
import { db } from 'lib/db';
import { getCurrentUser } from 'lib/session';
import { ListingCard } from 'components/listing-card';
import { SearchFilters } from './search-filters';

export const metadata = {
    title: 'Buscar imóveis'
};

export const dynamic = 'force-dynamic';

function applyFilters(listings, filters) {
    return listings.filter((listing) => {
        if (filters.type && filters.type !== 'qualquer' && listing.type !== filters.type) return false;
        if (filters.neighborhood && listing.neighborhood !== filters.neighborhood) return false;
        if (filters.minPrice && (listing.price ?? 0) < filters.minPrice) return false;
        if (filters.maxPrice && (listing.price ?? Infinity) > filters.maxPrice) return false;
        if (filters.minBedrooms && (listing.bedrooms ?? 0) < filters.minBedrooms) return false;
        return true;
    });
}

export default async function Page({ searchParams }) {
    const params = await searchParams;
    const filters = {
        type: params.tipo || 'qualquer',
        neighborhood: params.bairro || '',
        minPrice: params.precoMin ? Number(params.precoMin) : null,
        maxPrice: params.precoMax ? Number(params.precoMax) : null,
        minBedrooms: params.quartosMin ? Number(params.quartosMin) : null
    };

    const [allListings, user] = await Promise.all([db.listings.list(), getCurrentUser()]);
    const listings = applyFilters(allListings, filters);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="mb-4">Casas e apartamentos para alugar em Fortaleza</h1>
                <p className="text-lg">
                    Filtre por bairro, preço e quartos. Não achou o que queria?{' '}
                    <Link href="/alertas" className="font-bold">
                        Crie um alerta
                    </Link>{' '}
                    e receba uma notificação assim que um imóvel compatível for cadastrado.
                </p>
            </div>

            <SearchFilters filters={filters} />

            <div className="flex items-center justify-between">
                <p className="text-neutral-400">
                    {listings.length} imóvel(is) encontrado(s) de {allListings.length} cadastrado(s)
                </p>
                {user ? (
                    <Link href="/imoveis/importar" className="btn">
                        + Importar imóvel
                    </Link>
                ) : (
                    <Link href="/entrar" className="btn">
                        Entrar para importar
                    </Link>
                )}
            </div>

            {listings.length === 0 ? (
                <p className="text-lg">
                    Nenhum imóvel encontrado com esses filtros ainda.{' '}
                    {user ? (
                        <>
                            Que tal <Link href="/imoveis/importar">importar um anúncio</Link> que você encontrou em outro
                            site?
                        </>
                    ) : (
                        <>
                            <Link href="/entrar">Entre</Link> para importar anúncios ou{' '}
                            <Link href="/alertas">crie um alerta</Link> para ser avisado quando surgir um.
                        </>
                    )}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    );
}
