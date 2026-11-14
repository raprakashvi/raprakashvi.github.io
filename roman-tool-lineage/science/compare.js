(function () {
  var S = SCI, U = window.U, q = U.q(), a = S.by[q.a], b = S.by[q.b], root = U.$('#cmp');
  /* picker: search the whole collection; choosing an object sets the second side (or the first, when none is set) */
  var inp = U.$('#pick'), ul = U.$('#picks');
  inp.addEventListener('input', function () {
    var t = inp.value.trim().toLowerCase(), hits = [];
    if (t.length >= 2) for (var i = 0; i < S.items.length && hits.length < 8; i++) { var it = S.items[i]; if (it.id !== q.a && it.t.toLowerCase().indexOf(t) >= 0) hits.push(it); }
    ul.hidden = !hits.length;
    ul.innerHTML = hits.map(function (it) {
      return '<li><a href="' + (a ? U.cmpUrl(a.id, it.id) : U.cmpUrl(it.id, '')) + '"><img src="' + U.thumb(it) + '" alt=""><div>' + U.esc(it.t) + '<span>' + U.esc(S.museums[it.m].short) + (it.dt ? ' · ' + U.esc(it.dt) : '') + '</span></div></a></li>';
    }).join('');
  });
  if (a && !b) {
    root.innerHTML = '';
    var sd = document.createElement('div'); sd.className = 'side'; root.appendChild(sd);
    U.loadObj(a.id).then(function (o) { sd.innerHTML = '<div class="plate"><img src="img/d/' + o.h + '.jpg" alt="' + U.esc(o.title) + '"></div><h2><a href="' + U.objUrl(o.id) + '">' + U.esc(o.title) + '</a></h2>'; });
    U.$('#swap').style.display = 'none'; return;
  }
  if (!a || !b) { root.innerHTML = '<p class="empty">Search above, or choose a pair from <a href="bridges.html"><u>Bridges</u></a> or any object page.</p>'; U.$('#swap').style.display = 'none'; return; }
  U.$('#swap').href = U.cmpUrl(b.id, a.id);
  [a, b].forEach(function (it) {
    var side = document.createElement('div'); side.className = 'side'; root.appendChild(side);
    U.loadObj(it.id).then(function (o) {
      var m = S.museums[o.museum];
      side.innerHTML = '<div class="plate" style="--c:' + m.color + '"><img src="img/d/' + o.h + '.jpg" alt="' + U.esc(o.title) + '"></div>' +
        '<p class="museum" style="--c:' + m.color + ';margin-top:14px"><i></i>' + U.esc(m.name) + '</p><h2><a href="' + U.objUrl(o.id) + '">' + U.esc(o.title) + '</a></h2>' +
        (o.date ? '<p class="date" style="font-size:18px;margin-bottom:8px">' + U.esc(o.date) + '</p>' : '') +
        (o.tags.length ? '<div class="tags">' + o.tags.map(function (t) { return '<a href="collection.html?tag=' + encodeURIComponent(t) + '">' + U.esc(t) + '</a>'; }).join('') + '</div>' : '') +
        (o.desc ? '<p class="desc" style="font-size:15px">' + U.esc(o.desc) + '</p>' : '');
    });
  });
  document.title = a.t + ' and ' + b.t + ' · Vestigium';
})();
