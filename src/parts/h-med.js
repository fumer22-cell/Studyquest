
/* ========================================================================
   NIGHT SHIFT AT MERCY GENERAL — CHE1011 Unit 3 practice exam
   (Chapters 5 & 6). Exam conditions: every question timed by default,
   no formula boxes, exam-style multiple choice for concepts, typed math.
   ======================================================================== */

/* ---------- Figures ---------- */
const dotsSVG = (parts, label) => `<svg viewBox="0 0 90 90" width="76" height="76" role="img" aria-label="${label}"><circle cx="45" cy="45" r="40" fill="none" stroke="currentColor" stroke-width="2.5"/>${parts.map(([x, y, c, r]) => `<circle cx="${x}" cy="${y}" r="${r || 6}" fill="${c || '#c0cbdc'}" stroke="#1a1a2a" stroke-width="1.5"/>`).join('')}</svg>`;
const GASFIG = `<div class="figs">${[
  ['A', [[28, 30], [45, 24], [62, 32], [30, 52], [50, 46], [66, 56], [38, 68], [56, 70]], '8 separate particles'],
  ['B', [[40, 28], [26, 56], [62, 60]], '3 particles'],
  ['C', [[30, 34], [38, 34], [56, 28], [64, 28], [36, 60], [44, 60], [58, 56], [66, 56]], '4 two-atom molecules'],
  ['D', [[50, 40]], '1 particle']
].map(([l, p, al]) => `<figure>${dotsSVG(p, 'Sample ' + l + ': ' + al)}<figcaption>${l}</figcaption></figure>`).join('')}</div>`;
const CHARLES = `<div class="figs"><figure><svg viewBox="0 0 200 130" width="220" height="143" role="img" aria-label="Graph: volume rises in a straight line from zero as Kelvin temperature increases">
  <line x1="30" y1="10" x2="30" y2="105" stroke="currentColor" stroke-width="2"/><line x1="30" y1="105" x2="190" y2="105" stroke="currentColor" stroke-width="2"/>
  <line x1="30" y1="105" x2="180" y2="25" stroke="#2ce8f5" stroke-width="3"/>
  <text x="8" y="60" font-size="11" fill="currentColor" transform="rotate(-90 12 60)">Volume (L)</text><text x="80" y="124" font-size="11" fill="currentColor">Temperature (K)</text>
  <text x="22" y="112" font-size="10" fill="currentColor">0</text></svg></figure></div>`;
const CA = '#eef0f8', CL = '#3a4466';
const ionSVG = (parts, label) => dotsSVG(parts.map(([x, y, k]) => [x, y, k === 'ca' ? CA : CL, k === 'ca' ? 7 : 6]), label);
const CACL = [
  ionSVG([[28, 32, 'ca'], [58, 58, 'ca'], [44, 66, 'ca'], [48, 30, 'cl'], [64, 38, 'cl'], [30, 58, 'cl']], '3 calcium ions and 3 chloride ions'),
  ionSVG([[30, 34, 'ca'], [60, 62, 'ca'], [50, 26, 'cl'], [66, 40, 'cl'], [26, 58, 'cl'], [44, 66, 'cl']], '2 calcium ions and 4 chloride ions, all separate'),
  ionSVG([[30, 34, 'ca'], [42, 34, 'cl'], [36, 44, 'cl'], [56, 58, 'ca'], [68, 58, 'cl'], [62, 68, 'cl']], '2 intact CaCl2 units'),
  ionSVG([[30, 34, 'ca'], [60, 62, 'ca'], [48, 28, 'cl'], [58, 28, 'cl'], [28, 58, 'cl'], [38, 58, 'cl']], '2 calcium ions and 2 Cl2 molecules'),
  ionSVG([[30, 34, 'ca'], [40, 40, 'cl'], [58, 30, 'cl'], [56, 60, 'ca'], [66, 66, 'cl'], [30, 62, 'cl']], '2 CaCl pairs and 2 loose chloride ions')
];
const LWM = (atoms, bonds, lp, alt) => ({lw:{...molSpec({atoms, bonds}, null, lp), U:44, alt}});
const HBOPTS = [
  LWM([AT('N', 1, 0), AT('H', 0, 0), AT('H', 2, 0), AT('H', 1, 1)], [[0, 1], [0, 2], [0, 3]], [1, 0, 0, 0], 'NH3'),
  LWM([AT('H', 0, 0), AT('F', 1, 0)], [[0, 1]], [0, 3], 'HF'),
  LWM([AT('O', 1, 0), AT('H', 0, 1), AT('H', 2, 1)], [[0, 1], [0, 2]], [2, 0, 0], 'H2O'),
  LWM([AT('C', 1, 1), AT('C', 2, 1), AT('O', 3, 1), AT('H', 4, 1), AT('H', 0, 1), AT('H', 1, 0), AT('H', 1, 2), AT('H', 2, 0), AT('H', 2, 2)], [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 8]], [0, 0, 2, 0, 0, 0, 0, 0, 0], 'ethanol'),
  LWM([AT('C', 0, 1), AT('O', 1, 1), AT('C', 2, 1), AT('H', 0, 0), AT('H', 0, 2), AT('H', 2, 0), AT('H', 2, 2)], [[0, 1], [1, 2], [0, 3], [0, 4], [2, 5], [2, 6]], [0, 2, 0, 0, 0, 0, 0], 'ether, C–O–C')
];

/* ---------- Topics ---------- */
Object.assign(TOPICS, {
  hstates:{name:'States of matter & phase changes', rule:'Gas: particles far apart, random, fast, compressible. Liquid: close but able to slide, NOT rigid. Solid: close, ordered, held by strong forces. Phase changes are physical. Condensation: gas → liquid (dew). Boiling point rises with outside pressure (autoclave/pressure cooker).'},
  hsolid:{name:'Solids', rule:'Crystalline solids (ionic, molecular, covalent, metallic) have a regular repeating structure. Amorphous solids (glass) do not. Molecular solids have low melting points; ionic solids high.'},
  hpress:{name:'Pressure & kinetic theory', rule:'Units: atm, mm Hg, torr, Pa (kJ is energy). 1 atm = 760 mm Hg. A barometer measures atmospheric pressure. Gases are mostly empty space; average kinetic energy ∝ Kelvin temperature. More particles in the same space = more pressure.'},
  hgas:{name:'Gas laws', rule:'Boyle: P1V1 = P2V2 (T, n constant). Charles: V ∝ T(K). Gay-Lussac: P ∝ T(K). Avogadro: V ∝ n. Ideal gas: PV = nRT, R = 0.0821 L·atm/(mol·K). Most ideal: small, nonpolar gases like He.'},
  hdalton:{name:'Dalton & Henry', rule:'Dalton: P(total) = sum of the partial pressures. Henry: gas solubility rises with the pressure of that gas above the liquid.'},
  himf:{name:'Intermolecular forces & liquids', rule:'H-bonding needs H bonded directly to N, O or F. More H-bonding = higher viscosity and boiling point (glycerol > ethanol). Like attracts like. Soaps and detergents lower surface tension.'},
  hsoln:{name:'Solutions & solubility', rule:'A solution is a homogeneous mixture of solute and solvent (any state, may be colored). Saturated = at the solubility limit; excess solid stays undissolved. Molarity is mol solute per L of SOLUTION. Volumes don\'t always add. 1 ppt > 1 ppm.'},
  hpct:{name:'% (m/V) concentration', rule:'% (m/V) = g solute ÷ mL solution × 100. g solute = mL × % ÷ 100. mL needed = g ÷ % × 100.'},
  hmolar:{name:'Molarity & dilution', rule:'M = mol ÷ L solution (mol = g ÷ molar mass). L = mol ÷ M. Dilution: M1V1 = M2V2. Adding water always lowers the concentration.'},
  hlyte:{name:'Electrolytes', rule:'Soluble ionic compounds are electrolytes: they separate into ions (CaCl2 → Ca^2+ + 2Cl^-). Many ionic compounds dissolve in water. Nonelectrolytes do not dissociate.'},
  hosmo:{name:'Osmosis & colligative properties', rule:'Water moves through a semipermeable membrane from the hypotonic (dilute) side to the hypertonic (concentrated) side. 0.15 M NaCl and 0.30 M glucose are isotonic with cells. Raoult: solute lowers vapor pressure. Colligative effects depend on the NUMBER of particles, not their mass. The Na^+/K^+ ratio is kept by active transport, not osmosis.'},
  hcolloid:{name:'Colloids', rule:'Colloids scatter light (the Tyndall effect); true solutions do not. Under normal light they look the same to the eye.'}
});

