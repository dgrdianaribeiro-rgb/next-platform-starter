'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from 'lib/session';
import { db } from 'lib/db';

export async function createAlertAction(_prevState, formData) {
    const user = await requireUser();

    const name = formData.get('name')?.toString().trim();
    const type = formData.get('type')?.toString() || 'qualquer';
    const neighborhoods = formData.getAll('neighborhoods').map((n) => n.toString());
    const minPrice = formData.get('minPrice') ? Number(formData.get('minPrice')) : null;
    const maxPrice = formData.get('maxPrice') ? Number(formData.get('maxPrice')) : null;
    const minBedrooms = formData.get('minBedrooms') ? Number(formData.get('minBedrooms')) : null;

    if (!name) return { error: 'Dê um nome para o alerta.' };

    await db.alerts.add({
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        filters: { type, neighborhoods, minPrice, maxPrice, minBedrooms },
        createdAt: new Date().toISOString()
    });

    revalidatePath('/alertas');
    return { success: true };
}

export async function deleteAlertAction(formData) {
    const user = await requireUser();
    const id = formData.get('id')?.toString();
    if (!id) return;
    await db.alerts.remove(id, user.id);
    revalidatePath('/alertas');
}

export async function saveSubscriptionAction(subscription) {
    const user = await requireUser();
    if (!subscription?.endpoint) throw new Error('Assinatura de notificação inválida.');

    await db.pushSubscriptions.add({
        userId: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        createdAt: new Date().toISOString()
    });
}

export async function removeSubscriptionAction(endpoint) {
    await requireUser();
    if (!endpoint) return;
    await db.pushSubscriptions.removeByEndpoint(endpoint);
}
