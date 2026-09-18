'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from 'lib/session';
import { db } from 'lib/db';
import { buildListingFromFormData, publishListing } from 'lib/listings';

export async function publishCandidateAction(formData) {
    const user = await requireUser();
    const listing = buildListingFromFormData(formData, user.id);
    await publishListing(listing);

    const candidateId = formData.get('candidateId')?.toString();
    if (candidateId) await db.importQueue.remove(candidateId);

    redirect(`/imoveis/${listing.id}`);
}

export async function discardCandidateAction(id) {
    await requireUser();
    if (id) await db.importQueue.remove(id);
    revalidatePath('/imoveis/revisar');
}
