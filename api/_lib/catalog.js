/* Catálogo atual = versão salva no painel, ou o padrão de fábrica (assets/js/data.js). */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { normalizeCatalog, DEFAULT_SITE } from '../../admin/validate.js';
import { getCurrent } from './store.js';

let defaults = null;
export async function getDefaults() {
  if (defaults) return defaults;
  const src = await fs.readFile(path.join(process.cwd(), 'assets/js/data.js'), 'utf8');
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx, { timeout: 1000 });
  defaults = normalizeCatalog({ site: DEFAULT_SITE, products: ctx.window.PRODUCTS || [] }).catalog;
  return defaults;
}

/** { catalog, meta } : meta.rev = 0 quando é o padrão de fábrica */
export async function getCatalog() {
  const doc = await getCurrent();
  if (doc && doc.catalog && Array.isArray(doc.catalog.products) && doc.catalog.products.length) return doc;
  return { catalog: await getDefaults(), meta: { rev: 0, savedAt: null } };
}
