self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data = {};
    try {
        data = event.data.json();
    } catch {
        data = { title: 'Novo imóvel disponível', body: event.data.text() };
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'Busca de aluguel em Fortaleza', {
            body: data.body,
            icon: '/favicon.svg',
            data: { url: data.url || '/buscar' }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/buscar';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
