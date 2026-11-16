/* =========================================================
   CapsBR · Cenas 3D (Three.js)
   Cápsula, pote e conta-gotas modelados (lathe) com rótulo que
   envolve o frasco inteiro: marca na frente, tabela nutricional atrás.
   Os scripts da página animam objetos simples em window.Caps.S3 com
   GSAP; aqui só renderizamos.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const Caps = window.Caps || {};
const S3 = Caps.S3 || {};
// qualidade adaptativa: aparelho fraco ou tela pequena renderiza com menos pixels
const MOBILE = matchMedia('(max-width: 980px)').matches;
const WEAK = (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
const LOW = MOBILE || WEAK;
// telas retina: renderiza nítido (até 2x); só aparelhos realmente fracos ficam em 1.5x
// celular: 1.5x já fica nítido e gasta ~45% menos GPU que 2x
const DPR = Math.min(window.devicePixelRatio || 1, WEAK ? 1.25 : MOBILE ? 1.5 : 2);
const TEX = 2048;
const stages = [];
let quality = 1;
// se o FPS cair de verdade (<25 fps), reduz um pouco a resolução (mínimo 80%)
(() => {
  let acc = 0, n = 0, last = 0;
  const tick = t => {
    if (last && !document.hidden) { acc += t - last; n++; }
    last = t;
    if (n >= 60) {
      const avg = acc / n; acc = 0; n = 0;
      // <30 fps: baixa a resolução (celular pode ir até 55%); sobrando fôlego, volta aos poucos
      const want = avg > 34 ? Math.max(LOW ? .55 : .75, quality - .15) : avg < 19 && quality < 1 ? Math.min(1, quality + .1) : quality;
      if (want !== quality) { quality = want; stages.forEach(S => S.setQuality(quality)); }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
const D = THREE.MathUtils.degToRad;
const clamp01 = v => Math.max(0, Math.min(1, v));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eBack = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const COL = { teal: '#1d5c50', cream: '#f2eadb', inTeal: '#0d302a', inCream: '#d8ccb4' };
const THEMES = Caps.THEMES || { teal: { label: '#14483f', ink: '#ffffff' } };

/* =========================================================
   CÁPSULA
   ========================================================= */
const R = 0.5, RC = 0.522, L = 1.15;
function bodyProfile(n = 18) {
  const pts = [], cy = -L + R;
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(1e-4, R * Math.cos(a)), cy + R * Math.sin(a))); }
  pts.push(new THREE.Vector2(R, 0.26), new THREE.Vector2(R * 0.985, 0.275));
  return pts;
}
function capProfile(n = 18) {
  const pts = [new THREE.Vector2(RC * 0.975, -0.2), new THREE.Vector2(RC, -0.185)], cy = L - RC;
  pts.push(new THREE.Vector2(RC, cy));
  for (let i = 1; i <= n; i++) { const a = (i / n) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(1e-4, RC * Math.cos(a)), cy + RC * Math.sin(a))); }
  return pts;
}
const CGEO = { body: new THREE.LatheGeometry(bodyProfile(), 72), cap: new THREE.LatheGeometry(capProfile(), 72) };
// cápsulas pequenas (dentro dos potes / caindo): versão leve, invisível a diferença nesse tamanho
const CGEO_S = LOW ? { body: new THREE.LatheGeometry(bodyProfile(5), 16), cap: new THREE.LatheGeometry(capProfile(5), 16) } : CGEO;
CGEO.ring = new THREE.TorusGeometry(RC * 0.99, 0.012, 10, 72); CGEO.ring.rotateX(Math.PI / 2); CGEO.ring.translate(0, -0.19, 0);

function capsule(c1 = COL.teal, c2 = COL.cream) {
  const top = new THREE.MeshPhysicalMaterial({ color: c1, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.18, sheen: 0.25, sheenColor: new THREE.Color('#9cc7b9'), transparent: true });
  const bot = new THREE.MeshPhysicalMaterial({ color: c2, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: new THREE.Color('#ffffff'), transparent: true });
  const inTop = new THREE.MeshStandardMaterial({ color: COL.inTeal, roughness: 0.7, side: THREE.BackSide, transparent: true });
  const inBot = new THREE.MeshStandardMaterial({ color: COL.inCream, roughness: 0.8, side: THREE.BackSide, transparent: true });
  const all = [top, bot, inTop, inBot];
  const root = new THREE.Group(), inner = new THREE.Group(), gTop = new THREE.Group(), gBot = new THREE.Group();
  gTop.add(new THREE.Mesh(CGEO.cap, top), new THREE.Mesh(CGEO.cap, inTop), new THREE.Mesh(CGEO.ring, top));
  gBot.add(new THREE.Mesh(CGEO.body, bot), new THREE.Mesh(CGEO.body, inBot));
  inner.add(gTop, gBot); root.add(inner);
  return { root, inner, top: gTop, bot: gBot, setAlpha(a) { all.forEach(x => { x.opacity = a; x.depthWrite = a > 0.98; }); root.visible = a > 0.01; } };
}

/* =========================================================
   RÓTULO (canvas → textura que envolve o frasco)
   u = 0.5 é a frente; u = 0/1 é o verso (tabela nutricional)
   ========================================================= */
const FONT_D = "'Inter Tight', Inter, Arial, sans-serif", FONT_B = "Inter, Arial, sans-serif", FONT_M = "'JetBrains Mono', ui-monospace, monospace";
const fontsLoaded = (async () => {
  try {
    await Promise.all(['700 64px "Inter Tight"', '600 64px "Inter Tight"', '600 32px Inter', '500 32px Inter', '700 32px Inter', '500 32px "JetBrains Mono"'].map(f => document.fonts.load(f)));
  } catch (e) { /* segue com fallback */ }
  if (Caps.fontsReady) await Caps.fontsReady;
})();

const mix = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
function fitFont(ctx, txt, weight, family, max, width, ls = 0) {
  ctx.font = `${weight} 100px ${family}`;
  const w = ctx.measureText(txt).width + ls * 100 * Math.max(0, txt.length - 1);
  return Math.min(max, (width / w) * 100 * 0.98);
}
function text(ctx, txt, x, y, size, weight, family, color, ls = 0, align = 'left', alpha = 1) {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = (ls * size) + 'px';
  ctx.fillText(txt, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.globalAlpha = 1;
}
function wrapLines(ctx, txt, size, weight, family, width) {
  ctx.font = `${weight} ${size}px ${family}`;
  const out = []; let cur = '';
  txt.split(/\s+/).forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > width && cur) { out.push(cur); cur = w; } else cur = t; });
  if (cur) out.push(cur);
  return out;
}
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

const BRAND_W = 600, BRAND_F = FONT_B, BRAND_LS = .01;
function brandLines(ctx, b, width, maxFs) {
  const one = fitFont(ctx, b, BRAND_W, BRAND_F, maxFs, width, BRAND_LS);
  const words = b.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    let best = null;
    for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' '), c = words.slice(i).join(' '); const m = Math.max(a.length, c.length); if (!best || m < best.m) best = { a, c, m }; }
    const two = Math.min(fitFont(ctx, best.a, BRAND_W, BRAND_F, maxFs * .86, width, BRAND_LS), fitFont(ctx, best.c, BRAND_W, BRAND_F, maxFs * .86, width, BRAND_LS));
    if (two > one * 1.18) return { lines: [best.a, best.c], fs: two };
  }
  return { lines: [b], fs: one };
}

