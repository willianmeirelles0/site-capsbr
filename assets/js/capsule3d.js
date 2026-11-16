/* =========================================================
   CapsBR — Cápsula 3D (Three.js)
   Uma cápsula de verdade: duas metades torneadas (lathe), material
   físico com verniz, luz de estúdio. Os scripts da página animam
   objetos simples em window.Caps.S3 com GSAP; aqui só renderizamos.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const Caps = window.Caps || {};
const S3 = Caps.S3 || {};
const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
const COL = { teal: '#1d5c50', cream: '#f2eadb', inTeal: '#0d302a', inCream: '#d8ccb4' };

/* ---------- Geometria ---------- */
const R = 0.5, RC = 0.522, L = 1.15; // raio corpo, raio tampa, meio comprimento
const SEG = 72;
function bodyProfile() {
  const pts = [];
  const cy = -L + R;
  for (let i = 0; i <= 18; i++) { const a = -Math.PI / 2 + (i / 18) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(0.0001, R * Math.cos(a)), cy + R * Math.sin(a))); }
  pts.push(new THREE.Vector2(R, 0.26));
  pts.push(new THREE.Vector2(R * 0.985, 0.275));
  return pts;
}
function capProfile() {
  const pts = [new THREE.Vector2(RC * 0.975, -0.2), new THREE.Vector2(RC, -0.185)];
  const cy = L - RC;
  pts.push(new THREE.Vector2(RC, cy));
  for (let i = 1; i <= 18; i++) { const a = (i / 18) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(0.0001, RC * Math.cos(a)), cy + RC * Math.sin(a))); }
  return pts;
}
const GEO = { body: new THREE.LatheGeometry(bodyProfile(), SEG), cap: new THREE.LatheGeometry(capProfile(), SEG) };
// anel sutil na borda da tampa
GEO.ring = new THREE.TorusGeometry(RC * 0.99, 0.012, 10, SEG); GEO.ring.rotateX(Math.PI / 2); GEO.ring.translate(0, -0.19, 0);

function mats(c1 = COL.teal, c2 = COL.cream) {
  const top = new THREE.MeshPhysicalMaterial({ color: c1, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.18, sheen: 0.25, sheenColor: new THREE.Color('#9cc7b9'), transparent: true });
  const bot = new THREE.MeshPhysicalMaterial({ color: c2, roughness: 0.38, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: new THREE.Color('#ffffff'), transparent: true });
  const inTop = new THREE.MeshStandardMaterial({ color: COL.inTeal, roughness: 0.7, side: THREE.BackSide, transparent: true });
  const inBot = new THREE.MeshStandardMaterial({ color: COL.inCream, roughness: 0.8, side: THREE.BackSide, transparent: true });
  return { top, bot, inTop, inBot, all: [top, bot, inTop, inBot] };
}

function capsule(c1, c2) {
  const m = mats(c1, c2);
  const root = new THREE.Group(), inner = new THREE.Group();
  const top = new THREE.Group(), bot = new THREE.Group();
  top.add(new THREE.Mesh(GEO.cap, m.top), new THREE.Mesh(GEO.cap, m.inTop), new THREE.Mesh(GEO.ring, m.top));
  bot.add(new THREE.Mesh(GEO.body, m.bot), new THREE.Mesh(GEO.body, m.inBot));
  inner.add(top, bot); root.add(inner);
  return {
    root, inner, top, bot, m,
    setAlpha(a) { m.all.forEach(x => { x.opacity = a; x.depthWrite = a > 0.98; }); root.visible = a > 0.01; },
  };
}

/* ---------- Palco (renderer + câmera + luz) ---------- */
function stage(container, { fov = 30, z = 10 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = 'caps3d-canvas';
  container.appendChild(canvas);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;
  const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight('#bfe0d4', 1.4); rim.position.set(4, -2, -3); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100); camera.position.z = z;
  let W = 1, H = 1, visible = true;
  const size = () => { W = container.clientWidth || 1; H = container.clientHeight || 1; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); };
  size(); new ResizeObserver(size).observe(container);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(container);
  const visH = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  // converte fração da tela (0..1) em coordenada do mundo no plano z=0
  const toWorld = (fx, fy) => { const h = visH(), w = h * camera.aspect; return [(fx - 0.5) * w, (0.5 - fy) * h]; };
  return { renderer, scene, camera, canvas, toWorld, visH, get W() { return W; }, get H() { return H; }, get visible() { return visible; }, render: () => renderer.render(scene, camera) };
}

const D = THREE.MathUtils.degToRad;
const loops = [];
gsap.ticker.add((time) => { for (const f of loops) f(time); });

