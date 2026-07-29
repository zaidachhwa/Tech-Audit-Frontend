self.addEventListener("push", function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: "/logo.png",
        badge: "/logo.png",
        vibrate: [100, 50, 100],
        data: {
          url: data.url || "/",
        },
      };
      
      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {
      // Fallback if data is not JSON
      const options = {
        body: event.data.text(),
        icon: "/logo.png",
      };
      event.waitUntil(self.registration.showNotification("Notification", options));
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          // If so, just focus it.
          if (client.url === event.notification.data.url && "focus" in client) {
            return client.focus();
          }
        }
        // If not, then open the target URL in a new window/tab.
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});