function drawTable(ctx, cx, W, H, o) {
  const tw = W * .19, x0 = cx - tw / 2, y0 = H * .09, th = H * .82;
  ctx.fillStyle = '#ffffff'; rrect(ctx, x0, y0, tw, th, H * .03); ctx.fill();
  const ink = '#111', pad = tw * .06, ix = x0 + pad, iw = tw - pad * 2;
  const rows = o.rows || [];
  const fsT = Math.min(H * .052, fitFont(ctx, 'INFORMAÇÃO NUTRICIONAL', 800, FONT_B, H * .06, iw));
  let y = y0 + pad * .7 + fsT;
  text(ctx, 'INFORMAÇÃO NUTRICIONAL', ix, y, fsT, 800, FONT_B, ink);
  y += fsT * .5; ctx.fillStyle = ink; ctx.fillRect(ix, y, iw, H * .006);
  const fsS = fsT * .62;
  y += fsS * 1.5; text(ctx, (o.porcoes || '').replace('Porções por embalagem:', 'Porções por embalagem:'), ix, y, fsS, 500, FONT_B, ink);
  y += fsS * 1.35; text(ctx, o.porcao || '', ix, y, fsS, 500, FONT_B, ink);
  y += fsS * .7; ctx.fillRect(ix, y, iw, H * .012);
  // cabeçalho
  y += fsS * 1.5;
  text(ctx, '', ix, y, fsS, 700, FONT_B, ink);
  text(ctx, 'Porção', ix + iw * .74, y, fsS, 700, FONT_B, ink, 0, 'right');
  text(ctx, '%VD*', ix + iw, y, fsS, 700, FONT_B, ink, 0, 'right');
  y += fsS * .55; ctx.fillRect(ix, y, iw, H * .004);
  const foot = fsS * 2.6;
  const avail = y0 + th - pad * .5 - foot - y;
  const rh = Math.min(fsS * 1.9, avail / Math.max(1, rows.length));
  const fr = Math.min(fsS, rh * .62);
  rows.forEach((r, i) => {
    const yy = y + rh * (i + 1) - (rh - fr) / 2 - fr * .1;
    ctx.save(); ctx.beginPath(); ctx.rect(ix, yy - fr * 1.2, iw * .52, fr * 1.6); ctx.clip();
    text(ctx, r.name, ix, yy, fr, 500, FONT_B, ink); ctx.restore();
    text(ctx, `${r.v}${r.unit ? ' ' + r.unit.replace('mg de NE', 'mg').replace('µg de DFE', 'µg').replace('µg de RAE', 'µg') : ''}`, ix + iw * .74, yy, fr, 500, FONT_B, ink, 0, 'right');
    const vd = parseFloat(String(r.vd).replace(',', '.'));
    text(ctx, isNaN(vd) ? '**' : r.vd, ix + iw, yy, fr, 600, FONT_B, ink, 0, 'right');
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(ix, y + rh * (i + 1), iw, Math.max(1, H * .002));
  });
  ctx.fillStyle = ink; ctx.fillRect(ix, y0 + th - pad * .5 - foot + fsS * .3, iw, H * .006);
  const fy = y0 + th - pad * .5 - foot + fsS * 1.5;
  text(ctx, '*Percentual de valores diários fornecidos pela porção.', ix, fy, fsS * .78, 400, FONT_B, ink);
  text(ctx, '**VD não estabelecido.', ix, fy + fsS * 1.05, fsS * .78, 400, FONT_B, ink);
}

function barcode(ctx, x, y, w, h, color) {
  let s = 13; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  ctx.fillStyle = '#fff'; rrect(ctx, x - w * .06, y - h * .1, w * 1.12, h * 1.45, h * .08); ctx.fill();
  ctx.fillStyle = '#111'; let cx = x;
  while (cx < x + w) { const bw = (rnd() < .5 ? 1 : rnd() < .6 ? 2 : 3) * w / 95; if (rnd() > .42) ctx.fillRect(cx, y, bw, h); cx += bw + w / 95; }
  text(ctx, '7 891234 567895', x + w / 2, y + h * 1.25, h * .2, 500, FONT_M, '#111', .04, 'center');
}

function drawLabel(cv, o) {
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
  const t = o.theme, bg = t.label, ink = t.ink;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // textura sutil de papel
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,255,255,.06)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.08)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // filetes superior/inferior
  ctx.fillStyle = ink; ctx.globalAlpha = .25; ctx.fillRect(0, H * .035, W, H * .004); ctx.fillRect(0, H * .961, W, H * .004); ctx.globalAlpha = 1;

  /* ---- FRENTE (igual ao rótulo real: marca, filete, descrição, conteúdo) ---- */
  const isDrop = o.kind === 'drop';
  const ACCENT = '#9cc7b9';
  const fx = W * .392, fw = W * .21;
  // cabeçalho: quantidade no topo, alinhada à direita da coluna da marca (como
  // no rótulo impresso real) — dentro do arco que a câmera enxerga de frente
  if (!isDrop) {
    const qty = String(o.line2 || '60 cápsulas').toUpperCase();
    const qf = Math.min(H * .036, fitFont(ctx, qty, 600, FONT_M, H * .036, fw, .08));
    text(ctx, qty, fx + fw, H * .075, qf, 600, FONT_M, ink, .08, 'right', .9);
  }
  const b = (String(o.brand || '').trim() || 'Sua Marca').slice(0, 20);
  const br = brandLines(ctx, b, fw, H * (isDrop ? .2 : .13));
  const lh = br.fs * 1.08;
  const y0 = H * (isDrop ? .14 : .17) + br.fs * .78;
  br.lines.forEach((ln, i) => text(ctx, ln, fx, y0 + i * lh, br.fs, BRAND_W, BRAND_F, ink, BRAND_LS));
  const lastB = y0 + (br.lines.length - 1) * lh;
  const barY = Math.max(H * (isDrop ? .5 : .4), lastB + H * (isDrop ? .14 : .1));
  ctx.fillStyle = ink; ctx.fillRect(fx, barY, fw * (isDrop ? .36 : .3), Math.max(2, H * (isDrop ? .006 : .004)));
  const generic = !o.line1 || /^suplemento alimentar$/i.test(o.line1);
  const GENERIC_SUB = { caps: 'EM CÁPSULAS', goma: 'EM GOMAS', sol: 'PÓ SOLÚVEL' };
  const subs = isDrop ? ['SUPLEMENTO ALIMENTAR'] : ['SUPLEMENTO ALIMENTAR', generic ? (GENERIC_SUB[o.kind] || 'EM CÁPSULAS') : String(o.line1).toUpperCase()];
  const fsS = Math.min(H * (isDrop ? .05 : .056), fitFont(ctx, 'SUPLEMENTO ALIMENTAR', 400, FONT_B, H * .06, fw * .96, .02));
  let yy = barY + H * (isDrop ? .14 : .12);
  subs.forEach((ln, i) => { const f = Math.min(fsS, fitFont(ctx, ln, 400, FONT_B, fsS, fw * .98, .02)); text(ctx, ln, fx, yy + i * fsS * 1.38, f, 400, FONT_B, i === 1 && !isDrop ? ACCENT : ink, .02, 'left', .95); });
  if (isDrop) {
    const l1 = generic ? 'SABOR MORANGO' : String(o.line1).toUpperCase(), l2 = String(o.line2 || '30ml').replace(/\s*mL$/i, 'ml');
    yy += fsS * 1.9;
    text(ctx, l1, fx, yy, Math.min(fsS, fitFont(ctx, l1, 400, FONT_B, fsS, fw * .98, .02)), 400, FONT_B, ink, .02, 'left', .95);
    text(ctx, l2, fx, yy + fsS * 1.3, fsS, 400, FONT_B, ink, .02, 'left', .95);
  } else {
    // rodapé: selos padrão (iguais em todo produto, como no rótulo impresso real)
    const badges = ['FÓRMULA EXCLUSIVA', 'TESTE DE ESTABILIDADE', 'FEITO NO BRASIL'];
    const by = H * .91, bw = W * .48, bx0 = W * .2, seg = bw / 3;
    const bf = Math.min(H * .026, ...badges.map(bd => fitFont(ctx, bd, 600, FONT_M, H * .026, seg * .82, .03)));
    badges.forEach((bd, i) => {
      text(ctx, bd, bx0 + seg * (i + .5), by, bf, 600, FONT_M, ink, .03, 'center', .85);
      if (i < 2) { ctx.fillStyle = ink; ctx.globalAlpha = .4; ctx.fillRect(bx0 + seg * (i + 1), by - bf * .95, Math.max(1, H * .0025), bf * 1.15); ctx.globalAlpha = 1; }
    });
  }

  /* ---- LATERAL ESQUERDA: modo de uso ---- */
  const sx = W * .135, sw = W * .17;
  text(ctx, 'MODO DE USO', sx, H * .2, H * .045, 600, FONT_M, ink, .14, 'left', .8);
  const USE_TXT = {
    drop: 'Agite antes de usar. Consumir a porção indicada, diluída em água ou diretamente, conforme orientação.',
    goma: 'Mastigar a porção indicada ao dia, de preferência junto a uma refeição.',
    sol: 'Diluir a porção indicada em água ou na bebida de preferência, uma vez ao dia.',
  };
  const use = USE_TXT[o.kind] || 'Consumir a porção indicada ao dia, com água, de preferência junto a uma refeição.';
  wrapLines(ctx, use, H * .045, 500, FONT_B, sw).slice(0, 4).forEach((ln, i) => text(ctx, ln, sx, H * .3 + i * H * .068, H * .045, 500, FONT_B, ink, 0, 'left', .72));
  text(ctx, 'CONSERVAÇÃO', sx, H * .66, H * .045, 600, FONT_M, ink, .14, 'left', .8);
  wrapLines(ctx, 'Manter em local seco e arejado, longe da luz e do calor.', H * .045, 500, FONT_B, sw).slice(0, 2).forEach((ln, i) => text(ctx, ln, sx, H * .76 + i * H * .068, H * .045, 500, FONT_B, ink, 0, 'left', .72));

  /* ---- LATERAL DIREITA: fabricante + código de barras ---- */
  const rx = W * .695;
  text(ctx, 'FABRICADO POR', rx, H * .2, H * .042, 600, FONT_M, ink, .14, 'left', .8);
  text(ctx, 'CapsBR Nutracêuticos Ltda.', rx, H * .29, H * .046, 600, FONT_B, ink, 0, 'left', .85);
  text(ctx, 'CNPJ 68.259.906/0001-69', rx, H * .36, H * .042, 500, FONT_B, ink, 0, 'left', .7);
  text(ctx, 'Indústria Brasileira', rx, H * .43, H * .042, 500, FONT_B, ink, 0, 'left', .7);
  barcode(ctx, rx, H * .55, W * .075, H * .2);
  text(ctx, 'LOTE 0001 · VAL. 24 MESES', rx, H * .88, H * .036, 500, FONT_M, ink, .08, 'left', .6);

  /* ---- VERSO: tabela nutricional (cruza a emenda) ---- */
  drawTable(ctx, 0, W, H, o);
  drawTable(ctx, W, W, H, o);
}

