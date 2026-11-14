(function () {
  var S = SCI, U = window.U, items = S.items.slice().sort(function (a, b) { return a.t.localeCompare(b.t, 'nl'); });
  var st = {q: '', tag: '', per: '', mk: '', y0: null, y1: null, m: {}};
  var qs = U.q();
  if (qs.q) st.q = qs.q; if (qs.tag) st.tag = qs.tag; if (qs.per) st.per = qs.per; if (qs.maker) st.mk = qs.maker;
  if (qs.m) qs.m.split(',').forEach(function (i) { st.m[i] = 1; });
  var tc = {}, pc = {};
  items.forEach(function (it) { it.g.forEach(function (g) { tc[g] = (tc[g] || 0) + 1; }); if (it.p) pc[it.p] = (pc[it.p] || 0) + 1; });
  var tags = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a] || a.localeCompare(b); });
  U.$('#tag').innerHTML = '<option value="">All subjects</option>' + tags.map(function (t) { return '<option value="' + U.esc(t) + '">' + U.esc(t) + ' (' + tc[t] + ')</option>'; }).join('');
  U.$('#per').innerHTML = '<option value="">All periods</option>' + Object.keys(pc).sort().map(function (p) { return '<option value="' + p + '">' + p + ' (' + pc[p] + ')</option>'; }).join('');
  var mkn = S.makers || [];
  U.$('#mk').innerHTML = '<option value="">All makers</option>' + mkn.map(function (m, i) { return '<option value="' + i + '">' + U.esc(m[0]) + ' (' + m[1] + ')</option>'; }).join('');
  if (st.mk) { var mi = mkn.map(function (m) { return m[0]; }).indexOf(st.mk); st.mk = mi >= 0 ? String(mi) : ''; }
  /* date range: an object is in when the midpoint of its best date lies inside; undated objects stay in until the range is narrowed */
  var mids = items.filter(function (it) { return it.s != null; }).map(function (it) { return (it.s + it.e) / 2; });
  var YMIN = Math.floor(Math.min.apply(null, mids) / 10) * 10, YMAX = Math.ceil(Math.max.apply(null, mids) / 10) * 10;
  var y0 = U.$('#y0'), y1 = U.$('#y1');
  [y0, y1].forEach(function (r) { r.min = YMIN; r.max = YMAX; });
  y0.value = qs.from || YMIN; y1.value = qs.to || YMAX;
  function yr() { return [+y0.value, +y1.value]; }
  var mc = {}; items.forEach(function (it) { mc[it.m] = (mc[it.m] || 0) + 1; });
  U.$('#mchips').innerHTML = S.museums.map(function (m, i) { return '<li>' + U.chipHTML(i, !!st.m[i], ' ' + mc[i]) + '</li>'; }).join('');
  U.$('#q').value = st.q; U.$('#tag').value = st.tag; U.$('#per').value = st.per; U.$('#mk').value = st.mk;
  var grid = U.$('#grid'), nodes = items.map(function (it) { var d = document.createElement('div'); d.innerHTML = U.tile(it); d.hidden = false; return d; });
  nodes.forEach(function (n) { grid.appendChild(n); });
  function apply() {
    var q = st.q.trim().toLowerCase(), anyM = Object.keys(st.m).length, n = 0, r = yr(), narrowed = r[0] > YMIN || r[1] < YMAX, D = window.SCI_DESC || {};
    U.$('#yout').textContent = r[0] + ' to ' + r[1];
    items.forEach(function (it, i) {
      var md = it.s == null ? null : (it.s + it.e) / 2;
      var ok = (!anyM || st.m[it.m]) && (!st.tag || it.g.indexOf(st.tag) >= 0) && (!st.per || it.p === st.per) &&
        (!st.mk || it.mk.indexOf(+st.mk) >= 0) && (!narrowed || (md != null && md >= r[0] && md <= r[1])) &&
        (!q || (it.t + ' ' + it.g.join(' ') + ' ' + it.k + ' ' + it.pl + ' ' + it.mt + ' ' + S.museums[it.m].name + ' ' + (D[it.id] || '')).toLowerCase().indexOf(q) >= 0);
      nodes[i].hidden = !ok; if (ok) n++;
    });
    U.$('#count').textContent = n === items.length ? items.length.toLocaleString('en') + ' objects' : n.toLocaleString('en') + ' of ' + items.length.toLocaleString('en') + ' objects';
    var e = U.$('.empty'); if (e) e.remove();
    if (!n) grid.insertAdjacentHTML('beforebegin', '<p class="empty">No objects match these filters. Clear a filter to see more.</p>');
  }
  U.$('#q').addEventListener('input', function (e) { st.q = e.target.value; apply(); });
  U.$('#tag').addEventListener('change', function (e) { st.tag = e.target.value; apply(); });
  U.$('#per').addEventListener('change', function (e) { st.per = e.target.value; apply(); });
  U.$('#mk').addEventListener('change', function (e) { st.mk = e.target.value; apply(); });
  y0.addEventListener('input', function () { if (+y0.value > +y1.value) y0.value = y1.value; apply(); });
  y1.addEventListener('input', function () { if (+y1.value < +y0.value) y1.value = y0.value; apply(); });
  U.$('#mchips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var i = b.dataset.m;
    if (st.m[i]) delete st.m[i]; else st.m[i] = 1; b.setAttribute('aria-pressed', !!st.m[i]); apply();
  });
  U.$('#reset').addEventListener('click', function () {
    st = {q: '', tag: '', per: '', mk: '', y0: null, y1: null, m: {}}; U.$('#q').value = ''; U.$('#tag').value = ''; U.$('#per').value = ''; U.$('#mk').value = ''; y0.value = YMIN; y1.value = YMAX;
    U.$$('#mchips button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); apply();
  });
  apply();
})();
