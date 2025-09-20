// Service Worker for ECHO PWA
// This timestamp will be unique for each deployment, ensuring cache busting
const BUILD_TIMESTAMP = '{{BUILD_TIMESTAMP}}';
const CACHE_NAME = `echo-v${BUILD_TIMESTAMP || Date.now()}`;
const STATIC_CACHE_URLS = [
  '/',
  '/translate',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// API endpoints that should be cached temporarily
const API_CACHE_URLS = [
  '/api/translations'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing with cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching static files');
      return cache.addAll(STATIC_CACHE_URLS);
    }).catch((error) => {
      console.error('Service Worker: Failed to cache static files:', error);
    })
  );
  // Force immediate activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating with cache:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses temporarily
          if (response.ok && API_CACHE_URLS.some(path => url.pathname.includes(path))) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for API requests when offline
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline message for critical API failures
            return new Response(
              JSON.stringify({ 
                message: 'You are offline. Please check your connection and try again.',
                offline: true 
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy, but check for updates periodically
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // For HTML files, always try network first to get updates faster
      if (request.mode === 'navigate' || request.destination === 'document') {
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Fallback to cache if network fails
          return cachedResponse || new Response('App is offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      }

      // For other assets, use cache-first but validate freshness
      if (cachedResponse) {
        // Check if cached response is fresh (less than 5 minutes old)
        const cachedTime = cachedResponse.headers.get('sw-cached-time');
        if (cachedTime && (Date.now() - parseInt(cachedTime)) < 300000) {
          return cachedResponse;
        }
      }

      // Fetch from network and cache
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          // Add timestamp to track cache freshness
          const responseWithTime = new Response(responseClone.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...response.headers,
              'sw-cached-time': Date.now().toString()
            }
          });
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseWithTime);
          });
        }
        return response;
      }).catch((error) => {
        console.error('Service Worker: Fetch failed:', error);
        
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Return a fallback response for navigation requests
        if (request.mode === 'navigate') {
          return new Response('App is offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        }
        
        throw error;
      });
    })
  );
});

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  const options = {
    body: event.data ? event.data.text() : 'New translation available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Translation',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ECHO', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/translate')
    );
  }
});