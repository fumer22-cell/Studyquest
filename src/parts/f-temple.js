
/* ========================================================================
   TEMPLE OF THE MOLE — CHE1011 Unit Test Study Guide, Chapters 3 & 4
   Built-answer question types: form, sort, dots, lp, build, eq
   ======================================================================== */

/* ---------- Extra generators ---------- */
CALC.fixed = {
  build(p){ return { q:p.q, a:{value:p.v, sf:p.sf, unit:p.unit, anyForm:true, sfAlt:p.sfAlt, unitAlt:p.unitAlt}, work:p.work, setup:p.setup || 'Write the setup with units first, then calculate.' }; },
  rand(p){ return p; }
};
{
  const chainBuild = CALC.chain.build;
  CALC.chain.build = function(p){
    const b = chainBuild(p);
    if (p.sf){ b.a.sf = p.sf; b.notes[b.notes.length - 1] = roundLine(b.a, p.sfWhy || `keep ${p.sf} sig figs`); b.grids[0].res[0] = finV(b.a); }
    if (p.sfAlt) b.a.sfAlt = p.sfAlt;
    return b;
  };
  const fmBuild = CALC.fmass.build;
  CALC.fmass.build = function(p){ const b = fmBuild(p); if (p.sfAlt) b.a.sfAlt = p.sfAlt; if (p.unitAlt) b.a.unitAlt = p.unitAlt; if (p.note) b.work.push(p.note); return b; };
}

