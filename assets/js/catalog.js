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
  const ALL = (window.PRODUCTS || []).filter(p => p && p.volumes && Object.keys(p.volumes).length);
  const WA = String(SITE.whatsapp || '5554997090147').replace(/\D/g, '') || '5554997090147';
  const COSTS = Object.assign({ rotuloCaps: 650, rotuloLiq: 600, rotuloLote: 500, anvisa: 300 }, SITE.costs || {});
  const sp = SITE.promo || {};
  const PROMO = { name: sp.name || 'Black Friday', end: sp.end || '2026-11-30T23:59:59-03:00', max: +sp.max || 37, enabled: sp.enabled !== false };
  PROMO.on = PROMO.enabled && Date.now() < new Date(PROMO.end).getTime() && !/promo=off/.test(location.search);
  PROMO.endDMY = new Date(PROMO.end).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const nf = n => (+n).toLocaleString('pt-BR');
  const pad = n => String(n).padStart(2, '0');
  const isLiq = p => p.tipo === 'Líquidos';
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

  const IMG = { caps: 'assets/img/capsulas-recorte.png', liq: 'assets/img/liquidos-recorte.png' };
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

  /* ---------- Estado (vem da URL) ---------- */
  const qs = new URLSearchParams(location.search);
  const state = {
    para: (qs.get('para') || '').trim().slice(0, 40),
    linha: ['capsulas', 'liquidos'].includes(qs.get('linha')) ? qs.get('linha') : 'todas',
    precos: qs.get('precos') !== '0',
  };
  const EDIT = qs.get('editar') === '1';
  const PRINT = qs.get('print') === '1';
  const firstName = s => s.split(/\s+/)[0];

  /* ---------- Blocos ---------- */
  const head = (label) => `<div class="ph"><span class="ph__logo" role="img" aria-label="CapsBR"></span><span class="ph__r">${label}</span></div>`;
  const foot = () => `<div class="pf"><span><b>CapsBR Nutracêuticos</b><i></i>WhatsApp ${phone}<i></i>contato@capsbr.com.br</span><span class="pf__n" data-pn></span></div>`;
  const comp = p => (p.nome && p.nome.trim().toLowerCase() !== String(p.titulo).trim().toLowerCase()) ? p.nome : '';
  const waBtn = (href, label, cls = '') => `<a class="wbtn ${cls}" href="${href}" target="_blank" rel="noopener"><span class="wbtn__ic">${WAIC}</span><span>${label}</span><span class="wbtn__ar">${ARROW}</span></a>`;

  const cover = (list) => {
    const nCaps = list.filter(p => !isLiq(p)).length, nLiq = list.length - nCaps;
    const minVol = Math.min(...list.flatMap(vols));
    const title = state.linha === 'capsulas' ? 'Linha<br><span class="accent">Cápsulas.</span>' : state.linha === 'liquidos' ? 'Linha<br><span class="accent">Líquidos.</span>' : 'Catálogo de <span class="accent">fórmulas.</span>';
    const showCaps = state.linha !== 'liquidos', showLiq = state.linha !== 'capsulas';
    return `<section class="page page--dark cover" aria-label="Capa">
      <div class="dk-grid"></div><div class="dk-glow"></div>
      <div class="cover__top"><span class="dk-logo" role="img" aria-label="CapsBR"></span><div class="cover__ed">Catálogo ${today.getFullYear()}<br>Edição ${esc(edition)}</div></div>
      <div class="cover__body">
        <div class="cover__tags"><span class="tag"><span class="dot"></span>Fábrica de marca própria</span>${PROMO.on && state.precos ? `<span class="tag cover__promo">${esc(PROMO.name)} · até ${PROMO.max}% off até ${PROMO.endDMY.slice(0, 5)}</span>` : ''}</div>
        <h1 class="display">${title}</h1>
        <p class="lead">Fórmulas prontas, validadas e com teste de estabilidade. Você escolhe, a gente fabrica com o rótulo da sua marca e entrega pronto pra vender.</p>
        ${state.para ? `<div class="cover__for"><span>Preparado para</span><b>${esc(state.para)}</b></div>` : ''}
      </div>
      <div class="cover__art${showCaps && showLiq ? '' : ' is-solo'}" aria-hidden="true">
        <div class="cover__disc"></div>
        ${showCaps ? `<img class="i-caps" src="${IMG.caps}" alt="">` : ''}
        ${showLiq ? `<img class="i-liq" src="${IMG.liq}" alt="">` : ''}
      </div>
      <div class="cover__stats">
        <div><b>${list.length}</b><span>fórmulas prontas${nCaps && nLiq ? `<br>${nCaps} cápsulas · ${nLiq} líquidos` : ''}</span></div>
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
      <p class="lead">A CapsBR Nutracêuticos fabrica cápsulas e líquidos com a marca de quem quer empreender no mercado de suplementos. Do pó da fórmula ao lote aprovado, cada etapa acontece na nossa linha, com controle de qualidade em todo frasco.</p>
    </div>
    <div class="sec-label"><span class="mono">Incluso em todo pedido</span></div>
    <div class="inc">
      <div class="inc__it"><span class="inc__ic">${IC.label}</span><b>Rótulo personalizado</b><span>Arte com a identidade da sua marca.</span></div>
      <div class="inc__it"><span class="inc__ic">${IC.flask}</span><b>Teste de estabilidade</b><span>Qualidade garantida até o fim da validade.</span></div>
      <div class="inc__it"><span class="inc__ic">${IC.table}</span><b>Tabela nutricional</b><span>Validada e pronta para o rótulo.</span></div>
      <div class="inc__it"><span class="inc__ic">${IC.shield}</span><b>Notificação ANVISA</b><span>Conduzida no mesmo fluxo do pedido.</span></div>
      <div class="inc__it"><span class="inc__ic">${IC.doc}</span><b>Laudo por lote</b><span>Documentação para vender com segurança.</span></div>
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

  const index = (groups) => `<section class="page" aria-label="Índice">
    ${head('Índice · <b>Fórmulas</b>')}
    <div class="eyebrow"><span class="num">02</span><span class="line"></span><span class="mono">Índice</span></div>
    <h2 class="display h2">Escolha a fórmula.<br>A marca é <span class="accent">sua.</span></h2>
    <p class="lead toc__lead">${state.precos ? 'Valores por unidade na maior faixa de volume. Toque numa fórmula para ver a página completa.' : 'Toque numa fórmula para ver composição, tabela nutricional e volumes.'}</p>
    <div class="toc">
      ${groups.map((g, gi) => `<div class="toc__grp">
        <div class="toc__gh"><h3>${g.label}</h3><span>${pad(g.items.length)} fórmulas</span></div>
        ${g.items.map(p => `<a class="toc__row" href="#${esc(p.id)}">
          <span class="toc__code">${esc(p.id)}</span>
          <span class="toc__name">${esc(p.titulo)}${p.maisPedido ? '<i class="toc__hot">Mais pedido</i>' : ''}</span>
          <span class="toc__dots" aria-hidden="true"></span>
          ${state.precos ? `<span class="toc__price"><small>a partir de</small> ${brl(minPrice(p))}</span>` : ''}
          <span class="toc__pg" data-goto="${esc(p.id)}"></span>
        </a>`).join('')}
      </div>`).join('')}
    </div>
    ${foot()}
  </section>`;

  const divider = (g, n, total) => {
    const liq = g.key === 'liquidos';
    return `<section class="page page--dark dv" aria-label="Linha ${g.label}">
      <div class="dk-glow dv__glow"></div>
      <div class="dv__top"><span class="dk-logo" role="img" aria-label="CapsBR"></span><span class="dv__n">Linha ${pad(n)} <em>/ ${pad(total)}</em></span></div>
      <div class="dv__hero">
        <div class="dv__txt">
          <span class="dv__num">${pad(n)}</span>
          <h2 class="display">${g.label}</h2>
          <p class="lead">${liq ? 'Frasco com conta-gotas de 30 mL, cheio e lacrado na nossa linha. Absorção rápida e dose fácil de ajustar.' : 'Pote de vidro com 30 ou 60 cápsulas, dosadas, encapsuladas e envasadas com controle em cada etapa.'}</p>
          <div class="dv__tags"><span class="tag"><span class="dot"></span>${liq ? 'Conta-gotas 30 mL' : 'Pote de vidro'}</span><span class="tag">${pad(g.items.length)} fórmulas</span></div>
        </div>
        <div class="dv__art${liq ? ' is-liq' : ''}" aria-hidden="true"><div class="dv__disc"></div><img src="${liq ? IMG.liq : IMG.caps}" alt=""></div>
      </div>
      <div class="dv__list">
        <span class="mono">Nesta linha</span>
        <div>${g.items.map(p => `<a href="#${esc(p.id)}"><em>${esc(p.id)}</em>${esc(p.titulo)}</a>`).join('')}</div>
      </div>
    </section>`;
  };

  const product = (p) => {
    const liq = isLiq(p);
    const rows = nutriRows(p);
    const vd = r => /^\d/.test(String(r.vd).trim()) ? `${r.vd}%` : '**';
    const vs = vols(p);
    const link = wa(`Olá! Vi o catálogo da CapsBR e quero fabricar o ${p.id} · ${p.titulo} com a minha marca. Pode me passar a cotação?`);
    const cleanPorcao = s => String(s || '').replace(/^Porção de\s*/i, '');
    const cleanPorcoes = s => String(s || '').replace(/^Porções por embalagem:\s*/i, '');
    const price = state.precos ? `
      <div class="pr">
        <div class="pr__h"><span class="mono">Preço por unidade</span>${PROMO.on ? `<span class="pr__badge">${esc(PROMO.name)} · -${p.desconto}%</span>` : ''}</div>
        <div class="pr__from">a partir de<b>${brl(minPrice(p))}<em> /un.</em></b></div>
        <div class="pr__tbl">
          <div class="pr__row pr__row--h"><span>Volume</span><span>Preço /un.</span><span style="text-align:right">Lote</span></div>
          ${vs.map(v => { const [de] = p.volumes[v]; const now = priceAt(p, v); return `<div class="pr__row"><span>${nf(v)} un.</span><span>${PROMO.on && de > now ? `<s>${brl(de)}</s> ` : ''}${brl(now)}</span><b>${brl(now * v)}</b></div>`; }).join('')}
        </div>
        <p class="pr__inc">Já inclui <b>rótulo personalizado, teste de estabilidade e tabela nutricional</b>. Impressão dos rótulos e notificação ANVISA à parte.</p>
      </div>` : `
      <div class="pr">
        <div class="pr__h"><span class="mono">Volumes disponíveis</span></div>
        <div class="pr__ask">Valores sob consulta, direto com a fábrica.</div>
        <p>Quanto maior o volume, menor o valor por unidade.</p>
        <div class="pr__vols">${vs.map(v => `<span>${nf(v)} un.</span>`).join('')}</div>
        <p class="pr__inc">Já inclui <b>rótulo personalizado, teste de estabilidade e tabela nutricional</b>.</p>
      </div>`;
    return `<section class="page pp" id="${esc(p.id)}" aria-label="${esc(p.titulo)}">
      ${head(`${esc(p.tipo)} · <b>${esc(p.id)}</b>`)}
      <div class="pp__top">
        <div class="pp__stage">
          <div class="pp__rings"><i></i><i></i><i></i></div>
          <span class="code">${esc(p.id)}</span>
          ${p.maisPedido ? '<span class="pp__hot">Mais pedido</span>' : ''}
          <img class="${liq ? 'i-liq' : 'i-caps'}" src="${liq ? IMG.liq : IMG.caps}" alt="${esc(p.titulo)}, ${liq ? 'frasco conta-gotas' : 'pote de cápsulas'}" loading="lazy">
          <span class="pp__size">${esc(p.tamanho)}</span>
          ${PROMO.on && state.precos && p.desconto ? `<span class="pp__off"><span><small>até</small>-${p.desconto}%</span></span>` : ''}
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
      <a class="cta" href="${link}" target="_blank" rel="noopener">
        <span class="cta__t"><b>Quero essa fórmula com a minha marca</b><span>Pedido de cotação do <em>${esc(p.id)}</em> já vai escrito na mensagem.</span></span>
        <span class="cta__btn"><span class="cta__ic">${WAIC}</span>Pedir cotação<span class="cta__ar">${ARROW}</span></span>
      </a>
      ${foot()}
    </section>`;
  };

  const invest = (list) => {
    // exemplo calculado com o produto de menor preço em 500 un. (ou a menor faixa disponível)
    const ex = [...list].sort((a, b) => minPrice(a) - minPrice(b))[0];
    const exV = ex ? (vols(ex).includes(500) ? 500 : vols(ex)[0]) : 0;
    const LOTE = Math.max(1, COSTS.rotuloLote | 0);
    const minVol = Math.min(...list.flatMap(vols));
    let sim = '';
    if (ex && state.precos) {
      const un = priceAt(ex, exV), rotU = isLiq(ex) ? COSTS.rotuloLiq : COSTS.rotuloCaps, rot = rotU * Math.ceil(exV / LOTE);
      const total = un * exV + rot + COSTS.anvisa;
      sim = `<div class="sim">
        <div class="sim__l">
          <span class="mono">Exemplo de pedido</span>
          <h3>${nf(exV)} unidades de ${esc(ex.titulo)}</h3>
          <p>Simulação com os valores deste catálogo. A cotação final é confirmada com você no WhatsApp, junto com a aprovação do rótulo.</p>
          <div class="sim__per"><b>${brl(total / exV)}</b><span>custo final por unidade,<br>com tudo incluído</span></div>
        </div>
        <div class="sim__r">
          <div class="sim__row"><span>Fabricação<small>${nf(exV)} un. × ${brl(un)}</small></span><b>${brl(un * exV)}</b></div>
          <div class="sim__row"><span>Impressão de rótulos<small>${brl(rotU)} a cada ${nf(LOTE)} un.</small></span><b>${brl(rot)}</b></div>
          <div class="sim__row"><span>Notificação ANVISA<small>por produto</small></span><b>${brl(COSTS.anvisa)}</b></div>
          <div class="sim__row"><span>Arte do rótulo</span><b>${PROMO.on ? 'Cortesia' : 'Sob consulta'}</b></div>
          <div class="sim__tot"><span>Investimento total</span><b>${brl(total)}</b></div>
        </div>
      </div>`;
    }
    const faq = [
      ['Qual é o pedido mínimo?', `A partir de ${nf(minVol)} unidades por fórmula. Quanto maior o volume, menor o valor por unidade.`],
      ['O preço por unidade já inclui tudo?', 'Inclui rótulo personalizado, teste de estabilidade e tabela nutricional. ANVISA e impressão do rótulo entram à parte, confirmadas na cotação.'],
      ['Quanto tempo demora?', 'De 15 a 45 dias após a aprovação e a chegada do rótulo impresso. O prazo vem escrito na cotação.'],
      ['Posso fechar mais de uma fórmula?', 'Pode, e vale a pena: monte seu kit com 2 ou mais fórmulas e peça tudo numa única mensagem.'],
    ];
    return `<section class="page" aria-label="Investimento e condições">
      ${head('Investimento · <b>Condições</b>')}
      <div class="eyebrow"><span class="num">03</span><span class="line"></span><span class="mono">Investimento</span></div>
      <h2 class="display h2">Transparente do primeiro<br>ao último <span class="accent">frasco.</span></h2>
      <p class="lead" style="margin-top:4mm">${state.precos ? 'Além do valor por unidade de cada fórmula, estes são os únicos custos do pedido.' : 'Além do valor por unidade de cada fórmula (sob consulta), estes são os únicos custos do pedido.'}</p>
      <div class="cost">
        <div class="cost__it"><span class="inc__ic">${IC.label}</span><span class="cost__k">Impressão de rótulos</span><div class="cost__v"><b>${brl(COSTS.rotuloCaps)}</b><small>cápsulas</small></div><div class="cost__v"><b>${brl(COSTS.rotuloLiq)}</b><small>líquidos</small></div><p>A cada ${nf(LOTE)} rótulos impressos.</p></div>
        <div class="cost__it"><span class="inc__ic">${IC.shield}</span><span class="cost__k">Notificação ANVISA</span><div class="cost__v"><b>${brl(COSTS.anvisa)}</b><small>por produto</small></div><p>Conduzida pela CapsBR no mesmo fluxo do pedido.</p></div>
        <div class="cost__it"><span class="inc__ic">${IC.sign.replace('viewBox="0 0 48 48"', 'viewBox="4 2 40 44"')}</span><span class="cost__k">Arte do rótulo</span><div class="cost__v"><b>${PROMO.on ? 'Cortesia' : 'Sob consulta'}</b></div><p>${PROMO.on ? `Condição de ${esc(PROMO.name)} até ${PROMO.endDMY}.` : 'Ou envie a sua arte pronta para aprovação.'}</p></div>
      </div>
      ${sim}
      <div class="sec-label"><span class="mono">Perguntas frequentes</span></div>
      <div class="faq">${faq.map(([q, a], i) => `<div class="faq__it"><span class="faq__n">${pad(i + 1)}</span><div><h4>${esc(q)}</h4><p>${esc(a)}</p></div></div>`).join('')}</div>
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
          <span class="back__t"><small>Fale com a fábrica no WhatsApp</small><b>${phone}</b></span>
          <span class="back__ar">${ARROW}</span>
        </a>
        <div class="back__lines">
          <a href="mailto:contato@capsbr.com.br"><span class="mono">E-mail</span>contato@capsbr.com.br</a>
          <span><span class="mono">Atendimento</span>Do primeiro “oi” à entrega</span>
          <span><span class="mono">Prazo</span>15 a 45 dias após o rótulo</span>
        </div>
        <div class="back__badges"><span class="tag">Notificação ANVISA</span><span class="tag">Teste de estabilidade</span><span class="tag">Tabela nutricional validada</span><span class="tag">Laudo por lote</span></div>
        <div class="back__legal">
          <span>© ${today.getFullYear()} CapsBR Nutracêuticos Ltda.<br>CNPJ 68.259.906/0001-69</span>
          <span>Valores por unidade sujeitos à confirmação na cotação final e à aprovação do rótulo.${PROMO.on && state.precos ? ` Condições de ${esc(PROMO.name)} válidas até ${PROMO.endDMY}.` : ''}<br>Imagens ilustrativas. Catálogo gerado em ${today.toLocaleDateString('pt-BR')}.</span>
        </div>
      </div>
    </section>`;
  };

  /* ---------- Montagem ---------- */
  const root = $('.js-pages');
  function render() {
    const list = ALL.filter(p => state.linha === 'todas' || (state.linha === 'liquidos') === isLiq(p));
    if (!list.length) { root.innerHTML = '<p class="loading">Nenhuma fórmula encontrada.</p>'; return; }
    const sortHot = arr => [...arr].sort((a, b) => (b.maisPedido === true) - (a.maisPedido === true));
    const groups = [
      { key: 'capsulas', label: 'Cápsulas', items: sortHot(list.filter(p => !isLiq(p))) },
      { key: 'liquidos', label: 'Líquidos', items: sortHot(list.filter(isLiq)) },
    ].filter(g => g.items.length);
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
    fitZoom();
  }

  // no computador as folhas A4 encolhem se a janela for estreita; no celular o layout vira fluido (CSS)
  const MOBILE = matchMedia('(max-width: 899px)');
  function fitZoom() {
    const w = 210 * 96 / 25.4 + 48;
    const z = MOBILE.matches ? 1 : Math.min(1, window.innerWidth / w);
    document.documentElement.style.setProperty('--z', z.toFixed(3));
  }
  addEventListener('resize', fitZoom);

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
