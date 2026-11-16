/* GET /api/admin/catalog → { catalog, meta, defaults }
   PUT /api/admin/catalog   { catalog, baseRev, note } → valida, salva e guarda no histórico */
import { guarded, json } from '../_lib/auth.js';
import { getCatalog, getDefaults } from '../_lib/catalog.js';
import { saveCurrent } from '../_lib/store.js';
import { normalizeCatalog, clean } from '../../admin/validate.js';

export const GET = guarded(async () => {
  const doc = await getCatalog();
  return json({ ...doc, defaults: await getDefaults() });
});

export const PUT = guarded(async req => {
  const text = await req.text();
  if (text.length > 1_500_000) return json({ error: 'Catálogo grande demais.' }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: 'JSON inválido.' }, 400); }
  const { catalog, errors } = normalizeCatalog(body && body.catalog);
  if (errors.length) return json({ error: 'Corrija os campos destacados antes de salvar.', errors }, 422);
  const cur = await getCatalog();
  const rev = cur.meta && cur.meta.rev || 0;
  if (typeof body.baseRev === 'number' && body.baseRev !== rev) {
    return json({ error: 'O catálogo foi alterado em outra aba ou por outra pessoa. Recarregue para ver a versão mais nova.', conflict: true, rev }, 409);
  }
  const meta = { rev: rev + 1, savedAt: new Date().toISOString(), note: clean(body.note, 120), count: catalog.products.length };
  await saveCurrent({ catalog, meta });
  return json({ ok: true, catalog, meta });
}, { mutating: true });
