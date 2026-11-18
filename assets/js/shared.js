/* =========================================================
   CapsBR · utilitários compartilhados
   ========================================================= */
(() => {
  // Configurações editáveis pelo painel /admin (window.SITE vem de /api/catalog)
  const SITE = window.SITE || {};
  const WA = String(SITE.whatsapp || '5554997090147').replace(/\D/g, '') || '5554997090147';
  const COSTS = Object.assign({ rotuloCaps: 650, rotuloLiq: 600, rotuloLote: 500, anvisa: 300 }, SITE.costs || {});
  const THEMES = {
    teal:   { label: '#14483f', ink: '#ffffff', sub: 'rgba(255,255,255,.72)' },
    forest: { label: '#0b2b27', ink: '#efe6d6', sub: 'rgba(239,230,214,.7)' },
    black:  { label: '#141416', ink: '#9cc7b9', sub: 'rgba(245,245,244,.7)' },
    cream:  { label: '#f3efe6', ink: '#1a1612', sub: 'rgba(26,22,18,.6)' },
    graphite: { label: '#2b2b30', ink: '#f5f5f4', sub: 'rgba(245,245,244,.6)' },
  };
  /* ---------- Campanha promocional (desativada) ----------
     A Black Friday da CapsBR roda num site à parte; este site nunca mostra
     promoção. PROMO existe só porque priceAt()/waLink() ainda referenciam
     PROMO.on - mantido sempre false. */
  const PROMO = { name: '', end: '2000-01-01T00:00:00-03:00', max: 0, enabled: false, on: false, endDM: '', endDMY: '' };
  document.documentElement.classList.add('promo-off');

  let uid = 0;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Medição de texto (auto-fit do rótulo) ---------- */
  const mctx = document.createElement('canvas').getContext('2d');
  const FONT_D = "'Inter Tight', 'Inter', Arial, sans-serif", FONT_B = "'Inter', Arial, sans-serif", FONT_M = "'JetBrains Mono', monospace";
  const textW = (txt, size, weight, family, ls = 0) => { mctx.font = `${weight} ${size}px ${family}`; return mctx.measureText(txt).width + ls * Math.max(0, txt.length - 1); };
  // maior tamanho (até max) que cabe na largura
  const fit = (txt, max, min, width, weight, family, lsEm = 0) => {
    const w = textW(txt, 100, weight, family, lsEm * 100);
    return Math.max(min, Math.min(max, (width / w) * 100 * 0.98));
  };
  // quebra a marca em até 2 linhas equilibradas
  const twoLines = words => {
    if (words.length < 2) return null;
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      const m = Math.max(a.length, b.length);
      if (!best || m < best.m) best = { a, b, m };
    }
    return [best.a, best.b];
  };
  // texto de uma linha que nunca passa da largura (encolhe; se precisar, comprime)
  const line = (x, y, txt, max, width, weight, family, fill, ls = 0, extra = '') => {
    const fs = fit(txt, max, max * .62, width, weight, family, ls);
    const w = textW(txt, fs, weight, family, ls * fs);
    const squeeze = w > width ? ` textLength="${width}" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text x="${x}" y="${y}" font-family="${family.replace(/"/g, "'")}" font-weight="${weight}" font-size="${fs.toFixed(2)}" letter-spacing="${(ls * fs).toFixed(2)}" fill="${fill}"${squeeze}${extra}>${esc(txt)}</text>`;
  };
  // marca: 1 linha grande ou 2 linhas, o que ficar maior
  const brandBlock = (b, x, yMid, width, maxFs, fill) => {
    const one = fit(b, maxFs, 6, width, 700, FONT_D, -.03);
    const words = b.split(/\s+/).filter(Boolean);
    const two = twoLines(words);
    let twoFs = 0;
    if (two) twoFs = Math.min(fit(two[0], maxFs * .86, 6, width, 700, FONT_D, -.03), fit(two[1], maxFs * .86, 6, width, 700, FONT_D, -.03));
    if (two && twoFs > one * 1.18) {
      const lh = twoFs * 1.02;
      return { h: lh * 2, svg: [two[0], two[1]].map((t, i) => line(x, (yMid - lh / 2 + twoFs * .36 + i * lh).toFixed(2), t, twoFs, width, 700, FONT_D, fill, -.03)).join('') };
    }
    return { h: one, svg: line(x, (yMid + one * .36).toFixed(2), b, one, width, 700, FONT_D, fill, -.03) };
  };

  /* ---------- SVG bottle generator ---------- */
  function bottle({ kind = 'caps', brand = 'SUA MARCA', line1 = 'SUPLEMENTO ALIMENTAR', line2 = '60 CÁPSULAS', theme = 'teal', code = '' } = {}) {
    const t = THEMES[theme] || THEMES.teal;
    const id = 'b' + (++uid);
    const b = (String(brand).trim() || 'SUA MARCA').toUpperCase().slice(0, 18);
    const l1 = String(line1).toUpperCase(), l2 = String(line2).toUpperCase();
    if (kind === 'drop') {
      // rótulo: x20 a 120 · área útil x30 a 110 (80px)
      const br = brandBlock(b, 30, 214, 80, 17, t.ink);
      return `<svg class="bottle" viewBox="0 0 140 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
 <linearGradient id="${id}w" x1="0" x2="1"><stop offset="0" stop-color="#bdbdbd"/><stop offset=".25" stop-color="#fff"/><stop offset=".6" stop-color="#ececec"/><stop offset="1" stop-color="#9d9d9d"/></linearGradient>
 <linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".22" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
 <pattern id="${id}r" width="5" height="10" patternUnits="userSpaceOnUse"><rect width="2.5" height="10" fill="#000" opacity=".09"/></pattern>
</defs>
<path d="M54 64V26c0-12 7-20 16-20s16 8 16 20v38z" fill="url(#${id}w)"/>
<rect x="44" y="62" width="52" height="10" rx="3" fill="url(#${id}w)"/>
<rect x="38" y="72" width="64" height="48" rx="5" fill="url(#${id}w)"/><rect x="38" y="72" width="64" height="48" rx="5" fill="url(#${id}r)"/>
<rect x="42" y="118" width="56" height="12" fill="url(#${id}w)"/>
<path d="M42 130c-14 4-22 12-22 26v138c0 9 7 16 16 16h68c9 0 16-7 16-16V156c0-14-8-22-22-26z" fill="url(#${id}w)"/>
<rect x="20" y="176" width="100" height="112" fill="${t.label}"/>
${code ? `<rect x="30" y="185" width="${textW(code, 5.6, 500, FONT_M) + 9}" height="10" rx="5" fill="none" stroke="${t.ink}" stroke-opacity=".7" stroke-width=".7"/>${line(34.5, 192, code, 5.6, 40, 500, FONT_M, t.ink)}` : ''}
${br.svg}
<rect x="30" y="${(214 + br.h / 2 + 8).toFixed(1)}" width="22" height="1.2" fill="${t.ink}"/>
${line(30, 262, l1, 6.2, 80, 600, FONT_B, t.sub, .06)}
${line(30, 274, l2, 6.2, 80, 600, FONT_B, t.sub, .06)}
<rect x="20" y="176" width="100" height="112" fill="url(#${id}l)"/>
<path d="M30 140c-4 4-5 10-5 18v130" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
    }
    // rótulo: x22 a 178 · área útil x38 a 162 (124px)
    const br = brandBlock(b, 38, 174, 124, 26, t.ink);
    return `<svg class="bottle" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
 <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="#bcbcbc"/><stop offset=".3" stop-color="#fff"/><stop offset=".65" stop-color="#ededed"/><stop offset="1" stop-color="#a0a0a0"/></linearGradient>
 <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#0b2b27" stop-opacity=".75"/><stop offset=".2" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#06201d" stop-opacity=".7"/></linearGradient>
 <linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".22" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
 <radialGradient id="${id}p" cx=".35" cy=".35"><stop offset="0" stop-color="#fbf8f2"/><stop offset="1" stop-color="#e6d8bf"/></radialGradient>
 <pattern id="${id}r" width="6" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="10" fill="#000" opacity=".08"/></pattern>
 <clipPath id="${id}k"><rect x="22" y="72" width="156" height="220" rx="28"/></clipPath>
</defs>
<rect x="36" y="8" width="128" height="54" rx="9" fill="url(#${id}c)"/><rect x="36" y="8" width="128" height="54" rx="9" fill="url(#${id}r)"/>
<rect x="44" y="60" width="112" height="14" fill="url(#${id}c)" opacity=".9"/>
<g clip-path="url(#${id}k)">
 <rect x="22" y="72" width="156" height="220" fill="#d9cdb8" opacity=".25"/>
 ${[[40,96,-20],[78,90,10],[118,98,-8],[150,92,25],[60,106,40],[100,108,-30],[136,110,5],[44,272,15],[84,268,-25],[124,276,8],[160,266,-15],[64,282,30],[106,284,0]].map(([x,y,r]) => `<rect x="${x-16}" y="${y-7}" width="32" height="14" rx="7" fill="url(#${id}p)" transform="rotate(${r} ${x} ${y})"/>`).join('')}
 <rect x="22" y="72" width="156" height="220" fill="url(#${id}g)"/>
</g>
<rect x="22" y="72" width="156" height="220" rx="28" fill="none" stroke="#fff" stroke-opacity=".25"/>
<rect x="22" y="120" width="156" height="136" fill="${t.label}"/>
${code ? `<rect x="38" y="133" width="${(textW(code, 7, 500, FONT_M) + 12).toFixed(1)}" height="13" rx="6.5" fill="none" stroke="${t.ink}" stroke-opacity=".7" stroke-width=".8"/>${line(44, 142.4, code, 7, 60, 500, FONT_M, t.ink)}` : `<text x="38" y="143" font-family="${FONT_M.replace(/"/g, "'")}" font-size="6.5" letter-spacing=".8" fill="${t.sub}">SUPLEMENTO</text>`}
${br.svg}
<rect x="38" y="${(174 + br.h / 2 + 10).toFixed(1)}" width="30" height="1.6" fill="${t.ink}"/>
${line(38, 222, l1, 8, 124, 600, FONT_B, t.sub, .06)}
${line(38, 238, l2, 8, 124, 600, FONT_B, t.sub, .06)}
<rect x="22" y="120" width="156" height="136" fill="url(#${id}l)"/>
<path d="M34 92c-4 6-5 14-5 24v150" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;
  }

  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const waLink = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  const productFor = p => bottle({
    kind: p.tipo === 'Líquidos' ? 'drop' : 'caps',
    brand: 'Sua Marca',
    line1: p.titulo.length > 22 ? p.categoria : p.titulo,
    line2: p.tamanho,
    theme: 'teal',
    code: p.id,
  });
  // foto real do produto (pote, frasco, goma ou pote de pó)
  const PHOTO_BY_TIPO = {
    'Líquidos': { img: 'liquidos', alt: 'frasco conta-gotas', w: 317, h: 476 },
    'Gomas e Pastilhas': { img: 'gomas', alt: 'pote de gomas', w: 480, h: 720 },
    'Solúveis': { img: 'soluveis', alt: 'pote de pó solúvel', w: 480, h: 720 },
  };
  const photoFor = p => {
    const ph = PHOTO_BY_TIPO[p.tipo] || { img: 'capsulas', alt: 'pote de cápsulas', w: 480, h: 720 };
    return `<span class="pcard__photo"><img src="assets/img/${ph.img}-card.jpg" alt="${p.titulo}, ${ph.alt}" loading="lazy" decoding="async" width="${ph.w}" height="${ph.h}"></span>`;
  };
  // [de, por] → preço vigente (promo ou normal)
  const priceAt = (p, v) => { const [de, por] = p.volumes[v]; return PROMO.on ? por : de; };
  const minPrice = p => Math.min(...Object.keys(p.volumes).map(v => priceAt(p, v)));
  const maxDe = p => { const vs = Object.values(p.volumes); if (!vs.length) return 0; return vs.find(v => v[1] === Math.min(...vs.map(x => x[1])))[0]; };

  // tabela nutricional: separa unidade e remove linhas zeradas (só o que vai no produto)
  const parseRow = ([n, v, vd]) => { const m = n.match(/^(.*?)\s*\(([^)]+)\)\s*$/); return { name: m ? m[1] : n, unit: m ? m[2] : '', v, vd }; };
  const isZero = v => /^0+([.,]0+)?$/.test(String(v).trim());
  const nutriRows = p => p.tabela.map(parseRow).filter(r => !isZero(r.v));
  // dados do frasco 3D (rótulo com tabela no verso)
  const bottleData = p => JSON.stringify({
    kind: p.tipo === 'Líquidos' ? 'drop' : 'caps', brand: 'Sua Marca', code: p.id, theme: 'teal',
    line1: p.titulo.length > 22 ? p.categoria : p.titulo, line2: p.tamanho,
    rows: nutriRows(p), porcao: p.porcao, porcoes: p.porcoes,
  }).replace(/'/g, '&#39;');
  window.Caps = { bottle, brl, waLink, productFor, photoFor, minPrice, maxDe, priceAt, THEMES, PROMO, COSTS, SITE, esc, parseRow, nutriRows, bottleData };

  /* ---------- Barra de avisos (editável no painel) ---------- */
  const track = document.querySelector('.announce__track');
  if (track && Array.isArray(SITE.announce) && SITE.announce.length) {
    const row = SITE.announce.map(t => `<span>${esc(t)}</span>`).join('');
    track.innerHTML = row + row;
  }
  document.querySelectorAll('.js-anvisa').forEach(el => el.textContent = brl(COSTS.anvisa));

  /* ---------- Bootstrap interactions ---------- */
  document.documentElement.classList.remove('no-js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll (Lenis)
  let lenis = null;
  if (!reduce && window.Lenis && !document.documentElement.classList.contains('is-lite')) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.Caps.lenis = lenis;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: -20 }) : el.scrollIntoView({ behavior: 'smooth' });
  });

  // Nav hide on scroll down
  const nav = document.querySelector('.nav');
  if (nav) {
    let last = 0;
    const hero = document.querySelector('.hero');
    // na home o menu só aparece depois da hero
    // no celular o menu fica sempre acessível (tem o botão de menu); no desktop aparece depois da hero
    const desk = matchMedia('(min-width: 981px)');
    if (hero && desk.matches) {
      nav.classList.add('is-hero');
      ScrollTrigger.create({ trigger: hero, start: 'bottom 85%', onEnter: () => nav.classList.remove('is-hero'), onLeaveBack: () => nav.classList.add('is-hero') });
    }
    // menu logo abaixo da barra de avisos enquanto ela está visível
    const ann = document.querySelector('.announce');
    const annH = ann ? ann.offsetHeight : 0;
    let annLast = -1;
    const annSet = y => { const v = Math.max(0, annH - y); if (v !== annLast) { annLast = v; document.documentElement.style.setProperty('--ann', v + 'px'); } };
    annSet(scrollY);
    ScrollTrigger.create({ onUpdate: s => { const y = s.scroll(); annSet(y); if (!document.body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > last && y > 400); last = y; } });

    /* ---------- Menu mobile ---------- */
    const burger = nav.querySelector('.js-burger');
    if (burger) {
      const links = [...nav.querySelectorAll('.nav__links a')];
      const back = nav.querySelector('.js-back');
      const wa = nav.querySelector('.js-wa');
      const arrowR = '<svg viewBox="0 0 14 14" fill="none"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" stroke-width="1.8"/></svg>';
      const m = document.createElement('div');
      m.className = 'mnav'; m.id = 'mnav'; m.setAttribute('aria-hidden', 'true');
      m.innerHTML = `<div class="mnav__panel">
        ${back ? `<a class="mnav__back" href="${back.getAttribute('href')}" data-back><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>Voltar para as fórmulas</a>` : ''}
        <nav class="mnav__links">${links.map((a, i) => `<a href="${a.getAttribute('href')}"><span class="mono">0${i + 1}</span>${a.textContent}${arrowR}</a>`).join('')}</nav>
        ${wa ? `<a class="btn btn--primary mnav__wa js-wa" href="${wa.href}" target="_blank" rel="noopener">Falar no WhatsApp ${arrowR}</a>` : ''}
      </div>`;
      document.body.appendChild(m);
      burger.setAttribute('aria-controls', 'mnav');
      const set = open => {
        document.body.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        m.setAttribute('aria-hidden', !open);
        if (open) nav.classList.remove('is-hidden');
        if (lenis) open ? lenis.stop() : lenis.start();
      };
      burger.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('a')) set(false); });
      addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
      desk.addEventListener('change', () => set(false));
      // o link do WhatsApp do menu acompanha o do topo (é preenchido depois pela página)
      burger.addEventListener('click', () => { const w = m.querySelector('.mnav__wa'); if (w && wa) w.href = wa.href; });
    }
    // "Voltar": volta para a página anterior do site quando houver; senão, para as fórmulas
    document.addEventListener('click', e => {
      const b = e.target.closest('.js-back,[data-back]'); if (!b) return;
      if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); }
    });
  }

  // Custom cursor
  const cur = document.querySelector('.cursor');
  if (cur && matchMedia('(hover:hover)').matches) {
    const xTo = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener('pointerover', e => cur.classList.toggle('is-hover', !!e.target.closest('a,button,input,[data-hover]')));
  }

  // Spotlight cards
  document.addEventListener('pointermove', e => {
    const c = e.target.closest('.spot');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--x', e.clientX - r.left + 'px');
    c.style.setProperty('--y', e.clientY - r.top + 'px');
  });

  // Tilt
  window.Caps.tilt = (root = document) => root.querySelectorAll('[data-tilt]').forEach(el => {
    if (reduce || el._tilt) return; el._tilt = 1;
    const rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 10); rx(-((e.clientY - r.top) / r.height - .5) * 10); });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });

  // Split text into lines (word-based, wrap-safe)
  window.Caps.split = el => {
    if (el._split) return el._split;
    const html = el.innerHTML;
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const words = [];
    const walk = (node, wrapTag) => node.childNodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(w => { if (w.trim()) words.push({ w, wrapTag }); });
      else if (n.nodeName === 'BR') words.push({ br: true });
      else walk(n, n.cloneNode(false));
    });
    walk(tmp);
    el.innerHTML = words.map(o => o.br ? '<br>' : `<span class="split-line" style="display:inline-block"><span>${o.wrapTag ? (o.wrapTag.innerHTML = o.w, o.wrapTag.outerHTML) : o.w}</span></span>`).join(' ');
    return (el._split = el.querySelectorAll('.split-line > span'));
  };

  // Generic reveals
  const initReveals = () => {
    if (reduce) { gsap.set('[data-reveal]', { opacity: 1, y: 0 }); return; }
    document.querySelectorAll('[data-split]').forEach(el => {
      const words = window.Caps.split(el);
      gsap.from(words, { yPercent: 110, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .08, overwrite: true }),
    });
  };
  window.Caps.initReveals = initReveals;

  // Accordion
  window.Caps.accordion = root => root.querySelectorAll('.acc__item').forEach(item => {
    const q = item.querySelector('.acc__q'), a = item.querySelector('.acc__a');
    q.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open);
      gsap.to(a, { height: open ? 'auto' : 0, duration: .6, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
    });
  });

  // Footer letters
  window.Caps.footer = () => {
    const f = document.querySelector('.footer');
    if (!f || reduce) return;
    gsap.from(f.querySelectorAll('.footer__brand, .footer__grid > div, .footer__badges span'), { y: 30, opacity: 0, stagger: .06, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 90%' } });
  };

  // Hover-scramble on mono labels
  window.Caps.scramble = (el) => {
    const orig = el.textContent, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let f = 0; clearInterval(el._sc);
    el._sc = setInterval(() => {
      el.textContent = [...orig].map((c, i) => i < f / 2 || c === ' ' ? c : chars[Math.random() * chars.length | 0]).join('');
      if (++f > orig.length * 2) { clearInterval(el._sc); el.textContent = orig; }
    }, 28);
  };
  document.addEventListener('pointerover', e => { const m = e.target.closest('[data-scramble]'); if (m && !m._busy) { m._busy = 1; window.Caps.scramble(m); setTimeout(() => m._busy = 0, 900); } });
  // Revela a página só com CSS + fontes prontos (evita "piscar" sem estilo)
  const ready = () => document.documentElement.classList.remove('is-loading');
  window.Caps.fontsReady = (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve())
    .then(() => new Promise(r => setTimeout(r, 0))).then(ready);
})();