/* ---------- Lewis editing helpers ---------- */
const sideOf = (dx, dy) => Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
function freeSides(mol, i){
  const used = new Set(), me = mol.atoms[i];
  mol.bonds.forEach(([a, b]) => { if (a === i || b === i){ const o = mol.atoms[a === i ? b : a]; used.add(sideOf((o.x || 0) - (me.x || 0), (o.y || 0) - (me.y || 0))); } });
  return [0, 2, 3, 1].filter(s => !used.has(s));
}
function molSpec(mol, bo, lp, edit){
  return { atoms:mol.atoms.map((a, i) => { const d = [0, 0, 0, 0]; freeSides(mol, i).slice(0, lp[i]).forEach(s => { d[s] = 2; }); return {...a, d}; }),
    bonds:mol.bonds.map((b, k) => [b[0], b[1], bo ? bo[k] : (b[2] || 1)]), br:mol.br, q:mol.q, U:edit ? 76 : 52, edit, alt:mol.alt };
}
const eCount = (bo, lp) => 2 * bo.reduce((a, b) => a + b, 0) + 2 * lp.reduce((a, b) => a + b, 0);
{
  const base = lewisSVG;
  lewisSVG = function(L){
    if (!L.edit && !L.U) return base(L);
    const U = L.U || 46, xs = L.atoms.map(a => a.x || 0), ys = L.atoms.map(a => a.y || 0);
    const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const padX = 30, padY = 28, W = (maxx - minx) * U + padX * 2, H = (maxy - miny) * U + padY * 2;
    const px = a => padX + ((a.x || 0) - minx) * U, py = a => padY + ((a.y || 0) - miny) * U;
    const dot = (x, y) => `<circle class="dt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="currentColor"/>`;
    let s = '';
    L.bonds.forEach(([i, j, o], k) => {
      const a = L.atoms[i], b = L.atoms[j]; let x1 = px(a), y1 = py(a), x2 = px(b), y2 = py(b);
      const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      x1 += ux * 15; y1 += uy * 15; x2 -= ux * 15; y2 -= uy * 15;
      for (let n = 0; n < o; n++){ const off = (n - (o - 1) / 2) * 6; s += `<line x1="${(x1 - uy * off).toFixed(1)}" y1="${(y1 + ux * off).toFixed(1)}" x2="${(x2 - uy * off).toFixed(1)}" y2="${(y2 + ux * off).toFixed(1)}" stroke="currentColor" stroke-width="2.4"/>`; }
      if (L.edit === true){ const w = 13, pts = [[x1 - uy * w, y1 + ux * w], [x2 - uy * w, y2 + ux * w], [x2 + uy * w, y2 - ux * w], [x1 + uy * w, y1 - ux * w]].map(q => q.map(v => v.toFixed(1)).join(',')).join(' ');
        s += `<polygon class="hit" data-act="bondo" data-k="${k}" points="${pts}" fill="rgba(254,174,52,.16)"><title>Bond: tap to change</title></polygon>`; }
    });
    L.atoms.forEach((a, i) => {
      const x = px(a), y = py(a);
      if (L.edit) s += `<circle class="hit" data-act="atomlp" data-i="${i}" cx="${x}" cy="${y}" r="17" fill="rgba(44,232,245,.10)" stroke="rgba(44,232,245,.55)" stroke-dasharray="3 3"><title>${a.s}: tap to add a lone pair</title></circle>`;
      s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="700" fill="currentColor">${a.s}</text>`;
      const sides = [[0, -18, 1, 0], [18, 0, 0, 1], [0, 18, 1, 0], [-18, 0, 0, 1]];
      (a.d || [0, 0, 0, 0]).forEach((n, q) => { const [ox, oy, sx, sy] = sides[q]; if (n === 1) s += dot(x + ox, y + oy); if (n === 2) s += dot(x + ox - sx * 5, y + oy - sy * 5) + dot(x + ox + sx * 5, y + oy + sy * 5); });
      if (a.q) s += `<text x="${x + 14}" y="${y - 13}" font-size="14" font-weight="700" fill="currentColor">${String(a.q).replace('-', '−')}</text>`;
    });
    return `<svg class="lw" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${L.alt || 'Lewis structure'}">${s}</svg>`;
  };
}

/* ---------- Built-answer question types ---------- */
const escA = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const fmtCh = v => v === 0 ? '0' : (Math.abs(v) === 1 ? '' : Math.abs(v)) + (v > 0 ? '+' : '-');
const chLabel = v => v === 0 ? '0' : `${Math.abs(v)}${v > 0 ? '+' : '−'}`;
const normS = s => String(s).toLowerCase().replace(/[\s\-_]/g, '');
const SH = { linear:['linear'], bent:['bent', 'vshaped', 'vshape', 'angular'], tplanar:['trigonalplanar'], tet:['tetrahedral'], tpyr:['trigonalpyramidal', 'pyramidal'] };
const SHN = { linear:'linear', bent:'bent', tplanar:'trigonal planar', tet:'tetrahedral', tpyr:'trigonal pyramidal' };
const PHASES = ['s', 'l', 'g', 'aq'];
const RTYPES = [['comb', 'Combination'], ['decomp', 'Decomposition'], ['single', 'Single replacement'], ['double', 'Double replacement']];
const arrEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const fieldsOf = t => t.fields || ui.dfields || [];

function fieldOk(f, v){
  if (f.k === 'text'){
    const n = f.sh ? normS(v) : normT(v, f.cs); if (!n) return false;
    const acc = f.sh ? SH[f.sh] : f.accept;
    if (acc.some(a => (f.sh ? normS(a) : normT(a, f.cs)) === n)) return true;
    return !!(f.contains && f.contains.some(c => n.includes(c)));
  }
  return v === f.a || (f.alt || []).includes(v);
}
function fieldDisp(f){
  if (f.k === 'text') return f.sh ? SHN[f.sh] : (f.disp || f.accept[0]);
  if (f.k === 'pick') return f.opts.find(o => o[0] === f.a)[1];
  if (f.k === 'charge') return chLabel(f.a);
  return String(f.a);
}
function fieldHTML(f, i, dis){
  const v = ui.fv[i];
  if (f.k === 'text') return `<div><label class="flab" for="fx${i}">${F(f.label)}</label><input id="fx${i}" data-fi="${i}" class="inp wide" value="${escA(v)}" autocomplete="off" autocapitalize="off" spellcheck="false" ${f.numeric ? 'inputmode="numeric"' : ''} ${dis}></div>`;
  if (f.k === 'pick') return `<div><span class="flab">${F(f.label)}</span><div class="units">${f.opts.map(o => `<button class="sw" data-act="fpick" data-i="${i}" data-v="${o[0]}" aria-pressed="${v === o[0]}" ${dis}>${F(o[1])}</button>`).join('')}</div></div>`;
  return `<div class="fstep"><span class="flab">${F(f.label)}</span><div class="row"><button class="sbtn" data-act="fnum" data-i="${i}" data-d="-1" aria-label="Decrease" ${dis}>−</button><b class="fval">${f.k === 'charge' ? chLabel(v) : v}</b><button class="sbtn" data-act="fnum" data-i="${i}" data-d="1" aria-label="Increase" ${dis}>+</button></div></div>`;
}
function previewHTML(t, vals){
  return F(t.preview.replace(/\{(\d+)\}/g, (m, i) => {
    const f = t.fields[+i], v = vals[+i];
    if (f.k === 'coef') return v === 1 ? '' : String(v);
    if (f.k === 'charge') return fmtCh(v);
    if (f.k === 'pick') return v == null ? '?' : f.opts.find(o => o[0] === v)[1].replace(/[()]/g, '');
    return String(v);
  }));
}
const keyVals = t => t.fields.map(f => f.a != null ? f.a : '');

const XT = {
  form:{
    init(t){ ui.fv = t.fields.map(f => f.k === 'coef' ? 1 : (f.k === 'num' || f.k === 'charge') ? (f.start || 0) : f.k === 'pick' ? null : ''); },
    body(t, dis, verb){
      return `<div class="win dev"><div class="devh"><span>${t.dev || CAMP.dev.form || 'Answer'}</span><span>${t.fields.length > 1 ? t.fields.length + ' parts' : ''}</span></div>
        ${t.preview ? `<div class="bigeq" id="fprev">${previewHTML(t, ui.fv)}</div>` : ''}
        <div class="fgrid">${t.fields.map((f, i) => fieldHTML(f, i, dis)).join('')}</div>
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    grade(t){
      if (t.fields.some((f, i) => f.k === 'text' ? !String(ui.fv[i]).trim() : f.k === 'pick' ? ui.fv[i] == null : false)) return {err:'Fill in every part.'};
      const rows = t.fields.map((f, i) => { const ok = fieldOk(f, ui.fv[i]); return [F(f.label), ok, ok ? 'Correct.' : `Answer: ${fieldDisp(f)}`]; });
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + (t.preview ? `<p>${previewHTML(t, keyVals(t))}</p>` : '') + `<p>${F(t.why)}</p>` };
    },
    solution(t){ return `<p>${t.fields.map(f => `${F(f.label)}: <b>${F(fieldDisp(f))}</b>`).join('<br>')}</p>${t.preview ? `<p>${previewHTML(t, keyVals(t))}</p>` : ''}<p>${F(t.why)}</p>`; }
  },
  sort:{
    init(t){ ui.sv = t.items.map(() => null); },
    body(t, dis, verb){
      return `<div class="win dev"><div class="devh"><span>${t.dev || 'Sort them'}</span><span>${t.items.length} items</span></div>
        ${t.items.map((it, i) => { const opts = it.opts || t.bins; return `<div class="srow"><span class="sitem">${F(it.s)}</span><div class="units">${opts.map(o => `<button class="sw" data-act="spick" data-i="${i}" data-v="${o[0]}" aria-pressed="${ui.sv[i] === o[0]}" ${dis}>${F(o[1])}</button>`).join('')}</div></div>`; }).join('')}
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    grade(t){
      if (ui.sv.some(v => v == null)) return {err:'Sort every item first.'};
      const rows = t.items.map((it, i) => { const opts = it.opts || t.bins, nm = k => opts.find(o => o[0] === k)[1], ok = ui.sv[i] === it.a || (it.alt || []).includes(ui.sv[i]);
        return [F(it.s), ok, (ok ? nm(it.a) : `Answer: ${nm(it.a)}`) + (it.why ? ` · ${it.why}` : '')]; });
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + (t.why ? `<p>${F(t.why)}</p>` : '') };
    },
    solution(t){ return `<ul class="checks">${t.items.map(it => { const opts = it.opts || t.bins; return `<li><span class="mk y">→</span><span><b>${F(it.s)}:</b> ${F(opts.find(o => o[0] === it.a)[1])}${it.why ? ` · ${F(it.why)}` : ''}</span></li>`; }).join('')}</ul>${t.why ? `<p>${F(t.why)}</p>` : ''}`; }
  },
  dots:{
    init(t){ ui.dv = [0, 0, 0, 0]; ui.dfields = [{k:'num', label:'Bonds it usually forms', a:t.bonds, min:0, max:4}]; ui.fv = [0]; },
    body(t, dis, verb){
      const n = ui.dv.reduce((a, b) => a + b, 0);
      const sides = [[90, 30], [150, 80], [90, 130], [30, 80]], hits = [[45, 2, 90, 52], [124, 40, 54, 80], [45, 108, 90, 50], [2, 40, 54, 80]];
      let s = '';
      ui.dv.forEach((c, i) => {
        const [x, y] = sides[i], v = i % 2 === 0;
        s += `<rect class="hit" data-act="dside" data-i="${i}" x="${hits[i][0]}" y="${hits[i][1]}" width="${hits[i][2]}" height="${hits[i][3]}" fill="rgba(44,232,245,.06)" stroke="rgba(44,232,245,.4)" stroke-dasharray="4 4" rx="4"><title>Tap to add a dot</title></rect>`;
        if (c === 1) s += `<circle class="dt" cx="${x}" cy="${y}" r="5" fill="currentColor"/>`;
        if (c === 2) s += `<circle class="dt" cx="${v ? x - 10 : x}" cy="${v ? y : y - 10}" r="5" fill="currentColor"/><circle class="dt" cx="${v ? x + 10 : x}" cy="${v ? y : y + 10}" r="5" fill="currentColor"/>`;
      });
      s += `<text x="90" y="80" text-anchor="middle" dominant-baseline="central" font-size="46" font-weight="700" fill="currentColor">${t.el}</text>`;
      return `<div class="win dev"><div class="devh"><span>${t.dev || CAMP.dev.dots || 'Dot builder'}</span><span>Dots: ${n}</span></div>
        <p class="dim" style="margin:0;font-size:15px">Tap a side to add a dot. Tap again for a pair, again to clear.</p>
        <div class="lwed"><svg class="lw dotpad" viewBox="0 0 180 160" width="220" height="196" aria-label="Lewis symbol of ${t.el} with ${n} dots">${s}</svg></div>
        <div class="fgrid">${fieldHTML(ui.dfields[0], 0, dis)}</div>
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    grade(t){
      const tot = ui.dv.reduce((a, b) => a + b, 0), singles = ui.dv.filter(x => x === 1).length, exp = t.ve <= 4 ? t.ve : 8 - t.ve;
      const rows = [['Valence dots', tot === t.ve, tot === t.ve ? `${t.ve} dots.` : `${t.el} has ${t.ve} valence electrons; you drew ${tot}.`],
        ['Pairing', tot === t.ve && singles === exp, singles === exp ? `${exp} unpaired dot${exp === 1 ? '' : 's'}.` : `Put one dot on each side before pairing. ${t.el} has ${exp} unpaired dot${exp === 1 ? '' : 's'}.`],
        ['Bonds', ui.fv[0] === t.bonds, ui.fv[0] === t.bonds ? `${t.bonds}.` : `Answer: ${t.bonds}. Each unpaired dot can form one bond.`]];
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + XT.dots.solution(t) };
    },
    solution(t){
      const d = [0, 0, 0, 0]; for (let i = 0; i < t.ve; i++) d[i % 4]++;
      return `<div class="figs"><figure>${lewisSVG({atoms:[{s:t.el, d:[d[0], d[1], d[2], d[3]]}], alt:`${t.el} with ${t.ve} dots`})}</figure></div><p>${F(t.why)}</p>`;
    }
  },
  lp:{
    init(t){ ui.lp = t.mol.atoms.map(a => a.pre || 0); ui.bo = t.mol.bonds.map(b => b[2] || 1); },
    editor(t){ return `<div class="lwed" id="lwed">${lewisSVG(molSpec(t.mol, ui.bo, ui.lp, !ui.done && 'atoms'))}</div><p class="dim" id="ecount" style="margin:0;font-size:15px">Electrons in your drawing: <b>${eCount(ui.bo, ui.lp)}</b></p>`; },
    body(t, dis, verb){
      return `<div class="win dev"><div class="devh"><span>${t.dev || CAMP.dev.lp || 'Lone pairs'}</span><span>Tap atoms</span></div>
        <p class="dim" style="margin:0;font-size:15px">Tap an atom to add a lone pair. Keep tapping to cycle back to zero.</p>
        ${XT.lp.editor(t)}<p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    grade(t){
      const rows = [];
      t.mol.atoms.forEach((a, i) => { if (a.s === 'H') return; const k = t.key[i], u = ui.lp[i]; rows.push([`${a.s}${t.mol.atoms.filter(x => x.s === a.s).length > 1 ? ' (' + (i + 1) + ')' : ''}`, u === k, u === k ? `${k} lone pair${k === 1 ? '' : 's'}.` : `Should have ${k} lone pair${k === 1 ? '' : 's'}; you drew ${u}.`]); });
      const hBad = t.mol.atoms.some((a, i) => a.s === 'H' && ui.lp[i] > 0);
      if (t.mol.atoms.some(a => a.s === 'H')) rows.push(['H atoms', !hBad, hBad ? 'H never gets lone pairs. Its one bond already gives it 2 electrons.' : 'No lone pairs. Correct.']);
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + XT.lp.solution(t) };
    },
    solution(t){ return `<div class="figs"><figure>${lewisSVG(molSpec(t.mol, null, t.key))}</figure></div><p>${F(t.why)}</p>`; }
  },
  build:{
    init(t){ ui.bo = (t.pre && t.pre.bo) ? t.pre.bo.slice() : t.mol.bonds.map(() => 1); ui.lp = (t.pre && t.pre.lp) ? t.pre.lp.slice() : t.mol.atoms.map(() => 0); ui.fv = ['', ...t.shapes.map(() => '')]; },
    editor(t){ return `<div class="lwed" id="lwed">${lewisSVG(molSpec(t.mol, ui.bo, ui.lp, !ui.done))}</div><p class="dim" id="ecount" style="margin:0;font-size:15px">Electrons in your drawing: <b>${eCount(ui.bo, ui.lp)}</b></p>`; },
    body(t, dis, verb){
      return `<div class="win dev"><div class="devh"><span>${CAMP.dev.build || 'Workbench'}</span><span>${t.pre ? 'Fix it' : 'Build it'}</span></div>
        <div><label class="flab" for="fx0">1 · Total valence electrons</label><input id="fx0" data-fi="0" class="inp sm" inputmode="numeric" value="${escA(ui.fv[0])}" autocomplete="off" ${dis}></div>
        <span class="flab">2 · ${t.pre ? 'Fix the structure.' : 'Build the structure.'} Tap a bond to cycle single → double → triple. Tap an atom to add lone pairs.</span>
        ${XT.build.editor(t)}
        <span class="flab">3 · Geometry <span class="dim" style="font-weight:400">(linear, bent, trigonal planar, tetrahedral, trigonal pyramidal)</span></span>
        <div class="fgrid">${t.shapes.map((f, i) => `<div><label class="flab" for="fx${i + 1}">${F(f.label)}</label><input id="fx${i + 1}" data-fi="${i + 1}" class="inp wide" value="${escA(ui.fv[i + 1])}" autocomplete="off" autocapitalize="off" spellcheck="false" ${dis}></div>`).join('')}</div>
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    grade(t){
      if (!String(ui.fv[0]).trim() || t.shapes.some((f, i) => !String(ui.fv[i + 1]).trim())) return {err:'Fill in the electron count and every geometry.'};
      const veOk = parseInt(ui.fv[0], 10) === t.ve, got = eCount(ui.bo, ui.lp);
      const sOk = t.keys.some(k => arrEq(k.bo, ui.bo) && arrEq(k.lp, ui.lp));
      const rows = [['Valence electrons', veOk, veOk ? `${t.ve}.` : `Answer: ${t.ve}.`],
        ['Structure', sOk, sOk ? 'Every atom has the right bonds and lone pairs.' : got !== t.ve ? `Your drawing has ${got} electrons; it needs ${t.ve}.` : 'The electron count is right, but they\'re in the wrong places. Check each atom\'s octet (H gets 2).'],
        ...t.shapes.map((f, i) => { const ok = fieldOk({k:'text', sh:f.sh}, ui.fv[i + 1]); return [F(f.label), ok, ok ? SHN[f.sh] + '.' : `Answer: ${SHN[f.sh]}.`]; })];
      if (!sOk){ ui.bo = t.keys[0].bo.slice(); ui.lp = t.keys[0].lp.slice(); }
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + XT.build.solution(t) };
    },
    solution(t){
      return `<div class="figs">${t.keys.map((k, i) => `<figure>${lewisSVG(molSpec(t.mol, k.bo, k.lp))}${t.keys.length > 1 ? `<figcaption>Resonance form ${i + 1}</figcaption>` : ''}</figure>`).join('')}</div>
        <p>${t.ve} valence electrons · ${t.shapes.map(f => `${F(f.label)}: <b>${SHN[f.sh]}</b>`).join(' · ')}</p><p>${F(t.why)}</p>`;
    }
  },
  eq:{
    init(t){ const sp = t.L.concat(t.R); ui.step = 'formulas'; ui.fv = sp.map(() => ''); ui.coefs = sp.map(() => 1); ui.ph = sp.map(() => null); ui.rt = null; ui.flags = {}; },
    body(t, dis, verb){
      const sp = t.L.concat(t.R);
      if (ui.step === 'formulas') return `<div class="win dev"><div class="devh"><span>${CAMP.dev.eq || 'Equation'}</span><span>Step 1 of 2</span></div>
        <p class="dim" style="margin:0;font-size:15px">Type the formula for each substance. Subscripts as plain numbers (CuCl2).</p>
        <div class="fgrid">${t.names.map((n, i) => `<div><label class="flab" for="fx${i}">${n}</label><input id="fx${i}" data-fi="${i}" class="inp wide" value="${escA(ui.fv[i])}" autocomplete="off" autocapitalize="off" spellcheck="false" ${dis}></div>`).join('')}</div>
        <p class="err" id="err1"></p><button class="pb go big" data-act="eqform">Check formulas ▶</button></div>`;
      return `<div class="win dev"><div class="devh"><span>${CAMP.dev.eq || 'Equation'}</span><span>Step 2 of 2</span></div>
        <span class="flab">Balance it</span><div id="balbox">${reactorHTML(t.L, t.R, ui.coefs, ui.done)}</div>
        <span class="flab">Phase labels · tap to cycle (s) → (l) → (g) → (aq)</span>
        <div class="phrow">${sp.map((s, i) => `<div class="phc"><span>${F(s)}</span><button class="sw" data-act="phase" data-i="${i}" aria-pressed="${!!ui.ph[i]}" ${dis}>${ui.ph[i] ? '(' + ui.ph[i] + ')' : '( ? )'}</button></div>`).join('')}</div>
        <span class="flab">Reaction type</span>
        <div class="units">${RTYPES.map(([k, n]) => `<button class="sw" data-act="rtype" data-v="${k}" aria-pressed="${ui.rt === k}" ${dis}>${n}</button>`).join('')}</div>
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    eqText(t, coefs, ph){ const sp = t.L.concat(t.R), term = i => `${coefs[i] === 1 ? '' : coefs[i]}${sp[i]}(${ph[i]})`;
      return t.L.map((_, i) => term(i)).join(' + ') + (t.heat ? ' →(heat) ' : ' → ') + t.R.map((_, k) => term(t.L.length + k)).join(' + '); },
    grade(t){
      if (ui.step === 'formulas') return {err:'Check your formulas first.'};
      if (ui.ph.some(p => !p)) return {err:'Set a phase label on every substance.'};
      if (!ui.rt) return {err:'Pick the reaction type.'};
      const cOk = arrEq(ui.coefs, t.sol), alt = t.phAlt || {}, pOk = ui.ph.every((p, i) => p === t.ph[i] || (alt[i] || []).includes(p)), rOk = ui.rt === t.rt;
      const rows = [];
      if (ui.flags.form) rows.push(['Formulas', false, 'Some formulas were wrong in step 1.']);
      const s = balState(t.L, t.R, ui.coefs);
      rows.push(['Balanced', cOk, cOk ? 'Smallest whole numbers.' : !s.bal ? 'Atoms don\'t match on both sides.' : 'Balanced, but not in lowest whole numbers.']);
      rows.push(['Phases', pOk, pOk ? 'All correct.' : 'Check the states: (s) solid, (l) liquid, (g) gas, (aq) dissolved in water.']);
      rows.push(['Reaction type', rOk, rOk ? RTYPES.find(r => r[0] === t.rt)[1] + '.' : `Answer: ${RTYPES.find(r => r[0] === t.rt)[1]}.`]);
      if (!cOk) ui.coefs = t.sol.slice();
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + XT.eq.solution(t) };
    },
    solution(t){ return `<p><b>${F(XT.eq.eqText(t, t.sol, t.ph))}</b></p><p>Type: <b>${RTYPES.find(r => r[0] === t.rt)[1]}</b>. ${F(t.why)}</p>`; }
  }
};
const XACT = {
  fnum(b){
    const i = +b.dataset.i, f = fieldsOf(ui.t)[i], d = +b.dataset.d;
    const lo = f.k === 'coef' ? 1 : f.k === 'charge' ? -4 : (f.min != null ? f.min : 0), hi = f.k === 'coef' ? 12 : f.k === 'charge' ? 4 : (f.max != null ? f.max : 30);
    ui.fv[i] = Math.max(lo, Math.min(hi, ui.fv[i] + d)); SND.play('key'); drawBody();
  },
  fpick(b){ ui.fv[+b.dataset.i] = b.dataset.v; SND.play('key'); drawBody(); },
  spick(b){ ui.sv[+b.dataset.i] = b.dataset.v; SND.play('key'); b.parentElement.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x === b)); },
  dside(b){ const i = +b.dataset.i; ui.dv[i] = (ui.dv[i] + 1) % 3; SND.play('pop'); drawBody(); },
  atomlp(b){
    const t = ui.t, i = +b.dataset.i, max = freeSides(t.mol, i).length;
    ui.lp[i] = max ? (ui.lp[i] + 1) % (max + 1) : 0; SND.play(max ? 'pop' : 'jam');
    const ed = document.getElementById('lwed'); if (ed){ const X = XT[t.type]; ed.outerHTML = X.editor(t).split('<p class="dim" id="ecount"')[0]; document.getElementById('ecount').innerHTML = `Electrons in your drawing: <b>${eCount(ui.bo, ui.lp)}</b>`; }
  },
  bondo(b){
    const t = ui.t, k = +b.dataset.k; ui.bo[k] = ui.bo[k] % 3 + 1; SND.play('zip');
    const ed = document.getElementById('lwed'); if (ed){ ed.outerHTML = XT.build.editor(t).split('<p class="dim" id="ecount"')[0]; document.getElementById('ecount').innerHTML = `Electrons in your drawing: <b>${eCount(ui.bo, ui.lp)}</b>`; }
  },
  phase(b){ const i = +b.dataset.i, c = ui.ph[i]; ui.ph[i] = PHASES[(PHASES.indexOf(c) + 1) % PHASES.length]; SND.play('key'); b.textContent = '(' + ui.ph[i] + ')'; b.setAttribute('aria-pressed', 'true'); },
  rtype(b){ ui.rt = b.dataset.v; SND.play('key'); b.parentElement.querySelectorAll('.sw').forEach(x => x.setAttribute('aria-pressed', x === b)); },
  eqform(){
    const t = ui.t, sp = t.L.concat(t.R), e1 = document.getElementById('err1');
    if (ui.fv.some(v => !String(v).trim())){ e1.textContent = 'Type a formula for every substance.'; SND.play('jam'); return; }
    const wrong = sp.map((f, i) => normT(ui.fv[i], true) === normT(f, true) ? null : i).filter(i => i !== null);
    if (wrong.length){
      ui.flags.form = true; st.hull -= 6; if (st.hull <= 0){ st.patches++; st.hull = 35; } save(); hud(); shake(); flash('red'); SND.play('jam');
      say(`Close. ${wrong.map(i => `${t.names[i]} is ${sp[i]}`).join('; ')}. I filled those in for step 2. (−6 ${W().hull})`, 'worried');
    } else { SND.play('ok'); say('Formulas are right. Now balance it, label the phases, and name the type.', 'happy'); }
    ui.step = 'balance'; drawBody();
  }
};
view.addEventListener('input', e => { const i = e.target.dataset && e.target.dataset.fi; if (i != null && ui.fv) ui.fv[+i] = e.target.value; });

