(function () {
  var P = window.SCI_PAT, S = window.SCI, U = window.U, T = 40, PAD = 28, Y0 = 1700, Y1 = 2020;
  var life = U.$('#life'), tip = U.$('#ltip'), cur = null;
  U.$('#legend').innerHTML = U.legend();
  U.$('#pchips').innerHTML = P.principles.map(function (p) {
    return '<li><button type="button" class="pchip" data-k="' + U.esc(p.k) + '" aria-pressed="false">' + U.esc(p.label) + '<b>' + p.n + '</b></button></li>'; }).join('');
  function pick(k) {
    var p = P.principles.filter(function (x) { return x.k === k; })[0] || P.principles[0]; cur = p;
    U.$$('#pchips button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === p.k ? 'true' : 'false'); });
    U.$('#headline').textContent = p.headline;
    document.title = p.label + ' · Life of a principle · Vestigium';
    try { history.replaceState(null, '', '?p=' + encodeURIComponent(p.k)); } catch (e) {}
    draw();
  }
  function px(y, W) { return PAD + (y - Y0) / (Y1 - Y0) * (W - 2 * PAD); }
  function layout(lane, W) {
    var g = {}, out = [];
    lane.items.forEach(function (it) { if (it[3]) { var key = it[1] + '-' + it[2]; (g[key] = g[key] || []).push(it); } });
    Object.keys(g).forEach(function (k) { g[k].sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }); });
    lane.items.forEach(function (it) {
      var y;
      if (it[3]) { var a = g[it[1] + '-' + it[2]], i = a.indexOf(it), lo = Math.max(it[1], Y0), hi = Math.min(it[2], Y1); if (hi < lo) hi = lo;
        y = lo + (i + .5) / a.length * (hi - lo); } else y = (it[1] + it[2]) / 2;
      out.push({it: it, x: px(Math.min(Y1, Math.max(Y0, y)), W)});
    });
    out.sort(function (a, b) { return a.x - b.x || (a.it[0] < b.it[0] ? -1 : 1); });
    var rows = [];
    out.forEach(function (o) { var r = 0; while (rows[r] != null && rows[r] > o.x - T / 2 - 3) r++; rows[r] = o.x + T / 2; o.r = r; });
    return {pts: out, rows: Math.max(1, rows.length)};
  }
  function axis(W) {
    var h = '<div class="axis" style="height:26px">';
    for (var y = 1700; y <= 2000; y += 50) h += '<span style="left:' + px(y, W) + 'px">' + y + '</span>';
    return h + '</div>';
  }
  function draw() {
    var W = Math.max(life.clientWidth, 940), html = '<div class="lifein" style="width:' + W + 'px">', top = 26, grid = '';
    html += axis(W);
    var body = '';
    cur.lanes.forEach(function (l) {
      var head = '<h3 class="lh"><span>' + U.esc(l.title) + '</span><b>' + l.n + '</b>' + (l.undated ? '<em>' + l.undated + ' undated, not shown</em>' : '') + '</h3>';
      if (!l.n) {
        body += '<section class="lane empty" aria-label="' + U.esc(l.title) + ': none">' + head + '<div class="void"><span>' + (l.empty === 'none' ? 'none in these five museums' : 'none agreed by both annotators') + '</span></div></section>';
        return;
      }
      var L = layout(l, W), H = L.rows * (T + 4) + 6;
      body += '<section class="lane" aria-label="' + U.esc(l.title) + '">' + head + '<div class="track" style="height:' + H + 'px">' + L.pts.map(function (o) {
        var it = S.by[o.it[0]], m = S.museums[it.m];
        return '<a class="lt' + (o.it[3] ? ' fade' : '') + '" style="--c:' + m.color + ';left:' + (o.x - T / 2).toFixed(1) + 'px;top:' + (o.r * (T + 4) + 3) + 'px" href="' + U.objUrl(it.id) + '" data-id="' + it.id + '" aria-label="' + U.esc(it.t + ', ' + m.short + ', ' + (it.dt || o.it[4])) + '"><img loading="lazy" decoding="async" src="' + U.thumb(it) + '" alt=""></a>';
      }).join('') + '</div></section>';
    });
    var lines = '';
    for (var y = 1700; y <= 2000; y += 50) lines += '<i class="gl' + (y % 100 ? '' : ' c') + '" style="left:' + px(y, W) + 'px"></i>';
    life.innerHTML = html + '<div class="grid-lines">' + lines + '</div>' + body + axis(W) + '</div>';
    life._rows = cur.lanes.length;
  }
  function show(a) {
    var it = S.by[a.dataset.id], m = S.museums[it.m], r = a.getBoundingClientRect();
    tip.querySelector('img').src = 'img/t/' + it.h + '.jpg'; tip.querySelector('b').textContent = it.t;
    tip.querySelector('span').textContent = m.short + ' · ' + (it.dt || 'undated'); tip.style.borderTopColor = m.color; tip.style.display = 'block';
    var w = tip.offsetWidth, h = tip.offsetHeight, x = r.left + r.width / 2 - w / 2, y = r.top - h - 8;
    if (y < 4) y = r.bottom + 8; x = Math.max(6, Math.min(innerWidth - w - 6, x)); tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  life.addEventListener('mouseover', function (e) { var a = e.target.closest('.lt'); if (a) show(a); });
  life.addEventListener('mouseout', function (e) { if (e.target.closest('.lt')) tip.style.display = 'none'; });
  life.addEventListener('focusin', function (e) { var a = e.target.closest('.lt'); if (a) show(a); });
  life.addEventListener('focusout', function () { tip.style.display = 'none'; });
  life.addEventListener('scroll', function () { tip.style.display = 'none'; });
  U.$('#pchips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pick(b.dataset.k); });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(draw, 120); });
  pick(U.q().p);
})();
