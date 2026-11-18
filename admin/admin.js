/* =========================================================
   CapsBR · painel administrativo
   Edita um rascunho local do catálogo; "Salvar e publicar" valida
   e grava no servidor (PUT /api/admin/catalog).
   ========================================================= */
import { TIPOS, ROTULO_QTYS, LIMITS, clean, slugify, toNumber, brl, maxDiscount, normalizeProduct, normalizeCatalog } from './validate.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = v => JSON.parse(JSON.stringify(v));
const fmtInt = n => Number(n).toLocaleString('pt-BR');
const money = n => Number.isFinite(n) ? n.toFixed(2).replace('.', ',') : '';
const LS_KEY = 'capsbr-admin-draft';

const state = {
  catalog: null,     // última versão publicada (normalizada pelo servidor)
  meta: { rev: 0 },
  defaults: null,
  store: 'file',
  draft: null,       // o que está sendo editado
  baseJSON: '',
  errors: [],
  view: 'produtos',
  q: '', tipo: '',
  saving: false,
};

/* ---------- API ---------- */
async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'x-capsbr-admin': '1', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { }
  return { ok: res.ok, status: res.status, data };
}

/* ---------- toast / modal ---------- */
function toast(msg, kind = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' toast--' + kind : '');
  el.textContent = msg;
  $('#toasts').append(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, kind === 'err' ? 5000 : 2800);
}

let modalResolve = null;
function modal({ title, html, ok = 'Confirmar', cancel = 'Cancelar', danger = false, input = null }) {
  $('#mTitle').textContent = title;
  $('#mBody').innerHTML = html || '';
  if (input) $('#mBody').insertAdjacentHTML('beforeend', `<label class="field"><span>${esc(input.label)}</span><input type="text" id="mInput" maxlength="${input.max || 120}" placeholder="${esc(input.placeholder || '')}"></label>`);
  const okBtn = $('#mOk');
  okBtn.textContent = ok;
  okBtn.className = 'btn ' + (danger ? 'btn--danger' : 'btn--primary');
  $('#mCancel').textContent = cancel;
  $('#mCancel').hidden = cancel === null;
  $('#modal').hidden = false;
  setTimeout(() => (input ? $('#mInput') : okBtn).focus(), 30);
  return new Promise(r => { modalResolve = r; });
}
function closeModal(val) {
  if (!modalResolve) return;
  const input = $('#mInput');
  const r = modalResolve; modalResolve = null;
  $('#modal').hidden = true;
  r(val ? (input ? { value: input.value } : true) : false);
}
$('#mOk').addEventListener('click', () => closeModal(true));
$('#mCancel').addEventListener('click', () => closeModal(false));
$('.modal__veil').addEventListener('click', () => closeModal(false));
$('#mBody').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'mInput') { e.preventDefault(); closeModal(true); } });

/* ---------- login ---------- */
async function boot() {
  const { data } = await api('/api/admin/session').catch(() => ({ data: {} }));
  state.store = data.store || 'file';
  if (!data.configured) {
    showLogin('O painel ainda não tem senha. Defina a variável ADMIN_PASSWORD (mínimo 8 caracteres) na Vercel e publique de novo.', true);
    return;
  }
  if (!data.authed) return showLogin();
  await loadAll();
}

function showLogin(msg = '', lock = false) {
  $('#app').hidden = true;
  $('#login').hidden = false;
  const err = $('#loginErr');
  err.hidden = !msg; err.textContent = msg;
  $('#loginPw').disabled = lock; $('#loginBtn').disabled = lock;
  if (!lock) setTimeout(() => $('#loginPw').focus(), 50);
}

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('#loginBtn'), pw = $('#loginPw').value;
  if (!pw) return;
  btn.disabled = true; btn.textContent = 'Entrando…';
  const r = await api('/api/admin/session', { method: 'POST', body: { password: pw } }).catch(() => ({ ok: false, data: { error: 'Sem conexão. Tente de novo.' } }));
  btn.disabled = false; btn.textContent = 'Entrar';
  if (!r.ok) {
    $('#loginErr').hidden = false; $('#loginErr').textContent = r.data.error || 'Não foi possível entrar.';
    $('#loginPw').select();
    return;
  }
  $('#loginPw').value = '';
  if (state.draft) { $('#login').hidden = true; $('#app').hidden = false; toast('Sessão renovada. Suas alterações continuam aqui.', 'ok'); return; }
  await loadAll();
});

$('#logoutBtn').addEventListener('click', async () => {
  if (isDirty() && !(await modal({ title: 'Sair sem salvar?', html: '<p>Há alterações que ainda não foram publicadas. Elas ficam guardadas neste navegador e podem ser recuperadas no próximo acesso.</p>', ok: 'Sair' }))) return;
  await api('/api/admin/session', { method: 'DELETE' }).catch(() => { });
  state.draft = null;
  showLogin();
});

/* ---------- carga ---------- */
async function loadAll() {
  const r = await api('/api/admin/catalog');
  if (r.status === 401) return showLogin();
  if (!r.ok) { showLogin(r.data.error || 'Erro ao carregar o catálogo.'); return; }
  state.catalog = r.data.catalog;
  state.meta = r.data.meta || { rev: 0 };
  state.defaults = r.data.defaults;
  setDraft(clone(state.catalog), true);
  $('#login').hidden = true;
  $('#app').hidden = false;
  offerRecovery();
  go(location.hash.slice(1) || 'produtos');
}

function setDraft(cat, asBase = false) {
  state.draft = cat;
  if (asBase) state.baseJSON = JSON.stringify(cat);
  refresh();
}

/* rascunho guardado no navegador (fechou a aba sem salvar) */
function persistDraft() {
  try {
    if (isDirty()) localStorage.setItem(LS_KEY, JSON.stringify({ rev: state.meta.rev, at: Date.now(), draft: state.draft }));
    else localStorage.removeItem(LS_KEY);
  } catch { }
}
function offerRecovery() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { }
  if (!saved || !saved.draft || JSON.stringify(saved.draft) === state.baseJSON) return;
  const when = new Date(saved.at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const stale = saved.rev !== state.meta.rev;
  showBanner('info', `Há alterações não publicadas de ${when}${stale ? ' (feitas sobre uma versão mais antiga)' : ''}.`, [
    ['Recuperar', () => { setDraft(saved.draft); hideBanner(); toast('Alterações recuperadas. Revise e salve.', 'ok'); }],
    ['Descartar', () => { localStorage.removeItem(LS_KEY); hideBanner(); }],
  ]);
}

