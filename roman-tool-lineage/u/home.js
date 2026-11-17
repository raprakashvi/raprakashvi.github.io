// Front page (T-036): one large photo band from every collection, one sentence, the groups that cross museums, three
// ways in, then a visual "what is here" strip (no tables), the patterns and the analysis views.  Photographs lead;
// no gradients, no emoji, no repeated caveat line (the one plain note is in the footer).
import {boot, loadJSON, $, esc, fmt, fromMini, mus, thumb, objUrl, getDomain, errorBox} from './core.js';

const main = $('#main');
try {
  const m = await boot(), H = await loadJSON('home.json');
  const R = id => fromMini(id, H.mini[id]);
  $('#lede').innerHTML = fmt(m.counts.all) + ' objects from ' + m.counts.museums + ' collections: ' + fmt(m.counts.med) +
    ' tagged Medicine and ' + fmt(m.counts.sci) + ' tagged Science and technology (some carry both), one collection you can browse, map and follow through time.';
  const im = id => { const r = R(id); return r ? '<img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="">' : ''; };
  const ph = (id, extra) => { const r = R(id); if (!r) return ''; return '<span class="ph" style="--c:' + mus(r.m).color + '"' + (extra || '') + '><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span>'; };

  // the opening band: real photographs only (registration cards are already excluded by the build)
  $('#band').innerHTML = H.band.map(id => { const r = R(id); return r ? '<a href="' + objUrl(id) + '" style="--c:' + mus(r.m).color + '" title="' + esc(r.t + ' · ' + mus(r.m).short) + '">' + im(id) + '</a>' : ''; }).join('');

  // the groups that cross museums: a row of photographs each, one plain line
  $('#cband').innerHTML = (H.clusters || []).map(c => '<a class="clrow" href="clusters.html#c' + c.id + '"><span class="clpics">' +
    c.pics.slice(0, 4).map(id => { const r = R(id); return r ? '<img loading="lazy" decoding="async" style="--c:' + mus(r.m).color + '" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '">' : ''; }).join('') +
    '</span><span class="clline">' + esc(c.line) + '<b>' + fmt(c.n) + ' objects in this group</b></span></a>').join('');

  // three ways in
  const arrow = '<span class="ar" aria-hidden="true">→</span>';
  const entries = [
    ['collection.html', 'Browse', fmt(m.counts.all) + ' objects, every filter', '<div class="pics p2x2">' + H.collage.map(im).join('') + '</div>'],
    ['map.html', 'See connections', 'What looks alike sits together; the groups that cross museums are outlined', '<div class="pics p1"><img loading="lazy" src="img/u/map-preview.png" alt="Map of every object; the groups that cross museums are outlined"></div>'],
    ['principles.html', 'Follow through time', 'A principle or a working function, from its first object to its last', '<div class="pp life4">' + H.life.map(id => ph(id)).join('') + '</div>'],
  ];
  const card = t => '<a class="entry" href="' + t[0] + '">' + t[3] + '<h3>' + t[1] + '</h3><p>' + t[2] + '</p></a>';
  $('#entries').innerHTML = entries.map(card).join('');

  // what is here: counts by collection and by century, as small charts
  const maxm = Math.max(...H.by_museum.map(x => x.n), 1);
  const bars = H.by_museum.filter(x => x.n > 200).map(x => '<div class="whrow"><span class="whlab">' + esc(x.short) + '</span><span class="whbar" style="--c:' + x.color + ';--w:' + (100 * x.n / maxm).toFixed(1) + '%"></span><b>' + fmt(x.n) + '</b></div>').join('');
  const C = ['#a8431f', '#284f7a', '#7b5f6d', '#b3ada0'];
  const maxc = Math.max(...H.by_century.map(x => x.n), 1);
  const hist = H.by_century.map(x => {
    let y = 100;
    const seg = x.by_museum.map((n, i) => { const h = 100 * n / maxc; y -= h; return h > 0 ? '<i style="height:' + h.toFixed(2) + '%;bottom:' + y.toFixed(2) + '%;background:' + mus(i).color + '"></i>' : ''; }).join('');
    return '<div class="whcol"><span class="whstack">' + seg + '</span><b>' + (x.n >= 1000 ? Math.round(x.n / 1000) + 'k' : fmt(x.n)) + '</b><span class="whcl">' + esc(x.label) + '</span></div>';
  }).join('');
  $('#whathere').innerHTML = '<div class="wh"><h3>By collection</h3><div class="whbars">' + bars + '</div></div>' +
    '<div class="wh"><h3>By century, stacked by collection</h3><div class="whhist">' + hist + '</div>' +
    '<p class="whnote">' + fmt(H.by_century.find(x => x.label === 'undated').n) + ' objects carry no usable date and are counted in the last column.</p></div>';

  // patterns and analysis keep their place
  const pats = [
    ['principles.html', 'Life of a principle', H.n_principles + ' principles and ' + H.n_fams + ' working functions, one list, from the first object to the last.', '<div class="pp life4">' + H.life.map(id => ph(id)).join('') + '</div>', 'big'],
    ['lineages.html', 'Lineages', 'Which device grew out of which, across museums and family-tree branches.', '<div class="pp lin4">' + H.lin.map((id, i) => (i === 2 ? arrow : '') + ph(id)).join('') + '</div>', ''],
    ['atlas.html#map', 'Family tree', 'Medicine and Science and technology in one tree: documented comparisons among the instruments, device chains and maker series among the scientific objects.', '<div class="pp tree4">' + H.tree.map((id, i) => (i ? '<span class="ar" aria-hidden="true">→</span>' : '') + ph(id)).join('') + '</div>', ''],
    ['gaps.html', 'Missing links', 'The stages no museum here holds, and what would fill them.', '<div class="pp gap2">' + ph(H.gap.id) + '<span class="frame"><span>' + esc(H.gap.text) + '</span></span></div>', ''],
    ['bridges.html', 'Bridges', 'A surgical instrument and a scientific object that look alike, and pairs across museums.', '<div class="pp gap2 br2">' + H.cross.map(id => ph(id)).join('<span class="swap" aria-hidden="true">↔</span>') + '</div>', ''],
    ['clusters.html', 'Groups by closeness', 'The collection grouped by how close objects are, not by a list.', '<div class="pp p2x2">' + (H.clusters || []).slice(0, 4).map(c => ph(c.pics[0])).join('') + '</div>', ''],
  ];
  $('#patterns').innerHTML = pats.map(t => '<a class="pat ' + t[4] + '" href="' + t[0] + '">' + t[3] + '<h3>' + t[1] + '</h3><p>' + t[2] + '</p></a>').join('');
  const nb = H.cross.length ? H.cross : H.collage.slice(0, 2);
  $('#analyse').innerHTML = [
    ['compare.html' + (nb.length === 2 ? '?a=' + encodeURIComponent(nb[0]) + '&b=' + encodeURIComponent(nb[1]) : ''), 'Compare', 'Any two objects, side by side', '<div class="pics p2">' + nb.map(im).join('') + '</div>'],
    ['atlas.html#morph', 'Morphology', 'Outlines and shape space', '<div class="pics p1 fig"><img loading="lazy" src="figures/morphology_web.png" alt="Outline aspect ratio against solidity"></div>'],
    ['analyse.html#ai', 'AI methods', 'Similar records, clusters, suggestions', '<div class="pics p1 fig"><img loading="lazy" src="figures/working_functions.png" alt="Working functions across the surgical records"></div>'],
    ['analyse.html#review', 'Audit and annotate', 'Check labels, outlines and links', '<div class="pics p1 fig"><img loading="lazy" src="figures/supplemental_masks.png" alt="Outline masks for checking"></div>']
  ].map(card).join('');
} catch (e) { errorBox(main, e); }
