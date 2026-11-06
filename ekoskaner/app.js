/* ЭКОСКАНЕР · тақта (әдепкі), оқушы (?m=s), қонақ (?m=g) */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const P = "es";
const store = { get(k, d) { try { const v = localStorage.getItem(P + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch {} }, del(k) { try { localStorage.removeItem(P + k); } catch {} } };
const MODE = new URLSearchParams(location.search).get("m") || "b";
const ST = DATA.stages, L = DATA.lesson, PTS = DATA.points, MAXP = Object.values(PTS).reduce((a, b) => a + b, 0), TASKS = Object.keys(PTS);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fmt = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toString().replace(".", ",");
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hm = ts => new Date(ts).toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" });
let toastT; const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); };

/* ---------- 3D иконкалар ---------- */
const EP = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu, EP1 = /\p{Extended_Pictographic}/u;
function decoText(n) {
  const p = n.parentElement; if (!p || p.closest("svg,textarea,input,script,style,option,title,.e3")) return;
  const t = n.data; if (!EP1.test(t)) return; let last = 0, hit = false; const fr = document.createDocumentFragment();
  for (const m of t.matchAll(EP)) { const f = typeof EMO !== "undefined" && EMO[m[0].replace(/️/g, "")]; if (!f) continue; hit = true;
    if (m.index > last) fr.append(t.slice(last, m.index)); const im = document.createElement("img"); im.className = "e3"; im.alt = m[0]; im.src = "media/3d/" + f + ".webp"; im.draggable = false; fr.append(im); last = m.index + m[0].length; }
  if (!hit) return; if (last < t.length) fr.append(t.slice(last)); n.replaceWith(fr);
}
function deco(root) { if (root.nodeType === 3) return decoText(root); if (root.nodeType !== 1) return; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), A = []; while (w.nextNode()) A.push(w.currentNode); A.forEach(decoText); }
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(deco))).observe(document.body, { childList: true, subtree: true });
deco(document.body);

/* ---------- оқушы, ұпай ---------- */
const me = () => store.get("me", null);
const scores = () => store.get("sc", {});
const doneAt = () => store.get("at", {});
const total = (sc = scores()) => TASKS.reduce((t, k) => t + (sc[k] || 0), 0);
const mark = t => { const p = Math.round(t / MAXP * 100); const g = DATA.grades.find(g => p >= g.min); return { p, m: Math.max(1, Math.round(p / 10)), lv: g.name, c: g.c }; };
function setScore(k, v, done) { const s = scores(); s[k] = Math.max(0, Math.min(PTS[k], v)); store.set("sc", s); if (done) { const a = doneAt(); a[k] = a[k] || Date.now(); store.set("at", a); } push(); paintMe(); }
function push() { const m = me(); if (!m || !LIVE.on()) return; LIVE.pushStudent(m.id, { name: m.name, g: m.g, sc: scores(), at: doneAt(), pair: store.get("pair", ""), total: total(), sky: store.get("mySky", null), ts: m.ts || Date.now() }); }
function paintMe() { const e = $("#phSc"); if (e) e.textContent = `${total()} / ${MAXP}`; }
const RESULT_KEYS = ["me", "sc", "at", "pair", "mySky", "q_t1", "t1ord", "t1chk", "q_t2", "q_t3", "q_t4", "q_t5", "q_t6", "t5o", "t3sent", "notes", "bonus"];
const wipe = () => RESULT_KEYS.forEach(k => store.del(k));

/* ---------- QR ---------- */
let qn = 0;
function qrSvg(text) {
  const id = "qg" + (++qn), q = qrcode(0, "M"); q.addData(text); q.make();
  const n = q.getModuleCount(), m = 2, S = n + 2 * m, fin = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  let d = ""; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c) && !fin(r, c)) d += `<rect x="${c + m + .08}" y="${r + m + .08}" width=".84" height=".84" rx=".28"/>`;
  const eye = (x, y) => `<rect x="${x + m + .5}" y="${y + m + .5}" width="6" height="6" rx="1.6" fill="none" stroke="#0B3D3A" stroke-width="1"/><rect x="${x + m + 2}" y="${y + m + 2}" width="3" height="3" rx=".8" fill="#0EA5E9"/>`;
  return `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00799A"/><stop offset="1" stop-color="#0EA5E9"/></linearGradient></defs><rect width="${S}" height="${S}" fill="#fff"/><g fill="url(#${id})">${d}</g>${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}</svg>`;
}
const link = (m, h) => { const u = new URL(location.href); u.hash = ""; u.searchParams.delete("m"); u.searchParams.set("m", m); if (LIVE.on()) u.searchParams.set("db", LIVE.url); return u.toString() + (h ? "#" + h : ""); };

/* ---------- графиктер ---------- */
function chartTrend(W = 560, H = 230, data = DATA.karaganda) {
  const p = { l: 40, r: 12, t: 26, b: 30 }, cw = (W - p.l - p.r) / data.length, mx = 44, y = v => H - p.b - v / mx * (H - p.t - p.b);
  let s = `<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="kk${++qn}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F87171"/><stop offset="1" stop-color="#991B1B"/></linearGradient><linearGradient id="tt${qn}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDBA74"/><stop offset="1" stop-color="#C2410C"/></linearGradient></defs>`;
  s += `<rect x="${p.l}" y="${y(mx)}" width="${W - p.l - p.r}" height="${y(10) - y(mx)}" fill="#FDECEC"/><line x1="${p.l}" x2="${W - p.r}" y1="${y(10)}" y2="${y(10)}" stroke="#F59E0B" stroke-dasharray="5 4"/><text x="${W - p.r}" y="${y(10) - 5}" text-anchor="end" class="bnd">СИ = 10</text>`;
  [0, 20, 40].forEach(v => s += `<text x="${p.l - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}</text>`);
  data.forEach(([yr, k, t], i) => { const cx = p.l + cw * i + cw / 2;
    s += `<rect class="ch-bar" style="transform-origin:${cx - 13}px ${y(0)}px;animation-delay:${i * .12}s" x="${cx - 30}" y="${y(k)}" width="28" height="${y(0) - y(k)}" rx="5" fill="url(#kk${qn})"/><text x="${cx - 16}" y="${y(k) - 5}" text-anchor="middle" class="val">${fmt(k)}</text>`;
    s += `<rect class="ch-bar" style="transform-origin:${cx + 15}px ${y(0)}px;animation-delay:${i * .12 + .06}s" x="${cx + 2}" y="${y(t)}" width="28" height="${y(0) - y(t)}" rx="5" fill="url(#tt${qn})"/><text x="${cx + 16}" y="${y(t) - 5}" text-anchor="middle" class="val sm2">${fmt(t)}</text>`;
    s += `<text x="${cx}" y="${H - 9}" text-anchor="middle" class="ax">${yr}</text>`; });
  return s + `</svg>`;
}
function hbars(rows, max, unit = "ШЖШ") {
  return `<div class="hb">${rows.map(([n, v], i) => `<div><span>${esc(n)}</span><i><u style="width:${Math.min(100, v / max * 100)}%;animation-delay:${i * .1}s;background:${v >= 10 ? "#DC2626" : v >= 5 ? "#EA580C" : v >= 1 ? "#CA8A04" : "#16A34A"}"></u></i><b>${fmt(v)} <small>${unit}</small></b></div>`).join("")}</div>`;
}
function gauge(si, ez) {
  const lv = si > 10 || ez >= 50 ? 3 : si >= 5 || ez >= 20 ? 2 : si >= 2 || ez >= 1 ? 1 : 0, cols = ["#16A34A", "#CA8A04", "#EA580C", "#B91C1C"];
  const ang = -90 + (lv + .5) * 45;
  return `<svg viewBox="0 0 200 120" class="gauge">${cols.map((c, i) => { const a0 = Math.PI * (1 - i / 4), a1 = Math.PI * (1 - (i + 1) / 4); return `<path d="M${100 + 80 * Math.cos(a0)} ${100 - 80 * Math.sin(a0)} A80 80 0 0 1 ${100 + 80 * Math.cos(a1)} ${100 - 80 * Math.sin(a1)}" stroke="${c}" stroke-width="18" fill="none"/>`; }).join("")}
  <g style="transform:rotate(${ang}deg);transform-origin:100px 100px" class="needle"><line x1="100" y1="100" x2="100" y2="34" stroke="#0B1F2A" stroke-width="5" stroke-linecap="round"/></g><circle cx="100" cy="100" r="9" fill="#0B1F2A"/></svg>`;
}

