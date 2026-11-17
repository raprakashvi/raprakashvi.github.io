// One collection browser for every object.  Domain (header), museum, period, category, principle, function, type,
// role, maker, material and "with a photograph" are filters; counts follow the domain, museums and search.
// Built for tens of thousands of objects: one pass per filter change, cards rendered 60 at a time.
import {boot, loadIndex, loadText, $, $$, esc, fmt, tile, mus, mid, getDomain, inDomain, personality, errorBox} from './core.js';

const PAGE = 60;
const FACETS = [['c', 'Category', 'All categories'], ['pr', 'Principle', 'All principles'], ['fn', 'Function', 'All functions'],
  ['ty', 'Type', 'All types'], ['ro', 'Role', 'All roles'], ['mk', 'Maker', 'All makers'], ['mt', 'Material', 'All materials']];
const PERIODS = [['pre500', 'Before 500'], ['500', '500 to 1499'], ['1500', '1500s'], ['1600', '1600s'], ['1700', '1700s'], ['1800', '1800s'], ['1900', '1900s'], ['2000', '2000s'], ['none', 'Undated']];
const periodOf = r => { const x = mid(r); if (x == null) return 'none'; if (x < 500) return 'pre500'; if (x < 1500) return '500'; return String(Math.min(2000, Math.floor(x / 100) * 100)); };

const main = $('#main');
let IX, TEXT = null, textLoading = null, shown = 0, matched = [];
const st = {q: '', per: '', img: false, m: new Set(), sort: 'name'};
FACETS.forEach(f => st[f[0]] = '');

try {
  await boot();
  IX = await loadIndex();
  init();
} catch (e) { errorBox($('#grid'), e); $('#count').textContent = ''; }

function readURL() {
  const p = new URLSearchParams(location.search);
  st.q = p.get('q') || ''; st.per = p.get('per') || ''; st.img = p.get('img') === '1'; st.sort = p.get('sort') || personality().sort;
  FACETS.forEach(([k]) => st[k] = p.get(k) || '');
  st.m = new Set((p.get('m') || '').split(',').filter(x => x !== '').map(Number));
}
function writeURL() {
  const p = new URLSearchParams();
  if (st.q) p.set('q', st.q);
  if (st.per) p.set('per', st.per);
  FACETS.forEach(([k]) => { if (st[k]) p.set(k, st[k]); });
  // the domain filter is global state; keep it in the URL so an old science link (?d=sci) stays shareable
  if (getDomain() !== 'all') p.set('d', getDomain());
  if (st.m.size) p.set('m', [...st.m].sort((a, b) => a - b).join(','));
  if (st.img) p.set('img', '1');
  if (st.sort !== personality().sort) p.set('sort', st.sort);   // the domain's default order stays out of the URL
  const s = p.toString();
  history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
}
function ensureText() {
  if (TEXT || textLoading) return textLoading;
  textLoading = loadText().then(t => { TEXT = t; apply(); }).catch(() => { textLoading = null; });
  return textLoading;
}

function init() {
  readURL();
  for (const r of IX.rows) r.per = periodOf(r);
  $('#q').value = st.q; $('#f-img').checked = st.img; $('#sort').value = st.sort;
  if (st.q) ensureText();
  let tm;
  $('#q').addEventListener('input', e => { st.q = e.target.value; ensureText(); clearTimeout(tm); tm = setTimeout(apply, 120); });
  $('#facets').addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'f-per') st.per = e.target.value;
    else if (id === 'f-img') st.img = e.target.checked;
    else if (id === 'sort') st.sort = e.target.value;
    else if (id.startsWith('f-')) st[id.slice(2)] = e.target.value;
    apply();
  });
  $('#reset').onclick = () => { st.q = ''; st.per = ''; st.img = false; st.m.clear(); FACETS.forEach(([k]) => st[k] = ''); $('#q').value = ''; $('#f-img').checked = false; apply(); };
  $('#mchips').addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (!b) return; const i = +b.dataset.m; st.m.has(i) ? st.m.delete(i) : st.m.add(i); apply(); });
  $('#active').addEventListener('click', e => {
    const b = e.target.closest('[data-clear]'); if (!b) return;
    const k = b.dataset.clear;
    if (k === 'q') { st.q = ''; $('#q').value = ''; } else if (k === 'img') { st.img = false; $('#f-img').checked = false; } else if (k === 'm') st.m.delete(+b.dataset.v); else st[k] = '';
    apply();
  });
  $('#more').onclick = () => render(shown + PAGE);
  // the header search filters this page in place
  document.querySelector('.global-search')?.addEventListener('submit', e => { e.preventDefault(); st.q = $('#workspace-query').value.trim(); $('#q').value = st.q; ensureText(); apply(); $('#q').focus(); });
  window.addEventListener('vestigium:domain', () => { st.m.clear(); st.sort = personality().sort; $('#sort').value = st.sort; apply(); });
  apply();
}

function textOf(r) { return TEXT ? TEXT[r.i] : (r.t + ' ' + r.id).toLowerCase(); }

