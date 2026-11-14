(function () {
  var P = window.SCI_PAT, S = window.SCI, U = window.U, esc = U.esc;
  U.$('#legend').innerHTML = U.legend();
  function slot(g, s) {
    if (s.n) {
      var it = S.by[s.rep], m = S.museums[it.m];
      return '<a class="slot full" style="--c:' + m.color + '" href="principles.html?p=' + encodeURIComponent(g.k) + '" aria-label="' + esc(s.title + ': ' + s.n + ' objects') + '"><span class="ph"><img loading="lazy" decoding="async" src="' + U.thumb(it) + '" alt="' + esc(it.t) + '"></span><b>' + s.n + '</b>' +
        '<span class="mu">' + s.m.map(function (i) { return '<i style="background:' + S.museums[i].color + '"></i>' + esc(S.museums[i].short); }).join(' ') + '</span></a>';
    }
    return '<div class="slot gap ' + s.state + '" role="img" aria-label="' + esc(s.text) + '"><span class="frame"><span>' + (s.state === 'none' ? esc(s.text) : 'annotators disagree') + '</span></span></div>';
  }
  U.$('#gaps').innerHTML = P.gaps.map(function (g) {
    return '<div class="grow"><h3>' + esc(g.label) + '<span>' + g.n + ' objects</span></h3><div class="slots">' +
      g.slots.map(function (s) { return '<div class="cell"><h4>' + esc(s.title) + '</h4>' + slot(g, s) + '</div>'; }).join('') + '</div></div>';
  }).join('');
  function mini(id) { var it = S.by[id], m = S.museums[it.m];
    return '<a class="tile" style="--c:' + m.color + '" href="' + U.objUrl(id) + '"><div class="ph"><img loading="lazy" decoding="async" src="' + U.thumb(it) + '" alt="' + esc(it.t) + '"></div><b>' + esc(it.t) + '</b><span>' + esc(m.short) + (it.dt ? ' · ' + esc(it.dt) : '') + '</span></a>'; }
  U.$('#acq').innerHTML = P.acq.map(function (a) {
    var m = S.museums[a.m];
    return '<div class="amus" style="--c:' + m.color + '"><h3><i></i>' + esc(m.short) + '</h3><div class="pairs2">' + a.items.map(function (x) {
      return '<div class="pr"><div class="two">' + (x.own ? mini(x.own) : '<div class="nofill"></div>') + '<span class="swap" aria-hidden="true">↔</span>' + mini(x.donor) + '</div>' +
        '<p>Holds the ' + esc(x.holds) + '; lacks its ' + x.rel + ', the ' + esc(x.lacks) + '.</p></div>'; }).join('') + '</div></div>';
  }).join('');
})();