/* ---------- estado geral ---------- */
const isDirty = () => !!state.draft && JSON.stringify(state.draft) !== state.baseJSON;

let refreshT = 0;
function refresh() {
  state.errors = normalizeCatalog(state.draft).errors;
  updateChrome();
  renderView();
  clearTimeout(refreshT);
  refreshT = setTimeout(persistDraft, 400);
}
// atualizações leves enquanto digita (sem redesenhar a tela)
function touch() {
  state.errors = normalizeCatalog(state.draft).errors;
  updateChrome();
  showSiteErrors();
  renderSiteDerived();
  clearTimeout(refreshT);
  refreshT = setTimeout(persistDraft, 400);
}

function updateChrome() {
  const dirty = isDirty(), nErr = state.errors.length;
  $('#saveBtn').disabled = !dirty || state.saving;
  $('#discardBtn').disabled = !dirty || state.saving;
  const st = $('#status');
  if (nErr && dirty) { st.className = 'status status--error'; st.textContent = nErr === 1 ? '1 problema para corrigir' : `${nErr} problemas para corrigir`; }
  else if (dirty) { st.className = 'status status--dirty'; st.textContent = 'Alterações não publicadas'; }
  else { st.className = 'status status--clean'; st.textContent = 'Tudo publicado'; }
  const m = state.meta;
  $('#metaInfo').textContent = m.rev ? `Versão ${m.rev} · publicada em ${new Date(m.savedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}` : 'Catálogo padrão do site (ainda não editado)';
  $('#navCount').textContent = state.draft.products.length;
  if (state.store === 'none' && !$('#banner').dataset.kind) showBanner('error', 'O banco de dados não está conectado, então salvar não vai funcionar. Na Vercel, abra o projeto, vá em Storage e conecte o Upstash Redis.');
}

function showBanner(kind, text, actions = []) {
  const b = $('#banner');
  b.className = 'banner banner--' + kind; b.dataset.kind = kind;
  b.innerHTML = `<span>${esc(text)}</span>`;
  actions.forEach(([label, fn]) => { const btn = document.createElement('button'); btn.className = 'btn btn--ghost'; btn.textContent = label; btn.onclick = fn; b.append(btn); });
  b.hidden = false;
}
function hideBanner() { const b = $('#banner'); b.hidden = true; delete b.dataset.kind; }

/* ---------- navegação ---------- */
const TITLES = { produtos: 'Produtos', campanha: 'Campanha', valores: 'Custos do pedido', contato: 'Contato e avisos', catalogo: 'Catálogo', historico: 'Histórico', backup: 'Backup' };
function go(view) {
  if (!TITLES[view]) view = 'produtos';
  state.view = view;
  $$('#nav button').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  $$('.view').forEach(v => { v.hidden = v.dataset.view !== view; });
  $('#viewTitle').textContent = TITLES[view];
  if (location.hash.slice(1) !== view) history.replaceState(null, '', '#' + view);
  $('#app').classList.remove('is-menu');
  renderView();
  if (view === 'historico') loadHistory();
  if (view === 'catalogo') renderCatalogLink();
  window.scrollTo(0, 0);
}
$('#nav').addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (b) go(b.dataset.view); });
$('#menuBtn').addEventListener('click', () => $('#app').classList.toggle('is-menu'));
window.addEventListener('hashchange', () => go(location.hash.slice(1)));

function renderView() {
  if (!state.draft) return;
  if (state.view === 'produtos') renderProducts();
  else if (['campanha', 'valores', 'contato'].includes(state.view)) renderSite();
}

/* =========================================================
   PRODUTOS
   ========================================================= */
const productErrors = i => state.errors.filter(e => e.index === i);

function renderProducts() {
  const list = state.draft.products;
  const q = state.q.trim().toLowerCase();
  const filtering = !!(q || state.tipo);
  const rows = list.map((p, i) => ({ p, i })).filter(({ p }) =>
    (!state.tipo || p.tipo === state.tipo) &&
    (!q || [p.titulo, p.nome, p.id, p.categoria, p.slug].join(' ').toLowerCase().includes(q)));
  $('#pTable tbody').innerHTML = rows.map(({ p, i }) => {
    const errs = productErrors(i);
    const keys = Object.keys(p.volumes || {}).map(Number).sort((a, b) => a - b);
    const last = keys.length ? p.volumes[keys[keys.length - 1]] : null;
    const img = IMG_BY_TIPO[p.tipo] || 'capsulas';
    return `<tr data-i="${i}" class="${errs.length ? 'is-err' : ''}">
      <td><div class="ord"><span>${i + 1}</span>
        <button class="icon-btn" data-act="up" title="Subir" ${i === 0 || filtering ? 'disabled' : ''}>↑</button>
        <button class="icon-btn" data-act="down" title="Descer" ${i === list.length - 1 || filtering ? 'disabled' : ''}>↓</button></div></td>
      <td><div class="prod"><img src="/assets/img/${img}-card.jpg" alt="" loading="lazy"><div><b>${esc(p.titulo || 'Sem nome')}</b><small>${esc(p.id || 'sem código')}${errs.length ? `<span class="tag-err">${errs.length === 1 ? '1 problema' : errs.length + ' problemas'}</span>` : ''}</small></div></div></td>
      <td>${esc(p.tipo)} · <span class="muted">${esc(p.categoria)}</span></td>
      <td class="num">${last ? `<b>${brl(last[1])}</b><br><small class="muted"><s>${brl(last[0])}</s> · ${fmtInt(keys[keys.length - 1])} un.</small>` : '<span class="muted">sem preço</span>'}</td>
      <td class="num">${p.desconto ? `-${p.desconto}%` : '<span class="muted">sem selo</span>'}</td>
      <td class="c-hot"><label class="switch-row mini-switch" title="Mais pedido"><input type="checkbox" data-act="hot" ${p.maisPedido ? 'checked' : ''}><span class="switch"></span></label></td>
      <td><div class="acts">
        <button class="icon-btn" data-act="edit" title="Editar">✎</button>
        <button class="icon-btn" data-act="dup" title="Duplicar">⧉</button>
        <a class="icon-btn" href="/produto.html?p=${encodeURIComponent(p.slug)}" target="_blank" rel="noopener" title="Ver no site (versão publicada)">↗</a>
        <button class="icon-btn icon-btn--del" data-act="del" title="Excluir">🗑</button></div></td>
    </tr>`;
  }).join('');
  $('#pEmpty').hidden = rows.length > 0;
  $('#pEmpty').textContent = list.length ? 'Nenhum produto encontrado com esse filtro.' : 'Nenhum produto. Clique em "+ Novo produto".';
}