function apply() {
  const D = IX.dict, q = st.q.trim().toLowerCase(), terms = q ? q.split(/\s+/) : [];
  const want = {};
  FACETS.forEach(([k]) => { if (st[k]) { const i = D[k].indexOf(st[k]); want[k] = i; } });
  // base set: domain + search (counts for museums and facets are taken over it)
  const base = [];
  for (const r of IX.rows) {
    if (!inDomain(r.d)) continue;
    if (terms.length) { const t = textOf(r); if (!terms.every(w => t.includes(w))) continue; }
    base.push(r);
  }
  matched = [];
  const fc = {}, mc = new Map(), pc = {};
  FACETS.forEach(([k]) => fc[k] = new Map());
  for (const r of base) {
    if (st.img && !r.im) continue;
    mc.set(r.m, (mc.get(r.m) || 0) + 1);
    if (st.m.size && !st.m.has(r.m)) continue;
    let okf = true;
    for (const k in want) if (okf && !r[k].includes(want[k])) okf = false;
    if (okf) pc[r.per] = (pc[r.per] || 0) + 1;
    if (okf && (!st.per || r.per === st.per)) {
      matched.push(r);
      for (const [k] of FACETS) for (const v of r[k]) fc[k].set(v, (fc[k].get(v) || 0) + 1);
    }
  }
  const cmp = {name: (a, b) => a.t.localeCompare(b.t, 'en', {sensitivity: 'base'}) || (a.id < b.id ? -1 : 1),
    date: (a, b) => ((mid(a) ?? 1e9) - (mid(b) ?? 1e9)) || (a.id < b.id ? -1 : 1),
    'date-desc': (a, b) => ((mid(b) ?? -1e9) - (mid(a) ?? -1e9)) || (a.id < b.id ? -1 : 1),
    museum: (a, b) => mus(a.m).short.localeCompare(mus(b.m).short) || a.t.localeCompare(b.t)}[st.sort] || ((a, b) => 0);
  matched.sort(cmp);
  // controls
  const total = IX.rows.filter(r => inDomain(r.d)).length;
  const both = IX.rows.filter(r => inDomain(r.d) && r.d === 3).length;
  const none = IX.rows.filter(r => inDomain(r.d) && r.d === 0).length;
  $('#count').innerHTML = (matched.length === total ? '<b>' + fmt(total) + '</b> objects' : '<b>' + fmt(matched.length) + '</b> of ' + fmt(total) + ' objects') +
    (getDomain() === 'all' ? ' · ' + fmt(both) + ' carry both tags, ' + fmt(none) + ' neither'
      : ' · ' + (getDomain() === 'med' ? 'tagged Medicine' : 'tagged Science and technology'));
  $('#f-per').innerHTML = '<option value="">Any period</option>' + PERIODS.filter(([k]) => pc[k] || st.per === k).map(([k, l]) => '<option value="' + k + '"' + (st.per === k ? ' selected' : '') + '>' + l + ' (' + fmt(pc[k] || 0) + ')</option>').join('');
  for (const [k, , all] of FACETS) {
    const sel = $('#f-' + k), cnt = fc[k];
    const vals = [...cnt.entries()].sort((a, b) => b[1] - a[1] || D[k][a[0]].localeCompare(D[k][b[0]])).slice(0, 600);
    if (st[k] && !vals.some(([v]) => D[k][v] === st[k])) vals.unshift([D[k].indexOf(st[k]), 0]);
    sel.innerHTML = (vals.length ? '<option value="">' + all + '</option>' : '<option value="">None for these objects</option>') +
      vals.filter(([v]) => v >= 0).map(([v, n]) => '<option value="' + esc(D[k][v]) + '"' + (D[k][v] === st[k] ? ' selected' : '') + '>' + esc(D[k][v]) + ' (' + fmt(n) + ')</option>').join('');
    sel.disabled = !vals.length;
    sel.closest('label').classList.toggle('off', !vals.length);
  }
  const ms = [...mc.keys()].sort((a, b) => mc.get(b) - mc.get(a));
  $('#mchips').innerHTML = ms.map(i => { const m = mus(i); return '<li><button type="button" class="chip' + (lum(m.color) > .3 ? ' dark' : '') + '" data-m="' + i + '" aria-pressed="' + st.m.has(i) + '" style="--c:' + m.color + '">' + esc(m.short) + ' <b>' + fmt(mc.get(i)) + '</b></button></li>'; }).join('');
  const act = [];
  if (st.q) act.push(['q', '', 'Search: ' + st.q]);
  if (st.per) act.push(['per', '', (PERIODS.find(p => p[0] === st.per) || ['', st.per])[1]]);
  FACETS.forEach(([k, label]) => { if (st[k]) act.push([k, '', label + ': ' + st[k]]); });
  st.m.forEach(i => act.push(['m', i, mus(i).short]));
  if (st.img) act.push(['img', '', 'With a photograph']);
  $('#active').innerHTML = act.map(([k, v, l]) => '<button type="button" data-clear="' + k + '" data-v="' + v + '" aria-label="Remove filter ' + esc(l) + '">' + esc(l) + ' <span aria-hidden="true">×</span></button>').join('');
  const nMore = FACETS.slice(3).filter(([k]) => st[k]).length + (st.img ? 1 : 0);
  $('#more-f summary').textContent = nMore ? 'More filters · ' + nMore : 'More filters';
  writeURL();
  render(PAGE);
}

function render(n) {
  const grid = $('#grid'), from = n > PAGE && n - PAGE === shown ? shown : 0;
  shown = Math.min(n, matched.length);
  const html = matched.slice(from, shown).map(r => '<div class="cell" data-id="' + r.id + '">' + tile(r) + '</div>').join('');
  if (from) grid.insertAdjacentHTML('beforeend', html);
  else grid.innerHTML = matched.length ? html : '<p class="empty">No objects match these filters. <button type="button" class="btn" id="empty-reset">Clear filters</button></p>';
  const er = $('#empty-reset'); if (er) er.onclick = () => $('#reset').click();
  $('#more').hidden = shown >= matched.length;
  $('#more').textContent = 'Show more (' + fmt(matched.length - shown) + ' left)';
}

function lum(hex) {
  const n = parseInt(hex.slice(1), 16), f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255);
}
