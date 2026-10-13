/* Arranque seguro (ES5): detecta navegadores antiguos o errores y muestra un aviso en vez de una pantalla en blanco */
(function () {
  var shown = false;
  function box(title, detail) {
    if (shown) return; shown = true;
    var d = document.createElement("div");
    d.setAttribute("role", "alert");
    d.style.cssText = "position:fixed;inset:0;z-index:99999;overflow:auto;padding:28px 20px;background:#f2f2f7;color:#1c1c1e;font:16px/1.45 -apple-system,Roboto,Helvetica,Arial,sans-serif";
    var h = document.createElement("h1"); h.textContent = title; h.style.cssText = "font-size:24px;margin:24px 0 10px";
    var p = document.createElement("p"); p.textContent = "Prueba así: abre este enlace en Chrome (actualizado) o en Safari, no desde WhatsApp, Instagram o Facebook. Si ya lo hiciste, toca “Limpiar y reintentar”.";
    var s = document.createElement("p"); s.textContent = detail; s.style.cssText = "font-size:12px;color:#6c6c70;word-break:break-word";
    function btn(t, fn, primary) { var b = document.createElement("button"); b.textContent = t; b.onclick = fn; b.style.cssText = "display:block;width:100%;margin:10px 0;padding:14px;border:0;border-radius:12px;font:600 16px -apple-system,Roboto,sans-serif;background:" + (primary ? "#bf3a06" : "#e5e5ea") + ";color:" + (primary ? "#fff" : "#1c1c1e"); return b; }
    function clean() {
      var done = function () { location.reload(); };
      try {
        var jobs = [];
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) jobs.push(navigator.serviceWorker.getRegistrations().then(function (r) { return Promise.all(r.map(function (x) { return x.unregister(); })); }));
        if (window.caches && caches.keys) jobs.push(caches.keys().then(function (k) { return Promise.all(k.map(function (n) { return caches.delete(n); })); }));
        Promise.all(jobs).then(done, done);
      } catch (e) { done(); }
    }
    d.appendChild(h); d.appendChild(p); d.appendChild(btn("Limpiar y reintentar", clean, true)); d.appendChild(btn("Reintentar", function () { location.reload(); }, false)); d.appendChild(s);
    document.body.appendChild(d);
  }
  // 2) Errores durante la carga
  window.addEventListener("error", function (e) { if (!document.getElementById("app").firstChild) var m = String(e.message || "error"); box(/syntax|unexpected|token|identifier/i.test(m) ? "Tu navegador es muy antiguo para esta app" : "No se pudo abrir la app", m + " · " + navigator.userAgent); });
  window.addEventListener("unhandledrejection", function () {});
  // 3) Si a los 5 s sigue vacía, avisar
  window.addEventListener("load", function () { setTimeout(function () { var a = document.getElementById("app"); if (a && !a.firstChild) box("La app no terminó de cargar", "Sin contenido tras 5 s · " + navigator.userAgent); }, 5000); });
})();
