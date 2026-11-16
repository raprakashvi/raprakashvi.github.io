// Front page: one title, one sentence, a photo mosaic from both domains, then Patterns, Explore, Analyse, Contact.
import {boot, loadJSON, $, esc, fmt, fromMini, mus, thumb, objUrl, getDomain, personality, errorBox} from './core.js';

const main = $('#main');
try {
  const m = await boot(), H = await loadJSON('home.json');
  const R = id => fromMini(id, H.mini[id]);
  $('#lede').innerHTML = fmt(m.counts.all) + ' objects from ' + m.counts.museums + ' collections: ' + fmt(m.counts.surg) + ' surgical instruments, ' +
    fmt(m.counts.sci) + ' scientific objects and ' + fmt(m.counts.uns) + ' catalogue records the codebook could not place — one collection you can browse, map and follow through time.';
  const ph = (id, extra) => { const r = R(id); if (!r) return ''; return '<span class="ph" style="--c:' + mus(r.m).color + '"' + (extra || '') + '><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span>'; };
  const im = id => { const r = R(id); return r ? '<img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="">' : ''; };
  function mosaic() {
    const d = getDomain(), lists = {surg: H.mosaic.surg, sci: H.mosaic.sci, uns: H.mosaic.cat || []};
    const pick = d === 'all' ? Array.from({length: 24}, (_, k) => [lists.surg, lists.sci, lists.uns][k % 3][(k / 3) | 0]).filter(Boolean) : (lists[d] || []).slice(0, 24);
    $('#mosaic').innerHTML = pick.map(id => { const r = R(id); return r ? '<a href="' + objUrl(id) + '" style="--c:' + mus(r.m).color + '" title="' + esc(r.t) + '"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"><i class="dm ' + (r.d === 0 ? 'surg' : r.d === 1 ? 'sci' : 'uns') + '"></i></a>' : ''; }).join('');
    const pl = document.getElementById('plede'); if (pl) pl.textContent = personality().line;
  }
  mosaic();
  window.addEventListener('vestigium:domain', mosaic);
  const arrow = '<span class="ar" aria-hidden="true">→</span>';
  const pats = [
    ['principles.html', 'Life of a principle', H.n_principles + ' principles of physics and ' + H.n_fams + ' surgical functions, from the first object to the last.', '<div class="pp life4">' + H.life.map(id => ph(id)).join('') + '</div>', 'big'],
    ['lineages.html', 'Lineages', 'Which device grew out of which, across museums and family-tree branches.', '<div class="pp lin4">' + H.lin.map((id, i) => (i === 2 ? arrow : '') + ph(id)).join('') + '</div>', ''],
    ['atlas.html#map', 'Family tree', 'Surgical instruments from Roman times on, linked by documented comparisons: ' + esc(H.tree_name.toLowerCase()) + ' shown.', '<div class="pp tree4">' + H.tree.map((id, i) => (i ? '<span class="ar" aria-hidden="true">→</span>' : '') + ph(id)).join('') + '</div>', ''],
    ['gaps.html', 'Missing links', 'The stages no museum here holds, and what would fill them.', '<div class="pp gap2">' + ph(H.gap.id) + '<span class="frame"><span>' + esc(H.gap.text) + '</span></span></div>', ''],
    ['bridges.html', 'Bridges', 'A surgical instrument and a scientific object that look alike, and pairs across museums.', '<div class="pp gap2 br2">' + H.cross.map(id => ph(id)).join('<span class="swap" aria-hidden="true">↔</span>') + '</div>', '']
  ];
  $('#patterns').innerHTML = pats.map(t => '<a class="pat ' + t[4] + '" href="' + t[0] + '">' + t[3] + '<h3>' + t[1] + '</h3><p>' + t[2] + '</p></a>').join('');
  const entries = [
    ['collection.html', 'Collection', fmt(m.counts.all) + ' objects, every filter', '<div class="pics p2x2">' + H.collage.map(im).join('') + '</div>'],
    ['map.html', 'Map of forms', 'Objects that look alike sit together', '<div class="pics p1"><img loading="lazy" src="img/u/map-preview.png" alt="Map of every object: squares surgical, circles science"></div>'],
    ['map3d.html', 'Map in time', 'The same map, the date as height', '<div class="pics p1"><img loading="lazy" src="img/u/map3d-preview.png" alt="Three-dimensional map of every object"></div>'],
    ['atlas.html#world', 'World and time', 'Where and when the surgical records were made', '<div class="pics p1"><img loading="lazy" src="img/u/world-preview.png" alt="Map of Europe with the places of surgical records"></div>'],
    ['timeline.html', 'Timeline', 'Photo strips through the centuries', '<div class="pics p4">' + H.timeline.map(im).join('') + '</div>']
  ];
  const card = t => '<a class="entry" href="' + t[0] + '">' + t[3] + '<h3>' + t[1] + '</h3><p>' + t[2] + '</p></a>';
  // the personality also sets which view comes first for a domain: a skin over the same cards, not another site
  const order = ['all', 'surg'].includes(getDomain()) ? entries : [entries[1], entries[4], entries[0], entries[2], entries[3]];
  $('#explore').innerHTML = order.map(card).join('');
  const nb = H.cross.length ? H.cross : H.collage.slice(0, 2);
  $('#analyse').innerHTML = [
    ['compare.html' + (nb.length === 2 ? '?a=' + encodeURIComponent(nb[0]) + '&b=' + encodeURIComponent(nb[1]) : ''), 'Compare', 'Any two objects, side by side', '<div class="pics p2">' + nb.map(im).join('') + '</div>'],
    ['atlas.html#morph', 'Morphology', 'Outlines and shape space', '<div class="pics p1 fig"><img loading="lazy" src="figures/morphology_web.png" alt="Outline aspect ratio against solidity"></div>'],
    ['analyse.html#ai', 'AI methods', 'Similar records, clusters, suggestions', '<div class="pics p1 fig"><img loading="lazy" src="figures/working_functions.png" alt="Working functions across the surgical records"></div>'],
    ['analyse.html#review', 'Audit and annotate', 'Check labels, outlines and links', '<div class="pics p1 fig"><img loading="lazy" src="figures/supplemental_masks.png" alt="Outline masks for checking"></div>']
  ].map(card).join('');
} catch (e) { errorBox(main, e); }
