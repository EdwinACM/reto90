/* Reto 90 · nube: cuentas, dispositivo único y sincronización.
   Sin librerías: habla directo con Supabase (Auth y funciones RPC). La llave publicable es pública por diseño;
   la seguridad real está en la base de datos (RLS cerrada + funciones que validan sesión y dispositivo). */
(() => {
  const URL_ = "https://lplmjqfkajxnapnaslsd.supabase.co", KEY = "sb_publishable_Od7_-34dh94IwLNBKdCRHQ_VbFSN2Gv";
  const AUTH_KEY = "reto90.auth", SYNC_KEY = "reto90.sync", OK_KEY = "reto90.cloudok", DEV_KEY = "reto90.dev", DOMAIN = "@reto90.invalid";
  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const J = s => { try { return JSON.parse(s); } catch (e) { return null; } };
  const state = { status: "boot", me: null, sync: "idle", lastSync: 0, error: "" };
  let sess = J(ls.get(AUTH_KEY)), refreshing = null;

  /* ---------- red ---------- */
  async function http(path, { method = "GET", body, token } = {}) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(URL_ + path, { method, signal: ctl.signal, headers: { apikey: KEY, "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, body: body !== undefined ? JSON.stringify(body) : undefined });
      const txt = await r.text(), j = txt ? J(txt) : null;
      if (!r.ok) throw Object.assign(new Error((j && (j.message || j.msg || j.error_description || j.error)) || "http_" + r.status), { status: r.status, code: j && (j.code || j.error_code), body: j });
      return j;
    } catch (e) {
      if (e && e.status) throw e;
      throw Object.assign(new Error("sin_conexion"), { offline: true });
    } finally { clearTimeout(t); }
  }
  const setSess = j => { sess = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600) }; ls.set(AUTH_KEY, JSON.stringify(sess)); };
  const clearSess = () => { sess = null; ls.del(AUTH_KEY); };
  async function refresh() {
    if (!sess) throw Object.assign(new Error("sin_sesion"), { status: 401 });
    if (refreshing) return refreshing;
    refreshing = (async () => {
      try { setSess(await http("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: sess.refresh_token } })); }
      catch (e) { if (e.status === 400 || e.status === 401 || e.status === 403 || e.status === 422) clearSess(); throw e; }
      finally { refreshing = null; }
    })();
    return refreshing;
  }
  async function token() {
    if (!sess) return null;
    if (sess.expires_at - Date.now() / 1000 < 60) await refresh();
    return sess && sess.access_token;
  }
  async function rpc(name, args) {
    const call = async () => http("/rest/v1/rpc/" + name, { method: "POST", body: args || {}, token: await token() });
    try { return await call(); }
    catch (e) { if (e.status === 401 && sess) { await refresh(); return call(); } throw e; }
  }

  /* ---------- utilidades ---------- */
  const b64url = u8 => btoa(String.fromCharCode(...u8)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const pwProblem = pw => {
    if (typeof pw !== "string" || pw.length < 10) return "Usa al menos 10 caracteres";
    if (pw.length > 72) return "Máximo 72 caracteres";
    if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) return "Mezcla minúsculas, mayúsculas, números y un símbolo";
    return "";
  };
  async function pwned(pw) {
    try {
      const h = [...new Uint8Array(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(pw)))].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
      const r = await fetch("https://api.pwnedpasswords.com/range/" + h.slice(0, 5), { headers: { "Add-Padding": "true" } });
      if (!r.ok) return -1;
      for (const line of (await r.text()).split("\n")) { const [x, c] = line.trim().split(":"); if (x === h.slice(5) && +c > 0) return +c; }
      return 0;
    } catch (e) { return -1; }
  }
  const userOk = u => /^[a-z0-9_]{3,20}$/.test(u);
  function deviceName() {
    const ua = navigator.userAgent, os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Macintosh/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Dispositivo";
    const br = /EdgA|Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /FxiOS|Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Navegador";
    const app = (matchMedia("(display-mode: standalone)").matches || navigator.standalone) ? " (app instalada)" : "";
    return (os + " · " + br + app).slice(0, 60);
  }
  async function deviceToken(create) {
    let t = ls.get(DEV_KEY);
    try { if (window.Store && Store.getKV) { const v = await Store.getKV("devtoken"); if (typeof v === "string" && v.length >= 32) t = v; else if (t && Store.setKV) await Store.setKV("devtoken", t); } } catch (e) {}
    if ((!t || t.length < 32) && create) {
      t = b64url(crypto.getRandomValues(new Uint8Array(32)));
      ls.set(DEV_KEY, t);
      try { if (window.Store && Store.setKV) await Store.setKV("devtoken", t); } catch (e) {}
    }
    return t && t.length >= 32 ? t : null;
  }
  const MSG = {
    sin_conexion: "Sin conexión. Revisa tu internet e inténtalo de nuevo.", invitacion_invalida: "La invitación no es válida o ya venció.", usuario_invalido: "Usa de 3 a 20 letras minúsculas, números o guion bajo.",
    correo_invalido: "Usuario no válido.", no_verificado: "Este dispositivo aún no está autorizado.", bloqueado: "Tu cuenta está bloqueada. Habla con el administrador.", demasiados_intentos: "Demasiados intentos. Espera unos minutos.",
    solo_admin: "Solo el administrador puede hacer esto.", dispositivo_existente: "Ya hay un dispositivo registrado para esta cuenta.", sin_dispositivo: "Tu cuenta aún no tiene dispositivo registrado.",
    sin_solicitud: "No hay solicitud pendiente.", estado_invalido: "Los datos no son válidos o son demasiado grandes.", no_a_ti_mismo: "No puedes hacerlo con tu propia cuenta.", contrasena_corta: "La contraseña temporal debe tener al menos 10 caracteres.",
    "Invalid login credentials": "Usuario o contraseña incorrectos.", "Database error saving new user": "No se pudo crear la cuenta. Revisa la invitación y el nombre de usuario.", "User already registered": "Ese usuario ya existe.",
    user_already_exists: "Ese usuario ya existe.", weak_password: "La contraseña no cumple los requisitos.", over_request_rate_limit: "Demasiados intentos. Espera unos minutos.", user_banned: "Tu cuenta está bloqueada. Habla con el administrador.",
    invalid_credentials: "Usuario o contraseña incorrectos.", same_password: "La contraseña nueva debe ser distinta.", current_password_required: "Escribe tu contraseña actual.",
  };
  const human = e => (e && (MSG[e.code] || MSG[e.message] || (e.message && Object.keys(MSG).find(k => e.message.includes(k)) && MSG[Object.keys(MSG).find(k => e.message.includes(k))]))) || (e && e.offline ? MSG.sin_conexion : "Algo salió mal. Inténtalo de nuevo.");

  /* ---------- cuenta ---------- */
  const syncMeta = () => J(ls.get(SYNC_KEY)) || { version: 0, at: 0, dirty: false };
  const setSyncMeta = m => ls.set(SYNC_KEY, JSON.stringify({ ...syncMeta(), ...m }));
  const rememberOk = u => ls.set(OK_KEY, JSON.stringify({ u, at: Date.now() }));

  async function evaluate() {
    // Decide el estado según el servidor: bloqueado, sin dispositivo, a verificar o listo.
    const me = await rpc("me"); state.me = me;
    if (me.must_change_pw && !me.verified) { /* igual debe pasar por dispositivo primero */ }
    if (!me.has_device) {
      await rpc("register_device", { p_token: await deviceToken(true), p_name: deviceName() });
      state.me = await rpc("me"); state.status = "ok"; rememberOk(state.me.username); return state.status;
    }
    if (me.verified) { state.status = "ok"; rememberOk(me.username); return state.status; }
    const tok = await deviceToken(false);
    if (tok && (await rpc("verify_session", { p_token: tok }))) { state.me = await rpc("me"); state.status = "ok"; rememberOk(state.me.username); return state.status; }
    state.status = me.request && me.request.status === "pending" ? "pending" : "need_device";
    return state.status;
  }

  async function boot() {
    if (!sess) { state.status = "anon"; return state.status; }
    try { return await evaluate(); }
    catch (e) {
      if (e.offline) { const ok = J(ls.get(OK_KEY)); state.status = ok ? "offline_ok" : "anon"; return state.status; }
      if (e.message === "bloqueado") { state.status = "blocked"; return state.status; }
      if (e.status === 401 || e.status === 403 || e.message === "sin_sesion") { clearSess(); state.status = "anon"; return state.status; }
      state.error = human(e); state.status = "error"; return state.status;
    }
  }

  async function signIn(username, password) {
    const u = String(username || "").trim().toLowerCase();
    if (!userOk(u)) throw Object.assign(new Error("usuario_invalido"), { code: "usuario_invalido" });
    setSess(await http("/auth/v1/token?grant_type=password", { method: "POST", body: { email: u + DOMAIN, password } }));
    return evaluate();
  }
  async function signUp(username, password, invite) {
    const u = String(username || "").trim().toLowerCase();
    if (!userOk(u)) throw Object.assign(new Error("usuario_invalido"), { code: "usuario_invalido" });
    const j = await http("/auth/v1/signup", { method: "POST", body: { email: u + DOMAIN, password, data: { username: u, invite: String(invite || "").trim(), consent: "true" } } });
    if (!j || !j.access_token) throw Object.assign(new Error("Database error saving new user"), {});
    setSess(j);
    return evaluate();
  }
  async function signOut() {
    try { if (sess) await http("/auth/v1/logout", { method: "POST", token: sess.access_token }); } catch (e) {}
    clearSess(); ls.del(OK_KEY); ls.del(SYNC_KEY); state.status = "anon"; state.me = null;
  }
  async function changePassword(current, next) {
    await http("/auth/v1/user", { method: "PUT", token: await token(), body: { password: next, current_password: current } });
    try { await rpc("password_changed"); state.me = await rpc("me"); } catch (e) {}
  }
  async function requestChange() { return rpc("request_device_change", { p_token: await deviceToken(true), p_name: deviceName() }); }
  async function pollRequest() {
    const tok = await deviceToken(false); if (!tok) return "none";
    const s = await rpc("request_status", { p_token: tok });
    if (s === "approved") { await evaluate(); }
    return s;
  }

  /* ---------- sincronización ---------- */
  const pull = () => rpc("pull_state");
  async function push(stateObj) {
    const r = await rpc("push_state", { p_state: stateObj, p_base: syncMeta().version || 0 });
    if (!r.conflict) setSyncMeta({ version: r.version, at: Date.now(), dirty: false });
    return r;
  }

  window.Cloud = { state, boot, signIn, signUp, signOut, changePassword, requestChange, pollRequest, evaluate, rpc, pull, push, syncMeta, setSyncMeta, deviceToken, deviceName, pwProblem, pwned, userOk, human, hasSession: () => !!sess };
})();
