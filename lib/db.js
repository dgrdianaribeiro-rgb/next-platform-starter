import { getStore } from '@netlify/blobs';
import fs from 'node:fs/promises';
import path from 'node:path';

// Each collection is a JSON array stored under a single blob key. This app is built for
// personal/small-scale use (a handful of users tracking rentals in Fortaleza), so a
// full-scan read-modify-write is simple and fast enough; it is not meant for high write
// concurrency.
function collectionStore(name) {
    return getStore({ name: `rental-search-${name}`, consistency: 'strong' });
}

// Netlify Blobs needs a Netlify site context (deployed, or `netlify dev`). Fall back to a
// JSON file on disk when running plain `next dev`, so the app is usable locally without the
// Netlify CLI; this path is never used in production.
const LOCAL_DATA_DIR = path.join(process.cwd(), '.data');

function hasBlobsContext() {
    return Boolean(process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY);
}

async function readLocalFile(name) {
    try {
        const raw = await fs.readFile(path.join(LOCAL_DATA_DIR, `${name}.json`), 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

async function writeLocalFile(name, items) {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DATA_DIR, `${name}.json`), JSON.stringify(items, null, 2));
}

async function getAll(name) {
    if (!hasBlobsContext()) return readLocalFile(name);
    const data = await collectionStore(name).get('all', { type: 'json' });
    return data || [];
}

async function setAll(name, items) {
    if (!hasBlobsContext()) return writeLocalFile(name, items);
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
        },
        async hasSourceUrl(sourceUrl) {
            const listings = await getAll('listings');
            return listings.some((l) => l.sourceUrl === sourceUrl);
        }
    },

    // Candidates discovered automatically from sitemaps (see lib/sitemap.js and
    // netlify/functions/discover-listings.js). Nothing here is shown in search until a
    // logged-in user reviews and publishes it from /imoveis/revisar.
    importQueue: {
        async list() {
            const items = await getAll('import-queue');
            return items.sort((a, b) => new Date(b.discoveredAt) - new Date(a.discoveredAt));
        },
        async hasUrl(sourceUrl) {
            const items = await getAll('import-queue');
            return items.some((i) => i.sourceUrl === sourceUrl);
        },
        async add(candidate) {
            const items = await getAll('import-queue');
            if (items.some((i) => i.sourceUrl === candidate.sourceUrl)) return null;
            items.push(candidate);
            await setAll('import-queue', items);
            return candidate;
        },
        async remove(id) {
            const items = await getAll('import-queue');
            await setAll('import-queue', items.filter((i) => i.id !== id));
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
