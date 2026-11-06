/* Көші-қон саясаты — интерактивті сабақ. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "style") el.style.cssText = v;
    else el.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
};
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* ---------- режим: тақта / оқушы / қонақ ---------- */
const MQ = new URLSearchParams(location.search).get("m");
if (MQ === "s" || MQ === "g" || MQ === "b") store.set("kkMode", MQ);
const MODE = store.get("kkMode", "b"), STUDENT = MODE === "s" || MODE === "g";
const SALLOW = MODE === "g" ? ["wall"] : ["hub", "card", "terms", "duel", "witness", "prompt", "levels", "quiz", "reflect", "wall"];
if (STUDENT) document.body.classList.add("student");

/* ---------- toast + confetti ---------- */
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400); }
const cv = $("#confetti"), cx = cv.getContext("2d"); let parts = [], confRun = false;
function confetti(n = 140) {
  cv.width = innerWidth; cv.height = innerHeight;
  const cols = ["#1e8cf0", "#0fb5a3", "#ffc23d", "#f78c14", "#12a86f", "#5b5bd6"];
  for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35, vx: (Math.random() - .5) * 16, vy: -Math.random() * 14 - 4, s: 6 + Math.random() * 8, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 120 + Math.random() * 60 });
  if (!confRun) { confRun = true; requestAnimationFrame(tick); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life-- > 0);
  for (const p of parts) { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, p.life / 40); cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); }
  if (parts.length) requestAnimationFrame(tick); else { confRun = false; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* ---------- bubbles ---------- */
(() => { const b = $(".bubbles"); for (let i = 0; i < 18; i++) { const s = 10 + Math.random() * 34; b.append(h("span", { style: `left:${Math.random() * 100}%;width:${s}px;height:${s}px;animation-duration:${14 + Math.random() * 18}s;animation-delay:${-Math.random() * 30}s` })); } })();

/* ---------- my score ---------- */
const SCORE_KEYS = { terms: ["Ұғымды тап", 5], duel: ["Дерек дуэлі", 6], witness: ["ЖИ қатесін тап", 6], group: ["Промпт шеберханасы (топ)", 5], levels: ["Сараланған тапсырма", 4], quiz: ["Квиз", 10] };
const MAXP = 36;
const gradeOf = t => { const p = Math.round(t / MAXP * 100); return { p, mark: Math.max(1, Math.round(p / 10)), ...DATA.grades.find(g => p >= g.min) }; };
function setScore(k, v) { const s = store.get("kkScore", {}); if (s[k] === v) return; s[k] = v; store.set("kkScore", s); renderMyScore(); livePush(); }
function myTotal() { const s = store.get("kkScore", {}); return Object.keys(SCORE_KEYS).reduce((t, k) => t + (s[k] || 0), 0); }
function me() { return store.get("kkMe", null); }
function livePush() { const m = me(); if (!m || !LIVE.on()) return; LIVE.pushStudent(m.id, { name: m.name, group: m.group, scores: store.get("kkScore", {}), total: myTotal(), essay: (store.get("kkEssay", "") || "").slice(0, 800), ts: Date.now() }); }
function renderMyScore() {
  const s = store.get("kkScore", {}); let tot = 0;
  const rows = Object.entries(SCORE_KEYS).map(([k, [n, max]]) => { const v = s[k] ?? 0; tot += v; return `<tr><td>${n}</td><td class="pt">${v} / ${max}</td></tr>`; }).join("");
  $("#myScore").textContent = tot;
  const q = store.get("kkQuiz", null);
  const G = gradeOf(tot);
  $("#mineBody").innerHTML = `<div class="grade-hero" style="--g:${G.color}"><div class="gh-mark">${G.mark}<small style="font-size:16px">/10</small></div><div><b>${G.ico} ${G.name} деңгей</b><small>${tot} / ${MAXP} ұпай · ${G.p}% · формативтік балл ${G.mark}/10</small></div></div><table class="dtable"><tr><th>Тапсырма</th><th>Ұпай</th></tr>${rows}<tr><td><b>Барлығы</b></td><td class="pt">${tot} / ${MAXP} (${G.p}%)</td></tr></table>` +
    (q ? `<p class="hint">⚡ Квиз: ${q.ok}/10 — деңгейің: <b>${q.lvl}</b></p>` : `<p class="muted small">Квиз нәтижесі осында шығады.</p>`) +
    (LIVE.on() ? `<p class="muted small">🛰️ Ұпайлар рейтингке автоматты жіберіледі.</p>` : `<p class="muted small">Ұпайлар осы құрылғыда сақталады.</p>`);
}

/* ---------- router (ҚМЖ кезеңдері) ---------- */
const ST = DATA.stages.concat([{ id: "hub", ico: "📱", label: "Менің тапсырмаларым", phase: 5, t: [0, 0] }]); let cur = 0;
document.body.classList.add("has-side");
const PC = DATA.phaseColors, PN = DATA.phases;
const dur = s => s.t[1] - s.t[0];
// sidebar
(() => {
  const list = $("#sideList"); let ph = -1;
  ST.forEach((s, i) => {
    if (s.phase !== ph) {
      ph = s.phase;
      if (ph > 0 && ph < 5) {
        const items = ST.filter(x => x.phase === ph && dur(x));
        const rng = items.length ? `${items[0].t[0]}–${items[items.length - 1].t[1]} мин` : "";
        list.append(h("h4", { class: ph === 4 ? "doc" : "", style: `--c:${PC[ph]}` }, PN[ph], h("span", {}, rng)));
      }
    }
    if (s.phase === 5) return;
    list.append(h("button", { class: "si" + (s.phase === 4 ? " doc" : ""), "data-i": i, style: `--c:${PC[s.phase]}`, onclick: () => { go(s.id); document.body.classList.remove("side-open"); } },
      h("span", { class: "i" }, s.ico), h("span", {}, s.label), h("small", {}, dur(s) ? `${s.t[0]}–${s.t[1]}′` : "")));
  });
  [1, 2, 3].forEach(p => {
    const items = ST.filter(x => x.phase === p);
    $("#phasebar").append(h("button", { class: "ph", "data-p": p, style: `--c:${PC[p]}`, onclick: () => go(items[0].id) },
      h("span", { class: "fill", style: `background:${PC[p]}` }), h("span", { class: "nm" }, PN[p]), h("span", { class: "mn" }, `${items[0].t[0]}–${items[items.length - 1].t[1]}′`)));
  });
})();
// big 3D badge in stage banners + glow panels
ST.forEach(s => { const head = document.getElementById("st-" + s.id)?.querySelector(".stage-head"); if (head) head.append(h("div", { class: "big-badge", "aria-hidden": "true" }, s.ico)); });
["#passport", ".quiz-card", "#witChat", ".tm-scene", "#termsMatch .bank"].forEach(q => $$(q).forEach(e => e.classList.add("glow")));
// teacher (ҚМЖ) panels
ST.forEach(s => {
  const k = DATA.kmj[s.id], sec = document.getElementById("st-" + s.id); if (!sec) return;
  const head = sec.querySelector(".stage-head");
  if (head && dur(s)) head.querySelector(".kicker")?.insertAdjacentElement("afterend", h("span", { class: "phase-chip", style: `--c:${PC[s.phase]}` }, `${PN[s.phase]} · ${s.t[0]}–${s.t[1]} мин`));
  if (!k || !head) return;
  head.insertAdjacentElement("afterend", h("div", { class: "tpanel" },
    h("div", { class: "tp-top" }, h("span", { class: "tag", style: `--c:${PC[s.phase]}` }, "👩‍🏫 ҚМЖ · " + PN[s.phase]), h("span", { class: "tm" }, `⏱ ${s.t[0]}–${s.t[1]} мин (${dur(s)} мин)`), h("span", { class: "mt" }, "Әдіс: " + k.method)),
    h("div", { class: "tp-grid" }, h("div", {}, h("b", {}, "Мұғалімнің әрекеті"), k.teacher), h("div", {}, h("b", {}, "Оқушының әрекеті"), k.student), h("div", {}, h("b", {}, "Бағалау"), k.assess), h("div", {}, h("b", {}, "Ресурстар"), k.res))));
});
function teachSet(on) { document.body.classList.toggle("teach", on); store.set("kkTeach", on); $("#gTeach").classList.toggle("on", on); $("#gTeachSt").textContent = on ? "Қосулы · басып өшіру" : "Өшірулі · басып қосу"; }
$("#gearBtn").onclick = () => { $("#gLiveSt").textContent = LIVE.on() ? "✅ Қосулы · " + (LIVE.teacher ? "мұғалім: " + LIVE.teacher : "жалпы бөлме") : "Өшірулі · баптау"; $("#gear").hidden = false; };
$("#gearClose").onclick = () => $("#gear").hidden = true;
$("#gTeach").onclick = () => { const on = !document.body.classList.contains("teach"); teachSet(on); toast(on ? "👩‍🏫 ҚМЖ панельдері мен құжаттар ашылды" : "🎓 Оқушы/қонақ режимі"); };
$$("#gear [data-g]").forEach(b => b.onclick = () => { $("#gear").hidden = true; go(b.dataset.g); });
$("#gLive").onclick = () => { $("#gear").hidden = true; $("#rtSettings").click(); };
$("#gClear").onclick = () => { $("#gear").hidden = true; $("#resetAll").click(); };
$("#gFit").onclick = () => { fitOn = !fitOn; store.set("kkFit", fitOn); $("#gFitSt").textContent = fitOn ? "Қосулы · басып өшіру" : "Өшірулі · басып қосу"; $("#gFit").classList.toggle("on", fitOn); fit(); };
setTimeout(() => { $("#gFitSt").textContent = fitOn ? "Қосулы · басып өшіру" : "Өшірулі · басып қосу"; $("#gFit").classList.toggle("on", fitOn); }, 0);
setTimeout(() => teachSet(store.get("kkTeach", false)), 0);
$("#sideToggle").onclick = () => document.body.classList.toggle("side-open");
$("#sideScrim").onclick = () => document.body.classList.remove("side-open");
addEventListener("keydown", e => { if (e.key === "Escape") document.body.classList.remove("side-open"); });
function go(id, push = true) {
  if (STUDENT && !SALLOW.includes(id)) id = MODE === "g" ? "wall" : "hub";
  if (!STUDENT && id === "hub") id = "home";
  const i = Math.max(0, ST.findIndex(s => s.id === id));
  cur = i; const s = ST[i];
  $$(".stage").forEach(x => x.classList.toggle("active", x.id === "st-" + s.id));
  $$(".si").forEach((x, k) => { x.classList.toggle("on", k === i); x.classList.toggle("done", k < i && ST[k].phase < 4); });
  $$(".ph").forEach(x => { const p = +x.dataset.p; const items = ST.filter(y => y.phase === p); const idx = items.findIndex(y => y.id === s.id);
    x.classList.toggle("on", p === s.phase); x.querySelector(".fill").style.transform = `scaleX(${p < s.phase && s.phase < 4 ? 1 : p === s.phase ? (idx + 1) / items.length : 0})`; });
  $("#pgLabel").textContent = `${i + 1}/${ST.length} · ${s.label}`;
  if (push) history.replaceState(null, "", "#" + s.id);
  scrollTo(0, 0); requestAnimationFrame(() => scrollTo(0, 0)); setTimeout(() => scrollTo(0, 0), 60);
  timerFor(s);
  if (s.id !== "video") $("#vid").pause();
  if (s.id === "witness") witRender();
  if (s.id === "time") tmSet(+$("#tmRange").value, true);
  document.body.classList.toggle("inviting", s.id === "invite");
  if (s.id === "rating") rtLoad();
  if (s.id === "wall") wallLoad();
  if (s.id === "hub") hubRender();
  if (!STUDENT && LIVE.on() && s.phase > 0 && s.phase < 4) { clearTimeout(go._t); go._t = setTimeout(() => LIVE.setStage(s.id).catch(() => {}), 300); }
  lrLoad();
  setTimeout(fit, 30); setTimeout(fit, 600);
}
$$("[data-go]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); go(b.dataset.go); }));
$("#prevBtn").onclick = () => go(ST[Math.max(0, cur - 1)].id);
$("#nextBtn").onclick = () => { const nx = ST[Math.min(ST.length - 1, cur + 1)]; if (nx.phase === 4 && !document.body.classList.contains("teach")) { toast("🏁 Сабақ соңы. Рахмет!"); confetti(); return; } go(nx.id); };
addEventListener("keydown", e => {
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") $("#nextBtn").click();
  if (e.key === "ArrowLeft" || e.key === "PageUp") $("#prevBtn").click();
});
addEventListener("hashchange", () => go(location.hash.slice(1), false));
$("#fsBtn").onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();

/* ---------- 45 минуттық сабақ сағаты ---------- */
let clkStart = store.get("kkClk", null), clkInt;
function clkDraw() {
  if (!clkStart) { $("#clkTime").textContent = "00:00"; $("#clkPlan").textContent = "45 мин · бастау үшін ▶"; $("#clkBar").style.width = "0"; return; }
  const sec = Math.floor((Date.now() - clkStart) / 1000), m = Math.floor(sec / 60);
  $("#clkTime").textContent = `${String(m).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  $("#clkBar").style.width = Math.min(100, sec / 2700 * 100) + "%";
  const plan = ST.find(s => dur(s) && m >= s.t[0] && m < s.t[1]);
  $("#clkPlan").textContent = plan ? `Жоспар: ${plan.ico} ${plan.label}` : m >= 45 ? "Сабақ аяқталды" : "";
  $$(".si").forEach((x, k) => x.classList.toggle("plan", ST[k] === plan));
  $("#clock").classList.toggle("late", !!plan && ST[cur].t[1] && ST[cur].t[1] < plan.t[0]);
}
$("#clkPlay").onclick = () => {
  if (clkStart) { if (!confirm("Сабақ сағатын қайта бастаймыз ба?")) return; clkStart = null; store.set("kkClk", null); $("#clkPlay").textContent = "▶"; clkDraw(); return; }
  clkStart = Date.now(); store.set("kkClk", clkStart); $("#clkPlay").textContent = "↺";
  newSession().then(n => toast(n ? `⏱ Сабақ басталды! Дайындықтағы ${n} оқушы тазаланды — енді қайта қосылады` : "⏱ Сабақ басталды! Сәттілік!"));
};
/* ---------- жаңа сабақ (сессия): бұрынғы оқушылар мен нәтижелер тазаланады ---------- */
const RESULT_KEYS = ["kkAI", "kkDuel", "kkEssay", "kkLvl", "kkLvlRes", "kkMe", "kkPB", "kkQuiz", "kkRefl", "kkRub", "kkScore", "kkTally", "kkWit", "kkNotes", "kkBoard"];
const wipeResults = () => RESULT_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
async function newSession() {
  let n = 0; wipeResults(); try { rtBonus = {}; } catch {}
  if (LIVE.on()) { try { n = await LIVE.count(); await LIVE.clear(); await LIVE.setSession("s" + Date.now().toString(36)); } catch { toast("⚠️ Firebase-ті тазалау мүмкін болмады"); } }
  joinTick(); return n;
}
/* ---------- тақтадағы «қосылған оқушылар» есептегіші ---------- */
let joinT = null;
async function joinTick() {
  clearTimeout(joinT); if (STUDENT) return;
  const box = $$(".join-n"); let txt = "—", tip = "Firebase қосылмаған: оқушылар саны тек тірі режимде көрінеді (⚙️ → 🛰️ Тірі рейтинг)";
  if (LIVE.on()) { try { txt = String(await LIVE.count()); tip = "Сабаққа QR арқылы қосылған оқушылар"; } catch { tip = "Байланыс жоқ"; } }
  box.forEach(b => { b.textContent = txt; b.closest("[data-join]").title = tip; b.closest("[data-join]").classList.toggle("off", !LIVE.on()); });
  joinT = setTimeout(joinTick, LIVE.on() ? 4000 : 20000);
}
if (clkStart) $("#clkPlay").textContent = "↺";
setInterval(clkDraw, 1000); clkDraw();

/* ---------- timer ---------- */
let tLeft = 0, tTotal = 0, tRun = false, tInt;
function timerFor(s) {
  clearInterval(tInt); tRun = false; $("#tPlay").textContent = "▶";
  if (!dur(s)) { $("#timer").hidden = true; return; }
  $("#timer").hidden = false; tTotal = tLeft = dur(s) * 60; drawTimer();
}
function drawTimer() {
  const m = Math.floor(Math.abs(tLeft) / 60), s = Math.abs(tLeft) % 60;
  $("#tTime").textContent = (tLeft < 0 ? "+" : "") + `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  $("#tRing").style.strokeDashoffset = 327 * (1 - Math.max(0, tLeft) / tTotal);
  $("#timer").classList.toggle("warn", tLeft <= 60 && tLeft > 0); $("#timer").classList.toggle("over", tLeft <= 0);
}
$("#tPlay").onclick = () => {
  tRun = !tRun; $("#tPlay").textContent = tRun ? "❚❚" : "▶";
  clearInterval(tInt); if (tRun) tInt = setInterval(() => { tLeft--; drawTimer(); if (tLeft === 0) timeUp(); }, 1000);
};
$("#tReset").onclick = () => timerFor(ST[cur]);
/* уақыт бітсе — келесі тапсырмаға автоматты өту */
let autoT = null;
function timeUp() {
  if (STUDENT) return;
  const nx = ST.slice(cur + 1).find(s => s.phase > 0 && s.phase < 4);
  if (!nx) { toast("⏰ Уақыт бітті! Сабақтың соңы 🎉"); confetti(); return; }
  let n = 5;
  const ov = h("div", { class: "autonext" }, h("div", { class: "an-in glass" }, h("div", { class: "an-t" }, "⏰ Уақыт бітті!"), h("div", { class: "an-n" }, String(n)), h("div", { class: "an-res", html: (() => { const box = $("#lr-" + ST[cur].id); if (!box || !LIVE.on()) return ""; return [...box.querySelectorAll("div:not(.lr-t)")].slice(0, 3).map(d => d.outerHTML).join(""); })() }), h("div", { class: "an-s" }, `Келесі: ${nx.ico} ${nx.label}`),
    h("div", { class: "row gap center" }, h("button", { class: "btn gold", onclick: () => { clearInterval(autoT); ov.remove(); go(nx.id); startStageTimer(); } }, "Қазір өту →"), h("button", { class: "btn glass", onclick: () => { clearInterval(autoT); ov.remove(); toast("Осы тапсырмада қаламыз"); } }, "Қалу"))));
  document.body.append(ov);
  autoT = setInterval(() => { n--; ov.querySelector(".an-n").textContent = n; if (n <= 0) { clearInterval(autoT); ov.remove(); go(nx.id); startStageTimer(); } }, 1000);
}
function startStageTimer() { if (!$("#timer").hidden && !tRun) $("#tPlay").click(); }

/* ---------- QR ---------- */
let qrN = 0;
function fancyQr(text) {
  const gid = "qg" + (++qrN);
  const q = qrcode(0, "H"); q.addData(text); q.make(); const n = q.getModuleCount(), m = 2, S = n + m * 2;
  const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const lo = Math.floor(n / 2 - n * .14), hi = Math.ceil(n / 2 + n * .14);
  let dots = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { if (!q.isDark(r, c) || finder(r, c) || (r >= lo && r < hi && c >= lo && c < hi)) continue; dots += `<circle cx="${c + m + .5}" cy="${r + m + .5}" r=".43"/>`; }
  const eye = (x, y) => `<rect x="${x + m + .5}" y="${y + m + .5}" width="6" height="6" rx="1.8" fill="none" stroke="#0B2545" stroke-width="1"/><rect x="${x + m + 2}" y="${y + m + 2}" width="3" height="3" rx=".9" fill="#E0A400"/>`;
  const cx = S / 2, R = n * .13;
  const rays = Array.from({ length: 16 }, (_, i) => `<rect x="${cx - .12}" y="${cx - R * .95}" width=".24" height="${R * .28}" rx=".1" fill="#E0A400" transform="rotate(${i * 22.5} ${cx} ${cx})"/>`).join("");
  return `<div class="qr-frame"><svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0089B5"/><stop offset="1" stop-color="#0B2545"/></linearGradient></defs><rect width="${S}" height="${S}" rx="2" fill="#fff"/><g fill="url(#${gid})">${dots}</g>${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}<circle cx="${cx}" cy="${cx}" r="${R}" fill="#00AFCA"/>${rays}<circle cx="${cx}" cy="${cx}" r="${R * .42}" fill="#FEC50C"/></svg><span class="qr-cap">📱 СКАНЕРЛЕ</span></div>`;
}
const baseUrl = (m = "s") => { const u = new URL(location.href); u.hash = ""; if (LIVE.on()) u.searchParams.set("db", LIVE.url); else u.searchParams.delete("db"); u.searchParams.set("m", m); return u.toString().replace(/#$/, ""); };
function fillQr(el, id, m = "s") { if (el) el.innerHTML = fancyQr(baseUrl(m) + "#" + id); }
function refreshQrs() { fillQr($("#qrCard"), "card"); fillQr($("#qrQuiz"), "quiz"); fillQr($("#qrInvite"), "hub"); fillQr($("#qrInviteFb"), "wall", "g"); fillQr($("#qrWall"), "wall", "g"); }
refreshQrs();
refreshQrs();
$("#qrBtn").onclick = () => { const s = ST[cur]; $("#qrTitle").textContent = `📱 ${s.ico} ${s.label} — телефонмен кір`; const qm = s.id === "wall" ? "g" : "s"; const qid = SALLOW.includes(s.id) ? s.id : "hub"; fillQr($("#qrBig"), qid, qm); $("#qrUrl").textContent = baseUrl(qm) + "#" + qid; $("#qrModal").hidden = false; };
$("#qrClose").onclick = () => $("#qrModal").hidden = true;

/* ---------- drawers ---------- */
$("#boardBtn").onclick = () => go("rating");
$("#boardClose").onclick = () => $("#board").hidden = true;
$("#myScoreBtn").onclick = () => { renderMyScore(); $("#mine").hidden = false; };
$("#mineClose").onclick = () => $("#mine").hidden = true;
$$(".drawer").forEach(d => d.addEventListener("click", e => { if (e.target === d) d.hidden = true; }));

/* ---------- team scoreboard ---------- */
function renderBoard() {
  const b = store.get("kkBoard", { em: 0, re: 0, in: 0 }); const max = Math.max(10, ...Object.values(b));
  const top = Math.max(...Object.values(b));
  $("#boardBody").innerHTML = "";
  DATA.groups.forEach(g => {
    const v = b[g.id] || 0;
    $("#boardBody").append(h("div", { class: "team" },
      h("div", { class: "nm" }, `${g.ico} ${g.name}`, v === top && v > 0 ? h("span", { class: "crown" }, " 👑") : null),
      h("div", { class: "bar" }, h("i", { style: `width:${v / max * 100}%;background:linear-gradient(90deg,${g.color},${g.color}bb)` })),
      h("div", { class: "pts" }, v),
      h("div", { class: "ctl" }, h("button", { class: "minus", onclick: () => bump(g.id, -1) }, "−"), h("button", { onclick: () => bump(g.id, 1) }, "+"))));
  });
}
function bump(id, d) { const b = store.get("kkBoard", { em: 0, re: 0, in: 0 }); b[id] = Math.max(0, (b[id] || 0) + d); store.set("kkBoard", b); renderBoard(); if (d > 0) confetti(40); }

/* ---------- goals ---------- */
DATA.criteria.forEach(([k, t]) => $("#critList").append(h("div", {}, h("b", {}, k), h("span", {}, t))));
ST.filter(s => dur(s)).forEach(s => $("#miniRoad").append(h("button", { onclick: () => go(s.id), style: `border-top:4px solid ${PC[s.phase]}` }, h("i", {}, s.ico), s.label, h("small", {}, `${s.t[0]}–${s.t[1]} мин`))));

/* ---------- 3D глобус ---------- */
const KZ = [[46.6,48.9],[47.3,47.7],[49.2,46.4],[51.9,47.0],[53.1,46.8],[53.2,45.3],[51.3,44.9],[50.3,44.4],[51.2,43.6],[52.6,42.0],[52.9,41.4],[55.9,41.3],[56.0,45.0],[58.6,45.6],[61.0,44.4],[62.0,43.5],[64.9,43.7],[66.1,42.9],[66.0,41.9],[68.0,40.8],[68.6,40.7],[69.3,41.4],[70.9,42.2],[71.2,42.8],[73.5,42.5],[74.2,43.2],[75.5,42.9],[78.5,42.8],[80.2,42.1],[80.3,43.0],[80.8,44.0],[80.4,45.1],[82.4,45.5],[83.0,47.2],[85.5,47.0],[85.7,48.5],[87.3,49.1],[86.8,49.8],[85.0,50.0],[83.4,51.0],[81.0,50.9],[80.0,50.8],[77.8,53.3],[76.5,54.2],[73.5,54.0],[73.4,53.4],[70.8,55.3],[69.0,55.4],[65.5,54.6],[61.4,54.0],[61.0,53.0],[61.7,52.9],[60.8,52.2],[61.6,51.3],[60.0,51.0],[58.6,51.0],[55.7,50.6],[54.6,51.0],[53.4,51.5],[50.8,51.6],[48.7,50.6],[48.6,49.9],[47.5,50.4]];
let heroG = null, tmG = null;
try { heroG = makeGlobe($("#heroGlobe"), { kz: KZ, mode: "mix", kz0: .715, dist: 3.3, lk: .0008, hideLabels: ["Украина", "Түрікменстан"], isActive: () => $("#st-home").classList.contains("active") }); } catch (e) { console.warn(e); }
try { tmG = makeGlobe($("#tmGlobe"), { kz: KZ, mode: "out", kz0: .4, dist: 2.6, lk: .0008, hideLabels: ["Түрікменстан"], innerWithIn: false, isActive: () => $("#st-time").classList.contains("active") }); } catch (e) { console.warn(e); }

/* ---------- 1. passport ---------- */
let ppCur = null, ppDeck = shuffle(DATA.characters.map((_, i) => i));
$("#ppNew").onclick = () => {
  if (!ppDeck.length) ppDeck = shuffle(DATA.characters.map((_, i) => i));
  ppCur = DATA.characters[ppDeck.pop()];
  const p = $("#passport"); p.classList.remove("flip"); void p.offsetWidth; p.classList.add("flip");
  setTimeout(() => {
    $("#ppAvatar").textContent = ppCur.ava; $("#ppName").textContent = ppCur.name; $("#ppAge").textContent = ppCur.age;
    $("#ppYear").textContent = ppCur.year; $("#ppRoute").textContent = `${ppCur.from} → ${ppCur.to}`; $("#ppStory").textContent = "«" + ppCur.story + "»";
    $("#ppNo").textContent = "№ " + (1000 + Math.floor(Math.random() * 9000));
    const st = $("#ppStamp"); st.className = "stamp"; st.textContent = "";
    $$(".btn.st").forEach(b => b.classList.remove("ok", "no")); $("#stFeedback").textContent = "";
  }, 330);
};
$$(".btn.st").forEach(b => b.onclick = () => {
  if (!ppCur) { toast("Алдымен құжат ал 🎲"); return; }
  const ok = b.dataset.st === ppCur.st, info = DATA.statusInfo[ppCur.st];
  $$(".btn.st").forEach(x => x.classList.remove("ok", "no"));
  if (ok) {
    b.classList.add("ok"); const st = $("#ppStamp"); st.className = "stamp " + ppCur.st; st.textContent = info.ico + " " + info.name.toUpperCase(); void st.offsetWidth; st.classList.add("show");
    $("#stFeedback").innerHTML = `✅ Дұрыс! ${info.why}<br><b>Сенің тобың: ${info.group}</b>`; confetti(60);
    const m = me(); if (!m) setTimeout(() => whoOpen(ppCur.st), 900); else if (!m.group) { m.group = ppCur.st; store.set("kkMe", m); whoLbl(); livePush(); }
  } else { b.classList.add("no"); $("#stFeedback").textContent = "🤔 Қайта ойлан: кейіпкер қайдан қайда көшті? Ел ішінде ме, шетелге ме, атажұртқа ма?"; }
});

/* ---------- generic drag & drop / tap ---------- */
function dnd(root, onChange) {
  let sel = null, drag = null, ghost = null, sx = 0, sy = 0;
  root.addEventListener("pointerdown", e => {
    const c = e.target.closest(".chip"); if (!c || !root.contains(c)) return;
    drag = c; sx = e.clientX; sy = e.clientY; c.setPointerCapture(e.pointerId);
  });
  root.addEventListener("pointermove", e => {
    if (!drag) return;
    if (!ghost && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) {
      const r = drag.getBoundingClientRect(); ghost = drag.cloneNode(true); ghost.classList.add("dragging"); ghost.style.width = r.width + "px";
      ghost._dx = sx - r.left; ghost._dy = sy - r.top; document.body.append(ghost); drag.style.opacity = .3;
    }
    if (ghost) {
      ghost.style.left = e.clientX - ghost._dx + "px"; ghost.style.top = e.clientY - ghost._dy + "px";
      $$(".hover", root).forEach(x => x.classList.remove("hover"));
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest(".drop"); el?.closest(".slot,.tl-slot")?.classList.add("hover");
    }
  });
  root.addEventListener("pointerup", e => {
    if (!drag) return;
    const c = drag; drag = null;
    if (ghost) {
      ghost.remove(); ghost = null; c.style.opacity = "";
      $$(".hover", root).forEach(x => x.classList.remove("hover"));
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest(".drop");
      if (el && root.contains(el)) place(c, el);
    } else {
      if (sel === c) { c.classList.remove("sel"); sel = null; }
      else { sel?.classList.remove("sel"); sel = c; c.classList.add("sel"); }
    }
  });
  root.addEventListener("click", e => {
    const d = e.target.closest(".drop"); if (!d || !sel || e.target.closest(".chip")) return;
    place(sel, d); sel.classList.remove("sel"); sel = null;
  });
  function place(c, d) {
    const from = c.parentElement;
    if (!d.classList.contains("bank")) { const ex = d.querySelector(".chip"); if (ex && ex !== c) from.append(ex); d.textContent = ""; }
    d.append(c);
    $$(".drop:not(.bank)", root).forEach(x => { if (!x.querySelector(".chip") && !x.textContent) x.textContent = x.dataset.ph || ""; });
    onChange && onChange();
  }
}

/* ---------- 3. terms ---------- */
function termsBuild() {
  const m = $("#termsMatch"); m.innerHTML = "";
  const bank = h("div", { class: "bank drop" });
  shuffle(DATA.terms).forEach(t => bank.append(h("div", { class: "chip", "data-id": t.t, style: `background:linear-gradient(135deg,${t.c},${t.c}cc)` }, t.t)));
  const slots = h("div", { class: "slots" });
  shuffle(DATA.terms).forEach(t => slots.append(h("div", { class: "slot", "data-ans": t.t }, h("div", { class: "drop", "data-ph": "Ұғымды осында әкел" }, "Ұғымды осында әкел"), h("div", { class: "def" }, t.d))));
  m.append(bank, slots); $("#termsScore").textContent = "";
}
termsBuild(); dnd($("#termsMatch"));
$("#termsCheck").onclick = () => {
  let ok = 0;
  $$("#termsMatch .slot").forEach(s => { const c = s.querySelector(".chip"); const good = c && c.dataset.id === s.dataset.ans; s.classList.toggle("ok", !!good); s.classList.toggle("no", !good); if (good) ok++; });
  $("#termsScore").textContent = `⭐ ${ok} / 5 балл`; setScore("terms", ok);
  if (ok === 5) { confetti(); toast("🎉 Тамаша! Барлығы дұрыс!"); } else toast(`${ok} дұрыс. Қызыл жолдарды қайта қара.`);
};
$("#termsReset").onclick = termsBuild;
$("#termsDesc").innerHTML = descTable(DATA.termsDesc.map(([d, p]) => [d, p, "К1"]));

function descTable(rows) { return `<table class="dtable"><tr><th>Дескриптор</th><th>Критерий</th><th>Балл</th></tr>${rows.map(([d, p, k]) => `<tr><td>${d}</td><td>${k}</td><td class="pt">${p}</td></tr>`).join("")}</table>`; }

/* ---------- 4. witnesses ---------- */
let witI = 0; let witState = store.get("kkWit", {}); // key "w-s" -> "err"/"fine"
const witTabs = $("#witTabs");
function witTabsRender() {
  witTabs.innerHTML = "";
  DATA.witnesses.forEach((w, i) => {
    const found = w.s.filter((s, k) => s.err && witState[`${i}-${k}`] === "err").length;
    witTabs.append(h("button", { class: "tab" + (i === witI ? " on" : ""), onclick: () => { witI = i; witRender(); } }, h("span", { class: "av" }, w.ava), `${w.name}`, h("span", { class: "cnt" }, `${found}/2`)));
  });
  const tot = Object.entries(witState).filter(([k, v]) => v === "err").length;
  $("#witScore").textContent = `🔎 Табылған қате: ${tot} / 6`; setScore("witness", tot);
  if (tot === 6 && !witRender.done) { witRender.done = true; confetti(); toast("🕵️ Барлық 6 қате табылды!"); }
}
let witTimer = [];
function witRender() {
  witTimer.forEach(clearTimeout); witTimer = [];
  witTabsRender();
  const w = DATA.witnesses[witI], chat = $("#witChat"); chat.innerHTML = "";
  chat.append(h("div", { class: "ai-label" }, "🤖 ЖИ жасаған ойдан шығарылған кейіпкер · " + w.role));
  chat.append(h("div", { class: "msg q" }, h("div", { class: "ava" }, "🧑‍🎓"), h("div", { class: "bubble" }, w.q)));
  const typing = h("div", { class: "msg a" }, h("div", { class: "ava" }, w.ava), h("div", { class: "bubble" }, h("span", { class: "typing" }, h("i"), h("i"), h("i"))));
  chat.append(typing);
  witTimer.push(setTimeout(() => {
    typing.remove();
    const bub = h("div", { class: "bubble" });
    w.s.forEach((s, k) => {
      const key = `${witI}-${k}`, span = h("span", { class: "sent" }, s.x + " ");
      const fixBox = h("span", {});
      const show = st => {
        span.classList.toggle("err", st === "err"); span.classList.toggle("fine", st === "fine");
        fixBox.innerHTML = st === "err" ? `<span class="fix bad">❌ ${s.fix}<br><small>📖 ${s.src}</small></span>` : st === "fine" ? `<span class="fix good">✅ Бұл дерек дұрыс.</span>` : "";
      };
      if (witState[key]) show(witState[key]);
      span.onclick = () => {
        if (witState[key]) return;
        witState[key] = s.err ? "err" : "fine"; store.set("kkWit", witState); show(witState[key]);
        if (s.err) { toast("🎯 Қате табылды! +1 балл"); confetti(30); } else toast("Бұл сөйлем дұрыс екен — басқасын тексер");
        witTabsRender();
      };
      bub.append(span, fixBox);
    });
    chat.append(h("div", { class: "msg a" }, h("div", { class: "ava" }, w.ava), bub));
  }, 1100));
}
$("#witReset").onclick = () => { witState = {}; store.set("kkWit", {}); witRender.done = false; witRender(); };
$("#witDesc").innerHTML = `<table class="dtable"><tr><th>Дескриптор</th><th>Критерий</th><th>Балл</th></tr>${DATA.witDesc.map(([d, k], i) => `<tr><td>${d}</td><td>${k}</td><td class="pt">${i === 0 ? "6" : "—"}</td></tr>`).join("")}</table><p class="muted small">Әр табылған қате — 1 балл (барлығы 6). Қате басылған дұрыс сөйлем балл азайтпайды.</p>`;

/* ---------- 5. prompt workshop ---------- */
let gI = 0; const pbState = store.get("kkPB", {});
function grpRender() {
  const g = DATA.groups[gI];
  $("#grpTabs").innerHTML = "";
  DATA.groups.forEach((x, i) => $("#grpTabs").append(h("button", { class: "tab" + (i === gI ? " on" : ""), onclick: () => { gI = i; grpRender(); } }, h("span", { class: "av" }, x.ico), x.name)));
  $("#grpTask").innerHTML = "";
  $("#grpTask").append(
    h("div", { class: "task-hero" }, h("div", { class: "big-ico", style: `color:${g.color}` }, g.ico), h("div", {}, h("div", { class: "kicker", style: `color:${g.color}` }, g.name), h("h3", { style: "margin-top:8px" }, g.title))),
    h("ol", { class: "task-list" }, g.tasks.map(t => h("li", {}, t))),
    h("div", { class: "out-shape" }, "🎯 " + g.shape)
  );
  const pb = $("#pb"); pb.innerHTML = "";
  const st = pbState[g.id] || { ...g.pb };
  DATA.pbFields.forEach(([k, n, c]) => {
    const inp = h("input", { value: st[k] || "", placeholder: g.pb[k] });
    inp.oninput = () => { st[k] = inp.value; pbState[g.id] = st; store.set("kkPB", pbState); pOut(); };
    pb.append(h("label", {}, h("b", { style: `background:${c}` }, n), inp));
  });
  function pOut() { $("#pOut").textContent = DATA.pbFields.map(([k, n]) => `${n}: ${st[k] || "…"}`).join("\n"); }
  pOut();
  rubricRender();
}
$("#pCopy").onclick = () => { navigator.clipboard?.writeText($("#pOut").textContent).then(() => toast("📋 Промпт көшірілді — Gemini-ге қой!"), () => toast("Көшіру мүмкін болмады — қолмен белгіле")); };
const aiChk = store.get("kkAI", {});
DATA.aiChecks.forEach((c, i) => {
  const el = h("div", { class: "check" + (aiChk[i] ? " on" : "") }, h("span", { class: "box" }, "✓"), h("span", {}, c));
  el.onclick = () => { aiChk[i] = !aiChk[i]; store.set("kkAI", aiChk); el.classList.toggle("on", aiChk[i]); };
  $("#aiChecks").append(el);
});
const rub = store.get("kkRub", {});
function rubricRender() {
  const g = DATA.groups[gI]; rub[g.id] = rub[g.id] || {};
  $("#grpRubric").innerHTML = "";
  DATA.grpRubric.forEach(([d, p], i) => {
    const el = h("div", { class: "check" + (rub[g.id][i] ? " on" : "") }, h("span", { class: "box" }, "✓"), h("span", {}, d), h("span", { class: "pt" }, "+" + p));
    el.onclick = () => { rub[g.id][i] = !rub[g.id][i]; store.set("kkRub", rub); rubricRender(); };
    $("#grpRubric").append(el);
  });
  const sc = Object.values(rub[g.id]).filter(Boolean).length;
  $("#grpScore").textContent = `${g.ico} ${sc} / 5`;
}
$("#grpAdd").onclick = () => {
  const g = DATA.groups[gI], sc = Object.values(rub[g.id] || {}).filter(Boolean).length;
  if (!sc) { toast("Алдымен дескрипторларды белгіле"); return; }
  bump(g.id, sc); setScore("group", sc); toast(`🏆 ${g.name}: +${sc} балл`); renderBoard(); $("#board").hidden = false;
};
grpRender();

/* timeline */
function tlBuild() {
  const tl = $("#tl"); tl.innerHTML = ""; $("#tlScore").textContent = "";
  const bank = h("div", { class: "tl-bank drop bank" });
  shuffle(DATA.timeline).forEach(e => bank.append(h("div", { class: "chip", "data-y": e.y, "data-t": e.t, style: "background:linear-gradient(135deg,#152042,#2c3d73)" }, e.t)));
  const row = h("div", { class: "timeline" });
  DATA.timeline.forEach((e, i) => row.append(h("div", { class: "tl-slot", "data-y": e.y }, h("div", { class: "n" }, i + 1), h("div", { class: "drop", "data-ph": "" }))));
  tl.append(bank, row);
}
tlBuild(); dnd($("#tl"));
$("#tlShuffle").onclick = tlBuild;
$("#tlCheck").onclick = () => {
  let ok = 0;
  $$("#tl .tl-slot").forEach(s => { const c = s.querySelector(".chip"); const g = c && c.dataset.y === s.dataset.y; s.classList.toggle("ok", !!g); s.classList.toggle("no", !g); if (g) { ok++; c.innerHTML = `<b>${s.dataset.y}</b>${c.dataset.t}`; } });
  $("#tlScore").textContent = `🛤️ ${ok} / 7`;
  if (ok === 7) { confetti(); toast("🐪 Көш жолы дұрыс құрылды!"); }
};

/* ---------- 6. levels ---------- */
let lvl = store.get("kkLvl", null); const lvlRes = store.get("kkLvlRes", {});
DATA.levels.forEach(l => $("#lvlPick").append(h("button", { class: "lv", "data-l": l.id, onclick: () => { lvl = l.id; store.set("kkLvl", lvl); lvlRender(); } }, h("div", { class: "badge", style: `color:${l.color}` }, l.badge), h("b", {}, l.name), h("small", {}, l.sub))));
function lvlSave(v) { lvlRes[lvl] = v; store.set("kkLvlRes", lvlRes); setScore("levels", Math.max(...Object.values(lvlRes))); }
function lvlRender() {
  $$(".lv").forEach(b => b.classList.toggle("on", b.dataset.l === lvl));
  const body = $("#lvlBody"); body.innerHTML = "";
  if (!lvl) { body.append(h("p", { class: "lead" }, "👆 Жоғарыдан деңгейіңді таңда.")); return; }
  const L = DATA.levels.find(l => l.id === lvl);
  body.append(h("h3", {}, `${L.badge} деңгейі · ${L.name}`));
  if (lvl === "A") {
    const picks = {};
    DATA.levelA.forEach((q, i) => body.append(h("div", { class: "q-item" }, h("p", {}, `${i + 1}. ${q.q}`), h("div", { class: "opts" }, q.o.map((o, k) => h("button", { class: "opt", "data-q": i, "data-k": k, onclick: e => { picks[i] = k; $$(`.opt[data-q="${i}"]`, body).forEach(b => b.classList.toggle("pick", +b.dataset.k === k)); } }, o))))));
    body.append(h("button", { class: "btn primary", onclick: () => {
      let ok = 0; DATA.levelA.forEach((q, i) => $$(`.opt[data-q="${i}"]`, body).forEach(b => { const k = +b.dataset.k; b.classList.remove("ok", "no"); if (k === q.a) b.classList.add("ok"); else if (picks[i] === k) b.classList.add("no"); }));
      DATA.levelA.forEach((q, i) => { if (picks[i] === q.a) ok++; });
      lvlSave(ok); toast(`⭐ ${ok} / 4 балл`); if (ok === 4) confetti();
    } }, "Тексеру"));
  }
  if (lvl === "B") {
    const B = DATA.levelB;
    B.causes.forEach((c, i) => {
      const sel = h("select", { "data-i": i }, h("option", { value: "" }, "— салдарын таңда —"), B.effects.map((e, k) => h("option", { value: k }, e)));
      body.append(h("div", { class: "ce" }, h("div", { class: "cause" }, c.c), h("div", { class: "arrow" }, "→"), sel));
    });
    body.append(h("button", { class: "btn primary", onclick: () => {
      let ok = 0; $$(".ce", body).forEach((row, i) => { const v = row.querySelector("select").value; const g = v !== "" && +v === B.causes[i].a; row.classList.toggle("ok", g); row.classList.toggle("no", !g); if (g) ok++; });
      lvlSave(ok); toast(`⭐ ${ok} / 4 балл`); if (ok === 4) confetti();
    } }, "Тексеру"));
  }
  if (lvl === "C") {
    const C = DATA.levelC, saved = store.get("kkEssay", "");
    const ta = h("textarea", { class: "answer", placeholder: "1-дәлел: ...\n2-дәлел: ...\n3-дәлел: ...\nҚорытынды: ..." }); ta.value = saved;
    ta.oninput = () => { store.set("kkEssay", ta.value); clearTimeout(ta._t); ta._t = setTimeout(livePush, 1500); };
    body.append(h("p", { class: "lead" }, C.q), ta, h("h3", { class: "mt" }, "✅ Өзіңді тексер (дескрипторлар)"));
    const ch = {}; const box = h("div", { class: "checks" });
    C.desc.forEach(([d, p], i) => { const el = h("div", { class: "check" }, h("span", { class: "box" }, "✓"), h("span", {}, d), h("span", { class: "pt" }, "+" + p)); el.onclick = () => { ch[i] = !ch[i]; el.classList.toggle("on", ch[i]); lvlSave(Object.values(ch).filter(Boolean).length); }; box.append(el); });
    body.append(box, h("details", { class: "hint" }, h("summary", {}, "💡 Көмек керек пе?"), h("p", {}, C.hint)));
  }
  if (lvl === "E") {
    let sel = null, ok = 0; const done = new Set();
    const grid = h("div", { class: "emo-grid" }), words = h("div", { class: "word-row" });
    shuffle(DATA.levelE).forEach(it => { const b = h("button", { class: "emo" }, it.e, h("small", {}, it.s)); b.onclick = () => { if (done.has(it.w)) return; $$(".emo", grid).forEach(x => x.classList.remove("sel")); sel = { it, b }; b.classList.add("sel"); }; grid.append(b); });
    shuffle(DATA.levelE).forEach(it => { const w = h("button", { class: "word" }, it.w); w.onclick = () => {
      if (!sel) { toast("Алдымен суретті таңда 👆"); return; }
      if (sel.it.w === it.w) { sel.b.classList.remove("sel"); sel.b.classList.add("ok"); w.classList.add("used"); done.add(it.w); ok++; lvlSave(ok); confetti(25); sel = null; if (ok === 4) toast("🌟 Керемет! Барлығы дұрыс!"); }
      else { toast("Тағы бір рет байқап көр 🙂"); }
    }; words.append(w); });
    body.append(h("p", { class: "lead" }, "Суретті бас, сосын оған сәйкес сөзді бас."), grid, words);
  }
}
lvlRender();

/* ---------- 7. quiz ---------- */
let qi = 0, qok = 0, qAns = [];
function quizRender() {
  const box = $("#quizBox"); box.innerHTML = "";
  if (qi >= DATA.quiz.length) {
    const L = DATA.quizLevels.find(l => qok >= l.min);
    store.set("kkQuiz", { ok: qok, lvl: L.name }); setScore("quiz", qok); renderMyScore();
    const wrong = DATA.quiz.map((q, i) => qAns[i] !== q.a ? `<li>${q.q} — <b>${q.o[q.a]}</b>. ${q.e}</li>` : "").join("");
    box.append(h("div", { class: "result" },
      h("div", { class: "ring", style: `background:conic-gradient(${L.color} ${qok * 36}deg,#e2ecf8 0)` }, h("div", { style: "width:130px;height:130px;border-radius:50%;background:#fff;display:grid;place-items:center" }, `${qok}/10`)),
      h("div", { class: "qz-round" }, "Сенің деңгейің"), h("div", { class: "lvl", style: `color:${L.color}` }, `${L.ico} ${L.name}`), h("p", { class: "lead", style: "margin:0 auto" }, L.fb)));
    if (wrong) box.append(h("details", { class: "hint" }, h("summary", {}, "📖 Қателерім және түсініктеме"), h("ul", { html: wrong })));
    box.append(h("div", { class: "row center mt" }, h("button", { class: "btn glass", onclick: () => { qi = 0; qok = 0; qAns = []; quizRender.r2 = false; quizRender(); } }, "↺ Қайта өту")));
    if (qok >= 9) confetti(200);
    return;
  }
  const q = DATA.quiz[qi];
  if (qi === 5 && !quizRender.r2) { quizRender.r2 = true; box.append(h("div", { class: "result" }, h("div", { class: "lvl" }, "⚡ 2-раунд"), h("p", { class: "lead", style: "margin:0 auto 16px" }, `1-раунд: ${qok}/5. Енді — қолдану және талдау сұрақтары!`), h("button", { class: "btn primary big", onclick: quizRender }, "Бастау →"))); return; }
  const keys = ["A", "B", "C", "D"], cols = ["#1e8cf0", "#0fb5a3", "#f78c14", "#5b5bd6"];
  box.append(h("div", { class: "qz-top" }, h("span", { class: "qz-round" }, `${q.r}-раунд · ${qi + 1}/10 сұрақ`), h("span", { class: "score-badge" }, `✅ ${qok}`)),
    h("div", { class: "qz-bar" }, h("i", { style: `width:${qi * 10}%` })), h("p", { class: "qz-q" }, q.q));
  const opts = h("div", { class: "qz-opts" });
  q.o.forEach((o, k) => opts.append(h("button", { class: "qz-opt", onclick: e => {
    if (opts.dataset.done) return; opts.dataset.done = 1; qAns[qi] = k;
    const btns = $$(".qz-opt", opts); btns[q.a].classList.add("ok"); if (k !== q.a) btns[k].classList.add("no"); else { qok++; confetti(25); }
    box.append(h("div", { class: "qz-exp" }, (k === q.a ? "✅ Дұрыс! " : "❌ Дұрыс жауап: " + q.o[q.a] + ". ") + q.e),
      h("div", { class: "row mt" }, h("button", { class: "btn primary", onclick: () => { qi++; quizRender(); } }, qi === 9 ? "Нәтижені көру →" : "Келесі →")));
  } }, h("span", { class: "k", style: `background:${cols[k]}` }, keys[k]), o)));
  box.append(opts);
}
quizRender();
const tally = store.get("kkTally", { "Жоғары": 0, "Орта": 0, "Бастапқы": 0 });
function tallyRender() {
  const tot = Math.max(1, Object.values(tally).reduce((a, b) => a + b, 0));
  $("#tally").innerHTML = "";
  DATA.quizLevels.forEach(L => $("#tally").append(h("div", { class: "tl-row" }, h("span", {}, `${L.ico} ${L.name}`), h("div", { class: "bar" }, h("i", { style: `width:${tally[L.name] / tot * 100}%;background:${L.color}` })), h("b", {}, tally[L.name]),
    h("button", { onclick: () => { tally[L.name]++; store.set("kkTally", tally); tallyRender(); } }, "+"))));
}
tallyRender();

/* ---------- 8. reflection ---------- */
const refl = store.get("kkRefl", [0, 0, 0, 0]);
function reflRender() {
  $("#refl").innerHTML = "";
  DATA.reflect.forEach((r, i) => $("#refl").append(h("button", { class: "st-card", onclick: () => { refl[i]++; store.set("kkRefl", refl); reflRender(); confetti(20); } },
    h("div", { class: "flag" }, r.ico), h("b", {}, r.t), h("small", { class: "muted" }, r.s), h("div", { class: "cnt" }, refl[i]),
    h("div", { class: "stickers" }, Array.from({ length: Math.min(refl[i], 24) }, () => h("span", {}, r.st))))));
}
reflRender();

/* ---------- assessment table ---------- */
(() => {
  const rows = [
    ["Ұғымды тап", "Жеке", "К1", DATA.termsDesc.map(d => d[0]), 5],
    ["ЖИ-куәгерлер: қатені тап", "Жұп", "К4", ["ЖИ мәтініндегі әр қатені табады (6 қате)", "Қатені оқулық/ресми дерекпен дәлелдейді"], 6],
    ["Промпт шеберханасы", "Топ", "К3, К4", DATA.grpRubric.map(d => d[0]), 5],
    ["Сараланған тапсырма (A/B/C/ЕБҚ)", "Жеке", "К1, К2", ["A: 4 сұраққа дұрыс жауап береді", "B: 4 себепті салдарымен байланыстырады", "C: " + DATA.levelC.desc.map(d => d[0].toLowerCase()).join("; "), "ЕБҚ: 4 суретті ұғыммен сәйкестендіреді"], 4],
    ["Дерек дуэлі", "Жұп", "К4", ["Оқулық пен 2026 жылғы ресми деректі салыстырады", "Өзгерісті дұрыс болжайды (әр карточка — 1 ұпай)"], 6],
    ["Квиз (2 раунд)", "Жеке", "К1–К4", ["10 сұраққа жауап береді (әр дұрыс жауап — 1 ұпай)", "Жүйе деңгейді (жоғары/орта/бастапқы) өзі анықтайды"], 10]
  ];
  $("#assessTable").innerHTML = `<table class="dtable"><tr><th>Тапсырма</th><th>Түрі</th><th>Критерий</th><th>Дескрипторлар</th><th>Балл</th></tr>${rows.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><ul style="margin:0;padding-left:18px">${r[3].map(x => `<li>${x}</li>`).join("")}</ul></td><td class="pt">${r[4]}</td></tr>`).join("")}<tr><td colspan="4"><b>Барлығы</b> · «2 жұлдыз, 1 тілек», өзара бағалау, өзін-өзі бағалау</td><td class="pt">36</td></tr></table>
  <h3 class="mt">Формативтік бағалау: ұпай → 1–10 балл</h3><table class="dtable"><tr><th>Ұпай (36-дан)</th><th>Пайыз</th><th>Балл</th><th>Деңгей</th></tr>${[10,9,8,7,6,5,4,3,2,1].map(b => { const lo = b === 1 ? 0 : b * 10 - 5, hi = b === 10 ? 100 : b * 10 + 4; const lv = DATA.grades.find(g => lo >= g.min) || DATA.grades[DATA.grades.length - 1]; return `<tr><td>${Math.ceil(lo / 100 * MAXP)}–${Math.floor(hi / 100 * MAXP)}</td><td>${lo}–${hi}%</td><td class="pt">${b}</td><td>${lv.ico} ${lv.name}</td></tr>`; }).join("")}</table>
  <p class="muted small">Деңгейлер: Жоғары — 85% және одан жоғары, Орта — 50%-дан бастап, Қолдау қажет — 50%-дан төмен. Мұғалім сабақтағы белсенділікті ескеріп, балды түзете алады.</p>`;
})();
$("#resetAll").onclick = () => { if (!confirm("Барлық балл мен нәтиже осы құрылғыдан өшіріледі. Жалғастырамыз ба?")) return; Object.keys(localStorage).filter(k => k.startsWith("kk")).forEach(k => localStorage.removeItem(k)); location.reload(); };


/* ---------- Уақыт машинасы ---------- */
const TMD = DATA.timeMachine; let tmIdx = 0, tmPlayT = null;
$("#tmRange").max = TMD.length - 1;
TMD.forEach((d, i) => $("#tmTicks").append(h("button", { onclick: () => tmSet(i) }, d.y)));
const modeInfo = { start: ["🏁 Тәуелсіздік басы", "#152042"], out: ["✈️ Көшіп кету кезеңі", "#1e8cf0"], in: ["🏡 Қандастардың оралуы", "#f78c14"] };
TMD.forEach((d, i) => $("#tmChrono").append(h("button", { class: "ch", "data-i": i, style: `--c:${modeInfo[d.mode][1]}`, onclick: () => tmSet(i) },
  h("span", { class: "md" }, modeInfo[d.mode][0].split(" ")[0]), h("b", {}, d.y), d.ev, h("small", {}, "📖 " + d.src))));
function lastVal(i, key) { for (let k = i; k >= 0; k--) if (TMD[k][key] != null) return [TMD[k][key], TMD[k].y]; return [null, null]; }
function tmSet(i, quiet) {
  tmIdx = i; $("#tmRange").value = i; const d = TMD[i];
  $("#tmYear").textContent = d.y;
  const [pop, py] = lastVal(i, "pop"), [kz, ky] = lastVal(i, "kz"), [kd, kdy] = lastVal(i, "kd");
  const setK = (el, v, yEl, y) => { if ($(el).textContent !== v) { $(el).textContent = v; $(el).parentElement.classList.remove("flash"); void $(el).offsetWidth; $(el).parentElement.classList.add("flash"); } $(yEl).textContent = y ? (y === d.y ? "дерек: " + d.y + " ж." : "соңғы дерек: " + y + " ж.") : "ресми жиынтық дерек жоқ"; };
  setK("#tmPop", pop || "—", "#tmPopY", py); setK("#tmKz", kz != null ? String(kz).replace(".", ",") + "%" : "—", "#tmKzY", ky); setK("#tmKd", kd || "—", "#tmKdY", kdy);
  $("#tmKzBar").style.width = (kz || 40) + "%";
  $("#tmEv").innerHTML = `<b>${d.y}</b> · ${d.ev}<small>📖 ${d.src}</small>`;
  if (window.SCENES && $("#scHolder").dataset.y != d.y) { $("#scHolder").dataset.y = d.y; $("#scHolder").innerHTML = SCENES.draw(d.y); $("#scCap").innerHTML = `<b>${d.y}</b> · ${d.ev}<small>📖 ${d.src}</small>`; }
  const mi = modeInfo[d.mode]; $("#tmMode").textContent = mi[0]; $("#tmMode").style.color = mi[1];
  $$("#tmTicks button").forEach((b, k) => b.classList.toggle("on", k === i));
  $$("#tmChrono .ch").forEach((b, k) => { b.classList.toggle("on", k === i); b.classList.toggle("past", k < i); });
  const on = $(`#tmChrono .ch[data-i="${i}"]`); if (on) $("#tmChrono").scrollTo({ left: on.offsetLeft - $("#tmChrono").clientWidth / 2 + on.clientWidth / 2, behavior: "smooth" });
  if (tmG) { tmG.setMode(d.mode === "start" ? "mix" : d.mode === "in" && d.y >= 2008 ? "in" : d.mode); tmG.setShare((kz || 40) / 100); }
}
$("#tmRange").oninput = e => tmSet(+e.target.value);
$("#tmPlay").onclick = () => {
  if (tmPlayT) { clearInterval(tmPlayT); tmPlayT = null; $("#tmPlay").textContent = "▶ Саяхат"; return; }
  if (tmIdx >= TMD.length - 1) tmSet(0);
  $("#tmPlay").textContent = "❚❚ Тоқтату";
  tmPlayT = setInterval(() => { if (tmIdx >= TMD.length - 1) { clearInterval(tmPlayT); tmPlayT = null; $("#tmPlay").textContent = "▶ Қайта"; confetti(80); return; } tmSet(tmIdx + 1); }, 2600);
};
tmSet(0, true);
$("#tmDesc").innerHTML = descTable([["Жылдар бойынша халық санының өзгерісін атайды", "ауызша", "К2"], ["Көшіп кету (1991–2003) мен оралу кезеңдерінің себебін түсіндіреді", "ауызша", "К2"], ["Оқиғаны заң немесе бағдарламамен байланыстырады", "ауызша", "К3"]]);

/* ---------- Дерек дуэлі ---------- */
let duelSt = store.get("kkDuel", {});
function duelRender() {
  const g = $("#duelGrid"); g.innerHTML = "";
  DATA.duel.forEach((d, i) => {
    const st = duelSt[i];
    const card = h("div", { class: "dcard tilt" + (st ? " flip" : "") });
    const opts = h("div", { class: "dc-opts" }, DATA.duelOpts.map(([k, n]) => h("button", { onclick: () => { duelSt[i] = k; store.set("kkDuel", duelSt); card.classList.add("flip"); if (k === d.a) { confetti(40); toast("🎯 Болжам дұрыс!"); } duelScore(); setTimeout(duelRender, 820); } }, n)));
    const ok = st === d.a, verdict = DATA.duelOpts.find(o => o[0] === d.a)[1];
    card.append(h("div", { class: "dc-in" },
      h("div", { class: "dc-face dc-front" }, h("span", { class: "vs" }, "VS"), h("div", { class: "dc-topic" }, `${i + 1}. ${d.topic}`),
        h("div", { class: "dc-book" }, h("small", {}, "📖 Оқулықта (2020)"), h("b", {}, d.book), h("i", {}, d.bookSrc)), h("div", { class: "dc-q" }, "Бүгін қалай? Болжа:"), opts),
      h("div", { class: "dc-face dc-back" }, h("div", { class: "dc-topic" }, d.topic),
        h("div", { class: "dc-now" }, h("small", {}, "🛰️ Қазір (2026, ресми)"), h("b", {}, d.now), h("i", {}, d.nowSrc)),
        h("div", { class: "dc-verdict" }, (st ? (ok ? "✅ Болжамың дұрыс · " : "❌ Шын мәнінде: ") : "") + verdict),
        h("div", { class: "dc-why" }, d.why),
        h("button", { class: "again", onclick: e => { e.stopPropagation(); card.classList.toggle("flip"); } }, "↻ Оқулыққа қайту"))));
    g.append(card);
  });
  tiltInit();
}
function duelScore() { const n = DATA.duel.filter((d, i) => duelSt[i] === d.a).length; $("#duelScore").textContent = `🎯 Дұрыс болжам: ${n} / ${DATA.duel.length}`; if (Object.keys(duelSt).length) setScore("duel", n); }
$("#duelReset").onclick = () => { duelSt = {}; store.set("kkDuel", {}); duelRender(); duelScore(); };
duelRender(); duelScore();
$("#duelDesc").innerHTML = descTable([["Оқулықтағы дерек пен ресми дерекді салыстырады", "болжам", "К4"], ["Айырмашылықтың себебін түсіндіреді (уақыт, дереккөз)", "ауызша", "К4"], ["Дереккөзді атайды (оқулық беті, министрлік, ҰСБ)", "ауызша", "К4"]]);

/* ---------- ҚМЖ құжаты ---------- */
(() => {
  const head = DATA.kmjHead.map(([k, v]) => `<tr><td class="k">${k}</td><td>${v}</td></tr>`).join("");
  let rows = "";
  [1, 2, 3].forEach(p => {
    const items = ST.filter(s => s.phase === p);
    rows += `<tr class="ph-row" style="--c:${PC[p]}"><td colspan="5">${PN[p]} · ${items[0].t[0]}–${items[items.length - 1].t[1]} мин</td></tr>`;
    items.forEach(s => { const k = DATA.kmj[s.id]; rows += `<tr><td><b>${s.ico} ${s.label}</b><br><small>${s.t[0]}–${s.t[1]} мин</small><br><small><i>${k.method}</i></small></td><td>${k.teacher}</td><td>${k.student}</td><td>${k.assess}</td><td>${k.res}</td></tr>`; });
  });
  const foot = DATA.kmjFoot.map(([k, v]) => `<tr><td class="k">${k}</td><td>${v}</td></tr>`).join("");
  $("#kmjDoc").innerHTML = `<table>${head}</table><h3>Сабақтың барысы</h3><table><tr><th>Кезең / уақыт</th><th>Педагогтің әрекеті</th><th>Оқушының әрекеті</th><th>Бағалау</th><th>Ресурстар</th></tr>${rows}</table><h3>Қосымша</h3><table>${foot}</table>`;
})();
addEventListener("beforeprint", () => document.body.classList.toggle("print-kmj", ST[cur].id === "kmj"));

/* ---------- 3D tilt ---------- */
function tiltInit() {
  $$(".tilt").forEach(el => { if (el._tilt) return; el._tilt = 1;
    el.addEventListener("pointermove", e => { if (e.pointerType !== "mouse") return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`; });
    el.addEventListener("pointerleave", () => el.style.transform = ""); });
}
$("#passport").classList.add("tilt"); $$(".lv, .st-card").forEach(e => e.classList.add("tilt")); tiltInit();


/* ---------- күн, қыран ---------- */
function sunSvg(el, rays = 32) {
  if (!el) return;
  el.innerHTML = `<defs><radialGradient id="sg${el.id}"><stop offset="0" stop-color="#fff3b0"/><stop offset=".6" stop-color="#FEC50C"/><stop offset="1" stop-color="#E0A400"/></radialGradient></defs>
  <g class="rays">${Array.from({ length: rays }, (_, i) => `<path d="M-5 -50 L0 ${i % 2 ? -88 : -104} L5 -50Z" fill="#FEC50C" transform="rotate(${i * 360 / rays})"/>`).join("")}</g><circle r="44" fill="url(#sg${el.id})"/>`;
}
sunSvg($("#bgSun")); sunSvg($("#invSun"));
$("#eaglePath")?.setAttribute("d", "M200 70 C185 60 170 52 150 50 C120 46 90 40 60 26 C40 17 20 12 0 14 C30 22 55 34 75 46 C95 58 120 66 150 70 C165 72 178 76 186 82 L192 100 L200 116 L208 100 L214 82 C222 76 235 72 250 70 C280 66 305 58 325 46 C345 34 370 22 400 14 C380 12 360 17 340 26 C310 40 280 46 250 50 C230 52 215 60 200 70Z M200 52 a10 10 0 1 1 0.1 0Z");

/* ---------- оқушы кім? ---------- */
let whoG = null;
function whoLbl() { const m = me(); $("#whoLbl").textContent = m ? m.name.split(" ")[0] + (m.group ? " " + DATA.statusInfo[m.group].ico : "") : "Кіру"; }
function whoOpen(g) {
  const m = me(); whoG = g || m?.group || null; $("#whoName").value = m?.name || "";
  $("#whoGroups").innerHTML = "";
  Object.entries(DATA.statusInfo).forEach(([k, v]) => $("#whoGroups").append(h("button", { class: whoG === k ? "on" : "", onclick: e => { whoG = k; $$("#whoGroups button").forEach(b => b.classList.remove("on")); e.currentTarget.classList.add("on"); } }, v.ico + " " + v.group.split(" · ")[1])));
  $("#who").hidden = false; setTimeout(() => $("#whoName").focus(), 50);
}
$("#whoBtn").onclick = () => whoOpen();
$("#whoOk").onclick = () => {
  const name = $("#whoName").value.trim(); if (name.length < 2) { toast("Атыңды жаз ✍️"); return; }
  const old = me(); store.set("kkMe", { id: old?.id || ("s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)), name, group: whoG, ts: old?.ts || Date.now() });
  $("#who").hidden = true; whoLbl(); livePush(); if (ST[cur].id === "hub") hubRender(); toast(`Сәлем, ${name.split(" ")[0]}! 🌞`);
};
whoLbl();

/* ---------- тірі рейтинг ---------- */
let rtTimer = null, rtBonus = {}, rtLast = [];
$("#rtExcel").onclick = () => {
  if (!rtLast.length) { toast("Әзірге нәтиже жоқ"); return; }
  const q = v => { v = String(v ?? ""); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const head = ["№", "Оқушы", "Топ", ...Object.values(SCORE_KEYS).map(v => `${v[0]} (${v[1]})`), `Барлығы (${MAXP})`, "%", "Балл (1–10)", "Деңгей"];
  const rows = rtLast.map((s, i) => { const t = s.total || 0, G = gradeOf(t); return [i + 1, s.name || "", DATA.statusInfo[s.group]?.group || "", ...Object.keys(SCORE_KEYS).map(k => (s.scores || {})[k] ?? ""), t, G.p, G.mark, G.name]; });
  const info = [["Пән: Қазақстан тарихы · 11 «А» · «ҚР көші-қон саясаты»"], ["Күні: " + new Date().toLocaleDateString("kk-KZ") + " · Оқушылар саны: " + rtLast.length], []];
  const csv = "\uFEFF" + [...info, head, ...rows].map(r => r.map(q).join(";")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `Natizheler_11A_${new Date().toISOString().slice(0, 10)}.csv`; document.body.append(a); a.click(); a.remove(); toast("📥 Excel файлы жүктелді");
};
const GCOL = { em: "#e2552f", re: "#12a86f", in: "#0089B5" };
async function rtLoad() {
  clearTimeout(rtTimer);
  if (!$("#st-rating").classList.contains("active")) return;
  let students = [], groups = {};
  if (LIVE.on()) {
    try { const d = await LIVE.read(); students = Object.entries(d.students || {}).map(([id, v]) => ({ id, ...v })); groups = d.groups || {}; $("#rtStatus").innerHTML = `🛰️ Тірі режим · ${students.length} оқушы · ${new Date().toLocaleTimeString("kk-KZ")} жаңартылды`; }
    catch (e) { $("#rtStatus").textContent = "⚠️ Firebase-ке қосылу мүмкін болмады. Интернетті және мекенжайды тексеріңіз."; }
  } else {
    const m = me(); if (m) students = [{ id: m.id, name: m.name, group: m.group, total: myTotal(), scores: store.get("kkScore", {}) }];
    groups = store.get("kkBoard", {});
    $("#rtStatus").innerHTML = "📴 Жергілікті режим: тек осы құрылғының нәтижесі көрінеді. Барлық оқушыны жинау үшін <b>⚙️ Firebase баптауын</b> қосыңыз.";
  }
  rtBonus = groups;
  students.sort((x, y) => (y.total || 0) - (x.total || 0) || (x.ts || 0) - (y.ts || 0));
  rtLast = students;
  const top = students.slice(0, 3), order = [1, 0, 2];
  $("#podium").innerHTML = "";
  order.forEach(k => { const s = top[k]; const p = k + 1;
    $("#podium").append(s ? h("div", { class: "pd p" + p }, h("div", { class: "av", style: `background:${GCOL[s.group] || "#0089B5"}` }, (s.name || "?")[0].toUpperCase()), h("b", {}, s.name), h("span", { class: "pts" }, `${s.total || 0} ұпай`), h("div", { class: "stand" }, ["🥇", "🥈", "🥉"][k])) : h("div", { class: "pd p" + p }, h("div", { class: "stand", style: "opacity:.25" }, p))); });
  // groups
  const gs = Object.keys(DATA.statusInfo).map(g => { const mem = students.filter(s => s.group === g); const avg = mem.length ? mem.reduce((t, s) => t + (s.total || 0), 0) / mem.length : 0; const bonus = +groups[g] || 0; return { g, n: mem.length, avg, bonus, score: Math.round(avg * 10) / 10 + bonus }; });
  const mx = Math.max(10, ...gs.map(x => x.score)), best = Math.max(...gs.map(x => x.score));
  $("#rtGroups").innerHTML = "";
  gs.forEach(x => { const info = DATA.statusInfo[x.g];
    $("#rtGroups").append(h("div", { class: "gteam" }, h("div", {}, h("b", { style: "font:800 15px var(--display);display:block" }, `${info.ico} ${info.group.split(" · ")[1]}`), h("small", { class: "muted" }, `${x.n} оқушы · бонус +${x.bonus}`), best > 0 && x.score === best ? h("span", { class: "crown" }, " 👑") : null),
      h("div", { class: "bar" }, h("i", { style: `width:${x.score / mx * 100}%;background:linear-gradient(90deg,${GCOL[x.g]},${GCOL[x.g]}aa)` }), h("span", {}, `орташа ${String(Math.round(x.avg * 10) / 10).replace(".", ",")} + бонус ${x.bonus}`)),
      h("div", { class: "row gap" }, h("b", {}, String(Math.round(x.score * 10) / 10).replace(".", ",")), h("button", { class: "icon-btn", title: "Топ бонусы +1", onclick: () => rtAddBonus(x.g, 1) }, "+"))));
  });
  // table
  const mid = me()?.id;
  $("#rtTable").innerHTML = students.length ? `<table class="dtable"><tr><th>#</th><th>Оқушы</th><th>Топ</th>${Object.values(SCORE_KEYS).map(v => `<th>${v[0].split(" ")[0]}</th>`).join("")}<th>Барлығы</th><th>%</th><th>Балл (1–10)</th></tr>${students.map((s, i) => { const t = s.total || 0; const G = gradeOf(t); const lv = `<span class="mark" style="--g:${G.color}">${G.mark}</span> <small>${G.name}</small>`; return `<tr class="rt-row ${s.id === mid ? "rt-me" : ""}"><td><b>${i + 1}</b></td><td><b>${(s.name || "").replace(/</g, "")}</b></td><td>${DATA.statusInfo[s.group]?.ico || "—"}</td>${Object.keys(SCORE_KEYS).map(k => `<td>${(s.scores || {})[k] ?? "·"}</td>`).join("")}<td class="pt">${t}/${MAXP}</td><td>${G.p}%</td><td>${lv}</td></tr>`; }).join("")}</table>${gradeSummary(students)}` : `<p class="muted">Әзірге нәтиже жоқ. Оқушылар 👤 батырмасы арқылы атын жазып, тапсырмаларды орындағанда осында шығады.</p>`;
  if (LIVE.on()) rtTimer = setTimeout(rtLoad, 3000);
}
function gradeSummary(st) {
  if (!st.length) return "";
  const gs = st.map(s => gradeOf(s.total || 0)), c = {}; gs.forEach(g => c[g.name] = (c[g.name] || 0) + 1);
  const avg = gs.reduce((t, g) => t + g.mark, 0) / gs.length, ok = Math.round(gs.filter(g => g.mark >= 5).length / gs.length * 100);
  return `<div class="g-sum">${DATA.grades.map(g => `<div style="--g:${g.color}"><b>${c[g.name] || 0}</b><small>${g.ico} ${g.name}</small></div>`).join("")}<div><b>${avg.toFixed(1).replace(".", ",")}</b><small>орташа балл (1–10)</small></div><div><b>${ok}%</b><small>5 балдан жоғары</small></div><div><b>${st.length}</b><small>оқушы</small></div></div>`;
}
async function rtAddBonus(g, d) {
  rtBonus[g] = (+rtBonus[g] || 0) + d;
  if (LIVE.on()) { try { await LIVE.pushGroup(g, rtBonus[g]); } catch {} } else { const b = store.get("kkBoard", {}); b[g] = rtBonus[g]; store.set("kkBoard", b); }
  confetti(40); rtLoad();
}
$("#rtRefresh").onclick = rtLoad;
$("#rtClear").onclick = async () => { if (!confirm("Рейтингтегі барлық нәтиже өшіріледі. Жалғастырамыз ба?")) return; if (LIVE.on()) { try { await LIVE.clear(); } catch {} } store.set("kkBoard", {}); rtLoad(); toast("🧹 Рейтинг тазаланды"); };
$("#rtSettings").onclick = () => { $("#cfgUrl").value = LIVE.url; $("#cfgMsg").textContent = ""; $("#cfg").hidden = false; };
$("#cfgClose").onclick = () => $("#cfg").hidden = true;
$("#cfgSave").onclick = async () => {
  LIVE.setUrl($("#cfgUrl").value);
  if (!LIVE.url) { $("#cfgMsg").textContent = "Жергілікті режим қосылды."; refreshQrs(); return; }
  if (!LIVE.on()) { $("#cfgMsg").textContent = "⚠️ Мекенжай https://...firebaseio.com түрінде болуы керек"; return; }
  $("#cfgMsg").textContent = "Тексерілуде…";
  try { await LIVE.test(); $("#cfgMsg").textContent = "✅ Қосылды! QR-кодтар жаңартылды."; refreshQrs(); livePush(); rtLoad(); }
  catch (e) { $("#cfgMsg").textContent = "❌ Қосылмады: дерекқор ережелерін (rules) тексеріңіз."; }
};


/* ---------- кері байланыс қабырғасы ---------- */
const ROLES = { guest: "🎩 Қонақ", teacher: "👩‍🏫 Мұғалім", student: "🎓 Оқушы" };
let fbRole = "guest", fbStar = 5, wallTab = "all", wallTimer = null;
Object.entries(ROLES).forEach(([k, v]) => $("#fbRoles").append(h("button", { class: k === fbRole ? "on" : "", onclick: e => { fbRole = k; $$("#fbRoles button").forEach(b => b.classList.remove("on")); e.currentTarget.classList.add("on"); } }, v)));
function starsDraw() { $("#fbStars").innerHTML = ""; for (let i = 1; i <= 5; i++) $("#fbStars").append(h("button", { class: i <= fbStar ? "on" : "", onclick: () => { fbStar = i; starsDraw(); } }, "⭐")); }
starsDraw();
async function sendNote(rec) {
  rec.ts = Date.now();
  if (LIVE.on()) { try { await LIVE.pushNote(rec); } catch { toast("⚠️ Жіберу мүмкін болмады"); return false; } }
  else { const n = store.get("kkNotes", []); n.push(rec); store.set("kkNotes", n); }
  confetti(60); toast("💬 Рахмет! Пікіріңіз қабырғада"); wallLoad(); return true;
}
$("#fbSend").onclick = async () => {
  const like = $("#fbLike").value.trim(), idea = $("#fbIdea").value.trim();
  if (!like && !idea) { toast("Бір-екі сөз жазыңыз ✍️"); return; }
  if (await sendNote({ role: fbRole, name: $("#fbName").value.trim(), stars: fbStar, like, idea })) { $("#fbLike").value = ""; $("#fbIdea").value = ""; }
};
$("#rfSend").onclick = async () => {
  const t = $("#rfText").value.trim(); if (!t) { toast("Сөйлемді жалғастыр ✍️"); return; }
  if (await sendNote({ role: "student", name: me()?.name || "", like: t })) $("#rfText").value = "";
};
[["all", "💬 Барлығы"], ["guest", "🎩 Қонақтар"], ["teacher", "👩‍🏫 Мұғалімдер"], ["student", "🎓 Оқушылар"], ["essay", "✍️ Оқушы жауаптары (C)"]].forEach(([k, n]) =>
  $("#wallTabs").append(h("button", { class: "tab" + (k === wallTab ? " on" : ""), onclick: e => { wallTab = k; $$("#wallTabs .tab").forEach(b => b.classList.remove("on")); e.currentTarget.classList.add("on"); wallLoad(); } }, n)));
const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
async function wallLoad() {
  clearTimeout(wallTimer);
  if (!$("#st-wall").classList.contains("active")) return;
  let notes = [], students = [];
  if (LIVE.on()) { try { const d = await LIVE.read(); notes = Object.values(d.notes || {}); students = Object.values(d.students || {}); } catch {} }
  else { notes = store.get("kkNotes", []); const m = me(); if (m) students = [{ name: m.name, essay: store.get("kkEssay", "") }]; }
  notes.sort((x, y) => y.ts - x.ts);
  const rated = notes.filter(n => n.stars), avg = rated.length ? rated.reduce((t, n) => t + n.stars, 0) / rated.length : 0;
  $("#fbStats").innerHTML = `<div><b>${notes.length}</b><small>пікір</small></div><div><b>${avg ? avg.toFixed(1).replace(".", ",") : "—"}</b><small>⭐ орташа баға</small></div><div><b>${notes.filter(n => n.role !== "student").length}</b><small>қонақ/мұғалім</small></div>`;
  const W = $("#wall"); W.innerHTML = "";
  if (wallTab === "essay") {
    const es = students.filter(s => s.essay && s.essay.trim());
    if (!es.length) W.innerHTML = `<p class="muted">C деңгейінде жазылған жауаптар осында шығады.</p>`;
    es.forEach((s, i) => W.append(h("div", { class: "note r-student", style: `--r:${(i % 3 - 1) * 1.2}deg` }, h("div", { class: "who" }, h("span", {}, "✍️ " + (s.name || "Оқушы"))), h("p", { html: esc(s.essay).replace(/\n/g, "<br>") }))));
  } else {
    const list = notes.filter(n => wallTab === "all" || n.role === wallTab);
    if (!list.length) W.innerHTML = `<p class="muted">Әзірге пікір жоқ. QR-ды сканерлеп, бірінші болып жазыңыз!</p>`;
    list.forEach((n, i) => W.append(h("div", { class: "note r-" + n.role, style: `--r:${(i % 3 - 1) * 1.4}deg;animation-delay:${Math.min(i, 10) * .05}s` },
      h("div", { class: "who" }, h("span", {}, `${ROLES[n.role] || "💬"}${n.name ? " · " + esc(n.name) : ""}`), n.stars ? h("span", { class: "st" }, "★".repeat(n.stars)) : null),
      n.like ? h("p", { html: "⭐ " + esc(n.like) }) : null, n.idea ? h("p", { class: "idea", html: "💡 " + esc(n.idea) }) : null,
      h("small", {}, new Date(n.ts).toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" })))));
  }
  if (LIVE.on()) wallTimer = setTimeout(wallLoad, 4000);
}


/* ---------- оқушы хабы және тақтаны ілесу ---------- */
function hubRender() {
  const m = me(); $("#hubHi").textContent = m ? `Сәлем, ${m.name.split(" ")[0]}! 🌞` : "Сәлем! 🌞";
  $("#hubGrid").innerHTML = "";
  ST.filter(s => SALLOW.includes(s.id) && s.id !== "hub").forEach(s => $("#hubGrid").append(h("button", { "data-id": s.id, class: s.id === followed ? "now" : "", onclick: () => go(s.id) }, h("i", {}, s.ico), s.label)));
  $("#hubWait").innerHTML = LIVE.on() ? `<span class="lr-dot"></span> Тақтамен байланыс бар — тапсырма өздігінен ашылады` : `<span class="lr-dot off"></span> Тапсырманы өзің таңда`;
}
let followed = null, followTs = 0;
async function follow() {
  if (!STUDENT || MODE === "g" || !LIVE.on()) return;
  try { const ss = await LIVE.getSession(), loc = store.get("kkSess", null);
    if (ss && ss.id !== loc) { const m = me(); store.set("kkSess", ss.id); if (loc || (m && (m.ts || 0) < ss.ts)) { wipeResults(); whoLbl(); if (ST[cur].id === "hub") hubRender(); toast("🔔 Жаңа сабақ басталды — атыңды қайта жаз"); setTimeout(() => whoOpen(), 700); } } } catch {}
  try { const st = await LIVE.getStage(); if (st && st.ts > followTs) { followTs = st.ts; if (st.stage !== followed && SALLOW.includes(st.stage)) { followed = st.stage; if (ST[cur].id !== st.stage) { go(st.stage); toast("📺 Тақтада жаңа тапсырма!"); } } } } catch {}
  setTimeout(follow, 3000);
}
if (STUDENT) {
  // back-to-hub button in each allowed stage
  SALLOW.filter(id => id !== "hub").forEach(id => { const sec = document.getElementById("st-" + id); if (sec && MODE === "s") sec.prepend(h("button", { class: "s-back", onclick: () => go("hub") }, "← Менің тапсырмаларым")); });
  document.querySelector(".brand-text b").textContent = MODE === "g" ? "Кері байланыс" : "Оқушы";
  $("#whoBtn").insertAdjacentElement("beforebegin", h("span", { class: "mode-pill" }, MODE === "g" ? "🎩 Қонақ" : "📱 Оқушы"));
  if (MODE === "g") { fbRole = "guest"; $("#whoBtn").style.display = "none"; $("#myScoreBtn").style.display = "none"; }
  if (MODE === "s") { fbRole = "student"; $("#fbRoles").style.display = "none"; setTimeout(() => { if (!me()) whoOpen(); }, 900); }
  setTimeout(follow, 1500);
}

/* ---------- тақтадағы тірі нәтиже ---------- */
const LR = { card: null, terms: "terms", duel: "duel", witness: "witness", prompt: "group", levels: "levels", quiz: "quiz" };
const LRMAX = { terms: 5, duel: 6, witness: 6, group: 5, levels: 4, quiz: 10 };
Object.keys(LR).forEach(id => { const sec = document.getElementById("st-" + id); if (!sec) return; const after = sec.querySelector(".tpanel") || sec.querySelector(".stage-head"); after.insertAdjacentElement("afterend", h("div", { class: "live-res", id: "lr-" + id })); });
let lrT = null;
async function lrLoad() {
  clearTimeout(lrT);
  if (STUDENT) return;
  const id = ST[cur].id; if (!(id in LR)) return;
  const box = $("#lr-" + id); if (!box) return;
  if (!LIVE.on()) { box.innerHTML = `<div class="lr-t"><span class="lr-dot off"></span> Сынып нәтижесі Firebase қосылғанда осында тірі шығады (⚙️ → 🛰️ Тірі рейтинг)</div>`; return; }
  let st = [];
  try { const d = await LIVE.read(); st = Object.values(d.students || {}); } catch { box.innerHTML = `<div class="lr-t"><span class="lr-dot off"></span> Байланыс жоқ</div>`; lrT = setTimeout(lrLoad, 4000); return; }
  const k = LR[id];
  if (!k) {
    const c = g => st.filter(s => s.group === g).length;
    box.innerHTML = `<div class="lr-t"><span class="lr-dot"></span> Тірі: сыныпқа қосылғандар</div><div><b>${st.length}</b><small>👥 барлығы</small></div><div><b>${c("em")}</b><small>✈️ эмигранттар</small></div><div><b>${c("re")}</b><small>🏡 репатрианттар</small></div><div><b>${c("in")}</b><small>🔁 ішкі мигранттар</small></div>`;
  } else {
    const done = st.filter(s => (s.scores || {})[k] != null), mx = LRMAX[k];
    const avg = done.length ? done.reduce((t, s) => t + s.scores[k], 0) / done.length : 0;
    const full = done.filter(s => s.scores[k] >= mx).length;
    box.innerHTML = `<div class="lr-t"><span class="lr-dot"></span> Тірі: сынып нәтижесі</div><div><b>${done.length}<span style="font-size:18px;color:#5d7591"> / ${st.length}</span></b><small>📨 жауап берді</small></div><div><b>${String(Math.round(avg * 10) / 10).replace(".", ",")}<span style="font-size:18px;color:#5d7591"> / ${mx}</span></b><small>📊 орташа ұпай</small></div><div><b>${full}</b><small>✅ толық дұрыс</small></div><div><b>${done.length ? Math.round(avg / mx * 100) : 0}%</b><small>🎯 орындалу</small></div>`;
    const NM = { em: "✈️", re: "🏡", in: "🔁" }, rk = done.slice().sort((a, b) => (b.scores[k] || 0) - (a.scores[k] || 0) || (a.ts || 0) - (b.ts || 0)).slice(0, 10);
    if (rk.length) box.insertAdjacentHTML("beforeend", `<div class="lr-list"><span class="lr-lh">🏆 Осы тапсырманың рейтингі</span>${rk.map((s, n) => `<p class="${s.scores[k] >= mx ? "full" : ""}"><i>${["🥇", "🥈", "🥉"][n] || n + 1}</i><b>${esc(s.name || "?")}</b><span>${NM[s.group] || ""}</span><em>${s.scores[k]}/${mx}</em></p>`).join("")}</div>`);
  }
  lrT = setTimeout(lrLoad, 4000);
}


/* ---------- интерактивті тақтаға сыйдыру ---------- */
const FIT_W = 1600;
let fitOn = store.get("kkFit", true);
function fit() {
  const S = $("#stages"), act = $(".stage.active"), B = document.body;
  const vw = document.documentElement.clientWidth, vh = innerHeight;
  if (STUDENT || !fitOn || vw < 900 || !act) { S.style.zoom = ""; S.style.width = ""; S.style.maxWidth = ""; $$(".topbar,.side,.pager,#timer").forEach(e => e.style.zoom = ""); B.classList.remove("fitted", "nofit-scroll"); return; }
  B.classList.add("fitted");
  const docPage = act.id === "st-kmj" || act.id === "st-assess";
  B.classList.toggle("nofit-scroll", !docPage);
  const base = Math.max(.7, vw / FIT_W), ui = Math.min(1.6, Math.max(.8, base * .9));
  $$(".topbar,.side,.pager,#timer").forEach(e => e.style.zoom = ui);
  const topH = $(".topbar").getBoundingClientRect().height, avail = vh - topH - 6;
  // measure natural height at base zoom without min-heights
  B.classList.add("measuring");
  S.style.zoom = base; S.style.maxWidth = "none"; S.style.width = (vw / base) + "px";
  B.classList.remove("wide");
  let need = S.offsetHeight;
  let z = base;
  if (!docPage && need * base > avail) {
    // shrinking widens layout -> content gets shorter; iterate a few times
    for (let k = 0; k < 5; k++) { z = Math.min(base, avail / need) * .985; B.classList.toggle("wide", z < base * .9); S.style.zoom = z; S.style.width = (vw / z) + "px"; need = S.offsetHeight; if (need * z <= avail) break; }
    if (need * z > avail) { z = avail / need * .98; S.style.zoom = z; S.style.width = (vw / z) + "px"; }
  }
  B.classList.remove("measuring");
  S.style.setProperty("--fitH", (avail / z - 4) + "px");
}
addEventListener("resize", () => { clearTimeout(fit._t); fit._t = setTimeout(fit, 120); });
new ResizeObserver(() => { clearTimeout(fit._r); fit._r = setTimeout(fit, 150); }).observe($("#stages"));

/* ---------- start ---------- */
renderMyScore();
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
go(location.hash.slice(1) || (STUDENT ? (MODE === "g" ? "wall" : "hub") : "invite"), false);
addEventListener("load", () => { scrollTo(0, 0); setTimeout(() => scrollTo(0, 0), 120); });
if (!STUDENT) setTimeout(joinTick, 1200);
})();
