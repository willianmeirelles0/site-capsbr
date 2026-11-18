/* =========================================================
   CapsBR · validação e normalização do catálogo
   Usado no navegador (painel /admin) e no servidor (api/).
   Sem dependências. Toda gravação passa por normalizeCatalog().
   ========================================================= */

export const TIPOS = ['Cápsulas', 'Líquidos', 'Gomas e Pastilhas', 'Solúveis'];
export const ROTULO_QTYS = [500, 1000];
export const LIMITS = { products: 200, volumes: 10, beneficios: 10, tabela: 40, announce: 12 };
export const DEFAULT_SITE = {
  whatsapp: '5554997090147',
  promo: { enabled: false, name: '', end: '2000-01-01T00:00:00-03:00', max: 0 },
  announceBanner: '',
  announce: ['Marca própria a partir de 300 unidades', 'Teste de estabilidade em todo produto', 'Notificação ANVISA no mesmo fluxo', 'Produção em 15 a 45 dias'],
  costs: {
    // calculadora da página de produto (por lote)
    rotuloCaps: 650, rotuloLiq: 600, rotuloLote: 500, anvisa: 300,
    // calculadora do catálogo de leads (por linha e quantidade de rótulos)
    rotulo: {
      'Cápsulas': { 500: 650, 1000: 750 },
      'Líquidos': { 500: 600, 1000: 650 },
      'Gomas e Pastilhas': { 500: 650, 1000: 750 },
      'Solúveis': { 500: 790, 1000: 950 },
    },
    arteMin: 300, artePreco: 150,
  },
};

