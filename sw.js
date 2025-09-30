const CACHE_NAME = 'max-app-v1';
const urlsToCache = [
  '/',
  '/index.html', 
  '/manifest.json',
  'https://upload.wikimedia.org/wikipedia/commons/7/75/Max_logo_2025.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event (for crash simulation - VISUAL ONLY)
self.addEventListener('push', (event) => {
  const options = {
    body: 'Произошёл сбой в приложении (ошибка #4A7B-9C2E), обратитесь к разработчику приложения',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'restart',
        title: 'Перезапустить',
        icon: 'icon-192.png'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MAX - Ошибка', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'restart') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline functionality - SAFE VERSION
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Only show notification without actual crashes
      self.registration.showNotification('MAX - Ошибка', {
        body: 'Произошёл сбой при синхронизации (ошибка #7F3A-1D8B), обратитесь к разработчику',
        icon: 'icons/icon-192.png'
      })
    );
  }
});

// Safe message handling - no termination
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SIMULATE_CRASH') {
    // Only show notification for simulation
    self.registration.showNotification('MAX - Сбой', {
      body: 'Симуляция сбоя приложения',
      icon: 'icons/icon-192.png'
    });
  }
});

// Safe fetch handling
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return proper error response instead of empty one
        return new Response('Network error', { 
          status: 408,
          statusText: 'Network Timeout'
        });
      })
  );
});

// Safe periodic check - only for demonstration
setInterval(() => {
  // Just log activity, no harmful actions
  console.log('MAX Service Worker: Active and safe');
}, 60000); // Check every 60 seconds - harmless
