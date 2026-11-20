// One map (T-036): the frozen SigLIP 2 space of every object with a photograph, in three modes on one page —
// photo + title (the fusion the site has used), photo only, title only.  A learned mode appears once T-035 has
// written its shared space.  Marks: square = Medicine, circle = Science and technology, both = both marks, outline =
// no tag.  T-036 also draws the groups found by closeness (clusters) as outlined, clickable regions.
import {boot, loadIndex, loadJSON, $, $$, esc, fmt, mus, thumb, dateLabel, objUrl, inDomain, getDomain, domainKey, params, errorBox, MUSEUMS} from './core.js';

await boot();
let IX;
try { IX = await loadIndex(); } catch (e) { errorBox($('.mapwrap'), e); throw e; }
// T-044: a group from the cluster pages opens this map filtered to its own objects.  Look uses the cluster column,
// Morphology the morphology group column, Type and Use the record's own codebook label.
const GF = params().g || '', GFAM = GF.split(':')[0], GVAL = GF.split(':').slice(1).join(':');
let GFNAME = '';
if (GF) {
  try {
    const C = await loadJSON('clusters.json');
    const g = (C.families || []).flatMap(f => f.groups).find(g => g.gkey === GF);
    if (g) GFNAME = g.name;
  } catch {}
}
const inGroup = r => !GF || (GFAM === 'look' ? r.cl === Number(GVAL) :
  GFAM === 'morphology' ? r.mg === Number(GVAL) :
  GFAM === 'type' ? (r.ty.length > 0 && IX.dict.ty[r.ty[0]] === GVAL) :
  GFAM === 'use' ? (r.fn.length > 0 && IX.dict.fn[r.fn[0]] === GVAL) : true);
// T-047: a museum filter.  The other museums stay on the map as grey ghosts, so the chosen museum is seen in its
// place among everything else; ?m=<museum index> opens the map with it chosen (the tour's fourth stop links here).
let GM = params().m != null && params().m !== '' && Number.isFinite(Number(params().m)) ? Number(params().m) : null;
const inMus = r => GM == null || r.m === GM;
const COL = {med: '#a8431f', sci: '#284f7a', both: '#7b5f6d', none: '#b3ada0'};
const cv = $('#map'), ctx = cv.getContext('2d'), tip = $('#tip');
const MODES = {fusion: {x: 'x', y: 'y', label: 'Photo + title'}, photo: {x: 'px', y: 'py', label: 'Photo only'},
  title: {x: 'tx', y: 'ty2', label: 'Title only'}};
const M = IX.map.modes || {fusion: {}};
if (M.learned) MODES.learned = {x: 'lx', y: 'ly', label: M.learned.label || 'Learned'};
let mode = M.fusion ? 'fusion' : Object.keys(M)[0];
// T-038: a sub-collection selector re-lays-out only a subset of the objects, each with its own cached layout and
// measured metrics (layouts.json).  Sub-collection layouts use the photo + title space, so choosing one switches
// that space on; the other two spaces always show the whole collection.
let P = [], SUBS = null, subKey = '', subPts = null, subMeta = null;
const coords = r => subPts ? (subPts.get(r.i) || [null, null]) : [r[MODES[mode].x], r[MODES[mode].y]];
const cx = r => coords(r)[0], cy = r => coords(r)[1];
function refreshP() {
  P = IX.rows.filter(r => inGroup(r) && cx(r) != null && cy(r) != null);
}
refreshP();
let colBy = 'tag', W, H, dpr, k = 1, ox = 0, oy = 0, hover = null, pad = 30, sc = 1, showGroups = true;
let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
const CL = IX.clusters || [];
function bounds() {
  x0 = 1e9; x1 = -1e9; y0 = 1e9; y1 = -1e9;
  P.forEach(r => { const X = cx(r), Y = cy(r); x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); });
}
bounds();
const color = r => colBy === 'tag' ? COL[domainKey(r.d)] : mus(r.m).color;
const sx = r => (W / 2 + (cx(r) - (x0 + x1) / 2) * sc) * k + ox;
const sy = r => (H / 2 - (cy(r) - (y0 + y1) / 2) * sc) * k + oy;

