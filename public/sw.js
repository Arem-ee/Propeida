const CACHE = 'propeida-v1'
const ASSETS = ['/', '/offline', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
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
