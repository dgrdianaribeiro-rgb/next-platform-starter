'use client';

import { useEffect, useState } from 'react';
import { saveSubscriptionAction, removeSubscriptionAction } from 'app/alertas/actions';
import { Alert } from 'components/alert';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushSubscribe({ vapidPublicKey }) {
    const [status, setStatus] = useState('checking');
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function check() {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                setStatus('unsupported');
                return;
            }
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                const existing = await registration.pushManager.getSubscription();
                if (!cancelled) setStatus(existing ? 'subscribed' : 'unsubscribed');
            } catch {
                if (!cancelled) setStatus('unsupported');
            }
        }
        check();

        return () => {
            cancelled = true;
        };
    }, []);

    async function subscribe() {
        setError(null);
        try {
            const registration = await navigator.serviceWorker.ready;
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setStatus('denied');
                return;
            }
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });
            await saveSubscriptionAction(subscription.toJSON());
            setStatus('subscribed');
        } catch (err) {
            setError(err.message || 'Não foi possível ativar as notificações.');
        }
    }

    async function unsubscribe() {
        setError(null);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                await removeSubscriptionAction(subscription.endpoint);
            }
            setStatus('unsubscribed');
        } catch (err) {
            setError(err.message || 'Não foi possível desativar as notificações.');
        }
    }

    if (!vapidPublicKey) {
        return (
            <Alert type="info">
                Notificações push ainda não foram configuradas neste site (faltam as chaves VAPID). Seus alertas
                continuam salvos e prontos para usar assim que a configuração for feita.
            </Alert>
        );
    }

    if (status === 'checking') return null;

    if (status === 'unsupported') {
        return <Alert type="info">Seu navegador não suporta notificações push. Tente em um navegador mais recente.</Alert>;
    }

    return (
        <div className="flex flex-col gap-2">
            {error && <Alert type="error">{error}</Alert>}
            {status === 'denied' && (
                <Alert type="error">
                    As notificações foram bloqueadas no navegador. Permita notificações para este site nas
                    configurações do navegador.
                </Alert>
            )}
            {status === 'subscribed' ? (
                <button type="button" className="btn w-fit" onClick={unsubscribe}>
                    Desativar notificações neste dispositivo
                </button>
            ) : (
                <button type="button" className="btn w-fit" onClick={subscribe}>
                    Ativar notificações neste dispositivo
                </button>
            )}
        </div>
    );
}