/* ---------- Builders ---------- */
const HQ = (n, q, opts, a, why, x = {}) => ({id:'h' + n, ref:'Exam #' + n, type:'mc', q, opts, a, why, ...x});
const HT = (n, q, a, why, x = {}) => ({id:'h' + n, ref:'Exam #' + n, type:'tf', q:'True or false: ' + q, a, why, ...x});
const HC = (n, p, x = {}) => ({id:'h' + n, ref:'Exam #' + n, type:'calc', gen:'chain', p, ...x});
const HX = (n, p, x = {}) => ({id:'h' + n, ref:'Exam #' + n, type:'calc', gen:'fixed', p, ...x});
const UPR = ['atm', 'mm Hg', 'torr', 'kPa', 'L', 'mL'];
const UVO = ['L', 'mL', 'atm', 'K', 'mol', 'g'];
const UCO = ['M', '%', 'g', 'mL', 'L', 'mol'];
const LAWS = ['Boyle', 'Charles', 'Dalton', 'Gay-Lussac', 'Torricelli'];

const MED_MODS = [
  { id:'sterile', code:'Cs', name:'Central Sterile', topics:['hstates', 'hsolid'],
    intro:['Woof! I\'m Dalton, the night-shift therapy dog. Yes, like the gas law.', 'First stop: Central Sterile, where instruments get cleaned and steam-sterilized.', 'Exam rules tonight: every question is on the clock, there are no formula hints, and the data sheet is your only crib.'],
    outro:['Instruments are sterile and stocked.', 'Liquids flow; only solids are rigid. Pressure raises the boiling point.'],
    flav:['The autoclave hisses.', 'Trays clatter onto the cart.', 'Dalton sniffs a sterile wrap. Not allowed.'],
    tasks:[
      HQ(1, 'Orientation quiz before you can badge into Sterile Processing. Which statement concerning the three states of matter is FALSE?', ['Particles of a gas are well separated, have no regular arrangement, and move at high speeds.', 'Particles of a solid have low kinetic energy and are held close together by strong attractive forces.', 'Particles of a liquid have a rigid, ordered arrangement due to the high speeds of the liquid particles.', 'Gases have low densities and high compressibility due to the large amount of space between gas particles.', 'Phase changes between the three states of matter are physical changes; no change in the identity or composition of the substance occurs.'], 2, 'Liquid particles can slide past each other; they are not rigid or ordered. Only solids are.'),
      HQ(5, 'At dawn the ambulance bay windows and the grass outside are covered in droplets. What process forms dew?', ['sublimation', 'evaporation', 'condensation', 'freezing', 'deposition'], 2, 'Water vapor in cool morning air turns to liquid on cold surfaces: gas → liquid is condensation.'),
      HQ(7, 'The supply shelf holds salt crystals, ice packs, copper wire, quartz, and glass vials. Which of the following is NOT a type of crystalline solid?', ['covalent solid', 'molecular solid', 'amorphous solid', 'ionic solid', 'metallic solid'], 2, 'Amorphous solids, like glass, have no regular repeating structure.', {topic:'hsolid'}),
      HQ(25, 'A tech asks what makes the salt crystals “crystalline.” Which statement about a crystalline solid is always TRUE?', ['A crystalline solid has a regular repeating structure of the atoms, ions, or molecules that make up the solid.', 'A crystalline solid will always have a high melting point.', 'A crystalline solid will always have a low melting point.', 'A crystalline solid contains only ionic bonds.', 'A crystalline solid is another name for an amorphous solid.'], 0, 'Crystalline means an ordered, repeating lattice. Melting points vary by type.', {topic:'hsolid'}),
      HQ(26, 'The menthol crystals for the cough drops melt in your hand. Which property is typical for molecular solids?', ['consist of only metal atoms', 'contain ionic and covalent bonds', 'have low melting points', 'have no organized structure', 'will boil at very high temperature'], 2, 'Molecular solids are held together only by intermolecular forces, which are weak, so they melt easily.', {topic:'hsolid'}),
      HT(27, 'Liquids and solids are both highly compressible.', false, 'Their particles are already touching. Only gases compress easily (that is why oxygen fits in a cylinder).'),
      HT(36, 'Ionic compounds tend to have higher melting points than molecular compounds.', true, 'Ionic lattices are held by strong attractions between ions.', {topic:'hsolid'}),
      HT(33, 'The boiling point of a liquid is dependent on the atmospheric pressure.', true, 'A liquid boils when its vapor pressure equals the outside pressure.'),
      HT(34, 'The temperature at which water boils inside a pressure cooker (or our autoclave) is lower than in an open pan at sea level.', false, 'Higher pressure raises the boiling point to about 121 °C. That is how an autoclave sterilizes.')
    ]},
  { id:'resp', code:'Rt', name:'Respiratory Therapy', topics:['hpress', 'hgas'],
    intro:['Respiratory Therapy: oxygen cylinders, ventilators, and very particular pressure gauges.', 'Boyle\'s law lives here. Squeeze a gas and its pressure goes up.'],
    outro:['Every cylinder checked and tagged.', 'Pressure × volume stays constant at constant temperature and amount.'],
    flav:['A ventilator cycles.', 'An O2 tank clanks into its cart.', 'Dalton watches the bellows go up and down.'],
    tasks:[
      HQ(8, 'A new gauge arrives with five unit labels on the dial. Which of the following is NOT a unit for measuring pressure?', ['Pa', 'kJ', 'atm', 'mm Hg', 'torr'], 1, 'kJ (kilojoules) measures energy, not pressure.'),
      HQ(10, 'The old brass instrument on the wall of RT is a barometer. A barometer measures', ['the pressure of a gas sample in a container.', 'the difference in pressure between two gas samples.', 'the difference in pressure between a gas sample and atmospheric pressure.', 'atmospheric pressure.', 'the pressure of an ideal gas.'], 3, 'Barometers measure atmospheric pressure. A manometer compares a sample to the atmosphere.'),
      {id:'h11', ref:'Exam #11', type:'numval', q:'The barometer is marked in mm Hg, but the ventilator reads atm. One standard atmosphere (1 atm) is equivalent to how many mm Hg?', v:760, unit:'mm Hg', why:'1 atm = 760 mm Hg = 760 torr = 101.325 kPa.'},
      HQ(12, 'Trivia on the RT break-room whiteboard: who formulated the relationship between the volume and the pressure of a gas?', ['Boyle', 'Charles', 'Dalton', 'Gay-Lussac', 'Torricelli'], 0, 'Boyle\'s law: P and V are inversely proportional.'),
      HC(13, {q:'A given mass of oxygen at room temperature occupies 500.0 mL at {x} atm. To fit a portable canister, it must be compressed to only 150.0 mL. What pressure is required?', x:'1.50', u0:'atm', f:[['500.0', 'mL', '150.0', 'mL']], ru:'atm', unit:'atm', units:UPR, notes:['Boyle\'s law: P2 = P1 × V1 ÷ V2']}, {topic:'hgas'}),
      HQ(14, 'A sample of oxygen occupies 3.0 L at 1.5 atm in a ventilator bellows. The bellows expands without changing the temperature or the amount of gas. What can be said about the pressure?', ['The pressure of oxygen will remain at 1.5 atm.', 'The pressure of oxygen will be less than 1.5 atm.', 'The pressure of oxygen will be greater than 1.5 atm.', 'The pressure of oxygen will be 4.5 atm.', 'It is impossible to predict.'], 1, 'Boyle: bigger volume, lower pressure. That is how the lungs pull air in.', {topic:'hgas'}),
      HC(22, {q:'An O2 cylinder at {x} atm is compressed at constant temperature from 10.0 L to 2.0 L. What is the pressure after it is compressed?', x:'5.0', u0:'atm', f:[['10.0', 'L', '2.0', 'L']], ru:'atm', unit:'atm', units:UPR, notes0:['The practice exam key lists “25 L”, but the question asks for pressure: 25 atm.']}, {topic:'hgas'}),
      HQ(4, 'Four sealed sample flasks of the same size sit in the 100 °C sterilizer. Which gas sample exerts the greatest pressure?', ['A', 'B', 'C', 'D'], 0, 'At the same temperature and volume, pressure depends on the number of particles. A has 8 separate particles; C has only 4 two-atom molecules.', {fig:null, figHTML:GASFIG}),
      HQ(21, 'A student nurse asks why oxygen can be squeezed into a cylinder. According to the kinetic molecular theory, which statement concerning gases is TRUE?', ['Gases are mostly empty space.', 'The average kinetic energy of the molecules increases with decreasing temperature.', 'Gas molecules are strongly attracted to each other.', 'When gas molecules collide, they lose energy.', 'Gas molecules are very closely packed together.'], 0, 'Gas particles are tiny compared with the distances between them.'),
      HQ(17, 'Warm humidified air moves faster than cold air. What quantity is directly proportional to the kinetic energy of the particles in a gas?', ['distance between molecules', 'absolute temperature', 'atomic mass', 'formula mass', 'volume of the individual particles'], 1, 'Average kinetic energy ∝ Kelvin temperature.')
    ]},
  { id:'hyper', code:'Hb', name:'Hyperbaric & Anesthesia', topics:['hgas', 'hdalton'],
    intro:['The hyperbaric chamber and the anesthesia gas station. Mixtures, partial pressures, and temperature.', 'Dalton: each gas in a mixture pushes on its own, and the pushes add up.'],
    outro:['Chamber and gas carts are ready for the morning.', 'Total pressure = sum of partial pressures. Higher pressure pushes more gas into the blood.'],
    flav:['The chamber door seals with a thunk.', 'An anesthesia cart beeps.', 'Dalton perks up whenever someone says “Dalton.”'],
    tasks:[
      HQ(2, 'The chamber log says to “apply Charles\'s Law” during warm-up. Which statement correctly describes Charles\'s Law?', ['The volume of a gas is directly proportional to the number of moles of the gas, if the pressure and temperature remain constant.', 'The volume of a gas is directly proportional to the Kelvin temperature of the gas, if the pressure and amount of gas remain constant.', 'The pressure of a gas is inversely proportional to the volume of the gas, if the temperature and amount of gas remain constant.', 'The pressure of a gas is directly proportional to the Kelvin temperature of the gas, if the volume and amount of gas remain constant.', 'The total pressure exerted by a mixture of gases in a container is the sum of the partial pressures that each gas would exert alone.'], 1, 'A is Avogadro, C is Boyle, D is Gay-Lussac, E is Dalton.'),
      HQ(15, 'The chamber\'s calibration chart (below) plots volume against Kelvin temperature. Who discovered the gas law it shows?', ['Boyle', 'Charles', 'Dalton', 'Avogadro', 'Torricelli'], 1, 'A straight line through zero: V ∝ T(K). That is Charles\'s law.', {figHTML:CHARLES}),
      HC(23, {q:'A patient\'s cuff balloon holds {x} L of air at 25 °C. The warming blanket heats it to 40 °C at constant pressure. What is the new volume?', x:'1.00', u0:'L', f:[['313', 'K', '298', 'K']], ru:'L', unit:'L', units:UVO, notes:['Charles\'s law: V2 = V1 × T2 ÷ T1 in kelvin (25 °C = 298 K, 40 °C = 313 K)']}),
      HQ(19, 'A patient\'s 350 mL inhaler canister reads 4.5 atm at room temperature. It spent the winter night in a freezing car. What can be said about the pressure inside?', ['The pressure of the gas will be greater than 4.5 atm.', 'The pressure of the gas will be less than 4.5 atm.', 'The pressure of the gas will remain at 4.5 atm.', 'The pressure of the gas will be 1575 atm.', 'It is impossible to say anything about the pressure without additional information.'], 1, 'Gay-Lussac: at fixed volume, pressure ∝ Kelvin temperature. Colder means lower pressure, so the inhaler sprays weakly.'),
      HQ(9, 'The anesthesiologist adds more gas to the breathing bag and it swells. What law predicts the expansion of a balloon when helium (or any gas) is added?', ['Boyle\'s Law', 'Charles\'s Law', 'Avogadro\'s Law', 'Ideal Gas Law', 'None of the choices are correct.'], 2, 'Avogadro: V ∝ n. More moles, more volume.'),
      HQ(3, 'The anesthesia machine mixes O2, N2O and sevoflurane. Dalton\'s Law of Partial Pressures states which of the following?', ['The total pressure exerted by a mixture of gases in a container is equal to the highest partial pressure exerted by any of the gases in the container.', 'The total pressure exerted by a mixture of gases in a container is the sum of the pressures that each gas would exert if present alone under similar conditions.', 'The total pressure exerted by a mixture of gases in a container is the average of the pressures that each gas would exert if present alone under similar conditions.', 'The total pressure exerted by a mixture of gases in a container is inversely proportional to the pressure that each gas would exert if present alone under similar conditions.', 'The total pressure exerted by a mixture of gases in a container is equal to the range of partial pressures of each gas in the container.'], 1, 'Partial pressures add up to the total.', {topic:'hdalton'}),
      HQ(24, 'Same machine, different wording on the certification test. Which of the following is a statement of Dalton\'s law of partial pressure?', ['The total pressure of a mixture of gases is the sum of the partial pressure of each gas that makes up the mixture.', 'The partial pressure of a gas is equal to the total pressure of the mixture.', 'Gases can exist as mixtures at STP only.', 'The total pressure of a mixture of gases is the product of the partial pressures of each gas in the mixture.', 'In a mixture of two gases, the pressure of each gas is 1/2 the total pressure.'], 0, 'Sum, not product, average, or half.', {topic:'hdalton'}),
      HT(28, 'Dalton\'s Law states that the volume of a gas varies directly with the absolute temperature.', false, 'That is Charles\'s law. Dalton is about partial pressures.', {topic:'hdalton'}),
      HQ(18, 'Heliox (helium + oxygen) helps asthma patients because helium behaves almost ideally. Of the following gases, which will behave most like an ideal gas?', ['He', 'HF', 'N2', 'CH3Cl', 'CO'], 0, 'He is tiny, nonpolar and monatomic, so it has the weakest attractions. Polar HF and CH3Cl are the least ideal.'),
      HT(30, 'Polar gases exhibit more ideal behavior than nonpolar ones.', false, 'Polar molecules attract each other, which pulls them away from ideal behavior.'),
      HQ(48, 'In the hyperbaric chamber, raising the pressure forces more oxygen into the patient\'s blood plasma. Increasing the pressure of a gas over a solution increases the solubility of the gas. This is an example of which law?', ['Dalton\'s Law', 'Henry\'s Law', 'Tyndall\'s Law', 'Raoult\'s Law', 'Boyle\'s Law'], 1, 'Henry\'s law: solubility = k × P(gas).', {topic:'hdalton'}),
      HT(69, 'The solubility of gases in liquids increases with increasing pressure.', true, 'Henry\'s law again. That is why divers get the bends when they surface too fast.', {topic:'hdalton'})
    ]},
  { id:'tox', code:'Tx', name:'Toxicology', topics:['hgas', 'hstates'],
    intro:['Toxicology and the decontamination bay. Tonight\'s cases involve some nasty chemicals.', 'Knowing a poison\'s state of matter tells the decon team how it spreads.'],
    outro:['Decon cleared. Everyone\'s safe.', 'Below the melting point it\'s solid, between melting and boiling it\'s liquid, above boiling it\'s gas.'],
    flav:['The decon shower drains.', 'A hazmat suit hangs on its hook.', 'Dalton stays OUTSIDE the decon bay. Good dog.'],
    tasks:[
      {id:'h6', ref:'Exam #6', type:'sort', topic:'hstates', q:'Poison control calls about sarin, a nerve agent (melting point −56 °C, boiling point 158 °C). The decon team needs its state at each temperature. (On the exam: “Which statement is FALSE?” The false one was that sarin is a gas at 100 °C.)', dev:'Hazmat card', bins:[['s', 'Solid'], ['l', 'Liquid'], ['g', 'Gas']],
        items:[{s:'−100 °C', a:'s', why:'below −56 °C'}, {s:'0 °C', a:'l'}, {s:'22 °C (room temperature)', a:'l'}, {s:'100 °C', a:'l', why:'still below 158 °C'}, {s:'170 °C', a:'g', why:'above 158 °C'}], why:'Liquid anywhere between the melting point (−56 °C) and boiling point (158 °C). At 100 °C it is still a liquid.'},
      HX(16, {q:'An old hydrogen cyanide (HCN) cylinder is found in the hospital\'s chemical storage. It holds 67.0 L at 25.0 °C and registers 742 mm Hg. How many moles of HCN are inside?', v:2.672, sf:3, unit:'mol', units:['mol', 'g', 'L', 'atm', 'mm Hg', 'K'],
        work:['Convert: P = 742 mm Hg ÷ 760 = 0.9763 atm; T = 25.0 + 273 = 298 K', 'n = PV ÷ RT = (0.9763 atm × 67.0 L) ÷ (0.0821 × 298)', '= <b>2.67 mol HCN</b>']}, {topic:'hgas'}),
      HT(29, 'A child swallowed antifreeze. Ethylene glycol molecules (HO–CH2–CH2–OH) have a greater attraction for cyclopentane (C5H10) molecules than for each other.', false, 'Ethylene glycol H-bonds strongly with itself. Nonpolar cyclopentane can\'t compete. Like attracts like.', {topic:'himf'}),
      HT(35, 'Polar compounds generally have higher boiling points than nonpolar compounds of similar molecular weight.', true, 'Dipole–dipole attractions add to the dispersion forces.', {topic:'himf'})
    ]},
  { id:'clinlab', code:'Lb', name:'Clinical Lab', topics:['himf', 'hcolloid'],
    intro:['The clinical lab. Blood, syrups, sanitizers, and scrub soap.', 'Liquid behavior comes down to intermolecular forces.'],
    outro:['Lab results are out.', 'H-bonding needs H on N, O or F. Colloids scatter light.'],
    flav:['A centrifuge whirs.', 'The analyzer prints a result.', 'Dalton sits politely by the specimen fridge.'],
    tasks:[
      HQ(20, 'Ethers were the first surgical anesthetics. Which one of the following substances will NOT display hydrogen bonding?', HBOPTS, 4, 'H-bonding needs an H attached directly to N, O or F. In the ether, every H is on carbon, so it can\'t H-bond with itself.', {optLabels:['NH3', 'HF', 'H2O', 'ethanol', 'ether']}),
      HT(31, 'Cough syrup made with glycerol (three OH groups) pours slower than hand sanitizer gel thinned with ethanol (one OH). So: glycerol has a lower viscosity than ethanol.', false, 'Glycerol has three O–H groups to H-bond with. It is far MORE viscous.'),
      HT(32, 'Surgical scrub soap spreads over skin because detergents and soaps decrease the surface tension of water.', true, 'Soap molecules disrupt the H-bond network at the surface.'),
      HQ(45, 'A beam of light passes through a plasma sample and the path glows, but not through the saline. What type of liquid displays the Tyndall effect?', ['homogeneous mixture', 'heterogeneous mixture', 'solution', 'colloidal suspension', 'pure substance'], 3, 'Colloid particles (like plasma proteins) are big enough to scatter light.', {topic:'hcolloid'}),
      HT(65, 'In normal room lighting, the eye cannot distinguish a true solution from a colloidal one.', true, 'You need a light beam (the Tyndall effect) to tell them apart.', {topic:'hcolloid'})
    ]},
  { id:'pharm2', code:'Ph', name:'Pharmacy', topics:['hsoln'],
    intro:['The pharmacy. Every bottle is a solution with a label you have to read correctly.', 'Watch for the trick statements. The exam loves “which is FALSE.”'],
    outro:['Pharmacy verified.', 'Solutions can be any state and any color. Molarity means per liter of SOLUTION.'],
    flav:['The pill counter rattles.', 'A label printer chatters.', 'Dalton waits for treats. There are no treats in pharmacy.'],
    tasks:[
      HQ(37, 'The new pharmacy tech wrote five facts on the training sheet. Which statement concerning solutions is FALSE?', ['A solution is a homogeneous mixture of two or more pure substances.', 'A solution is composed of a solvent and one or more solutes.', 'A solution has its components uniformly distributed throughout the mixture.', 'A solution is likely to form when the solute and the solvent have similar polarities.', 'A solution forms when the solvent and the solute react to form a new substance with one uniform phase.'], 4, 'Dissolving is physical mixing, not a reaction. No new substance forms.'),
      HQ(55, 'Medical air, IV saline, and dental amalgam are all mixtures. Which statement concerning solutions is FALSE?', ['Solutions are homogeneous mixtures.', 'Solutions consist of solutes and solvents.', 'Solutions are always liquids.', 'Aqueous solutions have water as the solvent.', 'Solutes cannot be filtered from a solution.'], 2, 'Air is a gaseous solution; alloys are solid solutions.'),
      HQ(39, 'Another training-sheet fact check. Which statement concerning solution concentration is FALSE?', ['An unsaturated solution contains less than the maximum amount of solute that can be dissolved in the solvent.', 'A saturated solution contains more than 100 g of dissolved solute.', 'The concentration of a saturated solution is equal to the solubility of the solute.', 'A solution can be made less concentrated by adding additional solvent.', 'The molarity of a solution is the number of moles of solute present in one liter of the solution.'], 1, 'Saturated means at the solubility limit, whatever that amount is. No magic 100 g.'),
      HQ(42, 'A tech mixes 4.0 g of KNO3 with 5.0 mL of water at room temperature. Most, but not all, of the KNO3 dissolves. Which statement is TRUE?', ['The solution is considered supersaturated, since no additional KNO3 will dissolve.', 'The solution is considered unsaturated, since not all of the KNO3 dissolved.', 'The solubility of KNO3 in water has been exceeded.', 'KNO3 is a water insoluble ionic compound.', 'In order to get the additional KNO3 to dissolve, the student can add more solute.'], 2, 'Leftover solid means the solution is saturated and the solubility was exceeded.'),
      HT(67, 'The solubility of KBr at 20 °C is 60 g/100 g H2O. Increasing the temperature will likely increase the solubility of KBr.', true, 'Most solid solutes dissolve better in hotter water.'),
      HT(68, 'The solid material that separates from solution when its solubility is exceeded is called a precipitate.', true, 'That is the definition of a precipitate.'),
      HT(64, 'One liter of alcohol combined with one liter of water does NOT produce two liters of solution.', true, 'The molecules pack together through H-bonding, so the volumes don\'t simply add.'),
      HT(66, 'If a solvent is colorless, all of its true solutions will also be colorless.', false, 'Colored solutes give colored solutions: water is colorless, but iodine tincture is brown.'),
      HT(70, 'A solution that is 1 ppm contains more dissolved solute than one that is 1 ppt.', false, '1 ppt (part per thousand) is 1000 times more concentrated than 1 ppm (part per million).'),
      HQ(40, 'A stock bottle is labeled 0.2 M KNO3. What is the correct interpretation of this concentration?', ['There are 0.2 moles of KNO3 in 100 mL of water.', 'There are 0.2 g of KNO3 in 100 mL of solution.', 'There are 0.2 molecules of KNO3 in 1 L of solution.', 'There are 0.2 g of KNO3 in 1 L of water.', 'There are 0.2 moles of KNO3 in 1 L of solution.'], 4, 'Molarity is moles of solute per liter of SOLUTION.', {topic:'hmolar'}),
      HC(41, {q:'Check the label: 300.0 mL of that stock contains {x} g of KNO3. What is its molarity? [Formula weight: KNO3, 101.101 amu]', x:'16.8', u0:'g KNO3', f:[['1', 'mol KNO3', '101.101', 'g KNO3'], ['1000', 'mL', '300.0', 'mL']], ru:'mol KNO3/L', unit:'M', units:UCO}, {topic:'hmolar'})
    ]},
  { id:'compound', code:'Cp', name:'Compounding Lab', topics:['hmolar'],
    intro:['The compounding lab, where the pharmacy makes what it can\'t buy ready-made.', 'Molarity, moles and dilution. Measure twice, pour once.'],
    outro:['Everything compounded and double-checked.', 'M = mol ÷ L. M1V1 = M2V2. Adding water always lowers concentration.'],
    flav:['A balance beeps.', 'A volumetric flask gets topped off.', 'Dalton\'s tail knocks a stir bar off the bench.'],
    tasks:[
      HC(51, {q:'The lab\'s drain cleaner: 2.00 L of solution contains {x} g of NaOH. What is the molarity? [Formula weight: NaOH, 39.997 amu]', x:'200.0', u0:'g NaOH', f:[['1', 'mol NaOH', '39.997', 'g NaOH'], ['1', '', '2.00', 'L']], ru:'mol NaOH/L', unit:'M', units:UCO, sf:3, sfWhy:'2.00 L has 3 sig figs'}),
      HC(58, {q:'A fluoride stock contains {x} mol of NaF dissolved in 750.0 mL of solution. What is the molarity?', x:'4.50', u0:'mol NaF', f:[['1000', 'mL', '750.0', 'mL']], ru:'mol NaF/L', unit:'M', units:UCO}),
      HC(63, {q:'A wound-care procedure needs {x} moles of acetic acid. What volume of 1.50 M acetic acid provides this amount?', x:'0.725', u0:'mol', f:[['1', 'L', '1.50', 'mol']], ru:'L', unit:'L', units:UCO}),
      HC(52, {q:'You need {x} mL of 2.50 M HCl, made from the 12.0 M stock. What volume of 12.0 M HCl is required?', x:'250.0', u0:'mL', f:[['2.50', 'M', '12.0', 'M']], ru:'mL', unit:'mL', units:UCO, sf:3, sfWhy:'2.50 and 12.0 have 3 sig figs', notes:['Dilution: V1 = M2V2 ÷ M1']}),
      HC(59, {q:'Then {x} mL of 18.0 M HCl is diluted with enough water to make 500.0 mL. What is the new molarity?', x:'10.0', u0:'mL', f:[['18.0', 'M', '500.0', 'mL']], ru:'M', unit:'M', units:UCO, notes:['Dilution: M2 = M1V1 ÷ V2']}),
      HQ(57, 'Someone added an unrecorded amount of water to 75 mL of 3.5 M sodium chloride. What can be said for certain about the resulting concentration?', ['The concentration of the resulting solution will be less than 3.5 M.', 'The concentration of the resulting solution will be greater than 3.5 M.', 'The concentration of the resulting solution will be 0.26 M.', 'The concentration of the resulting solution will be 3.5 M because the amount of glucose has not changed.', 'It is impossible to say anything for certain about the concentration because the amount of water that was added is unknown.'], 0, 'Same moles, more volume: the concentration must drop, even if you don\'t know by how much.'),
      HC(62, {q:'Clinical nutrition is checking a diabetic patient\'s breakfast. The jam label says {x} g of sucrose per tablespoon (15 mL). What is the molarity of sucrose in the jam? [Molar mass: sucrose, 342.281 g/mol]', x:'13', u0:'g sucrose', f:[['1', 'mol sucrose', '342.281', 'g sucrose'], ['1000', 'mL', '15', 'mL']], ru:'mol/L', unit:'M', units:UCO})
    ]},
  { id:'infuse', code:'If', name:'Infusion Center', topics:['hpct'],
    intro:['The infusion center. IV bags are labeled in % (m/V): grams per 100 mL.', 'D5W is 5 % glucose. Normal saline is 0.9 % NaCl.'],
    outro:['All the bags are hung.', '% (m/V) = g ÷ mL × 100. Rearrange it for whatever is missing.'],
    flav:['An IV pump beeps for a refill.', 'A nurse flicks a line to clear a bubble.', 'Dalton naps under the infusion chairs.'],
    tasks:[
      HX(38, {q:'A fluoride rinse contains 1.65 g of NaF in a total volume of 150.0 mL. What is its concentration in % (m/V)?', v:1.1, sf:3, unit:'%', units:UCO, work:['% (m/V) = 1.65 g ÷ 150.0 mL × 100 = <b>1.10 %</b>']}),
      HC(46, {q:'How much glucose is in a {x} mL bag of 5.00 % (m/V) D5W?', x:'500.0', u0:'mL', f:[['5.00', 'g glucose', '100', 'mL']], ru:'g glucose', unit:'g', units:UCO, sf:3, sfWhy:'5.00 % has 3 sig figs'}),
      HX(49, {q:'Calculate the % (m/V) of a NaCl solution made by dissolving 15.0 g of sodium chloride in enough water to make 300.0 mL.', v:5.0, sf:3, unit:'%', units:UCO, work:['15.0 g ÷ 300.0 mL × 100 = <b>5.00 %</b>', 'At 5 %, this is hypertonic. Not for an IV.']}),
      HC(50, {q:'How many grams of NaCl are in a {x} mL bag of 0.900 % (m/V) normal saline?', x:'500.0', u0:'mL', f:[['0.900', 'g NaCl', '100', 'mL']], ru:'g NaCl', unit:'g', units:UCO, sf:3, sfWhy:'0.900 % has 3 sig figs'}),
      HC(60, {q:'A patient needs {x} g of glucose over the next 12 hours. What volume of 5.0 % (m/V) glucose should be administered?', x:'100.0', u0:'g glucose', f:[['100', 'mL', '5.0', 'g glucose'], ['1', 'L', '1000', 'mL']], ru:'L', unit:'L', units:UCO, sf:2, sfWhy:'5.0 % has 2 sig figs'}),
      HQ(54, 'The charge nurse asks why both IV bags are safe to run into a vein. How are 0.15 M NaCl, 0.30 M glucose, and intracellular fluids similar?', ['They are all saturated.', 'They are all hypotonic.', 'They are all hypertonic.', 'They are all isotonic.', 'They are all supersaturated.'], 3, '0.15 M NaCl makes 0.30 M of particles, the same as 0.30 M glucose and the inside of a cell: isotonic.', {topic:'hosmo'})
    ]},
  { id:'cardio', code:'Cd', name:'Cardiology', topics:['hlyte'],
    intro:['Cardiology. A cardiac arrest just rolled in. Calcium chloride is on the crash cart.', 'Electrolytes carry the heart\'s electrical signals.'],
    outro:['The patient has a rhythm again.', 'Ionic compounds dissolve as separate ions: CaCl2 gives one Ca^2+ and two Cl^-.'],
    flav:['The monitor beeps steadily now.', 'Someone wheels the crash cart back.', 'Dalton rests his head on the patient\'s bed. Allowed, this time.'],
    tasks:[
      HC(61, {q:'Cardiac arrest victims are sometimes treated by injecting calcium chloride directly into the heart muscle. If {x} mL of 5.0 % (m/V) CaCl2 is given, what mass of CaCl2 was provided?', x:'2.0', u0:'mL', f:[['5.0', 'g CaCl2', '100', 'mL']], ru:'g CaCl2', unit:'g', units:UCO}, {topic:'hpct', timed:150, timeWhy:'Code in progress. The doctor needs the dose confirmed in 2½ minutes.'}),
      HQ(47, 'The resident sketches the syringe contents on the whiteboard. Which diagram best represents an aqueous calcium chloride (CaCl2) solution? (White = Ca^2+, dark = Cl^-; water not shown.)', CACL, 1, 'CaCl2 dissociates completely into separate ions, one Ca^2+ for every two Cl^-. No intact units, and no Cl2 molecules.', {optLabels:['3:3 ions', '2:4 ions', 'intact units', 'Cl2 molecules', 'CaCl pairs']}),
      HQ(56, 'The new intern\'s notes about electrolytes have one error. Which statement is FALSE?', ['Water-soluble ionic compounds are electrolytes.', 'NaCl is an electrolyte.', 'Nonelectrolytes do not dissociate when dissolved in water.', 'Ionic compounds are typically insoluble in water.', 'When KI dissolves in water, the solution conducts electricity.'], 3, 'Many ionic compounds dissolve in water. That is exactly why our blood is full of electrolytes.')
    ]},
  { id:'dialysis', code:'Dy', name:'Dialysis Unit', topics:['hosmo'],
    intro:['The dialysis unit. A membrane filters the blood of patients whose kidneys have failed.', 'Water moves toward the side with more solute.'],
    outro:['Dialysis is running smoothly.', 'Osmosis goes from dilute to concentrated. Colligative effects count particles, not mass.'],
    flav:['The dialysis machine hums.', 'A filter cartridge gets swapped.', 'Dalton gets a scratch from a regular patient.'],
    tasks:[
      HQ(43, 'The dialyzer\'s filter lets water through but holds back larger solutes. What type of membrane allows solvent molecules through but not solute molecules?', ['transport', 'colloidal', 'transparent', 'semipermeable', 'filtering'], 3, 'A semipermeable membrane passes solvent but not solute.'),
      HQ(44, 'The patient\'s blood (hypertonic) sits across the membrane from a dilute fluid (hypotonic). What happens?', ['Water molecules move from the hypotonic solution to the hypertonic solution.', 'Solute molecules move from the hypertonic solution to the hypotonic solution.', 'Water molecules move from the hypertonic solution to the hypotonic solution.', 'Solute molecules move from the hypotonic solution to the hypertonic solution.', 'No net movement of solvent or solute molecules occurs, because the osmotic pressure on both sides is equal.'], 0, 'Water moves toward more solute: from hypotonic to hypertonic.'),
      HQ(53, 'Why does a dialysis fluid with dissolved solutes evaporate more slowly than pure water? What law states that the vapor pressure of the solvent decreases in proportion to the concentration of the solute?', ['Dalton\'s Law', 'Henry\'s Law', 'Tyndall\'s Law', 'Raoult\'s Law', 'Boyle\'s Law'], 3, 'Raoult\'s law: solute particles lower the solvent\'s vapor pressure.'),
      HT(73, 'Osmosis is the movement of a solvent through a semipermeable membrane from a region of higher solute concentration to one of lower solute concentration.', false, 'Backwards. Water moves from LOWER solute concentration to HIGHER.'),
      HT(74, 'Osmosis is the process that regulates the sodium/potassium ratio in living cells.', false, 'The Na^+/K^+ ratio is kept by active transport (the sodium–potassium pump), which uses energy.'),
      HT(71, 'An aqueous solution containing a nonvolatile solute such as sucrose (like the dextrose in dialysate) will boil above 100 °C at 1 atm.', true, 'Boiling point elevation: solute particles raise the boiling point.'),
      HT(72, 'The heavier the solute molecule is, the greater its effect on the freezing point depression of a solution.', false, 'Colligative properties depend on the NUMBER of particles, not their mass.')
    ]},
  { id:'code', code:'Cb', name:'Code Blue', topics:[], final:true,
    intro:['Mass-casualty alert. Ambulances are lining up and every department needs you at once.', 'Real exam conditions: every question is timed. Each one you get right stabilizes a patient.', 'Both chapters, mixed together. Deep breath. Let\'s go.'],
    outro:[], tasks:[] }
];
MED_MODS.forEach(m => m.tasks.forEach(t => { if (!t.topic) t.topic = m.topics[0]; }));

