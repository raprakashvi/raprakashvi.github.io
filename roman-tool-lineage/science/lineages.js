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
  /* T-024: groups where objects closer in time look more alike, maker series, makers found in two museums (all from the v3 result files) */
  var X = P.lin_form;
  function mus(list) { return '<span class="mus">' + list.map(function (m) { return '<span><i style="background:' + S.museums[m[0]].color + '"></i>' + esc(S.museums[m[0]].short) + ' ' + m[1] + '</span>'; }).join('') + '</span>'; }
  function strip(items, label) {
    return '<div class="cstrip" tabindex="0" role="region" aria-label="' + esc(label) + ', photographs in date order"><div class="thumbs">' + items.map(function (x) { return thumb(x[0], x[1]); }).join('') + '</div></div>';
  }
  U.$('#lf-lede').textContent = 'In ' + X.form.length + ' groups, objects that are closer in time also look more alike. Each strip runs from the oldest to the newest object; the number is the rank correlation between date gap and visual distance.';
  U.$('#lin-f').innerHTML = X.form.map(function (g) {
    var m = g.m.map(function (i) { return [i, '']; });
    return '<article class="chain" id="form-' + esc(g.k.replace(/[^a-z0-9]+/gi, '-').toLowerCase()) + '"><header><h3>' + esc(g.title) + '</h3><p>' + (g.orig ? esc(g.orig) + ' · ' : '') + esc(g.kind) + ' · ' + g.n + ' objects, ' + g.from + ' to ' + g.to +
      '</p><b class="rho" title="Spearman rho between date gap and visual distance">ρ = +' + g.rho.toFixed(2) + '</b></header><div class="museums">' +
      g.m.map(function (i) { return '<span><i style="background:' + S.museums[i].color + '"></i>' + esc(S.museums[i].short) + '</span>'; }).join('') + '</div>' + strip(g.items, g.title) + '</article>';
  }).join('');
  U.$('#ls-lede').textContent = 'Every maker with five or more objects, in date order. The border colour is the museum.';
  U.$('#lin-s').innerHTML = X.series.map(function (s) {
    return '<article class="chain" id="series-' + esc(s.key.replace(/[^a-z0-9]+/gi, '-')) + '"><header><h3>' + esc(s.name) + '</h3><p>' + s.n + ' objects' + (s.dated < s.n ? ', ' + s.dated + ' dated' : '') + ', ' + s.from + ' to ' + s.to + '</p>' + mus(s.mus) +
      '<a class="btn" href="collection.html?maker=' + encodeURIComponent(s.name) + '">All objects</a></header>' + strip(s.items, s.name) + '</article>';
  }).join('');
  U.$('#lp-lede').textContent = X.pairs.length + ' makers appear in two museums. Each pair shows their objects closest in date.';
  U.$('#lin-p').innerHTML = X.pairs.map(function (p) {
    var a = S.by[p.a], b = S.by[p.b];
    return '<article class="mpair"><h3>' + esc(p.name) + '</h3>' + mus(p.mus) + '<div class="two">' + U.tile(a) + U.tile(b) + '</div><a class="btn" href="' + U.cmpUrl(p.a, p.b) + '">Compare</a></article>';
  }).join('');
  if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
})();
