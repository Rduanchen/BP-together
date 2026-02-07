// Scripts for firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.8.0/firebase-messaging-compat.js');

const config = new URLSearchParams(location.search).get('config');

if (config) {
    firebase.initializeApp(JSON.parse(decodeURIComponent(config)));

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification?.title || 'Notification';
        const notificationOptions = {
            body: payload.notification?.body,
            icon: '/icon.png',
            data: {
                url: payload.notification?.click_action,
            },
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
    });


    self.addEventListener('notificationclick', (event) => {
        event.notification.close();
        const targetUrl = event.notification.data.url || '/';
        event.waitUntil(self.clients.openWindow(targetUrl));
    });
} else {
    console.error('No config found');
}