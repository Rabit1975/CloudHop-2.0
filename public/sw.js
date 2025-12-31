self.addEventListener('push', function(event: any) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: data.click_action || '/'
    }
  };

  event.waitUntil(
    // @ts-ignore
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event: any) {
  event.notification.close();
  event.waitUntil(
    // @ts-ignore
    self.clients.matchAll({ type: 'window' }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // @ts-ignore
      if (clients.openWindow) {
        // @ts-ignore
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
