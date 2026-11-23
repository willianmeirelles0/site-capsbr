/* GET    /api/admin/propostas        → { propostas } (lista, mais recente primeiro)
   GET    /api/admin/propostas?id=xx  → documento completo (para editar)
   POST   /api/admin/propostas        { cliente, mostrarPrecos, itens } → cria e grava
   PUT    /api/admin/propostas?id=xx  { cliente, mostrarPrecos, itens } → atualiza (mesmo link)
   DELETE /api/admin/propostas?id=xx  → remove

   Cada fórmula é "congelada" no momento de salvar: preço, tabela nutricional
   etc. vêm copiados do catálogo publicado (getCatalog) e ficam guardados
   dentro da proposta. Trocar preços no catálogo depois não muda propostas
   já criadas; editar e salvar a proposta de novo é que atualiza a cópia. */
import crypto from 'node:crypto';
import { guarded, json } from '../_lib/auth.js';
import { getCatalog } from '../_lib/catalog.js';
import { getProposta, saveProposta, deleteProposta, listPropostas } from '../_lib/store.js';
import { clean } from '../../admin/validate.js';

const newId = () => crypto.randomBytes(6).toString('base64url');
const round2 = n => Math.round(n * 100) / 100;
const MAX_ITENS = 60;

function parseItens(body) {
  const arr = Array.isArray(body && body.itens) ? body.itens : [];
  const out = [], seen = new Set();
  for (const it of arr) {
    const codigo = clean(it && it.codigo, 16).toUpperCase();
    if (!codigo || seen.has(codigo)) continue;
    seen.add(codigo);
    const pctRaw = Number(it && it.descontoPct);
    const descontoPct = Number.isFinite(pctRaw) ? Math.min(95, Math.max(0, Math.round(pctRaw))) : 0;
    out.push({ codigo, descontoPct });
  }
  return out.slice(0, MAX_ITENS);
}

/** monta os produtos "congelados" da proposta a partir do catálogo publicado */
function buildProdutos(catalogProducts, itens) {
  const byId = new Map(catalogProducts.map(p => [p.id, p]));
  const produtos = [], resolved = [], errors = [];
  for (const it of itens) {
    const src = byId.get(it.codigo);
    if (!src) { errors.push(`Código não encontrado no catálogo publicado: ${it.codigo}`); continue; }
    if (src.ativo === false) { errors.push(`${it.codigo} está inativo no catálogo e não pode entrar numa proposta.`); continue; }
    const p = JSON.parse(JSON.stringify(src));
    if (p.fornecedor) { const { nome, ...resto } = p.fornecedor; p.fornecedor = resto; } // nome do fornecedor é confidencial
    if (it.descontoPct > 0) {
      // catalog.js sempre mostra volumes[q][0] (nunca a "promoção" em [1],
      // que só é usada por outro site); o desconto precisa ir nos dois para
      // o preço exibido e cobrado na cotação refletirem o desconto.
      const vols = {};
      for (const [q, par] of Object.entries(p.volumes || {})) {
        const de = Array.isArray(par) ? par[0] : par;
        const comDesconto = round2(de * (1 - it.descontoPct / 100));
        vols[q] = [comDesconto, comDesconto];
      }
      p.volumes = vols;
      p.desconto = it.descontoPct;
    }
    produtos.push(p);
    resolved.push({ codigo: it.codigo, descontoPct: it.descontoPct });
  }
  return { produtos, resolved, errors };
}

export const GET = guarded(async req => {
  const id = new URL(req.url).searchParams.get('id');
  if (id) {
    const doc = await getProposta(id);
    return doc ? json(doc) : json({ error: 'Proposta não encontrada.' }, 404);
  }
  return json({ propostas: await listPropostas() });
});

async function upsert(req, existing) {
  let body;
  try { body = await req.json(); } catch { return json({ error: 'JSON inválido.' }, 400); }
  const itens = parseItens(body);
  if (!itens.length) return json({ error: 'Selecione ao menos uma fórmula.' }, 422);
  const cliente = clean(body.cliente, 60);
  const mostrarPrecos = body.mostrarPrecos !== false;
  const { catalog } = await getCatalog();
  const { produtos, resolved, errors } = buildProdutos(catalog.products, itens);
  if (!produtos.length) return json({ error: errors[0] || 'Nenhuma fórmula válida selecionada.' }, 422);
  const now = new Date().toISOString();
  const doc = {
    id: existing ? existing.id : newId(),
    cliente, mostrarPrecos,
    itens: resolved,
    produtos,
    criadoEm: existing ? existing.criadoEm : now,
    atualizadoEm: now,
  };
  await saveProposta(doc);
  return json(doc, existing ? 200 : 201);
}

export const POST = guarded(req => upsert(req, null), { mutating: true });

export const PUT = guarded(async req => {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ error: 'Falta o id da proposta.' }, 400);
  const existing = await getProposta(id);
  if (!existing) return json({ error: 'Proposta não encontrada.' }, 404);
  return upsert(req, existing);
}, { mutating: true });

export const DELETE = guarded(async req => {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ error: 'Falta o id da proposta.' }, 400);
  await deleteProposta(id);
  return json({ ok: true });
}, { mutating: true });
