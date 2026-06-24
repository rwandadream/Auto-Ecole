const CACHE = 'sarah-auto-v3'

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting())
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

  // Network-first for HTML and JS bundles to avoid stale chunks after deploy
  if (
    request.mode === 'navigate' ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request)),
    )
    return
  }

  // Cache-first for static assets (images, fonts, icons)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|woff2?|ico)$/)) {
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
