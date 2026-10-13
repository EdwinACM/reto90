importScripts("precache.js");
const V = "reto90-v19";
const SHELL = ["./", "index.html", "styles.css", "app.js", "data.js", "boot.js", "store.js", "content.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (/\/(gifs|icons)\//.test(req.url)) {   // medios: caché primero
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); } return res; })));
  } else {                                   // código: red primero, caché si no hay internet
    e.respondWith(fetch(req, { cache: "no-cache" }).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); } return res; }).catch(() => caches.match(req).then(h => h || caches.match("index.html"))));
  }
});
// Descarga de todos los GIFs solo cuando la persona lo pide (≈12 MB), con progreso
self.addEventListener("message", e => {
  if (e.data !== "precache") return;
  e.waitUntil((async () => {
    const list = self.PRECACHE || [], c = await caches.open(V), clients = await self.clients.matchAll(); let done = 0;
    const say = () => clients.forEach(cl => cl.postMessage({ type: "precache", done, total: list.length }));
    for (let i = 0; i < list.length; i += 4) { await Promise.all(list.slice(i, i + 4).map(async g => { try { if (!(await c.match(g))) await c.add(g); } catch (_) {} done++; })); say(); }
    say();
  })());
});
