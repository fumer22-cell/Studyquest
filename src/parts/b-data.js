const NA = 6.022e23;
/* ---------- Chemistry text formatter: C6H12O6 → subscripts, ^2+ → superscripts ---------- */
function F(str){
  str = String(str); let o = '', i = 0, inTag = false;
  while (i < str.length){
    const c = str[i];
    if (inTag){ o += c; if (c === '>') inTag = false; i++; continue; }
    if (c === '<'){ inTag = true; o += c; i++; continue; }
    if (c === '^'){
      let j = i + 1, t = '';
      if (str[j] === '{'){ j++; while (j < str.length && str[j] !== '}') t += str[j++]; j++; }
      else { while (j < str.length && /[0-9+\-]/.test(str[j])) t += str[j++]; }
      o += '<sup>' + t.replace(/-/g, '−') + '</sup>'; i = j; continue;
    }
    if (/[0-9]/.test(c) && i > 0 && /[A-Za-z)\]]/.test(str[i-1])){
      let j = i, t = ''; while (j < str.length && /[0-9]/.test(str[j])) t += str[j++];
      o += '<sub>' + t + '</sub>'; i = j; continue;
    }
    o += c; i++;
  }
  return o;
}

/* ---------- Number helpers ---------- */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function sfOf(s){
  s = String(s).replace(/^[+-]/, '');
  if (s.includes('.')) return s.replace('.', '').replace(/^0+/, '').length;
  const t = s.replace(/^0+/, '').replace(/0+$/, ''); return Math.max(1, t.length);
}
function randMant(sf){ const lo = 10 ** (sf - 1); return (rnd(lo, 10 * lo - 1) / lo).toFixed(sf - 1); }
function randPlain(){
  const sf = pick([2, 3, 3, 3, 4]); const m = randMant(sf); const k = Math.min(pick([0, 1, 1, 2]), sf - 1);
  return (+m * 10 ** k).toFixed(sf - 1 - k);
}
function toSci(v, sf){
  if (v === 0) return { m: (0).toFixed(sf - 1), e: 0 };
  let e = Math.floor(Math.log10(Math.abs(v))); let ms = (v / 10 ** e).toFixed(sf - 1);
  if (Math.abs(parseFloat(ms)) >= 10){ e++; ms = (v / 10 ** e).toFixed(sf - 1); }
  if (Math.abs(parseFloat(ms)) < 1){ e--; ms = (v / 10 ** e).toFixed(sf - 1); }
  return { m: ms, e };
}
const sci = (m, e) => `${m}×10^${e}`;
function num(v, sf = 4){
  const a = Math.abs(v);
  if (a >= 0.001 && a < 1e5) return String(+v.toPrecision(sf));
  const t = toSci(v, sf); return sci(t.m, t.e);
}
function ansText(a){ const t = toSci(a.value, a.sf); return `${sci(t.m, t.e)} ${a.unit}`; }
const roundLine = (a, why) => `Round to ${a.sf} sig figs${why ? ' (' + why + ')' : ''} → <b>${ansText(a)}</b>`;
const decimals = s => (String(s).split('.')[1] || '').length;

/* ---------- Substances (molar masses from the data sheet) ---------- */
const S = {
  glucose:{f:'C6H12O6', n:'glucose', mm:180.16, w:'6(12.01) + 12(1.008) + 6(16.00)', p:'molecules'},
  water:{f:'H2O', n:'water', mm:18.02, w:'2(1.008) + 16.00', p:'molecules'},
  n2o5:{f:'N2O5', n:'N2O5', mm:108.02, w:'2(14.01) + 5(16.00)', p:'molecules'},
  co2:{f:'CO2', n:'carbon dioxide', mm:44.01, w:'12.01 + 2(16.00)', p:'molecules'},
  ch4:{f:'CH4', n:'methane', mm:16.04, w:'12.01 + 4(1.008)', p:'molecules'},
  nh3:{f:'NH3', n:'ammonia', mm:17.03, w:'14.01 + 3(1.008)', p:'molecules'},
  n2:{f:'N2', n:'nitrogen gas', mm:28.02, w:'2(14.01)', p:'molecules'},
  h2:{f:'H2', n:'hydrogen gas', mm:2.016, w:'2(1.008)', p:'molecules'},
  o2:{f:'O2', n:'oxygen gas', mm:32.00, w:'2(16.00)', p:'molecules'},
  c3h8:{f:'C3H8', n:'propane', mm:44.09, w:'3(12.01) + 8(1.008)', p:'molecules'},
  nacl:{f:'NaCl', n:'sodium chloride', mm:58.44, w:'22.99 + 35.45'},
  caco3:{f:'CaCO3', n:'calcium carbonate', mm:100.09, w:'40.08 + 12.01 + 3(16.00)'},
  cao:{f:'CaO', n:'calcium oxide', mm:56.08, w:'40.08 + 16.00'},
  cacl2:{f:'CaCl2', n:'calcium chloride', mm:110.98, w:'40.08 + 2(35.45)'},
  mgcl2:{f:'MgCl2', n:'magnesium chloride', mm:95.21, w:'24.31 + 2(35.45)'},
  alcl3:{f:'AlCl3', n:'aluminum chloride', mm:133.33, w:'26.98 + 3(35.45)'},
  fe2o3:{f:'Fe2O3', n:'iron(III) oxide', mm:159.70, w:'2(55.85) + 3(16.00)'},
  mgo:{f:'MgO', n:'magnesium oxide', mm:40.31, w:'24.31 + 16.00'},
  mg:{f:'Mg', n:'magnesium', mm:24.31, p:'atoms'},
  fe:{f:'Fe', n:'iron', mm:55.85, p:'atoms'},
  pb:{f:'Pb', n:'lead', mm:207.2, p:'atoms'},
  cu:{f:'Cu', n:'copper', mm:63.55, p:'atoms'},
  al:{f:'Al', n:'aluminum', mm:26.98, p:'atoms'},
  ag:{f:'Ag', n:'silver', mm:107.87, p:'atoms'},
  fent:{f:'fentanyl', n:'fentanyl', mm:336.479, given:true, p:'molecules'}
};
const mmLine = s => s.given ? `Molar mass of ${s.f} (given) = ${s.mm} g/mol`
  : s.w ? `Molar mass of ${s.f} = ${s.w} = ${s.mm} g/mol` : `Molar mass of ${s.f} = ${s.mm} g/mol (data sheet)`;

