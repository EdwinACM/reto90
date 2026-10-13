(() => {
const D = window.DATA, C = window.CONTENT;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app"), tabsEl = $("#tabs");
const KEY = "reto90.v1";

/* ───────── Estado ───────── */
const todayISO = (d = new Date()) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return todayISO(d); };
const diffDays = (a, b) => Math.round((new Date(a + "T12:00:00") - new Date(b + "T12:00:00")) / 864e5);
const defaults = () => ({ accent: "naranja", profile: null, cardio: {}, intro: false, start: null, weekend: "sab", mode: "gym", weights: {}, waists: {}, checks: {}, hist: {}, picks: {}, eaten: {}, reviews: {} });
let S;
try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { S = defaults(); }
Object.values(D.ARCH).forEach(s => ["gym", "home"].forEach(m => s[m].forEach((b, i) => { b.key = s.id + "-" + m + "-" + i; b.sid = s.id; b.idx = i; })));
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

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
const lowReps = r => { const n = nums(r); return n.length ? n[0] : 10; };

const I = {
  chev: `<svg class="chev" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/></svg>`,
  dumb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>`,
  fork: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v8M4 3v5a3 3 0 006 0V3M7 11v10M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>`,
};
const TABS = [["hoy", "Hoy", I.home], ["entreno", "Entreno", I.dumb], ["comida", "Comida", I.fork], ["progreso", "Progreso", I.chart], ["plan", "Plan", I.map]];

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
  ["gym", "home"].forEach(m => { s[m].forEach(b => {
    if (sex === "f" && b.items.some(it => it.k === "hip_thrust" || it.k === "glute_br")) b.rounds = Math.min(5, b.rounds + 1);
    if (sex !== "f" && b.items.some(it => it.k === "abductor")) { b.items = b.items.filter(it => it.k !== "abductor"); b.t = b.items.length > 1 ? b.t : "uni"; b.rounds = Math.min(5, b.rounds + 1); }
  }); });
  ["gym", "home"].forEach(m => s[m].forEach((b, i) => {
    if (b.t === "cardio") { b.min = Math.max(10, Math.round(b.min * (goal === "muscle" ? 0.5 : 1) / 5) * 5) + (goal === "fat" && days <= 4 ? 10 : 0); return; }
    const abs = b.items.every(it => ABS.has(it.k));
    if (goal === "muscle" && i > 0 && !abs && b.rounds === 3) b.rounds += 1;
    if (lv === "nuevo" && i > 0 && b.rounds >= 3 && !abs) b.rounds -= 1;
    if (lv === "alto" && i === 0) b.rounds = Math.min(5, b.rounds + 1);
  }));
  return s;
}
function SESSIONS() {
  const p = S.profile, k = [p.goal, p.days, p.level, S.weekend, p.sex].join("|");
  if (_plan.k === k) return _plan.v;
  const d = SPLITS[p.days] ? p.days : 6, wds = d === 3 ? [1, 3, 5] : d === 4 ? [1, 2, 4, 5] : d === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, S.weekend === "sab" ? 6 : 0];
  _plan = { k, v: SPLITS[d].map((id, i) => adaptSession(D.ARCH[id], wds[i], p.goal || "recomp", p.level || "medio", d, p.sex)) };
  return _plan.v;
}
const sessMin = s => Math.round((8 + blocksOf(s).reduce((a, b) => a + (b.t === "cardio" ? b.min : b.rounds * (b.items.length * 0.75 + b.rest / 60)), 0)) / 5) * 5;
const sessionFor = (iso = todayISO()) => { const wd = new Date(iso + "T12:00:00").getDay(); return SESSIONS().find(s => s.wd === wd) || null; };
const blocksOf = s => S.mode === "home" ? s.home : s.gym;
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
const LOWER = new Set(["smith_sq", "leg_press", "split_db", "leg_ext", "hack", "rdl", "leg_curl", "hip_thrust", "abductor", "calf_st", "calf_se"]);
function scaleW(item) {
  const p = S.profile, f = (p.sex === "f" ? (LOWER.has(item.k) ? 0.8 : 0.65) : 1) * (currentKg() / 75) * C.levels[p.level].k, u = item.w.u, x = item.w.n * f;
  if (u === "c/mano") return Math.max(2, x < 12 ? Math.round(x) : Math.round(x / 2) * 2);
  if (u === "stack") return Math.max(5, Math.round(x / 2.5) * 2.5);
  return Math.max(10, LOWER.has(item.k) ? Math.round(x / 5) * 5 : Math.round(x / 2.5) * 2.5);
}

/* Peso sugerido: estimado la primera vez; luego según lo registrado */
const incFor = (k, u) => u === "c/mano" ? 2 : u === "stack" ? 5 : (["smith_sq", "leg_press", "hack", "rdl", "hip_thrust"].includes(k) ? 10 : 2.5);
function suggest(item) {
  if (!item.w || S.mode === "home") return { text: S.mode === "home" ? "Sin peso (mochila opcional)" : "Peso corporal", n: null, src: "" };
  const iso = todayISO();
  const prev = [...(S.hist[item.k] || [])].reverse().find(x => x.d !== iso && x.sets.some(s => s.done && s.w));
  const u = item.w.u;
  if (!prev) { const n0 = scaleW(item); return { n: n0, u, text: `${fmt(n0, n0 % 1 ? 1 : 0)} kg ${u}`, src: "Estimado con tu peso y tu nivel: ajusta a 1–2 repeticiones en reserva." }; }
  const done = prev.sets.filter(s => s.done && s.w), top = Math.max(...done.map(s => s.w));
  const hit = done.length && done.every(s => (s.r || 0) >= topReps(item.reps));
  const n = hit ? top + incFor(item.k, u) : top;
  return { n, u, text: `${fmt(n, n % 1 ? 1 : 0)} kg ${u}`, src: hit ? `Completaste el rango alto con ${top} kg: sube.` : `Tu última vez: ${top} kg. Busca una repetición más.` };
}
const typeLabel = t => ({ uni: "Uniserie", bi: "Biserie", tri: "Triserie", cardio: "Cardio" }[t]);
const cardioMin = b => b.min + (phaseOf(weekNum()).cardioAdd || 0);
const cardioKinds = () => S.mode === "home" ? C.cardioKinds.home : C.cardioKinds.gym;
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

const BACKS = { Entreno: "#/entreno", Comida: "#/comida", Progreso: "#/progreso", Plan: "#/plan" };
function nav(title, o = {}) {
  const to = o.to || BACKS[o.back] || "#/hoy";
  const back = o.back ? `<button class="nb-btn" data-to="${to}" aria-label="Volver a ${esc(o.back)}">${I.back}<span>${esc(o.back)}</span></button>` : "";
  return `<div class="navbar" id="navbar">${back}<span class="nb-title" aria-hidden="true">${esc(title)}</span></div><h1 class="large" id="lt">${esc(title)}</h1>${o.sub ? `<p class="sub">${o.sub}</p>` : ""}`;
}
const cta = html => `<div class="cta-bar"><div class="inner">${html}</div></div>`;
function renderTabs(tab) {
  tabsEl.innerHTML = `<div class="inner">${TABS.map(([k, l, ic]) => `<a href="#/${k}" ${k === tab ? 'aria-current="page"' : ""}>${ic}<span>${l}</span></a>`).join("")}</div>`;
}
const TABOF = { hoy: "hoy", entreno: "entreno", bloque: "entreno", ej: "entreno", comida: "comida", progreso: "progreso", plan: "plan" };