/* ================= ТАПСЫРМАЛАР (тақтада да, телефонда да) ================= */
const TASK = {
  t1(root) {
    const C = DATA.t1, st = store.get("q_t1", {}), order = store.get("t1ord", null) || shuffle(C.cards.map((_, i) => i)); store.set("t1ord", order);
    let checked = store.get("t1chk", false);
    const draw = () => {
      root.innerHTML = `<div class="t1leg">${C.cats.map(([k, n]) => `<span class="c-${k}">${n}</span>`).join("")}</div><div class="t1l">${order.map(i => { const [t, a] = C.cards[i], v = st[i];
        return `<div class="t1r ${checked ? (v === a ? "ok" : "no") : v ? "set" : ""}"><span>${esc(t)}</span><div>${C.cats.map(([k, n]) => `<button class="cb c-${k} ${v === k ? "on" : ""} ${checked && a === k ? "right" : ""}" data-i="${i}" data-c="${k}" title="${n}">${n.split(" ")[0]}</button>`).join("")}</div></div>`; }).join("")}</div>
        <div class="trow"><button class="btn" data-a="check">✓ Тексеру</button><span class="score" data-a="score">${checked ? `${C.cards.filter((c, i) => st[i] === c[1]).length}/${C.cards.length} дұрыс · ${scores().t1 ?? 0}/${PTS.t1} ұпай` : `${Object.keys(st).length}/${C.cards.length} таңдалды`}</span></div>`;
    };
    draw();
    root.onclick = e => {
      const b = e.target.closest(".cb"); if (b && !checked) { st[b.dataset.i] = b.dataset.c; store.set("q_t1", st); draw(); return; }
      if (e.target.closest("[data-a=check]") && !checked) { const n = Object.keys(st).length; if (n < C.cards.length) { toast(`Барлық ${C.cards.length} көрсеткішті жікте (қалды: ${C.cards.length - n})`); return; }
        const ok = C.cards.filter((c, i) => st[i] === c[1]).length; checked = true; store.set("t1chk", true); setScore("t1", Math.round(ok / C.cards.length * PTS.t1), true); draw(); toast(ok === C.cards.length ? "Сканер дәл жіктеді! 🎯" : "Қызыл жолдарды қара: жасыл жиек — дұрыс жауап"); }
    };
  },
  mcq(root, Q, key, pts, opts = {}) {
    const st = store.get("q_" + key, {});
    const draw = () => {
      let lastK = null;
      root.innerHTML = `<div class="qs">${Q.map((q, i) => { const head = q.k && q.k !== lastK ? `<h5 class="qk">${esc(q.k)}</h5>` : ""; lastK = q.k;
        return `${head}<div class="q"><p>${i + 1}. ${esc(q.q)}</p><div class="opts">${q.o.map((o, k) => { const done = st[i] != null; const cls = done ? (k === q.a ? "ok" : k === st[i] ? "no" : "dim") : ""; return `<button class="opt ${cls}" data-q="${i}" data-k="${k}">${esc(o)}</button>`; }).join("")}</div>${st[i] != null && q.e ? `<div class="exp">${st[i] === q.a ? "✓ " : "✗ "}${esc(q.e)}</div>` : ""}</div>`; }).join("")}</div>
      <div class="trow"><span class="score">${Object.keys(st).length ? `${Q.filter((q, i) => st[i] === q.a).length} / ${Q.length} дұрыс` : ""}</span>${opts.noReset ? "" : `<button class="btn lt" data-a="r">Қайта</button>`}</div>`;
    };
    draw();
    root.onclick = e => {
      if (e.target.closest("[data-a=r]")) { Object.keys(st).forEach(k => delete st[k]); store.set("q_" + key, st); draw(); return; }
      const b = e.target.closest(".opt"); if (!b) return; const i = +b.dataset.q; if (st[i] != null) return;
      st[i] = +b.dataset.k; store.set("q_" + key, st); const ok = Q.filter((q, j) => st[j] === q.a).length, all = Object.keys(st).length === Q.length;
      if (opts.onAnswer) opts.onAnswer(st, ok, all); else if (pts) setScore(key, Math.round(ok / Q.length * PTS[key]), all);
      if (all && ok === Q.length) toast(opts.perfect || "Тамаша! Барлығы дұрыс 🎉");
      draw();
    };
  },
  t2(root) {
    const pair = store.get("pair", "");
    root.innerHTML = `<div class="pairbox">👥 Жұбым: <input class="inp" id="pairIn" maxlength="30" placeholder="жұбыңның аты" value="${esc(pair)}"></div><div data-q></div>`;
    $("#pairIn", root).onchange = e => { store.set("pair", e.target.value.trim()); push(); };
    TASK.mcq($("[data-q]", root), DATA.t2, "t2", true, { perfect: "Жұбыңмен бірге 10/10! 🤝" });
  },
  t3(root, gFix) {
    const g = gFix || me()?.g || "g1", D = DATA.t3[g], G = DATA.groups[g];
    const sent = store.get("t3sent", null);
    root.innerHTML = `<div class="dos mini" style="--gc:${G.c}"><div class="dos-h">${G.i} <b>${esc(G.n)}</b><span>${esc(D.period)}</span></div>
      <div class="dos-k"><div><small>СИ</small><b>${fmt(D.si)}</b></div><div><small>ЕЖҚ</small><b>${fmt(D.ez)}%</b></div></div>${hbars(D.air, Math.max(...D.air.map(a => a[1])) * 1.1)}
      <ul class="dos-f">${D.facts.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div><div data-q></div>
      <textarea id="idea" maxlength="200" placeholder="💡 Топтың ұсынысы: қаланың ауасын/суын қалай жақсартуға болады? (1 сөйлем)">${esc(sent?.idea || "")}</textarea>
      <div class="trow"><button class="btn" id="t3send">${sent ? "Қайта жіберу" : "🚀 Тақтаға жіберу"}</button><span class="score" id="t3sc"></span></div>`;
    const Q = DATA.t3.qs.map((q, i) => ({ ...q, a: D.a[i] }));
    TASK.mcq($("[data-q]", root), Q, "t3", false, { noReset: true, onAnswer: (st, ok) => { $("#t3sc", root).textContent = `${ok}/3`; } });
    $("#t3send", root).onclick = async () => {
      const st = store.get("q_t3", {}); if (Object.keys(st).length < 3) { toast("3 сұраққа да жауап бер"); return; }
      const ok = Q.filter((q, i) => st[i] === q.a).length, rec = { ans: Q.map((q, i) => q.o[st[i]]), ok, idea: $("#idea", root).value.trim(), by: me()?.name || "", ts: Date.now() };
      store.set("t3sent", rec); setScore("t3", ok, true);
      if (LIVE.on() && gFix == null) { try { await LIVE.pushGroup(g + "/sub", rec); } catch {} }
      toast("Топтың жауабы тақтаға жіберілді! 📡");
    };
  },
  t4(root) {
    const E = DATA.t4, s = { a: E.a.c, b: E.b.c };
    root.innerHTML = `<div class="exp" style="margin-bottom:10px">🤖 Тақтада ЖИ-ге сұрақ қойылды. Оның жауабын және оқулықтағы шешімді осы есептегішпен тексер — шешімді өзің қабылда.</div><div class="labg"><div class="labc">
        ${["a", "b"].map(k => `<div class="lab-r"><div class="h"><b>${E[k].n}</b><span>ШШК = ${fmt(E[k].pdk, 2)} мг/м³</span></div><input type="range" data-k="${k}" min="0" max="${E[k].pdk * 2}" step="${E[k].pdk / 200}" value="${E[k].c}"><div class="v"><span data-v="${k}"></span> мг/м³</div></div>`).join("")}
        <div class="lab-f" data-f></div><div class="meter"><i data-m></i><div class="one">1,0 — шек</div></div><div class="verd" data-vd></div>
        <button class="btn am" data-a="book">📖 Оқулықтағы мәндер (93-б.)</button></div><div data-qs></div></div>`;
    const calc = () => { const ra = s.a / E.a.pdk, rb = s.b / E.b.pdk, sum = ra + rb, ok = sum < 1;
      $("[data-v=a]", root).textContent = fmt(s.a, 3); $("[data-v=b]", root).textContent = fmt(s.b, 4);
      $("[data-f]", root).innerHTML = `${fmt(ra, 3)} + ${fmt(rb, 3)} = <span class="${ok ? "ok" : "bad"}">${fmt(sum, 3)}</span>`;
      const m = $("[data-m]", root); m.style.width = Math.min(100, sum * 50) + "%"; m.style.background = ok ? "linear-gradient(90deg,#10B981,#00799A)" : "linear-gradient(90deg,#F59E0B,#DC2626)";
      const v = $("[data-vd]", root); v.className = "verd " + (ok ? "ok" : "bad"); v.textContent = ok ? "Қосынды < 1 — нормаға сай" : "Қосынды ≥ 1 — нормадан асады!"; };
    $$("input", root).forEach(i => i.oninput = () => { s[i.dataset.k] = +i.value; calc(); });
    $("[data-a=book]", root).onclick = () => { s.a = E.a.c; s.b = E.b.c; $$("input", root).forEach(i => i.value = s[i.dataset.k]); calc(); toast("Оқулықта 0,996 деп жазылған. Тексеріп көр!"); };
    calc(); TASK.mcq($("[data-qs]", root), E.q, "t4", true, { perfect: "Оқулықтағы қатені дәлелдедің! 🔍" });
  },
  t5(root) {
    const T = DATA.t5; let ord = store.get("t5o", []);
    const mix = store.get("t5mix", null) || shuffle(T.order.map((_, i) => i)); store.set("t5mix", mix);
    const draw = () => {
      const done = ord.length === T.order.length, ok = done && ord.every((v, i) => v === i);
      root.innerHTML = `<h5 class="qk">А. 27-сызба: кезеңдерді ретімен бас</h5><div class="ordr">${mix.map(i => { const pos = ord.indexOf(i); return `<button class="ob ${pos >= 0 ? (done ? (ord[pos] === pos ? "ok" : "no") : "on") : ""}" data-o="${i}">${pos >= 0 ? `<i>${pos + 1}</i>` : ""}${esc(T.order[i])}</button>`; }).join("")}</div>
        ${done ? `<div class="exp">${ok ? "✓ Реті дұрыс!" : "✗ Дұрыс реті: " + T.order.join(" → ")}</div>` : `<button class="btn lt" data-a="clr" style="margin-top:8px">Тазалау</button>`}
        <div data-q></div>`;
      const calc = (st) => { const m = T.match.filter((q, i) => st[i] === q.a).length; const sc = (ok ? 1 : 0) + m / T.match.length * 4; setScore("t5", Math.round(sc), done && Object.keys(st).length === T.match.length); };
      TASK.mcq($("[data-q]", root), T.match, "t5", false, { noReset: true, onAnswer: st => calc(st) });
      root.onclick = e => { if (e.target.closest("[data-q]")) return;
        const b = e.target.closest("[data-o]"); if (b && !done) { const i = +b.dataset.o; if (!ord.includes(i)) { ord.push(i); store.set("t5o", ord); if (ord.length === T.order.length) calc(store.get("q_t5", {})); draw(); } }
        if (e.target.closest("[data-a=clr]")) { ord = []; store.set("t5o", ord); draw(); } };
    };
    draw();
  },
  t6(root) { TASK.mcq(root, DATA.t6, "t6", true, { noReset: true, perfect: "Жедел сканер: 8/8! ⚡" }); }
};

