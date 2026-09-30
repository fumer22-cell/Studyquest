
/* ========================================================================
   VALENCE SPIRE — Unit 2 practice test campaign
   ======================================================================== */

/* ---------- Extra calculation generators (given molar masses, any notation) ---------- */
const parseNum = s => { s = String(s); const m = s.match(/^([\d.]+)×10\^(-?\d+)$/); return m ? +m[1] * 10 ** +m[2] : +s; };
function randLike(x){
  if (x.includes('×')){ const [m, e] = x.split('×10^'); return sci(randMant(sfOf(m)), +e); }
  const sf = sfOf(x), d = decimals(x);
  for (let i = 0; i < 60; i++){ const v = (+x * (.35 + Math.random() * 1.6)).toFixed(d); if (sfOf(v) === sf && +v > 0 && v !== x) return v; }
  return x;
}
CALC.chain = {
  build(p){
    let v = parseNum(p.x); p.f.forEach(f => { v = v * parseNum(f[0]) / parseNum(f[2]); });
    const sf = sfOf(p.x.split('×')[0]);
    const a = {value:v, sf, unit:p.unit, anyForm:true};
    const notes = [...(p.notes || []), ...(!p.var && p.notes0 ? p.notes0 : []), roundLine(a, `${p.x.split('×')[0]} has ${sf}`)];
    return { q:(p.var && p.qv ? p.qv : p.q).replace('{x}', p.x), a,
      work:[...notes], notes,
      grids:[{cols:[[[p.x, p.u0], null], ...p.f.map(f => [[f[0], f[1]], [f[2], f[3]]])], res:[finV(a), p.ru], given:true}],
      setup:p.setup || 'Start with the given amount. Multiply by conversion factors so each unit cancels, ending in the unit you want.' };
  },
  rand(p){ return { ...p, x:randLike(p.x), var:true }; }
};
const FMASS = [
  {name:'H2O', parts:[['H','1.008',2],['O','15.999',1]]}, {name:'NH3', parts:[['N','14.007',1],['H','1.008',3]]},
  {name:'CH4', parts:[['C','12.010',1],['H','1.008',4]]}, {name:'N2', parts:[['N','14.007',2]]},
  {name:'SO2', parts:[['S','32.059',1],['O','15.999',2]]}, {name:'CO2', parts:[['C','12.010',1],['O','15.999',2]]},
  {name:'O2', parts:[['O','15.999',2]]}, {name:'NaCl', parts:[['Na','22.990',1],['Cl','35.453',1]]}
];
CALC.fmass = {
  build(p){
    const sum = p.parts.reduce((t, x) => t + (+x[1]) * x[2], 0), dp = Math.min(...p.parts.map(x => decimals(x[1]))), rs = sum.toFixed(dp);
    const a = {value:+rs, sf:sfOf(rs), unit:p.unit, anyForm:true};
    const work = [...p.parts.map(x => `${x[0]}: ${x[2]} × ${x[1]} = ${(+x[1] * x[2]).toFixed(decimals(x[1]))}`),
      `Add them: ${rs} ${p.unit === 'g' ? 'amu per molecule' : 'amu'}`,
      p.unit === 'g' ? `One mole is measured in grams with the same number: <b>${rs} g</b>` : `One formula unit is measured in amu: <b>${rs} amu</b>`];
    return { q:p.q, a, work, setup:'Add each atomic mass times how many of that atom are in the formula. amu for one particle, grams for one mole.' };
  },
  rand(p){
    const o = pick(FMASS.filter(f => f.name !== p.name)), list = o.parts.map(x => `${x[0]}, ${x[1]} amu`).join('; ');
    return { name:o.name, parts:o.parts, unit:p.unit, q:p.unit === 'g' ? `What is the mass of one mole of ${o.name}? [Atomic masses: ${list}]` : `What is the formula mass of ${o.name}? [Atomic masses: ${list}]` };
  }
};

/* ---------- Lewis structure renderer (inline SVG) ---------- */
function lewisSVG(L){
  const U = 46, xs = L.atoms.map(a => a.x || 0), ys = L.atoms.map(a => a.y || 0);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const bl = L.br ? 14 : 0, qw = L.br && L.q ? 24 : 0, padX = 28, padY = 26;
  const W = (maxx - minx) * U + padX * 2 + bl * 2 + qw, H = (maxy - miny) * U + padY * 2;
  const px = a => padX + bl + ((a.x || 0) - minx) * U, py = a => padY + ((a.y || 0) - miny) * U;
  const dot = (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="currentColor"/>`;
  const fq = q => String(q).replace('-', '−');
  let s = '';
  (L.bonds || []).forEach(([i, j, o]) => {
    const a = L.atoms[i], b = L.atoms[j]; let x1 = px(a), y1 = py(a), x2 = px(b), y2 = py(b);
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
    x1 += ux * 14; y1 += uy * 14; x2 -= ux * 14; y2 -= uy * 14;
    for (let k = 0; k < o; k++){ const off = (k - (o - 1) / 2) * 5; s += `<line x1="${(x1 - uy * off).toFixed(1)}" y1="${(y1 + ux * off).toFixed(1)}" x2="${(x2 - uy * off).toFixed(1)}" y2="${(y2 + ux * off).toFixed(1)}" stroke="currentColor" stroke-width="2"/>`; }
  });
  L.atoms.forEach(a => {
    const x = px(a), y = py(a);
    s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="21" font-weight="700" fill="currentColor">${a.s}</text>`;
    const sides = [[0, -17, 1, 0], [17, 0, 0, 1], [0, 17, 1, 0], [-17, 0, 0, 1]];
    (a.d || [0, 0, 0, 0]).forEach((n, i) => { const [ox, oy, sx, sy] = sides[i]; if (n === 1) s += dot(x + ox, y + oy); if (n === 2) s += dot(x + ox - sx * 4.5, y + oy - sy * 4.5) + dot(x + ox + sx * 4.5, y + oy + sy * 4.5); });
    if (a.q) s += `<text x="${x + 13}" y="${y - 12}" font-size="13" font-weight="700" fill="currentColor">${fq(a.q)}</text>`;
  });
  if (L.br){
    const xr = W - qw - 8;
    s += `<path d="M16 7 H9 V${H - 7} H16 M${xr - 7} 7 H${xr} V${H - 7} H${xr - 7}" fill="none" stroke="currentColor" stroke-width="2"/>`;
    if (L.q) s += `<text x="${xr + 4}" y="17" font-size="15" font-weight="700" fill="currentColor">${fq(L.q)}</text>`;
  }
  return `<svg class="lw" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${L.alt || 'Lewis structure'}">${s}</svg>`;
}
const optHTML = o => typeof o === 'string' ? F(o) : lewisSVG(o.lw);
const A1 = (s, d, q) => ({atoms:[{s, d, q}]});
const LW = {
  fA:{lw:{...A1('F', [2, 2, 2, 1]), alt:'F with 7 dots, no charge'}},
  fB:{lw:{...A1('F', [2, 2, 2, 2]), br:true, q:'-', alt:'F with 8 dots in brackets, 1− charge'}},
  fC:{lw:{...A1('F', [2, 2, 2, 2]), br:true, q:'+', alt:'F with 8 dots in brackets, 1+ charge'}},
  fD:{lw:{...A1('F', [2, 2, 1, 1]), br:true, q:'-', alt:'F with 6 dots in brackets, 1− charge'}},
  fE:{lw:{...A1('F', [2, 2, 2, 1]), br:true, q:'+', alt:'F with 7 dots in brackets, 1+ charge'}},
  na:{lw:{...A1('Na', [0, 0, 0, 0], '+'), alt:'Na+ with no dots'}},
  ca:{lw:{...A1('Ca', [0, 0, 0, 0], '2+'), alt:'Ca2+ with no dots'}},
  sn:{lw:{...A1('Sn', [0, 0, 0, 0], '4+'), alt:'Sn4+ with no dots'}},
  n3:{lw:{...A1('N', [2, 2, 2, 2]), br:true, q:'3-', alt:'N with 8 dots in brackets, 3− charge'}},
  iBad:{lw:{...A1('I', [2, 2, 1, 1]), br:true, q:'-', alt:'I with 6 dots in brackets, 1− charge'}},
  h2sNo:{lw:{atoms:[{s:'H', x:0}, {s:'S', x:1}, {s:'H', x:2}], bonds:[[0, 1, 1], [1, 2, 1]], alt:'H–S–H with no lone pairs'}},
  h2sOne:{lw:{atoms:[{s:'H', x:0}, {s:'S', x:1, d:[2, 0, 0, 0]}, {s:'H', x:2}], bonds:[[0, 1, 1], [1, 2, 1]], alt:'H–S–H with one lone pair on S'}},
  h2sOk:{lw:{atoms:[{s:'H', x:0}, {s:'S', x:1, d:[2, 0, 2, 0]}, {s:'H', x:2}], bonds:[[0, 1, 1], [1, 2, 1]], alt:'H–S–H with two lone pairs on S'}},
  h2sDbl:{lw:{atoms:[{s:'H', x:0}, {s:'S', x:1}, {s:'H', x:2}], bonds:[[0, 1, 2], [1, 2, 2]], alt:'H=S=H'}},
  o3A:{lw:{atoms:[{s:'O', x:0, d:[2, 0, 0, 2]}, {s:'O', x:1}, {s:'O', x:2, d:[2, 2, 0, 0]}], bonds:[[0, 1, 2], [1, 2, 2]], alt:'A: O=O=O'}, label:'A'},
  o3B:{lw:{atoms:[{s:'O', x:0, d:[2, 0, 2, 2]}, {s:'O', x:1, d:[2, 0, 2, 0]}, {s:'O', x:2, d:[2, 2, 2, 0]}], bonds:[[0, 1, 1], [1, 2, 1]], alt:'B: O–O–O, all single bonds'}, label:'B'},
  o3C:{lw:{atoms:[{s:'O', x:0, d:[2, 0, 2, 2], q:'-'}, {s:'O', x:1, d:[0, 0, 2, 0], q:'+'}, {s:'O', x:2, d:[2, 2, 0, 0]}], bonds:[[0, 1, 1], [1, 2, 2]], alt:'C: O–O=O with charges'}, label:'C'},
  o3D:{lw:{atoms:[{s:'O', x:0, d:[2, 0, 0, 2]}, {s:'O', x:1, d:[0, 0, 2, 0], q:'+'}, {s:'O', x:2, d:[2, 2, 2, 0], q:'-'}], bonds:[[0, 1, 2], [1, 2, 1]], alt:'D: O=O–O with charges'}, label:'D'},
  hco3:{lw:{atoms:[{s:'H', x:0, y:1}, {s:'O', x:1, y:1, d:[2, 0, 2, 0]}, {s:'C', x:2, y:1}, {s:'O', x:2, y:0, d:[0, 2, 0, 2]}, {s:'O', x:3, y:1, d:[2, 2, 2, 0]}],
    bonds:[[0, 1, 1], [1, 2, 1], [2, 3, 2], [2, 4, 1]], br:true, q:'-', alt:'Bicarbonate ion: H–O–C(=O)–O, in brackets with a 1− charge'}, label:'HCO3^-'}
};

