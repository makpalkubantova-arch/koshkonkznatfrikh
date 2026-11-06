/* Тірі рейтинг: Firebase Realtime Database (REST, SDK қажет емес).
   Мекенжай data.js ішіндегі DATA.live.url арқылы, мұғалімнің баптауынан немесе QR-дағы ?db= параметрінен алынады. */
window.LIVE = (() => {
  const LS = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const SS = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
  const qp = new URLSearchParams(location.search).get("db");
  if (qp) SS("kkDb", qp);
  let url = (LS("kkDb") || (window.DATA && DATA.live && DATA.live.url) || "").trim().replace(/\/+$/, "");
  const room = (window.DATA && DATA.live && DATA.live.room) || "kk-11a";
  const on = () => /^https:\/\/[\w.-]+\.(firebaseio\.com|firebasedatabase\.app)$/.test(url);
  const base = () => `${url}/${room}`;
  async function req(path, method = "GET", body) {
    if (!on()) throw new Error("off");
    const r = await fetch(`${base()}/${path}.json`, { method, headers: { "Content-Type": "application/json" }, body: body == null ? undefined : JSON.stringify(body) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }
  let pending = null, pushT = null;
  return {
    on, get url() { return url; },
    setUrl(u) { url = (u || "").trim().replace(/\/+$/, ""); SS("kkDb", url || null); },
    pushStudent(id, rec) { pending = { id, rec }; clearTimeout(pushT); pushT = setTimeout(() => { const p = pending; pending = null; req(`students/${p.id}`, "PUT", p.rec).catch(() => {}); }, 400); },
    pushGroup(g, pts) { return req(`groups/${g}`, "PUT", pts); },
    pushNote(rec) { return req("notes", "POST", rec); },
    setStage(id) { return req("state", "PUT", { stage: id, ts: Date.now() }); },
    getStage() { return req("state"); },
    async read() { return (await req("")) || {}; },
    async clear() { return req("", "DELETE"); },
    setSession(id) { return req("session", "PUT", { id, ts: Date.now() }); },
    getSession() { return req("session"); },
    async count() { if (!on()) throw new Error("off"); const r = await fetch(`${base()}/students.json?shallow=true`); if (!r.ok) throw new Error("HTTP " + r.status); const d = await r.json(); return d ? Object.keys(d).length : 0; },
    test: async () => { await req("ping", "PUT", Date.now()); return true; }
  };
})();