function legend() {
  const vis = P.filter(r => inDomain(r.d) && inMus(r));
  if (colBy === 'tag') {
    const n = {med: 0, sci: 0, both: 0, none: 0};
    vis.forEach(r => n[domainKey(r.d)]++);
    $('#legend').innerHTML = ['med', 'sci', 'both', 'none'].filter(x => n[x]).map(x => '<span><i class="dm ' + x + '"></i>' +
      (x === 'med' ? 'Medicine' : x === 'sci' ? 'Science and technology' : x === 'both' ? 'Both tags' : 'No tag') + ' <b>' + fmt(n[x]) + '</b></span>').join('');
  } else {
    const n = new Map(); vis.forEach(r => n.set(r.m, (n.get(r.m) || 0) + 1));
    $('#legend').innerHTML = [...n.keys()].sort((a, b) => n.get(b) - n.get(a)).map(i => '<span><i style="background:' + mus(i).color + '"></i>' + esc(mus(i).short) + ' <b>' + fmt(n.get(i)) + '</b></span>').join('');
  }
  if (subKey) {
    const m = subMeta && subMeta.metrics;
    $('#mapnote').textContent = fmt(P.length) + ' objects of ' + (subMeta ? subMeta.label : subKey) +
      ', laid out on their own (photo + title space). ' +
      (m ? 'Measured against the 50-dimensional space the layout is computed from: trustworthiness ' + m.trustworthiness.toFixed(2) +
        ', continuity ' + m.continuity.toFixed(2) + ', k-NN preservation ' + m.knn_preservation.toFixed(2) + ' (k = 10). ' : '') +
      'Groups are found on all objects, so they are outlined only under All objects.';
    return;
  }
  const off = IX.rows.filter(r => inDomain(r.d) && r[MODES[mode].x] == null).length;
  const note = (off ? fmt(off) + ' objects have no photograph or carry a registration-card image, so no position on the map; they are in the collection. ' : '') +
    (CL.length ? fmt(CL.length) + ' groups of objects that sit close together are outlined (' + fmt(CL.filter(c => c.n_museums >= 2).length) + ' of them cross museums); click an outline to open its page. ' : '') +
    'Photographs and titles are embedded with SigLIP 2 and placed with UMAP' +
    (IX.map.params ? ' on 50 principal components (n_neighbors ' + IX.map.params.n_neighbors + ', min_dist ' + IX.map.params.min_dist + ', cosine, seed 7)' : ' (n_neighbors 15, min_dist 0.2, cosine, seed 7)') +
    '; each mode is a cached layout of the same objects.';
  $('#mapnote').innerHTML = (GM != null ? '<b>Museum: ' + esc(mus(GM).name) + '</b> — ' + fmt(P.filter(r => r.m === GM && inDomain(r.d)).length) +
    ' objects with a position, in colour; every other object is grey. ' : '') + (GF ? '<b>Group: ' + esc(GFNAME || GF) + '</b> — ' + fmt(P.length) +
    ' objects with a position. <a href="map.html">Show all objects</a>. ' : '') + esc(note);
}
function resize() {
  const w0 = cv.parentNode.getBoundingClientRect().width;
  const asp = (y1 - y0) / Math.max(1e-6, x1 - x0) || 1;
  cv.style.height = Math.round(Math.max(340, Math.min(0.78 * innerHeight, (w0 - 2 * pad) * asp + 2 * pad))) + 'px';
  dpr = devicePixelRatio || 1; const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
  sc = Math.min((W - 2 * pad) / Math.max(1e-6, x1 - x0), (H - 2 * pad) / Math.max(1e-6, y1 - y0)); k = 1; ox = oy = 0;
  cv.width = W * dpr; cv.height = H * dpr; draw();
}
function thumbImg(r) {
  let i = imgs[r.id];
  if (!i) { i = imgs[r.id] = new Image(); i.onload = () => { i.ok = 1; sched(); }; i.src = thumb(r.im); }
  return i.ok ? i : null;
}
const imgs = {};
let raf = 0; const sched = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
function mark(x, y, rad, d) {
  // square for Medicine, circle for Science and technology, both for both, a thin outline for neither
  const mx = d & 1, mx2 = d & 2;
  if (mx) { ctx.beginPath(); ctx.rect(x - rad * .9, y - rad * .9, rad * 1.8, rad * 1.8); ctx.fill(); }
  if (mx2) { ctx.beginPath(); ctx.arc(x + (mx ? rad * .55 : 0), y + (mx ? rad * .55 : 0), rad * (mx ? .8 : 1), 0, 6.2832); ctx.fill(); }
  if (!mx && !mx2) { ctx.strokeStyle = 'rgba(82,97,118,.55)'; ctx.beginPath(); ctx.rect(x - rad * .8, y - rad * .8, rad * 1.6, rad * 1.6); ctx.stroke(); }
}
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  const vis = [], ghost = [];
  for (const r of P) { const x = sx(r), y = sy(r); if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue; (inDomain(r.d) && inMus(r) ? vis : ghost).push([r, x, y]); }
  const rad = 4 + Math.min(3, Math.log2(k));
  ctx.fillStyle = 'rgba(82,97,118,.16)';
  ghost.forEach(v => { mark(v[1], v[2], rad * .7, v[0].d); ctx.fill(); });
  // the groups by closeness: an outline and a plain name, drawn under the photographs
  const groups = [];
  if (showGroups && !subKey) {
    for (const c of CL) {
      const cross = c.n_museums >= 2;
      if (!cross && k < 1.6) continue;                    // single-museum groups only when zoomed in
      const g0 = c[mode] || (mode === 'learned' ? null : c.fusion);
      if (!g0 || !g0.centroid) continue;
      const X = (W / 2 + (g0.centroid[0] - (x0 + x1) / 2) * sc) * k + ox;
      const Y = (H / 2 - (g0.centroid[1] - (y0 + y1) / 2) * sc) * k + oy;
      const R = Math.max(10, g0.radius * sc * k);
      if (X < -R || X > W + R || Y < -R || Y > H + R) continue;
      groups.push({c, X, Y, R, cross});
    }
    groups.sort((a, b) => (b.cross - a.cross) || (b.c.n_museums - a.c.n_museums) || (b.c.n - a.c.n));
    groups.forEach(g => {
      ctx.beginPath(); ctx.arc(g.X, g.Y, g.R, 0, 6.2832);
      ctx.strokeStyle = 'rgba(24,34,48,' + (g.cross ? .5 : .2) + ')';
      ctx.setLineDash([4, 4]); ctx.lineWidth = g.cross ? 1.4 : 1; ctx.stroke(); ctx.setLineDash([]);
    });
    // labels: the groups that cross museums lead; a simple box test keeps them from piling up
    const placed = [];
    let shown = 0;
    groups.forEach(g => {
      const want = g.cross && g.c.name && g.R > 22 && (k >= 1.6 || shown < 12);
      if (!want) return;
      const label = g.c.name.length > 24 ? g.c.name.slice(0, 23) + '…' : g.c.name;
      ctx.font = '600 12px Manrope,sans-serif';
      const w = ctx.measureText(label).width, x = g.X - w / 2, y = g.Y - g.R - 6;
      if (placed.some(b => !(x + w + 8 < b[0] || x > b[2] + 8 || y + 14 < b[1] || y > b[3] + 12))) return;
      placed.push([x, y, x + w, y + 14]); shown++;
      ctx.fillStyle = 'rgba(241,238,230,.85)'; ctx.fillRect(x - 4, y - 2, w + 8, 16);
      ctx.fillStyle = 'rgba(24,34,48,.85)'; ctx.textAlign = 'left'; ctx.fillText(label, x, y + 11);
    });
  }
  const showPhotos = vis.length <= 140, size = Math.max(34, Math.min(70, 26 * Math.sqrt(k)));
  vis.forEach(v => {
    const r = v[0], c = color(r);
    if (showPhotos) { const im = thumbImg(r); if (im) { ctx.drawImage(im, v[1] - size / 2, v[2] - size / 2, size, size); ctx.lineWidth = 3; ctx.strokeStyle = c; ctx.strokeRect(v[1] - size / 2, v[2] - size / 2, size, size); return; } }
    ctx.fillStyle = c; ctx.globalAlpha = .86; mark(v[1], v[2], rad, r.d); ctx.globalAlpha = 1;
    if (r.d) { ctx.lineWidth = 1.1; ctx.strokeStyle = '#faf9f6'; ctx.stroke(); }
  });
  if (hover) { ctx.beginPath(); ctx.arc(sx(hover), sy(hover), rad + 6, 0, 6.2832); ctx.lineWidth = 2.5; ctx.strokeStyle = '#182230'; ctx.stroke(); }
  cv._vis = vis; cv._groups = groups;
  // counts of the marks actually drawn, by the class of the mark (Medicine, Science, both, neither)
  cv.dataset.med = vis.filter(v => v[0].d === 1).length; cv.dataset.sci = vis.filter(v => v[0].d === 2).length;
  cv.dataset.both = vis.filter(v => v[0].d === 3).length; cv.dataset.none = vis.filter(v => !v[0].d).length;
  cv.dataset.uns = cv.dataset.none;
}
function pick(mx, my) { let best = null, bd = 144; (cv._vis || []).forEach(v => { const d = (v[1] - mx) ** 2 + (v[2] - my) ** 2; if (d < bd) { bd = d; best = v[0]; } }); return best; }
function groupAt(mx, my) { const g = (cv._groups || []).find(g => (mx - g.X) ** 2 + (my - g.Y) ** 2 < g.R ** 2); return g ? g.c : null; }
function clamp() { ox = Math.min(0, Math.max(W - W * k, ox)); oy = Math.min(0, Math.max(H - H * k, oy)); }
function zoomAt(f, mx, my) { const nk = Math.max(1, Math.min(40, k * f)); f = nk / k; ox = mx - (mx - ox) * f; oy = my - (my - oy) * f; k = nk; clamp(); draw(); }
function showTip(r, mx, my) {
  if (!r) { tip.style.display = 'none'; return; }
  const m = mus(r.m), dl = dateLabel(r.s, r.e);
  tip.querySelector('img').src = thumb(r.im); tip.querySelector('b').textContent = r.t;
  tip.querySelector('span').textContent = (r.d === 3 ? 'Medicine and science · ' : r.d === 1 ? 'Medicine · ' : r.d === 2 ? 'Science · ' : '') + m.short + (dl ? ' · ' + dl : '');
  tip.style.borderTop = '4px solid ' + color(r); tip.style.display = 'block';
  let x = mx + 16, y = my + 16; if (x + 200 > W) x = mx - 206; if (y + 270 > H) y = Math.max(4, H - 270); tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
const ptrs = {}; let drag = null, moved = 0, pinch = 0;
cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY]; drag = [e.offsetX, e.offsetY, ox, oy]; moved = 0;
  const ks = Object.keys(ptrs); if (ks.length === 2) pinch = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); });
