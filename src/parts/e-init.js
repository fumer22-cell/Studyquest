
/* Refresh saved copies of chain questions from the current definitions (fixes reroutes saved before the template fix) */
(function migrate(){
  const defs = {};
  Object.values(CAMPS).forEach(c => c.mods.forEach(m => m.tasks.forEach(t => { defs[t.id] = t; })));
  EXTRA.forEach(t => { defs[t.id] = t; });
  const fix = t => { if (!t || t.type !== 'calc' || t.gen !== 'chain' || !t.p) return; const d = defs[baseId(t.id)]; if (!d || !d.p) return; t.p.q = d.p.q; if (d.p.qv) t.p.qv = d.p.qv; };
  const walk = s => { if (!s) return; (s.wrongs || []).forEach(fix); [s.cur, s.parked].forEach(c => c && (c.queue || []).forEach(fix)); };
  try { walk(st); Object.values(st.saved || {}).forEach(walk); save(); } catch (e) {}
})();
applyCamp();
window.__avogadro.ui = () => ui;
window.__avogadro.freeSides = freeSides;
stars.resize(); fx.resize(); requestAnimationFrame(loop);
renderTitle();
