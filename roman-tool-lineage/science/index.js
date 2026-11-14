(function () {
  var H = window.SCI_HOME, S = window.SCI, U = window.U, esc = U.esc;
  U.$('#legend').innerHTML = U.legend();
  var im = function (h) { return '<img loading="lazy" src="img/t/' + h + '.jpg" alt="">'; };
  var ph = function (id) { var it = S.by[id]; return '<span class="ph" style="--c:' + S.museums[it.m].color + '"><img loading="lazy" src="' + U.thumb(it) + '" alt="' + esc(it.t) + '"></span>'; };
  var pt = H.pat;
  var pats = [
    ['principles.html', 'Life of a principle', 'Twelve principles, from demonstration table to household, one photograph per object.',
      '<div class="pp life4">' + pt.life.map(ph).join('') + '</div>', 'big'],
    ['lineages.html', 'Lineages', 'Which device grew out of which, followed across museums.',
      '<div class="pp lin4">' + pt.lin.map(function (id, i) { return (i === 2 ? '<span class="ar" aria-hidden="true">→</span>' : '') + ph(id); }).join('') + '</div>', ''],
    ['gaps.html', 'Missing links', 'The stages that no museum here holds, and what would fill them.',
      '<div class="pp gap2">' + ph(pt.gap.id) + '<span class="frame"><span>' + esc(pt.gap.text) + '</span></span></div>', '']
  ];
  U.$('#patterns').innerHTML = pats.map(function (t) {
    return '<a class="pat ' + t[4] + '" href="' + t[0] + '">' + t[3] + '<h3>' + t[1] + '</h3><p>' + t[2] + '</p></a>'; }).join('');
  var br = H.bridge.map(function (id) { return im(S.by[id].h); }).join('');
  var tiles = [
    ['collection.html', 'Collection', H.counts.objects.toLocaleString('en') + ' objects to browse and filter', '<div class="pics p2x2">' + H.collage.map(im).join('') + '</div>'],
    ['bridges.html', 'Bridges between museums', H.counts.bridges + ' proposed pairs across museums', '<div class="pics p2">' + br + '</div>'],
    ['map.html', 'Map of forms', 'Objects that look alike sit close together', '<div class="pics p1"><img loading="lazy" src="img/map-preview.png" alt="Map of all objects, coloured by museum"></div>'],
    ['map3d.html', 'Map in time', 'The same map, with the date as height', '<div class="pics p1"><img loading="lazy" src="img/map3d-preview.png" alt="Three-dimensional map of all objects, coloured by museum"></div>'],
    ['timeline.html', 'Timeline', 'Photo strips through the centuries, by subject', '<div class="pics p4">' + H.timeline.map(im).join('') + '</div>']
  ];
  U.$('#entries').innerHTML = tiles.map(function (t) {
    return '<a class="entry" href="' + t[0] + '">' + t[3] + '<h3>' + t[1] + '</h3><p>' + t[2] + '</p></a>'; }).join('');
  U.$('#surgpics').innerHTML = H.surgical.map(function (s) { return '<img loading="lazy" src="' + s + '" alt="Surgical instrument">'; }).join('');
})();
