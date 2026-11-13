import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'

const assets = (await readdir('dist/assets')).map(name => './assets/' + name)
const files = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', ...assets]
const hash = createHash('sha256')
for (const file of files) hash.update(await readFile('dist/' + (file)))
const version = hash.digest('hex').slice(0, 16)

await writeFile('dist/sw.js', `
const prefix = 'zuyter-shell-' + self.registration.scope + '-'
const cacheName = prefix + '${version}'
const urls = ${JSON.stringify(files)}.map(path => new URL(path, self.registration.scope).href)

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(urls)))
})
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key))
  )).then(() => self.clients.claim()))
})
self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Cache only the public app shell. Never cache Auth, API responses or uploads.
  const shell = new URL(self.registration.scope)
  if (request.mode === 'navigate' && url.origin === shell.origin &&
      (url.pathname === shell.pathname || url.pathname === shell.pathname + 'index.html')) {
    event.respondWith(fetch(request).catch(async () => {
      const cached = await (await caches.open(cacheName)).match(urls[0])
      return cached ? new Response(cached.body, { headers: cached.headers }) : Response.error()
    }))
  } else if (urls.includes(url.href)) {
    event.respondWith(caches.open(cacheName).then(async cache => (await cache.match(url.href, { ignoreVary: true })) || fetch(request)))
  }
})
`)