const RX = {
  h2o:{eq:'2H2 + O2 → 2H2O', r:['h2','o2'], c:{h2:2, o2:1, water:2}},
  nh3:{eq:'N2 + 3H2 → 2NH3', r:['n2','h2'], c:{n2:1, h2:3, nh3:2}},
  ch4:{eq:'CH4 + 2O2 → CO2 + 2H2O', r:['ch4','o2'], c:{ch4:1, o2:2, co2:1, water:2}},
  fe:{eq:'4Fe + 3O2 → 2Fe2O3', r:['fe','o2'], c:{fe:4, o2:3, fe2o3:2}},
  c3h8:{eq:'C3H8 + 5O2 → 3CO2 + 4H2O', r:['c3h8','o2'], c:{c3h8:1, o2:5, co2:3, water:4}},
  mg:{eq:'2Mg + O2 → 2MgO', r:['mg','o2'], c:{mg:2, o2:1, mgo:2}},
  caco3:{eq:'CaCO3 → CaO + CO2', r:['caco3'], c:{caco3:1, cao:1, co2:1}}
};
const G2G = [['h2o','h2','water'],['nh3','n2','nh3'],['nh3','h2','nh3'],['ch4','ch4','co2'],['ch4','ch4','water'],['fe','fe','fe2o3'],['c3h8','c3h8','co2'],['c3h8','c3h8','water'],['mg','mg','mgo'],['caco3','caco3','co2']];

const LIM = {
  cacn:{L:['Ca(CN)2','HCl'], R:['CaCl2','HCN'], sol:[1,2,1,2], names:['calcium cyanide','HCl'], prod:'cacl2', pi:2},
  mgcl:{L:['Mg','HCl'], R:['MgCl2','H2'], sol:[1,2,1,1], names:['magnesium','HCl'], prod:'mgcl2', pi:2},
  alcl:{L:['Al','Cl2'], R:['AlCl3'], sol:[2,3,2], names:['aluminum','Cl2'], prod:'alcl3', pi:2}
};

const HYD = [
  {f:'CuCl2·2H2O', parts:[['Cu','63.546',1],['Cl','35.4527',2],['H','1.008',4],['O','16.00',2]], chips:['16.00','1.008','65.39','63.546','32.066','35.4527'], skip:'65.39 (Zn) and 32.066 (S)'},
  {f:'CuSO4·5H2O', parts:[['Cu','63.546',1],['S','32.066',1],['O','16.00',9],['H','1.008',10]], chips:['65.39','16.00','35.4527','1.008','63.546','32.066'], skip:'65.39 (Zn) and 35.4527 (Cl)'},
  {f:'CoCl2·6H2O', parts:[['Co','58.933',1],['Cl','35.4527',2],['H','1.008',12],['O','16.00',6]], chips:['32.066','58.933','1.008','63.546','16.00','35.4527'], skip:'63.546 (Cu) and 32.066 (S)'},
  {f:'MgSO4·7H2O', parts:[['Mg','24.305',1],['S','32.066',1],['O','16.00',11],['H','1.008',14]], chips:['24.305','54.938','1.008','32.066','35.4527','16.00'], skip:'54.938 (Mn) and 35.4527 (Cl)'},
  {f:'Na2CO3·10H2O', parts:[['Na','22.990',2],['C','12.011',1],['O','16.00',13],['H','1.008',20]], chips:['39.098','12.011','16.00','22.990','32.066','1.008'], skip:'39.098 (K) and 32.066 (S)'}
];
const PRET = [
  {pat:'A2(BX3)4', nA:2, nB:4, nX:12, how:'X: 3 inside × 4 outside = 12'},
  {pat:'A3(BX2)2', nA:3, nB:2, nX:4, how:'X: 2 inside × 2 outside = 4'},
  {pat:'A(BX4)3', nA:1, nB:3, nX:12, how:'X: 4 inside × 3 outside = 12'},
  {pat:'A2(BX)3', nA:2, nB:3, nX:3, how:'X: 1 inside × 3 outside = 3'}
];

