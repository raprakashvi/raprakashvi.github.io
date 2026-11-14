(function () {
  var S = SCI, D = window.SCI_3D, B = window.SCI_BRIDGES || [], U = window.U, cv = U.$('#map3d'), ctx = cv.getContext('2d'), tip = U.$('#tip');
  var on = S.museums.map(function () { return true; });
  U.$('#mchips').innerHTML = S.museums.map(function (m, i) { return '<li>' + U.chipHTML(i, true) + '</li>'; }).join('');
  var HS = 0.95, ZU = -1.45;                        // dated range is -HS..HS in height; the undated plane sits below it
  var P = S.items.map(function (it) {
    var q = D.pts[it.id], z = q[2] == null ? ZU : ((q[2] - D.tmin) / (D.tmax - D.tmin) * 2 - 1) * HS;
    return {it: it, x: q[0], y: q[1], z: z, dated: q[2] != null, o: q[3]};
  });
  var byId = {}; P.forEach(function (p) { byId[p.it.id] = p; });
  var DEF = {yaw: -0.7, pitch: 0.42, zoom: 1, px: 0, py: 0};
  var V = Object.assign({}, DEF), W, H, dpr, base = 1, hover = null, raf = 0;
  var showBr = false, showOl = true, imgs = {};
  function resize() {
    var w0 = cv.parentNode.getBoundingClientRect().width;
    cv.style.height = Math.round(Math.max(360, Math.min(0.62 * window.innerHeight, w0 * 0.7))) + 'px';
    dpr = window.devicePixelRatio || 1; var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    base = Math.min(W / 2.6, H / 3.3); cv.width = W * dpr; cv.height = H * dpr; draw();
  }
  function proj(x, y, z) {
    var c = Math.cos(V.yaw), s = Math.sin(V.yaw), x1 = x * c - y * s, y1 = x * s + y * c;
    var cp = Math.cos(V.pitch), sp = Math.sin(V.pitch), sy = z * cp - y1 * sp, d = z * sp + y1 * cp;
    var f = 1 / (1 - d * 0.12), k = base * V.zoom * f;
    return [W / 2 + V.px + x1 * k, H / 2 + V.py - (sy + 0.2) * k, d, k];
  }
  function sched() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }
  function photo(p) {
    var id = p.it.id, im = imgs[id];
    if (!im) { im = imgs[id] = new Image(); im.onload = function () { im.ok = 1; sched(); }; im.src = U.thumb(p.it); }
    return im.ok ? im : null;
  }
  function line(a, b) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var ink = '#182230', mut = '#526176';
    // undated plane
    var q = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]].map(function (c) { return proj(c[0], c[1], ZU); });
    ctx.beginPath(); q.forEach(function (c, i) { i ? ctx.lineTo(c[0], c[1]) : ctx.moveTo(c[0], c[1]); }); ctx.closePath();
    ctx.fillStyle = 'rgba(82,97,118,.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(82,97,118,.45)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = mut; ctx.font = '600 12px Manrope,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Undated', q[0][0] + 6, q[0][1] - 6);
    // time axis at the corner, ticks per century
    ctx.strokeStyle = mut; ctx.lineWidth = 1.2; var a0 = proj(-1.1, -1.1, -HS), a1 = proj(-1.1, -1.1, HS); line(a0, a1);
    ctx.font = '500 11px Manrope,sans-serif'; ctx.fillStyle = mut;
    for (var y = Math.ceil(D.tmin / 100) * 100; y <= D.tmax; y += 100) {
      var z = ((y - D.tmin) / (D.tmax - D.tmin) * 2 - 1) * HS, t0 = proj(-1.1, -1.1, z), t1 = proj(-1.0, -1.1, z), g = proj(1.1, -1.1, z);
      ctx.strokeStyle = 'rgba(82,97,118,.18)'; line(t0, g); ctx.strokeStyle = mut; line(t0, t1); ctx.textAlign = 'right'; ctx.fillText(y, t0[0] - 6, t0[1] + 4);
    }
    var vis = [], pr = P.filter(function (p) { return on[p.it.m]; }).map(function (p) { var s = proj(p.x, p.y, p.z); return {p: p, x: s[0], y: s[1], d: s[2], k: s[3]}; });
    pr.sort(function (a, b) { return a.d - b.d; });
    if (showBr) {
      ctx.strokeStyle = 'rgba(24,34,48,.55)'; ctx.lineWidth = 1.1;
      B.forEach(function (b) { var A = byId[b.a], C = byId[b.b]; if (!A || !C || !on[A.it.m] || !on[C.it.m]) return;
        var s = proj(A.x, A.y, A.z), t = proj(C.x, C.y, C.z); line(s, t); });
    }
    var useSil = showOl && V.zoom >= 2.2, nsil = 0, r0 = Math.max(2.6, 3.4 * Math.pow(V.zoom, .35));
    pr.forEach(function (v) {
      if (v.x < -30 || v.x > W + 30 || v.y < -30 || v.y > H + 30) return;
      var p = v.p, c = S.museums[p.it.m].color, r = r0 * (0.85 + 0.15 * v.k / (base * V.zoom)), drawn = false;
      if (useSil && nsil < 400) {
        var t = photo(p), sz = Math.min(64, 14 * Math.pow(V.zoom, .6));
        if (t) { ctx.drawImage(t, v.x - sz / 2, v.y - sz / 2, sz, sz); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.strokeRect(v.x - sz / 2, v.y - sz / 2, sz, sz); drawn = true; nsil++; }
      }
      if (!drawn) { ctx.beginPath(); ctx.arc(v.x, v.y, r, 0, 6.2832); ctx.fillStyle = c; ctx.globalAlpha = .88; ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 1; ctx.strokeStyle = '#faf9f6'; ctx.stroke(); }
      vis.push([p.it, v.x, v.y]);
    });
    if (hover) { var h = proj(hover.x, hover.y, hover.z); ctx.beginPath(); ctx.arc(h[0], h[1], r0 + 5, 0, 6.2832); ctx.lineWidth = 2.5; ctx.strokeStyle = ink; ctx.stroke(); }
    cv._vis = vis; cv._view = {yaw: V.yaw, pitch: V.pitch, zoom: V.zoom};
  }
  function pick(mx, my) {
    var best = null, bd = 169, v = cv._vis || [];
    for (var i = v.length - 1; i >= 0; i--) { var d = (v[i][1] - mx) * (v[i][1] - mx) + (v[i][2] - my) * (v[i][2] - my); if (d < bd) { bd = d; best = v[i][0]; } }
    return best && byId[best.id];
  }
  function showTip(p, mx, my) {
    if (!p) { tip.style.display = 'none'; return; }
    var it = p.it, m = S.museums[it.m]; tip.querySelector('img').src = 'img/t/' + it.h + '.jpg'; tip.querySelector('b').textContent = it.t;
    tip.querySelector('span').textContent = m.short + ' · ' + (it.dt || 'undated'); tip.style.borderTop = '4px solid ' + m.color; tip.style.display = 'block';
    var x = mx + 16, y = my + 16; if (x + 200 > W) x = mx - 206; if (y + 270 > H) y = Math.max(4, H - 270); tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  var ptrs = {}, last = null, moved = 0, pinch = 0, mode = 'rot';
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); ptrs[e.pointerId] = [e.offsetX, e.offsetY]; last = [e.offsetX, e.offsetY]; moved = 0;
    mode = (e.button === 2 || e.shiftKey) ? 'pan' : 'rot'; var ks = Object.keys(ptrs); if (ks.length === 2) pinch = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); });
  cv.addEventListener('pointermove', function (e) {
    var ks = Object.keys(ptrs);
    if (ptrs[e.pointerId]) ptrs[e.pointerId] = [e.offsetX, e.offsetY];
    if (ks.length === 2) {
      var d = Math.hypot(ptrs[ks[0]][0] - ptrs[ks[1]][0], ptrs[ks[0]][1] - ptrs[ks[1]][1]); if (pinch) V.zoom = Math.max(.6, Math.min(40, V.zoom * d / pinch)); pinch = d; moved = 9; showTip(null); sched(); return;
    }
    if (ks.length === 1 && last) {
      var dx = e.offsetX - last[0], dy = e.offsetY - last[1]; moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 4) { if (mode === 'pan') { V.px += dx; V.py += dy; } else { V.yaw += dx * .008; V.pitch = Math.max(-1.45, Math.min(1.45, V.pitch + dy * .008)); } last = [e.offsetX, e.offsetY]; showTip(null); sched(); return; }
    }
    if (!ks.length) { var p = pick(e.offsetX, e.offsetY); if (p !== hover) { hover = p; sched(); } showTip(p, e.offsetX, e.offsetY); cv.style.cursor = p ? 'pointer' : 'grab'; }
  });
  function up(e) { var was = moved < 5 && ptrs[e.pointerId] && Object.keys(ptrs).length === 1; delete ptrs[e.pointerId]; last = null; pinch = 0;
    if (was && e.type === 'pointerup') { var p = pick(e.offsetX, e.offsetY); if (p) location.href = U.objUrl(p.it.id); } }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', function () { hover = null; showTip(null); sched(); });
  cv.addEventListener('wheel', function (e) { e.preventDefault(); V.zoom = Math.max(.6, Math.min(40, V.zoom * (e.deltaY < 0 ? 1.15 : .87))); sched(); }, {passive: false});
  cv.addEventListener('keydown', function (e) {
    var h = true;
    if (e.key === 'ArrowLeft') V.yaw -= .12; else if (e.key === 'ArrowRight') V.yaw += .12; else if (e.key === 'ArrowUp') V.pitch = Math.min(1.45, V.pitch + .1); else if (e.key === 'ArrowDown') V.pitch = Math.max(-1.45, V.pitch - .1);
    else if (e.key === '+' || e.key === '=') V.zoom = Math.min(40, V.zoom * 1.3); else if (e.key === '-') V.zoom = Math.max(.6, V.zoom / 1.3); else h = false;
    if (h) { e.preventDefault(); sched(); }
  });
  function set(o) { Object.assign(V, o); sched(); }
  U.$('#zin').onclick = function () { set({zoom: Math.min(40, V.zoom * 1.5)}); };
  U.$('#zout').onclick = function () { set({zoom: Math.max(.6, V.zoom / 1.5)}); };
  U.$('#vside').onclick = function () { set({yaw: -0.5, pitch: 0, px: 0, py: 0}); };
  U.$('#vtop').onclick = function () { set({yaw: 0, pitch: 1.45, px: 0, py: 0}); };
  U.$('#vreset').onclick = function () { set(DEF); };
  U.$('#tbr').onchange = function () { showBr = this.checked; sched(); };
  U.$('#tol').onchange = function () { showOl = this.checked; sched(); };
  U.$('#mchips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var i = +b.dataset.m; on[i] = !on[i]; b.setAttribute('aria-pressed', on[i]); sched(); });
  window.addEventListener('resize', resize); resize();
})();
