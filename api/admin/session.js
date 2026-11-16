/* POST   /api/admin/session  { password } → entra (cookie de sessão)
   GET    /api/admin/session              → { authed, configured, store }
   DELETE /api/admin/session              → sai */
import { checkPassword, configured, isAuthed, sessionCookie, clearCookie, sameOrigin, json } from '../_lib/auth.js';
import { storeKind } from '../_lib/store.js';

// limite simples de tentativas por IP (por instância)
const tries = new Map();
const WINDOW = 10 * 60 * 1000, MAX_TRIES = 8;
const ipOf = req => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function GET(req) {
  return json({ authed: isAuthed(req), configured: configured(), store: storeKind() });
}

export async function POST(req) {
  if (!sameOrigin(req)) return json({ error: 'Requisição bloqueada.' }, 403);
  if (!configured()) return json({ error: 'Painel sem senha configurada. Defina ADMIN_PASSWORD (mínimo 8 caracteres) nas variáveis de ambiente da Vercel.' }, 503);
  const ip = ipOf(req), now = Date.now();
  const t = (tries.get(ip) || []).filter(x => now - x < WINDOW);
  if (t.length >= MAX_TRIES) return json({ error: 'Muitas tentativas. Aguarde 10 minutos e tente de novo.' }, 429);
  let body = {};
  try { body = await req.json(); } catch { }
  const pw = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
  if (!checkPassword(pw)) {
    t.push(now); tries.set(ip, t);
    await sleep(700);
    return json({ error: 'Senha incorreta.' }, 401);
  }
  tries.delete(ip);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(req) });
}

export async function DELETE(req) {
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(req) });
}
