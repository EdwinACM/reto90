importScripts("precache.js");
const V = "reto90-v4";
const SHELL = ["./", "index.html", "styles.css", "app.js", "data.js", "content.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(async c => {
    await c.addAll(SHELL);
    self.skipWaiting();
    // GIFs en segundo plano, uno a uno: si falla alguno, no rompe la instalación
    for (const g of self.PRECACHE || []) { try { await c.add(g); } catch (_) {} }
  }));
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isMedia = /\/(gifs|icons)\//.test(req.url);
  if (isMedia) {   // caché primero
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); } return res; })));
  } else {         // red primero (recibes actualizaciones), caché si no hay internet
    e.respondWith(fetch(req, { cache: "no-cache" }).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(req, cp)); } return res; }).catch(() => caches.match(req).then(h => h || caches.match("index.html"))));
  }
});
