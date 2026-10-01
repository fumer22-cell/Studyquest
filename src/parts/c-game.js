
/* ========================================================================
   STATE
   ======================================================================== */
const KEY = 'avogadro-station-v1';
function fresh(){ return { v:2, remix:false, hull:100, energy:20, patches:0, done:[], stats:{}, score:{n:0, ok:0}, missed:{}, cur:null, finished:false,
  xp:0, streak:0, best:0, calcStreak:0, badges:[], sound:true, timer:false, wrongs:[], parked:null, camp:'station', saved:{} }; }
function load(){ try { const s = localStorage.getItem(KEY); return s ? Object.assign(fresh(), JSON.parse(s)) : null; } catch (e) { return null; } }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
let st = load() || fresh();
let ui = {};
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========================================================================
   SOUND — tiny chiptune synth, no files
   ======================================================================== */
const SND = {
  ctx:null,
  init(){ if (this.ctx) return; try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} },
  tone(f, d, type = 'square', v = .05, f2 = null, delay = 0){
    const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .02);
  },
  noise(d, v = .05, delay = 0){
    const c = this.ctx, n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = v; s.connect(g); g.connect(c.destination); s.start(c.currentTime + delay);
  },
  play(n){
    if (!st.sound) return; this.init(); if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const T = (...a) => this.tone(...a);
    switch (n){
      case 'tap': T(520, .04, 'square', .03); break;
      case 'key': T(880, .03, 'square', .025); break;
      case 'type': T(1400, .012, 'square', .006); break;
      case 'ok': [523, 659, 784, 1047].forEach((f, i) => T(f, .09, 'square', .045, null, i * .07)); break;
      case 'combo': [784, 988, 1175, 1568, 2093].forEach((f, i) => T(f, .08, 'square', .045, null, i * .05)); break;
      case 'minor': T(330, .12, 'square', .05); T(262, .18, 'square', .05, null, .13); break;
      case 'fail': T(220, .4, 'sawtooth', .06, 55); this.noise(.3, .05); break;
      case 'jam': this.noise(.18, .07); T(110, .18, 'square', .05); break;
      case 'pop': T(300, .07, 'square', .04, 1100); break;
      case 'zip': T(200, .15, 'square', .03, 900); break;
      case 'power': T(110, .6, 'square', .045, 880); [523, 784, 1047, 1568].forEach((f, i) => T(f, .12, 'square', .04, null, .55 + i * .09)); break;
      case 'badge': [659, 784, 1047, 1319, 1568].forEach((f, i) => T(f, .1, 'triangle', .07, null, i * .08)); break;
      case 'alarm': T(880, .15, 'square', .035); T(660, .15, 'square', .035, null, .17); break;
      case 'zap': this.noise(.25, .04); T(1500, .3, 'sawtooth', .025, 300); break;
      case 'warp': T(60, 2, 'sawtooth', .05, 2400); this.noise(1.8, .035); break;
      case 'tick': T(1000, .03, 'square', .025); break;
      case 'rank': [392, 523, 659, 784, 1047, 784, 1047].forEach((f, i) => T(f, .11, 'square', .05, null, i * .09)); break;
    }
  }
};

/* ========================================================================
   PIXEL ART KIT
   ======================================================================== */
const C = { wall:'#262b44', seam:'#1b1f35', ceil:'#3a4466', floor:'#3a4466', floorD:'#2a3150', steel:'#8b93af', steelD:'#5a6988', pale:'#c0cbdc', white:'#eef0f8',
  dark:'#0b0d1a', na:'#feae34', cu:'#2ce8f5', sr:'#e43b44', srD:'#6a1a22', ba:'#63c74d', blue:'#0099db', orange:'#f77622', pink:'#b55088', brown:'#8a4b2a', brownL:'#b86f50', brownD:'#5c2e1a', yel:'#fee761' };
function K(ctx){
  return {
    r(x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
    p(x, y, c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); },
    line(x0, y0, x1, y1, c){
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; let e = dx + dy; ctx.fillStyle = c;
      for (let n = 0; n < 400; n++){ ctx.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy){ e += dy; x0 += sx; } if (e2 <= dx){ e += dx; y0 += sy; } }
    },
    circ(cx, cy, r, c){ ctx.fillStyle = c; for (let y = -r; y <= r; y++){ const w = Math.floor(Math.sqrt(r * r - y * y) + .5); ctx.fillRect(cx - w, cy + y, 2 * w + 1, 1); } },
    ring(cx, cy, r, c){ ctx.fillStyle = c; for (let a = 0; a < 6.283; a += .5 / r) ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); }
  };
}
const act = (o, t) => o.lit >= 1 || o.live || (o.okUntil && t < o.okUntil);

/* Rooms are drawn at 80×40 and scaled up with nearest-neighbour. */
const DEV = {
  med(k, t, o){
    const a = act(o, t);
    k.r(50, 8, 18, 11, C.steelD); k.r(51, 9, 16, 9, C.dark);
    for (let x = 0; x < 16; x++){
      let y = 13; if (a){ const ph = (x + Math.floor(t * 14)) % 16; y = ph === 5 ? 10 : ph === 6 ? 16 : ph === 7 ? 11 : 13; }
      k.p(51 + x, y, a ? C.ba : (Math.floor(t * 2) % 2 ? C.sr : C.srD));
    }
    k.r(38, 27, 34, 3, C.steel); k.r(38, 24, 34, 3, C.pale); k.r(63, 22, 8, 3, C.white); k.r(39, 30, 2, 4, C.steelD); k.r(69, 30, 2, 4, C.steelD);
    k.r(28, 7, 1, 27, C.steel); k.r(25, 33, 7, 1, C.steel); k.r(26, 7, 5, 1, C.steel);
    k.r(25, 8, 6, 8, '#9ad8ff'); k.r(26, a ? 11 : 13, 4, a ? 5 : 3, C.blue);
    k.line(28, 16, 40, 24, C.pale);
    if (a){ const f = (t * 1.2) % 1; k.p(28 + f * 12, 16 + f * 8, C.cu); k.p(28 + ((f + .5) % 1) * 12, 16 + ((f + .5) % 1) * 8, C.cu); }
    o.sx = 58; o.sy = 13;
  },
  air(k, t, o){
    const a = act(o, t);
    k.circ(40, 19, 12, C.steelD); k.circ(40, 19, 10, C.dark);
    const ang = a ? t * 9 : .4 + (o.lit > 0 ? Math.sin(t) * .1 : 0);
    for (let i = 0; i < 4; i++){ const an = ang + i * Math.PI / 2; k.line(40, 19, 40 + Math.cos(an) * 9, 19 + Math.sin(an) * 9, C.steel); k.line(40, 19, 40 + Math.cos(an + .3) * 8, 19 + Math.sin(an + .3) * 8, C.steel); }
    k.circ(40, 19, 2, C.pale);
    k.r(7, 14, 9, 20, C.blue); k.r(8, 12, 7, 2, C.pale); k.r(10, 10, 3, 2, C.steel); k.r(8, 20, 7, 3, C.white);
    k.r(64, 14, 9, 20, C.ba); k.r(65, 12, 7, 2, C.pale); k.r(67, 10, 3, 2, C.steel); k.r(65, 20, 7, 3, C.white);
    if (a) for (let i = 0; i < 5; i++){ const ph = (t * .9 + i * .21) % 1; k.p(53 + ph * 9, 10 + i * 5, 'rgba(238,240,248,.6)'); k.p(27 - ph * 9, 12 + i * 4, 'rgba(238,240,248,.6)'); }
    o.sx = 40; o.sy = 19;
  },
  fab(k, t, o){
    const a = act(o, t);
    k.r(20, 7, 38, 27, C.steelD); k.r(22, 9, 34, 24, C.dark); k.r(22, 12, 34, 1, C.steel);
    const hx = a ? 24 + ((Math.sin(t * 3) + 1) / 2) * 26 : 30;
    k.r(hx, 10, 5, 4, C.na); k.p(hx + 2, 14, a ? C.yel : C.na);
    const h = a ? 2 + Math.floor((t * 2) % 12) : 2; k.r(33, 33 - h, 12, h, C.cu); k.r(33, 33 - h, 12, 1, '#9ff7ff');
    [C.sr, C.blue, C.ba, C.na].forEach((c, i) => { const x = 62 + (i % 2) * 8, y = 10 + Math.floor(i / 2) * 11; k.r(x, y, 6, 9, C.steelD); k.r(x + 1, y + 1, 4, 4, c); });
    o.sx = 38; o.sy = 20;
  },
  rx(k, t, o){
    const a = act(o, t);
    k.r(4, 24, 30, 3, C.steelD); k.r(46, 24, 30, 3, C.steelD);
    if (a) for (let i = 0; i < 4; i++){ k.p(4 + ((t * 24 + i * 8) % 30), 25, C.cu); k.p(75 - ((t * 24 + i * 8) % 30), 25, C.cu); }
    k.r(31, 5, 18, 29, '#3a4466'); k.r(33, 7, 14, 25, C.dark);
    const pulse = (Math.sin(t * 5) + 1) / 2;
    const glow = a ? (pulse > .5 ? '#9ff7ff' : C.cu) : o.lit < 1 ? (Math.random() < .5 ? C.sr : C.srD) : '#1a4a5a';
    k.r(35, 9, 10, 21, glow);
    if (a) for (let i = 0; i < 5; i++) k.p(36 + ((i * 3 + Math.floor(t * 8)) % 8), 9 + ((i * 7 + Math.floor(t * 12)) % 21), C.white);
    [10, 19, 28].forEach(y => k.r(31, y, 18, 2, C.steel));
    o.sx = 40; o.sy = 18;
  },
  sen(k, t, o){
    const a = act(o, t);
    k.circ(24, 19, 12, C.steelD); k.circ(24, 19, 11, '#0a1f16'); k.ring(24, 19, 7, '#1f4a30'); k.r(13, 19, 23, 1, '#1f4a30'); k.r(24, 8, 1, 23, '#1f4a30');
    const an = a ? t * 3 : 1.1; k.line(24, 19, 24 + Math.cos(an) * 11, 19 + Math.sin(an) * 11, C.ba);
    if (a && Math.floor(t * 2) % 2){ k.r(29, 13, 2, 2, C.ba); k.r(18, 23, 2, 2, C.ba); }
    k.r(44, 25, 32, 9, C.steelD); k.r(44, 25, 32, 2, C.steel);
    for (let i = 0; i < 6; i++) k.r(47 + i * 5, 29, 3, 2, a && ((Math.floor(t * 4) + i) % 3 === 0) ? C.na : '#3a4466');
    k.r(59, 14, 2, 11, C.steel); for (let x = -7; x <= 7; x++) k.p(60 + x, 8 + Math.floor(x * x / 10), C.pale); k.p(60, 11, a ? C.sr : C.steelD);
    o.sx = 24; o.sy = 19;
  },
  h2o(k, t, o){
    const a = act(o, t);
    k.r(14, 6, 52, 28, C.steel); k.r(16, 8, 48, 26, C.dark);
    const clean = a || o.lit >= 1;
    k.r(16, 14, 48, 20, clean ? C.blue : '#4a5a2a'); k.r(16, 14, 48, 1, clean ? '#6fd0ff' : '#6a7a3a');
    for (let i = 0; i < 7; i++){ const ph = (t * .5 + i * .17) % 1; k.p(19 + i * 7, 33 - ph * 18, clean ? C.white : '#8a8a4a'); }
    if (!clean) for (let i = 0; i < 6; i++) k.p(18 + (i * 13) % 44, 18 + (i * 7) % 14, '#2a3a1a');
    k.r(66, 26, 12, 3, C.steelD); k.r(2, 10, 12, 3, C.steelD);
    o.sx = 40; o.sy = 20;
  },
  pow(k, t, o){
    const a = act(o, t);
    [12, 34, 56].forEach((x, i) => {
      k.r(x, 10, 12, 23, C.steelD); k.r(x + 4, 8, 4, 2, C.steel); k.r(x + 2, 12, 8, 19, C.dark);
      const lv = a ? 3 + Math.floor((t * 4 + i * 2) % 3) : o.lit >= 1 ? 4 : (Math.floor(t * 2 + i) % 2 ? 1 : 0);
      for (let j = 0; j < lv; j++) k.r(x + 2, 28 - j * 4, 8, 3, a || o.lit >= 1 ? C.ba : C.sr);
      if (a && i < 2 && Math.random() < .7){ let y = 8; for (let s = 0; s < 10; s++){ y += Math.random() < .5 ? -1 : 1; y = Math.max(4, Math.min(10, y)); k.p(x + 8 + s * 2, y, C.yel); k.p(x + 9 + s * 2, y, C.cu); } }
    });
    o.sx = 40; o.sy = 20;
  },
  crg(k, t, o){
    const a = act(o, t);
    const crate = (x, y, w, h) => { k.r(x, y, w, h, C.brownD); k.r(x + 1, y + 1, w - 2, h - 2, C.brownL); k.line(x + 1, y + 1, x + w - 2, y + h - 2, C.brown); k.line(x + w - 2, y + 1, x + 1, y + h - 2, C.brown); };
    crate(4, 22, 16, 12); crate(21, 22, 16, 12); crate(38, 22, 16, 12); crate(12, 10, 16, 12); crate(29, 10, 16, 12);
    k.r(58, 20, 18, 14, C.brownD); k.r(59, 21, 16, 12, C.brownL); k.r(62, 26, 10, 4, '#e8d9a8');
    if (a){ k.r(58, 13, 18, 3, C.brownD); k.r(60, 20, 14, 2, C.na); if (Math.floor(t * 4) % 2){ k.p(63, 17, C.yel); k.p(70, 15, C.white); k.p(66, 12, C.yel); } }
    else k.r(58, 19, 18, 2, C.brownD);
    o.sx = 67; o.sy = 24;
  },
  eng(k, t, o){
    const a = act(o, t);
    k.r(4, 9, 38, 25, C.steelD); for (let i = 0; i < 6; i++){ k.p(7 + i * 6, 11, C.steel); k.p(7 + i * 6, 31, C.steel); }
    k.r(8, 16, 30, 2, '#3a4466'); k.r(8, 24, 30, 2, '#3a4466');
    k.r(12, 18, 6, 6, a ? C.na : C.srD); k.r(24, 18, 6, 6, a ? C.na : C.srD);
    [11, 23].forEach(y0 => {
      for (let i = 0; i < 9; i++){ const g = Math.floor(i / 3); k.r(42 + i, y0 - g, 1, 6 + 2 * g, C.steel); }
      if (a){ const L = 14 + Math.floor(Math.random() * 10); for (let i = 0; i < L; i++){ const w = Math.max(1, 9 - Math.floor(i / 2)); const c = i < 3 ? C.white : i < 7 ? C.yel : i < 12 ? C.na : i < 17 ? C.orange : C.sr; k.r(51 + i, y0 + 3 - w / 2, 1, w, c); } }
      else if (o.lit < 1 && Math.random() < .25) k.r(52 + Math.random() * 6, y0 + 1 + Math.random() * 3, 2, 2, '#5a6988');
    });
    o.sx = 20; o.sy = 20;
  },
  bay(k, t, o){
    const a = act(o, t), sealed = o.lit >= .9 || a;
    k.r(22, 6, 40, 28, C.steelD); k.r(23, 7, 38, 26, '#4a5670');
    for (let i = 0; i < 5; i++){ k.p(25 + i * 8, 8, C.steel); k.p(25 + i * 8, 31, C.steel); }
    if (!sealed){
      k.r(36, 13, 12, 10, C.dark); k.r(38, 11, 7, 2, C.dark); k.r(34, 16, 2, 5, C.dark); k.r(47, 15, 3, 4, C.dark); k.r(39, 23, 6, 2, C.dark);
      for (let i = 0; i < 5; i++) k.p(37 + ((i * 7 + Math.floor(t * 6)) % 10), 14 + (i * 3) % 8, i % 2 ? C.white : C.cu);
    } else {
      k.r(34, 11, 16, 14, C.steel); k.r(35, 12, 14, 12, C.pale);
      [[35, 12], [48, 12], [35, 23], [48, 23]].forEach(([x, y]) => k.p(x, y, C.steelD));
    }
    k.r(3, 30, 10, 4, C.na); k.r(5, 28, 6, 2, C.orange);
    const tx = 33 + Math.round(Math.sin(t * 3) * 3), ty = 18 + Math.round(Math.cos(t * 2) * 2);
    k.line(8, 28, 16, 17, C.na); k.line(9, 28, 17, 17, C.na); k.r(15, 16, 3, 3, C.orange);
    k.line(17, 17, tx, ty, C.na); k.line(17, 18, tx, ty + 1, C.na); k.r(tx, ty - 1, 3, 3, C.steelD);
    if (a || (o.lit > 0 && Math.floor(t * 8) % 3 === 0)){ k.p(tx + 3, ty, C.white); k.p(tx + 4, ty - 1, C.yel); k.p(tx + 4, ty + 1, C.cu); if (Math.random() < .5) k.p(tx + 2 + Math.random() * 4, ty + 2 + Math.random() * 4, C.na); }
    o.sx = 42; o.sy = 18;
  },
  fin(k, t, o){
    const a = act(o, t) || o.warp;
    k.r(6, 5, 68, 20, C.steelD); k.r(8, 7, 64, 16, C.dark);
    k.circ(62, 17, 5, C.pink); k.r(55, 17, 14, 1, '#7a3a60');
    const sp = o.warp ? 90 : a ? 10 : 3;
    for (let i = 0; i < 16; i++){ const x = 8 + ((i * 37 + t * sp * (1 + (i % 3))) % 64), y = 8 + (i * 53) % 14; if (o.warp) k.r(Math.max(8, x - 6), y, Math.min(6, x - 8 + 1), 1, C.white); else k.p(x, y, i % 4 ? C.white : C.cu); }
    k.r(10, 27, 60, 3, C.steel); k.r(10, 30, 60, 4, C.steelD);
    for (let i = 0; i < 8; i++) k.r(14 + i * 7, 28, 3, 1, (Math.floor(t * 3) + i) % 4 === 0 ? C.na : '#3a4466');
    k.r(36, 22, 8, 8, C.pink); k.r(34, 29, 12, 2, C.pink);
    if (o.charge != null){ k.r(20, 32, 40, 1, C.dark); k.r(20, 32, Math.round(40 * o.charge), 1, C.cu); }
    o.sx = 40; o.sy = 28;
  }
};
function drawRoom(ctx, id, t, o){
  const k = K(ctx), W = 80, H = 40, stone = STONE.has(id) || JUNGLE.has(id);
  if (JUNGLE.has(id)) jungleBase(k, ctx, t, o); else if (stone) stoneBase(k, ctx, t, o, id); else {
  k.r(0, 0, W, H, C.wall);
  for (let x = 0; x < W; x += 16) k.r(x, 4, 1, 30, C.seam);
  k.r(0, 12, W, 1, C.seam);
  k.r(0, 0, W, 4, C.ceil);
  const lightOn = o.lit > 0 && !(o.lit < 1 && Math.random() < .12);
  [16, 58].forEach(x => { k.r(x, 3, 8, 1, lightOn ? '#fff3b0' : C.seam); if (lightOn){ ctx.fillStyle = 'rgba(255,243,176,.05)'; for (let i = 0; i < 6; i++) ctx.fillRect(x - i, 4 + i * 4, 8 + 2 * i, 4); } });
  k.r(0, 34, W, 6, C.floor); k.r(0, 34, W, 1, C.steelD); for (let x = 0; x < W; x += 4) k.r(x, 37, 2, 1, C.floorD);
  }
  DEV[id](k, t, o);
  const dark = .65 * (1 - Math.min(1, o.lit));
  if (dark > 0){ ctx.fillStyle = `rgba(5,6,16,${dark})`; ctx.fillRect(0, 0, W, H); }
  if (o.alarm){ const on = Math.floor(t * 3) % 2 === 0; k.r(2, 1, 3, 2, on ? C.sr : C.srD); k.r(75, 1, 3, 2, on ? C.srD : C.sr); if (on){ ctx.fillStyle = 'rgba(228,59,68,.12)'; ctx.fillRect(0, 0, W, H); } }
  if (o.lit < 1 && !o.live && Math.random() < .35){ const x = (o.sx || 40) + Math.round(Math.random() * 16 - 8), y = (o.sy || 20) + Math.round(Math.random() * 12 - 6); const sc = stone ? ['#eef0f8', '#c8a2ff', '#b55088', '#2ce8f5'] : [C.white, C.na, C.orange, C.yel]; k.p(x, y, sc[0]); k.p(x + 1, y, sc[1]); k.p(x - 1, y + 1, sc[2]); k.p(x, y - 1, sc[3]); }
  if (o.failUntil && t < o.failUntil){ ctx.fillStyle = 'rgba(228,59,68,.28)'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 10; i++) k.p(8 + Math.random() * 64, 6 + Math.random() * 26, [C.white, C.na, C.orange][i % 3]); }
}

