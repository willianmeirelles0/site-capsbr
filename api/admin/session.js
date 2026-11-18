/* POST   /api/admin/session  { password } → entra (cookie de sessão)
   GET    /api/admin/session              → { authed, configured, store }
   DELETE /api/admin/session              → sai */
import { checkPassword, configured, isAuthed, sessionCookie, clearCookie, sameOrigin, json } from '../_lib/auth.js';
import { storeKind, rateLimitRedis, rateLimitReset } from '../_lib/store.js';

// limite de tentativas por IP: via Redis quando configurado (vale entre instâncias
// serverless, que é o caso normal na Vercel); em memória só serve para dev local.
const WINDOW_S = 10 * 60, MAX_TRIES = 8;
const tries = new Map();
const ipOf = req => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function tooManyTries(ip) {
  const r = await rateLimitRedis(`capsbr:login:${ip}`, WINDOW_S, MAX_TRIES);
  if (r) return !r.allowed;
  const now = Date.now();
  const t = (tries.get(ip) || []).filter(x => now - x < WINDOW_S * 1000);
  if (t.length >= MAX_TRIES) return true;
  t.push(now); tries.set(ip, t);
  return false;
}
async function clearTries(ip) {
  await rateLimitReset(`capsbr:login:${ip}`);
  tries.delete(ip);
}

export async function GET(req) {
  return json({ authed: isAuthed(req), configured: configured(), store: storeKind() });
}

export async function POST(req) {
  if (!sameOrigin(req)) return json({ error: 'Requisição bloqueada.' }, 403);
  if (!configured()) return json({ error: 'Painel sem senha configurada. Defina ADMIN_PASSWORD (mínimo 8 caracteres) nas variáveis de ambiente da Vercel.' }, 503);
  const ip = ipOf(req);
  if (await tooManyTries(ip)) return json({ error: 'Muitas tentativas. Aguarde 10 minutos e tente de novo.' }, 429);
  let body = {};
  try { body = await req.json(); } catch { }
  const pw = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
  if (!checkPassword(pw)) {
    await sleep(700);
    return json({ error: 'Senha incorreta.' }, 401);
  }
  await clearTries(ip);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(req) });
}

export async function DELETE(req) {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(req) });
}
