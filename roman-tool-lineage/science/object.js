(function () {
  var S = SCI, U = window.U, id = U.q().id, root = U.$('#obj'), it = S.by[id];
  if (!it) { root.innerHTML = '<h1>Object not found</h1><p><a class="btn" href="collection.html">Back to the collection</a></p>'; document.title = 'Object not found · Vestigium'; return; }
  U.loadObj(id).then(function (o) {
    var m = S.museums[o.museum]; document.title = o.title + ' · Vestigium';
    var dl = [['Maker', o.maker], ['Place', o.place], ['Size', o.dims], ['Inventory number', o.acc]].filter(function (r) { return r[1]; })
      .map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + U.esc(r[1]) + '</dd>'; }).join('');
    var first = (o.other[0] || o.similar[0]);
    root.innerHTML = '<article class="object" style="--c:' + m.color + '"><div class="plate"><img src="img/d/' + o.h + '.jpg" alt="' + U.esc(o.title) + '"></div><div>' +
      '<p class="museum"><i></i>' + U.esc(m.name) + '</p><h1>' + U.esc(o.title) + '</h1>' + (o.date ? '<p class="date">' + U.esc(o.date) + '</p>' : '') +
      (o.desc ? '<p class="desc">' + U.esc(o.desc) + '</p>' : '') +
      (o.tags.length ? '<div class="tags">' + o.tags.map(function (t) { return '<a href="collection.html?tag=' + encodeURIComponent(t) + '">' + U.esc(t) + '</a>'; }).join('') + '</div>' : '') +
      (dl ? '<dl>' + dl + '</dl>' : '') +
      (o.plate ? '<h2 class="sub">Read from the photograph</h2><p class="plate-text">' + U.esc(o.plate) + '</p>' : '') +
      '<div class="act">' + (first ? '<a class="fill" href="' + U.cmpUrl(id, first) + '">Compare with a similar object</a>' : '') +
      '<a href="' + U.esc(o.url) + '" rel="noopener">Museum record</a></div></div></article>' +
      U.row('In other museums', o.other, id) + U.row('Same museum, similar', o.similar, id) + U.row('Listed by the site', o.listed.slice(0, 8), id);
  }).catch(function () { root.innerHTML = '<h1>' + U.esc(it.t) + '</h1><p>Details could not be loaded.</p>'; });
})();