/* =========================================================
   FRASCOS
   ========================================================= */
function lathePts(arr) { return arr.map(([r, y]) => new THREE.Vector2(Math.max(1e-4, r), y)); }
function arc(cx, cy, r, a0, a1, n = 8) { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
function ridge(geo, y0, y1, n, amp) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (y < y0 || y > y1) continue;
    const r = Math.hypot(x, z); if (r < 1e-3) continue;
    const th = Math.atan2(x, z), s = Math.cos(th * n);
    const k = 1 + amp * Math.sign(s) * Math.pow(Math.abs(s), .35) / r;
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  return geo;
}
const SPEC = {
  caps: {
    body: lathePts([[0, .05], [.8, .05], [.84, 0], [.88, 0], ...arc(.88, .12, .12, -Math.PI / 2, 0, 6), [1, 2.94], ...arc(.8, 2.94, .2, 0, Math.PI / 2, 8), [.79, 3.16], [.79, 3.4], [.76, 3.43], [.7, 3.43]]),
    cap: lathePts([[.815, 3.22], [.835, 3.24], [.835, 3.98], ...arc(.775, 3.98, .06, 0, Math.PI / 2, 5), [0, 4.04]]),
    capRidge: [3.27, 3.95, 110, .012],
    label: { r: 1.006, h: 2.16, y: 1.72 },
    fillTop: 3.02,
    height: 4.04,
  },
  drop: {
    body: lathePts([[0, 0], [.55, 0], ...arc(.55, .08, .08, -Math.PI / 2, 0, 5), [.63, 1.44], ...arc(.33, 1.44, .3, 0, Math.PI / 2, 8), [.26, 1.76], [.26, 1.86]]),
    cap: lathePts([[.33, 1.78], [.345, 1.8], [.345, 2.16], ...arc(.3, 2.16, .045, 0, Math.PI / 2, 4), [.2, 2.205], [.2, 2.22]]),
    capRidge: [1.82, 2.14, 48, .008],
    bulb: lathePts([[.185, 2.2], [.2, 2.26], [.215, 2.4], [.212, 2.55], ...arc(0, 2.6, .212, 0, Math.PI / 2, 10)]),
    label: { r: .636, h: .92, y: .76 },
    height: 2.81,
  },
  // pote largo e baixo (estilo pote de creatina): boca quase do tamanho do
  // corpo, sem gargalo estreito, com tampa achatada e larga
  sol: {
    body: lathePts([[0, .05], [1, .05], [1.08, 0], [1.14, 0], ...arc(1.14, .16, .16, -Math.PI / 2, 0, 6), [1.3, 1.95], ...arc(1.1, 1.95, .2, 0, Math.PI / 2, 8), [1.05, 2.15], [1.05, 2.3], [1, 2.33], [.95, 2.33]]),
    cap: lathePts([[1.08, 2.2], [1.12, 2.22], [1.12, 2.66], ...arc(1.02, 2.66, .08, 0, Math.PI / 2, 6), [0, 2.74]]),
    capRidge: [2.26, 2.62, 130, .013],
    label: { r: 1.31, h: 1.35, y: 1 },
    height: 2.74,
  },
};
const GEO = {};
// goma usa o mesmo pote (frasco) da cápsula — é o mesmo tipo de embalagem na
// vida real, só muda o que tem dentro e a cor do material (vidro x opaco).
// Solúvel (pote de creatina) tem forma própria, mais larga e baixa.
const SHAPE_ALIAS = { goma: 'caps' };
function geos(kind) {
  const sk = SHAPE_ALIAS[kind] || kind;
  if (GEO[sk]) return GEO[sk];
  const s = SPEC[sk];
  const g = { body: new THREE.LatheGeometry(s.body, 96), cap: ridge(new THREE.LatheGeometry(s.cap, 360), ...s.capRidge) };
  if (s.bulb) g.bulb = new THREE.LatheGeometry(s.bulb, 64);
  return (GEO[sk] = g);
}
let shadowTex = null;
function blobShadow() {
  if (!shadowTex) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(8,30,26,.42)'); gr.addColorStop(.55, 'rgba(8,30,26,.14)'); gr.addColorStop(1, 'rgba(8,30,26,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    shadowTex = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .002; return m;
}

/* cápsulas creme empilhadas dentro do pote (InstancedMesh, de baixo pra cima) */
const CREAM = { body: '#efe6d3', cap: '#e9dec6' };
let PILE_PTS = null;
function pilePoints(top) {
  if (PILE_PTS) return PILE_PTS;
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const out = [];
  for (let y = .2; y < top; y += .19) {
    const pts = [];
    for (let tries = 0; tries < 400 && pts.length < 26; tries++) {
      const r = Math.sqrt(rnd()) * .74, a = rnd() * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (pts.every(p => (p[0] - x) ** 2 + (p[1] - z) ** 2 > .07)) pts.push([x, z, a, r]);
    }
    pts.forEach(([x, z, a, r]) => {
      // perto do vidro a cápsula deita tangente à parede; no meio, aleatória
      const ry = r > .45 ? -(a + Math.PI / 2) + (rnd() - .5) * .5 : rnd() * Math.PI * 2;
      out.push({ x, y: y + (rnd() - .5) * .07, z, rx: (rnd() - .5) * .7, ry, rz: Math.PI / 2 + (rnd() - .5) * .8 });
    });
  }
  return (PILE_PTS = out);
}
function makePile(top, scale = .21) {
  const pts = pilePoints(top), n = pts.length;
  const mb = LOW ? new THREE.MeshStandardMaterial({ color: CREAM.body, roughness: .32 }) : new THREE.MeshPhysicalMaterial({ color: CREAM.body, roughness: .3, clearcoat: .7, clearcoatRoughness: .2, sheen: .4, sheenColor: new THREE.Color('#ffffff') });
  const mc = LOW ? new THREE.MeshStandardMaterial({ color: CREAM.cap, roughness: .32 }) : new THREE.MeshPhysicalMaterial({ color: CREAM.cap, roughness: .3, clearcoat: .7, clearcoatRoughness: .2 });
  mb.userData.solid = mc.userData.solid = true;
  const ib = new THREE.InstancedMesh(CGEO_S.body, mb, n), ic = new THREE.InstancedMesh(CGEO_S.cap, mc, n);
  const o = new THREE.Object3D();
  pts.forEach((p, i) => { o.position.set(p.x, p.y, p.z); o.rotation.set(p.rx, p.ry, p.rz, 'YXZ'); o.scale.setScalar(scale); o.updateMatrix(); ib.setMatrixAt(i, o.matrix); ic.setMatrixAt(i, o.matrix); });
  const group = new THREE.Group(); group.add(ib, ic);
  ib.frustumCulled = ic.frustumCulled = false;
  const api = { group, mats: [mb, mc], n, k: 1, set(k) { k = clamp01(k); api.k = k; const c = Math.round(n * k); ib.count = ic.count = c; group.visible = c > 0; }, topAt: k => .2 + (top - .2) * clamp01(k) };
  return api;
}

/* gomas empilhadas dentro do pote (mesmas posições da pilha de cápsulas, pedaços
   irregulares coloridos em vez de cápsula lisa) */
let GUMMY_GEO = null;
function gummyGeo() { return GUMMY_GEO || (GUMMY_GEO = new THREE.IcosahedronGeometry(1, 1)); }
const GUMMY_HUES = [.08, .09, .07, .1, .085];
function makeGummyPile(top, scale = .2) {
  const pts = pilePoints(top), n = pts.length;
  const mat = LOW
    ? new THREE.MeshStandardMaterial({ color: '#e8832a', roughness: .3 })
    : new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .18, clearcoat: .8, clearcoatRoughness: .15, transmission: .3, thickness: .4, ior: 1.3, sheen: .35, sheenColor: new THREE.Color('#fff3df') });
  mat.userData.solid = true;
  const im = new THREE.InstancedMesh(gummyGeo(), mat, n);
  const o = new THREE.Object3D(), col = new THREE.Color();
  let sd = 9; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  pts.forEach((p, i) => {
    o.position.set(p.x, p.y, p.z); o.rotation.set(p.rx, p.ry, p.rz, 'YXZ');
    o.scale.set(scale * (.82 + rnd() * .36), scale * (.82 + rnd() * .36), scale * (.82 + rnd() * .36));
    o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    col.setHSL(GUMMY_HUES[i % GUMMY_HUES.length] + (rnd() - .5) * .015, .82, .5 + (rnd() - .5) * .12);
    im.setColorAt(i, col);
  });
  const group = new THREE.Group(); group.add(im);
  im.frustumCulled = false;
  const api = { group, mats: [mat], n, k: 1, set(k) { k = clamp01(k); api.k = k; const c = Math.round(n * k); im.count = c; group.visible = c > 0; }, topAt: k => .2 + (top - .2) * clamp01(k) };
  return api;
}

