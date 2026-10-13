(() => {
const D = window.DATA, C = window.CONTENT;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app"), tabsEl = $("#tabs");
const KEY = "reto90.v1";
const LS = (() => { const mem = {}; let ok = true; try { localStorage.setItem("_t", "1"); localStorage.removeItem("_t"); } catch (e) { ok = false; }
  return { persistent: ok, getItem: k => { if (ok) { try { return localStorage.getItem(k); } catch (e) {} } return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }, setItem: (k, v) => { mem[k] = String(v); if (ok) { try { localStorage.setItem(k, v); } catch (e) {} } }, removeItem: k => { delete mem[k]; if (ok) { try { localStorage.removeItem(k); } catch (e) {} } } }; })();

/* ───────── Estado ───────── */
const todayISO = (d = new Date()) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return todayISO(d); };
const diffDays = (a, b) => Math.round((new Date(a + "T12:00:00") - new Date(b + "T12:00:00")) / 864e5);
const defaults = () => ({ body: {}, prs: {}, lastExport: null, tips: {}, swaps: {}, accent: "naranja", theme: "auto", sound: true, remind: { train: "18:00", weigh: "07:00" }, profile: null, cardio: {}, intro: false, start: null, weekend: "sab", mode: "gym", weights: {}, waists: {}, checks: {}, hist: {}, picks: {}, eaten: {}, reviews: {} });
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = o => !!o && typeof o === "object" && !Array.isArray(o);
const okKey = k => typeof k === "string" && k.length < 80 && k !== "__proto__" && k !== "constructor" && k !== "prototype";
const numIn = (v, lo, hi) => (typeof v === "number" && isFinite(v) && v >= lo && v <= hi) ? v : null;
const validDate = v => typeof v === "string" && DATE_RE.test(v) && !isNaN(Date.parse(v + "T12:00:00"));
function cleanMap(src, fn) { const out = {}; if (!isObj(src)) return out; Object.keys(src).forEach(k => { if (!okKey(k) || !validDate(k)) return; const v = fn(src[k]); if (v !== undefined && v !== null) out[k] = v; }); return out; }
/* Nada de lo que viene de fuera (archivo importado, copia restaurada) entra al estado sin pasar por aquí:
   solo claves conocidas, tipos y rangos válidos. Así no puede inyectar HTML ni romper la app. */
const SLOTS = new Set([...D.MEALS, ...D.MEALS_VEG].map(m => m.slot).concat("Snack"));
const cleanName = v => typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f<>&"]/g, "").replace(/\s+/g, " ").trim().slice(0, 30) : "";
function normalizeState(raw) {
  const d = defaults(); if (!isObj(raw)) return d;
  if (isObj(raw.profile)) {
    const p = raw.profile, e = isObj(p.equip) ? p.equip : {};
    const pr = { name: cleanName(p.name), sex: ["m", "f"].includes(p.sex) ? p.sex : null, age: numIn(p.age, 14, 90), h: numIn(p.h, 120, 220), kg: numIn(p.kg, 30, 250), level: Object.keys(C.levels).includes(p.level) ? p.level : "medio", goal: Object.keys(C.goals).includes(p.goal) ? p.goal : "recomp", pct: [5, 10, 15, 20].includes(p.pct) ? p.pct : null, days: [3, 4, 5, 6].includes(p.days) ? p.days : 6, diet: ["omni", "veg"].includes(p.diet) ? p.diet : "omni", adj: numIn(p.adj, -450, 450) ?? 0, equip: { bench: e.bench !== false, bar: e.bar === true, dbMax: [10, 20, 30, 40].includes(e.dbMax) ? e.dbMax : 20, pull: e.pull === true, dips: e.dips === true } };
    if (pr.sex && pr.age && pr.h && pr.kg) { if (pr.pct === null) pr.pct = C.goals[pr.goal].pace; d.profile = pr; }
  }
  d.start = d.profile && validDate(raw.start) ? raw.start : null;
  d.weekend = raw.weekend === "dom" ? "dom" : "sab"; d.mode = ["gym", "db", "home"].includes(raw.mode) ? raw.mode : "gym";
  d.accent = ["naranja", "azul", "morado", "rosa"].includes(raw.accent) ? raw.accent : "naranja";
  d.theme = ["auto", "light", "dark"].includes(raw.theme) ? raw.theme : "auto"; d.sound = raw.sound !== false;
  const hhmm = v => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  d.remind = { train: isObj(raw.remind) && hhmm(raw.remind.train) ? raw.remind.train : "18:00", weigh: isObj(raw.remind) && hhmm(raw.remind.weigh) ? raw.remind.weigh : "07:00" };
  d.weights = cleanMap(raw.weights, v => numIn(v, 20, 400)); d.waists = cleanMap(raw.waists, v => numIn(v, 30, 250));
  d.body = cleanMap(raw.body, v => { if (!isObj(v)) return null; const o = {}; ["pecho", "brazo", "muslo", "cadera"].forEach(k => { const n = numIn(v[k], 10, 250); if (n !== null) o[k] = n; }); return o; });
  d.checks = cleanMap(raw.checks, v => { if (!isObj(v)) return null; const o = {}; Object.keys(v).forEach(k => { if (!okKey(k)) return; if (k === "water") { const n = numIn(v[k], 0, 10000); if (n !== null) o[k] = n; } else if (k === "steps") { const n = numIn(v[k], 0, 100000); if (n !== null) o[k] = n; } else if (k === "sleep" || /^s_[A-Za-z]{2,12}$/.test(k)) o[k] = v[k] === true; }); return o; });
  d.eaten = cleanMap(raw.eaten, v => { if (!isObj(v)) return null; const o = {}; Object.keys(v).forEach(k => { if (SLOTS.has(k) && v[k] === true) o[k] = true; }); return o; });
  d.cardio = cleanMap(raw.cardio, v => { if (!isObj(v)) return null; const o = {}; Object.keys(v).forEach(k => { if (okKey(k) && /^[A-Za-z]{2,12}-(gym|db|home)-\d{1,2}$/.test(k) && isObj(v[k])) o[k] = { done: v[k].done === true, min: numIn(v[k].min, 0, 300) ?? 0, kind: ["cam", "eli", "run"].includes(v[k].kind) ? v[k].kind : "cam" }; }); return o; });
  d.hist = {}; if (isObj(raw.hist)) Object.keys(raw.hist).forEach(k => { if (!okKey(k) || !D.EX[k] || !Array.isArray(raw.hist[k])) return; d.hist[k] = raw.hist[k].slice(-400).filter(x => isObj(x) && validDate(x.d) && Array.isArray(x.sets)).map(x => ({ d: x.d, sets: x.sets.slice(0, 12).map(t => isObj(t) ? { w: numIn(t.w, 0, 1000), r: numIn(t.r, 0, 1000), done: t.done === true } : { w: null, r: null, done: false }) })); });
  d.picks = {}; if (isObj(raw.picks)) Object.keys(raw.picks).forEach(k => { if (SLOTS.has(k) && Number.isInteger(raw.picks[k]) && raw.picks[k] >= 0 && raw.picks[k] < 30) d.picks[k] = raw.picks[k]; });
  d.swaps = {}; if (isObj(raw.swaps)) Object.keys(raw.swaps).forEach(k => { if (okKey(k) && /^[A-Za-z]{2,12}\|(gym|db|home)\|\d{1,2}\|\d{1,2}$/.test(k) && typeof raw.swaps[k] === "string" && D.EX[raw.swaps[k]]) d.swaps[k] = raw.swaps[k]; });
  d.prs = {}; if (isObj(raw.prs)) Object.keys(raw.prs).forEach(k => { if (okKey(k) && D.EX[k]) { const n = numIn(raw.prs[k], 0, 2000); if (n !== null) d.prs[k] = n; } });
  d.reviews = {}; if (isObj(raw.reviews)) Object.keys(raw.reviews).forEach(k => { if (/^\d{1,2}$/.test(k) && isObj(raw.reviews[k])) { const o = {}; Object.keys(raw.reviews[k]).forEach(q => { const v = raw.reviews[k][q]; if (okKey(q) && (typeof v === "boolean" || (typeof v === "number" && isFinite(v)))) o[q] = v; }); d.reviews[k] = o; } });
  d.tips = { hoy: isObj(raw.tips) && raw.tips.hoy === true }; d.intro = raw.intro === true; d.lastExport = validDate(raw.lastExport) ? raw.lastExport : null;
  if (["cam", "eli", "run"].includes(raw.cardioKind)) d.cardioKind = raw.cardioKind;
  return d;
}
let S;
try { S = normalizeState(JSON.parse(LS.getItem(KEY) || "{}")); } catch { S = defaults(); }
Object.values(D.ARCH).forEach(s => ["gym", "db", "home"].forEach(m => s[m].forEach((b, i) => { b.key = s.id + "-" + m + "-" + i; b.sid = s.id; b.idx = i; })));
let backupT = null;
const save = () => {
  try { LS.setItem(KEY, JSON.stringify(S)); LS.setItem(KEY + ".saved", String(Date.now())); } catch {}
  clearTimeout(backupT); backupT = setTimeout(() => { if (window.Store && Store.available() && S.start) Store.setKV("backup", JSON.stringify(S)).catch(() => {}); }, 1200);
};

/* ───────── Utilidades ───────── */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (n, d = 1) => Number(n).toLocaleString("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d });
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const longDate = iso => { const s = new Date(iso + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" }); return s.charAt(0).toUpperCase() + s.slice(1); };
const shortDate = iso => { const d = new Date(iso + "T12:00:00"); return d.getDate() + " " + MONTHS[d.getMonth()]; };
let toastT;
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2200); };
const vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch {} };
const fmtRest = s => s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min` : `${s} s`;
const nums = r => (String(r).match(/\d+/g) || []).map(Number);
const topReps = r => { const n = nums(r); return n.length ? n[n.length - 1] : 10; };
const lowReps = r => /fallo|máximo/.test(r) ? null : (nums(r)[0] ?? 10);
const repsLabel = r => /[a-záéíóú]/i.test(String(r)) ? String(r) : `${r} reps`;

const I = {
  chev: `<svg class="chev" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/></svg>`,
  dumb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>`,
  fork: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v8M4 3v5a3 3 0 006 0V3M7 11v10M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>`,
};
const TABS = [["hoy", "Hoy", I.home], ["entreno", "Entreno", I.dumb], ["comida", "Comida", I.fork], ["progreso", "Progreso", I.chart]];

/* ───────── Lógica del plan ───────── */
const dayNum = (iso = todayISO()) => S.start ? diffDays(iso, S.start) + 1 : 0;
const weekNum = (iso = todayISO()) => Math.min(13, Math.max(1, Math.ceil(dayNum(iso) / 7)));
const phaseOf = w => C.phases.find(p => w >= p.weeks[0] && w <= p.weeks[1]);
const SPLITS = { 3: ["fullA", "fullB", "fullC"], 4: ["upperA", "legsA", "upperB", "legsB"], 5: ["pushA", "pullA", "legsA", "upperB", "legsB"], 6: ["pushA", "pullA", "legsA", "pushB", "pullB", "legsB"] };
const WD_NAME = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 0: "Dom" };
const ABS = new Set(["cable_crunch", "hang_leg", "rev_crunch", "ab_roller", "plank", "side_bridge", "pallof", "crunch", "russian"]);
let _plan = { k: "", v: null };
function adaptSession(a, wd, goal, lv, days, sex) {
  const s = JSON.parse(JSON.stringify(a)); s.wd = wd; s.day = WD_NAME[wd];
  // Selección por sexo: más énfasis de glúteo en mujeres; sin abductor (poco valor) en hombres
  ["gym", "db", "home"].forEach(m => { s[m].forEach(b => {
    if (sex === "f" && b.items.some(it => it.k === "hip_thrust" || it.k === "glute_br")) b.rounds = Math.min(5, b.rounds + 1);
    if (sex !== "f" && b.items.some(it => it.k === "abductor")) { b.items = b.items.filter(it => it.k !== "abductor"); b.t = b.items.length > 1 ? b.t : "uni"; b.rounds = Math.min(5, b.rounds + 1); }
  }); });
  ["gym", "db", "home"].forEach(m => s[m].forEach((b, i) => {
    if (b.t === "cardio") { b.min = Math.max(10, Math.round(b.min * (goal === "muscle" ? 0.5 : 1) / 5) * 5) + (goal === "fat" && days <= 4 ? 10 : 0); return; }
    const abs = b.items.every(it => ABS.has(it.k));
    if (goal === "muscle" && i > 0 && !abs && b.rounds === 3) b.rounds += 1;
    if (lv === "nuevo" && i > 0 && b.rounds >= 3 && !abs) b.rounds -= 1;
    if (lv === "alto" && i === 0) b.rounds = Math.min(5, b.rounds + 1);
  }));
  s.gym = applySkills(s.gym); s.db = applyEquip(s.db, "db"); s.home = applyEquip(s.home, "home");
  return s;
}
const equip = () => ({ bench: true, bar: false, dbMax: 20, pull: false, dips: false, ...(S.profile.equip || {}) });
const PRESET = {
  pullup: { reps: "6–10", w: null, note: "Peso corporal. Cuando llegues a 10 en todas las vueltas, añade peso con un cinturón o una mancuerna entre los pies." },
  dips: { reps: "8–12", w: null, note: "Torso vertical para trabajar tríceps. Cuando llegues a 12 en todas las vueltas, añade peso." },
};
function resolveItem(k, preset) { const a = (preset && PRESET[k]) || D.ALT_DEF[k] || { reps: "10–12", w: null, note: "" }; return { k, reps: a.reps, w: a.w ? { ...a.w } : null, note: a.note || "" }; }
/* Gimnasio: si puedes hacer 5 o más dominadas / fondos, entran en lugar del jalón y del pushdown */
function applySkills(blocks) {
  const eq = equip(), has = k => blocks.some(b => b.items.some(i => i.k === k));
  blocks.forEach(b => { b.items = b.items.map(it => (eq.pull && it.k === "lat_pd" && !has("pullup")) ? resolveItem("pullup", true) : (eq.dips && it.k === "tri_push" && !has("dips")) ? resolveItem("dips", true) : it); });
  return blocks;
}
/* Sin banca: sustituciones lógicas; con barra: el tirón vertical real reemplaza a los sustitutos débiles */
function applyEquip(blocks, mode) {
  const eq = equip(), has = k => blocks.some(b => b.items.some(i => i.k === k));
  if (mode === "db" && !eq.bench) blocks.forEach(b => { b.items = b.items.map(it => { const list = D.NOBENCH[it.k]; if (!list) return it; const c = list.find(x => !has(x)); return c ? resolveItem(c) : null; }).filter(Boolean); });
  if (eq.bar) blocks.forEach(b => { b.items = b.items.map(it => { const t = D.BARSWAP[it.k]; return t && !has(t) ? resolveItem(t) : it; }); });
  return blocks.filter(b => b.t === "cardio" || b.items.length).map(b => (b.t !== "cardio" && b.items.length === 1 && b.t !== "uni") ? { ...b, t: "uni" } : b);
}
function SESSIONS() {
  const p = S.profile, k = [p.goal, p.days, p.level, S.weekend, p.sex, JSON.stringify(p.equip || {})].join("|");
  if (_plan.k === k) return _plan.v;
  const d = SPLITS[p.days] ? p.days : 6, wds = d === 3 ? [1, 3, 5] : d === 4 ? [1, 2, 4, 5] : d === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, S.weekend === "sab" ? 6 : 0];
  _plan = { k, v: SPLITS[d].map((id, i) => adaptSession(D.ARCH[id], wds[i], p.goal || "recomp", p.level || "medio", d, p.sex)) };
  return _plan.v;
}
const sessMin = s => Math.round((8 + blocksOf(s).reduce((a, b) => a + (b.t === "cardio" ? b.min : b.rounds * (b.items.length * 0.75 + b.rest / 60)), 0)) / 5) * 5;
const sessionFor = (iso = todayISO()) => { const wd = new Date(iso + "T12:00:00").getDay(); return SESSIONS().find(s => s.wd === wd) || null; };
const modeBlocks = s => S.mode === "home" ? s.home : S.mode === "db" ? s.db : s.gym;
function blocksOf(s) {
  const base = modeBlocks(s), sw = S.swaps || {}, pre = `${s.id}|${S.mode}|`;
  if (!Object.keys(sw).some(k => k.startsWith(pre))) return base;
  return base.map((b, bi) => b.items.some((_, ii) => sw[pre + bi + "|" + ii]) ? { ...b, items: b.items.map((it, ii) => sw[pre + bi + "|" + ii] ? resolveItem(sw[pre + bi + "|" + ii]) : it) } : b);
}
/* Alternativas: misma familia (mismo músculo y patrón), disponibles en tu modalidad y con tu equipo */
function altsFor(s, bi, ii) {
  const bl = blocksOf(s), cur = bl[bi]?.items[ii]?.k; if (!cur) return [];
  const present = new Set(bl.flatMap(b => b.items.map(i => i.k))), mch = S.mode === "gym" ? "g" : S.mode === "db" ? "d" : "h", eq = equip(), out = [];
  Object.values(D.FAMILIES).filter(f => f.items.some(i => i.k === cur)).forEach(f => f.items.forEach(i => {
    const ok = !i.n || S.mode === "gym" || (i.n === "bench" ? eq.bench : eq.bar);
    if (i.k !== cur && !present.has(i.k) && i.m.includes(mch) && ok && !out.some(o => o.k === i.k)) out.push({ k: i.k, fam: f.name });
  }));
  return out;
}
const totalRounds = s => blocksOf(s).reduce((a, b) => a + b.rounds, 0);
const weekDates = (iso = todayISO()) => { const wd = (new Date(iso + "T12:00:00").getDay() + 6) % 7; return Array.from({ length: 7 }, (_, i) => addDays(iso, i - wd)); };
const checksOf = iso => (S.checks[iso] = S.checks[iso] || {});
const sessionDoneOn = (iso, id) => !!(S.checks[iso] && S.checks[iso]["s_" + id]);
const sessionDoneThisWeek = id => weekDates().some(d => sessionDoneOn(d, id));
const getSets = (k, iso = todayISO()) => (S.hist[k] || []).find(x => x.d === iso)?.sets || [];
const roundDone = (it, r, iso = todayISO()) => !!getSets(it.k, iso)[r]?.done;
const cardioRec = (b, iso = todayISO()) => (S.cardio[iso] || {})[b.key];
const blockProgress = (b, iso = todayISO()) => { if (b.t === "cardio") return cardioRec(b, iso)?.done ? 1 : 0; let n = 0; for (let r = 0; r < b.rounds; r++) if (b.items.every(it => roundDone(it, r, iso))) n++; return n; };
const sessionProgress = (s, iso = todayISO()) => ({ done: blocksOf(s).reduce((a, b) => a + blockProgress(b, iso), 0), total: totalRounds(s) });
const avgWeight = (endISO, days = 7) => { const v = []; for (let i = 0; i < days; i++) { const w = S.weights[addDays(endISO, -i)]; if (w) v.push(w); } return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const weekDelta = () => { const a = avgWeight(todayISO()), b = avgWeight(addDays(todayISO(), -7)); return a && b ? a - b : null; };
const sortedWeights = () => Object.entries(S.weights).sort((a, b) => a[0] < b[0] ? -1 : 1);

/* ───────── Cálculo personalizado (se basa solo en los datos que captura cada persona) ───────── */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const r5 = x => Math.round(x / 5) * 5, r50 = x => Math.round(x / 50) * 50;
const latestWeight = () => { const w = sortedWeights(); return w.length ? w[w.length - 1][1] : null; };
const currentKg = () => avgWeight(todayISO()) || latestWeight() || S.profile.kg;
const num = n => Number(n).toLocaleString("es-MX");
function planCalc() {
  const p = S.profile, kg = r5(currentKg() * 2) / 2 || currentKg(), g = p.goal || "recomp";
  const bmr = 10 * kg + 6.25 * p.h - 5 * p.age + (p.sex === "f" ? -161 : 5);
  const maint = bmr * 1.55, pct = (p.pct ?? p.def ?? C.goals[g].pace) / 100, floor = p.sex === "f" ? 1400 : 1700, adj = p.adj || 0;
  let tKcal, rKcal, floorHit = false;
  if (g === "muscle") { tKcal = r50(maint * (1 + pct)) + adj; rKcal = r50(tKcal * 0.92); }
  else { const raw = maint * (1 - pct) + 45; floorHit = raw < floor + 250; tKcal = Math.max(r50(raw), floor + 250) + adj; rKcal = Math.max(r50(tKcal - tKcal * 0.14), floor); }
  tKcal = Math.max(tKcal, floor + 100);
  const prot = Math.min(200, r5((g === "muscle" ? 1.8 : 2.2) * kg)), fat = r5(Math.max(0.8 * kg, 0.22 * tKcal / 9));
  const carb = k => Math.max(80, r5((k - 4 * prot - 9 * fat) / 4));
  const bf = p.sex === "f" ? 30 : 22, f1 = x => x.toFixed(1);
  const rate = g === "fat" ? `${f1(kg * 0.0035)}–${f1(kg * 0.008)} kg` : g === "recomp" ? `${f1(kg * 0.001)}–${f1(kg * 0.004)} kg` : `${f1(kg * 0.0025)}–${f1(kg * 0.005)} kg`;
  return { kg, goal: g, pct: Math.round(pct * 100), adj, maint: r50(maint), maintLo: r50(bmr * 1.45), maintHi: r50(bmr * 1.65), floorHit,
    train: { kcal: tKcal, range: `${num(tKcal - 100)}–${num(tKcal + 100)}`, p: prot, c: carb(tKcal), g: fat },
    rest: { kcal: rKcal, range: `${num(rKcal - 100)}–${num(rKcal + 100)}`, p: prot, c: carb(rKcal), g: fat },
    rate, bf, protFfm: (prot / (kg * (1 - bf / 100))).toFixed(1), protMeal: r5(0.4 * kg), fatPct: Math.round(fat * 9 / tKcal * 100) };
}
function fill(str) {
  const c = planCalc(), lv = C.levels[S.profile.level];
  const map = { MAINT: `${num(c.maintLo)}–${num(c.maintHi)}`, KCAL_T: num(c.train.kcal), KCAL_R: num(c.rest.kcal), RATE: c.rate, PROT: c.train.p, PROT_FFM: c.protFfm, BF: c.bf, PROT_MEAL: c.protMeal, FAT: c.train.g, CARB: c.train.c, FAT_PCT: c.fatPct, PCT: c.pct, GOAL_KCAL: c.goal === "recomp" ? `casi mantenimiento (≈ ${c.pct} % por debajo)` : `déficit moderado (≈ ${c.pct} %)`, LEVEL: lv.name.toLowerCase(), GAIN: lv.gain };
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? "");
}
/* Porciones: el plan base (≈ 2,100 kcal en día de entreno) se escala a las calorías de cada persona */
const isVeg = () => S.profile.diet === "veg";
const MEAL_BASE = () => isVeg() ? D.MEALS_VEG : D.MEALS;
const FIXED_QTY = new Set(["whey"]);
const mealScale = () => clamp(planCalc().train.kcal / (isVeg() ? 2280 : 2130), 0.7, 1.7);
function scaleQty(key, qty) {
  if (FIXED_QTY.has(key)) return qty;
  const f = D.FOODS[key], x = qty * mealScale();
  if (f.unit === "pza") return Math.max(1, Math.round(x));
  if (key === "aceite") return Math.max(5, Math.round(x / 2) * 2);
  return x >= 100 ? Math.round(x / 10) * 10 : Math.max(5, Math.round(x / 5) * 5);
}
function optView(o) {
  const items = o.raw.map(([k, q]) => [k, scaleQty(k, q)]), m = { kcal: 0, p: 0, c: 0, g: 0 };
  items.forEach(([k, q]) => { const f = D.FOODS[k], r = (f.unit === "pza" ? q * f.gpu : q) / 100; m.kcal += f.k * r; m.p += f.p * r; m.c += f.c * r; m.g += f.g * r; });
  Object.keys(m).forEach(k => m[k] = Math.round(m[k]));
  return { name: o.name, tip: o.tip, m, items: items.map(([k, q]) => { const f = D.FOODS[k]; return f.unit === "pza" ? `${q} ${f.name}` : `${q} g de ${f.name}`; }) };
}
/* Pesos sugeridos: referencia (≈ 75 kg, hombre, nivel intermedio) escalada por peso, sexo y nivel */
const LOWER = new Set(["smith_sq", "leg_press", "split_db", "leg_ext", "hack", "rdl", "leg_curl", "hip_thrust", "abductor", "calf_st", "calf_se", "goblet", "db_squat", "db_lunge", "db_rear_lunge", "step_up", "db_rdl", "glute_br", "calf_home", "calf_one"]);
const dbCap = u => (S.mode === "db" && (u === "c/mano" || u === "total")) ? equip().dbMax : Infinity;
function scaleW(item) {
  const p = S.profile, f = (p.sex === "f" ? (LOWER.has(item.k) ? 0.8 : 0.65) : 1) * (currentKg() / 75) * C.levels[p.level].k, u = item.w.u, x = item.w.n * f;
  if (u === "c/mano") return Math.min(dbCap(u), Math.max(2, x < 12 ? Math.round(x) : Math.round(x / 2) * 2));
  if (u === "stack") return Math.max(5, Math.round(x / 2.5) * 2.5);
  return Math.min(dbCap(u), Math.max(S.mode === "db" ? 4 : 10, LOWER.has(item.k) ? Math.round(x / 5) * 5 : Math.round(x / 2.5) * 2.5));
}

/* Peso sugerido: estimado la primera vez; luego según lo registrado */
const incFor = (k, u) => u === "c/mano" ? 2 : u === "stack" ? 5 : (["smith_sq", "leg_press", "hack", "rdl", "hip_thrust"].includes(k) ? 10 : S.mode === "db" ? 2 : 2.5);
function suggest(item) {
  const iso = todayISO();
  if (!item.w || S.mode === "home") {
    const pv = [...(S.hist[item.k] || [])].reverse().find(x => x.d !== iso && x.sets.some(t => t.done && t.r)), best = pv ? Math.max(...pv.sets.filter(t => t.done && t.r).map(t => t.r)) : null;
    return { text: S.mode === "home" ? "Sin peso (mochila opcional)" : "Peso corporal", n: null, src: best ? `Tu última vez: ${best} repeticiones. Intenta una más en cada vuelta.` : "" };
  }
  const prev = [...(S.hist[item.k] || [])].reverse().find(x => x.d !== iso && x.sets.some(s => s.done && s.w));
  const u = item.w.u;
  if (!prev) { const n0 = scaleW(item); return { n: n0, u, text: `${fmt(n0, n0 % 1 ? 1 : 0)} kg ${u}`, src: "Estimado con tu peso y tu nivel: ajusta a 1–2 repeticiones en reserva." }; }
  const done = prev.sets.filter(s => s.done && s.w), top = Math.max(...done.map(s => s.w));
  const hit = done.length && done.every(s => (s.r || 0) >= topReps(item.reps));
  const cap = dbCap(u), n = Math.min(cap, hit ? top + incFor(item.k, u) : top), capped = hit && top >= cap;
  return { n, u, text: `${fmt(n, n % 1 ? 1 : 0)} kg ${u}`, src: capped ? "Ya llegaste al máximo de tus mancuernas: sube repeticiones (hasta 20–25), baja en 3 s o pasa a una pierna o un brazo." : hit ? `Completaste el rango alto con ${top} kg: sube.` : `Tu última vez: ${top} kg. Busca una repetición más.` };
}
const segHtml = (items, cur, attr, label = "Opciones") => `<div class="seg" role="group" aria-label="${esc(label)}" style="--n:${items.length};--i:${Math.max(0, items.findIndex(([v]) => String(v) === String(cur)))}">${items.map(([v, t]) => `<button data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${esc(t)}</button>`).join("")}</div>`;
function segMove(btn) { const seg = btn.closest(".seg"); [...seg.children].forEach((x, i) => { x.setAttribute("aria-pressed", String(x === btn)); if (x === btn) seg.style.setProperty("--i", i); }); }
const MODES = [["gym", "Gimnasio"], ["db", "Mancuernas"], ["home", "Sin equipo"]];
const modeSeg = () => segHtml(MODES, S.mode, "mode", "Dónde entrenas");
const typeLabel = t => ({ uni: "Uniserie", bi: "Biserie", tri: "Triserie", cardio: "Cardio" }[t]);
const cardioMin = b => b.min + (phaseOf(weekNum()).cardioAdd || 0);
const cardioKinds = () => S.mode === "gym" ? C.cardioKinds.gym : C.cardioKinds.home;
const cardioKind = () => { const ks = cardioKinds(); return ks.find(k => k.id === S.cardioKind) || ks[0]; };
const letters = "ABC";

/* ───────── Comidas ───────── */
const MEALS = () => [...MEAL_BASE(), { slot: "Snack", time: "libre", opts: isVeg() ? D.SNACKS_VEG : D.SNACKS }];
const isTrainDay = iso => !!sessionFor(iso);
const mealsToday = iso => MEALS().filter(m => m.slot !== "Pre-entreno" || isTrainDay(iso));
const pick = m => optView(m.opts[S.picks[m.slot] ?? 0]);
const eatenOn = iso => S.eaten[iso] || {};
const eatenTotals = iso => { const t = { kcal: 0, p: 0, c: 0, g: 0 }, e = eatenOn(iso); MEALS().forEach(m => { if (e[m.slot]) { const x = pick(m).m; t.kcal += x.kcal; t.p += x.p; t.c += x.c; t.g += x.g; } }); return t; };
const targetFor = iso => isTrainDay(iso) ? planCalc().train : planCalc().rest;
function nextMealSlot(iso) {
  const now = new Date(), mins = now.getHours() * 60 + now.getMinutes(), e = eatenOn(iso);
  const list = mealsToday(iso).filter(m => m.slot !== "Snack" && !e[m.slot]);
  if (!list.length) return null;
  const t = m => { const [h, mm] = m.time.split(":").map(Number); return h * 60 + mm; };
  return (list.find(m => t(m) + 45 >= mins) || list[0]).slot;
}

/* ───────── Router y navegación ───────── */
let lastDepth = 0, io = null, restT = null, restLeft = 0, popSel = null;
const parseHash = () => (location.hash || "#/hoy").slice(2).split("/").map(decodeURIComponent);
const go = h => { location.hash = h; };
window.addEventListener("hashchange", () => render());
const refresh = () => render({ keep: true });

const BACKS = { Entreno: "#/entreno", Comida: "#/comida", Progreso: "#/progreso", Ajustes: "#/plan", Hoy: "#/hoy" };
function nav(title, o = {}) {
  const to = o.to || BACKS[o.back] || "#/hoy";
  const back = o.back ? `<button class="nb-btn" data-to="${to}" aria-label="Volver a ${esc(o.back)}">${I.back}<span>${esc(o.back)}</span></button>` : "";
  const gear = o.gear ? `<button class="nb-btn gear" data-go="#/plan" aria-label="Ajustes">${I.gear}</button>` : "";
  return `<div class="navbar" id="navbar">${back}<span class="nb-title" aria-hidden="true">${esc(title)}</span>${gear}</div><h1 class="large" id="lt">${esc(title)}</h1>${o.sub ? `<p class="sub">${o.sub}</p>` : ""}`;
}
const cta = html => `<div class="cta-bar"><div class="inner">${html}</div></div>`;
let lastTab = null;
function renderTabs(tab) {
  tabsEl.innerHTML = `<div class="inner">${TABS.map(([k, l, ic]) => `<a href="#/${k}" class="${k === tab && lastTab && lastTab !== tab ? "bump" : ""}" ${k === tab ? 'aria-current="page"' : ""}>${ic}<span>${l}</span></a>`).join("")}</div>`; lastTab = tab;
}
const TABOF = { hoy: "hoy", entreno: "entreno", bloque: "entreno", ej: "entreno", cambiar: "entreno", comida: "comida", imprimir: "comida", progreso: "progreso", plan: "hoy" };

function render(o) {
  const keep = !!(o && o.keep), y0 = scrollY;
  clearInterval(restT);
  const r = parseHash();
  if ((!S.start || !S.profile) && r[0] !== "inicio") return go("#/inicio");
  let html, hasCta = false;
  switch (r[0]) {
    case "inicio": html = vSetup(); break;
    case "hoy": html = vToday(); break;
    case "entreno": html = r[1] === "guias" ? vGuides() : r[1] === "guia" ? vGuide() : r[1] === "abdomen" ? vAbs() : r[1] === "cardio" ? vCardioGuide() : r[1] === "limitadas" ? vLimited() : r[1] === "porque" ? vWhy("train") : r[1] ? vSession(r[1]) : vTrain(); hasCta = !!r[1] && !["guia", "abdomen", "cardio", "porque", "limitadas"].includes(r[1]); break;
    case "imprimir": html = vPrint(); break;
    case "bloque": html = vBlock(r[1], +r[2]); hasCta = true; break;
    case "ej": html = vExercise(r[1], r[2]); break;
    case "cambiar": html = vSwap(r[1], +r[2], +r[3]); break;
    case "comida": html = r[1] === "guias" ? vFoodGuides() : r[1] === "guia" ? vFoodGuide(r[2]) : r[1] === "menu" ? vMenu() : r[1] === "compras" ? vShop() : r[1] === "snacks" ? vSnacks() : r[1] === "reglas" ? vFoodRules() : r[1] === "porque" ? vWhy("diet") : r[1] === "slot" ? vSlot(r[2]) : vFood(); break;
    case "progreso": html = r[1] === "compartir" ? vShare() : r[1] === "medidas" ? vBodyMeasures() : r[1] === "fotos" ? vPhotos() : r[1] === "historial" ? vHistory() : r[1] === "datos" ? vData() : r[1] === "revision" ? vReview() : r[1] === "peso" ? vLogWeight() : r[1] === "fuerza" ? vStrength() : r[1] === "guia" ? vMeasureGuide() : vProgress(); break;
    case "plan": html = r[1] === "semana" ? vWeek(+r[2]) : r[1] === "habitos" ? vHabits() : r[1] === "fuentes" ? vSources() : r[1] === "ajustes" ? vSettings() : r[1] === "reglas" ? vAdjust() : r[1] === "ruta" ? vRoute() : r[1] === "avisos" ? vRemind() : vHub(); break;
    default: html = vToday();
  }
  const back = r.length < lastDepth; lastDepth = r.length;
  const onboarding = r[0] === "inicio"; if (onboarding) hasCta = true;
  document.documentElement.style.setProperty("--cta-h", hasCta ? "72px" : "0px");
  document.documentElement.classList.toggle("onb", onboarding);
  app.innerHTML = `<main class="page${keep ? " still" : back ? " back" : ""}">${html}</main>`;
  renderTabs(TABOF[r[0]] || "hoy"); tabsEl.style.display = S.start ? "" : "none";
  window.scrollTo(0, keep ? y0 : 0);
  if (io) io.disconnect();
  const lt = $("#lt"), nb = $("#navbar");
  if (lt && nb && "IntersectionObserver" in window) { io = new IntersectionObserver(([e]) => nb.classList.toggle("scrolled", !e.isIntersecting), { rootMargin: "-48px 0px 0px 0px" }); io.observe(lt); }
  bind();
  if (!keep) { const h = $("#lt"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  if (popSel) { $(popSel)?.classList.add("pop"); popSel = null; }
  if (r[0] === "progreso" && r[1] === "fotos") loadPhotos();
  if (r[0] === "progreso" && r[1] === "compartir") drawShare();
  if (r[0] === "progreso" && r[1] === "datos" && window.Store) { Store.persisted().then(v => { const e = $("#d-persist"); if (e) e.textContent = v ? "Activa" : "No concedida"; }); Store.usage().then(u => { const e = $("#d-usage"); if (e) e.textContent = u ? (u.used / 1048576).toFixed(1) + " MB" : "—"; }); }
}

/* ───────── Vistas ───────── */
const paceOptions = (g, cur) => C.goals[g].paces.map(([k, v]) => `<option value="${k}" ${String(cur ?? C.goals[g].pace) === String(k) ? "selected" : ""}>${v}</option>`).join("");
const profileFields = (p = {}, ids = "st") => `
    <div class="field"><label for="${ids}-name">Tu nombre</label><input id="${ids}-name" type="text" maxlength="30" autocomplete="given-name" autocapitalize="words" placeholder="Opcional" value="${esc(p.name || "")}"></div>
    <div class="field"><label for="${ids}-goal">Tu objetivo</label><select id="${ids}-goal">${Object.entries(C.goals).map(([k, v]) => `<option value="${k}" ${(p.goal || "recomp") === k ? "selected" : ""}>${v.name}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-pct">Ritmo</label><select id="${ids}-pct">${paceOptions(p.goal || "recomp", p.pct ?? p.def)}</select></div>
    <div class="field"><label for="${ids}-sex">Sexo (para estimar tus calorías)</label><select id="${ids}-sex"><option value="" ${p.sex ? "" : "selected"} disabled>Elige</option><option value="m" ${p.sex === "m" ? "selected" : ""}>Hombre</option><option value="f" ${p.sex === "f" ? "selected" : ""}>Mujer</option></select></div>
    <div class="field"><label for="${ids}-age">Edad (años)</label><input id="${ids}-age" type="number" inputmode="numeric" min="14" max="90" placeholder="Edad" value="${esc(p.age ?? "")}"></div>
    <div class="field"><label for="${ids}-h">Estatura (cm)</label><input id="${ids}-h" type="number" inputmode="numeric" min="120" max="220" placeholder="Estatura" value="${esc(p.h ?? "")}"></div>
    <div class="field"><label for="${ids}-kg">Peso actual (kg)</label><input id="${ids}-kg" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="Peso" value="${esc(p.kg ?? "")}"></div>
    <div class="field"><label for="${ids}-lv">Tu experiencia con pesas</label><select id="${ids}-lv">${Object.entries(C.levels).map(([k, v]) => `<option value="${k}" ${(p.level || "medio") === k ? "selected" : ""}>${v.name} · ${v.sub}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-days">Días de pesas por semana</label><select id="${ids}-days">${C.daysOptions.map(([k, v]) => `<option value="${k}" ${String(p.days || 6) === String(k) ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-diet">Cómo comes</label><select id="${ids}-diet">${Object.entries(C.diets).map(([k, v]) => `<option value="${k}" ${(p.diet || "omni") === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>`;
function readProfile(ids) {
  const g = i => $("#" + ids + "-" + i)?.value, sex = g("sex"), age = +g("age"), h = +g("h"), kg = parseFloat(g("kg"));
  if (!sex) return "Elige tu sexo";
  if (!(age >= 14 && age <= 90)) return "Escribe tu edad (14 a 90)";
  if (!(h >= 120 && h <= 220)) return "Escribe tu estatura en cm";
  if (!(kg >= 30 && kg <= 250)) return "Escribe tu peso en kg";
  return { name: cleanName(g("name") || ""), sex, age, h, kg, level: g("lv"), goal: g("goal"), pct: +g("pct"), days: +g("days"), diet: g("diet"), adj: S.profile?.adj || 0, equip: S.profile?.equip };
}
const ONB = () => ({ step: 0, d: { name: "", goal: null, sex: null, age: "", h: "", kg: "", level: null, days: null, mode: "gym", bench: "si", dbMax: 20, bar: "no", pull: "no", dips: "no", diet: "omni", pct: null, weekend: "sab", date: todayISO() } });
let onb = ONB();
const ONB_STEPS = 5;
function radioRows(name, options, cur) {
  return `<div class="group" role="radiogroup">${options.map(([v, t, m]) => `<button class="row top" role="radio" aria-checked="${String(cur) === String(v)}" data-choice="${name}|${v}"><span class="opt-radio ${String(cur) === String(v) ? "on" : ""}"></span><div class="main"><div class="title">${esc(t)}</div>${m ? `<div class="meta">${esc(m)}</div>` : ""}</div></button>`).join("")}</div>`;
}
const segRow = (name, options, cur) => `<div class="seg" role="group" style="--n:${options.length};--i:${Math.max(0, options.findIndex(([v]) => String(v) === String(cur)))}">${options.map(([v, t]) => `<button data-choice="${name}|${v}" aria-pressed="${String(cur) === String(v)}">${esc(t)}</button>`).join("")}</div>`;
function onbValid(step, d) {
  if (step === 0 && !d.goal) return "Elige lo que quieres lograr";
  if (step === 1) { if (!d.sex) return "Elige tu sexo"; if (!(+d.age >= 14 && +d.age <= 90)) return "Escribe tu edad (14 a 90)"; if (!(+d.h >= 120 && +d.h <= 220)) return "Escribe tu estatura en cm"; if (!(parseFloat(d.kg) >= 30 && parseFloat(d.kg) <= 250)) return "Escribe tu peso en kg"; }
  if (step === 2) { if (!d.level) return "Elige tu experiencia"; if (!d.days) return "Elige cuántos días puedes entrenar"; }
  return "";
}
function withDraft(fn) { const prev = S.profile, pw = S.weights, pwe = S.weekend, pm = S.mode; const d = onb.d; S.profile = { name: cleanName(d.name), sex: d.sex, age: +d.age, h: +d.h, kg: parseFloat(d.kg), level: d.level, goal: d.goal, pct: d.pct ?? C.goals[d.goal].pace, days: +d.days, diet: d.diet, adj: 0, equip: { bench: d.bench !== "no", bar: d.bar === "si", dbMax: +d.dbMax, pull: d.pull === "si", dips: d.dips === "si" } }; S.weights = {}; S.weekend = d.weekend; S.mode = d.mode; _plan = { k: "", v: null }; try { return fn(); } finally { S.profile = prev; S.weights = pw; S.weekend = pwe; S.mode = pm; _plan = { k: "", v: null }; } }
function vSetup() {
  const { step, d } = onb;
  const heads = ["¿Qué quieres lograr?", "Sobre ti", "Tu entrenamiento", "Tu comida y tu ritmo", "Tu plan"];
  const subs = ["Tu plan se adapta a esto.", "Para calcular tus calorías. Se queda en tu teléfono.", "Para armar tu semana.", "Porciones y ritmo.", "Tu plan está listo."];
  let body = "";
  if (step === 0) body = radioRows("goal", Object.entries(C.goals).map(([k, g]) => [k, g.name, g.desc]), d.goal);
  if (step === 1) body = `<h2 class="sec">Sexo (para estimar tus calorías)</h2>${segRow("sex", [["m", "Hombre"], ["f", "Mujer"]], d.sex)}
    <h2 class="sec">Tu nombre</h2><div class="group"><div class="field"><label for="ob-name">Nombre (opcional)</label><input id="ob-name" type="text" maxlength="30" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="Cómo te llamas" value="${esc(d.name || "")}"></div></div>
    <h2 class="sec">Tus medidas</h2><div class="group">
    <div class="field"><label for="ob-age">Edad (años)</label><input id="ob-age" type="number" inputmode="numeric" min="14" max="90" placeholder="Edad" value="${esc(d.age)}"></div>
    <div class="field"><label for="ob-h">Estatura (cm)</label><input id="ob-h" type="number" inputmode="numeric" min="120" max="220" placeholder="Estatura" value="${esc(d.h)}"></div>
    <div class="field"><label for="ob-kg">Peso actual (kg)</label><input id="ob-kg" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="Peso" value="${esc(d.kg)}"></div></div>`;
  if (step === 2) body = `<h2 class="sec">Tu experiencia con pesas</h2>${radioRows("level", Object.entries(C.levels).map(([k, v]) => [k, v.name, v.sub]), d.level)}
    <h2 class="sec">Días de pesas por semana</h2>${radioRows("days", C.daysOptions, d.days)}
    <h2 class="sec">¿Dónde entrenas?</h2>${radioRows("mode", [["gym", "Gimnasio", "Máquinas, poleas, barras y mancuernas"], ["db", "En casa con mancuernas", "Tus mancuernas, con o sin banca"], ["home", "En casa, sin equipo", "Solo tu cuerpo, una mesa o silla y una mochila"]], d.mode)}
    ${d.mode === "db" ? `<h2 class="sec">Tus mancuernas pesan hasta…</h2>${radioRows("dbMax", [[10, "10 kg cada una o menos"], [20, "Hasta 20 kg cada una"], [30, "Hasta 30 kg cada una"], [40, "40 kg o más cada una"]], d.dbMax)}<h2 class="sec">¿Tienes banca?</h2>${segRow("bench", [["si", "Sí"], ["no", "No"]], d.bench)}` : ""}
    ${d.mode === "gym" ? `<h2 class="sec">Peso corporal</h2><div class="group"><div class="field"><label>¿Puedes hacer 5 o más dominadas?</label>${segRow("pull", [["si", "Sí"], ["no", "No"]], d.pull)}</div><div class="field"><label>¿Y 5 o más fondos en paralelas?</label>${segRow("dips", [["si", "Sí"], ["no", "No"]], d.dips)}</div></div><p class="note">Si es que sí, entran en tu plan en lugar del jalón y el pushdown. Si no, quedan como alternativas (y hay máquina asistida).</p>` : ""}
    ${d.mode !== "gym" ? `<h2 class="sec">¿Tienes barra de dominadas?</h2>${segRow("bar", [["si", "Sí"], ["no", "No"]], d.bar)}` : ""}`;
  if (step === 3) { const g = C.goals[d.goal]; body = `<h2 class="sec">Cómo comes</h2>${radioRows("diet", Object.entries(C.diets), d.diet)}
    <h2 class="sec">Ritmo</h2>${radioRows("pct", g.paces, d.pct ?? g.pace)}
    ${+d.days === 6 ? `<h2 class="sec">Tu día de pesas del fin de semana</h2>${segRow("weekend", [["sab", "Sábado"], ["dom", "Domingo"]], d.weekend)}` : ""}
    <h2 class="sec">Día 1</h2><div class="group"><div class="field"><label for="ob-date">Empiezas el</label><input id="ob-date" type="date" value="${esc(d.date)}"></div></div>`; }
  if (step === 4) body = withDraft(() => {
    const c = planCalc(), ss = SESSIONS(), g = C.goals[d.goal];
    return `<div class="group">
      <div class="row top"><div class="main"><div class="title">Objetivo</div><div class="meta">${esc(g.name)} · ${esc(C.levels[d.level].name.toLowerCase())}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Calorías</div><div class="meta">${num(c.train.kcal)} kcal en día de entreno · ${num(c.rest.kcal)} en descanso</div></div></div>
      <div class="row top"><div class="main"><div class="title">Proteína, carbohidratos y grasas</div><div class="meta">${c.train.p} g · ${c.train.c} g · ${c.train.g} g en día de entreno</div></div></div>
      <div class="row top"><div class="main"><div class="title">Tu semana</div><div class="meta">${ss.map(x => `${x.day} ${x.name}`).join(" · ")}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Equipo</div><div class="meta">${d.mode === "gym" ? `Gimnasio completo${d.pull === "si" ? " · con dominadas" : ""}${d.dips === "si" ? " · con fondos" : ""}` : d.mode === "db" ? `Mancuernas hasta ${d.dbMax} kg · banca: ${d.bench === "no" ? "no" : "sí"} · barra de dominadas: ${d.bar === "si" ? "sí" : "no"}` : `Sin equipo · barra de dominadas: ${d.bar === "si" ? "sí" : "no"}`}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Cardio</div><div class="meta">${d.goal === "muscle" ? "Poco: solo para tu salud y recuperación" : d.mode === "gym" ? "Zona 2 en caminadora o elíptica al final de las pesas" : "Zona 2: caminata rápida, trote suave o bici al final de las pesas"}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Ritmo esperado</div><div class="meta">${d.goal === "muscle" ? "Subir" : "Bajar"} ≈ ${c.rate} por semana</div></div></div>
    </div>${c.floorHit ? `<p class="note"><strong>Aviso:</strong> tu meta quedaría por debajo de un mínimo razonable, así que se subió. Con un peso bajo conviene un ritmo suave.</p>` : ""}
    <p class="note">Son estimaciones; no sustituyen a un médico o nutriólogo.</p>`; });
  const last = step === ONB_STEPS - 1;
  return `${step ? `<div class="navbar" id="navbar"><button class="nb-btn" data-onb="back" aria-label="Paso anterior">${I.back}<span>Atrás</span></button><span class="nb-title" aria-hidden="true">${heads[step]}</span></div>` : `<div class="navbar" id="navbar"></div>`}
  <div class="dots" role="progressbar" aria-label="Paso ${step + 1} de ${ONB_STEPS}" aria-valuenow="${step + 1}" aria-valuemin="1" aria-valuemax="${ONB_STEPS}">${Array.from({ length: ONB_STEPS }, (_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>
  <h1 class="large" id="lt">${heads[step]}</h1><p class="sub">${subs[step]}</p>
  ${body}
  ${cta(`<button class="btn" data-onb="${last ? "start" : "next"}">${last ? "Empezar mi plan" : "Continuar"}</button>`)}`;
}

function mealRows(iso, showHint) {
  const e = eatenOn(iso), nxt = nextMealSlot(iso), all = MEALS();
  return mealsToday(iso).map(m => {
    const o = pick(m), on = !!e[m.slot], idx = all.indexOf(m);
    return `<div class="row"><button class="hit" role="checkbox" aria-checked="${on}" aria-label="Marcar ${esc(m.slot)} como comida" data-eat="${esc(m.slot)}"><span class="circle ${on ? "on" : ""}">${I.check}</span></button>
      <button class="main" style="background:none;border:0;text-align:left;padding:0;color:inherit;cursor:pointer;min-height:44px" data-go="#/comida/slot/${idx}"><div class="title">${esc(m.slot)} <span class="pill">${m.time}</span>${showHint && nxt === m.slot ? ' <span class="badge">Sigue</span>' : ""}</div><div class="meta">${esc(o.name)} · ${o.m.kcal} kcal · P ${o.m.p} g</div></button></div>`;
  }).join("");
}
function intake(iso) {
  const t = eatenTotals(iso), T = targetFor(iso);
  return `<div class="row"><div class="mini"><span class="l">Calorías</span><span class="r">${t.kcal.toLocaleString("es-MX")} / ${T.kcal.toLocaleString("es-MX")}</span><div class="bar ${t.kcal >= T.kcal * .9 ? "good" : ""}" role="progressbar" aria-valuenow="${t.kcal}" aria-valuemax="${T.kcal}" aria-label="Calorías"><i style="--p:${(Math.min(100, t.kcal / T.kcal * 100))/100}"></i></div>
    <span class="l">Proteína</span><span class="r">${t.p} / ${T.p} g</span><div class="bar ${t.p >= T.p * .9 ? "good" : ""}" role="progressbar" aria-valuenow="${t.p}" aria-valuemax="${T.p}" aria-label="Proteína"><i style="--p:${(Math.min(100, t.p / T.p * 100))/100}"></i></div></div></div>`;
}

function vToday() {
  const iso = todayISO(), n = dayNum(iso), wk = weekNum(iso), ph = phaseOf(wk), ses = sessionFor(iso), ck = S.checks[iso] || {};
  const pct = Math.min(100, Math.max(0, n / 90 * 100));
  let sesBlock;
  if (ses) {
    const pr = sessionProgress(ses), done = sessionDoneOn(iso, ses.id), started = pr.done > 0;
    sesBlock = `<h2 class="sec">Entrenamiento</h2><div class="group"><button class="row" data-go="#/entreno/${ses.id}"><div class="main"><div class="title" style="font-size:20px;font-weight:600">${esc(ses.name)}</div><div class="meta">${esc(ses.focus)}</div><div class="meta">${blocksOf(ses).length} bloques · ${totalRounds(ses)} vueltas · ${sessMin(ses)} min</div></div>${done ? '<span class="badge good">Hecho</span>' : started ? `<span class="badge">${pr.done}/${pr.total}</span>` : ""}${I.chev}</button></div>`;
  } else sesBlock = `<h2 class="sec">Entrenamiento</h2><div class="group"><div class="row"><div class="main"><div class="title">Descanso activo</div><div class="meta">Camina 45 minutos y estira. Hoy no hay pesas.</div></div></div></div>`;
  const w = S.weights[iso], delta = weekDelta(), steps = ck.steps || 0, water = ck.water || 0;
  return `<div class="navbar" id="navbar"><span class="nb-title" aria-hidden="true">Hoy</span><button class="nb-btn gear" data-go="#/plan" aria-label="Ajustes">${I.gear}</button></div><h1 class="large" id="lt">${n < 1 ? "Hoy" : n > 90 ? "Reto completo" : "Día " + n}</h1>
    <p class="sub" style="margin-bottom:8px">${S.profile.name ? "Hola, " + esc(S.profile.name) + " · " : ""}${longDate(iso)}${n >= 1 ? ` · Semana ${wk}` : ""}</p>
    <div class="bar" role="progressbar" aria-label="Avance del reto" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="--p:${(pct)/100}"></i></div>
    ${storageWarn()}
    ${weekStrip(iso)}
    ${stats3()}
    ${nowCard(iso)}
    <h2 class="sec">Resumen del día</h2><div class="group">${ringsHtml(iso)}</div>
    ${sesBlock}
    <h2 class="sec">Comidas</h2>
    <div class="group">${mealRows(iso, true)}${intake(iso)}</div>
    <h2 class="sec">Hábitos</h2>
    <div class="group">
      <div class="row"><div class="main"><div class="title">Agua</div><div class="meta">Meta 2.5–3 L</div></div><div class="stepper"><button data-water="-500" aria-label="Quitar 500 mililitros">−</button><span class="v">${fmt(water / 1000, 1)} L</span><button data-water="500" aria-label="Sumar 500 mililitros">+</button></div></div>
      <div class="row"><div class="main"><div class="title">Pasos</div><div class="meta">Meta ${ph.steps.toLocaleString("es-MX")}</div></div><input class="inline-num" id="steps" type="number" inputmode="numeric" placeholder="0" value="${steps || ""}" aria-label="Pasos de hoy"></div>
      ${C.dailyChecks.map(c => `<div class="row check-row"><label for="ck-${c.id}">${esc(c.label)}</label><input class="switch" id="ck-${c.id}" type="checkbox" data-check="${c.id}" ${ck[c.id] ? "checked" : ""}></div>`).join("")}
    </div>
    <h2 class="sec">Peso en ayunas</h2>
    <div class="group"><div class="input-line"><input id="w-today" type="number" inputmode="decimal" step="0.1" placeholder="kg" aria-label="Peso de hoy en kilogramos" value="${w || ""}"><button class="btn" data-act="saveweight">Guardar</button></div>
      ${delta !== null ? `<div class="row"><div class="main"><div class="title">Tendencia de 7 días</div><div class="meta">${trendText(delta)}</div></div></div>` : ""}</div>
    ${backupDue() ? `<h2 class="sec">Tus datos</h2><div class="group"><button class="row" data-go="#/progreso/datos"><div class="main"><div class="title">Haz una copia de tus datos</div><div class="meta">${S.lastExport ? "Tu última copia fue el " + shortDate(S.lastExport) : "Aún no has exportado una copia"}. Así no pierdes tu progreso si cambias de teléfono.</div></div>${I.chev}</button></div>` : ""}
    ${new Date().getDay() === 0 ? `<h2 class="sec">Esta semana</h2><div class="group"><button class="row" data-go="#/progreso/revision"><div class="main"><div class="title">Revisión semanal</div><div class="meta">Cinco preguntas y el ajuste recomendado</div></div>${I.chev}</button></div>` : ""}`;
}
const backupDue = () => dayNum() >= 7 && (Object.keys(S.weights).length >= 3 || totalSessions() >= 3) && (!S.lastExport || diffDays(todayISO(), S.lastExport) >= 14);
function nextAction(iso) {
  const h = new Date().getHours(), ses = sessionFor(iso), ck = S.checks[iso] || {}, nxt = nextMealSlot(iso), done = ses && sessionDoneOn(iso, ses.id), all = MEALS();
  if (!S.weights[iso] && h < 12) return { t: "Registra tu peso en ayunas", m: "Diez segundos que mejoran tu tendencia", go: "#/progreso/peso" };
  if (ses && !done && h >= 15) return { t: `Es hora de entrenar: ${ses.name}`, m: `${blocksOf(ses).length} bloques · ${sessMin(ses)} min`, go: `#/entreno/${ses.id}` };
  if (nxt) { const m = all.find(x => x.slot === nxt); return { t: `Sigue: ${nxt} (${m.time})`, m: pick(m).name, go: `#/comida/slot/${all.indexOf(m)}` }; }
  if (ses && !done) return { t: `Hoy toca: ${ses.name}`, m: `${blocksOf(ses).length} bloques · ${sessMin(ses)} min`, go: `#/entreno/${ses.id}` };
  if ((ck.water || 0) < 2500) return { t: "Toma agua", m: `Llevas ${fmt((ck.water || 0) / 1000, 1)} L de 2.5–3 L`, go: "" };
  return null;
}
function nowCard(iso) {
  const a = nextAction(iso);
  return a ? `<button class="nowcard" ${a.go ? `data-go="${a.go}"` : "data-noop"}><div><small>Ahora</small><b>${esc(a.t)}</b><span>${esc(a.m)}</span></div>${a.go ? I.chev : ""}</button>` : `<div class="nowcard done" role="status"><div><small>Ahora</small><b>Día completo</b><span>Lo que hiciste hoy cuenta. Descansa y mañana seguimos.</span></div></div>`;
}
let installEv = null, shareW = "si";
const isStandalone = () => { try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) { return false; } };
const inApp = () => /FBAN|FBAV|Instagram|Line\/|WhatsApp|MicroMessenger|; wv\)|Snapchat|TikTok/i.test(navigator.userAgent);
function installCard() {
  const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/i.test(ua), and = /Android/i.test(ua);
  let t, m, btn = "";
  if (isStandalone()) { t = "App instalada"; m = "Ya la usas como app. Tus datos se guardan en este teléfono."; }
  else if (inApp()) { t = "Ábrela en tu navegador"; m = (and ? "Estás dentro de otra app (WhatsApp, Facebook, Instagram…). Toca ⋮ o “Abrir en el navegador” y elige Chrome; ahí sí podrás instalarla y guardar tus datos." : "Estás dentro de otra app. Toca “Abrir en Safari” y desde ahí añádela a tu pantalla de inicio."); }
  else if (installEv) { t = "Instalar en tu teléfono"; m = "Se abre a pantalla completa, funciona sin internet y guarda tus datos."; btn = `<button class="btn" data-act="install">Instalar app</button>`; }
  else if (ios) { t = "Instalar en tu iPhone"; m = "En Safari toca Compartir ⬆︎ y elige “Añadir a pantalla de inicio”."; }
  else if (and) { t = "Instalar en tu Android"; m = "En Chrome toca ⋮ (arriba a la derecha) y elige “Instalar app” o “Añadir a pantalla de inicio”. Si no aparece, recarga la página una vez."; }
  else { t = "Instalar"; m = "En Chrome o Edge usa el icono de instalar en la barra de direcciones."; }
  return `<div class="group"><div class="row top"><div class="main"><div class="title">${t}</div><div class="meta">${m}</div></div></div>${btn ? `<div class="btn-wrap">${btn}</div>` : ""}</div>`;
}
const storageWarn = () => LS.persistent ? "" : `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="title" style="color:var(--bad)">Este navegador no guarda tus datos</div><div class="meta">Lo que registres se perderá al cerrar. Abre la app en Chrome o Safari (no dentro de WhatsApp, Instagram o Facebook) y, si puedes, instálala. Mientras tanto exporta una copia en Progreso → Mis datos.</div></div></div></div>`;
function tipHoy() {
  if (S.tips && S.tips.hoy) return "";
  return `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="title">Así se usa</div><div class="meta">Toca el círculo para marcar una comida. Toca su nombre para cambiar de opción. Tu entreno está justo debajo: ahí registras cada vuelta.</div></div><button class="btn small quiet" data-act="tiphoy">Entendido</button></div></div>`;
}
function ringsHtml(iso) {
  const t = eatenTotals(iso), T = targetFor(iso), water = (S.checks[iso] || {}).water || 0;
  const items = [["var(--accent)", 52, t.kcal / T.kcal, "Calorías", `${num(t.kcal)} / ${num(T.kcal)}`], ["var(--tri)", 40, t.p / T.p, "Proteína", `${t.p} / ${T.p} g`], ["var(--water)", 28, water / 2800, "Agua", `${fmt(water / 1000, 1)} / 2.8 L`]];
  return `<div class="rings-row"><svg class="rings" viewBox="0 0 120 120" role="img" aria-label="Anillos del día: calorías ${Math.round(items[0][2] * 100)} %, proteína ${Math.round(items[1][2] * 100)} %, agua ${Math.round(items[2][2] * 100)} %">${items.map(([col, r, v]) => { const c = +(2 * Math.PI * r).toFixed(1), off = +(c * (1 - Math.min(1, Math.max(0, v)))).toFixed(1); return `<circle class="ring-bg" cx="60" cy="60" r="${r}"/><circle class="ring-fg" cx="60" cy="60" r="${r}" stroke="${col}" style="--c:${c};stroke-dasharray:${c};stroke-dashoffset:${off}"/>`; }).join("")}</svg>
  <div class="ring-legend">${items.map(([col, , , l, v]) => `<div><i style="background:${col}"></i>${l}<b>${v}</b></div>`).join("")}</div></div>`;
}
function stats3() {
  const st = streak(), n = SESSIONS().filter(s => sessionDoneThisWeek(s.id)).length, d = weekDelta();
  return `<div class="stats3"><div><b>${st}</b><span>${st === 1 ? "día de racha" : "días de racha"}</span></div><div><b>${n}/${SESSIONS().length}</b><span>entrenos</span></div><div><b>${d === null ? "—" : (d > 0 ? "+" : d < 0 ? "−" : "") + fmt(Math.abs(d), 1)}</b><span>kg en 7 días</span></div></div>`;
}
function weekStrip(iso) {
  const names = ["L", "M", "X", "J", "V", "S", "D"];
  return `<div class="weekstrip" role="list" aria-label="Semana">${weekDates(iso).map((d, i) => {
    const ses = sessionFor(d), done = ses && sessionDoneOn(d, ses.id), today = d === iso, label = `${longDate(d)}${ses ? ": " + ses.name : ": descanso"}${done ? ", hecho" : ""}`;
    return `<button role="listitem" class="wd ${today ? "today" : ""} ${done ? "done" : ""} ${ses ? "" : "off"}" data-go="${ses ? "#/entreno/" + ses.id : "#/entreno"}" aria-label="${esc(label)}"><span>${names[i]}</span><i>${done ? I.check : new Date(d + "T12:00:00").getDate()}</i></button>`;
  }).join("")}</div>`;
}
function trendText(d) {
  const a = Math.abs(d);
  if (d <= -0.8) return `<span class="trend warn">↓ ${fmt(a, 2)} kg · baja rápido</span>`;
  if (d <= -0.25) return `<span class="trend good">↓ ${fmt(a, 2)} kg · en rango</span>`;
  if (d < 0.2) return `<span class="trend flat">→ ${fmt(d, 2)} kg · estable</span>`;
  return `<span class="trend warn">↑ ${fmt(d, 2)} kg · sube</span>`;
}

/* Entreno */
function vTrain() {
  const iso = todayISO(), todayId = sessionFor(iso)?.id, doneN = SESSIONS().filter(s => sessionDoneThisWeek(s.id)).length;
  return `${nav("Entreno", { sub: `${doneN} de ${SESSIONS().length} sesiones esta semana`, gear: true })}
  ${modeSeg()}
  <div class="group">${SESSIONS().map(s => {
    const done = sessionDoneThisWeek(s.id), isT = s.id === todayId;
    return `<button class="row" data-go="#/entreno/${s.id}"><span class="daycol">${s.day}</span><div class="main"><div class="title">${esc(s.name)}</div><div class="meta">${esc(s.focus)}</div></div>${done ? '<span class="badge good">Hecho</span>' : isT ? '<span class="badge">Hoy</span>' : ""}${I.chev}</button>`;
  }).join("")}</div>
  <div class="group"><button class="row" data-go="#/entreno/guias"><div class="main"><div class="title">Guías</div></div>${I.chev}</button></div>`;
}
function vGuides() {
  const rows = [["guia", "Cómo leer el entrenamiento"], ["abdomen", "Marcar el abdomen"], ["cardio", "Cardio"], ["limitadas", "Mancuernas limitadas"], ["porque", "Por qué este plan"]];
  return `${nav("Guías", { back: "Entreno" })}<div class="group">${rows.map(([k, t]) => `<button class="row" data-go="#/entreno/${k}"><div class="main"><div class="title">${t}</div></div>${I.chev}</button>`).join("")}</div>`;
}
function vGuide() { return `${nav("Cómo leer el entrenamiento", { back: "Entreno" })}<h2 class="sec">Uniserie, biserie y triserie</h2><div class="group"><div class="prose">${C.blocksGuide}</div></div><h2 class="sec">Pesos sugeridos</h2><div class="group"><div class="prose">${C.weightsGuide}</div></div>`; }
function vAbs() { return `${nav("Marcar el abdomen", { back: "Entreno" })}<div class="group"><div class="prose">${C.absGuide}</div></div>`; }

function vSession(id) {
  const s = SESSIONS().find(x => x.id === id); if (!s) return vTrain();
  const iso = todayISO(), bl = blocksOf(s), pr = sessionProgress(s), done = sessionDoneOn(iso, id);
  const first = bl.findIndex(b => blockProgress(b) < b.rounds);
  const noHist = Object.keys(S.hist).length === 0 && S.mode !== "home";
  const todays = sessionFor(iso);
  const otherDay = "";
  const intro = "";
  return `${nav(s.name, { back: "Entreno", sub: `${esc(s.focus)} · ${sessMin(s)} min` })}
  ${modeSeg()}
  ${otherDay}${intro}<h2 class="sec">${bl.length} bloques · ${pr.done} de ${pr.total} vueltas</h2>
  ${bl.map((b, bi) => {
    const p = blockProgress(b), cd = b.t === "cardio";
    return `<a class="blk" href="#/bloque/${id}/${bi}" aria-label="Bloque ${bi + 1}: ${typeLabel(b.t)}"><div class="blk-head"><span class="chip ${b.t}">${bi + 1} · ${typeLabel(b.t)}</span><span class="info">${cd ? cardioMin(b) + " min · zona 2" : b.rounds + " vueltas · " + fmtRest(b.rest)}</span><span class="prog ${p === b.rounds ? "done" : ""}">${p === b.rounds ? "Hecho" : cd ? "" : p + "/" + b.rounds}</span></div>
      ${cd ? `<div class="row"><img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${cardioKind().gif}.gif" width="56" height="56"><div class="main"><div class="title">${esc(S.mode !== "gym" ? "Caminata rápida, trote suave o bici" : "Caminadora o elíptica")}</div><div class="meta">${esc(b.note || "Ritmo en el que puedes hablar frases cortas")}</div></div></div>` : b.items.map((it, ii) => { const ex = D.EX[it.k], sg = suggest(it); return `<div class="row">${b.items.length > 1 ? `<span class="letter">${letters[ii]}</span>` : ""}<img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${ex.id}.gif" width="56" height="56"><div class="main"><div class="title">${esc(ex.name)}</div><div class="meta">${esc(repsLabel(it.reps))} · ${esc(sg.text)}</div></div></div>`; }).join("")}</a><div class="blk-gap"></div>`;
  }).join("")}
  ${cta(first >= 0 ? `<button class="btn" data-go="#/bloque/${id}/${first}">${pr.done ? "Continuar" : "Empezar"} · bloque ${first + 1}</button>` : `<button class="btn ${done ? "secondary" : ""}" data-act="finish" data-id="${id}">${done ? "Entrenamiento completado" : "Terminar entrenamiento"}</button>`)}`;
}

function warmup(b, bi) {
  const it = b.items[0], sg = it && suggest(it);
  if (bi !== 0 || S.mode === "home" || !sg || !sg.n) return "";
  const w = x => { const v = sg.n * x, r = it.w.u === "c/mano" ? Math.round(v) : Math.round(v / 2.5) * 2.5; return fmt(Math.max(r, 2), r % 1 ? 1 : 0); };
  return `<h2 class="sec">Calentamiento</h2><div class="group"><div class="row top"><div class="main"><div class="title">${S.mode === "gym" ? "5 min de caminadora o bici" : "5 min de movimiento suave (caminata, saltos ligeros o bici)"} y 3 series de aproximación</div><div class="meta">${w(0.5)} kg × 8 · ${w(0.7)} kg × 5 · ${w(0.85)} kg × 2 (${esc(D.EX[it.k].name)}). Sin llegar al cansancio.</div></div></div></div>`;
}
function vBlock(id, bi) {
  const s = SESSIONS().find(x => x.id === id), b = s && blocksOf(s)[bi]; if (!b) return vTrain();
  if (b.t === "cardio") return vCardio(s, b, bi);
  const bl = blocksOf(s), next = bi + 1 < bl.length;
  const strip = `<div class="strip" role="list">${b.items.map((it, ii) => { const ex = D.EX[it.k], sg = suggest(it), swapped = !!(S.swaps || {})[`${id}|${S.mode}|${bi}|${ii}`]; return `<div role="listitem" class="si"><a href="#/ej/${it.k}/${id}-${bi}-${ii}" aria-label="Ver técnica de ${esc(ex.name)}"><div class="gif"><img src="gifs/${ex.id}.gif" alt="Demostración de ${esc(ex.name)}" width="320" height="213"></div><div class="cap">${b.items.length > 1 ? letters[ii] + " · " : ""}${esc(ex.name)}${swapped ? ' <span class="badge">Cambiado</span>' : ""}<small>${esc(repsLabel(it.reps))} · ${esc(sg.text)}</small></div></a><button class="link" data-swap="${id}|${bi}|${ii}">Cambiar ejercicio</button></div>`; }).join("")}</div>`;
  const rounds = [];
  const active = Array.from({ length: b.rounds }, (_, r) => r).find(r => !b.items.every(it => roundDone(it, r)));
  for (let r = 0; r < b.rounds; r++) {
    const on = b.items.every(it => roundDone(it, r));
    rounds.push(`<div class="round ${on ? "done" : ""} ${r === active ? "active" : ""}" data-round="${r}"><div class="round-head"><b>Vuelta ${r + 1}</b><button class="tick" data-tick="${r}" aria-pressed="${on}" aria-label="Vuelta ${r + 1} terminada">${I.check}</button></div>
      <div class="entry-head"><span></span><span>Ejercicio</span><span>${S.mode === "home" ? "Extra kg" : "Kg"}</span><span>Reps</span></div>
      ${b.items.map((it, ii) => { const sg = suggest(it), cur = getSets(it.k)[r] || {}; return `<div class="entry"><span class="letter">${b.items.length > 1 ? letters[ii] : (ii + 1)}</span><span class="nm">${esc(D.EX[it.k].name)}<small>${esc(it.reps)}</small></span><input type="number" inputmode="decimal" step="0.5" min="0" data-i="${ii}" data-r="${r}" data-f="w" placeholder="${sg.n ?? (S.mode === "home" ? "—" : "pc")}" value="${cur.w ?? ""}" aria-label="${esc(D.EX[it.k].name)} vuelta ${r + 1}, kilos"><input type="number" inputmode="numeric" min="0" data-i="${ii}" data-r="${r}" data-f="r" placeholder="${lowReps(it.reps) ?? "reps"}" value="${cur.r ?? ""}" aria-label="${esc(D.EX[it.k].name)} vuelta ${r + 1}, repeticiones"></div>`; }).join("")}${r === active ? `<div style="padding:8px 16px 4px"><button class="btn" data-tick="${r}" aria-label="Terminar vuelta ${r + 1}">Vuelta ${r + 1} lista</button></div>` : ""}</div>`);
  }
  const p = blockProgress(b);
  const how = b.t === "uni" ? "Una serie, descansa, repite." : b.t === "bi" ? "Haz A, pasa directo a B y descansa al terminar la vuelta." : "Haz A, B y C seguidos y descansa al terminar la vuelta.";
  return `${nav(`Bloque ${bi + 1}`, { back: s.name, to: `#/entreno/${id}`, sub: `<span class="chip ${b.t}">${typeLabel(b.t)}</span> &nbsp;${b.rounds} vueltas · descanso ${fmtRest(b.rest)}<br><span style="font-size:14px">${how}</span>` })}
  ${strip}
  ${warmup(b, bi)}
  <h2 class="sec">Vueltas · ${p} de ${b.rounds}</h2>
  <div class="group">${rounds.join("")}</div>
  <input type="hidden" id="blk-ctx" value="${id}|${bi}">
  <div id="rest" role="timer" aria-live="off"><span class="lbl">Descanso</span><span class="t">0:00</span><button data-rest="add">+15 s</button><button data-rest="stop">Listo</button></div>
  ${cta(next ? `<button class="btn ${p === b.rounds ? "" : "quiet"}" data-go="#/bloque/${id}/${bi + 1}">Siguiente bloque</button>` : `<button class="btn ${p === b.rounds ? "" : "quiet"}" data-go="#/entreno/${id}">Terminar y ver resumen</button>`)}`;
}

function vCardio(s, b, bi) {
  const iso = todayISO(), k = cardioKind(), mins = cardioMin(b), rec = cardioRec(b, iso), done = !!rec?.done, ph = phaseOf(weekNum());
  const mix = b.kind === "mix" && weekNum() >= 5;
  const sessionHasNext = bi + 1 < blocksOf(s).length;
  return `${nav("Cardio", { back: s.name, to: `#/entreno/${s.id}`, sub: `${mins} min · zona 2 · ${esc(s.name)}` })}
  ${segHtml(cardioKinds().map(x => [x.id, x.name]), k.id, "ckind", "Tipo de cardio")}
  <div class="gif-wrap" style="margin-top:12px"><img src="gifs/${k.gif}.gif" alt="Demostración de ${esc(k.name)}" width="320" height="213"></div>
  <div class="group" style="margin-top:14px">
    <div class="row top"><div class="main"><div class="title">${esc(k.name)}</div><div class="meta">${esc(k.how)}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Ritmo</div><div class="meta">Puedes hablar frases cortas pero no cantar (6–7 de 10). Unos 115–135 latidos por minuto, orientativo.</div></div></div>
    <div class="row top"><div class="main"><div class="title">Calentamiento</div><div class="meta">Los primeros 3–5 minutos, más suave.</div></div></div>
    ${mix ? `<div class="row top"><div class="main"><div class="title">Opcional: intervalos</div><div class="meta">5 min suave, 8 rondas de 30 s fuerte (8 de 10) + 90 s suave, 5 min suave. Si tus piernas no se recuperan, vuelve a zona 2.</div></div></div>` : ""}
    ${b.note ? `<div class="row top"><div class="main"><div class="meta">${esc(b.note)}</div></div></div>` : ""}
  </div>
  <div class="btn-wrap"><button class="btn quiet" data-ctimer="${mins * 60}">Iniciar temporizador · ${mins}:00</button></div>
  <div id="rest" role="timer" aria-live="off"><span class="lbl">Cardio</span><span class="t">0:00</span><button data-rest="add">+15 s</button><button data-rest="stop">Parar</button></div>
  ${cta(`<button class="btn ${done ? "secondary" : ""}" data-cdone="${b.key}|${mins}|${s.id}">${done ? "Cardio completado" : "Marcar cardio hecho"}</button>`)}`;
}
function vWhy(kind) {
  const list = C.why[kind].filter(x => !x.only || x.only.includes(S.profile.goal || "recomp")), used = [];
  const src = id => C.sources.find(x => x.id === id);
  const vol = {}; SESSIONS().forEach(se => blocksOf(se).forEach(b => b.items.forEach(it => { const g = D.MUSCLE[it.k]; vol[g] = (vol[g] || 0) + b.rounds; })));
  const order = ["pecho", "espalda", "hombro", "hombro posterior", "bíceps", "tríceps", "cuádriceps", "femoral", "glúteo", "pantorrilla", "abdomen"];
  const volTable = kind === "train" ? `<h2 class="sec">Series directas por semana</h2><div class="group">${order.filter(m => vol[m]).map(m => `<div class="row"><div class="main"><div class="title">${esc(m.charAt(0).toUpperCase() + m.slice(1))}</div></div><span class="val" style="color:var(--label);font-weight:600">${vol[m]}</span></div>`).join("")}</div><p class="note">Cuenta solo las series que apuntan a ese músculo. Los press de pecho y hombro también trabajan el tríceps, y los jalones y remos trabajan el bíceps, así que su volumen real es mayor. El rango habitual para hipertrofia es 10–20.</p>` : "";
  return `${nav(kind === "train" ? "Por qué este plan" : "Por qué esta dieta", { back: kind === "train" ? "Entreno" : "Comida", to: kind === "train" ? "#/entreno" : "#/comida" })}
  ${volTable}
  <h2 class="sec">${kind === "train" ? "Decisiones" : "Cómo se calcula"}</h2>
  <div class="group">${list.map(x => { x.s.forEach(i => { if (!used.includes(i)) used.push(i); }); return `<div class="row top"><div class="main"><div class="title">${esc(fill(x.t))}</div><div class="meta">${esc(fill(x.d))}</div></div></div>`; }).join("")}</div>
  <h2 class="sec">Fuentes</h2>
  <div class="group">${used.map(i => src(i)).filter(Boolean).map(x => `${x.u ? `<a class="row top" href="${x.u}" target="_blank" rel="noopener">` : `<div class="row top">`}<div class="main"><div class="title" style="font-size:15px">${esc(x.t)}</div><div class="meta">${esc(x.why)} <span class="pill">${esc(x.v)}</span></div></div>${x.u ? I.chev + "</a>" : "</div>"}`).join("")}</div>
  <p class="note">“Resumen verificado”: leí el resumen del estudio. “Resumen secundario”: la cifra viene de un resumen de terceros; verifícala en el texto original. Las cifras son estimaciones, no recetas individuales.</p>`;
}
function vLimited() { return `${nav("Mancuernas limitadas", { back: "Entreno" })}<div class="group"><div class="prose">${C.limitedGuide}</div></div>`; }
function vCardioGuide() { return `${nav("Guía de cardio", { back: "Entreno" })}<div class="group"><div class="prose">${C.cardioGuide}</div></div>`; }

function vSwap(sid, bi, ii) {
  const s = SESSIONS().find(x => x.id === sid), b = s && blocksOf(s)[bi], it = b && b.items[ii]; if (!it) return vTrain();
  const key = `${sid}|${S.mode}|${bi}|${ii}`, cur = D.EX[it.k], alts = altsFor(s, bi, ii), swapped = !!(S.swaps || {})[key];
  return `${nav("Cambiar ejercicio", { back: `Bloque ${bi + 1}`, to: `#/bloque/${sid}/${bi}`, sub: `Ahora: <strong>${esc(cur.name)}</strong> · ${esc(cur.muscle)}` })}
  ${alts.length ? `<h2 class="sec">Alternativas con tu equipo</h2><div class="group">${alts.map(a => { const ex = D.EX[a.k]; return `<button class="row" data-swapto="${key}|${a.k}"><img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${ex.id}.gif" width="56" height="56"><div class="main"><div class="title">${esc(ex.name)}</div><div class="meta">${esc(ex.muscle)} · ${esc(a.fam)}</div></div>${I.chev}</button>`; }).join("")}</div>
  <p class="note">Mismo músculo y movimiento, con tu equipo.</p>` : `<div class="group"><div class="empty">No hay alternativas equivalentes con tu equipo para este ejercicio.</div></div>`}
  ${swapped ? `<h2 class="sec">Original</h2><div class="group"><button class="row" data-swapto="${key}|"><div class="main"><div class="title">Volver al ejercicio original</div></div></button></div>` : ""}`;
}
function vExercise(k, ctx) {
  const ex = D.EX[k]; if (!ex) return vTrain();
  const [sid, bi, ii] = (ctx || "").split("-"), s = SESSIONS().find(x => x.id === sid);
  const it = s ? blocksOf(s)[+bi]?.items[+ii] : null, sg = it ? suggest(it) : null;
  const hist = [...(S.hist[k] || [])].reverse().slice(0, 5);
  return `${nav(ex.name, { back: s ? `Bloque ${+bi + 1}` : "Entreno", sub: esc(ex.muscle) })}
  <div class="gif-wrap"><img src="gifs/${ex.id}.gif" alt="Demostración de ${esc(ex.name)}: posición inicial y final" width="320" height="213"></div>
  ${it ? `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="weight-line"><span class="kg">${esc(sg.text)}</span><span class="pill">${esc(repsLabel(it.reps))}</span></div><div class="meta">${esc(sg.src)}${it.note ? " " + esc(it.note) : ""}</div></div></div></div>` : ""}
  <h2 class="sec">Técnica</h2>
  <div class="group"><ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>
  <h2 class="sec">Tu historial</h2>
  ${hist.length ? `<div class="group">${hist.map(h => { const best = h.sets.filter(x => x.r).sort((a, b) => (b.w || 0) * 100 + b.r - ((a.w || 0) * 100 + a.r))[0]; return `<div class="row"><div class="main"><div class="title">${shortDate(h.d)}</div></div><span class="val">${h.sets.filter(x => x.done).length} vueltas · ${best ? (best.w ? best.w + " kg × " : "") + best.r : "—"}</span></div>`; }).join("")}</div>` : `<div class="group"><div class="empty">Aún sin registros. Se llenan al marcar las vueltas.</div></div>`}`;
}

/* Comida */
function vFood() {
  const iso = todayISO(), T = targetFor(iso);
  return `${nav("Comida", { sub: `Meta ≈ ${T.kcal.toLocaleString("es-MX")} kcal · proteína ${T.p} g`, gear: true })}
  <div class="group">${mealRows(iso, true)}${intake(iso)}</div>
  <div class="group">
    <button class="row" data-go="#/comida/menu"><div class="main"><div class="title">Menú de la semana</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/compras"><div class="main"><div class="title">Lista de compras</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/snacks"><div class="main"><div class="title">Snacks</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/guias"><div class="main"><div class="title">Guías</div></div>${I.chev}</button>
  </div>`;
}
function vFoodGuides() {
  const rows = [["#/comida/guia/semaforo", "Qué comer"], ["#/comida/guia/evitar", "Qué evitar"], ["#/comida/guia/cambios", "Cambios inteligentes"], ["#/comida/guia/ideas", "Ideas de comidas"], ["#/comida/guia/fuera", "Comer fuera"], ["#/comida/guia/etiquetas", "Etiquetas y porciones"], ["#/comida/guia/prep", "Meal prep y ahorro"], ["#/comida/guia/alt", "Alternativas"], ["#/comida/reglas", "Reglas, agua y suplementos"], ["#/comida/porque", "Por qué esta dieta"]];
  return `${nav("Guías", { back: "Comida", to: "#/comida" })}<div class="group">${rows.map(([h, t]) => `<button class="row" data-go="${h}"><div class="main"><div class="title">${t}</div></div>${I.chev}</button>`).join("")}</div>`;
}
function weekMenu() {
  const restIdx = S.weekend === "sab" ? 6 : 5, base = MEAL_BASE();
  return DAYN.map((dn, d) => {
    const rest = d === restIdx, meals = base.filter(m => !(rest && m.slot === "Pre-entreno")).map(m => { const si = base.indexOf(m); return { slot: m.slot, time: m.time, v: optView(m.opts[(d + si) % m.opts.length]) }; });
    const tot = meals.reduce((a, x) => ({ kcal: a.kcal + x.v.m.kcal, p: a.p + x.v.m.p, c: a.c + x.v.m.c, g: a.g + x.v.m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
    return { dn, rest, meals, tot };
  });
}
function shopData() {
  const T = isVeg() ? D.SHOP_VEG : D.SHOP, F = D.FOODS;
  const grp = [["Proteínas", ["pollo", "bistec", "tilapia", "atun", "huevo", "claras", "jamon", "panela", "yogurt", "requeson", "tofu", "soya", "lentejas", "garbanzo", "whey"]], ["Carbohidratos", ["arroz", "papa", "frijol", "avena", "tortilla", "pan", "tostada", "platano", "fresas"]], ["Grasas y verdura", ["aguacate", "aceite", "verdura"]]];
  const line = k => {
    const q = Math.ceil((T[k] || 0) * mealScale()); if (!q) return null;
    const f = F[k]; let txt;
    if (f.unit === "pza") txt = k === "tortilla" ? `${(q * 30 / 1000).toFixed(1)} kg (≈ ${q} tortillas)` : `${q} pzas`;
    else if (k === "atun") txt = `${Math.ceil(q / 140)} latas`;
    else txt = q >= 1000 ? `${(Math.ceil(q / 100) / 10).toFixed(1)} kg` : `${Math.ceil(q / 50) * 50} g`;
    if (k === "aceite") txt = "1 botella chica"; if (k === "whey") txt = "opcional (2 scoops)";
    return [f.name.charAt(0).toUpperCase() + f.name.slice(1), txt];
  };
  return grp.map(([t, ks]) => [t, ks.map(line).filter(Boolean)]);
}
const DAYN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function vMenu() {
  const restIdx = S.weekend === "sab" ? 6 : 5;
  return `${nav("Menú de la semana", { back: "Comida", sub: "Toca un día para usarlo hoy." })}
  <div class="group">${DAYN.map((dn, d) => {
    const rest = d === restIdx, names = MEAL_BASE().filter(m => !(rest && m.slot === "Pre-entreno")).map(m => { const si = MEAL_BASE().indexOf(m); return m.opts[(d + si) % m.opts.length].name; });
    return `<button class="row top" data-menu="${d}"><div class="main"><div class="title">${dn}${rest ? ' <span class="pill">descanso</span>' : ""}</div><div class="meta">${names.map(esc).join(" · ")}</div></div>${I.chev}</button>`;
  }).join("")}</div>
  <h2 class="sec">Guardar o imprimir</h2>
  <div class="group">
    <button class="row" data-go="#/imprimir"><div class="main"><div class="title">Versión para imprimir</div><div class="meta">Menú y compras ordenados; guárdalo como PDF</div></div>${I.chev}</button>
    <button class="row" data-act="csv"><div class="main"><div class="title">Descargar para Excel (CSV)</div><div class="meta">Tabla con comidas, ingredientes y macros</div></div></button>
  </div>`;
}
function vFoodGuide(id) {
  const g = C.foodGuide, T = { semaforo: "Qué comer", evitar: "Qué evitar", cambios: "Cambios inteligentes", ideas: "Ideas de comidas", fuera: "Comer fuera", etiquetas: "Etiquetas y porciones", prep: "Meal prep y ahorro", alt: "Alternativas" }[id];
  if (!T) return vFood();
  let body = "";
  if (id === "semaforo") body = g.semaforo.map(l => `<h2 class="sec"><span class="semdot ${l.lvl}" aria-hidden="true"></span>${esc(l.title)}</h2><div class="group">${l.groups.map(x => `<div class="row top"><div class="main"><div class="title" style="font-size:15px">${esc(x.g)}</div><ul class="ing" style="margin:4px 0 0">${x.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div></div>`).join("")}</div><p class="note">${esc(l.note)}</p>`).join("");
  if (id === "evitar") body = `<div class="group">${g.evitar.map(x => `<div class="row top"><div class="main"><div class="title">${esc(x.t)}</div><div class="meta">${esc(x.w)}</div><div class="meta" style="color:var(--good);margin-top:3px">Mejor: ${esc(x.s)}</div></div></div>`).join("")}</div>`;
  if (id === "cambios") body = `<div class="group">${g.swaps.map(([a, b]) => `<div class="row"><div class="main"><div class="meta" style="margin:0">En lugar de</div><div class="title">${esc(a)}</div></div><span class="val" aria-hidden="true">→</span><div class="main" style="text-align:right"><div class="meta" style="margin:0">Prueba</div><div class="title" style="color:var(--good)">${esc(b)}</div></div></div>`).join("")}</div>`;
  if (id === "ideas") body = g.ideas.map(x => `<h2 class="sec">${esc(x.t)}</h2><div class="group">${x.items.map(i => `<div class="row"><div class="main"><div class="title" style="font-weight:400">${esc(i)}</div></div></div>`).join("")}</div>`).join("") + `<p class="note">Son ideas sin cantidades: las porciones de tu plan están en la pestaña Comida. Mantén la proteína en cada comida.</p>`;
  if (id === "fuera") body = `<div class="group">${g.fuera.map(x => `<div class="row top"><div class="main"><div class="title">${esc(x.t)}</div><div class="meta">${esc(x.d)}</div></div></div>`).join("")}</div>`;
  if (id === "etiquetas") body = `<h2 class="sec">Cómo leer una etiqueta</h2><div class="group"><div class="prose">${g.etiquetas}</div></div><h2 class="sec">Porciones con la mano</h2><div class="group"><div class="prose">${g.manos}</div></div>`;
  if (id === "prep") body = `<div class="group"><div class="prose">${g.prep}</div></div>`;
  if (id === "alt") body = `<div class="group"><div class="prose">${g.alt}</div></div>`;
  return `${nav(T, { back: "Comida", to: "#/comida" })}${body}`;
}
function vSlot(i) {
  const m = MEALS()[+i]; if (!m) return vFood();
  const sel = S.picks[m.slot] ?? 0;
  const tail = m.slot === "Pre-entreno" ? "Entre 60 y 90 minutos antes de entrenar, bajo en grasa para digerir bien." : m.slot.startsWith("Cena") ? "Después de entrenar. Si entrenas el fin de semana por la mañana, la comida fuerte hace de post-entreno." : m.slot === "Snack" ? "Úsalo a media tarde o noche si te falta proteína o tienes hambre." : "";
  return `${nav(m.slot, { back: "Comida", sub: m.time })}
  <div class="group" role="radiogroup" aria-label="Opciones de ${esc(m.slot)}">${m.opts.map(optView).map((o, j) => `<button class="row top" data-pick="${j}" data-slot="${esc(m.slot)}" role="radio" aria-checked="${j === sel}"><span class="opt-radio ${j === sel ? "on" : ""}"></span><div class="main"><div class="title">${esc(o.name)}</div><div class="meta">${o.m.kcal} kcal · P ${o.m.p} · C ${o.m.c} · G ${o.m.g}</div><ul class="ing">${o.items.map(t => `<li>${esc(t)}</li>`).join("")}</ul>${o.tip ? `<div class="meta" style="margin-top:6px">${esc(o.tip)}</div>` : ""}</div></button>`).join("")}</div>`;
}
function vSnacks() {
  return `${nav("Snacks", { back: "Comida", sub: "Con proteína" })}
  <div class="group">${(isVeg() ? D.SNACKS_VEG : D.SNACKS).map(optView).map(o => `<div class="row top"><div class="main"><div class="title">${esc(o.name)}</div><div class="meta">${o.m.kcal} kcal · P ${o.m.p} g · C ${o.m.c} g · G ${o.m.g} g</div><ul class="ing">${o.items.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div></div>`).join("")}</div>`;
}
function vFoodRules() {
  return `${nav("Reglas", { back: "Comida" })}
  <h2 class="sec">En la cocina</h2><div class="group"><div class="prose">${C.foodRules}</div></div>
  <h2 class="sec">Hidratación</h2><div class="group"><div class="prose">${C.hydrationTips}</div></div>
  <h2 class="sec">Suplementos</h2><div class="group"><div class="prose">${C.supplements}</div></div>`;
}
function vPrint() {
  const c = planCalc(), wm = weekMenu(), who = S.profile.name ? esc(S.profile.name) : "", g = C.goals[S.profile.goal || "recomp"];
  const hoy = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  const stat = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
  const days = wm.map((d, i) => `<section class="pd-day${d.rest ? " rest" : ""}"><h3><em>${i + 1}</em>${d.dn}${d.rest ? "<small>Descanso</small>" : "<small>Entreno</small>"}</h3>
    <table><thead><tr><th>Comida</th><th>Platillo</th><th>Ingredientes</th><th class="n">kcal</th><th class="n">P</th><th class="n">C</th><th class="n">G</th></tr></thead>
    <tbody>${d.meals.map(x => `<tr><td><b>${esc(x.slot)}</b><br><small>${esc(x.time)}</small></td><td class="dish">${esc(x.v.name)}</td><td class="ing">${x.v.items.map(esc).join(" · ")}</td><td class="n">${x.v.m.kcal}</td><td class="n">${x.v.m.p}</td><td class="n">${x.v.m.c}</td><td class="n">${x.v.m.g}</td></tr>`).join("")}</tbody>
    <tfoot><tr><td colspan="3">Total del día</td><td class="n">${num(d.tot.kcal)}</td><td class="n">${d.tot.p}</td><td class="n">${d.tot.c}</td><td class="n">${d.tot.g}</td></tr></tfoot></table></section>`).join("");
  const shop = shopData().map(([t, it]) => `<div class="pd-col"><h4>${esc(t)}</h4><ul>${it.map(([n, q]) => `<li><i></i><span>${esc(n)}</span><b>${esc(q)}</b></li>`).join("")}</ul></div>`).join("");
  return `${nav("Imprimir menú", { back: "Comida", to: "#/comida/menu", sub: "Elige “Guardar como PDF” al imprimir" })}
  <div class="btn-wrap noprint"><button class="btn" data-act="print">Imprimir o guardar PDF</button></div>
  <article class="print-doc"><header class="pd-head"><div><p class="pd-kicker">Reto 90 · Plan de alimentación</p><h2>Menú semanal${who ? "<br><span>" + who + "</span>" : ""}</h2></div><p class="pd-meta">${esc(g.name)}<br>${hoy}</p></header>
  <div class="pd-stats">${stat(num(c.train.kcal), "kcal en día de entreno")}${stat(num(c.rest.kcal), "kcal en descanso")}${stat(c.train.p + " g", "proteína")}${stat(c.train.c + " g", "carbohidratos")}${stat(c.train.g + " g", "grasas")}</div>
  <p class="pd-note">Porciones ajustadas a tu plan. Las cantidades de comida están en crudo. P = proteína, C = carbohidratos, G = grasas (en gramos).</p>
  ${days}<section class="pd-shopwrap"><h2 class="pd-h">Lista de compras · 7 días</h2><div class="pd-shop">${shop}</div><p class="pd-note">Despensa: sal, especias, limón, cebolla, cilantro, chile, salsa casera, mostaza, aceite en aerosol, té verde y agua mineral.</p></section>
  <footer>Son estimaciones; no sustituyen a un médico o nutriólogo. Generado con Reto 90.</footer></article>`;
}
function vShop() {
  const T = isVeg() ? D.SHOP_VEG : D.SHOP, F = D.FOODS;
  const grp = [["Proteínas", ["pollo", "bistec", "tilapia", "atun", "huevo", "claras", "jamon", "panela", "yogurt", "requeson", "tofu", "soya", "lentejas", "garbanzo", "whey"]], ["Carbohidratos", ["arroz", "papa", "frijol", "avena", "tortilla", "pan", "tostada", "platano", "fresas"]], ["Grasas y verdura", ["aguacate", "aceite", "verdura"]]];
  const line = k => {
    const q = Math.ceil((T[k] || 0) * mealScale()); if (!q) return "";
    const f = F[k]; let txt;
    if (f.unit === "pza") txt = k === "tortilla" ? `${(q * 30 / 1000).toFixed(1)} kg (≈ ${q} tortillas)` : `${q} pzas`;
    else if (k === "atun") txt = `${Math.ceil(q / 140)} latas`;
    else txt = q >= 1000 ? `${(Math.ceil(q / 100) / 10).toFixed(1)} kg` : `${Math.ceil(q / 50) * 50} g`;
    if (k === "aceite") txt = "1 botella chica"; if (k === "whey") txt = "opcional (2 scoops)";
    return `<div class="row"><div class="main"><div class="title">${esc(f.name.charAt(0).toUpperCase() + f.name.slice(1))}</div></div><span class="val">${txt}</span></div>`;
  };
  return `${nav("Compras", { back: "Comida", sub: "Para 7 días" })}
  ${grp.map(([t, ks]) => `<h2 class="sec">${t}</h2><div class="group">${ks.map(line).join("")}</div>`).join("")}`;
}

/* Progreso */
/* ───────── Seguimiento ───────── */
let chartMetric = "peso", chartRange = 28, calOffset = 0, phAngle = "frente";
const sessKeys = c => Object.keys(c || {}).filter(k => k.startsWith("s_") && c[k]);
const activity = iso => { const c = S.checks[iso] || {}, sess = sessKeys(c).length > 0, meals = Object.values(S.eaten[iso] || {}).filter(Boolean).length; return { sess, meals, any: sess || meals >= 3 || !!S.weights[iso] }; };
function streak() { let d = todayISO(), n = 0; if (!activity(d).any) d = addDays(d, -1); while (S.start && d >= S.start && activity(d).any) { n++; d = addDays(d, -1); } return n; }
const totalSessions = () => Object.values(S.checks).reduce((a, c) => a + sessKeys(c).length, 0);
function vProgress() {
  const now = avgWeight(todayISO());
  const ws = Object.entries(S.waists).sort((a, b) => a[0] < b[0] ? -1 : 1), w0 = ws[0], w1 = ws[ws.length - 1];
  let adh = 0, dn = 0;
  for (let i = 0; i < 7; i++) { const d = addDays(todayISO(), -i); if (d < S.start) continue; dn++; const ms = mealsToday(d).filter(m => m.slot !== "Snack"), e = eatenOn(d); adh += ms.filter(m => e[m.slot]).length / ms.length; }
  const row = (h, t) => `<button class="row" data-go="${h}"><div class="main"><div class="title">${t}</div></div>${I.chev}</button>`;
  return `${nav("Progreso", { gear: true })}
  <div class="group">
    <div class="row"><div class="main"><div class="title">Peso (promedio 7 días)</div></div><span class="val" style="color:var(--label);font-weight:600">${now ? fmt(now, 1) + " kg" : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Cintura</div></div><span class="val">${w1 ? (w0[0] !== w1[0] ? `${w0[1]} → ${w1[1]} cm` : w1[1] + " cm") : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Comidas cumplidas (7 días)</div></div><span class="val">${dn ? Math.round(adh / dn * 100) + " %" : "—"}</span></div>
  </div>
  ${segHtml([["peso", "Peso"], ["cintura", "Cintura"]], chartMetric, "cmetric", "Qué graficar")}
  <div style="height:8px"></div>${segHtml([[28, "4 semanas"], [84, "12 semanas"], [0, "Todo"]], chartRange, "crange", "Periodo")}
  <div class="group" style="padding:12px 8px 4px;margin-top:10px" id="chartbox">${chartSvg()}</div>
  <div class="group" id="calbox">${calHtml()}</div>
  <h2 class="sec">Registrar</h2>
  <div class="group">${row("#/progreso/peso", "Peso y cintura")}${row("#/progreso/medidas", "Medidas del cuerpo")}${row("#/progreso/fotos", "Fotos")}${row("#/progreso/revision", "Revisión semanal")}</div>
  <h2 class="sec">Historial</h2>
  <div class="group">${row("#/progreso/fuerza", "Fuerza y récords")}${row("#/progreso/historial", "Entrenos completados")}${row("#/progreso/compartir", "Compartir progreso")}</div>`;
}
function chartSvg() {
  const isW = chartMetric === "peso", from = chartRange ? addDays(todayISO(), -chartRange) : "0000-00-00";
  const pts = (isW ? sortedWeights() : Object.entries(S.waists).sort((a, b) => a[0] < b[0] ? -1 : 1)).filter(p => p[0] >= from);
  if (pts.length < 2) return `<div class="empty">Con 2 o más registros de ${isW ? "peso" : "cintura"} aparece la gráfica.</div>`;
  const W = 340, H = 170, pl = 30, pr = 8, pt = 10, pb = 22, vals = pts.map(p => p[1]), avgs = isW ? pts.map(([d]) => avgWeight(d)) : vals;
  const lo = Math.floor(Math.min(...vals, ...avgs) - 0.5), hi = Math.ceil(Math.max(...vals, ...avgs) + 0.5), unit = isW ? "kg" : "cm";
  const X = i => pl + i / (pts.length - 1) * (W - pl - pr), Y = v => pt + (hi - v) / (hi - lo) * (H - pt - pb);
  const grid = []; for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) grid.push(`<line class="grid" x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pl - 5}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`);
  const line = avgs.map((a, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(a).toFixed(1)}`).join("");
  const change = vals[vals.length - 1] - vals[0];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de ${isW ? "peso" : "cintura"}: de ${vals[0]} a ${vals[vals.length - 1]} ${unit}">${grid.join("")}${isW ? pts.map((p, i) => `<circle class="pt" cx="${X(i)}" cy="${Y(p[1])}" r="2.6"/>`).join("") : ""}<path class="avg" d="${line}" pathLength="1"/>${!isW ? pts.map((p, i) => `<circle class="dotpt" cx="${X(i)}" cy="${Y(p[1])}" r="3"/>`).join("") : ""}<text x="${pl}" y="${H - 6}">${shortDate(pts[0][0])}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end">${shortDate(pts[pts.length - 1][0])}</text></svg>
  <p class="note" style="margin:0 8px 8px">Cambio: <strong>${change > 0 ? "+" : ""}${fmt(change, 1)} ${unit}</strong>.</p>`;
}
function calHtml() {
  const t = new Date(todayISO() + "T12:00:00"); t.setDate(1); t.setMonth(t.getMonth() + calOffset);
  const y = t.getFullYear(), m = t.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), iso = todayISO(), cells = [];
  for (let i = 0; i < first; i++) cells.push("<span></span>");
  for (let d = 1; d <= days; d++) {
    const di = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, a = activity(di), inR = S.start && di >= S.start && di <= iso;
    cells.push(`<button class="cd ${a.sess ? "done" : a.any ? "part" : ""} ${di === iso ? "today" : ""} ${inR ? "" : "out"}" data-day="${di}" aria-label="${esc(longDate(di))}${a.sess ? ", entreno completado" : a.any ? ", con actividad" : ""}"><i>${d}</i></button>`);
  }
  const title = t.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  return `<div class="cal-h"><button class="nb-btn" data-cal="-1" aria-label="Mes anterior">${I.back}</button><b>${title.charAt(0).toUpperCase() + title.slice(1)}</b><button class="nb-btn" data-cal="1" aria-label="Mes siguiente" ${calOffset >= 0 ? "disabled" : ""}><span style="display:inline-block;transform:rotate(180deg)">${I.back}</span></button></div>
  <div class="cal-w" aria-hidden="true">${["L", "M", "X", "J", "V", "S", "D"].map(x => `<span>${x}</span>`).join("")}</div><div class="cal-g">${cells.join("")}</div>
  <div class="cal-k"><span><i class="kd done"></i> Entreno</span><span><i class="kd part"></i> Actividad</span></div>`;
}
function dayInfoHtml(iso) {
  const c = S.checks[iso] || {}, e = Object.entries(S.eaten[iso] || {}).filter(([, v]) => v).map(([k]) => k), sess = sessKeys(c).map(k => D.ARCH[k.slice(2)]?.name).filter(Boolean);
  const sets = Object.values(S.hist).reduce((a, h) => a + ((h.find(x => x.d === iso)?.sets || []).filter(x => x.done).length), 0);
  const row = (t, v) => `<div class="row"><div class="main"><div class="title">${t}</div></div><span class="val">${v}</span></div>`;
  return `<div class="group">${row("Peso", S.weights[iso] ? fmt(S.weights[iso], 1) + " kg" : "—")}${row("Entreno", sess.length ? esc(sess.join(", ")) : "—")}${sets ? row("Series completadas", sets) : ""}${row("Comidas marcadas", e.length ? e.length : "—")}${row("Agua", c.water ? fmt(c.water / 1000, 1) + " L" : "—")}${row("Pasos", c.steps ? num(c.steps) : "—")}${row("Dormí 7 h o más", c.sleep ? "Sí" : "—")}</div>${e.length ? `<p class="note">${esc(e.join(" · "))}</p>` : ""}`;
}
function vBodyMeasures() {
  const iso = todayISO(), F = [["cintura", "Cintura (a la altura del ombligo)"], ["pecho", "Pecho (a la altura de las tetillas)"], ["brazo", "Brazo flexionado (la parte más ancha)"], ["muslo", "Muslo (a medio camino de la rodilla)"], ["cadera", "Cadera (la parte más ancha)"]];
  const get = (k, d) => k === "cintura" ? S.waists[d] : (S.body || {})[d]?.[k];
  const dates = [...new Set([...Object.keys(S.waists), ...Object.keys(S.body || {})])].sort();
  const delta = F.map(([k, l]) => { const ds = dates.filter(d => get(k, d)); return ds.length >= 2 ? `<div class="row"><div class="main"><div class="title">${esc(l.split(" (")[0])}</div><div class="meta">${get(k, ds[0])} → ${get(k, ds[ds.length - 1])} cm</div></div><span class="val" style="font-weight:600;color:var(--label)">${(get(k, ds[ds.length - 1]) - get(k, ds[0])) > 0 ? "+" : ""}${fmt(get(k, ds[ds.length - 1]) - get(k, ds[0]), 1)} cm</span></div>` : ""; }).join("");
  return `${nav("Medidas del cuerpo", { back: "Progreso", sub: "Cada 2 semanas, en ayunas, con cinta sin apretar. Son mejores que la báscula para ver cambios reales." })}
  <h2 class="sec">Hoy</h2><div class="group">${F.map(([k, l]) => `<div class="field"><label for="m-${k}">${esc(l)}</label><input id="m-${k}" type="number" inputmode="decimal" step="0.1" min="10" max="250" placeholder="cm" value="${get(k, iso) ?? ""}"></div>`).join("")}</div>
  <div class="btn-wrap"><button class="btn" data-act="savebody">Guardar medidas</button></div>
  <h2 class="sec">Cambio desde la primera medida</h2>${delta ? `<div class="group">${delta}</div>` : `<div class="group"><div class="empty">Registra al menos dos veces para ver tu cambio.</div></div>`}`;
}
function vPhotos() {
  return `${nav("Fotos de progreso", { back: "Progreso", sub: "Se guardan solo en este teléfono: no se suben a ningún lado ni entran en la copia JSON." })}
  <div class="group"><div class="field"><label>Ángulo de la foto</label>${segHtml([["frente", "Frente"], ["perfil", "Perfil"], ["espalda", "Espalda"]], phAngle, "angle", "Ángulo")}</div>
    <label class="row" style="cursor:pointer"><div class="main"><div class="title" style="color:var(--accent)">Tomar o elegir una foto</div><div class="meta">Mismo lugar, luz y hora cada vez</div></div><input type="file" accept="image/*" id="ph-file" hidden></label></div>
  <div id="ph-cmp"></div><div id="ph-grid"><div class="skel"></div></div>`;
}
let photoUrls = [];
async function loadPhotos() {
  const grid = $("#ph-grid"), cmp = $("#ph-cmp"); if (!grid) return;
  photoUrls.forEach(u => URL.revokeObjectURL(u)); photoUrls = [];
  if (!window.Store || !Store.available()) { grid.innerHTML = `<div class="group"><div class="empty">Tu navegador no permite guardar fotos aquí.</div></div>`; return; }
  let list = []; try { list = (await Store.photos()).sort((a, b) => a.date < b.date ? 1 : -1); } catch { grid.innerHTML = `<div class="group"><div class="empty">No pude leer las fotos guardadas.</div></div>`; return; }
  if (!$("#ph-grid")) return;
  const url = p => { const u = URL.createObjectURL(p.blob); photoUrls.push(u); return u; };
  const same = list.filter(p => p.angle === phAngle);
  cmp.innerHTML = same.length >= 2 ? (() => { const a = same[same.length - 1], b = same[0]; return `<h2 class="sec">Primera y última (${esc(phAngle)})</h2><div class="cmp"><figure><img src="${url(a)}" alt="Foto de ${esc(a.angle)} del ${esc(longDate(a.date))}"><figcaption>${shortDate(a.date)}</figcaption></figure><figure><img src="${url(b)}" alt="Foto de ${esc(b.angle)} del ${esc(longDate(b.date))}"><figcaption>${shortDate(b.date)} · ${diffDays(b.date, a.date)} días después</figcaption></figure></div>`; })() : "";
  grid.innerHTML = list.length ? `<h2 class="sec">Todas tus fotos</h2><div class="pgrid">${list.map(p => `<button class="pth" data-photo="${esc(p.id)}" aria-label="Foto de ${esc(p.angle)}, ${esc(longDate(p.date))}"><img src="${url(p)}" alt=""><span>${shortDate(p.date)} · ${esc(p.angle)}</span></button>`).join("")}</div>` : `<div class="group"><div class="empty">Aún no hay fotos. Tómate una el día 1 para comparar al final del reto.</div></div>`;
  $$("[data-photo]").forEach(b => b.addEventListener("click", () => { const p = list.find(x => x.id === b.dataset.photo); openSheet(`${shortDate(p.date)} · ${p.angle}`, `<img class="pfull" src="${url(p)}" alt="Foto de ${esc(p.angle)}"><div class="btn-wrap"><button class="btn danger-soft" data-delph="${esc(p.id)}">Eliminar foto</button></div>`, el => el.querySelector("[data-delph]").addEventListener("click", async () => { if (confirm("¿Eliminar esta foto? No se puede deshacer.")) { await Store.delPhoto(p.id); closeSheet(); loadPhotos(); toast("Foto eliminada"); } })); }));
}
function vHistory() {
  const rows = []; Object.keys(S.checks).sort().reverse().forEach(d => sessKeys(S.checks[d]).forEach(k => { const se = D.ARCH[k.slice(2)]; if (!se) return; const sets = Object.values(S.hist).reduce((a, h) => a + ((h.find(x => x.d === d)?.sets || []).filter(x => x.done).length), 0); rows.push(`<div class="row"><div class="main"><div class="title">${esc(se.name)}</div><div class="meta">${esc(longDate(d))}${sets ? " · " + sets + " series" : ""}</div></div></div>`); }));
  return `${nav("Entrenos completados", { back: "Progreso", sub: `${rows.length} en total` })}${rows.length ? `<div class="group">${rows.join("")}</div>` : `<div class="group"><div class="empty">Cuando termines tu primer entreno aparecerá aquí.</div></div>`}`;
}
const e1rm = (w, r) => w * (1 + (r || 1) / 30);
function spark(vals) {
  if (vals.length < 2) return "";
  const W = 64, H = 22, lo = Math.min(...vals), hi = Math.max(...vals), X = i => 2 + i / (vals.length - 1) * (W - 4), Y = v => hi === lo ? H / 2 : 2 + (hi - v) / (hi - lo) * (H - 4);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("")}"/></svg>`;
}
function vStrength() {
  const keys = Object.keys(S.hist).filter(k => S.hist[k].some(x => x.sets.some(t => t.done || t.r)));
  return `${nav("Fuerza y récords", { back: "Progreso", sub: "Mejor serie y tendencia por ejercicio." })}
  ${keys.length ? `<div class="group">${keys.map(k => { const h = S.hist[k].filter(x => x.sets.some(t => t.r)), best = h.map(x => bestOf(x)), top = h.map(x => Math.max(...x.sets.filter(t => t.r).map(t => t.w ? e1rm(t.w, t.r) : t.r))); const pr = S.prs && S.prs[k]; return `<div class="row"><div class="main"><div class="title">${esc(D.EX[k]?.name || k)}</div><div class="meta">${h.length} sesiones · inicio ${best[0]}${pr ? " · récord ≈ " + fmt(pr, 0) + " kg (1RM est.)" : ""}</div></div>${spark(top)}<span class="val" style="color:var(--label);font-weight:600">${best[best.length - 1]}</span></div>`; }).join("")}</div><p class="note">El 1RM estimado usa la fórmula de Epley (peso × (1 + repeticiones ÷ 30)); es una aproximación.</p>` : `<div class="group"><div class="empty">Marca tus vueltas en cada bloque y aquí verás tu progreso y tus récords.</div></div>`}`;
}
function vData() {
  const saved = +LS.getItem(KEY + ".saved") || 0, n = Object.keys(S.weights).length, ses = totalSessions();
  return `${nav("Mis datos", { back: "Progreso", sub: "Se guardan solo en este teléfono" })}
  ${storageWarn()}
  <h2 class="sec">Instalar la app</h2>${installCard()}
  <h2 class="sec">Estado</h2>
  <div class="group">
    <div class="row"><div class="main"><div class="title">Último guardado</div></div><span class="val">${saved ? new Date(saved).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Copia interna de respaldo</div></div><span class="val">${window.Store && Store.available() ? "Activa" : "No disponible"}</span></div>
    <div class="row"><div class="main"><div class="title">Lo que hay guardado</div></div><span class="val">${n} pesos · ${ses} entrenos</span></div>
  </div>
  <h2 class="sec">Copia de seguridad</h2>
  <div class="group">
    <button class="row" data-act="export"><div class="main"><div class="title">Exportar copia (archivo)</div><div class="meta">Un archivo con tus pesos, series y comidas</div></div></button>
    <button class="row" data-act="offline"><div class="main"><div class="title">Guardar los ejercicios para usar sin internet</div><div class="meta" id="d-offline">Unos 12 MB, con Wi-Fi</div></div></button>
    <label class="row" style="cursor:pointer"><div class="main"><div class="title">Importar copia</div></div><input type="file" accept=".json,application/json,text/plain,application/octet-stream" id="imp" hidden></label>
  </div>
  <h2 class="sec">Zona de riesgo</h2><div class="group"><button class="row" data-act="reset"><div class="main"><div class="title" style="color:var(--bad)">Borrar todo y reiniciar</div></div></button></div>`;
}
function vLogWeight() {
  const iso = todayISO(), rows = sortedWeights().slice(-14).reverse();
  return `${nav("Peso y cintura", { back: "Progreso" })}
  <h2 class="sec">Peso de hoy</h2>
  <div class="group"><div class="input-line"><input id="w-today" type="number" inputmode="decimal" step="0.1" placeholder="kg" aria-label="Peso en kilogramos" value="${esc(S.weights[iso] || "")}"><button class="btn" data-act="saveweight">Guardar</button></div></div>
  <h2 class="sec">Cintura (cm) · una vez por semana</h2>
  <div class="group"><div class="input-line"><input id="waist" type="number" inputmode="decimal" step="0.1" placeholder="cm a la altura del ombligo" aria-label="Cintura en centímetros" value="${esc(S.waists[iso] || "")}"><button class="btn" data-act="savewaist">Guardar</button></div></div>
  <h2 class="sec">Últimos registros</h2>
  ${rows.length ? `<div class="group">${rows.map(([d, v]) => `<div class="row"><div class="main"><div class="title">${shortDate(d)}</div></div><span class="val">${fmt(v, 1)} kg${S.waists[d] ? " · " + S.waists[d] + " cm" : ""}</span></div>`).join("")}</div>` : `<div class="group"><div class="empty">Aún no hay registros.</div></div>`}`;
}
const bestOf = e => { const s = e.sets.filter(x => x.r).sort((a, b) => (b.w || 0) * 100 + b.r - ((a.w || 0) * 100 + a.r))[0]; return s ? `${s.w ? s.w + " kg × " : ""}${s.r}` : "—"; };
function vMeasureGuide() {
  return `${nav("Cómo medir", { back: "Progreso" })}
  <h2 class="sec">Qué y cuándo</h2><div class="group">${C.measureGuide.map(m => `<div class="row top"><div class="main"><div class="title">${esc(m.t)}</div><div class="meta">${esc(m.d)}</div></div></div>`).join("")}</div>
  <h2 class="sec">Agua, peso y grasa real</h2><div class="group"><div class="prose">${C.weightFAQ}</div></div>
  <h2 class="sec">Reglas de ajuste</h2><div class="group">${C.adjustRules[S.profile.goal || "recomp"].map(r => `<div class="row top"><div class="main"><div class="title">${esc(r.when)}</div><div class="meta">${esc(r.act)}</div></div></div>`).join("")}</div>
  <p class="note">${esc(C.adjustLimit)}</p>`;
}
function vReview() {
  const wk = weekNum(), saved = S.reviews[wk] || {}, now = avgWeight(todayISO()), prev = avgWeight(addDays(todayISO(), -7)), delta = now && prev ? now - prev : null, N = SESSIONS().length, adj = S.profile.adj || 0;
  const qs = C.reviewQuestions.map(q => q.id === "ses" ? { ...q, q: `¿Cuántas de tus ${N} sesiones hiciste?`, max: N, def: N } : q);
  return `${nav("Revisión semanal", { back: "Progreso", sub: `Semana ${wk} · ${esc(C.goals[S.profile.goal || "recomp"].name)}` })}
  <div class="group"><div class="row"><div class="main"><div class="title">Promedio 7 días</div><div class="meta">${now ? fmt(now, 2) + " kg" : "sin datos"}${delta !== null ? " · " + trendText(delta) : ""}</div></div></div>
  ${adj ? `<div class="row"><div class="main"><div class="title">Ajuste aplicado a tus calorías</div><div class="meta">${adj > 0 ? "+" : "−"}${Math.abs(adj)} kcal</div></div><button class="btn small quiet" data-adj="reset">Quitar</button></div>` : ""}</div>
  <h2 class="sec">Tus respuestas</h2>
  <div class="group">${qs.map(q => q.yesno
    ? `<div class="row check-row"><label for="rq-${q.id}">${esc(q.q)}</label><input class="switch" id="rq-${q.id}" type="checkbox" data-rq="${q.id}" ${saved[q.id] ? "checked" : ""}></div>`
    : `<div class="field"><label for="rq-${q.id}">${esc(q.q)}: <b id="rv-${q.id}">${saved[q.id] ?? q.def}</b></label><input id="rq-${q.id}" type="range" min="${q.min}" max="${q.max}" value="${saved[q.id] ?? q.def}" data-rq="${q.id}"></div>`).join("")}</div>
  <div class="btn-wrap"><button class="btn" data-act="review">Ver recomendación</button></div>
  <div id="rev-out"></div>`;
}
function reviewAdvice(a) {
  const g = S.profile.goal || "recomp", now = avgWeight(todayISO()), prev = avgWeight(addDays(todayISO(), -7)), prev2 = avgWeight(addDays(todayISO(), -14));
  const ws = Object.entries(S.waists).sort((x, y) => x[0] < y[0] ? -1 : 1), waistDown = ws.length >= 2 && ws[ws.length - 1][1] < ws[ws.length - 2][1], waistUp = ws.length >= 2 && ws[ws.length - 1][1] > ws[ws.length - 2][1];
  const out = [], flags = {}; let delta = 0;
  if (!now || !prev) return { paras: ["Aún no hay 2 semanas de pesos para ajustar. Sigue registrando y mantén el plan."], delta: 0, flags };
  const d = (now - prev) / now * 100, d2 = prev2 ? (prev - prev2) / prev * 100 : null, ok = a.adh / 7 >= 0.85, last = S.reviews[weekNum() - 1] || {};
  const pc = x => fmt(Math.abs(x), 2) + " %";
  if (a.slp <= 3 || a.eng <= 2 || a.hun >= 5) out.push("Señales de fatiga: prioriza dormir 7–8 h y, si dura más de una semana, haz una semana de descarga" + (g === "muscle" ? "." : " o sube 150 kcal."));
  if (g === "fat") {
    if (d <= -1) { out.push(`Bajaste ${pc(d)} del peso: es muy rápido. <strong>Sube 150 kcal</strong> para proteger el músculo.`); delta = 150; }
    else if (d <= -0.25) out.push(`Bajaste ${pc(d)}: está en rango. <strong>No cambies nada.</strong>`);
    else if (d < 0.2) {
      if (waistDown && a.str) out.push("Peso estable pero la cintura baja y tu fuerza sube: estás recomponiendo. <strong>No cambies nada.</strong>");
      else if (!ok) out.push("Peso estable, pero la adherencia fue menor al 85 %. <strong>No bajes calorías aún</strong>: primero cumple el plan 2 semanas.");
      else if (last.stepsAdvice) { out.push("Llevas 2 semanas estable con buena adherencia y ya subiste los pasos. <strong>Baja 150 kcal.</strong>"); delta = -150; }
      else { out.push("Peso estable con buena adherencia. <strong>Sube +1,500 pasos al día</strong> y revisa la próxima semana."); flags.stepsAdvice = true; }
    } else { if (ok && d2 !== null && d2 >= 0.2) { out.push(`Subiste ${pc(d)} dos semanas seguidas. Si no hay explicación (sal, fin de semana, entreno de pierna), <strong>baja 150 kcal</strong>.`); delta = -150; } else out.push(`Subiste ${pc(d)}: ${ok ? "una semana no es tendencia; repite y revisa" : "la adherencia fue baja, vuelve al plan antes de ajustar calorías"}.`); }
  } else if (g === "recomp") {
    if (d <= -0.5) { out.push(`Bajaste ${pc(d)}: para recomponer conviene ir más despacio. <strong>Sube 150 kcal.</strong>`); delta = 150; }
    else if (d < 0.25) {
      if (waistDown || a.str) out.push("Peso estable o bajando despacio, y la cintura baja o la fuerza sube: la recomposición funciona. <strong>No cambies nada.</strong>");
      else if (!ok) out.push("Sin cambios y con adherencia menor al 85 %: primero cumple el plan 2 semanas.");
      else if (last.stall) { out.push("Tres semanas sin cambio en peso, cintura ni fuerza con buena adherencia. <strong>Baja 150 kcal</strong> y suma 1,000 pasos al día."); delta = -150; }
      else { out.push("Sin cambios esta semana. Espera una más antes de ajustar."); flags.stall = true; }
    } else { if (d2 !== null && d2 >= 0.25) { out.push(`Subiste ${pc(d)} dos semanas seguidas: te pasas del mantenimiento. <strong>Baja 150 kcal.</strong>`); delta = -150; } else out.push(`Subiste ${pc(d)}: una semana no es tendencia; repite y revisa.`); }
  } else {
    if (waistUp && !a.str) { out.push("La cintura sube más rápido que tu fuerza: el superávit es demasiado grande. <strong>Baja 150 kcal.</strong>"); delta = -150; }
    else if (d > 0.7) { out.push(`Subiste ${pc(d)}: más rápido de lo ideal (0.25–0.5 %). Parte será grasa. <strong>Baja 150 kcal.</strong>`); delta = -150; }
    else if (d >= 0.25) out.push(`Subiste ${pc(d)}: ritmo ideal para ganar músculo. <strong>No cambies nada.</strong>`);
    else if (d < 0.1) {
      if (!ok) out.push("Casi no subes y la adherencia fue menor al 85 %: primero cumple el plan de comidas.");
      else if (d2 !== null && d2 < 0.1) { out.push("Llevas 2 semanas casi sin subir con buena adherencia. <strong>Sube 150 kcal.</strong>"); delta = 150; }
      else out.push("Subiste poco esta semana. Espera una más antes de subir calorías.");
    } else out.push(`Subiste ${pc(d)}: un poco por debajo de lo ideal. Si se repite otra semana, sube 100–150 kcal.`);
  }
  if (a.ses < SESSIONS().length - 1) out.push(`Hiciste ${a.ses} de ${SESSIONS().length} sesiones. Usa la versión mínima de 20 minutos antes que saltarte la sesión.`);
  if (!a.str) out.push("Sin progresión en la mayoría de ejercicios: revisa sueño, proteína y que llegues al rango alto de repeticiones antes de subir peso.");
  out.push(C.adjustLimit);
  return { paras: out, delta, flags };
}

/* Plan */
function vHub() {
  const row = (h, t) => `<button class="row" data-go="${h}"><div class="main"><div class="title">${t}</div></div>${I.chev}</button>`;
  return `${nav("Ajustes", { back: "Hoy" })}
  <h2 class="sec">Apariencia</h2>
  <div class="group"><div class="field"><label>Tema</label>${segHtml([["auto", "Automático"], ["light", "Claro"], ["dark", "Oscuro"]], S.theme, "theme", "Tema")}</div>
  <div class="field"><label>Color de acento</label>${segHtml([["naranja", "Naranja"], ["azul", "Azul"], ["morado", "Morado"], ["rosa", "Rosa"]], S.accent, "accent", "Color de acento")}</div></div>
  <h2 class="sec">Tu plan</h2>
  <div class="group">${row("#/plan/ajustes", "Perfil y equipo")}${row("#/plan/avisos", "Recordatorios y sonido")}${row("#/progreso/datos", "Mis datos y copia de seguridad")}</div>
  <h2 class="sec">Más información</h2>
  <div class="group">${row("#/plan/ruta", "Hoja de ruta de 90 días")}${row("#/plan/habitos", "Hábitos")}${row("#/plan/reglas", "Cuándo ajustar calorías")}${row("#/progreso/guia", "Qué medir")}${row("#/plan/fuentes", "Fuentes")}</div>`;
}
function vRemind() {
  const r = S.remind;
  return `${nav("Recordatorios", { back: "Ajustes", to: "#/plan", sub: "Se añaden a tu calendario y avisan aunque la app esté cerrada" })}
  <div class="group">
    <div class="field"><label for="rm-train">Hora de entrenar</label><input id="rm-train" type="time" value="${esc(r.train)}"></div>
    <div class="field"><label for="rm-weigh">Hora de pesarte (todos los días)</label><input id="rm-weigh" type="time" value="${esc(r.weigh)}"></div>
  </div>
  <div class="btn-wrap"><button class="btn" data-act="ics">Añadir al calendario</button></div>
  <h2 class="sec">Descanso</h2>
  <div class="group"><div class="row check-row"><label for="sd-on">Sonido al terminar el descanso</label><input class="switch" id="sd-on" type="checkbox" ${S.sound ? "checked" : ""}></div></div>`;
}
function vShare() {
  return `${nav("Compartir progreso", { back: "Progreso" })}
  <canvas id="shr" class="share-canvas" width="1080" height="1350" role="img" aria-label="Imagen de tu progreso"></canvas>
  <div class="group" style="margin-top:14px"><div class="field"><label>Incluir cambio de peso</label>${segHtml([["si", "Sí"], ["no", "No"]], shareW, "sharew", "Incluir peso")}</div></div>
  <div class="btn-wrap"><button class="btn" data-act="share">Compartir</button></div>`;
}
function drawShare() {
  const cv = $("#shr"); if (!cv) return; const g = cv.getContext("2d"), W = 1080, H = 1350;
  const dark = document.documentElement.dataset.theme === "dark" || (document.documentElement.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#bf3a06";
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#1c1c1e"); bg.addColorStop(1, "#000"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const font = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Roboto, sans-serif"; g.textAlign = "left";
  g.fillStyle = acc; g.font = `700 44px ${font}`; g.fillText("RETO 90", 80, 130);
  g.fillStyle = "#fff"; g.font = `700 120px ${font}`; const n = Math.max(1, Math.min(90, dayNum()));
  g.fillText(S.profile.name ? S.profile.name : "Mi progreso", 80, 300);
  g.fillStyle = "#aeaeb2"; g.font = `500 54px ${font}`; g.fillText(`Día ${n} de 90`, 80, 380);
  g.fillStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.roundRect(80, 430, 920, 28, 14); g.fill();
  g.fillStyle = acc; g.beginPath(); g.roundRect(80, 430, Math.max(28, 920 * n / 90), 28, 14); g.fill();
  const d = weekDelta(), st = streak(), total = totalSessions();
  const stats = [[String(st), st === 1 ? "día de racha" : "días de racha"], [String(total), "entrenos completados"]];
  if (shareW === "si" && d !== null) stats.push([(d > 0 ? "+" : d < 0 ? "−" : "") + fmt(Math.abs(d), 1) + " kg", "peso en 7 días"]);
  stats.forEach(([v, l], i) => { const y = 560 + i * 230; g.fillStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.roundRect(80, y, 920, 190, 36); g.fill(); g.fillStyle = "#fff"; g.font = `700 100px ${font}`; g.fillText(v, 120, y + 118); g.fillStyle = "#aeaeb2"; g.font = `500 44px ${font}`; g.fillText(l, 120, y + 166); });
  g.fillStyle = "#636366"; g.font = `500 36px ${font}`; g.fillText(location.host, 80, H - 70);
}
function vRoute() {
  const wk = weekNum(), n = dayNum(), ph = phaseOf(wk);
  return `${nav("Hoja de ruta", { back: "Ajustes", to: "#/plan", sub: `Día ${Math.max(n, 0)} de 90 · Fase ${ph.n}: ${ph.name}` })}
  <div class="group"><button class="row" data-go="#/plan/semana/${wk}"><div class="main"><div class="title">Semana ${wk}</div><div class="meta">${esc(C.weekFocus[wk])}</div></div>${I.chev}</button></div>
  <h2 class="sec">Hoja de ruta</h2>
  <div class="group">${Array.from({ length: 13 }, (_, i) => i + 1).map(w => `<button class="row" data-go="#/plan/semana/${w}"><div class="main"><div class="title">Semana ${w}${w === wk ? ' <span class="badge">Actual</span>' : ""}</div><div class="meta">${esc(phaseOf(w).name)}${[4, 8].includes(w) ? " · descarga" : ""}</div></div>${I.chev}</button>`).join("")}</div>
  <h2 class="sec">Metas intermedias</h2>
  <div class="group">${C.milestones.map(m => { const k0 = S.profile.kg, wtxt = m.pct ? `Peso −${fmt(k0 * m.pct[0] / 100, 1)} a −${fmt(k0 * m.pct[1] / 100, 1)} kg · ` : ""; return `<div class="row top"><div class="main"><div class="title">Día ${m.day} · ${esc(m.t)}</div><div class="meta">${esc(wtxt + (m.cm ? m.d.replace("{cm}", m.cm[0] + " a " + m.cm[1]) : m.d))}</div></div></div>`; }).join("")}</div>`;
}
function vWeek(n) {
  n = Math.min(13, Math.max(1, n || 1));
  const ph = phaseOf(n), start = addDays(S.start, (n - 1) * 7), deload = [4, 8].includes(n);
  return `${nav("Semana " + n, { back: "Ajustes", sub: `Fase ${ph.n}: ${ph.name} · ${shortDate(start)} – ${shortDate(addDays(start, n === 13 ? 5 : 6))}` })}
  <div class="group"><div class="prose"><p>${esc(C.weekFocus[n])}</p></div></div>
  <h2 class="sec">Esta semana</h2>
  <div class="group">
    <div class="row top"><div class="main"><div class="title">Entrenamiento</div><div class="meta">${deload ? "Descarga: quita 1 vuelta por bloque y deja 3–4 repeticiones en reserva" : "6 sesiones · " + ph.rir + " repeticiones en reserva"}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Cardio</div><div class="meta">${ph.cardio} (zona 2)</div></div></div>
    <div class="row top"><div class="main"><div class="title">Pasos</div><div class="meta">${ph.steps.toLocaleString("es-MX")} al día</div></div></div>
    <div class="row top"><div class="main"><div class="title">Comida</div><div class="meta">Entreno ≈ ${num(planCalc().train.kcal)} kcal · descanso ≈ ${num(planCalc().rest.kcal)} kcal · proteína ≈ ${planCalc().train.p} g</div></div></div>
    <div class="row top"><div class="main"><div class="title">Recuperación</div><div class="meta">${deload ? "Duerme 8 h y camina; no se buscan marcas" : "Sueño 7–9 h, 2.5–3 L de agua"}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Mediciones</div><div class="meta">Peso diario · cintura el domingo${[3, 5, 7, 9, 11, 13].includes(n) ? " · fotos esta semana" : ""}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Revisión</div><div class="meta">${n === 4 ? "Revisión mensual: día 28–30" : n === 9 ? "Revisión de mes 2: día 56–60" : n === 13 ? "Revisión final y decisión de la siguiente fase" : "Revisión semanal el domingo"}</div></div></div>
  </div>`;
}
function vHabits() { return `${nav("Hábitos", { back: "Ajustes", sub: "Constancia, no perfección." })}${C.habits.map(h => `<h2 class="sec">${esc(h.title)}</h2><div class="group"><div class="prose">${h.body}</div></div>`).join("")}`; }
function vAdjust() { return `${nav("Ajustes de calorías", { back: "Ajustes" })}<div class="group">${C.adjustRules[S.profile.goal || "recomp"].map(r => `<div class="row top"><div class="main"><div class="title">${esc(r.when)}</div><div class="meta">${esc(r.act)}</div></div></div>`).join("")}</div><p class="note">${esc(C.adjustLimit)}</p>`; }
function vSources() {
  return `${nav("Fuentes", { back: "Ajustes" })}<h2 class="sec">Notas honestas</h2><div class="group"><div class="prose">${fill(C.honesty)}</div></div>
  <h2 class="sec">Evidencia usada</h2><div class="group">${C.sources.map(s => s.u ? `<a class="row top" href="${s.u}" target="_blank" rel="noopener"><div class="main"><div class="title">${esc(s.t)}</div><div class="meta">${esc(s.why)}</div></div>${I.chev}</a>` : `<div class="row top"><div class="main"><div class="title">${esc(s.t)}</div><div class="meta">${esc(s.why)}</div></div></div>`).join("")}</div>
  <p class="note">Las fuentes sin enlace las cité de resúmenes: verifícalas en el texto original antes de depender de ellas. Los pesos sugeridos y los valores nutricionales son estimaciones.</p>
  <h2 class="sec">Tus cálculos</h2><div class="group"><div class="prose"><p>Mantenimiento estimado: ${num(planCalc().maintLo)}–${num(planCalc().maintHi)} kcal (fórmula de Mifflin-St Jeor × actividad 1.45–1.65). ${S.profile.goal === "muscle" ? "Superávit" : "Déficit"} de ${planCalc().pct} %${planCalc().adj ? ` con un ajuste de ${planCalc().adj > 0 ? "+" : "−"}${Math.abs(planCalc().adj)} kcal` : ""}.</p>${planCalc().floorHit ? "<p><strong>Aviso:</strong> tu meta quedaría por debajo de un mínimo razonable, así que se subió. Si tu peso es bajo, no uses un déficit agresivo.</p>" : ""}</div></div>`;
}
function vSettings() {
  return `${nav("Perfil y equipo", { back: "Ajustes", to: "#/plan" })}
  <h2 class="sec">Tu perfil</h2>
  <div class="group" id="prof">${profileFields(S.profile, "pf")}</div>
  <h2 class="sec">Tu equipo</h2>
  <div class="group" id="eqp">
    <div class="field"><label for="eq-db">Mancuernas (si entrenas con ellas)</label><select id="eq-db">${[10, 20, 30, 40].map(v => `<option value="${v}" ${equip().dbMax === v ? "selected" : ""}>${v === 40 ? "40 kg o más cada una" : v === 10 ? "10 kg cada una o menos" : "Hasta " + v + " kg cada una"}</option>`).join("")}</select></div>
    <div class="field"><label for="eq-bench">¿Tienes banca?</label><select id="eq-bench"><option value="si" ${equip().bench ? "selected" : ""}>Sí</option><option value="no" ${equip().bench ? "" : "selected"}>No</option></select></div>
    <div class="field"><label for="eq-pull">Gimnasio: ¿puedes hacer 5 o más dominadas?</label><select id="eq-pull"><option value="si" ${equip().pull ? "selected" : ""}>Sí</option><option value="no" ${equip().pull ? "" : "selected"}>No</option></select></div>
    <div class="field"><label for="eq-dips">Gimnasio: ¿y 5 o más fondos?</label><select id="eq-dips"><option value="si" ${equip().dips ? "selected" : ""}>Sí</option><option value="no" ${equip().dips ? "" : "selected"}>No</option></select></div>
    <div class="field"><label for="eq-bar">¿Tienes barra de dominadas? (en casa)</label><select id="eq-bar"><option value="si" ${equip().bar ? "selected" : ""}>Sí</option><option value="no" ${equip().bar ? "" : "selected"}>No</option></select></div>
  </div>
  <h2 class="sec">Reto</h2>
  <div class="group">
    <div class="field"><label for="se-date">Día 1 del reto</label><input id="se-date" type="date" value="${esc(S.start)}"></div>
    <div class="field"><label for="se-we">Fin de semana</label><select id="se-we"><option value="sab" ${S.weekend === "sab" ? "selected" : ""}>Entreno sábado, descanso domingo</option><option value="dom" ${S.weekend === "dom" ? "selected" : ""}>Entreno domingo, descanso sábado</option></select></div>
  </div>`;
}

/* ───────── Temporizador y registro ───────── */
let restEnd = 0;
let audioCtx = null;
function beep() { if (!S.sound) return; try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.001, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.25, audioCtx.currentTime + .02); g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .5); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + .5); } catch (e) {} }
function startRest(sec, label = "Descanso") {
  const el = $("#rest"); if (!el) return;
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch (e) {}
  clearInterval(restT); restEnd = Date.now() + sec * 1000; el.classList.add("on"); $("#rest .lbl").textContent = label;
  const tick = () => {
    restLeft = Math.max(0, Math.ceil((restEnd - Date.now()) / 1000));
    const t = $("#rest .t"); if (t) t.textContent = `${Math.floor(restLeft / 60)}:${String(restLeft % 60).padStart(2, "0")}`;
    if (restLeft <= 0) { clearInterval(restT); vibrate([200, 100, 200]); beep(); toast(label === "Cardio" ? "Cardio terminado" : "Descanso terminado"); $("#rest")?.classList.remove("on"); }
  };
  tick(); restT = setInterval(tick, 250);
}
function blockCtx() { const c = $("#blk-ctx"); if (!c) return null; const [id, bi] = c.value.split("|"), s = SESSIONS().find(x => x.id === id); return { s, b: blocksOf(s)[+bi], id, bi: +bi }; }
function saveRound(r, setDone) {
  const ctx = blockCtx(); if (!ctx) return;
  const iso = todayISO();
  ctx.b.items.forEach((it, ii) => {
    const w = $(`[data-i="${ii}"][data-r="${r}"][data-f="w"]`), rp = $(`[data-i="${ii}"][data-r="${r}"][data-f="r"]`);
    const hist = S.hist[it.k] = S.hist[it.k] || [];
    let day = hist.find(x => x.d === iso); if (!day) { day = { d: iso, sets: [] }; hist.push(day); hist.sort((a, b) => a.d < b.d ? -1 : 1); }
    while (day.sets.length <= r) day.sets.push({ w: null, r: null, done: false });
    const cur = day.sets[r];
    cur.w = w.value === "" ? null : +w.value; cur.r = rp.value === "" ? null : +rp.value;
    if (setDone !== undefined) {
      cur.done = setDone;
      if (setDone) { if (cur.w === null) { const sg = suggest(it); if (sg.n != null) { cur.w = sg.n; w.value = sg.n; } } if (cur.r === null) { const lr = lowReps(it.reps); if (lr !== null) { cur.r = lr; rp.value = lr; } } }
    }
  });
  save();
}
function checkSessionComplete(s) {
  const pr = sessionProgress(s);
  if (pr.done === pr.total && !sessionDoneOn(todayISO(), s.id)) { checksOf(todayISO())["s_" + s.id] = true; save(); celebrate("Entrenamiento completo"); vibrate([30, 60, 30]); }
}
let lastPR = [];
function checkPR(r) {
  const ctx = blockCtx(); if (!ctx) return;
  S.prs = S.prs || {}; lastPR = [];
  ctx.b.items.forEach(it => { const c = getSets(it.k)[r]; if (!c || !c.done || !c.w) return; const e = e1rm(c.w, c.r), prev = S.prs[it.k]; if (prev === undefined) S.prs[it.k] = e; else if (e > prev * 1.001) { S.prs[it.k] = e; lastPR.push(D.EX[it.k].name); } });
  save();
}
function afterTick() {
  const ctx = blockCtx(); if (!ctx) return;
  checkSessionComplete(ctx.s);
}

/* ───────── Eventos ───────── */
function bind() {
  $("[data-to]")?.addEventListener("click", e => go(e.currentTarget.dataset.to));
  $$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
  $$("[data-mode]").forEach(b => b.addEventListener("click", () => { segMove(b); S.mode = b.dataset.mode; save(); vibrate(8); setTimeout(refresh, 260); }));
  $$("[data-check]").forEach(c => c.addEventListener("change", () => { checksOf(todayISO())[c.dataset.check] = c.checked; save(); vibrate(8); }));
  $$("[data-eat]").forEach(b => b.addEventListener("click", () => { const e = S.eaten[todayISO()] = S.eaten[todayISO()] || {}, s = b.dataset.eat; e[s] = !e[s]; if (e[s]) popSel = `[data-eat="${s}"] .circle`; save(); vibrate(10); refresh(); }));
  $$("[data-water]").forEach(b => b.addEventListener("click", () => { const c = checksOf(todayISO()); c.water = Math.max(0, Math.min(6000, (c.water || 0) + +b.dataset.water)); save(); vibrate(8); refresh(); }));
  $("#steps")?.addEventListener("change", e => { checksOf(todayISO()).steps = +e.target.value || 0; save(); toast("Pasos guardados"); });
  $$("button[data-theme]").forEach(b => b.addEventListener("click", () => { segMove(b); S.theme = b.dataset.theme; applyTheme(); save(); vibrate(8); }));
  $$("button[data-sharew]").forEach(b => b.addEventListener("click", () => { segMove(b); shareW = b.dataset.sharew; drawShare(); }));
  $("#rm-train")?.addEventListener("change", e => { if (/^\d\d:\d\d$/.test(e.target.value)) { S.remind.train = e.target.value; save(); } });
  $("#rm-weigh")?.addEventListener("change", e => { if (/^\d\d:\d\d$/.test(e.target.value)) { S.remind.weigh = e.target.value; save(); } });
  $("#sd-on")?.addEventListener("change", e => { S.sound = e.target.checked; save(); if (S.sound) beep(); });
  $$("button[data-accent]").forEach(b => b.addEventListener("click", () => { segMove(b); S.accent = b.dataset.accent; applyAccent(); save(); vibrate(8); }));
  $$("[data-adj]").forEach(b => { if (!b.closest("#rev-out")) b.addEventListener("click", () => adjustKcal(b.dataset.adj)); });
  $$("[data-choice]").forEach(b => b.addEventListener("click", () => { const [k, v] = b.dataset.choice.split("|"); onb.d[k] = ["days", "pct", "dbMax"].includes(k) ? +v : v; if (k === "goal") onb.d.pct = null; vibrate(8); if (b.closest(".seg")) { segMove(b); setTimeout(refresh, 240); } else refresh(); }));
  [["#ob-age", "age"], ["#ob-h", "h"], ["#ob-kg", "kg"], ["#ob-date", "date"]].forEach(([sel, k]) => $(sel)?.addEventListener("input", e => { onb.d[k] = e.target.value; }));
  $("#ob-name")?.addEventListener("input", e => { onb.d.name = cleanName(e.target.value); });
  $$("[data-onb]").forEach(b => b.addEventListener("click", () => {
    const a = b.dataset.onb;
    if (a === "back") { onb.step = Math.max(0, onb.step - 1); return refresh(); }
    const err = onbValid(onb.step, onb.d); if (err) return toast(err);
    if (a === "next") { onb.step++; render(); } else act("start", b);
  }));
  $$("[data-swapto]").forEach(b => b.addEventListener("click", () => { const parts = b.dataset.swapto.split("|"), k = parts.pop(), key = parts.join("|"); S.swaps = S.swaps || {}; if (k) S.swaps[key] = k; else delete S.swaps[key]; save(); vibrate(10); toast(k ? "Ejercicio cambiado" : "Ejercicio original"); const [sid, , bi] = parts; go(`#/bloque/${sid}/${bi}`); }));
  $$("[data-cmetric]").forEach(b => b.addEventListener("click", () => { segMove(b); chartMetric = b.dataset.cmetric; $("#chartbox").innerHTML = chartSvg(); }));
  $$("[data-crange]").forEach(b => b.addEventListener("click", () => { segMove(b); chartRange = +b.dataset.crange; $("#chartbox").innerHTML = chartSvg(); }));
  const bindCal = () => { $$("[data-cal]").forEach(b => b.addEventListener("click", () => { calOffset = Math.min(0, calOffset + +b.dataset.cal); $("#calbox").innerHTML = calHtml(); bindCal(); })); $$("[data-day]").forEach(b => b.addEventListener("click", () => openSheet(longDate(b.dataset.day), dayInfoHtml(b.dataset.day)))); };
  if ($("#calbox")) bindCal();
  $$("[data-angle]").forEach(b => b.addEventListener("click", () => { segMove(b); phAngle = b.dataset.angle; loadPhotos(); }));
  $("#ph-file")?.addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { toast("Guardando foto…"); await Store.addPhoto(f, todayISO(), phAngle); toast("Foto guardada"); vibrate(10); loadPhotos(); } catch { toast("No pude guardar la foto"); } e.target.value = ""; });
  $$("[data-swap]").forEach(b => b.addEventListener("click", () => { const [sid, bi, ii] = b.dataset.swap.split("|"); const se = SESSIONS().find(x => x.id === sid), alts = altsFor(se, +bi, +ii), cur = D.EX[blocksOf(se)[+bi].items[+ii].k], key = `${sid}|${S.mode}|${bi}|${ii}`, swapped = !!(S.swaps || {})[key];
    openSheet("Cambiar ejercicio", `${alts.length ? `<div class="group">${alts.map(a => { const ex = D.EX[a.k]; return `<button class="row" data-swapto="${key}|${a.k}"><img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${ex.id}.gif" width="56" height="56"><div class="main"><div class="title">${esc(ex.name)}</div><div class="meta">${esc(ex.muscle)} · ${esc(a.fam)}</div></div>${I.chev}</button>`; }).join("")}</div><p class="note">Solo ejercicios del mismo músculo y patrón, con tu equipo. Repeticiones y peso se ajustan al nuevo ejercicio.</p>` : `<div class="group"><div class="empty">No hay alternativas equivalentes con tu equipo para este ejercicio.</div></div>`}${swapped ? `<div class="group" style="margin-top:12px"><button class="row" data-swapto="${key}|"><div class="main"><div class="title">Volver al ejercicio original</div></div></button></div>` : ""}`,
    el => $$("[data-swapto]", el).forEach(x => x.addEventListener("click", () => { const parts = x.dataset.swapto.split("|"), k = parts.pop(), kk = parts.join("|"); S.swaps = S.swaps || {}; if (k) S.swaps[kk] = k; else delete S.swaps[kk]; save(); vibrate(10); closeSheet(); toast(k ? "Ejercicio cambiado" : "Ejercicio original"); refresh(); }))); }));
  $$("[data-menu]").forEach(b => b.addEventListener("click", () => { const d = +b.dataset.menu; MEAL_BASE().forEach((m, si) => { S.picks[m.slot] = (d + si) % m.opts.length; }); save(); vibrate(10); toast("Menú aplicado a hoy"); go("#/comida"); }));
  $$("[data-pick]").forEach(b => b.addEventListener("click", () => { S.picks[b.dataset.slot] = +b.dataset.pick; save(); $$("[data-pick]").forEach(x => { const on = x === b; x.setAttribute("aria-checked", on); x.querySelector(".opt-radio").classList.toggle("on", on); }); vibrate(8); }));
  $$("[data-rq]").forEach(i => i.type === "range" && i.addEventListener("input", () => { $("#rv-" + i.dataset.rq).textContent = i.value; }));
  $$("[data-f]").forEach(i => i.addEventListener("input", () => saveRound(+i.dataset.r)));
  $$("[data-tick]").forEach(b => b.addEventListener("click", () => {
    const rEl = b.closest(".round"), r = +b.dataset.tick, on = !rEl.classList.contains("done");
    saveRound(r, on); if (on) checkPR(r); vibrate(10); afterTick(); const ctx = blockCtx();
    if (on) popSel = `.round[data-round="${r}"] .tick`;
    refresh();
    if (on && lastPR.length) { toast(`Récord personal: ${lastPR[0]}`); vibrate([20, 40, 20]); lastPR = []; }
    else if (on) { if (blockProgress(ctx.b) === ctx.b.rounds) toast("Bloque terminado"); }
    if (on && blockProgress(ctx.b) < ctx.b.rounds) startRest(ctx.b.rest);
  }));
  $$("[data-ckind]").forEach(b => b.addEventListener("click", () => { segMove(b); S.cardioKind = b.dataset.ckind; save(); setTimeout(refresh, 260); }));
  $$("[data-ctimer]").forEach(b => b.addEventListener("click", () => { startRest(+b.dataset.ctimer, "Cardio"); vibrate(10); }));
  $$("[data-cdone]").forEach(b => b.addEventListener("click", () => {
    const [key, m, sid] = b.dataset.cdone.split("|"), iso = todayISO(), day = S.cardio[iso] = S.cardio[iso] || {};
    const on = !day[key]?.done; day[key] = { done: on, min: +m, kind: S.cardioKind || cardioKinds()[0].id }; save(); vibrate(12);
    const s = SESSIONS().find(x => x.id === sid); if (on) checkSessionComplete(s); else if (sessionDoneOn(iso, sid)) { checksOf(iso)["s_" + sid] = false; save(); }
    toast(on ? "Cardio registrado" : "Desmarcado"); go(`#/entreno/${sid}`);
  }));
  $$("[data-rest]").forEach(b => b.addEventListener("click", () => { if (b.dataset.rest === "add") restEnd += 15000; else { clearInterval(restT); $("#rest").classList.remove("on"); } }));
  $("#imp")?.addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { if (f.size > 5e6) throw new Error("grande"); const n = normalizeState(JSON.parse(await f.text())); if (!n.profile || !n.start) throw new Error("vacío"); S = n; _plan = { k: "", v: null }; save(); toast("Copia importada"); go("#/hoy"); } catch { toast("Archivo no válido"); } e.target.value = ""; });
  [["st", "#st-goal"], ["pf", "#pf-goal"]].forEach(([ids, sel]) => $(sel)?.addEventListener("change", e => { $("#" + ids + "-pct").innerHTML = paceOptions(e.target.value); }));
  $$("#prof select, #prof input").forEach(i => i.addEventListener("change", () => { const pr = readProfile("pf"); if (typeof pr === "string") return toast(pr); S.profile = pr; save(); toast("Perfil actualizado"); }));
  $$("#eqp select").forEach(i => i.addEventListener("change", () => { S.profile.equip = { dbMax: +$("#eq-db").value, bench: $("#eq-bench").value === "si", bar: $("#eq-bar").value === "si", pull: $("#eq-pull").value === "si", dips: $("#eq-dips").value === "si" }; S.swaps = {}; _plan = { k: "", v: null }; save(); toast("Equipo actualizado"); }));
  $("#se-date")?.addEventListener("change", e => { if (e.target.value) { S.start = e.target.value; save(); toast("Fecha actualizada"); } });
  $("#se-we")?.addEventListener("change", e => { S.weekend = e.target.value; save(); toast("Fin de semana actualizado"); });
  $$("[data-act]").forEach(b => b.addEventListener("click", () => act(b.dataset.act, b)));
}
let sheetEl = null;
function closeSheet(now) { if (!sheetEl) return; const el = sheetEl; sheetEl = null; el.classList.remove("on"); try { el._prev && el._prev.isConnected && el._prev.focus({ preventScroll: true }); } catch {} setTimeout(() => el.remove(), now ? 0 : 320); }
function openSheet(title, html, bind) {
  closeSheet(true); const prevFocus = document.activeElement;
  const el = document.createElement("div"); el.className = "sheet-wrap"; el._prev = prevFocus;
  el.innerHTML = `<div class="sheet-bd"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-top"><div class="sheet-grab" aria-hidden="true"></div><div class="sheet-h"><b>${esc(title)}</b><button class="nb-btn" data-sheet-close>Cerrar</button></div></div><div class="sheet-b">${html}</div></div>`;
  document.body.appendChild(el); sheetEl = el; requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("on")));
  const sh = $(".sheet", el), top = $(".sheet-top", el); let y0 = null, dy = 0;
  $(".sheet-bd", el).addEventListener("click", () => closeSheet());
  $("[data-sheet-close]", el).addEventListener("click", () => closeSheet()); $("[data-sheet-close]", el).focus({ preventScroll: true });
  top.addEventListener("pointerdown", e => { y0 = e.clientY; dy = 0; sh.style.transition = "none"; top.setPointerCapture(e.pointerId); });
  top.addEventListener("pointermove", e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sh.style.transform = `translateY(${dy}px)`; });
  const end = () => { if (y0 === null) return; y0 = null; sh.style.transition = ""; sh.style.transform = ""; if (dy > 110) closeSheet(); };
  top.addEventListener("pointerup", end); top.addEventListener("pointercancel", end);
  bind && bind(el);
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeSheet();
  if (e.key === "Tab" && sheetEl) { const f = [...sheetEl.querySelectorAll("button, a[href], input, select, [tabindex]:not([tabindex='-1'])")].filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } else if (!sheetEl.contains(document.activeElement)) { e.preventDefault(); a.focus(); } }
  const rg = e.target.closest && e.target.closest("[role=radiogroup]");
  if (rg && ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) { const r = [...rg.querySelectorAll("[role=radio]")], i = r.indexOf(e.target); if (i < 0) return; e.preventDefault(); const n = r[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : r.length - 1)) % r.length]; n.focus(); n.click(); }
});
window.addEventListener("hashchange", () => closeSheet(true));
let celT = null;
function celebrate(text) {
  clearTimeout(celT); $(".celebrate")?.remove();
  const el = document.createElement("div"); el.className = "celebrate"; el.setAttribute("role", "status");
  el.innerHTML = `<div class="cel-card"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 14-16"/></svg><b>${esc(text)}</b></div>`;
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add("on"));
  celT = setTimeout(() => { el.classList.remove("on"); setTimeout(() => el.remove(), 350); }, 1700);
}
function adjustKcal(v) {
  S.profile.adj = v === "reset" ? 0 : clamp((S.profile.adj || 0) + +v, -450, 450); save(); vibrate(12); toast(v === "reset" ? "Ajuste quitado" : "Metas actualizadas"); refresh();
}
function act(a, el) {
  const iso = todayISO();
  if (a === "start") {
    const d = onb.d;
    S.profile = { name: cleanName(d.name), sex: d.sex, age: +d.age, h: +d.h, kg: parseFloat(d.kg), level: d.level, goal: d.goal, pct: d.pct ?? C.goals[d.goal].pace, days: +d.days, diet: d.diet, adj: 0, equip: { bench: d.bench !== "no", bar: d.bar === "si", dbMax: +d.dbMax, pull: d.pull === "si", dips: d.dips === "si" } };
    S.swaps = {}; S.start = d.date || iso; S.weekend = d.weekend; S.mode = d.mode; S.weights = { [S.start]: S.profile.kg }; _plan = { k: "", v: null };
    save(); onb = ONB(); if (window.Store) Store.persist(); go("#/hoy"); toast("Listo: día 1");
  } else if (a === "saveweight") {
    const v = parseFloat($("#w-today").value);
    if (!(v > 30 && v < 300)) return toast("Escribe un peso válido (kg)");
    S.weights[iso] = v; save(); toast("Peso guardado"); render();
  } else if (a === "savewaist") {
    const v = parseFloat($("#waist").value);
    if (!(v > 40 && v < 200)) return toast("Escribe la cintura en cm");
    S.waists[iso] = v; save(); toast("Cintura guardada"); render();
  } else if (a === "intro") { S.intro = true; save(); refresh();
  } else if (a === "finish") {
    const c = checksOf(iso), k = "s_" + el.dataset.id; c[k] = !c[k]; save(); vibrate(15); toast(c[k] ? "Entrenamiento completado" : "Desmarcado"); render();
  } else if (a === "review") {
    const ans = {}; C.reviewQuestions.forEach(q => { const i = $("#rq-" + q.id); ans[q.id] = q.yesno ? i.checked : +i.value; });
    const adv = reviewAdvice(ans); S.reviews[weekNum()] = { ...ans, ...adv.flags }; save();
    $("#rev-out").innerHTML = `<h2 class="sec">Recomendación</h2><div class="group"><div class="prose">${adv.paras.map(t => `<p>${t}</p>`).join("")}</div></div>${adv.delta ? `<div class="btn-wrap"><button class="btn" data-adj="${adv.delta}">${adv.delta > 0 ? "Subir" : "Bajar"} ${Math.abs(adv.delta)} kcal en mis metas</button></div><p class="note">Se aplica a todos tus días y recalcula las porciones.</p>` : ""}`;
    $$("#rev-out [data-adj]").forEach(b => b.addEventListener("click", () => adjustKcal(b.dataset.adj)));
    $("#rev-out").scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (a === "tiphoy") { S.tips = S.tips || {}; S.tips.hoy = true; save(); refresh();
  } else if (a === "savebody") {
    const keys = ["cintura", "pecho", "brazo", "muslo", "cadera"]; S.body = S.body || {}; let n = 0;
    keys.forEach(k => { const v = parseFloat($("#m-" + k)?.value); if (v >= 10 && v <= 250) { n++; if (k === "cintura") S.waists[iso] = v; else (S.body[iso] = S.body[iso] || {})[k] = v; } });
    if (!n) return toast("Escribe al menos una medida en cm");
    save(); vibrate(10); toast("Medidas guardadas"); refresh();
  } else if (a === "offline") {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return toast("Abre la app una vez más y vuelve a intentar");
    const info = $("#d-offline"); if (info) info.textContent = "Descargando… 0 %"; navigator.serviceWorker.controller.postMessage("precache"); toast("Descargando ejercicios");
  } else if (a === "copydata") {
    try { navigator.clipboard.writeText(JSON.stringify(S)).then(() => toast("Datos copiados"), () => toast("No pude copiar")); } catch { toast("No pude copiar"); }
  } else if (a === "export") {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    const l = document.createElement("a"); l.href = URL.createObjectURL(blob); l.download = `reto90-${iso}.json`; l.click(); S.lastExport = iso; save(); toast("Copia exportada");
  } else if (a === "install") {
    if (!installEv) return toast("Usa el menú del navegador para instalar");
    installEv.prompt(); installEv.userChoice.then(r => { installEv = null; toast(r.outcome === "accepted" ? "Instalando…" : "Cuando quieras, desde Ajustes"); refresh(); }, () => {});
  } else if (a === "ics") {
    const pad = n => String(n).padStart(2, "0"), ymd = d => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()), now = new Date();
    const stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + "T" + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
    const BY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], hm = t => t.replace(":", "") + "00";
    const ev = (uid, start, t, rule, name, dur) => ["BEGIN:VEVENT", `UID:${uid}@reto90`, `DTSTAMP:${stamp}`, `DTSTART:${ymd(start)}T${hm(t)}`, `DURATION:PT${dur}M`, rule, `SUMMARY:${name}`, "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${name}`, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT"].filter(Boolean).join("\r\n");
    const first = wd => { const d = new Date(); d.setHours(12, 0, 0, 0); while (d.getDay() !== wd) d.setDate(d.getDate() + 1); return d; };
    const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Reto 90//ES", "CALSCALE:GREGORIAN"];
    SESSIONS().forEach((x, i) => out.push(ev("train" + i, first(x.wd), S.remind.train, `RRULE:FREQ=WEEKLY;BYDAY=${BY[x.wd]};COUNT=13`, "Reto 90: " + x.name, 60)));
    const t0 = new Date(); t0.setHours(12, 0, 0, 0); out.push(ev("weigh", t0, S.remind.weigh, "RRULE:FREQ=DAILY;COUNT=90", "Reto 90: pésate en ayunas", 10), "END:VCALENDAR");
    const l = document.createElement("a"); l.href = URL.createObjectURL(new Blob([out.join("\r\n")], { type: "text/calendar;charset=utf-8" })); l.download = "reto90-recordatorios.ics"; l.click(); toast("Ábrelo para añadirlo al calendario");
  } else if (a === "share") {
    const cv = $("#shr"); if (!cv) return;
    cv.toBlob(async b => {
      if (!b) return toast("No pude crear la imagen");
      const f = new File([b], "reto90-progreso.png", { type: "image/png" });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: "Reto 90" }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
      const l = document.createElement("a"); l.href = URL.createObjectURL(b); l.download = "reto90-progreso.png"; l.click(); toast("Imagen guardada");
    }, "image/png");
  } else if (a === "print") {
    try { window.print(); } catch { toast("No pude abrir la impresión"); }
  } else if (a === "csv") {
    const q = v => { let t = String(v ?? ""); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };
    const out = [["Día", "Comida", "Horario", "Platillo", "Ingredientes", "kcal", "Proteína (g)", "Carbohidratos (g)", "Grasas (g)"]];
    weekMenu().forEach(d => { d.meals.forEach(x => out.push([d.dn, x.slot, x.time, x.v.name, x.v.items.join(", "), x.v.m.kcal, x.v.m.p, x.v.m.c, x.v.m.g])); out.push([d.dn, "TOTAL DEL DÍA", "", "", "", d.tot.kcal, d.tot.p, d.tot.c, d.tot.g]); });
    out.push([], ["LISTA DE COMPRAS (7 días)", "Producto", "Cantidad"]);
    shopData().forEach(([t, it]) => it.forEach(([n, qty]) => out.push([t, n, qty])));
    const text = "\ufeff" + out.map(r => r.map(q).join(",")).join("\r\n");
    const l = document.createElement("a"); l.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" })); l.download = `menu-${S.profile.name ? S.profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" : ""}${iso}.csv`; l.click(); toast("Menú descargado (CSV)");
  } else if (a === "reset") {
    if (confirm("¿Borrar todos tus datos y reiniciar? No se puede deshacer.")) { LS.removeItem(KEY); S = defaults(); go("#/inicio"); render(); }
  }
}

if (window.Store && Store.available()) {
  if (!LS.getItem(KEY)) Store.getKV("backup").then(b => { if (b) { try { const n = normalizeState(JSON.parse(b)); if (!n.profile || !n.start) return; S = n; LS.setItem(KEY, JSON.stringify(n)); _plan = { k: "", v: null }; toast("Recuperamos tus datos"); go("#/hoy"); if (parseHash()[0] === "hoy") render(); } catch {} } }).catch(() => {});
  if (S.start) Store.persist();
}
if (location.hostname === "localhost" && LS.getItem("reto90.debug")) window.__reto = { get S() { return S; }, set S(v) { S = v; }, SESSIONS, planCalc, D, C, blocksOf, altsFor, suggest, equip, render };
const applyTheme = () => {
  const t = S.theme === "light" || S.theme === "dark" ? S.theme : null, root = document.documentElement;
  if (t) root.dataset.theme = t; else delete root.dataset.theme;
  const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.setAttribute("content", dark ? "#000000" : "#f2f2f7"); m.removeAttribute("media"); });
};
const applyAccent = () => { document.documentElement.dataset.accent = S.accent || "naranja"; };
applyAccent(); applyTheme();
try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme); } catch (e) {}
let sx = 0, sy = 0, edge = false;
document.addEventListener("touchstart", e => { const t = e.touches[0]; edge = t.clientX < 24 && !sheetEl; sx = t.clientX; sy = t.clientY; }, { passive: true });
document.addEventListener("touchend", e => { if (!edge) return; edge = false; const t = e.changedTouches[0]; if (t.clientX - sx > 80 && Math.abs(t.clientY - sy) < 60) $("[data-to]")?.click(); }, { passive: true });
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEv = e; if (/^#\/(plan\/ajustes|progreso\/datos)/.test(location.hash)) refresh(); });
window.addEventListener("appinstalled", () => { installEv = null; toast("App instalada"); if (/^#\/(plan\/ajustes|progreso\/datos)/.test(location.hash)) refresh(); });
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
  navigator.serviceWorker.addEventListener("message", e => { const d = e.data || {}, info = $("#d-offline"); if (d.type === "precache" && info) info.textContent = d.done >= d.total ? "Listo: los ejercicios están guardados en tu teléfono" : `Descargando… ${Math.round(d.done / d.total * 100)} %`; });
}
render();
})();