function render(o) {
  const keep = !!(o && o.keep), y0 = scrollY;
  clearInterval(restT);
  const r = parseHash();
  if ((!S.start || !S.profile) && r[0] !== "inicio") return go("#/inicio");
  let html, hasCta = false;
  switch (r[0]) {
    case "inicio": html = vSetup(); break;
    case "hoy": html = vToday(); break;
    case "entreno": html = r[1] === "guia" ? vGuide() : r[1] === "abdomen" ? vAbs() : r[1] === "cardio" ? vCardioGuide() : r[1] === "porque" ? vWhy("train") : r[1] ? vSession(r[1]) : vTrain(); hasCta = !!r[1] && !["guia", "abdomen", "cardio", "porque"].includes(r[1]); break;
    case "bloque": html = vBlock(r[1], +r[2]); hasCta = true; break;
    case "ej": html = vExercise(r[1], r[2]); break;
    case "comida": html = r[1] === "guia" ? vFoodGuide(r[2]) : r[1] === "menu" ? vMenu() : r[1] === "compras" ? vShop() : r[1] === "snacks" ? vSnacks() : r[1] === "reglas" ? vFoodRules() : r[1] === "porque" ? vWhy("diet") : r[1] === "slot" ? vSlot(r[2]) : vFood(); break;
    case "progreso": html = r[1] === "revision" ? vReview() : r[1] === "peso" ? vLogWeight() : r[1] === "fuerza" ? vStrength() : r[1] === "guia" ? vMeasureGuide() : vProgress(); break;
    case "plan": html = r[1] === "semana" ? vWeek(+r[2]) : r[1] === "habitos" ? vHabits() : r[1] === "fuentes" ? vSources() : r[1] === "ajustes" ? vSettings() : r[1] === "reglas" ? vAdjust() : vPlan(); break;
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
  if (popSel) { $(popSel)?.classList.add("pop"); popSel = null; }
}

/* ───────── Vistas ───────── */
const paceOptions = (g, cur) => C.goals[g].paces.map(([k, v]) => `<option value="${k}" ${String(cur ?? C.goals[g].pace) === String(k) ? "selected" : ""}>${v}</option>`).join("");
const profileFields = (p = {}, ids = "st") => `
    <div class="field"><label for="${ids}-goal">Tu objetivo</label><select id="${ids}-goal">${Object.entries(C.goals).map(([k, v]) => `<option value="${k}" ${(p.goal || "recomp") === k ? "selected" : ""}>${v.name}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-pct">Ritmo</label><select id="${ids}-pct">${paceOptions(p.goal || "recomp", p.pct ?? p.def)}</select></div>
    <div class="field"><label for="${ids}-sex">Sexo (para estimar tus calorías)</label><select id="${ids}-sex"><option value="" ${p.sex ? "" : "selected"} disabled>Elige</option><option value="m" ${p.sex === "m" ? "selected" : ""}>Hombre</option><option value="f" ${p.sex === "f" ? "selected" : ""}>Mujer</option></select></div>
    <div class="field"><label for="${ids}-age">Edad (años)</label><input id="${ids}-age" type="number" inputmode="numeric" min="14" max="90" placeholder="Edad" value="${p.age ?? ""}"></div>
    <div class="field"><label for="${ids}-h">Estatura (cm)</label><input id="${ids}-h" type="number" inputmode="numeric" min="120" max="220" placeholder="Estatura" value="${p.h ?? ""}"></div>
    <div class="field"><label for="${ids}-kg">Peso actual (kg)</label><input id="${ids}-kg" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="Peso" value="${p.kg ?? ""}"></div>
    <div class="field"><label for="${ids}-lv">Tu experiencia con pesas</label><select id="${ids}-lv">${Object.entries(C.levels).map(([k, v]) => `<option value="${k}" ${(p.level || "medio") === k ? "selected" : ""}>${v.name} · ${v.sub}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-days">Días de pesas por semana</label><select id="${ids}-days">${C.daysOptions.map(([k, v]) => `<option value="${k}" ${String(p.days || 6) === String(k) ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label for="${ids}-diet">Cómo comes</label><select id="${ids}-diet">${Object.entries(C.diets).map(([k, v]) => `<option value="${k}" ${(p.diet || "omni") === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>`;
function readProfile(ids) {
  const g = i => $("#" + ids + "-" + i)?.value, sex = g("sex"), age = +g("age"), h = +g("h"), kg = parseFloat(g("kg"));
  if (!sex) return "Elige tu sexo";
  if (!(age >= 14 && age <= 90)) return "Escribe tu edad (14 a 90)";
  if (!(h >= 120 && h <= 220)) return "Escribe tu estatura en cm";
  if (!(kg >= 30 && kg <= 250)) return "Escribe tu peso en kg";
  return { sex, age, h, kg, level: g("lv"), goal: g("goal"), pct: +g("pct"), days: +g("days"), diet: g("diet"), adj: S.profile?.adj || 0 };
}
const ONB = () => ({ step: 0, d: { goal: null, sex: null, age: "", h: "", kg: "", level: null, days: null, mode: "gym", diet: "omni", pct: null, weekend: "sab", date: todayISO() } });
let onb = ONB();
const ONB_STEPS = 5;
function radioRows(name, options, cur) {
  return `<div class="group" role="radiogroup">${options.map(([v, t, m]) => `<button class="row top" role="radio" aria-checked="${String(cur) === String(v)}" data-choice="${name}|${v}"><span class="opt-radio ${String(cur) === String(v) ? "on" : ""}"></span><div class="main"><div class="title">${esc(t)}</div>${m ? `<div class="meta">${esc(m)}</div>` : ""}</div></button>`).join("")}</div>`;
}
const segRow = (name, options, cur) => `<div class="seg" role="group">${options.map(([v, t]) => `<button data-choice="${name}|${v}" aria-pressed="${String(cur) === String(v)}">${esc(t)}</button>`).join("")}</div>`;
function onbValid(step, d) {
  if (step === 0 && !d.goal) return "Elige lo que quieres lograr";
  if (step === 1) { if (!d.sex) return "Elige tu sexo"; if (!(+d.age >= 14 && +d.age <= 90)) return "Escribe tu edad (14 a 90)"; if (!(+d.h >= 120 && +d.h <= 220)) return "Escribe tu estatura en cm"; if (!(parseFloat(d.kg) >= 30 && parseFloat(d.kg) <= 250)) return "Escribe tu peso en kg"; }
  if (step === 2) { if (!d.level) return "Elige tu experiencia"; if (!d.days) return "Elige cuántos días puedes entrenar"; }
  return "";
}
function withDraft(fn) { const prev = S.profile, pw = S.weights, pwe = S.weekend, pm = S.mode; const d = onb.d; S.profile = { sex: d.sex, age: +d.age, h: +d.h, kg: parseFloat(d.kg), level: d.level, goal: d.goal, pct: d.pct ?? C.goals[d.goal].pace, days: +d.days, diet: d.diet, adj: 0 }; S.weights = {}; S.weekend = d.weekend; S.mode = d.mode; _plan = { k: "", v: null }; try { return fn(); } finally { S.profile = prev; S.weights = pw; S.weekend = pwe; S.mode = pm; _plan = { k: "", v: null }; } }
function vSetup() {
  const { step, d } = onb;
  const heads = ["¿Qué quieres lograr?", "Sobre ti", "Tu entrenamiento", "Tu comida y tu ritmo", "Tu plan"];
  const subs = ["Elige lo que más te importa: todo se adapta a eso.", "Para calcular tus calorías y tus pesos. Se queda solo en tu teléfono.", "Para armar tu semana con los días que de verdad puedes cumplir.", "Ajustamos las porciones y qué tan rápido avanzas.", "Esto es lo que calculamos con tus respuestas."];
  let body = "";
  if (step === 0) body = radioRows("goal", Object.entries(C.goals).map(([k, g]) => [k, g.name, g.desc]), d.goal);
  if (step === 1) body = `<h2 class="sec">Sexo (para estimar tus calorías)</h2>${segRow("sex", [["m", "Hombre"], ["f", "Mujer"]], d.sex)}
    <h2 class="sec">Tus medidas</h2><div class="group">
    <div class="field"><label for="ob-age">Edad (años)</label><input id="ob-age" type="number" inputmode="numeric" min="14" max="90" placeholder="Edad" value="${esc(d.age)}"></div>
    <div class="field"><label for="ob-h">Estatura (cm)</label><input id="ob-h" type="number" inputmode="numeric" min="120" max="220" placeholder="Estatura" value="${esc(d.h)}"></div>
    <div class="field"><label for="ob-kg">Peso actual (kg)</label><input id="ob-kg" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="Peso" value="${esc(d.kg)}"></div></div>`;
  if (step === 2) body = `<h2 class="sec">Tu experiencia con pesas</h2>${radioRows("level", Object.entries(C.levels).map(([k, v]) => [k, v.name, v.sub]), d.level)}
    <h2 class="sec">Días de pesas por semana</h2>${radioRows("days", C.daysOptions, d.days)}
    <h2 class="sec">¿Dónde entrenas?</h2>${segRow("mode", [["gym", "Gimnasio"], ["home", "En casa, sin equipo"]], d.mode)}`;
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
      <div class="row top"><div class="main"><div class="title">Cardio</div><div class="meta">${d.goal === "muscle" ? "Poco: solo para tu salud y recuperación" : "Zona 2 en caminadora o elíptica al final de las pesas"}${d.mode === "home" ? " (en casa: caminata rápida o trote)" : ""}</div></div></div>
      <div class="row top"><div class="main"><div class="title">Ritmo esperado</div><div class="meta">${d.goal === "muscle" ? "Subir" : "Bajar"} ≈ ${c.rate} por semana</div></div></div>
    </div>${c.floorHit ? `<p class="note"><strong>Aviso:</strong> tu meta quedaría por debajo de un mínimo razonable, así que se subió. Con un peso bajo conviene un ritmo suave.</p>` : ""}
    <p class="note">Son estimaciones con rango: cada semana la app te propone ajustes con tus datos. No sustituye a un médico ni a un nutriólogo.</p>`; });
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
    sesBlock = `<h2 class="sec">Entrenamiento</h2><div class="group"><button class="row" data-go="#/entreno/${ses.id}"><div class="main"><div class="title" style="font-size:20px;font-weight:600">${esc(ses.name)}</div><div class="meta">${esc(ses.focus)}</div><div class="meta">${blocksOf(ses).length} bloques · ${totalRounds(ses)} vueltas · ${sessMin(ses)} min</div></div>${done ? '<span class="badge good">Hecho</span>' : started ? `<span class="badge">${pr.done}/${pr.total}</span>` : ""}${I.chev}</button></div>
      <div class="btn-wrap"><button class="btn ${done ? "secondary" : ""}" data-go="#/entreno/${ses.id}">${done ? "Ver entrenamiento" : started ? "Continuar entrenamiento" : "Empezar entrenamiento"}</button></div>`;
  } else sesBlock = `<h2 class="sec">Entrenamiento</h2><div class="group"><div class="row"><div class="main"><div class="title">Descanso activo</div><div class="meta">Camina 45 minutos y estira. Hoy no hay pesas.</div></div></div></div>`;
  const w = S.weights[iso], delta = weekDelta(), steps = ck.steps || 0, water = ck.water || 0;
  return `<div class="navbar" id="navbar"><span class="nb-title" aria-hidden="true">Hoy</span></div><h1 class="large" id="lt">${n < 1 ? "Hoy" : n > 90 ? "Reto completo" : "Día " + n}</h1>
    <p class="sub" style="margin-bottom:8px">${longDate(iso)}${n >= 1 ? ` · Semana ${wk}, ${esc(ph.name)}` : ""}</p>
    <div class="bar" role="progressbar" aria-label="Avance del reto" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="--p:${(pct)/100}"></i></div>
    ${weekStrip(iso)}
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
    ${new Date().getDay() === 0 ? `<h2 class="sec">Esta semana</h2><div class="group"><button class="row" data-go="#/progreso/revision"><div class="main"><div class="title">Revisión semanal</div><div class="meta">Cinco preguntas y el ajuste recomendado</div></div>${I.chev}</button></div>` : ""}`;
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
  return `${nav("Entreno", { sub: `Esta semana: ${doneN} de ${SESSIONS().length} sesiones.` })}
  <div class="seg" role="group" aria-label="Lugar de entreno"><button data-mode="gym" aria-pressed="${S.mode === "gym"}">Gimnasio</button><button data-mode="home" aria-pressed="${S.mode === "home"}">En casa</button></div>
  <h2 class="sec">Semana</h2>
  <div class="group">${SESSIONS().map(s => {
    const done = sessionDoneThisWeek(s.id), isT = s.id === todayId;
    return `<button class="row" data-go="#/entreno/${s.id}"><span class="daycol">${s.day}</span><div class="main"><div class="title">${esc(s.name)}</div><div class="meta">${esc(s.focus)}</div></div>${done ? '<span class="badge good">Hecho</span>' : isT ? '<span class="badge">Hoy</span>' : ""}${I.chev}</button>`;
  }).join("")}</div>
  <p class="note">${S.weekend === "sab" ? "Domingo" : "Sábado"} es descanso: caminata de 45 minutos y movilidad.</p>
  <h2 class="sec">Aprende</h2>
  <div class="group">
    <button class="row" data-go="#/entreno/guia"><div class="main"><div class="title">Cómo leer el entrenamiento</div><div class="meta">Uniserie, biserie, triserie y pesos sugeridos</div></div>${I.chev}</button>
    <button class="row" data-go="#/entreno/abdomen"><div class="main"><div class="title">Cómo marcar el abdomen</div><div class="meta">Qué funciona y qué no</div></div>${I.chev}</button>
    <button class="row" data-go="#/entreno/cardio"><div class="main"><div class="title">Guía de cardio</div><div class="meta">Caminadora, elíptica y zona 2</div></div>${I.chev}</button>
    <button class="row" data-go="#/entreno/porque"><div class="main"><div class="title">Por qué este plan</div><div class="meta">Series por músculo y la evidencia detrás</div></div>${I.chev}</button>
  </div>
  <div class="group" style="margin-top:14px"><div class="prose"><p><strong>Progresión:</strong> trabaja dentro del rango de repeticiones. Al completar todas las vueltas en el máximo, sube el peso.</p><p><strong>Esfuerzo:</strong> termina cada serie con ${phaseOf(weekNum()).rir} repeticiones en reserva en esta fase.</p><p><strong>Calentamiento (8 min):</strong> 5 min de caminadora o bici, movilidad de hombros y cadera, y 2 series de aproximación del primer ejercicio.</p><p><strong>Cardio:</strong> ${phaseOf(weekNum()).cardio}, en zona 2 (caminadora o elíptica).</p></div></div>`;
}
function vGuide() { return `${nav("Cómo leer el entrenamiento", { back: "Entreno" })}<h2 class="sec">Uniserie, biserie y triserie</h2><div class="group"><div class="prose">${C.blocksGuide}</div></div><h2 class="sec">Pesos sugeridos</h2><div class="group"><div class="prose">${C.weightsGuide}</div></div>`; }
function vAbs() { return `${nav("Marcar el abdomen", { back: "Entreno" })}<div class="group"><div class="prose">${C.absGuide}</div></div>`; }

function vSession(id) {
  const s = SESSIONS().find(x => x.id === id); if (!s) return vTrain();
  const iso = todayISO(), bl = blocksOf(s), pr = sessionProgress(s), done = sessionDoneOn(iso, id);
  const first = bl.findIndex(b => blockProgress(b) < b.rounds);
  const noHist = Object.keys(S.hist).length === 0 && S.mode === "gym";
  const todays = sessionFor(iso);
  const otherDay = todays && todays.id !== id ? `<p class="note" style="margin:10px 16px 0">Hoy toca ${esc(todays.name)}. Si entrenas esta sesión ahora, queda registrada con la fecha de hoy.</p>` : "";
  const intro = S.intro ? "" : `<h2 class="sec">Antes de empezar</h2><div class="group"><div class="prose"><p><strong>Cada sesión son bloques.</strong> Uniserie: un ejercicio. Biserie: dos ejercicios seguidos (A y B) sin descanso entre ellos. Triserie: tres.</p><p>Una <strong>vuelta</strong> es hacer todos los ejercicios del bloque una vez. Al terminarla, descansas y repites.</p><p>Los pesos son de partida: ajusta a 1–2 repeticiones en reserva.</p></div><div style="padding:0 16px 14px"><button class="btn secondary" data-act="intro">Entendido</button></div></div>`;
  return `${nav(s.name, { back: "Entreno", sub: `${esc(s.focus)} · ${sessMin(s)} min` })}
  <div class="seg" role="group" aria-label="Lugar de entreno"><button data-mode="gym" aria-pressed="${S.mode === "gym"}">Gimnasio</button><button data-mode="home" aria-pressed="${S.mode === "home"}">En casa</button></div>
  ${otherDay}${intro}<h2 class="sec">${bl.length} bloques · ${pr.done} de ${pr.total} vueltas</h2>
  ${bl.map((b, bi) => {
    const p = blockProgress(b), cd = b.t === "cardio";
    return `<a class="blk" href="#/bloque/${id}/${bi}" aria-label="Bloque ${bi + 1}: ${typeLabel(b.t)}"><div class="blk-head"><span class="chip ${b.t}">${bi + 1} · ${typeLabel(b.t)}</span><span class="info">${cd ? cardioMin(b) + " min · zona 2" : b.rounds + " vueltas · " + fmtRest(b.rest)}</span><span class="prog ${p === b.rounds ? "done" : ""}">${p === b.rounds ? "Hecho" : cd ? "" : p + "/" + b.rounds}</span></div>
      ${cd ? `<div class="row"><img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${cardioKind().gif}.gif" width="56" height="56"><div class="main"><div class="title">${esc(S.mode === "home" ? "Caminata rápida o trote suave" : "Caminadora o elíptica")}</div><div class="meta">${esc(b.note || "Ritmo en el que puedes hablar frases cortas")}</div></div></div>` : b.items.map((it, ii) => { const ex = D.EX[it.k], sg = suggest(it); return `<div class="row">${b.items.length > 1 ? `<span class="letter">${letters[ii]}</span>` : ""}<img class="thumb" loading="lazy" decoding="async" alt="" src="gifs/${ex.id}.gif" width="56" height="56"><div class="main"><div class="title">${esc(ex.name)}</div><div class="meta">${esc(it.reps)} reps · ${esc(sg.text)}</div></div></div>`; }).join("")}</a><div class="blk-gap"></div>`;
  }).join("")}
  ${noHist ? `<p class="note">Primera vez: los pesos están calculados con tu peso, sexo y nivel, y son conservadores. Ajusta a 1–2 repeticiones en reserva; desde la segunda sesión la app te sugiere según lo que anotes.</p>` : ""}
  ${cta(first >= 0 ? `<button class="btn" data-go="#/bloque/${id}/${first}">${pr.done ? "Continuar" : "Empezar"} · bloque ${first + 1}</button>` : `<button class="btn ${done ? "secondary" : ""}" data-act="finish" data-id="${id}">${done ? "Entrenamiento completado" : "Terminar entrenamiento"}</button>`)}`;
}

function warmup(b, bi) {
  const it = b.items[0], sg = it && suggest(it);
  if (bi !== 0 || S.mode !== "gym" || !sg || !sg.n) return "";
  const w = x => { const v = sg.n * x, r = it.w.u === "c/mano" ? Math.round(v) : Math.round(v / 2.5) * 2.5; return fmt(Math.max(r, 2), r % 1 ? 1 : 0); };
  return `<h2 class="sec">Calentamiento</h2><div class="group"><div class="row top"><div class="main"><div class="title">5 min de caminadora o bici y 3 series de aproximación</div><div class="meta">${w(0.5)} kg × 8 · ${w(0.7)} kg × 5 · ${w(0.85)} kg × 2 (${esc(D.EX[it.k].name)}). Sin llegar al cansancio.</div></div></div></div>`;
}
function vBlock(id, bi) {
  const s = SESSIONS().find(x => x.id === id), b = s && blocksOf(s)[bi]; if (!b) return vTrain();
  if (b.t === "cardio") return vCardio(s, b, bi);
  const bl = blocksOf(s), next = bi + 1 < bl.length;
  const strip = `<div class="strip" role="list">${b.items.map((it, ii) => { const ex = D.EX[it.k], sg = suggest(it); return `<a role="listitem" href="#/ej/${it.k}/${id}-${bi}-${ii}" aria-label="Ver técnica de ${esc(ex.name)}"><div class="gif"><img src="gifs/${ex.id}.gif" alt="Demostración de ${esc(ex.name)}" width="320" height="213"></div><div class="cap">${b.items.length > 1 ? letters[ii] + " · " : ""}${esc(ex.name)}<small>${esc(it.reps)} reps · ${esc(sg.text)}</small></div></a>`; }).join("")}</div>`;
  const rounds = [];
  const active = Array.from({ length: b.rounds }, (_, r) => r).find(r => !b.items.every(it => roundDone(it, r)));
  for (let r = 0; r < b.rounds; r++) {
    const on = b.items.every(it => roundDone(it, r));
    rounds.push(`<div class="round ${on ? "done" : ""} ${r === active ? "active" : ""}" data-round="${r}"><div class="round-head"><b>Vuelta ${r + 1}</b><button class="tick" data-tick="${r}" aria-pressed="${on}" aria-label="Vuelta ${r + 1} terminada">${I.check}</button></div>
      <div class="entry-head"><span></span><span>Ejercicio</span><span>${S.mode === "home" ? "Extra kg" : "Kg"}</span><span>Reps</span></div>
      ${b.items.map((it, ii) => { const sg = suggest(it), cur = getSets(it.k)[r] || {}; return `<div class="entry"><span class="letter">${b.items.length > 1 ? letters[ii] : (ii + 1)}</span><span class="nm">${esc(D.EX[it.k].name)}<small>${esc(it.reps)}</small></span><input type="number" inputmode="decimal" step="0.5" min="0" data-i="${ii}" data-r="${r}" data-f="w" placeholder="${sg.n ?? (S.mode === "home" ? "—" : "pc")}" value="${cur.w ?? ""}" aria-label="${esc(D.EX[it.k].name)} vuelta ${r + 1}, kilos"><input type="number" inputmode="numeric" min="0" data-i="${ii}" data-r="${r}" data-f="r" placeholder="${lowReps(it.reps)}" value="${cur.r ?? ""}" aria-label="${esc(D.EX[it.k].name)} vuelta ${r + 1}, repeticiones"></div>`; }).join("")}${r === active ? `<div style="padding:8px 16px 4px"><button class="btn" data-tick="${r}" aria-label="Terminar vuelta ${r + 1}">Vuelta ${r + 1} lista</button></div>` : ""}</div>`);
  }
  const p = blockProgress(b);
  const how = b.t === "uni" ? "Una serie, descansa, repite." : b.t === "bi" ? "Haz A, pasa directo a B y descansa al terminar la vuelta." : "Haz A, B y C seguidos y descansa al terminar la vuelta.";
  return `${nav(`Bloque ${bi + 1}`, { back: s.name, to: `#/entreno/${id}`, sub: `<span class="chip ${b.t}">${typeLabel(b.t)}</span> &nbsp;${b.rounds} vueltas · descanso ${fmtRest(b.rest)}<br><span style="font-size:14px">${how}</span>` })}
  ${strip}
  ${warmup(b, bi)}
  <h2 class="sec">Vueltas · ${p} de ${b.rounds}</h2>
  <div class="group">${rounds.join("")}</div>
  <p class="note">Si dejas kilos o repeticiones vacíos al marcar, se guarda el peso sugerido y el mínimo del rango. “pc” = peso corporal. Toca el GIF para ver la técnica.</p>
  <input type="hidden" id="blk-ctx" value="${id}|${bi}">
  <div id="rest" role="timer" aria-live="off"><span class="lbl">Descanso</span><span class="t">0:00</span><button data-rest="add">+15 s</button><button data-rest="stop">Listo</button></div>
  ${cta(next ? `<button class="btn ${p === b.rounds ? "" : "quiet"}" data-go="#/bloque/${id}/${bi + 1}">Siguiente bloque</button>` : `<button class="btn ${p === b.rounds ? "" : "quiet"}" data-go="#/entreno/${id}">Terminar y ver resumen</button>`)}`;
}

function vCardio(s, b, bi) {
  const iso = todayISO(), k = cardioKind(), mins = cardioMin(b), rec = cardioRec(b, iso), done = !!rec?.done, ph = phaseOf(weekNum());
  const mix = b.kind === "mix" && weekNum() >= 5;
  const sessionHasNext = bi + 1 < blocksOf(s).length;
  return `${nav("Cardio", { back: s.name, to: `#/entreno/${s.id}`, sub: `${mins} min · zona 2 · ${esc(s.name)}` })}
  <div class="seg" role="group" aria-label="Tipo de cardio">${cardioKinds().map(x => `<button data-ckind="${x.id}" aria-pressed="${x.id === k.id}">${esc(x.name)}</button>`).join("")}</div>
  <div class="gif-wrap" style="margin-top:12px"><img src="gifs/${k.gif}.gif" alt="Demostración de ${esc(k.name)}" width="320" height="213"></div>
  <div class="group" style="margin-top:14px">
    <div class="row top"><div class="main"><div class="title">${esc(k.name)}</div><div class="meta">${esc(k.how)}</div></div></div>
    <div class="row top"><div class="main"><div class="title">Ritmo</div><div class="meta">Puedes hablar frases cortas pero no cantar (6–7 de 10). Unos 115–135 latidos por minuto, orientativo.</div></div></div>
    <div class="row top"><div class="main"><div class="title">Calentamiento</div><div class="meta">Los primeros 3–5 minutos, más suave.</div></div></div>
    ${mix ? `<div class="row top"><div class="main"><div class="title">Opcional: intervalos</div><div class="meta">5 min suave, 8 rondas de 30 s fuerte (8 de 10) + 90 s suave, 5 min suave. Si tus piernas no se recuperan, vuelve a zona 2.</div></div></div>` : ""}
    ${b.note ? `<div class="row top"><div class="main"><div class="meta">${esc(b.note)}</div></div></div>` : ""}
  </div>
  <div class="btn-wrap"><button class="btn quiet" data-ctimer="${mins * 60}">Iniciar temporizador · ${mins}:00</button></div>
  <p class="note">El cardio ayuda, pero lo que más pesa para bajar grasa es el déficit de calorías. <a href="#/entreno/cardio">Guía de cardio</a></p>
  <div id="rest" role="timer" aria-live="off"><span class="lbl">Cardio</span><span class="t">0:00</span><button data-rest="add">+15 s</button><button data-rest="stop">Parar</button></div>
  ${cta(`<button class="btn ${done ? "secondary" : ""}" data-cdone="${b.key}|${mins}|${s.id}">${done ? "Cardio completado" : "Marcar cardio hecho"}</button>`)}`;
}
function vWhy(kind) {
  const list = C.why[kind].filter(x => !x.only || x.only.includes(S.profile.goal || "recomp")), used = [];
  const src = id => C.sources.find(x => x.id === id);
  const vol = {}; SESSIONS().forEach(se => se.gym.forEach(b => b.items.forEach(it => { const g = D.MUSCLE[it.k]; vol[g] = (vol[g] || 0) + b.rounds; })));
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
function vCardioGuide() { return `${nav("Guía de cardio", { back: "Entreno" })}<div class="group"><div class="prose">${C.cardioGuide}</div></div>`; }

function vExercise(k, ctx) {
  const ex = D.EX[k]; if (!ex) return vTrain();
  const [sid, bi, ii] = (ctx || "").split("-"), s = SESSIONS().find(x => x.id === sid);
  const it = s ? blocksOf(s)[+bi]?.items[+ii] : null, sg = it ? suggest(it) : null;
  const hist = [...(S.hist[k] || [])].reverse().slice(0, 5);
  return `${nav(ex.name, { back: s ? `Bloque ${+bi + 1}` : "Entreno", sub: esc(ex.muscle) })}
  <div class="gif-wrap"><img src="gifs/${ex.id}.gif" alt="Demostración de ${esc(ex.name)}: posición inicial y final" width="320" height="213"></div>
  ${it ? `<div class="group" style="margin-top:14px"><div class="row top"><div class="main"><div class="weight-line"><span class="kg">${esc(sg.text)}</span><span class="pill">${esc(it.reps)} reps</span></div><div class="meta">${esc(sg.src)}${it.note ? " " + esc(it.note) : ""}</div></div></div></div>` : ""}
  <h2 class="sec">Técnica</h2>
  <div class="group"><ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>
  <h2 class="sec">Tu historial</h2>
  ${hist.length ? `<div class="group">${hist.map(h => { const best = h.sets.filter(x => x.r).sort((a, b) => (b.w || 0) * 100 + b.r - ((a.w || 0) * 100 + a.r))[0]; return `<div class="row"><div class="main"><div class="title">${shortDate(h.d)}</div></div><span class="val">${h.sets.filter(x => x.done).length} vueltas · ${best ? (best.w ? best.w + " kg × " : "") + best.r : "—"}</span></div>`; }).join("")}</div>` : `<div class="group"><div class="empty">Aún sin registros. Se llenan al marcar las vueltas.</div></div>`}`;
}

/* Comida */
function vFood() {
  const iso = todayISO(), rest = !isTrainDay(iso), T = targetFor(iso);
  return `${nav("Comida", { sub: rest ? "Hoy es día de descanso." : "Hoy es día de entreno." })}
  <h2 class="sec" style="margin-top:8px">Hoy · meta ≈ ${T.kcal.toLocaleString("es-MX")} kcal</h2>
  <div class="group">${mealRows(iso, true)}${intake(iso)}</div>
  <p class="note">Rango ${T.range} kcal · proteína ${T.p} g · carbohidratos ${T.c} g · grasas ${T.g} g. Marca cada comida al terminarla. Toca el nombre para cambiar de opción.</p>
  <h2 class="sec">Guía de alimentos</h2>
  <div class="group">
    ${[["semaforo", "Qué comer", "Verde, con medida y a evitar"], ["evitar", "Qué evitar y por qué", "Con la alternativa para cada uno"], ["cambios", "Cambios inteligentes", "En lugar de esto, prueba esto"], ["ideas", "Ideas de comidas", "Desayuno, comida, cena y snacks"], ["fuera", "Comer fuera y antojos", "Taquería, fiestas, restaurante"], ["etiquetas", "Etiquetas y porciones", "Cómo leer un empaque y medir con la mano"], ["prep", "Meal prep y ahorro", "Cocina una vez, come toda la semana"], ["alt", "Alternativas", "Sin carne, sin lácteos, sin gluten"]].map(([id, t, m]) => `<button class="row" data-go="#/comida/guia/${id}"><div class="main"><div class="title">${t}</div><div class="meta">${m}</div></div>${I.chev}</button>`).join("")}
  </div>
  <h2 class="sec">Herramientas</h2>
  <div class="group">
    <button class="row" data-go="#/comida/menu"><div class="main"><div class="title">Menú de la semana</div><div class="meta">Una rotación lista; aplícala a hoy</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/snacks"><div class="main"><div class="title">Snacks con proteína</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/compras"><div class="main"><div class="title">Lista de compras semanal</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/reglas"><div class="main"><div class="title">Reglas, hidratación y suplementos</div></div>${I.chev}</button>
    <button class="row" data-go="#/comida/porque"><div class="main"><div class="title">Por qué esta dieta</div><div class="meta">Calorías, macros y la evidencia detrás</div></div>${I.chev}</button>
  </div>`;
}
const DAYN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function vMenu() {
  const restIdx = S.weekend === "sab" ? 6 : 5;
  return `${nav("Menú de la semana", { back: "Comida", sub: "Una rotación de tus opciones. Toca un día para usarlo hoy." })}
  <div class="group">${DAYN.map((dn, d) => {
    const rest = d === restIdx, names = MEAL_BASE().filter(m => !(rest && m.slot === "Pre-entreno")).map(m => { const si = MEAL_BASE().indexOf(m); return m.opts[(d + si) % 3].name; });
    return `<button class="row top" data-menu="${d}"><div class="main"><div class="title">${dn}${rest ? ' <span class="pill">descanso</span>' : ""}</div><div class="meta">${names.map(esc).join(" · ")}</div></div>${I.chev}</button>`;
  }).join("")}</div>
  <p class="note">La lista de compras sale de esta rotación. Al elegir un día, tus comidas de hoy cambian a esas opciones; puedes cambiarlas una por una cuando quieras.</p>`;
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
  return `${nav(m.slot, { back: "Comida", sub: `Elige una opción · ${m.time}` })}
  <div class="group" role="radiogroup" aria-label="Opciones de ${esc(m.slot)}">${m.opts.map(optView).map((o, j) => `<button class="row top" data-pick="${j}" data-slot="${esc(m.slot)}" role="radio" aria-checked="${j === sel}"><span class="opt-radio ${j === sel ? "on" : ""}"></span><div class="main"><div class="title">${esc(o.name)}</div><div class="meta">${o.m.kcal} kcal · P ${o.m.p} · C ${o.m.c} · G ${o.m.g}</div><ul class="ing">${o.items.map(t => `<li>${esc(t)}</li>`).join("")}</ul>${o.tip ? `<div class="meta" style="margin-top:6px">${esc(o.tip)}</div>` : ""}</div></button>`).join("")}</div>
  ${tail ? `<p class="note">${tail}</p>` : ""}`;
}
function vSnacks() {
  return `${nav("Snacks", { back: "Comida", sub: "Cuando necesites algo extra. Rico en proteína y barato." })}
  <div class="group">${(isVeg() ? D.SNACKS_VEG : D.SNACKS).map(optView).map(o => `<div class="row top"><div class="main"><div class="title">${esc(o.name)}</div><div class="meta">${o.m.kcal} kcal · P ${o.m.p} g · C ${o.m.c} g · G ${o.m.g} g</div><ul class="ing">${o.items.map(t => `<li>${esc(t)}</li>`).join("")}</ul></div></div>`).join("")}</div>`;
}
function vFoodRules() {
  return `${nav("Reglas", { back: "Comida" })}
  <h2 class="sec">En la cocina</h2><div class="group"><div class="prose">${C.foodRules}</div></div>
  <h2 class="sec">Hidratación</h2><div class="group"><div class="prose">${C.hydrationTips}</div></div>
  <h2 class="sec">Suplementos</h2><div class="group"><div class="prose">${C.supplements}</div></div>`;
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
  return `${nav("Compras", { back: "Comida", sub: "Para 7 días con tu rotación de opciones." })}
  ${grp.map(([t, ks]) => `<h2 class="sec">${t}</h2><div class="group">${ks.map(line).join("")}</div>`).join("")}
  <h2 class="sec">Despensa</h2><div class="group"><div class="prose"><p>Sal, especias, limón, cebolla, cilantro, chile, salsa casera, mostaza, aceite en aerosol, té verde, gelatina sin azúcar, agua mineral.</p></div></div>
  <p class="note">Ahorro: compra pollo y res en cortes grandes y congélalos por porciones. Tortilla, arroz, frijol y huevo son tus bases baratas.</p>`;
}

/* Progreso */
function vProgress() {
  const now = avgWeight(todayISO()), delta = weekDelta();
  const ws = Object.entries(S.waists).sort((a, b) => a[0] < b[0] ? -1 : 1), w0 = ws[0], w1 = ws[ws.length - 1];
  const sesDone = SESSIONS().filter(s => sessionDoneThisWeek(s.id)).length;
  let adh = 0, dn = 0;
  for (let i = 0; i < 7; i++) { const d = addDays(todayISO(), -i); if (d < S.start) continue; dn++; const ms = mealsToday(d).filter(m => m.slot !== "Snack"), e = eatenOn(d); adh += ms.filter(m => e[m.slot]).length / ms.length; }
  return `${nav("Progreso")}
  <div class="group">
    <div class="row"><div class="main"><div class="title">Peso (promedio 7 días)</div></div><span class="val" style="color:var(--label);font-weight:600">${now ? fmt(now, 1) + " kg" : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Cambio vs. semana pasada</div></div><span class="val">${delta !== null ? trendText(delta) : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Cintura</div></div><span class="val">${w1 ? (w0[0] !== w1[0] ? `${w0[1]} → ${w1[1]} cm` : w1[1] + " cm") : "—"}</span></div>
    <div class="row"><div class="main"><div class="title">Entrenos esta semana</div></div><span class="val">${sesDone} / ${SESSIONS().length}</span></div>
    <div class="row"><div class="main"><div class="title">Comidas cumplidas (7 días)</div></div><span class="val">${dn ? Math.round(adh / dn * 100) + " %" : "—"}</span></div>
  </div>
  <h2 class="sec">Tendencia</h2>
  <div class="group" style="padding:12px 8px 4px">${chartSvg()}</div>
  <h2 class="sec">Registrar</h2>
  <div class="group">
    <button class="row" data-go="#/progreso/peso"><div class="main"><div class="title">Peso y cintura</div></div>${I.chev}</button>
    <button class="row" data-go="#/progreso/revision"><div class="main"><div class="title">Revisión semanal</div><div class="meta">Preguntas y ajuste de calorías</div></div>${I.chev}</button>
    <button class="row" data-go="#/progreso/fuerza"><div class="main"><div class="title">Fuerza</div><div class="meta">Tus mejores series por ejercicio</div></div>${I.chev}</button>
    <button class="row" data-go="#/progreso/guia"><div class="main"><div class="title">Qué medir y cómo interpretarlo</div><div class="meta">Agua, peso y grasa real</div></div>${I.chev}</button>
  </div>`;
}
function chartSvg() {
  const pts = sortedWeights().slice(-42);
  if (pts.length < 2) return `<div class="empty">Con 2 o más registros aparece la gráfica.</div>`;
  const W = 340, H = 170, pl = 28, pr = 8, pt = 10, pb = 22, vals = pts.map(p => p[1]), avgs = pts.map(([d]) => avgWeight(d));
  const lo = Math.floor(Math.min(...vals, ...avgs) - 0.5), hi = Math.ceil(Math.max(...vals, ...avgs) + 0.5);
  const X = i => pl + i / (pts.length - 1) * (W - pl - pr), Y = v => pt + (hi - v) / (hi - lo) * (H - pt - pb);
  const grid = []; for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) grid.push(`<line class="grid" x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${pl - 5}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`);
  const line = avgs.map((a, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(a).toFixed(1)}`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de peso: puntos diarios y promedio de 7 días">${grid.join("")}${pts.map((p, i) => `<circle class="pt" cx="${X(i)}" cy="${Y(p[1])}" r="2.6"/>`).join("")}<path class="avg" d="${line}"/><text x="${pl}" y="${H - 6}">${shortDate(pts[0][0])}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end">${shortDate(pts[pts.length - 1][0])}</text></svg>
  <p class="note" style="margin:0 8px 8px">Puntos: cada pesada. Línea: promedio de 7 días, lo que importa.</p>`;
}
function vLogWeight() {
  const iso = todayISO(), rows = sortedWeights().slice(-14).reverse();
  return `${nav("Peso y cintura", { back: "Progreso" })}
  <h2 class="sec">Peso de hoy</h2>
  <div class="group"><div class="input-line"><input id="w-today" type="number" inputmode="decimal" step="0.1" placeholder="kg" aria-label="Peso en kilogramos" value="${S.weights[iso] || ""}"><button class="btn" data-act="saveweight">Guardar</button></div></div>
  <h2 class="sec">Cintura (cm) · una vez por semana</h2>
  <div class="group"><div class="input-line"><input id="waist" type="number" inputmode="decimal" step="0.1" placeholder="cm a la altura del ombligo" aria-label="Cintura en centímetros" value="${S.waists[iso] || ""}"><button class="btn" data-act="savewaist">Guardar</button></div></div>
  <h2 class="sec">Últimos registros</h2>
  ${rows.length ? `<div class="group">${rows.map(([d, v]) => `<div class="row"><div class="main"><div class="title">${shortDate(d)}</div></div><span class="val">${fmt(v, 1)} kg${S.waists[d] ? " · " + S.waists[d] + " cm" : ""}</span></div>`).join("")}</div>` : `<div class="group"><div class="empty">Aún no hay registros.</div></div>`}`;
}
const bestOf = e => { const s = e.sets.filter(x => x.r).sort((a, b) => (b.w || 0) * 100 + b.r - ((a.w || 0) * 100 + a.r))[0]; return s ? `${s.w ? s.w + " kg × " : ""}${s.r}` : "—"; };
function vStrength() {
  const keys = Object.keys(S.hist).filter(k => S.hist[k].length);
  return `${nav("Fuerza", { back: "Progreso", sub: "Mejor serie por ejercicio." })}
  ${keys.length ? `<div class="group">${keys.map(k => { const h = S.hist[k]; return `<div class="row"><div class="main"><div class="title">${esc(D.EX[k]?.name || k)}</div><div class="meta">${h.length} sesiones · inicio ${bestOf(h[0])}</div></div><span class="val">${bestOf(h[h.length - 1])}</span></div>`; }).join("")}</div>` : `<div class="group"><div class="empty">Marca tus vueltas en cada bloque y aquí verás tu progreso.</div></div>`}`;
}
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
function vPlan() {
  const wk = weekNum(), n = dayNum(), ph = phaseOf(wk);
  return `${nav("Plan", { sub: `Día ${Math.max(n, 0)} de 90 · Fase ${ph.n}: ${ph.name}` })}
  <h2 class="sec">Esta semana</h2>
  <div class="group"><button class="row" data-go="#/plan/semana/${wk}"><div class="main"><div class="title">Semana ${wk}</div><div class="meta">${esc(C.weekFocus[wk])}</div></div>${I.chev}</button></div>
  <h2 class="sec">Hoja de ruta</h2>
  <div class="group">${Array.from({ length: 13 }, (_, i) => i + 1).map(w => `<button class="row" data-go="#/plan/semana/${w}"><div class="main"><div class="title">Semana ${w}${w === wk ? ' <span class="badge">Actual</span>' : ""}</div><div class="meta">${esc(phaseOf(w).name)}${[4, 8].includes(w) ? " · descarga" : ""}</div></div>${I.chev}</button>`).join("")}</div>
  <h2 class="sec">Metas intermedias</h2>
  <div class="group">${C.milestones.map(m => { const k0 = S.profile.kg, wtxt = m.pct ? `Peso −${fmt(k0 * m.pct[0] / 100, 1)} a −${fmt(k0 * m.pct[1] / 100, 1)} kg · ` : ""; return `<div class="row top"><div class="main"><div class="title">Día ${m.day} · ${esc(m.t)}</div><div class="meta">${esc(wtxt + (m.cm ? m.d.replace("{cm}", m.cm[0] + " a " + m.cm[1]) : m.d))}</div></div></div>`; }).join("")}</div>
  <h2 class="sec">Más</h2>
  <div class="group">
    <button class="row" data-go="#/plan/habitos"><div class="main"><div class="title">Hábitos y reglas del día a día</div></div>${I.chev}</button>
    <button class="row" data-go="#/plan/reglas"><div class="main"><div class="title">Cuándo ajustar calorías</div></div>${I.chev}</button>
    <button class="row" data-go="#/plan/fuentes"><div class="main"><div class="title">Fuentes y notas honestas</div></div>${I.chev}</button>
    <button class="row" data-go="#/plan/ajustes"><div class="main"><div class="title">Ajustes</div></div>${I.chev}</button>
  </div>`;
}
function vWeek(n) {
  n = Math.min(13, Math.max(1, n || 1));
  const ph = phaseOf(n), start = addDays(S.start, (n - 1) * 7), deload = [4, 8].includes(n);
  return `${nav("Semana " + n, { back: "Plan", sub: `Fase ${ph.n}: ${ph.name} · ${shortDate(start)} – ${shortDate(addDays(start, n === 13 ? 5 : 6))}` })}
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
  </div>
  <p class="note">Tras cada revisión la app sugiere el ajuste: esta hoja de ruta se adapta a tus datos, no a un guion fijo.</p>`;
}
function vHabits() { return `${nav("Hábitos", { back: "Plan", sub: "Constancia, no perfección." })}${C.habits.map(h => `<h2 class="sec">${esc(h.title)}</h2><div class="group"><div class="prose">${h.body}</div></div>`).join("")}`; }
function vAdjust() { return `${nav("Ajustes de calorías", { back: "Plan" })}<div class="group">${C.adjustRules[S.profile.goal || "recomp"].map(r => `<div class="row top"><div class="main"><div class="title">${esc(r.when)}</div><div class="meta">${esc(r.act)}</div></div></div>`).join("")}</div><p class="note">${esc(C.adjustLimit)}</p>`; }
function vSources() {
  return `${nav("Fuentes", { back: "Plan" })}<h2 class="sec">Notas honestas</h2><div class="group"><div class="prose">${fill(C.honesty)}</div></div>
  <h2 class="sec">Evidencia usada</h2><div class="group">${C.sources.map(s => s.u ? `<a class="row top" href="${s.u}" target="_blank" rel="noopener"><div class="main"><div class="title">${esc(s.t)}</div><div class="meta">${esc(s.why)}</div></div>${I.chev}</a>` : `<div class="row top"><div class="main"><div class="title">${esc(s.t)}</div><div class="meta">${esc(s.why)}</div></div></div>`).join("")}</div>
  <p class="note">Las fuentes sin enlace las cité de resúmenes: verifícalas en el texto original antes de depender de ellas. Los pesos sugeridos y los valores nutricionales son estimaciones.</p>
  <h2 class="sec">Tus cálculos</h2><div class="group"><div class="prose"><p>Mantenimiento estimado: ${num(planCalc().maintLo)}–${num(planCalc().maintHi)} kcal (fórmula de Mifflin-St Jeor × actividad 1.45–1.65). ${S.profile.goal === "muscle" ? "Superávit" : "Déficit"} de ${planCalc().pct} %${planCalc().adj ? ` con un ajuste de ${planCalc().adj > 0 ? "+" : "−"}${Math.abs(planCalc().adj)} kcal` : ""}.</p>${planCalc().floorHit ? "<p><strong>Aviso:</strong> tu meta quedaría por debajo de un mínimo razonable, así que se subió. Si tu peso es bajo, no uses un déficit agresivo.</p>" : ""}</div></div>`;
}
function vSettings() {
  return `${nav("Ajustes", { back: "Plan" })}
  <h2 class="sec">Tu perfil</h2>
  <div class="group" id="prof">${profileFields(S.profile, "pf")}</div>
  <p class="note">Tus calorías, macros, porciones y pesos sugeridos se recalculan con estos datos y con tu peso registrado.</p>
  <h2 class="sec">Apariencia</h2>
  <div class="group"><div class="field"><label>Color de acento</label><div class="seg" role="group" aria-label="Color de acento">${[["naranja", "Naranja"], ["azul", "Azul"], ["morado", "Morado"], ["rosa", "Rosa"]].map(([k, v]) => `<button data-accent="${k}" aria-pressed="${S.accent === k}">${v}</button>`).join("")}</div></div></div>
  <h2 class="sec">Reto</h2>
  <div class="group">
    <div class="field"><label for="se-date">Día 1 del reto</label><input id="se-date" type="date" value="${S.start}"></div>
    <div class="field"><label for="se-we">Fin de semana</label><select id="se-we"><option value="sab" ${S.weekend === "sab" ? "selected" : ""}>Entreno sábado, descanso domingo</option><option value="dom" ${S.weekend === "dom" ? "selected" : ""}>Entreno domingo, descanso sábado</option></select></div>
  </div>
  <h2 class="sec">Tus datos</h2>
  <div class="group">
    <button class="row" data-act="export"><div class="main"><div class="title">Exportar copia (JSON)</div><div class="meta">Respaldo de pesos, series y comidas</div></div></button>
    <label class="row" style="cursor:pointer"><div class="main"><div class="title">Importar copia</div></div><input type="file" accept="application/json" id="imp" hidden></label>
    <button class="row" data-act="reset"><div class="main"><div class="title" style="color:var(--bad)">Borrar todo y reiniciar</div></div></button>
  </div>
  <p class="note">Todo se guarda solo en este teléfono. Si borras los datos del navegador pierdes tu historial: exporta una copia de vez en cuando.</p>`;
}

/* ───────── Temporizador y registro ───────── */
let restEnd = 0;
function startRest(sec, label = "Descanso") {
  const el = $("#rest"); if (!el) return;
  clearInterval(restT); restEnd = Date.now() + sec * 1000; el.classList.add("on"); $("#rest .lbl").textContent = label;
  const tick = () => {
    restLeft = Math.max(0, Math.ceil((restEnd - Date.now()) / 1000));
    const t = $("#rest .t"); if (t) t.textContent = `${Math.floor(restLeft / 60)}:${String(restLeft % 60).padStart(2, "0")}`;
    if (restLeft <= 0) { clearInterval(restT); vibrate([200, 100, 200]); toast(label === "Cardio" ? "Cardio terminado" : "Descanso terminado"); $("#rest")?.classList.remove("on"); }
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
      if (setDone) { if (cur.w === null) { const sg = suggest(it); if (sg.n != null) { cur.w = sg.n; w.value = sg.n; } } if (cur.r === null) { cur.r = lowReps(it.reps); rp.value = cur.r; } }
    }
  });
  save();
}
function checkSessionComplete(s) {
  const pr = sessionProgress(s);
  if (pr.done === pr.total && !sessionDoneOn(todayISO(), s.id)) { checksOf(todayISO())["s_" + s.id] = true; save(); toast("Entrenamiento completo"); vibrate([30, 60, 30]); }
}
function afterTick() {
  const ctx = blockCtx(); if (!ctx) return;
  checkSessionComplete(ctx.s);
}

/* ───────── Eventos ───────── */
function bind() {
  $("[data-to]")?.addEventListener("click", e => go(e.currentTarget.dataset.to));
  $$("[data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
  $$("[data-mode]").forEach(b => b.addEventListener("click", () => { S.mode = b.dataset.mode; save(); refresh(); }));
  $$("[data-check]").forEach(c => c.addEventListener("change", () => { checksOf(todayISO())[c.dataset.check] = c.checked; save(); vibrate(8); }));
  $$("[data-eat]").forEach(b => b.addEventListener("click", () => { const e = S.eaten[todayISO()] = S.eaten[todayISO()] || {}, s = b.dataset.eat; e[s] = !e[s]; if (e[s]) popSel = `[data-eat="${s}"] .circle`; save(); vibrate(10); refresh(); }));
  $$("[data-water]").forEach(b => b.addEventListener("click", () => { const c = checksOf(todayISO()); c.water = Math.max(0, Math.min(6000, (c.water || 0) + +b.dataset.water)); save(); vibrate(8); refresh(); }));
  $("#steps")?.addEventListener("change", e => { checksOf(todayISO()).steps = +e.target.value || 0; save(); toast("Pasos guardados"); });
  $$("[data-accent]").forEach(b => b.addEventListener("click", () => { S.accent = b.dataset.accent; applyAccent(); save(); $$("[data-accent]").forEach(x => x.setAttribute("aria-pressed", x === b)); }));
  $$("[data-adj]").forEach(b => { if (!b.closest("#rev-out")) b.addEventListener("click", () => adjustKcal(b.dataset.adj)); });
  $$("[data-choice]").forEach(b => b.addEventListener("click", () => { const [k, v] = b.dataset.choice.split("|"); onb.d[k] = ["days", "pct"].includes(k) ? +v : v; if (k === "goal") onb.d.pct = null; vibrate(8); refresh(); }));
  [["#ob-age", "age"], ["#ob-h", "h"], ["#ob-kg", "kg"], ["#ob-date", "date"]].forEach(([sel, k]) => $(sel)?.addEventListener("input", e => { onb.d[k] = e.target.value; }));
  $$("[data-onb]").forEach(b => b.addEventListener("click", () => {
    const a = b.dataset.onb;
    if (a === "back") { onb.step = Math.max(0, onb.step - 1); return refresh(); }
    const err = onbValid(onb.step, onb.d); if (err) return toast(err);
    if (a === "next") { onb.step++; render(); } else act("start", b);
  }));
  $$("[data-menu]").forEach(b => b.addEventListener("click", () => { const d = +b.dataset.menu; MEAL_BASE().forEach((m, si) => { S.picks[m.slot] = (d + si) % 3; }); save(); vibrate(10); toast("Menú aplicado a hoy"); go("#/comida"); }));
  $$("[data-pick]").forEach(b => b.addEventListener("click", () => { S.picks[b.dataset.slot] = +b.dataset.pick; save(); $$("[data-pick]").forEach(x => { const on = x === b; x.setAttribute("aria-checked", on); x.querySelector(".opt-radio").classList.toggle("on", on); }); vibrate(8); }));
  $$("[data-rq]").forEach(i => i.type === "range" && i.addEventListener("input", () => { $("#rv-" + i.dataset.rq).textContent = i.value; }));
  $$("[data-f]").forEach(i => i.addEventListener("input", () => saveRound(+i.dataset.r)));
  $$("[data-tick]").forEach(b => b.addEventListener("click", () => {
    const rEl = b.closest(".round"), r = +b.dataset.tick, on = !rEl.classList.contains("done");
    saveRound(r, on); vibrate(10); afterTick(); const ctx = blockCtx();
    if (on) popSel = `.round[data-round="${r}"] .tick`;
    refresh();
    if (on) { if (blockProgress(ctx.b) === ctx.b.rounds) toast("Bloque terminado"); else startRest(ctx.b.rest); }
  }));
  $$("[data-ckind]").forEach(b => b.addEventListener("click", () => { S.cardioKind = b.dataset.ckind; save(); refresh(); }));
  $$("[data-ctimer]").forEach(b => b.addEventListener("click", () => { startRest(+b.dataset.ctimer, "Cardio"); vibrate(10); }));
  $$("[data-cdone]").forEach(b => b.addEventListener("click", () => {
    const [key, m, sid] = b.dataset.cdone.split("|"), iso = todayISO(), day = S.cardio[iso] = S.cardio[iso] || {};
    const on = !day[key]?.done; day[key] = { done: on, min: +m, kind: S.cardioKind || cardioKinds()[0].id }; save(); vibrate(12);
    const s = SESSIONS().find(x => x.id === sid); if (on) checkSessionComplete(s); else if (sessionDoneOn(iso, sid)) { checksOf(iso)["s_" + sid] = false; save(); }
    toast(on ? "Cardio registrado" : "Desmarcado"); go(`#/entreno/${sid}`);
  }));
  $$("[data-rest]").forEach(b => b.addEventListener("click", () => { if (b.dataset.rest === "add") restEnd += 15000; else { clearInterval(restT); $("#rest").classList.remove("on"); } }));
  $("#imp")?.addEventListener("change", async e => { try { const j = JSON.parse(await e.target.files[0].text()); S = Object.assign(defaults(), j); save(); toast("Copia importada"); go("#/hoy"); } catch { toast("Archivo no válido"); } });
  [["st", "#st-goal"], ["pf", "#pf-goal"]].forEach(([ids, sel]) => $(sel)?.addEventListener("change", e => { $("#" + ids + "-pct").innerHTML = paceOptions(e.target.value); }));
  $$("#prof select, #prof input").forEach(i => i.addEventListener("change", () => { const pr = readProfile("pf"); if (typeof pr === "string") return toast(pr); S.profile = pr; save(); toast("Perfil actualizado"); }));
  $("#se-date")?.addEventListener("change", e => { if (e.target.value) { S.start = e.target.value; save(); toast("Fecha actualizada"); } });
  $("#se-we")?.addEventListener("change", e => { S.weekend = e.target.value; save(); toast("Fin de semana actualizado"); });
  $$("[data-act]").forEach(b => b.addEventListener("click", () => act(b.dataset.act, b)));
}
function adjustKcal(v) {
  S.profile.adj = v === "reset" ? 0 : clamp((S.profile.adj || 0) + +v, -450, 450); save(); vibrate(12); toast(v === "reset" ? "Ajuste quitado" : "Metas actualizadas"); refresh();
}
function act(a, el) {
  const iso = todayISO();
  if (a === "start") {
    const d = onb.d;
    S.profile = { sex: d.sex, age: +d.age, h: +d.h, kg: parseFloat(d.kg), level: d.level, goal: d.goal, pct: d.pct ?? C.goals[d.goal].pace, days: +d.days, diet: d.diet, adj: 0 };
    S.start = d.date || iso; S.weekend = d.weekend; S.mode = d.mode; S.weights = { [S.start]: S.profile.kg }; _plan = { k: "", v: null };
    save(); onb = ONB(); go("#/hoy"); toast("Listo: día 1");
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
  } else if (a === "export") {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    const l = document.createElement("a"); l.href = URL.createObjectURL(blob); l.download = `reto90-${iso}.json`; l.click();
  } else if (a === "reset") {
    if (confirm("¿Borrar todos tus datos y reiniciar? No se puede deshacer.")) { localStorage.removeItem(KEY); S = defaults(); go("#/inicio"); render(); }
  }
}

if (localStorage.getItem("reto90.debug")) window.__reto = { get S() { return S; }, set S(v) { S = v; }, SESSIONS, planCalc, D, C, blocksOf, render };
const applyAccent = () => { document.documentElement.dataset.accent = S.accent || "naranja"; };
applyAccent();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
})();
