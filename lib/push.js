import webpush from 'web-push';
import { db } from 'lib/db';

let configured = false;

export function pushIsConfigured() {
    return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function ensureConfigured() {
    if (configured) return true;
    if (!pushIsConfigured()) {
        console.warn('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY não configuradas; notificações push desativadas.');
        return false;
    }
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:contato@example.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
    configured = true;
    return true;
}

export async function sendPushNotification(subscription, payload) {
    if (!ensureConfigured()) return;

    try {
        await webpush.sendNotification(
            { endpoint: subscription.endpoint, keys: subscription.keys },
            JSON.stringify(payload)
        );
    } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription is no longer valid (browser unregistered it) — clean it up.
            await db.pushSubscriptions.removeByEndpoint(subscription.endpoint);
        } else {
            console.error('Falha ao enviar notificação push:', err.message);
        }
    }
}