$('#q').addEventListener('input', e => { state.q = e.target.value; renderProducts(); });
$('#fTipo').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  state.tipo = b.dataset.v;
  $$('#fTipo button').forEach(x => x.classList.toggle('is-active', x === b));
  renderProducts();
});

$('#pTable tbody').addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el || el.tagName === 'INPUT') return;
  const i = +el.closest('tr').dataset.i, list = state.draft.products, p = list[i];
  const act = el.dataset.act;
  if (act === 'edit') openEditor(i);
  else if (act === 'up' && i > 0) { [list[i - 1], list[i]] = [list[i], list[i - 1]]; refresh(); }
  else if (act === 'down' && i < list.length - 1) { [list[i + 1], list[i]] = [list[i], list[i + 1]]; refresh(); }
  else if (act === 'dup') {
    if (list.length >= LIMITS.products) return toast(`Limite de ${LIMITS.products} produtos.`, 'err');
    const c = clone(p);
    c.titulo = (p.titulo + ' (cópia)').slice(0, 80); c.nome = c.titulo;
    c.id = nextId(p.tipo); c.slug = uniqueSlug(slugify(c.titulo));
    c.maisPedido = false;
    list.splice(i + 1, 0, c); refresh();
    openEditor(i + 1);
    toast('Produto duplicado. Ajuste o nome e o código.', 'ok');
  } else if (act === 'del') {
    if (list.length <= 1) return toast('O catálogo precisa de ao menos um produto.', 'err');
    const ok = await modal({ title: 'Excluir produto?', html: `<p><b>${esc(p.titulo)}</b> (${esc(p.id)}) vai sair do site quando você salvar. Links já compartilhados para esse produto deixam de funcionar.</p>`, ok: 'Excluir', danger: true });
    if (!ok) return;
    list.splice(i, 1); refresh();
    toast('Produto removido do rascunho.');
  }
});
$('#pTable tbody').addEventListener('change', e => {
  if (e.target.dataset.act !== 'hot') return;
  const i = +e.target.closest('tr').dataset.i;
  state.draft.products[i].maisPedido = e.target.checked;
  refresh();
});

const ID_PREFIX = { 'Cápsulas': 'C', 'Líquidos': 'L', 'Gomas e Pastilhas': 'G', 'Solúveis': 'S' };
const IMG_BY_TIPO = { 'Cápsulas': 'capsulas', 'Líquidos': 'liquidos', 'Gomas e Pastilhas': 'gomas', 'Solúveis': 'soluveis' };
function nextId(tipo) {
  const pre = ID_PREFIX[tipo] || 'C';
  const used = new Set(state.draft.products.map(p => p.id));
  let n = Math.max(0, ...state.draft.products.map(p => (p.id.match(new RegExp(`^${pre}-(\\d+)$`)) || [])[1] | 0)) + 1;
  while (used.has(`${pre}-${String(n).padStart(3, '0')}`)) n++;
  return `${pre}-${String(n).padStart(3, '0')}`;
}
function uniqueSlug(base, skip = -1) {
  const used = new Set(state.draft.products.filter((_, i) => i !== skip).map(p => p.slug));
  let s = base || 'produto', n = 2;
  while (used.has(s)) s = `${base}-${n++}`;
  return s;
}

/* ---------- editor (gaveta) ---------- */
const form = $('#pForm');
let ed = null; // { index, isNew, slugTouched, startJSON }

$('#newBtn').addEventListener('click', () => {
  if (state.draft.products.length >= LIMITS.products) return toast(`Limite de ${LIMITS.products} produtos.`, 'err');
  const tipo = state.tipo || 'Cápsulas';
  openEditor(-1, {
    id: nextId(tipo), slug: '', titulo: '', nome: '', tipo, categoria: '', tamanho: tipo === 'Líquidos' ? '30 mL' : '60 cápsulas',
    maisPedido: false, descricao: '', beneficios: [''], volumes: { 300: ['', ''], 500: ['', ''], 1000: ['', ''] }, desconto: '',
    porcao: '', porcoes: '', tabela: [], naoContem: '',
  });
});

function openEditor(index, blank) {
  const p = blank || clone(state.draft.products[index]);
  ed = { index, isNew: index < 0, slugTouched: index >= 0 };
  $('#dMode').textContent = ed.isNew ? 'Novo produto' : `Editando · ${p.id}`;
  $('#dTitle').textContent = p.titulo || 'Novo produto';
  const f = form.elements;
  f.titulo.value = p.titulo; f.nome.value = p.nome && p.nome !== p.titulo ? p.nome : '';
  f.id.value = p.id; f.slug.value = p.slug; f.tipo.value = TIPOS.includes(p.tipo) ? p.tipo : TIPOS[0];
  f.categoria.value = p.categoria; f.tamanho.value = p.tamanho; f.maisPedido.checked = !!p.maisPedido;
  f.descricao.value = p.descricao; f.porcao.value = p.porcao || ''; f.porcoes.value = p.porcoes || ''; f.naoContem.value = p.naoContem || '';
  // desconto: vazio quando igual ao automático
  const auto = maxDiscount(numVolumes(p.volumes));
  f.desconto.value = p.desconto === '' || p.desconto === auto ? '' : p.desconto;
  f.desconto.placeholder = String(auto);
  $('#catList').innerHTML = [...new Set(state.draft.products.map(x => x.categoria).filter(Boolean))].sort().map(c => `<option value="${esc(c)}">`).join('');
  renderVolRows(Object.entries(p.volumes || {}).map(([q, [de, por]]) => [q, typeof de === 'number' ? money(de) : de, typeof por === 'number' ? money(por) : por]));
  f.fornNome.value = p.fornecedor?.nome || '';
  f.fornAnvisa.value = typeof p.fornecedor?.anvisa === 'number' ? money(p.fornecedor.anvisa) : (p.fornecedor?.anvisa || '');
  renderFornRotRows(Object.entries(p.fornecedor?.rotulo || {}).map(([q, preco]) => [q, typeof preco === 'number' ? money(preco) : preco]));
  renderListInputs('#benList', p.beneficios?.length ? p.beneficios : [''], 120, 'Benefício');
  renderNutRows(p.tabela || []);
  $('#drawer').hidden = false;
  document.body.style.overflow = 'hidden';
  ed.startJSON = JSON.stringify(readForm());
  validateForm(false);
  setTimeout(() => f.titulo.focus(), 60);
}