/* ---------- Topics ---------- */
Object.assign(TOPICS, {
  tlewis:{name:'Lewis symbols & lone pairs', rule:'Valence electrons = group number (O in group 16 has 6). Place one dot per side before pairing; the unpaired dots are the bonds the atom usually forms (O: 2). Lone pairs complete octets, and H never gets lone pairs.'},
  tbond:{name:'Bond polarity (ΔEN)', rule:'ΔEN under 0.5: nonpolar covalent. 0.5 to 1.9: polar covalent. About 2.0 or more: ionic. EN values: H 2.1, C 2.5, N 3.0, O 3.5, F 4.0, Na 0.9, Cl 3.0.'},
  tion:{name:'Naming ionic compounds', rule:'Cation first, then anion with -ide (or the polyatomic name). Metals with more than one charge get a Roman numeral: FeCl2 = iron(II) chloride, Cu2O = copper(I) oxide. Work the charge out from the anion.'},
  tcov:{name:'Naming covalent compounds', rule:'Prefixes: mono-, di-, tri-, tetra-, penta-, hexa-. No mono- on the first element. The second element ends in -ide: PCl5 = phosphorus pentachloride, B2O3 = diboron trioxide.'},
  tprop:{name:'Ionic vs. covalent properties', rule:'Ionic: high melting points (strong electrostatic attraction in the lattice), dissociate into ions in water, conduct (electrolytes). Covalent: dissolve as whole molecules, no ions, nonelectrolytes. CaCl2(s) → Ca^2+(aq) + 2Cl^-(aq).'},
  tshape:{name:'VSEPR shapes', rule:'Count electron groups on the central atom (bonds count once, lone pairs count). 2 groups: linear. 3: trigonal planar. 4: tetrahedral. 4 with 1 lone pair: trigonal pyramidal. 4 with 2 lone pairs: bent.'},
  tstruct:{name:'Drawing Lewis structures', rule:'1) Total the valence electrons (add for − charge). 2) Connect atoms with single bonds. 3) Fill outer atoms\' octets with lone pairs (H gets none). 4) Put leftovers on the central atom. 5) If the central atom lacks an octet, turn lone pairs into double or triple bonds.'},
  tpolar:{name:'Molecular polarity & boiling points', rule:'Polar bonds in a symmetric shape (linear CO2, tetrahedral CF4) cancel: nonpolar molecule. Lone pairs or mixed atoms make it lopsided: polar. Like dissolves like. Higher boiling: ionic > H-bonding > polar > nonpolar; bigger atoms = stronger dispersion.'},
  tmole:{name:'Moles, amu & Avogadro', rule:'1 amu = 1.66054×10^-24 g. 1 mol = 6.022×10^23 particles. grams ÷ molar mass = moles; moles × 6.022×10^23 = particles. Watch atoms vs. molecules (1 O2 has 2 O atoms).'},
  tfmass:{name:'Formula mass', rule:'Add atomic masses × count. Subscripts outside parentheses multiply everything inside; a hydrate\'s ·6H2O adds 6 whole waters. Formula mass in amu equals molar mass in g/mol.'},
  teq:{name:'Writing & classifying equations', rule:'Names → formulas (charges balance), then balance with coefficients only, then phases: (s), (l), (g), (aq). Combination A + B → AB · Decomposition AB → A + B · Single replacement A + BC → AC + B · Double replacement AB + CD → AD + CB.'},
  tsol:{name:'Solubility rules', rule:'Always soluble: alkali metal (Li^+, Na^+, K^+) and NH4^+ compounds, all nitrates. Chlorides soluble except Ag^+, Pb^2+. Sulfates soluble except Ba^2+, Pb^2+, Ca^2+. Carbonates, phosphates, sulfides insoluble except alkali metals and NH4^+.'},
  tacid:{name:'Acid–base reactions', rule:'H^+ from the acid combines with OH^- from the base to make water. Acid + base → salt + water. It is a double replacement (neutralization).'},
  tstoich:{name:'Stoichiometry, limiting reactant & yield', rule:'mol A × (coef B / coef A) = mol B. Work out the product from each reactant; the one that makes less is limiting. Excess left = start − used. Percent yield = actual ÷ theoretical × 100.'}
});

/* ---------- Task builders ---------- */
const FM = (id, n, q, fields, why, x = {}) => ({id:'t' + id, n, type:'form', q, fields, why, ...x});
const T1 = (label, accept, disp, x = {}) => ({k:'text', label, accept, disp, ...x});
const NAMES = (id, n, list, why) => FM(id, n, 'Name each compound.', list.map(([f, acc, disp]) => T1(f, acc, disp)), why, {topic:'tion'});
const LPT = (id, n, q, mol, key, why) => ({id:'t' + id, n, type:'lp', q, mol, key, why});
const BLD = (id, n, name, mol, ve, keys, shapes, why, pre) => ({id:'t' + id, n, type:'build', q:pre ? `This Lewis structure of ${name} is wrong. Fix it and give its geometry.` : `Draw the Lewis structure of ${name} and give its geometry.`, mol, ve, keys, shapes, why, pre});
const EQ = (id, n, words, names, L, R, sol, ph, rt, why, x = {}) => ({id:'t' + id, n, type:'eq', q:`Write the balanced equation with phase labels and name the reaction type: ${words}`, names, L, R, sol, ph, rt, why, ...x});
const CH3 = (id, n, p, x = {}) => ({id:'t' + id, n, type:'calc', gen:'chain', p, ...x});
const FX = (id, n, p, x = {}) => ({id:'t' + id, n, type:'calc', gen:'fixed', p, ...x});
const SHP = (id, n, mol, sh, lp, why) => FM(id, n, `Name the shape of ${mol} and count the lone pairs on its central atom. Shapes: linear, bent, trigonal planar, tetrahedral, trigonal pyramidal.`, [{k:'text', label:'Shape', sh}, {k:'num', label:'Lone pairs on the central atom', a:lp, max:4}], why, {topic:'tshape'});
const AT = (s, x, y, q) => ({s, x, y, q});
const PH = [['s', '(s)'], ['l', '(l)'], ['g', '(g)'], ['aq', '(aq)']];
const IC = [['ionic', 'Ionic'], ['cov', 'Covalent']];
const AVG = '6.022×10^23';

/* Molecule skeletons (grid positions) */
const M = {
  ncl3:{atoms:[AT('N', 1, 1), AT('Cl', 0, 1), AT('Cl', 2, 1), AT('Cl', 1, 2)], bonds:[[0, 1], [0, 2], [0, 3]]},
  ch3oh:{atoms:[AT('C', 1, 1), AT('H', 1, 0), AT('H', 0, 1), AT('H', 1, 2), AT('O', 2, 1), AT('H', 3, 1)], bonds:[[0, 1], [0, 2], [0, 3], [0, 4], [4, 5]]},
  cs2:{atoms:[AT('S', 0, 0), AT('C', 1, 0), AT('S', 2, 0)], bonds:[[0, 1], [1, 2]]},
  ch2cl2:{atoms:[AT('C', 1, 1), AT('H', 1, 0), AT('H', 1, 2), AT('Cl', 0, 1), AT('Cl', 2, 1)], bonds:[[0, 1], [0, 2], [0, 3], [0, 4]]},
  hno3:{atoms:[AT('H', 0, 1), AT('O', 1, 1), AT('N', 2, 1), AT('O', 2, 0), AT('O', 3, 1)], bonds:[[0, 1], [1, 2], [2, 3], [2, 4]]},
  so2:{atoms:[AT('O', 0, 0), AT('S', 1, 0), AT('O', 2, 0)], bonds:[[0, 1], [1, 2]]},
  ccl4:{atoms:[AT('C', 1, 1), AT('Cl', 1, 0), AT('Cl', 0, 1), AT('Cl', 2, 1), AT('Cl', 1, 2)], bonds:[[0, 1], [0, 2], [0, 3], [0, 4]]},
  pbr3:{atoms:[AT('P', 1, 1), AT('Br', 0, 1), AT('Br', 2, 1), AT('Br', 1, 2)], bonds:[[0, 1], [0, 2], [0, 3]]},
  etoh:{atoms:[AT('C', 1, 1), AT('C', 2, 1), AT('O', 3, 1), AT('H', 4, 1), AT('H', 0, 1), AT('H', 1, 0), AT('H', 1, 2), AT('H', 2, 0), AT('H', 2, 2)], bonds:[[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 8]]},
  hcn:{atoms:[AT('H', 0, 0), AT('C', 1, 0), AT('N', 2, 0)], bonds:[[0, 1], [1, 2]]},
  co:{atoms:[AT('C', 0, 0), AT('O', 1, 0)], bonds:[[0, 1]]},
  h2o:{atoms:[AT('O', 1, 0), AT('H', 0, 1), AT('H', 2, 1)], bonds:[[0, 1], [0, 2]]},
  co2:{atoms:[AT('O', 0, 0), AT('C', 1, 0), AT('O', 2, 0)], bonds:[[0, 1], [1, 2]]},
  hf:{atoms:[AT('H', 0, 0), AT('F', 1, 0)], bonds:[[0, 1]]},
  o2:{atoms:[AT('O', 0, 0), AT('O', 1, 0)], bonds:[[0, 1, 2]]},
  nacl:{atoms:[AT('Na', 0, 0, '+'), AT('Cl', 1.4, 0, '-')], bonds:[]},
  nh3:{atoms:[AT('N', 1, 1), AT('H', 0, 1), AT('H', 2, 1), AT('H', 1, 2)], bonds:[[0, 1], [0, 2], [0, 3]]},
  ch4:{atoms:[AT('C', 1, 1), AT('H', 1, 0), AT('H', 0, 1), AT('H', 2, 1), AT('H', 1, 2)], bonds:[[0, 1], [0, 2], [0, 3], [0, 4]]},
  cl2:{atoms:[AT('Cl', 0, 0), AT('Cl', 1, 0)], bonds:[[0, 1]]},
  hcl:{atoms:[AT('H', 0, 0), AT('Cl', 1, 0)], bonds:[[0, 1]]}
};
M.h2o_lp = M.h2o;

