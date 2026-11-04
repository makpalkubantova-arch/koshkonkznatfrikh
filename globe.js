/* 3D глобус: Қазақстан және көш доғалары (Three.js r128) */
window.makeGlobe = function (host, opts = {}) {
  if (!window.THREE) return null;
  const T = THREE, D = Math.PI / 180;
  const R = 1;
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(opts.fov || 32, 1, .1, 100);
  const world = new T.Group(); scene.add(world);
  scene.add(new T.AmbientLight(0xffffff, 1.0));
  const dl = new T.DirectionalLight(0xffffff, .55); dl.position.set(-3, 3, 5); scene.add(dl);

  const v3 = (lat, lon, r = R) => { const p = (90 - lat) * D, t = (lon + 180) * D; return new T.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)); };

  // glossy core
  world.add(new T.Mesh(new T.SphereGeometry(R * .985, 64, 64), new T.MeshPhongMaterial({ color: 0xd3e9ff, shininess: 90, specular: 0xffffff, transparent: true, opacity: .95 })));
  // atmosphere sprite
  const atm = document.createElement("canvas"); atm.width = atm.height = 256; const ag = atm.getContext("2d");
  const gr = ag.createRadialGradient(128, 128, 80, 128, 128, 128); gr.addColorStop(0, "rgba(120,200,255,0)"); gr.addColorStop(.75, "rgba(120,200,255,.35)"); gr.addColorStop(1, "rgba(120,200,255,0)");
  ag.fillStyle = gr; ag.fillRect(0, 0, 256, 256);
  const halo = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(atm), depthWrite: false })); halo.scale.set(3.1, 3.1, 1); scene.add(halo);

  // round dot texture
  const dc = document.createElement("canvas"); dc.width = dc.height = 64; const dg = dc.getContext("2d");
  dg.beginPath(); dg.arc(32, 32, 28, 0, 7); dg.fillStyle = "#fff"; dg.fill(); const dotTex = new T.CanvasTexture(dc);
  // world dots (fibonacci)
  const N = 6000, wp = [];
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996; wp.push(Math.cos(th) * r * R * 1.002, y * R * 1.002, Math.sin(th) * r * R * 1.002); }
  const wg = new T.BufferGeometry(); wg.setAttribute("position", new T.Float32BufferAttribute(wp, 3));
  world.add(new T.Points(wg, new T.PointsMaterial({ size: .018, map: dotTex, color: 0x6f9fd6, transparent: true, opacity: .6, depthWrite: false, alphaTest: .3 })));
  // Kazakhstan dots
  const KZ = opts.kz || [];
  const inside = (x, y) => { let c = false; for (let i = 0, j = KZ.length - 1; i < KZ.length; j = i++) { const [xi, yi] = KZ[i], [xj, yj] = KZ[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const kp = [], kc = [], kzIdx = [];
  for (let la = 40.6; la < 55.6; la += .55) for (let lo = 46.4; lo < 87.5; lo += .7) if (inside(lo, la)) { const v = v3(la, lo, R * 1.012); kp.push(v.x, v.y, v.z); kc.push(.12, .55, .94); kzIdx.push(Math.random()); }
  const kg = new T.BufferGeometry(); kg.setAttribute("position", new T.Float32BufferAttribute(kp, 3)); kg.setAttribute("color", new T.Float32BufferAttribute(kc, 3));
  const kzPts = new T.Points(kg, new T.PointsMaterial({ size: .03, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, alphaTest: .3 }));
  world.add(kzPts);
  // outline
  const ol = KZ.map(([lo, la]) => v3(la, lo, R * 1.014)); ol.push(ol[0]);
  world.add(new T.Line(new T.BufferGeometry().setFromPoints(ol), new T.LineBasicMaterial({ color: 0x1e8cf0, transparent: true, opacity: .9 })));

  // labels
  function label(text, color = "#152042", bg = "rgba(255,255,255,.92)") {
    const c = document.createElement("canvas"), g = c.getContext("2d"); const fs = 44; g.font = `800 ${fs}px Montserrat, Inter, sans-serif`;
    const w = g.measureText(text).width + 40; c.width = w; c.height = fs + 30; g.font = `800 ${fs}px Montserrat, Inter, sans-serif`;
    g.fillStyle = bg; const r = 22; g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, c.height, r); g.arcTo(w, c.height, 0, c.height, r); g.arcTo(0, c.height, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.fill();
    g.fillStyle = color; g.textBaseline = "middle"; g.fillText(text, 20, c.height / 2 + 2);
    const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false, transparent: true })); const k = opts.lk || .00085; s.scale.set(w * k, c.height * k, 1); s.renderOrder = 10; return s;
  }
  const P = {
    "Ресей": [55.7, 37.6], "Германия": [51, 10.4], "Украина": [50.4, 30.5], "Беларусь": [53.9, 27.6], "Польша": [52.2, 21],
    "Қытай": [43.8, 87.6], "Өзбекстан": [40.2, 63.5], "Моңғолия": [48.9, 90], "Түрікменстан": [38, 58.4], "Түркия": [39.9, 32.8],
    "Астана": [51.2, 71.4], "Алматы": [43.25, 76.9], "Шымкент": [42.3, 69.6], "Петропавл": [54.9, 69.1], "Қостанай": [53.2, 63.6], "Өскемен": [49.95, 82.6], "Ақтау": [43.65, 51.2], "Қарағанды": [49.8, 73.1], "Павлодар": [52.3, 77.0], "Атырау": [47.1, 51.9], "Түркістан": [43.3, 68.2]
  };
  const labels = {};
  ["Ресей", "Германия", "Украина", "Қытай", "Өзбекстан", "Моңғолия", "Түрікменстан", "Түркия"].filter(n => !(opts.hideLabels || []).includes(n)).forEach(n => { const s = label(n); s.position.copy(v3(...P[n], R * 1.06)); world.add(s); labels[n] = s; });
  const kzl = label("ҚАЗАҚСТАН", "#ffffff", "rgba(247,140,20,.95)"); kzl.position.copy(v3(48.5, 67, R * 1.1)); kzl.scale.multiplyScalar(1.2); world.add(kzl);

  // routes
  const ROUTES = {
    out: [["Қостанай", "Германия", 0x1e8cf0], ["Петропавл", "Ресей", 0x1e8cf0], ["Павлодар", "Ресей", 0x1e8cf0], ["Қарағанды", "Германия", 0x1e8cf0], ["Өскемен", "Ресей", 0x1e8cf0], ["Қостанай", "Украина", 0x1e8cf0]],
    in: [["Қытай", "Алматы", 0xf78c14], ["Өзбекстан", "Шымкент", 0xf78c14], ["Өзбекстан", "Түркістан", 0xf78c14], ["Моңғолия", "Өскемен", 0xf78c14], ["Түрікменстан", "Ақтау", 0xf78c14], ["Қытай", "Астана", 0xf78c14]],
    inner: [["Шымкент", "Петропавл", 0x0fb5a3], ["Түркістан", "Қостанай", 0x0fb5a3], ["Шымкент", "Павлодар", 0x0fb5a3], ["Түркістан", "Атырау", 0x0fb5a3]]
  };
  const arcs = [];
  function makeArc(a, b, col) {
    const s = v3(...P[a], R * 1.015), e = v3(...P[b], R * 1.015), d = s.distanceTo(e);
    const m = s.clone().add(e).multiplyScalar(.5).normalize().multiplyScalar(R * (1.04 + d * .45));
    const curve = new T.QuadraticBezierCurve3(s, m, e);
    const line = new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(60)), new T.LineBasicMaterial({ color: col, transparent: true, opacity: 0 }));
    const beads = [];
    for (let i = 0; i < 5; i++) { const g = new T.Mesh(new T.SphereGeometry(.014 - i * .0012, 10, 10), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 })); world.add(g); beads.push(g); }
    world.add(line);
    return { curve, line, beads, ph: Math.random(), on: 0, target: 0 };
  }
  for (const k in ROUTES) ROUTES[k] = ROUTES[k].map(r => makeArc(...r));
  let mode = opts.mode || "mix", kzShare = opts.kz0 || .4;
  function setMode(m) { mode = m; for (const k in ROUTES) ROUTES[k].forEach(a => a.target = (m === "mix" || m === k || (m === "in" && k === "inner" && opts.innerWithIn)) ? 1 : 0); }
  function setShare(x) { kzShare = x; }
  setMode(mode);

  // camera looks straight at Kazakhstan
  const c0 = v3(47.5, 67).normalize();
  cam.position.copy(c0.clone().multiplyScalar(opts.dist || 4.1)); cam.up.set(0, 1, 0); cam.lookAt(0, 0, 0);
  halo.position.set(0, 0, 0);
  let drag = null, userY = 0, userX = 0;
  host.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, uy: userY, ux: userX }; });
  addEventListener("pointerup", () => drag = null);
  addEventListener("pointermove", e => { if (!drag) return; userY = drag.uy + (e.clientX - drag.x) * .006; userX = Math.max(-.8, Math.min(.8, drag.ux + (e.clientY - drag.y) * .004)); });

  const col = kg.attributes.color;
  function resize() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); renderer.domElement.style.width = w + "px"; renderer.domElement.style.height = h + "px"; cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(host); resize();
  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (opts.isActive && !opts.isActive()) return;
    const tt = t / 1000;
    world.rotation.y = Math.sin(tt * .25) * (opts.sway ?? .12) + userY;
    world.rotation.x = Math.sin(tt * .18) * .03 + userX;
    // kazakh share colouring
    for (let i = 0; i < kzIdx.length; i++) { const o = kzIdx[i] < kzShare; const pulse = .85 + .15 * Math.sin(tt * 2 + i); col.setXYZ(i, o ? .97 * pulse : .12, o ? .55 * pulse : .55, o ? .08 : .94); }
    col.needsUpdate = true;
    for (const k in ROUTES) ROUTES[k].forEach(a => {
      a.on += (a.target - a.on) * .05;
      a.line.material.opacity = .45 * a.on;
      const u = (tt * .28 + a.ph) % 1;
      a.beads.forEach((b, i) => { const v = Math.max(0, u - i * .025); b.position.copy(a.curve.getPoint(v)); b.material.opacity = a.on * Math.min(1, u * 6, (1 - u) * 6) * (1 - i * .17); });
    });
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
  return { setMode, setShare };
};
