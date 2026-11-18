/* Armazenamento do catálogo.
   Produção: Upstash Redis (integração da Vercel Marketplace) pela API REST, sem dependências.
   Local (sem variáveis): arquivo em .data/ para testar o painel. */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const KEY = 'capsbr:catalog', HIST = 'capsbr:history', HIST_MAX = 40;

export const storeKind = () => (URL_ && TOKEN ? 'redis' : (process.env.VERCEL ? 'none' : 'file'));

async function redis(...cmds) {
  const res = await fetch(URL_.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const out = await res.json();
  const bad = out.find(r => r && r.error);
  if (bad) throw new Error(`Redis: ${bad.error}`);
  return out.map(r => r.result);
}

const DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DIR, 'catalog.json'), HFILE = path.join(DIR, 'history.json');
const readJSON = async (f, fb) => { try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch { return fb; } };
const writeJSON = async (f, v) => { await fs.mkdir(DIR, { recursive: true }); const tmp = f + '.tmp'; await fs.writeFile(tmp, JSON.stringify(v)); await fs.rename(tmp, f); };

/** documento atual: { catalog, meta: { rev, savedAt } } ou null */
export async function getCurrent() {
  const k = storeKind();
  if (k === 'redis') { const [v] = await redis(['GET', KEY]); return v ? JSON.parse(v) : null; }
  if (k === 'file') return readJSON(FILE, null);
  return null;
}

/** grava nova versão e guarda no histórico */
export async function saveCurrent(doc) {
  const k = storeKind();
  const json = JSON.stringify(doc);
  if (k === 'redis') { await redis(['SET', KEY, json], ['LPUSH', HIST, json], ['LTRIM', HIST, 0, HIST_MAX - 1]); return; }
  if (k === 'file') {
    const h = await readJSON(HFILE, []);
    h.unshift(doc); await writeJSON(HFILE, h.slice(0, HIST_MAX)); await writeJSON(FILE, doc); return;
  }
  throw new Error('NO_STORE');
}

/** limite de tentativas (login) compartilhado entre instâncias via Redis.
 *  INCR + EXPIRE NX: conta dentro da janela, define o TTL só na 1ª tentativa.
 *  Sem Redis configurado, retorna null e quem chamou usa um limite local. */
export async function rateLimitRedis(key, windowSeconds, max) {
  if (storeKind() !== 'redis') return null;
  const [count] = await redis(['INCR', key], ['EXPIRE', key, windowSeconds, 'NX']);
  return { count, allowed: count <= max };
}

/** zera o contador (ex.: após login correto) */
export async function rateLimitReset(key) {
  if (storeKind() !== 'redis') return;
  await redis(['DEL', key]);
}

/** histórico (mais recente primeiro) */
export async function getHistory() {
  const k = storeKind();
  if (k === 'redis') { const [list] = await redis(['LRANGE', HIST, 0, HIST_MAX - 1]); return (list || []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean); }
  if (k === 'file') return readJSON(HFILE, []);
  return [];
}