cv.addEventListener('pointermove', e => {
  const ks = Object.keys(ptrs);
  if (ptrs[e.pointerId]) ptrs[e.pointerId] = [e.offsetX, e.offsetY];
  if (ks.length === 2) { const d = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); if (pinch) zoomAt(d / pinch, (ptrs[ks[0]][0] + ptrs[ks[1]][0]) / 2, (ptrs[ks[0]][1] + ptrs[ks[1]][1]) / 2); pinch = d; moved = 9; return; }
  if (drag && ks.length === 1) { const dx = e.offsetX - drag[0], dy = e.offsetY - drag[1]; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); if (moved > 4) { ox = drag[2] + dx; oy = drag[3] + dy; clamp(); draw(); showTip(null); return; } }
  const p = pick(e.offsetX, e.offsetY); if (p !== hover) { hover = p; draw(); } showTip(p, e.offsetX, e.offsetY); cv.style.cursor = p || groupAt(e.offsetX, e.offsetY) ? 'pointer' : '';
});
function up(e) { const was = moved < 5 && ptrs[e.pointerId] && Object.keys(ptrs).length === 1; delete ptrs[e.pointerId]; drag = null; pinch = 0;
  if (was && e.type === 'pointerup') { const p = pick(e.offsetX, e.offsetY); if (p) location.href = objUrl(p.id); else { const c = groupAt(e.offsetX, e.offsetY); if (c) location.href = 'clusters.html#c' + c.id; } } }
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('pointerleave', () => { hover = null; showTip(null); draw(); });
cv.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.25 : .8, e.offsetX, e.offsetY); }, {passive: false});
cv.addEventListener('keydown', e => {
  const s = 60; let h = true;
  if (e.key === 'ArrowLeft') ox += s; else if (e.key === 'ArrowRight') ox -= s; else if (e.key === 'ArrowUp') oy += s; else if (e.key === 'ArrowDown') oy -= s;
  else if (e.key === '+' || e.key === '=') return zoomAt(1.4, W / 2, H / 2); else if (e.key === '-') return zoomAt(.7, W / 2, H / 2); else h = false;
  if (h) { e.preventDefault(); clamp(); draw(); }
});
$('#zin').onclick = () => zoomAt(1.5, W / 2, H / 2);
$('#zout').onclick = () => zoomAt(.67, W / 2, H / 2);
$('#zreset').onclick = () => { k = 1; ox = oy = 0; draw(); };
$$('[data-col]').forEach(b => b.onclick = () => { colBy = b.dataset.col; $$('[data-col]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); legend(); draw(); });
$$('[data-mode]').forEach(b => { if (!M[b.dataset.mode]) { b.hidden = true; return; } b.onclick = () => {
  if (subKey) { subKey = ''; subPts = null; subMeta = null; if ($('#mset')) $('#mset').value = ''; }
  mode = b.dataset.mode; $$('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  refreshP(); bounds(); resize(); legend();
}; });

// ---- T-038: the sub-collection selector.  One cached layout per subset, computed by the build on the
// photo + title space; the metrics of each layout are shown with it.
const SUB = IX.map.subsets || [];
if (!$('#mset') || !SUB.length) { if ($('#mshow')) $('#mshow').hidden = true; } else {
  const groups = [...new Set(SUB.map(s => s.group))];
  $('#mset').innerHTML = '<option value="">All objects (' + fmt(IX.rows.length) + ')</option>' + groups.map(g =>
    '<optgroup label="' + esc(g) + '">' + SUB.filter(s => s.group === g).map(s =>
      '<option value="' + esc(s.key) + '">' + esc(s.label) + ' (' + fmt(s.n) + ')</option>').join('') + '</optgroup>').join('');
  $('#mset').onchange = async function () {
    const key = this.value;
    if (!key) { subKey = ''; subPts = null; subMeta = null; refreshP(); bounds(); resize(); legend(); return; }
    if (!SUBS) { try { SUBS = await loadJSON('layouts.json'); } catch (e) { errorBox($('.mapwrap'), e); return; } }
    const set = (SUBS.sets || {})[key];
    if (!set) { alert('That layout is not in this build.'); return; }
    subKey = key; subMeta = set;
    subPts = new Map(set.p.map(q => [q[0], [q[1], q[2]]]));
    if (mode !== 'fusion') { mode = 'fusion'; $$('[data-mode]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.mode === 'fusion'))); }
    refreshP(); bounds(); resize(); legend();
  };
}

if ($('#mmus')) {
  $('#mmus').innerHTML = '<option value="">All museums</option>' + MUSEUMS.map((m, i) => '<option value="' + i + '">' + esc(m.name) + '</option>').join('');
  if (GM != null) $('#mmus').value = String(GM);
  $('#mmus').onchange = function () {
    GM = this.value === '' ? null : Number(this.value);
    try { const u = new URL(location.href); if (GM == null) u.searchParams.delete('m'); else u.searchParams.set('m', GM); history.replaceState(null, '', u); } catch {}
    legend(); draw();
  };
}
$('#tgroups').onchange = function () { showGroups = this.checked; draw(); };
window.addEventListener('vestigium:domain', () => { legend(); draw(); });
addEventListener('resize', resize);
legend(); resize();