/* ================= ТЕЛЕФОН ================= */
if (MODE !== "b") {
  document.body.classList.add("ph"); $("#phone").hidden = false;
  const ph = $("#phone"); let open = null, follow = null;
  const top = () => `<div class="ph-top"><span class="case-no sm">ЭКО<br>СКАН</span><span class="me">${me() ? esc(me().name) + " · " + DATA.groups[me().g].i : "Сарапшы"}</span><span class="sc" id="phSc">${total()} / ${MAXP}</span></div>`;
  function guest() {
    let stars = 0;
    ph.innerHTML = `<div class="ph-top"><span class="case-no sm">ЭКО<br>СКАН</span><span class="me">Құрметті қонақ</span></div>
    <div class="ph-h"><small>Кері байланыс</small><h2>Сабақ туралы пікіріңіз</h2></div>
    <div class="card fcol"><div class="gpick" id="role"><button class="on" data-r="Мұғалім">👩‍🏫 Мұғалім</button><button data-r="Әріптес">🤝 Әріптес</button><button data-r="Қонақ">🎩 Қонақ</button></div>
    <input class="inp" id="nm" placeholder="Аты-жөніңіз (міндетті емес)" maxlength="40"><div class="stars" id="stars">${[1, 2, 3, 4, 5].map(i => `<button data-s="${i}">⭐</button>`).join("")}</div>
    <textarea id="lk" maxlength="300" placeholder="⭐ Сабақта ұнағаны"></textarea><textarea id="wi" maxlength="300" placeholder="💡 Ұсыныс / тілек"></textarea><button class="btn" id="send">Жіберу 🚀</button></div>`;
    ph.onclick = e => { const r = e.target.closest("[data-r]"); if (r) $$("#role button").forEach(b => b.classList.toggle("on", b === r)); const s = e.target.closest("[data-s]"); if (s) { stars = +s.dataset.s; $$("#stars button").forEach((b, i) => b.classList.toggle("on", i < stars)); } };
    $("#send").onclick = async () => { const rec = { role: $("#role .on").dataset.r, name: $("#nm").value.trim(), stars, like: $("#lk").value.trim(), wish: $("#wi").value.trim(), ts: Date.now() };
      if (!rec.like && !rec.wish) { toast("Пікір жазыңыз"); return; } try { if (LIVE.on()) await LIVE.pushNote(rec); else store.set("notes", [...store.get("notes", []), rec]); ph.innerHTML = `<div class="ph-h done"><small>Рахмет!</small><h2>Пікіріңіз тақтаға жіберілді ✅</h2></div>`; } catch { toast("Жіберілмеді, қайта байқап көріңіз"); } };
  }
  function join() {
    let g = null;
    ph.innerHTML = `${top()}<div class="ph-h"><small>Экосканер · §22</small><h2>Сарапшылар тобына қосыл</h2></div>
      <div class="card fcol"><input class="inp" id="nm" placeholder="Аты-жөнің" maxlength="40">
      <div class="gpick col">${Object.entries(DATA.groups).map(([k, v]) => `<button data-g="${k}">${v.i} ${v.n}</button>`).join("")}</div><button class="btn" id="ok">Кіру →</button></div>`;
    ph.onclick = e => { const b = e.target.closest("[data-g]"); if (b) { g = b.dataset.g; $$(".gpick button").forEach(x => x.classList.toggle("on", x === b)); } };
    $("#ok").onclick = () => { const n = $("#nm").value.trim(); if (n.length < 2 || !g) { toast("Атыңды жаз және тобыңды таңда"); return; } store.set("me", { id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: n, g, ts: Date.now() }); push(); hub(); };
  }
  function hub() {
    open = null; const sc = scores(), at = doneAt();
    ph.innerHTML = `${top()}<div class="ph-h"><small>Менің сканерім</small><h2>Тапсырмалар</h2></div><p class="follow">${LIVE.on() ? "📡 Тақтамен байланыс бар — тапсырма өздігінен ашылады" : "Тапсырманы таңда"}</p>
      <div class="ph-list">${TASKS.map(id => { const s = ST.find(x => x.id === id); return `<button data-o="${id}" class="${follow === id ? "now" : ""} ${at[id] ? "done" : ""}"><span><small>${esc(s.mode)} · ${esc(s.crit)}</small>${esc(s.title)}</span><b>${at[id] ? "✓ " : ""}${sc[id] ?? "—"} / ${PTS[id]}</b></button>`; }).join("")}
      <button data-o="self"><span><small>Рефлексия</small>«Менің аспаным»</span><b>→</b></button></div>
      <div class="card mine"><b>Менің нәтижем:</b> ${total()} / ${MAXP} ұпай · ${mark(total()).m} балл · ${mark(total()).lv}</div>`;
    ph.onclick = e => { const b = e.target.closest("[data-o]"); if (b && TASKS.includes(b.dataset.o)) openTask(b.dataset.o); };
  }
  function openTask(id) {
    open = id;
    if (id === "self") {
      ph.innerHTML = `${top()}<div class="ph-h"><small>Рефлексия</small><h2>Менің аспаным қандай?</h2></div><div class="card"><div class="sky">${DATA.selfCheck.map(([i, t], k) => `<button data-sk="${k}" class="${store.get("mySky", null) === k ? "on" : ""}"><i>${i}</i>${t}</button>`).join("")}</div>
      <textarea id="sn" maxlength="200" placeholder="Эко-уәдем: «Мен … »" style="margin-top:10px"></textarea><button class="btn" id="sv" style="margin-top:10px">Тақтаға жіберу 🚀</button></div><button class="btn lt" id="bk">← Тапсырмалар</button>`;
      ph.onclick = e => { const b = e.target.closest("[data-sk]"); if (b) { store.set("mySky", +b.dataset.sk); push(); $$(".sky button").forEach(x => x.classList.toggle("on", x === b)); } if (e.target.id === "bk") hub(); };
      $("#sv").onclick = async () => { const t = $("#sn").value.trim(); if (!t) { toast("Сөйлемді жаз"); return; } const rec = { role: "Оқушы", name: me()?.name || "", like: t, sky: store.get("mySky", null), ts: Date.now() }; try { if (LIVE.on()) await LIVE.pushNote(rec); else store.set("notes", [...store.get("notes", []), rec]); toast("Жіберілді! ✅"); $("#sn").value = ""; } catch { toast("Жіберілмеді"); } };
      return;
    }
    const s = ST.find(x => x.id === id);
    ph.innerHTML = `${top()}<div class="ph-h"><small>${esc(s.kicker)}</small><h2>${esc(s.title)}</h2>${s.val ? `<span class="seal">Адал азамат · ${esc(s.val)}</span>` : ""}</div><div class="howp">${DATA.how[id].map((h, i) => `<span><i>${i + 1}</i>${esc(h)}</span>`).join("")}</div><div class="card task-ph" id="tk"></div><button class="btn lt" id="bk">← Тапсырмалар</button>`;
    TASK[id]($("#tk")); $("#bk").onclick = hub;
  }
  if (MODE === "g") guest(); else if (!me()) join(); else hub();
  if (MODE === "s") setInterval(async () => { if (!LIVE.on()) return;
    try { const ss = await LIVE.getSession(), loc = store.get("sess", null);
      if (ss && ss.id !== loc) { const m = me(); store.set("sess", ss.id); if (loc || (m && (m.ts || 0) < ss.ts)) { wipe(); store.del("t5mix"); toast("🔔 Жаңа сабақ басталды — атыңды қайта жаз"); join(); return; } } } catch {}
    if (!me()) return;
    try { const st = await LIVE.getStage(); const id = st && st.stage; if (id && id !== follow) { follow = id; if (TASKS.includes(id) && open !== id) openTask(id); else if (id === "feedback" && open !== "self") openTask("self"); else if (!open) hub(); } } catch {} }, 3000);
  return;
}