/* opts: { kind, brand, line1, line2, code, theme, rows, porcao, porcoes, texW, maxAniso, fill } */
function makeBottle(opts, renderer) {
  const kind = ['drop', 'goma', 'sol'].includes(opts.kind) ? opts.kind : 'caps';
  const sk = SHAPE_ALIAS[kind] || kind;
  const s = SPEC[sk], g = geos(kind);
  // pote de cápsulas e de gomas são de vidro (dá pra ver o conteúdo); pote de pó
  // solúvel e o frasco de gotas são plástico opaco
  const glass = kind === 'caps' || kind === 'goma';
  const jar = kind === 'caps' || kind === 'goma' || kind === 'sol';
  // teste de realismo: vidro com refração de verdade (transmission), só na
  // cápsula por enquanto — se aprovar, aplicamos em goma também
  const realGlass = kind === 'caps';
  const root = new THREE.Group(), spin = new THREE.Group(); root.add(spin);
  const white = realGlass
    ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .04, metalness: 0, clearcoat: 1, clearcoatRoughness: .03, transmission: 1, thickness: .55, ior: 1.5, specularIntensity: 1, envMapIntensity: 1.3, side: THREE.FrontSide, transparent: true })
    : glass
      ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .03, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, specularIntensity: 1, envMapIntensity: 2.2, side: THREE.DoubleSide, transparent: true, opacity: .2, depthWrite: false })
      : new THREE.MeshPhysicalMaterial({ color: '#f7f7f5', roughness: .26, clearcoat: 1, clearcoatRoughness: .12, side: THREE.DoubleSide, transparent: true });
  if (glass) { white.userData.base = realGlass ? 1 : .2; white.userData.glass = true; }
  const capM = new THREE.MeshPhysicalMaterial({ color: '#fbfbfa', roughness: .4, clearcoat: .5, clearcoatRoughness: .3, transparent: true });
  const body = new THREE.Mesh(g.body, white); spin.add(body);
  if (glass) body.renderOrder = 2;
  const capG = new THREE.Group(); capG.add(new THREE.Mesh(g.cap, capM)); spin.add(capG);
  const mats = [white, capM];
  // conteúdo visível dentro do pote de vidro (cápsulas cremes ou gomas coloridas)
  let pile = null;
  if (opts.fill !== false) {
    if (kind === 'caps') pile = makePile(s.fillTop);
    else if (kind === 'goma') pile = makeGummyPile(s.fillTop);
    if (pile) { spin.add(pile.group); mats.push(...pile.mats); }
  }
  if (g.bulb) { const bm = new THREE.MeshPhysicalMaterial({ color: '#f1f1ee', roughness: .55, sheen: .4, sheenColor: new THREE.Color('#ffffff'), transparent: true }); capG.add(new THREE.Mesh(g.bulb, bm)); mats.push(bm); }
  // rótulo
  const L = s.label, circ = 2 * Math.PI * L.r;
  const cv = document.createElement('canvas');
  cv.width = Math.min(opts.texW || 3072, WEAK ? 2048 : MOBILE ? 3072 : 4096); cv.height = Math.round(cv.width * L.h / circ);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
  tex.wrapS = THREE.RepeatWrapping;
  const labM = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .42, clearcoat: .35, clearcoatRoughness: .3, transparent: true });
  mats.push(labM);
  const mkLabelGeo = (len = Math.PI * 2, start = -Math.PI) => new THREE.CylinderGeometry(L.r, L.r, L.h, 160, 1, true, start, len);
  const label = new THREE.Mesh(mkLabelGeo(), labM); label.position.y = L.y; spin.add(label);
  const shadow = blobShadow(); shadow.scale.setScalar(jar ? 3.1 : 2.1); root.add(shadow);
  const state = { ...opts, theme: opts.theme || 'teal' };
  const themeObj = k => typeof k === 'string' ? (THEMES[k] || THEMES.teal) : k;
  const paint = (th = themeObj(state.theme)) => { drawLabel(cv, { ...state, kind, theme: th }); tex.needsUpdate = true; };
  let colorTw = null;
  const api = {
    root, spin, body, cap: capG, label, shadow, kind, height: s.height, mats,
    set(o) { Object.assign(state, o); paint(); },
    // troca de cor suave (interpola fundo e tinta)
    setTheme(k, dur = .7) {
      const from = themeObj(state.theme), to = themeObj(k); state.theme = k;
      if (colorTw) colorTw.kill();
      const o = { t: 0 };
      colorTw = gsap.to(o, { t: 1, duration: dur, ease: 'power2.inOut', onUpdate: () => paint({ label: mix(from.label, to.label, o.t), ink: mix(from.ink, to.ink, o.t) }) });
    },
    // rótulo sendo aplicado (0..1)
    wrap(k) {
      if (k === api._wk) return; api._wk = k;
      const len = Math.max(.0001, Math.PI * 2 * k);
      label.geometry.dispose(); label.geometry = mkLabelGeo(len, -Math.PI);
      tex.repeat.x = len / (Math.PI * 2); tex.offset.x = 0;
      label.visible = k > .002;
    },
    setAlpha(a) {
      mats.forEach(m => {
        const base = m.userData.base ?? 1; m.opacity = a * base;
        if (!m.userData.glass) m.depthWrite = a > .98;
        if (m.userData.solid) { const t = a < .99; if (m.transparent !== t) { m.transparent = t; m.needsUpdate = true; } }
      });
      shadow.material.opacity = a; root.visible = a > .01;
    },
    // 0..1: quantas cápsulas já estão dentro do pote
    fill(k) { if (pile) pile.set(k); },
    pile,
  };
  api.paint = paint;
  return api;
}

