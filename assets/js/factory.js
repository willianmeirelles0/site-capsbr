/* =========================================================
   CapsBR · Linha de produção animada (SVG)
   Cápsulas: mistura → encapsulamento → tampa → rótulo → inspeção
   Líquidos: preparo → envase → conta-gotas → rótulo → inspeção
   Um único relógio move os frascos em passos (como uma esteira real);
   cada máquina reage ao frasco que está embaixo dela.
   ========================================================= */
(() => {
  const svg = document.querySelector('.js-fac-svg');
  if (!svg) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eOut = t => 1 - Math.pow(1 - t, 3);
  const eBack = t => { const c = 2.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  const BY = 370, X0 = 140, PITCH = 230, T = 2.8, MOVE = .9;
  const SX = [0, 1, 2, 3, 4].map(i => X0 + PITCH * i);
  const C = { teal: '#14483f', teal2: '#1d5c50', deep: '#0e3631', mint: '#9cc7b9', cream: '#efe6d6', line: '#b7c5bf', dark: '#5d6d68' };
  // rótulo real da CapsBR: verde petróleo com texto branco
  const THEMES = [['#14483f', '#ffffff'], ['#14483f', '#ffffff'], ['#14483f', '#ffffff'], ['#14483f', '#ffffff']];
  const FONT = "font-family:'JetBrains Mono',ui-monospace,monospace";
  const FONTD = "font-family:'Inter Tight',Inter,sans-serif";

  const defs = `<defs>
    <linearGradient id="fgSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfc"/><stop offset="1" stop-color="#dfe6e3"/></linearGradient>
    <linearGradient id="fgCyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cbd5d1"/><stop offset=".42" stop-color="#fbfcfc"/><stop offset="1" stop-color="#c0ccc7"/></linearGradient>
    <linearGradient id="fgPot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e1e7e4"/><stop offset=".35" stop-color="#ffffff"/><stop offset="1" stop-color="#d3dbd7"/></linearGradient>
    <linearGradient id="fgTeal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0e3631"/><stop offset=".4" stop-color="#22695b"/><stop offset="1" stop-color="#0e3631"/></linearGradient>
    <linearGradient id="fgGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfeae6" stop-opacity=".75"/><stop offset=".3" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#cfdcd7" stop-opacity=".7"/></linearGradient>
    <linearGradient id="fgLiq" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d5c50"/><stop offset=".4" stop-color="#3b8a79"/><stop offset="1" stop-color="#1d5c50"/></linearGradient>
    <linearGradient id="fgBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc7b9" stop-opacity="0"/><stop offset="1" stop-color="#9cc7b9" stop-opacity=".55"/></linearGradient>
    <linearGradient id="fgBelt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c6b5f"/><stop offset=".25" stop-color="#14483f"/><stop offset="1" stop-color="#0b2b27"/></linearGradient>
    <clipPath id="fgClipPot"><path d="M-31 -10 Q-31 -1 -22 -1 H22 Q31 -1 31 -10 V-68 Q31 -77 22 -77 H-22 Q-31 -77 -31 -68Z"/></clipPath>
    <clipPath id="fgClipBot"><path d="M-21 -8 Q-21 -1 -14 -1 H14 Q21 -1 21 -8 V-58 Q21 -67 10 -71 L9 -73 H-9 L-10 -71 Q-21 -67 -21 -58Z"/></clipPath>
    <clipPath id="fgClipCap"><rect x="-24" y="-102" width="48" height="15" rx="3"/></clipPath>
    <clipPath id="fgClipCol"><rect x="-12" y="-100" width="24" height="18" rx="2"/></clipPath>
  </defs>`;

  /* ---------- peças ---------- */
  const capsuleMini = (x, y, r, c1 = '#e6d8bd') => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-3.4" y="-8" width="6.8" height="16" rx="3.4" fill="#f3ead9" stroke="#d9c9a9" stroke-width=".5"/><path d="M-3.4 0 V-4.6 A3.4 3.4 0 0 1 3.4 -4.6 V0Z" fill="${c1}"/><rect x="-2.2" y="-6" width="1.2" height="10" rx=".6" fill="#fff" opacity=".7"/></g>`;
  let rs = 11; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
  const pile = (() => { let s = ''; for (let row = 0; row < 9; row++) for (let i = 0; i < 5; i++) s += capsuleMini(-24 + i * 12 + (row % 2) * 6 + (rnd() - .5) * 3, -6 - row * 8.2, (rnd() - .5) * 140, rnd() > .5 ? '#eadfc8' : '#e2d3b6'); return s; })();
  const ridges = (x0, x1, y, h, step = 4) => { let s = ''; for (let x = x0; x <= x1 + step * 2; x += step) s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + h}"/>`; return s; };
  const capMarkup = `<rect x="-24" y="-102" width="48" height="15" rx="3" fill="url(#fgPot)" stroke="${C.line}"/><g clip-path="url(#fgClipCap)"><g class="rid" stroke="#cfd8d4" stroke-width="1.2">${ridges(-30, 26, -101, 13)}</g></g><rect x="-24" y="-102" width="48" height="3" rx="1.5" fill="#fff"/>`;
  const dropMarkup = `<path d="M-7 -100 V-111 Q-7 -124 0 -124 Q7 -124 7 -111 V-100Z" fill="#e5eae7" stroke="${C.line}"/><rect x="-12" y="-100" width="24" height="18" rx="2" fill="url(#fgPot)" stroke="${C.line}"/><g clip-path="url(#fgClipCol)"><g class="rid" stroke="#cfd8d4" stroke-width="1.1">${ridges(-18, 14, -99, 16, 3)}</g></g>`;

  function potMarkup(kind, theme) {
    const [bg, ink] = theme;
    if (kind === 'pot') return `
      <ellipse cx="0" cy="1" rx="38" ry="5" fill="#0b2b27" opacity=".14"/>
      <g clip-path="url(#fgClipPot)"><g class="fill">${pile}</g></g>
      <path d="M-31 -10 Q-31 -1 -22 -1 H22 Q31 -1 31 -10 V-68 Q31 -77 22 -77 H-22 Q-31 -77 -31 -68Z" fill="url(#fgGlass)" fill-opacity=".28" stroke="#a9bdb6"/>
      <path d="M-25 -64 V-16" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <rect x="-22" y="-88" width="44" height="12" rx="2" fill="url(#fgGlass)" fill-opacity=".45" stroke="#a9bdb6"/>
      <g class="lab"><rect class="lab__r" x="-31" y="-64" width="0" height="48" fill="${bg}"/>
        <g class="lab__t" opacity="0"><text x="0" y="-40" text-anchor="middle" fill="${ink}" style="${FONTD};font-weight:700;font-size:10.5px;letter-spacing:-.02em">SUA MARCA</text><rect x="-7" y="-34" width="14" height="1.6" fill="${ink}"/><text x="0" y="-24" text-anchor="middle" fill="${ink}" opacity=".75" style="${FONT};font-size:5.4px;letter-spacing:.08em">60 CÁPSULAS</text></g></g>
      <rect class="shine" x="-31" y="-64" width="6" height="48" fill="#fff" opacity="0"/>
      <g class="cap" opacity="0">${capMarkup}</g>
      <g class="badge" transform="translate(0 -124) scale(0)"><circle r="11" fill="${C.teal}"/><path d="M-5 .5 l3.4 3.4 L5.4 -4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    return `
      <ellipse cx="0" cy="1" rx="27" ry="4" fill="#0b2b27" opacity=".14"/>
      <g clip-path="url(#fgClipBot)"><rect class="fill" x="-22" y="-62" width="44" height="64" fill="url(#fgLiq)" opacity=".9"/></g>
      <path d="M-21 -8 Q-21 -1 -14 -1 H14 Q21 -1 21 -8 V-58 Q21 -67 10 -71 L9 -73 H-9 L-10 -71 Q-21 -67 -21 -58Z" fill="url(#fgGlass)" fill-opacity=".55" stroke="#a9bdb6"/>
      <rect x="-9" y="-84" width="18" height="12" rx="1.5" fill="url(#fgGlass)" stroke="#a9bdb6"/>
      <g class="lab"><rect class="lab__r" x="-21" y="-52" width="0" height="38" fill="${bg}"/>
        <g class="lab__t" opacity="0"><text x="0" y="-33" text-anchor="middle" fill="${ink}" style="${FONTD};font-weight:700;font-size:6.2px;letter-spacing:-.01em">SUA MARCA</text><rect x="-5" y="-28" width="10" height="1.3" fill="${ink}"/><text x="0" y="-20" text-anchor="middle" fill="${ink}" opacity=".75" style="${FONT};font-size:4.4px;letter-spacing:.08em">30 ML</text></g></g>
      <rect class="shine" x="-21" y="-52" width="5" height="38" fill="#fff" opacity="0"/>
      <g class="cap" opacity="0">${dropMarkup}</g>
      <g class="badge" transform="translate(0 -142) scale(0)"><circle r="11" fill="${C.teal}"/><path d="M-5 .5 l3.4 3.4 L5.4 -4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }

  /* ---------- cenário comum ---------- */
  function conveyor() {
    let rollers = '', legs = '';
    for (let x = 20; x < 1200; x += 46) rollers += `<g transform="translate(${x} ${BY + 11})"><circle r="6.5" fill="#0b2b27"/><line class="spoke" x1="-5" y1="0" x2="5" y2="0" stroke="#2c6b5f" stroke-width="1.6"/></g>`;
    for (let x = 30; x < 1200; x += 230) legs += `<rect x="${x}" y="${BY + 22}" width="12" height="${452 - BY - 22}" rx="3" fill="url(#fgCyl)"/><rect x="${x - 6}" y="450" width="24" height="5" rx="2" fill="#c9d3cf"/>`;
    return `<g class="belt">${legs}
      <rect x="-10" y="${BY}" width="1220" height="22" rx="11" fill="url(#fgBelt)"/>
      <line class="dash" x1="-10" y1="${BY + 2}" x2="1210" y2="${BY + 2}" stroke="#3b8a79" stroke-width="2" stroke-dasharray="3 17"/>
      ${rollers}</g>`;
  }
  function stationLabels(names) {
    return names.map((n, i) => `<g class="fst__lbl" data-st="${i}" transform="translate(${SX[i]} 432)"><rect x="-${n.length * 3.6 + 26}" y="-13" width="${n.length * 7.2 + 52}" height="26" rx="13" fill="#fff" stroke="#e2e8e5"/><text x="-${n.length * 3.6 + 10}" y="4" fill="${C.teal}" style="${FONT};font-size:10.5px;font-weight:500">0${i + 1}</text><text x="${-n.length * 3.6 + 12}" y="4" fill="${C.dark}" style="${FONT};font-size:10.5px;letter-spacing:.02em">${n}</text></g>`).join('');
  }
  const housing = (x, y0, y1, w = 160, extra = '') => `<rect x="${x - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" rx="16" fill="url(#fgSteel)" stroke="${C.line}"/><rect x="${x - w / 2 + 10}" y="${y0 + 10}" width="${w - 20}" height="4" rx="2" fill="#fff" opacity=".9"/>${extra}`;
  const column = (x, y0) => `<rect x="${x}" y="${y0}" width="16" height="${BY - y0}" fill="url(#fgCyl)" stroke="${C.line}"/>`;
  const led = (x, y, cls = 'led') => `<circle class="${cls}" cx="${x}" cy="${y}" r="3.6" fill="${C.mint}"/>`;
  const pipe = d => `<path d="${d}" fill="none" stroke="#c9d3cf" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#eef2f0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path class="flow" d="${d}" fill="none" stroke="${C.mint}" stroke-width="3" stroke-dasharray="5 11" stroke-linecap="round"/>`;

  /* ---------- LINHA DE CÁPSULAS ---------- */
  function buildCaps(g) {
    const x0 = SX[0], x1 = SX[1], x2 = SX[2], x3 = SX[3], x4 = SX[4];
    const holes = Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return `<circle cx="${Math.cos(a) * 20}" cy="${Math.sin(a) * 20}" r="5.2" fill="${i % 2 ? C.cream : C.mint}"/>`; }).join('');
    const dots = Array.from({ length: 16 }, (_, i) => `<circle class="pw" r="${1.6 + (i % 3)}" fill="${[C.cream, C.mint, '#d9ccb2', '#fff'][i % 4]}"/>`).join('');
    const mag = Array.from({ length: 7 }, (_, i) => `<rect x="${x2 - 66}" y="${44 + i * 17}" width="28" height="13" rx="2.5" fill="#fbfbfa" stroke="${C.line}"/>`).join('');
    g.innerHTML = `
      <g class="fm" data-st="0">
        <rect x="${x0 - 74}" y="186" width="10" height="${BY - 186}" fill="url(#fgCyl)"/><rect x="${x0 + 64}" y="186" width="10" height="${BY - 186}" fill="url(#fgCyl)"/>
        <rect x="${x0 - 86}" y="180" width="172" height="12" rx="6" fill="url(#fgSteel)" stroke="${C.line}"/>
        <path d="M${x0 - 40} 180 L${x0} 112 L${x0 + 40} 180" fill="none" stroke="#c3cec9" stroke-width="8" stroke-linejoin="round"/>
        <g class="mix" transform="translate(${x0} 112)">
          <rect x="-66" y="-40" width="132" height="80" rx="40" fill="url(#fgTeal)" stroke="${C.deep}"/>
          <rect x="-40" y="-14" width="80" height="28" rx="14" fill="#0b2b27"/>
          <g class="pws">${dots}</g>
          <rect x="-66" y="-3" width="132" height="6" fill="#0b2b27" opacity=".35"/>
        </g>
        <circle cx="${x0}" cy="112" r="9" fill="url(#fgSteel)" stroke="${C.line}"/>
        <rect x="${x0 + 70}" y="98" width="24" height="28" rx="5" fill="url(#fgSteel)" stroke="${C.line}"/>
        ${pipe(`M${x0 + 94} 112 H${x1 - 46} Q${x1 - 34} 112 ${x1 - 34} 100 V36`)}
      </g>
      <g class="fm" data-st="1">
        ${column(x1 + 56, 232)}
        <path d="M${x1 - 64} 28 H${x1 + 64} L${x1 + 24} 96 H${x1 - 24}Z" fill="url(#fgGlass)" stroke="${C.line}"/>
        <g clip-path="none">${Array.from({ length: 14 }, (_, i) => capsuleMini(x1 - 40 + (i % 7) * 13 + (i > 6 ? 6 : 0), 80 - (i > 6 ? 14 : 0) - (i % 2) * 2, (i * 47) % 180 - 90)).join('')}</g>
        ${housing(x1, 96, 232)}
        <circle cx="${x1}" cy="160" r="38" fill="${C.deep}"/><circle cx="${x1}" cy="160" r="38" fill="none" stroke="#c3cec9" stroke-width="5"/>
        <g class="disc" transform="translate(${x1} 160)"><circle r="30" fill="#1a5248"/>${holes}<circle r="6" fill="url(#fgSteel)"/></g>
        ${led(x1 + 60, 112)}<rect x="${x1 - 70}" y="208" width="40" height="12" rx="3" fill="#0b2b27"/><text class="ctr" x="${x1 - 50}" y="217.5" text-anchor="middle" fill="${C.mint}" style="${FONT};font-size:8px">060</text>
        <path d="M${x1 - 12} 232 H${x1 + 12} L${x1 + 7} 264 H${x1 - 7}Z" fill="url(#fgCyl)" stroke="${C.line}"/>
        <g class="falls">${Array.from({ length: 6 }, () => `<g class="fall" opacity="0">${capsuleMini(0, 0, 0)}</g>`).join('')}</g>
      </g>
      <g class="fm" data-st="2">
        ${column(x2 + 52, 178)}
        ${mag}<rect x="${x2 - 70}" y="40" width="36" height="140" rx="6" fill="url(#fgGlass)" stroke="${C.line}" fill-opacity=".5"/>
        ${housing(x2, 60, 178, 150, `<rect x="${x2 - 20}" y="86" width="74" height="30" rx="6" fill="#0b2b27"/><text x="${x2 - 12}" y="99" fill="${C.mint}" opacity=".7" style="${FONT};font-size:7px">TORQUE</text><rect x="${x2 - 12}" y="104" width="58" height="4" rx="2" fill="#1a5248"/><rect class="tq" x="${x2 - 12}" y="104" width="0" height="4" rx="2" fill="${C.mint}"/>`)}
        ${led(x2 + 58, 76)}
        <rect class="rod" x="${x2 - 4}" y="178" width="8" height="30" fill="url(#fgCyl)" stroke="${C.line}"/>
      </g>
      <g class="fm" data-st="3">
        ${column(x3 + 56, 190)}
        ${housing(x3, 70, 190)}
        <rect x="${x3 - 70}" y="190" width="10" height="120" rx="3" fill="url(#fgCyl)" transform="rotate(-8 ${x3 - 65} 190)"/>
        <path d="M${x3 - 62} 300 L${x3 - 32} 326 L${x3 - 62} 336Z" fill="url(#fgSteel)" stroke="${C.line}"/>
        <path class="web" d="M${x3 - 72} 130 L${x3 - 33} 326 L${x3 - 50} 334 L${x3 - 60} 190" fill="none" stroke="${C.teal}" stroke-width="2.4"/>
        <g class="roll" transform="translate(${x3 - 40} 130)"><circle r="34" fill="#fff" stroke="${C.line}"/><circle class="stock" r="28" fill="${C.teal}"/><circle r="10" fill="url(#fgSteel)" stroke="${C.line}"/><path d="M-6 0 H6 M0 -6 V6" stroke="${C.line}" stroke-width="2"/></g>
        <g class="roll2" transform="translate(${x3 + 34} 130)"><circle r="20" fill="#eef2f0" stroke="${C.line}"/><circle r="7" fill="url(#fgSteel)" stroke="${C.line}"/><path d="M-4 0 H4 M0 -4 V4" stroke="${C.line}" stroke-width="2"/></g>
        ${led(x3 + 62, 86)}
      </g>
      <g class="fm" data-st="4">${inspector(x4)}</g>`;
  }
  function inspector(x) {
    return `
      <rect x="${x - 64}" y="206" width="12" height="${BY - 206}" fill="url(#fgCyl)" stroke="${C.line}"/><rect x="${x + 52}" y="206" width="12" height="${BY - 206}" fill="url(#fgCyl)" stroke="${C.line}"/>
      ${housing(x, 140, 210, 150)}
      <rect x="${x - 52}" y="156" width="54" height="36" rx="7" fill="#0b2b27"/>
      <text class="scr" x="${x - 25}" y="179" text-anchor="middle" fill="${C.mint}" style="${FONT};font-size:10px;font-weight:500">CQ</text>
      <text x="${x + 14}" y="171" fill="${C.dark}" style="${FONT};font-size:7.5px">LOTE</text><text class="lot" x="${x + 14}" y="183" fill="${C.teal}" style="${FONT};font-size:9px;font-weight:500">0412</text>
      <circle cx="${x}" cy="212" r="9" fill="${C.deep}"/><circle cx="${x}" cy="212" r="4" fill="${C.mint}"/>
      <g class="beam" opacity="0"><path class="beam__cone" d="M${x - 5} 214 L${x - 48} 300 H${x + 48} L${x + 5} 214Z" fill="url(#fgBeam)" opacity=".5"/><rect class="beam__line" x="${x - 50}" y="300" width="100" height="2.5" rx="1.2" fill="${C.mint}"/></g>
      ${led(x + 60, 156)}`;
  }

  /* ---------- LINHA DE LÍQUIDOS ---------- */
  function buildLiq(g) {
    const x0 = SX[0], x1 = SX[1], x2 = SX[2], x3 = SX[3], x4 = SX[4];
    const mag = Array.from({ length: 5 }, (_, i) => `<g transform="translate(${x2 - 52} ${150 - i * 26}) scale(.9)">${dropMarkup.replace('class="rid"', 'class="rid0"')}</g>`).join('');
    g.innerHTML = `
      <g class="fm" data-st="0">
        <rect x="${x0 - 60}" y="200" width="10" height="${BY - 200}" fill="url(#fgCyl)"/><rect x="${x0 + 50}" y="200" width="10" height="${BY - 200}" fill="url(#fgCyl)"/>
        <rect x="${x0 - 62}" y="44" width="124" height="160" rx="22" fill="url(#fgCyl)" stroke="${C.line}"/>
        <rect x="${x0 - 44}" y="66" width="88" height="118" rx="12" fill="#e9f1ee" stroke="${C.line}"/>
        <path class="wave" d="" fill="url(#fgLiq)" opacity=".92"/>
        <g class="bubbles">${Array.from({ length: 7 }, () => `<circle class="bb" r="2" fill="#fff" opacity=".55"/>`).join('')}</g>
        <line x1="${x0}" y1="30" x2="${x0}" y2="168" stroke="#9aa9a3" stroke-width="3"/>
        <g class="blades" transform="translate(${x0} 166)"><rect class="bl1" x="-24" y="-3" width="48" height="6" rx="3" fill="#9aa9a3"/><rect class="bl2" x="-24" y="-3" width="48" height="6" rx="3" fill="#b8c5c0"/></g>
        <rect x="${x0 - 18}" y="14" width="36" height="28" rx="6" fill="url(#fgSteel)" stroke="${C.line}"/>${led(x0 + 10, 24)}
        <path d="M${x0 + 62} 70 h10 v12 h-10" fill="#fbfcfc" stroke="${C.line}"/><path d="M${x0 + 72} 76 h3" stroke="${C.line}" stroke-width="2"/>
        ${pipe(`M${x0 + 62} 182 H${x0 + 96} Q${x0 + 108} 182 ${x0 + 108} 170 V44 Q${x0 + 108} 32 ${x0 + 120} 32 H${x1 - 12} Q${x1} 32 ${x1} 44 V66`)}
      </g>
      <g class="fm" data-st="1">
        ${column(x1 + 56, 220)}
        ${housing(x1, 66, 220, 160, `<rect x="${x1 - 60}" y="86" width="22" height="110" rx="11" fill="#e9f1ee" stroke="${C.line}"/><rect class="lvl" x="${x1 - 56}" y="120" width="14" height="72" rx="7" fill="url(#fgLiq)"/><rect x="${x1 - 22}" y="92" width="80" height="34" rx="7" fill="#0b2b27"/><text x="${x1 - 14}" y="106" fill="${C.mint}" opacity=".7" style="${FONT};font-size:7px">DOSE</text><text class="ml" x="${x1 - 14}" y="120" fill="${C.mint}" style="${FONT};font-size:10px;font-weight:500">00,0 mL</text>`)}
        ${led(x1 + 60, 82)}
        <rect class="rod" x="${x1 - 4}" y="220" width="8" height="20" fill="url(#fgCyl)" stroke="${C.line}"/>
        <rect class="stream" x="${x1 - 2}" y="0" width="4" height="0" rx="2" fill="#3b8a79" opacity=".9"/>
      </g>
      <g class="fm" data-st="2">
        ${column(x2 + 52, 178)}
        <rect x="${x2 - 70}" y="30" width="36" height="148" rx="6" fill="url(#fgGlass)" stroke="${C.line}" fill-opacity=".5"/>${mag}
        ${housing(x2, 60, 178, 150, `<rect x="${x2 - 20}" y="86" width="74" height="30" rx="6" fill="#0b2b27"/><text x="${x2 - 12}" y="99" fill="${C.mint}" opacity=".7" style="${FONT};font-size:7px">TORQUE</text><rect x="${x2 - 12}" y="104" width="58" height="4" rx="2" fill="#1a5248"/><rect class="tq" x="${x2 - 12}" y="104" width="0" height="4" rx="2" fill="${C.mint}"/>`)}
        ${led(x2 + 58, 76)}
        <rect class="rod" x="${x2 - 4}" y="178" width="8" height="30" fill="url(#fgCyl)" stroke="${C.line}"/>
      </g>
      <g class="fm" data-st="3">
        ${column(x3 + 56, 190)}
        ${housing(x3, 70, 190)}
        <rect x="${x3 - 62}" y="190" width="10" height="130" rx="3" fill="url(#fgCyl)" transform="rotate(-6 ${x3 - 57} 190)"/>
        <path d="M${x3 - 54} 306 L${x3 - 22} 326 L${x3 - 54} 336Z" fill="url(#fgSteel)" stroke="${C.line}"/>
        <path class="web" d="M${x3 - 72} 130 L${x3 - 23} 326 L${x3 - 42} 334 L${x3 - 52} 190" fill="none" stroke="${C.teal}" stroke-width="2.4"/>
        <g class="roll" transform="translate(${x3 - 40} 130)"><circle r="34" fill="#fff" stroke="${C.line}"/><circle class="stock" r="28" fill="${C.teal}"/><circle r="10" fill="url(#fgSteel)" stroke="${C.line}"/><path d="M-6 0 H6 M0 -6 V6" stroke="${C.line}" stroke-width="2"/></g>
        <g class="roll2" transform="translate(${x3 + 34} 130)"><circle r="20" fill="#eef2f0" stroke="${C.line}"/><circle r="7" fill="url(#fgSteel)" stroke="${C.line}"/><path d="M-4 0 H4 M0 -4 V4" stroke="${C.line}" stroke-width="2"/></g>
        ${led(x3 + 62, 86)}
      </g>
      <g class="fm" data-st="4">${inspector(x4)}</g>`;
  }

  /* ---------- montagem ---------- */
  const LINES = {
    caps: {
      kind: 'pot', name: 'Cápsulas', build: buildCaps,
      labels: ['Mistura', 'Encapsulamento', 'Tampa', 'Rótulo', 'Inspeção'],
      steps: [['Mistura', 'Ativos pesados e homogeneizados no misturador.'], ['Encapsulamento', 'A encapsuladora dosa o pó, fecha e conta cada cápsula.'], ['Tampa', 'Pote fechado com tampa e lacre de segurança.'], ['Rótulo', 'Seu rótulo aplicado, com a tabela nutricional no verso.'], ['Inspeção', 'Conferência do lote e teste de estabilidade.']],
    },
    liq: {
      kind: 'bottle', name: 'Líquidos', build: buildLiq,
      labels: ['Preparo', 'Envase', 'Conta-gotas', 'Rótulo', 'Inspeção'],
      steps: [['Preparo', 'Fórmula preparada no tanque com agitação contínua.'], ['Envase', 'Dose precisa de 30 mL em cada frasco.'], ['Conta-gotas', 'Tampa conta-gotas rosqueada com lacre.'], ['Rótulo', 'Seu rótulo aplicado, com a tabela nutricional no verso.'], ['Inspeção', 'Conferência do lote e teste de estabilidade.']],
    },
  };
  svg.innerHTML = defs + `<rect x="0" y="452" width="1200" height="2" fill="#e7ece9"/>` + Object.keys(LINES).map(k => `<g class="fline" data-line="${k}"><g class="fline__m"></g>${conveyor()}<g class="fline__pots"></g><g class="fline__fg"></g>${stationLabels(LINES[k].labels)}</g>`).join('');
  const NP = 7;
  Object.entries(LINES).forEach(([k, L]) => {
    const root = svg.querySelector(`.fline[data-line="${k}"]`);
    L.root = root;
    L.build(root.querySelector('.fline__m'));
    const potsG = root.querySelector('.fline__pots'), fg = root.querySelector('.fline__fg');
    L.pots = Array.from({ length: NP }, (_, i) => {
      const g = document.createElementNS(NS, 'g'); g.innerHTML = potMarkup(L.kind, THEMES[i % 4]); potsG.appendChild(g);
      const q = s => g.querySelector(s);
      return { g, theme: THEMES[i % 4], fill: q('.fill'), labR: q('.lab__r'), labT: q('.lab__t'), shine: q('.shine'), cap: q('.cap'), rid: q('.cap .rid'), badge: q('.badge') };
    });
    // garra da tampadora (na frente dos frascos)
    const gx = SX[2];
    fg.innerHTML = `<g class="grip" transform="translate(${gx} 0)"><g class="held">${L.kind === 'pot' ? capMarkup : dropMarkup}</g><rect x="-30" y="0" width="60" height="14" rx="5" fill="url(#fgSteel)" stroke="${C.line}"/><rect class="fing l" x="-30" y="10" width="6" height="${L.kind === 'pot' ? 22 : 30}" rx="2" fill="#9aa9a3"/><rect class="fing r" x="24" y="10" width="6" height="${L.kind === 'pot' ? 22 : 30}" rx="2" fill="#9aa9a3"/></g>` +
      (L.kind === 'bottle' ? `<g class="nozzle" transform="translate(${SX[1]} 0)"><rect x="-13" y="-46" width="26" height="18" rx="4" fill="url(#fgSteel)" stroke="${C.line}"/><rect x="-5" y="-30" width="10" height="30" fill="url(#fgCyl)" stroke="${C.line}"/><path d="M-5 0 L-2.5 4 H2.5 L5 0Z" fill="#9aa9a3"/></g>` : '');
    const q = s => root.querySelector(s);
    Object.assign(L, {
      grip: q('.grip'), held: q('.held'), heldRid: q('.held .rid'), fingL: q('.fing.l'), fingR: q('.fing.r'), rods: root.querySelectorAll('.rod'), tq: q('.tq'),
      nozzle: q('.nozzle'), stream: q('.stream'), ml: q('.ml'), lvl: q('.lvl'),
      mix: q('.mix'), pws: [...root.querySelectorAll('.pw')], disc: q('.disc'), falls: [...root.querySelectorAll('.fall')], ctr: q('.ctr'),
      wave: q('.wave'), bbs: [...root.querySelectorAll('.bb')], bl1: q('.bl1'), bl2: q('.bl2'),
      roll: q('.roll'), roll2: q('.roll2'), stock: q('.stock'), web: q('.web'),
      beam: q('.beam'), beamLine: q('.beam__line'), beamCone: q('.beam__cone'), scr: q('.scr'), lot: q('.lot'),
      leds: [...root.querySelectorAll('.led')], dash: q('.dash'), spokes: [...root.querySelectorAll('.spoke')], flows: [...root.querySelectorAll('.flow')],
    });
  });

  /* ---------- quadro ---------- */
  const set = (el, k, v) => el && el.setAttribute(k, v);
  function frame(L, t) {
    const c = Math.floor(t / T), tc = t - c * T;
    const mp = eIO(seg(tc, 0, MOVE)), p = seg(tc, MOVE, T);
    const dwell = tc >= MOVE;
    const travel = PITCH * (c + mp);
    const isPot = L.kind === 'pot';
    // esteira
    set(L.dash, 'stroke-dashoffset', (-travel % 20).toFixed(1));
    const rot = (travel / 6.5) * 57.3;
    L.spokes.forEach(s => set(s, 'transform', `rotate(${rot.toFixed(1)})`));
    L.flows.forEach(f => set(f, 'stroke-dashoffset', (-t * 40).toFixed(1)));
    L.leds.forEach((l, i) => set(l, 'opacity', dwell ? (Math.sin(t * 12 + i) > 0 ? 1 : .35) : .35));

    // frascos
    L.pots.forEach((P, e) => {
      const slot = ((e + c) % NP) - 1;
      const x = X0 + PITCH * (slot - 1 + mp);
      set(P.g, 'transform', `translate(${x.toFixed(1)} ${BY})`);
      const at = (st) => slot > st ? 1 : slot === st ? (dwell ? p : 0) : 0;
      // 1 envase
      const fp = at(1);
      const fillK = isPot ? eOut(seg(fp, .05, .9)) : seg(fp, .2, .82);
      set(P.fill, 'transform', `translate(0 ${((1 - fillK) * (isPot ? 76 : 64)).toFixed(1)})`);
      // 2 tampa
      const cp = at(2);
      set(P.cap, 'opacity', cp >= .36 ? 1 : 0);
      if (P.rid) set(P.rid, 'transform', `translate(${(-(seg(cp, .36, .76) * 22) % 4).toFixed(2)} 0)`);
      // 3 rótulo
      const lp = at(3), lk = eIO(seg(lp, .12, .8));
      set(P.labR, 'width', ((isPot ? 62 : 42) * lk).toFixed(1));
      set(P.labT, 'opacity', seg(lp, .6, .85));
      const sh = seg(lp, .12, .9);
      set(P.shine, 'opacity', sh > 0 && sh < 1 ? .55 : 0);
      set(P.shine, 'x', ((isPot ? -31 : -21) + sh * (isPot ? 56 : 38)).toFixed(1));
      // 4 inspeção
      const ip = at(4), bk = ip >= .72 ? eBack(seg(ip, .72, .92)) : 0;
      set(P.badge, 'transform', `translate(0 ${isPot ? -124 : -142}) scale(${bk.toFixed(3)})`);
    });

    // máquina 0 (mistura / preparo)
    if (L.mix) {
      set(L.mix, 'transform', `translate(${SX[0]} 112) rotate(${(t * 70) % 360})`);
      L.pws.forEach((d, i) => { const a = t * (2 + i % 3) + i * 1.7, r = 8 + (i * 7) % 24; set(d, 'cx', (Math.cos(a) * r).toFixed(1)); set(d, 'cy', (Math.sin(a) * r * .38).toFixed(1)); });
    }
    if (L.wave) {
      const x0 = SX[0] - 44, w = 88, lvl = 100 + Math.sin(t * .8) * 3;
      let d = `M${x0} 184 V${lvl}`;
      for (let i = 0; i <= 22; i++) { const xx = x0 + w * i / 22; d += ` L${xx.toFixed(1)} ${(lvl + Math.sin(i * .7 + t * 4) * 2.6 + Math.sin(i * .3 - t * 2.3) * 1.6).toFixed(1)}`; }
      d += ` V184 Q${x0 + w} 184 ${x0 + w} 184 H${x0}Z`;
      set(L.wave, 'd', d);
      L.bbs.forEach((b, i) => { const k = (t * .5 + i / 7) % 1; set(b, 'cx', (SX[0] - 30 + (i * 37) % 60 + Math.sin(t * 3 + i) * 3).toFixed(1)); set(b, 'cy', (180 - k * 72).toFixed(1)); set(b, 'opacity', (k < .9 ? .6 : 0)); });
      const a = t * 7;
      set(L.bl1, 'transform', `scale(${Math.cos(a).toFixed(3)} 1)`); set(L.bl2, 'transform', `scale(${Math.sin(a).toFixed(3)} 1)`);
    }
    // máquina 1 (encapsuladora / envasadora)
    if (L.disc) {
      set(L.disc, 'transform', `translate(${SX[1]} 160) rotate(${(t * 40 + (dwell ? p * 180 : 0) + c * 180) % 360})`);
      L.falls.forEach((f, i) => {
        const k = seg(p, .05 + i * .12, .05 + i * .12 + .2);
        const vis = dwell && k > 0 && k < 1;
        set(f, 'opacity', vis ? 1 : 0);
        if (vis) { const top = 262, bot = BY - 6 - 70 * eOut(seg(p, .05, .9)); set(f, 'transform', `translate(${SX[1] + Math.sin(i * 2.3) * 6} ${(top + (bot - top) * k * k).toFixed(1)}) rotate(${(i * 60 + k * 240).toFixed(0)})`); }
      });
      if (L.ctr) L.ctr.textContent = String(Math.round(60 * (dwell ? eOut(seg(p, .05, .9)) : 0))).padStart(3, '0');
    }
    if (L.nozzle) {
      const down = eOut(seg(p, 0, .18)) * (1 - eIO(seg(p, .84, 1)));
      const tip = 258 + down * 36;
      set(L.nozzle, 'transform', `translate(${SX[1]} ${tip.toFixed(1)})`);
      L.rods.forEach(r => { if (+r.getAttribute('x') === SX[1] - 4) set(r, 'height', Math.max(0, tip - 46 - 220).toFixed(1)); });
      const fk = seg(p, .2, .82), on = dwell && p > .18 && p < .84;
      const surf = BY - 62 * fk - 2;
      set(L.stream, 'y', (tip + 4).toFixed(1)); set(L.stream, 'height', on ? Math.max(0, surf - tip - 4).toFixed(1) : 0);
      if (L.ml) L.ml.textContent = (30 * (dwell ? fk : 0)).toFixed(1).replace('.', ',').padStart(4, '0') + ' mL';
      if (L.lvl) { const h = 72 - ((t * 1.3) % 1) * 10; set(L.lvl, 'height', h.toFixed(1)); set(L.lvl, 'y', (192 - h).toFixed(1)); }
    }
    // máquina 2 (tampadora): desce, rosqueia, solta e sobe
    {
      const isP = isPot, bottom = isP ? 254 : 232, top = bottom - 50;
      const down = eOut(seg(p, 0, .34)), up = eIO(seg(p, .78, 1));
      const y = dwell ? bottom - (bottom - top) * (1 - down + up * 1) * (1) : top;
      const gy = dwell ? (p < .78 ? top + (bottom - top) * down : bottom - (bottom - top) * up) : top;
      void y;
      set(L.grip, 'transform', `translate(${SX[2]} ${gy.toFixed(1)})`);
      L.rods.forEach(r => { if (+r.getAttribute('x') === SX[2] - 4) set(r, 'height', Math.max(0, gy - 178).toFixed(1)); });
      // tampa presa na garra: some quando passa para o frasco, reaparece no próximo ciclo
      const holding = !dwell || p < .36;
      const pop = dwell ? 1 : eBack(seg(tc, .1, MOVE));
      set(L.held, 'opacity', holding ? 1 : 0);
      set(L.held, 'transform', `translate(0 ${isP ? 116 : 138}) scale(${pop.toFixed(3)})`);
      const tw = seg(p, .36, .76);
      set(L.tq, 'width', (58 * (dwell ? (p < .78 ? tw : 1 - up) : 0)).toFixed(1));
      const open = dwell && p > .74 ? 4 : 0;
      set(L.fingL, 'x', -30 - open); set(L.fingR, 'x', 24 + open);
    }
    // máquina 3 (rotuladora)
    {
      const lk = dwell ? seg(p, .12, .8) : 0;
      const ang = (c * 300 + lk * 300) % 360;
      set(L.roll, 'transform', `translate(${SX[3] - 40} 130) rotate(${ang.toFixed(1)})`);
      set(L.roll2, 'transform', `translate(${SX[3] + 34} 130) rotate(${(ang * 1.6).toFixed(1)})`);
      // cor do rótulo segue o frasco que está na rotuladora
      const under = L.pots.find((P, e) => ((e + c) % NP) - 1 === 3);
      if (under) { set(L.stock, 'fill', under.theme[0]); set(L.web, 'stroke', under.theme[0] === '#f3efe6' ? '#d8cfbf' : under.theme[0]); }
      set(L.stock, 'r', (28 - ((c % 40) / 40) * 6).toFixed(1));
    }
    // máquina 4 (inspeção)
    {
      const sk = dwell ? seg(p, .08, .7) : 0;
      const on = sk > 0 && sk < 1;
      set(L.beam, 'opacity', on ? 1 : 0);
      const y = 380 - (BY - (isPot ? 106 : 128)) + 0;
      void y;
      const yy = (isPot ? 262 : 244) + (Math.sin(sk * Math.PI * 2 - Math.PI / 2) * .5 + .5) * ((isPot ? 104 : 122));
      set(L.beamLine, 'y', yy.toFixed(1));
      set(L.beamCone, 'd', `M${SX[4] - 5} 214 L${SX[4] - 50} ${yy.toFixed(1)} H${SX[4] + 50} L${SX[4] + 5} 214Z`);
      const ok = dwell && p > .72;
      if (L.scr) { L.scr.textContent = ok ? 'OK ✓' : on ? 'SCAN' : 'CQ'; set(L.scr, 'fill', ok ? '#bfe8d6' : C.mint); }
      if (L.lot) L.lot.textContent = String(412 + c).padStart(4, '0');
    }
  }

  /* ---------- abas, legendas, contador ---------- */
  let t = 1.2, last = 0, running = false, lastC = -1, units = 12480;
  const stepsEl = document.querySelector('.js-fac-steps');
  const tabs = document.querySelector('.js-fac-tabs');
  const nameEl = document.querySelector('.js-fac-name'), countEl = document.querySelector('.js-fac-count');
  // produto.html: mostra só a linha do tipo do produto (data-line ou Caps.product.kind)
  const fixed = svg.dataset.line || (window.Caps && window.Caps.product ? (window.Caps.product.kind === 'drop' ? 'liq' : 'caps') : '');
  let cur = fixed || 'caps';
  if (nameEl) nameEl.textContent = LINES[cur].name;
  const renderSteps = () => {
    stepsEl.innerHTML = LINES[cur].steps.map(([h, d], i) => `<li class="fstep${i === (lastC < 0 ? 0 : lastC % 5) ? ' is-on' : ''}" data-st="${i}"><span class="mono">0${i + 1}</span><b>${h}</b><p>${d}</p></li>`).join('');
  };
  renderSteps();
  Object.entries(LINES).forEach(([k, L]) => { L.root.style.opacity = k === cur ? 1 : 0; L.root.style.display = k === cur ? '' : 'none'; });
  if (tabs) {
    const movePill = b => { const pill = tabs.querySelector('.ftabs__pill'); pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 4}px)`; };
    { const re = () => movePill(tabs.querySelector('.is-active')); requestAnimationFrame(re); document.fonts && document.fonts.ready.then(re); new ResizeObserver(re).observe(tabs); }
    tabs.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.dataset.line === cur) return;
      tabs.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b)); movePill(b);
      const from = LINES[cur], to = LINES[b.dataset.line];
      cur = b.dataset.line;
      nameEl.textContent = to.name;
      to.root.style.display = '';
      if (window.gsap) {
        gsap.to(from.root, { opacity: 0, y: 14, duration: .35, ease: 'power2.in', onComplete: () => { from.root.style.display = 'none'; } });
        gsap.fromTo(to.root, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: .7, ease: 'expo.out', delay: .2 });
        gsap.to(stepsEl, { opacity: 0, y: 10, duration: .25, onComplete: () => { renderSteps(); gsap.to(stepsEl, { opacity: 1, y: 0, duration: .5, ease: 'expo.out' }); } });
      } else { from.root.style.display = 'none'; to.root.style.opacity = 1; renderSteps(); }
    });
  }
  // passar o mouse na legenda destaca a máquina
  stepsEl.addEventListener('pointerover', e => { const li = e.target.closest('.fstep'); if (!li) return; LINES[cur].root.querySelectorAll('[data-st]').forEach(m => m.classList.toggle('is-hl', m.dataset.st === li.dataset.st)); svg.classList.add('has-hl'); });
  stepsEl.addEventListener('pointerleave', () => { svg.classList.remove('has-hl'); svg.querySelectorAll('.is-hl').forEach(m => m.classList.remove('is-hl')); });

  /* ---------- relógio ---------- */
  new IntersectionObserver(([en]) => { running = en.isIntersecting; }, { rootMargin: '80px' }).observe(svg);
  const tick = (now) => {
    const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
    if (running && !reduce) {
      t += dt;
      frame(LINES[cur], t);
      const c = Math.floor(t / T);
      if (c !== lastC) {
        lastC = c; units += 6; countEl.textContent = units.toLocaleString('pt-BR');
        stepsEl.querySelectorAll('.fstep').forEach((li, i) => li.classList.toggle('is-on', i === c % 5));
      }
    }
    requestAnimationFrame(tick);
  };
  frame(LINES.caps, reduce ? 2 : t); frame(LINES.liq, reduce ? 2 : t);
  requestAnimationFrame(tick);
})();