/* MOLLY: an 18×16 monitor-headed robot */
const molly = { expr:'neutral', talkUntil:0 };
function drawMolly(ctx, t){
  const k = K(ctx); ctx.clearRect(0, 0, 18, 16);
  const e = molly.expr, alarm = e === 'alarm';
  k.r(8, 0, 2, 2, Math.floor(t * 2) % 2 ? C.sr : C.srD); k.r(8, 2, 2, 1, C.steel);
  k.r(1, 3, 16, 12, C.steel); k.r(2, 4, 14, 10, C.steelD); k.r(3, 5, 12, 8, alarm ? '#3a0e14' : '#0b1a2a');
  k.r(0, 7, 1, 4, C.steelD); k.r(17, 7, 1, 4, C.steelD); k.r(3, 15, 12, 1, C.steelD);
  const c = alarm ? C.sr : e === 'happy' ? C.ba : C.cu;
  const blink = (t % 3.3) < .13;
  const eye = (x) => {
    if (blink){ k.r(x, 8, 2, 1, c); return; }
    if (e === 'happy'){ k.p(x, 8, c); k.p(x + 1, 7, c); k.p(x + 2, 8, c); return; }
    if (e === 'worried'){ k.r(x, 7, 2, 2, c); k.p(x === 5 ? x + 1 : x - 1 + 1, 6, c); return; }
    if (e === 'alarm'){ k.r(x, 6, 2, 3, c); return; }
    k.r(x, 7, 2, 2, c);
  };
  if (e === 'smug' && !blink){ k.r(5, 8, 2, 1, c); k.r(11, 7, 2, 2, c); } else { eye(5); eye(11); }
  const talking = t < molly.talkUntil && Math.floor(t * 10) % 2;
  if (talking){ k.r(7, 10, 4, 2, c); }
  else if (e === 'happy'){ k.p(6, 10, c); k.r(7, 11, 4, 1, c); k.p(11, 10, c); }
  else if (e === 'worried'){ k.p(6, 11, c); k.p(7, 10, c); k.p(8, 11, c); k.p(9, 10, c); k.p(10, 11, c); k.p(11, 10, c); }
  else if (e === 'smug'){ k.r(8, 11, 3, 1, c); k.p(11, 10, c); }
  else if (alarm){ k.r(8, 10, 2, 2, c); }
  else k.r(7, 11, 4, 1, c);
}
function drawShip(ctx, t, lit){
  const k = K(ctx); ctx.clearRect(0, 0, 48, 64);
  k.r(20, 2, 8, 2, C.steel); k.r(18, 4, 12, 3, C.steel); k.r(16, 7, 16, 3, C.steel);
  k.r(14, 10, 20, 40, C.steelD); k.r(15, 10, 18, 40, '#3a4466');
  for (let y = 0; y < 6; y++) for (let x = 0; x < 3; x++){ const on = (y * 3 + x) / 18 < lit || (lit === 0 && (y + x + Math.floor(t * 2)) % 5 === 0); k.r(17 + x * 5, 13 + y * 6, 3, 3, on ? C.na : C.dark); }
  k.r(2, 20, 11, 16, C.blue); k.r(35, 20, 11, 16, C.blue); for (let i = 0; i < 4; i++){ k.r(2, 23 + i * 4, 11, 1, '#0a3a5a'); k.r(35, 23 + i * 4, 11, 1, '#0a3a5a'); }
  k.r(12, 27, 2, 2, C.steel); k.r(34, 27, 2, 2, C.steel);
  k.r(16, 50, 6, 4, C.steel); k.r(26, 50, 6, 4, C.steel);
  if (lit > .9 || t % 1 < .5){ const L = 4 + Math.floor(Math.random() * 5); for (let i = 0; i < L; i++){ const c = i < 2 ? C.white : i < 4 ? C.na : C.orange; k.r(17 + (i > 3 ? 1 : 0), 54 + i, 4 - (i > 3 ? 2 : 0), 1, c); k.r(27 + (i > 3 ? 1 : 0), 54 + i, 4 - (i > 3 ? 2 : 0), 1, c); } }
  k.r(22, 1, 1, 1, Math.floor(t * 2) % 2 ? C.sr : C.srD);
}
function drawTail(ctx, t, on){
  const k = K(ctx); ctx.clearRect(0, 0, 80, 16);
  [20, 52].forEach(x => {
    for (let i = 0; i < 5; i++) k.r(x - 2 - i, i, 12 + 2 * i, 1, C.steel);
    if (on){ const L = 6 + Math.floor(Math.random() * 5); for (let i = 0; i < L; i++){ const w = Math.max(2, 10 - i); k.r(x + 4 - w / 2, 5 + i, w, 1, i < 2 ? C.white : i < 5 ? C.na : C.orange); } }
  });
}
function drawMedal(ctx, col, lockd){
  const k = K(ctx); ctx.clearRect(0, 0, 12, 14);
  const c = lockd ? '#3a4466' : col;
  k.r(2, 0, 3, 5, lockd ? '#262b44' : C.sr); k.r(7, 0, 3, 5, lockd ? '#262b44' : C.blue);
  k.circ(6, 8, 4, lockd ? '#262b44' : C.brownD); k.circ(6, 8, 3, c);
  if (!lockd){ k.p(6, 6, C.white); k.r(5, 7, 3, 1, C.white); k.p(6, 8, C.white); k.p(5, 9, C.white); k.p(7, 9, C.white); }
}
function drawRankIco(ctx, idx){
  const k = K(ctx); ctx.clearRect(0, 0, 9, 9);
  k.r(0, 0, 9, 9, '#3a4466'); k.r(1, 1, 7, 7, C.dark);
  for (let i = 0; i < Math.min(idx + 1, 3); i++){ const y = 6 - i * 2; k.p(2, y - 1, C.na); k.p(3, y, C.na); k.p(4, y + 1 > 7 ? 7 : y, C.na); k.p(5, y, C.na); k.p(6, y - 1, C.na); }
  if (idx >= 3) k.r(1, 1, 7, 1, idx >= 5 ? C.cu : C.na);
}

/* ========================================================================
   BACKGROUND STARFIELD, FX PARTICLES, MAIN LOOP
   ======================================================================== */
const stars = {
  c:document.getElementById('stars'), s:[], warp:0,
  resize(){ const c = this.c; c.width = Math.ceil(innerWidth / 3); c.height = Math.ceil(innerHeight / 3); this.s = Array.from({length:90}, () => ({x:Math.random() * c.width, y:Math.random() * c.height, z:1 + Math.floor(Math.random() * 3)})); },
  draw(){
    const c = this.c, x = c.getContext('2d'), k = K(x);
    x.fillStyle = '#0b0d1a'; x.fillRect(0, 0, c.width, c.height);
    k.circ(Math.round(c.width * .82), Math.round(c.height * .2), 9, '#1b1f38'); k.r(Math.round(c.width * .82) - 14, Math.round(c.height * .2), 29, 1, '#262b44');
    for (const s of this.s){
      s.y += s.z * .12 * (1 + this.warp * 30); if (s.y > c.height){ s.y = 0; s.x = Math.random() * c.width; }
      x.fillStyle = s.z === 3 ? '#eef0f8' : s.z === 2 ? '#9aa3c2' : '#3a4466';
      x.fillRect(Math.round(s.x), Math.round(s.y), 1, this.warp ? 1 + Math.round(this.warp * s.z * 8) : 1);
    }
  }
};
const fx = {
  c:document.getElementById('fx'), p:[],
  resize(){ this.c.width = innerWidth; this.c.height = innerHeight; },
  burst(x, y, n, cols, spd = 5){ if (reduced()) return; for (let i = 0; i < n; i++){ const a = Math.random() * 6.283, v = Math.random() * spd + 1; this.p.push({x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v - 2, life:18 + Math.random() * 14, c:cols[i % cols.length], s:pick([4, 4, 6])}); } },
  fly(x, y, tx, ty, n, col){ if (reduced()) return; for (let i = 0; i < n; i++) this.p.push({x:x + Math.random() * 40 - 20, y:y + Math.random() * 20 - 10, tx, ty, life:60, c:col, s:6, d:i * 2}); },
  draw(){
    const x = this.c.getContext('2d'); x.clearRect(0, 0, this.c.width, this.c.height);
    this.p = this.p.filter(p => p.life > 0);
    for (const p of this.p){
      if (p.d > 0){ p.d--; continue; }
      if (p.tx != null){ p.x += (p.tx - p.x) * .2; p.y += (p.ty - p.y) * .2; if (Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) < 8) p.life = 0; }
      else { p.x += p.vx; p.y += p.vy; p.vy += .35; }
      p.life--; x.fillStyle = p.c; x.fillRect(Math.round(p.x / 2) * 2, Math.round(p.y / 2) * 2, p.s, p.s);
    }
  }
};
const anims = new Set();
let lastF = 0;
function loop(ts){
  requestAnimationFrame(loop);
  if (ts - lastF < 33) return; lastF = ts;
  const t = ts / 1000;
  stars.draw();
  anims.forEach(a => { if (!a.el.isConnected){ anims.delete(a); return; } a.draw(t); });
  fx.draw();
}
addEventListener('resize', () => { stars.resize(); fx.resize(); fitScenes(); });

