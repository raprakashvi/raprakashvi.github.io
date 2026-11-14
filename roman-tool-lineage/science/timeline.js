(function () {
  var S = SCI, U = window.U, by = {};
  U.$('#legend').innerHTML = U.legend();
  S.items.forEach(function (it) { if (it.s == null) return; it.g.forEach(function (g) { (by[g] = by[g] || []).push(it); }); });
  var tags = Object.keys(by).filter(function (g) { return by[g].length >= 20; }).sort(function (a, b) { return by[b].length - by[a].length; });
  U.$('#tls').innerHTML = tags.map(function (g, n) {
    var a = by[g].slice().sort(function (x, y) { return x.s - y.s || x.id.localeCompare(y.id); });
    var lo = a[0].s, hi = a[a.length - 1].s;
    return '<section class="tl" aria-labelledby="t' + n + '"><h2 id="t' + n + '">' + U.esc(g) + ' <small>' + a.length + ' dated objects, ' + lo + ' to ' + hi + '</small></h2>' +
      '<div class="scroller" tabindex="0" role="region" aria-label="' + U.esc(g) + ', photographs by date">' + a.map(function (it) {
        var m = S.museums[it.m];
        return '<a class="tile" style="--c:' + m.color + '" href="' + U.objUrl(it.id) + '"><div class="ph"><img loading="lazy" src="' + U.thumb(it) + '" alt="' + U.esc(it.t) + '"></div>' +
          '<div class="yr">' + U.esc(it.dt || it.s) + '</div><b>' + U.esc(it.t) + '</b></a>'; }).join('') + '</div></section>';
  }).join('');
})();
