/* Almacenamiento local: IndexedDB para fotos de progreso y una copia de respaldo de tus datos.
   Todo se queda en este dispositivo; no se envía a ningún servidor. */
(() => {
  const DB = "reto90", VERSION = 1;
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    if (!("indexedDB" in window)) return rej(new Error("sin IndexedDB"));
    const r = indexedDB.open(DB, VERSION);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains("photos")) d.createObjectStore("photos", { keyPath: "id" }); if (!d.objectStoreNames.contains("kv")) d.createObjectStore("kv"); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const run = async (store, mode, fn) => {
    const d = await open();
    return new Promise((res, rej) => { const t = d.transaction(store, mode), req = fn(t.objectStore(store)); t.oncomplete = () => res(req && req.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  };
  /* Reduce la foto (máx. 1100 px) y la guarda como JPEG para no llenar el teléfono */
  const toJpeg = (file, max = 1100) => new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error("no se pudo procesar la foto")), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("imagen no válida")); };
    img.src = url;
  });
  window.Store = {
    available: () => "indexedDB" in window,
    async addPhoto(file, date, angle) { const blob = await toJpeg(file); const id = `${date}-${angle}-${Date.now()}`; await run("photos", "readwrite", s => s.put({ id, date, angle, blob })); return id; },
    photos: () => run("photos", "readonly", s => s.getAll()),
    delPhoto: id => run("photos", "readwrite", s => s.delete(id)),
    setKV: (k, v) => run("kv", "readwrite", s => s.put(v, k)),
    getKV: k => run("kv", "readonly", s => s.get(k)),
    /* Pide al navegador que no borre estos datos cuando necesite espacio */
    async persist() { try { return navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false; } catch { return false; } },
    async persisted() { try { return navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false; } catch { return false; } },
    async usage() { try { const e = await navigator.storage.estimate(); return { used: e.usage || 0, quota: e.quota || 0 }; } catch { return null; } },
  };
})();
