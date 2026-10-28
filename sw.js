// Service Worker for Mobile PWA (Offline-First with Network-First Update Strategy)
const CACHE_NAME = "studyhub-v25";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/mockData.js",
  "./js/syncedData.js",
  "./js/db.js",
  "./js/studyPlanner.js",
  "./js/notifications.js",
  "./js/rewards.js",
  "./js/pastPapers.js",
  "./js/quizzer.js",
  "./js/vocabHub.js",
  "./js/schoolSync.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Let live API requests pass through directly to network
  if (
    e.request.url.includes("/api/") ||
    e.request.url.includes("lmsapi.aaj.edu.jo") || 
    e.request.url.includes("googleapis.com")
  ) {
    return;
  }

  // Network First: Always try to get freshest updates, fallback to cache if offline
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(e.request))
  );
});
