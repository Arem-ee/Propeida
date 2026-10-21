const CACHE = 'propeida-v2'
const ASSETS = ['/', '/offline', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => Promise.all(ASSETS.map((a) => c.add(a).catch(() => {}))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Supabase API calls — network first
  if (url.hostname.endsWith('.supabase.co')) {
    e.respondWith(networkFirst(e.request))
    return
  }

  // Own API calls — network first
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(e.request))
    return
  }

  // Navigations — network first, fallback to offline page
  if (e.request.mode === 'navigate') {
    e.respondWith(networkFirst(e.request, '/offline'))
    return
  }

  // Next.js build output is content-hashed, so a cached copy can never be
  // wrong. Cache it for good.
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(cacheFirst(e.request))
    return
  }

  // The landing page's own files keep stable names (styles.css, map-scene.png)
  // but change on every deploy. Serving them cache-first froze the page on
  // whatever the first visitor happened to load. The stylesheet decides the
  // layout, so it has to be network-first; images and fonts can go stale for
  // a visit without breaking anything.
  if (url.pathname === '/landing/styles.css') {
    e.respondWith(networkFirst(e.request))
    return
  }

  if (url.pathname.startsWith('/landing/')) {
    e.respondWith(staleWhileRevalidate(e.request))
    return
  }

  // Static assets (JS, CSS, images, fonts) — cache first
  if (url.origin === self.location.origin) {
    e.respondWith(cacheFirst(e.request))
    return
  }

  // Everything else — network only
  e.respondWith(fetch(e.request))
})

async function networkFirst(req, fallbackUrl) {
  try {
    const res = await fetch(req)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      cache.put(req, res.clone())
    }
    return res
  } catch {
    const cached = await caches.match(req)
    if (cached) return cached
    if (fallbackUrl) return caches.match(fallbackUrl)
    return new Response('Offline', { status: 503 })
  }
}

// Serve what is cached straight away, then pull a fresh copy for the next
// visit. A deploy becomes visible on the second load instead of never.
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(req)
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone())
      return res
    })
    .catch(() => null)
  if (cached) return cached
  const fresh = await network
  if (fresh) return fresh
  return new Response('Offline', { status: 503 })
}

async function cacheFirst(req) {
  const cached = await caches.match(req)
  if (cached) return cached
  try {
    const res = await fetch(req)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      cache.put(req, res.clone())
    }
    return res
  } catch {
    return new Response('Offline', { status: 503 })
  }
}
