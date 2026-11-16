/* =========================================================
   Visual Lab · Home (animações)
   ========================================================= */
(() => {
  const { bottle, brl, waLink, productFor, photoFor, minPrice, maxDe, PROMO } = window.Caps;
  // estado lido pelo módulo 3D (scene3d.js)
  const S3 = window.Caps.S3 = {
    hero: { intro: 0, scroll: 0 },
    caps: { y: .64, rot: 35, scale: .82, spin: 0, tumble: 0, open: 0, out: 0, bottle: 0, fill: 0, capOn: 0 },
  };
  const P = window.PRODUCTS;
  const lite = document.documentElement.classList.contains('is-lite');
  const reduce = lite || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // no mobile a seção da cápsula some: "Como funciona" passa a levar para a seção do processo
  if (lite) { const cs = $('.caps-scroll'), pr = $('.process'); if (cs && pr) { cs.removeAttribute('id'); pr.id = 'processo'; } }
  const arrow = '<svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H4M13 1v9" stroke="currentColor" stroke-width="1.8"/></svg>';

  /* ---------- WhatsApp links ---------- */
  $$('.js-wa').forEach(a => a.href = waLink(PROMO.on ? 'Olá! Quero terceirizar a produção da minha marca de suplementos com a CapsBR e conhecer as condições da ' + PROMO.name + '.' : 'Olá! Quero terceirizar a produção da minha marca de suplementos com a CapsBR.'));

  /* ---------- Marquees ---------- */
  const names = P.map(p => p.titulo);
  const marq = (el, list) => { const html = list.map(n => `<span class="f-item">${n}<i class="sep"></i></span>`).join(''); el.innerHTML = html + html; };
  marq($('.js-marq-a'), names.slice(0, 8));
  marq($('.js-marq-b'), names.slice(8));

  /* ---------- Products ---------- */
  const grid = $('.js-grid');
  const cardsHTML = () => P.map(p => `
    <a class="spot pcard" href="produto.html?p=${p.slug}" data-tipo="${p.tipo}" data-hot="${p.maisPedido}">
      <div class="pcard__top"><span class="tag tag--code" data-scramble>${p.id}</span>${PROMO.on ? `<span class="pcard__off">-${p.desconto}%</span>` : ''}</div>
      ${p.maisPedido ? '<span class="pcard__hot">Mais pedido</span>' : ''}
      <div class="pcard__img pcard__img--photo">${photoFor(p)}</div>
      <div class="pcard__cat">${p.tipo} · ${p.categoria}</div>
      <h3>${p.titulo}</h3>
      <div class="pcard__size">${p.tamanho}</div>
      <div class="pcard__foot">
        <div class="pcard__price"><small>a partir de</small>${PROMO.on ? `<s>${brl(maxDe(p))}</s>` : ''}<b>${brl(minPrice(p))}<em> /un.</em></b></div>
        <span class="pcard__go">${arrow}</span>
      </div>
    </a>`).join('');
  grid.innerHTML = cardsHTML();

  const filters = [
    { k: 'all', l: 'Todas', n: P.length },
    { k: 'Cápsulas', l: 'Cápsulas', n: P.filter(p => p.tipo === 'Cápsulas').length },
    { k: 'Líquidos', l: 'Líquidos', n: P.filter(p => p.tipo === 'Líquidos').length },
    { k: 'Gomas e Pastilhas', l: 'Gomas & Pastilhas', n: P.filter(p => p.tipo === 'Gomas e Pastilhas').length },
    { k: 'Solúveis', l: 'Solúveis', n: P.filter(p => p.tipo === 'Solúveis').length },
    { k: 'hot', l: 'Mais pedidos', n: P.filter(p => p.maisPedido).length },
  ].filter(f => f.n > 0 || f.k === 'all');
  const fbox = $('.js-filters');
  fbox.innerHTML = filters.map((f, i) => `<button class="chip${i ? '' : ' is-active'}" data-k="${f.k}">${f.l}<sup>${f.n}</sup></button>`).join('');
  fbox.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', fbox).forEach(c => c.classList.toggle('is-active', c === b));
    const k = b.dataset.k;
    const cards = $$('.pcard', grid);
    gsap.to(cards, {
      opacity: 0, y: 20, scale: .97, duration: .25, stagger: .015, ease: 'power2.in', onComplete: () => {
        cards.forEach(c => c.classList.toggle('is-out', !(k === 'all' || c.dataset.tipo === k || (k === 'hot' && c.dataset.hot === 'true'))));
        const vis = cards.filter(c => !c.classList.contains('is-out'));
        gsap.fromTo(vis, { opacity: 0, y: 30, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .7, stagger: .04, ease: 'expo.out', onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  /* ---------- Brand builder ---------- */
  // o frasco 3D (scene3d.js) lê Caps.builder e escuta 'builder:change'
  const st = window.Caps.builder = { brand: 'SUA MARCA', theme: 'teal', k: 'caps' };
  const BK = ['caps', 'drop', 'goma', 'sol'];
  const LINE2 = { caps: '60 cápsulas', drop: '30 mL', goma: '90 gomas', sol: '200 g' };
  const bEls = { caps: $('.js-b-caps'), drop: $('.js-b-drop'), goma: $('.js-b-goma'), sol: $('.js-b-sol') };
  const emit = d => window.dispatchEvent(new CustomEvent('builder:change', { detail: d }));
  const renderB = () => {
    if (!document.documentElement.classList.contains('has-3d-builder')) {
      BK.forEach(k => { bEls[k].innerHTML = bottle({ kind: k, brand: st.brand || 'SUA MARCA', theme: st.theme, line1: 'Suplemento alimentar', line2: LINE2[k] }); });
    }
    $('.js-wa-brand').href = waLink(`Olá! Simulei minha marca "${st.brand || 'SUA MARCA'}" no site da CapsBR e quero conversar sobre produção.`);
  };
  renderB();
  // só o formato ativo aparece no fallback 2D (sem GSAP na carga, pra não "piscar")
  BK.forEach(n => { if (n !== st.k) Object.assign(bEls[n].style, { opacity: 0, width: 0, visibility: 'hidden' }); });
  const cnt = $('.js-count-b'), inp = $('#brand'), MAXB = +inp.maxLength || 16;
  const upCount = () => { cnt.textContent = `${inp.value.length}/${MAXB}`; cnt.classList.toggle('is-max', inp.value.length >= MAXB); };
  upCount();
  // celular: ao focar no nome, rola até o preview ficar visível acima do campo (teclado aberto)
  inp.addEventListener('focus', () => {
    if (!matchMedia('(max-width: 900px)').matches) return;
    setTimeout(() => {
      const stg = $('.builder__stage'); if (!stg) return;
      const y = stg.getBoundingClientRect().top + scrollY - 12;
      if (window.Caps.lenis) window.Caps.lenis.scrollTo(y, { duration: .6, force: true }); else scrollTo({ top: y, behavior: 'smooth' });
    }, 320);
  });
  inp.addEventListener('input', e => { st.brand = e.target.value.trim().slice(0, MAXB); upCount(); renderB(); emit({ brand: st.brand }); });
  // re-renderiza quando as fontes carregarem (medição de texto do rótulo)
  window.Caps.fontsReady.then(() => {
    renderB();
  });
  const flipB = $('.js-flip-b');
  if (flipB) flipB.addEventListener('click', () => { flipB.classList.toggle('is-back'); $('span', flipB).textContent = flipB.classList.contains('is-back') ? 'Ver frente' : 'Ver tabela'; emit({ flip: true }); });
  const seg = $('.js-seg'), pill = $('.seg__pill', seg);
  const movePill = b => { pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px'; };
  { const re = () => movePill($('.is-active', seg)); requestAnimationFrame(re); document.fonts && document.fonts.ready.then(re); new ResizeObserver(re).observe(seg); }
  seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', seg).forEach(x => x.classList.toggle('is-active', x === b)); movePill(b);
    const k = st.k = b.dataset.k;
    emit({ k });
    if (document.documentElement.classList.contains('has-3d-builder')) return;
    BK.forEach(n => { const on = n === k; gsap.to(bEls[n], { autoAlpha: on ? 1 : 0, xPercent: on ? 0 : 30, width: on ? 'auto' : 0, duration: .6, ease: 'expo.out' }); });
  });

  /* ---------- FAQ ---------- */
  const faq = [
    ['Qual é o pedido mínimo?', 'A partir de 300 unidades por fórmula. Quanto maior o volume, menor o valor por unidade. As faixas de 300, 500, 1.000 e 2.000 unidades aparecem na página de cada produto.'],
    ['O preço por unidade já inclui tudo?', 'Já inclui rótulo personalizado, teste de estabilidade e tabela nutricional em todo produto. A taxa de notificação na ANVISA e a impressão do rótulo entram à parte, e isso é confirmado com você na cotação final, sem surpresa.'],
    ['A CapsBR é uma fábrica?', 'Não. A CapsBR é especialista em terceirização: trabalhamos com uma rede de fábricas parceiras, todas regularizadas e com contrato formal com a gente — só fábricas dentro desse padrão entram no nosso catálogo. Ter vários fornecedores, em vez de depender de uma única fábrica própria, é o que nos permite oferecer uma variedade tão grande de fórmulas. Como operamos em escala com essas fábricas, conseguimos preços bem menores do que você conseguiria negociando direto com elas, e repassamos essa vantagem pro valor final do seu pedido. Na prática, você fala só com a CapsBR: a gente cuida de toda a gestão com as fábricas (escolha, prazo, controle de qualidade) pra você não precisar resolver nada disso sozinho.'],
    ['Quanto tempo demora para receber depois de fechar?', 'De 15 a 45 dias após a aprovação e a chegada do rótulo impresso. O prazo varia porque escolhemos o fornecedor mais indicado para cada pedido, e isso é repassado pra você de forma direta na cotação.'],
    ['Posso fechar mais de uma fórmula de uma vez?', 'Pode, e vale a pena: monte seu kit escolhendo 2 ou mais fórmulas e envie tudo numa única mensagem no WhatsApp, pra fechar de uma vez só.'],
    ['Como funciona para fechar o pedido?', 'Você escolhe a fórmula e o volume aqui no site, fala direto com a CapsBR no WhatsApp, recebe a cotação e o contrato, e assim que o rótulo é aprovado, sua marca entra em produção.'],
  ];
  if (PROMO.on) faq.push([`Até quando vale a condição de ${PROMO.name}?`, `Até ${PROMO.endDMY}, ou enquanto durar o volume reservado para a campanha, o que vier primeiro. Depois disso, os produtos voltam para o preço normal do catálogo.`]);
  const fx = $('.js-faq');
  fx.innerHTML = faq.map(([q, a]) => `<div class="acc__item" data-reveal><button class="acc__q" aria-expanded="false">${q}<span class="acc__ic"></span></button><div class="acc__a"><p>${a}</p></div></div>`).join('');
  window.Caps.accordion(fx);

  /* ---------- Countdown & CTA background ---------- */
  window.Caps.countdown($('.js-countdown'));
  const ctaBg = $('.js-cta-bg');
  ctaBg.innerHTML = [[8, 20, -30, 90], [82, 15, 40, 120], [15, 75, 70, 70], [88, 70, -20, 100], [50, 92, 10, 60]].map(([x, y, r, w]) =>
    `<div class="cap3d js-cap-img" data-variant="light" style="left:${x}%;top:${y}%;--w:${w * .4}px;--h:${w}px;transform:rotate(${r}deg)" data-speed="${(Math.random() * 2 - 1).toFixed(2)}"><div class="cap3d__half cap3d__half--top"></div><div class="cap3d__half cap3d__half--bot"></div></div>`).join('');

  /* ---------- Hero scroll ---------- */
  if (!reduce) {
    gsap.to(S3.hero, { scroll: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-cap', { rotation: 70, yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__in > div:first-child', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- Counters ---------- */
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2, ease: 'expo.out', onUpdate: () => el.textContent = Math.round(o.v).toLocaleString('pt-BR') }) });
  });

  /* =====================================================
     CAPSULE SCROLL: cápsula abre e o pó vira a sua marca
     ===================================================== */
  const capsScene = lite ? null : (() => {
    const sec = $('.caps-scroll'), pin = $('.caps-pin');
    const c = $('.caps-particles', pin), ctx = c.getContext('2d');
    const top = $('.caps-cap .cap3d__half--top'), bot = $('.caps-cap .cap3d__half--bot');
    const C = S3.caps;
    const bottleEl = $('.caps-bottle');
    bottleEl.innerHTML = bottle({ kind: 'caps', brand: 'SUA MARCA', theme: 'teal', line1: 'Suplemento alimentar', line2: '60 cápsulas' });
    window.Caps.fontsReady.then(() => { bottleEl.innerHTML = bottle({ kind: 'caps', brand: 'SUA MARCA', theme: 'teal', line1: 'Suplemento alimentar', line2: '60 cápsulas' }); });
    const steps = $$('.caps-step', pin);
    const nEl = $('.js-step-n');

    let W, H, dpr;
    // pontinhos pequenos não precisam de 2x: no celular 1.5x (fraco: 1x)
    const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
    const maxDpr = innerWidth < 700 ? (weak ? 1 : 1.5) : 2;
    const resize = () => {
      const w = pin.offsetWidth, h = pin.offsetHeight;
      // a barra de endereço do celular muda a altura ao rolar: não realoca o canvas por isso
      if (W === w && Math.abs(h - H) < 140) return;
      dpr = Math.min(maxDpr, devicePixelRatio || 1); W = w; H = h; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    };

    // Partículas determinísticas (scrub funciona pra frente e pra trás)
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const COLORS = ['#14483f', '#14483f', '#2c6b5f', '#9cc7b9', '#0e3631', '#efe6d6', '#d9ccb2'];
    const N = innerWidth < 700 ? (weak ? 90 : 130) : 260;
    const parts = Array.from({ length: N }, () => ({
      a: rnd() * Math.PI * 2, r: .25 + Math.pow(rnd(), .7) * .85, s: .4 + rnd() * 1.6,
      sz: .8 + rnd() * 2.8, col: COLORS[rnd() * COLORS.length | 0], jx: rnd() - .5, jy: rnd() - .5, w: rnd(),
    }));
    const k = { burst: 0, swirl: 0, gather: 0 };
    let drawn = false;
    const ease = t => 1 - Math.pow(1 - t, 3);

    // agrupa por cor (menos troca de estado no canvas)
    parts.sort((a, b) => a.col < b.col ? -1 : 1);
    const paint = () => {
      if (k.burst < .01) { if (drawn) { ctx.clearRect(0, 0, W, H); drawn = false; } return; }
      ctx.clearRect(0, 0, W, H); drawn = true;
      const mob = W < 700, cx = W / 2, cy = H * (C.y - (mob ? .13 : 0)), R = Math.min(W, H) * .5;
      const tx = cx, ty = mob ? H * .37 : H * .5 + Math.min(H * .2, 160);
      for (const p of parts) {
        const b = ease(Math.min(1, k.burst * (0.7 + p.w * .6)));
        const ang = p.a + k.swirl * (1.2 + p.s) + b * .4;
        const rad = R * p.r * b * (1 + .12 * Math.sin(k.swirl * 6 + p.a * 3));
        let x = cx + Math.cos(ang) * rad + p.jx * 30 * (1 - b);
        let y = cy + Math.sin(ang) * rad * .72 + p.jy * 20 * (1 - b) + k.swirl * 20 * p.s;
        const g = ease(Math.min(1, Math.max(0, k.gather * 1.4 - p.w * .4)));
        x += (tx + p.jx * 60 - x) * g; y += (ty + p.jy * 30 - y) * g;
        const alpha = Math.min(1, k.burst * 3) * (1 - g * .95);
        if (alpha <= .01) continue;
        ctx.globalAlpha = alpha; if (ctx.fillStyle !== p.col) ctx.fillStyle = p.col;
        const sz = p.sz * (1 - g * .5);
        ctx.beginPath(); ctx.arc(x, y, sz, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    // no máximo um desenho por quadro (antes eram dois: timeline + scroll)
    let raf = 0;
    const draw = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); };
    resize(); addEventListener('resize', resize);
    const bar = $('.caps-progress .bar i');
    const setStep = i => { nEl.textContent = String(i + 1).padStart(2, '0'); };
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 1,
        onUpdate: s => { if (bar) bar.style.transform = `scaleX(${s.progress})`; { const tt = s.progress * tl.duration(); setStep(tt < 2.6 ? 0 : tt < 4.8 ? 1 : tt < 7.3 ? 2 : 3); } draw(); },
      },
      onUpdate: draw,
    });
    gsap.set('.caps-cap', { rotation: 35, scale: .82, y: H * .14 });
    gsap.set(steps, { autoAlpha: 0, y: 40 });

    tl.to('.caps-intro', { autoAlpha: 0, y: -60, duration: 1 }, 0)
      .to('.caps-cap', { rotation: 0, scale: 1, y: 0, duration: 1.4 }, 0)
      .to(C, { y: .5, rot: 0, scale: 1, spin: .5, duration: 1.6 }, 0)
      .to(C, { open: 1, spin: 1, duration: 2, ease: 'power3.out' }, 1.6)
      .to(C, { tumble: .08, duration: 3 }, 3.6)
      .to(C, { out: 1, duration: 1.8, ease: 'power2.in' }, 6)
      .to(steps[0], { autoAlpha: 1, y: 0, duration: .7 }, .6)
      // abre
      .to(top, { y: -190, x: -20, rotation: -16, duration: 2, ease: 'power3.out' }, 1.6)
      .to(bot, { y: 190, x: 20, rotation: 12, duration: 2, ease: 'power3.out' }, 1.6)
      .to(k, { burst: 1, duration: 2.2, ease: 'none' }, 1.6)
      .to(steps[0], { autoAlpha: 0, y: -40, duration: .6 }, 2.2)
      .to(steps[1], { autoAlpha: 1, y: 0, duration: .7 }, 2.8)
      // gira o pó
      .to(k, { swirl: 1, duration: 3, ease: 'none' }, 3.6)
      .to('.caps-bgword', { scale: 1.15, duration: 6, ease: 'none' }, 1)
      .to(steps[1], { autoAlpha: 0, y: -40, duration: .6 }, 4.4)
      .to(steps[2], { autoAlpha: 1, y: 0, duration: .7 }, 5)
      // as metades saem
      .to(top, { y: -700, rotation: -50, autoAlpha: 0, duration: 1.8, ease: 'power2.in' }, 6)
      .to(bot, { y: 700, rotation: 40, autoAlpha: 0, duration: 1.8, ease: 'power2.in' }, 6)
      // o pó vira o pote
      .to(k, { gather: 1, duration: 2.4, ease: 'none' }, 6.4)
      .to(steps[2], { autoAlpha: 0, y: -40, duration: .6 }, 6.6)
      .to(bottleEl, { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: 'expo.out' }, 7.4)
      .to(C, { bottle: 1, duration: 1.8, ease: 'none' }, 7.2)
      .to(steps[3], { autoAlpha: 1, y: 0, duration: .7 }, 7.6)
      .to(C, { fill: 1, duration: 2.8, ease: 'none' }, 8.8)
      .to(C, { capOn: 1, duration: 1.2, ease: 'power2.out' }, 11.7)
      .to({}, { duration: 1 });
  })();

  /* ---------- Story timeline (linha do tempo desativada: aguardando marcos reais da CapsBR) ---------- */
  if ($$('.tl-item').length) {
    gsap.to('.timeline__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    $$('.tl-item').forEach(it => {
      ScrollTrigger.create({ trigger: it, start: 'top 62%', onToggle: s => it.classList.toggle('is-on', s.isActive || s.progress > 0), end: 'max' });
      gsap.from(it.children, { x: 40, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: it, start: 'top 80%' } });
    });
  }

  /* ---------- Background paths (process) ---------- */
  const g = $('.js-paths');
  let paths = '';
  for (let i = 0; i < 12; i++) {
    const y0 = 100 + i * 50, o = i * 16;
    paths += `<path d="M-100 ${y0} C 300 ${y0 - 260 + o}, 700 ${y0 + 320 - o}, 1540 ${y0 - 120 + o * .6}" stroke-opacity="${.05 + i * .02}"/>`;
  }
  g.innerHTML = paths;
  if (!reduce) {
    const ptl = gsap.timeline({ paused: true });
    $$('path', g).forEach((p, i) => {
      const L = p.getTotalLength();
      gsap.set(p, { strokeDasharray: `${L * .3} ${L}`, strokeDashoffset: L * 1.3 });
      ptl.to(p, { strokeDashoffset: 0, duration: 12 + i * .8, ease: 'none', repeat: -1 }, -i * .9);
    });
    ScrollTrigger.create({ trigger: g.closest('section') || g, start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? ptl.play() : ptl.pause() });
  }

  /* ---------- CTA capsule parallax ---------- */
  $$('.js-cta-bg .cap3d').forEach(el => gsap.to(el, { yPercent: -120 * el.dataset.speed, rotation: '+=' + 60 * el.dataset.speed, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } }));
  if ($('.countdown')) gsap.from('.countdown div', { y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.countdown', start: 'top 90%' } });

  /* ---------- Preloader → intro ---------- */
  const intro = () => {
    if (lite) { window.Caps.initReveals(); window.Caps.footer(); return; }
    const title = $('.hero-title');
    const words = window.Caps.split(title);
    const tl = gsap.timeline();
    tl.from(words, { yPercent: 115, rotate: 6, duration: 1.3, ease: 'expo.out', stagger: .06 })
      .from('.hero-anim', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }, '-=1')
      .from('.hero-cap', { scale: .3, rotation: -160, opacity: 0, duration: 1.8, ease: 'expo.out' }, '-=1.4')
      .to(S3.hero, { intro: 1, duration: 2.2, ease: 'expo.out' }, '<')
      .from('.hero__chip, .hero-line', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .15 }, '-=1');
    window.Caps.initReveals();
    window.Caps.footer();
  };

  if (reduce) { $('.loader').remove(); S3.hero.intro = 1; intro(); return; }
  if (window.Caps.lenis) window.Caps.lenis.stop();
  const lc = { v: 0 };
  gsap.timeline({ onComplete: () => { $('.loader').remove(); window.Caps.lenis && window.Caps.lenis.start(); } })
    .to(lc, { v: 100, duration: .45, ease: 'power2.inOut', onUpdate: () => $('.js-count').textContent = String(Math.round(lc.v)).padStart(3, '0') })
    .to('.loader__fill', { scaleX: 1, duration: .45, ease: 'power2.inOut' }, 0)
    .to('.loader__core', { scale: .9, opacity: 0, duration: .25, ease: 'power2.in' })
    .to('.loader__panel--t', { yPercent: -100, duration: .6, ease: 'expo.inOut' }, '-=.05')
    .to('.loader__panel--b', { yPercent: 100, duration: .6, ease: 'expo.inOut' }, '<')
    .add(intro, '-=.55');
})();
