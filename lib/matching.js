import { db } from 'lib/db';
import { sendPushNotification } from 'lib/push';

function alertMatchesListing(alert, listing) {
    const f = alert.filters || {};

    if (f.type && f.type !== 'qualquer' && f.type !== listing.type) return false;
    if (f.neighborhoods?.length && !f.neighborhoods.includes(listing.neighborhood)) return false;
    if (f.minPrice && (listing.price ?? 0) < f.minPrice) return false;
    if (f.maxPrice && (listing.price ?? Infinity) > f.maxPrice) return false;
    if (f.minBedrooms && (listing.bedrooms ?? 0) < f.minBedrooms) return false;

    return true;
}

// Called right after a new listing is added. There is no background crawler in this app
// (see lib/scraper.js), so this is the moment new inventory appears and alerts can fire.
export async function notifyMatchingAlerts(listing) {
    const alerts = await db.alerts.listAll();
    const matchingAlerts = alerts.filter((alert) => alertMatchesListing(alert, listing));
    if (!matchingAlerts.length) return;

    const userIds = [...new Set(matchingAlerts.map((a) => a.userId))];

    await Promise.all(
        userIds.map(async (userId) => {
            const subscriptions = await db.pushSubscriptions.listByUser(userId);
            const price = listing.price
                ? listing.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'preço a combinar';

            await Promise.all(
                subscriptions.map((subscription) =>
                    sendPushNotification(subscription, {
                        title: `Novo imóvel em ${listing.neighborhood}`,
                        body: `${listing.title} · ${price}`,
                        url: `/imoveis/${listing.id}`
                    })
                )
            );
        })
    );
}
