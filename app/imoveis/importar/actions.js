'use server';

import { redirect } from 'next/navigation';
import { requireUser } from 'lib/session';
import { db } from 'lib/db';
import { fetchListingPreview } from 'lib/scraper';
import { notifyMatchingAlerts } from 'lib/matching';

export async function previewListingAction(_prevState, formData) {
    await requireUser();

    const url = formData.get('url')?.toString().trim();
    if (!url) return { error: 'Cole o link do anúncio.' };

    try {
        // eslint-disable-next-line no-new
        new URL(url);
    } catch {
        return { error: 'Link inválido.' };
    }

    try {
        const preview = await fetchListingPreview(url);
        return { preview };
    } catch (err) {
        return { error: err.message || 'Não foi possível importar este link. Preencha os dados manualmente.' };
    }
}

export async function saveListingAction(formData) {
    const user = await requireUser();

    const title = formData.get('title')?.toString().trim();
    const neighborhood = formData.get('neighborhood')?.toString().trim();
    const price = Number(formData.get('price'));
    const sourceUrl = formData.get('sourceUrl')?.toString().trim();

    if (!title || !neighborhood || !price || !sourceUrl) {
        throw new Error('Preencha título, bairro, preço e o link de origem.');
    }

    let sourceName = formData.get('sourceName')?.toString().trim();
    try {
        sourceName = sourceName || new URL(sourceUrl).hostname.replace(/^www\./, '');
    } catch {
        throw new Error('Link de origem inválido.');
    }

    const listing = {
        id: crypto.randomUUID(),
        title,
        type: formData.get('type')?.toString() === 'casa' ? 'casa' : 'apartamento',
        neighborhood,
        city: 'Fortaleza',
        price,
        bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : null,
        area: formData.get('area') ? Number(formData.get('area')) : null,
        description: formData.get('description')?.toString().trim() || '',
        imageUrl: formData.get('imageUrl')?.toString().trim() || null,
        sourceUrl,
        sourceName,
        addedBy: user.id,
        addedAt: new Date().toISOString()
    };

    await db.listings.add(listing);
    await notifyMatchingAlerts(listing);

    redirect(`/imoveis/${listing.id}`);
}