/* ---------- Calculation generators ---------- */
const CALC = {
  mass:{
    build(p){
      const s = S[p.s], n = +p.m * 10 ** p.e, sf = sfOf(p.m), g = n * s.mm, mg = p.out === 'mg', v = mg ? g * 1000 : g;
      const a = {value:v, sf, unit: mg ? 'mg' : 'g'};
      const work = [mmLine(s), `${sci(p.m, p.e)} mol × ${s.mm} g/mol = ${num(g, 5)} g`];
      if (mg) work.push(`${num(g, 5)} g × 1000 mg/g = ${num(v, 5)} mg`);
      work.push(roundLine(a, `${p.m} has ${sf}`));
      return { q: `Calculate the number of ${mg ? 'milligrams' : 'grams'} of ${s.n} (${s.f}) in ${sci(p.m, p.e)} mol of ${s.n}.`,
        a, work, setup: `mol → g: multiply by the molar mass of ${s.f}.${mg ? ' Then g → mg: multiply by 1000.' : ''}` };
    },
    rand(){ const e = rnd(-4, 2); return { s: pick(['glucose','water','nacl','co2','caco3','nh3','c3h8']), m: randMant(pick([2,3,3,4])), e, out: e <= -3 && Math.random() < .6 ? 'mg' : 'g' }; }
  },
  particles:{
    build(p){
      const s = S[p.s], g = +p.m * 10 ** p.e, sf = sfOf(p.m), mol = g / s.mm, v = mol * NA;
      const a = {value:v, sf, unit:s.p};
      return { q: p.q || `Calculate the number of ${s.p} in ${sci(p.m, p.e)} g of ${s.n} (${s.f}).`, a,
        work: [mmLine(s), `${sci(p.m, p.e)} g ÷ ${s.mm} g/mol = ${num(mol, 4)} mol`, `${num(mol, 4)} mol × 6.022×10^23 ${s.p}/mol = ${num(v, 4)} ${s.p}`, roundLine(a, `${p.m} has ${sf}`)],
        setup: `g → mol (divide by ${s.mm} g/mol) → ${s.p} (multiply by 6.022×10^23).` };
    },
    rand(){ return { s: pick(['water','co2','ch4','nh3','glucose','pb','fe','cu','al','ag']), m: randMant(pick([2,3,3,4])), e: rnd(-3, 2) }; }
  },
  molp:{
    build(p){
      const s = S[p.s], n = +p.m * 10 ** p.e, sf = sfOf(p.m), v = n / NA;
      const a = {value:v, sf, unit:'mol'};
      return { q: `Calculate the moles of ${s.f} in ${sci(p.m, p.e)} ${s.p} of ${s.f}.`, a,
        work: [`${sci(p.m, p.e)} ${s.p} ÷ 6.022×10^23 ${s.p}/mol = ${num(v, 4)} mol`, roundLine(a, `${p.m} has ${sf}`)],
        setup: `particles → mol: divide by 6.022×10^23. You don't need the molar mass.` };
    },
    rand(){ return { s: pick(['n2o5','water','co2','nh3','ch4','fe','cu','pb']), m: randMant(pick([2,3,3,4])), e: rnd(20, 25) }; }
  },
  hydrate:{
    build(p){
      const h = HYD[p.h]; const chips = p.chips || h.chips;
      const sum = h.parts.reduce((t, x) => t + (+x[1]) * x[2], 0);
      const dp = Math.min(...h.parts.map(x => decimals(x[1])));
      const rs = sum.toFixed(dp); const a = {value:+rs, sf:sfOf(rs), unit:'g/mol'};
      const minEl = h.parts.find(x => decimals(x[1]) === dp);
      return { q: `Which values do you need to calculate the molar mass of ${h.f}? Choose from: ${chips.join(', ')}. Then calculate the molar mass.`, a, chips,
        need: h.parts.map(x => x[1]),
        work: [...h.parts.map(x => `${x[0]}: ${x[2]} × ${x[1]} = ${+((+x[1]) * x[2]).toFixed(6)}`),
          `Skip ${h.skip}.`,
          `Sum = ${+sum.toFixed(6)}. Adding, so keep the fewest decimal places (${dp}, from ${minEl[1]}) = ${rs} g/mol`,
          roundLine(a, 'in scientific notation')],
        setup: `Count atoms: ${h.parts.map(x => x[2] + ' ' + x[0]).join(', ')}. The water in a hydrate counts: the number in front multiplies the whole H2O.` };
    },
    rand(p){ const opts = HYD.map((_, i) => i).filter(i => i !== (p && p.h)); const h = pick(opts); return { h, chips: shuffle(HYD[h].chips) }; }
  },
  pretend:{
    build(p){
      const P = PRET[p.pi]; const sum = P.nA * +p.a + P.nB * +p.b + P.nX * +p.x;
      const dp = Math.min(decimals(p.a), decimals(p.b), decimals(p.x)); const rs = sum.toFixed(dp);
      const a = {value:+rs, sf:sfOf(rs), unit:'g/mol'};
      const terms = [[P.nA, p.a], [P.nB, p.b], [P.nX, p.x]];
      return { q: `Find the molar mass of the pretend compound ${P.pat}, where A = ${p.a} g/mol, B = ${p.b} g/mol, and X = ${p.x} g/mol.`, a,
        work: [`Count each atom: A = ${P.nA}, B = ${P.nB}, X = ${P.nX} (${P.how})`,
          `${terms.map(t => t[0] + '(' + t[1] + ')').join(' + ')} = ${terms.map(t => (t[0] * +t[1]).toFixed(dp)).join(' + ')} = ${rs} g/mol`,
          roundLine(a, 'in scientific notation')],
        setup: `A subscript outside the parentheses multiplies everything inside. ${P.how}.` };
    },
    rand(){ return { pi: rnd(0, 3), a: (rnd(1000, 6000) / 100).toFixed(2), b: (rnd(100, 2000) / 100).toFixed(2), x: (rnd(500, 4000) / 100).toFixed(2) }; }
  },
  g2g:{
    build(p){
      const rx = RX[p.rx], A = S[p.a], B = S[p.b], cA = rx.c[p.a], cB = rx.c[p.b];
      const sf = sfOf(p.g), molA = +p.g / A.mm, molB = molA * cB / cA, v = molB * B.mm;
      const a = {value:v, sf, unit:'g'};
      const others = rx.r.filter(k => k !== p.a).map(k => S[k].f);
      return { q: `${rx.eq}. How many grams of ${B.f} form from ${p.g} g of ${A.f}${others.length ? ' with excess ' + others.join(' and ') : ''}?`, a,
        work: [`Molar masses: ${A.f} = ${A.mm} g/mol, ${B.f} = ${B.mm} g/mol`,
          `${p.g} g ${A.f} ÷ ${A.mm} g/mol = ${num(molA, 4)} mol ${A.f}`,
          `${num(molA, 4)} mol ${A.f} × (${cB} mol ${B.f} / ${cA} mol ${A.f}) = ${num(molB, 4)} mol ${B.f}`,
          `${num(molB, 4)} mol × ${B.mm} g/mol = ${num(v, 4)} g ${B.f}`, roundLine(a, `${p.g} has ${sf}`)],
        setup: `g ${A.f} → mol ${A.f} → mol ${B.f} (ratio ${cB} ${B.f} : ${cA} ${A.f}) → g ${B.f}.` };
    },
    rand(){ const [rx, a, b] = pick(G2G); return { rx, a, b, g: randPlain() }; }
  },
  limit:{
    build(p){
      const L = LIM[p.r], P = S[L.prod], c = L.sol, cP = c[L.pi];
      const nA = +p.mA * 10 ** p.eA, nB = +p.mB * 10 ** p.eB;
      const fA = nA * cP / c[0], fB = nB * cP / c[1], lim = Math.min(fA, fB), limName = fA <= fB ? L.names[0] : L.names[1];
      const sf = Math.min(sfOf(p.mA), sfOf(p.mB)), v = lim * P.mm; const a = {value:v, sf, unit:'g'};
      const unbal = L.L.join(' + ') + ' → ' + L.R.join(' + ');
      return { q: `Calculate the grams of ${P.n} that can be made from ${sci(p.mA, p.eA)} mol ${L.names[0]} and ${sci(p.mB, p.eB)} mol ${L.names[1]}. Balance the equation first: ${unbal}`, a,
        work: [`Balanced: ${balancedText(L.L, L.R, c)}`,
          `From ${L.names[0]}: ${sci(p.mA, p.eA)} mol × (${cP}/${c[0]}) = ${num(fA, 4)} mol ${P.f}`,
          `From ${L.names[1]}: ${sci(p.mB, p.eB)} mol × (${cP}/${c[1]}) = ${num(fB, 4)} mol ${P.f}`,
          `${limName[0].toUpperCase() + limName.slice(1)} makes less, so it is the limiting reactant.`,
          `${num(lim, 4)} mol × ${P.mm} g/mol = ${num(v, 4)} g`,
          roundLine(a, `fewest sig figs in the data is ${sf}`)],
        setup: `Find how much ${P.f} each reactant could make (mol × ratio). The smaller one is limiting. Then × ${P.mm} g/mol.` };
    },
    rand(){
      const r = pick(Object.keys(LIM)), L = LIM[r], sfA = pick([3, 3, 4]);
      const mA = randMant(sfA), eA = rnd(-4, -1), nA = +mA * 10 ** eA;
      const nB = nA * (L.sol[1] / L.sol[0]) * (0.5 + Math.random() * 1.1); const tb = toSci(nB, 3);
      return { r, mA, eA, mB: tb.m, eB: tb.e };
    }
  }
};

