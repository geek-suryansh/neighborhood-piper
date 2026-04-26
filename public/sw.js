const CACHE = 'stap-v3'
const PRECACHE = ['/app']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { url, method } = event.request
  if (method !== 'GET') return

  const u = new URL(url)
  const isPage = u.pathname === '/app' || u.pathname.startsWith('/app/') || u.pathname.startsWith('/_next/static/')
  if (!isPage) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok) {
          caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()))
        }
        return response
      })
      return cached ?? network
    })
  )
})