/* ---------- Topics ---------- */
Object.assign(TOPICS, {
  lewis:{name:'Lewis symbols', rule:'The dots are valence electrons. For main-group atoms, valence electrons = the group\'s last digit (F in group 17 has 7). Anions gain dots and go in brackets with their charge ([F]^- has 8). Cations lose their valence dots.'},
  bond:{name:'Ionic vs. covalent bonding', rule:'Metal + nonmetal → electrons transferred → ionic. Nonmetal + nonmetal → electrons shared → covalent. Ionic solids are crystalline with high melting points; small covalent molecules melt and boil lower.'},
  octet:{name:'Lewis structures, octets & resonance', rule:'Total the valence electrons, connect atoms with single bonds, fill octets with lone pairs, then share more pairs if needed (2 shared e^- = single, 4 = double, 6 = triple). Exceptions: H (2), Be (4), B (6), and expanded octets on period 3+ atoms like P and S. Resonance = several valid structures; it makes a molecule more stable.'},
  polar:{name:'Electronegativity, polarity & shape', rule:'Electronegativity rises toward the top right (F is highest) and is lowest at the bottom left. Unequal sharing makes a polar bond; the shape decides if the molecule is polar (NH3 trigonal pyramidal: polar; CO2 linear: nonpolar). Tetrahedral angles are 109.5°. Like dissolves like.'},
  ionname:{name:'Naming ions & ionic compounds', rule:'Stock system: metal + Roman numeral charge (Fe^2+ = iron(II)). Old system: -ous lower, -ic higher (ferric = iron(III)). Polyatomic ions: NH4^+ ammonium, NO3^- nitrate, SO4^2- sulfate. Ionic formulas balance charge to zero: Fe^3+ + 3Br^- = FeBr3.'},
  molname:{name:'Molecular names & formulas', rule:'Nonmetal compounds use prefixes: mono-, di-, tri-, tetra-, penta-. N2O5 = dinitrogen pentoxide, P2O5 = diphosphorus pentoxide. Subscripts count atoms (C5H10O4). A coefficient counts molecules: 2O2 is two O2 molecules.'},
  mole2:{name:'Atomic mass, formula mass & the mole', rule:'One particle is measured in amu; one mole in grams, with the same number. Formula mass = sum of atomic masses. A mole of anything is 6.022×10^23 particles, but different substances have different molar masses.'},
  count2:{name:'Grams ↔ moles ↔ particles', rule:'grams → moles: divide by molar mass. moles → particles: multiply by 6.022×10^23. Set it up so every unit cancels except the one you want.'},
  eqn2:{name:'Chemical equations', rule:'Conservation of mass: atoms are never gained or lost, so equations must balance. States: (s), (l), (g), (aq). A Δ over the arrow means heat is added.'},
  rxn2:{name:'Reaction types (Unit 2)', rule:`<div class="tscroll"><table class="ctab"><tr><th>Type</th><th>Pattern</th></tr>
    <tr><td>Combination</td><td>A + B → AB</td></tr><tr><td>Decomposition</td><td>AB → A + B</td></tr>
    <tr><td>Single-replacement</td><td>A + BC → AC + B</td></tr><tr><td>Double-replacement</td><td>AB + CD → AD + CB</td></tr>
    <tr><td>Precipitation</td><td>two (aq) → a (s)</td></tr><tr><td>Acid-base</td><td>acid + base → salt + water</td></tr>
    <tr><td>Oxidation-reduction</td><td>electrons move; charges change</td></tr></table></div>`}
});
const CLASSES2 = [['comb','Combination'],['decomp','Decomposition'],['single','Single-replacement'],['double','Double-replacement'],['precip','Precipitation'],['acid','Acid-base'],['redox','Oxidation-reduction']];

/* ---------- The practice test, as tower trials ---------- */
const MC = (n, q, opts, a, why, x = {}) => ({id:'v' + n, n, type:'mc', q, opts, a, why, ...x});
const TF2 = (n, q, a, why, x = {}) => ({id:'v' + n, n, type:'tf', q:'True or false: ' + q, a, why, ...x});
const TX = (n, q, fields, why, x = {}) => ({id:'v' + n, n, type:'text', q, fields, why, ...x});
const NV = (n, q, v, unit, why, x = {}) => ({id:'v' + n, n, type:'numval', q, v, unit, why, ...x});
const CHN = (n, p, x = {}) => ({id:'v' + n, n, type:'calc', gen:'chain', p, ...x});
const FMS = (n, p, x = {}) => ({id:'v' + n, n, type:'calc', gen:'fmass', p, ...x});
const CL2 = (n, eq, a, why, alt) => ({id:'v' + n, n, type:'classify', cls:2, topic:'rxn2', eq, a, why, alt});
const AV = '6.022×10^23';

