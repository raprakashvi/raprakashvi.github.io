// Map in time: the 2-D map of forms (same shared space) with the date as height.  The time axis is linear from
// 1500 on and compressed below 1500 (Roman and medieval surgical objects); the break is drawn and labelled.
import {boot, loadIndex, loadJSON, $, $$, esc, fmt, mus, thumb, dateLabel, objUrl, mid, inDomain, domainKey, errorBox} from './core.js';

await boot();
let IX;
try { IX = await loadIndex(); } catch (e) { errorBox($('.mapwrap'), e); throw e; }
const COL = {med: '#a8431f', sci: '#284f7a', both: '#7b5f6d', none: '#b3ada0'}, cv = $('#map3d'), ctx = cv.getContext('2d'), tip = $('#tip');
const HS = 0.95, ZU = -1.45, BRK = 1500, LOWFRAC = 0.16;
let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
const R = IX.rows.filter(r => r.x != null);
R.forEach(r => { x0 = Math.min(x0, r.x); x1 = Math.max(x1, r.x); y0 = Math.min(y0, r.y); y1 = Math.max(y1, r.y); });
const span = Math.max(x1 - x0, y1 - y0);
const mids = R.map(mid).filter(v => v != null);
const tmin = Math.floor(Math.min(...mids) / 100) * 100, tmax = Math.ceil(Math.max(...mids) / 10) * 10;
const zOf = y => y == null ? ZU : y < BRK ? -HS + 2 * HS * LOWFRAC * (y - tmin) / (BRK - tmin) : -HS + 2 * HS * (LOWFRAC + (1 - LOWFRAC) * (y - BRK) / (tmax - BRK));
const P = R.map(r => ({r, x: ((r.x - (x0 + x1) / 2) / span) * 2, y: ((r.y - (y0 + y1) / 2) / span) * 2, z: zOf(mid(r))}));
const byId = {}; P.forEach(p => byId[p.r.id] = p);
const DEF = {yaw: -0.7, pitch: 0.42, zoom: 1, px: 0, py: 0};
let V = {...DEF}, W, H, dpr, base = 1, hover = null, raf = 0, colBy = 'domain', showBr = false, showOl = true, B = null;
const imgs = {};
const color = r => colBy === 'domain' ? COL[domainKey(r.d)] : mus(r.m).color;
function legend() {
  const vis = R.filter(r => inDomain(r.d));
  if (colBy === 'domain') {
    const n = {med: 0, sci: 0, both: 0, none: 0}; vis.forEach(r => n[domainKey(r.d)]++);
    $('#legend').innerHTML = ['med', 'sci', 'both', 'none'].filter(x => n[x]).map(x => '<span><i class="dm ' + x + '"></i>' + (x === 'med' ? 'Medicine' : x === 'sci' ? 'Science and technology' : x === 'both' ? 'Both tags' : 'No tag') + ' <b>' + fmt(n[x]) + '</b></span>').join('');
  } else {
    const n = new Map(); vis.forEach(r => n.set(r.m, (n.get(r.m) || 0) + 1));
    $('#legend').innerHTML = [...n.keys()].sort((a, b) => n.get(b) - n.get(a)).map(i => '<span><i style="background:' + mus(i).color + '"></i>' + esc(mus(i).short) + ' <b>' + fmt(n.get(i)) + '</b></span>').join('');
  }
  const und = vis.filter(r => mid(r) == null).length;
  $('#mapnote').textContent = (und ? fmt(und) + ' undated objects lie on the plane below the time axis. ' : '') + 'Below ' + BRK + ' the time axis is compressed.';
}
function resize() {
  const w0 = cv.parentNode.getBoundingClientRect().width;
  cv.style.height = Math.round(Math.max(380, Math.min(0.66 * innerHeight, w0 * 0.72))) + 'px';
  dpr = devicePixelRatio || 1; const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
  base = Math.min(W / 2.6, H / 3.3); cv.width = W * dpr; cv.height = H * dpr; draw();
}
function proj(x, y, z) {
  const c = Math.cos(V.yaw), s = Math.sin(V.yaw), xa = x * c - y * s, ya = x * s + y * c;
  const cp = Math.cos(V.pitch), sp = Math.sin(V.pitch), syy = z * cp - ya * sp, d = z * sp + ya * cp;
  const f = 1 / (1 - d * 0.12), kk = base * V.zoom * f;
  return [W / 2 + V.px + xa * kk, H / 2 + V.py - (syy + 0.2) * kk, d, kk];
}
const sched = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
function photo(p) { let im = imgs[p.r.id]; if (!im) { im = imgs[p.r.id] = new Image(); im.onload = () => { im.ok = 1; sched(); }; im.src = thumb(p.r.im); } return im.ok ? im : null; }
function line(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
function mark(x, y, rad, d) { const mx = d & 1, m2 = d & 2;
  if (mx) { ctx.beginPath(); ctx.rect(x - rad * .9, y - rad * .9, rad * 1.8, rad * 1.8); ctx.fill(); }
  if (m2) { ctx.beginPath(); ctx.arc(x + (mx ? rad * .55 : 0), y + (mx ? rad * .55 : 0), rad * (mx ? .8 : 1), 0, 6.2832); ctx.fill(); }
  if (!mx && !m2) { ctx.beginPath(); ctx.rect(x - rad * .8, y - rad * .8, rad * 1.6, rad * 1.6); ctx.stroke(); } }
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  const mut = '#526176';
  const q = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]].map(c => proj(c[0], c[1], ZU));
  ctx.beginPath(); q.forEach((c, i) => i ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1])); ctx.closePath();
  ctx.fillStyle = 'rgba(82,97,118,.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(82,97,118,.45)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = mut; ctx.font = '600 12px Manrope,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Undated', q[0][0] + 6, q[0][1] - 6);
  ctx.strokeStyle = mut; ctx.lineWidth = 1.2; line(proj(-1.1, -1.1, -HS), proj(-1.1, -1.1, HS));
  ctx.font = '500 11px Manrope,sans-serif';
  const ticks = [tmin, ...[0, 1000].filter(y => y > tmin + 150 && y < BRK - 150), BRK];
  for (let y = BRK + 100; y <= tmax; y += 100) ticks.push(y);
  ticks.forEach(y => {
    const z = zOf(y), t0 = proj(-1.1, -1.1, z), t1 = proj(-1.0, -1.1, z), g = proj(1.1, -1.1, z);
    ctx.strokeStyle = y === BRK ? 'rgba(168,67,31,.5)' : 'rgba(82,97,118,.18)'; ctx.setLineDash(y === BRK ? [5, 4] : []); line(t0, g); ctx.setLineDash([]);
    ctx.strokeStyle = mut; line(t0, t1); ctx.fillStyle = mut; ctx.textAlign = 'right'; ctx.fillText(y < 0 ? (-y) + ' BCE' : y, t0[0] - 6, t0[1] + 4);
  });
  const pr = P.map(p => { const s = proj(p.x, p.y, p.z); return {p, x: s[0], y: s[1], d: s[2], k: s[3], on: inDomain(p.r.d)}; }).sort((a, b) => a.d - b.d);
  if (showBr && B) {
    ctx.lineWidth = 1.1;
    [...B.cross.map(b => [b, '#a8431f']), ...B.sci.map(b => [b, 'rgba(24,34,48,.5)'])].forEach(([b, c]) => {
      const A = byId[b.a], C = byId[b.b]; if (!A || !C || !inDomain(A.r.d) || !inDomain(C.r.d)) return;
      ctx.strokeStyle = c; line(proj(A.x, A.y, A.z), proj(C.x, C.y, C.z));
    });
  }
  const useSil = showOl && V.zoom >= 2.2, r0 = Math.max(2.6, 3.4 * Math.pow(V.zoom, .35)), vis = [];
  let nsil = 0;
  pr.forEach(v => {
    if (v.x < -30 || v.x > W + 30 || v.y < -30 || v.y > H + 30) return;
    const p = v.p, rad = r0 * (0.85 + 0.15 * v.k / (base * V.zoom));
    if (!v.on) { mark(v.x, v.y, rad * .7, p.r.d); ctx.fillStyle = 'rgba(82,97,118,.14)'; ctx.fill(); return; }
    const c = color(p.r);
    if (useSil && nsil < 400) { const t = photo(p), sz = Math.min(64, 14 * Math.pow(V.zoom, .6)); if (t) { ctx.drawImage(t, v.x - sz / 2, v.y - sz / 2, sz, sz); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.strokeRect(v.x - sz / 2, v.y - sz / 2, sz, sz); nsil++; vis.push([p, v.x, v.y]); return; } }
    mark(v.x, v.y, rad, p.r.d); ctx.fillStyle = c; ctx.globalAlpha = .88; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 1; ctx.strokeStyle = '#faf9f6'; ctx.stroke();
    vis.push([p, v.x, v.y]);
  });
  if (hover) { const h = proj(hover.x, hover.y, hover.z); ctx.beginPath(); ctx.arc(h[0], h[1], r0 + 5, 0, 6.2832); ctx.lineWidth = 2.5; ctx.strokeStyle = '#182230'; ctx.stroke(); }
  cv._vis = vis;
  cv.dataset.med = vis.filter(v => v[0].r.d === 1).length; cv.dataset.sci = vis.filter(v => v[0].r.d === 2).length;
  cv.dataset.surg = cv.dataset.med; cv.dataset.both = vis.filter(v => v[0].r.d === 3).length;
  cv.dataset.none = cv.dataset.uns = vis.filter(v => !v[0].r.d).length;
}
function pick(mx, my) { let best = null, bd = 169; const v = cv._vis || []; for (let i = v.length - 1; i >= 0; i--) { const d = (v[i][1] - mx) ** 2 + (v[i][2] - my) ** 2; if (d < bd) { bd = d; best = v[i][0]; } } return best; }
function showTip(p, mx, my) {
  if (!p) { tip.style.display = 'none'; return; }
  const r = p.r, m = mus(r.m); tip.querySelector('img').src = thumb(r.im); tip.querySelector('b').textContent = r.t;
  tip.querySelector('span').textContent = (r.d === 3 ? 'Medicine and science · ' : r.d === 1 ? 'Medicine · ' : r.d === 2 ? 'Science · ' : '') + m.short + ' · ' + (dateLabel(r.s, r.e) || 'undated'); tip.style.borderTop = '4px solid ' + color(r); tip.style.display = 'block';
  let x = mx + 16, y = my + 16; if (x + 200 > W) x = mx - 206; if (y + 270 > H) y = Math.max(4, H - 270); tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
const ptrs = {}; let last = null, moved = 0, pinch = 0, mode = 'rot';
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY]; last = [e.offsetX, e.offsetY]; moved = 0;
  mode = (e.button === 2 || e.shiftKey) ? 'pan' : 'rot'; const ks = Object.keys(ptrs); if (ks.length === 2) pinch = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); });
