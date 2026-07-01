importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey:            "AIzaSyA3O6fkzC51wVle8J4jhNbY15VhJDRqk60",
  authDomain:        "menuproapp-eeb2e.firebaseapp.com",
  projectId:         "menuproapp-eeb2e",
  storageBucket:     "menuproapp-eeb2e.firebasestorage.app",
  messagingSenderId: "445689267258",
  appId:             "1:445689267258:web:f0ce04556245536fcd2103",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "MenuPro"
  const body  = payload.notification?.body  ?? ""
  const data  = payload.data ?? {}

  self.registration.showNotification(title, {
    body,
    icon:  "/icon-192.png",
    badge: "/icon-dark-32x32.png",
    tag:   data.type ?? "menupro-push",
    data,
    vibrate: [200, 100, 200],
    actions: data.type === "order_status"
      ? [{ action: "track", title: "Suivre ma commande" }]
      : [],
  })
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const data = event.notification.data ?? {}
  const url  = data.order_id ? `/orders/${data.order_id}` : "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(url) || c.url.endsWith("/"))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})

const CACHE_NAME = 'menupro-v2'

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
