/* =========================================================
   CapsBR · Catálogo para leads (link responsivo + PDF A4)
   Usa os mesmos dados do site: window.PRODUCTS e window.SITE
   (vindos de /api/catalog, editáveis no painel /admin).
   Parâmetros de URL:
     ?para=Nome        personaliza (capa + animação de boas-vindas)
     &linha=capsulas|liquidos   só uma linha
     &precos=0         esconde os preços
     &editar=1         mostra a barra de opções (uso interno)
     &intro=0          pula a animação
     &print=1          abre a impressão sozinho
   ========================================================= */
(() => {
  const SITE = window.SITE || {};
  const ALL = (window.PRODUCTS || []).filter(p => p && p.ativo !== false && p.volumes && Object.keys(p.volumes).length);
  const WA = String(SITE.whatsapp || '5554997090147').replace(/\D/g, '') || '5554997090147';
  const COSTS = Object.assign({
    rotulo: {
      'Cápsulas': { 500: 650, 1000: 750 },
      'Líquidos': { 500: 600, 1000: 650 },
      'Gomas e Pastilhas': { 500: 650, 1000: 750 },
      'Solúveis': { 500: 790, 1000: 950 },
    },
    anvisa: 300,
    arteMin: 300,
    artePreco: 150,
  }, SITE.costs || {});
  const ORDER = ['Cápsulas', 'Líquidos', 'Gomas e Pastilhas', 'Solúveis'];
  const LINHAS = [
    { v: 'todas', l: 'Todas' }, { v: 'capsulas', l: 'Cápsulas' }, { v: 'liquidos', l: 'Líquidos' },
    { v: 'gomas', l: 'Gomas' }, { v: 'soluveis', l: 'Solúveis' },
  ];
  const TIPO_BY_LINHA = { capsulas: 'Cápsulas', liquidos: 'Líquidos', gomas: 'Gomas e Pastilhas', soluveis: 'Solúveis' };
  const LINHA_BY_TIPO = { 'Cápsulas': 'capsulas', 'Líquidos': 'liquidos', 'Gomas e Pastilhas': 'gomas', 'Solúveis': 'soluveis' };
  // A Black Friday roda num site à parte; este catálogo nunca mostra promoção.
  const PROMO = { on: false };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const nf = n => (+n).toLocaleString('pt-BR');
  const pad = n => String(n).padStart(2, '0');
  const vols = p => Object.keys(p.volumes).map(Number).sort((a, b) => a - b);
  const priceAt = (p, v) => { const [de, por] = p.volumes[v]; return PROMO.on ? por : de; };
  const minPrice = p => Math.min(...vols(p).map(v => priceAt(p, v)));
  const phone = (() => { const d = WA.replace(/^55/, ''); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : '+' + WA; })();
  const wa = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  const today = new Date();
  const edition = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });

  // tabela nutricional: separa unidade e tira linhas zeradas (igual ao site)
  const parseRow = ([n, v, vd]) => { const m = String(n).match(/^(.*?)\s*\(([^)]+)\)\s*$/); return { name: m ? m[1] : n, unit: m ? m[2] : '', v, vd }; };
  const isZero = v => /^0+([.,]0+)?$/.test(String(v).trim());
  const nutriRows = p => (p.tabela || []).map(parseRow).filter(r => !isZero(r.v));

  const IMG = {
    'Cápsulas': { src: 'assets/img/capsulas-recorte.png', cls: 'i-caps', alt: 'pote de cápsulas' },
    'Líquidos': { src: 'assets/img/liquidos-recorte.png', cls: 'i-liq', alt: 'frasco conta-gotas' },
    'Gomas e Pastilhas': { src: 'assets/img/gomas-recorte.png', cls: 'i-gom', alt: 'pote de gomas' },
    'Solúveis': { src: 'assets/img/soluveis-recorte.png', cls: 'i-sol', alt: 'pote de pó solúvel' },
  };
  const imgFor = tipo => IMG[tipo] || IMG['Cápsulas'];
  const ARROW = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h11M8 2.5L12.5 7 8 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const WAIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z"/></svg>';
  const DL = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v8M3.5 6.5L7 10l3.5-3.5M2 12.5h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ícones de traço, 24px, com um preenchimento suave (class d) para dar profundidade
  const sv = (body, vb = 24) => `<svg class="ic" viewBox="0 0 ${vb} ${vb}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const IC = {
    label: sv('<path class="d" d="M7 11.5h10v6H7z"/><path d="M9.5 2.5h5M10 2.5v3.2L7.6 8.4A2.4 2.4 0 0 0 7 10v9a2.5 2.5 0 0 0 2.5 2.5h5A2.5 2.5 0 0 0 17 19v-9a2.4 2.4 0 0 0-.6-1.6L14 5.7V2.5"/><path d="M7 11.5h10M7 17.5h10"/>'),
    flask: sv('<path class="d" d="M7.3 14.5h9.4l2.1 3.8a1.9 1.9 0 0 1-1.7 2.7H6.9a1.9 1.9 0 0 1-1.7-2.7z"/><path d="M9 2.5h6M10 2.5v6L5.2 17.6a2.4 2.4 0 0 0 2.1 3.4h9.4a2.4 2.4 0 0 0 2.1-3.4L14 8.5v-6"/><path d="M7.3 14.5h9.4"/>'),
    table: sv('<rect class="d" x="5" y="3" width="14" height="5" rx="1"/><rect x="5" y="3" width="14" height="18" rx="2.2"/><path d="M5 8h14M8.5 12h7M8.5 15h7M8.5 18h4"/>'),
    shield: sv('<path class="d" d="M12 21.5s7.5-3.6 7.5-9.5V5.2L12 2.5 4.5 5.2V12c0 5.9 7.5 9.5 7.5 9.5z"/><path d="M12 21.5s7.5-3.6 7.5-9.5V5.2L12 2.5 4.5 5.2V12c0 5.9 7.5 9.5 7.5 9.5z"/><path d="M8.8 11.8l2.2 2.2 4.2-4.3"/>'),
    doc: sv('<rect class="d" x="8.5" y="2.5" width="7" height="3.5" rx="1"/><path d="M15.5 4.2h1.8A1.8 1.8 0 0 1 19 6v13.7a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 19.7V6a1.8 1.8 0 0 1 1.8-1.8h1.7"/><rect x="8.5" y="2.5" width="7" height="3.5" rx="1"/><path d="M9 13.5l2 2 4-4.2"/>'),
    pick: sv('<g transform="rotate(-35 24 24)"><rect class="d" x="24" y="17" width="13" height="14" rx="0"/><path class="d" d="M37 17a7 7 0 0 1 0 14z"/><rect x="11" y="17" width="33" height="14" rx="7"/><path d="M24 17v14"/></g>', 48),
    chat: sv('<path class="d" d="M8 11a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H22l-8 7v-7a6 6 0 0 1-6-6z"/><path d="M8 11a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H22l-8 7v-7a6 6 0 0 1-6-6z"/><path d="M17 17h.01M24 17h.01M31 17h.01" stroke-width="3"/>', 48),
    sign: sv('<path class="d" d="M12 5h17l8 8v19H12z"/><path d="M29 5H14a2 2 0 0 0-2 2v34a2 2 0 0 0 2 2h21a2 2 0 0 0 2-2V13z"/><path d="M29 5v8h8M18 21h12M18 27h8"/><path d="M18 36c2-3 3.5-3 4.5-.5s2.5 2.5 4-0.5 2.5-1.5 3.5 0"/>', 48),
    box: sv('<path class="d" d="M24 6l16 8-16 8-16-8z"/><path d="M24 6l16 8v20l-16 8-16-8V14z"/><path d="M8 14l16 8 16-8M24 22v20M16 10l16 8v6"/>', 48),
  };

  /* ---------- Estado (vem da URL, ou de uma proposta pré-selecionada) ---------- */
  // proposta.html define window.__CAPSBR_PROPOSTA__ antes de carregar este
  // script; nunca existe em catalogo.html, então o link normal do catálogo
  // não muda em nada.
  const PROPOSTA = window.__CAPSBR_PROPOSTA__ || null;
  const qs = new URLSearchParams(location.search);
  const state = {
    para: (PROPOSTA ? (PROPOSTA.cliente || '') : (qs.get('para') || '')).trim().slice(0, 40),
    linha: ['capsulas', 'liquidos', 'gomas', 'soluveis'].includes(qs.get('linha')) ? qs.get('linha') : 'todas',
    precos: PROPOSTA ? PROPOSTA.mostrarPrecos !== false : qs.get('precos') !== '0',
  };
  const EDIT = qs.get('editar') === '1';
  const PRINT = qs.get('print') === '1';
  const firstName = s => s.split(/\s+/)[0];

  /* ---------- Blocos ---------- */
  const head = (label) => `<div class="ph"><span class="ph__logo" role="img" aria-label="CapsBR"></span><span class="ph__r">${label}</span></div>`;
  const foot = () => `<div class="pf"><span><b>CapsBR Nutracêuticos</b><i></i>WhatsApp ${phone}<i></i>contato@capsbr.com.br</span><span class="pf__n" data-pn></span></div>`;
  const comp = p => (p.nome && p.nome.trim().toLowerCase() !== String(p.titulo).trim().toLowerCase()) ? p.nome : '';
  const waBtn = (href, label, cls = '') => `<a class="wbtn ${cls}" href="${href}" target="_blank" rel="noopener"><span class="wbtn__ic">${WAIC}</span><span>${label}</span><span class="wbtn__ar">${ARROW}</span></a>`;

  const SHORT = { 'Cápsulas': 'cápsulas', 'Líquidos': 'líquidos', 'Gomas e Pastilhas': 'gomas', 'Solúveis': 'solúveis' };
  const cover = (list) => {
    const minVol = Math.min(...list.flatMap(vols));
    const linhaLabel = LINHAS.find(l => l.v === state.linha)?.l;
    const title = state.linha === 'todas' ? 'Catálogo de <span class="accent">fórmulas.</span>' : `Linha<br><span class="accent">${esc(linhaLabel)}.</span>`;
    const solo = ['gomas', 'soluveis'].includes(state.linha) ? TIPO_BY_LINHA[state.linha] : null;
    const showCaps = !solo && state.linha !== 'liquidos', showLiq = !solo && state.linha !== 'capsulas';
    const counts = {}; list.forEach(p => counts[p.tipo] = (counts[p.tipo] || 0) + 1);
    const breakdown = Object.keys(counts).length > 1 ? '<br>' + ORDER.filter(t => counts[t]).map(t => `${counts[t]} ${SHORT[t]}`).join(' · ') : '';
    return `<section class="page page--dark cover" aria-label="Capa">
      <div class="dk-grid"></div><div class="dk-glow"></div>
      <div class="cover__top"><span class="dk-logo" role="img" aria-label="CapsBR"></span><div class="cover__ed">Catálogo ${today.getFullYear()}<br>Edição ${esc(edition)}</div></div>
      <div class="cover__body">
        <div class="cover__tags"><span class="tag"><span class="dot"></span>Marca própria de suplementos</span></div>
        <h1 class="display">${title}</h1>
        <p class="lead">Fórmulas prontas, validadas e com teste de estabilidade. Você escolhe, a gente cuida da produção com o rótulo da sua marca e entrega pronto pra vender.</p>
        ${state.para ? `<div class="cover__for"><span>Preparado para</span><b>${esc(state.para)}</b></div>` : ''}
      </div>
      <div class="cover__art${solo || !(showCaps && showLiq) ? ' is-solo' : ''}" aria-hidden="true">
        <div class="cover__disc"></div>
        ${solo ? `<img class="${imgFor(solo).cls}" src="${imgFor(solo).src}" alt="">` : `${showCaps ? `<img class="i-caps" src="${IMG['Cápsulas'].src}" alt="">` : ''}${showLiq ? `<img class="i-liq" src="${IMG['Líquidos'].src}" alt="">` : ''}`}
      </div>
      <div class="cover__stats">
        <div><b>${list.length}</b><span>fórmulas prontas${breakdown}</span></div>
        <div><b>${nf(minVol)}<em>+</em></b><span>unidades de<br>pedido mínimo</span></div>
        <div><b>15–45<em>d</em></b><span>prazo de produção<br>após o rótulo</span></div>
        <div><b>100<em>%</em></b><span>com teste de<br>estabilidade</span></div>
      </div>
    </section>`;
  };

  const about = () => `<section class="page" aria-label="Como funciona">
    ${head('Quem somos · <b>Como funciona</b>')}
    <div class="about__head">
      <div>
        <div class="eyebrow"><span class="num">01</span><span class="line"></span><span class="mono">Sobre a CapsBR</span></div>
        <h2 class="display h2">Sua linha de suplementos, <span class="accent">sem montar uma fábrica.</span></h2>
      </div>
      <p class="lead">A CapsBR Nutracêuticos coloca no mercado cápsulas e líquidos com a marca de quem quer empreender no mundo dos suplementos. Do pó da fórmula ao lote aprovado, cuidamos de cada etapa da produção, com controle de qualidade em todo frasco.</p>
    </div>
    <div class="sec-label"><span class="mono">Incluso em todo pedido</span></div>
    <div class="inc">
      <div class="inc__it"><span class="inc__ic">${IC.label}</span><b>Rótulo personalizado</b><span>Arte com a identidade da sua marca.</span></div>
      <div class="inc__it"><span class="inc__ic">${IC.flask}</span><b>Teste de estabilidade</b><span>Qualidade garantida até o fim da validade.</span></div>
      <div class="inc__it"><span class="inc__ic">${IC.table}</span><b>Tabela nutricional</b><span>Validada e pronta para o rótulo.</span></div>
      <div class="inc__it"><span class="inc__ic">${IC.shield}</span><b>Notificação ANVISA</b><span>Conduzida no mesmo fluxo do pedido.</span></div>
    </div>
    <div class="sec-label"><span class="mono">Quatro passos · zero burocracia</span></div>
    <div class="steps">
      <div class="step"><div class="step__top"><span class="step__ic">${IC.pick}</span><span class="step__n">01</span></div><h4>Escolha</h4><p>Selecione as fórmulas deste catálogo e o volume de cada uma.</p></div>
      <div class="step"><div class="step__top"><span class="step__ic">${IC.chat}</span><span class="step__n">02</span></div><h4>Converse</h4><p>Chame a CapsBR no WhatsApp e receba a cotação completa.</p></div>
      <div class="step"><div class="step__top"><span class="step__ic">${IC.sign}</span><span class="step__n">03</span></div><h4>Aprove</h4><p>Assine o contrato e aprove a arte do seu rótulo.</p></div>
      <div class="step"><div class="step__top"><span class="step__ic">${IC.box}</span><span class="step__n">04</span></div><h4>Produza</h4><p>Sua marca entra em produção e chega em 15 a 45 dias.</p></div>
    </div>
    <div class="facts">
      <div><h3>Fábrica própria, cada etapa à vista.</h3></div>
      <div><b>300+</b><span>unidades por fórmula para começar</span></div>
      <div><b>15–45d</b><span>após a chegada do rótulo impresso</span></div>
      <div><b>1 conversa</b><span>cotação, contrato e rótulo pelo WhatsApp</span></div>
    </div>
    ${foot()}
  </section>`;

  const linhaBar = () => `<div class="lnf" role="group" aria-label="Filtrar por linha">
    ${LINHAS.map(l => `<button type="button" class="lnf__b${state.linha === l.v ? ' is-on' : ''}" data-linha="${l.v}" aria-pressed="${state.linha === l.v}">${esc(l.l)}</button>`).join('')}
  </div>`;

  const index = (groups) => `<section class="page" aria-label="Índice">
    ${head('Índice · <b>Fórmulas</b>')}
    <div class="eyebrow"><span class="num">02</span><span class="line"></span><span class="mono">Índice</span></div>
    <h2 class="display h2">Escolha a fórmula.<br>A marca é <span class="accent">sua.</span></h2>
    <p class="lead toc__lead">Filtre por linha e veja a lista completa de fórmulas logo a seguir.</p>
    ${linhaBar()}
    <div class="toc__sum">${groups.map(g => `<div class="toc__sumit"><b>${pad(g.items.length)}</b><span>${g.label}</span></div>`).join('')}</div>
    ${foot()}
  </section>`;

  const DV_COPY = {
    'Cápsulas': { lead: 'Cápsulas dosadas, encapsuladas e envasadas com controle em cada etapa. Disponível em frascos de 30, 60 ou 90 cápsulas.', tag: 'Frasco de 30 a 90 cápsulas' },
    'Líquidos': { lead: 'Frasco com conta-gotas de 30 mL, cheio e lacrado com controle em cada etapa. Absorção rápida e dose fácil de ajustar.', tag: 'Conta-gotas 30 mL' },
    'Gomas e Pastilhas': { lead: 'Gomas e pastilhas mastigáveis, dosadas e envasadas com controle em cada etapa. Praticidade e sabor no dia a dia.', tag: 'Pote de gomas' },
    'Solúveis': { lead: 'Pó solúvel dosado e envasado com controle em cada etapa. Dilui fácil em água ou na bebida de preferência.', tag: 'Pote de pó solúvel' },
  };
  const divider = (g, n, total) => {
    const liq = g.label === 'Líquidos';
    const copy = DV_COPY[g.label];
    return `<section class="page page--dark dv" aria-label="Linha ${g.label}">
      <div class="dk-glow dv__glow"></div>
      <div class="dv__top"><span class="dk-logo" role="img" aria-label="CapsBR"></span><span class="dv__n">Linha ${pad(n)} <em>/ ${pad(total)}</em></span></div>
      <div class="dv__hero">
        <div class="dv__txt">
          <span class="dv__num">${pad(n)}</span>
          <h2 class="display">${g.label}</h2>
          <p class="lead">${copy.lead}</p>
          <div class="dv__tags"><span class="tag"><span class="dot"></span>${copy.tag}</span><span class="tag">${pad(g.items.length)} fórmulas</span></div>
        </div>
        <div class="dv__art${liq ? ' is-liq' : ''}" aria-hidden="true"><div class="dv__disc"></div><img class="${imgFor(g.label).cls}" src="${imgFor(g.label).src}" alt=""></div>
      </div>
      <div class="dv__list">
        <span class="mono">Nesta linha</span>
        <div>${g.items.map(p => `<a href="#${esc(p.id)}"><em>${esc(p.id)}</em><span>${esc(p.titulo)}</span><i class="dv__ar" aria-hidden="true">${ARROW}</i></a>`).join('')}</div>
      </div>
    </section>`;
  };

  /* ---------- Orçamento ao vivo (seleção de volume + rótulo por fórmula) ---------- */
  const sel = {};
  const ARTE_MIN = COSTS.arteMin, ARTE_PRECO = COSTS.artePreco;
  // Fornecedores com cobrança própria (ex.: Alphafitus) substituem a tabela
  // de rótulo, a notificação ANVISA e/ou a regra da arte do rótulo padrão
  // deste produto específico.
  const rotTableFor = p => (p.fornecedor && p.fornecedor.rotulo) || COSTS.rotulo[p.tipo] || COSTS.rotulo['Cápsulas'];
  const rotQtysFor = p => Object.keys(rotTableFor(p)).map(Number).sort((a, b) => a - b);
  const anvisaFor = p => (p.fornecedor && p.fornecedor.anvisa) || COSTS.anvisa;
  const arteFor = (p, v) => (p.fornecedor && p.fornecedor.arteGratis) ? 0 : (v >= ARTE_MIN ? 0 : ARTE_PRECO);
  const calcFor = (p, v, rq) => {
    const unit = priceAt(p, v);
    const fab = unit * v;
    const rot = rotTableFor(p)[rq];
    const anvisa = anvisaFor(p);
    const arte = arteFor(p, v);
    return { unit, fab, rot, anvisa, arte, total: fab + rot + anvisa + arte };
  };
  const quoteMsg = (p, v, rq, c) => [
    `Olá! Vi o catálogo da CapsBR e quero fabricar o ${p.id} · ${p.titulo} com a minha marca.`,
    '',
    '*Minha cotação:*',
    `- Volume: ${nf(v)} unidades`,
    `- Fabricação: ${nf(v)} un. × ${brl(c.unit)} = ${brl(c.fab)}`,
    `- Rótulos impressos: ${nf(rq)} unidades = ${brl(c.rot)}`,
    `- Notificação ANVISA: ${brl(c.anvisa)}`,
    `- Arte do rótulo: ${c.arte ? brl(c.arte) : 'Cortesia'}`,
    `*Total estimado: ${brl(c.total)}* (frete não incluso)`,
    '',
    'Pode confirmar a cotação?',
  ].join('\n');
  const priceBlock = (p, v, rq) => {
    const vs = vols(p);
    const c = calcFor(p, v, rq);
    return `<div class="pr" data-pid="${esc(p.id)}">
      <div class="pr__h"><span class="mono">Monte o seu pedido</span></div>
      <div class="pr__sub">Volume do pedido</div>
      <div class="pr__pills" role="group" aria-label="Volume do pedido">
        ${vs.map(vv => `<button type="button" class="pr__pill${vv === v ? ' is-on' : ''}" data-vol="${vv}" aria-pressed="${vv === v}">${nf(vv)} un.</button>`).join('')}
      </div>
      <div class="pr__sub">Quantidade de rótulos</div>
      <div class="pr__pills" role="group" aria-label="Quantidade de rótulos">
        ${rotQtysFor(p).map(rqq => `<button type="button" class="pr__pill${rqq === rq ? ' is-on' : ''}" data-rot="${rqq}" aria-pressed="${rqq === rq}">${nf(rqq)} un.</button>`).join('')}
      </div>
      <div class="pr__calc">
        <div class="pr__row"><span>Fabricação<small>${nf(v)} un. × ${brl(c.unit)}</small></span><b>${brl(c.fab)}</b></div>
        <div class="pr__row"><span>Impressão de rótulos<small>${nf(rq)} unidades</small></span><b>${brl(c.rot)}</b></div>
        <div class="pr__row"><span>Notificação ANVISA</span><b>${brl(c.anvisa)}</b></div>
        <div class="pr__row"><span>Arte do rótulo<small>${(p.fornecedor && p.fornecedor.arteGratis) ? 'sempre cortesia com este fornecedor' : v >= ARTE_MIN ? `a partir de ${nf(ARTE_MIN)} un.` : `abaixo de ${nf(ARTE_MIN)} un.`}</small></span><b>${c.arte ? brl(c.arte) : 'Cortesia'}</b></div>
      </div>
      <div class="pr__tot"><span>Total estimado</span><b>${brl(c.total)}</b></div>
      <p class="pr__inc">Já inclui <b>rótulo personalizado, teste de estabilidade e tabela nutricional</b>. Frete não incluso.</p>
    </div>`;
  };
  const ctaBlock = (p, v, rq) => {
    const c = calcFor(p, v, rq);
    return `<a class="cta" id="cta-${esc(p.id)}" href="${wa(quoteMsg(p, v, rq, c))}" target="_blank" rel="noopener" data-fb-content-ids="${esc(p.id)}" data-fb-content-name="${esc(p.titulo)}" data-fb-value="${c.total}">
      <span class="cta__t"><b>Quero essa fórmula com a minha marca</b><span>${nf(v)} unidades · ${nf(rq)} rótulos · total estimado ${brl(c.total)}, já escrito na mensagem.</span></span>
      <span class="cta__btn"><span class="cta__ic">${WAIC}</span>Pedir cotação<span class="cta__ar">${ARROW}</span></span>
    </a>`;
  };

  const product = (p) => {
    const rows = nutriRows(p);
    const vd = r => /^\d/.test(String(r.vd).trim()) ? `${r.vd}%` : '**';
    const vs = vols(p);
    const rqs = rotQtysFor(p);
    if (!sel[p.id] || !vs.includes(sel[p.id].vol) || !rqs.includes(sel[p.id].rot)) sel[p.id] = { vol: vs[0], rot: rqs[0] };
    const { vol: v0, rot: r0 } = sel[p.id];
    const cleanPorcao = s => String(s || '').replace(/^Porção de\s*/i, '');
    const cleanPorcoes = s => String(s || '').replace(/^Porções por embalagem:\s*/i, '');
    const price = state.precos ? priceBlock(p, v0, r0) : `
      <div class="pr">
        <div class="pr__h"><span class="mono">Volumes disponíveis</span></div>
        <div class="pr__ask">Valores sob consulta, direto com a CapsBR.</div>
        <p>Quanto maior o volume, menor o valor por unidade.</p>
        <div class="pr__vols">${vs.map(v => `<span>${nf(v)} un.</span>`).join('')}</div>
        <p class="pr__inc">Já inclui <b>rótulo personalizado, teste de estabilidade e tabela nutricional</b>. Frete não incluso.</p>
      </div>`;
    return `<section class="page pp" id="${esc(p.id)}" aria-label="${esc(p.titulo)}">
      ${head(`${esc(p.tipo)} · <b>${esc(p.id)}</b>`)}
      <div class="pp__top">
        <div class="pp__stage">
          <div class="pp__rings"><i></i><i></i><i></i></div>
          <span class="code">${esc(p.id)}</span>
          ${p.destaque ? `<span class="pp__hot">${esc(p.destaque)}</span>` : ''}
          <img class="${imgFor(p.tipo).cls}" src="${imgFor(p.tipo).src}" alt="${esc(p.titulo)}, ${imgFor(p.tipo).alt}" loading="lazy">
          <span class="pp__size">${esc(p.tamanho)}</span>
        </div>
        <div class="pp__info">
          <div class="pp__cat"><span class="tag"><span class="dot"></span>${esc(p.tipo)} · ${esc(p.categoria)}</span></div>
          <h2 class="display">${esc(p.titulo)}</h2>
          ${comp(p) ? `<p class="pp__comp">${esc(comp(p))}</p>` : ''}
          <p class="pp__desc">${esc(p.descricao)}</p>
          <ul class="pp__bens">${(p.beneficios || []).slice(0, 5).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
          <div class="pp__meta">
            <div><span>Apresentação</span><b>${esc(p.tamanho)}</b></div>
            <div><span>Porção</span><b>${esc(cleanPorcao(p.porcao))}</b></div>
            <div><span>Porções</span><b>${esc(cleanPorcoes(p.porcoes))} por embalagem</b></div>
          </div>
        </div>
      </div>
      <div class="pp__bot">
        <div class="nt${rows.length > 9 ? ' nt--dense' : ''}">
          <h4>Informação nutricional</h4>
          <div class="nt__por">${esc(p.porcoes)}<br>${esc(p.porcao)}</div>
          <div class="nt__row nt__row--h"><span></span><span>Porção</span><span>%VD*</span></div>
          ${rows.map(r => `<div class="nt__row"><span>${esc(r.name)}</span><span>${esc(r.v)}<small>${esc(r.unit)}</small></span><span>${esc(vd(r))}</span></div>`).join('')}
          <p class="nt__foot">*Percentual de valores diários fornecidos pela porção. **VD não estabelecido.${p.naoContem ? ' ' + esc(p.naoContem) : ''}</p>
        </div>
        ${price}
      </div>
      ${state.precos ? ctaBlock(p, v0, r0) : `<a class="cta" href="${wa(`Olá! Vi o catálogo da CapsBR e quero fabricar o ${p.id} · ${p.titulo} com a minha marca. Pode me passar a cotação?`)}" target="_blank" rel="noopener">
        <span class="cta__t"><b>Quero essa fórmula com a minha marca</b><span>Pedido de cotação do <em>${esc(p.id)}</em> já vai escrito na mensagem.</span></span>
        <span class="cta__btn"><span class="cta__ic">${WAIC}</span>Pedir cotação<span class="cta__ar">${ARROW}</span></span>
      </a>`}
      ${foot()}
    </section>`;
  };

  const invest = (list) => {
    // exemplo calculado com o produto de menor preço em 500 un. (ou a menor faixa disponível)
    const ex = [...list].sort((a, b) => minPrice(a) - minPrice(b))[0];
    const exV = ex ? (vols(ex).includes(500) ? 500 : vols(ex)[0]) : 0;
    const exRq = ex ? (rotQtysFor(ex).includes(500) ? 500 : rotQtysFor(ex)[0]) : 500;
    const minVol = Math.min(...list.flatMap(vols));
    let sim = '';
    if (ex && state.precos) {
      const c = calcFor(ex, exV, exRq);
      sim = `<div class="sim">
        <div class="sim__l">
          <span class="mono">Exemplo de pedido</span>
          <h3>${nf(exV)} unidades de ${esc(ex.titulo)}</h3>
          ${ex.fornecedor ? `<span class="sim__forn">Condição própria deste fornecedor</span>` : ''}
          <p>Simulação com os valores deste catálogo. A cotação final é confirmada com você no WhatsApp, junto com a aprovação do rótulo.${ex.fornecedor ? ' Esta fórmula vem de um fornecedor com rótulo, ANVISA e/ou arte em condição diferente do padrão acima.' : ''}</p>
          <div class="sim__per"><b>${brl(c.total / exV)}</b><span>custo final por unidade,<br>com tudo incluído</span></div>
        </div>
        <div class="sim__r">
          <div class="sim__row"><span>Fabricação<small>${nf(exV)} un. × ${brl(c.unit)}</small></span><b>${brl(c.fab)}</b></div>
          <div class="sim__row"><span>Impressão de rótulos<small>${nf(exRq)} unidades</small></span><b>${brl(c.rot)}</b></div>
          <div class="sim__row"><span>Notificação ANVISA<small>por produto</small></span><b>${brl(c.anvisa)}</b></div>
          <div class="sim__row"><span>Arte do rótulo</span><b>${c.arte ? brl(c.arte) : 'Cortesia'}</b></div>
          <div class="sim__tot"><span>Investimento total</span><b>${brl(c.total)}</b></div>
        </div>
      </div>`;
    }
    const faq = [
      ['Qual é o pedido mínimo?', `A partir de ${nf(minVol)} unidades por fórmula. Quanto maior o volume, menor o valor por unidade.`],
      ['O preço por unidade já inclui tudo?', 'Inclui rótulo personalizado, teste de estabilidade e tabela nutricional. ANVISA e impressão do rótulo entram à parte, confirmadas na cotação.'],
      ['Quanto tempo demora?', 'De 15 a 45 dias após a aprovação e a chegada do rótulo impresso. O prazo vem escrito na cotação.'],
      ['Posso fechar mais de uma fórmula?', 'Pode, e vale a pena: monte seu kit com 2 ou mais fórmulas e peça tudo numa única mensagem.'],
      ['O frete está incluso?', 'Não. Os valores deste catálogo cobrem fabricação, rótulo, impressão e ANVISA — o frete é calculado à parte, conforme o endereço de entrega.'],
    ];
    const faqBlock = `<div class="faq">${faq.map(([q, a], i) => `<div class="faq__it"><span class="faq__n">${pad(i + 1)}</span><div><h4>${esc(q)}</h4><p>${esc(a)}</p></div></div>`).join('')}</div>`;
    // Numa proposta (seleção avulsa, possivelmente com fórmulas de fornecedores
    // diferentes) a tabela padrão de custos e a simulação ficam de fora: cada
    // card de fórmula já mostra o cálculo certo dela (respeitando o fornecedor
    // próprio, quando há um), e repetir uma tabela "padrão" aqui só duplica
    // informação e pode contradizer o que está no card.
    if (PROPOSTA) {
      return `<section class="page" aria-label="Perguntas frequentes">
        ${head('Dúvidas · <b>Perguntas frequentes</b>')}
        <div class="eyebrow"><span class="num">03</span><span class="line"></span><span class="mono">Dúvidas</span></div>
        <h2 class="display h2">Perguntas <span class="accent">frequentes.</span></h2>
        ${faqBlock}
        ${foot()}
      </section>`;
    }
    return `<section class="page" aria-label="Investimento e condições">
      ${head('Investimento · <b>Condições</b>')}
      <div class="eyebrow"><span class="num">03</span><span class="line"></span><span class="mono">Investimento</span></div>
      <h2 class="display h2">Transparente do primeiro<br>ao último <span class="accent">frasco.</span></h2>
      <p class="lead" style="margin-top:4mm">${state.precos ? 'Além do valor por unidade de cada fórmula, estes são os únicos custos do pedido (frete à parte).' : 'Além do valor por unidade de cada fórmula (sob consulta), estes são os únicos custos do pedido (frete à parte).'}</p>
      <div class="cost">
        <div class="cost__it cost__it--rot"><span class="inc__ic">${IC.label}</span><span class="cost__k">Impressão de rótulos</span>
          <div class="cost__rot">${ORDER.map(t => `<div class="cost__rotrow"><b>${t}</b><span>500 un. <em>${brl(COSTS.rotulo[t][500])}</em></span><span>1.000 un. <em>${brl(COSTS.rotulo[t][1000])}</em></span></div>`).join('')}</div>
          <p>Por linha e quantidade de rótulos impressos.${list.some(p => p.fornecedor) ? ' Algumas fórmulas têm fornecedor com condição própria, confirmada na página de cada uma.' : ''}</p>
        </div>
        <div class="cost__it"><span class="inc__ic">${IC.shield}</span><span class="cost__k">Notificação ANVISA</span><div class="cost__v"><b>${brl(COSTS.anvisa)}</b><small>por produto</small></div><p>Conduzida pela CapsBR no mesmo fluxo do pedido.${list.some(p => p.fornecedor && p.fornecedor.anvisa) ? ' Algumas fórmulas têm fornecedor com valor próprio, confirmado na página de cada uma.' : ''}</p></div>
        <div class="cost__it"><span class="inc__ic">${IC.sign.replace('viewBox="0 0 48 48"', 'viewBox="4 2 40 44"')}</span><span class="cost__k">Arte do rótulo</span><div class="cost__v"><b>Cortesia</b><small>a partir de ${nf(ARTE_MIN)} un.</small></div><div class="cost__v"><b>${brl(ARTE_PRECO)}</b><small>abaixo de ${nf(ARTE_MIN)} un.</small></div><p>Ou envie a sua arte pronta para aprovação.${list.some(p => p.fornecedor && p.fornecedor.arteGratis) ? ' Algumas fórmulas têm fornecedor com arte sempre cortesia, confirmado na página de cada uma.' : ''}</p></div>
      </div>
      ${sim}
      <div class="sec-label"><span class="mono">Perguntas frequentes</span></div>
      ${faqBlock}
      ${foot()}
    </section>`;
  };

  const back = () => {
    const link = wa('Olá! Recebi o catálogo da CapsBR e quero criar a minha marca de suplementos. Podem me ajudar?');
    return `<section class="page page--dark back" aria-label="Contato">
      <div class="dk-grid"></div><div class="dk-glow" style="bottom:auto;top:-30mm"></div>
      <span class="dk-logo" role="img" aria-label="CapsBR" style="position:relative"></span>
      <div class="back__body">
        <span class="tag"><span class="dot"></span>Próximo passo</span>
        <h2 class="display">Vamos criar a <span class="accent">sua marca?</span></h2>
        <p class="lead">Escolha as fórmulas, mande os códigos no WhatsApp e receba a cotação com rótulo, ANVISA e prazo, tudo numa conversa.</p>
        <a class="back__btn" href="${link}" target="_blank" rel="noopener">
          <span class="back__ic">${WAIC}</span>
          <span class="back__t"><small>Fale com a CapsBR no WhatsApp</small><b>${phone}</b></span>
          <span class="back__ar">${ARROW}</span>
        </a>
        <div class="back__lines">
          <a href="mailto:contato@capsbr.com.br"><span class="mono">E-mail</span>contato@capsbr.com.br</a>
          <span><span class="mono">Atendimento</span>Do primeiro “oi” à entrega</span>
          <span><span class="mono">Prazo</span>15 a 45 dias após o rótulo</span>
        </div>
        <div class="back__badges"><span class="tag">Notificação ANVISA</span><span class="tag">Teste de estabilidade</span><span class="tag">Tabela nutricional validada</span></div>
        <div class="back__legal">
          <span>© ${today.getFullYear()} CapsBR Nutracêuticos Ltda.<br>CNPJ 68.259.906/0001-69</span>
          <span>Valores por unidade sujeitos à confirmação na cotação final e à aprovação do rótulo.<br>Imagens ilustrativas. Catálogo gerado em ${today.toLocaleDateString('pt-BR')}.</span>
        </div>
      </div>
    </section>`;
  };

  /* ---------- Montagem ---------- */
  const root = $('.js-pages');
  root.addEventListener('click', e => {
    const lb = e.target.closest('.lnf__b');
    if (lb) { const v = lb.dataset.linha; if (v !== state.linha) { state.linha = v; render(); } return; }
    const pill = e.target.closest('.pr__pill');
    if (!pill) return;
    const box = pill.closest('[data-pid]');
    const id = box && box.dataset.pid;
    const p = id && ALL.find(x => x.id === id);
    if (!p || !sel[id]) return;
    const s = sel[id];
    if (pill.dataset.vol != null) {
      const v = Number(pill.dataset.vol);
      if (s.vol === v) return;
      s.vol = v;
    } else if (pill.dataset.rot != null) {
      const r = Number(pill.dataset.rot);
      if (s.rot === r) return;
      s.rot = r;
    } else return;
    box.outerHTML = priceBlock(p, s.vol, s.rot);
    const cta = document.getElementById('cta-' + id);
    if (cta) cta.outerHTML = ctaBlock(p, s.vol, s.rot);
  });
  function render() {
    const list = ALL.filter(p => state.linha === 'todas' || p.tipo === TIPO_BY_LINHA[state.linha]);
    if (!list.length) { root.innerHTML = '<p class="loading">Nenhuma fórmula encontrada.</p>'; return; }
    const sortHot = arr => [...arr].sort((a, b) => (b.destaque === 'Mais pedido') - (a.destaque === 'Mais pedido'));
    const groups = ORDER.map(t => ({ key: LINHA_BY_TIPO[t], label: t, items: sortHot(list.filter(p => p.tipo === t)) })).filter(g => g.items.length);
    document.documentElement.classList.toggle('no-prices', !state.precos);
    root.innerHTML = [
      cover(list), about(), index(groups),
      ...groups.flatMap((g, i) => [divider(g, i + 1, groups.length), ...g.items.map(product)]),
      invest(list), back(),
    ].join('');
    // numeração de páginas e índice
    const pages = $$('.page', root), total = pages.length;
    pages.forEach((pg, i) => { const n = $('[data-pn]', pg); if (n) n.textContent = `${pad(i + 1)} / ${pad(total)}`; pg.dataset.n = i + 1; });
    $$('[data-goto]', root).forEach(el => { const t = document.getElementById(el.dataset.goto); el.textContent = t ? pad(t.dataset.n) : ''; });
    document.title = `Catálogo de Fórmulas${state.para ? ' · ' + state.para : ''} | CapsBR`;
  }

  const toast = msg => { const t = $('.js-toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('is-on'), 2400); };
  const ready = () => Promise.all([document.fonts ? document.fonts.ready : 0, ...$$('img', root).map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); })]);
  const doPrint = () => { toast('Preparando o PDF…'); ready().then(() => setTimeout(() => window.print(), 150)); };

  /* ---------- Botões flutuantes (versão do lead) ---------- */
  const dock = $('.js-dock');
  if (dock) {
    $('.js-dock-wa', dock).href = wa(`Olá! Estou vendo o catálogo da CapsBR${state.para ? ` (${state.para})` : ''} e quero fazer uma cotação.`);
    $('.js-dock-pdf', dock).addEventListener('click', doPrint);
  }

  /* ---------- Barra de opções (só com ?editar=1) ---------- */
  const bar = $('.cbar');
  if (EDIT && bar) {
    bar.hidden = false;
    document.documentElement.classList.add('is-edit');
    const syncUrl = () => {
      const u = new URL(location.href);
      ['para', 'linha', 'precos'].forEach(k => u.searchParams.delete(k));
      if (state.para) u.searchParams.set('para', state.para);
      if (state.linha !== 'todas') u.searchParams.set('linha', state.linha);
      if (!state.precos) u.searchParams.set('precos', '0');
      history.replaceState(null, '', u);
      u.searchParams.delete('editar');
      return u.href;
    };
    const para = $('.js-para'), precos = $('.js-precos');
    para.value = state.para;
    precos.checked = state.precos;
    const segs = $$('.js-linha button');
    const paintSeg = () => segs.forEach(b => { b.classList.toggle('is-on', b.dataset.v === state.linha); b.setAttribute('aria-pressed', b.dataset.v === state.linha); });
    paintSeg();
    let tm;
    para.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { state.para = para.value.trim().slice(0, 40); syncUrl(); render(); }, 250); });
    precos.addEventListener('change', () => { state.precos = precos.checked; syncUrl(); render(); });
    segs.forEach(b => b.addEventListener('click', () => { state.linha = b.dataset.v; paintSeg(); syncUrl(); render(); }));
    $('.js-print').addEventListener('click', doPrint);
    $('.js-copy').addEventListener('click', async () => {
      const href = syncUrl();
      try { await navigator.clipboard.writeText(href); toast('Link do lead copiado'); }
      catch { prompt('Copie o link do catálogo:', href); }
    });
  }

  /* ---------- Animação de boas-vindas (link personalizado) ---------- */
  async function intro() {
    const el = $('.js-intro');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || !state.para || EDIT || PRINT || qs.get('intro') === '0') { el && el.remove(); return; }
    let seen = false;
    try { const k = 'capsbr-intro:' + state.para; seen = sessionStorage.getItem(k) === '1'; sessionStorage.setItem(k, '1'); } catch {}
    if (seen) { el.remove(); return; }
    $('.js-intro-name', el).textContent = firstName(state.para);
    el.hidden = false;
    document.documentElement.classList.add('is-intro');
    // desenha o logo a partir do SVG oficial (contorno e depois preenchimento)
    try {
      const txt = await fetch('assets/img/capsbr-logo-header.svg').then(r => r.ok ? r.text() : Promise.reject());
      const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      const svg = doc.documentElement;
      svg.querySelectorAll('rect').forEach(r => r.remove());
      svg.removeAttribute('width'); svg.removeAttribute('height');
      svg.setAttribute('class', 'intro__svg'); svg.setAttribute('aria-hidden', 'true');
      svg.querySelectorAll('path').forEach((p, i) => { p.setAttribute('pathLength', '1'); p.removeAttribute('fill'); p.style.setProperty('--d', (i * 0.018).toFixed(3) + 's'); });
      $('.js-intro-logo', el).replaceChildren(document.importNode(svg, true));
    } catch { $('.js-intro-logo', el).innerHTML = '<span class="intro__fallback"></span>'; }
    requestAnimationFrame(() => el.classList.add('is-play'));
    const close = () => {
      if (el.classList.contains('is-out')) return;
      el.classList.add('is-out');
      document.documentElement.classList.remove('is-intro');
      setTimeout(() => el.remove(), 900);
    };
    el.addEventListener('click', close);
    addEventListener('keydown', close, { once: true });
    setTimeout(close, reduce ? 1600 : 4300);
  }

  render();
  intro();
  if (PRINT) doPrint();
})();
