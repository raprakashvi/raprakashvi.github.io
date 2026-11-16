// Life of a principle.  Science objects: one lane per role (agreed annotator labels).  Surgical instruments carry no
// principle or role label, so they appear under their working-function families, one lane per instrument type.
import {boot, loadJSON, $, $$, esc, fmt, mus, thumb, objUrl, fromMini, dateLabel, getDomain, legendMuseums, scopeNote, errorBox} from './core.js';

await boot();
let PAT;
try { PAT = await loadJSON('patterns.json'); } catch (e) { errorBox($('#life'), e); throw e; }
const S = PAT.sci, T = 40, PAD = 28, CAP = 120, life = $('#life'), tip = $('#ltip');
const R = id => fromMini(id, PAT.mini[id]);
let cur = null;

function groups() {
  const d = getDomain();
  const g = [];
  if (d !== 'surg') g.push(['p', 'Principles', 'sci', S.principles.map(p => [p.k, p.label, p.n])]);
  if (d !== 'sci') g.push(['f', 'Surgical function families', 'surg', PAT.fams.map(f => [f.k, f.label, f.n])]);
  if (PAT.catpr && PAT.catpr.length && d !== 'surg') g.push(['c', 'Principles in the museum catalogues', 'uns', PAT.catpr.map(p => [p.k, p.k, p.n])]);
  $('#pgroups').innerHTML = g.map(([kind, title, dom, list]) => '<div class="pgroup"><h2 class="ptitle"><i class="dm ' + dom + '"></i>' + title + '</h2><ul class="pchips">' +
    list.map(([k, l, n]) => '<li><button type="button" class="pchip ' + dom + '" data-kind="' + kind + '" data-k="' + esc(k) + '" aria-pressed="false">' + esc(l) + '<b>' + fmt(n) + '</b></button></li>').join('') + '</ul></div>').join('');
  return g;
}
function select(kind, k) {
  if (kind === 'c') {
    // catalogue records under their T-030 principle: one lane, 12 records spread over the museums and dates
    const p = PAT.catpr.find(x => x.k === k) || PAT.catpr[0];
    const items = p.ids.map(id => { const r = fromMini(id, PAT.mini[id]); return r ? [id, r.s, r.e == null ? r.s : r.e, (r.e || r.s) - r.s > 50 ? 1 : 0] : null; }).filter(Boolean);
    const pp = {k: p.k, label: p.k, n: p.n, museums: p.museums.map(x => x[0]), lanes: [{title: p.k, n: p.n, items}],
      headline: p.n.toLocaleString('en') + ' catalogue records labelled ' + p.k + ', 12 shown' + (p.from ? ', ' + p.from + ' to ' + p.to : '') + '.'};
    cur = {kind, p: pp};
    $$('#pgroups button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === kind && b.dataset.k === p.k)));
    $('#headline').textContent = pp.headline;
    $('#pscope').innerHTML = scopeNote('Every record here comes from the three museums\' own catalogues, labelled by the T-030 codebook. The strips above are the curated 1,204-object study; these records are the same principles seen across whole collections, and the site\'s own count for this principle is in the collection filter.');
    $('#legend').innerHTML = legendMuseums(pp.museums);
    document.title = p.k + ' in the catalogues · Life of a principle · Vestigium';
    try { history.replaceState(null, '', '?' + kind + '=' + encodeURIComponent(p.k)); } catch {}
    draw();
    return;
  }
  const list = kind === 'f' ? PAT.fams : S.principles;
  const p = list.find(x => x.k === k) || list[0];
  cur = {kind, p};
  $$('#pgroups button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === kind && b.dataset.k === p.k)));
  $('#headline').textContent = p.headline;
  $('#pscope').innerHTML = kind === 'f' ? scopeNote('Surgical instruments carry no physics principle or role; here they appear under their working function, read from the catalogue text by rules, one lane per instrument type.') : '';
  $('#legend').innerHTML = legendMuseums(p.museums);
  document.title = p.label + ' · Life of a principle · Vestigium';
  try { history.replaceState(null, '', '?' + kind + '=' + encodeURIComponent(p.k)); } catch {}
  draw();
}
function axisFor(lanes) {
  if (cur.kind === 'p' || cur.kind === 'c') return {y0: 1700, y1: 2020, brk: null};
  let lo = 1e9, hi = -1e9;
  lanes.forEach(l => l.items.forEach(it => { lo = Math.min(lo, it[1]); hi = Math.max(hi, it[2]); }));
  const y1 = Math.ceil(Math.max(hi, 1900) / 50) * 50, y0 = Math.floor(lo / 100) * 100;
  return {y0, y1, brk: y0 < 1400 ? 1500 : null};
}
function draw() {
  const p = cur.p, lanes = p.lanes, ax = axisFor(lanes);
  const nmax = Math.max(...lanes.map(l => Math.min(CAP, l.items.length)), 1);
  const W = Math.max(life.clientWidth, 940, nmax * 9), inner = W - 2 * PAD;
  const px = y => {
    y = Math.max(ax.y0, Math.min(ax.y1, y));
    if (!ax.brk) return PAD + (y - ax.y0) / (ax.y1 - ax.y0) * inner;
    return y < ax.brk ? PAD + .12 * inner * (y - ax.y0) / (ax.brk - ax.y0) : PAD + inner * (.12 + .88 * (y - ax.brk) / (ax.y1 - ax.brk));
  };
  const ticks = [];
  if (ax.brk) { ticks.push(ax.y0); for (let y = ax.brk; y <= ax.y1; y += 100) ticks.push(y); } else for (let y = ax.y0; y <= 2000; y += 50) ticks.push(y);
  const yl = y => y < 0 ? (-y) + ' BCE' : y;
  const axis = '<div class="axis" style="height:26px">' + ticks.map(y => '<span style="left:' + px(y) + 'px">' + yl(y) + '</span>').join('') + '</div>';
  let body = '';
  lanes.forEach(l => {
    let items = l.items;
    const shownNote = items.length > CAP ? ', ' + CAP + ' shown' : '';
    if (items.length > CAP) items = Array.from({length: CAP}, (_, i) => items[Math.round(i * (items.length - 1) / (CAP - 1))]);
    const extra = [l.undated ? l.undated + ' undated' : '', l.nophoto ? l.nophoto + ' without photograph' : ''].filter(Boolean).join(', ');
    const head = '<h3 class="lh"><span>' + esc(l.title) + '</span><b>' + fmt(l.n) + shownNote + '</b>' + (extra ? '<em>' + extra + ', not shown</em>' : '') + '</h3>';
    if (!l.n) { body += '<section class="lane empty" aria-label="' + esc(l.title) + ': none">' + head + '<div class="void"><span>' + (l.empty === 'none' ? 'none in these five museums' : 'none agreed by both annotators') + '</span></div></section>'; return; }
    // spread objects that share one date range across it, then stack into rows so photographs never overlap
    const g = {}, pts = [];
    items.forEach(it => { if (it[3]) (g[it[1] + '-' + it[2]] = g[it[1] + '-' + it[2]] || []).push(it); });
    items.forEach(it => {
      let y;
      if (it[3]) { const a = g[it[1] + '-' + it[2]], i = a.indexOf(it); y = it[1] + (i + .5) / a.length * (it[2] - it[1]); } else y = (it[1] + it[2]) / 2;
      pts.push({it, x: px(y)});
    });
    pts.sort((a, b) => a.x - b.x || (a.it[0] < b.it[0] ? -1 : 1));
    const rows = [];
    pts.forEach(o => { let r = 0; while (rows[r] != null && rows[r] > o.x - T / 2 - 3) r++; rows[r] = o.x + T / 2; o.r = r; });
    const Hh = Math.max(1, rows.length) * (T + 4) + 6;
    body += '<section class="lane" aria-label="' + esc(l.title) + '">' + head + '<div class="track" style="height:' + Hh + 'px">' + pts.map(o => {
      const r = R(o.it[0]); if (!r) return '';
      const m = mus(r.m);
      return '<a class="lt' + (o.it[3] ? ' fade' : '') + '" style="--c:' + m.color + ';left:' + (o.x - T / 2).toFixed(1) + 'px;top:' + (o.r * (T + 4) + 3) + 'px" href="' + objUrl(r.id) + '" data-id="' + r.id + '" aria-label="' + esc(r.t + ', ' + m.short + ', ' + (dateLabel(r.s, r.e) || '')) + '"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt=""></a>';
    }).join('') + '</div></section>';
  });
  const lines = ticks.map(y => '<i class="gl' + (y % 100 ? '' : ' c') + '" style="left:' + px(y) + 'px"></i>').join('');
  life.innerHTML = '<div class="lifein" style="width:' + W + 'px">' + axis + '<div class="grid-lines">' + lines + '</div>' + body + axis + '</div>' +
    (cur.kind === 'f' && cur.p.rest ? '<p class="lanerest">' + fmt(cur.p.rest) + ' more instruments of other types: <a href="collection.html?fn=' + encodeURIComponent(cur.p.k) + '">all ' + fmt(cur.p.n) + ' in the collection</a></p>' : '');
}
function show(a) {
  const r = R(a.dataset.id), m = mus(r.m), rc = a.getBoundingClientRect();
  tip.querySelector('img').src = thumb(r.im); tip.querySelector('b').textContent = r.t;
  tip.querySelector('span').textContent = m.short + ' · ' + (dateLabel(r.s, r.e) || 'undated'); tip.style.borderTopColor = m.color; tip.style.display = 'block';
  const w = tip.offsetWidth, h = tip.offsetHeight; let x = rc.left + rc.width / 2 - w / 2, y = rc.top - h - 8;
  if (y < 4) y = rc.bottom + 8; x = Math.max(6, Math.min(innerWidth - w - 6, x)); tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
life.addEventListener('mouseover', e => { const a = e.target.closest('.lt'); if (a) show(a); });
life.addEventListener('mouseout', e => { if (e.target.closest('.lt')) tip.style.display = 'none'; });
life.addEventListener('focusin', e => { const a = e.target.closest('.lt'); if (a) show(a); });
life.addEventListener('focusout', () => tip.style.display = 'none');
life.addEventListener('scroll', () => tip.style.display = 'none');
$('#pgroups').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) select(b.dataset.kind, b.dataset.k); });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 120); });
function start() {
  const g = groups(), q = new URLSearchParams(location.search);
  const kinds = g.map(x => x[0]);
  if (q.get('p') && kinds.includes('p')) select('p', q.get('p'));
  else if (q.get('f') && kinds.includes('f')) select('f', q.get('f'));
  else if (q.get('c') && kinds.includes('c')) select('c', q.get('c'));
  else if (cur && kinds.includes(cur.kind)) select(cur.kind, cur.p.k);
  else select(kinds[0], null);
}
window.addEventListener('vestigium:domain', start);
start();
