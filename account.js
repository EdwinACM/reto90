/* R90, cuenta: acceso, dispositivo único, sincronización, bloqueo biométrico y administración.
   Toda la seguridad real vive en el servidor (Supabase: RLS cerrada + funciones). Aquí solo hay pantallas. */
(() => {
  const C = window.Cloud, R = () => window.R90;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }, del: k => { try { localStorage.removeItem(k); } catch (e) {} } };
  const U = { draft: {}, pw: "", asked: false, booting: false, pushT: null, pushing: false, again: false, seenReq: "", pollT: null, hiddenAt: 0 };
  const ago = t => { if (!t) return "nunca"; const m = Math.round((Date.now() - new Date(t).getTime()) / 60000); return m < 1 ? "hace un momento" : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : `hace ${Math.round(m / 1440)} d`; };
  const dt = t => t ? new Date(t).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
  const toast = m => R().toast(m);
  const ready = () => C.state.status === "ok" || C.state.status === "offline_ok";

  /* ---------- ilustración de marca (se tiñe con el color de acento) ---------- */
  function hero(kind) {
    const cx = 262, cy = 108, ticks = Array.from({ length: 90 }, (_, i) => { const a = (i / 90) * Math.PI * 2 - Math.PI / 2, r1 = 62, r2 = i % 10 === 0 ? 80 : 74; return `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="#fff" stroke-width="${i % 10 === 0 ? 3 : 2}" stroke-linecap="round" opacity="${i < 62 ? (i % 10 === 0 ? 1 : .92) : .28}"/>`; }).join("");
    return `<svg class="hero ${kind || ""}" viewBox="0 0 360 216" role="img" aria-label="Ilustración: una barra con discos y un anillo de progreso" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--accent) 82%, #fff)"/><stop offset=".55" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--accent) 42%, #000)"/></linearGradient>
      <radialGradient id="hl" cx=".2" cy=".1" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <linearGradient id="hp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".72"/></linearGradient></defs>
      <rect width="360" height="216" fill="url(#hg)"/><rect width="360" height="216" fill="url(#hl)"/>
      <circle cx="${cx}" cy="${cy}" r="96" fill="#000" opacity=".12"/>
      ${ticks}
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="-apple-system, Roboto, Helvetica, Arial, sans-serif" letter-spacing="-1.5">R90</text>
      <g transform="rotate(-14 96 150)">
        <rect x="10" y="146" width="176" height="9" rx="4.5" fill="url(#hp)"/>
        <rect x="52" y="104" width="16" height="93" rx="6" fill="url(#hp)"/><rect x="34" y="118" width="14" height="65" rx="5" fill="url(#hp)" opacity=".85"/>
        <rect x="128" y="104" width="16" height="93" rx="6" fill="url(#hp)"/><rect x="148" y="118" width="14" height="65" rx="5" fill="url(#hp)" opacity=".85"/>
        <rect x="14" y="140" width="12" height="21" rx="4" fill="#000" opacity=".22"/><rect x="170" y="140" width="12" height="21" rx="4" fill="#000" opacity=".22"/>
      </g>
      <path d="M0 196 C 60 178, 110 206, 170 190 S 290 176, 360 196 L360 216 L0 216Z" fill="#000" opacity=".16"/>
    </svg>`;
  }

  /* ---------- indicador de nube ---------- */
  const SYNC_TXT = { saving: "Guardando…", ok: "Guardado", idle: "Guardado", offline: "Sin conexión", error: "Sin sincronizar" };
  const chip = () => ready() ? `<button class="sync-chip" data-go="#/plan/cuenta" data-s="${C.state.sync}" aria-label="Nube: ${SYNC_TXT[C.state.sync] || "Guardado"}"><i aria-hidden="true"></i><span>${SYNC_TXT[C.state.sync] || "Guardado"}</span></button>` : "";
  function setSync(k) {
    C.state.sync = k; if (k === "ok") C.state.lastSync = Date.now();
    $$(".sync-chip").forEach(el => { if (k === "ok" && el.dataset.s === "saving") { el.classList.remove("ping"); void el.offsetWidth; el.classList.add("ping"); } el.dataset.s = k; el.setAttribute("aria-label", "Nube: " + SYNC_TXT[k]); const s = $("span", el); if (s) s.textContent = SYNC_TXT[k]; });
    const a = $("#ac-sync"); if (a) a.textContent = syncLine();
  }
  const syncLine = () => C.state.sync === "saving" ? "Guardando…" : C.state.sync === "offline" ? "Sin conexión; se enviará al volver" : C.state.sync === "error" ? "No se pudo sincronizar; se reintentará" : (C.syncMeta().dirty ? "Cambios por enviar" : "Sincronizado " + ago(C.syncMeta().at));

  /* ---------- sincronización ---------- */
  function changed() {
    if (!C.hasSession()) return;
    C.setSyncMeta({ dirty: true });
    if (C.state.status === "ok") schedulePush(4000); else if (C.state.status === "offline_ok") setSync("offline");
  }
  function schedulePush(ms) { clearTimeout(U.pushT); U.pushT = setTimeout(pushNow, ms); }
  async function pushNow() {
    if (C.state.status !== "ok") return;
    if (U.pushing) { U.again = true; return; }
    U.pushing = true; setSync("saving");
    try {
      const snap = R().snapshot();
      let r = await C.push(snap);
      if (r.conflict) { C.setSyncMeta({ version: r.version }); r = await C.push(snap); }   // un solo dispositivo escribe: gana el de aquí
      if (r.conflict) throw new Error("conflicto");
      setSync("ok");
    } catch (e) {
      if (e.offline) setSync("offline");
      else if (e.message === "no_verificado" || e.status === 401) { await recheck(); }
      else setSync("error");
    } finally { U.pushing = false; if (U.again) { U.again = false; schedulePush(600); } }
  }
  async function recheck() { await C.boot(); if (C.state.status === "ok") { setSync("ok"); return; } R().render(); }
  async function reconcile() {
    const has = R().hasPlan(), meta = C.syncMeta(), r = await C.pull();
    if (!r) { if (has) await pushNow(); return; }
    if (!has) { R().adopt(r.state); C.setSyncMeta({ version: r.version, at: Date.now(), dirty: false }); setSync("ok"); return; }
    if (meta.version === r.version) { if (meta.dirty) await pushNow(); else setSync("ok"); return; }
    if (meta.version > 0 && !meta.dirty) { R().adopt(r.state); C.setSyncMeta({ version: r.version, at: Date.now(), dirty: false }); setSync("ok"); return; }
    // Hay datos distintos en la nube y en este dispositivo: la persona decide
    if (confirm("Esta cuenta ya tiene datos guardados en la nube.\n\nAceptar: usar los de la nube.\nCancelar: reemplazarlos con los de este dispositivo.")) {
      R().adopt(r.state); C.setSyncMeta({ version: r.version, at: Date.now(), dirty: false }); setSync("ok");
    } else if (confirm("Se reemplazarán los datos de la nube por los de este dispositivo. ¿Seguro?")) {
      C.setSyncMeta({ version: r.version, dirty: true }); await pushNow();
    } else { R().adopt(r.state); C.setSyncMeta({ version: r.version, at: Date.now(), dirty: false }); setSync("ok"); }
  }
  async function onReady() {
    try { await reconcile(); } catch (e) { setSync(e.offline ? "offline" : "error"); }
    startPoll(); checkRequest(); pushLoad();
  }
  function startPoll() { clearInterval(U.pollT); U.pollT = setInterval(() => { if (document.visibilityState === "visible" && C.state.status === "ok") poll(); }, 45000); }
  async function poll() {
    try { C.state.me = await C.rpc("me"); if (C.syncMeta().dirty && !U.pushing) pushNow(); checkRequest(); }
    catch (e) { if (e.message === "no_verificado" || e.message === "bloqueado" || e.status === 401) recheck(); else if (e.offline) setSync("offline"); }
  }
  function checkRequest() {
    const q = C.state.me && C.state.me.request;
    if (!q || q.status !== "pending" || C.state.status !== "ok") return;
    const id = q.at + "|" + q.name; if (U.seenReq === id) return; U.seenReq = id;
    R().openSheet("Un dispositivo pide acceso", `<div class="prose"><p><strong>${esc(q.name)}</strong> quiere entrar a tu cuenta (${dt(q.at)}).</p><p>Si fuiste tú, aprueba: este dispositivo dejará de tener acceso y tus datos pasarán al nuevo. Si no fuiste tú, rechaza y cambia tu contraseña.</p></div>
      <div class="btn-wrap"><button class="btn" data-act="acct-approve">Aprobar y pasar al nuevo</button></div><div class="btn-wrap"><button class="btn quiet" data-act="acct-reject">Rechazar</button></div>`, el => $$("[data-act]", el).forEach(b => b.addEventListener("click", () => act(b.dataset.act, b))));
  }

  /* ---------- puerta de acceso ---------- */
  function gate(r) {
    const s = C.state.status, route = r[0], has = R().hasPlan();
    if (route === "acceso") return false;
    const to = h => { R().go(h); return true; };
    if (s === "boot") { if (!U.booting) startBoot(); return to("#/acceso/cargando"); }
    if (s === "anon") return to("#/acceso/bienvenida");
    if (s === "pending" || s === "need_device") return to("#/acceso/dispositivo");
    if (s === "blocked") return to("#/acceso/bloqueado");
    if (s === "error") return to("#/acceso/error");
    if (s === "ok" && C.state.me && C.state.me.must_change_pw) return to("#/acceso/clave");
    return false;
  }
  function startBoot() {
    U.booting = true;
    C.boot().then(async s => { U.booting = false; if (s === "ok") await onReady(); else if (s === "offline_ok") setSync("offline"); R().render(); }).catch(() => { U.booting = false; R().render(); });
  }
  async function afterAuth(s) {
    if (s === "ok") { await onReady(); R().go(R().hasPlan() ? "#/hoy" : "#/inicio"); R().render(); }
    else R().go("#/acceso/dispositivo");
  }

  /* ---------- formularios ---------- */
  const pwHint = "10 caracteres o más, con mayúscula, minúscula, número y símbolo.";
  const err = (f, m) => { const e = $(".form-err", f); if (e) { e.textContent = m; e.hidden = !m; e.classList.remove("shake"); if (m) { void e.offsetWidth; e.classList.add("shake"); } } };
  const busy = (f, on) => { const b = $("button[type=submit]", f); if (b) { b.disabled = on; b.dataset.t = b.dataset.t || b.textContent; b.textContent = on ? "Un momento…" : b.dataset.t; } };
  const pwField = (id, label, auto, hint) => `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="password" autocomplete="${auto}" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go" required>${hint ? `<p class="hint">${hint}</p>` : ""}</div>`;
  const userField = hint => `<div class="field"><label for="u">Usuario</label><input id="u" name="u" type="text" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="text" maxlength="20" enterkeyhint="next" required>${hint ? '<p class="hint">3 a 20 letras minúsculas, números o guion bajo.</p>' : ""}</div>`;
  const showPw = `<label class="row check-row"><span style="flex:1">Mostrar contraseña</span><input class="switch" type="checkbox" data-showpw aria-label="Mostrar contraseña"></label>`;

  const hintLine = t => `<p class="hint" style="margin:0">${t}</p>`;
  function flow(sub) {
    const nav = (t, s) => R().nav(t, { sub: s, back: sub === "entrar" || sub === "crear" ? "Inicio" : undefined, to: "#/acceso/bienvenida" }), st = C.state.status;
    if (sub === "cargando") { if (st !== "boot") { setTimeout(() => R().go("#/hoy")); return ""; } return `<div class="welcome"><div class="brand">R90</div><p class="tag-l">Conectando…</p></div>`; }
    if (sub === "error") return `${nav("No pudimos conectar", esc(C.state.error || "Revisa tu internet."))}<div class="btn-wrap"><button class="btn" data-act="acct-retry">Reintentar</button></div>`;
    if (sub === "bloqueado") return `${nav("Cuenta bloqueada", "Habla con el administrador para recuperar el acceso.")}<div class="btn-wrap"><button class="btn quiet" data-act="acct-out">Cerrar sesión</button></div>`;
    if (sub === "bienvenida") {
      if (st === "ok") { setTimeout(() => R().go("#/hoy")); return ""; }
      return `<div class="welcome">${hero("big")}<p class="tag-l">Tu rutina y tu comida, hechas para ti.</p>
      <ul class="pts"><li><b>Entrenas con un plan claro</b><span>Pesas y cardio según tu nivel, tu equipo y tus lesiones.</span></li><li><b>Comes sin complicarte</b><span>Menú y lista de compras según las comidas que haces al día y lo que no puedes comer.</span></li><li><b>Ves tu avance</b><span>Tus series, tu peso y tus medidas quedan guardados en tu cuenta.</span></li></ul>
      <div class="btn-wrap"><button class="btn" data-go="#/acceso/crear">Crear mi cuenta</button></div>
      <div class="btn-wrap"><button class="btn quiet" data-go="#/acceso/entrar">Ya tengo cuenta</button></div></div>`;
    }
    if (sub === "entrar") {
      if (st === "ok") { setTimeout(() => R().go("#/hoy")); return ""; }
      return `${nav("Entrar", "Con tu usuario y contraseña.")}
      <form data-acct="login" novalidate><div class="group">${userField(false)}${pwField("p", "Contraseña", "current-password")}${showPw}</div>
      <p class="form-err note err" role="alert" hidden></p>
      <div class="btn-wrap"><button class="btn" type="submit">Entrar</button></div></form>
      <p class="note">Tu cuenta funciona en un dispositivo a la vez. Si entras desde otro, te pediremos autorización una sola vez.</p>`;
    }
    if (sub === "crear") {
      if (st === "ok") { setTimeout(() => R().go("#/hoy")); return ""; }
      return `${nav("Crea tu cuenta", "Escribe tu código y elige tu usuario y tu contraseña.")}
      <form data-acct="signup" novalidate><div class="group">
        <div class="field"><label for="i">Código de invitación</label><input id="i" name="i" type="text" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX" enterkeyhint="next" required></div>
        ${userField(true)}${pwField("p", "Contraseña", "new-password", pwHint)}${showPw}</div>
      <p class="form-err note err" role="alert" hidden></p>
      <div class="btn-wrap"><button class="btn" type="submit">Crear cuenta</button></div></form>
      <p class="note">Al crearla aceptas que tus datos de entrenamiento, comidas y medidas se guarden en tu cuenta (<a href="#/plan/privacidad">ver privacidad</a>). Las fotos nunca se suben.</p>`;
    }
    if (sub === "clave") {
      const need = !U.pw;
      return `${nav("Elige tu contraseña", "Ya entraste con la temporal del administrador. Ahora crea la tuya.")}
      <form data-acct="forcepw" novalidate><div class="group">${need ? pwField("c", "Contraseña temporal", "current-password") : ""}${pwField("p", "Contraseña nueva", "new-password", pwHint)}${showPw}</div>
      <p class="form-err note err" role="alert" hidden></p><div class="btn-wrap"><button class="btn" type="submit">Guardar y continuar</button></div></form>`;
    }
    if (sub === "dispositivo") {
      if (st === "ok") { setTimeout(() => R().go("#/hoy")); return ""; }
      const pend = st === "pending";
      if (!pend && !U.asked) { U.asked = true; setTimeout(async () => { try { await C.requestChange(); C.state.status = "pending"; } catch (e) { U.asked = false; toast(C.human(e)); } R().render(); }, 0); }
      else if (pend) setTimeout(pollDevice, 0);
      return `${nav(pend || !U.asked ? "Esperando aprobación" : "Solicitud rechazada", pend || !U.asked ? "Ya pedimos permiso por ti." : "Puedes volver a pedirla.")}
      <div class="group"><div class="prose">${pend || !U.asked
        ? `<p>Tu cuenta está en otro dispositivo. Ábrela allí y aprueba esta solicitud, o pídele al administrador que lo haga.</p><p>Esta pantalla se actualiza sola cuando te aprueben.</p>`
        : `<p>La solicitud no fue aprobada. Si fue un error, pídela de nuevo.</p>`}</div></div>
      ${pend || !U.asked ? `<div class="btn-wrap"><button class="btn quiet" data-act="acct-cancelreq">Cancelar solicitud</button></div>` : `<div class="btn-wrap"><button class="btn" data-act="acct-askdev">Pedir de nuevo</button></div>`}
      <div class="btn-wrap"><button class="btn quiet" data-act="acct-out">Cerrar sesión</button></div>`;
    }
    return "";
  }
  async function pollDevice() {
    clearTimeout(U.devT);
    const step = async () => {
      if (!/^#\/acceso\/dispositivo/.test(location.hash)) return;
      try {
        const s = await C.pollRequest();
        if (s === "approved" && C.state.status === "ok") { await onReady(); R().go("#/hoy"); R().render(); return; }
        if (s === "rejected" || s === "none") { U.asked = true; C.state.status = "need_device"; R().render(); return; }
      } catch (e) { if (e.message === "bloqueado") { C.state.status = "blocked"; R().render(); return; } }
      U.devT = setTimeout(step, 5000);
    };
    U.devT = setTimeout(step, 4000);
  }

  document.addEventListener("submit", async e => {
    const f = e.target.closest && e.target.closest("form[data-acct]"); if (!f) return;
    e.preventDefault();
    const v = n => (f.elements[n] ? f.elements[n].value : ""), kind = f.dataset.acct;
    err(f, "");
    try {
      if (kind === "login") {
        const u = v("u").trim().toLowerCase(); if (!C.userOk(u) || !v("p")) return err(f, "Escribe tu usuario y tu contraseña.");
        busy(f, true); U.pw = v("p"); const s = await C.signIn(u, v("p")); busy(f, false); U.draft = {}; return afterAuth(s);
      }
      if (kind === "signup") {
        const u = v("u").trim().toLowerCase(), p = v("p");
        if (!v("i").trim()) return err(f, "Escribe tu código de invitación.");
        if (!C.userOk(u)) return err(f, "El usuario debe tener 3 a 20 letras minúsculas, números o guion bajo.");
        const pp = C.pwProblem(p); if (pp) return err(f, pp + ".");
        busy(f, true);
        const n = await C.pwned(p); if (n > 0) { busy(f, false); return err(f, "Esa contraseña apareció en filtraciones de datos. Elige otra."); }
        const s = await C.signUp(u, p, v("i")); busy(f, false); U.draft = {}; return afterAuth(s);
      }
      if (kind === "forcepw" || kind === "chpw") {
        const p = v("p"), cur = f.elements.c ? v("c") : U.pw, pp = C.pwProblem(p); if (pp) return err(f, pp + ".");
        if (!cur) return err(f, "Escribe tu contraseña actual.");
        if (p === cur) return err(f, "La contraseña nueva debe ser distinta.");
        busy(f, true);
        const n = await C.pwned(p); if (n > 0) { busy(f, false); return err(f, "Esa contraseña apareció en filtraciones de datos. Elige otra."); }
        await C.changePassword(cur, p); busy(f, false); U.pw = "";
        if (kind === "chpw") { R().closeSheet(); toast("Contraseña actualizada"); } else { C.state.me = await C.rpc("me"); R().go("#/hoy"); R().render(); }
        return;
      }
      if (kind === "adminpw") {
        const t = v("t"); if (t.length < 10) return err(f, "Mínimo 10 caracteres.");
        busy(f, true); await C.rpc("admin_set_password", { p_user: f.dataset.id, p_temp: t }); busy(f, false);
        R().closeSheet(); toast("Contraseña temporal puesta; el usuario deberá cambiarla"); return adminRefresh();
      }
    } catch (x) { busy(f, false); err(f, C.human(x)); }
  });
  document.addEventListener("change", e => { const t = e.target; if (t.matches && t.matches("[data-showpw]")) $$("input[type=password],input[data-pw]", t.closest("form")).forEach(i => { i.type = t.checked ? "text" : "password"; i.dataset.pw = "1"; }); });

  /* ---------- pantalla de cuenta ---------- */
  function account() {
    const me = C.state.me || {}, R_ = R(), lock = ls.get("reto90.lock");
    const row = (t, m, a, val) => `<button class="row" data-act="${a}"><div class="main"><div class="title">${t}</div>${m ? `<div class="meta">${m}</div>` : ""}</div>${val ? `<span class="val">${val}</span>` : ""}${R_.I.chev}</button>`;
    return `${R_.nav("Cuenta", { back: "Ajustes", to: "#/plan" })}
    <div class="group"><div class="row top"><div class="main"><div class="title">${esc(me.username || "—")}${me.role === "admin" ? ' <span class="tag">Admin</span>' : ""}</div><div class="meta" id="ac-sync">${esc(syncLine())}</div></div></div>
    ${row("Sincronizar ahora", "", "acct-sync")}</div>
    <h2 class="sec">Dispositivo</h2>
    <div class="group"><div class="row top"><div class="main"><div class="title">${esc(me.device_name || C.deviceName())}</div><div class="meta">Solo este dispositivo puede usar tu cuenta. Para cambiar, entra desde el nuevo y aprueba la solicitud aquí o pide al administrador que la apruebe.</div></div></div></div>
    <h2 class="sec">Seguridad</h2>
    <div class="group">${row("Cambiar contraseña", "", "acct-chpw")}
    ${"credentials" in navigator && window.PublicKeyCredential ? `<div class="row check-row"><label for="lk">Bloquear la app con huella o Face ID</label><input class="switch" id="lk" type="checkbox" data-lock ${lock ? "checked" : ""}></div>` : ""}</div>
    <p class="note">El bloqueo protege la app si alguien toma tu teléfono desbloqueado. Se pide al volver tras un minuto.</p>
    <h2 class="sec">Tus datos</h2>
    <div class="group">${row("Exportar copia (archivo)", "Tus pesos, series y comidas", "export")}
    ${row("Privacidad", "Qué se guarda y dónde", "acct-priv")}</div>
    ${me.role === "admin" ? `<h2 class="sec">Administración</h2><div class="group">${row("Panel de administración", "Invitaciones, usuarios y dispositivos", "acct-admin")}</div>` : ""}
    <h2 class="sec">Sesión</h2>
    <div class="group">${row("Cerrar sesión", "Borra los datos de este dispositivo; siguen en la nube", "acct-out")}
    <button class="row" data-act="acct-del"><div class="main"><div class="title" style="color:var(--bad)">Eliminar mi cuenta y mis datos</div></div></button></div>`;
  }

  /* ---------- administración ---------- */
  let AD = { users: [], invites: [], audit: [], tab: "users", code: "" };
  function admin() {
    const R_ = R(), t = AD.tab;
    const seg = R_.seg([["users", "Usuarios"], ["invites", "Invitaciones"], ["audit", "Registro"]], t, "adtab", "Sección");
    let body = "";
    const bk = +ls.get("reto90.bk") || 0, bkDays = bk ? Math.floor((Date.now() - bk) / 864e5) : null, admins = AD.users.filter(u => u.role === "admin" && !u.blocked).length;
    const warn = (bkDays === null || bkDays >= 7 ? `<div class="group" style="margin-bottom:12px"><div class="row top"><div class="main"><div class="title">Respaldo pendiente</div><div class="meta">${bkDays === null ? "Aún no descargas ningún respaldo." : "Hace " + bkDays + " días del último."} Es tu única copia fuera de la nube.</div></div><button class="btn small" data-act="acct-backup">Respaldar</button></div></div>` : "")
      + (AD.users.length && admins < 2 ? `<div class="group" style="margin-bottom:12px"><div class="row top"><div class="main"><div class="title">Cuenta de recuperación</div><div class="meta">Solo hay un administrador. Crea una invitación para un segundo, por si pierdes este teléfono.</div></div><button class="btn small" data-act="acct-recinv">Crear</button></div></div>` : "");
    if (t === "users") body = (AD.users.length ? `<div class="group">${AD.users.map(u => `<button class="row" data-act="acct-user" data-id="${esc(u.id)}"><div class="main"><div class="title">${esc(u.username)}${u.role === "admin" ? ' <span class="tag">Admin</span>' : ""}${u.blocked ? ' <span class="tag bad">Bloqueado</span>' : ""}${u.pending ? ' <span class="tag warn">Pide cambio</span>' : ""}</div><div class="meta">${esc(u.device_name || "Sin dispositivo")}, visto ${ago(u.last_seen)}</div></div>${R_.I.chev}</button>`).join("")}</div>` : `<div class="group"><div class="empty">Sin usuarios.</div></div>`);
    if (t === "invites") body = `<div class="group"><div class="field"><label for="iv-note">Para quién (nota opcional)</label><input id="iv-note" type="text" maxlength="80" autocomplete="off"></div>
      <div class="field"><label for="iv-days">Vigencia</label><select id="iv-days"><option value="1">1 día</option><option value="3">3 días</option><option value="7" selected>7 días</option><option value="30">30 días</option></select></div>
      <div class="field"><label for="iv-role">Rol</label><select id="iv-role"><option value="user">Usuario</option><option value="admin">Administrador</option></select></div></div>
      <div class="btn-wrap"><button class="btn" data-act="acct-newinv">Crear invitación</button></div>
      ${AD.code ? `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="title" style="font-variant-numeric:tabular-nums;letter-spacing:.02em;word-break:break-all">${esc(AD.code)}</div><div class="meta">Cópiala ahora: no se vuelve a mostrar.</div></div><button class="btn small" data-act="acct-copy">Copiar</button></div></div>` : ""}
      <h2 class="sec">Creadas</h2>${AD.invites.length ? `<div class="group">${AD.invites.map(i => `<div class="row top"><div class="main"><div class="title">${esc(i.note || "Sin nota")} <span class="tag">${i.role === "admin" ? "Admin" : "Usuario"}</span></div><div class="meta">${i.used_by ? "Usada por " + esc(i.used_by) + ", " + dt(i.used_at) : (new Date(i.expires_at) < new Date() ? "Vencida" : "Vence " + dt(i.expires_at))}</div></div>${i.used_by ? "" : `<button class="nb-btn" data-act="acct-revinv" data-id="${esc(i.id)}">Revocar</button>`}</div>`).join("")}</div>` : `<div class="group"><div class="empty">Aún no hay invitaciones.</div></div>`}`;
    if (t === "audit") body = `${AD.audit.length ? `<div class="group">${AD.audit.map(a => `<div class="row top"><div class="main"><div class="title">${esc(EVT[a.event] || a.event)}</div><div class="meta">${esc(a.user || "—")}, ${dt(a.at)}</div></div></div>`).join("")}</div>` : `<div class="group"><div class="empty">Sin eventos.</div></div>`}
      <h2 class="sec">Respaldo</h2><div class="group"><button class="row" data-act="acct-backup"><div class="main"><div class="title">Descargar respaldo cifrado</div><div class="meta">Los datos de todos, cifrados con tu frase. Hazlo cada semana.</div></div>${R_.I.chev}</button></div>`;
    return `${R_.nav("Administración", { back: "Cuenta", to: "#/plan/cuenta" })}${seg}<div style="height:12px"></div>${warn}${body}`;
  }
  const EVT = { signup: "Registro", login: "Inicio de sesión", device_registered: "Dispositivo registrado", device_change_requested: "Pidió cambio de dispositivo", device_change_approved: "Cambio de dispositivo aprobado", device_change_rejected: "Cambio rechazado", invite_created: "Invitación creada", invite_revoked: "Invitación revocada", blocked: "Cuenta bloqueada", unblocked: "Cuenta desbloqueada", password_reset_by_admin: "Contraseña restablecida", password_changed: "Contraseña cambiada", account_deleted: "Cuenta eliminada", user_deleted_by_admin: "Usuario eliminado", verify_failed: "Dispositivo no coincide", locked_out: "Bloqueo por intentos" };
  async function adminRefresh() {
    try {
      const [u, i, a] = await Promise.all([C.rpc("admin_list_users"), C.rpc("admin_list_invites"), C.rpc("admin_audit", { p_limit: 80 })]);
      AD.users = u || []; AD.invites = i || []; AD.audit = a || []; R().refresh();
    } catch (e) { toast(C.human(e)); }
  }
  function userSheet(id) {
    const u = AD.users.find(x => x.id === id); if (!u) return;
    const me = C.state.me || {}, self = u.username === me.username;
    R().openSheet(u.username, `<div class="group"><div class="row top"><div class="main"><div class="title">${esc(u.device_name || "Sin dispositivo")}</div><div class="meta">Alta ${dt(u.created_at)}, visto ${ago(u.last_seen)}</div></div></div></div>
      ${u.pending ? `<h2 class="sec">Solicitud de cambio</h2><div class="group"><div class="row top"><div class="main"><div class="title">${esc(u.pending)}</div><div class="meta">Aprueba solo si confirmaste con la persona que es ella.</div></div></div></div><div class="btn-wrap" style="display:flex;gap:8px"><button class="btn" data-act="acct-dec" data-id="${esc(id)}" data-ok="1">Aprobar</button><button class="btn quiet" data-act="acct-dec" data-id="${esc(id)}" data-ok="0">Rechazar</button></div>` : ""}
      ${self ? `<p class="note">Esta es tu cuenta.</p>` : `<h2 class="sec">Acciones</h2><div class="group">
        <button class="row" data-act="acct-pw" data-id="${esc(id)}"><div class="main"><div class="title">Poner contraseña temporal</div></div></button>
        <button class="row" data-act="acct-blk" data-id="${esc(id)}" data-b="${u.blocked ? 0 : 1}"><div class="main"><div class="title">${u.blocked ? "Desbloquear" : "Bloquear"} cuenta</div></div></button>
        <button class="row" data-act="acct-deluser" data-id="${esc(id)}"><div class="main"><div class="title" style="color:var(--bad)">Eliminar usuario y sus datos</div></div></button></div>`}`,
      el => $$("[data-act]", el).forEach(b => b.addEventListener("click", () => act(b.dataset.act, b))));
  }
  async function backup() {
    const p = prompt("Escribe una frase para cifrar el respaldo (guárdala: sin ella no se puede abrir).");
    if (!p || p.length < 12) return toast("Usa una frase de al menos 12 caracteres");
    try {
      const data = await C.rpc("admin_export"), enc = new TextEncoder(), salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" }, await crypto.subtle.importKey("raw", enc.encode(p), "PBKDF2", false, ["deriveKey"]), { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify({ at: new Date().toISOString(), users: data }))));
      const b64 = u => btoa(String.fromCharCode(...u));
      const out = JSON.stringify({ v: 1, kdf: "PBKDF2-SHA256", iter: 310000, salt: b64(salt), iv: b64(iv), data: b64(ct) });
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([out], { type: "application/json" })); a.download = `r90-respaldo-${new Date().toISOString().slice(0, 10)}.enc.json`; a.click(); ls.set("reto90.bk", String(Date.now())); try { await C.rpc("admin_mark_backup"); } catch (e) {} toast("Respaldo cifrado descargado"); R().refresh();
    } catch (e) { toast(C.human(e)); }
  }

  /* ---------- bloqueo biométrico (local) ---------- */
  const b64u = {
    to: u => btoa(String.fromCharCode(...new Uint8Array(u))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
    from: s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)),
  };
  async function lockEnable() {
    try {
      const cred = await navigator.credentials.create({ publicKey: { rp: { name: "R90" }, user: { id: crypto.getRandomValues(new Uint8Array(16)), name: (C.state.me && C.state.me.username) || "reto90", displayName: "R90" }, challenge: crypto.getRandomValues(new Uint8Array(32)), pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }], authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" }, timeout: 60000 } });
      ls.set("reto90.lock", b64u.to(cred.rawId)); toast("Bloqueo activado"); return true;
    } catch (e) { toast("No se pudo activar el bloqueo"); return false; }
  }
  async function lockAsk() {
    const id = ls.get("reto90.lock"); if (!id) return true;
    try { await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: "public-key", id: b64u.from(id) }], userVerification: "required", timeout: 60000 } }); return true; }
    catch (e) { return false; }
  }
  function showLock() {
    if (!ls.get("reto90.lock") || $("#lockscr")) return;
    const d = document.createElement("div"); d.id = "lockscr"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "App bloqueada");
    d.innerHTML = `<div class="lk-in"><h1>R90</h1><p>App bloqueada</p><button class="btn" data-lk="1">Desbloquear</button><button class="btn quiet" data-lk="2">Cerrar sesión</button></div>`;
    document.body.appendChild(d);
    const open = async () => { if (await lockAsk()) d.remove(); };
    $("[data-lk='1']", d).addEventListener("click", open);
    $("[data-lk='2']", d).addEventListener("click", async () => { if (confirm("Se borrarán los datos de este dispositivo (siguen en la nube). ¿Cerrar sesión?")) { await signOut(); d.remove(); } });
    open();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") U.hiddenAt = Date.now();
    else { if (U.hiddenAt && Date.now() - U.hiddenAt > 60000) showLock(); if (C.state.status === "ok") poll(); else if (C.state.status === "offline_ok") recheck(); }
  });
  window.addEventListener("online", () => { if (C.state.status === "offline_ok") recheck(); else if (C.state.status === "ok" && C.syncMeta().dirty) pushNow(); });
  window.addEventListener("pagehide", () => { if (C.state.status === "ok" && C.syncMeta().dirty) pushNow(); });

  /* ---------- acciones ---------- */
  async function signOut() {
    try { if (C.state.status === "ok" && C.syncMeta().dirty) await pushNow(); } catch (e) {}
    try { await pushDisable(); } catch (e) {}
    await C.signOut(); U.pw = ""; U.asked = false; ls.del("reto90.lock"); ls.del("reto90.bio"); PS.ready = false; await R().wipe(); R().go("#/acceso/bienvenida"); R().render();
  }
  const ADMIN_ACTS = new Set(["acct-admin", "acct-newinv", "acct-copy", "acct-revinv", "acct-user", "acct-dec", "acct-blk", "acct-deluser", "acct-pw", "acct-backup", "acct-recinv"]);
  async function act(a, el) {
    if (ADMIN_ACTS.has(a) && !(C.state.me && C.state.me.role === "admin" && C.state.status === "ok")) return toast("No tienes permiso para esto");
    try {
      if (a === "acct-retry") { C.state.status = "boot"; U.booting = false; R().render(); }
      else if (a === "acct-out") { if (confirm("Se borrarán los datos de este dispositivo, incluidas las fotos (no se guardan en la nube). Tus datos siguen en tu cuenta. ¿Cerrar sesión?")) await signOut(); }
      else if (a === "acct-askdev") { U.asked = true; await C.requestChange(); C.state.status = "pending"; R().render(); }
      else if (a === "acct-cancelreq") { try { await C.rpc("cancel_my_request"); } catch (e) {} U.asked = true; C.state.status = "need_device"; R().render(); }
      else if (a === "acct-sync") { setSync("saving"); try { await reconcile(); poll(); } catch (e) { setSync(e.offline ? "offline" : "error"); } R().refresh(); }
      else if (a === "acct-priv") R().go("#/plan/privacidad");
      else if (a === "acct-admin") { AD.tab = "users"; R().go("#/plan/admin"); }
      else if (a === "acct-chpw") R().openSheet("Cambiar contraseña", `<form data-acct="chpw" novalidate><div class="group">${pwField("c", "Contraseña actual", "current-password")}${pwField("p", "Contraseña nueva", "new-password", pwHint)}${showPw}</div><p class="form-err note err" role="alert" hidden></p><div class="btn-wrap"><button class="btn" type="submit">Guardar</button></div></form>`);
      else if (a === "acct-approve") { if (!(await bio())) return; await pushNow(); await C.rpc("approve_my_request"); R().closeSheet(); toast("Aprobado. Este dispositivo se desvinculó."); await signOutKeep(); }
      else if (a === "acct-reject") { await C.rpc("cancel_my_request"); R().closeSheet(); toast("Solicitud rechazada"); U.seenReq = ""; }
      else if (a === "acct-del") {
        const me = C.state.me || {}, t = prompt(`Se borrará tu cuenta y todos tus datos de la nube. No se puede deshacer.\n\nEscribe tu usuario (${me.username}) para confirmar.`);
        if (t && t.trim().toLowerCase() === me.username) { await pushDisable(); await C.rpc("delete_my_account"); await C.signOut(); ls.del("reto90.lock"); await R().wipe(); R().go("#/acceso/bienvenida"); R().render(); toast("Cuenta eliminada"); }
        else if (t) toast("El usuario no coincide");
      }
      else if (a === "acct-newinv") {
        const r = await C.rpc("admin_create_invite", { p_note: $("#iv-note").value, p_role: $("#iv-role").value, p_days: +$("#iv-days").value });
        AD.code = r.code; await adminRefresh();
      }
      else if (a === "acct-copy") { try { await navigator.clipboard.writeText(AD.code); toast("Código copiado"); } catch (e) { toast("Selecciona y copia el código"); } }
      else if (a === "acct-revinv") { if (confirm("¿Revocar esta invitación?")) { await C.rpc("admin_revoke_invite", { p_id: el.dataset.id }); adminRefresh(); } }
      else if (a === "acct-user") userSheet(el.dataset.id);
      else if (a === "acct-dec") { if (el.dataset.ok === "1" && !(await bio())) return; await C.rpc("admin_decide_request", { p_user: el.dataset.id, p_approve: el.dataset.ok === "1" }); R().closeSheet(); toast(el.dataset.ok === "1" ? "Cambio aprobado" : "Cambio rechazado"); adminRefresh(); }
      else if (a === "acct-blk") { await C.rpc("admin_set_blocked", { p_user: el.dataset.id, p_blocked: el.dataset.b === "1" }); R().closeSheet(); toast(el.dataset.b === "1" ? "Cuenta bloqueada" : "Cuenta desbloqueada"); adminRefresh(); }
      else if (a === "acct-deluser") { const u = AD.users.find(x => x.id === el.dataset.id); if (u && prompt(`Se eliminará a ${u.username} y todos sus datos. Escribe su usuario para confirmar.`) === u.username && await bio()) { await C.rpc("admin_delete_user", { p_user: el.dataset.id }); R().closeSheet(); toast("Usuario eliminado"); adminRefresh(); } }
      else if (a === "acct-pw") { if (!(await bio())) return; R().openSheet("Contraseña temporal", `<form data-acct="adminpw" data-id="${esc(el.dataset.id)}" novalidate><div class="group">${pwField("t", "Contraseña temporal", "off", "Díctala por un canal seguro. La persona deberá cambiarla al entrar.")}</div><p class="form-err note err" role="alert" hidden></p><div class="btn-wrap"><button class="btn" type="submit">Guardar</button></div></form>`); }
      else if (a === "acct-backup") backup();
      else if (a === "acct-pntest") { await C.rpc("push_test"); toast("Enviada. Debe llegar en unos segundos."); }
      else if (a === "acct-recinv") { const r = await C.rpc("admin_create_invite", { p_note: "Recuperación", p_role: "admin", p_days: 7 }); AD.code = r.code; AD.tab = "invites"; await adminRefresh(); }
    } catch (e) { toast(C.human(e)); }
  }
  async function signOutKeep() { await C.boot(); R().render(); }

  /* ---------- verificación biométrica para acciones sensibles ---------- */
  async function bio() {
    try {
      if (!window.PublicKeyCredential || !navigator.credentials || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) return true;   // sin biometría: queda la confirmación normal
      const id = ls.get("reto90.lock") || ls.get("reto90.bio");
      if (!id) {
        const c = await navigator.credentials.create({ publicKey: { rp: { name: "R90" }, user: { id: crypto.getRandomValues(new Uint8Array(16)), name: (C.state.me && C.state.me.username) || "r90", displayName: "R90" }, challenge: crypto.getRandomValues(new Uint8Array(32)), pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }], authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" }, timeout: 60000 } });
        ls.set("reto90.bio", b64u.to(c.rawId)); return true;
      }
      await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: "public-key", id: b64u.from(id) }], userVerification: "required", timeout: 60000 } });
      return true;
    } catch (e) { toast("No se pudo verificar tu identidad"); return false; }
  }

  /* ---------- notificaciones push ---------- */
  const VAPID = "BCLA7q6IY6ZTQo0aBGD2ifZkJfUJOucMiOb31OQ0C0-p2USqgf9_pBo1CUpAGvZb41bnheY9oGhYA4iogvxVHlU";
  const PS = { sup: "serviceWorker" in navigator && "PushManager" in window && "Notification" in window, ready: false, on: false, prefs: null };
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent), standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const tzName = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } };
  const u8 = b => Uint8Array.from(atob(b.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const defPrefs = () => { const r = R().remind(); return { train: true, streak: true, weigh: true, meals: false, water: false, review: true, admin: true, device: true, t_train: r.train, t_weigh: r.weigh, t_review: "19:00", t_meals: (R().mealTimes && R().mealTimes().length ? R().mealTimes() : ["07:30", "14:00", "20:45"]).slice(0, 6), t_water: ["11:00", "15:00", "19:00"], days: R().trainDays() }; };
  let psT;
  const pushSave = () => { clearTimeout(psT); psT = setTimeout(async () => { try { await C.rpc("push_set_prefs", { p_prefs: PS.prefs, p_tz: tzName() }); } catch (e) {} }, 700); };
  async function pushEnable() {
    if ((await Notification.requestPermission()) !== "granted") { toast("Permiso denegado. Actívalo en los ajustes del navegador."); return false; }
    const reg = await navigator.serviceWorker.ready; let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8(VAPID) });
    const j = sub.toJSON(); PS.prefs = PS.prefs || defPrefs(); PS.prefs.days = defPrefs().days;
    await C.rpc("push_subscribe", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_tz: tzName(), p_prefs: PS.prefs });
    PS.on = true; return true;
  }
  async function pushDisable() {
    try { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch (e) {}
    try { await C.rpc("push_unsubscribe"); } catch (e) {}
    PS.on = false;
  }
  async function pushLoad() {
    if (!PS.sup || C.state.status !== "ok") return;
    try {
      const st = await C.rpc("push_status"), granted = Notification.permission === "granted";
      PS.prefs = st.subscribed ? { ...defPrefs(), ...st.prefs } : defPrefs();
      const days = defPrefs().days; if (st.subscribed && JSON.stringify(st.prefs.days) !== JSON.stringify(days)) { PS.prefs.days = days; pushSave(); }
      PS.on = !!st.subscribed && granted; PS.ready = true;
      if (st.subscribed && granted) { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (!sub || sub.endpoint !== st.endpoint) await pushEnable(); }
    } catch (e) { PS.ready = true; PS.prefs = PS.prefs || defPrefs(); }
    if (/^#\/plan\/notificaciones/.test(location.hash)) R().refresh();
  }
  function notif() {
    const R_ = R(), head = R_.nav("Notificaciones", { back: "Ajustes", to: "#/plan", sub: "Avisos en este dispositivo, aunque la app esté cerrada." });
    if (!PS.sup || !window.isSecureContext) return `${head}<div class="group"><div class="empty">Este navegador no admite notificaciones. Prueba con Chrome o Safari actualizado.</div></div>`;
    if (isIOS && !standalone) return `${head}<div class="group"><div class="prose"><p>En iPhone y iPad las notificaciones solo funcionan con la app instalada.</p><p>Toca Compartir y elige “Añadir a pantalla de inicio”. Abre R90 desde ese icono y vuelve aquí.</p></div></div>`;
    if (!PS.ready || Date.now() - (PS.at || 0) > 30000) { PS.at = Date.now(); pushLoad(); }
    if (!PS.ready) return `${head}<div class="group"><div class="empty">Un momento…</div></div>`;
    const p = PS.prefs, me = C.state.me || {};
    const sw = (k, t, m) => `<div class="row check-row"><label for="pn-${k}">${t}${m ? `<span class="meta">${m}</span>` : ""}</label><input class="switch" id="pn-${k}" data-pn="${k}" type="checkbox" ${p[k] ? "checked" : ""}></div>`;
    const tm = (k, t) => `<div class="field"><label for="pt-${k}">${t}</label><input id="pt-${k}" data-pt="${k}" type="time" value="${esc(p[k])}"></div>`;
    const denied = Notification.permission === "denied";
    let h = `${head}<div class="group"><div class="row check-row"><label for="pn-master">Recibir notificaciones<span class="meta">${denied ? "Bloqueadas en el navegador. Actívalas en sus ajustes." : PS.on ? "Activas en este dispositivo" : "Desactivadas"}</span></label><input class="switch" id="pn-master" type="checkbox" ${PS.on ? "checked" : ""} ${denied ? "disabled" : ""}></div></div>`;
    if (PS.on) {
      h += `<h2 class="sec">Entrenamiento</h2><div class="group">${sw("train", "Hora de entrenar", "Solo tus días de pesas y si aún no entrenaste")}${tm("t_train", "Hora")}${sw("streak", "Cuidar la racha", "Un segundo aviso a las 21:00 si no entrenaste")}</div>
      <h2 class="sec">Cuerpo y comida</h2><div class="group">${sw("weigh", "Pesarte", "Solo si aún no registras tu peso")}${tm("t_weigh", "Hora")}${sw("meals", "Comidas", "A las horas de tus comidas: " + (p.t_meals || []).join(", "))}${sw("water", "Agua", "A las 11:00, 15:00 y 19:00 mientras no llegues a tu meta")}${sw("review", "Revisión semanal", "Domingo a las 19:00")}</div>
      <h2 class="sec">Cuenta</h2><div class="group">${sw("device", "Solicitudes de dispositivo", "Cuando alguien pida entrar a tu cuenta")}${me.role === "admin" ? sw("admin", "Administración", "Usuarios nuevos, cambios de dispositivo y respaldo semanal") : ""}</div>
      <div class="btn-wrap"><button class="btn quiet" data-act="acct-pntest">Enviar notificación de prueba</button></div>
      <p class="note">La hora se toma de este teléfono (${esc(tzName())}).</p>`;
    }
    return h;
  }
  document.addEventListener("change", async e => {
    const t = e.target; if (!t.matches) return;
    if (t.id === "pn-master") {
      t.disabled = true;
      try { if (t.checked) { if (!(await pushEnable())) t.checked = false; } else await pushDisable(); } catch (x) { t.checked = false; toast(C.human(x)); }
      t.disabled = false; R().refresh();
    } else if (t.dataset.pn) { PS.prefs[t.dataset.pn] = t.checked; pushSave(); }
    else if (t.dataset.pt && /^\d\d:\d\d$/.test(t.value)) { PS.prefs[t.dataset.pt] = t.value; pushSave(); }
  });

  /* ---------- enlaces con la app ---------- */
  document.addEventListener("click", async e => {
    const t = e.target.closest && e.target.closest("[data-adtab]");
    if (t) { AD.tab = t.dataset.adtab; R().refresh(); }
    const lk = e.target.closest && e.target.closest("[data-lock]");
    if (lk) { e.preventDefault(); if (lk.checked) { lk.checked = !(await lockEnable()) ? false : true; } else { ls.del("reto90.lock"); toast("Bloqueo desactivado"); } }
  });
  function view(name) {
    if (name === "cuenta") return ready() ? account() : "";
    if (name === "notif") return C.state.status === "ok" ? notif() : "";
    if (name === "admin") { if (!(C.state.me && C.state.me.role === "admin") || C.state.status !== "ok") { setTimeout(() => R().go("#/plan/cuenta")); return ""; } if (!AD.users.length && !AD.loaded) { AD.loaded = true; adminRefresh(); } return admin(); }
    return flow(name);
  }
  document.addEventListener("input", e => { const t = e.target; if (t.form && t.form.dataset && t.form.dataset.acct && t.type !== "password" && t.name) U.draft[t.name] = t.value; });
  function after(r) {
    if (r[0] === "acceso") $$("form[data-acct] input[name]").forEach(i => { if (i.type !== "password" && U.draft[i.name] != null) i.value = U.draft[i.name]; }); const f = $("form[data-acct] input:not([type=checkbox])"); if (f && r[0] === "acceso") f.focus({ preventScroll: true }); }

  if (ls.get("reto90.lock")) { const go = () => showLock(); if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go(); }
  window.Acct = { hero, gate, view, act, changed, chip, after, ready, status: () => C.state.status };
})();