const numVolumes = v => Object.fromEntries(Object.entries(v || {}).map(([q, [de, por]]) => [q, [toNumber(de), toNumber(por)]]).filter(([, [de, por]]) => de > 0 && por > 0));

function renderVolRows(rows) {
  $('#volBody').innerHTML = rows.map(([q, de, por]) => `<tr>
    <td><div class="affix"><input type="text" inputmode="numeric" data-v="q" value="${esc(q)}" maxlength="7" aria-label="Quantidade"><em>un.</em></div></td>
    <td><div class="affix affix--pre"><em>R$</em><input type="text" inputmode="decimal" data-v="de" value="${esc(de)}" maxlength="10" aria-label="Preço normal"></div></td>
    <td><div class="affix affix--pre"><em>R$</em><input type="text" inputmode="decimal" data-v="por" value="${esc(por)}" maxlength="10" aria-label="Preço na campanha"></div></td>
    <td class="off"></td>
    <td><button type="button" class="icon-btn icon-btn--del" data-rm title="Remover faixa">✕</button></td></tr>`).join('');
  updateVolOffs();
}
function updateVolOffs() {
  $$('#volBody tr').forEach(tr => {
    const deInput = $('[data-v=de]', tr), porInput = $('[data-v=por]', tr);
    const de = toNumber(deInput.value), porTyped = porInput.value.trim();
    porInput.placeholder = de > 0 ? money(de) : '';
    const por = porTyped ? toNumber(porTyped) : de;
    const cell = $('.off', tr);
    if (de > 0 && por > 0) {
      const off = Math.round((1 - por / de) * 100);
      cell.textContent = !porTyped ? 'sem promo' : off < 0 ? 'maior!' : `-${off}%`;
      cell.classList.toggle('is-bad', off < 0);
    } else { cell.textContent = ''; cell.classList.remove('is-bad'); }
  });
}
function renderFornRotRows(rows) {
  $('#fornRotBody').innerHTML = rows.map(([q, preco]) => `<tr>
    <td><div class="affix"><input type="text" inputmode="numeric" data-fr="q" value="${esc(q)}" maxlength="7" aria-label="Quantidade de rótulos"><em>un.</em></div></td>
    <td><div class="affix affix--pre"><em>R$</em><input type="text" inputmode="decimal" data-fr="preco" value="${esc(preco)}" maxlength="10" aria-label="Preço"></div></td>
    <td><button type="button" class="icon-btn icon-btn--del" data-rm title="Remover quantidade">✕</button></td></tr>`).join('');
  $('#addFornRot').disabled = rows.length >= LIMITS.volumes;
}
function renderNutRows(rows) {
  $('#nutBody').innerHTML = rows.map(r => `<tr>
    <td><input type="text" data-n="0" value="${esc(r[0])}" maxlength="60" aria-label="Nutriente"></td>
    <td><input type="text" data-n="1" value="${esc(r[1])}" maxlength="20" aria-label="Quantidade"></td>
    <td><input type="text" data-n="2" value="${esc(r[2])}" maxlength="20" aria-label="%VD"></td>
    <td><button type="button" class="icon-btn icon-btn--del" data-rm title="Remover linha">✕</button></td></tr>`).join('');
}
function renderListInputs(sel, items, max, label) {
  $(sel).innerHTML = items.map((t, i) => `<li>
    <input type="text" value="${esc(t)}" maxlength="${max}" aria-label="${label} ${i + 1}">
    <button type="button" class="icon-btn" data-mv="-1" title="Subir" ${i === 0 ? 'disabled' : ''}>↑</button>
    <button type="button" class="icon-btn" data-mv="1" title="Descer" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
    <button type="button" class="icon-btn icon-btn--del" data-rm title="Remover">✕</button></li>`).join('');
}
const listValues = sel => $$(sel + ' input').map(i => i.value);

function readForm() {
  const f = form.elements;
  const volumes = {};
  $$('#volBody tr').forEach(tr => {
    const q = parseInt($('[data-v=q]', tr).value.replace(/\D/g, ''), 10);
    if (q > 0 && volumes[q] === undefined) volumes[q] = [$('[data-v=de]', tr).value, $('[data-v=por]', tr).value];
  });
  const fornRot = {};
  $$('#fornRotBody tr').forEach(tr => {
    const q = parseInt($('[data-fr=q]', tr).value.replace(/\D/g, ''), 10);
    if (q > 0 && fornRot[q] === undefined) fornRot[q] = $('[data-fr=preco]', tr).value;
  });
  return {
    titulo: f.titulo.value, nome: f.nome.value, id: f.id.value, slug: f.slug.value, tipo: f.tipo.value,
    categoria: f.categoria.value, tamanho: f.tamanho.value, maisPedido: f.maisPedido.checked,
    descricao: f.descricao.value, beneficios: listValues('#benList'),
    volumes, desconto: f.desconto.value.trim(),
    fornecedor: { nome: f.fornNome.value, anvisa: f.fornAnvisa.value.trim(), rotulo: fornRot },
    porcao: f.porcao.value, porcoes: f.porcoes.value,
    tabela: $$('#nutBody tr').map(tr => $$('input', tr).map(i => i.value)),
    naoContem: f.naoContem.value,
  };
}

