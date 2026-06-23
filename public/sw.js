const CACHE = 'sarah-auto-v1'
const STATIC = [
  '/',
  '/manifest.json',
  '/logo.svg',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Always network-first for API / Supabase
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  // Cache-first for static assets (_next/static, images, fonts)
  if (url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(png|svg|woff2?|ico)$/)) {
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
      })
    )
    return
  }

  // Network-first for HTML pages (always up-to-date)
  e.respondWith(
    fetch(request).catch(() => caches.match(request) ?? caches.match('/'))
  )
})
