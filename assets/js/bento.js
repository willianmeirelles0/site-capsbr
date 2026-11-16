/* =========================================================
   CapsBR · Bento "Por que CapsBR" (widgets SVG animados)
   Mesmo estilo ilustrado da linha de produção: aço, vidro,
   rótulo verde petróleo e cápsulas creme, como o produto real.
   Um único relógio; cada widget pausa fora da tela.
   ========================================================= */
(() => {
  const els = [...document.querySelectorAll('.js-bx')];
  if (!els.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // celular: painéis laterais descem para baixo da máquina (ilustração em pé, não achatada)
  const NARROW = matchMedia('(max-width: 700px)').matches;
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eOut = t => 1 - Math.pow(1 - t, 3);
  const eBack = t => { const c = 2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const C = { teal: '#14483f', teal2: '#1d5c50', deep: '#0e3631', mint: '#9cc7b9', line: '#b7c5bf', glass: '#a9bdb6', cream: '#f3ead9' };
  const FONT = "font-family:'JetBrains Mono',ui-monospace,monospace";
  const FONTD = "font-family:'Inter Tight',Inter,sans-serif";
  const f1 = n => n.toFixed(1);
  let uid = 0;

  const defs = id => `<defs>
    <linearGradient id="${id}st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfc"/><stop offset="1" stop-color="#dbe3e0"/></linearGradient>
    <linearGradient id="${id}cy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c6d1cd"/><stop offset=".42" stop-color="#fbfcfc"/><stop offset="1" stop-color="#bcc8c3"/></linearGradient>
    <linearGradient id="${id}gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9e6e1" stop-opacity=".55"/><stop offset=".28" stop-color="#ffffff" stop-opacity=".15"/><stop offset=".75" stop-color="#ffffff" stop-opacity=".05"/><stop offset="1" stop-color="#c9d8d2" stop-opacity=".6"/></linearGradient>
    <linearGradient id="${id}lq" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d5c50"/><stop offset=".4" stop-color="#3b8a79"/><stop offset="1" stop-color="#1d5c50"/></linearGradient>
    <linearGradient id="${id}bm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc7b9" stop-opacity=".05"/><stop offset="1" stop-color="#9cc7b9" stop-opacity=".55"/></linearGradient>
    <linearGradient id="${id}bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c6b5f"/><stop offset=".3" stop-color="#14483f"/><stop offset="1" stop-color="#0b2b27"/></linearGradient>
  </defs>`;

  // cápsula creme (igual ao produto real)
  const cap = (x, y, r, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(r)}) scale(${s})"><rect x="-3.4" y="-8" width="6.8" height="16" rx="3.4" fill="#f4ebda" stroke="#d6c6a6" stroke-width=".5"/><path d="M-3.4 0 V-4.6 A3.4 3.4 0 0 1 3.4 -4.6 V0Z" fill="#e7d9bd"/><rect x="-2.2" y="-6" width="1.2" height="10" rx=".6" fill="#fff" opacity=".75"/></g>`;
  const ridges = (x0, x1, y, h, step = 4) => { let s = ''; for (let x = x0; x <= x1; x += step) s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}"/>`; return s; };
  let rs = 5; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;

  // pote de vidro transparente: rótulo no meio, cápsulas visíveis em cima e embaixo
  // (cx, base, w, h): devolve markup + caminho do corpo
  function glassPot(id, w, h, { brand = 'SUA MARCA', sub = '60 CÁPSULAS', n = 0, pileId = '' } = {}) {
    const x0 = -w / 2, top = -h, r = Math.min(14, w * .14), nw = w * .74, nh = h * .1;
    const body = `M${x0} ${-r} Q${x0} 0 ${x0 + r} 0 H${-x0 - r} Q${-x0} 0 ${-x0} ${-r} V${top + r} Q${-x0} ${top} ${-x0 - r} ${top} H${x0 + r} Q${x0} ${top} ${x0} ${top + r}Z`;
    const cid = `${id}c${uid++}`;
    // pilha de cápsulas (de baixo pra cima)
    let pile = '';
    const cols = Math.max(4, Math.round(w / 11)), rows = Math.ceil(h / 8.5);
    for (let row = 0; row < rows; row++) for (let i = 0; i < cols; i++) {
      pile += `<g class="pc">${cap(x0 + 6 + (i + (row % 2) * .5) * ((w - 12) / cols) + (rnd() - .5) * 3, -6 - row * 8.2, 60 + (rnd() - .5) * 120, w / 110 + .55)}</g>`;
    }
    const ly = top + h * .28, lh = h * .46;
    return {
      cid,
      markup: `
      <ellipse cx="0" cy="2" rx="${w * .62}" ry="${w * .07}" fill="#0b2b27" opacity=".12"/>
      <clipPath id="${cid}"><path d="${body}"/></clipPath>
      <g clip-path="url(#${cid})"><g class="pile" ${pileId}>${pile}</g></g>
      <path d="${body}" fill="url(#${id}gl)" stroke="${C.glass}" stroke-width="1.2"/>
      <path d="M${x0 + w * .12} ${top + h * .12} V${-h * .1}" stroke="#fff" stroke-width="${w * .05}" stroke-linecap="round" opacity=".65"/>
      <rect x="${-nw / 2}" y="${top - nh}" width="${nw}" height="${nh + 1}" rx="2" fill="url(#${id}gl)" stroke="${C.glass}"/>
      <g class="lab"><rect x="${x0}" y="${ly}" width="${w}" height="${lh}" fill="${C.teal}"/>
        <text class="lab__b" x="${x0 + w * .12}" y="${ly + lh * .38}" fill="#fff" style="${FONTD};font-weight:600;font-size:${f1(w * .11)}px;letter-spacing:-.01em">${brand}</text>
        <rect x="${x0 + w * .12}" y="${ly + lh * .5}" width="${w * .16}" height="1.4" fill="#fff" opacity=".9"/>
        <text x="${x0 + w * .12}" y="${ly + lh * .72}" fill="#fff" opacity=".85" style="${FONT};font-size:${f1(w * .045)}px;letter-spacing:.06em">SUPLEMENTO ALIMENTAR</text>
        <text x="${x0 + w * .12}" y="${ly + lh * .88}" fill="#fff" opacity=".7" style="${FONT};font-size:${f1(w * .042)}px;letter-spacing:.06em">${sub}</text></g>
      <rect x="${x0}" y="${ly}" width="${w * .07}" height="${lh}" fill="#fff" opacity=".12"/>`,
      capMarkup: `<g class="lid"><rect x="${-nw / 2 - 3}" y="${top - nh - h * .16}" width="${nw + 6}" height="${h * .17}" rx="3" fill="url(#${id}cy)" stroke="${C.line}"/><g stroke="#d3dcd8" stroke-width="1.1">${ridges(-nw / 2 + 1, nw / 2 - 1, top - nh - h * .16 + 3, h * .17 - 6, 3.4)}</g><rect x="${-nw / 2 - 3}" y="${top - nh - h * .16}" width="${nw + 6}" height="3" rx="1.5" fill="#fff"/></g>`,
    };
  }
  const svgEl = (root, sel) => root.querySelector(sel);
  const txt = (el, v) => { if (el && el.__t !== v) { el.__t = v; el.textContent = v; } };
  const attr = (el, k, v) => { if (!el) return; const s = String(v); if (el.__c && el.__c[k] === s) return; (el.__c || (el.__c = {}))[k] = s; el.setAttribute(k, s); };

  /* =====================================================
     1. ENCAPSULAMENTO: funil → disco dosador → pote enche
     ===================================================== */
  function enc(svg) {
    const id = 'bxE';
    svg.setAttribute('viewBox', '0 0 480 450');
    const pot = glassPot(id, 116, 150, { sub: '60 CÁPSULAS' });
    let holes = ''; for (let i = 0; i < 14; i++) holes += `<ellipse class="hl" rx="7" ry="2.6" fill="#0b2b27"/>`;
    let powder = ''; for (let i = 0; i < 40; i++) powder += `<circle cx="${180 + rnd() * 120}" cy="${52 + rnd() * 60}" r="${.8 + rnd() * 1.6}" fill="${rnd() > .5 ? '#d9ccb2' : '#fff'}" opacity=".8"/>`;
    let falls = ''; for (let i = 0; i < 5; i++) falls += `<g class="fall">${cap(0, 0, 0, 1.35)}</g>`;
    svg.innerHTML = defs(id) + `
      <line x1="10" y1="421" x2="470" y2="421" stroke="${C.line}" stroke-dasharray="2 5"/>
      <rect x="20" y="412" width="440" height="10" rx="5" fill="url(#${id}bl)"/>
      <!-- funil -->
      <clipPath id="${id}hp"><path d="M168 28 H312 L274 112 H206Z"/></clipPath>
      <g clip-path="url(#${id}hp)"><rect class="powder" x="160" y="60" width="160" height="60" fill="#efe6d6"/>${powder}</g>
      <path d="M168 28 H312 L274 112 H206Z" fill="url(#${id}cy)" fill-opacity=".35" stroke="${C.line}" stroke-width="1.2"/>
      <rect x="162" y="22" width="156" height="9" rx="4" fill="url(#${id}st)" stroke="${C.line}"/>
      <rect x="226" y="112" width="28" height="16" fill="url(#${id}cy)" stroke="${C.line}"/>
      <!-- encapsuladora -->
      <rect x="138" y="128" width="204" height="74" rx="12" fill="url(#${id}st)" stroke="${C.line}"/>
      <ellipse cx="240" cy="160" rx="78" ry="20" fill="${C.teal}"/>
      <ellipse cx="240" cy="157" rx="78" ry="20" fill="${C.teal2}"/>
      <g class="holes">${holes}</g>
      <ellipse cx="240" cy="157" rx="16" ry="5" fill="url(#${id}cy)"/>
      <rect x="352" y="138" width="82" height="52" rx="8" fill="${C.deep}"/>
      <text x="362" y="156" fill="${C.mint}" style="${FONT};font-size:8px;letter-spacing:.1em">CÁPSULAS</text>
      <text class="cnt" x="362" y="178" fill="#fff" style="${FONT};font-size:17px;font-weight:600">000</text>
      <circle class="led" cx="424" cy="150" r="3.5" fill="#3f9a7f"/>
      <rect x="230" y="202" width="20" height="14" rx="3" fill="url(#${id}cy)" stroke="${C.line}"/>
      <g class="falls">${falls}</g>
      <!-- pote -->
      <g class="pot"><g transform="translate(0 412)">${pot.markup}<g class="lidw">${pot.capMarkup}</g>
        <g class="badge" transform="translate(0 -205) scale(0)"><circle r="13" fill="${C.teal}"/><path d="M-6 .5 l4 4 L6.5 -5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g></g>`;
    const R = {
      holes: [...svg.querySelectorAll('.hl')], pcs: [...svg.querySelectorAll('.pc')], falls: [...svg.querySelectorAll('.fall')],
      pot: svgEl(svg, '.pot'), lid: svgEl(svg, '.lidw'), badge: svgEl(svg, '.badge'), cnt: svgEl(svg, '.cnt'), powder: svgEl(svg, '.powder'), led: svgEl(svg, '.led'),
    };
    const N = R.pcs.length, T = 7.2;
    return t => {
      const c = Math.floor(t / T), p = t % T;
      const slideIn = 1 - eOut(seg(p, 0, .9)), slideOut = eIO(seg(p, 6.4, T));
      attr(R.pot, 'transform', `translate(${f1(240 - slideIn * 300 + slideOut * 320)} 0)`);
      const fill = seg(p, 1, 5);
      const n = Math.round(fill * N);
      R.pcs.forEach((el, i) => attr(el, 'opacity', i < n ? 1 : 0));
      // topo da pilha (aproximado)
      const pileTop = 412 - 6 - (n / N) * 150;
      R.falls.forEach((el, i) => {
        const fp = ((p * 2.2 + i / R.falls.length) % 1);
        const on = p > 1 && p < 5;
        const y = 214 + (pileTop - 214) * fp * fp;
        attr(el, 'transform', `translate(${f1(240 + Math.sin(i * 2.3) * 18 * fp)} ${f1(y)}) rotate(${f1(fp * 260 + i * 40)})`);
        attr(el, 'opacity', on && fp < .96 ? 1 : 0);
      });
      // disco gira enquanto dosa
      const rot = (p < 5 ? p : 5) * 1.6 + c * 8;
      R.holes.forEach((el, i) => {
        const a = rot + i * Math.PI * 2 / R.holes.length;
        attr(el, 'cx', f1(240 + Math.cos(a) * 60)); attr(el, 'cy', f1(157 + Math.sin(a) * 14));
        attr(el, 'opacity', f1(.35 + .55 * (Math.sin(a) * .5 + .5)));
      });
      attr(R.powder, 'y', f1(54 + fill * 34));
      txt(R.cnt, String(Math.round(fill * 60)).padStart(3, '0'));
      attr(R.led, 'opacity', p > 1 && p < 5 ? (Math.sin(t * 14) > 0 ? 1 : .3) : 1);
      // tampa rosqueia
      const lp = seg(p, 5.1, 5.8);
      attr(R.lid, 'transform', `translate(0 ${f1(-(1 - eOut(lp)) * 90)})`);
      attr(R.lid, 'opacity', p > 5.05 ? 1 : 0);
      const bp = seg(p, 5.8, 6.3);
      attr(R.badge, 'transform', `translate(0 -205) scale(${f1(p > 6.4 ? 1 : eBack(bp))})`);
    };
  }

  /* =====================================================
     2. ESTABILIDADE: câmara climática
     ===================================================== */
  function stab(svg) {
    const id = 'bxS';
    svg.setAttribute('viewBox', '0 0 320 300');
    let pots = '';
    [[118, 152], [160, 152], [202, 152], [118, 226], [160, 226], [202, 226]].forEach(([x, y]) => {
      const g = glassPot(id, 32, 40, { brand: 'MARCA', sub: '' });
      pots += `<g transform="translate(${x} ${y})">${g.markup}<g transform="translate(0 0)">${g.capMarkup}</g></g>`;
    });
    let air = ''; for (let i = 0; i < 4; i++) air += `<path class="air" d="M92 ${88 + i * 36} C 130 ${78 + i * 36}, 170 ${98 + i * 36}, 228 ${86 + i * 36}" stroke="${C.mint}" stroke-width="1.4" fill="none" stroke-dasharray="10 14" opacity=".7"/>`;
    svg.innerHTML = defs(id) + `
      <rect x="62" y="18" width="196" height="264" rx="16" fill="url(#${id}st)" stroke="${C.line}" stroke-width="1.2"/>
      <rect x="76" y="30" width="168" height="34" rx="8" fill="${C.deep}"/>
      <text class="temp" x="88" y="53" fill="#fff" style="${FONT};font-size:14px;font-weight:600">40,0°C</text>
      <text class="ur" x="166" y="53" fill="${C.mint}" style="${FONT};font-size:14px;font-weight:600">75%UR</text>
      <rect x="76" y="72" width="168" height="168" rx="10" fill="#eef5f2" stroke="${C.line}"/>
      ${air}
      <line x1="80" y1="153" x2="240" y2="153" stroke="${C.line}" stroke-width="2"/>
      <line x1="80" y1="227" x2="240" y2="227" stroke="${C.line}" stroke-width="2"/>
      <g style="transform:scale(1)">${pots}</g>
      <rect x="82" y="78" width="10" height="156" rx="5" fill="#fff" opacity=".5"/>
      <rect x="76" y="248" width="168" height="22" rx="6" fill="#fff" stroke="${C.line}"/>
      <rect class="bar" x="80" y="252" width="0" height="14" rx="4" fill="${C.teal2}"/>
      <text class="day" x="160" y="263" text-anchor="middle" fill="${C.deep}" style="${FONT};font-size:8.5px;letter-spacing:.08em">DIA 000 / 180</text>
      <rect x="272" y="60" width="14" height="170" rx="7" fill="#fff" stroke="${C.line}"/>
      <rect class="th" x="276" y="140" width="6" height="86" rx="3" fill="#3f9a7f"/>
      <circle cx="279" cy="236" r="11" fill="#3f9a7f" stroke="#fff" stroke-width="2"/>`;
    const R = { air: [...svg.querySelectorAll('.air')], temp: svgEl(svg, '.temp'), ur: svgEl(svg, '.ur'), bar: svgEl(svg, '.bar'), day: svgEl(svg, '.day'), th: svgEl(svg, '.th') };
    const T = 9;
    return t => {
      R.air.forEach((el, i) => attr(el, 'stroke-dashoffset', f1(-(t * 30 + i * 9) % 24)));
      const p = (t % T) / T, d = Math.round(p * 180);
      attr(R.bar, 'width', f1(160 * p));
      txt(R.day, `DIA ${String(d).padStart(3, '0')} / 180`);
      const wob = Math.sin(t * 1.7) * .15 + Math.sin(t * 4.1) * .05;
      txt(R.temp, `${(40 + wob).toFixed(1).replace('.', ',')}°C`);
      txt(R.ur, `${Math.round(75 + Math.sin(t * .9) * .8)}%UR`);
      const h = 86 + wob * 40;
      attr(R.th, 'y', f1(226 - h)); attr(R.th, 'height', f1(h));
    };
  }

  /* =====================================================
     3. ENVASE DE LÍQUIDOS
     ===================================================== */
  function env(svg) {
    const id = 'bxL';
    svg.setAttribute('viewBox', '0 0 320 300');
    const body = 'M-30 -8 Q-30 0 -22 0 H22 Q30 0 30 -8 V-78 Q30 -92 14 -98 L12 -102 H-12 L-14 -98 Q-30 -92 -30 -78Z';
    svg.innerHTML = defs(id) + `
      <rect x="20" y="262" width="280" height="10" rx="5" fill="url(#${id}bl)"/>
      <rect x="96" y="16" width="128" height="62" rx="12" fill="url(#${id}st)" stroke="${C.line}" stroke-width="1.2"/>
      <rect x="108" y="28" width="62" height="38" rx="6" fill="${C.deep}"/>
      <text x="116" y="42" fill="${C.mint}" style="${FONT};font-size:7px;letter-spacing:.1em">VOLUME</text>
      <text class="ml" x="116" y="59" fill="#fff" style="${FONT};font-size:13px;font-weight:600">00,0</text>
      <circle cx="194" cy="38" r="9" fill="url(#${id}cy)" stroke="${C.line}"/>
      <circle class="led" cx="194" cy="60" r="3.5" fill="#3f9a7f"/>
      <g class="nz"><rect x="153" y="78" width="14" height="34" rx="2" fill="url(#${id}cy)" stroke="${C.line}"/><rect x="156" y="110" width="8" height="8" fill="#9aa9a4"/></g>
      <rect class="stream" x="158" y="118" width="4" height="0" rx="2" fill="url(#${id}lq)"/>
      <g class="bt"><g transform="translate(0 262)">
        <ellipse cx="0" cy="2" rx="38" ry="5" fill="#0b2b27" opacity=".12"/>
        <clipPath id="${id}cl"><path d="${body}"/></clipPath>
        <g clip-path="url(#${id}cl)"><rect class="liq" x="-32" y="0" width="64" height="110" fill="url(#${id}lq)" opacity=".92"/><ellipse class="surf" cx="0" cy="0" rx="32" ry="3" fill="#5aa593"/></g>
        <path d="${body}" fill="url(#${id}gl)" stroke="${C.glass}" stroke-width="1.2"/>
        <rect x="-11" y="-114" width="22" height="13" rx="2" fill="url(#${id}gl)" stroke="${C.glass}"/>
        <rect x="-30" y="-66" width="60" height="44" fill="${C.teal}"/>
        <text x="-22" y="-47" fill="#fff" style="${FONTD};font-weight:600;font-size:9px">SUA MARCA</text>
        <rect x="-22" y="-41" width="10" height="1.2" fill="#fff"/>
        <text x="-22" y="-30" fill="#fff" opacity=".8" style="${FONT};font-size:4.6px;letter-spacing:.06em">30 mL</text>
        <path d="M-22 -86 V-12" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        <g class="dc"><path d="M-8 -132 V-146 Q-8 -160 0 -160 Q8 -160 8 -146 V-132Z" fill="#f4f6f5" stroke="${C.line}"/><rect x="-14" y="-133" width="28" height="22" rx="2" fill="url(#${id}cy)" stroke="${C.line}"/><g stroke="#d3dcd8">${ridges(-12, 12, -130, 16, 3)}</g></g>
      </g></g>`;
    const R = { bt: svgEl(svg, '.bt'), liq: svgEl(svg, '.liq'), surf: svgEl(svg, '.surf'), stream: svgEl(svg, '.stream'), nz: svgEl(svg, '.nz'), ml: svgEl(svg, '.ml'), dc: svgEl(svg, '.dc'), led: svgEl(svg, '.led') };
    const T = 5;
    return t => {
      const p = t % T;
      const x = 160 - (1 - eOut(seg(p, 0, .7))) * 220 + eIO(seg(p, 4.3, T)) * 220;
      attr(R.bt, 'transform', `translate(${f1(x)} 0)`);
      const fill = eIO(seg(p, 1.1, 3.3));
      const down = eOut(seg(p, .7, 1.05)) * (1 - eIO(seg(p, 3.3, 3.6)));
      attr(R.nz, 'transform', `translate(0 ${f1(down * 28)})`);
      const lvl = -4 - fill * 84;
      attr(R.liq, 'y', f1(lvl)); attr(R.surf, 'cy', f1(lvl)); attr(R.surf, 'ry', f1(2 + Math.sin(t * 9) * .8));
      const flowing = p > 1.1 && p < 3.3;
      const sTop = 118 + down * 28;
      attr(R.stream, 'y', f1(sTop)); attr(R.stream, 'height', flowing ? f1(Math.max(0, 262 + lvl - sTop)) : 0);
      txt(R.ml, (fill * 30).toFixed(1).replace('.', ',').padStart(4, '0'));
      attr(R.led, 'opacity', flowing ? (Math.sin(t * 16) > 0 ? 1 : .3) : 1);
      const cp = seg(p, 3.6, 4.1);
      attr(R.dc, 'transform', `translate(0 ${f1(-(1 - eOut(cp)) * 70)})`);
      attr(R.dc, 'opacity', p > 3.55 ? 1 : 0);
    };
  }

  /* =====================================================
     4. ROTULAGEM: rolo aplica o rótulo com a sua marca
     ===================================================== */
  function rot(svg) {
    const id = 'bxR';
    svg.setAttribute('viewBox', NARROW ? '40 24 420 372' : '0 0 640 260');
    const names = ['SUA MARCA', 'VITALIS', 'NOVA FÓRMULA', 'PURE+', 'ATHLOS', 'BEM VIVER'];
    const pot = glassPot(id, 132, 136, { sub: '60 CÁPSULAS' });
    svg.innerHTML = defs(id) + `
      <rect x="${NARROW ? 54 : 20}" y="236" width="${NARROW ? 402 : 600}" height="10" rx="5" fill="url(#${id}bl)"/>
      <!-- rolo de rótulos -->
      <g transform="translate(118 96)"><circle class="stock" r="54" fill="${C.teal}"/><circle r="54" fill="none" stroke="#0b2b27" stroke-opacity=".25" stroke-dasharray="1 3"/><circle r="18" fill="url(#${id}cy)" stroke="${C.line}"/><g class="spk"><line x1="-18" x2="18" stroke="${C.line}" stroke-width="2"/><line y1="-18" y2="18" stroke="${C.line}" stroke-width="2"/></g></g>
      <g transform="translate(150 196)"><circle r="20" fill="#f1ede4" stroke="${C.line}"/><circle r="8" fill="url(#${id}cy)" stroke="${C.line}"/><g class="spk2"><line x1="-8" x2="8" stroke="${C.line}" stroke-width="1.6"/></g></g>
      <path d="M118 150 C 160 170, 230 176, 292 168" stroke="${C.teal}" stroke-width="5" fill="none"/>
      <path d="M150 176 C 190 150, 240 146, 292 150" stroke="#e6dfd2" stroke-width="2.5" fill="none"/>
      <rect x="268" y="40" width="14" height="196" rx="4" fill="url(#${id}cy)" stroke="${C.line}"/>
      <rect x="248" y="34" width="190" height="16" rx="6" fill="url(#${id}st)" stroke="${C.line}"/>
      <g transform="translate(372 236)">
        <clipPath id="${id}clp"><rect x="-66" y="-112" width="132" height="64"/></clipPath>
        ${pot.markup.replace('<g class="lab">', `<g class="lab" clip-path="url(#${id}clp)"><g class="labw">`).replace('</text></g>', '</text></g></g>')}
        ${pot.capMarkup}
        <rect class="sh1" x="-66" y="-136" width="10" height="136" fill="#fff" opacity=".22"/>
      </g>
      <!-- painel -->
      <g transform="${NARROW ? 'translate(175 266)' : 'translate(470 70)'}">
        <rect width="150" height="120" rx="14" fill="#fff" stroke="${C.line}"/>
        <text x="16" y="26" fill="${C.teal}" style="${FONT};font-size:8.5px;letter-spacing:.1em">ARTE APROVADA</text>
        <circle class="ok" cx="130" cy="23" r="7" fill="${C.teal}"/><path class="okp" d="M126.5 23 l2.4 2.4 L134 20.6" stroke="#fff" stroke-width="1.6" fill="none"/>
        <rect x="16" y="40" width="118" height="34" rx="8" fill="#f4f9f7" stroke="#d7e6e0"/>
        <text class="typed" x="26" y="62" fill="${C.deep}" style="${FONTD};font-weight:600;font-size:13px"></text>
        <rect class="caret" x="0" y="50" width="1.6" height="16" fill="${C.teal}"/>
        <text x="16" y="96" fill="#5d6d68" style="${FONT};font-size:7.5px;letter-spacing:.08em">TABELA ✓  ANVISA ✓</text>
      </g>`;
    const R = { labw: svgEl(svg, '.labw'), brand: svgEl(svg, '.lab__b'), typed: svgEl(svg, '.typed'), caret: svgEl(svg, '.caret'), spk: svgEl(svg, '.spk'), spk2: svgEl(svg, '.spk2'), sh: svgEl(svg, '.sh1'), ok: svgEl(svg, '.ok'), okp: svgEl(svg, '.okp') };
    const T = 4.4;
    let lastC = -1;
    return t => {
      const c = Math.floor(t / T), p = t % T;
      const name = names[c % names.length];
      if (c !== lastC) { lastC = c; R.brand.textContent = name; }
      const typeK = seg(p, .1, 1.3);
      const typed = name.slice(0, Math.round(typeK * name.length));
      txt(R.typed, typed);
      const tw = R.typed.getComputedTextLength ? R.typed.getComputedTextLength() : typed.length * 8;
      attr(R.caret, 'x', f1(26 + tw + 2)); attr(R.caret, 'opacity', Math.sin(t * 9) > 0 ? 1 : 0);
      const okk = p > 1.4 ? 1 : 0; attr(R.ok, 'opacity', okk); attr(R.okp, 'opacity', okk);
      // aplica: rótulo entra da direita para a esquerda enquanto o pote gira
      const w = eIO(seg(p, 1.6, 3.2));
      attr(R.labw, 'transform', `translate(${f1((1 - w) * 132)} 0)`);
      const spin = w * 300 + c * 300;
      attr(R.spk, 'transform', `rotate(${f1(spin)})`); attr(R.spk2, 'transform', `rotate(${f1(-spin * 2)})`);
      attr(R.sh, 'x', f1(-66 + ((p * 90) % 140)));
    };
  }

  /* =====================================================
     5. CONTROLE DE QUALIDADE: esteira + scanner + checklist
     ===================================================== */
  function qc(svg) {
    const id = 'bxQ';
    svg.setAttribute('viewBox', NARROW ? '14 16 452 432' : '0 0 640 260');
    const items = ['Peso', 'Lacre', 'Rótulo', 'Lote'];
    let pots = '';
    for (let i = 0; i < 6; i++) { const g = glassPot(id, 58, 62, { brand: 'MARCA', sub: '' }); pots += `<g class="qp"><g transform="translate(0 0)">${g.markup}${g.capMarkup}</g></g>`; }
    let rollers = ''; for (let x = 40; x <= 440; x += 28) rollers += `<circle class="rl" cx="${x}" cy="222" r="5" fill="url(#${id}cy)" stroke="${C.line}"/>`;
    svg.innerHTML = defs(id) + `
      <rect x="22" y="206" width="436" height="12" rx="6" fill="url(#${id}bl)"/>
      ${rollers}
      <clipPath id="${id}cv"><rect x="22" y="0" width="436" height="210"/></clipPath>
      <g clip-path="url(#${id}cv)">${pots}</g>
      <!-- pórtico -->
      <rect x="196" y="40" width="10" height="168" rx="3" fill="url(#${id}cy)" stroke="${C.line}"/>
      <rect x="290" y="40" width="10" height="168" rx="3" fill="url(#${id}cy)" stroke="${C.line}"/>
      <rect x="186" y="28" width="124" height="34" rx="8" fill="url(#${id}st)" stroke="${C.line}"/>
      <rect x="230" y="60" width="36" height="10" rx="3" fill="${C.deep}"/>
      <path class="cone" d="M236 70 L214 196 H282 L260 70Z" fill="url(#${id}bm)" opacity="0"/>
      <rect class="scan" x="214" y="120" width="68" height="2" fill="#3f9a7f" opacity="0"/>
      <!-- checklist -->
      <g transform="${NARROW ? 'translate(167 248)' : 'translate(476 34)'}">
        <rect width="146" height="186" rx="14" fill="#fff" stroke="${C.line}"/>
        <text x="16" y="26" fill="${C.teal}" style="${FONT};font-size:8.5px;letter-spacing:.1em">INSPEÇÃO</text>
        <text class="lot" x="130" y="26" text-anchor="end" fill="#5d6d68" style="${FONT};font-size:8px">#0412</text>
        ${items.map((n, i) => `<g transform="translate(16 ${50 + i * 30})"><rect width="114" height="22" rx="7" fill="#f4f9f7"/><text x="10" y="15" fill="${C.deep}" style="font-family:Inter,sans-serif;font-size:11px;font-weight:600">${n}</text><circle class="ck" cx="102" cy="11" r="7" fill="#dfe8e4"/><path class="ckp" d="M98.5 11 l2.4 2.4 L106 8.6" stroke="#fff" stroke-width="1.6" fill="none" opacity="0"/></g>`).join('')}
        <rect class="ap" x="16" y="166" width="114" height="0" rx="6" fill="${C.teal}"/>
        <text class="apt" x="73" y="174" text-anchor="middle" fill="#fff" style="${FONT};font-size:8px;letter-spacing:.12em" opacity="0">APROVADO</text>
      </g>`;
    const R = { pots: [...svg.querySelectorAll('.qp')], rl: [...svg.querySelectorAll('.rl')], cone: svgEl(svg, '.cone'), scan: svgEl(svg, '.scan'), ck: [...svg.querySelectorAll('.ck')], ckp: [...svg.querySelectorAll('.ckp')], lot: svgEl(svg, '.lot'), ap: svgEl(svg, '.ap'), apt: svgEl(svg, '.apt') };
    const P = 96, T = 2.4; // passo da esteira
    return t => {
      const c = Math.floor(t / T), p = t % T;
      const mv = eIO(seg(p, 0, .8));
      const off = (c + mv) * P;
      R.pots.forEach((el, i) => {
        const x = 248 - 2 * P + ((i * P + off) % (6 * P)) - P * 1.5 + P * .5;
        attr(el, 'transform', `translate(${f1(x)} 206)`);
      });
      R.rl.forEach((el, i) => attr(el, 'transform', `rotate(${f1(off * 3 % 360)} ${40 + i * 28} 222)`));
      const scanning = p > .85 && p < 2.1;
      const sk = seg(p, .85, 1.9);
      attr(R.cone, 'opacity', scanning ? .9 : 0); attr(R.scan, 'opacity', scanning ? 1 : 0);
      attr(R.scan, 'y', f1(150 + Math.sin(sk * Math.PI * 3) * 40));
      R.ck.forEach((el, i) => { const on = p > .95 + i * .22; attr(el, 'fill', on ? '#3f9a7f' : '#dfe8e4'); attr(R.ckp[i], 'opacity', on ? 1 : 0); });
      const ap = eBack(seg(p, 1.9, 2.15));
      attr(R.ap, 'height', f1(p > 1.9 ? 14 * Math.min(1, ap) : 0)); attr(R.ap, 'y', f1(166));
      attr(R.apt, 'opacity', p > 2 ? 1 : 0);
      txt(R.lot, '#' + String(412 + c).padStart(4, '0'));
    };
  }

  /* =====================================================
     6. LAUDO POR LOTE + ANVISA
     ===================================================== */
  function laudo(svg) {
    const id = 'bxD';
    svg.setAttribute('viewBox', '0 0 320 300');
    const rows = [['Aspecto', 'Conforme'], ['Peso médio', 'Conforme'], ['Desintegração', 'Conforme'], ['Microbiologia', 'Conforme']];
    svg.innerHTML = defs(id) + `
      <rect x="78" y="30" width="176" height="242" rx="10" fill="#0b2b27" opacity=".08" transform="translate(6 6)"/>
      <rect x="78" y="30" width="176" height="242" rx="10" fill="#fff" stroke="${C.line}"/>
      <rect x="78" y="30" width="176" height="40" rx="10" fill="${C.teal}"/><rect x="78" y="60" width="176" height="10" fill="${C.teal}"/>
      <text x="94" y="55" fill="#fff" style="${FONT};font-size:9px;letter-spacing:.12em">LAUDO DE ANÁLISE</text>
      <text class="lot" x="94" y="92" fill="${C.deep}" style="${FONTD};font-size:14px;font-weight:600">Lote 0412</text>
      <rect class="ln" x="94" y="102" width="0" height="4" rx="2" fill="#dfe8e4"/>
      ${rows.map(([a, b], i) => `<g class="rw" opacity="0" transform="translate(94 ${124 + i * 26})"><text y="10" fill="#5d6d68" style="font-family:Inter,sans-serif;font-size:9.5px">${a}</text><text x="144" y="10" text-anchor="end" fill="#3f9a7f" style="font-family:Inter,sans-serif;font-size:9.5px;font-weight:600">${b} ✓</text><line x1="0" y1="18" x2="144" y2="18" stroke="#eef2f0"/></g>`).join('')}
      <rect x="94" y="236" width="60" height="4" rx="2" fill="#dfe8e4"/><rect x="94" y="246" width="40" height="4" rx="2" fill="#dfe8e4"/>
      <g class="stamp" opacity="0"><g transform="translate(206 226) rotate(-14)">
        <circle r="34" fill="none" stroke="#3f9a7f" stroke-width="2.4"/><circle r="28" fill="none" stroke="#3f9a7f" stroke-width="1"/>
        <text y="3" text-anchor="middle" fill="#3f9a7f" style="${FONT};font-size:9px;font-weight:700;letter-spacing:.12em">APROVADO</text>
        <text y="15" text-anchor="middle" fill="#3f9a7f" style="${FONT};font-size:5.5px;letter-spacing:.14em">CONTROLE CQ</text></g></g>
      <g class="anv" opacity="0" transform="translate(30 0)"><rect x="196" y="18" width="104" height="30" rx="15" fill="${C.deep}"/><circle cx="212" cy="33" r="7" fill="#3f9a7f"/><path d="M208.5 33 l2.4 2.4 L216 30.6" stroke="#fff" stroke-width="1.6" fill="none"/><text x="226" y="37" fill="#fff" style="${FONT};font-size:8.5px;letter-spacing:.08em">ANVISA</text></g>`;
    const R = { rows: [...svg.querySelectorAll('.rw')], ln: svgEl(svg, '.ln'), stamp: svgEl(svg, '.stamp'), lot: svgEl(svg, '.lot'), anv: svgEl(svg, '.anv') };
    const T = 5.4;
    return t => {
      const c = Math.floor(t / T), p = t % T;
      txt(R.lot, 'Lote ' + String(412 + c).padStart(4, '0'));
      attr(R.ln, 'width', f1(144 * eOut(seg(p, .2, .9))));
      R.rows.forEach((el, i) => { const k = eOut(seg(p, .7 + i * .35, 1.1 + i * .35)); attr(el, 'opacity', f1(k)); attr(el, 'transform', `translate(${f1(94 + (1 - k) * 12)} ${124 + i * 26})`); });
      const sk = seg(p, 2.4, 2.75);
      const sc = p < 2.4 ? 2 : 2 - eOut(sk);
      attr(R.stamp, 'opacity', p > 2.4 ? (p > 5 ? f1(1 - seg(p, 5, T)) : 1) : 0);
      attr(R.stamp, 'transform', `translate(206 226) scale(${f1(sc)}) translate(-206 -226)`);
      const ak = eBack(seg(p, 3, 3.5));
      attr(R.anv, 'opacity', f1(p > 3 ? Math.min(1, ak) * (p > 5 ? 1 - seg(p, 5, T) : 1) : 0));
      attr(R.anv, 'transform', `translate(${f1((1 - Math.min(1, ak)) * 30)} 0)`);
    };
  }

  const W = { enc, stab, env, rot, qc, laudo };
  const runs = els.map(svg => {
    const fn = W[svg.dataset.w]; if (!fn) return null;
    const r = { frame: fn(svg), on: false, t: Math.random() * 2 };
    // só anima o que está realmente na tela (no celular, no máx. 1–2 cards por vez)
    new IntersectionObserver(([e]) => { r.on = e.isIntersecting && e.intersectionRatio > .12; }, { threshold: [0, .12, .3] }).observe(svg);
    r.frame(reduce ? 4 : r.t);
    return r;
  }).filter(Boolean);
  if (reduce) return;
  let last = 0, raf = 0;
  const tick = now => {
    raf = 0;
    const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
    let any = false;
    if (!document.hidden) for (const r of runs) if (r.on) { any = true; r.t += dt; r.frame(r.t); }
    // sem card visível o relógio dorme (volta quando algum entra na tela)
    if (any) raf = requestAnimationFrame(tick); else last = 0;
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) wake(); }, { threshold: [0, .12, .3] }).observe(document.querySelector('.bento') || document.body);
  els.forEach(el => new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) setTimeout(wake, 0); }, { threshold: [.12, .3] }).observe(el));
  document.addEventListener('visibilitychange', wake);
  wake();
})();