const TEMPLE_MODS = [
  { id:'hall', code:'En', name:'Entrance Hall', topics:['tlewis', 'tbond'],
    intro:['The Entrance Hall. The door glyphs are Lewis symbols.', 'Dots are valence electrons. Unpaired dots tell you how many bonds an atom forms.'],
    outro:['The door grinds open.', 'One dot per side before pairing. Then check ΔEN to classify the bond.'],
    flav:['A glyph glows on the door.', 'Dust drifts from the ceiling.', 'Squawk! Another glyph.'],
    tasks:[
      {id:'t1', n:1, type:'dots', q:'Draw the Lewis symbol for an oxygen atom. How many bonds will oxygen usually form?', el:'O', ve:6, bonds:2, why:'O has 6 valence electrons: 2 lone pairs and 2 unpaired dots. Each unpaired dot can pair up in a bond, so O forms 2 bonds.'},
      FM('2', 2, 'Potassium and oxygen react to form potassium oxide. Show how electrons are lost and gained.', [{k:'coef', label:'K atoms needed per O atom', a:2}, {k:'num', label:'Electrons each K loses', a:1, max:4}, {k:'num', label:'Electrons O gains', a:2, max:4}, {k:'charge', label:'Charge on the oxide ion', a:-2}],
        'Each K loses 1 electron to become K^+. O needs 2 to reach an octet, so it takes one from each of 2 K atoms and becomes O^2-.', {preview:'{0}K· + ·Ö· → {0}K^+ + [:Ö:]^{3}', topic:'tlewis'}),
      LPT('3a', 3, 'Fill in the missing lone pairs: H–F', M.hf, [0, 3], 'F has 7 valence electrons: 1 in the bond, 6 as 3 lone pairs. H never gets lone pairs.'),
      LPT('3b', 3, 'Fill in the missing lone pairs: H–O–H', M.h2o, [2, 0, 0], 'O has 6 valence electrons: 2 in bonds, 4 as 2 lone pairs.'),
      LPT('3c', 3, 'Fill in the missing lone pairs: O=O', M.o2, [2, 2], 'Each O shares 2 electrons in the double bond and keeps 4 as 2 lone pairs, for 8 total.'),
      LPT('3d', 3, 'Fill in the missing lone pairs: Na^+[Cl]^-', M.nacl, [0, 4], 'Na^+ lost its valence electron, so it has no dots. Cl^- gained one: 8 electrons as 4 lone pairs.'),
      LPT('3e', 3, 'Fill in the missing lone pairs: NH3', M.nh3, [1, 0, 0, 0], 'N has 5 valence electrons: 3 in bonds, 2 as 1 lone pair.'),
      {id:'t4', n:4, type:'sort', topic:'tbond', q:'Classify each bond. EN values: H 2.1, N 3.0, O 3.5, F 4.0, Na 0.9, Cl 3.0. Rule: ΔEN < 0.5 nonpolar, 0.5–1.9 polar, ≥ 2.0 ionic.', dev:'Bond sorter',
        bins:[['np', 'Nonpolar'], ['p', 'Polar'], ['i', 'Ionic']],
        items:[{s:'H–F', a:'p', why:'ΔEN 1.9'}, {s:'O–H', a:'p', why:'ΔEN 1.4'}, {s:'O=O', a:'np', why:'ΔEN 0'}, {s:'Na–Cl', a:'i', why:'ΔEN 2.1'}, {s:'N–H', a:'p', why:'ΔEN 0.9'}],
        why:'Subtract the electronegativities and compare with the cutoffs. Check your Figure 3-4 cutoffs; some classes put the ionic line at 1.7.'}
    ]},
  { id:'glyph', code:'Gl', name:'Glyph Hall', topics:['tion', 'tcov'],
    intro:['The Glyph Hall. Every carving is a compound that needs its proper name.', 'Ionic: cation, then anion, with Roman numerals for metals like Fe and Cu. Covalent: prefixes.'],
    outro:['Every glyph is named.', 'Find the metal\'s charge from the anion before you write the Roman numeral.'],
    flav:['A carved tablet lights up.', 'The walls rumble.', 'Polly pecks at a glyph.'],
    tasks:[
      NAMES('5a', 5, [['BaCl2', ['bariumchloride'], 'barium chloride'], ['MgBr2', ['magnesiumbromide'], 'magnesium bromide'], ['KI', ['potassiumiodide'], 'potassium iodide']], 'Fixed-charge metals need no numeral: metal name + nonmetal with -ide.'),
      NAMES('5b', 5, [['Li2O', ['lithiumoxide'], 'lithium oxide'], ['CaSO4', ['calciumsulfate', 'calciumsulphate'], 'calcium sulfate'], ['Mg(NO3)2', ['magnesiumnitrate'], 'magnesium nitrate']], 'Polyatomic ions keep their names: SO4^2- sulfate, NO3^- nitrate.'),
      NAMES('5c', 5, [['FeCl2', ['iron(ii)chloride', 'ferrouschloride'], 'iron(II) chloride'], ['FeCl3', ['iron(iii)chloride', 'ferricchloride'], 'iron(III) chloride'], ['Cu2O', ['copper(i)oxide', 'cuprousoxide'], 'copper(I) oxide']], 'Two Cl^- means Fe^2+; three means Fe^3+. One O^2- shared by two Cu means each Cu is 1+.'),
      NAMES('5d', 5, [['CuO', ['copper(ii)oxide', 'cupricoxide'], 'copper(II) oxide'], ['Fe(OH)2', ['iron(ii)hydroxide', 'ferroushydroxide'], 'iron(II) hydroxide'], ['NH4OH', ['ammoniumhydroxide'], 'ammonium hydroxide']], 'O^2- balances Cu^2+. Two OH^- balance Fe^2+. NH4^+ is ammonium.'),
      FM('6a', 6, 'Name each covalent compound.', [T1('B2O3', ['diborontrioxide'], 'diboron trioxide'), T1('NO', ['nitrogenmonoxide', 'nitrogenmonooxide'], 'nitrogen monoxide'), T1('ICl', ['iodinemonochloride'], 'iodine monochloride')], 'Prefix every count except a single first atom.', {topic:'tcov'}),
      FM('6b', 6, 'Name each covalent compound.', [T1('PCl3', ['phosphorustrichloride'], 'phosphorus trichloride'), T1('PCl5', ['phosphoruspentachloride'], 'phosphorus pentachloride'), T1('P2O5', ['diphosphoruspentoxide', 'diphosphoruspentaoxide'], 'diphosphorus pentoxide')], 'tri- = 3, penta- = 5, di- = 2.', {topic:'tcov'}),
      FM('7', 7, 'Give the formula for each compound.', [T1('diphosphorus pentoxide', ['P2O5'], 'P2O5', {cs:true}), T1('nitrogen tribromide', ['NBr3'], 'NBr3', {cs:true}), T1('oxygen pentachloride', ['OCl5'], 'OCl5', {cs:true}), T1('iodine monobromide', ['IBr'], 'IBr', {cs:true}), T1('sulfur hexafluoride', ['SF6'], 'SF6', {cs:true})], 'Prefixes become subscripts. hexa- = 6.', {topic:'tcov'})
    ]},
  { id:'spring', code:'Sp', name:'Sacred Spring', topics:['tprop'],
    intro:['The Sacred Spring. Things dissolve differently in these waters.', 'Ionic compounds break into ions. Covalent compounds stay as whole molecules.'],
    outro:['The spring runs clear.', 'Ions conduct. Molecules don\'t.'],
    flav:['The water ripples.', 'Something glints at the bottom.', 'A drop falls from the ceiling.'],
    tasks:[
      FM('8', 8, 'Which have higher melting points, ionic or covalent compounds? Finish the reason.', [{k:'pick', label:'Higher melting points', opts:IC, a:'ionic'}, T1('Ions in a lattice are held by strong ______ attraction.', ['electrostatic', 'electric', 'electrical', 'coulombic'], 'electrostatic', {contains:['electro', 'coulomb', 'opposite']})],
        'Breaking a lattice of ions takes a lot of energy. Covalent molecules are held to each other only by weaker intermolecular forces.'),
      FM('9', 9, 'Which form electrolytic solutions in water, ionic or covalent? Finish the reason.', [{k:'pick', label:'Form electrolytes', opts:IC, a:'ionic'}, T1('They release free ______ that carry electric current.', ['ions', 'ion'], 'ions', {contains:['ion']})], 'Current needs moving charges. Dissolved ionic compounds supply free ions.'),
      FM('10', 10, 'Which dissociate into ions in water? Build the dissolving equation for calcium chloride.', [{k:'pick', label:'Dissociate into ions', opts:IC, a:'ionic'}, {k:'charge', label:'Charge on the calcium ion', a:2}, {k:'coef', label:'Number of chloride ions', a:2}, {k:'charge', label:'Charge on each chloride ion', a:-1}],
        'Ca is in group 2 (2+) and Cl in group 17 (1−). One Ca^2+ needs two Cl^- to balance. H2O goes over the arrow.', {preview:'CaCl2(s) → Ca^{1}(aq) + {2}Cl^{3}(aq)'}),
      FM('11', 11, 'Which dissolve as whole molecules? Build the dissolving equation for ethanol, C2H5OH.', [{k:'pick', label:'Dissolve as whole molecules', opts:IC, a:'cov'}, {k:'pick', label:'Ethanol before dissolving', opts:PH, a:'l'}, {k:'pick', label:'Ethanol after dissolving', opts:PH, a:'aq'}, {k:'pick', label:'Does ethanol break into ions?', opts:[['y', 'Yes'], ['n', 'No']], a:'n'}],
        'Ethanol molecules spread out among the water molecules, but no bonds break into ions.', {preview:'C2H5OH({1}) → C2H5OH({2})'})
    ]},
  { id:'shapes', code:'Sh', name:'Hall of Shapes', topics:['tshape'],
    intro:['The Hall of Shapes. Each pedestal holds a molecule\'s shape.', 'Count electron groups on the central atom. Lone pairs push the bonds together.'],
    outro:['The pedestals settle.', 'Same tetrahedral arrangement, different names: 0 lone pairs tetrahedral, 1 trigonal pyramidal, 2 bent.'],
    flav:['A pedestal rises.', 'A crystal shape spins.', 'The floor tiles click.'],
    tasks:[
      SHP('12a', 12, 'BeH2', 'linear', 0, 'Be has 2 bonds and no lone pairs: 2 groups, linear (180°).'),
      SHP('12b', 12, 'BF3', 'tplanar', 0, 'B has 3 bonds and no lone pairs: 3 groups, trigonal planar (120°).'),
      SHP('12c', 12, 'CH4', 'tet', 0, 'C has 4 bonds and no lone pairs: tetrahedral (109.5°).'),
      SHP('12d', 12, 'NH3', 'tpyr', 1, 'N has 3 bonds and 1 lone pair: 4 groups, trigonal pyramidal.'),
      SHP('12e', 12, 'H2O', 'bent', 2, 'O has 2 bonds and 2 lone pairs: 4 groups, bent.')
    ]},
  { id:'masons', code:'Ms', name:'Mason\'s Workshop', topics:['tstruct'],
    intro:['The Mason\'s Workshop. Build each molecule stone by stone.', 'Count valence electrons first. Then bonds, then lone pairs, then check every octet.'],
    outro:['The masonry holds.', 'If the central atom is short of an octet, share more pairs.'],
    flav:['A chisel taps.', 'Stone blocks shift.', 'Polly lands on the workbench.'],
    tasks:[
      BLD('13a', 13, 'NCl3', M.ncl3, 26, [{bo:[1, 1, 1], lp:[1, 3, 3, 3]}], [{label:'Shape at N', sh:'tpyr'}], '5 + 3(7) = 26. Three N–Cl bonds use 6; each Cl takes 3 lone pairs (18); the last 2 sit on N.'),
      BLD('13b', 13, 'CH3OH', M.ch3oh, 14, [{bo:[1, 1, 1, 1, 1], lp:[0, 0, 0, 0, 2, 0]}], [{label:'Shape at C', sh:'tet'}, {label:'Shape at O', sh:'bent'}], '4 + 4(1) + 6 = 14. Five single bonds use 10; O keeps 2 lone pairs.'),
      BLD('13c', 13, 'CS2', M.cs2, 16, [{bo:[2, 2], lp:[2, 0, 2]}], [{label:'Shape at C', sh:'linear'}], '4 + 2(6) = 16. Two C=S double bonds give C an octet; each S keeps 2 lone pairs.'),
      BLD('13d', 13, 'CH2Cl2', M.ch2cl2, 20, [{bo:[1, 1, 1, 1], lp:[0, 0, 0, 3, 3]}], [{label:'Shape at C', sh:'tet'}], '4 + 2 + 14 = 20. Four single bonds use 8; each Cl takes 3 lone pairs.'),
      BLD('13e', 13, 'HNO3', M.hno3, 24, [{bo:[1, 1, 2, 1], lp:[0, 2, 0, 2, 3]}, {bo:[1, 1, 1, 2], lp:[0, 2, 0, 3, 2]}], [{label:'Shape at N', sh:'tplanar'}, {label:'Shape at the O bonded to H', sh:'bent'}], '1 + 5 + 18 = 24. N needs one double bond to an O to reach an octet; either end O works (resonance).')
    ]},
  { id:'sculpt', code:'Sg', name:'Sculptor\'s Gallery', topics:['tstruct'],
    intro:['The Sculptor\'s Gallery. Some of these statues were carved wrong.', 'Build the rest from scratch, and fix the broken ones.'],
    outro:['The statues approve.', 'H gets 2 electrons, never lone pairs. Carbon wants 4 bonds.'],
    flav:['A statue\'s eyes flicker.', 'Stone dust falls.', 'The gallery hums.'],
    tasks:[
      BLD('13f', 13, 'SO2 (O–S–O)', M.so2, 18, [{bo:[2, 1], lp:[2, 1, 3]}, {bo:[1, 2], lp:[3, 1, 2]}], [{label:'Shape at S', sh:'bent'}], '6 + 12 = 18. One S=O and one S–O, with 1 lone pair on S. The double bond can be on either side: two resonance structures.'),
      BLD('13g', 13, 'CCl4', M.ccl4, 32, [{bo:[1, 1, 1, 1], lp:[0, 3, 3, 3, 3]}], [{label:'Shape at C', sh:'tet'}], '4 + 28 = 32. Four C–Cl bonds use 8; each Cl takes 3 lone pairs.'),
      BLD('13h', 13, 'PBr3', M.pbr3, 26, [{bo:[1, 1, 1], lp:[1, 3, 3, 3]}], [{label:'Shape at P', sh:'tpyr'}], '5 + 21 = 26. Same pattern as NCl3: 1 lone pair on P.'),
      BLD('13i', 13, 'CH3CH2OH', M.etoh, 20, [{bo:[1, 1, 1, 1, 1, 1, 1, 1], lp:[0, 0, 2, 0, 0, 0, 0, 0, 0]}], [{label:'Shape at each C', sh:'tet'}, {label:'Shape at O', sh:'bent'}], '8 + 6 + 6 = 20. Eight single bonds use 16; O keeps 2 lone pairs.'),
      BLD('13j', 13, 'HCN', M.hcn, 10, [{bo:[1, 3], lp:[0, 0, 1]}], [{label:'Shape at C', sh:'linear'}], '1 + 4 + 5 = 10. H–C uses 2; a C≡N triple bond gives C its octet; N keeps 1 lone pair.'),
      BLD('14a', 14, 'CO', M.co, 10, [{bo:[3], lp:[1, 1]}], [{label:'Shape', sh:'linear'}], 'CO has 10 electrons. With a double bond and 2 lone pairs each, C only has 8 if you overcount. A triple bond plus 1 lone pair on each atom uses exactly 10 and gives both octets.', {bo:[2], lp:[2, 2]}),
      BLD('14b', 14, 'H2O', M.h2o, 8, [{bo:[1, 1], lp:[2, 0, 0]}], [{label:'Shape at O', sh:'bent'}], 'H holds only 2 electrons, so the lone pairs on H must go. O keeps 2 lone pairs.', {bo:[1, 1], lp:[2, 1, 1]}),
      BLD('14c', 14, 'CO2', M.co2, 16, [{bo:[2, 2], lp:[2, 0, 2]}], [{label:'Shape at C', sh:'linear'}], 'With only single bonds, C has just 4 electrons. Two C=O double bonds give C an octet and use exactly 16.', {bo:[1, 1], lp:[3, 0, 3]})
    ]},
  { id:'echo', code:'Ec', name:'Echo Chamber', topics:['tpolar'],
    intro:['The Echo Chamber. Polar molecules echo back; nonpolar ones go silent.', 'Polar bonds cancel only in a symmetric shape.'],
    outro:['The echoes fade.', 'Like dissolves like: the polar ones dissolve in water.'],
    flav:['Polly\'s squawk echoes.', 'The walls hum back.', 'A low echo rolls through.'],
    tasks:[
      {id:'t15', n:15, type:'sort', q:'Each of these has polar bonds. Which are nonpolar molecules overall (and so would NOT dissolve well in water)?', dev:'Echo test', bins:[['p', 'Polar molecule'], ['np', 'Nonpolar molecule']],
        items:[{s:'CO2', a:'np', why:'linear: dipoles cancel'}, {s:'NF3', a:'p', why:'trigonal pyramidal'}, {s:'CF4', a:'np', why:'tetrahedral, all the same: cancel'}, {s:'SO2', a:'p', why:'bent'}, {s:'NH3', a:'p', why:'trigonal pyramidal'}, {s:'CH2Cl2', a:'p', why:'tetrahedral but mixed atoms'}],
        why:'CO2 and CF4 have polar bonds but symmetric shapes, so the bond dipoles cancel. The polar ones are expected to dissolve in water.'},
      {id:'t16', n:16, type:'sort', q:'Pick the higher boiling point in each pair.', dev:'Heat test',
        items:[{s:'N2 vs NH3', opts:[['n2', 'N2'], ['nh3', 'NH3']], a:'nh3', why:'polar with hydrogen bonding'}, {s:'CS2 vs CF4', opts:[['cs2', 'CS2'], ['cf4', 'CF4']], a:'cs2', why:'big S atoms, stronger dispersion (46 °C vs −128 °C)'}, {s:'NaCl vs Cl2', opts:[['nacl', 'NaCl'], ['cl2', 'Cl2']], a:'nacl', why:'ionic beats covalent'}],
        why:'Ionic > hydrogen bonding > polar > nonpolar. For CS2 vs CF4 the study guide notes: if your class decides on mass alone, ask your teacher.'}
    ]},
  { id:'count', code:'Ct', name:'Counting Room', topics:['tmole'],
    intro:['The Counting Room. The ancients counted everything in moles.', '1 amu = 1.66054×10^-24 g. 1 mol = 6.022×10^23 of anything.'],
    outro:['The tally stones stop rattling.', 'Atoms vs. molecules: read the question twice.'],
    flav:['Tally stones click.', 'A pile of pebbles shifts.', 'Polly counts on her claws.'],
    tasks:[
      FX('17', 17, {q:'What is the mass of 1 amu in grams?', v:1.66054e-24, sf:3, sfAlt:[4, 5, 6], unit:'g', work:['1 amu = 1.66054×10^-24 g (the study guide rounds to 1.66×10^-24 g)']}),
      FX('18', 18, {q:'What is Avogadro\'s number? (Give the unit too.)', v:6.022e23, sf:4, sfAlt:[3], unit:'per mol', work:['6.022×10^23 particles per mole']}),
      CH3('19a', 19, {q:'Using 1 amu = 1.66054×10^-24 g, find the mass in grams of one C-12 atom ({x} amu).', x:'12', u0:'amu', f:[['1.66054×10^-24', 'g', '1', 'amu']], ru:'g', unit:'g', sf:3, sfWhy:'12 amu is exact for C-12, so keep 3 like the key'}),
      CH3('19b', 19, {q:'Find the mass of one mole of C-12 atoms: {x} atoms, each 12 amu (1 amu = 1.66054×10^-24 g).', x:AVG, u0:'atoms', f:[['12', 'amu', '1', 'atoms'], ['1.66054×10^-24', 'g', '1', 'amu']], ru:'g', unit:'g', sf:3, sfWhy:'keep 3 like the key',
        notes0:['Same number as the amu mass, but in grams: one atom is 12 amu, one mole is 12.0 g.']}),
      CH3('19c', 19, {q:'Using 1 amu = 1.66054×10^-24 g, find the mass in grams of one O-16 atom ({x} amu).', x:'16', u0:'amu', f:[['1.66054×10^-24', 'g', '1', 'amu']], ru:'g', unit:'g', sf:3, sfWhy:'16 amu is exact for O-16'}),
      CH3('19d', 19, {q:'Find the mass of one mole of O-16 atoms: {x} atoms, each 16 amu.', x:AVG, u0:'atoms', f:[['16', 'amu', '1', 'atoms'], ['1.66054×10^-24', 'g', '1', 'amu']], ru:'g', unit:'g', sf:3, sfWhy:'keep 3 like the key'}),
      CH3('20', 20, {q:'How many oxygen atoms are in {x} mol of O2?', x:'2.50', u0:'mol O2', f:[[AVG, 'molecules O2', '1', 'mol O2'], ['2', 'atoms O', '1', 'molecules O2']], ru:'atoms O', unit:'atoms', notes0:['Each O2 molecule has 2 O atoms. Forgetting this step gives 1.51×10^24, the number of molecules.']}),
      CH3('21', 21, {q:'How many moles of sodium are in {x} Na atoms?', x:'9.03×10^23', u0:'atoms Na', f:[['1', 'mol Na', AVG, 'atoms Na']], ru:'mol Na', unit:'mol'}),
      CH3('22', 22, {q:'What is the mass of {x} mol of helium?', x:'3.50', u0:'mol He', f:[['4.003', 'g He', '1', 'mol He']], ru:'g He', unit:'g', notes:['Molar mass of He = 4.003 g/mol (data sheet)']}),
      CH3('23a', 23, {q:'How many moles are {x} lead atoms?', x:'6×10^9', u0:'atoms Pb', f:[['1', 'mol Pb', AVG, 'atoms Pb']], ru:'mol Pb', unit:'mol', notes0:['6×10^9 has 1 sig fig, so the answer has 1 too: 1×10^-14 mol.']}),
      CH3('23b', 23, {q:'What is the mass of {x} lead atoms?', x:'6×10^9', u0:'atoms Pb', f:[['1', 'mol Pb', AVG, 'atoms Pb'], ['207.2', 'g Pb', '1', 'mol Pb']], ru:'g Pb', unit:'g'})
    ]},
  { id:'treas', code:'Tr', name:'Treasury', topics:['tfmass', 'tmole'],
    intro:['The Treasury. Every chest is weighed by formula mass.', 'Count atoms carefully: parentheses and hydrate waters multiply.'],
    outro:['The chests are counted.', 'Formula mass in amu equals molar mass in g/mol.'],
    flav:['Gold coins clink.', 'A chest creaks open.', 'Polly eyes the shiny things.'],
    tasks:[
      FM('24', 24, 'Count the H atoms in each formula. Which do NOT have exactly 2?', [['H2', 2], ['(NH4)2SO4', 8], ['H2O', 2], ['CuSO4·5H2O', 10], ['Ca(OH)2', 2], ['CaH2', 2]].map(([f, a]) => ({k:'num', label:'H atoms in ' + f, a, max:20})),
        '(NH4)2SO4 has 2 × 4 = 8 H, and CuSO4·5H2O has 5 × 2 = 10 H. Those two do not have exactly 2.', {topic:'tfmass'}),
      {id:'t25', n:25, type:'calc', gen:'fmass', topic:'tfmass', p:{q:'Find the formula mass of CoCl2·6H2O. [Co 58.93, Cl 35.45, H 1.008, O 16.00]', name:'CoCl2·6H2O', parts:[['Co', '58.93', 1], ['Cl', '35.45', 2], ['H', '1.008', 12], ['O', '16.00', 6]], unit:'amu', sfAlt:[4], unitAlt:['g/mol'], note:'The study guide rounds to 237.9; both are accepted. Same number in g/mol.'}},
      {id:'t26', n:26, type:'calc', gen:'fmass', topic:'tfmass', p:{q:'Find the formula mass of ascorbic acid, C6H8O6. [C 12.01, H 1.008, O 16.00]', name:'C6H8O6', parts:[['C', '12.01', 6], ['H', '1.008', 8], ['O', '16.00', 6]], unit:'amu', sfAlt:[4], unitAlt:['g/mol'], note:'The study guide rounds to 176.1; both are accepted. Same number in g/mol.'}},
      CH3('37a', 37, {q:'Convert {x} mol H2O to grams.', x:'5.00', u0:'mol H2O', f:[['18.02', 'g H2O', '1', 'mol H2O']], ru:'g H2O', unit:'g', notes:['Molar mass H2O = 2(1.008) + 16.00 = 18.02 g/mol']}),
      CH3('37b', 37, {q:'Convert {x} g LiCl to moles.', x:'25.0', u0:'g LiCl', f:[['1', 'mol LiCl', '42.39', 'g LiCl']], ru:'mol LiCl', unit:'mol', notes:['Molar mass LiCl = 6.94 + 35.45 = 42.39 g/mol']}),
      CH3('37c', 37, {q:'Convert {x} mol C6H12O6 to micrograms (µg).', x:'1.00×10^-5', u0:'mol C6H12O6', f:[['180.16', 'g C6H12O6', '1', 'mol C6H12O6'], ['1×10^6', 'µg C6H12O6', '1', 'g C6H12O6']], ru:'µg C6H12O6', unit:'µg', notes:['1 g = 10^6 µg']})
    ]},
  { id:'altar', code:'Ar', name:'Altar of Reactions', topics:['teq'],
    intro:['The Altar of Reactions. Each tablet describes a reaction in words.', 'Write the formulas, balance them, label the phases, and name the type.'],
    outro:['The altar flames burn steady.', 'Formulas first. You can\'t balance the wrong formulas.'],
    flav:['The altar fire flares.', 'A new tablet slides out.', 'Smoke curls up.'],
    tasks:[
      EQ('27', 27, 'Solid magnesium + oxygen gas → solid magnesium oxide', ['magnesium', 'oxygen gas', 'magnesium oxide'], ['Mg', 'O2'], ['MgO'], [2, 1, 2], ['s', 'g', 's'], 'comb', 'Two substances combine into one product. Oxygen gas is diatomic, O2.'),
      EQ('28', 28, 'Solid aluminum + aqueous copper(II) chloride → solid copper + aqueous aluminum chloride', ['aluminum', 'copper(II) chloride', 'copper', 'aluminum chloride'], ['Al', 'CuCl2'], ['Cu', 'AlCl3'], [2, 3, 3, 2], ['s', 'aq', 's', 'aq'], 'single', 'Al, an element, replaces Cu. Cl must balance: 3 CuCl2 gives 6 Cl = 2 AlCl3.'),
      EQ('29', 29, 'Aqueous sodium chloride + aqueous silver nitrate → solid silver chloride + aqueous sodium nitrate', ['sodium chloride', 'silver nitrate', 'silver chloride', 'sodium nitrate'], ['NaCl', 'AgNO3'], ['AgCl', 'NaNO3'], [1, 1, 1, 1], ['aq', 'aq', 's', 'aq'], 'double', 'The cations swap partners.'),
      EQ('30', 30, 'Solid zinc sulfide, heated → solid zinc + solid sulfur', ['zinc sulfide', 'zinc', 'sulfur'], ['ZnS'], ['Zn', 'S'], [1, 1, 1], ['s', 's', 's'], 'decomp', 'One reactant breaks apart. Heat goes over the arrow.', {heat:true}),
      EQ('31', 31, 'Solid sodium bicarbonate, heated → solid sodium carbonate + carbon dioxide gas + water vapor', ['sodium bicarbonate', 'sodium carbonate', 'carbon dioxide', 'water'], ['NaHCO3'], ['Na2CO3', 'CO2', 'H2O'], [2, 1, 1, 1], ['s', 's', 'g', 'g'], 'decomp', 'One reactant breaks into three. The key writes H2O(g); (l) is also accepted.', {heat:true, phAlt:{3:['l']}})
    ]},
  { id:'grotto', code:'Gr', name:'Flooded Grotto', topics:['tsol', 'net', 'tacid'],
    intro:['The Flooded Grotto. Some things dissolve in this water; some drop to the bottom as solids.', 'Know your solubility rules, then follow the ions.'],
    outro:['The water drains away.', 'Precipitate = the insoluble product. Spectators appear unchanged on both sides.'],
    flav:['Water drips from a stalactite.', 'Something sinks to the bottom.', 'The pool bubbles.'],
    tasks:[
      {id:'t32a', n:32, type:'sort', topic:'tsol', q:'Soluble or insoluble in water?', dev:'Drop test', bins:[['s', 'Soluble'], ['i', 'Insoluble']],
        items:[{s:'Na2CO3', a:'s', why:'alkali metal'}, {s:'AgCl', a:'i', why:'Ag^+ is a chloride exception'}, {s:'Li2SO4', a:'s', why:'alkali metal'}, {s:'CaCO3', a:'i', why:'carbonates insoluble'}, {s:'Pb(NO3)2', a:'s', why:'all nitrates soluble'}, {s:'Na3PO4', a:'s', why:'alkali metal'}, {s:'BaSO4', a:'i', why:'Ba^2+ is a sulfate exception'}, {s:'Ag2S', a:'i', why:'sulfides insoluble'}],
        why:'Check the cation first: alkali metals, NH4^+, and nitrates are always soluble. Then apply the anion rule and its exceptions.'},
      FM('32b', 32, 'Name these compounds.', [T1('AgCl', ['silverchloride'], 'silver chloride'), T1('CaCO3', ['calciumcarbonate'], 'calcium carbonate'), T1('Pb(NO3)2', ['lead(ii)nitrate', 'plumbousnitrate'], 'lead(II) nitrate'), T1('Ag2S', ['silversulfide', 'silversulphide'], 'silver sulfide')], 'Pb needs its Roman numeral: two NO3^- means Pb^2+.', {topic:'tion'}),
      EQ('33a', 33, 'Aqueous sodium carbonate + aqueous barium chloride → solid barium carbonate + aqueous sodium chloride', ['sodium carbonate', 'barium chloride', 'barium carbonate', 'sodium chloride'], ['Na2CO3', 'BaCl2'], ['BaCO3', 'NaCl'], [1, 1, 1, 2], ['aq', 'aq', 's', 'aq'], 'double', 'BaCO3 is the precipitate (carbonates are insoluble except alkali metals).', {topic:'teq'}),
      {id:'t33b', n:33, type:'net', topic:'net', pre:'Now the ionic and net ionic equations for sodium carbonate + barium chloride.',
        L:[{c:1, f:'Na2CO3', st:'aq', ions:[['Na^+', 2], ['CO3^2-', 1]]}, {c:1, f:'BaCl2', st:'aq', ions:[['Ba^2+', 1], ['Cl^-', 2]]}],
        R:[{c:1, f:'BaCO3', st:'s'}, {c:2, f:'NaCl', st:'aq', ions:[['Na^+', 2], ['Cl^-', 2]]}], net:'Ba^2+ + CO3^2- → BaCO3(s)', spect:['Na^+', 'Cl^-']},
      FM('34a', 34, 'What is the hallmark of an acid–base reaction? Fill in the blanks.', [T1('H^+ from the acid combines with ______ from the base', ['oh-', 'oh', 'hydroxide', 'hydroxideion', 'oh^-'], 'OH^- (hydroxide)', {contains:['hydrox']}), T1('to make ______.', ['water', 'h2o'], 'water')], 'H^+ + OH^- → H2O. That is neutralization.', {topic:'tacid'}),
      EQ('34b', 34, 'Aqueous hydrochloric acid + aqueous sodium hydroxide → aqueous sodium chloride + liquid water', ['hydrochloric acid', 'sodium hydroxide', 'sodium chloride', 'water'], ['HCl', 'NaOH'], ['NaCl', 'H2O'], [1, 1, 1, 1], ['aq', 'aq', 'aq', 'l'], 'double', 'An acid–base neutralization is a double replacement: H and Na swap partners.', {topic:'tacid'})
    ]},
  { id:'storm', code:'St', name:'Storm Gate', topics:['redox'],
    intro:['The Storm Gate. Lightning jumps between metals here.', 'Write each reaction, then send the electrons the right way.'],
    outro:['The storm passes.', 'The metal that becomes an ion lost electrons: oxidized.'],
    flav:['Thunder rumbles.', 'Sparks dance on the pillars.', 'Polly\'s feathers stand on end.'],
    tasks:[
      FM('35a', 35, 'Write the reaction of zinc metal with Cu^2+.', [{k:'charge', label:'Charge on the zinc ion formed', a:2}, {k:'num', label:'Electrons each Zn atom loses', a:2, max:4}], 'Zn loses 2 electrons to become Zn^2+; Cu^2+ gains them to become Cu metal.', {preview:'Zn(s) + Cu^2+(aq) → Zn^{0}(aq) + Cu(s)', topic:'redox'}),
      {id:'t35b', n:35, type:'redox', topic:'redox', L:['Zn(s)', 'Cu^2+(aq)'], R:['Zn^2+(aq)', 'Cu(s)'], ox:0, red:1, why:'Zn goes 0 → 2+ (oxidized, loses e^-). Cu^2+ goes 2+ → 0 (reduced, gains e^-).'},
      FM('36a', 36, 'Complete and balance: Mg(s) + Ag^+(aq) →', [{k:'coef', label:'Ag^+ needed', a:2}, {k:'charge', label:'Charge on the magnesium ion', a:2}, {k:'coef', label:'Ag atoms formed', a:2}], 'Mg forms Mg^2+, losing 2 electrons. Each Ag^+ takes only 1, so it needs 2 Ag^+.', {preview:'Mg(s) + {0}Ag^+(aq) → Mg^{1}(aq) + {2}Ag(s)', topic:'redox'}),
      {id:'t36b', n:36, type:'redox', topic:'redox', L:['Mg(s)', '2Ag^+(aq)'], R:['Mg^2+(aq)', '2Ag(s)'], ox:0, red:1, why:'Mg goes 0 → 2+ (oxidized). Ag^+ goes 1+ → 0 (reduced).'}
    ]},
  { id:'sanctum', code:'Sn', name:'Inner Sanctum', topics:['bal', 'tstoich'],
    intro:['The Inner Sanctum. The idol is just beyond these last traps.', 'Balance, then follow the moles. Find the limiting reactant and the yield.'],
    outro:['The last trap clicks open.', 'Limiting makes less product. Percent yield = actual ÷ theoretical × 100.'],
    flav:['A pressure plate clicks.', 'Light glints off gold ahead.', 'The air smells ancient.'],
    tasks:[
      {id:'t38a', n:38, type:'balance', topic:'bal', L:['Ca(CN)2', 'HCl'], R:['CaCl2', 'HCN'], sol:[1, 2, 1, 2], ask:null, q:'Balance the equation.'},
      CH3('38b', 38, {q:'Ca(CN)2 + 2HCl → CaCl2 + 2HCN. How many grams of CaCl2 form from {x} mol HCl (excess Ca(CN)2)?', x:'0.00670', u0:'mol HCl', f:[['1', 'mol CaCl2', '2', 'mol HCl'], ['110.98', 'g CaCl2', '1', 'mol CaCl2']], ru:'g CaCl2', unit:'g', notes:['CaCl2 = 40.08 + 2(35.45) = 110.98 g/mol']}, {topic:'tstoich'}),
      CH3('38c', 38, {q:'Ca(CN)2 + 2HCl → CaCl2 + 2HCN. How many grams of CaCl2 form from {x} mol Ca(CN)2 (excess HCl)?', x:'0.00284', u0:'mol Ca(CN)2', f:[['1', 'mol CaCl2', '1', 'mol Ca(CN)2'], ['110.98', 'g CaCl2', '1', 'mol CaCl2']], ru:'g CaCl2', unit:'g'}, {topic:'tstoich'}),
      FM('38de', 38, 'With 0.00670 mol HCl and 0.00284 mol Ca(CN)2, which reactant is limiting and which is in excess?', [T1('Limiting reactant (formula)', ['ca(cn)2', 'calciumcyanide'], 'Ca(CN)2'), T1('Reactant in excess (formula)', ['hcl', 'hydrochloricacid', 'hydrogenchloride'], 'HCl')],
        'Ca(CN)2 makes 0.315 g CaCl2 and HCl would make 0.372 g. The one that makes less runs out first: Ca(CN)2 is limiting, HCl is in excess.', {topic:'tstoich'}),
      FX('38f', 38, {q:'How many moles of the excess reactant (HCl) are left over? (0.00670 mol HCl, 0.00284 mol Ca(CN)2, ratio 2 HCl : 1 Ca(CN)2)', v:.00102, sf:3, unit:'mol', work:['HCl used = 2 × 0.00284 = 0.00568 mol', 'Left over = 0.00670 − 0.00568 = <b>0.00102 mol HCl</b>', 'Subtraction keeps the fewest decimal places: 5.']}, {topic:'tstoich'}),
      CH3('39a', 39, {q:'O3(g) + NO(g) → O2(g) + NO2(g). How many grams of NO2 form from {x} g O3 with excess NO?', x:'50.0', u0:'g O3', f:[['1', 'mol O3', '48.00', 'g O3'], ['1', 'mol NO2', '1', 'mol O3'], ['46.01', 'g NO2', '1', 'mol NO2']], ru:'g NO2', unit:'g', notes:['O3 = 3(16.00) = 48.00 g/mol · NO2 = 14.01 + 2(16.00) = 46.01 g/mol']}, {topic:'tstoich'}),
      FX('39b', 39, {q:'The theoretical yield is 47.9 g NO2. If the actual yield is 25.0 g NO2, what is the percent yield?', v:52.19, sf:3, unit:'%', work:['Percent yield = actual ÷ theoretical × 100', '25.0 g ÷ 47.9 g × 100 = <b>52.2 %</b>']}, {topic:'tstoich'})
    ]},
  { id:'idol', code:'Id', name:'Golden Idol', topics:[], final:true,
    intro:['There it is: the Golden Mole! And... the temple is collapsing.', 'Every correct answer clears a stretch of the escape tunnel. You get each topic once more, twice if it gave you trouble.', 'Treat it like the real test: paper, calculator, no hints if you can help it.'],
    outro:[], tasks:[] }
];
TEMPLE_MODS.forEach(m => m.tasks.forEach(t => { if (!t.topic) t.topic = m.topics[0]; }));