const TOWER_MODS = [
  { id:'gate', code:'Gh', name:'Gatehouse', topics:['lewis'],
    intro:['The Gatehouse. The runes on this gate are Lewis symbols.', 'Dots are valence electrons. Ions gain or lose dots, and anions wear brackets with their charge.'],
    outro:['The gate is open.', 'Count valence electrons from the group number. Anions: add dots and bracket them.'],
    flav:['A rune flickers on the gate.', 'Another rune glows.', 'The portcullis groans.'],
    tasks:[
      MC(1, 'What do the dots in a Lewis symbol represent?', ['protons in the nucleus', 'valence electrons', 'all of the atom\'s electrons', 'neutrons', 'the number of bonds the atom forms'], 1, 'Lewis symbols show only valence electrons, the outer electrons used in bonding.'),
      MC(2, 'What is the Lewis symbol of the fluoride ion?', [LW.fA, LW.fB, LW.fC, LW.fD, LW.fE], 1, 'F has 7 valence electrons. Fluoride gains one: 8 dots, in brackets, with a 1− charge.'),
      NV(18, 'How many dots are present in the Lewis symbol for the fluorine atom?', 7, 'dots', 'Fluorine is in group 17, so it has 7 valence electrons: 7 dots.'),
      MC(23, 'Which Lewis symbol for an ion is incorrect?', [LW.na, LW.ca, LW.sn, LW.n3, LW.iBad], 4, 'Iodide should show 8 dots (iodine\'s 7 plus the 1 it gained). This one shows only 6. The cations lost their valence electrons, so no dots is right, and nitride correctly shows 8.')
    ]},
  { id:'lib', code:'Lb', name:'Library', topics:['bond'],
    intro:['The Library. The books are shelved by how their atoms hold together.', 'Transferred electrons make ionic bonds. Shared electrons make covalent bonds.'],
    outro:['The shelves are back in order.', 'Metal + nonmetal: ionic. Nonmetal + nonmetal: covalent.'],
    flav:['A book flutters off the shelf.', 'The next tome opens itself.', 'Dust swirls off a spine.'],
    tasks:[
      MC(3, 'What are the two principal classes of bonding called?', ['metallic bonding and hydrogen bonding', 'single bonding and double bonding', 'ionic bonding and covalent bonding', 'polar bonding and nonpolar bonding', 'dipole bonding and dispersion bonding'], 2, 'Electrons are either transferred (ionic) or shared (covalent).'),
      MC(4, 'Which combination of atoms is most likely to form an ionic compound if they are allowed to react with each other?', ['metal and metal', 'metal and nonmetal', 'nonmetal and nonmetal', 'metalloid and metalloid', 'All combinations are likely to form an ionic compound.'], 1, 'Metals give up electrons and nonmetals take them. That transfer makes ions.'),
      MC(5, 'Which statement about compounds is FALSE?', ['Compounds consist of atoms of two or more different elements that are chemically bonded together.', 'The elements in a compound cannot be separated or recovered by a physical process.', 'Ionic compounds are composed of cations and anions.', 'Covalent compounds are composed of metals and nonmetals.', 'Intermolecular forces are attractive forces between molecules of a compound and are responsible for the compound\'s physical properties.'], 3, 'Covalent compounds are made of nonmetals sharing electrons. Metal + nonmetal compounds are ionic.'),
      MC(6, 'A covalent bond involves which of the following?', ['sharing of electrons between two atoms', 'transfer of electrons between two atoms', 'donation of protons from one atom to another', 'electrostatic attraction between opposite charges', 'sharing of protons between two atoms'], 0, 'Covalent means shared electrons. Transfer and attraction between opposite charges describe ionic bonding.'),
      MC(7, 'Which statement about chemical bonds is FALSE?', ['The sharing of electrons between two nonmetals results in a covalent bond.', 'The attraction between oppositely charged ions results in an ionic bond.', 'The electrons in covalent bonds may be shared equally or unequally between the atoms.', 'A bond dipole is the separation of charge that results when atoms sharing electrons have different electronegativity values.', 'A nonpolar covalent bond is one in which electrons are not shared equally between the atoms.'], 4, 'In a NONpolar covalent bond the electrons are shared equally. Unequal sharing makes a polar bond.'),
      MC(25, 'What kind of bond results when electron transfer occurs between atoms of two different elements?', ['nonpolar covalent', 'polar covalent', 'ionic', 'metallic', 'hydrogen bond'], 2, 'Transfer makes a cation and an anion that attract each other: an ionic bond.'),
      MC(27, 'Assuming reactions between the following pairs of elements, which pair is most likely to form a covalent compound?', ['lithium and iodine', 'sodium and oxygen', 'calcium and chlorine', 'copper and tin', 'carbon and oxygen'], 4, 'Carbon and oxygen are both nonmetals, so they share electrons. The others are metal + nonmetal (ionic) or metal + metal.'),
      TF2(35, 'Ionic solids are amorphous.', false, 'Ionic solids are crystalline: the ions sit in an ordered, repeating lattice.'),
      TF2(36, 'Molecular compounds usually involve ionic bonding.', false, 'Molecular compounds are held together by covalent bonds.'),
      TF2(37, 'As a rule, ionic compounds tend to have lower melting and boiling points than covalent compounds consisting of small molecules.', false, 'It\'s the reverse. Ionic lattices are held by strong attractions, so they melt and boil at high temperatures.')
    ]},
  { id:'lab', code:'Al', name:'Alchemy Lab', topics:['octet'],
    intro:['The Alchemy Lab. Every flask holds a molecule that needs a proper Lewis structure.', 'Count the electrons first. Then check octets, exceptions, and resonance.'],
    outro:['The flasks are bubbling again.', 'Total the valence electrons before you draw anything. That count catches most mistakes.'],
    flav:['A flask fizzes.', 'The alembic drips.', 'Something green bubbles over.'],
    tasks:[
      MC(15, 'What is the Lewis structure of hydrogen sulfide, H2S?', [LW.h2sNo, LW.h2sOne, LW.h2sOk, LW.h2sDbl], 2, 'S has 6 valence electrons and each H has 1: 8 total. Two S–H bonds use 4; the other 4 sit on S as two lone pairs. H never gets lone pairs.'),
      MC(16, 'Which of the following Lewis structures represent resonance forms of ozone, O3?', ['A and B', 'B and C', 'C and D', 'A and D', 'All four'], 2, 'O3 has 18 valence electrons. C and D each have 18 with every O at an octet, and they differ only in where the double bond is. A has only 16 electrons and B has 20.', {fig:[LW.o3A, LW.o3B, LW.o3C, LW.o3D]}),
      NV(21, 'How many bonding electrons are present in the Lewis structure for the bicarbonate ion, shown below?', 10, 'bonding electrons', 'Count shared electrons only: H–O (2) + O–C (2) + C=O (4) + C–O (2) = 10. Lone pairs are not bonding electrons.', {fig:[LW.hco3]}),
      MC(32, 'Which compound contains a central atom with an exception to the octet rule known as an expanded octet?', ['BeH2', 'NO', 'PF5', 'CH4', 'BF3'], 2, 'P in PF5 has 5 bonds, so 10 electrons surround it. Period 3 atoms can expand. BeH2 and BF3 have too FEW electrons, and NO has an odd number.'),
      TF2(38, 'In the molecule BeF2, the beryllium atom is an exception to the octet rule.', true, 'Be forms two bonds and has only 4 electrons around it.'),
      TF2(39, 'Six electrons shared between two atoms corresponds to a triple bond.', true, 'Each bond is a shared pair: 2 = single, 4 = double, 6 = triple.'),
      TF2(40, 'Resonance occurs when two or more different, valid Lewis structures can be drawn for a molecule.', true, 'That is the definition. The real molecule is a blend of them.'),
      TF2(41, 'The existence of resonance makes a molecule less stable than would otherwise be the case.', false, 'Resonance spreads the electrons out, which makes the molecule MORE stable.')
    ]},
  { id:'obs', code:'Ob', name:'Observatory', topics:['polar'],
    intro:['The Observatory. These star charts map electronegativity and molecular shape.', 'Electronegativity climbs toward fluorine at the top right. Shape decides whether a molecule is polar.'],
    outro:['The telescope is aligned.', 'Polar bonds in a symmetric shape cancel out. In a lopsided shape they don\'t.'],
    flav:['A star chart unrolls.', 'The telescope swivels.', 'A comet streaks past the dome.'],
    tasks:[
      MC(8, 'In what region on the periodic table are elements with the lowest electronegativity values found?', ['top right corner', 'top left corner', 'bottom left corner', 'bottom right corner', 'the middle (transition metals)'], 2, 'Electronegativity increases up and to the right, so the lowest values (Cs, Fr) are at the bottom left.'),
      MC(24, 'Which element has the greatest electronegativity?', ['H', 'Cl', 'O', 'F', 'Na'], 3, 'Fluorine is the most electronegative element of all.'),
      MC(17, 'What statement about the ammonia molecule, NH3, is FALSE?', ['The molecule contains three polar bonds.', 'The molecule itself is not polar.', 'The molecule has a trigonal pyramidal shape.', 'The nitrogen atom has one nonbonding pair of electrons.', 'The pull of the electrons in the N–H bonds is toward the nitrogen atom.'], 1, 'NH3 is trigonal pyramidal, so its three polar bonds don\'t cancel. The molecule IS polar.'),
      MC(22, 'If the shape of a molecule is tetrahedral, what are the values of the bond angles?', ['90°', '109.5°', '120°', '180°', '90° and 120°'], 1, 'Four electron groups spread as far apart as possible: 109.5°.'),
      MC(33, 'What is the molecular geometry of CO2?', ['bent', 'trigonal planar', 'linear', 'tetrahedral', 'trigonal pyramidal'], 2, 'C has two double bonds and no lone pairs: two electron groups at 180°, so it is linear.'),
      MC(29, 'What term describes a solution of a compound in water that does not conduct an electric current?', ['a strong electrolyte solution', 'a weak electrolyte solution', 'a nonelectrolyte solution', 'an ionic solution', 'a saturated solution'], 2, 'No ions in solution means no current: a nonelectrolyte.'),
      TF2(42, 'The hydrogen bonds between water and ammonia in a solution are intermolecular forces.', true, 'Hydrogen bonds form BETWEEN molecules, so they are intermolecular.'),
      TF2(43, 'As a rule, a polar substance will be a good solvent for nonpolar solutes, and vice versa.', false, 'Like dissolves like: polar dissolves polar, nonpolar dissolves nonpolar.')
    ]},
  { id:'scr', code:'Sc', name:'Scriptorium', topics:['ionname'],
    intro:['The Scriptorium. These scrolls name ions and ionic compounds.', 'Roman numerals give metal charges. Memorize the polyatomic ions.'],
    outro:['The scrolls are rewritten.', 'Charges always add up to zero in an ionic formula.'],
    flav:['A quill scratches by itself.', 'A fresh scroll unrolls.', 'Ink pools on the page.'],
    tasks:[
      TX(9, 'What is the name of Fe^2+ in the Stock system?', [{label:'Stock name', accept:['iron(ii)', 'iron(ii)ion'], disp:'iron(II) ion'}], 'Stock system: metal name + charge in Roman numerals. Fe^2+ is iron(II).'),
      TX(11, 'What is the name of the ion NH4^+?', [{label:'Name', accept:['ammonium', 'ammoniumion'], disp:'ammonium'}], 'NH4^+ is ammonium, one of the few polyatomic cations.'),
      TX(20, 'What is the name of the ion whose formula is NO3^-?', [{label:'Name', accept:['nitrate', 'nitrateion'], disp:'nitrate ion'}], 'NO3^- is nitrate. (NO2^- is nitrite.)'),
      MC(19, 'What is the formula of the sulfate ion?', ['SO3^2-', 'SO4^2-', 'SO4^-', 'S2O4^2-', 'SO4^3-'], 1, 'Sulfate is SO4^2-. (SO3^2- is sulfite.)'),
      TX(26, 'What is the Stock name of Cu^+?', [{label:'Stock name', accept:['copper(i)', 'copper(i)ion'], disp:'copper(I) ion'}], 'Copper forms 1+ and 2+. Cu^+ is copper(I).'),
      TX(30, 'What is the formula of iron(III) bromide?', [{label:'Formula', cs:true, accept:['FeBr3'], disp:'FeBr3'}], 'Fe^3+ needs three Br^- to balance its charge: FeBr3.'),
      MC(12, 'Emergency treatment of cardiac arrest victims sometimes involves injection of a calcium chloride (CaCl2) solution directly into the heart muscle. Which statement about the compound CaCl2 is FALSE?', ['This compound is an ionic compound.', 'The cation in this compound is Ca^2+.', 'The anion in this compound is Cl2^-.', 'There are two chloride ions in this compound.', 'The net charge on this compound is zero.'], 2, 'The anion is Cl^-, and there are two of them. There is no Cl2^- ion.'),
      TF2(34, 'The common name of iron(III) chloride is ferric chloride.', true, '-ic is the higher charge, so Fe^3+ is ferric.')
    ]},
  { id:'apo', code:'Ap', name:'Apothecary', topics:['molname'],
    intro:['The Apothecary. Every jar of molecular compound lost its label.', 'Nonmetal compounds use prefixes: di-, tri-, tetra-, penta-.'],
    outro:['Every jar is labeled.', 'Prefixes for molecular compounds, charges for ionic ones.'],
    flav:['A jar rattles on the shelf.', 'Dried herbs sway overhead.', 'A stopper pops.'],
    tasks:[
      TX(10, 'A molecule of deoxyribose, an essential part of DNA, contains five carbon atoms, ten hydrogen atoms, and four oxygen atoms. How would the formula of deoxyribose be represented?', [{label:'Formula', cs:true, accept:['C5H10O4'], disp:'C5H10O4'}], 'Write each element with its count as a subscript: C5H10O4.'),
      TX(13, 'What is the formula of the compound sulfur trioxide?', [{label:'Formula', cs:true, accept:['SO3'], disp:'SO3'}], 'Tri- means 3 oxygens; no prefix on sulfur means 1: SO3.'),
      TX(14, 'Which formula represents ammonia?', [{label:'Formula', cs:true, accept:['NH3'], disp:'NH3'}], 'Ammonia is NH3. (NH4^+ is the ammonium ion.)'),
      TX(28, 'What is the correct formula of diphosphorus pentoxide?', [{label:'Formula', cs:true, accept:['P2O5'], disp:'P2O5'}], 'Di- = 2 P, penta- = 5 O: P2O5.'),
      TX(31, 'What is the proper name for N2O5?', [{label:'Name', accept:['dinitrogenpentoxide', 'dinitrogenpentaoxide'], disp:'dinitrogen pentoxide'}], '2 N = di-, 5 O = penta-: dinitrogen pentoxide.'),
      MC(44, 'What notation properly indicates how two molecules of diatomic oxygen would be represented in a chemical equation?', ['O4', '2O', '2O2', 'O2 2', 'O2O2'], 2, 'Oxygen is diatomic (O2). A coefficient in front counts molecules: 2O2.')
    ]},
  { id:'vault', code:'Vt', name:'Vault', topics:['mole2'],
    intro:['The Vault. Everything in here is weighed in amu or grams.', 'One particle: amu. One mole: grams. Same number.'],
    outro:['The scales balance.', 'Formula mass in amu, molar mass in grams per mole.'],
    flav:['The scale tips.', 'Coins clink in a chest.', 'A weight settles into the pan.'],
    tasks:[
      MC(45, 'Which has the greatest mass: one atom of carbon, one atom of hydrogen, or one atom of lithium?', ['one atom of hydrogen', 'one atom of lithium', 'one atom of carbon', 'they all have the same mass'], 2, 'Compare atomic masses: C 12.01, Li 6.94, H 1.008 amu.'),
      FMS(46, {q:'The mass of one atom of oxygen is 15.999 amu. What is the mass of one mole of elemental oxygen (O2)?', name:'O2', parts:[['O', '15.999', 2]], unit:'g'}),
      MC(47, 'Beaker A contains 1 mole of iron atoms, and Beaker B contains 1 mole of lead atoms. Which statement concerning these samples is known with certainty?', ['Beakers A and B contain an equal number of atoms.', 'Beakers A and B contain equal masses of atoms.', 'Beakers A and B contain an equal volume of atoms.', 'Beakers A and B contain samples with the same density.', 'None of these are correct.'], 0, 'A mole is a count: both hold 6.022×10^23 atoms. Their masses differ because Pb atoms are much heavier than Fe atoms.'),
      FMS(56, {q:'What is the mass of one mole of carbon atoms? [Atomic mass: C, 12.010 amu]', name:'C', parts:[['C', '12.010', 1]], unit:'g'}),
      FMS(59, {q:'What is the formula mass of carbon dioxide? [Atomic masses: C, 12.010 amu; O, 15.999 amu]', name:'CO2', parts:[['C', '12.010', 1], ['O', '15.999', 2]], unit:'amu'}),
      TF2(77, 'One atomic mass unit is the same as one gram.', false, 'An amu is tiny: 1 g is 6.022×10^23 amu.'),
      TF2(78, 'The formula mass of water is 18.014 g.', false, 'Formula mass is measured in amu, not grams. The number in grams is the mass of one mole.'),
      TF2(79, 'If the atomic mass of hydrogen is 1.008 amu, a mole of H2 will weigh 1.008 g.', false, 'H2 has two atoms, so a mole of H2 weighs 2.016 g.'),
      TF2(80, 'One mole of H2O contains a total of 6.022 × 10^23 atoms.', false, 'It contains 6.022×10^23 molecules, and each has 3 atoms: 1.807×10^24 atoms.')
    ]},
  { id:'mine', code:'Mn', name:'Crystal Mine', topics:['count2'],
    intro:['The Crystal Mine. The crystals are counted atom by atom.', 'Grams to moles to particles. Set it up so the units cancel.'],
    outro:['The crystals glow again.', 'Divide by molar mass to get moles. Multiply by 6.022×10^23 to count particles.'],
    flav:['A crystal hums.', 'The minecart rattles closer.', 'A vein of ore sparkles.'],
    tasks:[
      CHN(53, {q:'Diamond is a pure form of the element carbon. If a 2 carat diamond has a mass of {x} g, how many carbon atoms are contained in this diamond?', qv:'Diamond is pure carbon. A diamond has a mass of {x} g. How many carbon atoms does it contain?', x:'0.396', u0:'g C', f:[['1', 'mol C', '12.010', 'g C'], [AV, 'atoms C', '1', 'mol C']], ru:'atoms C', unit:'atoms'}),
      CHN(54, {q:'Dinitrogen monoxide, or laughing gas (N2O), is used as a dental anesthetic and as an aerosol propellant. How many molecules of N2O are present in a {x} g sample of the compound?', qv:'How many molecules of N2O are present in a {x} g sample?', x:'12.6', u0:'g N2O', f:[['1', 'mol N2O', '44.01', 'g N2O'], [AV, 'molecules N2O', '1', 'mol N2O']], ru:'molecules N2O', unit:'molecules', notes:['Molar mass of N2O = 2(14.01) + 16.00 = 44.01 g/mol']}),
      CHN(57, {q:'How many atoms of sulfur are present in a {x} g sample of sulfur? [Molar mass: S, 32.059 g/mol]', x:'155', u0:'g S', f:[['1', 'mol S', '32.059', 'g S'], [AV, 'atoms S', '1', 'mol S']], ru:'atoms S', unit:'atoms'}),
      CHN(58, {q:'How many iron atoms are present in {x} mol of iron?', x:'0.552', u0:'mol Fe', f:[[AV, 'atoms Fe', '1', 'mol Fe']], ru:'atoms Fe', unit:'atoms'}),
      CHN(60, {q:'What is the mass of a {x} mol sample of nicotine? [Formula mass: nicotine, 162.221 amu]', x:'0.0200', u0:'mol nicotine', f:[['162.221', 'g nicotine', '1', 'mol nicotine']], ru:'g nicotine', unit:'g', notes:['A formula mass of 162.221 amu means a molar mass of 162.221 g/mol.']}),
      CHN(61, {q:'How many molecules are present in a {x} mol sample of nicotine?', x:'0.0200', u0:'mol nicotine', f:[[AV, 'molecules nicotine', '1', 'mol nicotine']], ru:'molecules nicotine', unit:'molecules'}),
      CHN(62, {q:'How many aspirin molecules are present in a {x} g sample of aspirin? [Molar mass: aspirin, 180.148 g/mol]', x:'0.325', u0:'g aspirin', f:[['1', 'mol aspirin', '180.148', 'g aspirin'], [AV, 'molecules aspirin', '1', 'mol aspirin']], ru:'molecules aspirin', unit:'molecules'}),
      CHN(75, {q:'What is the mass of {x} moles of aluminum?', x:'4.35', u0:'mol Al', f:[['26.98', 'g Al', '1', 'mol Al']], ru:'g Al', unit:'g', notes:['Molar mass of Al = 26.98 g/mol (data sheet)']}),
      CHN(76, {q:'Calculate the number of moles of BaF2 in a {x} g sample of BaF2.', x:'10.0', u0:'g BaF2', f:[['1', 'mol BaF2', '175.33', 'g BaF2']], ru:'mol BaF2', unit:'mol', notes:['Molar mass of BaF2 = 137.33 + 2(19.00) = 175.33 g/mol']})
    ]},
  { id:'forge', code:'Fg', name:'Forge', topics:['bal', 'stoich', 'eqn2'],
    intro:['The Forge. Balance the equations and the metal flows.', 'Balance first. Then use the coefficients as mole ratios.'],
    outro:['The forge is roaring.', 'Coefficients are mole ratios. Whichever reactant makes less product runs out first.'],
    flav:['The bellows wheeze.', 'Sparks leap off the anvil.', 'Molten metal glows in the crucible.'],
    tasks:[
      {id:'v50', n:50, type:'balance', topic:'bal', L:['Na', 'F2'], R:['NaF'], sol:[2, 1, 2], ask:null, q:'The fluoride rinse in dental offices usually contains sodium fluoride, which can be prepared from sodium metal and fluorine gas. What is the balanced chemical equation for this reaction?'},
      {id:'v63', n:63, type:'balance', topic:'bal', L:['Fe', 'O2'], R:['Fe2O3'], sol:[4, 3, 2], ask:'Fe', q:'The chemical equation below is not balanced. What is the coefficient of iron when it is balanced with smallest whole number coefficients?'},
      {id:'v64', n:64, type:'balance', topic:'bal', L:['C6H14', 'O2'], R:['CO2', 'H2O'], sol:[2, 19, 12, 14], ask:null, q:'What is the correctly balanced form of the following equation?'},
      NV(48, 'How many moles of oxygen gas are needed to react with hydrogen to form one mole of water? 2H2(g) + O2(g) → 2H2O(l)', .5, 'mol O2', 'The ratio is 1 O2 : 2 H2O. For 1 mol H2O: 1 × (1/2) = 0.5 mol O2.', {topic:'stoich'}),
      NV(65, 'How many moles of hydrogen gas are needed to react with oxygen to form one mole of water? 2H2(g) + O2(g) → 2H2O(l)', 1, 'mol H2', 'The ratio is 2 H2 : 2 H2O, which is 1:1. So 1 mol H2.', {topic:'stoich'}),
      NV(66, 'Consider the hypothetical reaction 3A2 + 2B → C + 2D. If 6.0 moles of A2 are mixed with 2.0 moles of B, what is the maximum amount of C that can be formed?', 1, 'mol C', 'From A2: 6.0 × (1/3) = 2.0 mol C. From B: 2.0 × (1/2) = 1.0 mol C. B runs out first, so the maximum is 1.0 mol C.', {topic:'stoich'}),
      CHN(49, {q:'Glucose (C6H12O6) is produced by photosynthesis: 6CO2(g) + 6H2O(l) → C6H12O6 + 6O2(g). What mass of glucose can be produced from {x} mol of CO2 and the necessary water? [Molar masses: C, 12.010 g/mol; H, 1.008 g/mol; O, 15.999 g/mol]', x:'2.61', u0:'mol CO2', f:[['1', 'mol C6H12O6', '6', 'mol CO2'], ['180.15', 'g C6H12O6', '1', 'mol C6H12O6']], ru:'g C6H12O6', unit:'g',
        notes:['Molar mass of C6H12O6 = 6(12.010) + 12(1.008) + 6(15.999) = 180.15 g/mol', 'Mole ratio from the equation: 1 C6H12O6 : 6 CO2']}, {topic:'stoich'}),
      CHN(55, {q:'What mass of sodium hydroxide is needed to react with a solution containing {x} g HCl? NaOH(aq) + HCl(aq) → NaCl(aq) + H2O(l) [Molar masses: NaOH, 39.99 g/mol; HCl, 36.454 g/mol]', x:'73.00', u0:'g HCl', f:[['1', 'mol HCl', '36.454', 'g HCl'], ['1', 'mol NaOH', '1', 'mol HCl'], ['39.99', 'g NaOH', '1', 'mol NaOH']], ru:'g NaOH', unit:'g',
        notes0:['The test key lists 80.09 g. This setup gives 80.08 g; both are accepted (the last digit is rounding).']}, {topic:'stoich'}),
      TF2(81, 'The law of conservation of mass states that matter cannot be gained or lost during a chemical reaction.', true, 'Atoms are rearranged, never created or destroyed. That is why equations must balance.', {topic:'eqn2'}),
      TF2(82, 'The symbol Δ, above or below the reaction arrow in an equation, indicates that heating is needed for the reaction to take place.', true, 'Δ over the arrow means heat is supplied.', {topic:'eqn2'})
    ]},
  { id:'circ', code:'Sm', name:'Summoning Circle', topics:['rxn2', 'net'],
    intro:['The Summoning Circle. Every reaction you name correctly steadies it.', 'Look at the pattern: what combines, what breaks apart, what swaps, what forms a solid, where electrons move.'],
    outro:['The circle holds.', 'Some reactions fit two types. Precipitations are double-replacements too, and single-replacements are also redox.'],
    flav:['The runes pulse.', 'A shape stirs in the circle.', 'Candles flare around the ring.'],
    tasks:[
      CL2(51, 'Ca(s) + 2HCl(aq) → CaCl2(aq) + H2(g)', 'single', 'Ca, an element, replaces H in HCl. Single-replacements are also redox.', ['redox']),
      CL2(52, '2HgO(s) → 2Hg(l) + O2(g)', 'decomp', 'One reactant breaks into simpler substances.'),
      CL2(67, 'H2SO4(aq) + 2KOH(aq) → K2SO4(aq) + 2H2O(l)', 'acid', 'Acid (H2SO4) + base (KOH) → salt + water.', ['double']),
      CL2(69, '2KClO3(s) → 2KCl(s) + 3O2(g)', 'decomp', 'One reactant breaks apart.'),
      CL2(70, 'Na2SO4(aq) + Ba(OH)2(aq) → BaSO4(s) + 2NaOH(aq)', 'double', 'The cations swap partners (AB + CD → AD + CB). A solid also forms, so precipitation fits too; the test key says double-replacement.', ['precip']),
      CL2(71, '2Fe^3+(aq) + Fe(s) → 3Fe^2+(aq)', 'redox', 'Fe goes 0 → 2+ (oxidized) and Fe^3+ goes 3+ → 2+ (reduced). Electrons move, so it is oxidation-reduction.'),
      CL2(72, 'Pb(NO3)2(aq) + CaI2(aq) → PbI2(s) + Ca(NO3)2(aq)', 'precip', 'Two (aq) solutions form a solid (PbI2): precipitation. It is also a double-replacement; the test key says precipitation.', ['double']),
      CL2(73, 'MgO(s) + CO2(g) → MgCO3(s)', 'comb', 'Two reactants form one product.'),
      CL2(74, 'BaCl2(aq) + K2SO4(aq) → BaSO4(s) + 2KCl(aq)', 'double', 'The cations swap partners. A solid (BaSO4) also forms, so precipitation fits too; the test key says double-replacement.', ['precip']),
      {id:'v68', n:68, type:'net', topic:'net', pre:'When solutions of sodium sulfide and copper(II) sulfate are mixed, a precipitate of copper(II) sulfide forms.',
        L:[{c:1, f:'Na2S', st:'aq', ions:[['Na^+', 2], ['S^2-', 1]]}, {c:1, f:'CuSO4', st:'aq', ions:[['Cu^2+', 1], ['SO4^2-', 1]]}],
        R:[{c:1, f:'CuS', st:'s'}, {c:1, f:'Na2SO4', st:'aq', ions:[['Na^+', 2], ['SO4^2-', 1]]}], net:'Cu^2+ + S^2- → CuS(s)', spect:['Na^+', 'SO4^2-']}
    ]},
  { id:'top', code:'Bc', name:'Beacon', topics:[], final:true,
    intro:['The summit. The Unbonding is pulling the tower apart. We have to relight the beacon now.', 'Every correct answer feeds the flame. You get each topic once more with new numbers, and twice if it gave you trouble.', 'Treat this like the real test: paper, calculator, no hints if you can help it.'],
    outro:[], tasks:[] }
];
TOWER_MODS.forEach(m => m.tasks.forEach(t => { if (!t.topic) t.topic = m.topics[0]; }));