function validateForm(show = true) {
  const raw = readForm();
  const { product, errors } = normalizeProduct(raw, ed.index);
  // código e endereço únicos
  state.draft.products.forEach((p, i) => {
    if (i === ed.index) return;
    if (product.id && p.id === product.id) errors.push({ field: 'id', msg: `O código ${product.id} já é usado em "${p.titulo}".` });
    if (product.slug && p.slug === product.slug) errors.push({ field: 'slug', msg: `O endereço "${product.slug}" já é usado em "${p.titulo}".` });
  });
  const qs = $$('#volBody tr').map(tr => $('[data-v=q]', tr).value.replace(/\D/g, ''));
  if (qs.some(q => !(+q > 0))) errors.push({ field: 'volumes', msg: 'Preencha a quantidade em todas as faixas.' });
  const dupQ = qs.filter((q, i) => q && qs.indexOf(q) !== i);
  if (dupQ.length) errors.push({ field: 'volumes', msg: `Quantidade repetida: ${fmtInt(+dupQ[0])}.` });
  // evita mensagens repetidas: sem nome não há endereço; erros de faixa já explicam a falta de preço
  const has = f => errors.some(e => e.field === f && !/^Cadastre/.test(e.msg));
  for (let k = errors.length - 1; k >= 0; k--) {
    const e = errors[k];
    if ((e.field === 'slug' && has('titulo') && !raw.slug) || (e.field === 'volumes' && /^Cadastre ao menos uma faixa de preço/.test(e.msg) && has('volumes'))) errors.splice(k, 1);
  }
  const byField = {};
  errors.forEach(e => { (byField[e.field] ||= []).push(e.msg); });
  $$('[data-perr]', form).forEach(el => {
    const msgs = byField[el.dataset.perr];
    el.textContent = show && msgs ? [...new Set(msgs)].join(' ') : '';
    const input = form.elements[el.dataset.perr];
    if (input && input.classList) (input.closest('.affix') || input).classList.toggle('is-invalid', !!(show && msgs));
  });
  const auto = maxDiscount(product.volumes);
  form.elements.desconto.placeholder = String(auto);
  $('#autoOff').textContent = form.elements.desconto.value.trim() === '' ? `Automático: maior desconto da tabela (${auto}%)` : `Voltar ao automático (${auto}%)`;
  $('#dErrSum').textContent = show && errors.length ? (errors.length === 1 ? '1 campo precisa de atenção' : `${errors.length} campos precisam de atenção`) : '';
  $('#idHint').textContent = ed.isNew ? 'Sugerido automaticamente. Use C- para cápsulas e L- para líquidos.' : '';
  $('#dTitle').textContent = clean(raw.titulo, 80) || (ed.isNew ? 'Novo produto' : 'Produto');
  // limites das listas
  $('#addBen').disabled = $$('#benList li').length >= LIMITS.beneficios;
  $('#addVol').disabled = $$('#volBody tr').length >= LIMITS.volumes;
  $('#addFornRot').disabled = $$('#fornRotBody tr').length >= LIMITS.volumes;
  $('#addRow').disabled = $$('#nutBody tr').length >= LIMITS.tabela;
  return { product, errors };
}

let showErr = false;
form.addEventListener('input', e => {
  const f = form.elements;
  if (e.target === f.slug) ed.slugTouched = true;
  if (e.target === f.titulo && !ed.slugTouched) f.slug.value = uniqueSlug(slugify(f.titulo.value), ed.index);
  if (e.target === f.id) { const pos = e.target.selectionStart; e.target.value = e.target.value.toUpperCase(); e.target.setSelectionRange(pos, pos); }
  if (e.target.closest('#volBody')) updateVolOffs();
  validateForm(showErr || !ed.isNew);
});
form.addEventListener('change', e => {
  const f = form.elements;
  if (e.target === f.tipo && ed.isNew && /^[CLGS]-\d+$/.test(f.id.value)) f.id.value = nextId(f.tipo.value);
  if (e.target === f.slug) f.slug.value = slugify(f.slug.value);
  validateForm(showErr || !ed.isNew);
});
form.addEventListener('click', e => {
  const rm = e.target.closest('[data-rm]'), mv = e.target.closest('[data-mv]');
  if (rm) {
    const row = rm.closest('tr, li');
    if (row.closest('#volBody') && $$('#volBody tr').length <= 1) return toast('Deixe ao menos uma faixa de preço.', 'err');
    const inBen = !!row.closest('#benList');
    row.remove();
    if (inBen) renderListInputs('#benList', listValues('#benList'), 120, 'Benefício');
    updateVolOffs(); validateForm(showErr || !ed.isNew);
  } else if (mv) {
    const vals = listValues('#benList'), i = $$('#benList li').indexOf(mv.closest('li')), j = i + +mv.dataset.mv;
    if (j < 0 || j >= vals.length) return;
    [vals[i], vals[j]] = [vals[j], vals[i]];
    renderListInputs('#benList', vals, 120, 'Benefício');
    $$('#benList input')[j].focus();
  }
});
$('#addVol').addEventListener('click', () => {
  const rows = $$('#volBody tr').map(tr => ['q', 'de', 'por'].map(k => $(`[data-v=${k}]`, tr).value));
  const maxQ = Math.max(0, ...rows.map(r => toNumber(r[0]) || 0));
  rows.push([String(maxQ ? maxQ * 2 : 300), '', '']);
  renderVolRows(rows);
  $$('#volBody tr').at(-1).querySelector('[data-v=de]').focus();
  validateForm(showErr || !ed.isNew);
});
$('#addFornRot').addEventListener('click', () => {
  const rows = $$('#fornRotBody tr').map(tr => ['q', 'preco'].map(k => $(`[data-fr=${k}]`, tr).value));
  const used = rows.map(r => toNumber(r[0]) || 0);
  rows.push([String(used.includes(1000) ? '' : 1000), '']);
  renderFornRotRows(rows);
  $$('#fornRotBody tr').at(-1).querySelector('[data-fr=preco]').focus();
  validateForm(showErr || !ed.isNew);
});
$('#addBen').addEventListener('click', () => {
  const vals = listValues('#benList'); vals.push('');
  renderListInputs('#benList', vals, 120, 'Benefício');
  $$('#benList input').at(-1).focus();
  validateForm(showErr || !ed.isNew);
});
$('#addRow').addEventListener('click', () => {
  const rows = $$('#nutBody tr').map(tr => $$('input', tr).map(i => i.value)); rows.push(['', '', '']);
  renderNutRows(rows);
  $$('#nutBody tr').at(-1).querySelector('input').focus();
  validateForm(showErr || !ed.isNew);
});
$('#autoOff').addEventListener('click', () => { form.elements.desconto.value = ''; validateForm(showErr || !ed.isNew); });
// preços: formata ao sair do campo (12.5 → 12,50)
form.addEventListener('focusout', e => {
  const v = e.target.dataset && e.target.dataset.v;
  if (v === 'de' || v === 'por') { const n = toNumber(e.target.value); if (n > 0) e.target.value = money(Math.round(n * 100) / 100); updateVolOffs(); }
  const fr = e.target.dataset && e.target.dataset.fr;
  if (fr === 'preco') { const n = toNumber(e.target.value); if (n > 0) e.target.value = money(Math.round(n * 100) / 100); }
  if (e.target.name === 'fornAnvisa') { const n = toNumber(e.target.value); if (n > 0) e.target.value = money(Math.round(n * 100) / 100); }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  showErr = true;
  const { product, errors } = validateForm(true);
  if (errors.length) {
    const first = $('.err:not(:empty)', form);
    if (first) first.closest('.field, .dsec').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return toast('Corrija os campos em vermelho.', 'err');
  }
  if (ed.isNew) state.draft.products.push(product);
  else state.draft.products[ed.index] = product;
  const wasNew = ed.isNew;
  closeEditor(true);
  refresh();
  toast(wasNew ? 'Produto adicionado. Clique em "Salvar e publicar" para ir ao site.' : 'Alterações aplicadas. Falta publicar.', 'ok');
});