/* Labels for picture-only options, and figures that are plain HTML */
{
  const qh2 = questionHTML;
  questionHTML = function(){ const t = ui.t; return qh2() + (t && t.figHTML ? t.figHTML : ''); };
}

/* Extra practice for reroutes */
EXTRA.push(
  HC('x1', {q:'An O2 sample at {x} atm occupies 6.00 L. What pressure compresses it to 2.40 L at the same temperature?', x:'1.00', u0:'atm', f:[['6.00', 'L', '2.40', 'L']], ru:'atm', unit:'atm', units:UPR}, {topic:'hgas'}),
  HC('x2', {q:'A {x} mL bag of 0.900 % (m/V) saline. How many grams of NaCl?', x:'250.0', u0:'mL', f:[['0.900', 'g NaCl', '100', 'mL']], ru:'g NaCl', unit:'g', units:UCO, sf:3}, {topic:'hpct'}),
  HC('x3', {q:'How many mL of 6.00 M stock are needed to make {x} mL of 0.300 M solution?', x:'500.0', u0:'mL', f:[['0.300', 'M', '6.00', 'M']], ru:'mL', unit:'mL', units:UCO, sf:3}, {topic:'hmolar'}),
  HQ('x4', 'Which change will DECREASE the pressure of a gas in a sealed, rigid tank?', ['heating the tank', 'adding more gas', 'cooling the tank', 'squeezing the gas into a smaller tank', 'none of these'], 2, 'At fixed volume, P ∝ T(K). Cooling lowers the pressure.', {topic:'hgas'}),
  HT('x5', 'A 0.9 % NaCl IV solution is isotonic with red blood cells.', true, 'That is why it is called normal saline.', {topic:'hosmo'}),
  HT('x6', 'Adding more solvent to a solution increases its molarity.', false, 'More solvent means the same moles in more volume: molarity goes down.', {topic:'hmolar'}),
  HQ('x7', 'Which gas law explains why a sealed bag of chips puffs up on a plane at altitude (lower outside pressure)?', ['Boyle\'s Law', 'Charles\'s Law', 'Avogadro\'s Law', 'Dalton\'s Law', 'Henry\'s Law'], 0, 'Lower pressure, bigger volume: Boyle.', {topic:'hgas'}),
  HT('x8', 'An amorphous solid, such as glass, has a regular repeating structure.', false, 'Amorphous means no long-range order.', {topic:'hsolid'})
);
EXTRA.forEach(t => { if (/^hx\d/.test(t.id)) delete t.ref; });