EXTRA.push(
  NV('x1', 'How many dots are in the Lewis symbol for a nitrogen atom?', 5, 'dots', 'Nitrogen is in group 15: 5 valence electrons.', {topic:'lewis'}),
  NV('x2', 'How many dots are in the Lewis symbol for an oxygen atom?', 6, 'dots', 'Oxygen is in group 16: 6 valence electrons.', {topic:'lewis'}),
  NV('x3', 'How many dots are in the Lewis symbol for a carbon atom?', 4, 'dots', 'Carbon is in group 14: 4 valence electrons.', {topic:'lewis'}),
  NV('x4', 'How many bonding electrons are in the Lewis structure of CO2 (O=C=O)?', 8, 'bonding electrons', 'Two double bonds × 4 shared electrons = 8.', {topic:'octet'}),
  NV('x5', 'How many bonding electrons are in the Lewis structure of N2 (a triple bond)?', 6, 'bonding electrons', 'A triple bond shares 3 pairs: 6 electrons.', {topic:'octet'}),
  NV('x6', 'How many bonding electrons are in the Lewis structure of H2O?', 4, 'bonding electrons', 'Two O–H single bonds × 2 = 4. The two lone pairs on O are not bonding.', {topic:'octet'}),
  TX('x7', 'What is the Stock name of Fe^3+?', [{label:'Stock name', accept:['iron(iii)', 'iron(iii)ion'], disp:'iron(III) ion'}], 'Fe^3+ carries a 3+ charge: iron(III).', {topic:'ionname'}),
  TX('x8', 'What is the name of the ion SO4^2-?', [{label:'Name', accept:['sulfate', 'sulfateion', 'sulphate'], disp:'sulfate ion'}], 'SO4^2- is sulfate.', {topic:'ionname'}),
  TX('x9', 'What is the formula of copper(II) chloride?', [{label:'Formula', cs:true, accept:['CuCl2'], disp:'CuCl2'}], 'Cu^2+ needs two Cl^-: CuCl2.', {topic:'ionname'}),
  TX('x10', 'What is the name of the ion OH^-?', [{label:'Name', accept:['hydroxide', 'hydroxideion'], disp:'hydroxide ion'}], 'OH^- is hydroxide.', {topic:'ionname'}),
  TX('x11', 'What is the formula of carbon tetrachloride?', [{label:'Formula', cs:true, accept:['CCl4'], disp:'CCl4'}], 'Tetra- = 4 Cl: CCl4.', {topic:'molname'}),
  TX('x12', 'What is the name of CO?', [{label:'Name', accept:['carbonmonoxide', 'carbonmonooxide'], disp:'carbon monoxide'}], 'One O = mono-: carbon monoxide.', {topic:'molname'}),
  TX('x13', 'What is the formula of dinitrogen tetroxide?', [{label:'Formula', cs:true, accept:['N2O4'], disp:'N2O4'}], 'Di- = 2 N, tetra- = 4 O: N2O4.', {topic:'molname'}),
  NV('x14', 'How many moles of O2 are needed to burn 1 mol of CH4? CH4 + 2O2 → CO2 + 2H2O', 2, 'mol O2', 'The ratio is 2 O2 : 1 CH4.', {topic:'stoich'}),
  NV('x15', 'How many moles of NH3 form from 3 mol of H2? N2 + 3H2 → 2NH3', 2, 'mol NH3', '3 mol H2 × (2 NH3 / 3 H2) = 2 mol NH3.', {topic:'stoich'}),
  CL2('x16', 'Zn(s) + CuSO4(aq) → ZnSO4(aq) + Cu(s)', 'single', 'Zn replaces Cu. Single-replacements are also redox.', ['redox']),
  CL2('x17', '2Na(s) + Cl2(g) → 2NaCl(s)', 'comb', 'Two reactants form one product. Electrons also transfer, so redox fits too.', ['redox']),
  CL2('x18', 'HNO3(aq) + NaOH(aq) → NaNO3(aq) + H2O(l)', 'acid', 'Acid + base → salt + water.', ['double']),
  CL2('x19', 'CaCO3(s) → CaO(s) + CO2(g)', 'decomp', 'One reactant breaks apart.'),
  CL2('x20', 'AgNO3(aq) + NaCl(aq) → AgCl(s) + NaNO3(aq)', 'precip', 'Two (aq) solutions form a solid (AgCl). It is also a double-replacement.', ['double'])
);