async function closeEditor(force = false) {
  if (!ed) return;
  if (!force && JSON.stringify(readForm()) !== ed.startJSON) {
    const ok = await modal({ title: 'Descartar alterações deste produto?', html: '<p>O que você mudou neste formulário ainda não foi aplicado.</p>', ok: 'Descartar', danger: true });
    if (!ok) return;
  }
  ed = null; showErr = false;
  $('#drawer').hidden = true;
  document.body.style.overflow = '';
}
$$('[data-close]', $('#drawer')).forEach(b => b.addEventListener('click', () => closeEditor()));

/* =========================================================
   CONFIGURAÇÕES DO SITE (campanha, custos, contato)
   ========================================================= */
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] ??= {}), o); t[last] = v; };
const BRT = 3 * 3600 * 1000;
const toBRT = iso => { const d = new Date(iso); return isNaN(d) ? ['', ''] : new Date(d.getTime() - BRT).toISOString().slice(0, 16).split('T'); };

$('#rotTableBody').innerHTML = TIPOS.map(tipo => `<tr>
  <td>${esc(tipo)}</td>
  ${ROTULO_QTYS.map(q => `<td class="num"><div class="affix affix--pre"><em>R$</em><input type="text" inputmode="decimal" data-site="costs.rotulo.${esc(tipo)}.${q}" data-money aria-label="${esc(tipo)}, ${q} un."></div></td>`).join('')}
</tr>`).join('');

function renderSite() {
  const s = state.draft.site;
  $$('[data-site]').forEach(el => {
    if (document.activeElement === el) return;
    const v = getPath(s, el.dataset.site);
    if (el.type === 'checkbox') el.checked = !!v;
    else el.value = v == null ? '' : (el.hasAttribute('data-money') && typeof v === 'number' ? money(v) : String(v));
  });
  const [d, t] = toBRT(s.promo.end);
  if (document.activeElement !== $('#promoDate')) $('#promoDate').value = d;
  if (document.activeElement !== $('#promoTime')) $('#promoTime').value = t;
  renderAnnounce();
  showSiteErrors();
  renderSiteDerived();
}

function renderSiteDerived() {
  const s = state.draft.site, pr = s.promo;
  const end = new Date(pr.end), now = Date.now();
  const pill = $('#promoState');
  const endTxt = isNaN(end) ? '' : end.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (!pr.enabled) { pill.className = 'pill pill--off'; pill.textContent = 'Desligada'; }
  else if (isNaN(end) || end.getTime() <= now) { pill.className = 'pill pill--ended'; pill.textContent = 'Encerrada pela data'; }
  else { pill.className = 'pill pill--on'; pill.textContent = 'No ar até ' + endTxt; }
  const realMax = Math.max(0, ...state.draft.products.map(p => maxDiscount(p.volumes)));
  $('#maxHelp').textContent = `Usado nos textos "até X% off". Maior desconto real entre os produtos: ${realMax}%.`;
  const endDM = isNaN(end) ? '--/--' : end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
  $('#bannerAuto').textContent = `${clean(pr.name, 40) || 'Campanha'} CapsBR: até ${Math.round(toNumber(pr.max)) || 0}% off até ${endDM}`;
  // custos: exemplo
  const c = s.costs, lote = Math.max(1, Math.round(toNumber(c.rotuloLote)) || 1);
  const ex = 1000, packs = Math.ceil(ex / lote);
  const rc = toNumber(c.rotuloCaps), an = toNumber(c.anvisa);
  $('#costExample').innerHTML = Number.isFinite(rc) && Number.isFinite(an)
    ? `Exemplo, pedido de ${fmtInt(ex)} cápsulas: ${packs} lote${packs > 1 ? 's' : ''} de rótulos (${brl(packs * rc)}) + ANVISA (${brl(an)}) = <b>${brl(packs * rc + an)}</b> além do valor dos produtos.`
    : 'Preencha os valores para ver um exemplo.';
  // whatsapp
  const wa = String(s.whatsapp || '').replace(/\D/g, '');
  const m = wa.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  $('#waFmt').textContent = m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : 'Ex.: 55 + DDD + número, só dígitos.';
  $('#waTest').href = 'https://wa.me/' + wa;
  $('#waTest').classList.toggle('is-disabled', wa.length < 10);
}

function showSiteErrors() {
  const map = {};
  state.errors.filter(e => e.index === undefined).forEach(e => { (map[e.field] ||= []).push(e.msg); });
  $$('[data-err]').forEach(el => {
    const msgs = map[el.dataset.err];
    el.textContent = msgs ? msgs.join(' ') : '';
    const input = $(`[data-site="${el.dataset.err}"]`) || (el.dataset.err === 'promo.end' ? $('#promoDate') : null);
    if (input) (input.closest('.affix') || input).classList.toggle('is-invalid', !!msgs);
  });
}

document.addEventListener('input', e => {
  const el = e.target;
  if (!el.dataset || !el.dataset.site || !state.draft) return;
  const path = el.dataset.site;
  let v;
  if (el.type === 'checkbox') v = el.checked;
  else if (/^(costs\.|promo\.max)/.test(path)) { const n = toNumber(el.value); v = el.value.trim() === '' ? '' : (Number.isFinite(n) ? n : el.value); }
  else if (path === 'whatsapp') v = el.value.replace(/\D/g, '');
  else v = el.value;
  setPath(state.draft.site, path, v);
  touch();
});
document.addEventListener('change', e => {
  if (e.target.matches('[data-money]')) { const n = toNumber(e.target.value); if (Number.isFinite(n) && e.target.value.trim()) e.target.value = money(n); }
  if (e.target.id === 'promoDate' || e.target.id === 'promoTime') {
    const d = $('#promoDate').value, t = $('#promoTime').value || '23:59';
    const iso = d ? new Date(`${d}T${t}:${t === '23:59' ? '59' : '00'}-03:00`) : null;
    state.draft.site.promo.end = iso && !isNaN(iso) ? iso.toISOString() : 'data inválida';
    touch();
  }
});
$('#promoOn').addEventListener('change', touch);