/* Extra practice for reroutes and the escape run */
EXTRA.push(
  {id:'tx1', type:'dots', topic:'tlewis', q:'Draw the Lewis symbol for a nitrogen atom. How many bonds will it usually form?', el:'N', ve:5, bonds:3, why:'N has 5 valence electrons: 1 pair and 3 unpaired dots, so it forms 3 bonds.'},
  {id:'tx2', type:'dots', topic:'tlewis', q:'Draw the Lewis symbol for a carbon atom. How many bonds will it usually form?', el:'C', ve:4, bonds:4, why:'C has 4 valence electrons, all unpaired: 4 bonds.'},
  {id:'tx3', type:'dots', topic:'tlewis', q:'Draw the Lewis symbol for a chlorine atom. How many bonds will it usually form?', el:'Cl', ve:7, bonds:1, why:'Cl has 7 valence electrons: 3 pairs and 1 unpaired dot, so 1 bond.'},
  {id:'tx4', type:'dots', topic:'tlewis', q:'Draw the Lewis symbol for a sulfur atom. How many bonds will it usually form?', el:'S', ve:6, bonds:2, why:'S is in the same group as O: 6 valence electrons, 2 bonds.'},
  LPT('x5', null, 'Fill in the missing lone pairs: CH4', M.ch4, [0, 0, 0, 0, 0], 'C uses all 4 valence electrons in bonds. No lone pairs anywhere.'),
  LPT('x6', null, 'Fill in the missing lone pairs: Cl–Cl', M.cl2, [3, 3], 'Each Cl has 7: 1 in the bond, 6 as 3 lone pairs.'),
  LPT('x7', null, 'Fill in the missing lone pairs: H–Cl', M.hcl, [0, 3], 'Cl keeps 3 lone pairs; H gets none.'),
  NAMES('x8', null, [['NaBr', ['sodiumbromide'], 'sodium bromide'], ['CuCl2', ['copper(ii)chloride', 'cupricchloride'], 'copper(II) chloride'], ['K2SO4', ['potassiumsulfate', 'potassiumsulphate'], 'potassium sulfate']], 'Cu needs a numeral; two Cl^- means Cu^2+.'),
  NAMES('x9', null, [['Fe2O3', ['iron(iii)oxide', 'ferricoxide'], 'iron(III) oxide'], ['NH4Cl', ['ammoniumchloride'], 'ammonium chloride'], ['CaS', ['calciumsulfide', 'calciumsulphide'], 'calcium sulfide']], 'Three O^2- (6−) shared by two Fe means each Fe is 3+.'),
  FM('x10', null, 'Name each covalent compound.', [T1('N2O4', ['dinitrogentetroxide', 'dinitrogentetraoxide'], 'dinitrogen tetroxide'), T1('CCl4', ['carbontetrachloride'], 'carbon tetrachloride'), T1('SO3', ['sulfurtrioxide', 'sulphurtrioxide'], 'sulfur trioxide')], 'Prefixes: di-, tetra-, tri-.', {topic:'tcov'}),
  SHP('x11', null, 'CO2', 'linear', 0, 'Two double bonds, no lone pairs on C: 2 groups, linear.'),
  SHP('x12', null, 'CCl4', 'tet', 0, '4 bonds, no lone pairs: tetrahedral.'),
  SHP('x13', null, 'PCl3', 'tpyr', 1, '3 bonds and 1 lone pair on P: trigonal pyramidal.'),
  BLD('x14', null, 'NH3', M.nh3, 8, [{bo:[1, 1, 1], lp:[1, 0, 0, 0]}], [{label:'Shape at N', sh:'tpyr'}], '5 + 3 = 8. Three N–H bonds and 1 lone pair on N.'),
  BLD('x15', null, 'CH4', M.ch4, 8, [{bo:[1, 1, 1, 1], lp:[0, 0, 0, 0, 0]}], [{label:'Shape at C', sh:'tet'}], '4 + 4 = 8. Four C–H bonds, no lone pairs.'),
  EQ('x16', null, 'Hydrogen gas + oxygen gas → liquid water', ['hydrogen gas', 'oxygen gas', 'water'], ['H2', 'O2'], ['H2O'], [2, 1, 2], ['g', 'g', 'l'], 'comb', 'Two reactants form one product.'),
  EQ('x17', null, 'Solid zinc + aqueous hydrochloric acid → aqueous zinc chloride + hydrogen gas', ['zinc', 'hydrochloric acid', 'zinc chloride', 'hydrogen gas'], ['Zn', 'HCl'], ['ZnCl2', 'H2'], [1, 2, 1, 1], ['s', 'aq', 'aq', 'g'], 'single', 'Zn replaces H.'),
  {id:'tx18', type:'sort', topic:'tsol', q:'Soluble or insoluble in water?', dev:'Drop test', bins:[['s', 'Soluble'], ['i', 'Insoluble']],
    items:[{s:'KNO3', a:'s', why:'alkali metal, nitrate'}, {s:'PbCl2', a:'i', why:'Pb^2+ is a chloride exception'}, {s:'(NH4)2CO3', a:'s', why:'ammonium'}, {s:'BaCO3', a:'i', why:'carbonates insoluble'}, {s:'CaSO4', a:'i', why:'Ca^2+ sulfate exception'}, {s:'NaOH', a:'s', why:'alkali metal'}], why:'Alkali metals, NH4^+ and nitrates first; then anion rules and exceptions.'},
  {id:'tx19', type:'sort', topic:'tpolar', q:'Polar or nonpolar molecule?', dev:'Echo test', bins:[['p', 'Polar molecule'], ['np', 'Nonpolar molecule']],
    items:[{s:'H2O', a:'p', why:'bent'}, {s:'CCl4', a:'np', why:'symmetric tetrahedral'}, {s:'BF3', a:'np', why:'symmetric trigonal planar'}, {s:'HCl', a:'p', why:'one polar bond'}, {s:'PCl3', a:'p', why:'trigonal pyramidal'}], why:'Symmetric shapes with identical outer atoms cancel their bond dipoles.'},
  FM('x20', null, 'Build the dissolving equation for sodium sulfate, Na2SO4.', [{k:'coef', label:'Number of sodium ions', a:2}, {k:'charge', label:'Charge on each sodium ion', a:1}, {k:'charge', label:'Charge on the sulfate ion', a:-2}], 'Na^+ is 1+; sulfate is SO4^2-. Two Na^+ balance one SO4^2-.', {preview:'Na2SO4(s) → {0}Na^{1}(aq) + SO4^{2}(aq)', topic:'tprop'})
);