/* ================= ТАҚТА ================= */
function fit() { const s = Math.min(innerWidth / 1600, innerHeight / 900); $("#canvas").style.transform = `translate(-50%,-50%) scale(${s})`; }
addEventListener("resize", fit); fit();
let cur = Math.max(0, ST.findIndex(s => s.id === location.hash.slice(1)));
const left = store.get("left", {}); let run = false, tick = null, autoT = null;
let clkStart = store.get("clk", null);
const secOf = i => left[ST[i].id] ?? ST[i].min * 60;

function road() {
  $("#road").innerHTML = [0, 1, 2, 3, 4].map(p => { const items = ST.map((s, i) => [s, i]).filter(([s]) => s.part === p), on = ST[cur].part === p;
    return `<div class="pt ${on ? "on" : ""} ${p === 0 ? "p0" : ""}"><b>${DATA.parts[p]}</b><div class="dots">${items.map(([s, i]) => `<button title="${esc(s.title)}" data-go="${i}" class="${i === cur ? "on" : i < cur ? "done" : ""}"></button>`).join("")}</div></div>`; }).join("");
}
function paintTimer() {
  const tot = Math.max(1, ST[cur].min * 60), l = secOf(cur), f = $("#ringF");
  $("#ringT").textContent = ST[cur].min ? `${String(Math.floor(l / 60)).padStart(2, "0")}:${String(l % 60).padStart(2, "0")}` : "—";
  f.style.strokeDashoffset = 176 * (1 - l / tot); $("#ring").className = "ring" + (l <= 0 && ST[cur].min ? " end" : l <= 30 && ST[cur].min ? " warn" : "");
  $("#play").textContent = run ? "❚❚" : "▶"; $("#play").classList.toggle("on", run);
}
function clkDraw() {
  if (!clkStart) { $("#clk").textContent = "45:00"; $("#clkS").textContent = "▶ бастау"; $("#clock").classList.remove("on"); return; }
  const r = Math.max(0, 2700 - Math.floor((Date.now() - clkStart) / 1000));
  $("#clk").textContent = `${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`; $("#clkS").textContent = r ? "сабақ ↺" : "аяқталды"; $("#clock").classList.add("on");
}
setInterval(clkDraw, 1000); clkDraw();
async function newSession() {
  ["left", "bonus", "notes", "skyB"].forEach(k => store.del(k)); Object.keys(left).forEach(k => delete left[k]);
  let n = 0;
  if (LIVE.on()) { try { n = await LIVE.count(); await LIVE.clear(); await LIVE.setSession("s" + Date.now().toString(36)); } catch { toast("⚠️ Firebase-ті тазалау мүмкін болмады"); } }
  return n;
}
async function startLesson() {
  clkStart = Date.now(); store.set("clk", clkStart); clkDraw();
  const n = await newSession(); toast(n ? `⏱ Сабақ басталды! Дайындықтағы ${n} оқушы тазаланды` : "⏱ Сабақ басталды! Сәттілік!");
  if (ST[cur].id === "invite") go(1, true); else { render(); paintTimer(); }
}
$("#clock").onclick = () => { if (clkStart) { if (!confirm("Сабақ сағатын тоқтатамыз ба? Келесі ▶ басылғанда барлық нәтиже тазаланады.")) return; clkStart = null; store.set("clk", null); clkDraw(); return; } startLesson(); };
function setRun(v) { run = v; clearInterval(tick); if (run && ST[cur].min) tick = setInterval(() => { const id = ST[cur].id; left[id] = Math.max(0, secOf(cur) - 1); store.set("left", left); paintTimer(); if (left[id] === 0) timeUp(); }, 1000); else run = false; paintTimer(); }
function timeUp() {
  setRun(false); if (cur >= ST.length - 1) { toast("Сабақ аяқталды. Рахмет!"); return; }
  let n = 5; const o = $("#over"); o.hidden = false; const res = $("#resList")?.innerHTML || "";
  const draw = () => o.innerHTML = `<div class="ob"><div class="lbl">Уақыт бітті</div><b>${n}</b>${res ? `<div class="ob-res">${res}</div>` : ""}<p>Келесі: <strong>${esc(ST[cur + 1].title)}</strong></p><div class="trow c"><button class="btn lt" id="stay">Қалу (+1 мин)</button><button class="btn" id="goNow">Қазір өту →</button></div></div>`;
  draw(); clearInterval(autoT);
  autoT = setInterval(() => { n--; if (n <= 0) { clearInterval(autoT); o.hidden = true; go(cur + 1, true); } else draw(); }, 1000);
  o.onclick = e => { if (e.target.id === "stay") { clearInterval(autoT); o.hidden = true; left[ST[cur].id] = 60; setRun(true); } if (e.target.id === "goNow") { clearInterval(autoT); o.hidden = true; go(cur + 1, true); } };
}
function go(i, autoRun) {
  cur = Math.max(0, Math.min(ST.length - 1, i)); const s = ST[cur];
  history.replaceState(null, "", location.search + "#" + s.id);
  $("#partLbl").textContent = DATA.parts[s.part] + ` · ${cur + 1}/${ST.length}`; $("#stLbl").textContent = s.title;
  document.body.classList.toggle("inviting", s.id === "invite");
  road(); render(); setRun(!!autoRun && !!s.min); paintTimer();
  if (LIVE.on() && s.id !== "invite") LIVE.setStage(s.id).catch(() => {});
}
$("#prev").onclick = () => go(cur - 1); $("#next").onclick = () => go(cur + 1, run);
$("#road").onclick = e => { const b = e.target.closest("[data-go]"); if (b) go(+b.dataset.go); };
$("#play").onclick = () => setRun(!run);
$("#fs").onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
addEventListener("keydown", e => { if (e.target.closest("input,textarea")) return; if (e.key === "ArrowRight" || e.key === "PageDown") $("#next").click(); if (e.key === "ArrowLeft" || e.key === "PageUp") $("#prev").click(); if (e.key === " ") { e.preventDefault(); setRun(!run); } });
$$("[data-close]").forEach(b => b.onclick = () => b.closest(".modal").hidden = true);
$("#qrBtn").onclick = () => { const s = ST[cur], g = s.id === "feedback" || s.id === "invite"; const u = link(g ? "g" : "s", TASKS.includes(s.id) ? s.id : ""); $("#qrT").textContent = g ? "Қонақтар мен мұғалімдерге: кері байланыс" : "Оқушыларға: экосканерге қосылу"; $("#qrBig").innerHTML = qrSvg(u); $("#qrUrl").textContent = u; $("#qrModal").hidden = false; };