/* avisos do topo */
function renderAnnounce() {
  const items = state.draft.site.announce;
  $('#annList').innerHTML = items.map((t, i) => `<li>
    <input type="text" value="${esc(t)}" maxlength="90" data-ann="${i}" aria-label="Aviso ${i + 1}">
    <button class="icon-btn" data-amv="-1" ${i === 0 ? 'disabled' : ''} title="Subir">↑</button>
    <button class="icon-btn" data-amv="1" ${i === items.length - 1 ? 'disabled' : ''} title="Descer">↓</button>
    <button class="icon-btn icon-btn--del" data-arm title="Remover">✕</button></li>`).join('');
  $('#addAnn').disabled = items.length >= LIMITS.announce;
}
$('#annList').addEventListener('input', e => {
  const i = e.target.dataset.ann; if (i === undefined) return;
  state.draft.site.announce[+i] = e.target.value; touch();
});
$('#annList').addEventListener('click', e => {
  const li = e.target.closest('li'); if (!li) return;
  const i = $$('#annList li').indexOf(li), a = state.draft.site.announce;
  if (e.target.closest('[data-arm]')) { a.splice(i, 1); refresh(); }
  const mv = e.target.closest('[data-amv]');
  if (mv) { const j = i + +mv.dataset.amv; if (j >= 0 && j < a.length) { [a[i], a[j]] = [a[j], a[i]]; refresh(); } }
});
$('#addAnn').addEventListener('click', () => {
  const a = state.draft.site.announce;
  if (a.length >= LIMITS.announce) return;
  a.push(''); refresh();
  $$('#annList input').at(-1).focus();
});

/* =========================================================
   SALVAR / DESCARTAR
   ========================================================= */
async function save() {
  if (!isDirty() || state.saving) return;
  if (ed) { toast('Aplique ou feche o produto aberto antes de salvar.', 'err'); return; }
  const { errors } = normalizeCatalog(state.draft);
  if (errors.length) return showErrorList(errors);
  const r0 = await modal({ title: 'Publicar alterações?', html: `<p>${describeChanges()}</p><p class="muted">O site atualiza em até 1 minuto.</p>`, ok: 'Publicar', input: { label: 'Descrição para o histórico (opcional)', placeholder: 'Ex.: preços de dezembro', max: 120 } });
  if (!r0) return;
  state.saving = true; updateChrome();
  $('#saveBtn').textContent = 'Publicando…';
  let r;
  try { r = await api('/api/admin/catalog', { method: 'PUT', body: { catalog: state.draft, baseRev: state.meta.rev, note: r0.value || '' } }); }
  catch { r = { ok: false, status: 0, data: { error: 'Sem conexão com o servidor. Suas alterações continuam aqui; tente de novo.' } }; }
  state.saving = false;
  $('#saveBtn').textContent = 'Salvar e publicar';
  if (r.ok) {
    state.catalog = r.data.catalog; state.meta = r.data.meta;
    setDraft(clone(r.data.catalog), true);
    try { localStorage.removeItem(LS_KEY); } catch { }
    if ($('#banner').dataset.kind !== 'error' || state.store !== 'none') hideBanner();
    toast(`Publicado! Versão ${r.data.meta.rev}.`, 'ok');
    return;
  }
  updateChrome();
  if (r.status === 401) { showLogin('Sua sessão expirou. Entre de novo; as alterações não foram perdidas.'); return; }
  if (r.status === 422 && r.data.errors) return showErrorList(r.data.errors);
  if (r.status === 409) {
    const reload = await modal({ title: 'Versão desatualizada', html: `<p>${esc(r.data.error)}</p><p>Recomendado: baixe um backup do seu rascunho antes, depois recarregue.</p>`, ok: 'Recarregar versão nova', cancel: 'Baixar backup primeiro', danger: true });
    if (reload) { try { localStorage.removeItem(LS_KEY); } catch { } await loadAll(); toast('Carregada a versão mais nova.'); }
    else exportJSON();
    return;
  }
  modal({ title: 'Não foi possível publicar', html: `<p>${esc(r.data.error || 'Erro inesperado (' + r.status + ').')}</p>`, ok: 'Entendi', cancel: null });
}

function describeChanges() {
  const a = JSON.parse(state.baseJSON), b = state.draft;
  const bi = new Map(a.products.map(p => [p.id, JSON.stringify(p)]));
  const ids = new Set(b.products.map(p => p.id));
  const added = b.products.filter(p => !bi.has(p.id)).length;
  const removed = a.products.filter(p => !ids.has(p.id)).length;
  const changed = b.products.filter(p => bi.has(p.id) && bi.get(p.id) !== JSON.stringify(p)).length;
  const order = a.products.map(p => p.id).join() !== b.products.filter(p => bi.has(p.id)).map(p => p.id).join() && !added && !removed;
  const parts = [];
  if (changed) parts.push(`${changed} produto${changed > 1 ? 's' : ''} alterado${changed > 1 ? 's' : ''}`);
  if (added) parts.push(`${added} novo${added > 1 ? 's' : ''}`);
  if (removed) parts.push(`${removed} excluído${removed > 1 ? 's' : ''}`);
  if (order) parts.push('ordem dos produtos');
  if (JSON.stringify(a.site) !== JSON.stringify(b.site)) parts.push('configurações do site');
  return parts.length ? 'Mudanças: ' + esc(parts.join(', ')) + '.' : 'Publicar o catálogo atual.';
}

function showErrorList(errors) {
  const P = state.draft.products;
  const items = errors.slice(0, 12).map(e => `<li>${e.index !== undefined && P[e.index] ? `<b>${esc(P[e.index].titulo || P[e.index].id || 'Produto ' + (e.index + 1))}</b>: ` : ''}${esc(e.msg)}</li>`).join('');
  modal({ title: 'Corrija antes de publicar', html: `<ul>${items}</ul>${errors.length > 12 ? `<p class="muted">e mais ${errors.length - 12}.</p>` : ''}<p class="muted">Produtos com problema ficam marcados em vermelho na lista.</p>`, ok: 'Entendi', cancel: null });
}

