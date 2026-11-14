(function () {
  var H = window.SCI_HOME, S = window.SCI, U = window.U;
  U.$('#legend').innerHTML = U.legend();
  U.$('#mosaic').innerHTML = H.mosaic.map(function (id) { var it = S.by[id];
    return '<a href="' + U.objUrl(id) + '" aria-label="' + U.esc(it.t) + '"><img loading="lazy" src="' + U.thumb(it) + '" alt="' + U.esc(it.t) + '"></a>'; }).join('');
  var im = function (h) { return '<img loading="lazy" src="img/t/' + h + '.jpg" alt="">'; };
  var br = H.bridge.map(function (id) { return im(S.by[id].h); }).join('');
  var tiles = [
    ['collection.html', 'Collection', H.counts.objects.toLocaleString('en') + ' objects to browse and filter', '<div class="pics p2x2">' + H.collage.map(im).join('') + '</div>'],
    ['bridges.html', 'Bridges between museums', H.counts.bridges + ' proposed pairs across museums', '<div class="pics p2">' + br + '</div>'],
    ['map.html', 'Map of forms', 'Objects that look alike sit close together', '<div class="pics p1"><img loading="lazy" src="img/map-preview.png" alt="Map of all objects, coloured by museum"></div>'],
    ['timeline.html', 'Timeline', 'Photo strips through the centuries, by subject', '<div class="pics p4">' + H.timeline.map(im).join('') + '</div>']
  ];
  U.$('#entries').innerHTML = tiles.map(function (t) {
    return '<a class="entry" href="' + t[0] + '">' + t[3] + '<h3>' + t[1] + '</h3><p>' + t[2] + '</p></a>'; }).join('');
  U.$('#surgpics').innerHTML = H.surgical.map(function (s) { return '<img loading="lazy" src="' + s + '" alt="Surgical instrument">'; }).join('');
})();