/* ---------- Tower art ---------- */
const STONE = new Set(['gate', 'lib', 'lab', 'obs', 'scr', 'apo', 'vault', 'mine', 'forge', 'circ', 'top', 'shrine']);
function stoneBase(k, ctx, t, o, id){
  k.r(0, 0, 80, 40, '#2a2540');
  for (let y = 0; y < 34; y += 5){ const off = (y / 5) % 2 ? 5 : 0; for (let x = -off; x < 80; x += 10){ k.r(x + 1, y + 1, 8, 3, ((x + y) / 5) % 3 === 0 ? '#3d3558' : '#352e4d'); } }
  k.r(0, 34, 80, 6, '#5c3a24'); for (let x = 0; x < 80; x += 12) k.r(x, 34, 1, 6, '#3e2616'); k.r(0, 34, 80, 1, '#7a4e30');
  const lit = o.lit > 0 && !(o.lit < 1 && Math.random() < .15);
  [12, 67].forEach(x => {
    k.r(x, 14, 2, 5, '#5a6988'); k.r(x - 1, 13, 4, 1, '#5a6988');
    if (lit){ const f = Math.floor(t * 8 + x) % 3; k.r(x - (f === 1 ? 1 : 0), 10, 2 + (f === 1 ? 1 : 0), 3, C.na); k.p(x + (f === 2 ? 1 : 0), 9, C.yel); k.p(x, 12, C.orange);
      ctx.fillStyle = 'rgba(254,174,52,.07)'; for (let i = 1; i < 5; i++) ctx.fillRect(x - i * 3, 11 - i, 2 + i * 6, 2 + i * 2); }
  });
}
const A2 = (o, t) => act(o, t);
Object.assign(DEV, {
  gate(k, t, o){
    const a = A2(o, t);
    k.r(24, 5, 32, 29, '#4a4264'); k.r(28, 9, 24, 25, '#120e1e'); k.r(30, 7, 20, 2, '#120e1e');
    const up = a ? 20 : o.lit >= 1 ? 20 : 0;
    for (let x = 29; x < 52; x += 4) k.r(x, 9, 1, 25 - up, '#8b93af');
    for (let y = 12; y < 34 - up; y += 5) k.r(28, y, 24, 1, '#8b93af');
    ['#2ce8f5', '#b55088', '#feae34'].forEach((c, i) => k.r(31 + i * 7, 5, 3, 2, a || o.lit >= 1 || Math.floor(t * 2 + i) % 3 === 0 ? c : '#2a2540'));
    o.sx = 40; o.sy = 18;
  },
  lib(k, t, o){
    const a = A2(o, t), cols = ['#e43b44', '#0099db', '#63c74d', '#feae34', '#b55088', '#c0cbdc', '#f77622'];
    [[4, 30], [48, 28]].forEach(([x0, w]) => { k.r(x0, 6, w, 28, '#5c3a24'); for (let r = 0; r < 3; r++){ const y = 8 + r * 9; k.r(x0, y + 7, w, 1, '#3e2616'); for (let i = 0; i < w - 3; i += 3){ const h = 5 + ((i * 7 + r * 3) % 3); k.r(x0 + 2 + i, y + 7 - h, 2, h, cols[(i + r * 2) % cols.length]); } } });
    const by = 16 + Math.round(Math.sin(t * 2) * (a ? 3 : 0));
    k.r(37, by, 8, 6, '#8a4b2a'); k.r(38, by + 1, 3, 4, '#e8d9a8'); k.r(41, by + 1, 3, 4, '#e8d9a8');
    if (a) for (let i = 0; i < 3; i++) k.p(36 + ((i * 5 + Math.floor(t * 6)) % 11), by - 2 - i, C.cu);
    o.sx = 41; o.sy = 18;
  },
  lab(k, t, o){
    const a = A2(o, t);
    k.r(8, 26, 64, 2, '#8a4b2a'); k.r(10, 28, 2, 6, '#5c3a24'); k.r(68, 28, 2, 6, '#5c3a24');
    k.circ(22, 21, 5, '#c0cbdc'); k.circ(22, 22, 4, a ? '#63c74d' : '#3e8948'); k.r(21, 12, 3, 5, '#c0cbdc');
    k.r(34, 13, 6, 13, '#c0cbdc'); k.r(35, 18, 4, 8, a ? '#b55088' : '#6a2a50');
    k.r(48, 18, 10, 8, '#c0cbdc'); k.r(49, 21, 8, 5, a ? '#2ce8f5' : '#1a4a5a');
    k.circ(64, 30, 5, '#262b44'); k.r(59, 25, 11, 2, '#3a4466');
    if (a) for (let i = 0; i < 6; i++){ const ph = (t * .8 + i * .17) % 1; k.p([22, 37, 53][i % 3] + (i % 2), 16 - ph * 10, C.white); }
    if (a && Math.floor(t * 4) % 2) k.p(64, 22, C.ba);
    o.sx = 37; o.sy = 20;
  },
  obs(k, t, o){
    const a = A2(o, t);
    k.circ(46, 17, 13, '#4a4264'); k.circ(46, 17, 11, '#0b0d2a');
    for (let i = 0; i < 9; i++){ const x = 38 + (i * 7) % 17, y = 10 + (i * 5) % 14; if ((x - 46) ** 2 + (y - 17) ** 2 < 100) k.p(x, y, (a && (i + Math.floor(t * 3)) % 3 === 0) ? C.yel : C.white); }
    k.circ(51, 12, 3, '#e8d9a8'); k.circ(52, 11, 2, '#0b0d2a');
    if (a){ const cx = 38 + ((t * 8) % 16); k.p(cx, 20, C.cu); k.p(cx - 1, 20, 'rgba(44,232,245,.5)'); k.p(cx - 2, 21, 'rgba(44,232,245,.3)'); }
    k.line(14, 32, 32, 16, '#8b93af'); k.line(15, 32, 33, 16, '#8b93af'); k.line(16, 32, 34, 17, '#5a6988'); k.r(12, 30, 8, 4, '#5c3a24');
    o.sx = 46; o.sy = 17;
  },
  scr(k, t, o){
    const a = A2(o, t);
    k.r(14, 24, 52, 3, '#8a4b2a'); k.r(16, 27, 3, 7, '#5c3a24'); k.r(61, 27, 3, 7, '#5c3a24');
    k.r(22, 18, 28, 7, '#e8d9a8'); k.r(20, 18, 2, 7, '#b86f50'); k.r(50, 18, 2, 7, '#b86f50');
    const n = a ? Math.floor(t * 6) % 12 : 5; for (let i = 0; i < n; i++) k.p(24 + (i * 2) % 24, 20 + Math.floor(i / 12) * 2, '#2a1a0a'); for (let i = 0; i < 10; i++) k.p(24 + i * 2, 23, '#6a4a2a');
    const qx = 24 + (n * 2) % 24; k.line(qx, 20, qx + 6, 11, C.white); k.p(qx + 6, 10, '#c0cbdc');
    k.r(57, 17, 3, 7, '#eef0f8'); if (o.lit > 0 || a){ k.p(58, 15, Math.floor(t * 6) % 2 ? C.yel : C.na); k.p(58, 16, C.orange); }
    o.sx = 36; o.sy = 20;
  },
  apo(k, t, o){
    const a = A2(o, t), cols = ['#63c74d', '#b55088', '#2ce8f5', '#feae34', '#e43b44', '#0099db'];
    [10, 20].forEach((y, r) => { k.r(6, y + 6, 68, 1, '#5c3a24'); for (let i = 0; i < 9; i++){ const x = 8 + i * 7; k.r(x, y, 5, 6, '#c0cbdc'); k.r(x + 1, y + 2, 3, 4, cols[(i + r) % 6]); k.r(x + 1, y - 1, 3, 1, '#8a4b2a'); if (a || o.lit >= 1) k.r(x + 1, y + 3, 3, 1, '#e8d9a8'); } });
    for (let i = 0; i < 5; i++){ const x = 12 + i * 14, sw = a ? Math.round(Math.sin(t * 2 + i)) : 0; k.line(x, 4, x + sw, 8, '#3e8948'); k.p(x + sw, 8, '#63c74d'); }
    k.r(56, 29, 10, 5, '#5a6988'); k.line(58, 29, 63, 23, '#8b93af');
    o.sx = 40; o.sy = 18;
  },
  vault(k, t, o){
    const a = A2(o, t);
    k.r(39, 10, 2, 22, '#feae34'); k.r(34, 32, 12, 2, '#feae34');
    const tilt = a || o.lit >= 1 ? 0 : 3;
    k.line(26, 11 + tilt, 54, 11 - tilt, '#feae34');
    [[26, 11 + tilt], [54, 11 - tilt]].forEach(([x, y]) => { k.line(x, y, x - 4, y + 8, '#c0cbdc'); k.line(x, y, x + 4, y + 8, '#c0cbdc'); k.r(x - 5, y + 8, 11, 2, '#feae34'); });
    [[4, 24], [62, 24]].forEach(([x, y]) => { k.r(x, y, 14, 10, '#8a4b2a'); k.r(x, y + 3, 14, 1, '#5c3a24'); k.r(x + 1, y - 2, 12, 2, '#fee761'); if (a && Math.floor(t * 4) % 2) k.p(x + 4 + (Math.floor(t * 7) % 6), y - 3, C.white); });
    o.sx = 40; o.sy = 16;
  },
  mine(k, t, o){
    const a = A2(o, t);
    k.r(0, 0, 80, 34, '#1d1a2a'); for (let i = 0; i < 20; i++) k.r((i * 17) % 78, (i * 11) % 30, 3, 2, '#2a2540');
    const crys = (x, y, h, c) => { for (let i = 0; i < h; i++){ const w = Math.max(1, Math.floor((h - i) / 2)); k.r(x - Math.floor(w / 2), y - i, w, 1, c); } };
    const glow = a || o.lit >= 1;
    crys(12, 33, 12, glow ? '#b55088' : '#4a2a44'); crys(18, 33, 8, glow ? '#c8a2ff' : '#3a2a50'); crys(62, 33, 14, glow ? '#2ce8f5' : '#1a4a5a'); crys(68, 33, 9, glow ? '#9ff7ff' : '#1a3a4a');
    k.r(24, 32, 32, 1, '#8b93af'); k.r(24, 34, 32, 1, '#5a6988');
    const mx = a ? 28 + Math.floor((t * 6) % 12) : 32; k.r(mx, 24, 12, 7, '#5a6988'); k.r(mx + 1, 22, 10, 3, '#8b93af'); k.r(mx + 2, 21, 3, 2, C.cu); k.r(mx + 6, 21, 3, 2, '#b55088');
    k.circ(mx + 3, 31, 1, '#262b44'); k.circ(mx + 9, 31, 1, '#262b44');
    if (a) for (let i = 0; i < 4; i++) k.p([12, 62, 18, 68][i], 18 + ((i * 5 + Math.floor(t * 8)) % 10), C.white);
    o.sx = 40; o.sy = 24;
  },
  forge(k, t, o){
    const a = A2(o, t);
    k.r(4, 10, 22, 24, '#4a4264'); k.r(8, 16, 14, 12, '#120e1e');
    const fire = a || o.lit >= 1; for (let i = 0; i < 10; i++){ const h = fire ? 4 + Math.floor(Math.random() * 7) : 2; k.r(9 + i, 28 - h, 1, h, i % 3 ? C.orange : C.na); }
    if (fire){ ctx_glow(k, 15, 22); }
    k.r(40, 24, 20, 3, '#5a6988'); k.r(44, 27, 12, 3, '#3a4466'); k.r(42, 30, 16, 4, '#5a6988'); k.r(56, 22, 6, 2, '#5a6988');
    const up = a ? Math.floor(t * 4) % 2 : 1; k.line(58, 8, 50, up ? 12 : 20, '#8a4b2a'); k.r(47, up ? 10 : 18, 6, 4, '#8b93af');
    if (a && !up) for (let i = 0; i < 5; i++) k.p(48 + Math.random() * 10, 20 - Math.random() * 6, [C.yel, C.na, C.white][i % 3]);
    k.r(50, 23, 8, 1, a ? C.orange : '#8b93af');
    o.sx = 15; o.sy = 22;
  },
  circ(k, t, o){
    const a = A2(o, t), on = a || o.lit >= 1;
    for (let an = 0; an < 6.283; an += .08){ const x = 40 + Math.cos(an) * 28, y = 30 + Math.sin(an) * 5; k.p(x, y, on ? C.cu : '#3a4466'); }
    for (let i = 0; i < 6; i++){ const an = i * 1.047 + (a ? t : 0); k.p(40 + Math.cos(an) * 20, 30 + Math.sin(an) * 3.5, on ? C.yel : '#4a4264'); }
    [8, 70].forEach(x => { k.r(x, 12, 4, 20, '#4a4264'); k.circ(x + 2, 10, 2, on ? '#b55088' : '#2a2540'); });
    if (a) for (let i = 0; i < 8; i++){ const x = 18 + i * 6, h = 4 + Math.floor(Math.random() * 16); k.r(x, 30 - h, 1, h, i % 2 ? 'rgba(44,232,245,.6)' : 'rgba(181,80,136,.6)'); }
    o.sx = 40; o.sy = 26;
  },
  top(k, t, o){
    const a = A2(o, t) || o.warp;
    k.r(0, 0, 80, 22, '#0b0d2a'); for (let i = 0; i < 14; i++) k.p((i * 23) % 80, (i * 7) % 20, i % 4 ? C.white : C.cu);
    for (let x = 0; x < 80; x += 8) k.r(x, 18, 5, 4, '#4a4264'); k.r(0, 22, 80, 12, '#3d3558');
    k.r(34, 24, 12, 10, '#5a6988'); k.r(32, 22, 16, 3, '#8b93af');
    const ch = o.charge == null ? (a ? 1 : .15) : o.charge;
    const hgt = Math.round(4 + 14 * ch);
    for (let i = 0; i < hgt; i++){ const w = Math.max(1, 7 - Math.floor(i / 3)); k.r(40 - w / 2 + (a ? Math.round(Math.sin(t * 9 + i) * .6) : 0), 21 - i, w, 1, i < 3 ? C.white : i < 8 ? C.cu : '#9ff7ff'); }
    if (a) { k.r(39, 0, 2, 21 - hgt, 'rgba(159,247,255,.35)'); }
    o.sx = 40; o.sy = 16;
  },
  shrine(k, t, o){
    const a = A2(o, t), sealed = o.lit >= .9 || a;
    k.r(30, 22, 20, 12, '#8b93af'); k.r(28, 20, 24, 3, '#c0cbdc'); k.r(32, 20, 16, 2, sealed ? C.cu : '#1a4a5a');
    k.r(36, 10, 8, 10, '#4a4264'); k.circ(40, 9, 4, sealed ? '#b55088' : '#4a2a44');
    if (!sealed) for (let i = 0; i < 4; i++) k.line(20 + i * 12, 6 + (i % 2) * 4, 24 + i * 12, 12 + (i % 2) * 3, '#120e1e');
    if (a || o.lit > 0) for (let i = 0; i < 5; i++){ const ph = (t * .7 + i * .2) % 1; k.p(33 + i * 3, 19 - ph * 14, sealed ? C.cu : '#6a4a8a'); }
    o.sx = 40; o.sy = 16;
  }
});
function ctx_glow(k, x, y){ for (let i = 0; i < 3; i++) k.p(x - 3 + i * 3, y - 8 - i, C.yel); }

