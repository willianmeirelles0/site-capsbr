/* GET /api/proposta?id=xx → { cliente, mostrarPrecos, produtos, atualizadoEm }
   Público (sem login): o link da proposta é a própria proteção, como o do
   catálogo. Os produtos aqui já vêm "congelados" (ver api/admin/propostas.js),
   então esta rota não toca no catálogo publicado nem no banco de propostas
   além de uma leitura. */
import { getProposta } from './_lib/store.js';

const cache = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cache } });

export async function GET(req) {
  const id = (new URL(req.url).searchParams.get('id') || '').trim();
  if (!/^[A-Za-z0-9_-]{4,32}$/.test(id)) return json({ error: 'not_found' }, 404);
  try {
    const doc = await getProposta(id);
    if (!doc) return json({ error: 'not_found' }, 404);
    return json({ cliente: doc.cliente, mostrarPrecos: doc.mostrarPrecos, produtos: doc.produtos, atualizadoEm: doc.atualizadoEm });
  } catch (err) {
    console.error('[proposta]', err);
    return json({ error: 'server_error' }, 500);
  }
}
