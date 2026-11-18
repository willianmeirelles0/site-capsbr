/* =========================================================
   CapsBR · validação e normalização do catálogo
   Usado no navegador (painel /admin) e no servidor (api/).
   Sem dependências. Toda gravação passa por normalizeCatalog().
   ========================================================= */

export const TIPOS = ['Cápsulas', 'Líquidos', 'Gomas e Pastilhas', 'Solúveis'];
export const LIMITS = { products: 200, volumes: 10, beneficios: 10, tabela: 40, announce: 12 };
export const DEFAULT_SITE = {
  whatsapp: '5554997090147',
  promo: { enabled: false, name: '', end: '2000-01-01T00:00:00-03:00', max: 0 },
  announceBanner: '',
  announce: ['Marca própria a partir de 300 unidades', 'Teste de estabilidade em todo produto', 'Notificação ANVISA no mesmo fluxo', 'Produção em 15 a 45 dias'],
  costs: { rotuloCaps: 650, rotuloLiq: 600, rotuloLote: 500, anvisa: 300 },
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
  if (!tipo) at('tipo', 'Escolha Cápsulas ou Líquidos.');
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
    const de = round2(toNumber(pair[0])), por = round2(toNumber(pair[1]));
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
