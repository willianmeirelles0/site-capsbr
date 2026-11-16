/* GET /api/admin/history        → lista de versões salvas (sem o conteúdo)
   GET /api/admin/history?rev=12 → versão completa para restaurar ou baixar */
import { guarded, json } from '../_lib/auth.js';
import { getHistory } from '../_lib/store.js';

export const GET = guarded(async req => {
  const list = await getHistory();
  const rev = new URL(req.url).searchParams.get('rev');
  if (rev !== null) {
    const doc = list.find(d => d.meta && String(d.meta.rev) === rev);
    return doc ? json(doc) : json({ error: 'Versão não encontrada.' }, 404);
  }
  return json({ versions: list.map(d => ({ ...d.meta, count: d.catalog && d.catalog.products ? d.catalog.products.length : 0 })) });
});
