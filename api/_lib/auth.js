/* Sessão do painel: cookie HttpOnly assinado com HMAC-SHA256.
   A chave deriva de ADMIN_PASSWORD (ou SESSION_SECRET, se existir):
   trocar a senha encerra todas as sessões abertas. */
import crypto from 'node:crypto';

const COOKIE = 'capsbr_admin';
const TTL = 60 * 60 * 12; // 12 horas

const password = () => process.env.ADMIN_PASSWORD || '';
const secret = () => crypto.createHash('sha256').update('capsbr-admin:' + (process.env.SESSION_SECRET || '') + ':' + password()).digest();
const b64 = buf => Buffer.from(buf).toString('base64url');
const sign = data => b64(crypto.createHmac('sha256', secret()).update(data).digest());
const safeEq = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

export const configured = () => password().length >= 8;
export const checkPassword = input => configured() && safeEq(input, password());

const isLocal = req => /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(new URL(req.url).host);
const cookieAttrs = req => `Path=/api/admin; HttpOnly; SameSite=Strict${isLocal(req) ? '' : '; Secure'}`;

export function sessionCookie(req) {
  const payload = b64(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TTL, n: b64(crypto.randomBytes(9)) }));
  return `${COOKIE}=${payload}.${sign(payload)}; Max-Age=${TTL}; ${cookieAttrs(req)}`;
}
export const clearCookie = req => `${COOKIE}=; Max-Age=0; ${cookieAttrs(req)}`;

export function isAuthed(req) {
  if (!configured()) return false;
  const raw = (req.headers.get('cookie') || '').split(/;\s*/).find(c => c.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig || !safeEq(sig, sign(payload))) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now() / 1000; } catch { return false; }
}

/* Proteção contra requisições de outros sites: cabeçalho próprio + mesma origem */
export function sameOrigin(req) {
  if (req.headers.get('x-capsbr-admin') !== '1') return false;
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(req.url).host || new URL(origin).host === req.headers.get('x-forwarded-host'); } catch { return false; }
}

export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...headers },
});

/** envolve um handler exigindo login (e mesma origem quando altera dados) */
export const guarded = (fn, { mutating = false } = {}) => async req => {
  if (!configured()) return json({ error: 'Painel sem senha configurada. Defina ADMIN_PASSWORD (mínimo 8 caracteres) nas variáveis de ambiente.' }, 503);
  if (!isAuthed(req)) return json({ error: 'Sessão expirada. Entre novamente.' }, 401);
  if (mutating && !sameOrigin(req)) return json({ error: 'Requisição bloqueada.' }, 403);
  try { return await fn(req); } catch (err) {
    console.error('[admin]', err);
    return json({ error: err.message === 'NO_STORE' ? 'Banco de dados não conectado. Conecte o Upstash Redis ao projeto na Vercel.' : 'Erro interno ao processar. Tente de novo.' }, 500);
  }
};
