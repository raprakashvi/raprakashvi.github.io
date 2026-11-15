// Map of forms: every object with a photograph, both domains, in one shared SigLIP 2 photograph+title space.
// Squares are surgical instruments, circles science objects (readable in grayscale); colour by domain or museum.
import {boot, loadIndex, $, $$, esc, fmt, mus, thumb, dateLabel, objUrl, inDomain, getDomain, errorBox} from './core.js';

await boot();
let IX;
try { IX = await loadIndex(); } catch (e) { errorBox($('.mapwrap'), e); throw e; }
const DC = ['#a8431f', '#284f7a'], cv = $('#map'), ctx = cv.getContext('2d'), tip = $('#tip');
const P = IX.rows.filter(r => r.x != null);
let colBy = 'domain', W, H, dpr, k = 1, ox = 0, oy = 0, hover = null, pad = 30, sc = 1;
const imgs = {};
let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
P.forEach(r => { x0 = Math.min(x0, r.x); x1 = Math.max(x1, r.x); y0 = Math.min(y0, r.y); y1 = Math.max(y1, r.y); });
const color = r => colBy === 'domain' ? DC[r.d] : mus(r.m).color;
const sx = r => (W / 2 + (r.x - (x0 + x1) / 2) * sc) * k + ox;
const sy = r => (H / 2 - (r.y - (y0 + y1) / 2) * sc) * k + oy;

function legend() {
  const vis = P.filter(r => inDomain(r.d));
  if (colBy === 'domain') {
    const n = [0, 0]; vis.forEach(r => n[r.d]++);
    $('#legend').innerHTML = [0, 1].filter(d => n[d]).map(d => '<span><i class="dm ' + (d ? 'sci' : 'surg') + '"></i>' + (d ? 'Science and technology' : 'Surgical instruments') + ' <b>' + fmt(n[d]) + '</b></span>').join('');
  } else {
    const n = new Map(); vis.forEach(r => n.set(r.m, (n.get(r.m) || 0) + 1));
    $('#legend').innerHTML = [...n.keys()].sort((a, b) => n.get(b) - n.get(a)).map(i => '<span><i style="background:' + mus(i).color + '"></i>' + esc(mus(i).short) + ' <b>' + fmt(n.get(i)) + '</b></span>').join('');
  }
  const off = IX.rows.filter(r => inDomain(r.d) && r.x == null).length;
  $('#mapnote').textContent = off ? fmt(off) + ' objects without a photograph are not on the map; they are in the collection.' : '';
}
function resize() {
  const w0 = cv.parentNode.getBoundingClientRect().width;
  cv.style.height = Math.round(Math.max(340, Math.min(0.78 * innerHeight, (w0 - 2 * pad) * (y1 - y0) / (x1 - x0) + 2 * pad))) + 'px';
  dpr = devicePixelRatio || 1; const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
  sc = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0)); k = 1; ox = oy = 0;
  cv.width = W * dpr; cv.height = H * dpr; draw();
}
function thumbImg(r) {
  let i = imgs[r.id];
  if (!i) { i = imgs[r.id] = new Image(); i.onload = () => { i.ok = 1; sched(); }; i.src = thumb(r.im); }
  return i.ok ? i : null;
}
let raf = 0; const sched = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
function mark(x, y, rad, d) { ctx.beginPath(); if (d === 0) ctx.rect(x - rad * .9, y - rad * .9, rad * 1.8, rad * 1.8); else ctx.arc(x, y, rad, 0, 6.2832); }
function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  const vis = [], ghost = [];
  for (const r of P) { const x = sx(r), y = sy(r); if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue; (inDomain(r.d) ? vis : ghost).push([r, x, y]); }
  const rad = 4 + Math.min(3, Math.log2(k));
  ctx.fillStyle = 'rgba(82,97,118,.16)';
  ghost.forEach(v => { mark(v[1], v[2], rad * .7, v[0].d); ctx.fill(); });
  const showPhotos = vis.length <= 140, size = Math.max(34, Math.min(70, 26 * Math.sqrt(k)));
  vis.forEach(v => {
    const r = v[0], c = color(r);
    if (showPhotos) { const im = thumbImg(r); if (im) { ctx.drawImage(im, v[1] - size / 2, v[2] - size / 2, size, size); ctx.lineWidth = 3; ctx.strokeStyle = c; ctx.strokeRect(v[1] - size / 2, v[2] - size / 2, size, size); return; } }
    mark(v[1], v[2], rad, r.d); ctx.fillStyle = c; ctx.globalAlpha = .86; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 1.1; ctx.strokeStyle = '#faf9f6'; ctx.stroke();
  });
  if (hover) { ctx.beginPath(); ctx.arc(sx(hover), sy(hover), rad + 6, 0, 6.2832); ctx.lineWidth = 2.5; ctx.strokeStyle = '#182230'; ctx.stroke(); }
  cv._vis = vis;
  cv.dataset.surg = vis.filter(v => v[0].d === 0).length; cv.dataset.sci = vis.filter(v => v[0].d === 1).length;
}
function pick(mx, my) { let best = null, bd = 144; (cv._vis || []).forEach(v => { const d = (v[1] - mx) ** 2 + (v[2] - my) ** 2; if (d < bd) { bd = d; best = v[0]; } }); return best; }
function clamp() { ox = Math.min(0, Math.max(W - W * k, ox)); oy = Math.min(0, Math.max(H - H * k, oy)); }
function zoomAt(f, mx, my) { const nk = Math.max(1, Math.min(40, k * f)); f = nk / k; ox = mx - (mx - ox) * f; oy = my - (my - oy) * f; k = nk; clamp(); draw(); }
function showTip(r, mx, my) {
  if (!r) { tip.style.display = 'none'; return; }
  const m = mus(r.m), dl = dateLabel(r.s, r.e);
  tip.querySelector('img').src = thumb(r.im); tip.querySelector('b').textContent = r.t;
  tip.querySelector('span').textContent = (r.d ? 'Science · ' : 'Surgical · ') + m.short + (dl ? ' · ' + dl : '');
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
  const p = pick(e.offsetX, e.offsetY); if (p !== hover) { hover = p; draw(); } showTip(p, e.offsetX, e.offsetY); cv.style.cursor = p ? 'pointer' : '';
});
function up(e) { const was = moved < 5 && ptrs[e.pointerId] && Object.keys(ptrs).length === 1; delete ptrs[e.pointerId]; drag = null; pinch = 0;
  if (was && e.type === 'pointerup') { const p = pick(e.offsetX, e.offsetY); if (p) location.href = objUrl(p.id); } }
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
window.addEventListener('vestigium:domain', () => { legend(); draw(); });
addEventListener('resize', resize);
legend(); resize();