/* ---------- Temple art ---------- */
const JUNGLE = new Set(['hall', 'glyph', 'spring', 'shapes', 'masons', 'sculpt', 'echo', 'count', 'treas', 'altar', 'grotto', 'storm', 'sanctum', 'idol', 'camp']);
function jungleBase(k, ctx, t, o){
  k.r(0, 0, 80, 40, '#263226');
  for (let y = 0; y < 34; y += 6){ const off = (y / 6) % 2 ? 6 : 0; for (let x = -off; x < 80; x += 12) k.r(x + 1, y + 1, 10, 4, ((x + y) / 6) % 3 === 0 ? '#45563e' : '#3a4a36'); }
  k.r(0, 11, 80, 2, '#5a6a4a'); for (let x = 2; x < 80; x += 6) k.r(x, 11, 2, 2, '#8a9a6a');
  k.r(0, 34, 80, 6, '#5a5040'); for (let x = 0; x < 80; x += 10) k.r(x, 34, 1, 6, '#3e3628'); k.r(0, 34, 80, 1, '#7a6a50');
  [5, 29, 50, 73].forEach((x, i) => { const len = 5 + (i * 5) % 9; for (let y = 0; y < len; y++) k.p(x + (y % 3 === 0 ? 1 : 0), y, '#3e8948'); k.p(x + 1, len, '#63c74d'); k.p(x - 1, len - 2, '#63c74d'); });
  const lit = o.lit > 0 && !(o.lit < 1 && Math.random() < .15);
  [12, 67].forEach(x => {
    k.r(x, 15, 2, 5, '#7a4e30'); k.r(x - 1, 14, 4, 1, '#5c3a24');
    if (lit){ const f = Math.floor(t * 8 + x) % 3; k.r(x - (f === 1 ? 1 : 0), 11, 2 + (f === 1 ? 1 : 0), 3, C.na); k.p(x + (f === 2 ? 1 : 0), 10, C.yel); k.p(x, 13, C.orange);
      ctx.fillStyle = 'rgba(254,174,52,.07)'; for (let i = 1; i < 5; i++) ctx.fillRect(x - i * 3, 12 - i, 2 + i * 6, 2 + i * 2); }
  });
}
const GOLD = '#feae34', GOLDD = '#c8801a';
function moleSprite(k, x, y, c, cd, eye){
  k.r(x + 1, y + 2, 8, 5, c); k.r(x + 2, y + 1, 6, 1, c); k.r(x, y + 4, 1, 2, c); k.r(x + 9, y + 3, 2, 2, '#e8a0a0'); k.r(x + 2, y + 6, 6, 1, cd);
  k.p(x + 7, y + 3, eye || '#2a1a0a'); k.p(x + 2, y + 7, cd); k.p(x + 7, y + 7, cd);
}
Object.assign(DEV, {
  hall(k, t, o){
    const a = act(o, t), open = a || o.lit >= 1;
    k.r(26, 7, 28, 27, '#5a6a4a'); k.r(29, 12, 22, 22, '#0e120e');
    if (!open) k.r(29, 12, 22, 22, '#6a7a5a'), k.r(30, 13, 20, 20, '#5a6a4a');
    else if (a) k.r(29, 12, 22, 3, '#6a7a5a');
    k.ring(40, 7, 3, o.lit > 0 ? GOLD : '#5a6a4a'); k.p(40, 7, o.lit > 0 ? C.yel : '#3a4a36');
    [32, 40, 48].forEach((x, i) => { if (!open) k.r(x - 1, 20, 3, 3, (Math.floor(t * 2) + i) % 3 === 0 ? C.cu : '#3a4a36'); });
    o.sx = 40; o.sy = 20;
  },
  glyph(k, t, o){
    const a = act(o, t), on = a || o.lit >= 1;
    [8, 32, 56].forEach((x, i) => { k.r(x, 14, 16, 18, '#6a7a5a'); k.r(x + 1, 15, 14, 16, '#55654c');
      const c = on ? (a && (Math.floor(t * 3) + i) % 3 === 0 ? C.yel : GOLD) : '#3a4a36';
      k.r(x + 4, 18, 8, 1, c); k.r(x + 7, 18, 1, 9, c); k.r(x + 4, 26, 8, 1, c); k.p(x + 4, 22 + i, c); k.p(x + 11, 21 + i, c); });
    o.sx = 40; o.sy = 22;
  },
  spring(k, t, o){
    const a = act(o, t), clean = a || o.lit >= 1;
    k.r(12, 28, 56, 6, '#3a4a36'); k.r(14, 26, 52, 8, clean ? C.blue : '#2a4a5a');
    for (let x = 14; x < 66; x++) if ((x + Math.floor(t * 4)) % 9 === 0) k.p(x, 26, '#9ff7ff');
    k.r(30, 16, 20, 10, '#5a6a4a'); k.r(36, 12, 8, 4, '#6a7a5a');
    if (clean){ const ph = (t * 1.2) % 1; k.p(40, 16 + ph * 10, '#9ff7ff'); k.p(40, 17 + ((ph + .5) % 1) * 10, '#9ff7ff'); }
    if (a) for (let i = 0; i < 4; i++) k.p(18 + i * 12 + Math.floor(Math.sin(t * 3 + i) * 2), 29, C.white);
    o.sx = 40; o.sy = 24;
  },
  shapes(k, t, o){
    const a = act(o, t), b = a ? Math.round(Math.sin(t * 3) * 2) : 0;
    [12, 36, 60].forEach(x => { k.r(x, 26, 10, 8, '#6a7a5a'); k.r(x - 1, 25, 12, 2, '#7a8a6a'); });
    const c = o.lit > 0 ? C.cu : '#3a5a5a';
    k.r(12, 18 + b, 10, 2, c); k.r(11, 17 + b, 2, 4, GOLD); k.r(21, 17 + b, 2, 4, GOLD);
    k.line(41, 12 - b, 36, 21 - b, c); k.line(41, 12 - b, 46, 21 - b, c); k.line(36, 21 - b, 46, 21 - b, c);
    k.line(65, 10 + b, 60, 21 + b, c); k.line(65, 10 + b, 70, 21 + b, c); k.line(60, 21 + b, 70, 21 + b, c); k.line(65, 10 + b, 65, 21 + b, c);
    o.sx = 40; o.sy = 18;
  },
  masons(k, t, o){
    const a = act(o, t);
    k.r(8, 24, 36, 3, '#8a4b2a'); k.r(10, 27, 2, 7, '#5c3a24'); k.r(40, 27, 2, 7, '#5c3a24');
    k.r(14, 20, 6, 4, '#8b93af'); k.line(22, 22, 30, 16, '#8a4b2a'); k.r(29, 14, 4, 3, '#8b93af');
    const n = a ? 1 + Math.floor(t * 2) % 4 : o.lit >= 1 ? 4 : 2;
    for (let i = 0; i < n; i++) k.r(52 + (i % 2) * 2, 30 - i * 5, 14, 4, i % 2 ? '#7a8a6a' : '#6a7a5a');
    if (a && Math.floor(t * 6) % 2) k.p(30, 20, C.yel);
    o.sx = 58; o.sy = 24;
  },
  sculpt(k, t, o){
    const a = act(o, t), on = a || o.lit >= 1;
    [8, 32, 56].forEach((x, i) => { k.r(x, 26, 16, 8, '#6a7a5a'); moleSprite(k, x + 2, 16, '#8b93af', '#5a6988', on ? ((Math.floor(t * 2) + i) % 2 ? C.sr : C.cu) : '#2a2a2a'); });
    o.sx = 40; o.sy = 20;
  },
  echo(k, t, o){
    const a = act(o, t);
    k.circ(40, 20, 6, o.lit > 0 ? GOLD : '#5a5040'); k.circ(40, 20, 3, o.lit > 0 ? GOLDD : '#3e3628'); k.r(39, 6, 2, 8, '#5c3a24');
    if (a || o.lit >= 1) for (let r = 0; r < 3; r++){ const rr = 9 + ((t * 14 + r * 8) % 24); for (let an = -0.9; an <= 0.9; an += .1){ k.p(40 + Math.cos(an) * rr, 20 + Math.sin(an) * rr * .6, 'rgba(44,232,245,.6)'); k.p(40 - Math.cos(an) * rr, 20 + Math.sin(an) * rr * .6, 'rgba(44,232,245,.6)'); } }
    o.sx = 40; o.sy = 20;
  },
  count(k, t, o){
    const a = act(o, t);
    k.r(10, 8, 60, 16, '#5c3a24'); k.r(11, 9, 58, 14, '#3e2616');
    for (let r = 0; r < 3; r++){ k.r(11, 12 + r * 4, 58, 1, '#8b93af'); for (let i = 0; i < 6; i++){ const shift = a ? Math.floor((t * 3 + r + i) % 4) * 3 : 0; k.r(14 + i * 4 + (i > 2 ? 20 : 0) + (i > 2 ? 0 : shift), 11 + r * 4, 3, 3, [GOLD, C.cu, C.pink][r]); } }
    for (let i = 0; i < 6; i++) k.r(16 + i * 8, 28, 1, 5, '#c0cbdc'), i % 5 === 4 && k.line(14 + i * 8 - 30, 30, 18 + i * 8, 29, '#c0cbdc');
    o.sx = 40; o.sy = 16;
  },
  treas(k, t, o){
    const a = act(o, t), on = a || o.lit >= 1;
    const pile = (cx, w, h) => { for (let i = 0; i < h; i++) k.r(cx - Math.floor(w * (h - i) / h / 2), 33 - i, Math.ceil(w * (h - i) / h), 1, i % 2 ? GOLD : GOLDD); };
    pile(16, 20, 8); pile(64, 24, 10);
    k.r(32, 22, 16, 12, '#8a4b2a'); k.r(32, 26, 16, 1, '#5c3a24'); k.r(32, on ? 16 : 20, 16, 3, '#6a3a1a'); if (on) k.r(34, 20, 12, 2, C.yel);
    if (on && Math.floor(t * 5) % 2) { k.p(14 + Math.floor(t * 7) % 6, 26, C.white); k.p(62 + Math.floor(t * 5) % 8, 24, C.white); }
    o.sx = 40; o.sy = 24;
  },
  altar(k, t, o){
    const a = act(o, t), on = a || o.lit >= 1;
    k.r(26, 22, 28, 12, '#6a7a5a'); k.r(24, 20, 32, 3, '#7a8a6a'); k.r(34, 16, 12, 4, '#5a5040');
    if (on){ const L = 4 + Math.floor(Math.random() * (a ? 9 : 4)); for (let i = 0; i < L; i++){ const w = Math.max(1, 8 - i); k.r(40 - w / 2, 15 - i, w, 1, i < 2 ? C.white : i < 5 ? C.yel : C.orange); } }
    [30, 50].forEach(x => k.p(x, 27, on ? GOLD : '#3a4a36'));
    o.sx = 40; o.sy = 14;
  },
  grotto(k, t, o){
    const a = act(o, t), drained = o.lit >= 1;
    for (let i = 0; i < 9; i++){ const x = 6 + i * 9, h = 3 + (i * 5) % 6; for (let y = 0; y < h; y++) k.r(x + Math.floor(y / 2), y, Math.max(1, 4 - y), 1, '#5a6a4a'); }
    const lvl = drained ? 31 : a ? 24 + Math.floor((t * 2) % 6) : 22;
    k.r(0, lvl, 80, 34 - lvl, 'rgba(0,153,219,.55)'); for (let x = 0; x < 80; x += 7) k.p(x + Math.floor(t * 3) % 7, lvl, '#9ff7ff');
    const d = (t * 1.5) % 1; k.p(24, 6 + d * (lvl - 6), '#9ff7ff'); k.p(51, 5 + ((d + .4) % 1) * (lvl - 5), '#9ff7ff');
    k.r(36, 30, 8, 4, '#c0cbdc');
    o.sx = 40; o.sy = 20;
  },
  storm(k, t, o){
    const a = act(o, t), on = a || o.lit >= 1;
    [10, 64].forEach(x => { k.r(x, 10, 6, 24, '#6a7a5a'); k.circ(x + 3, 8, 3, on ? C.cu : '#3a4a5a'); });
    if (a || (on && Math.random() < .3)){ let y = 8; for (let x = 16; x < 64; x += 2){ y += Math.random() < .5 ? -2 : 2; y = Math.max(3, Math.min(15, y)); k.p(x, y, C.white); k.p(x + 1, y, C.cu); } }
    k.r(30, 26, 20, 8, '#5a5040'); k.p(35, 28, '#8b93af'); k.p(44, 29, '#b86f50');
    o.sx = 40; o.sy = 12;
  },
  sanctum(k, t, o){
    const a = act(o, t);
    k.r(36, 0, 8, 3, '#0b0d1a'); ctx_beam(k, o.lit > 0);
    for (let i = 0; i < 4; i++) k.r(12 + i * 16, 31, 10, 3, (a && i === Math.floor(t * 2) % 4) ? GOLD : '#6a7a5a');
    k.r(34, 24, 12, 10, '#7a8a6a'); k.r(36, 22, 8, 2, '#8a9a6a');
    o.sx = 40; o.sy = 22;
  },
  idol(k, t, o){
    const a = act(o, t) || o.warp;
    k.r(30, 24, 20, 10, '#6a7a5a'); k.r(28, 22, 24, 3, '#7a8a6a');
    moleSprite(k, 33, 12, GOLD, GOLDD, C.sr);
    if (Math.floor(t * 3) % 2) { k.p(34, 11, C.white); k.p(44, 14, C.white); }
    if (o.alarm) for (let i = 0; i < 5; i++){ const x = (i * 17 + Math.floor(t * 30)) % 80, y = (Math.floor(t * 40) + i * 9) % 34; k.r(x, y, 2, 2, '#5a6a4a'); }
    if (o.charge != null){ k.r(10, 36, 60, 1, C.dark); k.r(10, 36, Math.round(60 * o.charge), 1, C.cu); }
    o.sx = 40; o.sy = 16;
  },
  camp(k, t, o){
    const a = act(o, t), on = o.lit > .2 || a;
    k.line(30, 33, 50, 28, '#5c3a24'); k.line(30, 28, 50, 33, '#5c3a24'); k.line(31, 33, 51, 28, '#7a4e30');
    for (let i = 0; i < 8; i++) k.p(28 + i * 3, 33, '#6a7a5a');
    if (on){ const L = Math.round(4 + 10 * Math.min(1, o.lit)) + (a ? 4 : 0); for (let i = 0; i < L; i++){ const w = Math.max(1, 9 - Math.floor(i * 9 / L) + (Math.random() < .3 ? 1 : 0)); k.r(40 - w / 2, 29 - i, w, 1, i < 2 ? C.white : i < L / 2 ? C.yel : C.orange); } }
    else if (Math.floor(t * 2) % 2) k.p(40, 27, C.orange);
    k.r(58, 26, 14, 8, '#b55088'); k.r(60, 24, 10, 2, '#8a3a6a');
    o.sx = 40; o.sy = 24;
  }
});
function ctx_beam(k, on){ if (!on) return; for (let y = 3; y < 30; y++) k.r(37 - Math.floor(y / 6), y, 6 + Math.floor(y / 3), 1, 'rgba(254,231,97,.08)'); }

