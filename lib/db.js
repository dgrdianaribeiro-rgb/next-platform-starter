import { getStore } from '@netlify/blobs';

// Each collection is a JSON array stored under a single blob key. This app is built for
// personal/small-scale use (a handful of users tracking rentals in Fortaleza), so a
// full-scan read-modify-write is simple and fast enough; it is not meant for high write
// concurrency.
function collectionStore(name) {
    return getStore({ name: `rental-search-${name}`, consistency: 'strong' });
}

async function getAll(name) {
    const data = await collectionStore(name).get('all', { type: 'json' });
    return data || [];
}

async function setAll(name, items) {
    await collectionStore(name).setJSON('all', items);
}

export const db = {
    users: {
        async findByEmail(email) {
            const users = await getAll('users');
            return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
        },
        async findById(id) {
            const users = await getAll('users');
            return users.find((u) => u.id === id) || null;
        },
        async create(user) {
            const users = await getAll('users');
            users.push(user);
            await setAll('users', users);
            return user;
        }
    },

    listings: {
        async list() {
            const listings = await getAll('listings');
            return listings.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
        },
        async getById(id) {
            const listings = await getAll('listings');
            return listings.find((l) => l.id === id) || null;
        },
        async add(listing) {
            const listings = await getAll('listings');
            listings.push(listing);
            await setAll('listings', listings);
            return listing;
        }
    },

    alerts: {
        async listAll() {
            return getAll('alerts');
        },
        async listByUser(userId) {
            const alerts = await getAll('alerts');
            return alerts.filter((a) => a.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },
        async add(alert) {
            const alerts = await getAll('alerts');
            alerts.push(alert);
            await setAll('alerts', alerts);
            return alert;
        },
        async remove(id, userId) {
            const alerts = await getAll('alerts');
            const next = alerts.filter((a) => !(a.id === id && a.userId === userId));
            await setAll('alerts', next);
        }
    },

    pushSubscriptions: {
        async listByUser(userId) {
            const subs = await getAll('push-subscriptions');
            return subs.filter((s) => s.userId === userId);
        },
        async add(subscription) {
            const subs = await getAll('push-subscriptions');
            const next = subs.filter((s) => s.endpoint !== subscription.endpoint);
            next.push(subscription);
            await setAll('push-subscriptions', next);
            return subscription;
        },
        async removeByEndpoint(endpoint) {
            const subs = await getAll('push-subscriptions');
            const next = subs.filter((s) => s.endpoint !== endpoint);
            await setAll('push-subscriptions', next);
        }
    }
};
