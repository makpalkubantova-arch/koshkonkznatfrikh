/* Экомонитор: Астананың анимациялық иллюстрациялары (SVG). Ластану деңгейіне қарай аспан мен түтін өзгереді. */
window.SCENES = (() => {
  let n = 0;
  const mix = (a, b, t) => { const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  const lvlOf = si => si == null ? null : si <= 1 ? 0 : si <= 4 ? 1 : si <= 10 ? 2 : 3;
  const LV = [["Төмен", "#22B573"], ["Көтеріңкі", "#F2C200"], ["Жоғары", "#F28C28"], ["Өте жоғары", "#E5533D"]];

  /* --- Астана қаласының көкжиегі --- */
  const skyline = (x0, y0, k = 1) => `<g transform="translate(${x0} ${y0}) scale(${k})">
    <rect x="-260" y="-150" width="58" height="150" rx="4" fill="#9fb8d1"/><rect x="-196" y="-210" width="46" height="210" rx="4" fill="#89a6c4"/>
    <rect x="-140" y="-120" width="70" height="120" rx="4" fill="#a9c1d8"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="-188" y="${-196 + i * 30}" width="30" height="8" rx="2" fill="#dbe9f5" opacity=".8"/>`).join("")}
    <!-- Бәйтерек -->
    <path d="M-30 0 L-8 -230 L8 -230 L30 0Z" fill="#e8eef5" stroke="#b9c9da" stroke-width="2"/>
    <path d="M-8 -230 C-34 -250 -34 -268 -22 -276 M8 -230 C34 -250 34 -268 22 -276" stroke="#c9d6e3" stroke-width="5" fill="none"/>
    <circle cx="0" cy="-262" r="24" fill="url(#gold${n})"/><circle cx="-7" cy="-269" r="7" fill="#fff" opacity=".7"/>
    <!-- Хан Шатыр -->
    <path d="M60 0 Q110 -170 120 -190 Q130 -170 180 0Z" fill="#cfe3f2" stroke="#a8c3da" stroke-width="2"/>
    <path d="M85 0 Q115 -140 120 -190 M155 0 Q125 -140 120 -190" stroke="#a8c3da" stroke-width="2" fill="none"/>
    <!-- Ақорда -->
    <rect x="200" y="-70" width="120" height="70" fill="#e9eff6"/><path d="M220 -70 Q260 -130 300 -70Z" fill="#7fb6e6"/><rect x="257" y="-140" width="6" height="30" fill="#c9a227"/>
    <rect x="335" y="-170" width="52" height="170" rx="4" fill="#9fb8d1"/><rect x="395" y="-110" width="60" height="110" rx="4" fill="#b3c8dc"/>
  </g>`;
  const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-14" width="6" height="16" fill="#8a5a2b"/><circle cx="0" cy="-26" r="17" fill="#2fbf71"/><circle cx="-9" cy="-20" r="11" fill="#22a862"/><circle cx="9" cy="-21" r="11" fill="#38cc7c"/></g>`;
  const house = (x, y, smoke) => `<g transform="translate(${x} ${y})"><rect x="-22" y="-26" width="44" height="26" fill="#f4e3c3" stroke="#d2b98e" stroke-width="2"/><path d="M-28 -26 L0 -48 L28 -26Z" fill="#c9763a"/><rect x="10" y="-52" width="8" height="18" fill="#7a5a44"/><rect x="-8" y="-18" width="12" height="12" fill="#bfe2ff"/>
    ${smoke ? `<g class="sc-smoke">${[0, 1, 2].map(i => `<circle cx="${14 + i * 6}" cy="${-62 - i * 16}" r="${8 + i * 5}" fill="#7d7d7d" opacity="${.55 - i * .12}"/>`).join("")}</g>` : ""}</g>`;
  const chp = (x, y, p) => `<g transform="translate(${x} ${y})"><rect x="-40" y="-40" width="80" height="40" fill="#c8d0d8"/><rect x="-30" y="-150" width="18" height="110" fill="#e04b3a"/><rect x="-30" y="-150" width="18" height="14" fill="#fff"/><rect x="-30" y="-110" width="18" height="12" fill="#fff"/>
    <rect x="8" y="-130" width="16" height="90" fill="#d0d6dc"/>
    <g class="sc-smoke">${[0, 1, 2, 3].map(i => `<circle cx="${-21 + i * 14}" cy="${-168 - i * 22}" r="${12 + i * 8}" fill="${mix("#cfd6dd", "#6b6560", p)}" opacity="${.7 - i * .13}"/>`).join("")}</g></g>`;
  const car = (x, y, c, cls) => `<g transform="translate(${x} ${y})"><g class="${cls}"><rect x="-26" y="-18" width="52" height="16" rx="6" fill="${c}"/><path d="M-14 -18 L-8 -30 L12 -30 L18 -18Z" fill="${c}"/><rect x="-6" y="-28" width="14" height="9" fill="#d8f0ff"/><circle cx="-14" cy="-2" r="6" fill="#222"/><circle cx="14" cy="-2" r="6" fill="#222"/><circle cx="-34" cy="-8" r="5" fill="#9a9a9a" opacity=".5" class="sc-puff"/></g></g>`;
  const sensor = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-4" y="-80" width="8" height="80" fill="#5e6c7d"/><rect x="-22" y="-112" width="44" height="34" rx="6" fill="#fff" stroke="#0FA3B1" stroke-width="3"/><circle cx="0" cy="-95" r="7" fill="#0FA3B1" class="sc-pulse"/>
    <path d="M-30 -128 Q0 -150 30 -128" stroke="#0FA3B1" stroke-width="3" fill="none" class="sc-pulse"/><path d="M-44 -138 Q0 -172 44 -138" stroke="#0FA3B1" stroke-width="3" fill="none" opacity=".5" class="sc-pulse"/></g>`;

  function base(p, water = "#3fa9f5") {
    n++;
    const skyT = mix("#bfe8ff", "#c9c2b4", p), skyB = mix("#eaf9ff", "#e6dccb", p), sun = mix("#ffd23f", "#e8b98a", p);
    return `<defs>
      <linearGradient id="sky${n}" gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="420"><stop offset="0" stop-color="${skyT}"/><stop offset="1" stop-color="${skyB}"/></linearGradient>
      <radialGradient id="gold${n}"><stop offset="0" stop-color="#fff3b0"/><stop offset=".6" stop-color="#FEC50C"/><stop offset="1" stop-color="#d79f00"/></radialGradient>
      <linearGradient id="smog${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d8377" stop-opacity="0"/><stop offset=".55" stop-color="#8d8377" stop-opacity="${(p * .75).toFixed(2)}"/><stop offset="1" stop-color="#7d736a" stop-opacity="${(p * .45).toFixed(2)}"/></linearGradient>
      <linearGradient id="riv${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${water}"/><stop offset="1" stop-color="${mix(water, "#0b3d66", .35)}"/></linearGradient>
    </defs>
    <rect x="-1500" y="-1200" width="4200" height="1700" fill="url(#sky${n})"/>
    <g><circle cx="1040" cy="80" r="${110}" fill="${sun}" opacity=".25"/><circle cx="1040" cy="80" r="44" fill="${sun}"/></g>
    <g class="sc-cloud"><ellipse cx="220" cy="70" rx="70" ry="20" fill="#fff" opacity=".9"/><ellipse cx="262" cy="60" rx="44" ry="22" fill="#fff" opacity=".9"/></g>
    <g class="sc-cloud2"><ellipse cx="640" cy="48" rx="60" ry="16" fill="#fff" opacity=".75"/></g>
    <path d="M-1500 300 H0 C200 286 420 300 640 290 C860 280 1040 296 1200 288 H2700 V1500 H-1500Z" fill="#9fdc8a"/>
    <path d="M-1500 330 H0 C260 318 520 336 800 322 C980 314 1100 326 1200 320 H2700 V1500 H-1500Z" fill="#7fcf74"/>`;
  }
  const river = (n2, cls = "") => `<path d="M-1500 372 H0 C200 360 420 384 640 368 C860 354 1040 380 1200 366 H2700 V420 H-1500Z" fill="url(#riv${n})"/>
    <path d="M60 384 h60 M300 390 h80 M620 380 h50 M900 386 h70" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".6" class="sc-flow ${cls}"/>`;
  const smog = p => p > 0.02 ? `<rect x="-1500" y="80" width="4200" height="340" fill="url(#smog${n})"/>
    <g class="sc-haze" opacity="${(p * .8).toFixed(2)}">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${120 + i * 250}" cy="${200 + (i % 2) * 30}" rx="${190}" ry="${36}" fill="#9b9187"/>`).join("")}</g>` : "";
  const svg = (inner, label, par = "xMidYMid meet", vb = "0 0 1200 420") => `<svg viewBox="${vb}" preserveAspectRatio="${par}" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label || "Астана"}">${inner}</svg>`;
  const tag = (x, y, t, c = "#0E5E4E") => `<g transform="translate(${x} ${y})"><rect x="0" y="-24" width="${t.length * 11 + 28}" height="34" rx="17" fill="#fff" stroke="${c}" stroke-width="3"/><text x="14" y="-2" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="17" fill="${c}">${t}</text></g>`;

  function city(si, extras = "") {
    const p = si == null ? .15 : Math.min(1, si / 16);
    return base(p) + skyline(560, 300, 1) + `<g class="sc-fac">${chp(980, 300, p)}</g>` +
      house(110, 318, p > .2) + house(190, 324, p > .35) + house(270, 316, p > .5) +
      tree(380, 330, 1) + tree(420, 336, .9) + tree(860, 334, 1) + tree(900, 328, .85) + tree(1130, 330, .9) +
      river() + car(0, 356, "#e5533d", "sc-car") + car(0, 356, "#3b82f6", "sc-car2") + car(0, 356, "#f2a900", "sc-car3") +
      sensor(700, 330) + smog(p) + extras;
  }

  const S = {
    hero: () => svg(city(6) + tag(640, 170, "Бақылау бекеті · 24 көрсеткіш", "#0FA3B1"), "Астана: экомониторинг", "xMidYMid meet", "60 -120 1080 520"),
    draw: (key, si) => {
      if (key === "sim") return svg(city(si), "Экосимулятор", "xMidYMax slice");
      if (/^\d{4}$/.test(String(key))) {
        const d = (DATA.timeMachine || []).find(x => String(x.y) === String(key)) || { si: 6 };
        const L = LV[lvlOf(d.si)];
        return svg(city(d.si, tag(40, 60, `${key} · СИ = ${String(d.si).replace(".", ",")} · ${L[0].toLowerCase()}`, L[1])), "Астана ауасы " + key);
      }
      if (key === "Көздер") return svg(city(9, tag(860, 90, "ЖЭО", "#E5533D") + tag(60, 210, "33 585 жеке үй · 80% көмір", "#8A6A2E") + tag(20, 300, "347 мың көлік", "#3B82F6") + tag(380, 120, "2 813 кәсіпорын", "#7C5CD6")), "Ластану көздері");
      if (key === "Есіл") { n++; return svg(base(.25, "#7a8a5a") + skyline(560, 300, 1) + tree(160, 330) + tree(980, 330) +
        `<path d="M-1500 340 H0 C200 326 420 352 640 336 C860 322 1040 348 1200 334 H2700 V420 H-1500Z" fill="url(#riv${n})"/>
         <path d="M60 368 h60 M300 376 h80 M620 362 h50 M900 372 h70" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".4" class="sc-flow"/>
         ${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${120 + i * 150}" cy="${356 + (i % 3) * 10}" r="${4 + i % 3}" fill="#5b4a2e" opacity=".6" class="sc-bob"/>`).join("")}
         <g transform="translate(470 330)" class="sc-bob"><path d="M-50 0 L50 0 L36 18 L-36 18Z" fill="#fff" stroke="#0FA3B1" stroke-width="3"/><rect x="-4" y="-50" width="6" height="50" fill="#5e6c7d"/><path d="M2 -50 L40 -36 L2 -24Z" fill="#0FA3B1"/></g>
         <g transform="translate(560 300)"><rect x="-12" y="0" width="24" height="44" rx="6" fill="#e9f7ff" stroke="#0FA3B1" stroke-width="3"/><rect x="-9" y="20" width="18" height="21" rx="4" fill="#9a8a5a"/></g>` +
        tag(40, 60, "Есіл · 5-класс (қатты ластанған)", "#8A6A2E") + tag(40, 110, "Өлшенген заттар 13,74 мг/дм³", "#0FA3B1"), "Есіл өзені"); }
      if (key === "Топырақ") { n++; return svg(`<rect x="-1500" y="-1200" width="4200" height="1700" fill="#e9f8ff"/>
        <path d="M-1500 120 H2700 V180 H-1500Z" fill="#7fcf74"/>${[150, 300, 450, 600, 750, 900, 1050].map(x => tree(x, 126, .9)).join("")}
        <rect x="-1500" y="180" width="4200" height="70" fill="#8b5e34"/><rect x="-1500" y="250" width="4200" height="80" fill="#a8743f"/><rect x="-1500" y="330" width="4200" height="400" fill="#c79a5d"/>
        ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % 1200}" cy="${200 + (i * 53) % 200}" r="${3 + i % 4}" fill="#5a3b1e" opacity=".35"/>`).join("")}
        ${[220, 420, 620, 820, 1020].map((x, i) => `<g transform="translate(${x} 150)"><rect x="-5" y="0" width="10" height="${110 + i * 8}" fill="#5e6c7d"/><circle cx="0" cy="${110 + i * 8}" r="9" fill="#22B573" class="sc-pulse"/><text x="0" y="-12" text-anchor="middle" font-family="Montserrat, Arial" font-weight="800" font-size="16" fill="#0E5E4E">${i + 1}-нүкте</text></g>`).join("")}` +
        tag(40, 60, "Pb · Cr · Cu · Zn — ШЖШ шегінде ✓", "#22B573"), "Топырақ сынамалары"); }
      if (key === "Радиация") { return svg(city(3, `<g transform="translate(160 150)"><rect x="-70" y="-90" width="140" height="170" rx="18" fill="#fff" stroke="#7C5CD6" stroke-width="4"/><rect x="-52" y="-70" width="104" height="54" rx="8" fill="#e9fbe9"/><text x="0" y="-34" text-anchor="middle" font-family="Montserrat, Arial" font-weight="900" font-size="26" fill="#0E5E4E">0,12</text><text x="0" y="6" text-anchor="middle" font-family="Montserrat, Arial" font-weight="800" font-size="15" fill="#7C5CD6">мкЗв/сағ</text><circle cx="0" cy="44" r="14" fill="#22B573" class="sc-pulse"/></g>` + tag(260, 60, "Шекті мән 0,57 — норма шегінде ✓", "#7C5CD6")), "Радиация фоны"); }
      return svg(city(6), key);
    },
    /* СИ спидометрі */
    gauge: (si, d) => {
      n++;
      const cx = 200, cy = 190, r = 140, A = v => Math.PI * (1 - Math.min(16, v) / 16);
      const arc = (a0, a1, c) => { const p0 = [cx + r * Math.cos(A(a0)), cy - r * Math.sin(A(a0))], p1 = [cx + r * Math.cos(A(a1)), cy - r * Math.sin(A(a1))]; return `<path d="M${p0[0]} ${p0[1]} A${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}" stroke="${c}" stroke-width="34" fill="none"/>`; };
      if (si == null) {
        const ico = { src: "🏭", water: "💧", soil: "🌱", rad: "☢️" }[d.mode] || "📡", col = { src: "#E5533D", water: "#8A6A2E", soil: "#22B573", rad: "#7C5CD6" }[d.mode];
        return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%"><circle cx="200" cy="150" r="110" fill="#fff" stroke="${col}" stroke-width="10" class="sc-pulse"/><text x="200" y="150" text-anchor="middle" font-size="84">${ico}</text><text x="200" y="215" text-anchor="middle" font-family="Montserrat, Arial" font-weight="900" font-size="24" fill="${col}">${d.lvl || "Ластану көздері"}</text></svg>`;
      }
      const L = LV[lvlOf(si)], ang = A(si), nx = cx + (r - 30) * Math.cos(ang), ny = cy - (r - 30) * Math.sin(ang);
      return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        ${arc(0, 1, "#22B573")}${arc(1, 4, "#F2C200")}${arc(4, 10, "#F28C28")}${arc(10, 16, "#E5533D")}
        ${[0, 1, 4, 10, 16].map(v => `<text x="${cx + (r + 30) * Math.cos(A(v))}" y="${cy - (r + 30) * Math.sin(A(v)) + 6}" text-anchor="middle" font-family="Montserrat, Arial" font-weight="800" font-size="16" fill="#355">${v === 16 ? "16+" : v}</text>`).join("")}
        <line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="#0E3B2E" stroke-width="8" stroke-linecap="round" class="g-needle"/><circle cx="${cx}" cy="${cy}" r="14" fill="#0E3B2E"/>
        <text x="${cx}" y="${cy + 52}" text-anchor="middle" font-family="Montserrat, Arial" font-weight="900" font-size="34" fill="${L[1]}">СИ ${String(si).replace(".", ",")}</text>
        <text x="${cx}" y="${cy + 82}" text-anchor="middle" font-family="Montserrat, Arial" font-weight="800" font-size="18" fill="#355">${L[0]} деңгей</text></svg>`;
    }
  };
  return S;
})();