/* ========================================================================
   UI HELPERS
   ======================================================================== */
const view = document.getElementById('view');
let sayTimer = null;
function show(html){
  clearInterval(sayTimer); stopTimer();
  view.innerHTML = html; window.scrollTo(0, 0); mount(); hud();
}
function mount(){
  view.querySelectorAll('canvas[data-room]').forEach(c => {
    const o = c._o = { lit:+(c.dataset.lit || 0), alarm:c.dataset.alarm === '1', charge:c.dataset.charge != null ? +c.dataset.charge : null };
    const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawRoom(ctx, c.dataset.room, t, o)});
  });
  view.querySelectorAll('canvas[data-molly]').forEach(c => { const ctx = c.getContext('2d'); anims.add({el:c, draw:t => (CAMP.id === 'tower' ? drawOwl : CAMP.id === 'temple' ? drawPolly : drawMolly)(ctx, t)}); });
  view.querySelectorAll('canvas[data-art="ship"]').forEach(c => { const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawShip(ctx, t, +c.dataset.lit)}); });
  view.querySelectorAll('canvas[data-art="temple"]').forEach(c => { const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawTemple(ctx, t, +c.dataset.lit)}); });
  view.querySelectorAll('canvas[data-art="tower"]').forEach(c => { const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawTower(ctx, t, +c.dataset.lit)}); });
  view.querySelectorAll('canvas[data-art="tail"]').forEach(c => { const ctx = c.getContext('2d'); anims.add({el:c, draw:t => drawTail(ctx, t, c.dataset.on === '1')}); });
  view.querySelectorAll('canvas[data-medal]').forEach(c => drawMedal(c.getContext('2d'), c.dataset.medal, c.dataset.lock === '1'));
  fitScenes();
}
function fitScenes(){
  view.querySelectorAll('.scene canvas').forEach(c => {
    const box = c.parentElement.clientWidth - 8; const s = Math.max(1, Math.floor(Math.min(box, 600) / 80));
    c.style.width = (80 * s) + 'px'; c.style.height = (40 * s) + 'px';
  });
}
const mainScene = () => { const c = view.querySelector('.scene canvas[data-room]'); return c ? c._o : null; };
function sceneRect(){ const c = view.querySelector('.scene canvas'); return c ? c.getBoundingClientRect() : {left:innerWidth / 2, top:120, width:0, height:0}; }
function shake(){ if (reduced()) return; const a = document.getElementById('app'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
function flash(col){ const f = document.getElementById('flash'); f.className = ''; void f.offsetWidth; f.className = col + ' on'; }
function toast(title, text, medal){
  const d = document.createElement('div'); d.className = 'toast';
  d.innerHTML = `${medal ? `<canvas class="pix" width="12" height="14"></canvas>` : ''}<div><b>${title}</b><span>${F(text)}</span></div>`;
  document.getElementById('toasts').appendChild(d);
  if (medal) drawMedal(d.querySelector('canvas').getContext('2d'), medal, false);
  setTimeout(() => d.remove(), 3100);
}
function say(text, expr = 'neutral'){
  const el = document.getElementById('say'); if (!el) return;
  molly.expr = expr; clearInterval(sayTimer);
  el.innerHTML = `<span class="who">${CAMP.pal}</span>${F(text)}`;
  if (reduced()) return;
  const nodes = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; w.nextNode();
  while ((n = w.nextNode())){ nodes.push([n, n.nodeValue]); n.nodeValue = ''; }
  let i = 0, j = 0; molly.talkUntil = 1e12;
  const finish = () => { clearInterval(sayTimer); nodes.forEach(([nd, tx]) => { nd.nodeValue = tx; }); molly.talkUntil = 0; };
  sayTimer = setInterval(() => {
    for (let s = 0; s < 2; s++){
      if (i >= nodes.length){ finish(); return; }
      const [nd, tx] = nodes[i]; nd.nodeValue = tx.slice(0, ++j); if (j >= tx.length){ i++; j = 0; }
    }
    if (Math.random() < .35) SND.play('type');
  }, 26);
  el.onclick = finish;
}
const talkHTML = () => `<div class="talk"><canvas data-molly class="pix" width="18" height="16" aria-hidden="true"></canvas><div class="say" id="say" aria-live="polite"></div></div>`;
const ruleCard = tp => `<div class="rule"><span class="lab">Manual · ${F(TOPICS[tp].name)}</span>${TOPICS[tp].rule.startsWith('<') ? F(TOPICS[tp].rule) : `<p>${F(TOPICS[tp].rule)}</p>`}</div>`;
const unlocked = i => i === 0 || st.done.includes(MODS[i - 1].id);
const modOf = i => i === -1 ? CAMP.repair : MODS[i];
function addWrong(t){
  const w = JSON.parse(JSON.stringify(t)); w.reroute = false; w.depth = 0; delete w.story;
  if (!st.wrongs.some(x => x.id === w.id)) st.wrongs.push(w);
  if (st.wrongs.length > 40) st.wrongs.shift();
}

const RANKS = [[0, 'Cadet'], [60, 'Ensign'], [150, 'Lab Tech'], [260, 'Chemist'], [380, 'Sr. Chemist'], [500, 'Chief Chemist']];
const rankIdx = xp => RANKS.reduce((a, r, i) => xp >= r[0] ? i : a, 0);
const BADGES = [
  {id:'first', name:'First Fix', d:'Get your first repair right.', c:C.ba},
  {id:'s3', name:'Warming Up', d:'3 correct in a row.', c:C.na},
  {id:'s5', name:'Chain Reaction', d:'5 correct in a row.', c:C.orange},
  {id:'s10', name:'Critical Mass', d:'10 correct in a row.', c:C.sr},
  {id:'sniper', name:'Sig Fig Sniper', d:'5 calculations in a row with perfect value, sig figs, notation, and units.', c:C.cu},
  {id:'flawless', name:'Flawless System', d:'Restore a system with every repair right on the first try.', c:C.blue},
  {id:'nohint', name:'Unassisted', d:'Restore a system without buying a hint.', c:C.pink},
  {id:'comeback', name:'Comeback', d:'Fix a rerouted problem after missing it.', c:C.pale},
  {id:'jump', name:'Jump Complete', d:'Escape the station.', c:C.yel},
  {id:'iron', name:'Iron Hull', d:'Escape without an emergency patch.', c:C.steel},
  {id:'welder', name:'Hull Welder', d:'Restore your hull or ward by re-solving a problem you missed.', c:C.orange},
  {id:'beacon', name:'Beacon Lit', d:'Relight the beacon atop the Valence Spire.', c:C.cu}
];
function award(ids){
  let k = 0;
  ids.forEach(id => {
    if (st.badges.includes(id)) return; st.badges.push(id);
    const b = BADGES.find(x => x.id === id);
    setTimeout(() => { toast('Badge: ' + b.name, b.d, b.c); SND.play('badge'); }, 500 + k++ * 900);
  });
}
function hud(){
  const h = Math.max(0, st.hull), on = Math.ceil(h / 10);
  const segs = document.getElementById('segs');
  segs.innerHTML = Array.from({length:10}, (_, i) => `<i class="seg ${i < on ? 'on' : ''}"></i>`).join('');
  segs.classList.toggle('low', h < 35);
  document.getElementById('enev').textContent = st.energy;
  document.querySelector('.hullw .lab').textContent = W().Hull; document.querySelector('.enw .lab').textContent = W().nrg;
  const cb = document.getElementById('combo'); cb.hidden = st.streak < 2; cb.textContent = 'x' + st.streak;
  const ri = rankIdx(st.xp); document.getElementById('rankname').textContent = RANKS[ri][1];
  drawRankIco(document.getElementById('rankico').getContext('2d'), ri);
  const m = document.getElementById('mute'); m.classList.toggle('off', !st.sound); m.setAttribute('aria-label', st.sound ? 'Sound on' : 'Sound off');
}

/* ========================================================================
   SCREENS
   ======================================================================== */
const hasRun = () => st.done.length > 0 || !!st.cur;
function renderTitle(){
  const card = id => {
    const c = CAMPS[id], sm = campSummary(id), k = ui.confirm;
    return `<div class="win camp">
      <canvas data-art="${c.art}" data-lit="${sm.done / sm.total}" class="pix campart" width="48" height="64" aria-hidden="true"></canvas>
      <div class="campinfo"><h2 class="camph">${c.title}</h2><p class="dim">${c.tag}</p><span class="lab">${sm.done}/${sm.total} ${id === 'tower' ? 'floors' : id === 'temple' ? 'chambers' : 'systems'} ${c.w.online}${sm.finished ? ' · complete' : ''}</span>
      <div class="row">
        <button class="pb go" data-act="camp" data-c="${id}">${sm.run ? '▶ Continue' : '▶ Start'}</button>
        ${sm.run ? `<button class="pb sm" data-act="new" data-c="${id}">${k === 'new:' + id ? 'Tap again to erase' : 'New game'}</button>` : ''}
        <button class="pb sm" data-act="remix" data-c="${id}">${k === 'remix:' + id ? 'Tap again to remix' : 'Remix'}</button>
      </div></div></div>`;
  };
  show(`<section class="title">
    <h1 class="logo"><span class="l1">CHEM</span><span class="l2">QUESTS</span></h1>
    <p class="tag">Pick a campaign</p>
    <div class="camps">${card('station')}${card('tower')}${card('temple')}</div>
    <ul class="kit"><li>Paper + pencil</li><li>Calculator</li><li>~45 min each</li></ul>
  </section>`);
}
function dialog(lines, after){
  ui.dlg = { lines, i:0, after };
  dlgStep();
}
function dlgStep(){
  const d = ui.dlg, el = document.getElementById('dlgbtns'); if (!d || !el) return;
  const last = d.i >= d.lines.length - 1;
  say(d.lines[d.i], d.exprs ? d.exprs[d.i] : 'neutral');
  el.innerHTML = last ? d.after : `<button class="pb cy" data-act="dlg-next">Next ▶</button>`;
}
function renderBoot(){
  show(`<section class="scr">
    <div class="scene"><canvas data-room="${CAMP.bootRoom}" data-lit="0" data-alarm="1" class="pix" width="80" height="40" aria-hidden="true"></canvas><span class="stag">${CAMP.title.toUpperCase()}</span></div>
    ${talkHTML()}
    <div id="dlgbtns"></div>
  </section>`);
  SND.play('alarm');
  ui.dlg = { lines:CAMP.boot, i:0, after:`<button class="pb go big" data-act="map">Open ${W().map.toLowerCase()} ▶</button>`, exprs:CAMP.bootExpr };
  dlgStep();
}
function renderMap(){
  const n = st.done.length;
  const cell = id => {
    const i = MODS.findIndex(m => m.id === id), m = MODS[i], on = st.done.includes(id), un = unlocked(i);
    const cls = on ? 'st-online' : un ? 'st-next' : 'st-locked';
    const lit = on ? 1 : un ? .3 : 0;
    const mid = (st.cur && st.cur.m === i) || (st.parked && st.parked.m === i);
    const stt = on ? 'online' : un ? (mid ? 'in repair' : 'broken') : 'sealed';
    return `<button class="room ${cls} ${m.final || id === 'eng' || CAMP.shape !== 'ship' ? 'span' : ''}" data-act="mod" data-i="${i}" aria-label="${m.name}: ${stt}">
      <canvas data-room="${id}" data-lit="${lit}" ${m.final && !on ? 'data-alarm="1"' : ''} class="pix" width="80" height="40" aria-hidden="true"></canvas>
      <span class="rlab"><i class="led"></i>${i + 1}. ${m.name} · ${stt}</span></button>`;
  };
  show(`<section class="scr">
    <div class="maptop"><h1 class="h1">${W().map}</h1><span class="lab">${n}/${MODS.length} ${W().online}${st.remix ? ' · remix' : ''}</span></div>
    ${talkHTML()}
    <div class="ship ${CAMP.shape}">
      <div class="nose"></div>
      <div class="hullbox"><div class="trunk"><i style="height:${Math.round(100 * n / MODS.length)}%"></i></div>
        <div class="rooms">${CAMP.layout.flat().map(cell).join('')}</div></div>
      ${CAMP.shape !== 'ship' ? '<div class="ground"></div>' : `<div class="tail"><canvas data-art="tail" data-on="${st.done.includes('eng') ? 1 : 0}" class="pix" width="80" height="16" aria-hidden="true"></canvas></div>`}
    </div>
    <button class="room bayroom ${st.wrongs.length ? 'st-next' : 'st-online'}" data-act="repair" aria-label="${W().Bay}: ${st.wrongs.length} ${W().crack}s">
      <canvas data-room="${CAMP.repair.id}" data-lit="${Math.max(.2, Math.min(1, st.hull / 100))}" ${st.hull < 35 ? 'data-alarm="1"' : ''} class="pix" width="80" height="40" aria-hidden="true"></canvas>
      <span class="rlab"><i class="led"></i>${W().Bay} · ${W().hull} ${Math.max(0, st.hull)}% · ${st.wrongs.length ? st.wrongs.length + ' ' + W().crack + (st.wrongs.length > 1 ? 's' : '') + ' to ' + W().weld : 'no ' + W().crack + 's'}</span></button>
    <div class="row"><button class="pb sm" data-act="badges">Badges ${st.badges.length}/${BADGES.length}</button><button class="pb sm" data-act="report">Study report</button><button class="pb sm" data-act="title">Title</button></div>
  </section>`);
  const next = MODS.findIndex((m, i) => unlocked(i) && !st.done.includes(m.id));
  if (next < 0) say('Every system is online. Replay any room to practice.', 'happy');
  else if (st.hull < 60 && st.wrongs.length) say(`${W().Hull} at ${Math.max(0, st.hull)}%. The ${W().bay} has ${st.wrongs.length} ${W().crack}${st.wrongs.length > 1 ? 's' : ''} from problems you missed. Each one you re-solve restores 15 ${W().hull}.`, 'worried');
  else if (st.cur && st.cur.m !== -1) say(`The ${MODS[st.cur.m].name} is ${W().mid}. Tap it to pick up where you left off.`, 'neutral');
  else say(next === 0 ? CAMP.firstLine : `Next up: the ${MODS[next].name}. Tap it.`, next === MODS.length - 1 ? 'worried' : 'neutral');
}
function enterRoom(i, el){
  SND.play('zip');
  if (el && !reduced()){ el.classList.add('zoom'); setTimeout(() => startModule(i), 300); }
  else startModule(i);
}
const sceneHTML = (id, lit, extra = '', alarm = false, charge = null) =>
  `<div class="scene"><canvas data-room="${id}" data-lit="${lit}" ${alarm ? 'data-alarm="1"' : ''} ${charge != null ? `data-charge="${charge}"` : ''} class="pix" width="80" height="40" aria-hidden="true"></canvas>${extra}</div>`;
function startRepair(){
  if (st.cur && st.cur.m === -1){ renderTask(); return; }
  if (!st.wrongs.length){ SND.play('jam'); say(st.hull < 100 ? `No ${W().crack}s to ${W().weld} yet. Every problem you miss gets added to the ${W().bay}.` : `Your ${W().hull} is solid and the ${W().bay} is empty. Nice.`, 'happy'); return; }
  if (st.cur) st.parked = st.cur;
  const queue = st.wrongs.slice(0, 5).map(w => JSON.parse(JSON.stringify(w)));
  st.cur = { m:-1, queue, pos:0, first:0, rer:0, ok:0, hints:0 };
  save();
  show(`<section class="scr">
    ${sceneHTML(CAMP.repair.id, Math.max(.15, Math.min(.9, st.hull / 100)), `<span class="stag">${W().Bay.toUpperCase()} · ${W().Hull.toUpperCase()} ${Math.max(0, st.hull)}%</span>`, st.hull < 35)}
    <h1 class="h1">${W().Bay}</h1>
    ${talkHTML()}
    <div id="dlgbtns"></div>
    <div class="stats"><div class="stat"><span class="lab">${W().Hull}</span><b>${Math.max(0, st.hull)}%</b></div><div class="stat"><span class="lab">${W().crack}s</span><b>${st.wrongs.length}</b></div><div class="stat"><span class="lab">${W().perWeld}</span><b>+15</b></div></div>
    <button class="pb go big" data-act="begin">${W().startWeld} ▶ (${queue.length})</button>
  </section>`);
  SND.play('zip');
  const lines = CAMP.repairIntro;
  ui.dlg = { lines, i:0, after:'', exprs:['worried', 'neutral', 'happy'] }; dlgStep();
}
function startModule(i){
  const m = MODS[i];
  if (st.cur && st.cur.m === i){ renderTask(); return; }
  if (st.parked && st.parked.m === i){ st.cur = st.parked; st.parked = null; save(); renderTask(); return; }
  const queue = m.final ? buildFinal() : m.tasks.map(t => st.remix ? variantOf(t, false) : JSON.parse(JSON.stringify(t)));
  st.cur = { m:i, queue, pos:0, first:0, rer:0, ok:0, hints:0 };
  save();
  show(`<section class="scr">
    ${sceneHTML(m.id, st.done.includes(m.id) ? 1 : .15, `<span class="stag">${W().unit.toUpperCase()} ${i + 1} · ${m.name.toUpperCase()}</span>`, m.final)}
    <h1 class="h1">${m.name}</h1>
    ${talkHTML()}
    <div id="dlgbtns"></div>
    ${m.final ? `<div class="win dev"><div class="devh"><span>Exam timer</span><span>${st.timer ? 'ON' : 'OFF'}</span></div>
      <p class="dim" style="margin:0;font-size:16px">Quiz pressure: 3:00 per calculation, 0:45 for everything else. Running out of time counts as a miss.</p>
      <button class="pb ${st.timer ? 'go' : ''}" data-act="timer">${st.timer ? 'Timer on · tap to turn off' : 'Timer off · tap to turn on'}</button></div>` : m.topics.map(ruleCard).join('')}
    <button class="pb go big" data-act="begin">${m.final ? W().go + ' ▶' : W().start + ' ▶'} (${queue.length})</button>
  </section>`);
  if (m.final) SND.play('alarm');
  ui.dlg = { lines:m.intro, i:0, after:'', exprs:m.intro.map((_, j) => m.final ? 'alarm' : j === 0 ? 'neutral' : 'neutral') };
  dlgStep();
}
function buildFinal(){
  const order = [...new Set(MODS.flatMap(m => m.topics))];
  const q = [];
  for (const tp of order){
    const tmpl = shuffle(ORIG.filter(t => t.topic === tp)); const n = st.missed[tp] ? 2 : 1;
    for (let k = 0; k < n; k++) q.push(variantOf(tmpl[k % tmpl.length], false));
  }
  return q;
}

/* ========================================================================
   TASK SCREEN
   ======================================================================== */
const curTask = () => st.cur.queue[st.cur.pos];
const DEVNAME = { gate:'Gate runes', lib:'Tome', lab:'Alembic', obs:'Star chart', scr:'Quill & scroll', apo:'Jar labels', vault:'Balance scale', mine:'Crystal counter', forge:'Forge ledger', circ:'Summoning circle', top:'Beacon rune', shrine:'Mending font', bay:'Welding rig', med:'IV pump · dose input', air:'Scrubber console', fab:'Fabricator · print job', rx:'Reactor controls', sen:'Radar', h2o:'Tank controls', pow:'Battery bank', crg:'Label maker', eng:'Fuel console', fin:'Jump computer' };
const VERB = { gate:'Speak rune', lib:'Turn page', lab:'Distill', obs:'Align', scr:'Inscribe', apo:'Label jar', vault:'Weigh', mine:'Count', forge:'Strike', circ:'Summon', top:'Ignite', shrine:'Mend', bay:'Weld patch', med:'Start pump', air:'Calibrate', fab:'Print', rx:'Engage core', h2o:'Flush tank', pow:'Transfer e⁻', crg:'Stamp label', eng:'Fire thrusters', fin:'Charge drive' };
function renderTask(){
  const c = st.cur, t = curTask(), m = modOf(c.m);
  ui = { t, done:false, hints:{}, confirm:null };
  ui.room = m.id;
  if (t.type === 'calc'){
    ui.b = CALC[t.gen].build(t.p);
    if (FL[t.gen]) Object.assign(ui.b, FL[t.gen](t.p, ui.b));
    ui.phase = t.gen === 'hydrate' ? 'select' : t.gen === 'limit' ? 'balance' : 'answer';
    ui.sel = []; ui.flags = {};
    if (t.gen === 'limit'){ const L = LIM[t.p.r]; ui.coefs = L.L.concat(L.R).map(() => 1); }
  }
  if (t.type === 'calc' || t.type === 'numunit' || t.type === 'numval') ui.kp = { m:'', e:'', neg:false, f:'m', unit:t.type === 'numval' ? t.unit : null };
  if (t.type === 'balance') ui.coefs = t.L.concat(t.R).map(() => 1);
  if (t.type === 'nums') ui.nv = [0, 0];
  if (t.type === 'net') ui.net = { L:t.L.map(x => ({...x, split:false})), R:t.R.map(x => ({...x, split:false})), struck:{}, solidTap:false };
  if (t.type === 'redox') ui.rx = { ox:null, red:null, prodTap:false };
  if (XT[t.type] && XT[t.type].init) XT[t.type].init(t);
  const chips = [];
  if (t.n) chips.push(`<span class="chip">${CAMP.id === 'tower' ? 'Test' : 'Guide'} #${t.n}</span>`);
  if (m.repair) chips.push(`<span class="chip re">${W().Bay}</span>`);
  else if (t.reroute) chips.push(`<span class="chip re">Rerouted</span>`); else if (!t.n) chips.push(`<span class="chip">New numbers</span>`);
  const lit = m.repair ? Math.max(.15, Math.min(.9, st.hull / 100)) : m.final ? .6 : st.done.includes(m.id) ? 1 : Math.min(.85, .15 + .7 * c.pos / c.queue.length);
  const charge = m.final ? (c.ok || 0) / c.queue.length : null;
  const extra = `<span class="stag">${m.name.toUpperCase()} · ${c.pos + 1}/${c.queue.length}</span><div class="schips">${chips.join('')}</div>` +
    (m.final ? `<div class="charge"><span class="lab">${W().charge}</span><div class="cbar"><i style="width:${Math.round(100 * charge)}%"></i></div>${st.timer ? '<span class="timer" id="timer">--:--</span>' : ''}</div>` : '');
  show(`<section class="scr">
    ${sceneHTML(m.id, lit, extra, m.final || (m.repair && st.hull < 35), charge)}
    ${talkHTML()}
    <div class="crt"><span class="lab">${t.type === 'calc' ? 'Incoming problem · paper required' : 'Incoming problem'}</span><div id="qtext"></div></div>
    <div id="body"></div>
    <div class="hints" id="hints"></div>
    <div class="hintbox" id="hintbox"></div>
    <div id="fb"></div>
  </section>`);
  document.getElementById('qtext').innerHTML = questionHTML();
  drawBody(); drawHints();
  say(m.repair ? pick(CAMP.repairLines) : (t.story || pick(m.flav || FRESH)), t.reroute || m.repair ? 'smug' : m.final ? 'alarm' : 'neutral');
  if (m.final && st.timer) startTimer(t.type === 'calc' ? 180 : 45);
}
function questionHTML(){
  const t = ui.t;
  switch (t.type){
    case 'calc': return `<p>${F(ui.b.q)}</p>`;
    case 'balance': return `${t.q ? `<p>${F(t.q)}</p>` : ''}<p${t.q ? ' style="margin-top:8px"' : ''}>${F(t.L.join(' + ') + ' → ' + t.R.join(' + '))}${t.q ? '' : '.'}${t.ask ? (t.q ? '' : ` What is the coefficient of ${F(t.ask)}?`) : (t.q ? '' : ' Balance it with the smallest whole-number coefficients.')}</p>`;
    case 'classify': return `<p>Classify this reaction.</p>`;
    case 'net': return `${t.pre ? `<p style="margin-bottom:8px">${F(t.pre)}</p>` : ''}<p>Write the net ionic equation and name the spectator ions for:</p><p style="margin-top:8px">${F(t.L.map(x => (x.c > 1 ? x.c : '') + x.f + '(' + x.st + ')').join(' + ') + ' → ' + t.R.map(x => (x.c > 1 ? x.c : '') + x.f + '(' + x.st + ')').join(' + '))}</p>`;
    case 'redox': return `<p>${F(t.L.join(' + ') + ' → ' + t.R.join(' + '))}</p><p style="margin-top:8px">Which reactant is oxidized and loses electrons? Which is reduced and gains electrons?</p>`;
    default: return `<p>${F(t.q)}</p>${t.fig ? `<div class="figs">${t.fig.map(f => `<figure>${lewisSVG(f.lw)}${f.label ? `<figcaption>${F(f.label)}</figcaption>` : ''}</figure>`).join('')}</div>` : ''}`;
  }
}
function drawHints(){
  const t = ui.t, el = document.getElementById('hints'); if (!el) return;
  if (ui.done){ el.innerHTML = ''; }
  else {
    const b = [];
    if (!ui.hints.rule) b.push(`<button class="pb sm" data-act="hint" data-h="rule" ${st.energy < 5 ? 'disabled' : ''}>Manual · 5 ${W().nrg.toLowerCase()}</button>`);
    if (t.type === 'calc' && !ui.hints.setup) b.push(`<button class="pb sm" data-act="hint" data-h="setup" ${st.energy < 10 ? 'disabled' : ''}>Setup · 10 ${W().nrg.toLowerCase()}</button>`);
    b.push(`<button class="pb sm" data-act="sheet">Data sheet</button>`);
    el.innerHTML = b.join('');
  }
  const parts = [];
  if (ui.hints.rule) parts.push(ruleCard(t.topic));
  if (ui.hints.setup) parts.push(`<div class="rule"><span class="lab">Setup</span><p>${F(ui.b.setup)}</p>${ui.b.grids ? `<div style="display:grid;gap:8px;margin-top:10px">${ui.b.grids.map(g => factorGrid(g, true)).join('')}</div>` : ''}</div>`);
  document.getElementById('hintbox').innerHTML = parts.join('');
}
function drawBody(){
  const t = ui.t, body = document.getElementById('body'); if (!body) return;
  const dis = ui.done ? 'disabled' : '';
  const verb = VERB[ui.room] || 'Engage';
  let h = '';
  switch (t.type){
    case 'calc': h = calcBody(verb); break;
    case 'numunit':
      h = `<div class="win dev"><div class="devh"><span>Gas analyzer</span><span>Set mode · enter mass</span></div>
        <div class="lever">
          <button class="lv" data-act="unit" data-u="amu" aria-pressed="${ui.kp.unit === 'amu'}" ${dis}>1 particle<b>amu</b></button>
          <button class="lv" data-act="unit" data-u="g" aria-pressed="${ui.kp.unit === 'g'}" ${dis}>1 mole<b>g</b></button>
        </div>
        ${lcdHTML(false)}${keysHTML(false)}
        <p class="err" id="err"></p>
        ${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`; break;
    case 'balance':
      h = `<div class="win dev"><div class="devh"><span>${CAMP.dev.balance}</span><span>Lowest whole numbers</span></div><div id="balbox">${reactorHTML(t.L, t.R, ui.coefs, ui.done)}</div>
        ${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`; break;
    case 'tf':
      h = `<div class="win dev"><div class="devh"><span>${CAMP.dev.tf}</span></div><div class="plates">
        <button class="pb ok plate" data-act="pickc" data-v="0" ${dis}>True</button><button class="pb bad plate" data-act="pickc" data-v="1" ${dis}>False</button></div></div>`; break;
    case 'choice':
      h = `<div class="win dev"><div class="devh"><span>${CAMP.dev.choice}</span></div><div class="plates">${t.opts.map((x, i) => `<button class="pb ${i ? 'cy' : 'go'} plate" data-act="pickc" data-v="${i}" ${dis}>${x}</button>`).join('')}</div></div>`; break;
    case 'nums':
      h = `<div class="win dev"><div class="devh"><span>${CAMP.dev.nums}</span></div><div class="gauges">
        ${['Mol in (reactants)', 'Mol out (products)'].map((lb, i) => `<div class="gauge"><span class="lab">${lb}</span><span class="gv">${ui.nv[i]}</span>
          <div class="row" style="justify-content:center"><button class="sbtn" data-act="nv" data-i="${i}" data-d="-1" aria-label="Decrease" ${dis}>−</button><button class="sbtn" data-act="nv" data-i="${i}" data-d="1" aria-label="Increase" ${dis}>+</button></div></div>`).join('')}
        </div>${ui.done ? '' : `<button class="pb go big" data-act="submit">Engage ▶</button>`}</div>`; break;
    case 'classify':
      h = `<div class="win dev"><div class="devh"><span>${CAMP.dev.classify}</span><span class="blink">●</span></div>
        <div class="scope"><div class="sweep"></div><div class="blip" id="blip">${F(t.eq)}</div></div>
        <div class="chans">${clsList(t).map(([k, n], i) => `<button class="pb" data-act="pickc" data-v="${k}" ${dis}><small>CH${i + 1}</small>${n}</button>`).join('')}</div></div>`; break;
    case 'mc':
      h = `<div class="win dev"><div class="devh"><span>${CAMP.dev.mc}</span><span>Pick one</span></div><div class="opts">${t.opts.map((o, i) => `<button class="opt" data-act="pickc" data-v="${i}" ${dis}><b>${'ABCDE'[i]}</b><span>${optHTML(o)}</span></button>`).join('')}</div></div>`; break;
    case 'numval':
      h = `<div class="win dev"><div class="devh"><span>${CAMP.dev.numval}</span><span>${F(t.unit)}</span></div>${lcdHTML(false)}${keysHTML(false)}
        <p class="err" id="err"></p>${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}</div>`; break;
    case 'text':
      h = `<div class="${CAMP.id === 'tower' ? 'crate scroll' : 'crate'} ${ui.done && ui.lastOk ? 'open' : ''}"><div class="label"><span class="lab">${CAMP.id === 'tower' ? 'Inscription' : 'New label'} · ${t.fields.some(f => f.cs) ? 'type subscripts as plain numbers, e.g. Fe2(SO4)3' : t.topic === 'name' ? 'old system uses -ous / -ic' : 'spelling counts, capitals don\'t'}</span>
        ${t.fields.map((f, i) => `<label class="lab" for="tx${i}" style="margin-top:6px">${F(f.label)}</label><input id="tx${i}" class="inpx" autocomplete="off" autocapitalize="off" spellcheck="false" ${dis}>`).join('')}</div>
        <p class="err" id="err" style="color:#fff3b0"></p>
        ${ui.done ? '' : `<button class="pb go big" data-act="submit">${VERB[ui.room] || 'Stamp label'} ▶</button>`}</div>`; break;
    case 'net': h = netBody(); break;
    case 'redox': h = redoxBody(); break;
    default: if (XT[t.type]) h = XT[t.type].body(t, dis, verb);
  }
  body.innerHTML = h;
}
function lcdHTML(sci){
  const k = ui.kp, act = f => !ui.done && k.f === f ? 'act' : '';
  const cur = f => !ui.done && k.f === f ? '<span class="cur"></span>' : '';
  const m = k.m ? k.m : `<span class="ph">${sci ? '0.00' : '0.00'}</span>`;
  const e = (k.neg ? '−' : '') + (k.e || (k.f === 'e' ? '' : '<span class="ph">0</span>'));
  return `<div class="lcd" id="lcd" aria-live="polite"><span class="fld ${act('m')}">${m}${cur('m')}</span>${sci ? `<span>×10</span><sup class="fld ${act('e')}">${e}${cur('e')}</sup>` : ''}<span class="u">${ui.kp.unit || '---'}</span></div>`;
}
function keysHTML(sci){
  const dis = ui.done ? 'disabled' : '';
  const K1 = d => `<button class="key" data-act="key" data-k="${d}" ${dis}>${d}</button>`;
  return `<div class="keys">
    ${K1(7)}${K1(8)}${K1(9)}<button class="key fn" data-act="key" data-k="bk" aria-label="Backspace" ${dis}>DEL</button>
    ${K1(4)}${K1(5)}${K1(6)}<button class="key fn ${ui.kp.f === 'e' ? 'on' : ''}" data-act="key" data-k="exp" ${sci ? dis : 'disabled'}>×10ⁿ</button>
    ${K1(1)}${K1(2)}${K1(3)}<button class="key fn ${ui.kp.neg ? 'on' : ''}" data-act="key" data-k="neg" aria-label="Toggle exponent sign" ${sci ? dis : 'disabled'}>±ⁿ</button>
    <button class="key w2" data-act="key" data-k="0" ${dis}>0</button><button class="key" data-act="key" data-k="." ${dis}>.</button><button class="key fn" data-act="key" data-k="clr" ${dis}>CLR</button>
  </div>`;
}
function calcBody(verb){
  const t = ui.t, b = ui.b; let h = '';
  if (t.gen === 'hydrate'){
    const locked = ui.phase !== 'select';
    const cols = [C.sr, C.blue, C.ba, C.na, C.pink, C.orange];
    h += `<div class="win dev"><div class="devh"><span>Step 1 · Load cartridges</span><span>${ui.sel.length} loaded</span></div>
      <div class="slots">${ui.sel.map(v => `<span class="cart" style="--c:${cols[b.chips.indexOf(v)]};min-width:70px;pointer-events:none">${v}</span>`).join('') || '<span class="lab" style="align-self:center">Empty. Tap the atomic masses you need.</span>'}</div>
      <div class="units">${b.chips.map((v, i) => { let cls = ''; if (locked){ cls = b.need.includes(v) ? 'good' : ui.sel.includes(v) ? 'bad' : ''; }
        return `<button class="cart ${cls}" style="--c:${cols[i]}" data-act="cart" data-v="${v}" aria-pressed="${ui.sel.includes(v)}" ${locked ? 'disabled' : ''}>${v}</button>`; }).join('')}</div>
      ${locked ? '' : `<button class="pb go" data-act="lockcarts">Load &amp; check ▶</button>`}<p class="err" id="err1"></p></div>`;
  }
  if (t.gen === 'limit'){
    const L = LIM[t.p.r], locked = ui.phase !== 'balance';
    h += `<div class="win dev"><div class="devh"><span>Step 1 · Balance the equation</span></div><div id="balbox">${reactorHTML(L.L, L.R, ui.coefs, locked)}</div>
      ${locked ? '' : `<button class="pb go" data-act="checkbal">Check balance ▶</button>`}<p class="err" id="err1"></p></div>`;
  }
  if (ui.phase === 'answer'){
    h += `<div class="win dev">
      <div class="devh"><span>${DEVNAME[ui.room] || 'Console'}</span><span>${t.gen === 'hydrate' || t.gen === 'limit' ? 'Step 2' : 'Final answer'}</span></div>
      <div class="paper"><b>PAPER</b><span>Work it by hand with units on every step. Round only at the end. Then enter your final answer.</span></div>
      ${lcdHTML(true)}
      <div class="units">${UNITS.map(u => `<button class="sw" data-act="unit" data-u="${u}" aria-pressed="${ui.kp.unit === u}" ${ui.done ? 'disabled' : ''}>${u}</button>`).join('')}</div>
      ${keysHTML(true)}
      <p class="err" id="err"></p>
      ${ui.done ? '' : `<button class="pb go big" data-act="submit">${verb} ▶</button>`}
    </div>`;
  }
  return h;
}
const ELC = { H:'#eef0f8', O:'#e43b44', C:'#8b93af', N:'#0099db', Cl:'#63c74d', Na:'#b55088', Al:'#c0cbdc', K:'#9a6ad8', Mg:'#3e8948', Fe:'#f77622', Ca:'#feae34', S:'#fee761' };
function reactorHTML(L, R, c, locked){
  const sp = (f, i) => `<div class="sp"><div class="step">${locked ? '' : `<button class="sbtn" data-act="coef" data-i="${i}" data-d="1" aria-label="Increase coefficient of ${f}">+</button>`}<span class="coef">${c[i]}</span>${locked ? '' : `<button class="sbtn" data-act="coef" data-i="${i}" data-d="-1" aria-label="Decrease coefficient of ${f}">−</button>`}</div><div class="form">${F(f)}</div></div>`;
  const s = balState(L, R, c);
  const dots = (n, el) => { const col = ELC[el] || '#2ce8f5'; const shown = Math.min(n, 24); return Array.from({length:shown}, () => `<i class="dot" style="background:${col}"></i>`).join('') + `<em>${n}</em>`; };
  const rows = s.t.els.map(e => { const a = s.t.l[e] || 0, b = s.t.r[e] || 0, ok = a === b;
    return `<div class="chrow"><b style="color:${ELC[e] || '#2ce8f5'}">${e}</b><div class="dots">${dots(a, e)}</div><span class="eqs ${ok ? 'y' : 'n'}">${ok ? '=' : '≠'}</span><div class="dots r">${dots(b, e)}</div></div>`; }).join('');
  const ml = c.slice(0, L.length).reduce((x, y) => x + y, 0), mr = c.slice(L.length).reduce((x, y) => x + y, 0);
  const good = s.bal && s.lowest;
  const o = mainScene(); if (o && !locked) o.live = s.bal;
  return `<div class="dev"><div class="eqrow">${L.map(sp).join('<span class="op">+</span>')}<span class="op">→</span>${R.map((f, k) => sp(f, L.length + k)).join('<span class="op">+</span>')}</div>
    <div class="chamber"><div class="chrow"><span class="lab">Atom</span><span class="lab">In</span><span></span><span class="lab">Out</span></div>${rows}</div>
    <div class="core"><span class="st ${s.bal ? 'y' : 'n'}">Atoms: ${s.bal ? (good ? 'stable' : 'reduce!') : 'unstable'}</span><span class="dim">Mol in ${ml} · mol out ${mr} (these don't have to match)</span></div></div>`;
}
function netBody(){
  const t = ui.t, N = ui.net, okDone = ui.done && ui.lastOk;
  const allSplit = N.L.concat(N.R).every(x => x.st !== 'aq' || x.split);
  const side = (arr, sd) => arr.map((x, i) => {
    if (x.st === 'aq' && x.split) return x.ions.map((io, j) => { const key = sd + i + '-' + j, s = N.struck[key];
      return `<button class="bb ${s ? 'vent' : ''} ${okDone && s ? 'gone' : ''}" data-act="nstrike" data-k="${key}" ${ui.done ? 'disabled' : ''}>${F((io[1] > 1 ? io[1] : '') + io[0])}</button>`; }).join('');
    return `<button class="bb ${x.st === 's' ? 'solid' : 'cmp'} ${okDone && x.st === 's' ? 'drop' : ''}" data-act="nsplit" data-side="${sd}" data-i="${i}" ${ui.done ? 'disabled' : ''}>${F((x.c > 1 ? x.c : '') + x.f + '(' + x.st + ')')}</button>`;
  }).join('');
  const instr = allSplit ? 'Step 2: tap the spectator ions to vent them. They appear unchanged on both sides.' : 'Step 1: tap each dissolved (aq) compound to split it into ions.';
  return `<div class="win dev"><div class="devh"><span>${CAMP.dev.net}</span><span>${allSplit ? 'Step 2' : 'Step 1'}</span></div>
    <p class="dim" style="margin:0;font-size:16px">${instr}</p>
    <div class="tank"><span class="lab">Intake · reactants</span><div class="tiles">${side(N.L, 'L')}</div></div>
    <div class="flow">▼ ▼ ▼</div>
    <div class="tank"><span class="lab">Outflow · products</span><div class="tiles">${side(N.R, 'R')}</div></div>
    <p class="err" id="err"></p>
    ${ui.done ? '' : `<button class="pb go big" data-act="submit" ${allSplit ? '' : 'disabled'}>${VERB[ui.room] || 'Flush tank'} ▶</button>`}</div>`;
}
function redoxBody(){
  const t = ui.t, X = ui.rx;
  const cell = (f, i) => { const cls = X.ox === i ? 'ox' : X.red === i ? 'red' : ''; const tg = X.ox === i ? 'Oxidized · loses e⁻' : X.red === i ? 'Reduced · gains e⁻' : 'Reactant';
    return `<button class="cell ${cls}" data-act="rpick" data-side="L" data-i="${i}" ${ui.done ? 'disabled' : ''}><span>${F(f)}</span><span class="tg">${tg}</span></button>`; };
  const prompt = X.ox === null ? 'Drag electrons FROM the reactant that loses them TO the one that gains them. Or tap the giver, then the taker.'
    : X.red === null ? 'Now tap the reactant that gains the electrons.' : 'Wired. Send the electrons.';
  return `<div class="win dev"><div class="devh"><span>Battery bank</span><span>OIL RIG</span></div>
    <p class="dim" style="margin:0;font-size:16px" id="rprompt">${prompt}</p>
    <div class="rxwrap" id="rxwrap"><svg aria-hidden="true"><polyline id="wire" points="" fill="none" stroke="#2ce8f5" stroke-width="5" stroke-dasharray="6 4" shape-rendering="crispEdges"></polyline></svg>
      <div class="cells">${t.L.map(cell).join('')}</div>
      <div class="flow">▼ products ▼</div>
      <div class="outs">${t.R.map((f, i) => `<button class="bb" data-act="rpick" data-side="R" data-i="${i}" ${ui.done ? 'disabled' : ''}>${F(f)}</button>`).join('')}</div>
    </div>
    <p class="err" id="err"></p>
    ${ui.done ? '' : `<div class="row"><button class="pb go" style="flex:1" data-act="submit" ${X.ox !== null && X.red !== null ? '' : 'disabled'}>Transfer e⁻ ▶</button><button class="pb" data-act="rreset">Reset</button></div>`}</div>`;
}

/* ========================================================================
   FACTOR-LABEL LAYOUTS: start amount × conversion factors = end amount
   ======================================================================== */
const finV = a => { const s = toSci(a.value, a.sf); return sci(s.m, s.e); };
const FL = {
  mass(p, b){
    const s = S[p.s], mg = p.out === 'mg';
    const cols = [[[sci(p.m, p.e), 'mol ' + s.f], null], [[String(s.mm), 'g ' + s.f], ['1', 'mol ' + s.f]]];
    if (mg) cols.push([['1000', 'mg ' + s.f], ['1', 'g ' + s.f]]);
    return { grids:[{cols, res:[finV(b.a), (mg ? 'mg ' : 'g ') + s.f], given:true}], notes:[b.work[0], b.work[b.work.length - 1]] };
  },
  particles(p, b){
    const s = S[p.s];
    return { grids:[{cols:[[[sci(p.m, p.e), 'g ' + s.f], null], [['1', 'mol ' + s.f], [String(s.mm), 'g ' + s.f]], [['6.022×10^23', s.p + ' ' + s.f], ['1', 'mol ' + s.f]]],
      res:[finV(b.a), s.p + ' ' + s.f], given:true}], notes:[b.work[0], b.work[b.work.length - 1]] };
  },
  molp(p, b){
    const s = S[p.s];
    return { grids:[{cols:[[[sci(p.m, p.e), s.p + ' ' + s.f], null], [['1', 'mol ' + s.f], ['6.022×10^23', s.p + ' ' + s.f]]], res:[finV(b.a), 'mol ' + s.f], given:true}],
      notes:[b.work[b.work.length - 1]] };
  },
  g2g(p, b){
    const rx = RX[p.rx], A = S[p.a], B = S[p.b], cA = rx.c[p.a], cB = rx.c[p.b];
    return { grids:[{cols:[[[p.g, 'g ' + A.f], null], [['1', 'mol ' + A.f], [String(A.mm), 'g ' + A.f]], [[String(cB), 'mol ' + B.f], [String(cA), 'mol ' + A.f]], [[String(B.mm), 'g ' + B.f], ['1', 'mol ' + B.f]]],
      res:[finV(b.a), 'g ' + B.f], given:true}], notes:[`Balanced: ${rx.eq}. The mole ratio comes from the coefficients.`, b.work[0], b.work[b.work.length - 1]] };
  },
  limit(p, b){
    const L = LIM[p.r], P = S[L.prod], c = L.sol, cP = c[L.pi], fA = +p.mA * 10 ** p.eA * cP / c[0], fB = +p.mB * 10 ** p.eB * cP / c[1];
    const lim = Math.min(fA, fB), limName = fA <= fB ? L.names[0] : L.names[1];
    const one = (m, e, f, k, v, nm) => ({label:'What ' + nm + ' can make', cols:[[[sci(m, e), 'mol ' + f], null], [[String(cP), 'mol ' + P.f], [String(c[k]), 'mol ' + f]]], res:[num(v, 4), 'mol ' + P.f], given:true});
    return { grids:[one(p.mA, p.eA, L.L[0], 0, fA, L.names[0]), one(p.mB, p.eB, L.L[1], 1, fB, L.names[1]),
      {label:limName[0].toUpperCase() + limName.slice(1) + ' makes less, so it is limiting. Convert its amount:', cols:[[[num(lim, 4), 'mol ' + P.f], null], [[String(P.mm), 'g ' + P.f], ['1', 'mol ' + P.f]]], res:[finV(b.a), 'g ' + P.f]}],
      notes:[b.work[0], b.work[b.work.length - 1]] };
  }
};
function factorGrid(g, hide){
  const nums = [], dens = [], strike = new Set();
  g.cols.forEach((c, i) => { if (c[0]) nums.push({i, u:c[0][1]}); if (c[1]) dens.push({i, u:c[1][1]}); });
  dens.forEach(d => { const n = nums.find(x => !x.used && x.u === d.u && x.i !== d.i); if (n){ n.used = true; strike.add('n' + n.i); strike.add('d' + d.i); } });
  const showV = i => !hide || (i === 0 && g.given);
  const cell = (v, k, i) => v ? `<span class="flv">${showV(i) ? F(v[0]) : '?'}</span><span class="flu ${strike.has(k + i) ? 'x' : ''}">${F(v[1])}</span>` : '<span class="flv">&nbsp;</span>';
  return `<div class="fl">${g.label ? `<span class="lab">${F(g.label)}</span>` : ''}<div class="flscroll"><div class="flg">
    ${g.cols.map((c, i) => `<div class="flc ${i ? '' : 'first'}"><div class="fln">${cell(c[0], 'n', i)}</div><div class="fld">${cell(c[1], 'd', i)}</div></div>`).join('')}
    <div class="flend"><div class="fleq">=</div><div class="flr"><span class="flv">${hide ? '?' : F(g.res[0])}</span><span class="flu">${F(g.res[1])}</span></div></div></div></div></div>`;
}
const flKey = '<p class="flkey"><b class="k1">Start</b> with what you\'re given. Multiply by factors so each unit on top cancels one on the bottom (<s>red</s>). <b class="k2">End</b> with the unit you want.</p>';

/* ========================================================================
   GRADING
   ======================================================================== */
function gradeSci(){
  const a = ui.b.a, k = ui.kp;
  const ms = k.m;
  if (!/^(\d+\.?\d*|\.\d+)$/.test(ms)) return { err:'Punch in the number first, like 1.23.' };
  if (!k.unit) return { err:'Pick a unit.' };
  let e = parseInt(k.e || '0', 10); if (k.neg) e = -Math.abs(e);
  const mv = parseFloat(ms); if (mv === 0) return { err:'Zero isn\'t the answer here.' };
  const uv = mv * 10 ** e;
  const digits = ms.replace('.', '').replace(/^0+/, '');
  const usf = ms.includes('.') ? digits.length : (digits.replace(/0+$/, '').length || 1);
  const normd = a.anyForm || (mv >= 1 && mv < 10);
  const sfOk0 = usf === a.sf || (a.sfAlt || []).includes(usf), sfUse = sfOk0 ? usf : a.sf;
  const ts = toSci(a.value, sfUse), ev = parseFloat(ts.m) * 10 ** ts.e, ulp = 10 ** (ts.e - sfUse + 1);
  const uUlp = 10 ** (Math.floor(Math.log10(Math.abs(uv))) - usf + 1);
  const close = Math.abs(uv - a.value) <= Math.max(.006 * Math.abs(a.value), .55 * uUlp, 1.01 * ulp);
  const sfOk = sfOk0, exact = Math.abs(uv - ev) <= 1.01 * ulp, valOk = close && (!sfOk || exact), unitOk = k.unit === a.unit || (a.unitAlt || []).includes(k.unit);
  let vDet = 'Matches the answer key.';
  if (!close){
    const ratio = uv / a.value, p = Math.round(Math.log10(Math.abs(ratio)));
    vDet = (p !== 0 && Math.abs(ratio / 10 ** p - 1) < .01)
      ? `Your digits are right, but the value is off by a factor of 10^${p}. Check your exponent${a.unit === 'mg' ? ' and the g → mg step' : ''}.`
      : `This doesn't match the key. Compare your paper with the worked solution below.`;
  } else if (!valOk) vDet = 'Close, but the last digit is off. Keep extra digits until the final step.';
  const rows = [
    ['Value', valOk, vDet],
    ['Sig figs', sfOk, sfOk ? `${a.sf} sig figs.` : `You gave ${usf}. This answer needs ${a.sf}.`],
    a.anyForm ? ['Notation', true, 'Standard or scientific notation both count here.'] : ['Scientific notation', normd, normd ? 'The number in front is between 1 and 10.' : 'The number in front must be at least 1 and less than 10.'],
    ['Units', unitOk, unitOk ? a.unit : `The unit should be ${a.unit}.`]
  ];
  return { ok:valOk && sfOk && normd && unitOk, sev:close ? 'minor' : 'major', rows, you:`${ms}×10^${e} ${k.unit}` };
}
const normT = (s, cs) => { s = String(s).replace(/[₀-₉]/g, d => '₀₁₂₃₄₅₆₇₈₉'.indexOf(d)).replace(/\s+/g, ''); return cs ? s : s.toLowerCase(); };
const listChecks = rows => `<ul class="checks">${rows.map(r => `<li><span class="mk ${r[1] ? 'y' : 'n'}">${r[1] ? '✓' : '✗'}</span><span><b>${r[0]}.</b> ${F(r[2])}</span></li>`).join('')}</ul>`;
const workList = lines => `<span class="lab">Worked solution · compare with your paper</span><ol class="work">${lines.map(l => `<li>${F(l)}</li>`).join('')}</ol>`;
function solutionHTML(t){
  switch (t.type){
    case 'calc': {
      if (!ui.b.grids) return `<p>Key: <b>${F(keyText(ui.b.a))}</b></p>${workList(ui.b.work)}`;
      return `<p>Key: <b>${F(keyText(ui.b.a))}</b></p><span class="lab">Worked solution · set it up like this</span>${ui.b.grids.map(g => factorGrid(g)).join('')}${flKey}
        <ol class="work">${ui.b.notes.map(l => `<li>${F(l)}</li>`).join('')}</ol>`;
    }
    case 'numunit': return `<p>Key: <b>${t.v.toFixed(2)} ${t.unit}</b>. ${F(t.why)}</p>`;
    case 'balance': { const idx = t.L.concat(t.R).indexOf(t.ask); return `<p>Balanced: <b>${F(balancedText(t.L, t.R, t.sol))}</b></p><p>Coefficient of ${F(t.ask)}: <b>${t.sol[idx]}</b></p>`; }
    case 'nums': return `<p>Key: <b>${t.a[0]} mol</b> reactants, <b>${t.a[1]} mol</b> products. ${F(t.why)}</p>`;
    case 'tf': return `<p>Answer: <b>${t.a ? 'True' : 'False'}</b>. ${F(t.why)}</p>`;
    case 'choice': return `<p>Answer: <b>${t.opts[t.a]}</b>. ${F(t.why)}</p>`;
    case 'classify': { const L = clsList(t), nm = k => L.find(c => c[0] === k)[1];
      return `<p>Answer: <b>${nm(t.a)}</b>${t.alt && t.alt.length ? ` (also accepted: ${t.alt.map(nm).join(', ')})` : ''}. ${F(t.why)}</p>`; }
    case 'mc': return `<p>Answer: <b>${'ABCDE'[t.a]}</b>${typeof t.opts[t.a] === 'string' ? ` · ${F(t.opts[t.a])}` : ''}.</p><p>${F(t.why)}</p>`;
    case 'numval': return `<p>Answer: <b>${t.v} ${F(t.unit)}</b>. ${F(t.why)}</p>`;
    case 'text': return `<p>${t.fields.map(f => `${F(f.label)}: <b>${F(f.disp || f.accept[0])}</b>`).join('<br>')}</p><p>${F(t.why)}</p>`;
    case 'net': return `<p>Net ionic: <b>${F(t.net)}</b></p><p>Spectators: <b>${F(t.spect.join(', '))}</b></p>`;
    case 'redox': return `<p>Oxidized: <b>${F(t.L[t.ox])}</b>. Reduced: <b>${F(t.L[t.red])}</b>.</p><p>${F(t.why)}</p>`;
    default: if (XT[t.type]) return XT[t.type].solution(t);
  }
  return '';
}
function submit(){
  if (ui.done) return;
  const t = ui.t, err = document.getElementById('err'); const setErr = m => { if (err) err.textContent = m; SND.play('jam'); };
  let ok = false, sev = 'major', html = '';
  switch (t.type){
    case 'calc': {
      const g = gradeSci(); if (g.err) return setErr(g.err);
      const pre = [];
      if (ui.flags.sel) pre.push(['Cartridges', false, 'You loaded the wrong set of atomic masses in step 1.']);
      if (ui.flags.bal) pre.push(['Balancing', false, 'The equation wasn\'t balanced on your first try.']);
      ok = g.ok && !ui.flags.sel && !ui.flags.bal; sev = g.sev;
      html = `<p>You entered <b>${F(g.you)}</b></p>${listChecks(pre.concat(g.rows))}${solutionHTML(t)}`;
      break;
    }
    case 'numunit': {
      const v = parseFloat(ui.kp.m);
      if (isNaN(v)) return setErr('Punch in a number.'); if (!ui.kp.unit) return setErr('Set the analyzer to amu or g.');
      const vOk = Math.abs(v - t.v) <= .06, uOk = ui.kp.unit === t.unit; ok = vOk && uOk; sev = vOk ? 'minor' : 'major';
      html = listChecks([['Value', vOk, vOk ? 'Correct.' : `The key says ${t.v.toFixed(2)}.`], ['Unit', uOk, uOk ? t.unit : `It should be ${t.unit}. ${t.unit === 'g' ? 'One mole is measured in grams.' : 'One particle is measured in amu.'}`]]) + `<p>${F(t.why)}</p>`;
      break;
    }
    case 'balance': {
      const s = balState(t.L, t.R, ui.coefs); ok = ui.coefs.every((x, i) => x === t.sol[i]);
      const msg = ok ? '' : !s.bal ? 'The equation wasn\'t balanced. Check the ≠ rows.' : !s.lowest ? 'Balanced, but not in lowest whole numbers. Divide every coefficient by the same number.' : 'Balanced, but not the expected coefficients.';
      html = (msg ? `<p>${msg}</p>` : '') + solutionHTML(t);
      if (!ok) ui.coefs = t.sol.slice();
      break;
    }
    case 'nums': ok = ui.nv[0] === t.a[0] && ui.nv[1] === t.a[1]; html = solutionHTML(t); break;
    case 'numval': {
      const v = parseFloat(ui.kp.m); if (isNaN(v)) return setErr('Punch in a number.');
      ok = Math.abs(v - t.v) <= (t.tol != null ? t.tol : Math.max(1e-9, Math.abs(t.v) * .005)); sev = 'major';
      html = `<p>You entered <b>${ui.kp.m} ${F(t.unit)}</b></p>${solutionHTML(t)}`; break;
    }
    case 'text': {
      const vals = t.fields.map((f, i) => normT(document.getElementById('tx' + i).value, f.cs));
      if (vals.some(v => !v)) return setErr('Fill in every line of the label.');
      const rows = t.fields.map((f, i) => { const good = f.accept.map(a => normT(a, f.cs)).includes(vals[i]); return [f.label, good, good ? 'Correct.' : `Answer: ${f.disp || f.accept[0]}`]; });
      ok = rows.every(r => r[1]); html = listChecks(rows) + `<p>${F(t.why)}</p>`; break;
    }
    case 'net': {
      const N = ui.net, wrong = [];
      [['L', N.L], ['R', N.R]].forEach(([sd, arr]) => arr.forEach((x, i) => { if (x.ions) x.ions.forEach((io, j) => { const k = sd + i + '-' + j; if (!!N.struck[k] !== t.spect.includes(io[0])) wrong.push(io[0]); }); }));
      ok = !wrong.length && !N.solidTap;
      html = `${N.solidTap ? '<p>You tried to split a solid. Solids stay together.</p>' : ''}${wrong.length ? `<p>Check these ions: ${F([...new Set(wrong)].join(', '))}.</p>` : ''}${solutionHTML(t)}`;
      break;
    }
    case 'redox': {
      const X = ui.rx; ok = X.ox === t.ox && X.red === t.red && !X.prodTap;
      html = `${X.prodTap ? '<p>You picked a product. Pick from the reactants only.</p>' : ''}${solutionHTML(t)}`;
      break;
    }
    default: if (XT[t.type]){ const r = XT[t.type].grade(t); if (r.err) return setErr(r.err); ok = r.ok; sev = r.sev || 'major'; html = r.html; }
  }
  resolve(ok, sev, html);
}
function pickChoice(v){
  if (ui.done || ui.busy) return;
  const t = ui.t; let ok = false;
  if (t.type === 'tf') ok = (v === '0') === t.a;
  if (t.type === 'choice') ok = +v === t.a;
  if (t.type === 'classify') ok = v === t.a || (t.alt || []).includes(v);
  if (t.type === 'mc') ok = +v === t.a;
  ui.picked = v;
  resolve(ok, 'major', solutionHTML(t));
}
const clsList = t => t.cls === 2 ? CLASSES2 : CLASSES;
function keyText(a){
  if (a.anyForm){ const v = a.value, pl = Number(v.toPrecision(a.sf)); if (Math.abs(v) >= 1e-3 && Math.abs(v) < 1e5){ let s = v.toPrecision(a.sf); if (s.includes('e')) s = String(pl); return `${s} ${a.unit} (= ${ansText(a)})`; } }
  return ansText(a);
}
const OKL = ['Repair holds. Nice.', 'Clean. Exactly what the key says.', 'That\'s how it\'s done.', 'Confirmed. Moving on.', 'Good. I\'d have gotten that too, before the meteor.'];
const MINORL = ['The number is right, but the format isn\'t. On the quiz that still costs you.', 'So close. Check sig figs, notation, and units.'];
const FAILL = ['Fault detected. Compare your paper with the worked solution.', 'That\'s off. Find the step where your work splits from mine.', 'Not this time. Read the solution, then we go again with new numbers.'];
function resolve(ok, sev, html){
  const c = st.cur, t = ui.t, m = modOf(c.m);
  ui.done = true; ui.lastOk = ok; stopTimer();
  const rankBefore = rankIdx(st.xp);
  const s = st.stats[t.topic] || (st.stats[t.topic] = {n:0, ok:0}); s.n++; if (ok) s.ok++;
  if (!t.reroute && !m.final && !m.repair && !st.done.includes(m.id)){ st.score.n++; if (ok) st.score.ok++; }
  const earned = []; let extra = '';
  const o = mainScene(); const now = performance.now() / 1000; const r = sceneRect();
  if (ok){
    c.ok = (c.ok || 0) + 1; if (!t.reroute) c.first++;
    st.streak++; st.best = Math.max(st.best, st.streak);
    const gain = t.reroute || m.repair ? 4 : 10, bonus = st.streak >= 5 ? 10 : st.streak >= 3 ? 5 : 0;
    st.energy += gain + bonus; st.xp += gain + bonus;
    if (t.type === 'calc'){ st.calcStreak++; if (st.calcStreak >= 5) earned.push('sniper'); }
    earned.push('first'); if (st.streak >= 3) earned.push('s3'); if (st.streak >= 5) earned.push('s5'); if (st.streak >= 10) earned.push('s10');
    if (t.reroute) earned.push('comeback');
    extra = `<p class="gain">+${gain} ${W().energy}${bonus ? ` · combo x${st.streak} +${bonus}` : ''}</p>`;
    if (m.repair){
      const before = st.hull; st.hull = Math.min(100, st.hull + 15); st.wrongs = st.wrongs.filter(w => w.id !== t.id);
      earned.push('welder');
      extra += `<p class="gain" style="color:var(--ba)">${W().patched} · +${st.hull - before} ${W().hull} (now ${st.hull}%)</p>`;
    }
    if (o){ o.okUntil = now + 3; o.live = false; if (m.final) o.charge = c.ok / c.queue.length; }
    SND.play(bonus ? 'combo' : 'ok'); flash('green');
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, 30, [C.na, C.cu, C.ba, C.white]);
    const en = document.getElementById('enev').getBoundingClientRect();
    fx.fly(r.left + r.width / 2, r.top + r.height / 2, en.left + 6, en.top + 6, 8, C.na);
    say(st.streak >= 3 ? `${st.streak} in a row. Combo bonus.` : pick(OKL), 'happy');
    if (t.type === 'redox') setTimeout(sendElectrons, 50);
    const bar = view.querySelector('.cbar i'); if (bar) bar.style.width = Math.round(100 * c.ok / c.queue.length) + '%';
  } else {
    st.streak = 0; if (t.type === 'calc') st.calcStreak = 0;
    st.missed[t.topic] = (st.missed[t.topic] || 0) + 1;
    if (m.repair){
      extra = `<p class="dmg">${W().patchFail}</p>`;
    } else {
      const d = sev === 'minor' ? 6 : 15; st.hull -= d;
      extra = `<p class="dmg">−${d} ${W().hull}${sev === 'minor' ? ' · formatting only' : ''}</p>`;
      if (st.hull <= 0){ st.patches++; st.hull = 35; extra += `<p class="dmg">${W().failHull} #${st.patches}. ${W().Hull} back to 35.</p>`; }
      addWrong(t);
      extra += `<p class="dim" style="font-size:15px">${W().added}</p>`;
      if ((t.depth || 0) < 2){ c.queue.push(variantOf(t, true)); c.rer++; extra += `<p class="dim" style="font-size:15px">${CAMP.pal} also queued a ${t.type === 'calc' ? 'version with new values' : 'related question'}.</p>`; }
    }
    if (o){ o.failUntil = now + 1.2; o.live = false; }
    SND.play(sev === 'minor' ? 'minor' : 'fail'); flash('red'); shake();
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, 24, [C.sr, C.orange, C.na]);
    say(sev === 'minor' ? pick(MINORL) : pick(FAILL) + ' Rule: ' + stripTags(TOPICS[t.topic].rule).split('. ')[0] + '.', sev === 'minor' ? 'smug' : 'worried');
  }
  save();
  const snap = {}; view.querySelectorAll('input').forEach(i => { snap[i.id] = i.value; });
  drawBody(); drawHints();
  for (const id in snap){ const el = document.getElementById(id); if (el) el.value = snap[id]; }
  if (['tf','choice','classify','mc'].includes(t.type)) markPicked(ok);
  document.getElementById('fb').innerHTML = `<div class="win fb ${ok ? 'ok' : 'no'}"><div class="fbh">${ok ? W().fixed : W().fault}</div>
    <div class="fbb">${html}${extra}<button class="pb go big" data-act="next">Next ▶</button></div></div>`;
  hud(); award(earned);
  const rankAfter = rankIdx(st.xp);
  if (rankAfter > rankBefore) setTimeout(() => { toast('Promoted!', 'You are now ' + RANKS[rankAfter][1] + '.', C.na); SND.play('rank'); }, 1200);
  setTimeout(() => { const f = document.getElementById('fb'); if (f) f.scrollIntoView({behavior:reduced() ? 'auto' : 'smooth', block:'start'}); }, 250);
}
const stripTags = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
function markPicked(ok){
  view.querySelectorAll('[data-act="pickc"]').forEach(b => {
    const t = ui.t, v = b.dataset.v;
    const right = t.type === 'tf' ? ((v === '0') === t.a) : (t.type === 'choice' || t.type === 'mc') ? +v === t.a : (v === t.a || (t.alt || []).includes(v));
    if (right){ b.classList.remove('bad', 'go', 'cy'); b.classList.add('ok'); b.disabled = false; b.style.pointerEvents = 'none'; }
    else if (v === ui.picked && !ok){ b.classList.remove('ok', 'go', 'cy'); b.classList.add('bad'); b.disabled = false; b.style.pointerEvents = 'none'; }
  });
}
function sendElectrons(){
  if (reduced()) return;
  const wrap = document.getElementById('rxwrap'); if (!wrap) return;
  const tiles = wrap.querySelectorAll('.cell'); const a = tiles[ui.t.ox], b = tiles[ui.t.red]; if (!a || !b) return;
  const w = wrap.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
  const x0 = ra.left - w.left + ra.width / 2, y0 = ra.top - w.top + 10, x1 = rb.left - w.left + rb.width / 2, y1 = rb.top - w.top + 10;
  SND.play('zap');
  for (let k = 0; k < 4; k++){
    const d = document.createElement('span'); d.className = 'edot'; d.style.left = (x0 - 5) + 'px'; d.style.top = (y0 - 5) + 'px'; wrap.appendChild(d);
    const an = d.animate([{transform:'translate(0,0)'}, {transform:`translate(${(x1 - x0) / 2}px,${-36}px)`}, {transform:`translate(${x1 - x0}px,${y1 - y0}px)`}], {duration:900, delay:k * 160, easing:'steps(9)', fill:'both'});
    an.onfinish = () => d.remove();
  }
}

