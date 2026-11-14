(function () {
  var P = window.SCI_PAT, S = window.SCI, U = window.U, esc = U.esc;
  function thumb(id, yr) {
    var it = S.by[id], m = S.museums[it.m];
    return '<a class="lthumb" style="--c:' + m.color + '" href="' + U.objUrl(id) + '" title="' + esc(it.t + ', ' + m.short) + '"><span class="ph"><img loading="lazy" decoding="async" src="' + U.thumb(it) + '" alt="' + esc(it.t) + '"></span><em>' + esc(yr || it.dt || '') + '</em></a>';
  }
  function chain(c) {
    var fams = c.fams.map(esc).join(' <i aria-hidden="true">→</i> ');
    var strip = c.groups.map(function (g, i) {
      var dots = g.m.map(function (m) { return '<i style="background:' + S.museums[m].color + '" title="' + esc(S.museums[m].short) + '"></i>'; }).join('');
      return (i ? '<div class="arrow" aria-hidden="true"><svg viewBox="0 0 40 24" width="40" height="24"><path d="M2 12h32M26 4l10 8-10 8" fill="none" stroke="currentColor" stroke-width="2"/></svg></div>' : '') +
        '<div class="fam"><h4>' + esc(g.f) + '<span>' + g.n + (g.n === 1 ? ' object' : ' objects') + '</span><span class="dots">' + dots + '</span></h4><div class="thumbs">' + g.items.map(function (x) { return thumb(x[0], x[1]); }).join('') + '</div></div>';
    }).join('');
    return '<article class="chain" id="chain-' + c.id + '"><header><h3>' + fams + '</h3><p>' + c.n + ' objects in ' + c.museums.length + ' museums, ' + c.span + ' years from first to last</p>' +
      '<a class="btn" href="' + U.cmpUrl(c.first, c.last) + '">Compare earliest and latest</a></header><div class="cstrip" tabindex="0" aria-label="' + esc(c.fams.join(' to ')) + '">' + strip + '</div></article>';
  }
  U.$('#lin-a').innerHTML = P.chains.filter(function (c) { return c.agree; }).map(chain).join('');
  U.$('#lin-m').innerHTML = P.chains.filter(function (c) { return !c.agree; }).map(chain).join('');
  if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
})();
