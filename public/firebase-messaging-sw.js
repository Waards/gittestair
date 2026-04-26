self.importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCQ4wu4cbbzl0JNRvS0saoG85ESV5GciDM",
  authDomain: "notif-11720.firebaseapp.com",
  projectId: "notif-11720",
  storageBucket: "notif-11720.firebasestorage.app",
  messagingSenderId: "659699156774",
  appId: "1:659699156774:web:12d31f0fe0edf83b52a3e7",
  measurementId: "G-NX9EY94GFZ"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Aircon One Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: payload.data?.type || 'notification',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(urlToOpen));
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});