/* =========================================================
   PALCO
   ========================================================= */
function stage(container, { fov = 30, z = 10, render = 'loop' } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: LOW ? 'default' : 'high-performance' });
  renderer.setPixelRatio(DPR * quality);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement; canvas.className = 'caps3d-canvas';
  container.appendChild(canvas);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight('#ffffff', 2.1); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight('#cfe6dc', 1.3); rim.position.set(4, 2, -4); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100); camera.position.z = z;
  let W = 1, H = 1, visible = true;
  const size = () => { W = container.clientWidth || 1; H = container.clientHeight || 1; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); };
  size(); new ResizeObserver(size).observe(container);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '120px' }).observe(container);
  const visH = () => 2 * camera.position.z * Math.tan(D(camera.fov / 2));
  const toWorld = (fx, fy) => { const h = visH(), w = h * camera.aspect; return [(fx - 0.5) * w, (0.5 - fy) * h]; };
  const S = { renderer, scene, camera, canvas, toWorld, visH, get W() { return W; }, get H() { return H; }, get visible() { return visible && !document.hidden; }, render: () => renderer.render(scene, camera),
    setQuality(q) { renderer.setPixelRatio(DPR * q); renderer.setSize(W, H, false); }, resize: size };
  stages.push(S);
  return S;
}
const loops = [];
gsap.ticker.add(time => { for (const f of loops) f(time); });