/* Exam timer (escape only) */
function startTimer(sec){
  ui.deadline = Date.now() + sec * 1000;
  const tick = () => {
    const el = document.getElementById('timer'); const left = Math.max(0, Math.ceil((ui.deadline - Date.now()) / 1000));
    if (el){ el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; el.classList.toggle('low', left <= 15); }
    if (left <= 10 && left > 0 && !ui.done) SND.play('tick');
    if (left <= 0){ stopTimer(); if (!ui.done) resolve(false, 'major', '<p>Time ran out.</p>' + solutionHTML(ui.t)); }
  };
  tick(); ui.tint = setInterval(tick, 1000);
}
function stopTimer(){ if (ui && ui.tint){ clearInterval(ui.tint); ui.tint = null; } }

/* ========================================================================
   MODULE END, ENDING, REPORT, BADGES
   ======================================================================== */
function nextTask(){
  const c = st.cur; c.pos++;
  if (c.pos < c.queue.length){ save(); renderTask(); return; }
  const m = modOf(c.m), tot = c.queue.filter(x => !x.reroute).length;
  if (m.repair){
    const fixed = c.ok || 0; st.cur = st.parked || null; st.parked = null; save();
    show(`<section class="scr">
      ${sceneHTML(CAMP.repair.id, Math.max(.2, st.hull / 100), `<span class="stag">${W().Bay.toUpperCase()} · ${W().Hull.toUpperCase()} ${st.hull}%</span>`)}
      <h1 class="h1">${W().doneWeld}</h1>
      ${talkHTML()}
      <div class="stats"><div class="stat"><span class="lab">${W().welded}</span><b>${fixed}/${tot}</b></div><div class="stat"><span class="lab">${W().Hull}</span><b>${st.hull}%</b></div><div class="stat"><span class="lab">${W().cracksLeft}</span><b>${st.wrongs.length}</b></div></div>
      <div class="stack">${st.wrongs.length ? `<button class="pb" data-act="repair">${W().weldMore} (${Math.min(5, st.wrongs.length)})</button>` : ''}<button class="pb go big" data-act="map">Back to map ▶</button></div>
    </section>`);
    if (fixed) SND.play('power');
    say(!fixed ? 'None held this time. Read the worked solutions and come back.' : st.wrongs.length ? `${fixed} ${W().crack}${fixed > 1 ? 's' : ''} ${W().weld === 'weld' ? 'welded' : 'mended'}. ${st.wrongs.length} left.` : `Every ${W().crack} is sealed. That's the stuff you used to miss, now fixed.`, fixed ? 'happy' : 'worried');
    return;
  }
  const first = !st.done.includes(m.id);
  if (first) st.done.push(m.id);
  const res = { first:c.first, tot, rer:c.rer };
  const earned = [];
  if (c.first === tot) earned.push('flawless');
  if (!c.hints) earned.push('nohint');
  st.cur = null;
  if (m.final){ st.finished = true; earned.push(CAMP.finalBadge); if (!st.patches) earned.push('iron'); save(); renderEnding(res, earned); return; }
  save();
  show(`<section class="scr">
    ${sceneHTML(m.id, 1, `<span class="stag">${W().unit.toUpperCase()} ${MODS.indexOf(m) + 1} · ${W().online.toUpperCase()}</span>`)}
    <h1 class="h1">${m.name} restored</h1>
    ${talkHTML()}
    <div class="stats">
      <div class="stat"><span class="lab">First try</span><b>${res.first}/${res.tot}</b></div>
      <div class="stat"><span class="lab">Reroutes</span><b>${res.rer}</b></div>
      <div class="stat"><span class="lab">Best streak</span><b>${st.best}</b></div>
    </div>
    <div id="dlgbtns"></div>
  </section>`);
  SND.play('power'); flash('green');
  const r = sceneRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, 50, [C.na, C.cu, C.ba, C.white, C.pink], 7);
  ui.dlg = { lines:m.outro, i:0, after:`<button class="pb go big" data-act="map">Back to map ▶</button>`, exprs:m.outro.map(() => 'happy') };
  dlgStep();
  award(earned);
}
function renderEnding(res, earned){
  const pct = st.score.n ? Math.round(100 * st.score.ok / st.score.n) : 0;
  const [head, lines] = CAMP.ending(pct, st.patches);
  show(`<section class="scr" style="text-align:center">
    <canvas data-art="${CAMP.art}" data-lit="1" class="pix shipart" width="48" height="64" style="margin:0 auto" aria-hidden="true"></canvas>
    <h1 class="h1">${head}</h1>
    ${talkHTML()}
    <div class="stats">
      <div class="stat"><span class="lab">Guide first-try</span><b>${st.score.ok}/${st.score.n}</b></div>
      <div class="stat"><span class="lab">${W().check}</span><b>${res.first}/${res.tot}</b></div>
      <div class="stat"><span class="lab">Patches</span><b>${st.patches}</b></div>
      <div class="stat"><span class="lab">Rank</span><b style="font-size:11px">${RANKS[rankIdx(st.xp)][1]}</b></div>
    </div>
    <div id="dlgbtns"></div>
    <div class="stack"><button class="pb" data-act="report">Study report</button><button class="pb" data-act="badges">Badges</button><button class="pb" data-act="remix" data-c="${CAMP.id}">${ui.confirm === 'remix:' + CAMP.id ? 'Tap again to remix' : 'Remix: new numbers'}</button></div>
  </section>`);
  if (CAMP.id === 'tower'){ SND.play('power'); const r = sceneRect(); fx.burst(innerWidth / 2, 160, 60, [C.cu, '#9ff7ff', C.white, C.pink], 8); }
  else { SND.play('warp'); stars.warp = 1; if (!reduced()) setTimeout(() => { stars.warp = 0; }, 2600); else stars.warp = 0; }
  flash('green');
  ui.dlg = { lines, i:0, after:'', exprs:lines.map(() => 'happy') }; dlgStep();
  award(earned);
}
function renderReport(){
  const keys = [...new Set([...MODS.flatMap(m => m.topics), ...Object.keys(st.stats)])].filter(k => TOPICS[k]);
  const rows = keys.map(k => {
    const s = st.stats[k], pct = s && s.n ? Math.round(100 * s.ok / s.n) : null;
    const col = pct === null ? 'var(--line)' : pct >= 80 ? 'var(--ba)' : pct >= 60 ? 'var(--na)' : 'var(--sr)';
    const on = pct === null ? 0 : Math.round(pct / 10);
    return { k, pct, html:`<div class="rrow"><span>${F(TOPICS[k].name)} <span class="dim" style="font-size:14px">${s ? `(${s.ok}/${s.n})` : '(not tried)'}</span></span><span class="rpct">${pct === null ? '--' : pct + '%'}</span>
      <div class="rsegs">${Array.from({length:10}, (_, i) => `<i style="${i < on ? 'background:' + col : ''}"></i>`).join('')}</div></div>` };
  });
  const weak = rows.filter(r => r.pct !== null && r.pct < 80);
  show(`<section class="scr">
    <h1 class="h1">Study report</h1>
    <p class="dim" style="margin:0">${CAMP.title} · accuracy per topic, counting every attempt (reroutes and ${W().bay} included).</p>
    <div class="win rep">${rows.map(r => r.html).join('')}</div>
    ${weak.length ? `<span class="lab">Review these manual pages</span>${weak.map(r => ruleCard(r.k)).join('')}` : (Object.keys(st.stats).length ? '<p>No weak topics so far.</p>' : '')}
    <div class="row"><button class="pb go" data-act="map">Map</button><button class="pb" data-act="title">Title</button></div>
  </section>`);
}
function renderBadges(){
  const ri = rankIdx(st.xp), nxt = RANKS[ri + 1];
  show(`<section class="scr">
    <h1 class="h1">${RANKS[ri][1]}</h1>
    <p class="dim" style="margin:0">${st.xp} XP${nxt ? ` · ${nxt[0] - st.xp} XP to ${nxt[1]}` : ' · top rank'} · best streak ${st.best}</p>
    <div class="bgrid">${BADGES.map(b => { const has = st.badges.includes(b.id);
      return `<div class="win bdg ${has ? '' : 'lock'}"><canvas class="pix" width="12" height="14" data-medal="${b.c}" data-lock="${has ? 0 : 1}" aria-hidden="true"></canvas><b>${b.name}</b><span>${b.d}</span></div>`; }).join('')}</div>
    <div class="row"><button class="pb go" data-act="map">Map</button><button class="pb" data-act="title">Title</button></div>
  </section>`);
}