/* ---------- Hospital art ---------- */
const WARD = new Set(['sterile', 'resp', 'hyper', 'tox', 'clinlab', 'pharm2', 'compound', 'infuse', 'cardio', 'dialysis', 'code', 'breakrm']);
function wardBase(k, ctx, t, o){
  k.r(0, 0, 80, 40, '#c8e0dc'); k.r(0, 18, 80, 2, '#9ac8c0'); for (let x = 0; x < 80; x += 10) k.r(x, 20, 1, 14, '#b8d4d0');
  k.r(0, 34, 80, 6, '#d8dce4'); for (let x = 0; x < 80; x += 8){ k.r(x, 34, 1, 6, '#c0c6d2'); } k.r(0, 37, 80, 1, '#c0c6d2');
  const lit = o.lit > 0 && !(o.lit < 1 && Math.random() < .12);
  [16, 56].forEach(x => { k.r(x, 0, 12, 2, lit ? '#f4fbff' : '#8b93af'); if (lit){ ctx.fillStyle = 'rgba(244,251,255,.08)'; for (let i = 0; i < 5; i++) ctx.fillRect(x - i, 2 + i * 6, 12 + i * 2, 6); } });
  k.r(70, 6, 6, 4, '#e43b44'); k.r(72, 5, 2, 6, '#eef0f8'); k.r(71, 7, 4, 2, '#eef0f8');
}
const RD = C.sr;
Object.assign(DEV, {
  sterile(k, t, o){ const a = act(o, t);
    k.r(6, 10, 26, 24, '#8b93af'); k.r(8, 12, 22, 18, '#5a6988'); k.circ(19, 21, 6, '#3a4466'); k.circ(19, 21, 4, a ? '#9ff7ff' : '#1a2a3a'); k.r(28, 14, 2, 4, a ? C.ba : RD);
    if (a) for (let i = 0; i < 3; i++) k.p(14 + i * 5, 9 - ((t * 6 + i * 2) % 6), '#eef0f8');
    k.r(40, 26, 30, 2, '#c0cbdc'); for (let i = 0; i < 5; i++) k.r(42 + i * 5, 23, 3, 3, '#8b93af'); k.r(42, 28, 2, 6, '#8b93af'); k.r(66, 28, 2, 6, '#8b93af'); o.sx = 19; o.sy = 20; },
  resp(k, t, o){ const a = act(o, t);
    [[8, '#63c74d'], [15, '#63c74d'], [22, '#eef0f8']].forEach(([x, c]) => { k.r(x, 12, 5, 22, c); k.r(x + 1, 10, 3, 2, '#8b93af'); });
    k.r(38, 12, 20, 18, '#eef0f8'); k.r(40, 14, 16, 8, '#0b1a14'); const by = a ? Math.round(Math.sin(t * 3) * 3) : 0; k.r(43, 24 + by, 10, 4, '#2ce8f5');
    for (let x = 0; x < 16; x++) k.p(40 + x, 18 + (a ? Math.round(Math.sin(x / 2 + t * 4) * 2) : 0), C.ba);
    k.line(58, 22, 70, 28, '#c0cbdc'); o.sx = 48; o.sy = 18; },
  hyper(k, t, o){ const a = act(o, t);
    k.r(6, 12, 50, 18, '#5a6988'); k.circ(6, 21, 9, '#5a6988'); k.circ(56, 21, 9, '#5a6988'); k.r(10, 14, 44, 14, '#8b93af');
    for (let i = 0; i < 3; i++) k.circ(18 + i * 13, 21, 3, a || o.lit >= 1 ? '#9ff7ff' : '#3a4466');
    k.r(64, 12, 8, 18, '#3a4466'); k.r(65, 14, 6, 6, a ? C.ba : '#1a2a3a'); o.sx = 30; o.sy = 20; },
  tox(k, t, o){ const a = act(o, t);
    k.r(10, 6, 24, 2, '#8b93af'); k.r(21, 8, 2, 4, '#8b93af'); if (a || o.lit >= 1) for (let i = 0; i < 8; i++){ const ph = (t * 1.5 + i * .13) % 1; k.p(14 + i * 2, 12 + ph * 20, '#5fc8ff'); }
    k.r(8, 32, 28, 2, '#3a4466'); k.r(46, 10, 12, 22, '#feae34'); k.r(48, 12, 8, 6, '#2ce8f5'); k.r(44, 16, 2, 10, '#feae34'); k.r(58, 16, 2, 10, '#feae34');
    k.r(64, 14, 10, 12, '#feae34'); k.line(64, 14, 73, 25, '#2a1a0a'); k.p(69, 16, '#2a1a0a'); o.sx = 52; o.sy = 18; },
  clinlab(k, t, o){ const a = act(o, t);
    k.r(4, 26, 50, 3, '#eef0f8'); k.r(8, 16, 8, 10, '#3a4466'); k.r(10, 12, 4, 4, '#5a6988'); k.r(9, 24, 6, 2, '#c0cbdc');
    for (let i = 0; i < 6; i++){ k.r(22 + i * 4, 18, 2, 8, '#c0cbdc'); k.r(22 + i * 4, 21 + (i % 3), 2, 5 - (i % 3), ['#e43b44', '#feae34', '#63c74d'][i % 3]); }
    k.circ(64, 22, 7, '#8b93af'); k.circ(64, 22, 5, '#3a4466'); const an = a ? t * 12 : 0; k.line(64, 22, 64 + Math.cos(an) * 4, 22 + Math.sin(an) * 4, '#eef0f8'); o.sx = 30; o.sy = 20; },
  pharm2(k, t, o){ const a = act(o, t);
    [10, 20].forEach((y, r) => { k.r(4, y, 46, 1, '#8b93af'); for (let i = 0; i < 7; i++) k.r(6 + i * 6, y - 6, 4, 6, ['#feae34', '#eef0f8', '#e43b44', '#2ce8f5', '#63c74d', '#b55088', '#eef0f8'][(i + r * 3) % 7]); });
    k.r(4, 26, 46, 8, '#8a6a4a'); k.r(56, 22, 16, 12, '#eef0f8'); k.r(58, 24, 12, 4, a ? C.ba : '#3a4466'); o.sx = 26; o.sy = 16; },
  compound(k, t, o){ const a = act(o, t);
    k.r(4, 26, 50, 3, '#eef0f8'); k.r(10, 14, 6, 12, '#c0cbdc'); k.circ(13, 22, 4, '#c0cbdc'); k.r(10, 20, 6, 6, '#2ce8f5'); k.circ(13, 22, 3, '#2ce8f5');
    k.r(24, 16, 3, 10, '#c0cbdc'); k.r(24, a ? 19 : 22, 3, a ? 7 : 4, '#feae34'); k.r(34, 20, 10, 6, '#5a6988'); k.r(36, 18, 6, 2, '#c0cbdc');
    if (a && Math.floor(t * 4) % 2) k.p(39, 16, C.ba); o.sx = 20; o.sy = 20; },
  infuse(k, t, o){ const a = act(o, t);
    [12, 34, 56].forEach((x, i) => { k.r(x + 4, 4, 1, 26, '#8b93af'); k.r(x + 1, 6, 7, 9, '#eef8ff'); k.r(x + 2, 9, 5, 6, i === 1 ? '#fff0c0' : '#bfe6ff'); k.line(x + 4, 15, x + 4, 24, '#c0cbdc');
      if (a || o.lit >= 1){ const ph = (t * 1.3 + i * .3) % 1; k.p(x + 4, 15 + ph * 9, C.cu); } k.r(x - 2, 26, 14, 6, '#b55088'); k.r(x - 2, 24, 5, 2, '#b55088'); });
    o.sx = 38; o.sy = 12; },
  cardio(k, t, o){ const a = act(o, t), ok = a || o.lit >= 1;
    k.r(8, 6, 28, 16, '#3a4466'); k.r(9, 7, 26, 14, '#0b1a14');
    for (let x = 0; x < 26; x++){ const ph = (x + Math.floor(t * 12)) % 13, y = ok ? (ph === 5 ? 9 : ph === 6 ? 18 : ph === 7 ? 11 : 14) : 14; k.p(9 + x, y, ok ? C.ba : (Math.floor(t * 2) % 2 ? RD : '#5a1a20')); }
    k.r(44, 26, 30, 4, '#eef0f8'); k.r(44, 24, 30, 2, '#c0cbdc'); k.r(68, 21, 6, 3, '#eef0f8'); k.r(48, 14, 10, 8, '#e43b44'); k.r(50, 16, 6, 4, '#eef0f8'); o.sx = 22; o.sy = 14; },
  dialysis(k, t, o){ const a = act(o, t);
    k.r(10, 8, 18, 26, '#eef0f8'); k.r(12, 10, 14, 6, '#3a4466'); k.r(13, 11, 12, 4, a ? C.ba : '#1a2a3a');
    k.circ(19, 24, 4, '#c0cbdc'); const an = a ? t * 6 : 0; k.line(19, 24, 19 + Math.cos(an) * 3, 24 + Math.sin(an) * 3, RD);
    k.r(30, 14, 4, 14, '#bfe6ff'); k.line(28, 20, 44, 24, RD); k.line(34, 22, 44, 26, '#5fc8ff');
    k.r(44, 24, 28, 6, '#b55088'); k.r(44, 20, 8, 4, '#b55088'); o.sx = 19; o.sy = 18; },
  code(k, t, o){ const a = act(o, t) || o.warp;
    k.r(4, 14, 30, 12, '#eef0f8'); k.r(4, 26, 30, 2, '#8b93af'); k.circ(10, 30, 2, '#3a4466'); k.circ(28, 30, 2, '#3a4466'); k.r(6, 10, 10, 4, '#e43b44');
    k.r(44, 10, 24, 22, '#e43b44'); k.r(46, 12, 20, 6, '#3a4466'); for (let x = 0; x < 20; x++) k.p(46 + x, 15 + (a ? Math.round(Math.sin(x + t * 8) * 2) : 0), C.ba);
    if (o.alarm && Math.floor(t * 4) % 2){ k.r(0, 0, 80, 2, RD); }
    if (o.charge != null){ k.r(10, 36, 60, 1, C.dark); k.r(10, 36, Math.round(60 * o.charge), 1, C.ba); } o.sx = 56; o.sy = 16; },
  breakrm(k, t, o){ const a = act(o, t);
    k.r(8, 22, 30, 4, '#8a6a4a'); k.r(10, 26, 2, 8, '#5c3a24'); k.r(34, 26, 2, 8, '#5c3a24');
    k.r(14, 16, 6, 6, '#eef0f8'); k.r(20, 18, 2, 2, '#eef0f8'); k.r(15, 17, 4, 2, '#5c3a24'); if (a || o.lit > .5) for (let i = 0; i < 3; i++) k.p(16 + i, 14 - ((t * 4 + i) % 4), '#eef0f8');
    k.r(48, 12, 18, 22, '#5a6988'); k.r(50, 14, 14, 8, '#3a4466'); k.r(52, 24, 10, 6, '#8b93af'); k.r(56, 28, 2, 2, a ? C.ba : RD); o.sx = 30; o.sy = 18; }
});
{
  const dr = drawRoom;
  drawRoom = function(ctx, id, t, o){
    if (!WARD.has(id)) return dr(ctx, id, t, o);
    const k = K(ctx); wardBase(k, ctx, t, o); DEV[id](k, t, o);
    const dark = .55 * (1 - Math.min(1, o.lit)); if (dark > 0){ ctx.fillStyle = `rgba(5,6,16,${dark})`; ctx.fillRect(0, 0, 80, 40); }
    if (o.alarm){ const on = Math.floor(t * 3) % 2 === 0; if (on){ ctx.fillStyle = 'rgba(228,59,68,.12)'; ctx.fillRect(0, 0, 80, 40); } }
    if (o.failUntil && t < o.failUntil){ ctx.fillStyle = 'rgba(228,59,68,.28)'; ctx.fillRect(0, 0, 80, 40); }
  };
}