/* Val the owl, 18×16 */
function drawOwl(ctx, t){
  const k = K(ctx); ctx.clearRect(0, 0, 18, 16);
  const e = molly.expr, alarm = e === 'alarm';
  k.r(3, 3, 12, 12, '#7a5236'); k.r(2, 5, 14, 9, '#7a5236'); k.p(3, 2, '#7a5236'); k.p(4, 2, '#5c3a24'); k.p(14, 2, '#7a5236'); k.p(13, 2, '#5c3a24');
  k.r(4, 4, 10, 6, '#c8a07a'); k.r(6, 10, 6, 4, '#e0c9a0'); k.p(7, 11, '#b08a60'); k.p(10, 11, '#b08a60'); k.p(8, 12, '#b08a60');
  k.r(1, 7, 2, 6, '#5c3a24'); k.r(15, 7, 2, 6, '#5c3a24'); k.r(6, 15, 2, 1, C.na); k.r(10, 15, 2, 1, C.na);
  const ring = alarm ? C.sr : C.na, blink = (t % 3.6) < .13;
  const eye = cx => {
    if (blink){ k.r(cx - 1, 7, 3, 1, '#2a1a0a'); return; }
    if (e === 'happy'){ k.p(cx - 1, 7, '#2a1a0a'); k.p(cx, 6, '#2a1a0a'); k.p(cx + 1, 7, '#2a1a0a'); return; }
    k.r(cx - 1, 5, 3, 3, ring); k.p(cx, 6, alarm ? '#fff' : '#2a1a0a');
    if (e === 'smug') k.r(cx - 1, 5, 3, 1, '#7a5236');
    if (e === 'worried'){ k.p(cx === 6 ? cx + 1 : cx - 1, 4, '#5c3a24'); }
    if (alarm) k.r(cx - 1, 5, 3, 3, ring), k.p(cx, 6, '#fff');
  };
  eye(6); eye(11);
  const talking = t < molly.talkUntil && Math.floor(t * 10) % 2;
  k.r(8, 8, 2, 2, C.orange); if (talking) k.r(8, 10, 2, 1, '#c85a1a');
}
function drawTower(ctx, t, lit){
  const k = K(ctx); ctx.clearRect(0, 0, 48, 64);
  k.r(23, 0, 2, 3, '#8b93af'); k.r(20, 3, 8, 3, '#b55088'); k.r(17, 6, 14, 3, '#b55088'); k.r(14, 9, 20, 3, '#8a3a6a');
  const beam = lit > .95; const f = Math.floor(t * 6) % 2;
  k.r(22, 1 - (beam ? 0 : 0), 4, 2, beam ? (f ? C.cu : '#9ff7ff') : '#3a4466');
  k.r(16, 12, 16, 46, '#4a4264'); k.r(17, 12, 14, 46, '#3d3558');
  for (let y = 14; y < 58; y += 4) k.r(17 + ((y / 4) % 2 ? 0 : 3), y, 11, 1, '#352e4d');
  for (let i = 0; i < 10; i++){ const y = 52 - i * 4, on = i / 10 < lit; k.r(21 + (i % 2) * 4, y, 2, 2, on ? C.na : '#120e1e'); }
  k.r(12, 56, 24, 8, '#4a4264'); k.r(21, 58, 6, 6, '#120e1e');
  if (beam) for (let i = 0; i < 4; i++) k.p(24 + (i % 2 ? 3 : -3) * Math.sin(t * 3 + i), 0, C.cu);
}

