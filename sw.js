importScripts("precache.js");
const V = "reto90-v42";
const SHELL = ["./", "index.html", "styles.css", "app.js", "data.js", "boot.js", "store.js", "content.js", "cloud.js", "account.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
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

// Notificaciones push: el servidor envía y aquí solo se muestran
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) {}
  const url = typeof d.url === "string" && /^#\/[a-z0-9\/_-]*$/.test(d.url) ? d.url : "#/hoy";
  e.waitUntil(self.registration.showNotification(String(d.title || "R90").slice(0, 80), { body: String(d.body || "").slice(0, 200), tag: String(d.tag || "r90").slice(0, 80), icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { url } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || "#/hoy", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { c.focus(); return "navigate" in c ? c.navigate(target) : null; }
    return self.clients.openWindow(target);
  }));
});