$('#saveBtn').addEventListener('click', save);
$('#discardBtn').addEventListener('click', async () => {
  if (!(await modal({ title: 'Descartar alterações?', html: '<p>Tudo volta para a versão publicada agora no site.</p>', ok: 'Descartar', danger: true }))) return;
  setDraft(clone(state.catalog), true);
  try { localStorage.removeItem(LS_KEY); } catch { }
  toast('Alterações descartadas.');
});
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (ed) form.requestSubmit(); else save();
  }
  if (e.key === 'Escape') { if (!$('#modal').hidden) closeModal(false); else if (ed) closeEditor(); }
});
window.addEventListener('beforeunload', e => { if (isDirty() || (ed && JSON.stringify(readForm()) !== ed.startJSON)) { persistDraft(); e.preventDefault(); e.returnValue = ''; } });

/* =========================================================
   HISTÓRICO
   ========================================================= */
async function loadHistory() {
  $('#histBody').innerHTML = '<tr><td colspan="5" class="muted">Carregando…</td></tr>';
  const r = await api('/api/admin/history').catch(() => ({ ok: false, data: {} }));
  if (r.status === 401) return showLogin('Sua sessão expirou. Entre de novo.');
  if (!r.ok) { $('#histBody').innerHTML = `<tr><td colspan="5" class="err">${esc(r.data.error || 'Erro ao carregar o histórico.')}</td></tr>`; return; }
  const v = r.data.versions || [];
  $('#histEmpty').hidden = v.length > 0;
  $('#histBody').innerHTML = v.map(x => `<tr data-rev="${x.rev}">
    <td><b>v${x.rev}</b>${x.rev === state.meta.rev ? ' <span class="pill pill--on">no ar</span>' : ''}</td>
    <td>${new Date(x.savedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
    <td>${esc(x.note) || '<span class="muted">sem descrição</span>'}</td>
    <td class="num">${x.count}</td>
    <td><div class="acts"><button class="btn btn--sm btn--ghost" data-h="load">Carregar</button><button class="icon-btn" data-h="dl" title="Baixar">⇩</button></div></td></tr>`).join('');
}
$('#histReload').addEventListener('click', loadHistory);
$('#histBody').addEventListener('click', async e => {
  const b = e.target.closest('[data-h]'); if (!b) return;
  const rev = b.closest('tr').dataset.rev;
  const r = await api('/api/admin/history?rev=' + encodeURIComponent(rev));
  if (!r.ok) return toast(r.data.error || 'Versão não encontrada.', 'err');
  if (b.dataset.h === 'dl') return download(`capsbr-v${rev}.json`, { app: 'capsbr', rev: +rev, catalog: r.data.catalog });
  if (isDirty() && !(await modal({ title: `Carregar a versão ${rev}?`, html: '<p>Isso substitui as alterações não publicadas que estão no editor.</p>', ok: 'Carregar', danger: true }))) return;
  setDraft(clone(r.data.catalog));
  go('produtos');
  toast(`Versão ${rev} carregada no editor. Clique em "Salvar e publicar" para voltar o site a ela.`, 'ok');
});

/* =========================================================
   BACKUP
   ========================================================= */
function download(name, data) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function exportJSON() {
  const d = new Date().toISOString().slice(0, 10);
  download(`capsbr-backup-${d}.json`, { app: 'capsbr', exportedAt: new Date().toISOString(), catalog: state.draft });
  toast('Backup baixado.', 'ok');
}
$('#exportBtn').addEventListener('click', exportJSON);
$('#importFile').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  if (file.size > 1_500_000) return toast('Arquivo grande demais.', 'err');
  let data;
  try { data = JSON.parse(await file.text()); } catch { return toast('Esse arquivo não é um JSON válido.', 'err'); }
  const cat = data && data.catalog ? data.catalog : data;
  if (!cat || !Array.isArray(cat.products)) return toast('Arquivo não reconhecido: não encontrei a lista de produtos.', 'err');
  const { catalog, errors } = normalizeCatalog(cat);
  const ok = await modal({ title: 'Importar backup?', html: `<p>${catalog.products.length} produtos encontrados${errors.length ? `, com <b>${errors.length} problema${errors.length > 1 ? 's' : ''}</b> para corrigir antes de publicar` : ', tudo certo'}.</p><p>Isso substitui o conteúdo do editor. O site só muda quando você salvar.</p>`, ok: 'Importar' });
  if (!ok) return;
  setDraft(catalog);
  go('produtos');
  toast('Backup carregado no editor.', 'ok');
});
$('#factoryBtn').addEventListener('click', async () => {
  if (!(await modal({ title: 'Carregar o catálogo padrão?', html: '<p>O editor recebe os 16 produtos e as configurações originais. Para valer no site, clique em "Salvar e publicar" depois.</p>', ok: 'Carregar padrão', danger: true }))) return;
  setDraft(clone(state.defaults));
  go('produtos');
  toast('Catálogo padrão carregado no editor.', 'ok');
});

boot().catch(err => { console.error(err); showLogin('Erro ao abrir o painel. Recarregue a página.'); });

/* =========================================================
   CATÁLOGO: gerador de link
   ========================================================= */
const cat = { linha: 'todas' };
function catalogUrl(extra = {}) {
  const u = new URL('/catalogo.html', location.origin);
  const para = $('#catPara').value.trim().replace(/\s+/g, ' ');
  if (para) u.searchParams.set('para', para);
  if (cat.linha !== 'todas') u.searchParams.set('linha', cat.linha);
  if (!$('#catPrecos').checked) u.searchParams.set('precos', '0');
  Object.entries(extra).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
}
function renderCatalogLink() {
  const url = catalogUrl();
  $('#catUrl').textContent = url;
  $('#catOpen').href = url;
  $('#catPdf').href = catalogUrl({ print: '1', intro: '0' });
  const para = $('#catPara').value.trim().split(/\s+/)[0];
  const msg = (para ? `Olá, ${para}! ` : 'Olá! ') + `Segue o catálogo de fórmulas da CapsBR para a sua marca: ${url}`;
  $('#catWa').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
}
$('#catPara').addEventListener('input', renderCatalogLink);
$('#catPrecos').addEventListener('change', renderCatalogLink);
$('#catLinha').addEventListener('click', e => {
  const b = e.target.closest('button[data-v]'); if (!b) return;
  cat.linha = b.dataset.v;
  $$('#catLinha button').forEach(x => x.classList.toggle('is-active', x === b));
  renderCatalogLink();
});
$('#catCopy').addEventListener('click', async () => {
  const url = catalogUrl();
  try { await navigator.clipboard.writeText(url); toast('Link copiado'); }
  catch {
    const r = document.createRange(); r.selectNodeContents($('#catUrl'));
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    toast('Selecionei o link: copie com Ctrl/Cmd + C');
  }
});
renderCatalogLink();