/* ========================================================================
   INPUT
   ======================================================================== */
function keyIn(k){
  const kp = ui.kp; if (!kp || ui.done) return;
  const sci = ui.t.type === 'calc';
  if (k === 'exp'){ if (sci) kp.f = kp.f === 'm' ? 'e' : 'm'; }
  else if (k === 'neg'){ if (sci){ kp.neg = !kp.neg; kp.f = 'e'; } }
  else if (k === 'bk'){ if (kp.f === 'e' && !kp.e && sci){ kp.f = 'm'; } else kp[kp.f] = kp[kp.f].slice(0, -1); }
  else if (k === 'clr'){ kp.m = ''; kp.e = ''; kp.neg = false; kp.f = 'm'; }
  else if (k === '.'){ if (kp.f === 'm' && !kp.m.includes('.')) kp.m = (kp.m || '0') + '.'; }
  else if (/^\d$/.test(k)){ if (kp.f === 'm'){ if (kp.m.length < 9) kp.m += k; } else if (kp.e.length < 2) kp.e += k; }
  SND.play('key');
  const lcd = document.getElementById('lcd'); if (lcd) lcd.outerHTML = lcdHTML(sci);
  view.querySelectorAll('[data-k="exp"]').forEach(b => b.classList.toggle('on', kp.f === 'e'));
  view.querySelectorAll('[data-k="neg"]').forEach(b => b.classList.toggle('on', kp.neg));
}
document.addEventListener('keydown', e => {
  if (!ui.kp || ui.done || e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey) return;
  if (!document.getElementById('lcd')) return;
  const map = {Backspace:'bk', Delete:'clr', e:'exp', E:'exp', '^':'exp', '-':'neg', '.':'.', ',':'.'};
  if (/^\d$/.test(e.key)){ keyIn(e.key); e.preventDefault(); }
  else if (map[e.key]){ keyIn(map[e.key]); e.preventDefault(); }
  else if (e.key === 'Enter'){ const s = view.querySelector('[data-act="submit"]:not([disabled])'); if (s){ e.preventDefault(); s.click(); } }
});
view.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
  const s = view.querySelector('[data-act="submit"]:not([disabled])'); if (s){ e.preventDefault(); s.click(); }
});