cv.addEventListener('pointermove', e => {
  const ks = Object.keys(ptrs);
  if (ptrs[e.pointerId]) ptrs[e.pointerId] = [e.offsetX, e.offsetY];
  if (ks.length === 2) { const d = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); if (pinch) V.zoom = Math.max(.6, Math.min(40, V.zoom * d / pinch)); pinch = d; moved = 9; showTip(null); sched(); return; }
  if (ks.length === 1 && last) { const dx = e.offsetX - last[0], dy = e.offsetY - last[1]; moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 4) { if (mode === 'pan') { V.px += dx; V.py += dy; } else { V.yaw += dx * .008; V.pitch = Math.max(-1.45, Math.min(1.45, V.pitch + dy * .008)); } last = [e.offsetX, e.offsetY]; showTip(null); sched(); return; } }
  if (!ks.length) { const p = pick(e.offsetX, e.offsetY); if (p !== hover) { hover = p; sched(); } showTip(p, e.offsetX, e.offsetY); cv.style.cursor = p ? 'pointer' : 'grab'; }
});
function up(e) { const was = moved < 5 && ptrs[e.pointerId] && Object.keys(ptrs).length === 1; delete ptrs[e.pointerId]; last = null; pinch = 0;
  if (was && e.type === 'pointerup') { const p = pick(e.offsetX, e.offsetY); if (p) location.href = objUrl(p.r.id); } }
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('pointerleave', () => { hover = null; showTip(null); sched(); });
cv.addEventListener('wheel', e => { e.preventDefault(); V.zoom = Math.max(.6, Math.min(40, V.zoom * (e.deltaY < 0 ? 1.15 : .87))); sched(); }, {passive: false});
cv.addEventListener('keydown', e => {
  let h = true;
  if (e.key === 'ArrowLeft') V.yaw -= .12; else if (e.key === 'ArrowRight') V.yaw += .12; else if (e.key === 'ArrowUp') V.pitch = Math.min(1.45, V.pitch + .1); else if (e.key === 'ArrowDown') V.pitch = Math.max(-1.45, V.pitch - .1);
  else if (e.key === '+' || e.key === '=') V.zoom = Math.min(40, V.zoom * 1.3); else if (e.key === '-') V.zoom = Math.max(.6, V.zoom / 1.3); else h = false;
  if (h) { e.preventDefault(); sched(); }
});
const set = o => { Object.assign(V, o); sched(); };
$('#zin').onclick = () => set({zoom: Math.min(40, V.zoom * 1.5)});
$('#zout').onclick = () => set({zoom: Math.max(.6, V.zoom / 1.5)});
$('#vside').onclick = () => set({yaw: -0.5, pitch: 0, px: 0, py: 0});
$('#vtop').onclick = () => set({yaw: 0, pitch: 1.45, px: 0, py: 0});
$('#vreset').onclick = () => set(DEF);
$('#tbr').onchange = async function () { showBr = this.checked; if (showBr && !B) { try { B = await loadJSON('bridges.json'); } catch { B = {cross: [], sci: []}; } } sched(); };
$('#tol').onchange = function () { showOl = this.checked; sched(); };
$$('[data-col]').forEach(b => b.onclick = () => { colBy = b.dataset.col; $$('[data-col]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); legend(); sched(); });
window.addEventListener('vestigium:domain', () => { legend(); sched(); });
addEventListener('resize', resize);
legend(); resize();
