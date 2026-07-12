const CACHE = 'sarah-auto-v5'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, '/manifest.json', '/logo.svg']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.hostname.includes('supabase') || url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(request))
    return
  }

  // Network-first for navigation and app bundles
  if (
    request.mode === 'navigate' ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    e.respondWith(
      fetch(request).catch(async () => {
        if (request.mode === 'navigate') {
          const offline = await caches.match(OFFLINE_URL)
          if (offline) return offline
        }
        const cached = await caches.match(request)
        if (cached) return cached
        return new Response('Hors ligne', { status: 503, statusText: 'Offline' })
      }),
    )
    return
  }

  // Cache-first for static assets
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|woff2?|ico)$/) || url.pathname === OFFLINE_URL) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(request, clone))
          }
          return res
        })
      }),
    )
  }
})