/* ---------- кезеңдер ---------- */
const HD = (s, p, tag) => `<div class="hd"><span class="k">${esc(s.kicker)}${s.min ? " · " + s.min + " мин" : ""}</span>${s.val ? `<span class="seal">Адал азамат · ${esc(s.val)}</span>` : ""}<h2>${esc(s.title)}</h2>${p ? `<p>${p}</p>` : ""}${tag ? `<div class="tag">${tag}</div>` : ""}</div>`;
const modeBadge = s => `<span class="mode m-${s.mode === "Жеке" ? "i" : s.mode === "Жұппен" ? "p" : "g"}">${s.mode === "Жеке" ? "👤" : s.mode === "Жұппен" ? "👥" : "👨‍👩‍👧"} ${s.mode}</span> <span class="mode m-c">${s.crit} · ${PTS[s.id]} ұпай</span>`;
const howStrip = id => `<div class="how">${DATA.how[id].map((h, i) => `<div style="animation-delay:${i * .15}s"><i>${i + 1}</i>${esc(h)}</div>`).join(`<span>→</span>`)}</div>`;
const resPanel = id => `<aside class="side"><div class="card res-c"><div class="res-h"><div class="qrmini">${qrSvg(link("s", id))}</div><div><div class="lbl">Нәтижелер · тірі</div><div class="res-n" id="resN">—</div></div></div><div class="res-list" id="resList"><p class="muted sm">Оқушылар орындаған сайын осында шығады</p></div></div></aside>`;
let lt = 0;
const R = {
  invite: () => `<div class="st"><div class="body inv"><div class="inv-card"><div class="inv-ph" style="background-image:url(media/p1.jpg)"></div>
      <div class="inv-in"><div class="lbl gold">Құрметті әріптестер, қонақтар!</div><h1>Сіздерді <span>ашық сабаққа</span> шақырамыз</h1>
      <div class="inv-topic">«${esc(L.topic)}»</div><p class="inv-sub">Экосканер: нақты деректерді сарапшыдай жіктейміз</p>
      <div class="inv-grid"><div><i>📅</i><b>${L.date}</b><small>${L.day}</small></div><div><i>⏱️</i><b>${L.time}</b><small>45 минут</small></div><div><i>🏫</i><b>${L.room}</b><small>${L.cls}</small></div><div><i>📖</i><b>География</b><small>${esc(L.para)}</small></div></div>
      <p class="inv-t">Пән мұғалімі: <b>${esc(L.teacher)}</b><br>${esc(L.school)}</p></div></div>
      <div class="inv-side"><div class="card fcol c"><div class="lbl">Қонақтарға · кері байланыс</div><div class="qrbox">${qrSvg(link("g"))}</div><p class="muted sm">Сабақ соңында пікіріңізді осы QR арқылы қалдырыңыз</p></div>
      <button class="btn big go" id="startBtn">▶ Сабақты бастау</button><p class="muted sm c">Басқанда 45 минуттық сағат іске қосылады, дайындық нәтижелері тазаланады</p></div></div></div>`,
  welcome: s => `<div class="st">${HD(s, "Құрметті қонақтар, жас сарапшылар! Бүгін біз қоршаған ортаның «анализін» оқуды үйренеміз.")}<div class="body wel2">
      <div class="hook" style="background-image:url(media/p3.jpg)"><div class="hook-in"><span class="phen">Феномен: неге қыста Астананың үстінде түтін тұрады?</span><div class="lbl">Астана: жеке үйлердің 73–80%-ы көмірмен жылытылады · 2026 жылғы нақты деректер</div><h3>Бұлардың қайсысы қауіпті? Оны қалай білеміз?</h3>
      <div class="hooks">${DATA.hook.map(([a, b], i) => `<div style="animation-delay:${.3 + i * .2}s"><em>?</em><b>${a}</b><span>${esc(b)}</span></div>`).join("")}</div><div class="lbl" style="margin-top:14px">🧪 Тәжірибе: екі банка қар сүзгіде — қай сүзгі қараяды? Жауабы сабақ соңында!</div></div></div>
      <div class="card fcol c join"><div class="lbl">Экосканерге қосыл</div><div class="qrbox">${qrSvg(link("s"))}</div><p class="muted sm">QR → аты-жөнің → тобың</p>
      <div class="groups">${Object.entries(DATA.groups).map(([k, g]) => `<div style="--gc:${g.c}"><i>${g.i}</i>${g.n}<b data-gc="${k}">0</b></div>`).join("")}</div><div class="bigjoin"><b class="join-n">—</b><span>оқушы қосылды</span></div></div></div></div>`,
  goals: s => `<div class="st">${HD(s, `Оқу мақсаты: <b>${esc(L.goal)}</b>`)}<div class="body cols2"><div class="card"><h3>🎯 Бағалау критерийлері</h3><div class="crit">${DATA.criteria.map(([k, d, t]) => `<div><b>${k}</b><span>${esc(d)}<small> · ${t}</small></span></div>`).join("")}</div></div>
    <div class="card"><h3>📈 Күтілетін нәтиже</h3><div class="tiers">${DATA.tiers.map(([a, b], i) => `<div style="animation-delay:${.3 + i * .15}s"><b>${a}:</b> ${esc(b)}</div>`).join("")}</div><p class="muted sm" style="margin-top:14px">Оқулық §22 (89–94-б.) + Қазгидромет 2026 бюллетендерінің нақты деректері. Феноменге негізделген оқыту: жергілікті (Астана, Қарағанды обл.) деректер арқылы жалпы заңдылықты түсінеміз.</p></div></div></div>`,
  rules: s => `<div class="st">${HD(s, "Сарапшылар кодексі")}<div class="body rules">${DATA.rules.map(([i, t, d], k) => `<div class="card rule" data-n="${k + 1}" style="animation-delay:${k * .1}s"><div class="ic">${i}</div><h4>${esc(t)}</h4><p>${esc(d)}</p></div>`).join("")}</div></div>`,
  assess: s => `<div class="st">${HD(s, `6 тапсырма · барлығы <b>${MAXP} ұпай</b> → пайыз → <b>1–10 балл</b>. Ұпайлар тақтаға автоматты түседі, әр оқушы өз телефонынан тек өз нәтижесін көреді.`)}<div class="body cols2"><div class="card"><h3>Тапсырмалар мен ұпай</h3><div class="pbars">${TASKS.map(k => { const t = ST.find(x => x.id === k); return `<div class="pbar"><span>${esc(t.title.split(" · ")[1])} <small>${t.mode} · ${t.crit}</small></span><i style="width:${PTS[k] / 8 * 100}%"></i><b>${PTS[k]}</b></div>`; }).join("")}</div></div>
    <div class="card"><h3>Деңгейлер</h3><div class="scale v"><div style="background:#E8F8F1;color:#00799A">Жоғары · 85%+ · 9–10 балл</div><div style="background:#E0F2FE;color:#0369A1">Орта · 50–84% · 5–8 балл</div><div style="background:#FEF3C7;color:#92400E">Қолдау қажет · 50%-ға дейін</div></div><p class="muted sm" style="margin-top:12px">3-тапсырмада топтың қорғауына мұғалім +1/+2 бонус береді.</p></div></div></div>`,
  video: s => `<div class="st">${HD(s, "1 минут 55 секунд: оқулықтағы 4 сызба + Қазгидрометтің 2026 жылғы нақты деректері")}<div class="body vid"><div class="card" style="padding:10px"><video controls preload="metadata" poster="media/poster.jpg" playsinline><source src="media/ekoskaner.mp4" type="video/mp4"></video></div></div></div>`,
  learn: s => `<div class="st">${HD(s, "Оқулықтағы 25–28-сызбалар · әр қадамда нақты мысал және жедел сұрақ", "ЖАҢА САБАҚ")}<div class="body learn"><div class="lnav" id="lnav">${DATA.learnTabs.map((t, i) => `<button data-l="${i}">${esc(t.t)}</button>`).join("")}</div><div id="lbox" class="lbox"></div></div></div>`,
  t1: s => `<div class="st">${HD(s, "Қазгидромет 2026 бюллетенінен алынған 12 нақты көрсеткішті 25-сызба бойынша 4 ортаға жікте.", modeBadge(s))}<div class="body task">${howStrip("t1")}<div class="card tk" id="tk"></div>${resPanel("t1")}</div></div>`,
  t2: s => `<div class="st">${HD(s, "26-сызба (нормативтер) және ҚР ДСМ-70 нормативтері (қауіптілік кластары). Жұбыңмен талқылап, бір телефоннан жауап бер.", modeBadge(s))}<div class="body task">${howStrip("t2")}<div class="card tk" id="tk"></div>${resPanel("t2")}</div></div>`,
  t3: s => `<div class="st">${HD(s, "Әр топ — бір қаланың «экологиялық анализі». Деңгейді анықта, басты ластаушыны тап, ұсыныс жаз — 1 минут қорға.", modeBadge(s))}<div class="body t3b">${howStrip("t3")}<div class="dos3">${Object.keys(DATA.groups).map(g => { const D = DATA.t3[g], G = DATA.groups[g];
      return `<div class="dos" style="--gc:${G.c}"><div class="dos-h">${G.i} <b>${esc(G.n)}</b><span>${esc(D.period)}</span></div><div class="dos-g">${gauge(D.si, D.ez)}<div class="dos-k"><div><small>СИ</small><b>${fmt(D.si)}</b></div><div><small>ЕЖҚ</small><b>${fmt(D.ez)}%</b></div></div></div>${hbars(D.air.slice(0, 4), Math.max(...D.air.map(a => a[1])) * 1.1)}<ul class="dos-f">${D.facts.slice(0, 2).map(f => `<li>${esc(f)}</li>`).join("")}</ul>
      <div class="dos-r" id="gr-${g}"><p class="muted sm">Топтың жауабы күтілуде… 📡</p></div><div class="bon">Қорғау: <button data-bonus="${g}" data-v="1">+1</button><button data-bonus="${g}" data-v="2">+2</button><b id="bo-${g}"></b></div></div>`; }).join("")}</div>
      </div></div>`,
  t4: s => `<div class="st">${HD(s, "Оқулық, 93–94-б.: C₁/ШШК₁ + C₂/ШШК₂ < 1 болуы тиіс. ЖИ жауабын да, оқулықты да тексер — шешім сенікі!", modeBadge(s))}<div class="body task">${howStrip("t4")}<div class="card tk" id="tk"></div>${resPanel("t4")}</div></div>`,
  t5: s => `<div class="st">${HD(s, "27–28-сызбалар: мониторинг кезеңдері, әдістері, деңгейлері + «Адал азамат»: ластануды көрсең, не істейсің?", modeBadge(s))}<div class="body task">${howStrip("t5")}<div class="card tk" id="tk"></div>${resPanel("t5")}</div></div>`,
  t6: s => `<div class="st">${HD(s, "6 сұрақ — 3 минут. Телефоннан жауап бер, жүйе бірден тексереді.", modeBadge(s))}<div class="body task">${howStrip("t6")}<div class="card tk" id="tk"></div>${resPanel("t6")}</div></div>`,
  sum: s => `<div class="st">${HD(s, "Сканерлеу аяқталды: не үйрендік, кім үздік, қай критерийді меңгердік?", "ҚОРЫТЫНДЫ")}<div class="body sumb">
    <div class="card"><h3>🏆 Үздік сарапшылар</h3><div class="lead" id="lead"><p class="muted">Нәтижелер Firebase арқылы тірі шығады.</p></div><h3 style="margin-top:14px">Топтар</h3><div class="gbars" id="gbars"></div></div>
    <div class="card"><h3>📊 Критерийлерді меңгеру (сынып)</h3><div class="kbars" id="kbars"></div><div class="live" id="clsBox" style="margin-top:14px"></div></div>
    <div class="card"><h3>🌳 Жіктеу ағашы</h3><div class="tree2"><div class="tr-root">Қоршаған орта сапасы</div><div class="tr-br">${[["Ортасы", "ауа · су · топырақ · экожүйе"], ["Норматив", "4 түр · I–IV класс"], ["Деңгей", "СИ/ЕЖҚ · су 1–6 класс"], ["Мониторинг", "4 кезең · 3 әдіс · 4 деңгей"]].map(([a, b], i) => `<div style="animation-delay:${.3 + i * .2}s"><b>${a}</b><small>${b}</small></div>`).join("")}</div></div><div class="vlist">${DATA.verdict.map((v, i) => `<div style="animation-delay:${1 + i * .2}s">${esc(v)}</div>`).join("")}</div></div></div></div>`,
  feedback: s => `<div class="st">${HD(s, "Оқушылар: «Менің аспаным» + эко-уәде · Мұғалімдер, әріптестер, қонақтар: жұлдыз + ұнағаны + ұсыныс")}<div class="body fb"><div class="card fcol"><h3>☀️ Сыныптың аспаны</h3><div class="sky" id="sky">${DATA.selfCheck.map(([i, t], k) => `<button data-sk="${k}"><i>${i}</i>${t}<b>0</b></button>`).join("")}</div>
    <div class="fbqr"><div><div class="qrbox s">${qrSvg(link("s", "feedback"))}</div><small>Оқушыларға</small></div><div><div class="qrbox s">${qrSvg(link("g"))}</div><small>Қонақтарға</small></div></div><p class="muted sm" id="starAvg">⭐ Қонақтардың бағасы осында шығады</p></div>
    <div class="card fcol wallc"><div class="tabs" id="wtabs"><button class="on" data-w="all">Барлығы</button><button data-w="s">🎓 Оқушылар</button><button data-w="g">🎩 Мұғалімдер мен қонақтар</button><span class="wn" id="wn"></span></div><div class="wall" id="wall"></div></div></div></div>`,
  home: s => `<div class="st">${HD(s, "Сканер жұмысын жалғастырамыз — енді өз ауданыңда!")}<div class="body hw">${DATA.homework.map((h, i) => `<div class="card hwc" style="animation-delay:${i * .15}s"><div class="big3">${h.i}</div><span class="pill lv">${esc(h.lv)}</span><p>${esc(h.t)}</p></div>`).join("")}</div></div>`,
  bye: s => `<div class="st"><div class="body bye2" style="background-image:url(media/p1.jpg)"><div class="bye-in"><div class="lbl gold">Экосканер · сабақ аяқталды</div><h1>Рахмет!</h1><p class="wish">${esc(DATA.wish)}</p><p class="by">Құрметті қонақтар, сабағымызға келгендеріңізге рахмет! · ${esc(L.teacher)}</p></div></div></div>`
};

