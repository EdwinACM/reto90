/* Cronometraje del entreno (v24).
   Reloj de sesión flotante, tiempo por bloque y por vuelta, carrera contra tu última vez,
   resumen al terminar, metrónomo de tempo, cronómetro para ejercicios por tiempo,
   AMRAP / Por tiempo / Cronómetro con vueltas, voz que guía y página "Tiempo entrenado".
   Se carga antes de app.js: solo usa sus funciones (A.S, save, $, nav…) cuando se le llama. */
window.makeClock = A => {
  const { save, todayISO, addDays, parseHash, go, refresh, esc, nav, segHtml, segMove, shortDate, longDate, sessionById, blocksOf, sessKeysOf, sessMeta, SESSIONS, D, I, suggest, fwi, wU, wd, num, roundDone, beep, vibrate, toast, LS, openSheet, closeSheet } = A;
  const K = (iso, sid) => iso + "|" + sid;
  const now = () => Date.now();
  const mmss = s => { s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`; };
  const dmm = s => (s < 0 ? "−" : "+") + mmss(Math.abs(s));
  const hm = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + " min" : ""}`.trim() : `${m} min`; };
  const spoken = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)} hora${m >= 120 ? "s" : ""} ${m % 60} minutos` : `${m} minutos`; };
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M10 2.5h4M12 2.5V6"/></svg>`;

  /* ───────── Registro de tiempos: A.S.wt["AAAA-MM-DD|sesión"] ─────────
     s inicio (ms) · e fin (ms o null) · pz pausas acumuladas (ms) · pa inicio de pausa (ms o 0) · la última actividad
     sp {bloque: [seg inicio, seg fin]} · rt [[bloque, seg por vuelta]] · lt/lb último toque (seg, bloque) · pr récords · m manual */
  const wt = () => (A.S.wt = A.S.wt || {});
  const rec = (sid, iso = todayISO()) => wt()[K(iso, sid)] || null;
  function closeRec(r, at) { if (r.e) return; if (r.pa) { r.pz += Math.max(0, at - r.pa); r.pa = 0; } r.e = Math.max(r.s, at); }
  function active() {
    for (const k of Object.keys(wt())) {
      const r = A.S.wt[k]; if (!r || r.e) continue;
      if (now() - (r.la || r.s) > 3 * 36e5) { closeRec(r, r.la || r.s); save(); continue; } // olvidado abierto: se cierra en la última actividad
      return { k, r, iso: k.slice(0, 10), sid: k.slice(11) };
    }
    return null;
  }
  const elapsed = r => { if (!r) return 0; const end = r.e || now(); return Math.max(0, (end - r.s - (r.pz || 0) - (r.pa && !r.e ? end - r.pa : 0)) / 1000); };
  function start(sid) {
    const k = K(todayISO(), sid), t = now(), a = active();
    if (a && a.k !== k) closeRec(a.r, a.r.la || t);
    let r = wt()[k];
    if (r && r.e) { r.pz += Math.max(0, t - r.e); r.e = null; r.la = t; }            // retomar: el hueco cuenta como pausa
    else if (!r) r = A.S.wt[k] = { s: t, e: null, pz: 0, pa: 0, la: t, sp: {}, rt: [], lt: null, lb: null, pr: 0 };
    save(); paint(); return r;
  }
  function togglePause(sid) { const r = rec(sid); if (!r || r.e) return; const t = now(); if (r.pa) { r.pz += t - r.pa; r.pa = 0; } else r.pa = t; r.la = t; save(); }
  function onTick(sid, bi, on, prs = 0) {
    if (!on) return;
    let r = rec(sid); if (!r || r.e) r = start(sid);
    if (r.pa) { r.pz += now() - r.pa; r.pa = 0; }
    const t = Math.round(elapsed(r));
    if (r.lb === bi && r.lt != null && t - r.lt > 0 && t - r.lt < 1800) { r.rt.push([bi, t - r.lt]); if (r.rt.length > 80) r.rt.shift(); }
    const a = r.sp[bi] ? r.sp[bi][0] : (r.lt ?? 0); r.sp[bi] = [Math.min(a, t), t];
    r.lt = t; r.lb = bi; r.la = now(); r.pr += prs || 0;
    if (metro.on) pauseMetro();
    save();
  }
  function prev(sid, iso = todayISO()) {
    let bk = ""; Object.keys(wt()).forEach(k => { if (k.slice(11) === sid && k.slice(0, 10) < iso && A.S.wt[k].e && k > bk) bk = k; });
    return bk ? { r: A.S.wt[bk], iso: bk.slice(0, 10) } : null;
  }
  /* Carrera contra tu última vez: compara el tiempo al cerrar el mismo bloque */
  function ghost(sid, r = rec(sid), iso = todayISO()) {
    const p = prev(sid, iso); if (!r || !p) return null;
    if (r.e) return { d: elapsed(r) - elapsed(p.r), p, eta: elapsed(r) };   // sesión cerrada: se compara el total
    let bi = null; Object.keys(r.sp).forEach(b => { if (p.r.sp[b] && (bi === null || r.sp[b][1] > r.sp[bi][1])) bi = b; });
    if (bi === null) return { d: null, p };
    const d = r.sp[bi][1] - p.r.sp[bi][1]; return { d, p, eta: elapsed(p.r) + d };
  }
  const split = (sid, bi, iso = todayISO()) => { const r = wt()[K(iso, sid)], x = r && r.sp[bi]; return x ? mmss(x[1] - x[0]) : ""; };
  function keysFor(sid) { const ks = new Set(); try { const s = sessionById(sid); if (s) blocksOf(s).forEach(b => b.t !== "cardio" && b.items.forEach(it => ks.add(it.k))); } catch (e) {} try { sessKeysOf(sid).forEach(k => ks.add(k)); } catch (e) {} return [...ks]; }
  function stats(iso, sid) {
    let sets = 0, vol = 0; keysFor(sid).forEach(k => { const e = (A.S.hist[k] || []).find(x => x.d === iso); if (e) e.sets.forEach(t => { if (t.done) { sets++; vol += (t.w || 0) * (t.r || 0); } }); });
    const r = wt()[K(iso, sid)]; return { sets, vol, sec: r ? elapsed(r) : 0, r };
  }

  /* ───────── Voz y sonido ───────── */
  let voiceEs = null, unlocked = false, ac = null;
  function unlock() {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); } catch (e) {}
    if (unlocked || !A.S.voice || !("speechSynthesis" in window)) return; unlocked = true;
    try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}
  }
  function say(t) {
    if (!A.S || !A.S.voice || !t || !("speechSynthesis" in window)) return;
    try {
      const vs = speechSynthesis.getVoices(); voiceEs = voiceEs || vs.find(v => /es[-_](MX|US|419)/i.test(v.lang)) || vs.find(v => /^es/i.test(v.lang)) || null;
      const u = new SpeechSynthesisUtterance(t); if (voiceEs) u.voice = voiceEs; u.lang = voiceEs ? voiceEs.lang : "es-MX"; u.rate = 1.05;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) {}
  }
  function click(f, d = .05, v = .3) {   // el metrónomo suena aunque el sonido de descanso esté apagado: se activa a propósito
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .02); } catch (e) {}
  }
  let cdKey = "";
  function countdown(tag, s) { if (s < 1 || s > 3) return; const k = tag + ":" + s; if (k === cdKey) return; cdKey = k; beep(s === 1 ? 880 : 660, .12); vibrate(25); }
  let restSaid = "";
  function restCue(left, tag, label) { countdown("r" + tag, left); if (left === 10 && label !== "Cardio" && restSaid !== tag) { restSaid = tag; say("Diez segundos"); } }
  function nextText(b) {
    if (!b || b.t === "cardio") return "";
    const r = Array.from({ length: b.rounds }, (_, i) => i).find(i => !b.items.every(it => roundDone(it, i))); if (r == null) return "";
    const it = b.items[0], sg = suggest(it); return `Vuelta ${r + 1}: ${D.EX[it.k].name}${sg.n != null ? ", " + fwi(sg.n) + " " + wU() : ""}`;
  }

  /* ───────── Isla flotante con el reloj de la sesión ───────── */
  let loopT = null;
  function hudEl() {
    let el = document.getElementById("hud"); if (el) return el;
    el = document.createElement("button"); el.id = "hud"; el.type = "button";
    el.addEventListener("click", () => { const a = active(); if (!a) return; const r = rec(a.sid, a.iso); go(r && r.lb != null ? `#/bloque/${a.sid}/${r.lb}` : `#/entreno/${a.sid}`); });
    document.body.appendChild(el); return el;
  }
  function paint() {
    if (!A.S || !A.S.start) return;
    const a = active(), el = hudEl(), h = parseHash();
    const here = a && ((h[0] === "entreno" && h[1] === a.sid) || (h[0] === "bloque" && h[1] === a.sid));
    const vis = !!a && !here && h[0] !== "inicio" && h[0] !== "acceso"; el.classList.toggle("on", vis); document.body.classList.toggle("hud-on", vis);
    if (a) {
      const sec = elapsed(a.r), g = ghost(a.sid, a.r, a.iso);
      el.innerHTML = `<i class="dot${a.r.pa ? " pz" : ""}"></i><b>${mmss(sec)}</b>${g && g.d != null ? `<span class="gh ${g.d <= 0 ? "ahead" : "behind"}">${dmm(g.d)}</span>` : ""}`;
      el.setAttribute("aria-label", `Entreno en curso, ${mmss(sec)}${a.r.pa ? ", en pausa" : ""}. Abrir`);
    }
    document.querySelectorAll("[data-ck-t]").forEach(x => { const [iso, sid] = x.dataset.ckT.split("|"); x.textContent = mmss(elapsed(wt()[K(iso, sid)])); });
    if (a && !loopT) loopT = setInterval(paint, 1000);
    if (!a && loopT) { clearInterval(loopT); loopT = null; }
  }

  /* ───────── Tarjetas dentro de la sesión y del bloque ───────── */
  function sessionCard(sid) {
    const iso = todayISO(), r = rec(sid), p = prev(sid), run = r && !r.e;
    const last = p ? `Tu última vez: ${mmss(elapsed(p.r))} (${shortDate(p.iso)}). Corre contra ese tiempo.` : "Arranca solo con tu primera vuelta o tócalo para contar también el calentamiento.";
    if (!r) return `<div class="ck-card"><div class="ck-row"><div><span class="ck-lbl">Reloj de la sesión</span><b class="ck-time">0:00</b></div><button class="ck-btn" data-ck="start" data-sid="${sid}">${ICON}Iniciar</button></div><p class="ck-note">${esc(last)}</p></div>`;
    const g = ghost(sid, r);
    const gl = g && g.d != null ? `<p class="ck-note"><span class="gh ${g.d <= 0 ? "ahead" : "behind"}">${dmm(g.d)}</span> ${g.d <= 0 ? "por delante" : "por detrás"} de tu ${esc(shortDate(g.p.iso))}${run ? `. A este ritmo terminas en ${mmss(g.eta)}.` : "."}</p>` : `<p class="ck-note">${esc(last)}</p>`;
    return `<div class="ck-card ${run ? (r.pa ? "paused" : "run") : "end"}"><div class="ck-row"><div><span class="ck-lbl">${run ? (r.pa ? "En pausa" : "Entrenando") : "Duración"}</span><b class="ck-time" data-ck-t="${iso}|${sid}">${mmss(elapsed(r))}</b></div><div class="ck-acts">${run ? `<button class="ck-btn ghost" data-ck="pause" data-sid="${sid}">${r.pa ? "Seguir" : "Pausa"}</button>` : `<button class="ck-btn ghost" data-ck="sum" data-sid="${sid}" data-d="${iso}">Resumen</button><button class="ck-btn ghost" data-ck="start" data-sid="${sid}">Retomar</button>`}</div></div>${gl}</div>`;
  }
  const TEMPOS = [["off", "Apagado"], ["2-0-1", "2-0-1"], ["3-1-1", "3-1-1"], ["4-1-1", "4-1-1"]];
  function blockBar(sid, bi, b) {
    const r = rec(sid), iso = todayISO(), planned = Math.round(b.items.length * 45 + b.rest), mine = r ? r.rt.filter(x => x[0] === bi).map(x => x[1]) : [], a = avg(mine), g = r && !r.e ? ghost(sid, r) : null;
    const pace = a ? (a > planned * 1.25 ? "slow" : a < planned * .8 ? "fast" : "ok") : "";
    return `<div class="ck-bar" role="group" aria-label="Tiempos">
      <div><span class="ck-lbl">${r && !r.e ? (r.pa ? "En pausa" : "Sesión") : "Reloj"}</span><b ${r ? `data-ck-t="${iso}|${sid}"` : ""}>${r ? mmss(elapsed(r)) : "0:00"}</b>${g && g.d != null ? `<span class="gh ${g.d <= 0 ? "ahead" : "behind"}">${dmm(g.d)}</span>` : ""}</div>
      <div><span class="ck-lbl">Tu vuelta</span><b class="${pace}">${a ? mmss(a) : "—"}</b><small>plan ${mmss(planned)}</small></div>
      ${r && !r.e ? `<button class="ck-btn ghost sm" data-ck="pause" data-sid="${sid}" aria-label="${r.pa ? "Seguir el reloj" : "Pausar el reloj"}">${r.pa ? "Seguir" : "Pausa"}</button>` : `<button class="ck-btn sm" data-ck="start" data-sid="${sid}">${ICON}Iniciar</button>`}
    </div>${pace === "slow" ? `<p class="ck-note">Tus vueltas van más lentas que el plan: revisa que el descanso no se alargue.</p>` : ""}`;
  }
  function tempoRow() {
    const cur = metro.on || metro.wait ? metro.t : "off";
    return `<h2 class="sec">Metrónomo de tempo</h2><div class="group"><div class="field">${segHtml(TEMPOS, cur, "cktempo", "Tempo")}
      <div class="metro${cur !== "off" ? " on" : ""}" id="metro" data-ph="${metro.wait ? "Descanso" : ""}"><span id="mt-ph">${metro.wait ? "En descanso" : cur !== "off" ? "Baja" : "Bajar, pausa, subir"}</span><b id="mt-rep">${metro.rep || 0}</b><small>reps</small></div>
      <p class="ck-note">Segundos al bajar, pausa abajo y al subir. Marca el ritmo con sonido y vibración, se detiene al terminar la vuelta y vuelve solo cuando acaba el descanso.</p></div></div>`;
  }
  const holdSec = reps => { const m = String(reps).match(/(\d+)(?:\s*[–-]\s*\d+)?\s*s\b/); return m ? +m[1] : 0; };
  function holdBtn(it, ii, r) { const s = holdSec(it.reps); return s ? `<button type="button" class="ck-hold" data-ck="hold" data-sec="${s}" data-hi="${ii}" data-hr="${r}">${ICON}Cronometrar ${s} s${/lado/.test(it.reps) ? " (cada lado)" : ""}</button>` : ""; }

  /* ───────── Metrónomo de tempo ───────── */
  const metro = { on: false, wait: false, t: "3-1-1", rep: 0, timer: null, seq: [], i: 0 };
  function stopMetro() { clearTimeout(metro.timer); metro.on = false; metro.wait = false; metro.rep = 0; }
  function pauseMetro() { clearTimeout(metro.timer); metro.on = false; metro.wait = true; metro.rep = 0; const m = document.getElementById("mt-ph"); if (m) { m.textContent = "En descanso"; m.parentElement.dataset.ph = "Descanso"; } }
  function runMetro(lead = 3) {
    const [e, p, c] = metro.t.split("-").map(Number); metro.seq = [];
    for (let i = 0; i < e; i++) metro.seq.push(["Baja", i === 0]); for (let i = 0; i < p; i++) metro.seq.push(["Pausa", i === 0]); for (let i = 0; i < c; i++) metro.seq.push(["Sube", i === 0]);
    metro.on = true; metro.wait = false; metro.i = -lead; metro.rep = 0;
    const step = () => {
      if (!metro.on) return;
      const ph = document.getElementById("mt-ph"), rp = document.getElementById("mt-rep");
      if (metro.i < 0) { click(660, .06, .3); vibrate(15); if (ph) { ph.textContent = `Empieza en ${-metro.i}`; ph.parentElement.dataset.ph = ""; } metro.i++; metro.timer = setTimeout(step, 1000); return; }
      const [name, first] = metro.seq[metro.i];
      if (metro.i === 0) metro.rep++;
      click(name === "Sube" ? 1320 : name === "Pausa" ? 520 : 820, first ? .08 : .04, first ? .38 : .16); if (first) vibrate(name === "Sube" ? 45 : 18);
      if (ph) { ph.textContent = name; ph.parentElement.dataset.ph = name; } if (rp) rp.textContent = metro.rep;
      metro.i = (metro.i + 1) % metro.seq.length; metro.timer = setTimeout(step, 1000);
    };
    step();
  }
  function setTempo(v) { stopMetro(); if (v === "off") return paintMetro(); metro.t = v; try { LS.setItem("reto90.tempo", v); } catch (e) {} unlock(); runMetro(); paintMetro(); }
  function paintMetro() { const m = document.getElementById("metro"); if (!m) return; m.classList.toggle("on", metro.on || metro.wait); if (!metro.on && !metro.wait) { m.dataset.ph = ""; document.getElementById("mt-ph").textContent = "Bajar, pausa, subir"; document.getElementById("mt-rep").textContent = "0"; } }
  function restDone() { if (metro.wait && parseHash()[0] === "bloque") runMetro(3); }

  /* ───────── Cronómetro para ejercicios por tiempo (plancha, granjero…) ───────── */
  let hold = null;
  function startHold(sec, ii, r) {
    unlock(); endHold(true, true);
    const el = document.createElement("div"); el.className = "ck-hold-ov"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Cronómetro de la serie");
    el.innerHTML = `<div class="ck-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="bg"/><circle cx="60" cy="60" r="54" class="fg" id="hold-fg"/></svg><div class="ck-ring-in"><span id="hold-ph">Prepárate</span><b id="hold-t">3</b></div></div><div class="ck-hold-btns"><button class="ck-btn ghost" data-h="add">+10 s</button><button class="ck-btn" data-h="stop">Terminar</button></div>`;
    document.body.appendChild(el); requestAnimationFrame(() => el.classList.add("on"));
    hold = { el, sec, ii, r, t0: now() + 3000, go: false, cd: 0 };
    el.querySelector("[data-h=add]").addEventListener("click", () => { if (hold) hold.sec += 10; vibrate(8); });
    el.querySelector("[data-h=stop]").addEventListener("click", () => endHold(true));
    el.querySelector("[data-h=stop]").focus({ preventScroll: true });
    hold.int = setInterval(holdTick, 100); holdTick();
  }
  function holdTick() {
    const h = hold; if (!h) return;
    const t = (now() - h.t0) / 1000, tt = h.el.querySelector("#hold-t"), pp = h.el.querySelector("#hold-ph"), fg = h.el.querySelector("#hold-fg");
    if (t < 0) { const s = Math.ceil(-t); tt.textContent = s; pp.textContent = "Prepárate"; fg.style.strokeDashoffset = "0"; countdown("h" + h.t0, s); return; }
    if (!h.go) { h.go = true; beep(988, .3); vibrate(60); say("Ya"); h.el.classList.add("go"); }
    const left = h.sec - t; pp.textContent = "Aguanta"; tt.textContent = Math.max(0, Math.ceil(left)); fg.style.strokeDashoffset = (339.3 * (1 - Math.max(0, left) / h.sec)).toFixed(1);
    countdown("hg" + h.t0, Math.ceil(left));
    if (left <= 0) endHold(false);
  }
  function endHold(early, silent) {
    const h = hold; if (!h) return; hold = null; clearInterval(h.int);
    const held = Math.max(0, Math.round(Math.min(h.sec, (now() - h.t0) / 1000)));
    if (!early) { beep(880, .6); vibrate([200, 100, 200]); say("Listo"); }
    h.el.classList.remove("on"); setTimeout(() => h.el.remove(), 250);
    if (silent) return;
    const inp = document.querySelector(`[data-i="${h.ii}"][data-r="${h.r}"][data-f="r"]`);
    if (inp && held > 0) { inp.value = held; inp.dispatchEvent(new Event("input", { bubbles: true })); toast(`${held} s registrados`); }
  }

  /* ───────── Resumen al terminar ───────── */
  function summaryHtml(iso, sid) {
    const st = stats(iso, sid), r = st.r, p = prev(sid, iso), ps = p ? stats(p.iso, sid) : null, se = sessMeta(sid);
    const min = st.sec / 60, dens = min > 1 && st.vol ? st.vol / min : 0, rt = r ? avg(r.rt.map(x => x[1])) : 0;
    const cmp = (a, b, f) => { if (!b) return ""; const d = a - b; if (Math.abs(d) < 1e-6) return `<small>igual que antes</small>`; return `<small class="${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${f(Math.abs(d))} vs antes</small>`; };
    const tile = (l, v, x = "") => `<div class="ck-tile"><span>${l}</span><b>${v}</b>${x}</div>`;
    const bl = (() => { try { return blocksOf(sessionById(sid)); } catch (e) { return []; } })();
    const spl = r ? Object.keys(r.sp).map(Number).sort((a, b) => a - b).map(b => [b, r.sp[b][1] - r.sp[b][0]]) : [], mx = Math.max(1, ...spl.map(x => x[1]));
    const bname = b => bl[b] ? (bl[b].t === "cardio" ? "Cardio" : D.EX[bl[b].items[0].k].name) : `Bloque ${b + 1}`;
    return `<div class="ck-sum">
      <div class="ck-big">${r ? mmss(st.sec) : "—"}</div><div class="ck-sub">${esc(se ? se.name : "Entreno")}, ${esc(longDate(iso))}${r && r.m ? " (tiempo anotado a mano)" : ""}</div>
      <div class="ck-grid">${tile("Series", st.sets, ps && ps.sets ? cmp(st.sets, ps.sets, x => x) : "")}${tile("Volumen", st.vol ? `${num(Math.round(wd(st.vol)))} ${wU()}` : "—", ps && ps.vol && st.vol ? cmp(st.vol, ps.vol, x => num(Math.round(wd(x)))) : "")}${tile("Densidad", dens ? `${num(Math.round(wd(dens)))} ${wU()}/min` : "—", ps && ps.vol && ps.sec > 60 && dens ? cmp(dens, ps.vol / (ps.sec / 60), x => num(Math.round(wd(x)))) : "")}${tile("Vuelta promedio", rt ? mmss(rt) : "—")}${tile("Vs. la anterior", ps && ps.sec && r ? dmm(st.sec - ps.sec) : "—")}${tile("Récords", r ? r.pr : 0)}</div>
      ${spl.length ? `<h2 class="sec">Tiempo por bloque</h2><div class="group ck-splits">${spl.map(([b, s]) => `<div class="ck-sp"><span>${b + 1}. ${esc(bname(b))}</span><i style="--p:${(s / mx).toFixed(3)}"></i><b>${mmss(s)}</b></div>`).join("")}</div>` : ""}
      <p class="note">${p ? `Comparado con tu sesión del ${esc(shortDate(p.iso))}${ps.sec ? `, que duró ${mmss(ps.sec)}` : ""}. Densidad: lo que levantaste por minuto; si sube con el mismo peso, rindes mejor en menos tiempo.` : "La próxima vez verás aquí la comparación contra este entreno."}</p>
    </div>`;
  }
  function showSummary(iso, sid, cb) {
    openSheet("Resumen del entreno", summaryHtml(iso, sid) + `<div class="btn-wrap"><button class="btn" data-ck="sumok">Listo</button></div>`, el => {
      el.querySelector("[data-ck=sumok]").addEventListener("click", () => { closeSheet(true); cb && cb(); });
    });
  }
  function finish(sid, cb, delay = 1300) {
    const iso = todayISO(), r = rec(sid); if (r && !r.e) { closeRec(r, now()); save(); }
    stopMetro(); paint();
    const st = stats(iso, sid); if (!r && !st.sets) return cb && cb();
    if (r) say(`Entrenamiento terminado en ${spoken(elapsed(r))}.`);
    setTimeout(() => showSummary(iso, sid, cb), delay);
  }

  /* ───────── Historial ───────── */
  const durText = (d, sid) => { const r = wt()[K(d, sid)]; return r && r.e ? `, ${hm(elapsed(r))}` : ""; };
  function pastBox(d, sid) {
    const r = wt()[K(d, sid)], sec = r ? elapsed(r) : 0, g = r && r.e ? ghost(sid, r, d) : null;
    return `<h2 class="sec">Tiempo</h2><div class="group">
      <div class="field"><label for="ck-dur">Duración (minutos)</label><input id="ck-dur" type="number" inputmode="numeric" min="1" max="300" data-ckdur="${d}|${sid}" value="${r && r.e ? Math.round(sec / 60) : ""}" placeholder="Sin cronometrar"></div>
      ${g && g.d != null ? `<div class="row"><div class="main"><div class="title">Contra la sesión anterior</div><div class="meta">${dmm(sec - elapsed(g.p.r))} en total</div></div></div>` : ""}
      ${r && Object.keys(r.sp).length ? `<button class="row" data-ck="sum" data-d="${d}" data-sid="${sid}"><div class="main"><div class="title">Ver resumen y tiempos por bloque</div></div>${I.chev}</button>` : ""}
    </div>`;
  }
  function setDur(d, sid, min) {
    const k = K(d, sid), r = wt()[k];
    if (!(min >= 1 && min <= 300)) { if (r && r.m) delete A.S.wt[k]; save(); return; }
    if (r && r.e) { const cur = elapsed(r); r.e += Math.round((min * 60 - cur) * 1000); if (r.e < r.s) r.e = r.s; }
    else if (!r) { const s = new Date(d + "T12:00:00").getTime(); A.S.wt[k] = { s, e: s + min * 6e4, pz: 0, pa: 0, la: s, sp: {}, rt: [], lt: null, lb: null, pr: 0, m: true }; }
    save();
  }
  function move(d, nd, sid) { const a = K(d, sid), b = K(nd, sid); if (wt()[a] && !A.S.wt[b]) { A.S.wt[b] = A.S.wt[a]; } delete A.S.wt[a]; }
  function drop(d, sid) { delete wt()[K(d, sid)]; }

  /* ───────── Página: Tiempo entrenado ───────── */
  const mondayOf = iso => addDays(iso, -((new Date(iso + "T12:00:00").getDay() + 6) % 7));
  function entries() { return Object.keys(wt()).map(k => ({ k, d: k.slice(0, 10), sid: k.slice(11), r: A.S.wt[k], sec: elapsed(A.S.wt[k]) })).filter(x => x.sec >= 60).sort((a, b) => a.k < b.k ? -1 : 1); }
  const weekSec = () => { const m = mondayOf(todayISO()); return entries().filter(x => x.d >= m).reduce((a, x) => a + x.sec, 0); };
  const weekText = () => { const s = weekSec(); return s ? hm(s) : "—"; };
  function vTime() {
    const es = entries(), m0 = mondayOf(todayISO());
    const weeks = Array.from({ length: 8 }, (_, i) => { const a = addDays(m0, -7 * (7 - i)), z = addDays(a, 7); return { a, sec: es.filter(x => x.d >= a && x.d < z).reduce((s, x) => s + x.sec, 0) }; });
    const mx = Math.max(1, ...weeks.map(w => w.sec)), W = 320, H = 132, bw = 28, gap = (W - 8 * bw) / 8;
    const svg = `<svg class="ck-wk" viewBox="0 0 ${W} ${H + 22}" role="img" aria-label="Minutos por semana, últimas 8 semanas: ${weeks.map(w => Math.round(w.sec / 60)).join(", ")}">${weeks.map((w, i) => { const h = Math.max(w.sec ? 3 : 0, Math.round(w.sec / mx * (H - 18))), x = gap / 2 + i * (bw + gap); return `<rect x="${x}" y="${H - h}" width="${bw}" height="${h}" rx="5" class="${i === 7 ? "cur" : ""}"/>${w.sec ? `<text x="${x + bw / 2}" y="${H - h - 5}" class="v">${Math.round(w.sec / 60)}</text>` : ""}<text x="${x + bw / 2}" y="${H + 16}" class="l">${esc(shortDate(w.a))}</text>`; }).join("")}</svg>`;
    const recent = es.slice(-10), total = es.reduce((a, x) => a + x.sec, 0), rts = es.flatMap(x => x.r.rt.map(y => y[1])).slice(-60);
    const bySess = SESSIONS().map(s => { const l = es.filter(x => x.sid === s.id); return l.length ? { s, n: l.length, last: l[l.length - 1], best: l.reduce((a, x) => x.sec < a.sec ? x : a, l[0]) } : null; }).filter(Boolean);
    const list = [...es].reverse().slice(0, 15).map(x => { const se = sessMeta(x.sid), pv = prev(x.sid, x.d); return se ? `<button class="row" data-go="#/progreso/sesion/${x.d}/${x.sid}"><div class="main"><div class="title">${esc(se.name)}</div><div class="meta">${esc(longDate(x.d))}${pv ? `, ${dmm(x.sec - elapsed(pv.r))} vs la anterior` : ""}${x.r.m ? ", anotado a mano" : ""}</div></div><span class="val">${mmss(x.sec)}</span>${I.chev}</button>` : ""; }).join("");
    return `${nav("Tiempo entrenado", { back: "Progreso", to: "#/progreso", sub: "Cuánto entrenas y a qué ritmo" })}
    <div class="ck-grid ck-grid-top">
      <div class="ck-tile"><span>Esta semana</span><b>${weekText()}</b></div>
      <div class="ck-tile"><span>Sesión promedio</span><b>${recent.length ? mmss(avg(recent.map(x => x.sec))) : "—"}</b></div>
      <div class="ck-tile"><span>Vuelta promedio</span><b>${rts.length ? mmss(avg(rts)) : "—"}</b></div>
      <div class="ck-tile"><span>En total</span><b>${total ? hm(total) : "—"}</b></div>
    </div>
    <h2 class="sec">Minutos por semana</h2><div class="group" style="padding:14px 10px 8px">${es.length ? svg : `<div class="empty">Cuando cronometres tu primer entreno aparecerá aquí. El reloj arranca solo con tu primera vuelta.</div>`}</div>
    ${bySess.length ? `<h2 class="sec">Por sesión</h2><div class="group">${bySess.map(b => `<div class="row"><div class="main"><div class="title">${esc(b.s.name)}</div><div class="meta">${b.n} ${b.n === 1 ? "vez" : "veces"}, la más rápida ${mmss(b.best.sec)} (${esc(shortDate(b.best.d))})</div></div><span class="val">${mmss(b.last.sec)}</span></div>`).join("")}</div>` : ""}
    ${list ? `<h2 class="sec">Últimos entrenos</h2><div class="group">${list}</div>` : ""}
    <p class="note">Más rápido no siempre es mejor: si el tiempo baja porque descansas menos de lo indicado en los básicos, la fuerza también baja. Úsalo para detectar descansos que se alargan sin querer.</p>`;
  }

  /* ───────── Página: Cronómetros (AMRAP, Por tiempo, Cronómetro) ───────── */
  const CLK = "reto90.clk", CLKLOG = "reto90.clklog";
  let clkMode = "amrap", clkT = null;
  const clk = () => { try { const x = JSON.parse(LS.getItem(CLK) || "null"); return x && isFinite(x.s) && ["amrap", "time", "sw"].includes(x.m) ? x : null; } catch (e) { return null; } };
  const setClk = x => { try { x ? LS.setItem(CLK, JSON.stringify(x)) : LS.removeItem(CLK); } catch (e) {} };
  const clkLog = () => { try { const l = JSON.parse(LS.getItem(CLKLOG) || "[]"); return Array.isArray(l) ? l.slice(-15).filter(x => x && CNAME[x.m] && /^\d{4}-\d{2}-\d{2}$/.test(x.d)).map(x => ({ m: x.m, d: x.d, sec: Math.max(0, Math.min(86400, +x.sec || 0)), n: Math.max(0, Math.min(999, Math.round(+x.n || 0))), cap: Math.max(0, Math.min(7200, +x.cap || 0)) })) : []; } catch (e) { return []; } };
  const clkEl = c => { const end = c.e || now(); return (end - c.s - (c.pz || 0) - (c.pa && !c.e ? end - c.pa : 0)) / 1000; };
  const CMODES = [["amrap", "AMRAP"], ["time", "Por tiempo"], ["sw", "Cronómetro"]];
  const CDESC = { amrap: "Todas las rondas que puedas en un tiempo fijo. Toca «+1 ronda» cada vez que termines una.", time: "Termina el trabajo lo más rápido posible, con tiempo límite. Toca «Vuelta» para marcar parciales.", sw: "Cronómetro libre con vueltas y pausa. Útil para cardio, circuitos o medir tus descansos." };
  const CNAME = { amrap: "AMRAP", time: "Por tiempo", sw: "Cronómetro" };
  function vClocks() {
    const c = clk(), m = c ? c.m : clkMode, run = c && !c.e;
    const cap = m === "amrap" ? 12 : m === "time" ? 20 : 0;
    const laps = c ? c.laps.map((t, i) => [i, t, t - (i ? c.laps[i - 1] : 0)]).reverse() : [], bestLap = laps.length > 1 ? Math.min(...laps.map(x => x[2])) : null;
    const log = clkLog().reverse();
    return `${nav("Cronómetros", { back: "Entreno", to: "#/entreno", sub: "AMRAP, por tiempo y cronómetro con vueltas" })}
    ${c ? "" : segHtml(CMODES, m, "ckmode", "Tipo de cronómetro")}
    <div class="int-box ck-clk" id="clk-box" data-ph="${run ? "work" : c ? "done" : "idle"}"><div id="clk-ph">${c ? CNAME[m] : "Listo"}</div><div class="int-t" id="clk-t">${c ? mmss(m === "amrap" ? Math.max(0, c.cap - clkEl(c)) : clkEl(c)) : m === "amrap" ? mmss(cap * 60) : "0:00"}</div><div id="clk-r">${c && m === "amrap" ? `${c.laps.length} rondas` : c && c.laps.length ? `${c.laps.length} vueltas` : ""}</div></div>
    <p class="ck-note" style="margin:0 4px 12px">${CDESC[m]}</p>
    ${!c && m !== "sw" ? `<div class="group"><div class="field"><label for="clk-cap">${m === "amrap" ? "Duración (minutos)" : "Tiempo límite (minutos, 0 = sin límite)"}</label><input id="clk-cap" type="number" inputmode="numeric" min="${m === "amrap" ? 1 : 0}" max="120" value="${cap}"></div></div>` : ""}
    <div class="btn-wrap ck-clk-btns">${!c ? `<button class="btn" data-ck="cstart">Empezar</button>` : run ? `<button class="btn ck-lap" data-ck="clap">${m === "amrap" ? "+1 ronda" : "Vuelta"}</button><div class="ck-two"><button class="btn secondary" data-ck="cpause">${c.pa ? "Seguir" : "Pausa"}</button><button class="btn secondary" data-ck="cstop">${m === "time" ? "Terminé" : "Detener"}</button></div>` : `<button class="btn" data-ck="creset">Nuevo</button>`}</div>
    ${laps.length ? `<h2 class="sec">${m === "amrap" ? "Rondas" : "Vueltas"}</h2><div class="group">${laps.map(([i, t, d]) => `<div class="row"><div class="main"><div class="title">${m === "amrap" ? "Ronda" : "Vuelta"} ${i + 1}${bestLap !== null && d === bestLap ? ' <span class="badge good">Mejor</span>' : ""}</div><div class="meta">Acumulado ${mmss(t)}</div></div><span class="val">${mmss(d)}</span></div>`).join("")}</div>` : ""}
    ${log.length ? `<h2 class="sec">Tus marcas</h2><div class="group">${log.map(x => `<div class="row"><div class="main"><div class="title">${esc(CNAME[x.m] || "")}${x.m === "amrap" ? ` ${Math.round(x.cap / 60)} min` : ""}</div><div class="meta">${esc(shortDate(x.d))}${x.m !== "amrap" && x.n ? `, ${x.n} vueltas` : ""}</div></div><span class="val">${x.m === "amrap" ? `${x.n} rondas` : mmss(x.sec)}</span></div>`).join("")}</div>` : ""}`;
  }
  function clkTick() {
    const c = clk(); if (!c || c.e || parseHash()[1] !== "reloj") { clearInterval(clkT); clkT = null; return; }
    const el = clkEl(c), box = document.getElementById("clk-box"); if (!box) return;
    const t = document.getElementById("clk-t"), ph = document.getElementById("clk-ph"), rr = document.getElementById("clk-r");
    if (el < 0) { const s = Math.ceil(-el); box.dataset.ph = "ready"; ph.textContent = "Prepárate"; t.textContent = s; countdown("c" + c.s, s); return; }
    if (!c.go) { c.go = true; setClk(c); beep(988, .35); vibrate([120, 60, 120]); say("¡Vamos!"); }
    box.dataset.ph = c.pa ? "rest" : "work"; ph.textContent = c.pa ? "En pausa" : CNAME[c.m];
    if (c.m === "amrap") { const left = c.cap - el; t.textContent = mmss(Math.ceil(Math.max(0, left))); rr.textContent = `Ronda ${c.laps.length + 1}`; if (left <= 60 && left > 59 && !c.min1) { c.min1 = true; setClk(c); say("Último minuto"); } countdown("ca" + c.s, Math.ceil(left)); if (left <= 0) return clkStop(true); }
    else { t.textContent = mmss(Math.floor(el)); rr.textContent = c.laps.length ? `${c.laps.length} vueltas` : ""; if (c.m === "time" && c.cap) { const left = c.cap - el; countdown("ct" + c.s, Math.ceil(left)); if (left <= 0) return clkStop(true); } }
  }
  function clkStop(auto) {
    const c = clk(); if (!c || c.e) return;
    const t = now(); if (c.pa) { c.pz += t - c.pa; c.pa = 0; } c.e = c.m === "amrap" || (c.m === "time" && auto) ? Math.min(t, c.s + c.pz + c.cap * 1000) : t; setClk(c);
    const sec = Math.max(0, clkEl(c));
    if (sec >= 5) { const l = clkLog(); l.push({ m: c.m, d: todayISO(), sec: Math.round(sec), n: c.laps.length, cap: c.cap }); try { LS.setItem(CLKLOG, JSON.stringify(l.slice(-15))); } catch (e) {} }
    beep(880, .8); vibrate([200, 100, 200]);
    say(c.m === "amrap" ? `Tiempo. ${c.laps.length} rondas.` : auto ? "Tiempo límite" : `Terminado en ${spoken(sec).replace(/^0 minutos$/, Math.round(sec) + " segundos")}`);
    clearInterval(clkT); clkT = null; if (parseHash()[1] === "reloj") refresh();
  }

  /* ───────── Eventos (delegados: no dependen de bind() de app.js) ───────── */
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest("[data-ck],[data-cktempo],[data-ckmode]"); if (!b) return;
    if (b.dataset.cktempo) { segMove(b); setTempo(b.dataset.cktempo); return; }
    if (b.dataset.ckmode) { segMove(b); clkMode = b.dataset.ckmode; setTimeout(refresh, 260); return; }
    const a = b.dataset.ck, sid = b.dataset.sid;
    if (a === "start") { unlock(); start(sid); vibrate(12); if (!b.dataset.go) refresh(); }
    else if (a === "pause") { togglePause(sid); vibrate(10); refresh(); }
    else if (a === "sum") showSummary(b.dataset.d || todayISO(), sid);
    else if (a === "hold") startHold(+b.dataset.sec, +b.dataset.hi, +b.dataset.hr);
    else if (a === "cstart") {
      unlock(); const capIn = document.getElementById("clk-cap"), capM = capIn ? Math.round(+capIn.value) : 0;
      if (clkMode === "amrap" && !(capM >= 1 && capM <= 120)) return toast("Elige de 1 a 120 minutos");
      if (clkMode === "time" && !(capM >= 0 && capM <= 120)) return toast("Elige de 0 a 120 minutos");
      setClk({ m: clkMode, s: now() + 10000, cap: capM * 60, laps: [], pz: 0, pa: 0, e: null }); refresh();
    }
    else if (a === "clap") { const c = clk(); if (!c || c.e || c.pa) return; const el = clkEl(c); if (el < 1 || (c.laps.length && el - c.laps[c.laps.length - 1] < 2)) return; c.laps.push(Math.round(el * 10) / 10); setClk(c); vibrate(20); beep(1100, .08); if (c.m === "amrap") say(`Ronda ${c.laps.length}`); refresh(); }
    else if (a === "cpause") { const c = clk(); if (!c || c.e) return; const t = now(); if (c.pa) { c.pz += t - c.pa; c.pa = 0; } else c.pa = t; setClk(c); refresh(); }
    else if (a === "cstop") clkStop(false);
    else if (a === "creset") { setClk(null); refresh(); }
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.id === "vc-on") { A.S.voice = t.checked; save(); if (A.S.voice) { unlocked = false; unlock(); say("Voz activada"); } }
    if (t.dataset && t.dataset.ckdur) { const [d, sid] = t.dataset.ckdur.split("|"); setDur(d, sid, t.value === "" ? 0 : Math.round(+t.value)); toast(t.value === "" ? "Tiempo quitado" : "Duración guardada"); }
  });
  window.addEventListener("hashchange", () => { stopMetro(); endHold(true, true); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) after(); });

  /* Se llama al final de cada render() */
  function after() {
    paint();
    const h = parseHash();
    if (h[0] === "entreno" && h[1] === "reloj") { const c = clk(); if (c && !c.e && !clkT) { clkT = setInterval(clkTick, 200); } clkTick(); }
    if (h[0] === "bloque") { try { const v = LS.getItem("reto90.tempo"); if (v && TEMPOS.some(x => x[0] === v)) metro.t = v; } catch (e) {} }
  }
  const clockRunning = () => { const c = clk(); return !!c && !c.e; };

  return { start, onTick, finish, showSummary, sessionCard, blockBar, tempoRow, holdBtn, split, nextText, restCue, countdown, restDone, say, unlock, durText, pastBox, move, drop, weekText, vTime, vClocks, after, active, clockRunning, mmss };
};