/* ---------- Campaigns ---------- */
const CAMPS = {
  station:{ id:'station', title:'Avogadro Station', tag:'Chem quiz · moles, reactions, naming', mods:MODS, pal:'MOLLY', art:'ship',
    layout:[['fin'], ['med', 'air'], ['fab', 'rx'], ['sen', 'h2o'], ['pow', 'crg'], ['eng']], shape:'ship',
    repair:{ id:'bay', code:'Rp', name:'Repair Bay', topics:[], repair:true, tasks:[] },
    repairLines:['This one cracked the hull before. Same numbers. Weld it shut.', 'Old crack, same problem. Take your time on paper.', 'You missed this one earlier. Show it who\'s boss.'],
    repairIntro:['Every problem you missed left a crack in the hull.', 'You get the exact same problem again, same numbers. Solve it and the patch welds: +15 hull.', 'Miss it and the crack stays in the queue. No extra damage in here, so take your time.'],
    boot:['Oh good, you\'re awake. I\'m MOLLY, the station\'s Molecular Logistics Layer.',
      'A meteor scrambled my calculation core. I can still read sensors, but every number I produce needs checking by someone with a pencil. That\'s you.',
      'Long calculations are worked by hand, on paper. You punch the final answer into each device in scientific notation, with correct sig figs and units. I grade like your teacher.',
      'Wrong answers cost hull, and I\'ll hand you the same kind of problem again with new numbers. Streaks earn bonus energy. Hints cost energy.',
      'Ten systems are down. Fix them in order, then we jump home from the bridge.'],
    bootExpr:['happy', 'worried', 'neutral', 'smug', 'neutral'], bootRoom:'med', firstLine:'Start with the med bay. It\'s the flashing one.', finalBadge:'jump',
    w:{ hull:'hull', Hull:'Hull', nrg:'Nrg', energy:'energy', crack:'crack', Bay:'Repair bay', bay:'repair bay', weld:'weld', map:'Station map', charge:'Jump drive', go:'Start the jump', start:'Start repairs', unit:'System', online:'online',
      fixed:'★ System repaired', fault:'✗ Fault detected', startWeld:'Start welding', doneWeld:'Welding done', patched:'Patch welded', patchFail:'Patch didn\'t hold. This crack stays in the repair bay.', added:'Added to the repair bay. Re-solve it there to win the hull back.',
      failHull:'Hull failure! Emergency patch', check:'Jump check', restored:'restored', mid:'mid-repair', weldMore:'Weld more', welded:'Welded', cracksLeft:'Cracks left', perWeld:'Per weld' },
    dev:{ tf:'Safety interlock', classify:'Radar · incoming signal', mc:'Console', numval:'Counter', net:'Tank controls', choice:'Cell diagnostic', nums:'Mole gauges', balance:'Reactor controls' },
    ending(pct, patches){
      if (pct >= 85 && patches === 0) return ['Course set for home', ['Jump complete. Every system green, and you did the math by hand.', 'You\'re ready for the quiz. Run a remix the night before to keep it fresh.']];
      if (pct >= 65) return ['Limping home', ['We made the jump, but a few systems are running on patches.', 'Check the study report for the topics that cost you hull, then run a remix.']];
      return ['Barely made it', ['We made the jump. Barely.', 'Go through the study report, reread those manual pages, and run a remix. The numbers change every time.']];
    }
  },
  tower:{ id:'tower', title:'Valence Spire', tag:'Unit 2 practice test · bonding, naming, moles', mods:TOWER_MODS, pal:'VAL', art:'tower',
    layout:[['top'], ['circ'], ['forge'], ['mine'], ['vault'], ['apo'], ['scr'], ['obs'], ['lab'], ['lib'], ['gate']], shape:'tower',
    repair:{ id:'shrine', code:'Ms', name:'Mending Shrine', topics:[], repair:true, tasks:[] },
    repairLines:['This one cracked your ward before. Same numbers. Mend it.', 'An old fracture, same problem as before. Take your time on paper.', 'You missed this one earlier. Cast it again.'],
    repairIntro:['Every problem you missed left a fracture in your ward.', 'At the shrine you face the exact same problem again. Solve it and the fracture mends: +15 ward.', 'Miss it and the fracture stays. No extra damage here, so take your time.'],
    boot:['Hoo! You made it up the path. I\'m Val, familiar to the late Archmage of the Valence Spire.',
      'A curse called the Unbonding tore apart the bonds holding this tower together. Every floor is dark, and the beacon on top has gone out.',
      'Each floor is sealed by trials from your Unit 2 practice test. Pass them to restore the floor.',
      'Same rules as the station: calculations on paper, final answer on the rune pad. Here, standard or scientific notation both count, but sig figs and units still matter.',
      'Misses crack your ward. The Mending Shrine lets you re-solve the ones you missed to restore it. Now, up we go.'],
    bootExpr:['happy', 'worried', 'neutral', 'smug', 'happy'], bootRoom:'gate', firstLine:'Start at the Gatehouse. It\'s the glowing floor at the bottom.', finalBadge:'beacon',
    w:{ hull:'ward', Hull:'Ward', nrg:'Mana', energy:'mana', crack:'fracture', Bay:'Mending shrine', bay:'mending shrine', weld:'mend', map:'Tower map', charge:'Beacon', go:'Light the beacon', start:'Begin the trials', unit:'Floor', online:'restored',
      fixed:'★ The rune holds', fault:'✗ The spell fizzled', startWeld:'Begin mending', doneWeld:'Mending done', patched:'Fracture mended', patchFail:'The mend didn\'t hold. This fracture stays at the shrine.', added:'Added to the Mending Shrine. Re-solve it there to win the ward back.',
      failHull:'Ward shattered! Emergency charm', check:'Beacon trial', restored:'restored', mid:'mid-trial', weldMore:'Mend more', welded:'Mended', cracksLeft:'Fractures left', perWeld:'Per mend' },
    dev:{ tf:'Rune lock · true or false', classify:'Scrying pool', mc:'Spell choices', numval:'Tally', net:'Cauldron', choice:'Choose', nums:'Tally', balance:'Forge dials' },
    ending(pct, patches){
      if (pct >= 85 && patches === 0) return ['The beacon blazes', ['The beacon is lit and the Spire stands whole. You earned that.', 'You\'re ready for the Unit 2 test. Run a remix the night before.']];
      if (pct >= 65) return ['The beacon flickers', ['The beacon is lit, but a few floors are held together with charms.', 'Check the study report for weak topics, then try a remix.']];
      return ['A faint glow', ['The beacon is lit. Barely.', 'Work through the study report, reread the rule scrolls, and run a remix.']];
    }
  }
};
let CAMP = CAMPS.station;
const W = () => CAMP.w;
const CAMP_FIELDS = ['hull', 'energy', 'patches', 'done', 'stats', 'score', 'missed', 'cur', 'finished', 'wrongs', 'parked', 'remix'];
function campFresh(){ const f = fresh(), o = {}; CAMP_FIELDS.forEach(k => { o[k] = f[k]; }); return o; }
function applyCamp(){ CAMP = CAMPS[st.camp] || CAMPS.station; MODS = CAMP.mods; ORIG = MODS.flatMap(m => m.tasks); }
function switchCamp(id){
  if ((st.camp || 'station') === id){ applyCamp(); return; }
  st.saved = st.saved || {};
  const o = {}; CAMP_FIELDS.forEach(k => { o[k] = st[k]; }); st.saved[st.camp || 'station'] = o;
  Object.assign(st, st.saved[id] ? JSON.parse(JSON.stringify(st.saved[id])) : campFresh()); st.camp = id;
  applyCamp(); save();
}
function campSummary(id){
  const s = (st.camp || 'station') === id ? st : (st.saved && st.saved[id]) || campFresh();
  return { done:(s.done || []).length, total:CAMPS[id].mods.length, run:(s.done || []).length > 0 || !!s.cur, finished:!!s.finished };
}