/* ---------- жаңа сабақ: 6 бөлім ---------- */
const LEARN = [
  () => `<div class="l1"><div class="diag2">${DATA.indicators.map(([i, t, c, ex], k) => `<div class="tile" style="background:linear-gradient(150deg,${c},#0B3D3A);animation-delay:${k * .15}s"><i>${i}</i><b>${t}</b><small>${esc(ex)}</small></div>`).join("")}<div class="dc">Адамның өмір сүру ортасының сапасының көрсеткіштері<small>25-сызбанұсқа</small></div></div></div>`,
  () => `<div class="l2"><div class="norms4">${DATA.norms.map(([i, t, d], k) => `<div class="card" style="animation-delay:${k * .12}s"><div class="ic2">${i}</div><b>${t}</b><p>${esc(d)}</p></div>`).join("")}</div><div class="eff"><span class="lbl">Зиянды заттың әсер ету сатылары (90-б.)</span><div>${DATA.effects.map((e, i) => `${i ? "<em>→</em>" : ""}<b style="animation-delay:${.6 + i * .2}s;background:${["#065F46", "#92400E", "#9A3412", "#991B1B"][i]}">${e}</b>`).join("")}</div></div><p class="def"><b>ШШК (ШЖШ)</b> — адамның жұмыс қабілетін төмендетпейтін, оған және келешек ұрпаққа зиян тигізбейтін ластаушы заттың ең жоғары мөлшері.</p></div>`,
  () => `<div class="hz4">${DATA.hazard.map(([k, t, c, items], i) => `<div style="background:linear-gradient(160deg,${c},#1f2937);animation-delay:${i * .12}s"><b>${k}</b><span>${t}</span>${items.map(x => `<em>${esc(x)}</em>`).join("")}</div>`).join("")}</div><p class="def c">Класс неғұрлым <b>кіші</b> болса, зат соғұрлым <b>қауіпті</b>.</p>`,
  () => `<div class="l4"><div class="lv4">${DATA.grad.map(([n, si, ez, c], i) => `<div class="lvc"><div class="h" style="background:${c}">${n}<span>СИ ${si} · ЕЖҚ ${ez}</span></div>${DATA.cities.filter(x => x.lv === i).map((x, j) => `<div class="city" style="animation-delay:${.5 + i * .35}s"><b>${x.n}</b><div class="v">СИ <span>${fmt(x.si)}</span> · ЕЖҚ <span>${fmt(x.ez)}%</span></div><small>${esc(x.note)}</small></div>`).join("")}${i === 2 ? `<div class="city" style="animation-delay:1.4s"><b>Астана</b><div class="v">СИ <span>8,7</span> · ЕЖҚ <span>12%</span></div><small>2026 ж. 2-тоқсан</small></div>` : ""}</div>`).join("")}</div>
    <div class="card chart l4c"><div class="lbl">Қарағанды 🟥 мен Теміртау 🟧 · СИ, 2022–2026 (1-жартыжылдық)</div>${chartTrend(560, 250)}<p class="rule2">Ереже: СИ мен ЕЖҚ-ның <b>қайсысы жоғары</b> болса, деңгей соған қарай анықталады.</p></div></div>`,
  () => `<div class="l5"><div class="wcl">${DATA.water.map(([n, t, c, ex], i) => `<div style="background:${c};animation-delay:${i * .1}s"><b>${n}</b><span>${t}</span><small>${esc(ex)}</small></div>`).join("")}</div><div class="fcol"><div class="card wx"><div class="ic2">🌊</div><div><b>Есіл (Астана)</b><p>2025 ж. — 3-класс → 2026 ж. — <b class="red">5-класс</b>. Қалқыма заттар — 14,13 мг/дм³</p></div></div><div class="card wx"><div class="ic2">🧪</div><div><b>Соқыр өзені — 6-класс</b><p>Аммоний 8,62, фосфаттар 3,976 мг/дм³</p></div></div><div class="card wx"><div class="ic2">✅</div><div><b>Сәтбаев каналы: 4 → 3</b><p>Жақсару мысалы</p></div></div><p class="def c">Класы неғұрлым <b>үлкен</b> болса, су соғұрлым <b>лас</b>.</p></div></div>`,
  () => `<div class="l6"><div class="flow">${DATA.monitor.map(([i, t], k) => `${k ? `<div class="ar">→</div>` : ""}<div style="animation-delay:${k * .15}s"><em>${i}</em><b>${k + 1}</b><span>${t}</span></div>`).join("")}</div><div class="l6b"><div class="card"><div class="lbl">Бағалау әдістері (28-сызба)</div>${DATA.methods.map(([i, a, b]) => `<p class="mth">${i} <b>${a}</b> — ${b}</p>`).join("")}</div><div class="card"><div class="lbl">Мониторинг деңгейлері</div><div class="lvls">${DATA.levels.map(([i, t]) => `<span>${i} ${t}</span>`).join("<em>→</em>")}</div><p class="mth">Астанада: <b>10 бекет</b> (4 қолмен, 6 автомат) · <b>24 көрсеткіш</b> · 11 нүктеде жылжымалы зертхана</p></div></div></div>`
];
function learn(i) {
  lt = i; const T = DATA.learnTabs[i];
  $("#lbox").innerHTML = `<div class="lpane">${LEARN[i]()}</div><div class="lfoot"><div class="ask">❓ <b>Жедел сұрақ:</b> ${esc(T.ask)}</div><div class="src2">📚 ${esc(T.src)}</div></div>`;
  $$("#lnav button").forEach((b, k) => b.classList.toggle("on", k === i));
}