/* Drag electrons between reactant cells */
let drag = null;
view.addEventListener('pointerdown', e => {
  const cell = e.target.closest('.cell'); if (!cell || ui.done || !ui.rx) return;
  const wrap = document.getElementById('rxwrap'); const w = wrap.getBoundingClientRect(), r = cell.getBoundingClientRect();
  drag = { from:+cell.dataset.i, x0:r.left - w.left + r.width / 2, y0:r.top - w.top + r.height / 2, moved:false, sx:e.clientX, sy:e.clientY };
});
view.addEventListener('pointermove', e => {
  if (!drag) return;
  if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 12) drag.moved = true;
  if (!drag.moved) return;
  const wrap = document.getElementById('rxwrap'); if (!wrap) return; const w = wrap.getBoundingClientRect();
  const x = e.clientX - w.left, y = e.clientY - w.top, mx = (drag.x0 + x) / 2;
  document.getElementById('wire').setAttribute('points', `${drag.x0},${drag.y0} ${mx},${drag.y0} ${mx},${y} ${x},${y}`);
});
addEventListener('pointerup', e => {
  if (!drag) return; const d = drag; drag = null;
  const wire = document.getElementById('wire'); if (wire) wire.setAttribute('points', '');
  if (!d.moved) return;
  ui.rx.dragged = true;
  const el = document.elementFromPoint(e.clientX, e.clientY); const tgt = el && el.closest('[data-act="rpick"]');
  if (!tgt) return;
  if (tgt.dataset.side === 'R'){ ui.rx.prodTap = true; SND.play('jam'); tgt.classList.add('shk'); const er = document.getElementById('err'); if (er) er.textContent = 'That\'s a product. Electrons move between reactants.'; return; }
  const to = +tgt.dataset.i; if (to === d.from) return;
  ui.rx.ox = d.from; ui.rx.red = to; SND.play('zip'); drawBody();
});

