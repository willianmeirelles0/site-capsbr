/* CapsBR · Página de produto (produto.html?p=slug) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { brl, waLink, productFor, photoFor, minPrice, priceAt, COSTS, nutriRows, bottleData } = window.Caps;
  const arteFor = v => v >= COSTS.arteMin ? 0 : COSTS.artePreco;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = window.PRODUCTS;
  const slug = new URLSearchParams(location.search).get('p');
  const p = P.find(x => x.slug === slug) || P[0];
  const isLiq = p.tipo === 'Líquidos';
  const arrow = '<svg viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H4M13 1v9" stroke="currentColor" stroke-width="1.8"/></svg>';
  const set = (sel, v, html) => $$(sel).forEach(el => html ? el.innerHTML = v : el.textContent = v);

  /* ---------- Conteúdo ---------- */
  document.title = `${p.titulo} · CapsBR`;
  const vols = Object.keys(p.volumes).map(Number).sort((a, b) => a - b);
  set('.js-crumb', p.titulo);
  set('.js-code', p.id); set('.js-code2', p.id);
  set('.js-cat', `${p.tipo} · ${p.categoria}`);
  $('.js-hot').hidden = !p.maisPedido;
  set('.js-title', p.titulo);
  set('.js-nome', p.nome !== p.titulo ? p.nome : '');
  set('.js-desc', p.descricao);
  set('.js-size', p.tamanho);
  set('.js-word', `${p.categoria} · `.repeat(6));
  set('.js-porcao', p.porcao); set('.js-porcoes', p.porcoes);
  $('.js-bens').innerHTML = p.beneficios.map(b => `<li data-reveal><i><svg viewBox="0 0 12 12" fill="none"><path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></i>${b}</li>`).join('');

  // foto recortada do produto, sem fundo (PNG com transparência)
  const CUT_BY_TIPO = {
    'Líquidos': { src: 'liquidos-recorte.png', w: 520, h: 820 },
    'Gomas e Pastilhas': { src: 'gomas-recorte.png', w: 502, h: 820 },
    'Solúveis': { src: 'soluveis-recorte.png', w: 544, h: 820 },
  };
  const cut = CUT_BY_TIPO[p.tipo] || { src: 'capsulas-recorte.png', w: 514, h: 820 };
  const photo = $('.js-photo'); if (photo) photo.innerHTML = `<img src="assets/img/${cut.src}" alt="${p.titulo}, ${isLiq ? 'frasco conta-gotas' : 'pote'} com a sua marca" width="${cut.w}" height="${cut.h}" fetchpriority="high" decoding="async">`;
  if (isLiq && photo) photo.classList.add('is-liq');

  const msgBase = `Olá! Vim pelo site da CapsBR e tenho interesse na fórmula ${p.titulo} (${p.id}) com a minha marca.`;
  $$('.js-wa').forEach(a => a.href = waLink('Olá! Quero terceirizar a produção da minha marca de suplementos com a CapsBR.'));
  $$('.js-wa-prod').forEach(a => a.href = waLink(msgBase));

  /* ---------- Tabela nutricional (sem linhas zeradas) ---------- */
  const rows = nutriRows(p);
  // frasco 3D do hero (scene3d.js)
  window.Caps.product = { kind: isLiq ? 'drop' : 'caps', line1: p.titulo.length > 22 ? p.categoria : p.titulo, line2: p.tamanho, code: p.id, rows, porcao: p.porcao, porcoes: p.porcoes };
  const FAC_KIND = { 'Líquidos': 'líquidos', 'Gomas e Pastilhas': 'gomas e pastilhas', 'Solúveis': 'pós solúveis' };
  set('.js-fac-kind', FAC_KIND[p.tipo] || 'cápsulas');
  set('.js-nt-title', p.titulo);
  set('.js-nt-porcoes', p.porcoes); set('.js-nt-porcao', p.porcao);
  $('.js-nt-rows').innerHTML = rows.map(r => {
    const num = parseFloat(String(r.vd).replace(',', '.'));
    const na = isNaN(num);
    const w = na ? 100 : Math.min(num, 100);
    return `<div class="nt__row${na ? ' is-na' : ''}${num > 100 ? ' is-over' : ''}">
      <span class="nt__name">${r.name}</span>
      <span class="nt__val">${r.v}<small>${r.unit}</small></span>
      <span class="nt__vd">${na ? '**' : r.vd + '%'}</span>
      <span class="nt__bar"><i style="--w:${w}%"></i></span>
    </div>`;
  }).join('');

  /* ---------- Preço por volume (seletor + composição do investimento) ---------- */
  const ROT = isLiq ? COSTS.rotuloLiq : COSTS.rotuloCaps, LOTE = Math.max(1, COSTS.rotuloLote | 0), ANV = COSTS.anvisa;
  // faixas fixas 300 / 500 / 1.000 + Personalizado (acima de 1.000, valores a consultar)
  const std = vols.filter(v => v <= 1000);
  let vol = std[0], custom = false, customQ = 2000;
  $('.js-qty').innerHTML = std.map((v, i) => `<button class="pd-qty__b${i ? '' : ' is-active'}" data-v="${v}"><b>${v.toLocaleString('pt-BR')}</b><span>${brl(priceAt(p, v))}</span></button>`).join('')
    + '<button class="pd-qty__b pd-qty__b--custom" data-v="custom"><b>Personalizado</b><span>acima de 1.000</span></button>';
  $('.js-qty').insertAdjacentHTML('afterend', `<div class="pd-qty__custom js-qcustom" hidden><label for="qcustom">Quantas unidades?</label><div class="pd-qty__in"><button type="button" data-d="-100" aria-label="Menos 100">−</button><input id="qcustom" type="number" inputmode="numeric" min="1001" step="100" value="${customQ}"><span>un.</span><button type="button" data-d="100" aria-label="Mais 100">+</button></div><small>Acima de 1.000 unidades o valor é calculado sob medida.</small></div>`);
  const qBox = $('.js-qcustom'), qIn = $('#qcustom');
  const tween = (el, to) => {
    if (!el || el._n === to) return;
    if (el._tw) el._tw.kill();
    if (reduce || el._n == null) { el._n = el._cur = to; el.textContent = brl(to); return; }
    const o = { n: el._cur };
    el._n = to;
    el._tw = gsap.to(o, { n: to, duration: .45, ease: 'power3.out', onUpdate: () => { el._cur = o.n; el.textContent = brl(o.n); } });
  };
  const say = (el, txt) => { if (!el) return; if (el._tw) el._tw.kill(); el._n = null; el.textContent = txt; };
  const fix = (el, v) => { if (!el) return; if (el._tw) el._tw.kill(); el._n = el._cur = v; el.textContent = brl(v); };
  const ctaTxt = $('.js-wa-calc .wa-cta__txt b'), ctaSub = $('.js-wa-calc .wa-cta__txt small');
  const nf = n => n.toLocaleString('pt-BR');
  const msg = lines => waLink(`Olá! Vim pelo site da CapsBR e quero fabricar com a minha marca.\n\n${lines.join('\n')}\n\nPodem me enviar o orçamento?`);
  const update = (first) => {
    $$('.pd-qty__b').forEach(b => b.classList.toggle('is-active', custom ? b.dataset.v === 'custom' : +b.dataset.v === vol));
    $('.pd-buy').classList.toggle('is-custom', custom);
    qBox.hidden = !custom;
    if (custom) {
      const q = Math.max(1001, Math.round(+qIn.value || 0));
      say($('.js-por'), 'A consultar');
      say($('.js-lot'), 'A consultar');
      $('.js-lot-q').textContent = `${q.toLocaleString('pt-BR')} un. · valores a consultar`;
      $('.js-c-rot-l').textContent = `(${q.toLocaleString('pt-BR')} un.)`;
      say($('.js-c-rot'), 'A consultar');
      say($('.js-arte'), 'Cortesia');
      say($('.js-c-total'), 'Valores a consultar');
      $$('.js-wa-calc').forEach(a => a.href = msg([`*Produto:* ${p.titulo} (${p.id})`, `*Quantidade:* ${nf(q)} unidades`, `*Embalagem:* ${p.tamanho}`, '*Valores:* a consultar (acima de 1.000 un.)', '*Arte do rótulo:* Cortesia']));
      if (ctaTxt) ctaTxt.textContent = `Quero ${nf(q)} unidades`;
    } else {
      const de = p.volumes[vol][0], por = priceAt(p, vol);
      const packs = Math.ceil(vol / LOTE);
      const arte = arteFor(vol);
      const sub = vol * por, rot = packs * ROT, total = sub + rot + ANV + arte, eco = vol * (de - por);
      tween($('.js-por'), por);
      if ($('.js-de')) $('.js-de').textContent = brl(de);
      if ($('.js-off2')) $('.js-off2').textContent = `-${Math.round((1 - por / de) * 100)}%`;
      fix($('.js-lot'), sub);
      $('.js-lot-q').textContent = '';
      $('.js-c-rot-l').textContent = `(${(packs * LOTE).toLocaleString('pt-BR')} un.)`;
      fix($('.js-c-rot'), rot);
      say($('.js-arte'), arte ? brl(arte) : 'Cortesia');
      tween($('.js-c-total'), total);
      fix($('.js-c-eco'), eco);
      $$('.js-wa-calc').forEach(a => a.href = msg([
        `*Produto:* ${p.titulo} (${p.id})`,
        `*Quantidade:* ${nf(vol)} unidades`,
        `*Embalagem:* ${p.tamanho}`,
        `*Preço:* ${brl(por)}/un.`,
        `*Lote:* ${brl(sub)} + rótulos ${brl(rot)} + ANVISA ${brl(ANV)}${arte ? ` + arte do rótulo ${brl(arte)}` : ''}`,
        `*Arte do rótulo:* ${arte ? brl(arte) : 'Cortesia'}`,
        `*Total estimado:* ${brl(total)} (sem frete)`,
      ]));
      if (ctaTxt) ctaTxt.textContent = `Quero ${nf(vol)} unidades`;
    }
    if (ctaSub) ctaSub.textContent = 'Abre o WhatsApp com esta quantidade e cotação';
  };
  $('.js-qty').addEventListener('click', e => {
    const b = e.target.closest('.pd-qty__b'); if (!b) return;
    if (b.dataset.v === 'custom') { custom = true; update(); if (!reduce) gsap.fromTo(qBox, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .5, ease: 'expo.out' }); qIn.focus({ preventScroll: true }); qIn.select(); }
    else { custom = false; vol = +b.dataset.v; update(); }
  });
  qIn.addEventListener('input', () => update(true));
  qIn.addEventListener('change', () => { qIn.value = Math.max(1001, Math.round(+qIn.value || 1001)); update(true); });
  qBox.addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; qIn.value = Math.max(1001, (Math.round(+qIn.value) || 1000) + +b.dataset.d); update(true); });
  update(true);

  /* ---------- Relacionados ---------- */
  const rel = P.filter(x => x !== p).sort((a, b) => (b.tipo === p.tipo) - (a.tipo === p.tipo) || (b.categoria === p.categoria) - (a.categoria === p.categoria) || b.maisPedido - a.maisPedido).slice(0, 4);
  $('.js-rel').innerHTML = rel.map(x => `
    <a class="spot pcard" href="produto.html?p=${x.slug}" data-reveal>
      <div class="pcard__top"><span class="tag tag--code" data-scramble>${x.id}</span></div>
      ${x.maisPedido ? '<span class="pcard__hot">Mais pedido</span>' : ''}
      <div class="pcard__img pcard__img--photo">${photoFor(x)}</div>
      <div class="pcard__cat">${x.tipo} · ${x.categoria}</div>
      <h3>${x.titulo}</h3>
      <div class="pcard__size">${x.tamanho}</div>
      <div class="pcard__foot">
        <div class="pcard__price"><small>a partir de</small><b>${brl(minPrice(x))}<em> /un.</em></b></div>
        <span class="pcard__go">${arrow}</span>
      </div>
    </a>`).join('');

  /* ---------- CTA ---------- */
  $('.js-cta-bg').innerHTML = [[8, 20, -30, 90], [82, 15, 40, 120], [15, 75, 70, 70], [88, 70, -20, 100]].map(([x, y, r, w], i) =>
    `<div class="cap3d js-cap-img" data-variant="light" style="left:${x}%;top:${y}%;--w:${w * .4}px;--h:${w}px;transform:rotate(${r}deg)" data-speed="${[.8, -.6, .5, -.9][i]}"><div class="cap3d__half cap3d__half--top"></div><div class="cap3d__half cap3d__half--bot"></div></div>`).join('');
  window.Caps.footer();

  /* ---------- Animações gerais ---------- */
  window.Caps.initReveals();
  if (!reduce) {
    // intro do hero
    const title = $('.js-title');
    const words = window.Caps.split(title);
    gsap.timeline({ delay: .1 })
      .from('.pd-stage__panel', { clipPath: 'inset(50% 50% 50% 50% round 48px)', duration: 1.4, ease: 'expo.inOut' })
      .from('.js-photo', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out' }, '-=.6')
      .from('.pd-stage__rings i', { scale: .3, opacity: 0, stagger: .1, duration: 1.2, ease: 'expo.out' }, '<')
      .from('.stage-ui', { y: 20, opacity: 0, duration: .9, ease: 'expo.out' }, '-=.8')
      .from('.pd-chip', { y: 30, opacity: 0, stagger: .1, duration: .9, ease: 'expo.out' }, '-=.8')
      .from('.pd-crumb, .pd-tags', { y: 20, opacity: 0, stagger: .08, duration: .8, ease: 'expo.out' }, .5)
      .from(words, { yPercent: 110, rotate: 4, stagger: .05, duration: 1.1, ease: 'expo.out' }, .6)
      .from('.pd-comp, .pd-info .lead, .pd-buy, .pd-ctas', { y: 30, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out' }, .9);

    gsap.to('.pd-stage__word', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });

    // saída do hero com scroll
    if (matchMedia('(min-width: 1001px)').matches) gsap.to('.pd-stage__panel', { scale: .94, ease: 'none', scrollTrigger: { trigger: '.pd-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.pd-inc__list li', { y: 16, opacity: 0, stagger: .06, duration: .7, ease: 'expo.out', scrollTrigger: { trigger: '.pd-inc', start: 'top 88%' } });

    // tabela: barras
    gsap.from('.nt__row', { x: -30, opacity: 0, stagger: .05, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.nt', start: 'top 80%' } });
    gsap.from('.nt__bar i', { scaleX: 0, stagger: .05, duration: 1.4, ease: 'expo.out', delay: .2, scrollTrigger: { trigger: '.nt', start: 'top 80%' } });

    // cta
    $$('.js-cta-bg .cap3d').forEach(el => gsap.to(el, { yPercent: -120 * el.dataset.speed, rotation: '+=' + 60 * el.dataset.speed, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } }));
    if ($('.countdown')) gsap.from('.countdown div', { y: 40, opacity: 0, stagger: .08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.countdown', start: 'top 90%' } });
  }
  addEventListener('load', () => ScrollTrigger.refresh());
})();