/* Dalton, the hospital therapy dog (18×16) */
function drawDalton(ctx, t){
  const k = K(ctx); ctx.clearRect(0, 0, 18, 16);
  const e = molly.expr, fur = '#d8a050', dk = '#a86e28';
  const flop = e === 'happy' ? -1 : 0;
  k.r(1, 3 + flop, 3, 7, dk); k.r(14, 3 + flop, 3, 7, dk);
  k.r(4, 2, 10, 10, fur); k.r(3, 4, 12, 7, fur);
  k.r(6, 8, 6, 5, '#f0d4a0'); k.r(7, 8, 4, 2, '#2a1a0a');
  const blink = (t % 3.6) < .13, ey = e === 'worried' ? 6 : 5;
  if (blink){ k.r(5, 6, 2, 1, '#2a1a0a'); k.r(11, 6, 2, 1, '#2a1a0a'); }
  else if (e === 'happy'){ k.p(5, 6, '#2a1a0a'); k.p(6, 5, '#2a1a0a'); k.p(11, 5, '#2a1a0a'); k.p(12, 6, '#2a1a0a'); }
  else { k.r(5, ey, 2, 2, '#2a1a0a'); k.r(11, ey, 2, 2, '#2a1a0a'); k.p(5, ey, '#eef0f8'); k.p(11, ey, '#eef0f8'); if (e === 'smug') k.r(11, ey, 2, 1, fur); }
  const talk = t < molly.talkUntil && Math.floor(t * 10) % 2;
  if (talk || e === 'happy'){ k.r(8, 11, 2, 2, '#e46a7a'); }
  k.r(3, 13, 12, 3, '#2ce8f5'); k.r(8, 13, 2, 3, '#eef0f8'); k.p(9, 14, RD);
}
function drawHospital(ctx, t, lit){
  const k = K(ctx); ctx.clearRect(0, 0, 48, 64);
  k.r(6, 14, 36, 46, '#c8e0dc'); k.r(6, 14, 36, 2, '#9ac8c0'); k.r(18, 6, 12, 8, '#c8e0dc');
  k.r(21, 7, 6, 6, '#e43b44'); k.r(23, 7, 2, 6, '#eef0f8'); k.r(21, 9, 6, 2, '#eef0f8');
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++){ const on = (r * 4 + c) / 20 < lit || ((r + c + Math.floor(t)) % 7 === 0); k.r(10 + c * 8, 19 + r * 7, 4, 4, on ? '#feae34' : '#3a4466'); }
  k.r(20, 52, 8, 8, '#3a4466'); k.r(0, 60, 48, 4, '#5a6988');
  if (Math.floor(t * 3) % 2) k.p(24, 4, RD);
}

