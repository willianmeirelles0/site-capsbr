/* GET /api/catalog          → JavaScript que define window.SITE e window.PRODUCTS (usado pelas páginas)
   GET /api/catalog?format=json → o mesmo em JSON
   Cache de borda curto: alterações do painel aparecem em até ~1 minuto. */
import { getCatalog } from './_lib/catalog.js';

const safe = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

// o nome do fornecedor \u00e9 informa\u00e7\u00e3o interna (confidencial); o cat\u00e1logo p\u00fablico
// s\u00f3 precisa dos valores que ele substitui (ANVISA, r\u00f3tulo, arte).
const publicProducts = products => products.map(p => {
  if (!p.fornecedor) return p;
  const { nome, ...resto } = p.fornecedor;
  return { ...p, fornecedor: resto };
});

export async function GET(req) {
  const asJson = new URL(req.url).searchParams.get('format') === 'json';
  const cache = { 'Cache-Control': 'public, max-age=0, must-revalidate', 'CDN-Cache-Control': 'public, s-maxage=30, stale-while-revalidate=600' };
  try {
    const { catalog } = await getCatalog();
    const products = publicProducts(catalog.products);
    if (asJson) return new Response(JSON.stringify({ ...catalog, products }), { headers: { 'Content-Type': 'application/json; charset=utf-8', ...cache } });
    const body = `window.SITE=${safe(catalog.site)};window.PRODUCTS=${safe(products)};`;
    return new Response(body, { headers: { 'Content-Type': 'application/javascript; charset=utf-8', ...cache } });
  } catch (err) {
    console.error('[catalog]', err);
    // falha no banco: as páginas seguem com o catálogo embutido (assets/js/data.js)
    return new Response(asJson ? '{}' : '/* catálogo padrão */', { status: 200, headers: { 'Content-Type': asJson ? 'application/json' : 'application/javascript', 'Cache-Control': 'no-store' } });
  }
}