document.addEventListener('pointerdown', () => SND.init(), {once:true});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const act = b.dataset.act;
  if (act !== 'new' && act !== 'remix') ui.confirm = null;
  if (!['key', 'dlg-next', 'unit', 'coef', 'nstrike', 'nsplit', 'rpick', 'cart', 'nv', 'pickc', 'submit', 'fnum', 'fpick', 'spick', 'dside', 'atomlp', 'bondo', 'phase', 'rtype', 'eqform'].includes(act)) SND.play('tap');
  switch (act){
    case 'title': renderTitle(); break;
    case 'continue': renderMap(); break;
    case 'camp': switchCamp(b.dataset.c); ui = {}; hasRun() ? renderMap() : renderBoot(); break;
    case 'new': {
      const c = b.dataset.c || CAMP.id;
      if (campSummary(c).run && ui.confirm !== 'new:' + c){ ui.confirm = 'new:' + c; b.textContent = 'Tap again to erase'; break; }
      switchCamp(c); Object.assign(st, campFresh()); save(); ui = {}; renderBoot(); break;
    }
    case 'remix': {
      const c = b.dataset.c || CAMP.id;
      if (ui.confirm !== 'remix:' + c){ ui.confirm = 'remix:' + c; b.textContent = 'Tap again to remix'; break; }
      switchCamp(c); Object.assign(st, campFresh(), {remix:true}); save(); ui = {}; renderBoot(); break;
    }
    case 'map': renderMap(); break;
    case 'repair': startRepair(); break;
    case 'mod': {
      const i = +b.dataset.i;
      if (!unlocked(i)){ SND.play('jam'); b.classList.add('shk'); setTimeout(() => b.classList.remove('shk'), 300); say(`That room is sealed. Fix the ${MODS[i - 1].name} first.`, 'smug'); break; }
      if (st.cur && st.cur.m !== i) st.cur = null;
      enterRoom(i, b); break;
    }
    case 'dlg-next': SND.play('key'); if (ui.dlg){ ui.dlg.i++; dlgStep(); } break;
    case 'begin': renderTask(); break;
    case 'timer': st.timer = !st.timer; save(); b.textContent = st.timer ? 'Timer on · tap to turn off' : 'Timer off · tap to turn on'; b.classList.toggle('go', st.timer); b.parentElement.querySelector('.devh span:last-child').textContent = st.timer ? 'ON' : 'OFF'; break;
    case 'report': renderReport(); break;
    case 'badges': renderBadges(); break;
    case 'sheet': document.getElementById('sheet').hidden = false; break;
    case 'sheet-close': document.getElementById('sheet').hidden = true; break;
    case 'mute': st.sound = !st.sound; save(); hud(); if (st.sound) SND.play('ok'); break;
    case 'hint': {
      const h = b.dataset.h, cost = h === 'rule' ? 5 : 10; if (st.energy < cost) break;
      st.energy -= cost; ui.hints[h] = true; if (st.cur) st.cur.hints = (st.cur.hints || 0) + 1; save(); hud(); drawHints(); SND.play('zip'); break;
    }
    case 'key': keyIn(b.dataset.k); break;
    case 'unit':
      ui.kp.unit = b.dataset.u; SND.play('key');
      view.querySelectorAll('[data-act="unit"]').forEach(x => x.setAttribute('aria-pressed', x.dataset.u === ui.kp.unit));
      { const u = view.querySelector('.lcd .u'); if (u) u.textContent = ui.kp.unit; } break;
    case 'nv': { const i = +b.dataset.i; ui.nv[i] = Math.max(0, Math.min(20, ui.nv[i] + +b.dataset.d)); SND.play('key'); drawBody(); break; }
    case 'submit': submit(); break;
    case 'pickc': {
      if (ui.done || ui.busy) break;
      SND.play('tap');
      if (ui.t.type === 'classify' && !reduced()){
        const blip = document.getElementById('blip'); if (blip){
          ui.busy = true; const a = blip.getBoundingClientRect(), bb = b.getBoundingClientRect();
          const an = blip.animate([{transform:'none', opacity:1}, {transform:`translate(${bb.left + bb.width / 2 - a.left - a.width / 2}px,${bb.top - a.top}px) scale(.3)`, opacity:.2}], {duration:320, easing:'steps(6)', fill:'forwards'});
          SND.play('zip'); an.onfinish = () => { ui.busy = false; pickChoice(b.dataset.v); }; break;
        }
      }
      pickChoice(b.dataset.v); break;
    }
    case 'next': nextTask(); break;
    case 'coef': {
      const i = +b.dataset.i; ui.coefs[i] = Math.min(20, Math.max(1, ui.coefs[i] + +b.dataset.d)); SND.play('key');
      const t = ui.t, L = (t.type === 'balance' || t.type === 'eq') ? t : LIM[t.p.r];
      const before = balState(L.L, L.R, ui.coefs).bal;
      document.getElementById('balbox').innerHTML = reactorHTML(L.L, L.R, ui.coefs, false);
      if (before) SND.play('pop');
      break;
    }
    case 'checkbal': {
      const L = LIM[ui.t.p.r], s = balState(L.L, L.R, ui.coefs), e1 = document.getElementById('err1');
      if (s.bal && s.lowest){ ui.phase = 'answer'; SND.play('ok'); const o = mainScene(); if (o) o.live = false; drawBody(); break; }
      if (!ui.flags.bal){ ui.flags.bal = true; st.hull -= 6; if (st.hull <= 0){ st.patches++; st.hull = 35; } save(); hud(); shake(); flash('red'); }
      SND.play('jam');
      e1.textContent = !s.bal ? `Not balanced yet: fix the ≠ rows. (−6 ${W().hull})` : `Balanced, but not in lowest whole numbers. (−6 ${W().hull})`;
      break;
    }
    case 'cart': { const v = b.dataset.v; ui.sel = ui.sel.includes(v) ? ui.sel.filter(x => x !== v) : ui.sel.concat(v); SND.play('key'); drawBody(); break; }
    case 'lockcarts': {
      if (!ui.sel.length){ document.getElementById('err1').textContent = 'Load at least one cartridge.'; SND.play('jam'); break; }
      const need = ui.b.need, good = need.length === ui.sel.length && need.every(v => ui.sel.includes(v));
      if (!good){ ui.flags.sel = true; st.hull -= 6; if (st.hull <= 0){ st.patches++; st.hull = 35; } save(); hud(); SND.play('jam'); shake(); flash('red'); say('Jammed. Green cartridges are the ones that belong. Use those for step 2.', 'worried'); }
      else { SND.play('ok'); say('Cartridges accepted. Now do the math on paper.', 'happy'); }
      ui.phase = 'answer'; drawBody();
      document.getElementById('err1').textContent = good ? 'Correct cartridges.' : `Wrong set (−6 ${W().hull}). Green = needed.`;
      break;
    }
    case 'nsplit': {
      const x = ui.net[b.dataset.side][+b.dataset.i];
      if (x.st === 's'){ ui.net.solidTap = true; SND.play('jam'); b.classList.remove('shk'); void b.offsetWidth; b.classList.add('shk'); document.getElementById('err').textContent = 'Solids stay together. Never split a (s).'; break; }
      x.split = true; SND.play('pop');
      const r = b.getBoundingClientRect(); fx.burst(r.left + r.width / 2, r.top + r.height / 2, 12, [C.cu, C.white]);
      drawBody(); break;
    }
    case 'nstrike': { const k = b.dataset.k; ui.net.struck[k] = !ui.net.struck[k]; b.classList.toggle('vent', ui.net.struck[k]); SND.play(ui.net.struck[k] ? 'zip' : 'key'); break; }
    case 'rpick': {
      const X = ui.rx; if (X.dragged){ X.dragged = false; break; }
      if (b.dataset.side === 'R'){ X.prodTap = true; SND.play('jam'); b.classList.remove('shk'); void b.offsetWidth; b.classList.add('shk'); document.getElementById('err').textContent = 'That\'s a product. Pick from the reactants only.'; break; }
      const i = +b.dataset.i; if (X.ox === null) X.ox = i; else if (X.red === null && i !== X.ox) X.red = i;
      SND.play('key'); drawBody(); break;
    }
    case 'rreset': ui.rx.ox = null; ui.rx.red = null; drawBody(); break;
    default: if (XACT[act]) XACT[act](b);
  }
});
document.getElementById('sheet').addEventListener('click', e => { if (e.target.id === 'sheet') e.currentTarget.hidden = true; });

/* Data sheet */
const PT = [['H','1.008'],['He','4.003'],['Li','6.94'],['B','10.81'],['C','12.01'],['N','14.01'],['O','16.00'],['F','19.00'],['Na','22.99'],['Mg','24.31'],['Al','26.98'],['P','30.97'],['S','32.07'],['Cl','35.45'],['K','39.10'],['Ca','40.08'],['Fe','55.85'],['Co','58.93'],['Ni','58.69'],['Cu','63.55'],['Zn','65.38'],['Br','79.90'],['Ag','107.87'],['Sn','118.71'],['I','126.90'],['Ba','137.33'],['Pb','207.2']];
document.getElementById('ptable').innerHTML = PT.map(([s, m]) => `<div class="pc"><b>${s}</b><span>${m}</span></div>`).join('');

window.__avogadro = { CALC, toSci, sfOf, parseF, balState, get ORIG(){ return ORIG; }, EXTRA, variantOf };
