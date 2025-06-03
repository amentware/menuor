// Service Worker for PWA support
const CACHE_NAME = 'menubuilder-cache-v2';
const STATIC_CACHE_NAME = 'menubuilder-static-v2';
const DYNAMIC_CACHE_NAME = 'menubuilder-dynamic-v2';

// Assets that need to be available offline
const staticAssets = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/dashboard',
  '/menu-builder',
  '/qr-code'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(staticAssets);
      })
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName.startsWith('menubuilder-') &&
                   cacheName !== STATIC_CACHE_NAME &&
                   cacheName !== DYNAMIC_CACHE_NAME;
          })
          .map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Handle HTML navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Handle other requests with stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cache new responses for next time
        if (networkResponse.ok) {
          const cacheName = event.request.url.includes('/static/') 
            ? STATIC_CACHE_NAME 
            : DYNAMIC_CACHE_NAME;
          
          caches.open(cacheName).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return offline fallback if network fails and we don't have a cached response
        if (!response) {
          return caches.match('/offline.html');
        }
      });

      return response || fetchPromise;
    })
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  console.log('Background sync:', event.tag);
});

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  console.log('Push notification received');
});