function render() {
  const s = ST[cur]; document.body.dataset.part = s.part; $("#main").innerHTML = R[s.id](s); seen.clear();
  if (s.id === "invite") $("#startBtn").onclick = () => clkStart ? go(1, true) : startLesson();
  if (s.id === "learn") { learn(lt); $("#lnav").onclick = e => { const b = e.target.closest("[data-l]"); if (b) learn(+b.dataset.l); }; }
  if (TASK[s.id] && $("#tk")) TASK[s.id]($("#tk"));
  if (s.id === "t3") $$("[data-bonus]").forEach(b => b.onclick = async () => { const g = b.dataset.bonus, bo = store.get("bonus", {}); bo[g] = +b.dataset.v; store.set("bonus", bo); if (LIVE.on()) try { await LIVE.pushGroup(g + "/bonus", bo[g]); } catch {} toast(`${DATA.groups[g].n}: қорғау +${bo[g]}`); liveTick(); });
  if (s.id === "feedback") { $("#wtabs").onclick = e => { const b = e.target.closest("[data-w]"); if (b) { wtab = b.dataset.w; $$("#wtabs button").forEach(x => x.classList.toggle("on", x === b)); liveTick(); } }; }
  liveTick();
}

/* ---------- тірі деректер ---------- */
let liveT = null, wtab = "all"; const seen = new Set();
async function liveTick() {
  clearTimeout(liveT); const id = ST[cur].id;
  let d = {}; if (LIVE.on()) { try { d = await LIVE.read(); } catch {} }
  const studs = Object.entries(d.students || {}).map(([k, v]) => ({ id: k, ...v })), grp = d.groups || {};
  const notes = [...Object.values(d.notes || {}), ...store.get("notes", [])].sort((a, b) => b.ts - a.ts);
  const bonus = { ...store.get("bonus", {}) }; Object.entries(grp).forEach(([g, v]) => { if (v && v.bonus != null) bonus[g] = v.bonus; });
  const totOf = x => TASKS.reduce((t, k) => t + (k === "t3" ? ((grp[x.g]?.sub?.ok ?? x.sc?.t3 ?? 0) + (bonus[x.g] || 0)) : (x.sc?.[k] || 0)), 0);
  // есептегіш
  $$(".join-n").forEach(b => b.textContent = LIVE.on() ? studs.length : "—"); $("#joinChip").classList.toggle("off", !LIVE.on());
  $$("[data-gc]").forEach(b => b.textContent = studs.filter(x => x.g === b.dataset.gc).length);
  // тапсырма нәтижелері
  const rl = $("#resList");
  if (rl && TASKS.includes(id)) {
    if (!LIVE.on()) rl.innerHTML = `<p class="muted sm">Firebase қосылғанда оқушылардың нәтижесі осында тірі шығады (⚙)</p>`;
    else { const done = studs.filter(x => x.at && x.at[id]).sort((a, b) => a.at[id] - b.at[id]), mx = PTS[id];
      $("#resN").innerHTML = `<b>${done.length}</b>/${studs.length} орындады${done.length ? ` · орташа <b>${fmt(done.reduce((t, x) => t + (x.sc[id] || 0), 0) / done.length)}</b>/${mx}` : ""}`;
      rl.innerHTML = done.length ? done.map((x, i) => { const v = x.sc[id] || 0, c = v >= mx ? "full" : v >= mx / 2 ? "mid" : "low", nw = !seen.has(x.id + id); seen.add(x.id + id);
        return `<div class="rr ${c} ${nw ? "new" : ""}"><i>${i + 1}</i><b>${esc(x.name)}${id === "t2" && x.pair ? ` <small>+ ${esc(x.pair)}</small>` : ""}</b><span>${DATA.groups[x.g]?.i || ""}</span><em>${v}/${mx}</em><time>${hm(x.at[id])}</time></div>`; }).join("") : `<p class="muted sm">Әзірге ешкім аяқтамады…</p>`; }
  }
  if (id === "t3") Object.keys(DATA.groups).forEach(g => { const box = $("#gr-" + g); if (!box) return; const sub = grp[g]?.sub; $("#bo-" + g).textContent = bonus[g] ? `+${bonus[g]} ✓` : "";
    if (sub) box.innerHTML = `<div class="sub"><div class="ans">${sub.ans.map((a, i) => `<span class="${a === DATA.t3.qs[i].o[DATA.t3[g].a[i]] ? "ok" : "no"}">${i + 1}) ${esc(a)}</span>`).join("")}</div>${sub.idea ? `<p class="idea">💡 ${esc(sub.idea)}</p>` : ""}<div class="gsc">${sub.ok}/3 ${bonus[g] ? `+ ${bonus[g]}` : ""} · ${esc(sub.by)}</div></div>`; });
  if (id === "sum") {
    const rows = studs.map(x => ({ ...x, T: totOf(x) })).sort((a, b) => b.T - a.T);
    if (rows.length) $("#lead").innerHTML = rows.slice(0, 6).map((x, i) => `<div><i>${["🥇", "🥈", "🥉"][i] || i + 1}</i><span>${esc(x.name)} ${DATA.groups[x.g]?.i || ""}</span><span>${x.T}/${MAXP} · <b>${mark(x.T).m}</b></span></div>`).join("");
    const gs = Object.entries(DATA.groups).map(([k, g]) => { const m = rows.filter(x => x.g === k), avg = m.length ? m.reduce((t, x) => t + x.T, 0) / m.length : 0; return [g, avg]; }), mx = Math.max(1, ...gs.map(x => x[1]));
    $("#gbars").innerHTML = gs.map(([g, v]) => `<div class="gb"><span>${g.i} ${esc(g.city)}</span><div class="tr"><i style="width:${v / mx * 100}%;background:${g.c}"></i></div><b>${fmt(v)}</b></div>`).join("");
    const K = [["К1", ["t1"]], ["К2", ["t2"]], ["К3", ["t3", "t4"]], ["К4", ["t5"]]];
    $("#kbars").innerHTML = K.map(([k, ts]) => { const mxk = ts.reduce((t, x) => t + PTS[x], 0); const done = rows.filter(x => ts.some(t => x.at?.[t])); const p = done.length ? done.reduce((t, x) => t + ts.reduce((a, tt) => a + (tt === "t3" ? (grp[x.g]?.sub?.ok ?? x.sc?.t3 ?? 0) : (x.sc?.[tt] || 0)), 0), 0) / done.length / mxk * 100 : 0;
      return `<div class="kb"><b>${k}</b><div class="tr"><i style="width:${p}%"></i></div><span>${Math.round(p)}%</span></div>`; }).join("");
    const all = rows.map(x => mark(x.T)); $("#clsBox").innerHTML = rows.length ? ["Жоғары", "Орта", "Қолдау қажет"].map(l => `<div><b>${all.filter(m => m.lv === l).length}</b><small>${l}</small></div>`).join("") : `<div><small>Сынып нәтижесі Firebase арқылы шығады</small></div>`;
  }
  if (id === "feedback") {
    const list = notes.filter(n => wtab === "all" || (wtab === "s" ? n.role === "Оқушы" : n.role !== "Оқушы"));
    $("#wn").textContent = `${notes.length} пікір`;
    $("#wall").innerHTML = list.slice(0, 24).map((n, i) => `<div class="note ${n.role === "Оқушы" ? "ns" : "ng"}" style="--r:${(i % 3 - 1) * 1.2}deg"><div class="who">${n.role === "Оқушы" ? "🎓" : n.role === "Мұғалім" ? "👩‍🏫" : n.role === "Әріптес" ? "🤝" : "🎩"} ${esc(n.role)}${n.name ? " · " + esc(n.name) : ""}${n.stars ? ` <span class="stx">${"★".repeat(n.stars)}</span>` : ""}${n.sky != null ? ` ${DATA.selfCheck[n.sky][0]}` : ""}</div>${n.like ? `<p>${esc(n.like)}</p>` : ""}${n.wish ? `<p class="idea">💡 ${esc(n.wish)}</p>` : ""}</div>`).join("") || `<p class="muted">Пікірлер QR арқылы жіберілген сайын осында пайда болады…</p>`;
    const st = notes.filter(n => n.stars); if (st.length) $("#starAvg").textContent = `⭐ Қонақтардың орташа бағасы: ${fmt(st.reduce((t, n) => t + n.stars, 0) / st.length)} / 5 · ${st.length} баға`;
    const sky = [0, 0, 0, 0]; studs.forEach(x => { if (x.sky != null) sky[x.sky]++; }); $$("#sky button").forEach((b, k) => $("b", b).textContent = sky[k]);
  }
  liveT = setTimeout(liveTick, LIVE.on() ? 3500 : 15000);
}