// texto limpo: sem tags, sem caracteres de controle, espaços normalizados
export const clean = (v, max = 200) => String(v ?? '')
  .replace(/[<>]/g, '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .replace(/[ \t]+/g, ' ')
  .trim()
  .slice(0, max);

export const slugify = s => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/\+/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  .slice(0, 60);

// aceita 12,5 · "12,50" · "R$ 1.234,56" · 12.5
export const toNumber = v => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  let s = String(v ?? '').replace(/[^\d,.-]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};
const round2 = n => Math.round(n * 100) / 100;
export const brl = n => 'R$ ' + round2(n).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ---------- produto ---------- */
// maior % de desconto entre as faixas de quantidade
export const maxDiscount = volumes => Math.max(0, ...Object.values(volumes || {}).map(([de, por]) => de > 0 ? Math.round((1 - por / de) * 100) : 0));

export function normalizeProduct(raw, i = 0) {
  const errors = [];
  const at = (field, msg) => errors.push({ index: i, field, msg });
  const p = raw && typeof raw === 'object' ? raw : {};

  const titulo = clean(p.titulo, 80);
  if (!titulo) at('titulo', 'Informe o nome do produto.');
  const nome = clean(p.nome, 120) || titulo;
  const id = clean(p.id, 16).toUpperCase();
  if (!id) at('id', 'Informe o código (ex.: C-017).');
  else if (!/^[A-Z0-9][A-Z0-9-]{0,15}$/.test(id)) at('id', 'Use só letras, números e hífen.');
  let slug = slugify(p.slug || titulo);
  if (!slug) at('slug', 'Endereço inválido.');
  const tipo = TIPOS.includes(p.tipo) ? p.tipo : '';
  if (!tipo) at('tipo', 'Escolha o tipo do produto.');
  const categoria = clean(p.categoria, 40);
  if (!categoria) at('categoria', 'Informe a categoria.');
  const tamanho = clean(p.tamanho, 40);
  if (!tamanho) at('tamanho', 'Informe o tamanho (ex.: 60 cápsulas).');
  const descricao = clean(p.descricao, 900);
  if (!descricao) at('descricao', 'Escreva uma descrição.');

  const beneficios = (Array.isArray(p.beneficios) ? p.beneficios : [])
    .map(b => clean(b, 120)).filter(Boolean).slice(0, LIMITS.beneficios);

  // preços por quantidade: { "300": [normal, promo] }
  const volumes = {};
  const src = p.volumes && typeof p.volumes === 'object' ? p.volumes : {};
  const keys = Object.keys(src);
  if (keys.length > LIMITS.volumes) at('volumes', `No máximo ${LIMITS.volumes} faixas de quantidade.`);
  keys.slice(0, LIMITS.volumes).forEach(k => {
    const q = Math.round(toNumber(k));
    const pair = Array.isArray(src[k]) ? src[k] : [];
    const de = round2(toNumber(pair[0]));
    // sem promoção: deixar "preço na campanha" em branco repete o preço normal
    const porRaw = pair[1];
    const porBlank = porRaw === '' || porRaw == null || (typeof porRaw === 'string' && porRaw.trim() === '');
    const por = round2(toNumber(porBlank ? pair[0] : porRaw));
    if (!(q >= 1 && q <= 1000000)) { at('volumes', `Quantidade inválida: ${k}.`); return; }
    if (volumes[q]) { at('volumes', `Quantidade repetida: ${q}.`); return; }
    if (!(de > 0) || de > 100000) { at('volumes', `Preço normal inválido em ${q} un.`); return; }
    if (!(por > 0) || por > 100000) { at('volumes', `Preço promocional inválido em ${q} un.`); return; }
    if (por > de) { at('volumes', `Em ${q} un. o preço promocional está maior que o normal.`); return; }
    volumes[q] = [de, por];
  });
  const vq = Object.keys(volumes).map(Number).sort((a, b) => a - b);
  if (!vq.length) at('volumes', 'Cadastre ao menos uma faixa de preço.');
  else if (!vq.some(q => q <= 1000)) at('volumes', 'Cadastre ao menos uma faixa de até 1.000 unidades (o site mostra 300, 500 e 1.000).');
  const ordered = {}; vq.forEach(q => { ordered[q] = volumes[q]; });

  // valores derivados da maior faixa = preço "a partir de" mostrado nos cards
  const first = vq.length ? ordered[vq[vq.length - 1]] : [0, 0];
  // selo "-X%" do card: editável; vazio = maior desconto da tabela
  let desconto = Math.round(toNumber(p.desconto));
  if (p.desconto === '' || p.desconto == null || Number.isNaN(desconto)) desconto = maxDiscount(ordered);
  if (!(desconto >= 0 && desconto <= 99)) { at('desconto', 'Selo de desconto entre 0 e 99%.'); desconto = 0; }

  const tabela = (Array.isArray(p.tabela) ? p.tabela : [])
    .map(r => Array.isArray(r) ? [clean(r[0], 60), clean(r[1], 20), clean(r[2], 20)] : null)
    .filter(r => r && r[0]).slice(0, LIMITS.tabela);

  // fornecedor com cobrança própria (opcional): substitui ANVISA e/ou a
  // tabela de impressão de rótulos do catálogo de leads para este produto.
  // Sem nome preenchido, o produto usa os valores padrão normalmente.
  let fornecedor = null;
  const fr = p.fornecedor && typeof p.fornecedor === 'object' ? p.fornecedor : {};
  const frNome = clean(fr.nome, 40);
  const frRotSrc = fr.rotulo && typeof fr.rotulo === 'object' ? fr.rotulo : {};
  const frRotKeys = Object.keys(frRotSrc).filter(k => frRotSrc[k] !== '' && frRotSrc[k] != null);
  const frAnvisaRaw = fr.anvisa;
  const hasAnvisa = frAnvisaRaw !== '' && frAnvisaRaw != null;
  if (frNome || frRotKeys.length || hasAnvisa) {
    if (!frNome) at('fornecedor', 'Informe o nome do fornecedor, ou limpe os campos de fornecedor deste produto.');
    let anvisa;
    if (hasAnvisa) {
      anvisa = round2(toNumber(frAnvisaRaw));
      if (!(anvisa > 0 && anvisa <= 1000000)) at('fornecedor', 'Notificação ANVISA do fornecedor: valor inválido.');
    }
    const rotulo = {};
    if (frRotKeys.length > LIMITS.volumes) at('fornecedor', `No máximo ${LIMITS.volumes} quantidades de rótulo por fornecedor.`);
    frRotKeys.slice(0, LIMITS.volumes).forEach(k => {
      const q = Math.round(toNumber(k));
      const price = round2(toNumber(frRotSrc[k]));
      if (!(q >= 1 && q <= 1000000)) { at('fornecedor', `Quantidade de rótulo inválida: ${k}.`); return; }
      if (rotulo[q]) { at('fornecedor', `Quantidade de rótulo repetida: ${q}.`); return; }
      if (!(price > 0 && price <= 1000000)) { at('fornecedor', `Preço de rótulo inválido em ${q} un.`); return; }
      rotulo[q] = price;
    });
    fornecedor = { nome: frNome || '(sem nome)' };
    if (hasAnvisa && anvisa > 0) fornecedor.anvisa = anvisa;
    if (Object.keys(rotulo).length) fornecedor.rotulo = rotulo;
  }

  const out = {
    id, slug, titulo, nome, tipo, categoria, tamanho,
    maisPedido: !!p.maisPedido,
    descricao, beneficios,
    volumes: ordered,
    de: brl(first[0]), por: brl(first[1]), desconto,
    porcao: clean(p.porcao, 80),
    porcoes: clean(p.porcoes, 80),
    tabela,
    naoContem: clean(p.naoContem, 600),
  };
  if (fornecedor) out.fornecedor = fornecedor;
  return { product: out, errors };
}

/* ---------- configurações do site ---------- */
export function normalizeSite(raw) {
  const errors = [];
  const at = (field, msg) => errors.push({ field, msg });
  const s = raw && typeof raw === 'object' ? raw : {};
  const d = DEFAULT_SITE;

  const whatsapp = String(s.whatsapp ?? d.whatsapp).replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(whatsapp)) at('whatsapp', 'WhatsApp com DDI e DDD, só números (ex.: 5554997090147).');

  // A campanha vem desligada por padrão (sem Black Friday); só exige nome/data/%
  // quando alguém realmente liga o interruptor "Campanha ativa" no painel.
  const pr = s.promo && typeof s.promo === 'object' ? s.promo : {};
  const enabled = pr.enabled === true;
  const name = clean(pr.name ?? d.promo.name, 40);
  if (enabled && !name) at('promo.name', 'Dê um nome para a campanha.');
  const endD = new Date(pr.end ?? d.promo.end);
  if (enabled && isNaN(endD.getTime())) at('promo.end', 'Data de término inválida.');
  const max = Math.round(toNumber(pr.max ?? d.promo.max));
  if (enabled && !(max >= 0 && max <= 99)) at('promo.max', 'Desconto máximo entre 0 e 99%.');
  const promo = { enabled, name, end: isNaN(endD.getTime()) ? d.promo.end : endD.toISOString(), max: max >= 0 && max <= 99 ? max : d.promo.max };

  const announce = (Array.isArray(s.announce) ? s.announce : d.announce)
    .map(t => clean(t, 90)).filter(Boolean).slice(0, LIMITS.announce);
  if (!announce.length) at('announce', 'Deixe ao menos um aviso na barra do topo.');
  const announceBanner = clean(s.announceBanner, 90);

  const c = s.costs && typeof s.costs === 'object' ? s.costs : {};
  const costs = {};
  [['rotuloCaps', 'Rótulos (cápsulas)'], ['rotuloLiq', 'Rótulos (líquidos)'], ['anvisa', 'Notificação ANVISA']].forEach(([k, label]) => {
    const n = round2(toNumber(c[k] ?? d.costs[k]));
    if (!(n >= 0 && n <= 1000000)) at('costs.' + k, `${label}: valor inválido.`);
    costs[k] = n >= 0 && n <= 1000000 ? n : d.costs[k];
  });
  const lote = Math.round(toNumber(c.rotuloLote ?? d.costs.rotuloLote));
  if (!(lote >= 1 && lote <= 100000)) at('costs.rotuloLote', 'Lote de rótulos: informe um número inteiro maior que zero.');
  costs.rotuloLote = lote >= 1 && lote <= 100000 ? lote : d.costs.rotuloLote;

  // catálogo de leads: preço de impressão por linha e quantidade de rótulos
  const cr = c.rotulo && typeof c.rotulo === 'object' ? c.rotulo : {};
  costs.rotulo = {};
  let rotuloBad = false;
  TIPOS.forEach(tipo => {
    const src = cr[tipo] && typeof cr[tipo] === 'object' ? cr[tipo] : {};
    const row = {};
    ROTULO_QTYS.forEach(q => {
      const n = round2(toNumber(src[q] ?? d.costs.rotulo[tipo][q]));
      if (!(n > 0 && n <= 1000000)) rotuloBad = true;
      row[q] = n > 0 && n <= 1000000 ? n : d.costs.rotulo[tipo][q];
    });
    costs.rotulo[tipo] = row;
  });
  if (rotuloBad) at('costs.rotulo', 'Impressão de rótulos: todos os valores (por linha e quantidade) precisam ser maiores que zero.');

  const arteMin = Math.round(toNumber(c.arteMin ?? d.costs.arteMin));
  if (!(arteMin >= 1 && arteMin <= 1000000)) at('costs.arteMin', 'Informe a partir de quantas unidades a arte é cortesia.');
  costs.arteMin = arteMin >= 1 && arteMin <= 1000000 ? arteMin : d.costs.arteMin;
  const artePreco = round2(toNumber(c.artePreco ?? d.costs.artePreco));
  if (!(artePreco >= 0 && artePreco <= 1000000)) at('costs.artePreco', 'Valor da arte do rótulo inválido.');
  costs.artePreco = artePreco >= 0 && artePreco <= 1000000 ? artePreco : d.costs.artePreco;

  return { site: { whatsapp, promo, announceBanner, announce, costs }, errors };
}

/* ---------- catálogo completo ---------- */
export function normalizeCatalog(raw) {
  const errors = [];
  const c = raw && typeof raw === 'object' ? raw : {};
  const list = Array.isArray(c.products) ? c.products : [];
  if (!list.length) errors.push({ field: 'products', msg: 'O catálogo precisa de ao menos um produto.' });
  if (list.length > LIMITS.products) errors.push({ field: 'products', msg: `No máximo ${LIMITS.products} produtos.` });
  const products = [];
  const ids = new Map(), slugs = new Map();
  list.slice(0, LIMITS.products).forEach((p, i) => {
    const r = normalizeProduct(p, i);
    errors.push(...r.errors);
    const { id, slug } = r.product;
    if (id) { if (ids.has(id)) errors.push({ index: i, field: 'id', msg: `Código ${id} repetido (também em "${products[ids.get(id)].titulo}").` }); else ids.set(id, i); }
    if (slug) { if (slugs.has(slug)) errors.push({ index: i, field: 'slug', msg: `Endereço "${slug}" repetido.` }); else slugs.set(slug, i); }
    products.push(r.product);
  });
  const s = normalizeSite(c.site);
  errors.push(...s.errors);
  return { catalog: { version: 1, site: s.site, products }, errors };
}
