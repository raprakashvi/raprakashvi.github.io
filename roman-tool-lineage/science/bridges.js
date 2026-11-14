(function () {
  var S = SCI, U = window.U, B = window.SCI_BRIDGES.slice().sort(function (x, y) { return (y.n - x.n) || (x.r - y.r); });
  var CHIP = {principle: 'same principle', name: 'same name', title_word: 'shared title word', image: 'looks alike', text: 'similar description'};
  var key = function (b) { var m = [S.by[b.a].m, S.by[b.b].m].sort(); return m[0] + '-' + m[1]; };
  var cnt = {}; B.forEach(function (b) { var k = key(b); cnt[k] = (cnt[k] || 0) + 1; });
  var name = function (k) { var p = k.split('-'); return S.museums[p[0]].short + ' and ' + S.museums[p[1]].short; };
  U.$('#pair').innerHTML = '<option value="">All museum pairs (' + B.length + ')</option>' +
    Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (k) { return '<option value="' + k + '">' + name(k) + ' (' + cnt[k] + ')</option>'; }).join('');
  var root = U.$('#pairs');
  root.innerHTML = B.map(function (b) {
    var A = S.by[b.a], C = S.by[b.b], one = function (it) { return '<div class="ph" style="--c:' + S.museums[it.m].color + '"><img loading="lazy" src="' + U.thumb(it) + '" alt="' + U.esc(it.t) + '"></div>'; };
    var cap = function (it) { return '<div><b>' + U.esc(it.t) + '</b><span>' + U.esc(S.museums[it.m].short) + (it.dt ? ' · ' + U.esc(it.dt) : '') + '</span></div>'; };
    return '<a class="pair" data-k="' + key(b) + '" href="' + U.cmpUrl(b.a, b.b) + '"><div class="two">' + one(A) + one(C) + '</div><div class="caps">' + cap(A) + cap(C) + '</div>' + (b.g.length ? '<span class="chips2">' + b.g.map(function (k) { return '<em>' + CHIP[k] + '</em>'; }).join('') + '</span>' : '') + '<span class="go">Compare</span></a>';
  }).join('');
  function apply() {
    var v = U.$('#pair').value, n = 0;
    U.$$('.pair', root).forEach(function (e) { var ok = !v || e.dataset.k === v; e.hidden = !ok; if (ok) n++; });
    U.$('#count').textContent = n + ' pairs';
  }
  U.$('#pair').addEventListener('change', apply); apply();
})();
