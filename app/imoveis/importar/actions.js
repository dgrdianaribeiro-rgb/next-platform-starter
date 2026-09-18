'use server';

import { redirect } from 'next/navigation';
import { requireUser } from 'lib/session';
import { fetchListingPreview } from 'lib/scraper';
import { buildListingFromFormData, publishListing } from 'lib/listings';

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
    const listing = buildListingFromFormData(formData, user.id);
    await publishListing(listing);
    redirect(`/imoveis/${listing.id}`);
}
