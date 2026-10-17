
/* ========================================================================
   THE SKYLARK RUN — CHE101 FunSheets: Chapter 5 (gases, liquids, solids)
   and Chapter 6 Parts 1 & 2 (solutions). Every problem is a job aboard
   the airship or at Isla Solvo station, and its answer decides something.
   ======================================================================== */

/* ---------- Per-task unit chips for calculations ---------- */
{
  const ch = CALC.chain.build;
  CALC.chain.build = function(p){ const b = ch(p); if (p.units) b.units = p.units; return b; };
  const fx = CALC.fixed.build;
  CALC.fixed.build = function(p){ const b = fx(p); if (p.units) b.units = p.units; if (p.grids) b.grids = p.grids, b.notes = p.work; return b; };
}

/* ---------- New answer types: word-bank cloze, checks grid, ranking ---------- */
const decOk = (f, v) => { const n = parseFloat(String(v).replace('−', '-').replace(',', '.')); return !isNaN(n) && Math.abs(n - f.a) <= (f.tol != null ? f.tol : Math.abs(f.a) * .01 + 1e-9); };
{
  const fo = fieldOk; fieldOk = function(f, v){ return f.k === 'dec' ? decOk(f, v) : fo(f, v); };
  const fd = fieldDisp; fieldDisp = function(f){ return f.k === 'dec' ? (f.disp || String(f.a)) + (f.unit ? ' ' + f.unit : '') : fd(f); };
  const fh = fieldHTML; fieldHTML = function(f, i, dis){
    if (f.k !== 'dec') return fh(f, i, dis);
    return `<div><label class="flab" for="fx${i}">${F(f.label)}</label><div class="row" style="align-items:center;gap:8px"><input id="fx${i}" data-fi="${i}" class="inp" ${f.neg ? '' : 'inputmode="decimal"'} value="${escA(ui.fv[i])}" autocomplete="off" ${dis}>${f.unit ? `<span class="dim">${F(f.unit)}</span>` : ''}</div></div>`;
  };
  const fi = XT.form.init; XT.form.init = function(t){ fi(t); t.fields.forEach((f, i) => { if (f.k === 'dec') ui.fv[i] = ''; }); };
  const fg = XT.form.grade; XT.form.grade = function(t){ if (t.fields.some((f, i) => f.k === 'dec' && !String(ui.fv[i]).trim())) return {err:'Fill in every part.'}; return fg(t); };
}
const normW = s => String(s || '').toLowerCase().replace(/[^a-z0-9+\-]/g, '');
Object.assign(XT, {
  cloze:{
    init(t){
      ui.cz = t.blanks.map(() => null); ui.sel = 0;
      const words = [...new Set([...t.blanks.map(b => b[0]), ...(t.extra || [])])];
      ui.bank = t.order === 'keep' ? words : shuffle(words);
    },
    body(t, dis, verb){
      const parts = t.text.split(/\{(\d+)\}/);
      const txt = parts.map((p, k) => k % 2 ? `<button class="blank ${ui.sel === +p && !ui.done ? 'on' : ''} ${ui.done ? (normW(ui.cz[+p]) && t.blanks[+p].map(normW).includes(normW(ui.cz[+p])) ? 'good' : 'bad') : ''}" data-act="czb" data-i="${p}" ${dis}><small>${+p + 1}</small>${ui.cz[+p] ? F(ui.cz[+p]) : '______'}</button>` : F(p)).join('');
      return `<div class="win dev"><div class="devh"><span>${t.dev || CAMP.dev.cloze || 'Fill in the blanks'}</span><span>${ui.cz.filter(Boolean).length}/${t.blanks.length}</span></div>
        <p class="dim" style="margin:0;font-size:15px">Tap a blank, then tap a word. Tap a filled blank to clear it.</p>
        <div class="passage">${txt}</div>
        <div class="units bank">${ui.bank.map(w => `<button class="sw" data-act="czw" data-w="${escA(w)}" ${dis}>${F(w)}</button>`).join('')}</div>
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    grade(t){
      if (ui.cz.some(v => !v)) return {err:'Fill every blank first.'};
      const rows = t.blanks.map((acc, i) => { const ok = acc.map(normW).includes(normW(ui.cz[i])); return [`Blank ${i + 1}`, ok, ok ? acc[0] : `You put “${ui.cz[i]}”; answer: ${acc[0]}`]; });
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + XT.cloze.solution(t) };
    },
    solution(t){ return `<p class="passage" style="margin:0">${F(t.text.replace(/\{(\d+)\}/g, (m, i) => `<b>${t.blanks[+i][0]}</b>`))}</p>${t.why ? `<p>${F(t.why)}</p>` : ''}`; }
  },
  checks:{
    init(t){ ui.ck = t.items.map(() => []); },
    body(t, dis, verb){
      return `<div class="win dev"><div class="devh"><span>${t.dev || 'Checklist'}</span><span>Tap every one that applies</span></div>
        <div class="ckgrid" style="grid-template-columns:minmax(0,1.3fr) repeat(${t.cols.length},minmax(0,1fr))"><span></span>${t.cols.map(c => `<span class="ckh">${F(c[1])}</span>`).join('')}
        ${t.items.map((it, i) => `<span class="cki">${F(it.s)}</span>${t.cols.map(c => `<button class="ckc" data-act="ckt" data-i="${i}" data-c="${c[0]}" aria-pressed="${ui.ck[i].includes(c[0])}" aria-label="${escA(it.s)}: ${escA(c[1])}" ${dis}>${ui.ck[i].includes(c[0]) ? '✓' : ''}</button>`).join('')}`).join('')}</div>
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`;
    },
    grade(t){
      const rows = t.items.map((it, i) => { const ok = it.a.length === ui.ck[i].length && it.a.every(x => ui.ck[i].includes(x)), nm = it.a.map(k => t.cols.find(c => c[0] === k)[1]).join(', ');
        return [F(it.s), ok, (ok ? nm : `Answer: ${nm}`) + (it.why ? ' · ' + it.why : '')]; });
      return { ok:rows.every(r => r[1]), html:listChecks(rows) + (t.why ? `<p>${F(t.why)}</p>` : '') };
    },
    solution(t){ return `<ul class="checks">${t.items.map(it => `<li><span class="mk y">→</span><span><b>${F(it.s)}:</b> ${it.a.map(k => t.cols.find(c => c[0] === k)[1]).join(', ')}${it.why ? ' · ' + F(it.why) : ''}</span></li>`).join('')}</ul>${t.why ? `<p>${F(t.why)}</p>` : ''}`; }
  },
  rank:{
    init(t){ ui.rk = []; },
    body(t, dis, verb){
      return `<div class="win dev"><div class="devh"><span>${t.dev || 'Rank them'}</span><span>${ui.rk.length}/${t.items.length}</span></div>
        <p style="margin:0;font-size:16px">${F(t.prompt)}</p>
        <div class="rkl">${t.items.map((it, i) => { const r = ui.rk.indexOf(i); return `<button class="rkb ${r >= 0 ? 'on' : ''}" data-act="rkpick" data-i="${i}" ${dis}><b>${r >= 0 ? r + 1 : '·'}</b><span>${F(it)}</span></button>`; }).join('')}</div>
        <p class="err" id="err"></p>${ui.done ? '' : `<div class="row"><button class="pb go" style="flex:1" data-act="submit">${verb} ▶</button><button class="pb" data-act="rkreset">Reset</button></div>`}</div>`;
    },
    grade(t){
      if (ui.rk.length < t.items.length) return {err:'Rank every item first.'};
      const ok = arrEq(ui.rk, t.order);
      return { ok, html:listChecks([['Order', ok, ok ? 'Correct.' : `Answer: ${t.order.map(i => t.items[i]).join(' > ')}`]]) + `<p>${F(t.why)}</p>` };
    },
    solution(t){ return `<p>Answer: <b>${F(t.order.map(i => t.items[i]).join(' > '))}</b></p><p>${F(t.why)}</p>`; }
  }
});
Object.assign(XACT, {
  tstart(){ startTimed(); },
  czb(b){ const i = +b.dataset.i; if (ui.sel === i && ui.cz[i]){ ui.cz[i] = null; } ui.sel = i; SND.play('key'); drawBody(); },
  czw(b){
    const w = b.dataset.w; let i = ui.sel; if (i == null || i < 0) i = ui.cz.indexOf(null); if (i < 0) return;
    ui.cz[i] = w; SND.play('pop'); const nx = ui.cz.findIndex((v, k) => !v && k > i); ui.sel = nx >= 0 ? nx : ui.cz.indexOf(null); drawBody();
  },
  ckt(b){ const i = +b.dataset.i, c = b.dataset.c, a = ui.ck[i]; ui.ck[i] = a.includes(c) ? a.filter(x => x !== c) : a.concat(c); SND.play('key'); b.setAttribute('aria-pressed', ui.ck[i].includes(c)); b.textContent = ui.ck[i].includes(c) ? '✓' : ''; },
  rkpick(b){ const i = +b.dataset.i, r = ui.rk.indexOf(i); if (r >= 0) ui.rk = ui.rk.slice(0, r); else ui.rk.push(i); SND.play('key'); drawBody(); },
  rkreset(){ ui.rk = []; drawBody(); }
});

/* ---------- Molecules for the liquid-state figures ---------- */
const MS = (atoms, bonds, alt) => ({lw:{atoms, bonds:bonds.map(b => [b[0], b[1], 1]), alt}});
const MOL = {
  methane:MS([AT('C', 1, 1), AT('H', 1, 0), AT('H', 0, 1), AT('H', 2, 1), AT('H', 1, 2)], [[0, 1], [0, 2], [0, 3], [0, 4]], 'methane'),
  chloro:MS([AT('C', 1, 1), AT('H', 1, 0), AT('H', 0, 1), AT('H', 1, 2), AT('Cl', 2, 1)], [[0, 1], [0, 2], [0, 3], [0, 4]], 'chloromethane'),
  methanol:MS([AT('C', 1, 1), AT('H', 1, 0), AT('H', 0, 1), AT('H', 1, 2), AT('O', 2, 1), AT('H', 3, 1)], [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5]], 'methanol'),
  propane:MS([AT('C', 1, 1), AT('C', 2, 1), AT('C', 3, 1), AT('H', 0, 1), AT('H', 4, 1), AT('H', 1, 0), AT('H', 1, 2), AT('H', 2, 0), AT('H', 2, 2), AT('H', 3, 0), AT('H', 3, 2)], [[0, 1], [1, 2], [0, 3], [2, 4], [0, 5], [0, 6], [1, 7], [1, 8], [2, 9], [2, 10]], 'propane'),
  ipa:MS([AT('C', 1, 1), AT('C', 2, 1), AT('C', 3, 1), AT('H', 0, 1), AT('H', 4, 1), AT('H', 1, 0), AT('H', 1, 2), AT('H', 2, 0), AT('O', 2, 2), AT('H', 2, 3), AT('H', 3, 0), AT('H', 3, 2)], [[0, 1], [1, 2], [0, 3], [2, 4], [0, 5], [0, 6], [1, 7], [1, 8], [8, 9], [2, 10], [2, 11]], 'isopropyl alcohol'),
  pg:MS([AT('C', 1, 1), AT('C', 2, 1), AT('C', 3, 1), AT('H', 0, 1), AT('H', 4, 1), AT('H', 1, 0), AT('O', 1, 2), AT('H', 1, 3), AT('H', 2, 0), AT('O', 2, 2), AT('H', 2, 3), AT('H', 3, 0), AT('H', 3, 2)], [[0, 1], [1, 2], [0, 3], [2, 4], [0, 5], [0, 6], [6, 7], [1, 8], [1, 9], [9, 10], [2, 11], [2, 12]], 'propylene glycol')
};
const FIG1 = [{...MOL.methane, label:'A · methane (gas)'}, {...MOL.chloro, label:'B · chloromethane (liquid)'}, {...MOL.methanol, label:'C · methanol (liquid)'}];
const FIG2 = [{...MOL.propane, label:'A · propane (gas)'}, {...MOL.ipa, label:'B · isopropyl alcohol'}, {...MOL.pg, label:'C · propylene glycol'}];
const IMF = [['ldf', 'London dispersion'], ['dd', 'Dipole–dipole'], ['hb', 'H-bonding']];

/* Blood cell drawings for the osmosis ward */
function cellSVG(kind){
  const body = kind === 'swell' ? '<circle cx="40" cy="40" r="30" fill="#e43b44"/><circle cx="31" cy="30" r="7" fill="#ff8a8a" opacity=".5"/>'
    : kind === 'crenate' ? `<path d="${(() => { let d = ''; for (let i = 0; i < 16; i++){ const a = i * Math.PI / 8, r = i % 2 ? 18 : 27; d += (i ? 'L' : 'M') + (40 + Math.cos(a) * r).toFixed(1) + ' ' + (40 + Math.sin(a) * r).toFixed(1); } return d + 'Z'; })()}" fill="#c8303a"/>`
    : '<circle cx="40" cy="40" r="25" fill="#e43b44"/><circle cx="40" cy="40" r="11" fill="#8a1a22"/>';
  return `<svg viewBox="0 0 80 80" width="64" height="64" role="img" aria-label="${kind === 'swell' ? 'swollen round cell' : kind === 'crenate' ? 'shriveled spiky cell' : 'normal dimpled disc cell'}">${body}</svg>`;
}

/* ---------- Topics ---------- */
Object.assign(TOPICS, {
  sunits:{name:'Pressure units', rule:'1 atm = 760 mm Hg = 760 torr = 76.0 cm Hg = 101.325 kPa. Set up a conversion factor so the old unit cancels.'},
  sstates:{name:'Gas, liquid & solid', rule:'Gas: particles far apart, almost no attraction, move freely. Liquid: close together but able to slide past each other, moderate attraction. Solid: close and locked in place, strongest attraction.'},
  sgaslaw:{name:'Gas laws', rule:'Temperatures in kelvin (K = °C + 273). Boyle P1V1 = P2V2. Charles V1/T1 = V2/T2. Combined P1V1/T1 = P2V2/T2. Avogadro V1/n1 = V2/n2. Ideal PV = nRT, R = 0.0821 L·atm/(mol·K). Dalton: P(total) = sum of partial pressures. STP: 1 mol gas = 22.4 L.'},
  simf:{name:'Intermolecular forces & liquids', rule:'Every molecule has London dispersion forces. Polar molecules add dipole–dipole. H bonded to O, N or F adds hydrogen bonding. Stronger forces mean higher boiling point, higher viscosity and higher surface tension. More OH groups means more H-bonding.'},
  ssolid:{name:'Types of solids', rule:'Ionic: metal + nonmetal ions (BaCl2). Molecular: molecules held by IMFs (ice, CO2). Covalent network: atoms all bonded in a giant network (diamond, quartz SiO2). Metallic: metal atoms in a sea of electrons (Cu, Au).'},
  ssoln:{name:'Solutions & dissolving', rule:'A solution is a homogeneous mixture. Clear means see-through, not colorless. Ionic solutes dissociate into ions (electrolytes); molecular solutes dissolve as whole molecules (nonelectrolytes). Like dissolves like. Henry\'s law: solubility = k × P(gas).'},
  sconc:{name:'Percent concentration', rule:'m/v % = g solute ÷ mL solution × 100. m/m % = g solute ÷ g solution × 100. Use density (g/mL) to turn mL of solution into grams.'},
  smolar:{name:'Molarity & dilution', rule:'M = mol solute ÷ L solution. grams = L × M × molar mass. Dilution: M1V1 = M2V2, where V2 is the FINAL total volume.'},
  scolli:{name:'Colligative properties', rule:'Molality m = mol solute ÷ kg solvent. Particles matter: CaCl2 gives 3 (i = 3). Solutes lower vapor pressure, lower the freezing point and raise the boiling point. ΔTf = Kf·m·i (Kf water 1.86 °C/m); ΔTb = Kb·m·i (Kb 0.512 °C/m).'},
  sosmo:{name:'Osmosis & tonicity', rule:'Water moves across a semipermeable membrane toward the side with more solute. Osmotic pressure π = i·M·R·T. Hypotonic outside: cell swells and may burst. Hypertonic outside: cell shrivels (crenates). Isotonic: no net change.'},
  slytes:{name:'Electrolytes in the body', rule:'eq/L = mol ion/L × charge (1 eq/L = 1000 meq/L). Na^+ is the main cation outside cells, K^+ inside; a pump moves Na^+ out and K^+ in. The kidneys regulate osmolarity. Cl^- helps acid–base balance; bicarbonate carries CO2.'}
});

/* ---------- Builders ---------- */
const SKF = (id, ref, q, fields, why, x = {}) => ({id:'k' + id, ref, type:'form', q, fields, why, ...x});
const SKC = (id, ref, p, x = {}) => ({id:'k' + id, ref, type:'calc', gen:'chain', p, ...x});
const SKX = (id, ref, p, x = {}) => ({id:'k' + id, ref, type:'calc', gen:'fixed', p, ...x});
const SKZ = (id, ref, text, blanks, extra, why, x = {}) => ({id:'k' + id, ref, type:'cloze', text, blanks, extra, why, ...x});
const SKS = (id, ref, q, bins, items, why, x = {}) => ({id:'k' + id, ref, type:'sort', q, bins, items, why, ...x});
const UP = ['atm', 'torr', 'mm Hg', 'kPa', 'L', 'K'];
const UV = ['L', 'mL', 'atm', 'K', 'mol', 'g'];
const UC = ['%', 'g', 'mL', 'M', 'mol', 'g/mL'];
const UM = ['M', 'mol', 'g', 'L', 'mL', '%'];
const UL = ['m', 'M', 'mol', 'g', 'kg', '°C'];
const IONIC = [['ionic', 'Ionic'], ['cov', 'Covalent']];

const SKY_MODS = [
  /* ---------------- Leg I: aboard the Skylark (Chapter 5) ---------------- */
  { id:'gauges', code:'Gg', name:'Gauge Room', topics:['sunits'],
    intro:['Mrrow. You must be the new flight chemist. I\'m Torri, ship\'s cat, named after Torricelli. Yes, the torr guy.', 'The Skylark\'s gauges were salvaged from four different countries. Flight control only reads atmospheres.', 'Launch window is short. Read each gauge, convert to atm, and do it fast.'],
    outro:['All gauges logged in atm. Flight control cleared us to launch.', 'One factor per step: cm → mm → atm. Let the units cancel.'],
    flav:['A needle twitches.', 'The tower radios for a reading.', 'Torri bats at a gauge.'],
    tasks:[
      SKC('1a', 'Ch 5 · #1a', {q:'The old envelope gauge reads {x} cm Hg. Flight control needs it in atm.', x:'94.4', u0:'cm Hg', f:[['10', 'mm Hg', '1', 'cm Hg'], ['1', 'atm', '760', 'mm Hg']], ru:'atm', unit:'atm', units:UP}, {topic:'sunits', timed:75, timeWhy:'Launch window closes in 75 seconds. Read the gauge before the tower moves us to the back of the queue.', after:'Envelope pressure 1.24 atm, a little above ambient. That\'s right for a full envelope. Logged.'}),
      SKC('1b', 'Ch 5 · #1b', {q:'The cabin barometer reads {x} torr. Convert to atm.', x:'72.5', u0:'torr', f:[['1', 'atm', '760', 'torr']], ru:'atm', unit:'atm', units:UP}, {topic:'sunits', timed:60, timeWhy:'The tower wants the cabin reading in 60 seconds.', after:'0.0954 atm? That gauge is on the vacuum line, not the cabin. Good thing someone checked: the vacuum pump is working.'}),
      SKC('1c', 'Ch 5 · #1c', {q:'The fuel-line gauge reads {x} mm Hg. Convert to atm.', x:'150', u0:'mm Hg', f:[['1', 'atm', '760', 'mm Hg']], ru:'atm', unit:'atm', units:UP, sfAlt:[3], notes0:['150 has 2 sig figs as written (0.20 atm); 0.197 atm is also accepted.']}, {topic:'sunits', timed:60, timeWhy:'60 seconds. The engineer is holding the fuel valve.', after:'About 0.20 atm in the fuel line. Low, but that\'s the feed side. The engineer opens the valve.'}),
      SKC('1d', 'Ch 5 · #1d', {q:'The imported helium tank gauge reads {x} kPa. Convert to atm.', x:'124', u0:'kPa', f:[['1', 'atm', '101.325', 'kPa']], ru:'atm', unit:'atm', units:UP}, {topic:'sunits', timed:60, timeWhy:'Last gauge. 60 seconds to launch clearance.', after:'1.22 atm in the helium tank. All four gauges logged. Cast off!'})
    ]},
  { id:'cargo', code:'Cg', name:'Cargo Hold', topics:['sstates', 'ssolid'],
    intro:['The cargo hold. We\'re carrying medical supplies to Isla Solvo.', 'Stowing rules depend on the state of matter: gases need tanks, liquids need sealed barrels, solids can be strapped down.', 'Then the customs manifest: every solid needs its type and formula.'],
    outro:['Cargo stowed and the manifest is signed.', 'Particles get closer and attractions stronger going from gas to liquid to solid.'],
    flav:['Crates creak as we climb.', 'A strap snaps tight.', 'Torri naps on the manifest.'],
    tasks:[
      SKS('2', 'Ch 5 · #2', 'Stowing guide, page 1: how far apart are the particles in each kind of cargo?', [['far', 'Far apart'], ['close', 'Close, can slide'], ['fixed', 'Close, locked in place']],
        [{s:'Helium in the gas tanks', a:'far'}, {s:'Saline in the barrels', a:'close'}, {s:'Iron ballast ingots', a:'fixed'}],
        'Gas particles are separated by mostly empty space, which is why gases compress. Liquids and solids are both close-packed; only liquid particles can slide past each other.', {topic:'sstates', dev:'Stowing guide'}),
      SKS('3', 'Ch 5 · #3', 'Stowing guide, page 2: how strong are the attractions between particles?', [['weak', 'Very weak'], ['mod', 'Moderate'], ['strong', 'Strong']],
        [{s:'Helium in the gas tanks', a:'weak'}, {s:'Saline in the barrels', a:'mod'}, {s:'Iron ballast ingots', a:'strong'}],
        'Weak attractions let gas particles fly apart and fill any container. Liquids are held together but can flow. Solids are held rigidly.', {topic:'sstates', dev:'Stowing guide'}),
      SKS('14a', 'Ch 5 · #14', 'Customs manifest: classify each solid (or gas) in the hold by type.', [['ionic', 'Ionic'], ['mol', 'Molecular'], ['net', 'Covalent'], ['met', 'Metallic']],
        [{s:'Diamond (the captain\'s ring)', a:'net', why:'covalent network of C'}, {s:'Ice (the cold box)', a:'mol', why:'H2O molecules'}, {s:'Copper wire', a:'met'}, {s:'Gold coins (payment)', a:'met'}, {s:'Quartz lenses', a:'net', why:'covalent network SiO2'}, {s:'Methane (stove fuel)', a:'mol', why:'CH4 molecules'}, {s:'Barium chloride (lab reagent)', a:'ionic', why:'Ba^2+ and Cl^-'}],
        '“Covalent” here means a covalent network solid: every atom bonded into one giant structure.', {topic:'ssolid', dev:'Customs manifest'}),
      SKF('14b', 'Ch 5 · #14', 'Customs also wants each formula with its phase label at room temperature and pressure. Type subscripts as plain numbers, like H2O(s).',
        [['Diamond', ['C(s)'], 'C(s)'], ['Ice', ['H2O(s)'], 'H2O(s)'], ['Copper', ['Cu(s)'], 'Cu(s)'], ['Gold', ['Au(s)'], 'Au(s)'], ['Quartz', ['SiO2(s)'], 'SiO2(s)'], ['Methane', ['CH4(g)'], 'CH4(g)'], ['Barium chloride', ['BaCl2(s)'], 'BaCl2(s)']].map(([l, a, d]) => T1(l, a, d, {cs:true})),
        'Methane is a gas at room temperature, so it gets (g). Ice is listed as a solid because it is in the cold box.', {topic:'ssolid', dev:'Customs manifest'})
    ]},
  { id:'envelope', code:'Ev', name:'Envelope Deck', topics:['sgaslaw'],
    intro:['The envelope deck, right under the big helium bag.', 'Up here the gas laws decide whether things float, shrink, or pop.'],
    outro:['Envelope trimmed. We\'re cruising.', 'Pressure and volume trade off: halve one, double the other.'],
    flav:['The envelope fabric ripples.', 'Helium hisses through a valve.', 'Torri\'s fur stands up from the static.'],
    tasks:[
      SKC('4', 'Ch 5 · #4', {q:'We\'re releasing a weather balloon to scout the storm. It holds helium at 1.00 atm in {x} L. What volume will it have in the upper atmosphere at 0.150 atm? (Its rated burst size is 120 L.)', x:'15.6', u0:'L', f:[['1.00', 'atm', '0.150', 'atm']], ru:'L', unit:'L', units:UV, notes:['Boyle\'s law at constant temperature: V2 = V1 × (P1 / P2)']},
        {topic:'sgaslaw', timed:120, timeWhy:'The balloon is already climbing. Ground crew needs to know in 2 minutes whether it will burst before reaching 0.150 atm.', after:'104 L, under the 120 L burst rating. The scout balloon will survive to altitude and radio back storm data.'}),
      SKC('7', 'Ch 5 · #7', {q:'A {x} L lift balloon holds 1.00 g of helium. We add 5.00 g more helium at the same temperature and pressure. What is the new volume?', x:'1.00', u0:'L', f:[['6.00', 'g He', '1.00', 'g He']], ru:'L', unit:'L', units:UV, notes:['Avogadro\'s law: V ∝ n. The mass ratio equals the mole ratio for the same gas: 1.00 g + 5.00 g = 6.00 g He.']},
        {topic:'sgaslaw', after:'6.00 L. That lift balloon can now carry the medicine crate down to the landing pad.'}),
      SKF('10', 'Ch 5 · #10', 'Alarm in the hold: an unknown gas is leaking. The sensor reads its molar mass as 44 g/mol. At STP, 1 mol of gas fills 22.4 L, and air is 1.23 g/L. Will it pool on the floor or rise to the ceiling?',
        [{k:'dec', label:'Density of the gas at STP', a:1.96, tol:.05, unit:'g/L', disp:'1.96 (≈ 2.0)'}, {k:'dec', label:'Its density as a % of air', a:160, tol:2.5, unit:'%', disp:'160 (159.7)'}, {k:'pick', label:'Where does it collect?', opts:[['sink', 'Pools on the floor'], ['float', 'Rises to the ceiling']], a:'sink'}],
        '44 g ÷ 22.4 L = 1.96 g/L. 1.96 ÷ 1.23 × 100 ≈ 160% of air. Denser than air, so it sinks and pools on the floor. Open the floor vents, not the roof hatch.',
        {topic:'sgaslaw', timed:150, timeWhy:'The leak is spreading. You have 2½ minutes to tell the crew whether to open the floor vents or the roof hatch.', after:'Floor vents open. The heavy gas drains out of the hold. Everyone breathe.'})
    ]},
  { id:'engine', code:'En', name:'Engine Room', topics:['sgaslaw'],
    intro:['The engine room. Hot, loud, and full of sealed gas samples.', 'Heat a gas and it expands. Always work temperatures in kelvin.'],
    outro:['The engines are humming.', 'K = °C + 273. Celsius in a gas law gives nonsense, and 0 °C would even divide by zero.'],
    flav:['A piston thunks.', 'Steam vents from a pipe.', 'Torri keeps a safe distance from the boiler.'],
    tasks:[
      SKC('5', 'Ch 5 · #5', {q:'A sample balloon of helium measures {x} L at room temperature, 20 °C. The engineer leaves it next to the boiler, which heats it to 80 °C. What is its volume now? (The sample rack only fits balloons up to 1.6 L.)', x:'1.25', u0:'L', f:[['353', 'K', '293', 'K']], ru:'L', unit:'L', units:UV, notes:['Charles\'s law: V2 = V1 × (T2 / T1), in kelvin. 20 °C = 293 K, 80 °C = 353 K.']},
        {topic:'sgaslaw', after:'1.51 L. Still fits the 1.6 L rack, barely. Moving it away from the boiler.'}),
      SKC('6', 'Ch 5 · #6', {q:'A sealed 5.00 L ballast balloon is at {x} atm and 30.0 °C. Climbing and warming, it expands to 7.0 L at 40 °C. What pressure does it exert now?', x:'2.00', u0:'atm', f:[['5.00', 'L', '7.0', 'L'], ['313', 'K', '303', 'K']], ru:'atm', unit:'atm', units:UP, sf:2, sfWhy:'7.0 L has 2 sig figs', sfAlt:[3], notes:['Combined gas law: P2 = P1 × (V1/V2) × (T2/T1). 30.0 °C = 303 K, 40 °C = 313 K.', '7.0 L has 2 sig figs, so 1.5 atm; 1.48 atm is also accepted.']},
        {topic:'sgaslaw', after:'About 1.5 atm, well under the 3 atm seam rating. The ballast balloon holds.'}),
      SKX('8', 'Ch 5 · #8', {q:'The purge tank is a 4.0 L container of nitrogen at 32 °C and 5.0 atm. How many moles of N2 does it hold? (Purging the fuel line takes 0.50 mol.)', v:.799, sf:2, sfAlt:[3], unit:'mol', units:UV,
        work:['PV = nRT, so n = PV / RT', 'T = 32 + 273 = 305 K, R = 0.0821 L·atm/(mol·K)', 'n = (5.0 atm × 4.0 L) / (0.0821 × 305) = <b>0.80 mol N2</b>']},
        {topic:'sgaslaw', after:'0.80 mol, more than the 0.50 mol a purge needs. Fuel line purged.'}),
      SKX('9', 'Ch 5 · #9', {q:'The ship\'s rangefinder laser runs on a helium–neon mix. Its tube reads 0.56 atm total, and helium contributes 0.27 atm. What is the partial pressure of neon? (Spec: 0.25–0.35 atm neon.)', v:.29, sf:2, unit:'atm', units:UP,
        work:['Dalton\'s law: P(total) = P(He) + P(Ne)', 'P(Ne) = 0.56 − 0.27 = <b>0.29 atm</b>']},
        {topic:'sgaslaw', after:'0.29 atm neon, inside the spec. The rangefinder locks onto Isla Solvo.'})
    ]},
  { id:'galley', code:'Ga', name:'Galley', topics:['simf'],
    intro:['The galley. Cook keeps three fuels and solvents here, and three more liquids in the medicine cabinet.', 'Which one boils first, which pours like syrup, and which beads up? It all comes down to intermolecular forces.'],
    outro:['The galley is shipshape.', 'More H-bonding means stickier molecules: higher boiling point, viscosity, and surface tension.'],
    flav:['The kettle rattles.', 'Something smells like rubbing alcohol.', 'Torri begs for scraps.'],
    tasks:[
      {id:'k11a', ref:'Ch 5 · #11a–c', type:'checks', topic:'simf', q:'The stove-fuel locker holds methane (stove gas), chloromethane (old refrigerant), and methanol (lamp fuel). Mark every intermolecular force each one has.', dev:'Fuel locker', cols:IMF,
        items:[{s:'A · methane', a:['ldf'], why:'nonpolar, only dispersion'}, {s:'B · chloromethane', a:['ldf', 'dd'], why:'polar C–Cl bond, no O–H'}, {s:'C · methanol', a:['ldf', 'dd', 'hb'], why:'O–H group'}],
        fig:FIG1, why:'Everything has London dispersion. Chloromethane is polar, adding dipole–dipole. Only methanol has H on O, so only it hydrogen-bonds.'},
      {id:'k11d', ref:'Ch 5 · #11d', type:'rank', topic:'simf', q:'If the fuel locker overheats, which fuel boils off first? Rank them by boiling point.', prompt:'Tap from HIGHEST to LOWEST boiling point.', dev:'Fuel locker', items:['methane', 'chloromethane', 'methanol'], order:[2, 1, 0], fig:FIG1,
        why:'Methanol has H-bonding, chloromethane only dipole–dipole, methane only dispersion. Methane boils off first; methanol last.', after:'Methane boils away first. Cook moves the gas canister away from the stove.'},
      {id:'k12cd', ref:'Ch 5 · #12c–e', type:'checks', topic:'simf', q:'The medicine cabinet has propane (camp stove), isopropyl alcohol (disinfectant), and propylene glycol (wound gel base). Mark every intermolecular force.', dev:'Medicine cabinet', cols:IMF,
        items:[{s:'A · propane', a:['ldf'], why:'nonpolar hydrocarbon'}, {s:'B · isopropyl alcohol', a:['ldf', 'dd', 'hb'], why:'one O–H'}, {s:'C · propylene glycol', a:['ldf', 'dd', 'hb'], why:'two O–H'}], fig:FIG2,
        why:'Propane is all C–H: dispersion only. Both alcohols are polar with O–H groups, so they dipole–dipole AND hydrogen-bond.'},
      {id:'k12a', ref:'Ch 5 · #12a', type:'rank', topic:'simf', q:'Which one pours slowest from the bottle (greatest viscosity)? Rank them.', prompt:'Tap from MOST to LEAST viscous.', dev:'Medicine cabinet', items:['propane', 'isopropyl alcohol', 'propylene glycol'], order:[2, 1, 0], fig:FIG2,
        why:'Propylene glycol has two O–H groups to H-bond with, so its molecules cling to each other and resist flowing.'},
      {id:'k12b', ref:'Ch 5 · #12b', type:'rank', topic:'simf', q:'Which one beads up the most on the galley table (greatest surface tension)? Rank them.', prompt:'Tap from GREATEST to LEAST surface tension.', dev:'Medicine cabinet', items:['propane', 'isopropyl alcohol', 'propylene glycol'], order:[2, 1, 0], fig:FIG2,
        why:'Stronger attractions pull surface molecules inward. Two O–H groups beat one, and one beats none.'},
      SKZ('13', 'Ch 5 · #13', 'The kettle boils. The bubbles rising through the water are not air. They are {0} {1}: molecules that gained enough energy to escape into the gas phase {2} the liquid, forming pockets of gas.', [['water', 'H2O'], ['vapor', 'vapour', 'steam'], ['inside', 'within']], ['air', 'oxygen', 'hydrogen', 'outside', 'above'], 'A bubble in a boiling liquid is that liquid\'s own vapor. Bubbles form inside the liquid when its vapor pressure equals the outside pressure.', {topic:'simf', dev:'Galley notes'})
    ]},
  /* ---------------- Leg II: Isla Solvo station (Chapter 6) ---------------- */
  { id:'lab', code:'Lb', name:'Water Lab', topics:['ssoln'],
    intro:['Isla Solvo! The station\'s desalinator broke down, and the crew\'s been drinking bad water.', 'First the water lab: what\'s actually dissolved in their samples?', 'Ionic stuff splits into ions and conducts. Molecular stuff dissolves whole.'],
    outro:['The water lab knows what\'s in the samples now.', 'Electrolytes make ions. That\'s what the conductivity meter sees.'],
    flav:['The conductivity meter beeps.', 'A sample bottle clinks.', 'Torri sniffs a beaker and sneezes.'],
    tasks:[
      SKF('6p1', 'Ch 6.1 · #1', 'Sample A is a clear, bright red liquid. The station doctor says “it can\'t be a solution, it\'s red.” Is she right?',
        [{k:'pick', label:'A solution is a … mixture', opts:[['homo', 'Homogeneous'], ['hetero', 'Heterogeneous']], a:'homo'}, {k:'pick', label:'Can a solution be clear and red?', opts:[['y', 'Yes'], ['n', 'No']], a:'y'}, T1('“Clear” means ______ (you can see through it).', ['transparent', 'seethrough', 'see-through'], 'transparent', {contains:['transp', 'through']})],
        'A solution is uniform throughout. Clear means transparent, not colorless, so a solution can be clear and red, like cranberry juice.', {topic:'ssoln', after:'Sample A is a dye solution from a leaking marker. Not dangerous.'}),
      SKF('6p2a', 'Ch 6.1 · #2a', 'Sample B has sodium nitrate in it. Write its dissolving equation. Will it light the conductivity meter?',
        [{k:'charge', label:'Charge on the sodium ion', a:1}, {k:'charge', label:'Charge on the nitrate ion', a:-1}, {k:'pick', label:'Electrolyte?', opts:[['y', 'Yes, it conducts'], ['n', 'No']], a:'y'}],
        'NaNO3 is ionic, so it dissociates: Na^+ and NO3^-. Free ions carry current.', {preview:'NaNO3(s) → Na^{0}(aq) + NO3^{1}(aq)', topic:'ssoln'}),
      SKF('6p2b', 'Ch 6.1 · #2b', 'Sample C is sweet: glucose, C6H12O6. Write its dissolving equation. Will it light the meter?',
        [{k:'pick', label:'Before', opts:PH, a:'s'}, {k:'pick', label:'After', opts:PH, a:'aq'}, {k:'pick', label:'Electrolyte?', opts:[['y', 'Yes, it conducts'], ['n', 'No']], a:'n'}],
        'Glucose is molecular. It dissolves as whole molecules, makes no ions, and is a nonelectrolyte.', {preview:'C6H12O6({0}) → C6H12O6({1})', topic:'ssoln'}),
      SKF('6p2c', 'Ch 6.1 · #2c', 'Sample D is rusty orange: iron(III) chloride. Write its dissolving equation. Will it light the meter?',
        [{k:'charge', label:'Charge on the iron ion', a:3}, {k:'coef', label:'Chloride ions per FeCl3', a:3}, {k:'charge', label:'Charge on each chloride ion', a:-1}, {k:'pick', label:'Electrolyte?', opts:[['y', 'Yes, it conducts'], ['n', 'No']], a:'y'}],
        'Fe^3+ needs three Cl^- to balance. Four ions per formula unit: a strong electrolyte. That\'s the rust in their water.', {preview:'FeCl3(s) → Fe^{0}(aq) + {1}Cl^{2}(aq)', topic:'ssoln', after:'Iron(III) chloride from corroded pipes. That explains the taste. Flagging the pipes for repair.'}),
      SKF('6p3', 'Ch 6.1 · #3', 'Methanol spilled into the generator room. The crew can mop it up with water or with benzene (C6H6). Which will dissolve it?',
        [{k:'pick', label:'CH3OH dissolves better in', opts:[['w', 'Water'], ['b', 'Benzene']], a:'w'}, {k:'pick', label:'CH3OH is', opts:[['p', 'Polar'], ['np', 'Nonpolar']], a:'p'}, {k:'pick', label:'It can form ______ bonds with water', opts:[['h', 'Hydrogen'], ['i', 'Ionic'], ['m', 'Metallic']], a:'h'}],
        'Like dissolves like. Methanol\'s O–H makes it polar and lets it hydrogen-bond with water. Benzene is nonpolar.', {topic:'ssoln', after:'Water it is. Good, because benzene is toxic and flammable.'})
    ]},
  { id:'dive', code:'Dv', name:'Dive Platform', topics:['ssoln'],
    intro:['The dive platform. The desalinator intake is 240 meters down, and a diver is going to fix it.', 'Deep water means high pressure, and high pressure pushes more gas into the blood.'],
    outro:['The diver fixed the intake and surfaced slowly. Good.', 'Henry\'s law: more pressure, more dissolved gas.'],
    flav:['Bubbles rise from below.', 'The air hose hisses.', 'Torri does NOT want to go in the water.'],
    tasks:[
      SKC('6p4', 'Ch 6.1 · #4', {q:'The diver is at 240 m, where the pressure is about {x} atm. Henry\'s law constant for O2 in water at 25 °C is 0.0013 M/atm. What is the equilibrium solubility of O2 in the diver\'s blood plasma (as water), in mol/L?', x:'25', u0:'atm', f:[['0.0013', 'M', '1', 'atm']], ru:'M', unit:'M', units:['M', 'atm', 'mol', 'g/L', 'L', 'mL'], sf:2, sfWhy:'25 and 0.0013 have 2 sig figs', sfAlt:[3], notes:['Henry\'s law: solubility = k × P', '25 and 0.0013 both have 2 sig figs: 0.033 M (0.0325 M also accepted)']},
        {topic:'ssoln', timed:120, timeWhy:'The diver is descending now. Topside needs the O2 solubility in 2 minutes to set the gas mix.', after:'0.033 M, about 25 times the surface value. Topside thins the oxygen in the mix so the diver doesn\'t get oxygen toxicity.'})
    ]},
  { id:'supply', code:'Sp', name:'Supply Room', topics:['sconc'],
    intro:['The supply room. We need cleaning and rinse solutions to flush the station\'s water system.', 'The recipe cards are written in percent: mass/volume or mass/mass.'],
    outro:['All solutions mixed and labeled.', 'm/v uses mL of solution; m/m uses grams. Density turns one into the other.'],
    flav:['The scale settles.', 'A graduated cylinder sloshes.', 'Torri knocks a stir rod off the bench.'],
    tasks:[
      SKX('6p5a', 'Ch 6.1 · #5a', {q:'Test vial: 0.700 g KCl in 1.00 mL of solution. What is the mass/volume %? (The recipe card says 70 %.)', v:70.0, sf:3, unit:'%', units:UC, work:['m/v % = g solute ÷ mL solution × 100', '0.700 g ÷ 1.00 mL × 100 = <b>70.0 %</b>']}, {topic:'sconc', after:'70.0 %. Matches the card. The vial goes in the test kit.'}),
      SKX('6p5b', 'Ch 6.1 · #5b', {q:'Pipe-descaling bucket: 95.2 g MgCl2 dissolved to make 0.250 L of solution. What is the mass/volume %?', v:38.08, sf:3, unit:'%', units:UC, work:['Convert to mL: 0.250 L = 250. mL', '95.2 g ÷ 250. mL × 100 = <b>38.1 %</b>']}, {topic:'sconc'}),
      SKX('6p6a', 'Ch 6.1 · #6a', {q:'Salt brine for the de-icer: 21.0 g NaCl in 1.00 × 10^2 g of solution. What is the mass/mass %?', v:21.0, sf:3, unit:'%', units:UC, work:['m/m % = g solute ÷ g solution × 100', '21.0 g ÷ 100. g × 100 = <b>21.0 %</b>']}, {topic:'sconc'}),
      SKX('6p6b', 'Ch 6.1 · #6b', {q:'Rinse saline: 21.0 g NaCl in 5.00 × 10^2 mL of solution with a density of 1.12 g/mL. What is the mass/mass %?', v:3.75, sf:3, unit:'%', units:UC, work:['Mass of solution = 500. mL × 1.12 g/mL = 560. g', '21.0 g ÷ 560. g × 100 = <b>3.75 %</b>', 'Using 500 (mL) instead of 560 (g) would be the trap.']}, {topic:'sconc', after:'3.75 %. That rinse is gentle enough for the pipes.'}),
      SKX('6p7', 'Ch 6.1 · #7', {q:'Fertilizer for the station garden: 14.6 g KNO3 dissolved in enough water to make 75.0 mL of solution. What is the mass/volume %? (Above 25 % burns the plants.)', v:19.47, sf:3, unit:'%', units:UC, work:['14.6 g ÷ 75.0 mL × 100 = <b>19.5 %</b>']}, {topic:'sconc', after:'19.5 %, under the 25 % limit. The tomatoes live.'})
    ]},
  { id:'pharm', code:'Ph', name:'Pharmacy', topics:['smolar'],
    intro:['The station pharmacy. Patients need IV fluids, and the stock bottles are all in molarity.', 'Mix it wrong and you hurt someone, so check your math.'],
    outro:['The IV bags are ready.', 'In a dilution, V2 is the final total volume, not the water you added.'],
    flav:['An IV bag swings on its hook.', 'The pharmacist double-checks a label.', 'Torri sits on the warm autoclave.'],
    tasks:[
      SKX('6p8', 'Ch 6.1 · #8', {q:'A 5.0 L jug of nitric acid cleaner contains 2.5 mol HNO3. What is its molarity? (The descaler needs 0.40–0.60 M.)', v:.5, sf:2, unit:'M', units:UM, work:['M = mol ÷ L = 2.5 mol ÷ 5.0 L = <b>0.50 M</b>']}, {topic:'smolar', after:'0.50 M, right in range. Use it straight from the jug.'}),
      SKC('6p9a', 'Ch 6.1 · #9a', {q:'Make {x} mL of 0.100 M NaCl rinse. How many grams of NaCl do you weigh out?', x:'2.50×10^2', u0:'mL', f:[['1', 'L', '1000', 'mL'], ['0.100', 'mol NaCl', '1', 'L'], ['58.44', 'g NaCl', '1', 'mol NaCl']], ru:'g NaCl', unit:'g', units:UM}, {topic:'smolar'}),
      SKC('6p9b', 'Ch 6.1 · #9b', {q:'Make {x} mL of 0.200 M glucose (C6H12O6) for a dehydrated patient. How many grams of glucose?', x:'2.50×10^2', u0:'mL', f:[['1', 'L', '1000', 'mL'], ['0.200', 'mol C6H12O6', '1', 'L'], ['180.16', 'g C6H12O6', '1', 'mol C6H12O6']], ru:'g C6H12O6', unit:'g', units:UM}, {topic:'smolar', after:'9.01 g glucose, dissolved and bagged.'}),
      SKC('6p10', 'Ch 6.1 · #10', {q:'Inventory check: the station has a {x} L carboy of 0.500 M glucose. How many grams of glucose are in it?', x:'1.75', u0:'L', f:[['0.500', 'mol C6H12O6', '1', 'L'], ['180.16', 'g C6H12O6', '1', 'mol C6H12O6']], ru:'g C6H12O6', unit:'g', units:UM}, {topic:'smolar', after:'158 g of glucose on hand. Enough for the week.'}),
      SKC('6p11', 'Ch 6.1 · #11', {q:'A 50.0 mL sample of {x} M sucrose stock is diluted to 5.00 × 10^2 mL for a feeding line. What is the new molarity?', x:'0.250', u0:'M', f:[['50.0', 'mL', '5.00×10^2', 'mL']], ru:'M', unit:'M', units:UM, notes:['Dilution: M2 = M1 × (V1 / V2)']}, {topic:'smolar'}),
      SKC('6p12', 'Ch 6.1 · #12', {q:'A nurse adds 300.0 mL of water to 300.0 mL of {x} M H2SO4 to make a cleaning wash. What is the new molarity? Careful: what is the final volume?', x:'0.250', u0:'M', f:[['300.0', 'mL', '600.0', 'mL']], ru:'M', unit:'M', units:UM, notes:['Final volume = 300.0 + 300.0 = 600.0 mL', 'M2 = 0.250 M × (300.0 / 600.0)']},
        {topic:'smolar', timed:90, timeWhy:'The nurse is about to pour it. 90 seconds to confirm the concentration.', after:'0.125 M. The nurse had written 0.250 M on the label, thinking the water didn\'t count. Relabeled.'})
    ]},
  { id:'cold', code:'Cd', name:'Cold Lab', topics:['scolli'],
    intro:['The cold lab. A cold snap is coming, and the station\'s pipes and helipad will freeze.', 'Calcium chloride is the de-icer in the shed. Each formula unit makes three particles, and particles are what lower the freezing point.'],
    outro:['De-icer mixed. The helipad stays clear.', 'Colligative properties count particles, not what kind they are. CaCl2 counts triple.'],
    flav:['Frost creeps up the window.', 'The thermometer drops a notch.', 'Torri curls up on the heater.'],
    tasks:[
      SKF('2p1', 'Ch 6.2 · #1', 'Two de-icer candidates: ethanol or calcium chloride. Write each dissolving equation. Which makes more particles?',
        [{k:'num', label:'Particles from one ethanol molecule', a:1, max:6}, {k:'charge', label:'Charge on the calcium ion', a:2}, {k:'coef', label:'Chloride ions per CaCl2', a:2}, {k:'num', label:'Particles from one CaCl2', a:3, max:6}, {k:'pick', label:'Better de-icer per mole', opts:[['e', 'Ethanol'], ['c', 'CaCl2']], a:'c'}],
        'CH3CH2OH(l) → CH3CH2OH(aq): one particle, because covalent bonds don\'t break. CaCl2(s) → Ca^2+(aq) + 2Cl^-(aq): three particles.', {preview:'CaCl2(s) → Ca^{1}(aq) + {2}Cl^-(aq)', topic:'scolli', after:'Calcium chloride it is: three particles per formula unit.'}),
      SKZ('2p2a', 'Ch 6.2 · #2a', 'Molality (m) = {0} of solute ÷ {1} of {2}.', [['moles', 'mol'], ['kilograms', 'kg'], ['solvent']], ['liters', 'grams', 'solution', 'particles'], 'Molality uses the mass of the SOLVENT in kg, not the volume of solution. That way it doesn\'t change with temperature.', {topic:'scolli', dev:'Formula card'}),
      SKC('2p2b', 'Ch 6.2 · #2b', {q:'The test batch: {x} g CaCl2 dissolved in 100.0 g of water at 25 °C. What is its molality?', x:'23.5', u0:'g CaCl2', f:[['1', 'mol CaCl2', '110.98', 'g CaCl2'], ['1', '', '0.1000', 'kg water']], ru:'mol CaCl2/kg water', unit:'m', units:UL, notes:['100.0 g water = 0.1000 kg', 'CaCl2 = 40.08 + 2(35.45) = 110.98 g/mol']}, {topic:'scolli'}),
      SKF('2p2c', 'Ch 6.2 · #2c', 'In that 2.12 m CaCl2 batch, what is the molality of each ion?', [{k:'dec', label:'Ca^2+ ions', a:2.12, tol:.02, unit:'m'}, {k:'dec', label:'Cl^- ions', a:4.24, tol:.02, unit:'m', disp:'4.24 (4.23 with rounding)'}],
        'One Ca^2+ and two Cl^- per formula unit: 2.12 m Ca^2+ and 2 × 2.12 = 4.24 m Cl^-. Total particles: 6.35 m.', {topic:'scolli'}),
      SKF('2p3ab', 'Ch 6.2 · #3a–b', 'What does dissolving the CaCl2 do to the water?', [{k:'pick', label:'Vapor pressure', opts:[['up', 'Increased'], ['down', 'Decreased'], ['same', 'Unchanged']], a:'down'}, {k:'pick', label:'Freezing point', opts:[['up', 'Elevated'], ['down', 'Lowered']], a:'down'}, {k:'pick', label:'Boiling point', opts:[['up', 'Elevated'], ['down', 'Lowered']], a:'up'}],
        'Solute particles take up space at the surface, so fewer water molecules escape: vapor pressure drops. That lowers the freezing point and raises the boiling point.', {topic:'scolli'}),
      SKZ('2p3c', 'Ch 6.2 · #3c', 'ΔTf = {0} × m × {1}. The solution freezes {2} than pure water. ΔTb = {3} × m × i.', [['Kf'], ['i'], ['lower', 'colder'], ['Kb']], ['higher', 'R', 'T', 'M'], 'i is the number of particles per formula unit (3 for CaCl2). Kf and Kb are properties of the solvent.', {topic:'scolli', dev:'Formula card'}),
      SKX('2p3d1', 'Ch 6.2 · #3d', {q:'How far does the 2.12 m CaCl2 batch lower the freezing point? Kf for water = 1.86 °C/m. (Forecast low tonight: −10 °C.)', v:11.82, sf:3, unit:'°C', units:['°C', 'K', 'm', 'M', 'mol', 'g'], work:['ΔTf = Kf × m × i = 1.86 °C/m × 2.12 m × 3', '= 1.86 × 6.35 = <b>11.8 °C</b>', 'Freezing point = 0.0 − 11.8 = −11.8 °C']}, {topic:'scolli', timed:120, timeWhy:'The cold snap hits in two minutes. Will the de-icer hold at −10 °C?', after:'It freezes at −11.8 °C, below tonight\'s −10 °C. Spray the helipad!'}),
      SKF('2p3d2', 'Ch 6.2 · #3d', 'Now the full temperatures for that batch. Kb for water = 0.512 °C/m.', [{k:'dec', label:'Freezing point of the solution', a:-11.8, tol:.15, unit:'°C', neg:true, disp:'−11.8'}, {k:'dec', label:'Boiling point of the solution', a:103.25, tol:.1, unit:'°C', disp:'103.25 (≈ 103.3)'}],
        'Freezing: 0.0 − 11.8 = −11.8 °C. Boiling: ΔTb = 0.512 × 6.35 = 3.25 °C, so 100.00 + 3.25 = 103.25 °C.', {topic:'scolli'})
    ]},
  { id:'osmo', code:'Os', name:'Osmosis Ward', topics:['sosmo'],
    intro:['The infirmary\'s first ward. Patients drank desalinator water with the wrong salt balance, and their blood cells show it.', 'Water crosses cell membranes toward the side with more solute.'],
    outro:['The ward is stable.', 'Hypo = less solute outside, so cells swell. Hyper = more solute outside, so cells shrivel.'],
    flav:['A microscope lamp clicks on.', 'The doctor squints at a slide.', 'Torri watches the dripping IV, transfixed.'],
    tasks:[
      {id:'k2p4a', ref:'Ch 6.2 · #4', type:'cloze', topic:'sosmo', dev:'Doctor\'s notes (smudged)',
        text:'Diffusion: net movement of solute or solvent from an area of {0} concentration to an area of {1} concentration. A concentration gradient is a region where the concentration {2} over a distance. A semipermeable membrane is permeable to {3} but not to solute.',
        blanks:[['high', 'higher'], ['low', 'lower'], ['changes', 'varies', 'differs'], ['solvent', 'water']], extra:['stays the same', 'solute', 'pressure'], why:'Things spread from crowded to less crowded. A semipermeable membrane lets water through but blocks dissolved solutes.'},
      {id:'k2p4b', ref:'Ch 6.2 · #4', type:'cloze', topic:'sosmo', dev:'Doctor\'s notes (smudged)',
        text:'Osmosis is the diffusion of {0} through a semipermeable membrane in response to a water concentration gradient. Osmotic pressure is the pressure needed to {1} the flow of water across the membrane. Osmolarity is the molarity of {2} in solution (i × M). Isotonic solutions have the {3} concentration of solutes. A hypotonic solution has {4} osmolarity; a hypertonic solution has {5} osmolarity.',
        blanks:[['water', 'solvent'], ['stop', 'prevent', 'halt'], ['particles', 'solute particles'], ['same', 'equal'], ['lower'], ['greater', 'higher']], extra:['speed up', 'molecules of salt', 'different'], why:'Osmolarity counts particles: 1 M CaCl2 is 3 osmol/L. Hypo- means less (lower osmolarity); hyper- means more.'},
      SKX('2p5', 'Ch 6.2 · #5', {q:'Before we use the de-icer batch anywhere near the ward, check its osmotic pressure at 25 °C: 23.5 g CaCl2 (0.2117 mol) in a final volume of 112.5 mL. (Blood is about 7.7 atm.)', v:138.2, sf:3, unit:'atm', units:['atm', 'torr', 'M', 'mol', 'K', 'L'],
        work:['M = 0.2117 mol ÷ 0.1125 L = 1.882 M', 'i = 3 for CaCl2; T = 25 + 273 = 298 K', 'π = i·M·R·T = 3 × 1.882 × 0.0821 × 298 = <b>138 atm</b>']}, {topic:'sosmo', after:'138 atm, about 18 times blood\'s osmotic pressure. That batch would shrivel every cell it touched. It stays on the helipad.'}),
      {id:'k2p9', ref:'Ch 6.2 · #9', type:'sort', topic:'sosmo', q:'Three blood samples under the microscope. Each sat in a different IV fluid. What kind of solution was each one in?', dev:'Microscope', bins:[['hypo', 'Hypotonic'], ['iso', 'Isotonic'], ['hyper', 'Hypertonic']],
        items:[{s:`<span class="cellrow">${cellSVG('swell')}<span>Sample 1: round and swollen</span></span>`, a:'hypo', why:'water rushed in'}, {s:`<span class="cellrow">${cellSVG('normal')}<span>Sample 2: normal dimpled disc</span></span>`, a:'iso', why:'no net flow'}, {s:`<span class="cellrow">${cellSVG('crenate')}<span>Sample 3: shriveled and spiky</span></span>`, a:'hyper', why:'water rushed out'}],
        why:'Water moves toward more solute. A hypotonic bath pushes water in (swelling, then bursting). A hypertonic bath pulls water out (crenation).', timed:60, timeWhy:'The patient on sample 3 is crashing. 60 seconds to identify which IV fluid did this.', after:'Sample 3 sat in hypertonic fluid. Swap that patient\'s IV to isotonic saline now.'}
    ]},
  { id:'lytes', code:'Ly', name:'Electrolyte Ward', topics:['slytes'],
    intro:['The electrolyte ward. The bad water threw off everyone\'s sodium and potassium.', 'IV orders are written in milliequivalents, so we have to count charge, not just moles.'],
    outro:['Electrolytes balanced. The crew is recovering.', 'eq/L = molarity × charge. ×1000 for meq/L.'],
    flav:['A heart monitor beeps steadily.', 'The doctor flips through a chart.', 'Torri sleeps on a patient\'s feet. They don\'t mind.'],
    tasks:[
      {id:'k2p6', ref:'Ch 6.2 · #6', type:'cloze', topic:'slytes', dev:'IV order sheet', text:'Molarity is the number of {0} of solute in one {1} of solution. 1 M Na^+ contains Avogadro\'s number of sodium ions per liter. An equivalent is the number of moles of an ion that gives Avogadro\'s number of electrical {2}. Equivalents emphasize {3}: molarity × charge on the ion = equivalents per liter.',
        blanks:[['moles', 'mol'], ['liter', 'L'], ['charges', 'charge'], ['charge']], extra:['grams', 'kilogram', 'mass', 'atoms'], why:'For a 1+ ion, 1 mol = 1 eq. For a 2+ ion like Ca^2+, 1 mol = 2 eq because each ion carries twice the charge.'},
      SKC('2p7b', 'Ch 6.2 · #7b', {q:'IV bag order: {x} g calcium chloride in 500.0 mL of solution. What is the molarity?', x:'13.8', u0:'g CaCl2', f:[['1', 'mol CaCl2', '110.98', 'g CaCl2'], ['1000', 'mL', '500.0', 'mL']], ru:'mol CaCl2/L', unit:'M', units:['M', 'm', 'mol', 'g', 'eq/L', 'meq/L'], notes:['M = mol ÷ L; the last factor turns “per 500.0 mL” into “per L”']}, {topic:'slytes'}),
      SKF('2p7c', 'Ch 6.2 · #7c–d', 'For that 0.249 M CaCl2 bag, fill in the ion chart. (CaCl2 → Ca^2+ + 2Cl^-)', [{k:'dec', label:'[Ca^2+]', a:.249, tol:.003, unit:'M'}, {k:'dec', label:'[Cl^-]', a:.497, tol:.004, unit:'M', disp:'0.497 (0.498)'}, {k:'dec', label:'Ca^2+ in eq/L', a:.497, tol:.004, unit:'eq/L'}, {k:'dec', label:'Cl^- in eq/L', a:.497, tol:.004, unit:'eq/L'}, {k:'dec', label:'Ca^2+ in meq/L', a:497, tol:4, unit:'meq/L'}],
        'Ca^2+: 0.249 M × 2 charges = 0.497 eq/L. Cl^-: 0.497 M × 1 = 0.497 eq/L. The charges balance, as they must. ×1000 = 497 meq/L each.', {topic:'slytes', timed:180, timeWhy:'The doctor is waiting with the order pen. 3 minutes to fill in the ion chart.', after:'497 meq/L of each. The doctor dilutes it before hanging it, since that\'s far too concentrated for a drip.'}),
      {id:'k2p8a', ref:'Ch 6.2 · #8', type:'cloze', topic:'slytes', dev:'Ward handbook', text:'Body fluid osmolarity is carefully regulated by the {0}. The two most important cations are Na^+ (in blood and {1} fluids) and K^+ (the main {2} cation). A concentration gradient is kept by active transport of {3} ions out of the cell and {4} ions into the cell. This ensures proper function of {5} and the nervous system.',
        blanks:[['kidneys', 'kidney'], ['extracellular', 'interstitial'], ['intracellular'], ['sodium', 'Na+'], ['potassium', 'K+'], ['muscles', 'muscle', 'heart']], extra:['liver', 'lungs', 'calcium'], why:'The Na^+/K^+ pump moves sodium out and potassium in. Nerves and muscles, including the heart, depend on that gradient.'},
      {id:'k2p8b', ref:'Ch 6.2 · #8', type:'cloze', topic:'slytes', dev:'Ward handbook', text:'Elevated K^+ can be caused by injuries that make many cells {0}, releasing their potassium, and may cause {1} failure. Chloride (Cl^-) keeps acid–{2} balance, maintains {3} pressure, and is involved in {4} transport by hemoglobin. Bicarbonate is the form in which most {5} is carried away in the blood. Proteins are {6} molecules, so they form a colloidal dispersion.',
        blanks:[['rupture', 'burst', 'die', 'lyse'], ['heart', 'cardiac'], ['base'], ['osmotic'], ['oxygen', 'O2'], ['carbon dioxide', 'CO2'], ['large', 'big']], extra:['small', 'sugar', 'kidney', 'atmospheric'], why:'Cells hold most of the body\'s K^+, so when they burst, blood K^+ spikes, which is dangerous for the heart.'}
    ]},
  { id:'home', code:'Hm', name:'Flight Home', topics:[], final:true,
    intro:['Everyone\'s healthy and aboard. But there\'s a storm wall between us and home.', 'Exam conditions: every problem is on the clock. Each correct answer pushes the Skylark further through the storm.', 'Both chapters, new numbers where there are numbers. Paper ready? Let\'s fly.'],
    outro:[], tasks:[] }
];
SKY_MODS.forEach(m => m.tasks.forEach(t => { if (!t.topic) t.topic = m.topics[0]; }));

/* Extra practice for reroutes and the storm flight */
EXTRA.push(
  SKC('x1', null, {q:'A cabin gauge reads {x} torr. Convert to atm.', x:'645', u0:'torr', f:[['1', 'atm', '760', 'torr']], ru:'atm', unit:'atm', units:UP}, {topic:'sunits'}),
  SKC('x2', null, {q:'A tank gauge reads {x} kPa. Convert to atm.', x:'215', u0:'kPa', f:[['1', 'atm', '101.325', 'kPa']], ru:'atm', unit:'atm', units:UP}, {topic:'sunits'}),
  SKC('x3', null, {q:'A balloon holds {x} L at 1.00 atm. What is its volume at 0.500 atm (same temperature)?', x:'8.40', u0:'L', f:[['1.00', 'atm', '0.500', 'atm']], ru:'L', unit:'L', units:UV}, {topic:'sgaslaw'}),
  SKC('x4', null, {q:'A sample bag is {x} L at 27 °C (300 K). What volume does it reach at 87 °C (360 K)?', x:'2.50', u0:'L', f:[['360', 'K', '300', 'K']], ru:'L', unit:'L', units:UV}, {topic:'sgaslaw'}),
  SKS('x5', null, 'Classify each solid.', [['ionic', 'Ionic'], ['mol', 'Molecular'], ['net', 'Covalent'], ['met', 'Metallic']], [{s:'NaCl (table salt)', a:'ionic'}, {s:'Sugar crystals', a:'mol'}, {s:'Silver spoon', a:'met'}, {s:'Silicon carbide grit', a:'net'}, {s:'Dry ice (CO2)', a:'mol'}], 'Ions → ionic; separate molecules → molecular; one giant bonded network → covalent; metal atoms → metallic.', {topic:'ssolid'}),
  {id:'kx6', type:'checks', topic:'simf', q:'Mark every intermolecular force each one has.', dev:'Chemical locker', cols:IMF, items:[{s:'CH3CH2OH (ethanol)', a:['ldf', 'dd', 'hb']}, {s:'CH3OCH3 (dimethyl ether)', a:['ldf', 'dd'], why:'polar, but no H on O'}, {s:'C4H10 (butane)', a:['ldf']}], why:'H-bonding needs H attached directly to O, N or F.'},
  {id:'kx7', type:'rank', topic:'simf', q:'Rank by boiling point.', prompt:'Tap from HIGHEST to LOWEST boiling point.', items:['H2O', 'H2S', 'CH4'], order:[0, 1, 2], why:'Water H-bonds; H2S is polar only; CH4 has dispersion only.'},
  SKX('x8', null, {q:'A solution has 12.0 g sugar in 150. mL of solution. What is the mass/volume %?', v:8.0, sf:3, unit:'%', units:UC, work:['12.0 g ÷ 150. mL × 100 = <b>8.00 %</b>']}, {topic:'sconc'}),
  SKC('x9', null, {q:'How many grams of KCl are needed for {x} mL of 0.150 M KCl?', x:'500.', u0:'mL', f:[['1', 'L', '1000', 'mL'], ['0.150', 'mol KCl', '1', 'L'], ['74.55', 'g KCl', '1', 'mol KCl']], ru:'g KCl', unit:'g', units:UM}, {topic:'smolar'}),
  SKC('x10', null, {q:'25.0 mL of {x} M HCl is diluted to 250. mL. What is the new molarity?', x:'6.00', u0:'M', f:[['25.0', 'mL', '250.', 'mL']], ru:'M', unit:'M', units:UM}, {topic:'smolar'}),
  SKF('x11', null, 'Write the dissolving equation for sodium phosphate, Na3PO4. How many particles per formula unit?', [{k:'coef', label:'Sodium ions', a:3}, {k:'charge', label:'Charge on the phosphate ion', a:-3}, {k:'num', label:'Particles per Na3PO4', a:4, max:8}], 'Three Na^+ and one PO4^3-: four particles (i = 4).', {preview:'Na3PO4(s) → {0}Na^+(aq) + PO4^{1}(aq)', topic:'scolli'}),
  {id:'kx12', type:'sort', topic:'sosmo', q:'A red blood cell is placed in each fluid. What happens?', bins:[['swell', 'Swells / bursts'], ['same', 'No change'], ['shrink', 'Shrivels']], items:[{s:'Pure water', a:'swell', why:'hypotonic'}, {s:'0.9 % saline', a:'same', why:'isotonic'}, {s:'5 % NaCl', a:'shrink', why:'hypertonic'}], why:'Water moves toward the side with more solute.'},
  SKF('x13', null, 'A 0.150 M MgCl2 IV bag. Fill in the chart.', [{k:'dec', label:'[Mg^2+] in eq/L', a:.3, tol:.003, unit:'eq/L'}, {k:'dec', label:'[Cl^-] in M', a:.3, tol:.003, unit:'M'}, {k:'dec', label:'Mg^2+ in meq/L', a:300, tol:3, unit:'meq/L'}], 'Mg^2+: 0.150 M × 2 = 0.300 eq/L = 300 meq/L. Cl^-: 2 × 0.150 = 0.300 M.', {topic:'slytes'})
);

/* ---------- Skylark art ---------- */
const CABIN = new Set(['gauges', 'cargo', 'envelope', 'engine', 'galley', 'loft']);
const STATION2 = new Set(['lab', 'dive', 'supply', 'pharm', 'cold', 'osmo', 'lytes']);
const SKYROOM = new Set(['home']);
function cabinBase(k, ctx, t, o){
  k.r(0, 0, 80, 40, '#4a2e1c'); for (let x = 0; x < 80; x += 8) k.r(x, 0, 1, 34, '#3a2214');
  k.r(0, 4, 80, 2, '#c8a04a'); k.r(0, 30, 80, 2, '#c8a04a');
  k.circ(68, 16, 7, '#c8a04a'); k.circ(68, 16, 5, '#5fa8d8'); for (let i = 0; i < 3; i++){ const x = 63 + ((i * 4 + t * 3) % 10); k.r(x, 13 + i * 2, 3, 1, '#eef0f8'); }
  k.r(0, 34, 80, 6, '#7a4e30'); for (let x = 0; x < 80; x += 10) k.r(x, 34, 1, 6, '#5c3a24'); k.r(0, 34, 80, 1, '#c8a04a');
  const lit = o.lit > 0 && !(o.lit < 1 && Math.random() < .12);
  k.r(38, 0, 4, 2, '#c8a04a'); k.r(37, 2, 6, 2, lit ? '#fff3b0' : '#3a2214');
  if (lit){ ctx.fillStyle = 'rgba(255,243,176,.06)'; for (let i = 0; i < 6; i++) ctx.fillRect(37 - i * 2, 4 + i * 4, 6 + i * 4, 4); }
}
function stationBase(k, ctx, t, o){
  k.r(0, 0, 80, 40, '#b8ccc8'); for (let x = 0; x < 80; x += 8) k.r(x, 0, 1, 34, '#a0b8b4'); for (let y = 0; y < 34; y += 8) k.r(0, y, 80, 1, '#a0b8b4');
  k.r(56, 6, 18, 12, '#5a6988'); k.r(57, 7, 16, 10, '#5fa8d8'); k.r(57, 13, 16, 4, '#0099db'); k.p(60 + Math.floor(t * 2) % 10, 13, '#eef0f8');
  k.r(0, 34, 80, 6, '#8b93af'); k.r(0, 34, 80, 1, '#c0cbdc');
  const lit = o.lit > 0 && !(o.lit < 1 && Math.random() < .12);
  [14, 40].forEach(x => { k.r(x, 0, 10, 2, lit ? '#eef8ff' : '#8b93af'); if (lit){ ctx.fillStyle = 'rgba(238,248,255,.07)'; for (let i = 0; i < 5; i++) ctx.fillRect(x - i, 2 + i * 5, 10 + i * 2, 5); } });
}
Object.assign(DEV, {
  gauges(k, t, o){
    const a = act(o, t);
    [[12, 14], [28, 14], [12, 26], [28, 26]].forEach(([x, y], i) => { k.circ(x, y, 6, '#c8a04a'); k.circ(x, y, 5, '#eef0f8'); const an = (a ? Math.sin(t * 3 + i) * .8 : (o.lit >= 1 ? .3 : -1.2)) - 1.57 + i * .4; k.line(x, y, x + Math.cos(an) * 4, y + Math.sin(an) * 4, C.sr); k.p(x, y, '#2a1a0a'); });
    k.r(40, 12, 14, 20, '#3a2214'); k.r(42, 14, 10, 6, a ? C.ba : '#1a3a1a'); for (let i = 0; i < 3; i++) k.r(43 + i * 3, 24, 2, 6, '#8b93af'), k.r(43 + i * 3, a ? 24 + ((i + Math.floor(t * 3)) % 3) : 27, 2, 2, C.sr);
    o.sx = 20; o.sy = 20;
  },
  cargo(k, t, o){
    const a = act(o, t);
    [[6, 14], [12, 14]].forEach(([x, y]) => { k.r(x, y, 5, 20, '#8b93af'); k.r(x + 1, y - 2, 3, 2, '#5a6988'); k.r(x, y + 4, 5, 2, C.ba); });
    k.r(22, 22, 12, 12, '#7a4e30'); k.r(22, 26, 12, 1, '#5c3a24'); k.r(22, 30, 12, 1, '#5c3a24'); k.r(25, 23, 6, 3, '#eef0f8');
    k.r(38, 20, 14, 14, '#b86f50'); k.line(38, 20, 51, 33, '#8a4b2a'); k.line(51, 20, 38, 33, '#8a4b2a'); k.r(41, 16, 8, 4, C.sr); k.r(44, 15, 2, 6, '#eef0f8'); k.r(42, 17, 6, 2, '#eef0f8');
    for (let i = 0; i < 3; i++) k.r(55, 30 - i * 3, 10, 2, '#5a6988');
    if (a) for (let i = 0; i < 4; i++) k.line(4 + i * 16, 8, 8 + i * 16, 34, 'rgba(200,160,74,.4)');
    o.sx = 30; o.sy = 24;
  },
  envelope(k, t, o){
    const a = act(o, t), r = 13 + (a ? Math.round(Math.sin(t * 2) * 2) : 0);
    k.circ(34, 14, r, '#c0cbdc'); k.circ(34, 14, r - 2, '#dde3ee'); for (let x = -r + 3; x < r; x += 5) k.r(34 + x, 2, 1, 26, '#a0aac0');
    k.r(50, 22, 6, 12, '#8b93af'); k.line(50, 24, 40, 26, '#5a6988'); k.p(53, 21, a ? C.ba : C.sr);
    if (a){ const y = 30 - ((t * 10) % 26); k.circ(14, y, 3, C.sr); k.line(14, y + 3, 14, y + 7, '#eef0f8'); }
    o.sx = 34; o.sy = 16;
  },
  engine(k, t, o){
    const a = act(o, t);
    k.r(4, 10, 20, 24, '#5a6988'); k.r(8, 18, 12, 10, '#2a1a0a'); for (let i = 0; i < 8; i++){ const h = a || o.lit >= 1 ? 3 + Math.floor(Math.random() * 5) : 1; k.r(9 + i, 28 - h, 1, h, i % 2 ? C.orange : C.na); }
    const py = a ? Math.round(Math.sin(t * 8) * 3) : 0; k.r(30, 14 + py, 8, 4, '#c0cbdc'); k.r(33, 18 + py, 2, 10, '#8b93af'); k.r(28, 28, 12, 6, '#5a6988');
    k.r(46, 12, 8, 22, '#3a6a9a'); k.r(47, 10, 6, 2, '#8b93af'); k.r(46, 18, 8, 3, '#eef0f8'); k.p(50, 19, '#0099db');
    if (a) for (let i = 0; i < 3; i++) k.p(20 + i * 3, 8 - ((t * 6 + i * 2) % 6), '#eef0f8');
    o.sx = 14; o.sy = 22;
  },
  galley(k, t, o){
    const a = act(o, t), hot = a || o.lit >= 1;
    k.r(6, 24, 30, 10, '#5a6988'); k.r(6, 22, 30, 2, '#8b93af'); k.r(12, 18, 10, 6, '#c0cbdc'); k.r(21, 19, 4, 2, '#c0cbdc');
    if (hot){ for (let i = 0; i < 4; i++){ const ph = (t * .8 + i * .25) % 1; k.p(15 + i * 2, 16 - ph * 12, 'rgba(238,240,248,.7)'); } for (let i = 0; i < 6; i++) k.p(8 + i * 4, 33, i % 2 ? C.orange : C.na); }
    [[42, '#63c74d'], [48, '#2ce8f5'], [54, '#feae34']].forEach(([x, c]) => { k.r(x, 18, 4, 10, '#c0cbdc'); k.r(x, 22, 4, 6, c); k.r(x + 1, 16, 2, 2, '#8a4b2a'); });
    k.r(40, 28, 20, 2, '#7a4e30');
    o.sx = 18; o.sy = 20;
  },
  lab(k, t, o){
    const a = act(o, t);
    k.r(4, 26, 46, 3, '#eef0f8'); k.r(6, 29, 2, 5, '#8b93af'); k.r(46, 29, 2, 5, '#8b93af');
    [[8, '#e43b44'], [16, '#eef8ff'], [24, '#c8a04a'], [32, '#f77622']].forEach(([x, c]) => { k.r(x, 18, 6, 8, '#c0cbdc'); k.r(x + 1, 21, 4, 5, c); });
    k.r(40, 16, 8, 10, '#3a4466'); k.circ(44, 13, 3, a ? C.yel : '#5a5040'); k.line(41, 26, 36, 26, '#5a6988');
    o.sx = 22; o.sy = 22;
  },
  dive(k, t, o){
    const a = act(o, t);
    k.r(0, 22, 80, 18, '#0a5a8a'); for (let x = 0; x < 80; x += 6) k.p(x + Math.floor(t * 3) % 6, 22, '#5fc8ff');
    k.r(0, 20, 30, 3, '#8b93af'); k.r(4, 10, 2, 10, '#8b93af');
    const dy = 26 + Math.round(Math.sin(t) * 3); k.circ(50, dy, 4, '#c8a04a'); k.circ(50, dy, 2, '#5fa8d8'); k.r(48, dy + 4, 4, 6, '#3a4466');
    k.line(28, 20, 47, dy - 2, '#feae34');
    if (a || o.lit > 0) for (let i = 0; i < 4; i++){ const ph = (t * .7 + i * .25) % 1; k.p(52 + i, dy - 4 - ph * (dy - 24), '#eef0f8'); }
    o.sx = 50; o.sy = 26;
  },
  supply(k, t, o){
    const a = act(o, t);
    [12, 22].forEach((y, r) => { k.r(4, y, 40, 1, '#8b93af'); for (let i = 0; i < 6; i++) k.r(6 + i * 6, y - 6, 4, 6, ['#eef8ff', '#63c74d', '#2ce8f5', '#feae34', '#b55088', '#eef0f8'][(i + r) % 6]); });
    k.r(52, 26, 18, 2, '#5a6988'); k.r(60, 18, 2, 8, '#5a6988'); const tilt = a ? Math.round(Math.sin(t * 3)) : 0; k.line(54, 18 + tilt, 68, 18 - tilt, '#5a6988'); k.r(52, 19 + tilt, 5, 2, '#c0cbdc'); k.r(65, 19 - tilt, 5, 2, '#c0cbdc');
    o.sx = 30; o.sy = 20;
  },
  pharm(k, t, o){
    const a = act(o, t);
    k.r(4, 4, 46, 1, '#5a6988');
    [10, 24, 38].forEach((x, i) => { k.r(x + 2, 5, 1, 3, '#5a6988'); k.r(x, 8, 6, 9, '#eef8ff'); k.r(x + 1, 11, 4, 6, ['#bfe6ff', '#eef0f8', '#fff0c0'][i]); k.r(x + 2, 17, 2, 3, '#c0cbdc'); k.line(x + 3, 20, x + 3, 30, '#c0cbdc');
      if (a || o.lit >= 1){ const ph = (t * 1.5 + i * .3) % 1; k.p(x + 3, 20 + ph * 10, C.cu); } });
    k.r(52, 24, 18, 10, '#eef0f8'); k.r(55, 26, 3, 6, '#c0cbdc'); k.r(60, 26, 3, 6, '#c0cbdc'); k.r(65, 26, 3, 6, '#c0cbdc');
    o.sx = 25; o.sy = 14;
  },
  cold(k, t, o){
    const a = act(o, t), thaw = a || o.lit >= 1;
    k.r(4, 10, 48, 4, '#8b93af'); k.r(4, 22, 48, 4, '#8b93af');
    if (!thaw) for (let i = 0; i < 8; i++){ k.r(6 + i * 6, 14, 1, 2 + (i % 3), '#eef8ff'); k.r(8 + i * 6, 26, 1, 2 + ((i + 1) % 3), '#eef8ff'); k.r(4, 9, 48, 1, '#eef8ff'); }
    else for (let i = 0; i < 4; i++){ const ph = (t + i * .25) % 1; k.p(8 + i * 12, 15 + ph * 18, '#5fc8ff'); }
    k.r(58, 6, 4, 26, '#eef0f8'); k.circ(60, 32, 3, C.sr); const lv = thaw ? 14 : 24; k.r(59, lv, 2, 32 - lv, C.sr);
    if (a) for (let i = 0; i < 5; i++) k.p(10 + Math.random() * 40, 28 + Math.random() * 4, '#eef0f8');
    o.sx = 28; o.sy = 18;
  },
  osmo(k, t, o){
    const a = act(o, t);
    k.r(8, 26, 20, 8, '#3a4466'); k.r(14, 10, 6, 16, '#5a6988'); k.r(12, 8, 10, 4, '#8b93af'); k.r(16, 22, 2, 4, '#c0cbdc'); k.r(10, 24, 14, 2, '#eef0f8');
    k.circ(52, 18, 12, '#2a3a4a'); k.circ(52, 18, 11, '#eef8ff');
    const r = a ? 5 + Math.round(Math.sin(t * 2)) : 5; k.circ(52, 18, r, C.sr); k.circ(52, 18, 2, '#8a1a22');
    o.sx = 52; o.sy = 18;
  },
  lytes(k, t, o){
    const a = act(o, t), ok = a || o.lit >= 1;
    k.r(8, 6, 26, 16, '#3a4466'); k.r(9, 7, 24, 14, '#0b1a14');
    for (let x = 0; x < 24; x++){ const ph = (x + Math.floor(t * 12)) % 12; const y = ok ? (ph === 4 ? 9 : ph === 5 ? 18 : ph === 6 ? 11 : 14) : 14 + (Math.random() < .3 ? Math.round(Math.random() * 6 - 3) : 0); k.p(9 + x, y, ok ? C.ba : C.na); }
    k.r(42, 26, 30, 4, '#eef0f8'); k.r(42, 24, 30, 2, '#c0cbdc'); k.r(66, 21, 6, 3, '#eef0f8');
    k.r(46, 6, 4, 8, '#eef8ff'); k.line(48, 14, 48, 24, '#c0cbdc');
    o.sx = 20; o.sy = 14;
  },
  home(k, t, o){
    const a = act(o, t) || o.warp;
    for (let y = 0; y < 34; y++) k.r(0, y, 80, 1, y < 12 ? '#2a3a6a' : y < 24 ? '#4a5a8a' : '#e89a5a');
    k.r(0, 30, 80, 10, '#0a3a5a'); for (let x = 0; x < 80; x += 5) k.p(x + Math.floor(t * 4) % 5, 31, '#5fa8d8');
    if (o.alarm) for (let i = 0; i < 4; i++){ const x = (i * 23 + Math.floor(t * 20)) % 80; k.line(x, 0, x - 4, 10, '#eef0f8'); }
    const sx = 30 + Math.round(Math.sin(t) * 2), sy = 12 + Math.round(Math.sin(t * 1.3) * 2);
    k.circ(sx + 8, sy, 7, '#c0cbdc'); k.r(sx + 1, sy, 14, 1, '#a0aac0'); k.r(sx + 5, sy + 8, 6, 3, '#7a4e30'); k.line(sx + 3, sy + 4, sx + 5, sy + 8, '#5c3a24'); k.line(sx + 13, sy + 4, sx + 11, sy + 8, '#5c3a24');
    if (a) for (let i = 0; i < 3; i++) k.p(sx - 2 - i * 3, sy + 9, '#eef0f8');
    if (o.charge != null){ k.r(10, 37, 60, 1, C.dark); k.r(10, 37, Math.round(60 * o.charge), 1, C.cu); }
    o.sx = 38; o.sy = 12;
  },
  loft(k, t, o){
    const a = act(o, t), sealed = o.lit >= .9 || a;
    k.r(6, 8, 40, 18, '#dde3ee'); for (let x = 8; x < 46; x += 6) k.r(x, 8, 1, 18, '#c0cbdc');
    if (!sealed){ k.r(22, 14, 8, 5, '#4a2e1c'); k.line(21, 13, 31, 20, '#2a1a0a'); } else { k.r(20, 12, 12, 9, '#c8a04a'); for (let x = 20; x < 32; x += 2){ k.p(x, 12, '#7a4e30'); k.p(x, 20, '#7a4e30'); } }
    k.r(52, 24, 22, 4, '#7a4e30'); k.r(54, 28, 2, 6, '#5c3a24'); k.r(70, 28, 2, 6, '#5c3a24'); k.r(58, 20, 8, 4, C.sr); k.line(62, 20, 64, 14, '#c0cbdc');
    if (a && Math.floor(t * 6) % 2) k.p(26, 16, C.yel);
    o.sx = 26; o.sy = 16;
  }
});
{
  const dr = drawRoom;
  drawRoom = function(ctx, id, t, o){
    if (!CABIN.has(id) && !STATION2.has(id) && !SKYROOM.has(id)) return dr(ctx, id, t, o);
    const k = K(ctx);
    if (CABIN.has(id)) cabinBase(k, ctx, t, o); else if (STATION2.has(id)) stationBase(k, ctx, t, o);
    DEV[id](k, t, o);
    const dark = .6 * (1 - Math.min(1, o.lit)); if (dark > 0){ ctx.fillStyle = `rgba(5,6,16,${dark})`; ctx.fillRect(0, 0, 80, 40); }
    if (o.alarm){ const on = Math.floor(t * 3) % 2 === 0; k.r(2, 1, 3, 2, on ? C.sr : C.srD); if (on){ ctx.fillStyle = 'rgba(228,59,68,.1)'; ctx.fillRect(0, 0, 80, 40); } }
    if (o.lit < 1 && !o.live && Math.random() < .3){ const x = (o.sx || 40) + Math.round(Math.random() * 14 - 7), y = (o.sy || 20) + Math.round(Math.random() * 10 - 5); k.p(x, y, C.white); k.p(x + 1, y, C.cu); }
    if (o.failUntil && t < o.failUntil){ ctx.fillStyle = 'rgba(228,59,68,.28)'; ctx.fillRect(0, 0, 80, 40); for (let i = 0; i < 10; i++) k.p(8 + Math.random() * 64, 6 + Math.random() * 26, [C.white, C.na, C.orange][i % 3]); }
  };
}

/* Torri, the ship's cat (18×16) */
function drawTorri(ctx, t){
  const k = K(ctx); ctx.clearRect(0, 0, 18, 16);
  const e = molly.expr, fur = '#e8913a', dk = '#b8641a';
  k.p(3, 1, fur); k.r(3, 2, 2, 2, fur); k.p(14, 1, fur); k.r(13, 2, 2, 2, fur); k.p(4, 2, '#f4b0a0'); k.p(13, 2, '#f4b0a0');
  k.r(2, 4, 14, 9, fur); k.r(3, 3, 12, 1, fur); k.r(3, 13, 12, 1, fur); for (let x = 5; x < 14; x += 3) k.p(x, 4, dk);
  k.r(5, 10, 8, 3, '#f8e0c0');
  k.r(3, 5, 12, 1, '#5a3a1a'); k.r(4, 6, 4, 3, '#c8a04a'); k.r(10, 6, 4, 3, '#c8a04a'); k.r(8, 7, 2, 1, '#5a3a1a');
  const blink = (t % 3.8) < .13, ec = e === 'alarm' ? C.sr : '#63c74d';
  const eye = x => {
    if (blink){ k.r(x, 7, 2, 1, '#2a1a0a'); return; }
    if (e === 'happy'){ k.p(x, 7, '#2a1a0a'); k.p(x + 1, 6, '#2a1a0a'); return; }
    k.r(x, 6, 2, 2, ec); k.p(x + (e === 'smug' ? 1 : 0), 7, '#2a1a0a'); if (e === 'smug') k.r(x, 6, 2, 1, '#c8a04a');
  };
  eye(5); eye(11);
  k.p(9, 10, '#e46a7a'); const talk = t < molly.talkUntil && Math.floor(t * 10) % 2;
  if (talk) k.r(8, 11, 3, 1, '#8a2a30'); else if (e === 'worried'){ k.p(8, 12, '#5a3a1a'); k.p(10, 12, '#5a3a1a'); } else { k.p(8, 11, '#5a3a1a'); k.p(10, 11, '#5a3a1a'); }
  k.r(0, 10, 3, 1, '#eef0f8'); k.r(15, 10, 3, 1, '#eef0f8'); k.r(0, 12, 3, 1, '#eef0f8'); k.r(15, 12, 3, 1, '#eef0f8');
  k.r(3, 14, 3, 2, fur); k.r(12, 14, 3, 2, fur); const tw = Math.round(Math.sin(t * 2)); k.r(16, 12 + tw, 2, 3, fur);
}
function drawShipArt(ctx, t, lit){
  const k = K(ctx); ctx.clearRect(0, 0, 48, 64);
  for (let i = 0; i < 4; i++){ const x = (i * 17 + Math.floor(t * 4)) % 56 - 8; k.r(x, 6 + i * 13, 10, 2, '#3a4a7a'); }
  const by = 18 + Math.round(Math.sin(t * 1.5) * 2);
  k.circ(24, by, 16, '#a0aac0'); k.circ(24, by - 1, 15, '#dde3ee'); for (let x = 10; x < 40; x += 5) k.r(x, by - 13, 1, 27, '#c0cbdc');
  k.r(8, by, 32, 1, '#a0aac0');
  k.line(14, by + 13, 18, by + 22, '#5c3a24'); k.line(34, by + 13, 30, by + 22, '#5c3a24');
  k.r(14, by + 22, 20, 7, '#7a4e30'); k.r(14, by + 22, 20, 1, '#c8a04a');
  for (let i = 0; i < 4; i++) k.r(17 + i * 4, by + 24, 2, 2, i / 4 < lit ? C.na : '#3a2214');
  const sp = Math.floor(t * 10) % 2; k.r(34, by + 23, 2, 4, '#8b93af'); k.r(36, by + 22 + sp, 1, 3, '#c0cbdc'); k.r(36, by + 24 - sp, 1, 3, '#c0cbdc');
  if (lit > .95) k.r(4, 56, 40, 4, '#0a3a5a'), k.r(18, 54, 12, 2, '#63c74d');
}

/* ---------- Campaign ---------- */
BADGES.push({id:'skylark', name:'Safe Landing', d:'Bring the Skylark home through the storm.', c:C.cu}, {id:'clutch', name:'Under Pressure', d:'Beat 5 timed problems.', c:C.na});
CAMPS.sky = { id:'sky', title:'The Skylark Run', tag:'Ch. 5 gases, liquids & solids · Ch. 6 solutions', mods:SKY_MODS, pal:'TORRI', art:'skyship', unitWord:'stops',
  layout:[['#Leg I · Aboard the Skylark · Chapter 5'], ['gauges'], ['cargo'], ['envelope'], ['engine'], ['galley'], ['#Leg II · Isla Solvo Station · Chapter 6'], ['lab'], ['dive'], ['supply'], ['pharm'], ['cold'], ['osmo'], ['lytes'], ['#Leg III · The storm'], ['home']], shape:'route',
  timerDefault:true, examCalc:210, examOther:60,
  repair:{ id:'loft', code:'Lf', name:'Sail Loft', topics:[], repair:true, tasks:[] },
  repairLines:['This one tore the envelope last time. Same numbers. Patch it.', 'An old tear, same problem as before. Take your time.', 'Mrrp. You missed this one. Show it who\'s captain.'],
  repairIntro:['Every problem you missed tore a hole in the envelope.', 'In the sail loft you get the exact same problem again. Solve it and the patch holds: +15 envelope.', 'Miss it and the tear stays. Nothing tears further in here, and nothing is timed, so work it carefully.'],
  boot:['Mrrow. Welcome aboard the Skylark. I\'m Torri, the ship\'s cat. Named after Torricelli, inventor of the barometer. Yes, the torr is named after him too.',
    'We\'re flying medical supplies to Isla Solvo research station. Their desalinator failed, and the crew is sick from bad water.',
    'Leg one is the flight: gauges, balloons, engines, the galley. That\'s Chapter 5. Leg two is the island: water tests, a deep dive, IV bags, and a cold snap. That\'s Chapter 6.',
    'Some jobs have a deadline: launch windows, leaks, a patient crashing. Those are timed, like a real test. The rest you can take slowly.',
    'Every answer matters out here. Get one wrong and it tears the envelope. Patch it in the sail loft by re-solving it. Ready? Cast off!'],
  bootExpr:['happy', 'worried', 'neutral', 'alarm', 'happy'], bootRoom:'gauges', firstLine:'First stop: the Gauge Room, at the top of the route.', finalBadge:'skylark',
  w:{ hull:'envelope', Hull:'Envelope', nrg:'Fuel', energy:'fuel', crack:'tear', Bay:'Sail loft', bay:'sail loft', weld:'patch', map:'Flight route', charge:'Through the storm', go:'Fly home', start:'Start the job', unit:'Stop', online:'done',
    fixed:'★ Job done', fault:'✗ That went wrong', startWeld:'Start patching', doneWeld:'Patching done', patched:'Tear patched', patchFail:'The patch didn\'t hold. The tear stays in the sail loft.', added:'Added to the sail loft. Re-solve it there to patch the envelope.',
    failHull:'Envelope failure! Emergency patch', check:'Storm flight', restored:'done', mid:'in progress', weldMore:'Patch more', welded:'Patched', cracksLeft:'Tears left', perWeld:'Per patch' },
  dev:{ tf:'Checklist', classify:'Logbook', mc:'Choose', numval:'Counter', net:'Sample tank', choice:'Choose', nums:'Counter', balance:'Equation board', form:'Logbook', eq:'Equation board', build:'Workbench', lp:'Sketch', dots:'Sketch', cloze:'Logbook' },
  units:['atm', 'L', 'K', 'mol', 'g', 'M', '%', '°C'],
  ending(pct, patches){
    if (pct >= 85 && patches === 0) return ['Smooth landing', ['Home, through the storm, without a scratch. You flew that like a real exam.', 'You\'re ready for Chapters 5 and 6. Run a remix the night before.']];
    if (pct >= 65) return ['Bumpy landing', ['We made it home with a few patches on the envelope.', 'Check the flight log (study report) for weak topics, then try a remix.']];
    return ['Rough landing', ['We\'re down. In one piece. Mostly.', 'Work through the study report, reread the manual pages, and fly a remix.']];
  }
};
{
  const ma = mount;
  mount = function(){
    ma();
    view.querySelectorAll('canvas[data-art="skyship"]').forEach(c => { const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawShipArt(ctx, t, +c.dataset.lit)}); });
    if (CAMP.id === 'sky') view.querySelectorAll('canvas[data-molly]').forEach(c => { anims.forEach(a => { if (a.el === c) anims.delete(a); }); const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawTorri(ctx, t)}); });
  };
}

{
  const rs = resolve;
  resolve = function(ok, sev, html){
    const timed = ui.tsec && !ui.done, m = st.cur && modOf(st.cur.m);
    rs(ok, sev, html);
    if (ok && timed && m && !m.final){ st.timedWins = (st.timedWins || 0) + 1; save(); if (st.timedWins >= 5) award(['clutch']); }
  };
}
Object.assign(DEVNAME, { gauges:'Gauge log', cargo:'Stowing guide', envelope:'Envelope log', engine:'Engine log', galley:'Galley notes', lab:'Lab notebook', dive:'Topside console', supply:'Mixing bench', pharm:'IV order pad', cold:'Cold lab log', osmo:'Ward chart', lytes:'Ward chart', home:'Navigation log', loft:'Patch kit' });
Object.assign(VERB, { gauges:'Log reading', cargo:'Stow it', envelope:'Confirm', engine:'Log it', galley:'Note it', lab:'Record', dive:'Radio topside', supply:'Mix it', pharm:'Fill order', cold:'Mix de-icer', osmo:'Chart it', lytes:'Sign order', home:'Steer', loft:'Patch it' });
