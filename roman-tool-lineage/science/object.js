(function () {
  var S = SCI, U = window.U, id = U.q().id, root = U.$('#obj'), it = S.by[id];
  if (!it) { root.innerHTML = '<h1>Object not found</h1><p><a class="btn" href="collection.html">Back to the collection</a></p>'; document.title = 'Object not found · Vestigium'; return; }
  function pline(o) {
    var v = o.pat; if (!v) return '';
    var a = [];
    if (v.p) a.push(v.pg ? '<a href="principles.html?p=' + encodeURIComponent(v.p) + '">' + U.esc(v.pl) + '</a>' : U.esc(v.pl));
    if (v.r) a.push(U.esc(v.r)); if (v.f) a.push(U.esc(v.f));
    return a.length ? '<p class="pline">' + a.join(' <i>·</i> ') + '</p>' : '';
  }
  function lineage(o) {
    if (!o.lin || !o.lin.length) return '';
    return o.lin.map(function (l) {
      var chain = l.fams.map(function (f, i) { return i === l.i ? '<b>' + U.esc(f) + '</b>' : U.esc(f); }).join(' <i>→</i> ');
      var grp = function (ids, f) { var its = ids.map(function (i) { return S.by[i]; }).filter(Boolean); return its.length ? '<div class="lg"><h3>' + U.esc(f) + '</h3><div class="strip">' + its.map(function (it) { return '<div>' + U.tile(it) + '</div>'; }).join('') + '</div></div>' : ''; };
      return '<section class="row lineage"><h2>Lineage</h2><p class="chainline">' + chain + ' <a href="lineages.html#chain-' + l.c + '">All of this lineage</a></p><div class="lgs">' +
        grp(l.prev, l.fams[l.i - 1]) + grp(l.next, l.fams[l.i + 1]) + '</div></section>';
    }).join('');
  }
  U.loadObj(id).then(function (o) {
    var m = S.museums[o.museum]; document.title = o.title + ' · Vestigium';
    var dl = [['Maker', o.maker], ['Place', o.place], ['Size', o.dims], ['Inventory number', o.acc]].filter(function (r) { return r[1]; })
      .map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + U.esc(r[1]) + '</dd>'; }).join('');
    var first = (o.other[0] || o.similar[0]);
    root.innerHTML = '<article class="object" style="--c:' + m.color + '"><div class="plate"><img src="img/d/' + o.h + '.jpg" alt="' + U.esc(o.title) + '"></div><div>' +
      '<p class="museum"><i></i>' + U.esc(m.name) + '</p><h1>' + U.esc(o.title) + '</h1>' + (o.date ? '<p class="date">' + U.esc(o.date) + '</p>' : '') + pline(o) +
      (o.desc ? '<p class="desc">' + U.esc(o.desc) + '</p>' : '') +
      (o.tags.length ? '<div class="tags">' + o.tags.map(function (t) { return '<a href="collection.html?tag=' + encodeURIComponent(t) + '">' + U.esc(t) + '</a>'; }).join('') + '</div>' : '') +
      (dl ? '<dl>' + dl + '</dl>' : '') +
      (o.o ? '<h2 class="sub">Outline</h2><div class="outline"><img src="img/o/' + o.h + '.png" alt="Outline of ' + U.esc(o.title) + '"></div>' : '') +
      (o.plate ? '<h2 class="sub">Read from the photograph</h2><p class="plate-text">' + U.esc(o.plate) + '</p>' : '') +
      '<div class="act">' + (first ? '<a class="fill" href="' + U.cmpUrl(id, first) + '">Compare with a similar object</a>' : '') +
      '<a href="' + U.esc(o.url) + '" rel="noopener">Museum record</a></div></div></article>' +
      lineage(o) + U.row('In other museums', o.other, id) + U.row('Same museum, similar', o.similar, id) + U.row('Listed by the site', o.listed.slice(0, 8), id);
  }).catch(function () { root.innerHTML = '<h1>' + U.esc(it.t) + '</h1><p>Details could not be loaded.</p>'; });
})();