/* ---------- Campaign ---------- */
BADGES.push({id:'shift', name:'Shift Survived', d:'Clear the Code Blue at Mercy General.', c:C.ba});
CAMPS.med = { id:'med', title:'Night Shift at Mercy General', tag:'Unit 3 practice exam · Ch. 5–6 · exam conditions', mods:MED_MODS, pal:'DALTON', art:'hospital', unitWord:'departments',
  layout:[['#Floor 1 · Support services'], ['sterile'], ['resp'], ['hyper'], ['tox'], ['clinlab'], ['#Floor 2 · Pharmacy & infusion'], ['pharm2'], ['compound'], ['infuse'], ['#Floor 3 · Critical care'], ['cardio'], ['dialysis'], ['#Emergency'], ['code']], shape:'route',
  timerDefault:true, examCalc:180, examOther:60, allTimed:{mc:60, tf:30, calc:180, numval:45, sort:90, other:75},
  repair:{ id:'breakrm', code:'Br', name:'Break Room', topics:[], repair:true, tasks:[] },
  repairLines:['This one tripped you up earlier. Same numbers. Take a breath.', 'Coffee in hand, same question as before. No clock in here.', 'Woof. You missed this one. Let\'s get it right.'],
  repairIntro:['Every miss drains your stamina.', 'In the break room you redo the exact same question, untimed. Get it right and you get +15 stamina back.', 'Miss it and it stays on the break-room board. Nothing costs stamina in here.'],
  boot:['Woof! You must be the new resident. I\'m Dalton, Mercy General\'s therapy dog. Named after Dalton\'s law, because the nurses are nerds.',
    'Tonight\'s night shift is your practice exam: every question from the Unit 3 practice test, from Central Sterile up to Critical Care.',
    'This is exam conditions. Every question has a clock: about a minute for concepts, three for calculations. No formula hints. The data sheet is your only crib, like the real test.',
    'Concept questions use the exam\'s own A–E format. Calculations you type in, sig figs and units included.',
    'Misses drain your stamina. Recover it in the break room by redoing what you missed, with no clock. Let\'s start rounds!'],
  bootExpr:['happy', 'neutral', 'alarm', 'neutral', 'happy'], bootRoom:'sterile', firstLine:'First stop: Central Sterile, at the top of the board.', finalBadge:'shift',
  w:{ hull:'stamina', Hull:'Stamina', hudHull:'HP', firstTry:'Exam first-try', nrg:'Coffee', energy:'coffee', crack:'miss', cracks:'misses', Bay:'Break room', bay:'break room', weld:'redo', map:'Hospital board', charge:'Patients stabilized', go:'Respond to the code', start:'Start rounds', unit:'Dept', online:'cleared',
    fixed:'★ Correct', fault:'✗ Incorrect', startWeld:'Start redoing', doneWeld:'Break over', patched:'Recovered', patchFail:'Still not it. It stays on the break-room board.', added:'Added to the break-room board. Redo it there, untimed, to win your stamina back.',
    failHull:'Exhausted! Emergency espresso', check:'Code Blue', restored:'cleared', mid:'in progress', weldMore:'Redo more', welded:'Redone', cracksLeft:'Misses left', perWeld:'Per redo' },
  dev:{ tf:'True or false', classify:'Chart', mc:'Exam question', numval:'Chart', net:'Sample', choice:'Choose', nums:'Chart', balance:'Chart', form:'Chart', eq:'Chart', build:'Chart', lp:'Chart', dots:'Chart', cloze:'Chart' },
  units:['M', '%', 'g', 'mL', 'L', 'mol', 'atm'],
  ending(pct, patches){
    if (pct >= 85 && patches === 0) return ['Shift complete', ['Every patient stable and you never ran out of steam. That was exam-ready.', 'You\'re ready for the Unit 3 exam. A remix the night before keeps it sharp.']];
    if (pct >= 70) return ['You made it to morning', ['The shift went well, with a few rough patches.', 'Check the study report for weak topics, then redo the break-room board.']];
    return ['Long night', ['We got through it, barely. Coffee helped.', 'Work through the study report and the break room, then run the shift again.']];
  }
};
['sterile', 'resp', 'hyper', 'tox', 'clinlab', 'pharm2', 'compound', 'infuse', 'cardio', 'dialysis', 'code', 'breakrm'].forEach(id => { DEVNAME[id] = 'Exam question'; VERB[id] = 'Submit'; });
{
  const ma2 = mount;
  mount = function(){
    ma2();
    view.querySelectorAll('canvas[data-art="hospital"]').forEach(c => { const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawHospital(ctx, t, +c.dataset.lit)}); });
    if (CAMP.id === 'med') view.querySelectorAll('canvas[data-molly]').forEach(c => { anims.forEach(a => { if (a.el === c) anims.delete(a); }); const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawDalton(ctx, t)}); });
  };
}

