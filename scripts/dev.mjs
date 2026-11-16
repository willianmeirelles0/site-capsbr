/* Servidor local que imita a Vercel: arquivos estáticos + funções em api/.
   Uso: node scripts/dev.mjs [porta]   (lê variáveis de .env.local, se existir) */
import http from 'node:http';
import { promises as fs, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const PORT = +(process.argv[2] || process.env.PORT || 3000);
if (existsSync(path.join(ROOT, '.env.local'))) {
  for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };
const BLOCK = /^\/(\.|api\/_lib|scripts|node_modules|package)/;

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/_')) {
      const file = path.join(ROOT, url.pathname.replace(/\/$/, '') + '.js');
      if (!file.startsWith(path.join(ROOT, 'api')) || !existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
      const mod = await import(pathToFileURL(file).href);
      const fn = mod[req.method];
      if (!fn) { res.writeHead(405, { Allow: Object.keys(mod).join(', ') }); return res.end('Method not allowed'); }
      const chunks = []; for await (const c of req) chunks.push(c);
      const headers = new Headers(); for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
      const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
      const r = await fn(request);
      const h = {}; r.headers.forEach((v, k) => { h[k] = v; });
      const setCookie = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
      if (setCookie.length) h['set-cookie'] = setCookie;
      res.writeHead(r.status, h); return res.end(Buffer.from(await r.arrayBuffer()));
    }
    let p = decodeURIComponent(url.pathname);
    if (BLOCK.test(p)) { res.writeHead(404); return res.end('Not found'); }
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    let st = await fs.stat(file).catch(() => null);
    let target = file;
    if (st && st.isDirectory()) { target = path.join(file, 'index.html'); st = await fs.stat(target).catch(() => null); }
    if (!st) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(await fs.readFile(target));
  } catch (err) {
    console.error(err); res.writeHead(500); res.end('Erro: ' + err.message);
  }
}).listen(PORT, '127.0.0.1', () => console.log(`CapsBR dev em http://127.0.0.1:${PORT}  (painel: /admin/)`));