/* ---------- Balancing ---------- */
function parseF(f){
  let i = 0;
  function group(){
    const m = {};
    while (i < f.length && f[i] !== ')'){
      let sub;
      if (f[i] === '('){ i++; sub = group(); i++; }
      else { let el = f[i++]; while (i < f.length && /[a-z]/.test(f[i])) el += f[i++]; sub = {[el]:1}; }
      let n = ''; while (i < f.length && /\d/.test(f[i])) n += f[i++];
      const k = n ? +n : 1; for (const e in sub) m[e] = (m[e] || 0) + sub[e] * k;
    }
    return m;
  }
  return group();
}
function tally(L, R, c){
  const els = [], l = {}, r = {};
  const add = (f, k, side) => { const m = parseF(f); for (const e in m){ if (!els.includes(e)) els.push(e); side[e] = (side[e] || 0) + m[e] * k; } };
  L.forEach((f, i) => add(f, c[i], l)); R.forEach((f, k) => add(f, c[L.length + k], r));
  return { els, l, r };
}
const gcd = (a, b) => b ? gcd(b, a % b) : a;
function balState(L, R, c){
  const t = tally(L, R, c); const bal = t.els.every(e => (t.l[e] || 0) === (t.r[e] || 0));
  return { t, bal, lowest: c.reduce(gcd) === 1 };
}
function balancedText(L, R, c){
  const s = (f, k) => (k === 1 ? '' : k) + f;
  return L.map((f, i) => s(f, c[i])).join(' + ') + ' → ' + R.map((f, k) => s(f, c[L.length + k])).join(' + ');
}
function balanceHTML(L, R, c, locked){
  const sp = (f, i) => `<div class="sp"><div class="step">${locked ? '' : `<button class="sbtn" data-act="coef" data-i="${i}" data-d="1" aria-label="Increase coefficient">+</button>`}<span class="coef">${c[i]}</span>${locked ? '' : `<button class="sbtn" data-act="coef" data-i="${i}" data-d="-1" aria-label="Decrease coefficient">−</button>`}</div><div class="form">${F(f)}</div></div>`;
  const left = L.map((f, i) => sp(f, i)).join('<span class="op">+</span>');
  const right = R.map((f, k) => sp(f, L.length + k)).join('<span class="op">+</span>');
  const s = balState(L, R, c);
  const rows = s.t.els.map(e => { const a = s.t.l[e] || 0, b = s.t.r[e] || 0, k = a === b ? 'eq' : 'ne';
    return `<div class="ael">${e}</div><div class="acell ${k}">${a}</div><div class="acell ${k}">${b}</div>`; }).join('');
  const ml = c.slice(0, L.length).reduce((x, y) => x + y, 0), mr = c.slice(L.length).reduce((x, y) => x + y, 0);
  return `<div class="bal"><div class="eqrow">${left}<span class="op">→</span>${right}</div>
    <div class="atoms"><div class="ah">Atom</div><div class="ah">Left</div><div class="ah">Right</div>${rows}</div>
    <p class="moles">Total moles (sum of coefficients): <b>${ml}</b> left, <b>${mr}</b> right. <span class="dim">These don't have to match.</span></p></div>`;
}

/* ---------- Topics & rule cards (from the study guide) ---------- */
const TOPICS = {
  conv:{name:'Grams ↔ moles ↔ particles', rule:'grams → moles: divide by molar mass (g/mol). moles → particles: multiply by 6.022×10^23. Going the other way, do the opposite.'},
  amu:{name:'Grams vs. amu', rule:'One particle is measured in amu. One mole is measured in grams. The number is the same.'},
  mm:{name:'Molar mass', rule:'Add each atomic mass times how many of that atom are in the formula. A subscript outside parentheses multiplies everything inside. In a hydrate like CuCl2·2H2O, the 2 multiplies the whole H2O.'},
  bal:{name:'Balancing & coefficients', rule:'Balance the whole equation first. Then read the coefficient of the substance the question asks about. Change coefficients only, never subscripts, and use the lowest whole numbers.'},
  atoms:{name:'Atoms vs. moles', rule:'Balanced equations conserve atoms, not moles.'},
  cls:{name:'Classifying reactions', rule:`<div class="tscroll"><table class="ctab"><tr><th>Type</th><th>Pattern</th><th>Clue</th></tr>
    <tr><td>Combination</td><td>A + B → AB</td><td>One product</td></tr>
    <tr><td>Decomposition</td><td>AB → A + B</td><td>One reactant</td></tr>
    <tr><td>Single-replacement</td><td>A + BC → AC + B</td><td>An element swaps in</td></tr>
    <tr><td>Precipitation</td><td>two (aq) → a (s)</td><td>A solid forms</td></tr>
    <tr><td>Acid-base</td><td>acid + base → salt + water</td><td>H^+ is transferred</td></tr></table></div>`},
  net:{name:'Net ionic equations', rule:'Split every (aq) compound into ions, cross out the spectator ions that appear on both sides, and keep what\'s left. Never split a solid.'},
  redox:{name:'Oxidation–reduction', rule:'OIL RIG: Oxidation Is Loss, Reduction Is Gain (of electrons). The oxidized one loses electrons; the reduced one gains them. Pick from the reactants only.'},
  stoich:{name:'Grams A → grams B', rule:'grams A → moles A → (mole ratio) → moles B → grams B. Never skip the moles step. Given two reactant amounts, find which one runs out first.'},
  name:{name:'Naming multi-charge ions', rule:'Old system: -ous means the lower charge, -ic means the higher charge. Modern system: the Roman numeral gives the charge. Latin roots: iron → ferr-, copper → cupr-, lead → plumb-, tin → stann-.'}
};
const CLASSES = [['comb','Combination'],['decomp','Decomposition'],['single','Single-replacement'],['precip','Precipitation'],['acid','Acid-base']];
const UNITS = ['g','mg','mol','molecules','atoms','g/mol','amu'];