/* Polly the parrot, 18×16 */
function drawPolly(ctx, t){
  const k = K(ctx); ctx.clearRect(0, 0, 18, 16);
  const e = molly.expr;
  k.r(5, 7, 8, 7, '#3e8948'); k.r(6, 13, 6, 1, '#3e8948'); k.r(4, 8, 3, 6, '#0099db'); k.r(5, 14, 3, 2, '#0099db');
  k.r(6, 1, 8, 6, '#e43b44'); k.r(5, 2, 10, 4, '#e43b44'); k.p(7, 0, C.yel); k.p(9, 0, C.yel); if (e === 'alarm'){ k.p(6, 0, C.yel); k.p(11, 0, C.yel); }
  k.r(10, 2, 3, 3, '#eef0f8');
  const blink = (t % 3.4) < .13;
  if (blink) k.r(10, 3, 3, 1, '#2a1a0a');
  else if (e === 'happy'){ k.p(10, 3, '#2a1a0a'); k.p(11, 2, '#2a1a0a'); k.p(12, 3, '#2a1a0a'); }
  else if (e === 'smug'){ k.r(10, 2, 3, 1, '#e43b44'); k.p(11, 3, '#2a1a0a'); }
  else if (e === 'worried'){ k.p(11, 4, '#2a1a0a'); k.p(10, 1, '#8a2a30'); }
  else if (e === 'alarm'){ k.r(11, 3, 1, 1, C.sr); k.r(10, 2, 3, 3, '#ffd0d0'); k.p(11, 3, '#2a1a0a'); }
  else k.p(11, 3, '#2a1a0a');
  k.r(14, 3, 2, 2, '#c0cbdc'); k.p(15, 5, '#8b93af'); k.p(16, 4, '#8b93af');
  if (t < molly.talkUntil && Math.floor(t * 10) % 2) k.p(14, 5, '#2a1a0a');
  k.p(7, 15, GOLD); k.p(10, 15, GOLD);
}
function drawTemple(ctx, t, lit){
  const k = K(ctx); ctx.clearRect(0, 0, 48, 64);
  const tiers = [[2, 52, 44], [6, 44, 36], [10, 36, 28], [14, 28, 20], [18, 20, 12]];
  tiers.forEach(([x, y, w], i) => { k.r(x, y, w, 8, i % 2 ? '#6a7a5a' : '#5a6a4a'); k.r(x, y, w, 1, '#8a9a6a'); });
  k.r(20, 12, 8, 8, '#5a6a4a'); k.r(22, 14, 4, 4, lit > .95 ? GOLD : '#2a3020'); if (lit > .95 && Math.floor(t * 3) % 2) k.p(23, 13, C.white);
  k.r(21, 20, 6, 40, 'rgba(138,154,106,.35)'); k.r(20, 54, 8, 6, '#0e120e');
  for (let i = 0; i < 5; i++){ const on = i / 5 < lit; [[tiers[i][0] + 2, tiers[i][1] + 3], [tiers[i][0] + tiers[i][2] - 4, tiers[i][1] + 3]].forEach(([x, y]) => k.r(x, y, 2, 2, on ? C.na : '#2a3020')); }
  [3, 9, 40, 44].forEach((x, i) => { for (let y = 0; y < 6 + i * 2; y++) k.p(x + (y % 2), 50 + y - 10, '#3e8948'); });
  k.r(0, 60, 48, 4, '#3e8948'); for (let x = 0; x < 48; x += 3) k.p(x, 59, '#63c74d');
}