/* ---------- 1. HERO ---------- */
function hero() {
  const box = document.querySelector('.hero__visual');
  const st = S3.hero;
  if (!box || !st) return;
  const S = stage(box, { fov: 28, z: 11 });
  const main = capsule(); S.scene.add(main.root);
  const minis = [
    { fx: .12, fy: .16, s: .3, rz: -40, z: -1, sp: 1.2, c: [COL.teal, COL.cream] },
    { fx: .9, fy: .82, s: .36, rz: 60, z: .6, sp: .9, c: [COL.cream, COL.cream] },
    { fx: .86, fy: .2, s: .22, rz: 14, z: -3, sp: 1.5, c: [COL.teal, COL.cream] },
    { fx: .1, fy: .78, s: .26, rz: -75, z: -2, sp: 1.1, c: ['#2c6b5f', COL.cream] },
  ].map(o => { const c = capsule(...o.c); S.scene.add(c.root); return { ...o, c }; });
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
  loops.push(t => {
    if (!S.visible) return;
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    const k = st.intro, sc = st.scroll;
    const fit = Math.min(1, S.W / 520);
    const [x0, y0] = S.toWorld(.5, .5 + sc * .25);
    main.root.position.set(x0 + mx * .5, y0 + Math.sin(t * 1.1) * .12, 0);
    main.root.rotation.set(my * .25, mx * .35, D(-26) - (1 - k) * D(160) - sc * D(70));
    main.root.scale.setScalar((.35 + .65 * k) * fit * 1.08);
    main.inner.rotation.y = t * .35 + (1 - k) * 4;
    main.inner.rotation.x = D(14);
    main.setAlpha(Math.min(1, k * 1.6));
    minis.forEach((m, i) => {
      const [x, y] = S.toWorld(m.fx, m.fy);
      const kk = Math.min(1, Math.max(0, k * 1.6 - .3 - i * .08));
      m.c.root.position.set(x + mx * (m.z + 2.5) * .5, y + Math.sin(t * m.sp + i) * .15, m.z);
      m.c.root.rotation.set(0, 0, D(m.rz) + Math.sin(t * .5 + i) * .2);
      m.c.inner.rotation.y = t * (.4 + i * .1);
      m.c.inner.rotation.x = D(20);
      m.c.root.scale.setScalar(m.s * fit * (.4 + .6 * kk));
      m.c.setAlpha(kk);
    });
    S.render();
  });
  return true;
}

/* ---------- 2/3. Cena de abrir (home + produto) ---------- */
function opener(selector, st, { axis = 'v', baseScale = .74 } = {}) {
  const box = document.querySelector(selector);
  if (!box || !st) return;
  const S = stage(box, { fov: 28, z: 11 });
  const c = capsule(); S.scene.add(c.root);
  loops.push(() => {
    if (!S.visible) return;
    const [x, y] = S.toWorld(.5, st.y);
    const byH = S.H / 900, byW = S.W / 520;
    const s = baseScale * st.scale * Math.max(.55, Math.min(1.05, byH, byW));
    c.root.position.set(x, y, 0);
    c.root.rotation.set(0, 0, D(-st.rot));
    c.root.scale.setScalar(s);
    c.inner.rotation.y = st.spin * Math.PI * 2 + D(18);
    c.inner.rotation.x = D(12) + st.tumble * Math.PI * 2;
    const o = st.open, out = st.out || 0;
    c.top.position.y = o * .95 + out * 4;
    c.bot.position.y = -o * .95 - out * 4;
    c.top.rotation.z = D(-16) * o - out * .8;
    c.bot.rotation.z = D(12) * o + out * .7;
    c.top.position.x = -o * .12; c.bot.position.x = o * .12;
    c.setAlpha(1 - out);
    S.render();
  });
  return true;
}

/* ---------- Imagens estáticas de cápsula (decorativas, custo zero) ---------- */
function snapshots() {
  const els = document.querySelectorAll('.js-cap-img');
  if (!els.length) return;
  const w = 220, h = 520;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2); renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = .85;
  const key = new THREE.DirectionalLight('#fff', 2.2); key.position.set(-3, 5, 6); scene.add(key);
  const hh = 1.22, cam = new THREE.OrthographicCamera(-hh * w / h, hh * w / h, hh, -hh, .1, 50); cam.position.z = 10;
  const cache = {};
  const shot = (variant) => {
    if (cache[variant]) return cache[variant];
    const [c1, c2] = variant === 'light' ? ['#ffffff', COL.cream] : [COL.teal, COL.cream];
    const c = capsule(c1, c2); scene.add(c.root);
    c.inner.rotation.set(D(10), D(30), 0);
    renderer.render(scene, cam);
    cache[variant] = renderer.domElement.toDataURL('image/png');
    scene.remove(c.root);
    return cache[variant];
  };
  els.forEach(el => {
    el.classList.add('is-img');
    el.innerHTML = `<img src="${shot(el.dataset.variant || 'teal')}" alt="" draggable="false">`;
  });
  renderer.dispose();
}

try {
  hero();
  opener('.caps-pin', S3.caps, { baseScale: .72 });
  opener('.pd-open__stage', S3.pd, { baseScale: .95 });
  snapshots();
  document.documentElement.classList.add('has-3d');
  window.dispatchEvent(new Event('caps3d:ready'));
} catch (err) {
  console.warn('[caps3d] WebGL indisponível, usando fallback CSS', err);
}
