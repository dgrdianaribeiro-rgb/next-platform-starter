import { db } from 'lib/db';
import { notifyMatchingAlerts } from 'lib/matching';

export function buildListingFromFormData(formData, userId) {
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

    return {
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
        addedBy: userId,
        addedAt: new Date().toISOString()
    };
}

export async function publishListing(listing) {
    await db.listings.add(listing);
    await notifyMatchingAlerts(listing);
}
