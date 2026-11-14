(function () {
  var S = SCI, U = window.U, cv = U.$('#map'), ctx = cv.getContext('2d'), tip = U.$('#tip');
  var on = S.museums.map(function () { return true; });
  U.$('#mchips').innerHTML = S.museums.map(function (m, i) { return '<li>' + U.chipHTML(i, true) + '</li>'; }).join('');
  var W, H, dpr, k = 1, ox = 0, oy = 0, hover = null, pad = 30;
  var imgs = {};
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, sc = 1;
  S.items.forEach(function (it) { x0 = Math.min(x0, it.x); x1 = Math.max(x1, it.x); y0 = Math.min(y0, it.y); y1 = Math.max(y1, it.y); });
  /* one scale for both axes: the shape of the map is not stretched */
  function sx(it) { return (W / 2 + (it.x - (x0 + x1) / 2) * sc) * k + ox; }
  function sy(it) { return (H / 2 - (it.y - (y0 + y1) / 2) * sc) * k + oy; }
  function resize() {
    var w0 = cv.parentNode.getBoundingClientRect().width;
    cv.style.height = Math.round(Math.max(320, Math.min(0.8 * window.innerHeight, (w0 - 2 * pad) * (y1 - y0) / (x1 - x0) + 2 * pad))) + 'px';
    dpr = window.devicePixelRatio || 1; var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    sc = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0)); k = 1; ox = oy = 0;
    cv.width = W * dpr; cv.height = H * dpr; draw();
  }
  function thumb(it) {
    var i = imgs[it.id];
    if (!i) { i = imgs[it.id] = new Image(); i.onload = function () { i.ok = 1; sched(); }; i.src = U.thumb(it); }
    return i.ok ? i : null;
  }
  var raf = 0; function sched() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var vis = [];
    S.items.forEach(function (it) { if (!on[it.m]) return; var x = sx(it), y = sy(it); if (x > -40 && x < W + 40 && y > -40 && y < H + 40) vis.push([it, x, y]); });
    var showPhotos = vis.length <= 130, size = Math.max(34, Math.min(70, 26 * Math.sqrt(k)));
    var r = 4 + Math.min(3, Math.log2(k));
    vis.forEach(function (v) {
      var it = v[0], c = S.museums[it.m].color;
      if (showPhotos) {
        var im = thumb(it);
        if (im) { ctx.drawImage(im, v[1] - size / 2, v[2] - size / 2, size, size); ctx.lineWidth = 3; ctx.strokeStyle = c; ctx.strokeRect(v[1] - size / 2, v[2] - size / 2, size, size); return; }
      }
      ctx.beginPath(); ctx.arc(v[1], v[2], r, 0, 6.2832); ctx.fillStyle = c; ctx.globalAlpha = .85; ctx.fill(); ctx.globalAlpha = 1;
      ctx.lineWidth = 1.2; ctx.strokeStyle = '#faf9f6'; ctx.stroke();
    });
    if (hover) { var hx = sx(hover), hy = sy(hover); ctx.beginPath(); ctx.arc(hx, hy, r + 5, 0, 6.2832); ctx.lineWidth = 2.5; ctx.strokeStyle = '#182230'; ctx.stroke(); }
    cv._vis = vis;
  }
  function pick(mx, my) {
    var best = null, bd = 144; (cv._vis || []).forEach(function (v) { var d = (v[1] - mx) * (v[1] - mx) + (v[2] - my) * (v[2] - my); if (d < bd) { bd = d; best = v[0]; } });
    return best;
  }
  function zoomAt(f, mx, my) {
    var nk = Math.max(1, Math.min(40, k * f)); f = nk / k; ox = mx - (mx - ox) * f; oy = my - (my - oy) * f; k = nk; clamp(); draw();
  }
  function clamp() { ox = Math.min(0, Math.max(W - W * k, ox)); oy = Math.min(0, Math.max(H - H * k, oy)); }
  function showTip(it, mx, my) {
    if (!it) { tip.style.display = 'none'; return; }
    var m = S.museums[it.m]; tip.querySelector('img').src = 'img/t/' + it.h + '.jpg'; tip.querySelector('b').textContent = it.t;
    tip.querySelector('span').textContent = m.short + (it.dt ? ' · ' + it.dt : ''); tip.style.borderTop = '4px solid ' + m.color; tip.style.display = 'block';
    var x = mx + 16, y = my + 16; if (x + 200 > W) x = mx - 206; if (y + 270 > H) y = Math.max(4, H - 270); tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  var ptrs = {}, drag = null, moved = 0, pinch = 0;
  cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY]; drag = [e.offsetX, e.offsetY, ox, oy]; moved = 0;
    var ks = Object.keys(ptrs); if (ks.length === 2) { pinch = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); } });
  cv.addEventListener('pointermove', function (e) {
    var ks = Object.keys(ptrs);
    if (ptrs[e.pointerId]) ptrs[e.pointerId] = [e.offsetX, e.offsetY];
    if (ks.length === 2) {
      var d = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); if (pinch) zoomAt(d / pinch, (ptrs[ks[0]][0] + ptrs[ks[1]][0]) / 2, (ptrs[ks[0]][1] + ptrs[ks[1]][1]) / 2); pinch = d; moved = 9; return;
    }
    if (drag && ks.length === 1) { var dx = e.offsetX - drag[0], dy = e.offsetY - drag[1]; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); if (moved > 4) { ox = drag[2] + dx; oy = drag[3] + dy; clamp(); draw(); showTip(null); return; } }
    var p = pick(e.offsetX, e.offsetY); if (p !== hover) { hover = p; draw(); } showTip(p, e.offsetX, e.offsetY); cv.style.cursor = p ? 'pointer' : '';
  });
  function up(e) { var was = moved < 5 && ptrs[e.pointerId] && Object.keys(ptrs).length === 1; delete ptrs[e.pointerId]; drag = null; pinch = 0;
    if (was && e.type === 'pointerup') { var p = pick(e.offsetX, e.offsetY); if (p) location.href = U.objUrl(p.id); } }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', function () { hover = null; showTip(null); draw(); });
  cv.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.25 : .8, e.offsetX, e.offsetY); }, {passive: false});
  cv.addEventListener('keydown', function (e) {
    var s = 60, h = true;
    if (e.key === 'ArrowLeft') ox += s; else if (e.key === 'ArrowRight') ox -= s; else if (e.key === 'ArrowUp') oy += s; else if (e.key === 'ArrowDown') oy -= s;
    else if (e.key === '+' || e.key === '=') return zoomAt(1.4, W / 2, H / 2); else if (e.key === '-') return zoomAt(.7, W / 2, H / 2); else h = false;
    if (h) { e.preventDefault(); clamp(); draw(); }
  });
  U.$('#zin').onclick = function () { zoomAt(1.5, W / 2, H / 2); };
  U.$('#zout').onclick = function () { zoomAt(.67, W / 2, H / 2); };
  U.$('#zreset').onclick = function () { k = 1; ox = oy = 0; draw(); };
  U.$('#mchips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var i = +b.dataset.m; on[i] = !on[i]; b.setAttribute('aria-pressed', on[i]); draw(); });
  window.addEventListener('resize', resize); resize();
})();
