// Life of a principle (T-036): ONE chip list for principles and working functions together.  Every lane draws from
// every source — the surgical release, the science release and the three catalogue harvests — and every photograph
// is coloured by its museum.  Surgical instruments have no codebook principle of their own, so they join the one the
// codebook itself most often gives to medical instruments (computed in the build, stated on the Method page) and sit
// in a lane of their own: Medical practice.
import {boot, loadJSON, $, $$, esc, fmt, mus, thumb, objUrl, fromMini, dateLabel, getDomain, legendMuseums, scopeNote, errorBox} from './core.js';

await boot();
let PAT;
try { PAT = await loadJSON('patterns.json'); } catch (e) { errorBox($('#life'), e); throw e; }
const LIFE = PAT.life || [], T = 40, PAD = 28, CAP = 120, life = $('#life'), tip = $('#ltip');
const R = id => fromMini(id, PAT.mini[id]);
let cur = null;

function chips() {
  $('#pgroups').innerHTML = '<ul class="pchips one">' + LIFE.map(e =>
    '<li><button type="button" class="pchip ' + (e.kind === 'function' ? 'fn' : 'pr') + '" data-k="' + esc(e.k) + '" aria-pressed="false">' +
    esc(e.label) + '<b>' + fmt(e.n) + '</b></button></li>').join('') + '</ul>';
}
function find(k) { const q = String(k || '').toLowerCase(); return LIFE.find(x => x.k.toLowerCase() === q) || LIFE.find(x => x.label.toLowerCase() === q); }
function select(k, rewrite = true) {
  const e = find(k) || LIFE[0];
  if (!e) return;
  cur = e;
  $$('#pgroups button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === e.k)));
  $('#headline').textContent = e.headline;
  $('#pscope').innerHTML = e.kind === 'function'
    ? scopeNote('A working function from the surgical study. Its lanes are instrument types; the objects are surgical instruments, coloured by museum.')
    : scopeNote('Every lane draws objects from the surgical collection, the science collection and the three complete museum catalogues. ' +
      'The lane <em>Medical practice</em> holds surgical instruments, which join this principle because the codebook gives it most often to medical instruments.')
      + (e.note ? '<p class="lanerest">' + esc(e.note) + '</p>' : '');
  $('#legend').innerHTML = legendMuseums(e.museums);
  document.title = e.label + ' · Life of a principle · Vestigium';
  if (rewrite) { try { history.replaceState(null, '', '?' + (e.kind === 'function' ? 'f' : 'p') + '=' + encodeURIComponent(e.k)); } catch {} }
  draw();
}
function axisFor(lanes) {
  let lo = 1e9, hi = -1e9;
  lanes.forEach(l => l.items.forEach(it => { lo = Math.min(lo, it[1]); hi = Math.max(hi, it[2]); }));
  if (lo > hi) return {y0: 1700, y1: 2020, brk: null};
  const y1 = Math.max(1900, Math.ceil(hi / 50) * 50), y0 = Math.floor(lo / 100) * 100;
  return {y0, y1, brk: y0 < 1400 ? 1500 : null};
}
function draw() {
  const e = cur, lanes = e.lanes, ax = axisFor(lanes);
  const nmax = Math.max(1, ...lanes.map(l => Math.min(CAP, l.items.length)));
  const W = Math.max(life.clientWidth, 940, nmax * 9), inner = W - 2 * PAD;
  const px = y => {
    y = Math.max(ax.y0, Math.min(ax.y1, y));
    if (!ax.brk) return PAD + (y - ax.y0) / (ax.y1 - ax.y0) * inner;
    return y < ax.brk ? PAD + .12 * inner * (y - ax.y0) / (ax.brk - ax.y0) : PAD + inner * (.12 + .88 * (y - ax.brk) / (ax.y1 - ax.brk));
  };
  const ticks = [];
  if (ax.brk) { ticks.push(ax.y0); for (let y = ax.brk; y <= ax.y1; y += 100) ticks.push(y); } else for (let y = Math.ceil(ax.y0 / 50) * 50; y <= ax.y1; y += 50) ticks.push(y);
  const yl = y => y < 0 ? (-y) + ' BCE' : y;
  const axis = '<div class="axis" style="height:26px">' + ticks.map(y => '<span style="left:' + px(y) + 'px">' + yl(y) + '</span>').join('') + '</div>';
  let body = '';
  lanes.forEach(l => {
    let items = l.items;
    const shownNote = items.length > CAP ? ', ' + CAP + ' shown' : '';
    if (items.length > CAP) items = Array.from({length: CAP}, (_, i) => items[Math.round(i * (items.length - 1) / (CAP - 1))]);
    const extra = [l.undated ? l.undated + ' undated' : '', l.nophoto ? l.nophoto + ' without photograph' : ''].filter(Boolean).join(', ');
    const head = '<h3 class="lh"><span>' + esc(l.title) + '</span><b>' + fmt(l.n) + shownNote + '</b>' + (extra ? '<em>' + extra + ', not shown</em>' : '') + '</h3>';
    if (!items.length) { body += '<section class="lane empty" aria-label="' + esc(l.title) + ': none shown">' + head + '<div class="void"><span>' + (l.n ? 'no dated object with a photograph' : 'none') + '</span></div></section>'; return; }
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
  life.innerHTML = '<div class="lifein" style="width:' + W + 'px">' + axis + '<div class="grid-lines">' + lines + '</div>' + body + axis + '</div>';
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
$('#pgroups').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) select(b.dataset.k); });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 120); });
function start() {
  const q = new URLSearchParams(location.search);
  const k = q.get('p') || q.get('f') || q.get('c');
  if (k && find(k)) select(k, false);
  else select(cur ? cur.k : (LIFE[0] && LIFE[0].k), false);
}
window.addEventListener('vestigium:domain', () => { /* the chip list is the whole site; the tag filter does not hide it */ });
chips();
start();