/* ---------- мұғалім панелі ---------- */
async function excel() {
  let d = {}; if (LIVE.on()) { try { d = await LIVE.read(); } catch {} }
  const studs = Object.values(d.students || {}), grp = d.groups || {}; if (!studs.length) { toast("Әзірге нәтиже жоқ"); return; }
  const bonus = {}; Object.entries(grp).forEach(([g, v]) => bonus[g] = v?.bonus || 0);
  const q = v => { v = String(v ?? ""); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const head = ["№", "Оқушы", "Топ", "Жұбы", ...TASKS.map(k => `${ST.find(x => x.id === k).title.split(" · ")[1]} (${PTS[k]})`), `Барлығы (${MAXP})`, "%", "Балл (1–10)", "Деңгей"];
  const rows = studs.map(x => { const t3 = (grp[x.g]?.sub?.ok ?? x.sc?.t3 ?? 0) + (bonus[x.g] || 0); const vals = TASKS.map(k => k === "t3" ? t3 : (x.sc?.[k] ?? "")); const T = vals.reduce((a, b) => a + (+b || 0), 0); return [x.name, DATA.groups[x.g]?.n || "", x.pair || "", ...vals, T]; })
    .sort((a, b) => b[b.length - 1] - a[a.length - 1]).map((r, i) => { const T = r[r.length - 1], m = mark(T); return [i + 1, ...r, m.p, m.m, m.lv]; });
  const info = [[`География · 11-сынып · «${L.topic}» (§22) · ${L.teacher}`], [`Күні: ${new Date().toLocaleDateString("kk-KZ")} · Оқушылар: ${studs.length}`], []];
  const csv = "﻿" + [...info, head, ...rows].map(r => r.map(q).join(";")).join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = `Ekoskaner_natizheler_${new Date().toISOString().slice(0, 10)}.csv`; document.body.append(a); a.click(); a.remove(); toast("📥 Excel файлы жүктелді");
}
$("#gear").onclick = () => {
  $("#gearBody").innerHTML = `<p class="muted">Бұл панель оқушыларға көрінбейді. Пернетақта: ← → — кезең, бос орын — таймер.</p>
  <div class="gear-grid"><button id="gXls"><b>📥 Excel-ге жүктеу</b><small>Барлық оқушының ұпайы</small></button><button id="gKmj"><b>📋 Сабақ жоспары</b><small>Кезеңдер мен уақыт</small></button><button id="gReset"><b>⏱ Таймерлерді қайта бастау</b><small>Кезең таймерлері</small></button>
  <button id="gClear"><b>🧹 Нәтижелерді тазалау</b><small>Firebase + осы құрылғы</small></button><button id="gSrc"><b>📚 Дереккөздер</b><small>Оқулық, Қазгидромет, ДСМ-70</small></button></div>
  <h4 style="margin-top:18px">Firebase (тірі нәтижелер) ${LIVE.on() ? "✅ қосулы" : "— өшірулі"}</h4><div class="trow"><input class="inp" id="fbUrl" placeholder="https://ЖОБА-default-rtdb.firebaseio.com" value="${esc(LIVE.url || "")}"><button class="btn" id="fbSave">Сақтау</button></div><p class="sm" id="fbMsg"></p><div id="gOut" style="margin-top:14px"></div>`;
  $("#gearModal").hidden = false;
  $("#gXls").onclick = excel;
  $("#fbSave").onclick = async () => { LIVE.setUrl($("#fbUrl").value); try { await LIVE.test(); $("#fbMsg").textContent = "✓ Қосылды"; render(); } catch { $("#fbMsg").textContent = "✗ Қосылмады: мекенжай мен ережелерді (Rules) тексеріңіз"; } };
  $("#gReset").onclick = () => { Object.keys(left).forEach(k => delete left[k]); store.set("left", {}); setRun(false); toast("Таймерлер қайта басталды"); };
  $("#gClear").onclick = async () => { if (!confirm("Барлық нәтиже өшіріледі. Жалғастырамыз ба?")) return; await newSession(); toast("Тазаланды"); render(); };
  $("#gKmj").onclick = () => { let t = 0; $("#gOut").innerHTML = `<div class="kmj"><table><tr><th>Кезең</th><th>Уақыт</th><th>Әрекет</th></tr>${ST.filter(s => s.min).map(s => { const a = t; t += s.min; return `<tr><td>${esc(DATA.parts[s.part])}</td><td>${a}–${t} мин</td><td><b>${esc(s.title)}</b>${s.mode ? `<br><span class="muted">${s.mode} · ${s.crit} · ${PTS[s.id]} ұпай</span>` : ""}</td></tr>`; }).join("")}</table></div>`; };
  $("#gSrc").onclick = () => { $("#gOut").innerHTML = `<ul>${DATA.sources.map(s => `<li style="margin:6px 0">${esc(s)}</li>`).join("")}</ul>`; };
};

if (cur < 0) cur = 0;
go(cur);
})();
