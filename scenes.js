/* Уақыт машинасына арналған анимациялық иллюстрациялар (SVG, 1200×420) */
window.SCENES = (() => {
  const C = { sky1: "#e8f9fd", sky2: "#9fe0f0", flag: "#00AFCA", flag2: "#0089B5", gold: "#FEC50C", gold2: "#E0A400", ink: "#0B2545", st1: "#f3d27a", st2: "#d9b25a", st3: "#9ccf8f", white: "#ffffff", red: "#e2552f" };
  const base = (night) => `
  <defs>
    <linearGradient id="sk" gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="420"><stop offset="0" stop-color="${night ? "#b8e6f3" : C.sky1}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient>
    <radialGradient id="sn"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
    <linearGradient id="h1" gradientUnits="userSpaceOnUse" x1="0" y1="310" x2="0" y2="420"><stop offset="0" stop-color="#f6dd8f"/><stop offset="1" stop-color="#e6bf5e"/></linearGradient>
    <linearGradient id="h2" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="420"><stop offset="0" stop-color="#bfe3a8"/><stop offset="1" stop-color="#8fc77c"/></linearGradient>
  </defs>
  <rect x="-1500" y="-1200" width="4200" height="1700" fill="url(#sk)"/>
  <g class="sc-sun"><circle cx="1010" cy="95" r="120" fill="url(#sn)" opacity=".85"/><circle cx="1010" cy="95" r="46" fill="${C.gold}"/>
    <g class="sc-rays" style="transform-origin:1010px 95px">${Array.from({ length: 16 }, (_, i) => `<rect x="1008" y="20" width="4" height="22" rx="2" fill="${C.gold2}" transform="rotate(${i * 22.5} 1010 95)"/>`).join("")}</g></g>
  <g class="sc-cloud"><ellipse cx="220" cy="80" rx="70" ry="20" fill="#fff" opacity=".85"/><ellipse cx="260" cy="70" rx="45" ry="22" fill="#fff" opacity=".85"/></g>
  <g class="sc-cloud2"><ellipse cx="640" cy="60" rx="60" ry="16" fill="#fff" opacity=".7"/></g>
  <path d="M-1500 300 H2 V420 H-1500Z M1198 250 H2700 V420 H1198Z" fill="url(#h2)"/>
  <path d="M0 300 C200 250 380 290 560 265 C760 238 950 280 1200 250 V420 H0Z" fill="url(#h2)"/>
  <path d="M0 340 C240 310 460 345 700 322 C900 304 1050 330 1200 318 V420 H0Z" fill="url(#h1)"/>
  <path d="M-1500 340 H2 V1500 H-1500Z M1198 318 H2700 V1500 H1198Z M0 410 H1200 V1500 H0Z" fill="url(#h1)"/>
  <path d="M0 340 C240 310 460 345 700 322 C900 304 1050 330 1200 318" stroke="${C.gold2}" stroke-width="3" fill="none" opacity=".5"/>`;
  const yurt = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-70 0 V-40 Q0 -105 70 -40 V0Z" fill="#fff" stroke="#c9b48a" stroke-width="3"/>
    <path d="M-70 -40 Q0 -105 70 -40" fill="none" stroke="${C.gold2}" stroke-width="6"/>
    <path d="M-70 -22 H70" stroke="${C.flag}" stroke-width="7"/>
    <path d="M-62 -22 l8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6 8 6 8 -6 8 6" stroke="${C.gold}" stroke-width="2" fill="none"/>
    <rect x="-14" y="-34" width="28" height="34" rx="3" fill="${C.gold2}"/><circle cx="0" cy="-92" r="8" fill="${C.gold}"/></g>`;
  const person = (x, y, col = C.flag, s = 1, cls = "") => `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}"><circle cx="0" cy="-44" r="9" fill="#f2c9a0"/><path d="M-12 -32 Q0 -38 12 -32 L15 -6 H-15Z" fill="${col}"/><rect x="-10" y="-6" width="7" height="22" rx="3" fill="${C.ink}"/><rect x="3" y="-6" width="7" height="22" rx="3" fill="${C.ink}"/></g></g>`;
  const camel = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 -30 Q-30 -62 -14 -44 Q-4 -66 10 -44 Q22 -40 28 -50 Q34 -66 46 -64 L50 -56 Q40 -54 38 -40 L36 -26 Q30 -16 22 -18 L20 0 H14 L12 -16 H-22 L-24 0 H-30 L-32 -18 Q-44 -20 -40 -30Z" fill="#c98f4a"/><rect x="-24" y="-50" width="28" height="10" rx="3" fill="${C.flag}"/><path d="M-22 -45 h24" stroke="${C.gold}" stroke-width="2"/></g>`;
  const flag = (x, y, h = 170, cls = "") => `<g transform="translate(${x} ${y})"><rect x="-3" y="${-h}" width="6" height="${h}" fill="#7b8794"/><circle cx="0" cy="${-h - 6}" r="7" fill="${C.gold}"/>
    <g class="${cls}" style="transform-origin:3px ${-h + 6}px"><path d="M3 ${-h + 4} h140 q-8 30 0 60 h-140z" fill="${C.flag}"/><circle cx="73" cy="${-h + 30}" r="14" fill="${C.gold}"/><path d="M48 ${-h + 46} q25 -12 50 0" stroke="${C.gold}" stroke-width="4" fill="none"/><path d="M10 ${-h + 8} v52" stroke="${C.gold}" stroke-width="6" stroke-dasharray="6 4"/></g></g>`;
  const train = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-10" y="6" width="560" height="5" fill="#6b7280"/>
    ${[0, 1, 2].map(i => `<g transform="translate(${i * 150} 0)"><rect x="0" y="-60" width="140" height="62" rx="8" fill="${["#3b82c4", "#4a9bd8", "#5aaee6"][i]}"/>${[0, 1, 2, 3].map(k => `<rect x="${12 + k * 32}" y="-50" width="22" height="20" rx="3" fill="#e8f6ff"/>`).join("")}<circle cx="30" cy="4" r="9" fill="${C.ink}"/><circle cx="110" cy="4" r="9" fill="${C.ink}"/></g>`).join("")}
    <g transform="translate(450 0)"><rect x="0" y="-70" width="110" height="72" rx="10" fill="${C.ink}"/><rect x="70" y="-62" width="30" height="24" rx="4" fill="#e8f6ff"/><rect x="10" y="-92" width="18" height="24" fill="${C.ink}"/><circle cx="25" cy="4" r="10" fill="#333"/><circle cx="85" cy="4" r="10" fill="#333"/></g></g>`;
  const plane = (cls) => `<g class="${cls}"><path d="M0 0 L90 -8 L110 0 L90 8Z M40 -4 L20 -40 L36 -40 L64 -6Z M40 4 L20 40 L36 40 L64 6Z M4 -2 L-6 -18 L4 -18 L14 -3Z" fill="#fff" stroke="#8aa3bd" stroke-width="2"/></g>`;
  const book = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-150 0 Q-75 -30 0 0 V-150 Q-75 -180 -150 -150Z" fill="#fff" stroke="${C.flag2}" stroke-width="4"/><path d="M150 0 Q75 -30 0 0 V-150 Q75 -180 150 -150Z" fill="#fff" stroke="${C.flag2}" stroke-width="4"/>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M-128 ${-128 + i * 22} Q-75 ${-148 + i * 22} -20 ${-128 + i * 22}" stroke="#b9cde3" stroke-width="4" fill="none"/><path d="M20 ${-128 + i * 22} Q75 ${-148 + i * 22} 128 ${-128 + i * 22}" stroke="#b9cde3" stroke-width="4" fill="none"/>`).join("")}
    <text x="-75" y="-150" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="22" fill="${C.flag2}">ЗАҢ</text></g>`;
  const gavel = (x, y) => `<g transform="translate(${x} ${y})"><g class="sc-gavel" style="transform-origin:0 60px;transform-box:fill-box"><rect x="-8" y="-10" width="16" height="120" rx="6" fill="#8b5a2b" transform="rotate(-35)"/><rect x="-45" y="-40" width="90" height="40" rx="10" fill="#a0672f" transform="rotate(-35)"/></g></g>`;
  const bars = (x, y, vals, col, lbls) => `<g transform="translate(${x} ${y})">${vals.map((v, i) => `<g class="sc-bar" style="animation-delay:${i * .15}s;transform-origin:${i * 70 + 25}px 0"><rect x="${i * 70}" y="${-v}" width="50" height="${v}" rx="8" fill="${col[i] || col[0]}"/></g><text x="${i * 70 + 25}" y="22" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="16" fill="${C.ink}">${lbls[i]}</text>`).join("")}</g>`;
  const city = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${[[0, 120, 60], [70, 170, 55], [135, 95, 70], [215, 210, 50], [275, 140, 66], [350, 110, 58]].map(([bx, h, w], i) => `<g class="sc-rise" style="animation-delay:${i * .12}s;transform-origin:${bx}px 0"><rect x="${bx}" y="${-h}" width="${w}" height="${h}" rx="6" fill="${i % 2 ? "#4aa8d8" : "#6cc0e6"}"/>${Array.from({ length: Math.floor(h / 26) }, (_, r) => `<rect x="${bx + 10}" y="${-h + 12 + r * 26}" width="${w - 20}" height="10" rx="3" fill="#e8f9ff" opacity=".8"/>`).join("")}</g>`).join("")}
    <g class="sc-rise" style="transform-origin:190px 0"><rect x="184" y="-250" width="12" height="250" fill="#e6eef6"/><circle cx="190" cy="-262" r="24" fill="${C.gold}" stroke="#fff" stroke-width="4"/><path d="M160 -250 L190 -238 L220 -250" stroke="#e6eef6" stroke-width="8" fill="none"/></g></g>`;
  const clip = (x, y, title, pct) => `<g transform="translate(${x} ${y})"><rect x="-110" y="-200" width="220" height="250" rx="16" fill="#fff" stroke="${C.flag2}" stroke-width="4"/><rect x="-40" y="-214" width="80" height="26" rx="8" fill="${C.gold2}"/>
    <text x="0" y="-160" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="22" fill="${C.ink}">${title}</text>
    <circle cx="0" cy="-70" r="62" fill="none" stroke="#dbe8f7" stroke-width="22"/><circle class="sc-ring" cx="0" cy="-70" r="62" fill="none" stroke="${C.gold}" stroke-width="22" stroke-dasharray="${pct * 3.9} 400" transform="rotate(-90 0 -70)"/>
    <text x="0" y="-60" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="30" fill="${C.ink}">${String(pct).replace(".", ",")}%</text>
    <text x="0" y="30" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="15" fill="#5d7591">қазақтардың үлесі</text></g>`;
  const big = (x, y, t, col = C.ink, fs = 54) => `<text x="${x}" y="${y}" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="${fs}" fill="${col}" stroke="#fff" stroke-width="6" paint-order="stroke">${t}</text>`;
  const arrow = (x1, y1, x2, y2, col) => `<path class="sc-dash" d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 60} ${x2} ${y2}" stroke="${col}" stroke-width="6" fill="none" stroke-dasharray="14 12" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="10" fill="${col}"/>`;
  const cap = (x, y, cls) => `<g class="${cls}" transform="translate(${x} ${y})"><path d="M-30 -8 L0 -20 L30 -8 L0 4Z" fill="${C.ink}"/><path d="M-18 -3 V8 Q0 16 18 8 V-3" fill="${C.ink}"/><path d="M26 -7 V12" stroke="${C.gold}" stroke-width="3"/></g>`;

  const S = {
    1991: () => base() + flag(300, 340, 210, "sc-wave") + yurt(560, 340, 1.1) + person(700, 340, C.flag) + person(745, 340, C.gold2) + person(790, 340, "#3b82c4", .9) + person(830, 340, C.flag2, .8)
      + `<g transform="translate(470 120)"><g class="sc-pulse"><circle r="18" fill="${C.gold}"/><circle r="38" fill="none" stroke="${C.gold}" stroke-width="4"/><circle r="60" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".6"/></g></g>` + big(60, 90, "ТӘУЕЛСІЗДІК!", C.flag2, 46),
    1992: () => base() + yurt(600, 345, 1.6) + `<g class="sc-in-l">${[0, 1, 2, 3].map(i => person(120 + i * 48, 345, [C.flag, C.gold2, "#3b82c4", C.red][i], .9)).join("")}</g><g class="sc-in-r">${[0, 1, 2, 3].map(i => person(860 + i * 48, 345, [C.gold2, C.flag2, C.red, C.flag][i], .9)).join("")}</g>`
      + big(60, 90, "I құрылтай", C.flag2, 44) + big(60, 150, "38 ел · 800+ адам", C.ink, 34),
    1994: () => base() + `<g class="sc-train">${train(80, 345)}</g><g transform="translate(150 150)">${plane("sc-fly")}</g>` + big(60, 90, "−811,3 мың", C.red, 64) + big(62, 140, "бір жылда елден кетті", C.ink, 30),
    1997: () => base() + book(600, 330) + gavel(820, 250) + big(60, 90, "1997 · Заң", C.flag2, 46) + big(62, 140, "репатрианттың мәртебесі", C.ink, 30),
    2003: () => base() + bars(470, 330, [200, 170, 140, 120], ["#7cc6ea", "#6ab8e0", "#5aa8d6", "#4a98cc"], ["1991", "1995", "1999", "2003"]) + big(60, 90, "16,8 → 14,9 млн", C.ink, 50) + big(62, 140, "халық азайды", C.red, 30),
    2008: () => base() + `<g class="sc-caravan">${[0, 1, 2, 3].map(i => camel(140 - i * 110, 345, 1.15)).join("")}${person(220, 345, C.flag2)}</g>` + yurt(930, 345, 1) + yurt(1080, 350, .8) + big(60, 90, "«Нұрлы көш»", C.gold2, 54) + big(62, 140, "қандастар атажұртқа", C.ink, 30),
    2009: () => base() + clip(600, 330, "САНАҚ 2009", 63.1) + person(420, 345, C.flag) + person(780, 345, C.gold2) + big(60, 90, "Санақ", C.flag2, 50),
    2014: () => base() + `<g class="sc-walk">${[0, 1, 2, 3, 4].map(i => person(200 + i * 60, 345, [C.flag, C.gold2, "#3b82c4", C.flag2, C.red][i], 1, "sc-bob") + cap(200 + i * 60, 291, "")).join("")}</g>` + arrow(560, 300, 980, 170, C.flag) + big(990, 160, "С", C.flag2, 40) + big(60, 90, "«Серпін»", C.flag2, 54) + big(62, 140, "оқуға — батыс пен солтүстікке", C.ink, 28),
    2020: () => base() + city(380, 345, 1.1) + big(60, 90, "19 млн", C.ink, 64) + big(62, 140, "халық", C.flag2, 30),
    2021: () => base() + clip(600, 330, "САНАҚ 2021", 70.4) + yurt(330, 345, .8) + city(780, 345, .55) + big(60, 90, "1 084,7 мың", C.gold2, 50) + big(62, 140, "қандас оралды (1991–2021)", C.ink, 28),
    2025: () => base() + `<g transform="translate(600 345)"><rect x="-130" y="-250" width="260" height="250" rx="14" fill="#fff" stroke="${C.flag2}" stroke-width="4"/>${[0, 1, 2, 3, 4].map(i => `<rect x="-100" y="${-215 + i * 34}" width="${200 - i * 18}" height="12" rx="6" fill="#d6e6f5"/>`).join("")}<g class="sc-stamp"><circle cx="70" cy="-55" r="42" fill="none" stroke="${C.red}" stroke-width="6"/><text x="70" y="-48" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="20" fill="${C.red}">2030</text></g></g>`
      + `<g transform="translate(860 300)"><g class="sc-float"><rect x="-60" y="-60" width="120" height="80" rx="14" fill="${C.flag}"/><text x="0" y="-8" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="34" fill="#fff">Ә Ғ Қ</text></g></g>` + big(60, 90, "Тұжырымдама-2030", C.flag2, 46) + big(62, 140, "мемлекеттік тіл тесті", C.ink, 30),
    2026: () => base() + city(560, 345, 1.05) + flag(250, 345, 200, "sc-wave") + `<g class="sc-caravan2">${[0, 1, 2].map(i => camel(120 - i * 95, 360, .8)).join("")}</g>` + big(60, 90, "20,59 млн", C.ink, 60) + big(62, 140, "қазақтар 71,5% · қандастар 1 168,2 мың", C.flag2, 26)
  };
  let n = 0;
  return { draw: y => { n++; const body = (S[y] || S[2026])().replace(/id="(sk|sn|h1|h2)"/g, (m, k) => `id="${k}${n}"`).replace(/url\(#(sk|sn|h1|h2)\)/g, (m, k) => `url(#${k}${n})`); return `<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg">${body}</svg>`; } };
})();
