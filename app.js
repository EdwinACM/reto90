(() => {
const D = window.DATA, C = window.CONTENT;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app"), tabsEl = $("#tabs");
const KEY = "reto90.v1";
const KG_LB = 2.20462, CM_IN = 0.393701;
const lbOn = () => !!(S && S.units && S.units.w === "lb"), inOn = () => !!(S && S.units && S.units.l === "in");
const wU = () => lbOn() ? "lb" : "kg", lU = () => inOn() ? "in" : "cm";
const wd = kg => lbOn() ? kg * KG_LB : kg, fromW = x => lbOn() ? x / KG_LB : x;
const ld = cm => inOn() ? cm * CM_IN : cm, fromL = x => inOn() ? x / CM_IN : x;
const trimN = (v, d = 1) => { const r = Math.round(v * 10 ** d) / 10 ** d; return Number.isInteger(r) ? String(r) : r.toFixed(d); };
const fw = (kg, d = 1) => trimN(wd(kg), d), fwi = kg => lbOn() ? trimN(Math.round(wd(kg) * 2) / 2, 1) : trimN(kg, 2), fl = (cm, d = 1) => trimN(ld(cm), d);
const fwt = (kg, d = 1) => `${fmt(wd(kg), d)} ${wU()}`;
const dbLabel = v => !lbOn() ? (v === 40 ? "40 kg o más cada una" : v === 10 ? "10 kg cada una o menos" : `Hasta ${v} kg cada una`) : (v === 40 ? "90 lb o más cada una" : v === 10 ? "22 lb cada una o menos" : `Hasta ${Math.round(v * KG_LB)} lb cada una`);
const LS = (() => { const mem = {}; let ok = true; try { localStorage.setItem("_t", "1"); localStorage.removeItem("_t"); } catch (e) { ok = false; }
  return { persistent: ok, getItem: k => { if (ok) { try { return localStorage.getItem(k); } catch (e) {} } return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }, setItem: (k, v) => { mem[k] = String(v); if (ok) { try { localStorage.setItem(k, v); } catch (e) {} } }, removeItem: k => { delete mem[k]; if (ok) { try { localStorage.removeItem(k); } catch (e) {} } } }; })();

/* ───────── Estado ───────── */
const todayISO = (d = new Date()) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return todayISO(d); };
const diffDays = (a, b) => Math.round((new Date(a + "T12:00:00") - new Date(b + "T12:00:00")) / 864e5);
const defaults = () => ({ body: {}, prs: {}, lastExport: null, tips: {}, swaps: {}, accent: "naranja", photos: false, avoid: {}, autoDl: null, calAt: null, fb: {}, goalKg: null, notify: false, wake: true, myEx: {}, custom: {}, units: { w: "kg", l: "cm" }, notes: {}, enotes: {}, badges: {}, badgesInit: false, theme: "auto", sound: true, remind: { train: "18:00", weigh: "07:00" }, profile: null, cardio: {}, intro: false, start: null, weekend: "sab", mode: "gym", weights: {}, waists: {}, checks: {}, hist: {}, picks: {}, eaten: {}, reviews: {} });
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = o => !!o && typeof o === "object" && !Array.isArray(o);
const okKey = k => typeof k === "string" && k.length < 80 && k !== "__proto__" && k !== "constructor" && k !== "prototype";
const numIn = (v, lo, hi) => (typeof v === "number" && isFinite(v) && v >= lo && v <= hi) ? v : null;
const validDate = v => typeof v === "string" && DATE_RE.test(v) && !isNaN(Date.parse(v + "T12:00:00"));
function cleanMap(src, fn) { const out = {}; if (!isObj(src)) return out; Object.keys(src).forEach(k => { if (!okKey(k) || !validDate(k)) return; const v = fn(src[k]); if (v !== undefined && v !== null) out[k] = v; }); return out; }
/* Nada de lo que viene de fuera (archivo importado, copia restaurada) entra al estado sin pasar por aquí:
   solo claves conocidas, tipos y rangos válidos. Así no puede inyectar HTML ni romper la app. */
const SLOTS = new Set([...D.MEALS, ...D.MEALS_VEG].map(m => m.slot).concat("Snack", "Merienda"));
const HEALTH_OPTS = { inj: ["hombro", "rodilla", "espalda", "muñeca"], cond: ["presion", "diabetes", "corazon", "embarazo"], alg: ["lactosa", "gluten", "huevo", "nueces", "pescado"] };
const cleanHealth = h => { const o = {}; Object.keys(HEALTH_OPTS).forEach(k => { o[k] = isObj(h) && Array.isArray(h[k]) ? HEALTH_OPTS[k].filter(x => h[k].includes(x)) : []; }); return o; };
const cleanName = v => typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f<>&"]/g, "").replace(/\s+/g, " ").trim().slice(0, 30) : "";
const MYEX_MUSC = ["pecho", "espalda", "hombro", "hombro posterior", "bíceps", "tríceps", "cuádriceps", "femoral", "glúteo", "pantorrilla", "abdomen"];
function registerMyEx(id, e) {
  D.EX[id] = { id: "custom", name: e.name, muscle: e.muscle.charAt(0).toUpperCase() + e.muscle.slice(1), cues: ["Ejercicio propio."], custom: true };
  D.MUSCLE[id] = e.muscle; D.ALT_DEF[id] = { reps: "8–12", w: e.unit === "kg" ? { n: 10, u: "total" } : null, note: "" };
}
const cleanReps = v => typeof v === "string" ? v.replace(/[^0-9A-Za-záéíóúñÁÉÍÓÚÑ–\-×\s]/g, "").trim().slice(0, 24) : "";
function cleanBlockIn(b) {
  if (!isObj(b) || !["uni", "bi", "tri", "cardio"].includes(b.t)) return null;
  if (b.t === "cardio") return { t: "cardio", rounds: 1, rest: 0, items: [], min: Math.round(numIn(b.min, 5, 180) ?? 20), kind: b.kind === "mix" ? "mix" : "z2", note: "" };
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 3).map(it => isObj(it) && typeof it.k === "string" && okKey(it.k) && D.EX[it.k] ? { k: it.k, reps: cleanReps(it.reps) || "8–12", w: isObj(it.w) && numIn(it.w.n, 0, 1000) !== null && ["c/mano", "stack", "total"].includes(it.w.u) ? { n: it.w.n, u: it.w.u } : null, note: typeof it.note === "string" ? it.note.replace(/[<>&"\u0000-\u001f]/g, "").slice(0, 120) : "" } : null).filter(Boolean);
  return items.length ? { t: b.t, rounds: Math.round(numIn(b.rounds, 1, 8) ?? 3), rest: Math.round(numIn(b.rest, 15, 300) ?? 60), items } : null;
}
function normalizeState(raw) {
  const d = defaults(); if (!isObj(raw)) return d;
  d.units = { w: isObj(raw.units) && raw.units.w === "lb" ? "lb" : "kg", l: isObj(raw.units) && raw.units.l === "in" ? "in" : "cm" };
  d.myEx = {}; if (isObj(raw.myEx)) Object.keys(raw.myEx).slice(0, 40).forEach(k => { const e = raw.myEx[k]; if (/^x\d{1,3}$/.test(k) && isObj(e) && typeof e.name === "string" && MYEX_MUSC.includes(e.muscle)) { const name = e.name.replace(/[<>&"\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 40); if (!name) return; d.myEx[k] = { name, muscle: e.muscle, unit: e.unit === "kg" ? "kg" : "bw" }; registerMyEx(k, d.myEx[k]); } });
  d.custom = {}; if (isObj(raw.custom)) Object.keys(raw.custom).slice(0, 40).forEach(key => { if (!/^(libre|[A-Za-z]{2,12})\|(gym|db|home)$/.test(key) || !Array.isArray(raw.custom[key])) return; d.custom[key] = raw.custom[key].slice(0, 16).map(cleanBlockIn).filter(Boolean); });
  if (isObj(raw.profile)) {
    const p = raw.profile, e = isObj(p.equip) ? p.equip : {};
    const pr = { name: cleanName(p.name), sex: ["m", "f"].includes(p.sex) ? p.sex : null, age: numIn(p.age, 14, 90), h: numIn(p.h, 120, 220), kg: numIn(p.kg, 30, 250), level: Object.keys(C.levels).includes(p.level) ? p.level : "medio", goal: Object.keys(C.goals).includes(p.goal) ? p.goal : "recomp", health: cleanHealth(p.health), pct: [5, 10, 15, 20].includes(p.pct) ? p.pct : null, days: [3, 4, 5, 6].includes(p.days) ? p.days : 6, meals: [3, 4, 5, 6].includes(p.meals) ? p.meals : 6, diet: ["omni", "veg"].includes(p.diet) ? p.diet : "omni", adj: numIn(p.adj, -450, 450) ?? 0, equip: { bench: e.bench !== false, bar: e.bar === true, dbMax: [10, 20, 30, 40].includes(e.dbMax) ? e.dbMax : 20, pull: e.pull === true, dips: e.dips === true } };
    if (pr.sex && pr.age && pr.h && pr.kg) { if (pr.pct === null) pr.pct = C.goals[pr.goal].pace; d.profile = pr; }
  }
  d.start = d.profile && validDate(raw.start) ? raw.start : null;
  d.weekend = raw.weekend === "dom" ? "dom" : "sab"; d.mode = ["gym", "db", "home"].includes(raw.mode) ? raw.mode : "gym";
  d.accent = ["naranja", "azul", "morado", "rosa"].includes(raw.accent) ? raw.accent : "naranja";
  d.photos = raw.photos === true;
  d.notes = {}; if (isObj(raw.notes)) Object.keys(raw.notes).slice(-400).forEach(k => { if (/^\d{4}-\d{2}-\d{2}\|[A-Za-z]{2,12}$/.test(k) && validDate(k.slice(0, 10)) && typeof raw.notes[k] === "string") { const t = raw.notes[k].replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, 500); if (t.trim()) d.notes[k] = t; } });
  d.enotes = {}; if (isObj(raw.enotes)) Object.keys(raw.enotes).forEach(k => { if (okKey(k) && D.EX[k] && typeof raw.enotes[k] === "string") { const t = raw.enotes[k].replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, 200); if (t.trim()) d.enotes[k] = t; } });
  d.badges = {}; if (isObj(raw.badges)) Object.keys(raw.badges).forEach(k => { if (/^[a-z0-9]{2,8}$/.test(k) && validDate(raw.badges[k])) d.badges[k] = raw.badges[k]; }); d.badgesInit = raw.badgesInit === true; d.wake = raw.wake !== false; d.avoid = {}; if (isObj(raw.avoid)) Object.keys(raw.avoid).forEach(k => { if (okKey(k) && D.EX[k] && raw.avoid[k] === true) d.avoid[k] = true; }); d.autoDl = validDate(raw.autoDl) ? raw.autoDl : null; d.calAt = validDate(raw.calAt) ? raw.calAt : null; d.fb = {}; if (isObj(raw.fb)) Object.keys(raw.fb).sort().slice(-60).forEach(k => { const v = raw.fb[k]; if (validDate(k) && isObj(v) && ["bien", "carg", "dolor"].includes(v.v)) d.fb[k] = { v: v.v }; }); d.goalKg = numIn(raw.goalKg, 30, 250); d.notify = raw.notify === true; d.theme = ["auto", "light", "dark"].includes(raw.theme) ? raw.theme : "auto"; d.sound = raw.sound !== false;
  const hhmm = v => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  d.remind = { train: isObj(raw.remind) && hhmm(raw.remind.train) ? raw.remind.train : "18:00", weigh: isObj(raw.remind) && hhmm(raw.remind.weigh) ? raw.remind.weigh : "07:00" };
  d.weights = cleanMap(raw.weights, v => numIn(v, 20, 400)); d.waists = cleanMap(raw.waists, v => numIn(v, 30, 250));
  d.body = cleanMap(raw.body, v => { if (!isObj(v)) return null; const o = {}; ["pecho", "brazo", "muslo", "cadera", "hombros", "pantorrilla"].forEach(k => { const n = numIn(v[k], 10, 250); if (n !== null) o[k] = n; }); return o; });
  d.checks = cleanMap(raw.checks, v => { if (!isObj(v)) return null; const o = {}; Object.keys(v).forEach(k => { if (!okKey(k)) return; if (k === "water") { const n = numIn(v[k], 0, 10000); if (n !== null) o[k] = n; } else if (k === "steps") { const n = numIn(v[k], 0, 100000); if (n !== null) o[k] = n; } else if (k === "sleep" || /^s_[A-Za-z]{2,12}$/.test(k)) o[k] = v[k] === true; }); return o; });
  d.eaten = cleanMap(raw.eaten, v => { if (!isObj(v)) return null; const o = {}; Object.keys(v).forEach(k => { if (SLOTS.has(k) && v[k] === true) o[k] = true; }); return o; });
  d.cardio = cleanMap(raw.cardio, v => { if (!isObj(v)) return null; const o = {}; Object.keys(v).forEach(k => { if (okKey(k) && /^[A-Za-z]{2,12}-(gym|db|home)-\d{1,2}$/.test(k) && isObj(v[k])) o[k] = { done: v[k].done === true, min: numIn(v[k].min, 0, 300) ?? 0, ...(numIn(v[k].km, 0.1, 300) ? { km: numIn(v[k].km, 0.1, 300) } : {}), kind: ["cam", "eli", "run"].includes(v[k].kind) ? v[k].kind : "cam" }; }); return o; });
  d.hist = {}; if (isObj(raw.hist)) Object.keys(raw.hist).forEach(k => { if (!okKey(k) || !D.EX[k] || !Array.isArray(raw.hist[k])) return; d.hist[k] = raw.hist[k].slice(-400).filter(x => isObj(x) && validDate(x.d) && Array.isArray(x.sets)).map(x => ({ d: x.d, sets: x.sets.slice(0, 12).map(t => isObj(t) ? { w: numIn(t.w, 0, 1000), r: numIn(t.r, 0, 1000), done: t.done === true, f: t.f === true } : { w: null, r: null, done: false }) })); });
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
  if (window.Acct && S.start) Acct.changed();
  clearTimeout(backupT); backupT = setTimeout(() => { if (window.Store && Store.available() && S.start) Store.setKV("backup", JSON.stringify(S)).catch(() => {}); }, 1200);
};

/* ───────── Utilidades ───────── */
const prop = s => String(s || "").trim().split(/[\s_]+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
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
const weekNum = (iso = todayISO()) => Math.max(1, Math.ceil(dayNum(iso) / 7));
const phaseOf = w => {
  const p = C.phases.find(x => w >= x.weeks[0] && w <= x.weeks[1]); if (p) return p;
  const m = (w - 14) % 4, last = C.phases[C.phases.length - 1];
  return { n: 5 + cycleIdx(w) - 1, name: m === 3 ? "Descarga" : "Continuación", weeks: [w, w], rir: ["2", "1–2", "1 (última serie a 0–1)", "3–4"][m], steps: last.steps, cardioAdd: last.cardioAdd, cardio: last.cardio, goal: "Cada 4 semanas cambian ejercicios del mismo músculo y sube el volumen; la cuarta es de descarga." };
};
const SPLITS = { 3: ["fullA", "fullB", "fullC"], 4: ["upperA", "legsA", "upperB", "legsB"], 5: ["pushA", "pullA", "legsA", "upperB", "legsB"], 6: ["pushA", "pullA", "legsA", "pushB", "pullB", "legsB"] };
const WD_NAME = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 0: "Dom" };
const ABS = new Set(["cable_crunch", "hang_leg", "rev_crunch", "ab_roller", "plank", "side_bridge", "pallof", "crunch", "russian", "dec_crunch", "leg_raise", "bicycle", "dead_bug", "woodchop", "ab_mach", "obl_crunch", "v_up", "side_bend", "w_crunch", "hang_pike", "knee_tuck"]);
let _plan = { k: "", v: null };
const health = () => (S.profile && S.profile.health) || { inj: [], cond: [], alg: [] };
const cons = () => { const h = health(), a = S.profile && S.profile.age; return h.cond.some(c => ["presion", "corazon", "embarazo"].includes(c)) || (a && (a >= 60 || a < 18)); };
const INJ_AVOID = {
  hombro: ["ohp_db", "ohp_bb", "sh_mach", "arnold", "dips", "dip_mach", "bench_dips", "pushup_dec", "inc_bb"],
  rodilla: ["split_db", "bulg", "bw_lunge", "db_lunge", "db_rear_lunge", "step_up", "leg_ext", "hack", "squat_bb", "smith_sq", "goblet", "db_squat", "bw_squat"],
  espalda: ["rdl", "db_rdl", "deadlift", "row_bb", "tbar", "db_row2", "superman", "squat_bb", "ohp_bb", "ab_roller"],
  "muñeca": ["skull", "db_skull", "curl_bb", "preacher", "dips", "bench_dips", "ab_roller", "cgbp"],
  embarazo: ["crunch", "rev_crunch", "ab_roller", "hang_leg", "cable_crunch", "dec_crunch", "leg_raise", "v_up", "w_crunch", "ab_mach", "hang_pike", "bicycle", "obl_crunch", "russian", "plank", "deadlift", "dead_bug"],
};
function avoidSet() { const h = health(), out = new Set(Object.keys(S.avoid || {})); h.inj.forEach(i => (INJ_AVOID[i] || []).forEach(k => out.add(k))); if (h.cond.includes("embarazo")) INJ_AVOID.embarazo.forEach(k => out.add(k)); return out; }
const HEALTH_FALLBACK = { "cuádriceps": ["leg_press", "hip_thrust", "glute_br", "db_rdl", "leg_curl"], hombro: ["lat_raise"], pecho: ["pec_deck", "chest_mach", "db_fly", "db_floor", "cross"], espalda: ["row_cable", "db_row_inc", "row_db", "lat_pd"], "tríceps": ["tri_push", "oh_tri", "db_kickback"], "bíceps": ["hammer", "db_curl", "inc_curl"], femoral: ["leg_curl", "hip_thrust", "glute_br"], "glúteo": ["hip_thrust", "glute_br"], abdomen: ["pallof", "side_bridge", "woodchop", "side_bend"] };
const WRIST_NOTE = { pushup: "Sobre los puños o con barras de flexiones: muñeca recta.", pushup_dec: "Sobre los puños o con barras de flexiones: muñeca recta.", pushup_cl: "Sobre los puños o con barras de flexiones: muñeca recta.", inc_pushup: "Sobre los puños o con barras de flexiones: muñeca recta.", plank: "Sobre los antebrazos." };
function applyHealth(blocks, mode) {
  const av = avoidSet(), wrist = health().inj.includes("muñeca");
  const pr = new Set(blocks.flatMap(x => x.items.map(i => i.k)));
  blocks.forEach(b => { b.items = b.items.map(it => {
    if (!av.has(it.k)) { if (wrist && WRIST_NOTE[it.k]) it.note = WRIST_NOTE[it.k]; return it; }
    pr.delete(it.k); let rep = null;
    Object.values(D.FAMILIES).filter(f => f.items.some(i => i.k === it.k)).some(f => f.items.some(i => { if (!av.has(i.k) && !pr.has(i.k) && exAvail(i.k, mode)) { rep = i.k; return true; } return false; }));
    if (!rep) rep = (HEALTH_FALLBACK[D.MUSCLE[it.k]] || []).find(k => !pr.has(k) && !av.has(k) && exAvail(k, mode)) || null;
    if (!rep) return null; pr.add(rep); const r = resolveItem(rep); if (wrist && WRIST_NOTE[rep]) r.note = WRIST_NOTE[rep]; return r;
  }).filter(Boolean); });
  return blocks.filter(b => b.t === "cardio" || b.items.length).map(b => (b.t !== "cardio" && b.items.length === 1 && b.t !== "uni") ? { ...b, t: "uni" } : b);
}
const ADV = new Set(["squat_bb", "deadlift", "ohp_bb", "inc_bb", "cgbp", "hang_pike"]);
const effLevel = () => { const lv = (S.profile && S.profile.level) || "medio"; return lv === "alto" && (cons() || safety(currentKg()).severe) ? "medio" : lv; };
const okLevel = k => (!ADV.has(k) || (S.profile && S.profile.level === "alto" && !cons())) && !avoidSet().has(k);
const COMPOUND = new Set(["bench_db", "bench_bb", "inc_db", "inc_bb", "ohp_db", "ohp_bb", "sh_mach", "chest_mach", "lat_pd", "pullup", "chinup", "row_cable", "row_db", "row_bb", "tbar", "db_row2", "dips", "cgbp", "smith_sq", "squat_bb", "leg_press", "hack", "rdl", "deadlift", "hip_thrust", "goblet", "db_squat", "db_rdl", "split_db", "bulg", "db_lunge", "step_up", "arnold", "inv_row", "pushup", "pushup_dec"]);
const LEVEL_SWAPS = {
  alto: { gym: { smith_sq: "squat_bb", bench_db: "bench_bb", ohp_db: "ohp_bb", inc_db: "inc_bb", skull: "cgbp", tbar: "deadlift", row_cable: "row_bb" }, db: {}, home: { pushup: "pushup_dec", bw_squat: "bulg" } },
  nuevo: { gym: { rdl: "db_rdl", tbar: "row_cable", skull: "tri_push" }, db: {}, home: { pushup_dec: "pushup", pushup_cl: "inc_pushup" } },
};
const LEVEL_NOTE = { deadlift: "Prioridad: técnica. Sube solo si la espalda se mantiene neutra.", squat_bb: "Con barras de seguridad o un compañero. Baja controlado.", bench_bb: "Con barras de seguridad o un compañero." };
const FREE_BAR = new Set(["squat_bb", "deadlift", "bench_bb", "ohp_bb", "inc_bb", "row_bb", "rdl", "cgbp", "hip_thrust", "smith_sq"]);
const autoDlOn = () => !!S.autoDl && todayISO() <= S.autoDl;
function effortTag(it, lv, dl) { return (dl || cons()) ? "r3" : FREE_BAR.has(it.k) ? "r2" : (lv === "nuevo" && (S.start ? weekNum() : 1) < 5) ? "r2" : "fail"; }
const tagBlocks = (blocks, lv, dl) => { blocks.forEach(b => { if (b.t !== "cardio") b.items.forEach(it => { it.tag = effortTag(it, lv, dl); }); }); return blocks; };
const effortLabel = b => { const t = b.items.map(i => i.tag); return t.includes("fail") ? "Última vuelta: al fallo" : t.includes("r2") ? "Última vuelta: 1–2 en reserva" : "Última vuelta: 3 en reserva"; };
function levelize(blocks, mode, lv, dl) {
  const swaps = (LEVEL_SWAPS[lv] || {})[mode] || {}, has = k => blocks.some(b => b.items.some(i => i.k === k));
  blocks.forEach(b => { b.items = b.items.map(it => { const t = swaps[it.k]; if (!t || has(t)) return it; const r = resolveItem(t); if (LEVEL_NOTE[t]) r.note = LEVEL_NOTE[t]; return r; }); });
  // descansos acordes a cada bloque: básicos largos, aislamientos cortos, abdomen breve
  blocks.forEach((b, i) => {
    if (b.t === "cardio") return;
    const abs = b.items.every(it => ABS.has(it.k)), comp = b.items.some(it => COMPOUND.has(it.k)), n = b.items.length, heavy = i === 0 && comp;
    let r = abs ? 45 : comp ? (heavy ? (lv === "nuevo" ? 90 : lv === "alto" ? 150 : 120) : (lv === "nuevo" ? 75 : 90)) : 60;
    if (n > 1 && comp) r += 15 * (n - 1);
    b.rest = dl ? Math.max(45, r - 15) : cons() ? r + 15 : r;
  });
  // avanzado: última vuelta de aislamiento llevada al límite (técnica de intensidad)
  if (lv === "alto" && !dl && mode !== "home" && !cons()) {
    const iso = blocks.filter(b => b.t !== "cardio" && !b.items.every(it => ABS.has(it.k)) && !b.items.some(it => COMPOUND.has(it.k)));
    iso.slice(-2).forEach(b => b.items.forEach(it => { if (!/fallo/.test(it.note || "")) it.note = ((it.note ? it.note + " " : "") + "Última vuelta: al fallo y, sin descanso, baja el peso 20 % y haz unas repeticiones más.").trim(); }));
  }
  return blocks;
}
function adaptSession(a, wd, goal, lv, days, sex, cyc = 0, dl = false) {
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
    if (lv === "nuevo" && i > 1 && b.rounds >= 3 && !abs) b.rounds -= 1;
    if (lv === "alto" && i === 0) b.rounds = Math.min(5, b.rounds + 1);
  }));
  s.gym = applySkills(s.gym); s.db = applyEquip(s.db, "db"); s.home = applyEquip(s.home, "home");
  ["gym", "db", "home"].forEach(m => {
    s[m] = tagBlocks(applyHealth(rotateBlocks(levelize(s[m], m, lv, dl), m, cyc), m), lv, dl);
    s[m].forEach((b, i) => {
      if (b.t === "cardio") return;
      const abs = b.items.every(it => ABS.has(it.k));
      if (cyc >= 2 && i < 2 && !abs) b.rounds = Math.min(5, b.rounds + (cyc >= 4 ? 2 : 1));
      if (dl) b.rounds = Math.max(2, b.rounds - 1);
    });
  });
  return s;
}
/* Después de la etapa inicial el plan sigue: cada ciclo cambia ejercicios del mismo músculo y patrón, y sube el volumen cada 2 ciclos */
function rotateBlocks(blocks, mode, cyc) {
  if (!cyc) return blocks;
  const mch = mode === "gym" ? "g" : mode === "db" ? "d" : "h", eq = equip(), present = new Set(blocks.flatMap(b => b.items.map(i => i.k)));
  blocks.forEach((b, bi) => {
    if (b.t === "cardio") return;
    b.items = b.items.map((it, ii) => {
      if (bi === 0 && ii === 0 && cyc % 2 === 1) return it;
      const alts = [];
      Object.values(D.FAMILIES).filter(f => f.items.some(i => i.k === it.k)).forEach(f => f.items.forEach(i => {
        const ok = !i.n || mode === "gym" || (i.n === "bench" ? eq.bench : eq.bar);
        if (i.k !== it.k && !present.has(i.k) && i.m.includes(mch) && ok && okLevel(i.k) && !alts.includes(i.k)) alts.push(i.k);
      }));
      if (!alts.length) return it;
      const k = alts[(cyc - 1 + bi + ii) % alts.length]; present.add(k); present.delete(it.k);
      return resolveItem(k);
    });
  });
  return blocks;
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
const MUSC_MIN_ADV = { pecho: 14, espalda: 14, hombro: 12, "hombro posterior": 8, "bíceps": 12, "tríceps": 12, "cuádriceps": 14, femoral: 12, "glúteo": 8, pantorrilla: 10 };
const MUSC_MIN = { pecho: 10, espalda: 10, hombro: 8, "hombro posterior": 6, "bíceps": 8, "tríceps": 8, "cuádriceps": 10, femoral: 8, "glúteo": 6, pantorrilla: 8 };
const MUSC_PREF = {
  hombro: ["lat_raise"], "hombro posterior": ["rev_fly", "face"],
  "bíceps": ["inc_curl", "hammer", "db_curl", "curl_bb", "preacher", "db_conc"],
  "tríceps": ["oh_tri", "db_oh_tri", "tri_push", "db_kickback", "skull", "bench_dips", "pushup_cl"],
  pecho: ["pec_deck", "db_fly", "cross", "inc_pushup", "pushup_dec"], espalda: ["row_cable", "db_row2", "inv_row", "straight_pd", "db_pullover"],
  "cuádriceps": ["leg_ext", "split_db", "db_lunge", "bulg", "bw_lunge"], femoral: ["leg_curl", "db_rdl", "rdl"],
  "glúteo": ["hip_thrust", "glute_br", "abductor"], pantorrilla: ["calf_st", "calf_se", "calf_one", "calf_home"],
};
const MUSC_REGION = { pecho: ["pecho", "hombro", "tríceps"], hombro: ["pecho", "hombro", "tríceps"], "tríceps": ["pecho", "hombro", "tríceps"], espalda: ["espalda", "bíceps", "hombro posterior"], "hombro posterior": ["espalda", "bíceps", "hombro posterior"], "bíceps": ["espalda", "bíceps", "hombro posterior"], "cuádriceps": ["cuádriceps", "femoral", "glúteo", "pantorrilla"], femoral: ["cuádriceps", "femoral", "glúteo", "pantorrilla"], "glúteo": ["cuádriceps", "femoral", "glúteo", "pantorrilla"], pantorrilla: ["cuádriceps", "femoral", "glúteo", "pantorrilla"] };
function exAvail(k, mode) {
  const mch = mode === "gym" ? "g" : mode === "db" ? "d" : "h", eq = equip(); let ok = false;
  Object.values(D.FAMILIES).forEach(f => f.items.forEach(i => { if (i.k === k && i.m.includes(mch) && (!i.n || mode === "gym" || (i.n === "bench" ? eq.bench : eq.bar))) ok = true; }));
  if (!ok) ok = Object.values(D.ARCH).some(a => (a[mode] || []).some(b => b.items.some(it => it.k === k)));
  return ok && okLevel(k);
}
const volOf = (blocks, vol = {}) => { blocks.forEach(b => { if (b.t === "cardio") return; b.items.forEach(it => { const g = D.MUSCLE[it.k]; if (g) vol[g] = (vol[g] || 0) + b.rounds; }); }); return vol; };
/* Si algún músculo queda corto en la semana, se añade un bloque de aislamiento en un día que ya trabaja esa zona */
function balanceMuscles(ss, lv) {
  ["gym", "db", "home"].forEach(m => {
    const vol = {}; ss.forEach(x => volOf(x[m], vol)); const added = new Map();
    Object.keys(MUSC_MIN).forEach(g => {
      const need = lv === "alto" ? MUSC_MIN_ADV[g] : Math.round(MUSC_MIN[g] * (lv === "nuevo" ? 0.75 : 1)), reg = MUSC_REGION[g] || [g];
      let guard = 0;
      while ((vol[g] || 0) < need && guard++ < (lv === "alto" ? 4 : 3)) {
        const cands = ss.filter(x => x[m].some(b => b.t !== "cardio" && b.items.some(it => reg.includes(D.MUSCLE[it.k]))) && (added.get(x.id) || 0) < (m === "home" ? 3 : lv === "alto" ? (ss.length <= 3 ? 5 : 3) : 2)).sort((a, b) => (added.get(a.id) || 0) - (added.get(b.id) || 0) || a[m].length - b[m].length);
        let done = false;
        for (const x of cands) {
          const present = new Set(x[m].flatMap(b => b.items.map(i => i.k))), k = (MUSC_PREF[g] || []).find(e => !present.has(e) && exAvail(e, m)); if (!k) continue;
          const nb = { t: "uni", rounds: 3, rest: 60, items: [resolveItem(k)], key: x.id + "-" + m + "-f" + (added.get(x.id) || 0), sid: x.id };
          nb.items.forEach(it => { it.tag = effortTag(it, lv, false); });
          let at = x[m].findIndex(b => b.t === "cardio" || b.items.every(it => ABS.has(it.k))); if (at < 0) at = x[m].length;
          x[m].splice(at, 0, nb); x[m].forEach((b, i) => { b.idx = i; }); added.set(x.id, (added.get(x.id) || 0) + 1); vol[D.MUSCLE[k]] = (vol[D.MUSCLE[k]] || 0) + 3; done = true; break;
        }
        if (!done) break;
      }
    });
  });
  return ss;
}
function SESSIONS() {
  const p = S.profile, wkN = S.start ? weekNum() : 1, cyc = cycleIdx(wkN), dl = deloadWeek(wkN) || autoDlOn(), k = [p.goal, p.days, p.level, S.weekend, p.sex, JSON.stringify(p.equip || {}), cyc, dl, JSON.stringify(health()), Object.keys(S.avoid || {}).join(",")].join("|");
  if (_plan.k === k) return _plan.v;
  const d = SPLITS[p.days] ? p.days : 6, wds = d === 3 ? [1, 3, 5] : d === 4 ? [1, 2, 4, 5] : d === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, S.weekend === "sab" ? 6 : 0];
  _plan = { k, v: balanceMuscles(SPLITS[d].map((id, i) => adaptSession(D.ARCH[id], wds[i], p.goal || "recomp", effLevel(), d, p.sex, cyc, dl)), effLevel()) };
  return _plan.v;
}
const sessMin = s => Math.round((8 + blocksOf(s).reduce((a, b) => a + (b.t === "cardio" ? b.min : b.rounds * (b.items.length * 0.75 + b.rest / 60)), 0)) / 5) * 5;
const sessionFor = (iso = todayISO()) => { const wd = new Date(iso + "T12:00:00").getDay(); return SESSIONS().find(s => s.wd === wd) || null; };
const modeBlocks = s => S.mode === "home" ? s.home : S.mode === "db" ? s.db : s.gym;
const LIBRE = { id: "libre", name: "Entreno libre", focus: "Lo armas tú", wd: -1, day: "", gym: [], db: [], home: [] };
const sessionById = id => id === "libre" ? LIBRE : SESSIONS().find(x => x.id === id);
const sessMeta = id => D.ARCH[id] || (id === "libre" ? LIBRE : null);
function blocksOf(s) {
  const cu = S.custom && S.custom[s.id + "|" + S.mode];
  if (cu) return cu.map((b, i) => ({ ...b, key: s.id + "-" + S.mode + "-" + i, sid: s.id, idx: i, items: b.items.map(it => ({ ...it, w: it.w ? { ...it.w } : null, tag: effortTag(it, S.profile.level, autoDlOn()) })) }));
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
    if (i.k !== cur && !present.has(i.k) && i.m.includes(mch) && ok && okLevel(i.k) && !out.some(o => o.k === i.k)) out.push({ k: i.k, fam: f.name });
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
function safety(kg) {
  const p = S.profile, h = health(), ht = p.h / 100, bmi = kg / (ht * ht), ideal = 25 * ht * ht;
  return { bmi, ideal, preg: h.cond.includes("embarazo"), minor: p.age < 18, senior: p.age >= 60, under: bmi < 18.5, low: bmi < 20, obese: bmi >= 30, severe: bmi >= 35, heart: h.cond.some(c => ["presion", "corazon"].includes(c)), diab: h.cond.includes("diabetes") };
}
function safetyNotes() {
  const sf = safety(currentKg()), n = [];
  if (sf.preg) n.push("Embarazo o posparto: tu plan no busca bajar de peso, baja la intensidad y evita ejercicios de abdomen y peso muerto. Confirma todo con tu médico.");
  if (sf.minor) n.push("Eres menor de 18 años: el plan mantiene tu peso (sin déficit de calorías) y usa una intensidad moderada. Entrena con supervisión de un adulto.");
  if (sf.under) n.push("Tu peso está por debajo de lo saludable para tu estatura: no se aplica ningún déficit de calorías. Habla con tu médico antes de cambiar tu peso.");
  else if (sf.low) n.push("Tu peso es bajo para tu estatura: el déficit se limitó a un ritmo suave.");
  if (sf.severe) n.push("Con tu peso actual el plan evita correr y saltar para cuidar tus articulaciones. Prioriza caminata inclinada y elíptica.");
  if (sf.senior) n.push("A tu edad el plan usa más descanso, menos intensidad y proteína moderada. Calienta bien y detente si sientes dolor o mareo.");
  if (sf.heart) n.push("Por tu presión o corazón se evitan los esfuerzos al máximo: deja siempre repeticiones en reserva, respira sin contener el aire y consulta a tu médico.");
  if (sf.diab) n.push("Con diabetes: no entrenes en ayunas largos, ten a la mano algo con azúcar y vigila tu glucosa antes y después. Consulta a tu médico.");
  return n;
}
const safetyBox = () => { const n = safetyNotes(); return n.length ? `<h2 class="sec">Cuidamos tu salud</h2><div class="group">${n.map(t => `<div class="row top"><div class="main"><div class="meta" style="margin:0;color:var(--label)">${esc(t)}</div></div></div>`).join("")}</div>` : ""; };
function planCalc() {
  const p = S.profile, kg = r5(currentKg() * 2) / 2 || currentKg(), g0 = p.goal || "recomp", sf = safety(kg), g = sf.preg && g0 === "muscle" ? "recomp" : g0;
  const bmr = 10 * kg + 6.25 * p.h - 5 * p.age + (p.sex === "f" ? -161 : 5);
  const maint = bmr * 1.55, pct0 = (p.pct ?? p.def ?? C.goals[g].pace) / 100, pct = g === "muscle" ? pct0 : (sf.preg || sf.minor || sf.under) ? 0 : sf.low ? Math.min(pct0, 0.08) : pct0, floor = p.sex === "f" ? 1400 : 1700, adj = p.adj || 0;
  let tKcal, rKcal, floorHit = false;
  if (g === "muscle") { tKcal = r50(maint * (1 + pct)) + adj; rKcal = r50(tKcal * 0.92); }
  else { const raw = maint * (1 - pct) + 45; floorHit = raw < floor + 250; tKcal = Math.max(r50(raw), floor + 250) + adj; rKcal = Math.max(r50(tKcal - tKcal * 0.14), floor); }
  tKcal = Math.max(tKcal, floor + 100);
  const pk = sf.bmi > 30 ? sf.ideal + 0.25 * (kg - sf.ideal) : kg, prot = Math.min(200, r5((sf.preg ? 1.2 : (sf.minor || sf.senior) ? 1.6 : g === "muscle" ? 1.8 : 2.2) * pk)), fat = r5(Math.max(0.8 * kg, 0.22 * tKcal / 9));
  const carb = k => Math.max(80, r5((k - 4 * prot - 9 * fat) / 4));
  const bf = p.sex === "f" ? 30 : 22, f1 = x => wd(x).toFixed(1);
  const rate = pct === 0 && g !== "muscle" ? "peso estable" : g === "fat" ? `${f1(kg * 0.0035)}–${f1(kg * 0.008)} ${wU()}` : g === "recomp" ? `${f1(kg * 0.001)}–${f1(kg * 0.004)} ${wU()}` : `${f1(kg * 0.0025)}–${f1(kg * 0.005)} ${wU()}`;
  return { kg, goal: g, safe: sf, pct: Math.round(pct * 100), adj, maint: r50(maint), maintLo: r50(bmr * 1.45), maintHi: r50(bmr * 1.65), floorHit,
    train: { kcal: tKcal, range: `${num(tKcal - 100)}–${num(tKcal + 100)}`, p: prot, c: carb(tKcal), g: fat },
    rest: { kcal: rKcal, range: `${num(rKcal - 100)}–${num(rKcal + 100)}`, p: prot, c: carb(rKcal), g: fat },
    rate, bf, protFfm: (prot / (kg * (1 - bf / 100))).toFixed(1), protMeal: r5(0.4 * kg), fatPct: Math.round(fat * 9 / tKcal * 100) };
}
function fill(str) {
  const c = planCalc(), lv = C.levels[S.profile.level];
  const map = { MAINT: `${num(c.maintLo)}–${num(c.maintHi)}`, KCAL_T: num(c.train.kcal), KCAL_R: num(c.rest.kcal), RATE: c.rate, PROT: c.train.p, PROT_FFM: c.protFfm, BF: c.bf, PROT_MEAL: r5(c.train.p / MEAL_N()), MEALS: MEAL_N(), FAT: c.train.g, CARB: c.train.c, FAT_PCT: c.fatPct, PCT: c.pct, GOAL_KCAL: c.pct === 0 && c.goal !== "muscle" ? "mantenimiento, sin déficit" : c.goal === "recomp" ? `casi mantenimiento (≈ ${c.pct} % por debajo)` : `déficit moderado (≈ ${c.pct} %)`, LEVEL: lv.name.toLowerCase(), GAIN: lv.gain };
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? "");
}
/* Porciones: el plan base (≈ 2,100 kcal en día de entreno) se escala a las calorías de cada persona */
const isVeg = () => S.profile.diet === "veg";
const MEAL_BASE = () => { const veg = isVeg(), bl = blockedFoods(), k = (veg ? 'v' : 'o') + [...bl].join(','); if (_mealCache.k === k) return _mealCache.v; const src = veg ? D.MEALS_VEG : D.MEALS; _mealCache = { k, v: bl.size ? src.map(m => adaptList(m, veg, bl)) : src }; return _mealCache.v; };
const ALG = { lactosa: ["yogurt", "requeson", "panela", "leche", "whey"], gluten: ["pan", "pasta", "avena"], huevo: ["huevo", "claras", "huevo_c"], nueces: ["cacahuate"], pescado: ["tilapia", "atun"] };
const blockedFoods = () => new Set(health().alg.flatMap(a => ALG[a] || []));
const FSHORT = { pollo: "Pollo", bistec: "Bistec", tilapia: "Pescado", atun: "Atún", claras: "Claras", huevo: "Huevos", jamon: "Jamón", tofu: "Tofu", soya: "Soya", lentejas: "Lentejas", garbanzo: "Garbanzos", yogurt: "Yogurt", requeson: "Requesón", panela: "Panela", molida: "Carne molida", arroz: "arroz", papa: "papa", camote: "camote", tortilla: "tortillas", avena: "avena", pan: "pan", platano: "plátano", frijol: "frijoles", pasta: "pasta" };
function rawMacros(raw) { const m = { kcal: 0, p: 0, c: 0, g: 0 }; raw.forEach(([k, q]) => { const f = D.FOODS[k], r = (f.unit === "pza" ? q * f.gpu : q) / 100; m.kcal += f.k * r; m.p += f.p * r; m.c += f.c * r; m.g += f.g * r; }); Object.keys(m).forEach(k => m[k] = Math.round(m[k])); return m; }
function fallbackOpts(m, bl, n, veg) {
  const T = m.opts.reduce((a, o) => ({ kcal: a.kcal + o.m.kcal / m.opts.length, p: a.p + o.m.p / m.opts.length, c: a.c + o.m.c / m.opts.length, g: a.g + o.m.g / m.opts.length }), { kcal: 0, p: 0, c: 0, g: 0 });
  const PR = (veg ? ["tofu", "soya", "lentejas", "garbanzo", "claras", "huevo", "yogurt", "requeson", "panela"] : ["pollo", "bistec", "tilapia", "atun", "claras", "huevo", "jamon", "molida", "tofu", "soya"]).filter(k => D.FOODS[k] && !bl.has(k));
  const CA = ["arroz", "papa", "camote", "tortilla", "avena", "pan", "platano", "frijol"].filter(k => D.FOODS[k] && !bl.has(k));
  const q = (k, g) => { const f = D.FOODS[k]; return f.unit === "pza" ? Math.max(1, Math.round(g / f.gpu)) : Math.max(5, Math.round(g / 5) * 5); };
  const meal = /Comida|Cena/.test(m.slot), out = [];
  for (let i = 0; i < n && PR.length && CA.length; i++) {
    const P = PR[i % PR.length], C = CA[(i * 2 + 1) % CA.length], fp = D.FOODS[P], fc = D.FOODS[C];
    const gp = Math.min(300, Math.max(60, T.p * 0.9 * 100 / Math.max(fp.p, 1))), cNeed = Math.max(0, T.c - gp * fp.c / 100), gc = Math.min(320, Math.max(40, cNeed * 100 / Math.max(fc.c, 1)));
    const raw = [[P, q(P, gp)], [C, q(C, gc)]];
    if (D.FOODS.verdura && meal) raw.push(["verdura", 120]);
    const fatK = !bl.has("aguacate") && D.FOODS.aguacate ? "aguacate" : "aceite"; if (T.g > rawMacros(raw).g + 4 && D.FOODS[fatK]) raw.push([fatK, fatK === "aceite" ? 8 : 40]);
    out.push({ name: `${FSHORT[P] || P} con ${FSHORT[C] || C}`, raw, m: rawMacros(raw), tip: "Alternativa según tus alergias o intolerancias." });
  }
  return out;
}
let _mealCache = { k: "", v: null }, _snackCache = { k: "", v: null };
function adaptList(slotLike, veg, bl) { const keep = slotLike.opts.filter(o => !o.raw.some(([k]) => bl.has(k))); return keep.length >= 3 ? { ...slotLike, opts: keep } : { ...slotLike, opts: [...keep, ...fallbackOpts(slotLike, bl, 3 - keep.length, veg)] }; }
const snackList = () => { const veg = isVeg(), bl = blockedFoods(), k = (veg ? 'v' : 'o') + [...bl].join(','); if (_snackCache.k === k) return _snackCache.v; const src = veg ? D.SNACKS_VEG : D.SNACKS; _snackCache = { k, v: bl.size ? adaptList({ slot: 'Snack', opts: src }, veg, bl).opts : src }; return _snackCache.v; };
const FIXED_QTY = new Set(["whey"]);
const mealScale = () => clamp(planCalc().train.kcal / (isVeg() ? 2280 : 2130), 0.7, 1.7);
function scaleQty(key, qty, f = mealScale()) {
  if (FIXED_QTY.has(key)) return qty;
  const fd = D.FOODS[key], x = qty * (typeof f === "object" ? (PROT_FOODS.has(key) ? f.p : f.c) : f);
  if (fd.unit === "pza") return Math.max(1, Math.round(x));
  if (key === "aceite") return Math.max(5, Math.round(x / 2) * 2);
  return x >= 100 ? Math.round(x / 10) * 10 : Math.max(5, Math.round(x / 5) * 5);
}
function optView(o, f) {
  f = fFor(o, f); const items = o.raw.map(([k, q]) => [k, scaleQty(k, q, f)]), m = { kcal: 0, p: 0, c: 0, g: 0 };
  items.forEach(([k, q]) => { const f = D.FOODS[k], r = (f.unit === "pza" ? q * f.gpu : q) / 100; m.kcal += f.k * r; m.p += f.p * r; m.c += f.c * r; m.g += f.g * r; });
  Object.keys(m).forEach(k => m[k] = Math.round(m[k]));
  return { name: o.name, tip: o.tip, m, items: items.map(([k, q]) => { const f = D.FOODS[k]; return f.unit === "pza" ? `${q} ${f.name}` : `${q} g de ${f.name}`; }) };
}
/* Pesos sugeridos: referencia (≈ 75 kg, hombre, nivel intermedio) escalada por peso, sexo y nivel */
const LOWER = new Set(["squat_bb", "deadlift", "smith_sq", "leg_press", "split_db", "leg_ext", "hack", "rdl", "leg_curl", "hip_thrust", "abductor", "calf_st", "calf_se", "goblet", "db_squat", "db_lunge", "db_rear_lunge", "step_up", "db_rdl", "glute_br", "calf_home", "calf_one"]);
const dbCap = u => (S.mode === "db" && (u === "c/mano" || u === "total")) ? equip().dbMax : Infinity;
function scaleW(item) {
  const p = S.profile, f = (p.sex === "f" ? (LOWER.has(item.k) ? 0.8 : 0.65) : 1) * (currentKg() / 75) * C.levels[p.level].k, u = item.w.u, x = item.w.n * f;
  if (u === "c/mano") return Math.min(dbCap(u), Math.max(2, x < 12 ? Math.round(x) : Math.round(x / 2) * 2));
  if (u === "stack") return Math.max(5, Math.round(x / 2.5) * 2.5);
  return Math.min(dbCap(u), Math.max(S.mode === "db" ? 4 : 10, LOWER.has(item.k) ? Math.round(x / 5) * 5 : Math.round(x / 2.5) * 2.5));
}

/* Peso sugerido: estimado la primera vez; luego según lo registrado */
const incFor = (k, u) => u === "c/mano" ? 2 : u === "stack" ? 5 : (["smith_sq", "squat_bb", "deadlift", "leg_press", "hack", "rdl", "hip_thrust"].includes(k) ? 10 : S.mode === "db" ? 2 : 2.5);
function suggest(item) {
  const iso = todayISO();
  if (!item.w || S.mode === "home") {
    const pv = [...(S.hist[item.k] || [])].reverse().find(x => x.d !== iso && x.sets.some(t => t.done && t.r)), best = pv ? Math.max(...pv.sets.filter(t => t.done && t.r).map(t => t.r)) : null;
    return { text: S.mode === "home" ? "Sin peso (mochila opcional)" : "Peso corporal", n: null, src: best ? `Tu última vez: ${best} repeticiones. Intenta una más en cada vuelta.` : "" };
  }
  const prev = [...(S.hist[item.k] || [])].reverse().find(x => x.d !== iso && x.sets.some(s => s.done && s.w));
  const u = item.w.u;
  if (!prev) {
    let n0 = scaleW(item), msg = "Peso de prueba. Si te sobran más de 3 repeticiones, sube; si no llegas al mínimo, baja.";
    const td = getSets(item.k, iso).filter(t => t.done && t.r && t.w), last = td[td.length - 1];
    if (last) { const inc = incFor(item.k, u), lo = lowReps(item.reps), hi = topReps(item.reps); if (last.r >= hi + 3) { n0 = Math.min(dbCap(u), last.w + inc); msg = `Te sobró esfuerzo con ${fwi(last.w)} ${wU()}: sube a ${fwi(n0)} ${wU()}.`; } else if (lo !== null && last.r < lo) { n0 = Math.max(2, last.w - inc); msg = `Quedaste corto con ${fwi(last.w)} ${wU()}: baja a ${fwi(n0)} ${wU()}.`; } else { n0 = last.w; msg = `${fwi(last.w)} ${wU()} va bien: mantén el peso.`; } }
    return { n: n0, u, text: `${fwi(n0)} ${wU()} ${u}`, src: msg };
  }
  const done = prev.sets.filter(s => s.done && s.w), top = Math.max(...done.map(s => s.w));
  const hit = done.length && done.every(s => (s.r || 0) >= topReps(item.reps));
  const cap = dbCap(u), n = Math.min(cap, hit ? top + incFor(item.k, u) : top), capped = hit && top >= cap;
  return { n, u, text: `${fwi(n)} ${wU()} ${u}`, src: capped ? "Ya llegaste al máximo de tus mancuernas: sube repeticiones (hasta 20–25), baja en 3 s o pasa a una pierna o un brazo." : hit ? `Completaste el rango alto con ${fwi(top)} ${wU()}: sube.` : `Tu última vez: ${fwi(top)} ${wU()}. Busca una repetición más.` };
}
const segHtml = (items, cur, attr, label = "Opciones") => `<div class="seg" role="group" aria-label="${esc(label)}" style="--n:${items.length};--i:${Math.max(0, items.findIndex(([v]) => String(v) === String(cur)))}">${items.map(([v, t]) => `<button data-${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${esc(t)}</button>`).join("")}</div>`;
function segMove(btn) { const seg = btn.closest(".seg"); [...seg.children].forEach((x, i) => { x.setAttribute("aria-pressed", String(x === btn)); if (x === btn) seg.style.setProperty("--i", i); }); }
const MODES = [["gym", "Gimnasio"], ["db", "Mancuernas"], ["home", "Sin equipo"]];
const modeSeg = () => segHtml(MODES, S.mode, "mode", "Dónde entrenas");
const typeLabel = t => ({ uni: "Uniserie", bi: "Biserie", tri: "Triserie", cardio: "Cardio" }[t]);
const cardioMin = b => b.min + (phaseOf(weekNum()).cardioAdd || 0);
const cardioKinds = () => { const ks = S.mode === "gym" ? C.cardioKinds.gym : C.cardioKinds.home; if (!S.profile) return ks; const impact = safety(currentKg()).severe || health().inj.includes("rodilla") || health().inj.includes("espalda") || health().cond.includes("embarazo"); const f = ks.filter(k => !(impact && k.id === "run")); return f.length ? f : ks; };
const cardioKind = () => { const ks = cardioKinds(); return ks.find(k => k.id === S.cardioKind) || ks[0]; };
const letters = "ABC";

/* ───────── Comidas ───────── */
const PROT_FOODS = new Set(["pollo", "bistec", "molida", "tilapia", "atun", "huevo", "huevo_c", "claras", "jamon", "panela", "yogurt", "requeson", "tofu", "soya", "whey"]);
/* Cada opción se escala en dos grupos (proteínas y el resto) para cumplir las calorías y la proteína que le tocan a esa comida */
const optStats = o => { const t = { Pp: 0, Kp: 0, Pc: 0, Kc: 0 }; o.raw.forEach(([k, q]) => { const f = D.FOODS[k], g = (f.unit === "pza" ? q * f.gpu : q) / 100; if (PROT_FOODS.has(k)) { t.Pp += f.p * g; t.Kp += f.k * g; } else { t.Pc += f.p * g; t.Kc += f.k * g; } }); return t; };
function fFor(o, f) {
  if (!f || f.Kt === undefined) return f;
  const st = optStats(o), det = st.Pp * st.Kc - st.Pc * st.Kp; let fp, fc;
  if (Math.abs(det) > 1) { fp = (f.Pt * st.Kc - st.Pc * f.Kt) / det; fc = (st.Pp * f.Kt - f.Pt * st.Kp) / det; } else fp = fc = f.Kt / Math.max(1, st.Kp + st.Kc);
  fp = clamp(fp, 0.25, 2.8); fc = clamp(fc, 0.25, 2.8);
  const kk = fp * st.Kp + fc * st.Kc, r = kk > 0 ? f.Kt / kk : 1;
  return { p: clamp(fp * r, 0.25, 2.8), c: clamp(fc * r, 0.25, 2.8) };
}
const MEAL_N = () => { const n = S.profile && S.profile.meals; return [3, 4, 5, 6].includes(n) ? n : 6; };
const MPLAN = {
  3: { t: [["Desayuno", "8:00", .28], ["Comida", "14:00", .40], ["Cena (post-entreno)", "20:30", .32]], r: [["Desayuno", "8:00", .28], ["Comida", "14:00", .40], ["Cena (post-entreno)", "20:30", .32]] },
  4: { t: [["Desayuno", "7:30", .25], ["Comida", "13:30", .35], ["Pre-entreno", "17:00", .12], ["Cena (post-entreno)", "20:45", .28]], r: [["Desayuno", "7:30", .26], ["Comida", "13:30", .36], ["Merienda", "17:00", .12], ["Cena (post-entreno)", "20:45", .26]] },
  5: { t: [["Desayuno", "7:30", .22], ["Media mañana", "10:30", .12], ["Comida", "14:00", .29], ["Pre-entreno", "17:00", .12], ["Cena (post-entreno)", "20:45", .25]], r: [["Desayuno", "7:30", .22], ["Media mañana", "10:30", .12], ["Comida", "14:00", .29], ["Merienda", "17:00", .12], ["Cena (post-entreno)", "20:45", .25]] },
  6: { t: [["Desayuno", "7:30", .20], ["Media mañana", "10:30", .11], ["Comida", "14:00", .27], ["Pre-entreno", "17:00", .11], ["Cena (post-entreno)", "20:45", .21], ["Snack", "libre", .10]], r: [["Desayuno", "7:30", .20], ["Media mañana", "10:30", .12], ["Comida", "14:00", .27], ["Merienda", "17:00", .11], ["Cena (post-entreno)", "20:45", .20], ["Snack", "libre", .10]] },
};
const tMin = t => { const [h, m] = String(t).split(":").map(Number); return isNaN(h) ? 9999 : h * 60 + m; };
let _slotCache = { k: "", v: null };
/* Comidas del día: según cuántas haces, cada una recibe su parte de las calorías (entreno o descanso) y se escala su porción */
function MEALS() {
  const c = planCalc(), N = MEAL_N(), tr = tMin((S.remind && S.remind.train) || "18:00"), k = [isVeg(), [...blockedFoods()].join(","), N, c.train.kcal, c.rest.kcal, tr].join("|");
  if (_slotCache.k === k) return _slotCache.v;
  const base = MEAL_BASE(), by = Object.fromEntries(base.map(m => [m.slot, m])), sn = snackList(), slots = new Map();
  const hm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`, r5m = m => Math.round(m / 5) * 5;
  const when = (slot, time) => slot === "Pre-entreno" ? hm(clamp(r5m(tr - 75), 330, 1260)) : slot === "Cena (post-entreno)" ? hm(Math.min(1410, Math.max(tMin(time), r5m(tr + 100)))) : time;
  const add = (kind, [slot, time0, share], n) => { const time = when(slot, time0); const src = by[slot] ? by[slot].opts : sn; let m = slots.get(slot); if (!m) { m = { slot, time, opts: src }; slots.set(slot, m); } const day = kind === "t" ? c.train : c.rest, ps = share * 0.6 + 0.4 / n; m[kind === "t" ? "fT" : "fR"] = { Kt: share * day.kcal, Pt: ps * day.p }; };
  MPLAN[N].t.forEach(x => add("t", x, N)); MPLAN[N].r.forEach(x => add("r", x, N));
  const v = [...slots.values()].sort((a, b) => tMin(a.time) - tMin(b.time));
  _slotCache = { k, v }; return v;
}
const isTrainDay = iso => !!sessionFor(iso);
const dayMeals = rest => MEALS().filter(m => (rest ? m.fR : m.fT) != null);
const mealsToday = iso => dayMeals(!isTrainDay(iso));
const slotF = (m, rest) => (rest ? m.fR : m.fT) ?? m.fT ?? m.fR ?? 1;
const pick = (m, iso = todayISO()) => optView(m.opts[S.picks[m.slot] ?? 0], slotF(m, !isTrainDay(iso)));
const eatenOn = iso => S.eaten[iso] || {};
const eatenTotals = iso => { const t = { kcal: 0, p: 0, c: 0, g: 0 }, e = eatenOn(iso); mealsToday(iso).forEach(m => { if (e[m.slot]) { const x = pick(m, iso).m; t.kcal += x.kcal; t.p += x.p; t.c += x.c; t.g += x.g; } }); return t; };
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

const BACKS = { Historial: "#/progreso/historial", Dieta: "#/comida/dieta", Entreno: "#/entreno", Comida: "#/comida", Progreso: "#/progreso", Ajustes: "#/plan", Hoy: "#/hoy", Plan: "#/entreno/ruta" };
function nav(title, o = {}) {
  const to = o.to || BACKS[o.back] || "#/hoy";
  const back = o.back ? `<button class="nb-btn" data-to="${to}" aria-label="Volver a ${esc(o.back)}">${I.back}<span>${esc(o.back)}</span></button>` : "";
  const gear = o.gear ? `${window.Acct ? Acct.chip() : ""}<button class="nb-btn gear" data-go="#/plan" aria-label="Ajustes">${I.gear}</button>` : "";
  return `<div class="navbar" id="navbar">${back}<span class="nb-title" aria-hidden="true">${esc(title)}</span>${gear}</div><h1 class="large" id="lt">${esc(title)}</h1>${o.sub ? `<p class="sub">${o.sub}</p>` : ""}`;
}
const cta = html => `<div class="cta-bar"><div class="inner">${html}</div></div>`;
let lastTab = null;
function renderTabs(tab) {
  tabsEl.innerHTML = `<div class="inner">${TABS.map(([k, l, ic]) => `<a href="#/${k}" class="${k === tab && lastTab && lastTab !== tab ? "bump" : ""}" ${k === tab ? 'aria-current="page"' : ""}>${ic}<span>${l}</span></a>`).join("")}</div>`; lastTab = tab;
}
const TABOF = { hoy: "hoy", entreno: "entreno", bloque: "entreno", ej: "entreno", cambiar: "entreno", comida: "comida", imprimir: "comida", editar: "entreno", progreso: "progreso", plan: "hoy" };

function render(o) {
  const keep = !!(o && o.keep), y0 = scrollY;
  const r = parseHash();
  if ((!S.start || !S.profile) && r[0] !== "inicio" && r[0] !== "acceso") return go("#/inicio");
  if (window.Acct && Acct.gate(r)) return;
  let html, hasCta = false;
  switch (r[0]) {
    case "inicio": html = vSetup(); break;
    case "acceso": html = window.Acct ? Acct.view(r[1]) : ""; break;
    case "hoy": html = vToday(); break;
    case "editar": html = vEdit(r[1]); break;
    case "entreno": html = r[1] === "intervalos" ? vIntervals() : r[1] === "ruta" ? vRoute() : r[1] === "semana" ? vWeek(+r[2]) : r[1] === "guias" ? vGuides() : r[1] === "guia" ? vGuide() : r[1] === "abdomen" ? vAbs() : r[1] === "cardio" ? vCardioGuide() : r[1] === "limitadas" ? vLimited() : r[1] === "porque" ? vWhy("train") : r[1] ? vSession(r[1]) : vTrain(); hasCta = !!r[1] && !!sessionById(r[1]); break;
    case "imprimir": html = vPrint(); break;
    case "bloque": html = vBlock(r[1], +r[2]); hasCta = true; break;
    case "ej": html = vExercise(r[1], r[2]); break;
    case "cambiar": html = vSwap(r[1], +r[2], +r[3]); break;
    case "comida": html = r[1] === "dieta" ? vDiet() : r[1] === "guias" ? vFoodGuides() : r[1] === "guia" ? vFoodGuide(r[2]) : r[1] === "menu" ? vMenu() : r[1] === "compras" ? vShop() : r[1] === "snacks" ? vSnacks() : r[1] === "reglas" ? vFoodRules() : r[1] === "porque" ? vWhy("diet") : r[1] === "slot" ? vSlot(r[2]) : vFood(); break;
    case "progreso": html = r[1] === "logros" ? vBadges() : r[1] === "resumen" ? vRecap() : r[1] === "sesion" ? vPast(r[2], r[3]) : r[1] === "meta" ? vWeightGoal() : r[1] === "musculos" ? vMuscles() : r[1] === "habitos" ? vHabits() : r[1] === "calorias" ? vAdjust() : r[1] === "compartir" ? vShare() : r[1] === "medidas" ? vBodyMeasures() : r[1] === "fotos" ? vPhotos() : r[1] === "historial" ? vHistory() : r[1] === "datos" ? vData() : r[1] === "revision" ? vReview() : r[1] === "peso" ? vLogWeight() : r[1] === "fuerza" ? vStrength() : r[1] === "guia" ? vMeasureGuide() : vProgress(); break;
    case "plan": html = r[1] === "cuenta" ? Acct.view("cuenta") : r[1] === "notificaciones" ? Acct.view("notif") : r[1] === "admin" ? Acct.view("admin") : r[1] === "ayuda" ? vHelp() : r[1] === "privacidad" ? vPrivacy() : r[1] === "ajustes" ? vSettings() : r[1] === "salud" ? vHealth() : r[1] === "avisos" ? vRemind() : vHub(); break;
    default: html = vToday();
  }
  const back = r.length < lastDepth, tabNow = TABOF[r[0]] || "hoy", swap = !keep && !back && r.length === 1 && lastDepth === 1 && lastTab && lastTab !== tabNow; lastDepth = r.length;
  const onboarding = r[0] === "inicio" || r[0] === "acceso"; if (r[0] === "inicio") hasCta = true;
  document.documentElement.style.setProperty("--cta-h", hasCta ? "72px" : "0px");
  document.documentElement.classList.toggle("onb", onboarding);
  app.innerHTML = `<main class="page${keep ? " still" : back ? " back" : swap ? " swap" : ""}">${html}</main>`;
  renderTabs(TABOF[r[0]] || "hoy"); tabsEl.style.display = S.start && r[0] !== "acceso" ? "" : "none";
  window.scrollTo(0, keep ? y0 : 0);
  if (io) io.disconnect();
  const lt = $("#lt"), nb = $("#navbar");
  if (lt && nb && "IntersectionObserver" in window) { io = new IntersectionObserver(([e]) => nb.classList.toggle("scrolled", !e.isIntersecting), { rootMargin: "-48px 0px 0px 0px" }); io.observe(lt); }
  bind(); if (window.Acct) Acct.after(r);
  if (!keep) { const h = $("#lt"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  if (popSel) { $(popSel)?.classList.add("pop"); popSel = null; }
  if (r[0] === "progreso" && r[1] === "fotos") loadPhotos();
  if (r[0] === "progreso" && r[1] === "compartir") drawShare();
  syncWake(); checkBadges();
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
    <div class="field"><label for="${ids}-h">Estatura (${lU()})</label><input id="${ids}-h" type="number" inputmode="numeric" min="${Math.round(ld(120))}" max="${Math.round(ld(220))}" placeholder="Estatura" value="${p.h != null ? Math.round(ld(p.h)) : ""}"></div>
    <div class="field"><label for="${ids}-kg">Peso actual (${wU()})</label><input id="${ids}-kg" type="number" inputmode="decimal" step="0.1" min="${Math.round(wd(30))}" max="${Math.round(wd(250))}" placeholder="Peso" value="${p.kg != null ? fw(p.kg) : ""}"></div>
    <div class="field"><label for="${ids}-lv">Tu experiencia con pesas</label><select id="${ids}-lv">${Object.entries(C.levels).map(([k, v]) => `<option value="${k}" ${(p.level || "medio") === k ? "selected" : ""}>${v.name}, ${v.sub}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-days">Días de pesas por semana</label><select id="${ids}-days">${C.daysOptions.map(([k, v]) => `<option value="${k}" ${String(p.days || 6) === String(k) ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-meals">Comidas al día</label><select id="${ids}-meals">${[3, 4, 5, 6].map(n => `<option value="${n}" ${(p.meals || 5) === n ? "selected" : ""}>${n} comidas</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-diet">Cómo comes</label><select id="${ids}-diet">${Object.entries(C.diets).map(([k, v]) => `<option value="${k}" ${(p.diet || "omni") === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>`;
function readProfile(ids) {
  const g = i => $("#" + ids + "-" + i)?.value, sex = g("sex"), age = +g("age"), h = Math.round(fromL(+g("h"))), kg = Math.round(fromW(parseFloat(g("kg"))) * 10) / 10;
  if (!sex) return "Elige tu sexo";
  if (!(age >= 14 && age <= 90)) return "Escribe tu edad (14 a 90)";
  if (!(h >= 120 && h <= 220)) return `Escribe tu estatura en ${lU()}`;
  if (!(kg >= 30 && kg <= 250)) return `Escribe tu peso en ${wU()}`;
  return { name: cleanName(g("name") || ""), sex, age, h, kg, level: g("lv"), goal: g("goal"), pct: +g("pct"), days: +g("days"), diet: g("diet"), meals: +g("meals") || 5, adj: S.profile?.adj || 0, equip: S.profile?.equip };
}
const ONB = () => ({ step: 0, d: { name: "", goal: null, health: { inj: [], cond: [], alg: [] }, waist: "", sex: null, age: "", h: "", kg: "", level: null, days: null, mode: "gym", bench: "si", dbMax: 20, bar: "no", pull: "no", dips: "no", diet: "omni", meals: 5, train: "18:00", pct: null, weekend: "sab", date: todayISO() } });
let onb = ONB();
const ONB_STEPS = 6;
function radioRows(name, options, cur) {
  return `<div class="group" role="radiogroup">${options.map(([v, t, m]) => `<button class="row top" role="radio" aria-checked="${String(cur) === String(v)}" data-choice="${name}|${v}"><span class="opt-radio ${String(cur) === String(v) ? "on" : ""}"></span><div class="main"><div class="title">${esc(t)}</div>${m ? `<div class="meta">${esc(m)}</div>` : ""}</div></button>`).join("")}</div>`;
}
const segRow = (name, options, cur) => `<div class="seg" role="group" style="--n:${options.length};--i:${Math.max(0, options.findIndex(([v]) => String(v) === String(cur)))}">${options.map(([v, t]) => `<button data-choice="${name}|${v}" aria-pressed="${String(cur) === String(v)}">${esc(t)}</button>`).join("")}</div>`;
const multiRows = (name, opts, cur) => `<div class="group" role="group">${opts.map(([v, t, m]) => `<button class="row top" role="checkbox" aria-checked="${cur.includes(v)}" data-multi="${name}|${v}"><span class="opt-check ${cur.includes(v) ? "on" : ""}"></span><div class="main"><div class="title">${esc(t)}</div>${m ? `<div class="meta">${esc(m)}</div>` : ""}</div></button>`).join("")}</div>`;
const HL = { inj: [["hombro", "Hombro"], ["rodilla", "Rodilla"], ["espalda", "Espalda baja"], ["muñeca", "Muñeca o codo"]], cond: [["presion", "Presión alta"], ["diabetes", "Diabetes"], ["corazon", "Problema del corazón"], ["embarazo", "Embarazo o posparto"]], alg: [["lactosa", "Lactosa"], ["gluten", "Gluten"], ["huevo", "Huevo"], ["nueces", "Cacahuate y frutos secos"], ["pescado", "Pescado y atún"]] };
const healthBlocks = h => `<h2 class="sec">Molestias o lesiones</h2>${multiRows("inj", HL.inj, h.inj)}<h2 class="sec">Condiciones de salud</h2>${multiRows("cond", HL.cond, h.cond)}<h2 class="sec">Alergias o intolerancias</h2>${multiRows("alg", HL.alg, h.alg)}${h.cond.length ? `<p class="note">Consulta a tu médico antes de empezar. Tu plan será más conservador: sin técnicas extremas y con descansos largos.</p>` : ""}`;
function onbValid(step, d) {
  if (step === 0 && !d.goal) return "Elige lo que quieres lograr";
  if (step === 1) { if (!d.sex) return "Elige tu sexo"; if (!(+d.age >= 14 && +d.age <= 90)) return "Escribe tu edad (14 a 90)"; if (!(fromL(+d.h) >= 120 && fromL(+d.h) <= 220)) return `Escribe tu estatura en ${lU()}`; if (!(fromW(parseFloat(d.kg)) >= 30 && fromW(parseFloat(d.kg)) <= 250)) return `Escribe tu peso en ${wU()}`; }
  if (step === 2) { if (!d.level) return "Elige tu experiencia"; if (!d.days) return "Elige cuántos días puedes entrenar"; }
  return "";
}
function withDraft(fn) { const prev = S.profile, pw = S.weights, pwe = S.weekend, pm = S.mode; const d = onb.d; S.profile = { name: cleanName(d.name), health: cleanHealth(d.health), sex: d.sex, age: +d.age, h: Math.round(fromL(+d.h)), kg: Math.round(fromW(parseFloat(d.kg)) * 10) / 10, level: d.level, goal: d.goal, pct: d.pct ?? C.goals[d.goal].pace, days: +d.days, diet: d.diet, meals: +d.meals || 5, adj: 0, equip: { bench: d.bench !== "no", bar: d.bar === "si", dbMax: +d.dbMax, pull: d.pull === "si", dips: d.dips === "si" } }; S.weights = {}; S.weekend = d.weekend; S.mode = d.mode; _plan = { k: "", v: null }; try { return fn(); } finally { S.profile = prev; S.weights = pw; S.weekend = pwe; S.mode = pm; _plan = { k: "", v: null }; } }
function vSetup() {
  const { step, d } = onb;
  const heads = ["¿Qué quieres lograr?", "Sobre ti", "Tu entrenamiento", "Tu salud", "Tu comida y tu ritmo", "Tu plan"];
  const subs = ["Tu plan se adapta a esto.", "Para calcular tus calorías. No sale de tu teléfono.", "Para armar tu semana.", "Opcional. Adapta ejercicios y comidas.", "Porciones y ritmo.", "Tu plan está listo."];
  let body = "";
  if (step === 0) body = (window.Acct ? Acct.hero("sm") : "") + radioRows("goal", Object.entries(C.goals).map(([k, g]) => [k, g.name, g.desc]), d.goal);
  if (step === 1) body = `<h2 class="sec">Unidades</h2><div class="group"><div class="field"><label>Peso</label>${segHtml([["kg", "Kilos"], ["lb", "Libras"]], S.units.w, "unitw", "Unidades de peso")}</div><div class="field"><label>Medidas</label>${segHtml([["cm", "Centímetros"], ["in", "Pulgadas"]], S.units.l, "unitl", "Unidades de medidas")}</div></div>
<h2 class="sec">Sexo (para estimar tus calorías)</h2>${segRow("sex", [["m", "Hombre"], ["f", "Mujer"]], d.sex)}
    <h2 class="sec">Tu nombre</h2><div class="group"><div class="field"><label for="ob-name">Nombre (opcional)</label><input id="ob-name" type="text" maxlength="30" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="Cómo te llamas" value="${esc(d.name || "")}"></div></div>
    <h2 class="sec">Tus medidas</h2><div class="group">
    <div class="field"><label for="ob-age">Edad (años)</label><input id="ob-age" type="number" inputmode="numeric" min="14" max="90" placeholder="Edad" value="${esc(d.age)}"></div>
    <div class="field"><label for="ob-h">Estatura (${lU()})</label><input id="ob-h" type="number" inputmode="numeric" min="${Math.round(ld(120))}" max="${Math.round(ld(220))}" placeholder="Estatura" value="${esc(d.h)}"></div>
    <div class="field"><label for="ob-kg">Peso actual (${wU()})</label><input id="ob-kg" type="number" inputmode="decimal" step="0.1" min="${Math.round(wd(30))}" max="${Math.round(wd(250))}" placeholder="Peso" value="${esc(d.kg)}"></div>
    <div class="field"><label for="ob-waist">Cintura (${lU()}, opcional)</label><input id="ob-waist" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="A la altura del ombligo" value="${esc(d.waist || "")}"></div></div>
    ${onb.redo ? "" : `<div class="group" style="margin-top:14px"><button class="row top" data-onb="quick"><div class="main"><div class="title">Empezar con lo recomendado</div><div class="meta">Nivel intermedio, 4 días y gimnasio. Lo cambias después en Ajustes.</div></div>${I.chev}</button></div>`}`;
  if (step === 2) body = `<h2 class="sec">Tu experiencia con pesas</h2>${radioRows("level", Object.entries(C.levels).map(([k, v]) => [k, v.name, v.sub]), d.level)}
    <h2 class="sec">Días de pesas por semana</h2>${radioRows("days", C.daysOptions, d.days)}
    <h2 class="sec">¿Dónde entrenas?</h2>${radioRows("mode", [["gym", "Gimnasio", "Máquinas, poleas, barras y mancuernas"], ["db", "En casa con mancuernas", "Tus mancuernas, con o sin banca"], ["home", "En casa, sin equipo", "Solo tu cuerpo, una mesa o silla y una mochila"]], d.mode)}
    ${d.mode === "db" ? `<h2 class="sec">Tus mancuernas pesan hasta…</h2>${radioRows("dbMax", [10, 20, 30, 40].map(v => [v, dbLabel(v)]), d.dbMax)}<h2 class="sec">¿Tienes banca?</h2>${segRow("bench", [["si", "Sí"], ["no", "No"]], d.bench)}` : ""}
    ${d.mode === "gym" ? `<h2 class="sec">Peso corporal</h2><div class="group"><div class="field"><label>¿Puedes hacer 5 o más dominadas?</label>${segRow("pull", [["si", "Sí"], ["no", "No"]], d.pull)}</div><div class="field"><label>¿Y 5 o más fondos en paralelas?</label>${segRow("dips", [["si", "Sí"], ["no", "No"]], d.dips)}</div></div><p class="note">Si puedes, entran en tu plan en lugar del jalón al pecho y la extensión de tríceps en polea. Si no, quedan como alternativas.</p>` : ""}
    ${d.mode !== "gym" ? `<h2 class="sec">¿Tienes barra de dominadas?</h2>${segRow("bar", [["si", "Sí"], ["no", "No"]], d.bar)}` : ""}`;
  if (step === 3) body = healthBlocks(d.health);
  if (step === 4) { const g = C.goals[d.goal]; body = `<h2 class="sec">Cómo comes</h2>${radioRows("diet", Object.entries(C.diets), d.diet)}
    <h2 class="sec">Comidas al día</h2>${radioRows("meals", [[3, "3 comidas", "Desayuno, comida y cena."], [4, "4 comidas", "Con una colación antes de entrenar o por la tarde."], [5, "5 comidas", "Reparte mejor la proteína durante el día."], [6, "6 comidas", "Cinco comidas y un snack."]], d.meals)}
    <p class="note">Las porciones y las calorías se reparten según las comidas que elijas, y cambian en tus días de pesas y de descanso.</p>
    <h2 class="sec">Ritmo</h2>${radioRows("pct", g.paces, d.pct ?? g.pace)}
    ${+d.days === 6 ? `<h2 class="sec">Tu día de pesas del fin de semana</h2>${segRow("weekend", [["sab", "Sábado"], ["dom", "Domingo"]], d.weekend)}` : ""}
    <h2 class="sec">Tu horario</h2><div class="group"><div class="field"><label for="ob-train">¿A qué hora sueles entrenar?</label><input id="ob-train" type="time" value="${esc(d.train || "18:00")}"></div></div>
    <p class="note">Tus comidas de antes y después de entrenar se acomodan a esa hora, y la app te avisa cuando toca.</p>
    <h2 class="sec">Inicio</h2><div class="group"><div class="field"><label for="ob-date">Empiezas el</label><input id="ob-date" type="date" value="${esc(d.date)}"></div></div>`; }
  if (step === 5) body = withDraft(() => {
    const c = planCalc(), ss = SESSIONS(), g = C.goals[d.goal];
    return `${safetyBox()}<div class="group">
      <div class="row top"><div class="main"><div class="title">Objetivo</div><div class="meta">${esc(g.name)}, ${esc(C.levels[d.level].name.toLowerCase())}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Calorías</div><div class="meta">${num(c.train.kcal)} kcal en día de entreno, ${num(c.rest.kcal)} en descanso</div></div></div>
      <div class="row top"><div class="main"><div class="title">Proteína, carbohidratos y grasas</div><div class="meta">${c.train.p} g, ${c.train.c} g, ${c.train.g} g en día de entreno</div></div></div>
      <div class="row top"><div class="main"><div class="title">Tu semana</div><div class="meta">${ss.map(x => `${x.day} ${x.name}`).join(", ")}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Equipo</div><div class="meta">${d.mode === "gym" ? `Gimnasio completo${d.pull === "si" ? ", con dominadas" : ""}${d.dips === "si" ? ", con fondos" : ""}` : d.mode === "db" ? `Mancuernas hasta ${fw(d.dbMax, 0)} ${wU()}, banca: ${d.bench === "no" ? "no" : "sí"}, barra de dominadas: ${d.bar === "si" ? "sí" : "no"}` : `Sin equipo, barra de dominadas: ${d.bar === "si" ? "sí" : "no"}`}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Cardio</div><div class="meta">${d.goal === "muscle" ? "Poco: solo para tu salud y recuperación" : d.mode === "gym" ? "Zona 2 en caminadora o elíptica al final de las pesas" : "Zona 2: caminata rápida, trote suave o bici al final de las pesas"}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Meta de peso sugerida</div><div class="meta">${(() => { const x = suggestGoalKg(S.profile, S.profile.kg, fromL(parseFloat(d.waist)) || null); return `${fwt(x.goal, 1)}, rango saludable para tu estatura ${fw(x.lo, 0)}–${fw(x.hi, 0)} ${wU()}`; })()}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Ritmo esperado</div><div class="meta">${d.goal === "muscle" ? "Subir" : "Bajar"} ≈ ${c.rate} por semana</div></div></div>
    </div>${c.floorHit ? `<p class="note"><strong>Aviso:</strong> tu meta quedaría por debajo de un mínimo razonable, así que se subió. Con un peso bajo conviene un ritmo suave.</p>` : ""}
    <p class="note">Son estimaciones; no sustituyen a un médico o nutriólogo.</p>`; });
  const last = step === ONB_STEPS - 1;
  return `${step ? `<div class="navbar" id="navbar"><button class="nb-btn" data-onb="back" aria-label="Paso anterior">${I.back}<span>Atrás</span></button><span class="nb-title" aria-hidden="true">${heads[step]}</span></div>` : `<div class="navbar" id="navbar">${onb.redo ? `<button class="nb-btn" data-onb="cancel">Cancelar</button>` : ""}</div>`}
  <div class="dots" role="progressbar" aria-label="Paso ${step + 1} de ${ONB_STEPS}" aria-valuenow="${step + 1}" aria-valuemin="1" aria-valuemax="${ONB_STEPS}">${Array.from({ length: ONB_STEPS }, (_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>
  <h1 class="large" id="lt">${heads[step]}</h1><p class="sub">${subs[step]}</p>
  ${body}
  ${cta(`<button class="btn" data-onb="${last ? "start" : "next"}">${last ? "Empezar mi plan" : "Continuar"}</button>`)}`;
}

function mealRows(iso, showHint) {
  const e = eatenOn(iso), nxt = nextMealSlot(iso), all = MEALS();
  return mealsToday(iso).map(m => {
    const o = pick(m, iso), on = !!e[m.slot], idx = all.indexOf(m);
    return `<div class="row"><button class="hit" role="checkbox" aria-checked="${on}" aria-label="Marcar ${esc(m.slot)} como comida" data-eat="${esc(m.slot)}"><span class="circle ${on ? "on" : ""}">${I.check}</span></button>
      <button class="main" style="background:none;border:0;text-align:left;padding:0;color:inherit;cursor:pointer;min-height:44px" data-go="#/comida/slot/${idx}"><div class="title">${esc(slotName(m, iso))} <span class="pill">${m.time}</span>${showHint && nxt === m.slot ? ' <span class="badge">Sigue</span>' : ""}</div><div class="meta">${esc(o.name)}</div><div class="meta">${o.m.kcal} kcal y ${o.m.p} g de proteína</div></button></div>`;
  }).join("");
}
function intake(iso) {
  const t = eatenTotals(iso), T = targetFor(iso);
  return `<div class="row"><div class="mini"><span class="l">Calorías</span><span class="r">${t.kcal.toLocaleString("es-MX")} / ${T.kcal.toLocaleString("es-MX")}</span><div class="bar ${t.kcal >= T.kcal * .9 ? "good" : ""}" role="progressbar" aria-valuenow="${t.kcal}" aria-valuemax="${T.kcal}" aria-label="Calorías"><i style="--p:${(Math.min(100, t.kcal / T.kcal * 100))/100}"></i></div>
    <span class="l">Proteína</span><span class="r">${t.p} / ${T.p} g</span><div class="bar ${t.p >= T.p * .9 ? "good" : ""}" role="progressbar" aria-valuenow="${t.p}" aria-valuemax="${T.p}" aria-label="Proteína"><i style="--p:${(Math.min(100, t.p / T.p * 100))/100}"></i></div></div></div>`;
}

function vToday() {
  const iso = todayISO(), n = dayNum(iso), wk = weekNum(iso), ph = phaseOf(wk), ses = sessionFor(iso), ck = S.checks[iso] || {};
  const pct = n > 90 ? ((n - 91) % 28 + 1) / 28 * 100 : Math.min(100, Math.max(0, n / 90 * 100));
  let sesBlock;
  if (ses) {
    const pr = sessionProgress(ses), done = sessionDoneOn(iso, ses.id), started = pr.done > 0;
    sesBlock = `<h2 class="sec">Entrenamiento</h2><div class="group"><button class="row" data-go="#/entreno/${ses.id}"><div class="main"><div class="title" style="font-size:20px;font-weight:600">${esc(ses.name)}</div><div class="meta">${esc(ses.focus)}</div><div class="meta">${blocksOf(ses).length} bloques, ${totalRounds(ses)} vueltas, ${sessMin(ses)} min</div></div>${done ? '<span class="badge good">Hecho</span>' : started ? `<span class="badge">${pr.done}/${pr.total}</span>` : ""}${I.chev}</button></div>`;
  } else sesBlock = `<h2 class="sec">Entrenamiento</h2><div class="group"><div class="row"><div class="main"><div class="title">Descanso activo</div><div class="meta">Camina 45 minutos y estira. Hoy no hay pesas.</div></div></div></div>`;
  const w = S.weights[iso], delta = weekDelta(), steps = ck.steps || 0, water = ck.water || 0;
  return `<div class="navbar" id="navbar"><span class="nb-title" aria-hidden="true">Hoy</span>${window.Acct ? Acct.chip() : ""}<button class="nb-btn gear" data-go="#/plan" aria-label="Ajustes">${I.gear}</button></div><h1 class="large" id="lt">${n < 1 ? "Hoy" : "Día " + n}</h1>
    <p class="sub" style="margin-bottom:8px">${S.profile.name ? "Hola, " + esc(prop(S.profile.name)) + ". " : ""}${longDate(iso)}${n >= 1 ? `. ${weekLabel(wk)}` : ""}</p>
    <div class="bar" role="progressbar" aria-label="Avance del plan" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="--p:${(pct)/100}"></i></div>
    ${storageWarn()}
    ${weekStrip(iso)}
    ${stats3()}
    ${calCard()}
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
    <div class="group"><div class="input-line"><input id="w-today" type="number" inputmode="decimal" step="0.1" placeholder="${wU()}" aria-label="Peso de hoy" value="${w ? fwi(w) : ""}"><button class="btn" data-act="saveweight">Guardar</button></div>
      ${delta !== null ? `<div class="row"><div class="main"><div class="title">Tendencia de 7 días</div><div class="meta">${trendText(delta)}</div></div></div>` : ""}</div>
    ${backupDue() ? `<h2 class="sec">Tus datos</h2><div class="group"><button class="row" data-go="#/progreso/datos"><div class="main"><div class="title">Haz una copia de tus datos</div><div class="meta">${S.lastExport ? "Tu última copia fue el " + shortDate(S.lastExport) : "Aún no has exportado una copia"}. Así no pierdes tu progreso si cambias de teléfono.</div></div>${I.chev}</button></div>` : ""}
    ${new Date().getDay() === 0 ? `<h2 class="sec">Esta semana</h2><div class="group"><button class="row" data-go="#/progreso/revision"><div class="main"><div class="title">Revisión semanal</div><div class="meta">Cinco preguntas y el ajuste recomendado</div></div>${I.chev}</button></div>` : ""}`;
}
const backupDue = () => dayNum() >= 7 && (Object.keys(S.weights).length >= 3 || totalSessions() >= 3) && (!S.lastExport || diffDays(todayISO(), S.lastExport) >= 14);
const slotName = (m, iso) => m.slot === "Cena (post-entreno)" && !isTrainDay(iso) ? "Cena" : m.slot;
/* "Ahora" sigue los horarios de la persona: su hora de entrenar, la de pesarse y las de sus comidas */
function nextAction(iso) {
  const now = new Date(), mins = now.getHours() * 60 + now.getMinutes(), ses = sessionFor(iso), ck = S.checks[iso] || {}, e = eatenOn(iso), all = MEALS();
  const done = ses && sessionDoneOn(iso, ses.id), trainAt = tMin((S.remind && S.remind.train) || "18:00"), weighAt = tMin((S.remind && S.remind.weigh) || "07:00");
  const hm = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  const ev = [];
  if (!S.weights[iso]) ev.push({ at: weighAt, win: 240, t: "Registra tu peso en ayunas", m: `Es mejor antes de comer, hacia las ${hm(weighAt)}`, go: "#/progreso/peso" });
  mealsToday(iso).forEach(m => { if (e[m.slot]) return; const at = tMin(m.time); if (at === 9999) return; ev.push({ at, win: 90, t: slotName(m, iso), m: `${m.time}, ${pick(m, iso).name}`, go: `#/comida/slot/${all.indexOf(m)}` }); });
  if (ses && !done) ev.push({ at: trainAt, win: 150, t: `Toca entrenar: ${ses.name}`, m: `${hm(trainAt)}, ${blocksOf(ses).length} bloques, ${sessMin(ses)} min`, go: `#/entreno/${ses.id}`, train: true });
  const active = ev.filter(x => mins >= x.at - 30 && mins <= x.at + x.win).sort((p, q) => Math.abs(mins - p.at) - Math.abs(mins - q.at))[0];
  if (active) return { label: "Ahora", t: active.t, m: active.m, go: active.go };
  const next = ev.filter(x => x.at > mins).sort((p, q) => p.at - q.at)[0];
  if (next) return { label: "Más tarde", t: `${next.t}, a las ${hm(next.at)}`, m: next.m.replace(/^\d+:\d+, /, ""), go: next.go };
  if (ses && !done) return { label: "Pendiente", t: `Aún puedes entrenar: ${ses.name}`, m: `${blocksOf(ses).length} bloques, ${sessMin(ses)} min`, go: `#/entreno/${ses.id}` };
  const snack = mealsToday(iso).find(m => !e[m.slot] && tMin(m.time) === 9999);
  if (snack) return { label: "Cuando quieras", t: "Snack con proteína", m: pick(snack, iso).name, go: `#/comida/slot/${all.indexOf(snack)}` };
  if ((ck.water || 0) < 2500 && mins < 21 * 60) return { label: "Pendiente", t: "Toma agua", m: `Llevas ${fmt((ck.water || 0) / 1000, 1)} L de 2.5 a 3 L`, go: "" };
  return null;
}
function nowCard(iso) {
  const a = nextAction(iso);
  return a ? `<button class="nowcard" ${a.go ? `data-go="${a.go}"` : "data-noop"}><div><small>${esc(a.label || "Ahora")}</small><b>${esc(a.t)}</b><span>${esc(a.m)}</span></div>${a.go ? I.chev : ""}</button>` : `<div class="nowcard done" role="status"><div><small>Hoy</small><b>Día completo</b><span>Lo que hiciste hoy cuenta. Descansa y mañana seguimos.</span></div></div>`;
}
function adoptState(n) { S = n; _plan = { k: "", v: null }; save(); applyAccent(); applyTheme(); if (window.Store) Store.persist(); }
async function stateFromCode(raw) {
  raw = String(raw || "").trim().replace(/\s+/g, ""); if (raw.length > 8e6) throw new Error("grande"); let json;
  if (raw.startsWith("R90G.")) { const bin = atob(raw.slice(5)), u8 = Uint8Array.from(bin, c => c.charCodeAt(0)); json = await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"))).text(); }
  else if (raw.startsWith("R90N.")) json = decodeURIComponent(escape(atob(raw.slice(5)))); else throw new Error("formato");
  const n = normalizeState(JSON.parse(json)); if (!n.profile || !n.start) throw new Error("vacío"); return n;
}
async function stateFromFile(f) { if (f.size > 5e6) throw new Error("grande"); const n = normalizeState(JSON.parse(await f.text())); if (!n.profile || !n.start) throw new Error("vacío"); return n; }
let wakeSent = null;
async function syncWake() {
  const r = parseHash(), need = S.wake !== false && (r[0] === "bloque" || (r[0] === "entreno" && r[1] === "intervalos"));
  try {
    if (need && !wakeSent && "wakeLock" in navigator && !document.hidden) { wakeSent = await navigator.wakeLock.request("screen"); wakeSent.addEventListener("release", () => { wakeSent = null; }); }
    else if (!need && wakeSent) { const w = wakeSent; wakeSent = null; await w.release(); }
  } catch (e) { wakeSent = null; }
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
const storageWarn = () => LS.persistent ? "" : `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="title" style="color:var(--bad)">Este navegador no guarda tus datos</div><div class="meta">Lo que registres se perderá al cerrar. Abre la app en Chrome o Safari (no dentro de WhatsApp, Instagram o Facebook) e instálala. Mientras tanto, exporta una copia en Progreso → Mis datos.</div></div></div></div>`;
function tipHoy() {
  if (S.tips && S.tips.hoy) return "";
  return `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="title">Así se usa</div><div class="meta">Toca el círculo para marcar una comida. Toca su nombre para cambiar de opción. Tu entreno está justo debajo: ahí registras cada vuelta.</div></div><button class="btn small quiet" data-act="tiphoy">Entendido</button></div></div>`;
}
function ringsHtml(iso) {
  const t = eatenTotals(iso), T = targetFor(iso), water = (S.checks[iso] || {}).water || 0;
  const rows = [["Calorías", `${num(t.kcal)} de ${num(T.kcal)} kcal`, t.kcal / T.kcal], ["Proteína", `${t.p} de ${T.p} g`, t.p / T.p], ["Agua", `${fmt(water / 1000, 1)} de 2.8 L`, water / 2800]];
  return rows.map(([l, v, p]) => `<div class="row top meter-row"><div class="main"><div class="mhead"><span class="title">${l}</span><span class="val">${v}</span></div><div class="bar" role="progressbar" aria-label="${l}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(Math.min(1, Math.max(0, p)) * 100)}"><i style="--p:${Math.min(1, Math.max(0, p)).toFixed(3)}"></i></div></div></div>`).join("");
}
function calSuggestion() {
  if (!S.start || dayNum() < 14) return null; const t = todayISO();
  if (S.calAt && diffDays(t, S.calAt) < 14) return null;
  if (Object.keys(S.weights).filter(d => d > addDays(t, -28)).length < 6) return null;
  const a = avgWeight(t, 7), b = avgWeight(addDays(t, -14), 7); if (!a || !b) return null;
  const kg = currentKg(), pct = (a - b) / 2 / kg, g = S.profile.goal || "recomp"; let d = 0, why = "";
  if (g === "fat") { if (pct > -0.0025) { d = -150; why = "Bajas más lento de lo planeado"; } else if (pct < -0.01) { d = 150; why = "Bajas demasiado rápido: cuida tu músculo y tu energía"; } }
  else if (g === "recomp") { if (pct > 0.002) { d = -150; why = "Subes más de lo esperado"; } else if (pct < -0.006) { d = 150; why = "Bajas demasiado rápido"; } }
  else { if (pct < 0.001) { d = 150; why = "Subes más lento de lo planeado"; } else if (pct > 0.007) { d = -150; why = "Subes demasiado rápido: sería más grasa que músculo"; } }
  if (!d || Math.abs((S.profile.adj || 0) + d) > 450) return null; return { d, why };
}
const calCard = () => { const c = calSuggestion(); return c ? `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="title">Ajuste de calorías</div><div class="meta">${esc(c.why)}. ${c.d > 0 ? "Sube" : "Baja"} ${Math.abs(c.d)} kcal al día.</div></div></div><div class="btn-wrap" style="display:flex;gap:8px"><button class="btn" data-act="calapply" data-d="${c.d}">Aplicar</button><button class="btn secondary" data-act="calsnooze">Ahora no</button></div></div>` : ""; };
function stats3() {
  const st = streak(), n = SESSIONS().filter(s => sessionDoneThisWeek(s.id)).length, tot = SESSIONS().length, d = weekDelta(), g = streakAt(todayISO()).grace;
  const racha = st === 0 ? "Hoy puedes empezar tu racha." : `Llevas ${st} ${st === 1 ? "día" : "días"} de racha${g ? ", con un día de gracia" : ""}.`;
  const peso = d === null || Math.abs(d) < 0.05 ? "" : ` Tu peso ${d < 0 ? "bajó" : "subió"} ${fmt(wd(Math.abs(d)), 1)} ${wU()} en 7 días.`;
  return `<p class="lead">${racha} Esta semana llevas ${n} de ${tot} entrenos.${peso}</p>`;
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
  if (d <= -0.8) return `<span class="trend warn">↓ ${fmt(wd(a), 2)} ${wU()}, baja rápido</span>`;
  if (d <= -0.25) return `<span class="trend good">↓ ${fmt(wd(a), 2)} ${wU()}, en rango</span>`;
  if (d < 0.2) return `<span class="trend flat">→ ${fmt(wd(d), 2)} ${wU()}, estable</span>`;
  return `<span class="trend warn">↑ ${fmt(wd(d), 2)} ${wU()}, sube</span>`;
}

/* Entreno */
function vTrain() {
  const iso = todayISO(), todayId = sessionFor(iso)?.id, doneN = SESSIONS().filter(s => sessionDoneThisWeek(s.id)).length;
  return `${nav("Entreno", { sub: `${doneN} de ${SESSIONS().length} sesiones esta semana`, gear: true })}
  ${modeSeg()}
  <div class="group">${SESSIONS().map(s => {
    const done = sessionDoneThisWeek(s.id), isT = s.id === todayId;
    return `<button class="row" data-go="#/entreno/${s.id}"><span class="daycol">${s.day}</span><div class="main"><div class="title">${esc(s.name)}</div><div class="meta">${esc(s.focus)}</div></div>${done ? '<span class="badge good">Hecho</span>' : isT ? '<span class="badge">Hoy</span>' : ""}${I.chev}</button>`;
  }).join("")}${restDays()}</div>
  <div class="group"><button class="row" data-go="#/entreno/ruta"><div class="main"><div class="title">Tu plan completo</div></div>${I.chev}</button><button class="row" data-go="#/entreno/libre"><div class="main"><div class="title">Entreno libre</div><div class="meta">Arma tu propia sesión</div></div>${I.chev}</button><button class="row" data-go="#/entreno/intervalos"><div class="main"><div class="title">Temporizador de intervalos</div></div>${I.chev}</button><button class="row" data-go="#/entreno/guias"><div class="main"><div class="title">Guías</div></div>${I.chev}</button></div>`;
}
function restDays() {
  const wds = SESSIONS().map(x => x.wd), off = [1, 2, 3, 4, 5, 6, 0].filter(d => !wds.includes(d));
  return off.map(d => `<div class="row"><span class="daycol">${WD_NAME[d]}</span><div class="main"><div class="title">Descanso activo</div><div class="meta">Camina 45 min y estira</div></div></div>`).join("");
}
const BARBELL = new Set(["squat_bb", "bench_bb", "ohp_bb", "inc_bb", "deadlift", "row_bb", "cgbp", "curl_bb", "skull", "rdl", "hip_thrust"]);
function platesFor(total, bar, set) {
  let side = (total - bar) / 2; if (side < 0) return null; const out = [];
  set.forEach(p => { const n = Math.floor((side + 1e-6) / p); if (n > 0) { out.push([p, n]); side -= n * p; } });
  return { out, left: Math.round(side * 100) / 100 };
}
const INT_KEY = "reto90.int", INT_PRESETS = [["tabata", "Tabata", 20, 10, 8], ["hiit", "HIIT", 30, 90, 8], ["emom", "EMOM", 60, 0, 10]];
let intT = null, intLast = "", intCfg = { work: 30, rest: 90, rounds: 8 };
function intState() { try { const x = JSON.parse(LS.getItem(INT_KEY) || "null"); return x && isFinite(x.start) && x.work > 0 && x.rounds > 0 ? x : null; } catch (e) { return null; } }
function intPhase(st) {
  const cycle = st.work + st.rest, total = st.rounds * cycle - st.rest, el = (Date.now() - st.start) / 1000;
  if (el < 0) return { ph: "ready", left: -el, round: 1 };
  if (el >= total) return { ph: "done", left: 0, round: st.rounds };
  const r = Math.floor(el / cycle), w = el - r * cycle; return w < st.work ? { ph: "work", left: st.work - w, round: r + 1 } : { ph: "rest", left: cycle - w, round: r + 1 };
}
function intTick() {
  const st = intState(); if (!st) { clearInterval(intT); intT = null; return; }
  const p = intPhase(st), key = p.ph + p.round;
  if (key !== intLast) { intLast = key; if (p.ph === "work") { beep(988, .35); vibrate([120, 60, 120]); } else if (p.ph === "rest") { beep(660, .35); vibrate(80); } else if (p.ph === "done") { beep(880, .8); vibrate([200, 100, 200]); toast("Intervalos terminados"); LS.removeItem(INT_KEY); } }
  const t = $("#int-t"); if (t) { t.textContent = p.ph === "done" ? "0:00" : `${Math.floor(Math.ceil(p.left) / 60)}:${String(Math.ceil(p.left) % 60).padStart(2, "0")}`; $("#int-ph").textContent = { ready: "Prepárate", work: "Trabajo", rest: "Descanso", done: "Terminado" }[p.ph]; $("#int-r").textContent = `Ronda ${p.round} de ${st.rounds}`; $("#int-box").dataset.ph = p.ph; if (p.ph === "done") { clearInterval(intT); intT = null; $("[data-act=intstart]").hidden = false; $("[data-act=intstop]").hidden = true; } }
}
function resumeInt() { if (intState() && !intT) { intT = setInterval(intTick, 250); intTick(); } }
function vIntervals() {
  const st = intState(), run = !!st && intPhase(st).ph !== "done", c = st || intCfg, num = (id, l, v, mn, mx) => `<div class="field"><label for="${id}">${l}</label><input id="${id}" type="number" inputmode="numeric" min="${mn}" max="${mx}" value="${v}" ${run ? "disabled" : ""}></div>`;
  return `${nav("Intervalos", { back: "Entreno", to: "#/entreno", sub: "Trabajo y descanso con aviso sonoro" })}
  <div class="int-box" id="int-box" data-ph="${run ? intPhase(st).ph : "idle"}"><div id="int-ph">${run ? "" : "Listo"}</div><div class="int-t" id="int-t">${run ? "" : Math.floor(c.work / 60) + ":" + String(c.work % 60).padStart(2, "0")}</div><div id="int-r">${run ? "" : c.rounds + " rondas"}</div></div>
  ${run ? "" : `<div class="group"><div class="field"><label>Ejemplos</label>${segHtml(INT_PRESETS.map(p => [p[0], p[1]]), "", "intpre", "Ejemplos")}</div></div>`}
  <div class="group">${num("int-work", "Trabajo (segundos)", c.work, 5, 600)}${num("int-rest", "Descanso (segundos)", c.rest, 0, 600)}${num("int-rounds", "Rondas", c.rounds, 1, 50)}</div>
  <div class="btn-wrap"><button class="btn" data-act="intstart" ${run ? "hidden" : ""}>Empezar</button><button class="btn secondary" data-act="intstop" ${run ? "" : "hidden"}>Detener</button></div>`;
}
const plainBlock = b => ({ t: b.t, rounds: b.rounds, rest: b.rest, items: b.items.map(it => ({ k: it.k, reps: it.reps, w: it.w ? { ...it.w } : null, note: it.note || "" })), ...(b.t === "cardio" ? { min: b.min, kind: b.kind || "z2", note: b.note || "" } : {}) });
function ensureCustom(sid) { const key = sid + "|" + S.mode; if (!S.custom[key]) S.custom[key] = blocksOf(sessionById(sid)).map(plainBlock); return S.custom[key]; }
function vEdit(sid) {
  const s = sessionById(sid); if (!s) return vTrain(); const bl = blocksOf(s), isCustom = !!S.custom[sid + "|" + S.mode], n = bl.length;
  const stp = (op, i, lbl, val) => `<div class="stepper"><button data-ed="${op}-|${sid}|${i}" aria-label="Menos ${lbl}">−</button><span class="v">${val}</span><button data-ed="${op}+|${sid}|${i}" aria-label="Más ${lbl}">+</button></div>`;
  return `${nav("Editar sesión", { back: s.name, to: `#/entreno/${sid}`, sub: "Solo cambia esta sesión en esta modalidad" })}
  ${bl.map((b, i) => `<h2 class="sec">Bloque ${i + 1}: ${typeLabel(b.t)}</h2><div class="group">
    ${b.t === "cardio" ? `<div class="row"><div class="main"><div class="title">Cardio</div><div class="meta">Minutos</div></div>${stp("m", i, "minutos", b.min)}</div>` : b.items.map((it, ii) => `<div class="row"><div class="main"><div class="title">${esc(D.EX[it.k].name)}</div><input class="ed-reps" data-edreps="${sid}|${i}|${ii}" value="${esc(it.reps)}" maxlength="24" aria-label="Repeticiones de ${esc(D.EX[it.k].name)}"></div><button class="nb-btn" data-ed="rmi|${sid}|${i}|${ii}" aria-label="Quitar ${esc(D.EX[it.k].name)}" style="color:var(--bad)">Quitar</button></div>`).join("") + `<div class="row"><div class="main"><div class="title">Series</div></div>${stp("r", i, "series", b.rounds)}</div><div class="row"><div class="main"><div class="title">Descanso</div></div>${stp("s", i, "descanso", fmtRest(b.rest))}</div>`}
    <div class="row ed-actions"><button class="nb-btn" data-ed="up|${sid}|${i}" ${i === 0 ? "disabled" : ""}>Subir</button><button class="nb-btn" data-ed="down|${sid}|${i}" ${i === n - 1 ? "disabled" : ""}>Bajar</button><button class="nb-btn" data-ed="rm|${sid}|${i}" style="color:var(--bad)">Quitar bloque</button></div></div>`).join("")}
  <div class="group" style="margin-top:14px"><button class="row" data-act="edadd" data-sid="${sid}"><div class="main"><div class="title" style="color:var(--accent)">Agregar ejercicio</div></div></button><button class="row" data-act="edcardio" data-sid="${sid}"><div class="main"><div class="title" style="color:var(--accent)">Agregar cardio</div></div></button></div>
  ${isCustom ? `<div class="group"><button class="row" data-act="edreset" data-sid="${sid}"><div class="main"><div class="title" style="color:var(--bad)">${sid === "libre" ? "Vaciar sesión" : "Volver al plan automático"}</div></div></button></div>` : ""}`;
}
const fold = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function pickerHtml(sid, q) {
  const s = sessionById(sid), present = new Set(blocksOf(s).flatMap(b => b.items.map(i => i.k))), qq = fold(q || ""), by = {};
  Object.keys(D.EX).forEach(k => { if (present.has(k) || !(D.EX[k].custom || exAvail(k, S.mode))) return; const e = D.EX[k]; if (qq && !fold(e.name + " " + e.muscle).includes(qq)) return; (by[D.MUSCLE[k] || "otros"] = by[D.MUSCLE[k] || "otros"] || []).push(k); });
  const names = Object.fromEntries(MYEX_MUSC.map(m => [m, m.charAt(0).toUpperCase() + m.slice(1)])); let shown = 0;
  const html = MYEX_MUSC.concat("otros").filter(m => by[m]).map(m => `<h2 class="sec">${names[m] || "Otros"}</h2><div class="group">${by[m].filter(() => shown++ < 70).map(k => `<button class="row" data-pick="${k}"><div class="main"><div class="title">${esc(D.EX[k].name)}</div></div></button>`).join("")}</div>`).join("");
  return html || `<div class="group"><div class="empty">No hay ejercicios con ese nombre.</div></div>`;
}
function addBlockEx(sid, k) { const it = resolveItem(k), blocks = ensureCustom(sid); blocks.push({ t: "uni", rounds: 3, rest: COMPOUND.has(k) ? 90 : 60, items: [{ k, reps: it.reps, w: it.w ? { ...it.w } : null, note: "" }] }); save(); }
function vGuides() {
  const rows = [["guia", "Cómo leer el entrenamiento"], ["abdomen", "Marcar el abdomen"], ["cardio", "Cardio"], ["limitadas", "Mancuernas limitadas"], ["porque", "Por qué este plan"]];
  return `${nav("Guías", { back: "Entreno" })}<div class="group">${rows.map(([k, t]) => `<button class="row" data-go="#/entreno/${k}"><div class="main"><div class="title">${t}</div></div>${I.chev}</button>`).join("")}</div>`;
}
function vGuide() { return `${nav("Cómo leer el entrenamiento", { back: "Entreno" })}<h2 class="sec">Uniserie, biserie y triserie</h2><div class="group"><div class="prose">${C.blocksGuide}</div></div><h2 class="sec">Pesos sugeridos</h2><div class="group"><div class="prose">${C.weightsGuide}</div></div>`; }
function vAbs() { return `${nav("Marcar el abdomen", { back: "Entreno" })}<div class="group"><div class="prose">${C.absGuide}</div></div>`; }

function vSession(id) {
  const s = sessionById(id); if (!s) return vTrain();
  const iso = todayISO(), bl = blocksOf(s), pr = sessionProgress(s), done = sessionDoneOn(iso, id);
  const first = bl.findIndex(b => blockProgress(b) < b.rounds);
  const noHist = Object.keys(S.hist).length === 0 && S.mode !== "home";
  const todays = sessionFor(iso);
  const otherDay = "";
  const intro = "";
  return `${nav(s.name, { back: "Entreno", sub: `${esc(s.focus)}, ${sessMin(s)} min` })}
  ${modeSeg()}
  ${prepRows()}<h2 class="sec">${bl.length} bloques, ${pr.done} de ${pr.total} vueltas</h2>
  ${bl.map((b, bi) => {
    const p = blockProgress(b), cd = b.t === "cardio";
    return `<a class="blk" href="#/bloque/${id}/${bi}" aria-label="Bloque ${bi + 1}: ${typeLabel(b.t)}"><div class="blk-head"><span class="chip ${b.t}">${bi + 1}, ${typeLabel(b.t)}</span><span class="info">${cd ? cardioMin(b) + " min, zona 2" : b.rounds + " vueltas, " + fmtRest(b.rest)}</span><span class="prog ${p === b.rounds ? "done" : ""}">${p === b.rounds ? "Hecho" : cd ? "" : p + "/" + b.rounds}</span></div>
      ${cd ? `<div class="row"><img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${cardioKind().gif}.gif" width="56" height="56"><div class="main"><div class="title">${esc(S.mode !== "gym" ? "Caminata rápida, trote suave o bici" : "Caminadora o elíptica")}</div><div class="meta">${esc(b.note || "Ritmo en el que puedes hablar frases cortas")}</div></div></div>` : b.items.map((it, ii) => { const ex = D.EX[it.k], sg = suggest(it); return `<div class="row">${b.items.length > 1 ? `<span class="letter">${letters[ii]}</span>` : ""}<img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${ex.id}.gif" width="56" height="56"><div class="main"><div class="title">${esc(ex.name)}</div><div class="meta">${esc(repsLabel(it.reps))}, ${esc(sg.text)}</div></div></div>`; }).join("")}</a><div class="blk-gap"></div>`;
  }).join("")}
  <div class="group"><button class="row" data-go="#/editar/${id}"><div class="main"><div class="title">Editar sesión</div><div class="meta">${S.custom && S.custom[id + "|" + S.mode] ? "Personalizada: " : ""}Agrega, quita o reordena ejercicios</div></div>${I.chev}</button></div>
  <div class="group"><div class="field"><label for="sn">Notas de hoy</label><textarea id="sn" data-sid="${id}" rows="2" maxlength="500" placeholder="Cómo te sentiste, ajustes de máquinas…">${esc(S.notes[todayISO() + "|" + id] || "")}</textarea></div></div>
  ${coolRow()}
  ${bl.length === 0 ? cta(`<button class="btn" data-go="#/editar/${id}">Agregar ejercicios</button>`) : cta(first >= 0 ? `<button class="btn" data-go="#/bloque/${id}/${first}">${pr.done ? "Continuar" : "Empezar"}, bloque ${first + 1}</button>` : `<button class="btn ${done ? "secondary" : ""}" data-act="finish" data-id="${id}">${done ? "Entrenamiento completado" : "Terminar entrenamiento"}</button>`)}`;
}

const deloadWeek = w => [4, 8].includes(w) || (w > 13 && (w - 14) % 4 === 3);
const cycleIdx = w => w <= 13 ? 0 : Math.floor((w - 14) / 4) + 1;
const weekLabel = w => w <= 13 ? `Semana ${w}` : `Ciclo ${cycleIdx(w) + 1}, semana ${((w - 14) % 4) + 1}`;
function prepRows() {
  const w = weekNum(), ph = phaseOf(w), dl = deloadWeek(w) || autoDlOn();
  return `<div class="group">
    <div class="row top"><div class="main"><div class="title">Calentamiento de 8 min</div><div class="meta">5 min de bici o caminadora, movilidad de hombros y cadera, y 2 series de aproximación del primer ejercicio.</div></div></div>
    <div class="row top"><div class="main"><div class="title">Recomendación</div><div class="meta">${esc(levelTip())}</div></div></div>
    <div class="row top"><div class="main"><div class="title">${dl ? "Semana de descarga" : "Esfuerzo"}</div><div class="meta">${dl ? "Una vuelta menos por bloque y 3–4 repeticiones en reserva." : esc(ph.rir) + " en reserva en las primeras vueltas; la última, " + (cons() ? "con 3 en reserva" : "al fallo (en barra libre, 1–2 en reserva)") + ". Sube peso al llegar al máximo del rango en todas."}</div></div></div>
  </div>`;
}
const levelTip = () => ({ nuevo: "Aprende el movimiento con pesos que dominas; la técnica antes que el peso.", medio: "Anota cada serie: más repeticiones o más peso cada semana es lo que construye músculo.", alto: "Técnica estricta, 1 s de pausa en el estiramiento y última vuelta de aislamiento al límite." })[S.profile.level || "medio"];
const coolRow = () => `<div class="group"><div class="row top"><div class="main"><div class="title">Al terminar, 5 min</div><div class="meta">Estira lo que trabajaste y respira lento. Si hoy toca cardio, aparece como un bloque más.</div></div></div></div>`;
function warmup(b, bi) {
  const it = b.items[0], sg = it && suggest(it);
  if (bi !== 0 || S.mode === "home" || !sg || !sg.n) return "";
  const w = x => { const v = sg.n * x, r = it.w.u === "c/mano" ? Math.round(v) : Math.round(v / 2.5) * 2.5; return fwi(Math.max(r, 2)); };
  return `<h2 class="sec">Calentamiento</h2><div class="group"><div class="row top"><div class="main"><div class="title">${S.mode === "gym" ? "5 min de caminadora o bici" : "5 min de movimiento suave (caminata, saltos ligeros o bici)"} y 3 series de aproximación</div><div class="meta">${w(0.5)} ${wU()} × 8, ${w(0.7)} ${wU()} × 5, ${w(0.85)} ${wU()} × 2 (${esc(D.EX[it.k].name)}). Sin llegar al cansancio.</div></div></div></div>`;
}
function vBlock(id, bi) {
  const s = sessionById(id), b = s && blocksOf(s)[bi]; if (!b) return vTrain();
  if (b.t === "cardio") return vCardio(s, b, bi);
  const bl = blocksOf(s), next = bi + 1 < bl.length;
  const strip = `<div class="strip" role="list">${b.items.map((it, ii) => { const ex = D.EX[it.k], sg = suggest(it), swapped = !!(S.swaps || {})[`${id}|${S.mode}|${bi}|${ii}`]; return `<div role="listitem" class="si"><a href="#/ej/${it.k}/${id}-${bi}-${ii}" aria-label="Ver técnica de ${esc(ex.name)}"><div class="gif"><img src="gifs/${ex.id}.gif" alt="Demostración de ${esc(ex.name)}" width="320" height="213"></div><div class="cap">${b.items.length > 1 ? letters[ii] + ", " : ""}${esc(ex.name)}${swapped ? ' <span class="badge">Cambiado</span>' : ""}<small>${esc(repsLabel(it.reps))}, ${esc(sg.text)}</small></div></a><button class="link" data-swap="${id}|${bi}|${ii}">Cambiar ejercicio</button></div>`; }).join("")}</div>`;
  const rounds = [];
  const active = Array.from({ length: b.rounds }, (_, r) => r).find(r => !b.items.every(it => roundDone(it, r)));
  for (let r = 0; r < b.rounds; r++) {
    const on = b.items.every(it => roundDone(it, r));
    rounds.push(`<div class="round ${on ? "done" : ""} ${r === active ? "active" : ""}" data-round="${r}"><div class="round-head"><b>Vuelta ${r + 1}</b>${r === b.rounds - 1 ? `<span class="effort">${effortLabel(b)}</span>` : ""}<button class="tick" data-tick="${r}" aria-pressed="${on}" aria-label="Vuelta ${r + 1} terminada">${I.check}</button></div>
      ${r === b.rounds - 1 && b.items.some(it => it.tag === "fail") ? `<button class="failbtn" data-fail="${r}" aria-pressed="${!!(getSets(b.items[0].k)[r] || {}).f}">Llegué al fallo</button>` : ""}<div class="entry-head"><span></span><span>Ejercicio</span><span>${S.mode === "home" ? "Extra " + wU() : (lbOn() ? "Lb" : "Kg")}</span><span>Reps</span></div>
      ${b.items.map((it, ii) => { const sg = suggest(it), cur = getSets(it.k)[r] || {}; return `<div class="entry"><span class="letter">${b.items.length > 1 ? letters[ii] : (ii + 1)}</span><span class="nm">${esc(D.EX[it.k].name)}<small>${esc(it.reps)}</small></span><input type="number" inputmode="decimal" step="0.5" min="0" data-i="${ii}" data-r="${r}" data-f="w" placeholder="${sg.n != null ? fwi(sg.n) : (S.mode === "home" ? "—" : "pc")}" value="${cur.w != null ? fwi(cur.w) : ""}" aria-label="${esc(D.EX[it.k].name)} vuelta ${r + 1}, kilos"><input type="number" inputmode="numeric" min="0" data-i="${ii}" data-r="${r}" data-f="r" placeholder="${lowReps(it.reps) ?? "reps"}" value="${cur.r ?? ""}" aria-label="${esc(D.EX[it.k].name)} vuelta ${r + 1}, repeticiones"></div>`; }).join("")}${r === active ? `<div style="padding:8px 16px 4px"><button class="btn" data-tick="${r}" aria-label="Terminar vuelta ${r + 1}">Vuelta ${r + 1} lista</button></div>` : ""}</div>`);
  }
  const p = blockProgress(b);
  const how = b.t === "uni" ? "Una serie, descansa, repite." : b.t === "bi" ? "Haz A, pasa directo a B y descansa al terminar la vuelta." : "Haz A, B y C seguidos y descansa al terminar la vuelta.";
  return `${nav(`Bloque ${bi + 1}`, { back: s.name, to: `#/entreno/${id}`, sub: `<span class="chip ${b.t}">${typeLabel(b.t)}</span> &nbsp;${b.rounds} vueltas, descanso ${fmtRest(b.rest)}<br><span style="font-size:14px">${how}</span>` })}
  ${strip}
  ${warmup(b, bi)}
  <h2 class="sec">Vueltas: ${p} de ${b.rounds}</h2>
  <div class="group">${rounds.join("")}</div>
  ${S.mode === "gym" && b.items.some(it => BARBELL.has(it.k)) ? `<div class="group"><button class="row" data-act="plates" data-k="${b.items.find(it => BARBELL.has(it.k)).k}" data-sid="${id}"><div class="main"><div class="title">Calculadora de discos</div><div class="meta">Qué discos poner en cada lado</div></div>${I.chev}</button></div>` : ""}
  <input type="hidden" id="blk-ctx" value="${id}|${bi}">
  ${cta(next ? `<button class="btn ${p === b.rounds ? "" : "quiet"}" data-go="#/bloque/${id}/${bi + 1}">Siguiente bloque</button>` : `<button class="btn ${p === b.rounds ? "" : "quiet"}" data-go="#/entreno/${id}">Terminar y ver resumen</button>`)}`;
}

function vCardio(s, b, bi) {
  const iso = todayISO(), k = cardioKind(), mins = cardioMin(b), rec = cardioRec(b, iso), done = !!rec?.done, ph = phaseOf(weekNum());
  const mix = b.kind === "mix" && weekNum() >= 5;
  const sessionHasNext = bi + 1 < blocksOf(s).length;
  return `${nav("Cardio", { back: s.name, to: `#/entreno/${s.id}`, sub: `${mins} min, zona 2, ${esc(s.name)}` })}
  ${segHtml(cardioKinds().map(x => [x.id, x.name]), k.id, "ckind", "Tipo de cardio")}
  <div class="gif-wrap" style="margin-top:12px"><img src="gifs/${k.gif}.gif" alt="Demostración de ${esc(k.name)}" width="320" height="213"></div>
  <div class="group" style="margin-top:14px">
    <div class="row top"><div class="main"><div class="title">${esc(k.name)}</div><div class="meta">${esc(k.how)}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Ritmo</div><div class="meta">Puedes hablar frases cortas pero no cantar (6–7 de 10). Unos 115–135 latidos por minuto, orientativo.</div></div></div>
    <div class="row top"><div class="main"><div class="title">Calentamiento</div><div class="meta">Los primeros 3–5 minutos, más suave.</div></div></div>
    ${mix ? `<div class="row top"><div class="main"><div class="title">Opcional: intervalos</div><div class="meta">5 min suave, 8 rondas de 30 s fuerte (8 de 10) + 90 s suave, 5 min suave. Si tus piernas no se recuperan, vuelve a zona 2.</div></div></div>` : ""}
    ${b.note ? `<div class="row top"><div class="main"><div class="meta">${esc(b.note)}</div></div></div>` : ""}
  </div>
  <div class="group"><div class="field"><label for="c-km">Distancia (km, opcional)</label><input id="c-km" type="number" inputmode="decimal" step="0.1" min="0" placeholder="Ej. 3.5" value="${rec && rec.km ? rec.km : ""}"></div></div>
  <div class="btn-wrap"><button class="btn quiet" data-ctimer="${mins * 60}">Iniciar temporizador de ${mins} min</button></div>
  ${cta(`<button class="btn ${done ? "secondary" : ""}" data-cdone="${b.key}|${mins}|${s.id}">${done ? "Cardio completado" : "Marcar cardio hecho"}</button>`)}`;
}
function vWhy(kind) {
  const list = C.why[kind].filter(x => !x.only || x.only.includes(S.profile.goal || "recomp")), used = [];
  const vol = {}; SESSIONS().forEach(se => blocksOf(se).forEach(b => b.items.forEach(it => { const g = D.MUSCLE[it.k]; vol[g] = (vol[g] || 0) + b.rounds; })));
  const order = ["pecho", "espalda", "hombro", "hombro posterior", "bíceps", "tríceps", "cuádriceps", "femoral", "glúteo", "pantorrilla", "abdomen"];
  const volTable = kind === "train" ? `<h2 class="sec">Series directas por semana</h2><div class="group">${order.filter(m => vol[m]).map(m => `<div class="row"><div class="main"><div class="title">${esc(m.charAt(0).toUpperCase() + m.slice(1))}</div></div><span class="val" style="color:var(--label);font-weight:600">${vol[m]}</span></div>`).join("")}</div><p class="note">Son series directas. Los press también trabajan el tríceps y los jalones y remos el bíceps, así que su trabajo real es mayor. Rango habitual para hipertrofia: 10–20.</p>` : "";
  return `${nav(kind === "train" ? "Por qué este plan" : "Por qué esta dieta", { back: kind === "train" ? "Entreno" : "Comida", to: kind === "train" ? "#/entreno" : "#/comida" })}
  ${volTable}
  <h2 class="sec">${kind === "train" ? "Decisiones" : "Cómo se calcula"}</h2>
  <div class="group">${list.map(x => { return `<div class="row top"><div class="main"><div class="title">${esc(fill(x.t))}</div><div class="meta">${esc(fill(x.d))}</div></div></div>`; }).join("")}</div>`;
}
function vLimited() { return `${nav("Mancuernas limitadas", { back: "Entreno" })}<div class="group"><div class="prose">${C.limitedGuide}</div></div>`; }
function vCardioGuide() { return `${nav("Guía de cardio", { back: "Entreno" })}<div class="group"><div class="prose">${C.cardioGuide}</div></div>`; }

function vSwap(sid, bi, ii) {
  const s = sessionById(sid), b = s && blocksOf(s)[bi], it = b && b.items[ii]; if (!it) return vTrain();
  const key = `${sid}|${S.mode}|${bi}|${ii}`, cur = D.EX[it.k], alts = altsFor(s, bi, ii), swapped = !!(S.swaps || {})[key];
  return `${nav("Cambiar ejercicio", { back: `Bloque ${bi + 1}`, to: `#/bloque/${sid}/${bi}`, sub: `Ahora: <strong>${esc(cur.name)}</strong>, ${esc(cur.muscle)}` })}
  ${alts.length ? `<h2 class="sec">Alternativas con tu equipo</h2><div class="group">${alts.map(a => { const ex = D.EX[a.k]; return `<button class="row" data-swapto="${key}|${a.k}"><img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${ex.id}.gif" width="56" height="56"><div class="main"><div class="title">${esc(ex.name)}</div><div class="meta">${esc(ex.muscle)}, ${esc(a.fam)}</div></div>${I.chev}</button>`; }).join("")}</div>
  <p class="note">Mismo músculo y movimiento, con tu equipo.</p>` : `<div class="group"><div class="empty">No hay alternativas equivalentes con tu equipo para este ejercicio.</div></div>`}
  ${swapped ? `<h2 class="sec">Original</h2><div class="group"><button class="row" data-swapto="${key}|"><div class="main"><div class="title">Volver al ejercicio original</div></div></button></div>` : ""}`;
}
function vExercise(k, ctx) {
  const ex = D.EX[k]; if (!ex) return vTrain();
  const [sid, bi, ii] = (ctx || "").split("-"), s = sessionById(sid);
  const it = s ? blocksOf(s)[+bi]?.items[+ii] : null, sg = it ? suggest(it) : null;
  const hist = [...(S.hist[k] || [])].reverse().slice(0, 5);
  return `${nav(ex.name, { back: s ? `Bloque ${+bi + 1}` : "Entreno", sub: esc(ex.muscle) })}
  ${s ? `<div class="group"><button class="row" data-act="hurt" data-k="${k}" data-sid="${sid}"><div class="main"><div class="title" style="color:var(--bad)">Me duele este ejercicio</div><div class="meta">Lo cambiamos por uno seguro</div></div></button></div>` : ""}
  <div class="gif-wrap"><img src="gifs/${ex.id}.gif" alt="Demostración de ${esc(ex.name)}: posición inicial y final" width="320" height="213"></div>
  ${it ? `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="weight-line"><span class="kg">${esc(sg.text)}</span><span class="pill">${esc(repsLabel(it.reps))}</span></div><div class="meta">${esc(sg.src)}${it.note ? " " + esc(it.note) : ""}</div></div></div></div>` : ""}
  <h2 class="sec">Mi nota</h2>
  <div class="group"><div class="field"><textarea id="en" data-k="${k}" rows="2" maxlength="200" placeholder="Ej. asiento en 5, agarre ancho">${esc(S.enotes[k] || "")}</textarea></div></div>
  <h2 class="sec">Técnica</h2>
  <div class="group"><ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>
  <h2 class="sec">Tu historial</h2>
  ${hist.length ? `<div class="group">${hist.map(h => { const best = h.sets.filter(x => x.r).sort((a, b) => (b.w || 0) * 100 + b.r - ((a.w || 0) * 100 + a.r))[0]; return `<div class="row"><div class="main"><div class="title">${shortDate(h.d)}</div></div><span class="val">${h.sets.filter(x => x.done).length} vueltas, ${best ? (best.w ? fwi(best.w) + " " + wU() + " × " : "") + best.r : "—"}</span></div>`; }).join("")}</div>` : `<div class="group"><div class="empty">Aún sin registros. Se llenan al marcar las vueltas.</div></div>`}`;
}

/* Comida */
function vFood() {
  const iso = todayISO(), T = targetFor(iso);
  return `${nav("Comida", { sub: `Meta ≈ ${T.kcal.toLocaleString("es-MX")} kcal, proteína ${T.p} g`, gear: true })}
  <div class="group">${mealRows(iso, true)}${intake(iso)}</div>
  <div class="group">
    <button class="row" data-go="#/comida/menu"><div class="main"><div class="title">Menú de la semana</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/compras"><div class="main"><div class="title">Lista de compras</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/dieta"><div class="main"><div class="title">Descargar o compartir dieta</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/snacks"><div class="main"><div class="title">Snacks</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/guias"><div class="main"><div class="title">Guías</div></div>${I.chev}</button>
  </div>`;
}
function vDiet() {
  return `${nav("Tu dieta", { back: "Comida", to: "#/comida", sub: "Menú de 7 días y lista de compras con tus porciones" })}
  <div class="group">
    <button class="row" data-go="#/imprimir"><div class="main"><div class="title">Imprimir o guardar PDF</div><div class="meta">Formato ordenado para papel</div></div>${I.chev}</button>
    <button class="row" data-act="csv"><div class="main"><div class="title">Descargar para Excel</div><div class="meta">Archivo para Excel con comidas y macros</div></div></button>
    <button class="row" data-act="sharediet"><div class="main"><div class="title">Compartir como texto</div><div class="meta">Por mensaje, correo o notas</div></div></button>
  </div>`;
}
function dietText() {
  const c = planCalc(), nm = S.profile.name ? " de " + prop(S.profile.name) : "";
  let t = `Menú semanal${nm}\nMeta en día de entreno: ${num(c.train.kcal)} kcal, proteína ${c.train.p} g, carbohidratos ${c.train.c} g, grasas ${c.train.g} g\n`;
  weekMenu().forEach(d => { t += `\n${d.dn.toUpperCase()}${d.rest ? " (descanso)" : ""}, ${num(d.tot.kcal)} kcal\n` + d.meals.map(x => `• ${x.slot} (${x.time}): ${x.v.name} — ${x.v.items.join(", ")}, ${x.v.m.kcal} kcal`).join("\n") + "\n"; });
  t += "\nLISTA DE COMPRAS (7 días)\n"; shopData().forEach(([g, it]) => { t += `${g}: ` + it.map(([n, q]) => `${n} ${q}`).join(", ") + "\n"; });
  return t.trim();
}
function vFoodGuides() {
  const rows = [["#/comida/guia/semaforo", "Qué comer"], ["#/comida/guia/evitar", "Qué evitar"], ["#/comida/guia/cambios", "Cambios inteligentes"], ["#/comida/guia/ideas", "Ideas de comidas"], ["#/comida/guia/fuera", "Comer fuera"], ["#/comida/guia/etiquetas", "Etiquetas y porciones"], ["#/comida/guia/prep", "Meal prep y ahorro"], ["#/comida/guia/alt", "Alternativas"], ["#/comida/reglas", "Reglas, agua y suplementos"], ["#/comida/porque", "Por qué esta dieta"]];
  return `${nav("Guías", { back: "Comida", to: "#/comida" })}<div class="group">${rows.map(([h, t]) => `<button class="row" data-go="${h}"><div class="main"><div class="title">${t}</div></div>${I.chev}</button>`).join("")}</div>`;
}
function weekMenu() {
  const restIdx = S.weekend === "sab" ? 6 : 5, all = MEALS();
  return DAYN.map((dn, d) => {
    const rest = d === restIdx, meals = dayMeals(rest).map(m => { const si = all.indexOf(m); return { slot: m.slot, time: m.time, v: optView(m.opts[(d + si) % m.opts.length], slotF(m, rest)) }; });
    const tot = meals.reduce((a, x) => ({ kcal: a.kcal + x.v.m.kcal, p: a.p + x.v.m.p, c: a.c + x.v.m.c, g: a.g + x.v.m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
    return { dn, rest, meals, tot };
  });
}
function shopData() {
  const tot = {}, F = D.FOODS, all = MEALS(), restIdx = S.weekend === "sab" ? 6 : 5;
  const add = (raw, f) => raw.forEach(([k, q]) => { tot[k] = (tot[k] || 0) + scaleQty(k, q, f); });
  DAYN.forEach((dn, d) => { dayMeals(d === restIdx).forEach(m => { { const o = m.opts[(d + all.indexOf(m)) % m.opts.length]; add(o.raw, fFor(o, slotF(m, d === restIdx))); } }); });
  const grp = [["Proteínas", ["pollo", "bistec", "molida", "tilapia", "atun", "huevo", "huevo_c", "claras", "jamon", "panela", "yogurt", "requeson", "leche", "tofu", "soya", "lentejas", "garbanzo", "whey"]], ["Carbohidratos", ["arroz", "papa", "camote", "frijol", "avena", "tortilla", "pan", "pasta", "tostada", "platano", "fresas", "manzana"]], ["Grasas y verdura", ["aguacate", "aceite", "cacahuate", "verdura", "jicama"]]];
  const line = k => {
    const q = Math.ceil(tot[k] || 0); if (!q || !F[k]) return null; const f = F[k]; let txt;
    if (f.unit === "pza") txt = k === "tortilla" ? `${(q * 30 / 1000).toFixed(1)} kg (≈ ${q} tortillas)` : `${q} pzas`;
    else if (k === "atun") txt = `${Math.ceil(q / 140)} latas`;
    else txt = q >= 1000 ? `${(Math.ceil(q / 100) / 10).toFixed(1)} kg` : `${Math.ceil(q / 50) * 50} g`;
    if (k === "aceite") txt = "1 botella chica"; if (k === "whey") txt = "opcional (2 scoops)";
    return [f.name.charAt(0).toUpperCase() + f.name.slice(1), txt];
  };
  return grp.map(([t, ks]) => [t, ks.map(line).filter(Boolean)]).filter(([, it]) => it.length);
}
const DAYN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function vMenu() {
  const restIdx = S.weekend === "sab" ? 6 : 5;
  return `${nav("Menú de la semana", { back: "Comida", sub: "Toca un día para usarlo hoy." })}
  <div class="group">${DAYN.map((dn, d) => {
    const rest = d === restIdx, all = MEALS(), names = dayMeals(rest).map(m => m.opts[(d + all.indexOf(m)) % m.opts.length].name);
    return `<button class="row top" data-menu="${d}"><div class="main"><div class="title">${dn}${rest ? ' <span class="pill">descanso</span>' : ""}</div><div class="meta">${names.map(esc).join(", ")}</div></div>${I.chev}</button>`;
  }).join("")}</div>`;
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
  const sel = S.picks[m.slot] ?? 0, f = slotF(m, !isTrainDay(todayISO()));
  const tail = m.slot === "Pre-entreno" ? "Entre 60 y 90 minutos antes de entrenar, bajo en grasa para digerir bien." : m.slot.startsWith("Cena") ? "Después de entrenar. Si entrenas el fin de semana por la mañana, la comida fuerte hace de post-entreno." : m.slot === "Snack" ? "Úsalo a media tarde o noche si te falta proteína o tienes hambre." : m.slot === "Merienda" ? "Una colación con proteína para llegar a tu meta del día." : "";
  return `${nav(m.slot, { back: "Comida", sub: m.time })}
  <div class="group" role="radiogroup" aria-label="Opciones de ${esc(m.slot)}">${m.opts.map(o => optView(o, f)).map((o, j) => `<button class="row top" data-pick="${j}" data-slot="${esc(m.slot)}" role="radio" aria-checked="${j === sel}"><span class="opt-radio ${j === sel ? "on" : ""}"></span><div class="main"><div class="title">${esc(o.name)}</div><div class="meta">${o.m.kcal} kcal: ${o.m.p} g de proteína, ${o.m.c} g de carbohidratos y ${o.m.g} g de grasas</div><ul class="ing">${o.items.map(t => `<li>${esc(t)}</li>`).join("")}</ul>${o.tip ? `<div class="meta" style="margin-top:6px">${esc(o.tip)}</div>` : ""}</div></button>`).join("")}</div>`;
}
function vSnacks() {
  return `${nav("Snacks", { back: "Comida", sub: "Ideas con proteína" })}
  <div class="group">${(isVeg() ? D.SNACKS_VEG : D.SNACKS).map(o => optView(o)).map(o => `<div class="row top"><div class="main"><div class="title">${esc(o.name)}</div><div class="meta">${o.m.kcal} kcal: ${o.m.p} g de proteína, ${o.m.c} g de carbohidratos y ${o.m.g} g de grasas</div><ul class="ing">${o.items.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div></div>`).join("")}</div>`;
}
function vFoodRules() {
  return `${nav("Reglas", { back: "Comida" })}
  <h2 class="sec">En la cocina</h2><div class="group"><div class="prose">${C.foodRules}</div></div>
  <h2 class="sec">Hidratación</h2><div class="group"><div class="prose">${C.hydrationTips}</div></div>
  <h2 class="sec">Suplementos</h2><div class="group"><div class="prose">${C.supplements}</div></div>`;
}
function vPrint() {
  const c = planCalc(), wm = weekMenu(), who = S.profile.name ? esc(prop(S.profile.name)) : "", g = C.goals[S.profile.goal || "recomp"];
  const hoy = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  const stat = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
  const days = wm.map((d, i) => `<section class="pd-day${d.rest ? " rest" : ""}"><h3><em>${i + 1}</em>${d.dn}${d.rest ? "<small>Descanso</small>" : "<small>Entreno</small>"}</h3>
    <table><thead><tr><th>Comida</th><th>Platillo</th><th>Ingredientes</th><th class="n">kcal</th><th class="n">P</th><th class="n">C</th><th class="n">G</th></tr></thead>
    <tbody>${d.meals.map(x => `<tr><td><b>${esc(x.slot)}</b><br><small>${esc(x.time)}</small></td><td class="dish">${esc(x.v.name)}</td><td class="ing">${x.v.items.map(esc).join(", ")}</td><td class="n">${x.v.m.kcal}</td><td class="n">${x.v.m.p}</td><td class="n">${x.v.m.c}</td><td class="n">${x.v.m.g}</td></tr>`).join("")}</tbody>
    <tfoot><tr><td colspan="3">Total del día</td><td class="n">${num(d.tot.kcal)}</td><td class="n">${d.tot.p}</td><td class="n">${d.tot.c}</td><td class="n">${d.tot.g}</td></tr></tfoot></table></section>`).join("");
  const shop = shopData().map(([t, it]) => `<div class="pd-col"><h4>${esc(t)}</h4><ul>${it.map(([n, q]) => `<li><i></i><span>${esc(n)}</span><b>${esc(q)}</b></li>`).join("")}</ul></div>`).join("");
  return `${nav("Imprimir menú", { back: "Dieta", to: "#/comida/dieta", sub: "Elige “Guardar como PDF” al imprimir" })}
  <div class="btn-wrap noprint"><button class="btn" data-act="print">Imprimir o guardar PDF</button></div>
  <article class="print-doc"><header class="pd-head"><div><p class="pd-kicker">R90: plan de alimentación</p><h2>Menú semanal${who ? "<br><span>" + who + "</span>" : ""}</h2></div><p class="pd-meta">${esc(g.name)}<br>${hoy}</p></header>
  <div class="pd-stats">${stat(num(c.train.kcal), "kcal en día de entreno")}${stat(num(c.rest.kcal), "kcal en descanso")}${stat(c.train.p + " g", "proteína")}${stat(c.train.c + " g", "carbohidratos")}${stat(c.train.g + " g", "grasas")}</div>
  <p class="pd-note">Porciones ajustadas a tu plan. Las cantidades de comida están en crudo. P = proteína, C = carbohidratos, G = grasas (en gramos).</p>
  ${days}<section class="pd-shopwrap"><h2 class="pd-h">Lista de compras, 7 días</h2><div class="pd-shop">${shop}</div><p class="pd-note">Despensa: sal, especias, limón, cebolla, cilantro, chile, salsa casera, mostaza, aceite en aerosol, té verde y agua mineral.</p></section>
  <footer>Son estimaciones; no sustituyen a un médico o nutriólogo. Generado con R90.</footer></article>`;
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
  return `${nav("Compras", { back: "Comida", sub: "Para toda la semana" })}
  ${grp.map(([t, ks]) => `<h2 class="sec">${t}</h2><div class="group">${ks.map(line).join("")}</div>`).join("")}`;
}

/* Progreso */
/* ───────── Seguimiento ───────── */
let chartMetric = "peso", chartRange = 28, calOffset = 0, phAngle = "frente";
const sessKeys = c => Object.keys(c || {}).filter(k => k.startsWith("s_") && c[k]);
const activity = iso => { const c = S.checks[iso] || {}, sess = sessKeys(c).length > 0, meals = Object.values(S.eaten[iso] || {}).filter(Boolean).length; return { sess, meals, any: sess || meals >= 3 || !!S.weights[iso] }; };
function streakAt(end) {
  let d = end, n = 0, lastMiss = null, grace = false;
  if (!activity(d).any) d = addDays(d, -1);
  while (S.start && d >= S.start) {
    if (activity(d).any) n++;
    else if (lastMiss === null || diffDays(lastMiss, d) > 6) { lastMiss = d; grace = true; }
    else break;
    d = addDays(d, -1);
  }
  return { n, grace };
}
const streak = () => streakAt(todayISO()).n;
function bestStreak() { let best = 0; if (!S.start) return 0; for (let d = S.start; d <= todayISO(); d = addDays(d, 1)) best = Math.max(best, streakAt(d).n); return best; }
const totalSessions = () => Object.values(S.checks).reduce((a, c) => a + sessKeys(c).length, 0);
function vProgress() {
  const now = avgWeight(todayISO());
  const ws = Object.entries(S.waists).sort((a, b) => a[0] < b[0] ? -1 : 1), w0 = ws[0], w1 = ws[ws.length - 1];
  let adh = 0, dn = 0;
  for (let i = 0; i < 7; i++) { const d = addDays(todayISO(), -i); if (d < S.start) continue; dn++; const ms = mealsToday(d).filter(m => m.slot !== "Snack"), e = eatenOn(d); adh += ms.filter(m => e[m.slot]).length / ms.length; }
  const row = (h, t) => `<button class="row" data-go="${h}"><div class="main"><div class="title">${t}</div></div>${I.chev}</button>`;
  return `${nav("Progreso", { gear: true })}
  <div class="group"><button class="row" data-go="#/progreso/meta"><div class="main"><div class="title">Meta de peso</div></div><span class="val">${goalText()}</span>${I.chev}</button></div>
  <div class="group">
    <div class="row"><div class="main"><div class="title">Peso (promedio 7 días)</div></div><span class="val" style="color:var(--label);font-weight:600">${now ? fwt(now, 1) : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Cintura</div></div><span class="val">${w1 ? (w0[0] !== w1[0] ? `${fl(w0[1])} → ${fl(w1[1])} ${lU()}` : fl(w1[1]) + " " + lU()) : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Comidas cumplidas (7 días)</div></div><span class="val">${dn ? Math.round(adh / dn * 100) + " %" : "—"}</span></div>
  </div>
  ${segHtml([["peso", "Peso"], ["cintura", "Cintura"]], chartMetric, "cmetric", "Qué graficar")}
  <div style="height:8px"></div>${segHtml([[28, "4 semanas"], [84, "12 semanas"], [0, "Todo"]], chartRange, "crange", "Periodo")}
  <div class="group" style="padding:12px 8px 4px;margin-top:10px" id="chartbox">${chartSvg()}</div>
  <div class="group" id="calbox">${calHtml()}</div>
  <h2 class="sec">Registrar</h2>
  <div class="group">${row("#/progreso/peso", "Peso y cintura")}${row("#/progreso/medidas", "Medidas del cuerpo")}${S.photos ? row("#/progreso/fotos", "Fotos de progreso") : ""}${row("#/progreso/revision", "Revisión semanal")}</div>
  <h2 class="sec">Historial</h2>
  <div class="group">${row("#/progreso/musculos", "Músculos: series y resultados")}${row("#/progreso/fuerza", "Fuerza y récords")}${row("#/progreso/historial", "Entrenos completados")}${row("#/progreso/logros", "Logros")}${row("#/progreso/resumen", "Resumen del mes")}${row("#/progreso/compartir", "Compartir progreso")}</div>
  <h2 class="sec">Guías</h2>
  <div class="group">${row("#/progreso/guia", "Qué medir y cómo")}${row("#/progreso/habitos", "Hábitos")}${row("#/progreso/calorias", "Cuándo ajustar calorías")}</div>`;
}
function chartSvg() {
  const isW = chartMetric === "peso", from = chartRange ? addDays(todayISO(), -chartRange) : "0000-00-00";
  const pts = (isW ? sortedWeights() : Object.entries(S.waists).sort((a, b) => a[0] < b[0] ? -1 : 1)).filter(p => p[0] >= from);
  if (pts.length < 2) return `<div class="empty">Con 2 o más registros de ${isW ? "peso" : "cintura"} aparece la gráfica.</div>`;
  const W = 340, H = 170, pl = 30, pr = 8, pt = 10, pb = 22, vals = pts.map(p => isW ? wd(p[1]) : ld(p[1])), avgs = isW ? pts.map(([d]) => wd(avgWeight(d))) : vals;
  const lo = Math.floor(Math.min(...vals, ...avgs) - 0.5), hi = Math.ceil(Math.max(...vals, ...avgs) + 0.5), unit = isW ? wU() : lU();
  const X = i => pl + i / (pts.length - 1) * (W - pl - pr), Y = v => pt + (hi - v) / (hi - lo) * (H - pt - pb);
  const grid = []; for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) grid.push(`<line class="grid" x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pl - 5}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`);
  const line = avgs.map((a, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(a).toFixed(1)}`).join("");
  const change = vals[vals.length - 1] - vals[0];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de ${isW ? "peso" : "cintura"}: de ${vals[0]} a ${vals[vals.length - 1]} ${unit}">${grid.join("")}${isW ? pts.map((p, i) => `<circle class="pt" cx="${X(i)}" cy="${Y(wd(p[1]))}" r="2.6"/>`).join("") : ""}<path class="avg" d="${line}" pathLength="1"/>${!isW ? pts.map((p, i) => `<circle class="dotpt" cx="${X(i)}" cy="${Y(p[1])}" r="3"/>`).join("") : ""}<text x="${pl}" y="${H - 6}">${shortDate(pts[0][0])}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end">${shortDate(pts[pts.length - 1][0])}</text></svg>
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
  const c = S.checks[iso] || {}, e = Object.entries(S.eaten[iso] || {}).filter(([, v]) => v).map(([k]) => k), sess = sessKeys(c).map(k => sessMeta(k.slice(2))?.name).filter(Boolean);
  const sets = Object.values(S.hist).reduce((a, h) => a + ((h.find(x => x.d === iso)?.sets || []).filter(x => x.done).length), 0);
  const row = (t, v) => `<div class="row"><div class="main"><div class="title">${t}</div></div><span class="val">${v}</span></div>`;
  return `<div class="group">${row("Peso", S.weights[iso] ? fwt(S.weights[iso], 1) : "—")}${row("Entreno", sess.length ? esc(sess.join(", ")) : "—")}${sets ? row("Series completadas", sets) : ""}${row("Comidas marcadas", e.length ? e.length : "—")}${row("Agua", c.water ? fmt(c.water / 1000, 1) + " L" : "—")}${row("Pasos", c.steps ? num(c.steps) : "—")}${row("Dormí 7 h o más", c.sleep ? "Sí" : "—")}</div>${e.length ? `<p class="note">${esc(e.join(", "))}</p>` : ""}`;
}
function vBodyMeasures() {
  const iso = todayISO(), F = [["cintura", "Cintura (a la altura del ombligo)"], ["pecho", "Pecho (a la altura de las tetillas)"], ["brazo", "Brazo flexionado (la parte más ancha)"], ["muslo", "Muslo (a medio camino de la rodilla)"], ["cadera", "Cadera (la parte más ancha)"], ["hombros", "Hombros (alrededor, sobre los deltoides)"], ["pantorrilla", "Pantorrilla (la parte más ancha)"]];
  const get = (k, d) => k === "cintura" ? S.waists[d] : (S.body || {})[d]?.[k];
  const dates = [...new Set([...Object.keys(S.waists), ...Object.keys(S.body || {})])].sort();
  const delta = F.map(([k, l]) => { const ds = dates.filter(d => get(k, d)); return ds.length >= 2 ? `<div class="row"><div class="main"><div class="title">${esc(l.split(" (")[0])}</div><div class="meta">${fl(get(k, ds[0]))} → ${fl(get(k, ds[ds.length - 1]))} ${lU()}</div></div><span class="val" style="font-weight:600;color:var(--label)">${(get(k, ds[ds.length - 1]) - get(k, ds[0])) > 0 ? "+" : ""}${fmt(ld(get(k, ds[ds.length - 1]) - get(k, ds[0])), 1)} ${lU()}</span></div>` : ""; }).join("");
  return `${nav("Medidas del cuerpo", { back: "Progreso", sub: "Cada 2 semanas, en ayunas, con cinta sin apretar. Son mejores que la báscula para ver cambios reales." })}
  <h2 class="sec">Hoy</h2><div class="group">${F.map(([k, l]) => `<div class="field"><label for="m-${k}">${esc(l)}</label><input id="m-${k}" type="number" inputmode="decimal" step="0.1" min="10" max="250" placeholder="${lU()}" value="${get(k, iso) != null ? fl(get(k, iso)) : ""}"></div>`).join("")}</div>
  <div class="btn-wrap"><button class="btn" data-act="savebody">Guardar medidas</button></div>
  <h2 class="sec">Cambio desde la primera medida</h2>${delta ? `<div class="group">${delta}</div>` : `<div class="group"><div class="empty">Registra al menos dos veces para ver tu cambio.</div></div>`}`;
}
function vPhotos() {
  return `${nav("Fotos de progreso", { back: "Progreso", sub: "Opcional. Se quedan solo en este teléfono" })}
  <div class="group"><div class="field"><label>Ángulo de la foto</label>${segHtml([["frente", "Frente"], ["perfil", "Perfil"], ["espalda", "Espalda"]], phAngle, "angle", "Ángulo")}</div>
    <label class="row" style="cursor:pointer"><div class="main"><div class="title" style="color:var(--accent)">Tomar o elegir una foto</div><div class="meta">Mismo lugar, luz y hora cada vez</div></div><input type="file" accept="image/*" id="ph-file" hidden></label></div>
  <div id="ph-cmp"></div><div id="ph-grid"><div class="skel"></div></div>`;
}
let photoUrls = [];
async function loadPhotos() {
  const grid = $("#ph-grid"), cmp = $("#ph-cmp"); if (!grid) return;
  photoUrls.forEach(u => URL.revokeObjectURL(u)); photoUrls = [];
  if (!window.Store || !Store.available()) { grid.innerHTML = `<div class="group"><div class="empty">Tu navegador no permite guardar fotos aquí.</div></div>`; return; }
  let list = []; try { list = (await Store.photos()).sort((a, b) => a.date < b.date ? 1 : -1); } catch { grid.innerHTML = `<div class="group"><div class="empty">No se pudieron leer las fotos guardadas.</div></div>`; return; }
  if (!$("#ph-grid")) return;
  const url = p => { const u = URL.createObjectURL(p.blob); photoUrls.push(u); return u; };
  const same = list.filter(p => p.angle === phAngle);
  cmp.innerHTML = same.length >= 2 ? (() => { const a = same[same.length - 1], b = same[0]; return `<h2 class="sec">Primera y última (${esc(phAngle)})</h2><div class="cmp"><figure><img src="${url(a)}" alt="Foto de ${esc(a.angle)} del ${esc(longDate(a.date))}"><figcaption>${shortDate(a.date)}</figcaption></figure><figure><img src="${url(b)}" alt="Foto de ${esc(b.angle)} del ${esc(longDate(b.date))}"><figcaption>${shortDate(b.date)}, ${diffDays(b.date, a.date)} días después</figcaption></figure></div>`; })() : "";
  grid.innerHTML = list.length ? `<h2 class="sec">Todas tus fotos</h2><div class="pgrid">${list.map(p => `<button class="pth" data-photo="${esc(p.id)}" aria-label="Foto de ${esc(p.angle)}, ${esc(longDate(p.date))}"><img src="${url(p)}" alt=""><span>${shortDate(p.date)}, ${esc(p.angle)}</span></button>`).join("")}</div>` : `<div class="group"><div class="empty">Aún no hay fotos. Tómate una el día 1 para comparar después.</div></div>`;
  $$("[data-photo]").forEach(b => b.addEventListener("click", () => { const p = list.find(x => x.id === b.dataset.photo); openSheet(`${shortDate(p.date)}, ${p.angle}`, `<img class="pfull" src="${url(p)}" alt="Foto de ${esc(p.angle)}"><div class="btn-wrap"><button class="btn danger-soft" data-delph="${esc(p.id)}">Eliminar foto</button></div>`, el => el.querySelector("[data-delph]").addEventListener("click", async () => { if (confirm("¿Eliminar esta foto? No se puede deshacer.")) { await Store.delPhoto(p.id); closeSheet(); loadPhotos(); toast("Foto eliminada"); } })); }));
}
const sessKeysOf = sid => { const a = D.ARCH[sid], ks = new Set(); if (a) ["gym", "db", "home"].forEach(m => a[m].forEach(b => b.items.forEach(i => ks.add(i.k)))); Object.keys(S.custom || {}).forEach(key => { if (key.startsWith(sid + "|")) S.custom[key].forEach(b => b.items.forEach(i => ks.add(i.k))); }); return ks; };
function vPast(d, sid) {
  const se = sessMeta(sid); if (!se || !validDate(d)) return vHistory();
  const rows = []; sessKeysOf(sid).forEach(k => { const e = (S.hist[k] || []).find(x => x.d === d); if (e && e.sets.some(t => t.done || t.w || t.r)) rows.push([k, e]); });
  const nk = d + "|" + sid;
  return `${nav(se.name, { back: "Historial", to: "#/progreso/historial", sub: esc(longDate(d)) })}
  ${rows.map(([k, e]) => `<h2 class="sec">${esc(D.EX[k].name)}</h2><div class="group">${e.sets.map((t, i) => `<div class="row pe-row"><div class="main"><div class="title">Serie ${i + 1}${t.done ? "" : " (sin terminar)"}</div></div><input type="number" inputmode="decimal" step="0.5" min="0" data-pe="${k}|${d}|${i}|w" value="${t.w != null ? fwi(t.w) : ""}" placeholder="${wU()}" aria-label="Kilos, serie ${i + 1}"><input type="number" inputmode="numeric" min="0" data-pe="${k}|${d}|${i}|r" value="${t.r ?? ""}" placeholder="reps" aria-label="Repeticiones, serie ${i + 1}"></div>`).join("")}</div>`).join("") || `<div class="group"><div class="empty">No hay series guardadas de esta sesión.</div></div>`}
  <h2 class="sec">Notas</h2><div class="group"><div class="field"><textarea id="pn" data-nk="${nk}" rows="2" maxlength="500" placeholder="Notas de esta sesión">${esc(S.notes[nk] || "")}</textarea></div></div>
  <h2 class="sec">Fecha</h2><div class="group"><div class="field"><label for="mv-date">Mover este entreno a</label><input id="mv-date" type="date" value="${esc(d)}" max="${todayISO()}"></div><div class="btn-wrap"><button class="btn secondary" data-act="pastmove" data-d="${d}" data-sid="${sid}">Mover</button></div></div>
  <div class="group"><button class="row" data-act="pastdel" data-d="${d}" data-sid="${sid}"><div class="main"><div class="title" style="color:var(--bad)">Borrar este entreno</div></div></button></div>`;
}
function vHistory() {
  const rows = []; Object.keys(S.checks).sort().reverse().forEach(d => sessKeys(S.checks[d]).forEach(k => { const se = sessMeta(k.slice(2)); if (!se) return; const sets = Object.values(S.hist).reduce((a, h) => a + ((h.find(x => x.d === d)?.sets || []).filter(x => x.done).length), 0); rows.push(`<button class="row" data-go="#/progreso/sesion/${d}/${k.slice(2)}"><div class="main"><div class="title">${esc(se.name)}</div><div class="meta">${esc(longDate(d))}${sets ? ", " + sets + " series" : ""}</div></div>${I.chev}</button>`); }));
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
  ${keys.length ? `<div class="group">${keys.map(k => { const h = S.hist[k].filter(x => x.sets.some(t => t.r)), best = h.map(x => bestOf(x)), top = h.map(x => Math.max(...x.sets.filter(t => t.r).map(t => t.w ? e1rm(t.w, t.r) : t.r))); const pr = S.prs && S.prs[k]; return `<div class="row"><div class="main"><div class="title">${esc(D.EX[k]?.name || k)}</div><div class="meta">${h.length} sesiones, inicio ${best[0]}${pr ? ", récord ≈ " + fw(pr, 0) + " " + wU() + " (1RM est.)" : ""}</div></div>${spark(top)}<span class="val" style="color:var(--label);font-weight:600">${best[best.length - 1]}</span></div>`; }).join("")}</div><p class="note">El 1RM estimado usa la fórmula de Epley (peso × (1 + repeticiones ÷ 30)); es una aproximación.</p>` : `<div class="group"><div class="empty">Marca tus vueltas en cada bloque y aquí verás tu progreso y tus récords.</div></div>`}`;
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
    <div class="row"><div class="main"><div class="title">Lo que hay guardado</div></div><span class="val">${n} pesos, ${ses} entrenos</span></div>
  </div>
  <h2 class="sec">Cambiar de teléfono</h2>
  <div class="group"><button class="row" data-act="code"><div class="main"><div class="title">Crear código de transferencia</div><div class="meta">Se envía o copia como texto</div></div></button>
  <div class="field"><label for="code-in">Código recibido</label><textarea id="code-in" rows="2" placeholder="Pega aquí el código" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea></div>
  <div class="btn-wrap"><button class="btn" data-act="usecode">Usar código en este teléfono</button></div></div>
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
  <div class="group"><div class="input-line"><input id="w-today" type="number" inputmode="decimal" step="0.1" placeholder="${wU()}" aria-label="Peso en kilogramos" value="${S.weights[iso] ? fwi(S.weights[iso]) : ""}"><button class="btn" data-act="saveweight">Guardar</button></div></div>
  <h2 class="sec">Cintura (${lU()}), una vez por semana</h2>
  <div class="group"><div class="input-line"><input id="waist" type="number" inputmode="decimal" step="0.1" placeholder="${lU()} a la altura del ombligo" aria-label="Cintura en centímetros" value="${S.waists[iso] ? fl(S.waists[iso]) : ""}"><button class="btn" data-act="savewaist">Guardar</button></div></div>
  <h2 class="sec">Últimos registros</h2>
  ${rows.length ? `<div class="group">${rows.map(([d, v]) => `<div class="row"><div class="main"><div class="title">${shortDate(d)}</div></div><span class="val">${fwt(v, 1)}${S.waists[d] ? ", " + fl(S.waists[d]) + " " + lU() : ""}</span></div>`).join("")}</div>` : `<div class="group"><div class="empty">Aún no hay registros.</div></div>`}`;
}
const bestOf = e => { const s = e.sets.filter(x => x.r).sort((a, b) => (b.w || 0) * 100 + b.r - ((a.w || 0) * 100 + a.r))[0]; return s ? `${s.w ? fwi(s.w) + " " + wU() + " × " : ""}${s.r}` : "—"; };
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
  return `${nav("Revisión semanal", { back: "Progreso", sub: `Semana ${wk}, ${esc(C.goals[S.profile.goal || "recomp"].name)}` })}
  <div class="group"><div class="row"><div class="main"><div class="title">Promedio 7 días</div><div class="meta">${now ? fwt(now, 2) : "sin datos"}${delta !== null ? ", " + trendText(delta) : ""}</div></div></div>
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
  <div class="field"><label>Unidades de peso</label>${segHtml([["kg", "Kilos"], ["lb", "Libras"]], S.units.w, "unitw", "Unidades de peso")}</div>
  <div class="field"><label>Unidades de medidas</label>${segHtml([["cm", "Centímetros"], ["in", "Pulgadas"]], S.units.l, "unitl", "Unidades de medidas")}</div>
  <div class="field"><label>Color de acento</label>${segHtml([["naranja", "Naranja"], ["azul", "Azul"], ["morado", "Morado"], ["rosa", "Rosa"]], S.accent, "accent", "Color de acento")}</div></div>
  <h2 class="sec">Cuenta</h2>
  <div class="group">${row("#/plan/cuenta", "Cuenta y dispositivo")}${row("#/plan/notificaciones", "Notificaciones")}</div>
  <h2 class="sec">General</h2>
  <div class="group">${row("#/plan/ajustes", "Perfil y equipo")}${row("#/plan/salud", "Salud y alergias")}<button class="row" data-act="level"><div class="main"><div class="title">Nivel</div></div><span class="val">${esc(C.levels[S.profile.level || "medio"].name)}</span>${I.chev}</button>${row("#/plan/avisos", "Recordatorios y sonido")}${row("#/progreso/datos", "Mis datos y copia de seguridad")}
  <div class="row check-row"><label for="ph-on">Fotos de progreso (opcional)</label><input class="switch" id="ph-on" type="checkbox" ${S.photos ? "checked" : ""}></div>
  <button class="row" data-act="restart"><div class="main"><div class="title">Volver a comenzar</div></div>${I.chev}</button></div>
  <h2 class="sec">Información</h2>
  <div class="group">${row("#/plan/ayuda", "Ayuda")}${row("#/plan/privacidad", "Privacidad")}</div>`;
}
function vHealth() {
  const h = health(), av = Object.keys(S.avoid || {});
  return `${nav("Salud y alergias", { back: "Ajustes", to: "#/plan", sub: "Tu plan y tus comidas se adaptan a esto" })}${safetyBox()}${healthBlocks(h)}
  ${av.length ? `<h2 class="sec">Ejercicios que evitas</h2><div class="group">${av.map(k => `<div class="row"><div class="main"><div class="title">${esc(D.EX[k].name)}</div></div><button class="nb-btn" data-unavoid="${k}">Quitar</button></div>`).join("")}</div>` : ""}`;
}
function vHelp() {
  return `${nav("Ayuda", { back: "Ajustes", to: "#/plan" })}<div class="group">${C.help.map(h => `<div class="row top"><div class="main"><div class="title">${esc(h.q)}</div><div class="meta" style="margin-top:4px">${esc(h.a)}</div></div></div>`).join("")}</div>`;
}
function vPrivacy() {
  return `${nav("Privacidad", { back: "Ajustes", to: "#/plan", sub: "Tus datos son tuyos" })}<div class="group">${C.privacy.map(h => `<div class="row top"><div class="main"><div class="title">${esc(h.t)}</div><div class="meta" style="margin-top:4px">${esc(h.d)}</div></div></div>`).join("")}</div>`;
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
  <div class="group"><div class="row check-row"><label for="sd-on">Sonido al terminar el descanso</label><input class="switch" id="sd-on" type="checkbox" ${S.sound ? "checked" : ""}></div>
  <div class="row check-row"><label for="wk-on">Mantener la pantalla encendida al entrenar</label><input class="switch" id="wk-on" type="checkbox" ${S.wake ? "checked" : ""}></div>
  <div class="row check-row"><label for="nt-on">Notificación si la app está en segundo plano</label><input class="switch" id="nt-on" type="checkbox" ${S.notify ? "checked" : ""}></div></div>`;
}
const MUSC_NAMES = [["pecho", "Pecho"], ["espalda", "Espalda"], ["hombro", "Hombros"], ["hombro posterior", "Hombro posterior"], ["bíceps", "Bíceps"], ["tríceps", "Tríceps"], ["cuádriceps", "Cuádriceps"], ["femoral", "Femoral"], ["glúteo", "Glúteo"], ["pantorrilla", "Pantorrilla"], ["abdomen", "Abdomen"]];
const MUSC_MEAS = { pecho: "pecho", "bíceps": "brazo", "tríceps": "brazo", "cuádriceps": "muslo", femoral: "muslo", "glúteo": "cadera", hombro: "hombros", pantorrilla: "pantorrilla", abdomen: "cintura" };
function muscleStrength(g) {
  const ch = [];
  Object.keys(S.hist).forEach(k => {
    if (D.MUSCLE[k] !== g) return;
    const ses = S.hist[k].map(x => { const v = x.sets.filter(t => t.done && t.r).map(t => t.w ? e1rm(t.w, t.r) : t.r); return v.length ? { d: x.d, v: Math.max(...v) } : null; }).filter(Boolean).sort((a, b) => a.d < b.d ? -1 : 1);
    if (ses.length < 2) return; const last = ses.slice(-2).reduce((a, x) => a + x.v, 0) / Math.min(2, ses.length);
    ch.push((last / ses[0].v - 1) * 100);
  });
  return ch.length ? ch.reduce((a, b) => a + b, 0) / ch.length : null;
}
function muscleMeasure(g) {
  const k = MUSC_MEAS[g]; if (!k) return null;
  const get = d => k === "cintura" ? S.waists[d] : (S.body || {})[d]?.[k];
  const ds = [...new Set([...Object.keys(S.waists), ...Object.keys(S.body || {})])].filter(d => get(d)).sort();
  return ds.length >= 2 ? get(ds[ds.length - 1]) - get(ds[0]) : null;
}
function vMuscles() {
  const vol = {}; SESSIONS().forEach(x => volOf(blocksOf(x), vol)); const sg = v => (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), v % 1 ? 1 : 0);
  return `${nav("Músculos", { back: "Progreso", sub: "Series por semana y cambio desde que empezaste" })}
  <div class="group">${MUSC_NAMES.map(([g, n]) => {
    const st = muscleStrength(g), me = muscleMeasure(g), parts = [st !== null ? `fuerza ${sg(Math.round(st))} %` : "", me !== null ? `${sg(Math.round(ld(me) * 10) / 10)} ${lU()}` : ""].filter(Boolean);
    return `<div class="row"><div class="main"><div class="title">${n}</div><div class="meta">${vol[g] || 0} series por semana</div></div><span class="val" style="${st !== null && st > 0 ? "color:var(--good);font-weight:600" : ""}">${parts.join(", ") || "—"}</span></div>`;
  }).join("")}</div>`;
}
const lastWaist = () => { const w = Object.entries(S.waists).sort((a, b) => a[0] < b[0] ? -1 : 1); return w.length ? w[w.length - 1][1] : null; };
function suggestGoalKg(p, kg, waist) {
  const m = p.h / 100, lo = Math.round(20 * m * m * 2) / 2, hi = Math.round(24 * m * m * 2) / 2, g = p.goal || "recomp"; let t;
  if (g === "muscle") t = kg < lo ? Math.min(lo + 2, kg * 1.06) : kg * 1.04;
  else if (g === "recomp") t = kg > hi ? Math.max(hi, kg * 0.94) : kg < lo ? kg : kg * 0.98;
  else t = kg > hi ? Math.max(hi, kg * 0.9) : kg > (lo + hi) / 2 ? Math.max(lo, kg * 0.94) : Math.max(lo, kg * 0.97);
  if (g !== "muscle") t = Math.max(t, 18.5 * m * m);
  return { goal: Math.round(t * 2) / 2, lo, hi, bmi: kg / (m * m), whtr: waist ? waist / p.h : null };
}
function goalInfo() {
  const c = planCalc(), kg = currentKg(), ws = sortedWeights(), start = ws.length ? ws[0][1] : S.profile.kg, dir = c.goal === "muscle" ? 1 : -1;
  const pr = c.goal === "fat" ? [.0035, .008] : c.goal === "recomp" ? [.001, .004] : [.0025, .005], lo = kg * pr[0], hi = kg * pr[1];
  const a = avgWeight(todayISO(), 7), b = avgWeight(addDays(todayISO(), -21), 7), real = a && b ? (a - b) / 3 : null;
  const sug = suggestGoalKg(S.profile, kg, lastWaist()), goal = S.goalKg || sug.goal, left = goal ? (goal - kg) * dir : null; // kg que faltan en la dirección del objetivo
  const total = goal ? (goal - start) * dir : null, prog = goal && total > 0 ? clamp((kg - start) * dir / total, 0, 1) : null;
  const mid = (lo + hi) / 2, speed = real !== null && real * dir > 0.02 ? Math.abs(real) : mid;
  const weeks = goal && left > 0 ? Math.ceil(left / speed) : 0;
  return { sug, usingSug: !S.goalKg, c, kg, start, dir, lo, hi, real, goal, left, prog, weeks, eta: goal && left > 0 ? addDays(todayISO(), weeks * 7) : null, usingReal: speed !== mid };
}
const goalText = () => { const g = goalInfo(); return g.left <= 0 ? "Alcanzada" : g.usingSug ? `Sugerida ${fwt(g.goal, 1)}` : `${g.dir < 0 ? "Faltan" : "Suben"} ${fwt(g.left, 1)}`; };
function vWeightGoal() {
  const g = goalInfo(), c = g.c, ph = phaseOf(weekNum()), kgF = x => fwt(x, 1), verb = g.dir < 0 ? "bajar" : "subir";
  const sug = g.sug.goal;
  const row = (t, v, meta) => `<div class="row"><div class="main"><div class="title">${t}</div>${meta ? `<div class="meta">${meta}</div>` : ""}</div><span class="val" style="color:var(--label);font-weight:600">${v}</span></div>`;
  return `${nav("Meta de peso", { back: "Progreso", sub: g.usingSug ? "Sugerida por tu estatura: puedes cambiarla" : "" })}
  <div class="group"><div class="input-line"><input id="goal-kg" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="${fwt(sug, 1)}" aria-label="Peso meta" value="${g.usingSug ? "" : fw(g.goal)}"><button class="btn" data-act="savegoal">Guardar</button></div></div>
  <div class="group">${row("Rango saludable para tu estatura", `${fw(g.sug.lo, 0)}–${fw(g.sug.hi, 0)} ${wU()}`, `IMC ${fmt(g.sug.bmi, 1)} ahora${g.sug.whtr ? ", cintura/estatura " + fmt(g.sug.whtr, 2) : ""}`)}${g.sug.whtr && g.sug.whtr >= 0.5 && g.dir > 0 ? row("Cintura alta para tu estatura", "Baja grasa primero", "Con cintura/estatura de 0.5 o más conviene bajar grasa antes de subir de peso") : ""}</div>
  ${g.goal ? `<div class="group">
    ${row("Inicio", kgF(g.start))}${row("Ahora (promedio 7 días)", kgF(g.kg))}${row("Meta", kgF(g.goal))}${row(g.left <= 0 ? "Meta alcanzada" : "Falta para " + verb, g.left <= 0 ? "✓" : kgF(g.left))}
    ${g.prog !== null ? `<div class="row"><div class="bar" style="margin:0;width:100%" role="progressbar" aria-label="Avance hacia tu meta" aria-valuenow="${Math.round(g.prog * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="--p:${g.prog}"></i></div></div>` : ""}
  </div>
  <h2 class="sec">Ritmo</h2>
  <div class="group">${row("Recomendado", `${fmt(wd(g.lo), 1)}–${fmt(wd(g.hi), 1)} ${wU()} por semana`)}${row("El tuyo (3 semanas)", g.real === null ? "—" : `${g.real > 0 ? "+" : g.real < 0 ? "−" : ""}${fmt(wd(Math.abs(g.real)), 2)} ${wU()} por semana`)}${g.eta ? row("Fecha estimada", shortDate(g.eta), g.usingReal ? "Con tu ritmo real" : "Con el ritmo recomendado") : ""}</div>` : ""}
  <h2 class="sec">Tu plan para ${g.dir < 0 ? "bajar grasa" : "subir"}</h2>
  <div class="group">${row("Calorías", `${num(c.train.kcal)} / ${num(c.rest.kcal)}`, "Día de entreno / descanso")}${row("Proteína", c.train.p + " g", "Protege el músculo")}${row("Pasos", ph.steps.toLocaleString("es-MX"), "Al día")}${g.dir < 0 ? row("Cardio", ph.cardio.split("·")[0].trim(), "Zona 2, al terminar las pesas") : ""}</div>
  ${!g.usingSug ? `<div class="btn-wrap"><button class="btn secondary" data-act="delgoal">Usar la sugerida</button></div>` : ""}`;
}
const perfectWeek = () => { const N = SESSIONS().length; if (!N || !S.start) return false; for (let d = S.start; d <= todayISO(); d = addDays(d, 7)) { const ids = new Set(); weekDates(d).forEach(x => sessKeys(S.checks[x]).forEach(k => ids.add(k))); if (ids.size >= N) return true; } return false; };
const BADGES = [
  ["s1", "Primer entreno", "Completa tu primer entreno", () => totalSessions() >= 1], ["s10", "10 entrenos", "Completa 10 entrenos", () => totalSessions() >= 10], ["s25", "25 entrenos", "Completa 25 entrenos", () => totalSessions() >= 25], ["s50", "50 entrenos", "Completa 50 entrenos", () => totalSessions() >= 50], ["s100", "100 entrenos", "Completa 100 entrenos", () => totalSessions() >= 100],
  ["r7", "Racha de 7 días", "7 días seguidos con actividad", () => bestStreak() >= 7], ["r14", "Racha de 14 días", "14 días seguidos", () => bestStreak() >= 14], ["r30", "Racha de 30 días", "30 días seguidos", () => bestStreak() >= 30],
  ["pr", "Primer récord", "Rompe un récord personal", () => Object.keys(S.prs || {}).length >= 1], ["wk", "Semana perfecta", "Haz todos los entrenos de una semana", perfectWeek],
  ["f10", "+10 % de fuerza", "Sube 10 % tu fuerza en un músculo", () => MUSC_NAMES.some(([g]) => { const v = muscleStrength(g); return v !== null && v >= 10; })],
  ["m1", "Buen comienzo", "Sigue tu plan durante varias semanas", () => dayNum() >= 30], ["d90", "Etapa completa", "Termina la etapa inicial de tu plan", () => dayNum() >= 90], ["c2", "Segundo ciclo", "Entra al ciclo 2", () => weekNum() >= 14],
  ["goal", "Meta de peso", "Llega a tu meta de peso", () => { const g = goalInfo(); return !!S.goalKg && g.left <= 0 && Object.keys(S.weights).length >= 7; }],
].map(([id, t, d, ok]) => ({ id, t, d, ok }));
function checkBadges() {
  if (!S.profile || !S.start) return; const fresh = [];
  BADGES.forEach(b => { let ok = false; try { ok = b.ok(); } catch (e) {} if (ok && !S.badges[b.id]) { S.badges[b.id] = todayISO(); fresh.push(b); } });
  if (fresh.length || !S.badgesInit) { const first = S.badgesInit; S.badgesInit = true; save(); if (first && fresh.length) toast("Logro: " + fresh[0].t); }
}
function vBadges() {
  const got = BADGES.filter(b => S.badges[b.id]).length;
  return `${nav("Logros", { back: "Progreso", sub: `${got} de ${BADGES.length}` })}
  <div class="group">${BADGES.map(b => { const on = S.badges[b.id]; return `<div class="row"><span class="badge-ic ${on ? "on" : ""}" aria-hidden="true">${on ? I.check : ""}</span><div class="main"><div class="title" style="${on ? "" : "color:var(--label-3)"}">${esc(b.t)}</div><div class="meta">${on ? "Conseguido el " + esc(shortDate(S.badges[b.id])) : esc(b.d)}</div></div></div>`; }).join("")}</div>`;
}
let recapOff = 0, shareKind = "prog";
function monthStats(off) {
  const t = new Date(todayISO() + "T12:00:00"); t.setDate(1); t.setMonth(t.getMonth() + off); const y = t.getFullYear(), m = t.getMonth(), pad = x => String(x).padStart(2, "0"), a = `${y}-${pad(m + 1)}-01`, b = `${y}-${pad(m + 1)}-${pad(new Date(y, m + 1, 0).getDate())}`;
  let ses = 0, sets = 0, vol = 0, act = 0;
  for (let d = a; d <= b && d <= todayISO(); d = addDays(d, 1)) { ses += sessKeys(S.checks[d]).length; if (activity(d).any) act++; }
  Object.keys(S.hist).forEach(k => S.hist[k].forEach(x => { if (x.d >= a && x.d <= b) x.sets.forEach(q => { if (q.done) { sets++; vol += (q.w || 0) * (q.r || 0); } }); }));
  const ws = Object.entries(S.weights).filter(([d]) => d >= a && d <= b).sort((p, q) => p[0] < q[0] ? -1 : 1);
  return { name: t.toLocaleDateString("es-MX", { month: "long", year: "numeric" }), ses, sets, vol, act, w0: ws.length ? ws[0][1] : null, w1: ws.length ? ws[ws.length - 1][1] : null, n: ws.length };
}
function vRecap() {
  const r = monthStats(recapOff), row = (t, v) => `<div class="row"><div class="main"><div class="title">${t}</div></div><span class="val" style="color:var(--label);font-weight:600">${v}</span></div>`;
  const dw = r.w0 !== null && r.n >= 2 ? r.w1 - r.w0 : null;
  return `${nav("Resumen del mes", { back: "Progreso" })}
  <div class="cal-h"><button class="nb-btn" data-rec="-1" aria-label="Mes anterior">${I.back}</button><b>${r.name.charAt(0).toUpperCase() + r.name.slice(1)}</b><button class="nb-btn" data-rec="1" aria-label="Mes siguiente" ${recapOff >= 0 ? "disabled" : ""}><span style="display:inline-block;transform:scaleX(-1)">${I.back}</span></button></div>
  <div class="group">${row("Entrenos completados", r.ses)}${row("Series completadas", num(r.sets))}${row("Volumen total", r.vol ? fmt(r.vol / 1000, 1) + " t" : "—")}${row("Días con actividad", r.act)}${row("Cambio de peso", dw === null ? "—" : (dw > 0 ? "+" : dw < 0 ? "−" : "") + fmt(wd(Math.abs(dw)), 1) + " " + wU())}</div>
  <div class="btn-wrap"><button class="btn" data-go="#/progreso/compartir" data-kind="mes">Compartir resumen</button></div>`;
}
function vShare() {
  return `${nav("Compartir", { back: "Progreso" })}
  <canvas id="shr" class="share-canvas" width="1080" height="1350" role="img" aria-label="Imagen para compartir"></canvas>
  <div class="group" style="margin-top:14px"><div class="field"><label>Qué compartir</label>${segHtml([["prog", "Mi progreso"], ["mes", "Resumen del mes"]], shareKind, "sharekind", "Qué compartir")}</div>
  <div class="field"><label>Incluir cambio de peso</label>${segHtml([["si", "Sí"], ["no", "No"]], shareW, "sharew", "Incluir peso")}</div></div>
  <div class="btn-wrap"><button class="btn" data-act="share">Compartir</button></div>`;
}
function drawShare() {
  const cv = $("#shr"); if (!cv) return; const g = cv.getContext("2d"), W = 1080, H = 1350;
  const dark = document.documentElement.dataset.theme === "dark" || (document.documentElement.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
  const acc = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#bf3a06";
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#1c1c1e"); bg.addColorStop(1, "#000"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const font = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Roboto, sans-serif"; g.textAlign = "left";
  g.fillStyle = acc; g.font = `700 44px ${font}`; g.fillText("RETO 90", 80, 130);
  g.fillStyle = "#fff"; g.font = `700 120px ${font}`; const dn = Math.max(1, dayNum()), n = Math.min(90, dn);
  g.fillText(shareKind === "mes" ? (m => m.name.charAt(0).toUpperCase() + m.name.slice(1))(monthStats(recapOff)) : (S.profile.name ? prop(S.profile.name) : "Mi progreso"), 80, 300);
  g.fillStyle = "#aeaeb2"; g.font = `500 54px ${font}`; g.fillText(`Día ${dn}`, 80, 380);
  g.fillStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.roundRect(80, 430, 920, 28, 14); g.fill();
  g.fillStyle = acc; g.beginPath(); g.roundRect(80, 430, Math.max(28, 920 * n / 90), 28, 14); g.fill();
  const d = weekDelta(), st = streak(), total = totalSessions();
  const ms = monthStats(recapOff), stats = shareKind === "mes" ? [[String(ms.ses), "entrenos completados"], [num(ms.sets), "series completadas"], [ms.vol ? fmt(ms.vol / 1000, 1) + " t" : "—", "volumen total"]] : [[String(st), st === 1 ? "día de racha" : "días de racha"], [String(total), "entrenos completados"]];
  if (shareW === "si" && shareKind === "mes" && ms.w0 !== null && ms.n >= 2) stats.push([(ms.w1 - ms.w0 > 0 ? "+" : ms.w1 - ms.w0 < 0 ? "−" : "") + fmt(wd(Math.abs(ms.w1 - ms.w0)), 1) + " " + wU(), "cambio de peso en el mes"]);
  else if (shareW === "si" && shareKind !== "mes" && d !== null) stats.push([(d > 0 ? "+" : d < 0 ? "−" : "") + fmt(wd(Math.abs(d)), 1) + " " + wU(), "peso en 7 días"]);
  stats.forEach(([v, l], i) => { const y = 560 + i * 230; g.fillStyle = "rgba(255,255,255,.08)"; g.beginPath(); g.roundRect(80, y, 920, 190, 36); g.fill(); g.fillStyle = "#fff"; g.font = `700 100px ${font}`; g.fillText(v, 120, y + 118); g.fillStyle = "#aeaeb2"; g.font = `500 44px ${font}`; g.fillText(l, 120, y + 166); });
  g.fillStyle = "#636366"; g.font = `500 36px ${font}`; g.fillText(location.host, 80, H - 70);
}
function vRoute() {
  const wk = weekNum(), n = dayNum(), ph = phaseOf(wk);
  return `${nav("Tu plan", { back: "Entreno", to: "#/entreno", sub: n > 90 ? `Continuación, ${weekLabel(wk)}` : `Día ${Math.max(n, 0)}, fase ${ph.n}: ${ph.name}` })}
  <div class="group"><div class="row top"><div class="main"><div class="title">Después de la etapa inicial</div><div class="meta">El plan sigue en ciclos de 4 semanas: cambian ejercicios del mismo músculo, el volumen sube cada 2 ciclos y la cuarta semana es de descarga.</div></div></div></div>
  ${wk <= 13 ? `<div class="group"><button class="row" data-go="#/entreno/semana/${wk}"><div class="main"><div class="title">Semana ${wk}</div><div class="meta">${esc(C.weekFocus[wk])}</div></div>${I.chev}</button></div>` : `<div class="group"><div class="row top"><div class="main"><div class="title">${weekLabel(wk)}</div><div class="meta">${deloadWeek(wk) ? "Descarga: una vuelta menos y 3–4 repeticiones en reserva." : "Esfuerzo: " + esc(phaseOf(wk).rir) + " repeticiones en reserva."}</div></div></div></div>`}
  <h2 class="sec">Etapa inicial</h2>
  <div class="group">${Array.from({ length: 13 }, (_, i) => i + 1).map(w => `<button class="row" data-go="#/entreno/semana/${w}"><div class="main"><div class="title">Semana ${w}${w === wk ? ' <span class="badge">Actual</span>' : ""}</div><div class="meta">${esc(phaseOf(w).name)}${[4, 8].includes(w) ? ", descarga" : ""}</div></div>${I.chev}</button>`).join("")}</div>
  <h2 class="sec">Metas intermedias</h2>
  <div class="group">${C.milestones.map(m => { const k0 = S.profile.kg, wtxt = m.pct ? `Peso −${fmt(wd(k0 * m.pct[0] / 100), 1)} a −${fmt(wd(k0 * m.pct[1] / 100), 1)} ${wU()}, ` : ""; return `<div class="row top"><div class="main"><div class="title">Semana ${Math.ceil(m.day / 7)}, ${esc(m.t)}</div><div class="meta">${esc(wtxt + (m.cm ? m.d.replace("{cm}", m.cm[0] + " a " + m.cm[1]) : m.d))}</div></div></div>`; }).join("")}</div>`;
}
function vWeek(n) {
  n = Math.min(13, Math.max(1, n || 1));
  const ph = phaseOf(n), start = addDays(S.start, (n - 1) * 7), deload = [4, 8].includes(n);
  return `${nav("Semana " + n, { back: "Plan", to: "#/entreno/ruta", sub: `Fase ${ph.n}: ${ph.name}, ${shortDate(start)} – ${shortDate(addDays(start, n === 13 ? 5 : 6))}` })}
  <div class="group"><div class="prose"><p>${esc(C.weekFocus[n])}</p></div></div>
  <h2 class="sec">Esta semana</h2>
  <div class="group">
    <div class="row top"><div class="main"><div class="title">Entrenamiento</div><div class="meta">${deload ? "Descarga: quita 1 vuelta por bloque y deja 3–4 repeticiones en reserva" : SESSIONS().length + " sesiones, " + ph.rir + " repeticiones en reserva"}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Cardio</div><div class="meta">${ph.cardio} (zona 2)</div></div></div>
    <div class="row top"><div class="main"><div class="title">Pasos</div><div class="meta">${ph.steps.toLocaleString("es-MX")} al día</div></div></div>
    <div class="row top"><div class="main"><div class="title">Comida</div><div class="meta">Entreno ≈ ${num(planCalc().train.kcal)} kcal, descanso ≈ ${num(planCalc().rest.kcal)} kcal, proteína ≈ ${planCalc().train.p} g</div></div></div>
    <div class="row top"><div class="main"><div class="title">Recuperación</div><div class="meta">${deload ? "Duerme 8 h y camina; no se buscan marcas" : "Sueño 7–9 h, 2.5–3 L de agua"}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Mediciones</div><div class="meta">Peso diario, cintura el domingo${[3, 5, 7, 9, 11, 13].includes(n) ? "" : ""}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Revisión</div><div class="meta">${n === 4 || n === 9 ? "Revisión de avance: peso, cintura y fuerza" : n === 13 ? "Revisión final y decisión de la siguiente fase" : "Revisión semanal el domingo"}</div></div></div>
  </div>`;
}
function vHabits() { return `${nav("Hábitos", { back: "Progreso", to: "#/progreso", sub: "Constancia, no perfección." })}${C.habits.map(h => `<h2 class="sec">${esc(h.title)}</h2><div class="group"><div class="prose">${h.body}</div></div>`).join("")}`; }
function vAdjust() { return `${nav("Ajustes de calorías", { back: "Progreso", to: "#/progreso" })}<div class="group">${C.adjustRules[S.profile.goal || "recomp"].map(r => `<div class="row top"><div class="main"><div class="title">${esc(r.when)}</div><div class="meta">${esc(r.act)}</div></div></div>`).join("")}</div><p class="note">${esc(C.adjustLimit)}</p>`; }
function vSettings() {
  return `${nav("Perfil y equipo", { back: "Ajustes", to: "#/plan" })}
  <h2 class="sec">Tu perfil</h2>
  <div class="group" id="prof">${profileFields(S.profile, "pf")}</div>
  <h2 class="sec">Tu equipo</h2>
  <div class="group" id="eqp">
    <div class="field"><label for="eq-db">Mancuernas (si entrenas con ellas)</label><select id="eq-db">${[10, 20, 30, 40].map(v => `<option value="${v}" ${equip().dbMax === v ? "selected" : ""}>${dbLabel(v)}</option>`).join("")}</select></div>
    <div class="field"><label for="eq-bench">¿Tienes banca?</label><select id="eq-bench"><option value="si" ${equip().bench ? "selected" : ""}>Sí</option><option value="no" ${equip().bench ? "" : "selected"}>No</option></select></div>
    <div class="field"><label for="eq-pull">Gimnasio: ¿puedes hacer 5 o más dominadas?</label><select id="eq-pull"><option value="si" ${equip().pull ? "selected" : ""}>Sí</option><option value="no" ${equip().pull ? "" : "selected"}>No</option></select></div>
    <div class="field"><label for="eq-dips">Gimnasio: ¿y 5 o más fondos?</label><select id="eq-dips"><option value="si" ${equip().dips ? "selected" : ""}>Sí</option><option value="no" ${equip().dips ? "" : "selected"}>No</option></select></div>
    <div class="field"><label for="eq-bar">¿Tienes barra de dominadas? (en casa)</label><select id="eq-bar"><option value="si" ${equip().bar ? "selected" : ""}>Sí</option><option value="no" ${equip().bar ? "" : "selected"}>No</option></select></div>
  </div>
  <h2 class="sec">Reto</h2>
  <div class="group">
    <div class="field"><label for="se-date">Fecha de inicio</label><input id="se-date" type="date" value="${esc(S.start)}"></div>
    <div class="field"><label for="se-we">Fin de semana</label><select id="se-we"><option value="sab" ${S.weekend === "sab" ? "selected" : ""}>Entreno sábado, descanso domingo</option><option value="dom" ${S.weekend === "dom" ? "selected" : ""}>Entreno domingo, descanso sábado</option></select></div>
  </div>`;
}

/* ───────── Temporizador y registro ───────── */
const REST_KEY = "reto90.rest";
let restEnd = 0, restLabel = "Descanso";
let audioCtx = null;
function beep(freq = 880, dur = .5) { if (!S.sound) return; try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = freq; g.gain.setValueAtTime(.001, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.25, audioCtx.currentTime + .02); g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + dur); o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + dur); } catch (e) {} }
/* El descanso es una barra global: guarda la hora de fin, así sigue contando al cambiar de pantalla, de pestaña o al cerrar la app */
function ensureRestEl() {
  let el = $("#rest"); if (el) return el;
  el = document.createElement("div"); el.id = "rest"; el.setAttribute("role", "timer"); el.setAttribute("aria-live", "off");
  el.innerHTML = '<span class="lbl">Descanso</span><span class="t">0:00</span><button data-rest="add">+15 s</button><button data-rest="stop">Listo</button>';
  document.body.appendChild(el);
  $("[data-rest=add]", el).addEventListener("click", () => { restEnd += 15000; persistRest(); tickRest(); });
  $("[data-rest=stop]", el).addEventListener("click", stopRest);
  return el;
}
function persistRest() { LS.setItem(REST_KEY, JSON.stringify({ end: restEnd, label: restLabel })); }
function stopRest() { clearInterval(restT); restEnd = 0; LS.removeItem(REST_KEY); ensureRestEl().classList.remove("on"); }
function finishRest() {
  const label = restLabel; stopRest(); vibrate([200, 100, 200]); beep(); toast(label === "Cardio" ? "Cardio terminado" : "Descanso terminado");
  try { if (S.notify && document.hidden && "Notification" in window && Notification.permission === "granted" && navigator.serviceWorker) navigator.serviceWorker.ready.then(r => r.showNotification("R90", { body: label === "Cardio" ? "Cardio terminado" : "Descanso terminado", tag: "rest", vibrate: [200, 100, 200] })); } catch (e) {}
}
function tickRest() {
  if (!restEnd) return; const el = ensureRestEl();
  restLeft = Math.max(0, Math.ceil((restEnd - Date.now()) / 1000));
  $(".t", el).textContent = `${Math.floor(restLeft / 60)}:${String(restLeft % 60).padStart(2, "0")}`;
  if (restLeft <= 0) finishRest();
}
function startRest(sec, label = "Descanso") {
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch (e) {}
  const el = ensureRestEl(); clearInterval(restT); restLabel = label; restEnd = Date.now() + sec * 1000;
  $(".lbl", el).textContent = label; el.classList.add("on"); persistRest(); tickRest(); restT = setInterval(tickRest, 250);
}
function resumeRest() {
  let st = null; try { st = JSON.parse(LS.getItem(REST_KEY) || "null"); } catch (e) {}
  if (!st || !isFinite(st.end)) return;
  restEnd = st.end; restLabel = st.label === "Cardio" ? "Cardio" : "Descanso"; const el = ensureRestEl(); $(".lbl", el).textContent = restLabel;
  if (restEnd <= Date.now()) return finishRest();
  el.classList.add("on"); clearInterval(restT); tickRest(); restT = setInterval(tickRest, 250);
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) { resumeRest(); resumeInt(); syncWake(); } });
window.addEventListener("pageshow", resumeRest);
function blockCtx() { const c = $("#blk-ctx"); if (!c) return null; const [id, bi] = c.value.split("|"), s = sessionById(id); return { s, b: blocksOf(s)[+bi], id, bi: +bi }; }
function saveRound(r, setDone) {
  const ctx = blockCtx(); if (!ctx) return;
  const iso = todayISO();
  ctx.b.items.forEach((it, ii) => {
    const w = $(`[data-i="${ii}"][data-r="${r}"][data-f="w"]`), rp = $(`[data-i="${ii}"][data-r="${r}"][data-f="r"]`);
    const hist = S.hist[it.k] = S.hist[it.k] || [];
    let day = hist.find(x => x.d === iso); if (!day) { day = { d: iso, sets: [] }; hist.push(day); hist.sort((a, b) => a.d < b.d ? -1 : 1); }
    while (day.sets.length <= r) day.sets.push({ w: null, r: null, done: false });
    const cur = day.sets[r];
    const fb = $(`[data-fail="${r}"]`); cur.f = !!fb && fb.getAttribute("aria-pressed") === "true"; cur.w = w.value === "" ? null : Math.round(fromW(+w.value) * 100) / 100; cur.r = rp.value === "" ? null : +rp.value;
    if (setDone !== undefined) {
      cur.done = setDone;
      if (setDone) { if (cur.w === null) { const sg = suggest(it); if (sg.n != null) { cur.w = sg.n; w.value = fwi(sg.n); } } if (cur.r === null) { const lr = lowReps(it.reps); if (lr !== null) { cur.r = lr; rp.value = lr; } } }
    }
  });
  save();
}
function askFeedback(sid) {
  const s = sessionById(sid); if (!s) return;
  setTimeout(() => openSheet("¿Cómo te sentiste?", `<div class="group">
    <button class="row" data-fb="bien"><div class="main"><div class="title">Bien</div></div></button>
    <button class="row" data-fb="carg"><div class="main"><div class="title">Cargado</div><div class="meta">Cansancio fuerte o poca energía</div></div></button>
    <button class="row" data-fb="dolor"><div class="main"><div class="title">Con dolor</div><div class="meta">Una molestia que no es el esfuerzo normal</div></div></button></div>`, el => {
    el.querySelectorAll("[data-fb]").forEach(b => b.addEventListener("click", () => {
      const v = b.dataset.fb; S.fb[todayISO()] = { v }; closeSheet(true);
      if (v === "dolor") return askPain();
      save(); evaluateLoad(s, v);
    }));
  }), 1500);
}
function askPain() {
  openSheet("¿Dónde te duele?", `<div class="group">${HL.inj.map(([k, t]) => `<button class="row" data-pain="${k}"><div class="main"><div class="title">${t}</div></div></button>`).join("")}<button class="row" data-pain=""><div class="main"><div class="title">Otra zona</div></div></button></div>`, el => {
    el.querySelectorAll("[data-pain]").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.pain, h = health(); if (k && !h.inj.includes(k)) { S.profile.health = { ...h, inj: [...h.inj, k] }; S.swaps = {}; _plan = { k: "", v: null }; }
      S.autoDl = addDays(todayISO(), 4); save(); closeSheet(true); toast(k ? "Cambiamos los ejercicios que cargan esa zona. Si sigue, consulta a un médico." : "Descarga unos días. Si sigue, consulta a un médico."); refresh();
    }));
  });
}
function evaluateLoad(s, v) {
  const t = todayISO(), recent = Object.keys(S.fb).filter(d => d > addDays(t, -6)), carg = recent.filter(d => S.fb[d].v === "carg").length;
  const b0 = blocksOf(s).find(b => b.t !== "cardio"), it = b0 && b0.items[0]; let stall = false;
  if (it) { const ses = (S.hist[it.k] || []).filter(x => x.sets.some(q => q.done && q.r)).slice(-2), lo = lowReps(it.reps); stall = lo !== null && ses.length === 2 && ses.every(x => Math.max(...x.sets.filter(q => q.done && q.r).map(q => q.r)) < lo); }
  if (carg >= 2 || stall) { S.autoDl = addDays(t, 5); _plan = { k: "", v: null }; save(); toast(stall ? "Te estancaste en el básico: unos días de descarga y vuelves más fuerte" : "Dos sesiones cargadas: descarga unos días"); }
}
function checkSessionComplete(s) {
  const pr = sessionProgress(s);
  if (pr.total > 0 && pr.done === pr.total && !sessionDoneOn(todayISO(), s.id)) { checksOf(todayISO())["s_" + s.id] = true; save(); celebrate("Entrenamiento completo"); vibrate([30, 60, 30]); askFeedback(s.id); }
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
  $("#ph-on")?.addEventListener("change", e => { S.photos = e.target.checked; save(); toast(S.photos ? "Fotos activadas en Progreso" : "Fotos ocultas"); });
  $$("[data-multi]").forEach(b => b.addEventListener("click", () => {
    const [t, v] = b.dataset.multi.split("|"), onbMode = parseHash()[0] === "inicio", h = onbMode ? onb.d.health : S.profile.health;
    h[t] = h[t].includes(v) ? h[t].filter(x => x !== v) : [...h[t], v]; vibrate(8);
    if (!onbMode) { S.picks = {}; S.swaps = {}; _plan = { k: "", v: null }; save(); } refresh();
  }));
  $$("[data-unavoid]").forEach(b => b.addEventListener("click", () => { delete S.avoid[b.dataset.unavoid]; _plan = { k: "", v: null }; save(); toast("Ejercicio permitido de nuevo"); refresh(); }));
  $$("button[data-intpre]").forEach(b => b.addEventListener("click", () => { const p = INT_PRESETS.find(x => x[0] === b.dataset.intpre); if (!p) return; segMove(b); $("#int-work").value = p[2]; $("#int-rest").value = p[3]; $("#int-rounds").value = p[4]; }));
  $("#sn")?.addEventListener("change", e => { const k = todayISO() + "|" + e.target.dataset.sid, t = e.target.value.slice(0, 500); if (t.trim()) S.notes[k] = t; else delete S.notes[k]; save(); toast("Nota guardada"); });
  $("#en")?.addEventListener("change", e => { const k = e.target.dataset.k, t = e.target.value.slice(0, 200); if (t.trim()) S.enotes[k] = t; else delete S.enotes[k]; save(); toast("Nota guardada"); });
  $("#pn")?.addEventListener("change", e => { const k = e.target.dataset.nk, t = e.target.value.slice(0, 500); if (t.trim()) S.notes[k] = t; else delete S.notes[k]; save(); toast("Nota guardada"); });
  $$("[data-pe]").forEach(i => i.addEventListener("change", () => { const [k, d, idx, f] = i.dataset.pe.split("|"), e = (S.hist[k] || []).find(x => x.d === d); if (!e || !e.sets[+idx]) return; let v = i.value === "" ? null : +i.value; if (v !== null && f === "w") v = Math.round(fromW(v) * 100) / 100; e.sets[+idx][f] = v !== null && isFinite(v) && v >= 0 && v <= 1000 ? v : null; save(); }));
  $$("[data-ed]").forEach(b => b.addEventListener("click", () => {
    const [op, sid, i0, ii0] = b.dataset.ed.split("|"), i = +i0, ii = +ii0, bl = ensureCustom(sid), blk = bl[i]; if (!blk) return;
    if (op === "r+" || op === "r-") blk.rounds = clamp(blk.rounds + (op === "r+" ? 1 : -1), 1, 8);
    else if (op === "s+" || op === "s-") blk.rest = clamp(blk.rest + (op === "s+" ? 15 : -15), 15, 300);
    else if (op === "m+" || op === "m-") blk.min = clamp((blk.min || 20) + (op === "m+" ? 5 : -5), 5, 180);
    else if (op === "up" && i > 0) [bl[i - 1], bl[i]] = [bl[i], bl[i - 1]];
    else if (op === "down" && i < bl.length - 1) [bl[i + 1], bl[i]] = [bl[i], bl[i + 1]];
    else if (op === "rm") bl.splice(i, 1);
    else if (op === "rmi") { blk.items.splice(ii, 1); if (!blk.items.length) bl.splice(i, 1); else blk.t = blk.items.length === 1 ? "uni" : blk.t; }
    save(); vibrate(8); refresh();
  }));
  $$("[data-edreps]").forEach(i => i.addEventListener("change", () => { const [sid, b, it] = i.dataset.edreps.split("|"), blk = ensureCustom(sid)[+b]; if (!blk || !blk.items[+it]) return; blk.items[+it].reps = cleanReps(i.value) || "8–12"; save(); refresh(); }));
  $$("button[data-unitw], button[data-unitl]").forEach(b => b.addEventListener("click", () => {
    const isW = "unitw" in b.dataset, to = isW ? b.dataset.unitw : b.dataset.unitl, onbMode = parseHash()[0] === "inicio";
    if (onbMode) { const d = onb.d;
      if (isW) { const kg = parseFloat(d.kg); if (isFinite(kg)) d.kg = trimN(to === "lb" ? fromW(kg) * KG_LB : fromW(kg), 1); }
      else { ["h", "waist"].forEach(k => { const x = parseFloat(d[k]); if (isFinite(x)) d[k] = trimN(to === "in" ? fromL(x) * CM_IN : fromL(x), 1); }); } }
    S.units = { ...S.units, [isW ? "w" : "l"]: to }; save(); vibrate(8); refresh();
  }));
  $$("button[data-theme]").forEach(b => b.addEventListener("click", () => { segMove(b); S.theme = b.dataset.theme; applyTheme(); save(); vibrate(8); }));
  $$("button[data-sharekind]").forEach(b => b.addEventListener("click", () => { segMove(b); shareKind = b.dataset.sharekind; drawShare(); }));
  $$("[data-rec]").forEach(b => b.addEventListener("click", () => { recapOff = Math.min(0, recapOff + +b.dataset.rec); refresh(); }));
  $$("[data-kind]").forEach(b => b.addEventListener("click", () => { shareKind = b.dataset.kind; }, true));
  $$("button[data-sharew]").forEach(b => b.addEventListener("click", () => { segMove(b); shareW = b.dataset.sharew; drawShare(); }));
  $("#rm-train")?.addEventListener("change", e => { if (/^\d\d:\d\d$/.test(e.target.value)) { S.remind.train = e.target.value; save(); } });
  $("#rm-weigh")?.addEventListener("change", e => { if (/^\d\d:\d\d$/.test(e.target.value)) { S.remind.weigh = e.target.value; save(); } });
  $("#wk-on")?.addEventListener("change", e => { S.wake = e.target.checked; save(); syncWake(); });
  $("#nt-on")?.addEventListener("change", async e => { if (e.target.checked) { try { const p = "Notification" in window ? await Notification.requestPermission() : "denied"; S.notify = p === "granted"; if (!S.notify) { e.target.checked = false; toast("Permiso de notificaciones denegado"); } } catch (er) { S.notify = false; e.target.checked = false; } } else S.notify = false; save(); });
  $("#sd-on")?.addEventListener("change", e => { S.sound = e.target.checked; save(); if (S.sound) beep(); });
  $$("button[data-accent]").forEach(b => b.addEventListener("click", () => { segMove(b); S.accent = b.dataset.accent; applyAccent(); save(); vibrate(8); }));
  $$("[data-adj]").forEach(b => { if (!b.closest("#rev-out")) b.addEventListener("click", () => adjustKcal(b.dataset.adj)); });
  $$("[data-choice]").forEach(b => b.addEventListener("click", () => { const [k, v] = b.dataset.choice.split("|"); onb.d[k] = ["days", "pct", "dbMax", "meals"].includes(k) ? +v : v; if (k === "goal") onb.d.pct = null; vibrate(8); if (b.closest(".seg")) { segMove(b); setTimeout(refresh, 240); } else refresh(); }));
  [["#ob-age", "age"], ["#ob-h", "h"], ["#ob-kg", "kg"], ["#ob-waist", "waist"], ["#ob-date", "date"], ["#ob-train", "train"]].forEach(([sel, k]) => $(sel)?.addEventListener("input", e => { onb.d[k] = e.target.value; }));
  $("#ob-name")?.addEventListener("input", e => { onb.d.name = cleanName(e.target.value); });
  $$("[data-onb]").forEach(b => b.addEventListener("click", () => {
    const a = b.dataset.onb;
    if (a === "cancel") { onb = ONB(); return go("#/plan"); }
    if (a === "quick") { const e1 = onbValid(1, onb.d); if (e1) return toast(e1); onb.d.level = onb.d.level || "medio"; onb.d.days = onb.d.days || 4; return act("start", b); }
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
  $("#ph-file")?.addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { toast("Guardando foto…"); await Store.addPhoto(f, todayISO(), phAngle); toast("Foto guardada"); vibrate(10); loadPhotos(); } catch { toast("No se pudo guardar la foto"); } e.target.value = ""; });
  $$("[data-swap]").forEach(b => b.addEventListener("click", () => { const [sid, bi, ii] = b.dataset.swap.split("|"); const se = sessionById(sid), alts = altsFor(se, +bi, +ii), cur = D.EX[blocksOf(se)[+bi].items[+ii].k], key = `${sid}|${S.mode}|${bi}|${ii}`, swapped = !!(S.swaps || {})[key];
    openSheet("Cambiar ejercicio", `${alts.length ? `<div class="group">${alts.map(a => { const ex = D.EX[a.k]; return `<button class="row" data-swapto="${key}|${a.k}"><img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${ex.id}.gif" width="56" height="56"><div class="main"><div class="title">${esc(ex.name)}</div><div class="meta">${esc(ex.muscle)}, ${esc(a.fam)}</div></div>${I.chev}</button>`; }).join("")}</div><p class="note">Solo ejercicios del mismo músculo y patrón, con tu equipo. Repeticiones y peso se ajustan al nuevo ejercicio.</p>` : `<div class="group"><div class="empty">No hay alternativas equivalentes con tu equipo para este ejercicio.</div></div>`}${swapped ? `<div class="group" style="margin-top:12px"><button class="row" data-swapto="${key}|"><div class="main"><div class="title">Volver al ejercicio original</div></div></button></div>` : ""}`,
    el => $$("[data-swapto]", el).forEach(x => x.addEventListener("click", () => { const parts = x.dataset.swapto.split("|"), k = parts.pop(), kk = parts.join("|"); S.swaps = S.swaps || {}; if (k) S.swaps[kk] = k; else delete S.swaps[kk]; save(); vibrate(10); closeSheet(); toast(k ? "Ejercicio cambiado" : "Ejercicio original"); refresh(); }))); }));
  $$("[data-menu]").forEach(b => b.addEventListener("click", () => { const d = +b.dataset.menu; MEALS().forEach((m, si) => { S.picks[m.slot] = (d + si) % m.opts.length; }); save(); vibrate(10); toast("Menú aplicado a hoy"); go("#/comida"); }));
  $$("[data-pick]").forEach(b => b.addEventListener("click", () => { S.picks[b.dataset.slot] = +b.dataset.pick; save(); $$("[data-pick]").forEach(x => { const on = x === b; x.setAttribute("aria-checked", on); x.querySelector(".opt-radio").classList.toggle("on", on); }); vibrate(8); }));
  $$("[data-rq]").forEach(i => i.type === "range" && i.addEventListener("input", () => { $("#rv-" + i.dataset.rq).textContent = i.value; }));
  $$("[data-f]").forEach(i => i.addEventListener("input", () => saveRound(+i.dataset.r)));
  $$("[data-fail]").forEach(b => b.addEventListener("click", () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); vibrate(10); saveRound(+b.dataset.fail); }));
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
    const on = !day[key]?.done; const km = parseFloat($("#c-km")?.value); day[key] = { done: on, min: +m, kind: S.cardioKind || cardioKinds()[0].id, ...(km > 0 && km < 300 ? { km } : {}) }; save(); vibrate(12);
    const s = sessionById(sid); if (on) checkSessionComplete(s); else if (sessionDoneOn(iso, sid)) { checksOf(iso)["s_" + sid] = false; save(); }
    toast(on ? "Cardio registrado" : "Desmarcado"); go(`#/entreno/${sid}`);
  }));
  $("#imp0")?.addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; try { adoptState(await stateFromFile(f)); toast("Copia restaurada"); go("#/hoy"); } catch { toast("Archivo no válido"); } e.target.value = ""; });
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
  if (a.startsWith("acct-")) return window.Acct && Acct.act(a, el);
  const iso = todayISO();
  if (a === "start") {
    const d = onb.d;
    S.profile = { name: cleanName(d.name), health: cleanHealth(d.health), sex: d.sex, age: +d.age, h: Math.round(fromL(+d.h)), kg: Math.round(fromW(parseFloat(d.kg)) * 10) / 10, level: d.level, goal: d.goal, pct: d.pct ?? C.goals[d.goal].pace, days: +d.days, diet: d.diet, meals: +d.meals || 5, adj: 0, equip: { bench: d.bench !== "no", bar: d.bar === "si", dbMax: +d.dbMax, pull: d.pull === "si", dips: d.dips === "si" } };
    const keepW = onb.redo ? S.weights : {}; S.swaps = {}; S.reviews = {}; S.picks = {}; if (!onb.redo) S.avoid = {}; const wv = Math.round(fromL(parseFloat(d.waist)) * 10) / 10; S.start = d.date || iso; if (/^\d\d:\d\d$/.test(d.train || "")) S.remind.train = d.train; S.weekend = d.weekend; S.mode = d.mode; S.weights = { ...keepW, [S.start]: S.profile.kg }; if (wv >= 30 && wv <= 250) S.waists[S.start] = wv; S.goalKg = suggestGoalKg(S.profile, S.profile.kg, wv >= 30 ? wv : lastWaist()).goal; _plan = { k: "", v: null };
    save(); onb = ONB(); if (window.Store) Store.persist(); go("#/hoy"); toast("Todo listo: empieza el día 1");
  } else if (a === "saveweight") {
    const v = fromW(parseFloat($("#w-today").value));
    if (!(v > 30 && v < 300)) return toast(`Escribe un peso válido (${wU()})`); S.weights[iso] = Math.round(v * 100) / 100; save(); toast(S.goalKg && ((S.profile.goal === "muscle" ? v >= S.goalKg : v <= S.goalKg)) ? "¡Meta de peso alcanzada!" : "Peso guardado"); render();
  } else if (a === "savewaist") {
    const v = Math.round(fromL(parseFloat($("#waist").value)) * 10) / 10;
    if (!(v > 40 && v < 200)) return toast(`Escribe la cintura en ${lU()}`);
    S.waists[iso] = v; save(); toast("Cintura guardada"); render();
  } else if (a === "intro") { S.intro = true; save(); refresh();
  } else if (a === "finish") {
    const c = checksOf(iso), k = "s_" + el.dataset.id; c[k] = !c[k]; save(); vibrate(15); toast(c[k] ? "Entrenamiento completado" : "Desmarcado"); render(); if (c[k] && !S.fb[iso]) askFeedback(el.dataset.id);
  } else if (a === "review") {
    const ans = {}; C.reviewQuestions.forEach(q => { const i = $("#rq-" + q.id); ans[q.id] = q.yesno ? i.checked : +i.value; });
    const adv = reviewAdvice(ans); S.reviews[weekNum()] = { ...ans, ...adv.flags }; save();
    $("#rev-out").innerHTML = `<h2 class="sec">Recomendación</h2><div class="group"><div class="prose">${adv.paras.map(t => `<p>${t}</p>`).join("")}</div></div>${adv.delta ? `<div class="btn-wrap"><button class="btn" data-adj="${adv.delta}">${adv.delta > 0 ? "Subir" : "Bajar"} ${Math.abs(adv.delta)} kcal en mis metas</button></div><p class="note">Se aplica a todos tus días y recalcula las porciones.</p>` : ""}`;
    $$("#rev-out [data-adj]").forEach(b => b.addEventListener("click", () => adjustKcal(b.dataset.adj)));
    $("#rev-out").scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (a === "tiphoy") { S.tips = S.tips || {}; S.tips.hoy = true; save(); refresh();
  } else if (a === "savebody") {
    const keys = ["cintura", "pecho", "brazo", "muslo", "cadera", "hombros", "pantorrilla"]; S.body = S.body || {}; let n = 0;
    keys.forEach(k => { const v = Math.round(fromL(parseFloat($("#m-" + k)?.value)) * 10) / 10; if (v >= 10 && v <= 250) { n++; if (k === "cintura") S.waists[iso] = v; else (S.body[iso] = S.body[iso] || {})[k] = v; } });
    if (!n) return toast(`Escribe al menos una medida en ${lU()}`);
    save(); vibrate(10); toast("Medidas guardadas"); refresh();
  } else if (a === "offline") {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return toast("Cierra y abre la app, y vuelve a intentar");
    const info = $("#d-offline"); if (info) info.textContent = "Descargando… 0 %"; navigator.serviceWorker.controller.postMessage("precache"); toast("Descargando ejercicios");
  } else if (a === "copydata") {
    try { navigator.clipboard.writeText(JSON.stringify(S)).then(() => toast("Datos copiados"), () => toast("No se pudo copiar")); } catch { toast("No pude copiar"); }
  } else if (a === "export") {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    const l = document.createElement("a"); l.href = URL.createObjectURL(blob); l.download = `reto90-${iso}.json`; l.click(); S.lastExport = iso; save(); toast("Copia exportada");
  } else if (a === "install") {
    if (!installEv) return toast("Instálala desde el menú del navegador");
    installEv.prompt(); installEv.userChoice.then(r => { installEv = null; toast(r.outcome === "accepted" ? "Instalando…" : "Cuando quieras, desde Ajustes"); refresh(); }, () => {});
  } else if (a === "plates") {
    const k = el.dataset.k, it = blocksOf(sessionById(el.dataset.sid) || SESSIONS()[0]).flatMap(b => b.items).find(i => i.k === k), sg = it ? suggest(it) : null;
    const lb = S.units && S.units.w === "lb", set = lb ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25], bars = lb ? [[45, "45 lb"], [35, "35 lb"], [15, "15 lb"]] : [[20, "20 kg"], [15, "15 kg"], [10, "10 kg"]];
    openSheet("Discos por lado", `<div class="group"><div class="field"><label for="pl-total">Peso total (${lb ? "lb" : "kg"}), barra incluida</label><input id="pl-total" type="number" inputmode="decimal" step="0.5" value="${sg && sg.n ? Math.round((lb ? sg.n * 2.20462 : sg.n) * 2) / 2 : ""}" placeholder="Total"></div>
      <div class="field"><label for="pl-bar">Barra</label><select id="pl-bar">${bars.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></div></div><div class="group" id="pl-out"><div class="row"><div class="main"><div class="meta">Escribe el peso total.</div></div></div></div>`, sh => {
      const upd = () => {
        const t = parseFloat($("#pl-total", sh).value), bar = +$("#pl-bar", sh).value, o = $("#pl-out", sh);
        if (!(t > 0)) return o.innerHTML = `<div class="row"><div class="main"><div class="meta">Escribe el peso total.</div></div></div>`;
        const r = platesFor(t, bar, set); if (!r) return o.innerHTML = `<div class="row"><div class="main"><div class="title">Es menos que la barra</div></div></div>`;
        o.innerHTML = r.out.length ? r.out.map(([p, n]) => `<div class="row"><div class="main"><div class="title">${n} × ${p} ${lb ? "lb" : "kg"}</div></div><span class="val">por lado</span></div>`).join("") + (r.left > 0 ? `<div class="row"><div class="main"><div class="meta">Faltan ${r.left} ${lb ? "lb" : "kg"} por lado: usa el disco más cercano.</div></div></div>` : "") : `<div class="row"><div class="main"><div class="title">Solo la barra</div></div></div>`;
      };
      $("#pl-total", sh).addEventListener("input", upd); $("#pl-bar", sh).addEventListener("change", upd); upd();
    });
  } else if (a === "intstart") {
    const g = id => Math.round(+$("#" + id).value), w = g("int-work"), r = g("int-rest"), n = g("int-rounds");
    if (!(w >= 5 && w <= 600 && r >= 0 && r <= 600 && n >= 1 && n <= 50)) return toast("Revisa los tiempos y las rondas");
    intCfg = { work: w, rest: r, rounds: n }; try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume && audioCtx.resume(); } catch (e) {}
    LS.setItem(INT_KEY, JSON.stringify({ start: Date.now() + 5000, work: w, rest: r, rounds: n })); intLast = ""; clearInterval(intT); intT = setInterval(intTick, 250); intTick(); refresh();
  } else if (a === "intstop") { LS.removeItem(INT_KEY); clearInterval(intT); intT = null; intLast = ""; refresh();
  } else if (a === "pastdel") {
    const d = el.dataset.d, sid = el.dataset.sid; if (!confirm("¿Borrar este entreno y sus series? No se puede deshacer.")) return;
    sessKeysOf(sid).forEach(k => { const h = S.hist[k]; if (!h) return; const i = h.findIndex(x => x.d === d); if (i >= 0) h.splice(i, 1); if (!h.length) delete S.hist[k]; });
    if (S.checks[d]) delete S.checks[d]["s_" + sid]; if (S.cardio[d]) Object.keys(S.cardio[d]).forEach(k => { if (k.startsWith(sid + "-")) delete S.cardio[d][k]; }); delete S.notes[d + "|" + sid];
    save(); toast("Entreno borrado"); go("#/progreso/historial");
  } else if (a === "pastmove") {
    const d = el.dataset.d, sid = el.dataset.sid, nd = $("#mv-date").value; if (!validDate(nd) || nd > todayISO() || nd < (S.start || "2000-01-01")) return toast("Elige una fecha desde que empezaste hasta hoy");
    if (nd === d) return toast("Es la misma fecha");
    sessKeysOf(sid).forEach(k => { const h = S.hist[k]; if (!h) return; const e = h.find(x => x.d === d); if (!e) return; const t = h.find(x => x.d === nd); if (t) { t.sets = [...t.sets, ...e.sets].slice(0, 12); h.splice(h.indexOf(e), 1); } else e.d = nd; h.sort((p, q) => p.d < q.d ? -1 : 1); });
    const c0 = S.checks[d]; if (c0 && c0["s_" + sid]) { delete c0["s_" + sid]; (S.checks[nd] = S.checks[nd] || {})["s_" + sid] = true; }
    if (S.cardio[d]) Object.keys(S.cardio[d]).forEach(k => { if (k.startsWith(sid + "-")) { (S.cardio[nd] = S.cardio[nd] || {})[k] = S.cardio[d][k]; delete S.cardio[d][k]; } });
    if (S.notes[d + "|" + sid]) { S.notes[nd + "|" + sid] = S.notes[d + "|" + sid]; delete S.notes[d + "|" + sid]; }
    save(); toast("Entreno movido"); go("#/progreso/sesion/" + nd + "/" + sid);
  } else if (a === "edadd") {
    const sid = el.dataset.sid;
    openSheet("Agregar ejercicio", `<div class="group"><div class="field"><input id="pk-q" type="search" placeholder="Buscar ejercicio o músculo" autocomplete="off" aria-label="Buscar ejercicio"></div></div><div id="pk-list">${pickerHtml(sid, "")}</div><div class="group"><button class="row" data-act="exnew" data-sid="${sid}"><div class="main"><div class="title" style="color:var(--accent)">Crear ejercicio propio</div></div></button></div>`, sh => {
      const bindList = () => $$("[data-pick]", sh).forEach(b => b.addEventListener("click", () => { addBlockEx(sid, b.dataset.pick); closeSheet(); toast("Ejercicio agregado"); refresh(); }));
      bindList(); $("#pk-q", sh).addEventListener("input", e => { $("#pk-list", sh).innerHTML = pickerHtml(sid, e.target.value); bindList(); });
      $("[data-act=exnew]", sh).addEventListener("click", () => { closeSheet(true); act("exnew", { dataset: { sid } }); });
    });
  } else if (a === "exnew") {
    const sid = el.dataset.sid;
    openSheet("Ejercicio propio", `<div class="group"><div class="field"><label for="nx-name">Nombre</label><input id="nx-name" type="text" maxlength="40" placeholder="Ej. Remo en máquina"></div>
      <div class="field"><label for="nx-mus">Músculo principal</label><select id="nx-mus">${MYEX_MUSC.map(m => `<option value="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</option>`).join("")}</select></div>
      <div class="field"><label for="nx-unit">Carga</label><select id="nx-unit"><option value="kg">Con peso (kg)</option><option value="bw">Peso corporal</option></select></div></div><div class="btn-wrap"><button class="btn" id="nx-save">Guardar y agregar</button></div>`, sh => {
      $("#nx-save", sh).addEventListener("click", () => {
        const name = $("#nx-name", sh).value.replace(/[<>&"\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 40); if (!name) return toast("Escribe un nombre");
        let n = 1; while (S.myEx["x" + n]) n++; if (n > 999 || Object.keys(S.myEx).length >= 40) return toast("Ya tienes demasiados ejercicios propios");
        const id = "x" + n; S.myEx[id] = { name, muscle: $("#nx-mus", sh).value, unit: $("#nx-unit", sh).value === "kg" ? "kg" : "bw" }; registerMyEx(id, S.myEx[id]); addBlockEx(sid, id); closeSheet(); toast("Ejercicio creado"); refresh();
      });
    });
  } else if (a === "edcardio") { ensureCustom(el.dataset.sid).push({ t: "cardio", rounds: 1, rest: 0, items: [], min: 20, kind: "z2", note: "" }); save(); toast("Cardio agregado"); refresh();
  } else if (a === "edreset") {
    const sid = el.dataset.sid; if (!confirm(sid === "libre" ? "¿Vaciar esta sesión?" : "¿Volver al plan automático para esta sesión?")) return; delete S.custom[sid + "|" + S.mode]; save(); toast("Listo"); refresh();
  } else if (a === "hurt") {
    const k = el.dataset.k; if (!D.EX[k]) return; S.avoid[k] = true; S.swaps = {}; _plan = { k: "", v: null }; save(); vibrate(12);
    toast("Lo cambiamos por uno seguro. Si el dolor sigue, consulta a un médico."); go(`#/entreno/${el.dataset.sid}`);
  } else if (a === "calapply") {
    const d = +el.dataset.d; S.calAt = todayISO(); adjustKcal(d);
  } else if (a === "calsnooze") { S.calAt = todayISO(); save(); refresh();
  } else if (a === "savegoal") {
    const v = fromW(parseFloat($("#goal-kg").value)); if (!(v >= 30 && v <= 250)) return toast(`Escribe un peso válido (${wU()})`); S.goalKg = Math.round(v * 10) / 10; save(); vibrate(10); toast("Meta guardada"); refresh();
  } else if (a === "delgoal") { S.goalKg = null; save(); toast("Usando la meta sugerida"); refresh();
  } else if (a === "ics") {
    const pad = n => String(n).padStart(2, "0"), ymd = d => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()), now = new Date();
    const stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + "T" + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
    const BY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"], hm = t => t.replace(":", "") + "00";
    const ev = (uid, start, t, rule, name, dur) => ["BEGIN:VEVENT", `UID:${uid}@reto90`, `DTSTAMP:${stamp}`, `DTSTART:${ymd(start)}T${hm(t)}`, `DURATION:PT${dur}M`, rule, `SUMMARY:${name}`, "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${name}`, "TRIGGER:PT0M", "END:VALARM", "END:VEVENT"].filter(Boolean).join("\r\n");
    const first = wd => { const d = new Date(); d.setHours(12, 0, 0, 0); while (d.getDay() !== wd) d.setDate(d.getDate() + 1); return d; };
    const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//R90//ES", "CALSCALE:GREGORIAN"];
    SESSIONS().forEach((x, i) => out.push(ev("train" + i, first(x.wd), S.remind.train, `RRULE:FREQ=WEEKLY;BYDAY=${BY[x.wd]};COUNT=104`, "R90: " + x.name, 60)));
    const t0 = new Date(); t0.setHours(12, 0, 0, 0); out.push(ev("weigh", t0, S.remind.weigh, "RRULE:FREQ=DAILY;COUNT=730", "R90: pésate en ayunas", 10), "END:VCALENDAR");
    const l = document.createElement("a"); l.href = URL.createObjectURL(new Blob([out.join("\r\n")], { type: "text/calendar;charset=utf-8" })); l.download = "reto90-recordatorios.ics"; l.click(); toast("Abre el archivo para añadirlo a tu calendario");
  } else if (a === "share") {
    const cv = $("#shr"); if (!cv) return;
    cv.toBlob(async b => {
      if (!b) return toast("No se pudo crear la imagen");
      const f = new File([b], "reto90-progreso.png", { type: "image/png" });
      try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: "R90" }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
      const l = document.createElement("a"); l.href = URL.createObjectURL(b); l.download = "reto90-progreso.png"; l.click(); toast("Imagen guardada");
    }, "image/png");
  } else if (a === "code") {
    (async () => {
      const json = JSON.stringify(S); let code = "R90N." + btoa(unescape(encodeURIComponent(json)));
      try { if (window.CompressionStream) { const cs = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip")), buf = new Uint8Array(await new Response(cs).arrayBuffer()); let bin = ""; buf.forEach(b => bin += String.fromCharCode(b)); code = "R90G." + btoa(bin); } } catch (e) {}
      try { if (navigator.share) { await navigator.share({ title: "Código R90", text: code }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
      try { await navigator.clipboard.writeText(code); toast("Código copiado: pégalo en el otro teléfono"); } catch (e) { toast("No se pudo copiar el código"); }
    })();
  } else if (a === "level") {
    const cur = S.profile.level || "medio";
    openSheet("Tu nivel", `<div class="group" role="radiogroup">${Object.entries(C.levels).map(([k, v]) => `<button class="row top" role="radio" aria-checked="${k === cur}" data-lv="${k}"><span class="opt-radio ${k === cur ? "on" : ""}"></span><div class="main"><div class="title">${esc(v.name)}</div><div class="meta">${esc(v.sub)}</div></div></button>`).join("")}</div>`, el => {
      el.querySelectorAll("[data-lv]").forEach(b => b.addEventListener("click", () => { S.profile.level = b.dataset.lv; S.swaps = {}; _plan = { k: "", v: null }; save(); vibrate(10); closeSheet(); toast("Nivel actualizado: ejercicios, series y descansos se adaptan"); refresh(); }));
    });
  } else if (a === "restart") {
    openSheet("Volver a comenzar", `<div class="group">
      <button class="row top" data-rs="new"><div class="main"><div class="title">Empezar un plan nuevo</div><div class="meta">Conserva tu historial y tus pesos</div></div></button>
      <button class="row top" data-rs="redo"><div class="main"><div class="title">Cambiar objetivo y nivel</div><div class="meta">Repite el cuestionario y conserva tus datos</div></div></button>
      <button class="row top" data-rs="wipe"><div class="main"><div class="title" style="color:var(--bad)">Borrar todo</div><div class="meta">Empiezas de cero</div></div></button></div>`, el => {
      el.querySelectorAll("[data-rs]").forEach(b => b.addEventListener("click", () => {
        const k = b.dataset.rs;
        if (k === "new") { S.start = todayISO(); S.swaps = {}; S.reviews = {}; _plan = { k: "", v: null }; save(); closeSheet(); toast("Nuevo reto: día 1"); go("#/hoy"); }
        else if (k === "redo") { const p = S.profile, e = equip(); onb = ONB(); onb.redo = true; Object.assign(onb.d, { train: S.remind.train, meals: p.meals || 5, name: p.name || "", goal: p.goal, sex: p.sex, age: String(p.age), h: String(Math.round(ld(p.h))), kg: String(Math.round(wd(currentKg()) * 10) / 10), health: JSON.parse(JSON.stringify(health())), level: p.level, days: p.days, mode: S.mode, bench: e.bench ? "si" : "no", dbMax: e.dbMax, bar: e.bar ? "si" : "no", pull: e.pull ? "si" : "no", dips: e.dips ? "si" : "no", diet: p.diet, pct: p.pct, weekend: S.weekend }); closeSheet(true); go("#/inicio"); render(); }
        else { closeSheet(true); act("reset"); }
      }));
    });
  } else if (a === "usecode0") {
    (async () => { try { adoptState(await stateFromCode($("#code0")?.value)); toast("Datos restaurados"); go("#/hoy"); } catch (e) { toast("Código no válido"); } })();
  } else if (a === "usecode") {
    (async () => {
      const raw = ($("#code-in")?.value || "").trim().replace(/\s+/g, "");
      try {
        if (raw.length > 8e6) throw new Error("grande"); let json;
        if (raw.startsWith("R90G.")) { const bin = atob(raw.slice(5)), u8 = Uint8Array.from(bin, c => c.charCodeAt(0)); json = await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"))).text(); }
        else if (raw.startsWith("R90N.")) json = decodeURIComponent(escape(atob(raw.slice(5)))); else throw new Error("formato");
        const n = normalizeState(JSON.parse(json)); if (!n.profile || !n.start) throw new Error("vacío");
        if (!confirm("Esto reemplaza los datos de este teléfono. ¿Continuar?")) return;
        S = n; _plan = { k: "", v: null }; save(); applyAccent(); applyTheme(); toast("Datos transferidos"); go("#/hoy");
      } catch (e) { toast("Código no válido"); }
    })();
  } else if (a === "sharediet") {
    const text = dietText();
    (async () => {
      try { if (navigator.share) { await navigator.share({ title: "Mi dieta", text }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
      try { await navigator.clipboard.writeText(text); toast("Dieta copiada: pégala donde quieras"); } catch (e) { toast("No se pudo compartir"); }
    })();
  } else if (a === "print") {
    try { window.print(); } catch { toast("No se pudo abrir la impresión"); }
  } else if (a === "csv") {
    const q = v => { let t = String(v ?? ""); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };
    const out = [["Día", "Comida", "Horario", "Platillo", "Ingredientes", "kcal", "Proteína (g)", "Carbohidratos (g)", "Grasas (g)"]];
    weekMenu().forEach(d => { d.meals.forEach(x => out.push([d.dn, x.slot, x.time, x.v.name, x.v.items.join(", "), x.v.m.kcal, x.v.m.p, x.v.m.c, x.v.m.g])); out.push([d.dn, "TOTAL DEL DÍA", "", "", "", d.tot.kcal, d.tot.p, d.tot.c, d.tot.g]); });
    out.push([], ["LISTA DE COMPRAS (7 días)", "Producto", "Cantidad"]);
    shopData().forEach(([t, it]) => it.forEach(([n, qty]) => out.push([t, n, qty])));
    const text = "\ufeff" + out.map(r => r.map(q).join(",")).join("\r\n");
    const l = document.createElement("a"); l.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" })); l.download = `menu-${S.profile.name ? S.profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" : ""}${iso}.csv`; l.click(); toast("Menú descargado");
  } else if (a === "reset") {
    if (confirm("¿Borrar todos tus datos y reiniciar? No se puede deshacer.")) { LS.removeItem(KEY); S = defaults(); go("#/inicio"); render(); }
  }
}

if (window.Store && Store.available()) {
  if (!LS.getItem(KEY)) Store.getKV("backup").then(b => { if (b) { try { const n = normalizeState(JSON.parse(b)); if (!n.profile || !n.start) return; S = n; LS.setItem(KEY, JSON.stringify(n)); _plan = { k: "", v: null }; toast("Recuperamos tus datos"); go("#/hoy"); if (parseHash()[0] === "hoy") render(); } catch {} } }).catch(() => {});
  if (S.start) Store.persist();
}
if (location.hostname === "localhost" && LS.getItem("reto90.debug")) window.__reto = { nextAction, get S() { return S; }, set S(v) { S = v; }, MEALS, weekMenu, shopData, avoidSet, ALG, cons, SESSIONS, planCalc, D, C, blocksOf, altsFor, suggest, equip, render };
const applyTheme = () => {
  const t = S.theme === "light" || S.theme === "dark" ? S.theme : null, root = document.documentElement;
  if (t) root.dataset.theme = t; else delete root.dataset.theme;
  const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.setAttribute("content", dark ? "#000000" : "#f2f2f7"); m.removeAttribute("media"); });
};
const applyAccent = () => { document.documentElement.dataset.accent = S.accent || "naranja"; };
applyAccent(); applyTheme(); ensureRestEl(); resumeRest(); resumeInt();
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
window.R90 = {
  nav, toast, go, refresh, render: () => render(), openSheet, closeSheet, I, seg: segHtml,
  hasPlan: () => !!(S.start && S.profile), remind: () => S.remind, mealTimes: () => { try { return dayMeals(false).map(m => m.time).filter(t => /^\d/.test(t)).map(t => t.padStart(5, "0")); } catch { return []; } }, trainDays: () => { try { return [...new Set(SESSIONS().map(x => x.wd).filter(d => d >= 0))]; } catch { return []; } },
  snapshot: () => JSON.parse(JSON.stringify(S)),
  adopt: raw => { S = normalizeState(raw); _plan = { k: "", v: null }; try { LS.setItem(KEY, JSON.stringify(S)); LS.setItem(KEY + ".saved", String(Date.now())); } catch {} applyTheme(); applyAccent(); if (S.start && window.Store) Store.setKV("backup", JSON.stringify(S)).catch(() => {}); render(); },
  wipe: async () => {
    clearTimeout(backupT); LS.removeItem(KEY); LS.removeItem(KEY + ".saved"); S = defaults(); _plan = { k: "", v: null };
    try { if (window.Store && Store.available()) { await Store.setKV("backup", null); const ph = await Store.photos(); for (const x of ph) await Store.delPhoto(x.id); } } catch {}
    applyTheme(); applyAccent();
  },
};
render();
})();