/* ---------- The study guide, as station tasks ---------- */
const MODS = [
  { id:'med', code:'Mb', name:'Med Bay', topics:['conv'],
    intro:['Emergency lights only. You\'re in the med bay.', 'The IV pump, the water log, and the toxin sensor all lost their unit conversions. Each one reads a different unit than the number I have.', 'Everything in this room runs on one path: grams ↔ moles ↔ particles.'],
    outro:['Med bay is stable.', 'If something went wrong here, it was probably direction on the path. Divide by molar mass to get to moles. Multiply by 6.022×10^23 to get to particles.'],
    tasks:[
      {id:'q1', n:1, type:'calc', topic:'conv', gen:'mass', p:{s:'glucose', m:'1.00', e:-5, out:'mg'}, story:'The IV pump reads milligrams. I only have the glucose dose in moles.'},
      {id:'q2', n:2, type:'calc', topic:'conv', gen:'mass', p:{s:'water', m:'4.90', e:0, out:'g'}, story:'The water ration log is in grams.'},
      {id:'q4', n:4, type:'calc', topic:'conv', gen:'particles', p:{s:'fent', m:'2.00', e:-3, q:'2.00×10^-3 g of fentanyl (molar mass 336.479 g/mol) can cause an overdose. How many molecules is that?'}, story:'A sealed vial has an overdose warning. The toxin sensor counts molecules, not grams.'}
    ]},
  { id:'air', code:'At', name:'Atmosphere', topics:['conv','amu'],
    intro:['Air scrubbers next. They log gases by molecule count, and the backup logs mix up grams and amu.', 'One molecule is measured in amu. One mole is measured in grams. Same number, different unit.'],
    outro:['Air is breathable.', 'amu for one particle, grams for one mole.'],
    tasks:[
      {id:'q5', n:5, type:'calc', topic:'conv', gen:'molp', p:{s:'n2o5', m:'7.42', e:23}, story:'The scrubber counted a pollutant molecule by molecule. The filter is rated in moles.'},
      {id:'q9', n:9, type:'numunit', topic:'amu', q:'What is the mass of one mole of O2?', v:32.00, unit:'g', why:'One mole is measured in grams: 2(16.00) = 32.00 g.', story:'Oxygen tank label check.'},
      {id:'q10', n:10, type:'numunit', topic:'amu', q:'What is the mass of one molecule of CO2?', v:44.01, unit:'amu', why:'One molecule is measured in amu: 12.01 + 2(16.00) = 44.01 amu.', story:'The CO2 sensor weighs single molecules.'},
      {id:'q11', n:11, type:'numunit', topic:'amu', q:'What is the mass of one mole of CH4?', v:16.04, unit:'g', why:'12.01 + 4(1.008) = 16.04 g for one mole.', story:'Methane leak check, logged per mole.'}
    ]},
  { id:'fab', code:'Fb', name:'Fabricator', topics:['conv','mm'],
    intro:['The fabricator can print shielding and parts, but it needs molar masses and atom counts. It won\'t guess.'],
    outro:['Fabricator online.', 'A subscript outside parentheses multiplies everything inside, and a hydrate\'s water counts too.'],
    tasks:[
      {id:'q6', n:6, type:'calc', topic:'conv', gen:'particles', p:{s:'pb', m:'5.60', e:1}, story:'Radiation shielding needs an atom count for the lead plate.'},
      {id:'q7', n:7, type:'calc', topic:'mm', gen:'hydrate', p:{h:0}, story:'The fabricator wants copper(II) chloride dihydrate for a coolant line. It lists six atomic masses with no labels. Only some belong.'},
      {id:'q8', n:8, type:'calc', topic:'mm', gen:'pretend', p:{pi:0, a:'22.55', b:'2.10', x:'14.60'}, story:'A survey drone brought back an unknown crystal. The scanner can only give its structure.'}
    ]},
  { id:'rx', code:'Rx', name:'Reactor Core', topics:['bal','atoms'],
    intro:['The reactor only accepts balanced equations. It counts atoms, not moles.', 'You missed that distinction on the quiz, so watch the atom counter and the mole counter under each equation. Only one of them has to match.'],
    outro:['Reactor stable.', 'Atoms balance. Moles don\'t have to.'],
    tasks:[
      {id:'q12', n:12, type:'balance', topic:'bal', L:['Al','O2'], R:['Al2O3'], sol:[4,3,2], ask:'Al', story:'Coolant loop one.'},
      {id:'q13', n:13, type:'balance', topic:'bal', L:['Na','Cl2'], R:['NaCl'], sol:[2,1,2], ask:'NaCl', story:'Coolant loop two.'},
      {id:'q14', n:14, type:'balance', topic:'bal', L:['C3H8','O2'], R:['CO2','H2O'], sol:[1,5,3,4], ask:'O2', story:'The ignition chamber burns propane.'},
      {id:'q15', n:15, type:'tf', topic:'atoms', q:'True or false: In a balanced equation, the moles of reactants must equal the moles of products.', a:false, why:'Only atoms must match. 2H2 + O2 → 2H2O is balanced with 3 mol on the left and 2 mol on the right.', story:'The reactor\'s safety interlock asks you a question.'},
      {id:'q16', n:16, type:'tf', topic:'atoms', q:'True or false: In a balanced equation, each type of atom appears in equal numbers on both sides.', a:true, why:'That is what balancing means.', story:'Second interlock.'},
      {id:'q17', n:17, type:'nums', topic:'atoms', q:'In 2H2 + O2 → 2H2O, how many moles of reactants and how many moles of products are there?', a:[3,2], why:'2 + 1 = 3 mol on the left, 2 mol on the right. The atoms still match: 4 H and 2 O on each side.', story:'Final interlock.'}
    ]},
  { id:'sen', code:'Sn', name:'Sensor Array', topics:['cls'],
    intro:['The sensor array is picking up reactions in the debris field. Sort each one by type so I can filter the noise.'],
    outro:['Sensors clear.', 'Look for the clue: one product, one reactant, an element swapping in, a solid forming, or H^+ moving.'],
    tasks:[
      {id:'q18', n:18, type:'classify', topic:'cls', eq:'Zn + 2HCl → ZnCl2 + H2', a:'single', why:'Zn, an element, replaces H.'},
      {id:'q19', n:19, type:'classify', topic:'cls', eq:'H2SO4 + 2NaOH → Na2SO4 + 2H2O', a:'acid', why:'Acid + base → salt + water.'},
      {id:'q20', n:20, type:'classify', topic:'cls', eq:'2H2 + O2 → 2H2O', a:'comb', why:'Only one product.'},
      {id:'q21', n:21, type:'classify', topic:'cls', eq:'AgNO3(aq) + NaCl(aq) → AgCl(s) + NaNO3(aq)', a:'precip', why:'A solid forms (AgCl).'},
      {id:'q22', n:22, type:'classify', topic:'cls', eq:'CaCO3 → CaO + CO2', a:'decomp', why:'One reactant breaks apart.'}
    ]},
  { id:'h2o', code:'Wp', name:'Water Plant', topics:['net'],
    intro:['The water supply has silver, barium, and lead ions in it. We\'ll pull them out as solids.', 'Split each dissolved compound into ions. Cross out the ions that don\'t change. What\'s left is the reaction that actually cleans the water.'],
    outro:['Water is clean.', 'Split (aq), never split (s), cross out what appears on both sides.'],
    tasks:[
      {id:'q23', n:23, type:'net', topic:'net', L:[{c:1,f:'AgNO3',st:'aq',ions:[['Ag^+',1],['NO3^-',1]]},{c:1,f:'NaCl',st:'aq',ions:[['Na^+',1],['Cl^-',1]]}], R:[{c:1,f:'AgCl',st:'s'},{c:1,f:'NaNO3',st:'aq',ions:[['Na^+',1],['NO3^-',1]]}], net:'Ag^+ + Cl^- → AgCl(s)', spect:['Na^+','NO3^-'], story:'Silver filter.'},
      {id:'q24', n:24, type:'net', topic:'net', L:[{c:1,f:'BaCl2',st:'aq',ions:[['Ba^2+',1],['Cl^-',2]]},{c:1,f:'Na2SO4',st:'aq',ions:[['Na^+',2],['SO4^2-',1]]}], R:[{c:1,f:'BaSO4',st:'s'},{c:2,f:'NaCl',st:'aq',ions:[['Na^+',2],['Cl^-',2]]}], net:'Ba^2+ + SO4^2- → BaSO4(s)', spect:['Na^+','Cl^-'], story:'Barium filter.'},
      {id:'q25', n:25, type:'net', topic:'net', L:[{c:1,f:'Pb(NO3)2',st:'aq',ions:[['Pb^2+',1],['NO3^-',2]]},{c:2,f:'KI',st:'aq',ions:[['K^+',2],['I^-',2]]}], R:[{c:1,f:'PbI2',st:'s'},{c:2,f:'KNO3',st:'aq',ions:[['K^+',2],['NO3^-',2]]}], net:'Pb^2+ + 2I^- → PbI2(s)', spect:['K^+','NO3^-'], story:'Lead filter.'}
    ]},
  { id:'pow', code:'Pw', name:'Power Cells', topics:['redox'],
    intro:['Batteries move electrons from one substance to another.', 'Tell me which reactant gives electrons up and which one takes them, and I can wire the cells.'],
    outro:['Power restored.', 'OIL RIG: oxidation is loss, reduction is gain.'],
    tasks:[
      {id:'q26', n:26, type:'redox', topic:'redox', L:['Fe(s)','Cu^2+(aq)'], R:['Fe^2+(aq)','Cu(s)'], ox:0, red:1, why:'Fe goes 0 → 2+, so it loses electrons and is oxidized. Cu goes 2+ → 0, so Cu^2+ gains electrons and is reduced.', story:'Cell A: iron and copper.'},
      {id:'q27', n:27, type:'redox', topic:'redox', L:['2Al(s)','3Ni^2+(aq)'], R:['2Al^3+(aq)','3Ni(s)'], ox:0, red:1, why:'Al goes 0 → 3+ (loses electrons, oxidized). Ni goes 2+ → 0 (Ni^2+ gains electrons, reduced).', story:'Cell B: aluminum and nickel.'},
      {id:'q28', n:28, type:'choice', topic:'redox', q:'Is Cl2 → 2Cl^- an oxidation or a reduction?', opts:['Oxidation','Reduction'], a:1, why:'Cl goes 0 → 1−, so it gains an electron. Gain is reduction.', story:'The chlorine backup cell.'}
    ]},
  { id:'crg', code:'Cg', name:'Cargo Hold', topics:['name'],
    intro:['The oldest crates in the hold use the old naming system. Ferric, cuprous, that kind of thing.', 'I need translations before I can open them.'],
    outro:['Cargo sorted.', '-ous is the lower charge, -ic is the higher charge. The Roman numeral is the charge.'],
    tasks:[
      {id:'q32', n:32, type:'text', topic:'name', q:'What is the old-system name for Fe^3+?', fields:[{label:'Old-system name', accept:['ferric','ferricion']}], why:'Iron forms 2+ and 3+. -ic is the higher charge, so Fe^3+ is ferric.', story:'Crate one.'},
      {id:'q33', n:33, type:'text', topic:'name', q:'What are the old-system names for Cu^+ and Cu^2+?', fields:[{label:'Cu^+', accept:['cuprous','cuprousion']},{label:'Cu^2+', accept:['cupric','cupricion']}], why:'-ous is lower (Cu^+ is cuprous), -ic is higher (Cu^2+ is cupric).', story:'Crate two.'},
      {id:'q34', n:34, type:'text', topic:'name', q:'Write the formula and name for the compound made from Pb^4+ and C2H3O2^-.', fields:[{label:'Formula', cs:true, accept:['Pb(C2H3O2)4','Pb(CH3COO)4','Pb(CH3CO2)4']},{label:'Name (modern system)', accept:['lead(iv)acetate','leadivacetate','plumbicacetate'], disp:'lead(IV) acetate'}], why:'Four 1− acetates balance one 4+ lead: Pb(C2H3O2)4, lead(IV) acetate.', story:'The last crate lists only its ions.'}
    ]},
  { id:'eng', code:'En', name:'Engines', topics:['stoich'],
    intro:['Last system: the engines. Fuel burns by stoichiometry.', 'Grams in, grams out, and the moles step in the middle is not optional.'],
    outro:['Engines are hot.', 'One more thing before we leave.'],
    tasks:[
      {id:'q29', n:29, type:'calc', topic:'stoich', gen:'g2g', p:{rx:'h2o', a:'h2', b:'water', g:'8.00'}, story:'The fuel cell runs on hydrogen and makes drinking water.'},
      {id:'q30', n:30, type:'calc', topic:'stoich', gen:'g2g', p:{rx:'nh3', a:'n2', b:'nh3', g:'28.0'}, story:'Hydroponics needs ammonia fertilizer for the trip home.'},
      {id:'q31', n:31, type:'calc', topic:'stoich', gen:'g2g', p:{rx:'ch4', a:'ch4', b:'co2', g:'16.0'}, story:'The methane thrusters vent CO2. Life support needs to know how much.'},
      {id:'q3', n:3, type:'calc', topic:'stoich', gen:'limit', p:{r:'cacn', mA:'2.8400', eA:-3, mB:'6.90', eB:-3}, story:'The fuel-line drier makes calcium chloride. Two reactants, limited supply. One runs out first.'}
    ]},
  { id:'fin', code:'Br', name:'Bridge', topics:[], final:true,
    intro:['Bad news. The hull is breaking up. We have to jump now.', 'The jump drive charges on correct answers. I\'m sending every system through once more with new numbers, and twice for anything that gave you trouble.', 'Treat this like the real quiz: paper, calculator, no hints if you can help it.'],
    outro:[], tasks:[] }
];
const ORIG = MODS.flatMap(m => m.tasks);