/* ---------- Campaign ---------- */
BADGES.push({id:'idol', name:'Idol Recovered', d:'Escape the Temple of the Mole with the golden idol.', c:GOLD});
CAMPS.temple = { id:'temple', title:'Temple of the Mole', tag:'Unit test study guide · Chapters 3 & 4', mods:TEMPLE_MODS, pal:'POLLY', art:'temple',
  layout:[['hall'], ['glyph'], ['spring'], ['shapes'], ['masons'], ['sculpt'], ['echo'], ['count'], ['treas'], ['altar'], ['grotto'], ['storm'], ['sanctum'], ['idol']], shape:'temple',
  repair:{ id:'camp', code:'Cf', name:'Campfire', topics:[], repair:true, tasks:[] },
  repairLines:['This one burned your torch down before. Same problem. Get it right.', 'An old ember. Same numbers as before. Take your time on paper.', 'Squawk! You missed this one. Again, with feeling.'],
  repairIntro:['Every problem you missed burned your torch down a little.', 'At the campfire you face the exact same problem again. Solve it and the ember catches: +15 torch.', 'Miss it and the ember stays here. No extra burn at the campfire, so take your time.'],
  boot:['Squawk! A chemist, finally. I\'m Polly. I guided the last expedition into the Temple of the Mole.',
    'Deep inside sits the Golden Mole, an idol worth exactly one mole of gold coins. The ancients counted everything in moles.',
    'Every chamber is trapped with problems from your Chapters 3 & 4 study guide. Solve them and the traps disarm.',
    'No picking from lists in here. You place dots, build Lewis structures, type names and formulas, write equations, and work calculations on paper.',
    'Misses burn your torch down. Rekindle it at the campfire by re-solving what you missed. In we go!'],
  bootExpr:['happy', 'smug', 'neutral', 'smug', 'happy'], bootRoom:'hall', firstLine:'Start at the Entrance Hall, the glowing chamber at the top.', finalBadge:'idol',
  w:{ hull:'torch', Hull:'Torch', nrg:'Gold', energy:'gold', crack:'ember', Bay:'Campfire', bay:'campfire', weld:'rekindle', map:'Temple map', charge:'Escape', go:'Grab the idol', start:'Enter the chamber', unit:'Chamber', online:'cleared',
    fixed:'★ Trap disarmed', fault:'✗ Trap sprung', startWeld:'Rekindle', doneWeld:'Torch rekindled', patched:'Ember caught', patchFail:'The ember didn\'t catch. It stays at the campfire.', added:'Added to the campfire. Re-solve it there to win your torch back.',
    failHull:'Torch went out! Spare torch', check:'Escape run', mid:'partly explored', weldMore:'Rekindle more', welded:'Rekindled', cracksLeft:'Embers left', perWeld:'Per ember' },
  dev:{ tf:'Pressure plate', classify:'Glyph wheel', mc:'Choose', numval:'Tally stones', net:'Spring basin', choice:'Choose', nums:'Tally stones', balance:'Altar dials', form:'Stone tablet', eq:'Reaction tablet', build:'Mason\'s workbench', lp:'Carving', dots:'Glyph carving' },
  ending(pct, patches){
    if (pct >= 85 && patches === 0) return ['Idol secured', ['We made it out, idol and all! You built every answer yourself.', 'You\'re ready for the Chapter 3 & 4 test. Run a remix the night before.']];
    if (pct >= 65) return ['Out by a feather', ['We got out with the idol, but my tail feathers are singed.', 'Check the study report for weak topics, then try a remix.']];
    return ['Barely escaped', ['We got out. Barely. The idol is a little dented.', 'Work through the study report, reread the manual stones, and run a remix.']];
  }
};
