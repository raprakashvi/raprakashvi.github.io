(function () {
  var S = SCI, U = window.U, items = S.items.slice().sort(function (a, b) { return a.t.localeCompare(b.t, 'nl'); });
  var st = {q: '', tag: '', per: '', m: {}};
  var qs = U.q();
  if (qs.q) st.q = qs.q; if (qs.tag) st.tag = qs.tag; if (qs.per) st.per = qs.per;
  if (qs.m) qs.m.split(',').forEach(function (i) { st.m[i] = 1; });
  var tc = {}, pc = {};
  items.forEach(function (it) { it.g.forEach(function (g) { tc[g] = (tc[g] || 0) + 1; }); if (it.p) pc[it.p] = (pc[it.p] || 0) + 1; });
  var tags = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a] || a.localeCompare(b); });
  U.$('#tag').innerHTML = '<option value="">All subjects</option>' + tags.map(function (t) { return '<option value="' + U.esc(t) + '">' + U.esc(t) + ' (' + tc[t] + ')</option>'; }).join('');
  U.$('#per').innerHTML = '<option value="">All periods</option>' + Object.keys(pc).sort().map(function (p) { return '<option value="' + p + '">' + p + ' (' + pc[p] + ')</option>'; }).join('');
  var mc = {}; items.forEach(function (it) { mc[it.m] = (mc[it.m] || 0) + 1; });
  U.$('#mchips').innerHTML = S.museums.map(function (m, i) { return '<li>' + U.chipHTML(i, !!st.m[i], ' ' + mc[i]) + '</li>'; }).join('');
  U.$('#q').value = st.q; U.$('#tag').value = st.tag; U.$('#per').value = st.per;
  var grid = U.$('#grid'), nodes = items.map(function (it) { var d = document.createElement('div'); d.innerHTML = U.tile(it); d.hidden = false; return d; });
  nodes.forEach(function (n) { grid.appendChild(n); });
  function apply() {
    var q = st.q.trim().toLowerCase(), anyM = Object.keys(st.m).length, n = 0;
    items.forEach(function (it, i) {
      var ok = (!anyM || st.m[it.m]) && (!st.tag || it.g.indexOf(st.tag) >= 0) && (!st.per || it.p === st.per) &&
        (!q || (it.t + ' ' + it.g.join(' ') + ' ' + it.k + ' ' + S.museums[it.m].name).toLowerCase().indexOf(q) >= 0);
      nodes[i].hidden = !ok; if (ok) n++;
    });
    U.$('#count').textContent = n === items.length ? items.length.toLocaleString('en') + ' objects' : n.toLocaleString('en') + ' of ' + items.length.toLocaleString('en') + ' objects';
    var e = U.$('.empty'); if (e) e.remove();
    if (!n) grid.insertAdjacentHTML('beforebegin', '<p class="empty">No objects match these filters. Clear a filter to see more.</p>');
  }
  U.$('#q').addEventListener('input', function (e) { st.q = e.target.value; apply(); });
  U.$('#tag').addEventListener('change', function (e) { st.tag = e.target.value; apply(); });
  U.$('#per').addEventListener('change', function (e) { st.per = e.target.value; apply(); });
  U.$('#mchips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var i = b.dataset.m;
    if (st.m[i]) delete st.m[i]; else st.m[i] = 1; b.setAttribute('aria-pressed', !!st.m[i]); apply();
  });
  U.$('#reset').addEventListener('click', function () {
    st = {q: '', tag: '', per: '', m: {}}; U.$('#q').value = ''; U.$('#tag').value = ''; U.$('#per').value = '';
    U.$$('#mchips button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); apply();
  });
  apply();
})();
