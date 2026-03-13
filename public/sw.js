// Service Worker for PWA
const CACHE_NAME = 'putti-blob-journal-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/scene.js',
    '/js/Blob.js',
    '/js/Physics.js',
    '/js/Molding.js',
    '/js/UI.js',
    '/js/Storage.js',
    '/js/Replay.js',
    '/js/Dashboard.js',
    '/manifest.json',
    '/assets/icons/icon-192.svg',
    '/assets/icons/icon-512.svg',
    '/assets/mock-art/art1.svg',
    '/assets/mock-art/art2.svg',
    '/assets/mock-art/art3.svg',
    '/assets/mock-art/art4.svg',
    '/assets/mock-art/art5.svg',
    '/assets/mock-art/art6.svg',
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
    'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
