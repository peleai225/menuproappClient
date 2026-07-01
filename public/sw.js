const CACHE_NAME = 'menupro-v1'

const PRECACHE_URLS = ['/', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // API: restaurants list — stale-while-revalidate 5min
  if (url.href.match(/menupro\.ci\/api\/v1\/restaurants$/)) {
    event.respondWith(staleWhileRevalidate(event.request, 'restaurants', 5 * 60))
    return
  }

  // API: menus — stale-while-revalidate 10min
  if (url.href.match(/menupro\.ci\/api\/v1\/restaurants\/\d+\/menu$/)) {
    event.respondWith(staleWhileRevalidate(event.request, 'menus', 10 * 60))
    return
  }

  // Map tiles — cache-first 7 days
  if (url.hostname.match(/tile\.openstreetmap\.org/)) {
    event.respondWith(cacheFirst(event.request, 'map-tiles', 7 * 24 * 60 * 60))
    return
  }

  // Storage images — cache-first 30 days
  if (url.href.match(/menupro\.ci\/storage\//)) {
    event.respondWith(cacheFirst(event.request, 'storage-images', 30 * 24 * 60 * 60))
    return
  }
})

async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const clone = response.clone()
      cache.put(request, clone)
    }
    return response
  }).catch(() => cached)

  if (cached) {
    const dateHeader = cached.headers.get('date')
    if (dateHeader) {
      const age = (Date.now() - new Date(dateHeader).getTime()) / 1000
      if (age < maxAge) return cached
    }
    fetchPromise // update in background
    return cached
  }

  return fetchPromise
}

async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    cache.put(request, response.clone())
  }
  return response
}