// arrastar para girar (com inércia)
function dragRotate(el, onDrag) {
  const st = { target: 0, vel: 0, dragging: false, touched: false };
  let lx = 0, lt = 0;
  el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', e => { st.dragging = true; st.touched = true; lx = e.clientX; lt = performance.now(); el.setPointerCapture(e.pointerId); el.classList.add('is-grab'); onDrag && onDrag(); });
  el.addEventListener('pointermove', e => {
    if (!st.dragging) return;
    const dx = e.clientX - lx, now = performance.now();
    st.target += dx * .011; st.vel = dx * .011 / Math.max(8, now - lt) * 16; lx = e.clientX; lt = now;
  });
  const up = () => { st.dragging = false; el.classList.remove('is-grab'); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  st.step = () => { if (!st.dragging) { st.target += st.vel; st.vel *= .93; } };
  return st;
}
function fitBottle(S, b, frac, fy = .5) {
  const h = S.visH() * frac;
  const s = h / b.height;
  b.root.scale.setScalar(s);
  const [, y] = S.toWorld(.5, fy);
  b.root.position.y = y - b.height * s / 2;
  return s;
}

/* =========================================================
   1. HERO: linha de produção (envase → tampa → rótulo → pronto)
   ========================================================= */
function hero() {
  const sec = document.querySelector('.hero');
  if (!sec || !S3.hero || !document.querySelector('.hero__visual')) return;
  // palco grande: ocupa o lado direito inteiro da hero, atrás do texto
  const box = document.createElement('div'); box.className = 'hero__3d';
  const vis = document.querySelector('.hero__visual');
  const mq = matchMedia('(max-width: 980px)');
  const place = () => { if (mq.matches) vis.prepend(box); else sec.insertBefore(box, sec.children[1] || null); };
  place();
  const S = stage(box, { fov: 28, z: 30 });
  mq.addEventListener('change', () => { place(); S.resize(); });
  const BG = '#ffffff';
  S.scene.fog = new THREE.Fog(BG, 31, 58);
  const world = new THREE.Group(); S.scene.add(world);

  /* ---------- materiais ---------- */
  const steel = new THREE.MeshStandardMaterial({ color: '#d9dfdc', metalness: .82, roughness: .28 });
  const steelD = new THREE.MeshStandardMaterial({ color: '#aab5b1', metalness: .8, roughness: .35 });
  const paint = new THREE.MeshStandardMaterial({ color: '#f4f6f5', roughness: .45, metalness: .05 });
  const teal = new THREE.MeshStandardMaterial({ color: '#14483f', roughness: .45 });
  const tealL = new THREE.MeshStandardMaterial({ color: '#1d5c50', roughness: .5 });
  const glow = new THREE.MeshBasicMaterial({ color: '#7fe0b8' });
  const box3 = (w, h, d, m, x, y, z, parent = world) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); parent.add(o); return o; };
  const cyl = (rt, rb, h, m, x, y, z, parent = world, seg = 40) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); parent.add(o); return o; };

  /* ---------- fábrica ao fundo (some na névoa) ---------- */
  const back = new THREE.Group(); world.add(back);
  const floorTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#f2f4f3'; x.fillRect(0, 0, 256, 256); x.strokeStyle = 'rgba(20,72,63,.09)'; x.lineWidth = 2; x.strokeRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 16); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 64), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .9 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -2.6, -14); back.add(floor);
  // tanques de mistura
  [[-14, -13, 2.1, 9], [-8.6, -15, 2.4, 10], [-3, -17, 2.2, 9.5], [16, -16, 2.6, 11]].forEach(([x, z, r, h]) => {
    cyl(r, r, h, steel, x, -2.6 + 1.4 + h / 2, z, back, 48);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), steel); dome.position.set(x, -2.6 + 1.4 + h, z); back.add(dome);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, 1.2, 48), steel); cone.rotation.x = Math.PI; cone.position.set(x, -2.6 + .8, z); back.add(cone);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => cyl(.09, .09, 2.2, steelD, x + a * r * .7, -1.5, z + b * r * .7, back, 8));
    cyl(r + .04, r + .04, .25, teal, x, -2.6 + 1.4 + h * .72, z, back, 48);
    cyl(r + .04, r + .04, .25, teal, x, -2.6 + 1.4 + h * .28, z, back, 48);
  });
  // tubulação
  const pipe = (pts, r = .16) => { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .02); back.add(new THREE.Mesh(new THREE.TubeGeometry(c, 80, r, 12, false), steelD)); };
  pipe([[-14, 9.6, -13], [-14, 11.2, -13], [-8.6, 11.2, -14], [-3, 11.2, -16], [6, 11.2, -16], [16, 11.2, -16], [16, 10.4, -16]]);
  pipe([[-8.6, 9.8, -15], [-8.6, 12.4, -15], [9, 12.4, -14], [9, 6.5, -12]], .13);
  pipe([[-24, 13.4, -12], [30, 13.4, -12]], .22);
  // mezanino com guarda-corpo
  box3(18, .3, 3, paint, 7, 5.2, -11, back);
  for (let i = 0; i <= 9; i++) cyl(.05, .05, 1.3, steelD, -2 + i * 2, 5.95, -9.6, back, 6);
  box3(18, .08, .08, steelD, 7, 6.6, -9.6, back);
  [-1.6, 15.6].forEach(x => cyl(.14, .14, 7.8, steelD, x, 1.3, -11, back, 10));
  // luminárias
  [-10, -3, 4, 11].forEach(x => { cyl(.02, .02, 3, steelD, x, 15.2, -9, back, 4); const sh = new THREE.Mesh(new THREE.ConeGeometry(1, .7, 32, 1, true), teal); sh.position.set(x, 13.5, -9); back.add(sh); const b = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 8), new THREE.MeshBasicMaterial({ color: '#fffbe8' })); b.position.set(x, 13.2, -9); back.add(b); });

  /* ---------- esteira ---------- */
  const P = 3.1; // passo entre estações
  const beltTex = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#123f37'; x.fillRect(0, 0, 256, 64);
    x.fillStyle = '#1b5348'; for (let i = 0; i < 8; i++) x.fillRect(i * 32, 0, 4, 64);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 1); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  })();
  const BL = 40;
  const beltTop = new THREE.MeshStandardMaterial({ map: beltTex, roughness: .7 });
  const belt = new THREE.Mesh(new THREE.BoxGeometry(BL, .3, 2.4), [tealL, tealL, beltTop, teal, teal, teal]);
  belt.position.y = -.15; world.add(belt);
  [-1.3, 1.3].forEach(z => { box3(BL, .5, .1, steel, 0, .05, z); box3(BL, .14, .16, steelD, 0, -.42, z); });
  for (let x = -18; x <= 18; x += 3) { [-1.1, 1.1].forEach(z => box3(.16, 2.1, .16, steelD, x, -1.5, z)); box3(.12, .12, 2.3, steelD, x, -2.2, 0); }

  /* ---------- estação 1: encapsuladora com funil (x = -P) ---------- */
  const portal = (x, h) => { [-1.55, 1.55].forEach(dx => box3(.26, h + 2.6, .26, paint, x + dx, h / 2 - 1.3, -1.55)); box3(3.6, .34, .5, paint, x, h, -1.55); };
  const xs0 = -P;
  portal(xs0, 8.6);
  const enc = new THREE.Group(); enc.position.set(xs0, 0, 0); world.add(enc);
  box3(2.3, 1.5, 1.9, paint, 0, 6.55, -.35, enc);
  box3(2.34, .24, 1.94, teal, 0, 5.9, -.35, enc);
  const disc = cyl(.82, .82, .12, teal, 0, 7.36, -.25, enc, 48);
  const holes = new THREE.Group(); holes.position.set(0, 7.43, -.25); enc.add(holes);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; cyl(.09, .09, .02, new THREE.MeshBasicMaterial({ color: '#efe6d3' }), Math.cos(a) * .55, 0, Math.sin(a) * .55, holes, 12); }
  const hop = new THREE.Mesh(new THREE.LatheGeometry(lathePts([[.3, 0], [.3, .25], [1.25, 1.3], [1.25, 1.9], [1.3, 1.95]]), 64), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .05, transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1 }));
  hop.position.set(0, 7.42, -.25); hop.renderOrder = 3; enc.add(hop);
  const powder = new THREE.Mesh(new THREE.LatheGeometry(lathePts([[.28, 0], [.28, .2], [1.12, 1.2], [1.0, 1.32], [0, 1.4]]), 48), new THREE.MeshStandardMaterial({ color: '#f1e9d7', roughness: .95 }));
  powder.position.set(0, 7.48, -.25); enc.add(powder);
  cyl(1.32, 1.32, .08, steel, 0, 9.36, -.25, enc, 64);
  // bico que solta as cápsulas
  cyl(.3, .22, .9, steel, 0, 5.4, 0, enc, 32);
  cyl(.34, .34, .12, teal, 0, 5.82, 0, enc, 32);
  const lampA = box3(.16, .16, .05, glow.clone(), .8, 6.75, .62, enc);
  // painel
  const panelTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; return { c, x: c.getContext('2d'), t: new THREE.CanvasTexture(c) }; })();
  panelTex.t.colorSpace = THREE.SRGBColorSpace;
  const drawPanel = n => { const { x, c } = panelTex; x.fillStyle = '#0d302a'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#7fe0b8'; x.font = '500 22px ' + FONT_M; x.fillText('CÁPSULAS', 22, 44); x.font = '600 52px ' + FONT_M; x.fillText(String(n).padStart(5, '0'), 22, 104); panelTex.t.needsUpdate = true; void c; };
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.15, .58), new THREE.MeshBasicMaterial({ map: panelTex.t })); panel.position.set(-.35, 6.6, .61); enc.add(panel);

  /* ---------- estação 2: tampadora (x = 0) ---------- */
  portal(0, 8.6);
  const capper = new THREE.Group(); world.add(capper);
  box3(1.9, 1.3, 1.6, paint, 0, 7.6, -.4, capper);
  box3(1.94, .2, 1.64, teal, 0, 7.05, -.4, capper);
  const rod = cyl(.12, .12, 3, steel, 0, 0, 0, capper, 16);
  const chuck = new THREE.Group(); capper.add(chuck);
  cyl(.95, .95, .5, teal, 0, 4.29, 0, chuck, 48);
  cyl(.7, .95, .2, steel, 0, 4.64, 0, chuck, 48);
  // tampa extra que a tampadora segura
  const capSpare = new THREE.Mesh(geos('caps').cap, new THREE.MeshPhysicalMaterial({ color: '#fbfbfa', roughness: .4, clearcoat: .5 }));
  chuck.add(capSpare);
  const lampB = box3(.16, .16, .05, glow.clone(), .65, 7.75, .42, capper);

  /* ---------- estação 3: rotuladora (x = +P) ---------- */
  portal(P, 6.2);
  const lab = new THREE.Group(); lab.position.set(P, 0, 0); world.add(lab);
  box3(1.4, 4.2, 1.1, paint, 2.2, 2.1, -.3, lab);
  const roll = new THREE.Group(); roll.position.set(2.2, 4.9, -.3); lab.add(roll);
  cyl(.95, .95, .45, teal, 0, 0, 0, roll, 48); cyl(.38, .38, .5, paint, 0, 0, 0, roll, 32);
  for (let i = 0; i < 3; i++) box3(.06, .47, .5, new THREE.MeshStandardMaterial({ color: '#ffffff' }), Math.cos(i * 2.1) * .66, 0, Math.sin(i * 2.1) * .66, roll);
  const press = cyl(.16, .16, 2.2, steel, 1.35, 1.75, .25, lab, 16);
  box3(.9, .1, .1, steelD, 1.8, 2.9, .25, lab);
  const lampC = box3(.16, .16, .05, glow.clone(), 2.6, 3.6, .26, lab);

  /* ---------- estação 4: inspeção (x = +2P) ---------- */
  const insp = new THREE.Group(); insp.position.set(2 * P, 0, 0); world.add(insp);
  [-1.45, 1.45].forEach(z => box3(.22, 5.6, .22, paint, 0, 2.5, z, insp));
  box3(.5, .4, 3.2, paint, 0, 5.3, 0, insp);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.6), new THREE.MeshBasicMaterial({ color: '#3fd69a', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  scan.rotation.y = Math.PI / 2; scan.position.set(0, 2.6, 0); insp.add(scan);
  const okDot = box3(.2, .2, .05, glow.clone(), 0, 5.3, 1.62, insp);

  /* ---------- potes (6 em fila, indexando) ---------- */
  const potOpts = { kind: 'caps', brand: 'Sua Marca', line1: 'Suplemento alimentar', line2: '60 cápsulas', theme: 'teal', rows: sampleRows('caps'), porcao: 'Porção de 2 cápsulas (1 g)', porcoes: 'Porções por embalagem: 30', texW: TEX };
  const pots = Array.from({ length: 6 }, () => { const b = makeBottle(potOpts, S.renderer); world.add(b.root); b.shadow.scale.setScalar(2.6); return b; });
  // cápsulas caindo do bico até o pote
  const NF = 12, fallM = pots[0].pile.mats;
  const fb = new THREE.InstancedMesh(CGEO_S.body, fallM[0], NF), fc = new THREE.InstancedMesh(CGEO_S.cap, fallM[1], NF);
  fb.frustumCulled = fc.frustumCulled = false; world.add(fb, fc);
  const tmp = new THREE.Object3D();
  const fall = Array.from({ length: NF }, (_, i) => ({ ph: i / NF, sx: Math.sin(i * 12.9) * .22, sz: Math.cos(i * 7.3) * .18, sp: (i % 2 ? 1 : -1) * (3 + i % 4) }));

  const stepEls = [...document.querySelectorAll('.hero-line__step')];
  let lastStep = -2;
  const setStep = i => { if (i === lastStep) return; lastStep = i; stepEls.forEach((el, k) => { el.classList.toggle('is-on', k === i); el.classList.toggle('is-done', k < i); }); };

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
  const T = 3.4, MOVE = .85;
  let ready = false, count = 12480;
  fontsLoaded.then(() => { pots.forEach(b => b.paint()); drawPanel(count); ready = true; });
  const blink = (m, on) => m.material.color.set(on ? '#3fd69a' : '#bfe8d6');

  loops.push(time => {
    if (!S.visible || !ready) return;
    const k = S3.hero.intro;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    const n = Math.floor(time / T), t = time % T;
    const m = eIO(seg(t, 0, MOVE)), dw = t - MOVE; // dw: tempo parado na estação

    // enquadramento: ~15 unidades de largura visível
    const wide = S.W / S.H;
    const sc = Math.min(S.visH() / 13.2, S.visH() * wide / 17);
    world.scale.setScalar(sc * (.9 + .1 * k));
    world.position.set(S.W < 700 ? 0 : .6 * sc, -4.1 * sc - S3.hero.scroll * 3, 0);
    world.rotation.y = D(-24) + mx * .14 + (1 - k) * D(-16);
    world.rotation.x = D(8) + my * .04;
    beltTex.offset.x = (-(n + m) * P) % 1;

    // estações
    holes.rotation.y = time * 2.2;
    roll.rotation.y = -(n + seg(dw, .25, 1.75)) * Math.PI * 1.4;

    pots.forEach((b, i) => {
      const sl = ((n + i) % 6) - 1; // -1 chegando · 0 envase · 1 tampa · 2 rótulo · 3 inspeção · 4 saindo
      const x = (sl - 1 - (1 - m)) * P;
      b.root.position.set(x, 0, 0);
      if (sl === -1 && t < MOVE) { b.fill(0); b.wrap(0); b.cap.visible = false; }
      // envase
      b.fill(sl < 0 ? 0 : sl === 0 ? (t < MOVE ? 0 : seg(dw, .3, 2.2)) : 1);
      // tampa
      b.cap.visible = sl > 1 || (sl === 1 && dw > 1.05);
      b.cap.position.y = 0; b.cap.rotation.y = 0;
      if (sl === 1 && dw > 1.05) b.cap.rotation.y = -(1 - eOut(seg(dw, 1.05, 1.5))) * Math.PI;
      // rótulo
      const lp = sl === 2 ? (t < MOVE ? 0 : eIO(seg(dw, .3, 1.7))) : sl > 2 ? 1 : 0;
      b.wrap(lp);
      b.spin.rotation.y = D(14) + (sl === 2 && t >= MOVE ? -eIO(seg(dw, .3, 1.7)) * Math.PI * 2 : 0);
      // pronto: pulinho na inspeção
      b.spin.position.y = sl === 3 && t >= MOVE ? Math.sin(seg(dw, 1.2, 1.7) * Math.PI) * .35 : 0;
    });

    // tampadora: desce, rosqueia, sobe
    const down = t < MOVE ? 0 : eIO(seg(dw, .15, .7)) * (1 - eIO(seg(dw, 1.2, 1.8)));
    const chY = 5.62 - down * 1.58; // 4.04 = topo da tampa no pote
    chuck.position.y = chY - 4.04;
    capSpare.visible = !(t >= MOVE && dw > 1.05); capSpare.position.y = 0;
    chuck.rotation.y = t >= MOVE ? -eIO(seg(dw, .55, 1.15)) * Math.PI * 3 : 0;
    rod.position.y = chY + .74 + 1.5;
    // cápsulas caindo no pote da estação 1
    const filling = t >= MOVE;
    fall.forEach((f, i) => {
      // várias levas por ciclo
      let p = -1;
      if (filling && dw > .25 && dw < 2.2) { p = ((dw - .25) / .5 + f.ph) % 1; if ((dw - .25) / .5 + f.ph < 1) p = -1; }
      if (p < 0 || p > 1) { tmp.scale.setScalar(0); tmp.updateMatrix(); fb.setMatrixAt(i, tmp.matrix); fc.setMatrixAt(i, tmp.matrix); return; }
      const top = 4.95, bot = .3 + seg(dw, .3, 2.2) * 2.7;
      tmp.position.set(xs0 + f.sx * (1 - p * .4), top - (top - bot) * p * p, f.sz);
      tmp.rotation.set(p * f.sp, f.sx * 4, Math.PI / 2 * (i % 2) + p * f.sp * .5);
      tmp.scale.setScalar(.21); tmp.updateMatrix();
      fb.setMatrixAt(i, tmp.matrix); fc.setMatrixAt(i, tmp.matrix);
    });
    fb.instanceMatrix.needsUpdate = fc.instanceMatrix.needsUpdate = true;
    // inspeção
    const sp = t >= MOVE ? seg(dw, .3, 1.1) : 0;
    scan.material.opacity = sp > 0 && sp < 1 ? .22 * Math.sin(sp * Math.PI) : 0;
    scan.position.y = 2.6 + Math.sin(sp * Math.PI * 2) * .4;
    blink(okDot, t >= MOVE && dw > 1.1);
    blink(lampA, filling && Math.sin(time * 9) > 0); blink(lampB, t >= MOVE && dw < 1.8); blink(lampC, t >= MOVE && dw < 1.7);
    // contador do painel
    const want = 12480 + n * 60 + Math.round(seg(dw, .3, 2.2) * 60);
    if (want !== count) { count = want; drawPanel(count); }
    // etapas no HTML: destaca a estação da vez
    setStep(t < MOVE ? -1 : n % 4);
    S.render();
  });
  return true;
}
function sampleRows(kind) {
  return kind === 'drop'
    ? [{ name: 'Valor energético', unit: 'kcal', v: '9,7', vd: '0' }, { name: 'Gorduras totais', unit: 'g', v: '1,1', vd: '2' }, { name: 'Vitamina D', unit: 'µg', v: '50', vd: '333' }, { name: 'Vitamina K', unit: 'µg', v: '120', vd: '100' }]
    : [{ name: 'Magnésio', unit: 'mg', v: '140', vd: '33' }, { name: 'Zinco', unit: 'mg', v: '11', vd: '100' }, { name: 'Vitamina D', unit: 'µg', v: '15', vd: '100' }, { name: 'Vitamina B6', unit: 'mg', v: '1,3', vd: '100' }, { name: 'Vitamina B12', unit: 'µg', v: '2,4', vd: '100' }, { name: 'Biotina', unit: 'µg', v: '30', vd: '100' }, { name: 'Arginina', unit: 'mg', v: '300', vd: '*' }, { name: 'Cafeína', unit: 'mg', v: '75', vd: '*' }];
}

/* =========================================================
   2/3. Cena de abrir a cápsula (home + produto)
   ========================================================= */
function opener(selector, st, { baseScale = .74, withBottle = false } = {}) {
  const box = document.querySelector(selector);
  if (!box || !st) return;
  const S = stage(box, { fov: 28, z: 11 });
  const c = capsule(); S.scene.add(c.root);
  let pot = null;
  if (withBottle) {
    pot = makeBottle({ kind: 'caps', brand: 'SUA MARCA', line1: 'Suplemento alimentar', line2: '60 cápsulas', theme: 'teal', rows: sampleRows('caps'), porcao: 'Porção de 2 cápsulas (1 g)', porcoes: 'Porções por embalagem: 30' }, S.renderer);
    S.scene.add(pot.root); pot.setAlpha(0);
    fontsLoaded.then(() => pot.paint());
  }
  // cápsulas caindo dentro do pote aberto (coordenadas locais do pote)
  const NF = 14, tmp = new THREE.Object3D();
  let fb = null, fc = null, rain = [];
  if (pot && pot.pile) {
    fb = new THREE.InstancedMesh(CGEO_S.body, pot.pile.mats[0], NF); fc = new THREE.InstancedMesh(CGEO_S.cap, pot.pile.mats[1], NF);
    fb.frustumCulled = fc.frustumCulled = false; pot.root.add(fb, fc);
    rain = Array.from({ length: NF }, (_, i) => ({ ph: i / NF, sx: Math.sin(i * 12.9) * .32, sz: Math.cos(i * 7.3) * .26, sp: (i % 2 ? 1 : -1) * (3 + i % 4) }));
  }
  let sig = '', odd = 0;
  loops.push(time => {
    if (!S.visible) return;
    // nada mudou (scroll parado e sem pote balançando) → não redesenha
    const swaying = (st.bottle || 0) > .01;
    const k = `${st.y},${st.rot},${st.scale},${st.spin},${st.tumble},${st.open},${st.out},${st.bottle},${st.fill},${st.capOn},${S.W},${S.H},${quality}`;
    const changed = k !== sig; sig = k;
    if (!changed && !swaying) return;
    // só o balanço do pote: no celular basta 30 fps
    if (!changed && LOW && (odd ^= 1)) return;
    const mob = S.W < 700 && withBottle;
    const [x, y] = S.toWorld(.5, st.y - (mob ? .13 : 0));
    const byH = S.H / 900, byW = S.W / 520;
    const s = baseScale * st.scale * Math.max(.55, Math.min(1.05, byH, byW));
    c.root.position.set(x, y, 0);
    c.root.rotation.set(0, 0, D(-st.rot));
    c.root.scale.setScalar(s);
    c.inner.rotation.y = st.spin * Math.PI * 2 + D(18);
    c.inner.rotation.x = D(12) + st.tumble * Math.PI * 2;
    const o = st.open, out = st.out || 0;
    c.top.position.y = o * .95 + out * 4; c.bot.position.y = -o * .95 - out * 4;
    c.top.rotation.z = D(-16) * o - out * .8; c.bot.rotation.z = D(12) * o + out * .7;
    c.top.position.x = -o * .12; c.bot.position.x = o * .12;
    c.setAlpha(1 - out);
    if (pot) {
      const b = st.bottle || 0;
      pot.setAlpha(Math.min(1, b * 1.4));
      if (b > .01) {
        const fy = mob ? .37 : Math.min(.68, (.5 * S.H + Math.min(S.H * .2, 160)) / S.H) - .04;
        const sc = fitBottle(S, pot, (mob ? .34 : .42 * Math.max(.7, Math.min(1, S.W / 700))) * (.7 + .3 * eOut(b)), fy + (1 - eOut(b)) * .12);
        pot.root.position.x = 0;
        pot.spin.rotation.y = (1 - eOut(b)) * -Math.PI * 1.2 + Math.sin(time * .6) * .25 + D(-10);
        pot.root.rotation.x = D(6);
        void sc;
        // envase: cápsulas entram no pote e o nível sobe; depois a tampa rosqueia
        const fk = st.fill ?? 1, ck = st.capOn ?? 1;
        pot.fill(fk);
        pot.cap.visible = ck > .01;
        pot.cap.position.y = (1 - eOut(ck)) * 1.8;
        pot.cap.rotation.y = -(1 - ck) * Math.PI * 2.5;
        if (fb) {
          const raining = fk > .001 && fk < .999;
          rain.forEach((f, i) => {
            const p = raining ? ((fk * 9 + f.ph) % 1) : -1;
            if (p < 0) { tmp.scale.setScalar(0); }
            else {
              const top = 6.4, bot = pot.pile.topAt(fk) + .1;
              tmp.position.set(f.sx * (1 - p * .5), top - (top - bot) * p * p, f.sz * (1 - p * .5));
              tmp.rotation.set(p * f.sp, f.sx * 4, Math.PI / 2 * (i % 2) + p * f.sp * .5);
              tmp.scale.setScalar(.21);
            }
            tmp.updateMatrix(); fb.setMatrixAt(i, tmp.matrix); fc.setMatrixAt(i, tmp.matrix);
          });
          fb.instanceMatrix.needsUpdate = fc.instanceMatrix.needsUpdate = true;
        }
      }
    }
    S.render();
  });
  return true;
}

/* =========================================================
   4. SIMULADOR DE RÓTULO (pote + conta-gotas, arrasta pra girar)
   ========================================================= */
function builder() {
  const box = document.querySelector('.builder__stage');
  const B = Caps.builder;
  if (!box || !B) return;
  const S = stage(box, { fov: 24, z: 15 });
  S.camera.position.set(0, 1.1, 15); S.camera.lookAt(0, 0, 0);
  const common = { brand: B.brand, theme: 'teal', line1: 'Suplemento alimentar' };
  const pot = makeBottle({ ...common, kind: 'caps', line2: '60 cápsulas', rows: sampleRows('caps'), porcao: 'Porção de 2 cápsulas (1 g)', porcoes: 'Porções por embalagem: 30' }, S.renderer);
  const drop = makeBottle({ ...common, kind: 'drop', line2: '30 mL', rows: sampleRows('drop'), porcao: 'Porção de 1 mL (20 gotas)', porcoes: 'Porções por embalagem: 30' }, S.renderer);
  const goma = makeBottle({ ...common, kind: 'goma', line2: '90 gomas', rows: sampleRows('goma'), porcao: 'Porção de 4 gomas (8 g)', porcoes: 'Porções por embalagem: 15' }, S.renderer);
  const sol = makeBottle({ ...common, kind: 'sol', line2: '200 g', rows: sampleRows('sol'), porcao: 'Porção de 10 g (1 medida)', porcoes: 'Porções por embalagem: 20' }, S.renderer);
  const bottles = { caps: pot, drop, goma, sol };
  S.scene.add(pot.root, drop.root, goma.root, sol.root);
  const drag = dragRotate(S.canvas, () => hint && hint.classList.add('is-gone'));
  const hint = document.querySelector('.builder__hint');
  // só um frasco por vez em foco no centro; os outros ficam fora do palco, invisíveis.
  // cada forma tem sua própria escala de foco pra preencher bem o palco (a
  // referência de "fit" no loop abaixo foi calibrada pro pote de cápsulas)
  const OFF = { x: 0, s: .55, a: 0 };
  const FOCUS_S = { caps: 1.12, drop: 1.45, goma: 1.12, sol: 1.55 };
  const layouts = { caps: {}, drop: {}, goma: {}, sol: {} };
  Object.keys(layouts).forEach(k => { Object.keys(bottles).forEach(n => { layouts[k][n] = n === k ? { x: 0, s: FOCUS_S[n], a: 1 } : OFF; }); });
  const lay = { caps: { x: 0, s: FOCUS_S.caps, a: 1 }, drop: { ...OFF }, goma: { ...OFF }, sol: { ...OFF } };
  let ready = false;
  fontsLoaded.then(() => { pot.paint(); drop.paint(); goma.paint(); sol.paint(); ready = true; });
  addEventListener('builder:change', e => {
    const d = e.detail || {};
    if (d.brand !== undefined) Object.values(bottles).forEach(b => b.set({ brand: d.brand }));
    if (d.k && layouts[d.k]) { const L = layouts[d.k]; Object.keys(bottles).forEach(n => gsap.to(lay[n], { ...L[n], duration: .9, ease: 'expo.out' })); }
    if (d.flip) { drag.target = Math.round(drag.target / Math.PI) * Math.PI + Math.PI; drag.vel = 0; drag.touched = true; }
  });
  let rot = 0;
  loops.push(time => {
    if (!S.visible || !ready) return;
    drag.step();
    const idle = drag.touched ? 0 : Math.sin(time * .7) * .38;
    rot += (drag.target + idle - rot) * .12;
    const vh = S.visH(), vw = vh * S.camera.aspect, narrow = S.W < 700;
    // no celular o frasco ocupa quase todo o palco (preview grande, perto do campo do nome)
    const fit = Math.min(vh * (narrow ? .74 : .6) / 4.04, vw * (narrow ? .9 : .8) / 4.9), lift = narrow ? .32 * fit : 0;
    Object.keys(bottles).forEach(n => {
      const b = bottles[n], l = lay[n];
      b.root.scale.setScalar(fit * l.s);
      b.root.position.set(l.x * fit, -2.1 * fit + lift, 0);
      b.spin.rotation.y = rot;
      b.setAlpha(l.a);
    });
    S.render();
  });
  return true;
}


// cenas abaixo da dobra só nascem quando o visitante se aproxima (menos GPU/shaders no carregamento)
const lazy = (sel, fn) => {
  const el = document.querySelector(sel);
  if (!el) return;
  const io = new IntersectionObserver(es => {
    if (!es.some(e => e.isIntersecting)) return;
    io.disconnect();
    try { fn(); } catch (err) { console.warn('[caps3d]', err); }
  }, { rootMargin: '1000px 0px' });
  io.observe(el);
};
try {
  const LITE = document.documentElement.classList.contains('is-lite');
  const okHero = LITE ? false : hero();
  document.documentElement.classList.add('has-3d');
  if (okHero) document.documentElement.classList.add('has-3d-hero');
  if (!LITE) lazy('.caps-pin', () => opener('.caps-pin', S3.caps, { baseScale: .72, withBottle: true }));
  lazy('.builder__stage', () => { if (builder()) document.documentElement.classList.add('has-3d-builder'); });
  window.dispatchEvent(new Event('caps3d:ready'));
} catch (err) {
  console.warn('[caps3d] WebGL indisponível, usando fallback', err);
}