/* ---------- Extra problems for reroutes, remix runs, and the final check ---------- */
const EXTRA = [
  {id:'au1', type:'numunit', topic:'amu', q:'What is the mass of one molecule of H2O?', v:18.02, unit:'amu', why:'One molecule → amu: 2(1.008) + 16.00 = 18.02 amu.'},
  {id:'au2', type:'numunit', topic:'amu', q:'What is the mass of one mole of N2?', v:28.02, unit:'g', why:'One mole → grams: 2(14.01) = 28.02 g.'},
  {id:'au3', type:'numunit', topic:'amu', q:'What is the mass of one molecule of NH3?', v:17.03, unit:'amu', why:'One molecule → amu: 14.01 + 3(1.008) = 17.03 amu.'},
  {id:'au4', type:'numunit', topic:'amu', q:'What is the mass of one mole of CO2?', v:44.01, unit:'g', why:'One mole → grams: 12.01 + 2(16.00) = 44.01 g.'},
  {id:'au5', type:'numunit', topic:'amu', q:'What is the mass of one atom of Fe?', v:55.85, unit:'amu', why:'One atom → amu: 55.85 amu.'},
  {id:'au6', type:'numunit', topic:'amu', q:'What is the mass of one mole of H2O?', v:18.02, unit:'g', why:'One mole → grams: 18.02 g.'},

  {id:'b-h2o', type:'balance', topic:'bal', L:['H2','O2'], R:['H2O'], sol:[2,1,2], ask:'H2O'},
  {id:'b-nh3', type:'balance', topic:'bal', L:['N2','H2'], R:['NH3'], sol:[1,3,2], ask:'H2'},
  {id:'b-fe', type:'balance', topic:'bal', L:['Fe','O2'], R:['Fe2O3'], sol:[4,3,2], ask:'O2'},
  {id:'b-kclo3', type:'balance', topic:'bal', L:['KClO3'], R:['KCl','O2'], sol:[2,2,3], ask:'O2'},
  {id:'b-c2h6', type:'balance', topic:'bal', L:['C2H6','O2'], R:['CO2','H2O'], sol:[2,7,4,6], ask:'O2'},
  {id:'b-mg', type:'balance', topic:'bal', L:['Mg','HCl'], R:['MgCl2','H2'], sol:[1,2,1,1], ask:'HCl'},
  {id:'b-ch4', type:'balance', topic:'bal', L:['CH4','O2'], R:['CO2','H2O'], sol:[1,2,1,2], ask:'H2O'},
  {id:'b-al', type:'balance', topic:'bal', L:['Al','HCl'], R:['AlCl3','H2'], sol:[2,6,2,3], ask:'H2'},

  {id:'t-mass', type:'tf', topic:'atoms', q:'True or false: In a balanced equation, the total mass of the reactants equals the total mass of the products.', a:true, why:'Atoms are conserved, so mass is conserved.'},
  {id:'t-molec', type:'tf', topic:'atoms', q:'True or false: A balanced equation must have the same number of molecules on each side.', a:false, why:'2H2 + O2 → 2H2O has 3 molecules on the left and 2 on the right.'},
  {id:'t-sub', type:'tf', topic:'atoms', q:'True or false: You can change a subscript to balance an equation.', a:false, why:'Changing a subscript makes a different substance. Only coefficients change.'},
  {id:'t-ratio', type:'tf', topic:'atoms', q:'True or false: The coefficients in a balanced equation give the mole ratio between substances.', a:true, why:'That is where the mole ratio in stoichiometry comes from.'},
  {id:'m-nh3', type:'nums', topic:'atoms', q:'In N2 + 3H2 → 2NH3, how many moles of reactants and how many moles of products are there?', a:[4,2], why:'1 + 3 = 4 mol on the left, 2 mol on the right.'},
  {id:'m-ch4', type:'nums', topic:'atoms', q:'In CH4 + 2O2 → CO2 + 2H2O, how many moles of reactants and how many moles of products are there?', a:[3,3], why:'1 + 2 = 3 left, 1 + 2 = 3 right. They match here by coincidence, not because of a rule.'},
  {id:'m-kclo3', type:'nums', topic:'atoms', q:'In 2KClO3 → 2KCl + 3O2, how many moles of reactants and how many moles of products are there?', a:[2,5], why:'2 on the left, 2 + 3 = 5 on the right.'},
  {id:'m-mg', type:'nums', topic:'atoms', q:'In 2Mg + O2 → 2MgO, how many moles of reactants and how many moles of products are there?', a:[3,2], why:'2 + 1 = 3 on the left, 2 on the right.'},

  {id:'c-na', type:'classify', topic:'cls', eq:'2Na + Cl2 → 2NaCl', a:'comb', why:'One product.'},
  {id:'c-kclo3', type:'classify', topic:'cls', eq:'2KClO3 → 2KCl + 3O2', a:'decomp', why:'One reactant breaks apart.'},
  {id:'c-cu', type:'classify', topic:'cls', eq:'Cu + 2AgNO3 → Cu(NO3)2 + 2Ag', a:'single', why:'Cu, an element, swaps in for Ag.'},
  {id:'c-hcl', type:'classify', topic:'cls', eq:'HCl + KOH → KCl + H2O', a:'acid', why:'Acid + base → salt + water.'},
  {id:'c-pb', type:'classify', topic:'cls', eq:'Pb(NO3)2(aq) + 2KI(aq) → PbI2(s) + 2KNO3(aq)', a:'precip', why:'A solid forms (PbI2).'},
  {id:'c-h2o', type:'classify', topic:'cls', eq:'2H2O → 2H2 + O2', a:'decomp', why:'One reactant breaks apart.'},
  {id:'c-mg', type:'classify', topic:'cls', eq:'Mg + 2HCl → MgCl2 + H2', a:'single', why:'Mg, an element, replaces H.'},
  {id:'c-cao', type:'classify', topic:'cls', eq:'CaO + H2O → Ca(OH)2', a:'comb', why:'One product.'},
  {id:'c-hno3', type:'classify', topic:'cls', eq:'HNO3 + NaOH → NaNO3 + H2O', a:'acid', why:'Acid + base → salt + water.'},
  {id:'c-ba', type:'classify', topic:'cls', eq:'BaCl2(aq) + Na2SO4(aq) → BaSO4(s) + 2NaCl(aq)', a:'precip', why:'A solid forms (BaSO4).'},

  {id:'n-ca', type:'net', topic:'net', L:[{c:1,f:'CaCl2',st:'aq',ions:[['Ca^2+',1],['Cl^-',2]]},{c:1,f:'Na2CO3',st:'aq',ions:[['Na^+',2],['CO3^2-',1]]}], R:[{c:1,f:'CaCO3',st:'s'},{c:2,f:'NaCl',st:'aq',ions:[['Na^+',2],['Cl^-',2]]}], net:'Ca^2+ + CO3^2- → CaCO3(s)', spect:['Na^+','Cl^-']},
  {id:'n-agbr', type:'net', topic:'net', L:[{c:1,f:'AgNO3',st:'aq',ions:[['Ag^+',1],['NO3^-',1]]},{c:1,f:'KBr',st:'aq',ions:[['K^+',1],['Br^-',1]]}], R:[{c:1,f:'AgBr',st:'s'},{c:1,f:'KNO3',st:'aq',ions:[['K^+',1],['NO3^-',1]]}], net:'Ag^+ + Br^- → AgBr(s)', spect:['K^+','NO3^-']},
  {id:'n-pbso4', type:'net', topic:'net', L:[{c:1,f:'Pb(NO3)2',st:'aq',ions:[['Pb^2+',1],['NO3^-',2]]},{c:1,f:'Na2SO4',st:'aq',ions:[['Na^+',2],['SO4^2-',1]]}], R:[{c:1,f:'PbSO4',st:'s'},{c:2,f:'NaNO3',st:'aq',ions:[['Na^+',2],['NO3^-',2]]}], net:'Pb^2+ + SO4^2- → PbSO4(s)', spect:['Na^+','NO3^-']},
  {id:'n-feoh', type:'net', topic:'net', L:[{c:1,f:'FeCl3',st:'aq',ions:[['Fe^3+',1],['Cl^-',3]]},{c:3,f:'NaOH',st:'aq',ions:[['Na^+',3],['OH^-',3]]}], R:[{c:1,f:'Fe(OH)3',st:'s'},{c:3,f:'NaCl',st:'aq',ions:[['Na^+',3],['Cl^-',3]]}], net:'Fe^3+ + 3OH^- → Fe(OH)3(s)', spect:['Na^+','Cl^-']},

  {id:'r-zn', type:'redox', topic:'redox', L:['Zn(s)','Cu^2+(aq)'], R:['Zn^2+(aq)','Cu(s)'], ox:0, red:1, why:'Zn goes 0 → 2+ (loses electrons, oxidized). Cu goes 2+ → 0 (Cu^2+ gains electrons, reduced).'},
  {id:'r-ag', type:'redox', topic:'redox', L:['Cu(s)','2Ag^+(aq)'], R:['Cu^2+(aq)','2Ag(s)'], ox:0, red:1, why:'Cu goes 0 → 2+ (oxidized). Ag goes 1+ → 0 (Ag^+ is reduced).'},
  {id:'r-mg', type:'redox', topic:'redox', L:['Fe^2+(aq)','Mg(s)'], R:['Fe(s)','Mg^2+(aq)'], ox:1, red:0, why:'Mg goes 0 → 2+ (loses electrons, oxidized). Fe goes 2+ → 0 (Fe^2+ gains electrons, reduced).'},
  {id:'r-cl', type:'redox', topic:'redox', L:['Cl2(g)','2Br^-(aq)'], R:['2Cl^-(aq)','Br2(l)'], ox:1, red:0, why:'Br goes 1− → 0, so Br^- loses electrons (oxidized). Cl goes 0 → 1−, so Cl2 gains them (reduced).'},
  {id:'h-na', type:'choice', topic:'redox', q:'Is Na → Na^+ + e^- an oxidation or a reduction?', opts:['Oxidation','Reduction'], a:0, why:'Na loses an electron. Loss is oxidation.'},
  {id:'h-fe', type:'choice', topic:'redox', q:'Is Fe^2+ → Fe^3+ + e^- an oxidation or a reduction?', opts:['Oxidation','Reduction'], a:0, why:'The charge goes up because an electron is lost. Loss is oxidation.'},
  {id:'h-o2', type:'choice', topic:'redox', q:'Is O2 + 4e^- → 2O^2- an oxidation or a reduction?', opts:['Oxidation','Reduction'], a:1, why:'O goes 0 → 2−. It gains electrons. Gain is reduction.'},
  {id:'h-cu', type:'choice', topic:'redox', q:'Is Cu^2+ + 2e^- → Cu an oxidation or a reduction?', opts:['Oxidation','Reduction'], a:1, why:'Cu goes 2+ → 0 by gaining electrons. Gain is reduction.'},

  {id:'x-fe2', type:'text', topic:'name', q:'What is the old-system name for Fe^2+?', fields:[{label:'Old-system name', accept:['ferrous','ferrousion']}], why:'-ous is the lower charge, so Fe^2+ is ferrous.'},
  {id:'x-sn', type:'text', topic:'name', q:'Tin forms Sn^2+ and Sn^4+. Give the old-system name for each.', fields:[{label:'Sn^2+', accept:['stannous','stannousion']},{label:'Sn^4+', accept:['stannic','stannicion']}], why:'Tin\'s Latin root is stann-. -ous is lower, -ic is higher.'},
  {id:'x-pb', type:'text', topic:'name', q:'Lead forms Pb^2+ and Pb^4+. Give the old-system name for each.', fields:[{label:'Pb^2+', accept:['plumbous','plumbousion']},{label:'Pb^4+', accept:['plumbic','plumbicion']}], why:'Lead\'s Latin root is plumb-. -ous is lower, -ic is higher.'},
  {id:'x-fes', type:'text', topic:'name', q:'Write the formula and name for the compound made from Fe^3+ and SO4^2-.', fields:[{label:'Formula', cs:true, accept:['Fe2(SO4)3']},{label:'Name (modern system)', accept:['iron(iii)sulfate','ironiiisulfate','ferricsulfate'], disp:'iron(III) sulfate'}], why:'2 Fe^3+ = 6+ and 3 SO4^2- = 6−: Fe2(SO4)3, iron(III) sulfate.'},
  {id:'x-cun', type:'text', topic:'name', q:'Write the formula and name for the compound made from Cu^2+ and NO3^-.', fields:[{label:'Formula', cs:true, accept:['Cu(NO3)2']},{label:'Name (modern system)', accept:['copper(ii)nitrate','copperiinitrate','cupricnitrate'], disp:'copper(II) nitrate'}], why:'Two 1− nitrates balance 2+: Cu(NO3)2, copper(II) nitrate.'},
  {id:'x-sno', type:'text', topic:'name', q:'Write the formula and name for the compound made from Sn^4+ and O^2-.', fields:[{label:'Formula', cs:true, accept:['SnO2']},{label:'Name (modern system)', accept:['tin(iv)oxide','tinivoxide','stannicoxide'], disp:'tin(IV) oxide'}], why:'Two 2− oxides balance 4+: SnO2, tin(IV) oxide.'},
  {id:'x-pbac', type:'text', topic:'name', q:'Write the formula and name for the compound made from Pb^2+ and C2H3O2^-.', fields:[{label:'Formula', cs:true, accept:['Pb(C2H3O2)2','Pb(CH3COO)2','Pb(CH3CO2)2']},{label:'Name (modern system)', accept:['lead(ii)acetate','leadiiacetate','plumbousacetate'], disp:'lead(II) acetate'}], why:'Two 1− acetates balance 2+: Pb(C2H3O2)2, lead(II) acetate.'},
  {id:'x-fecl', type:'text', topic:'name', q:'Write the formula and name for the compound made from Fe^2+ and Cl^-.', fields:[{label:'Formula', cs:true, accept:['FeCl2']},{label:'Name (modern system)', accept:['iron(ii)chloride','ironiichloride','ferrouschloride'], disp:'iron(II) chloride'}], why:'Two 1− chlorides balance 2+: FeCl2, iron(II) chloride.'}
];
const REROUTE = ['I rerouted that circuit. Same skill, new numbers. Work it on paper again.', 'Backup circuit. Same kind of problem, different values.', 'Let\'s run that one again with fresh values.'];
const FRESH = ['New reading coming in.', 'Another reading from the station log.', 'Fresh values from the sensors.'];

const baseId = id => String(id).split('~')[0];
function variantOf(t, reroute){
  let v;
  if (t.type === 'calc'){ v = { id:t.id, type:'calc', topic:t.topic, gen:t.gen, p: CALC[t.gen].rand(t.p) }; }
  else {
    const pool = ORIG.concat(EXTRA).filter(x => x.type === t.type && x.topic === t.topic && baseId(x.id) !== baseId(t.id));
    v = JSON.parse(JSON.stringify(pick(pool.length ? pool : [t])));
    delete v.n;
  }
  v.id = baseId(v.id) + '~' + Math.random().toString(36).slice(2, 7);
  v.reroute = !!reroute; v.depth = (t.depth || 0) + (reroute ? 1 : 0);
  v.story = pick(reroute ? REROUTE : FRESH);
  return v;
}

