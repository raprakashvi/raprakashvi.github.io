// Method: the four-step flow, the tag rule, the surgical→principle mapping, the map modes and the groups by
// closeness, and a picture of which objects each view covers.
import {boot, loadJSON, $, esc, fmt} from './core.js';

const m = await boot();
$('#m-surg').textContent = fmt(m.counts.med) + ' tagged Medicine';
$('#m-sci').textContent = fmt(m.counts.sci) + ' tagged Science and technology';
$('#m-surg-src').textContent = m.counts.both.toLocaleString('en') + ' carry both tags; ' + m.counts.neither.toLocaleString('en') + ' neither';
if (m.catalogue) {
  const t = m.catalogue.by_tags || {};
  $('#m-cat').textContent = fmt(m.catalogue.records) + ' records';
  $('#m-rule').textContent = 'In this build: ' + fmt(m.catalogue.records) + ' catalogue records, ' + fmt(m.catalogue.duplicates) +
    ' already in the collection, ' + fmt(m.catalogue.kept) + ' added. Added records: Medicine only ' + fmt(t['1'] || 0) +
    ', Science only ' + fmt(t['2'] || 0) + ', both ' + fmt(t['3'] || 0) + ', neither ' + fmt(t['0'] || 0) + '. ' +
    fmt(m.catalogue.paper || 0) + ' are paper media, and ' + fmt(m.catalogue.paper_science_dropped || 0) +
    ' of those carry a codebook principle that does not make them Science. ' + fmt(m.catalogue.registration_cards || 0) +
    ' photographs are the museum\'s registration cards and are not shown as photographs.';
}
const sm = m.surg_map;
if (sm && sm.principle) {
  const top = (sm.counts || []).slice(0, 4).map(([k, n]) => esc(k) + ' ' + fmt(n)).join(', ');
  $('#m-surgmap').textContent = fmt(sm.surgical_objects) + ' surgical-release instruments join the principle "' + esc(sm.principle) +
    '". The codebook\'s labels for medical catalogue records that also carry a principle run: ' + top +
    '; the most frequent is the one used, and the surgical instruments sit in the lane "Medical practice".';
}
// [view, href, medicine coverage, science coverage, what it uses] ; 2 = all objects, 1 = in part, 0 = not in this view
const V = [
  ['Collection', 'collection.html', 2, 2, 'every record, including the three catalogues'],
  ['Map, Map in time', 'map.html', 2, 2, 'every object with a photograph that is not a registration card'],
  ['Groups by closeness', 'clusters.html', 2, 2, 'groups in the same space as the map'],
  ['Timeline', 'timeline.html', 2, 2, 'every dated object'],
  ['Compare', 'compare.html', 2, 2, 'any two objects'],
  ['Life of a principle', 'principles.html', 2, 2, 'every source in every lane; surgical instruments in the Medical practice lane'],
  ['Lineages', 'lineages.html', 1, 2, 'science: device chains and makers; surgical: family-tree branches'],
  ['Bridges', 'bridges.html', 1, 2, 'pairs across the two releases; museum pairs for science'],
  ['Missing links', 'gaps.html', 0, 2, 'principles and roles'],
  ['Family tree', 'atlas.html#map', 2, 2, 'one tree: documented comparisons among the instruments, device chains and maker series among the scientific objects'],
  ['World and time', 'atlas.html#world', 1, 0, 'catalogue cities of surgical records'],
  ['Morphology, outline measurements', 'atlas.html#morph', 1, 0, 'the surgical shape set'],
  ['AI methods', 'analyse.html#ai', 2, 0, 'runs on the surgical release'],
  ['Annotate, research audit', 'analyse.html#review', 1, 0, 'surgical tasks and links'],
];
const dot = (v, dom) => '<span class="cv ' + dom + ' v' + v + '" title="' + ['not in this view', 'in part', 'all'][v] + '"><span class="sr-only">' + ['not in this view', 'in part', 'all'][v] + '</span></span>';
$('#cover').innerHTML = '<div class="cvhead"><span></span><span><i class="dm med"></i>Medicine</span><span><i class="dm sci"></i>Science and technology</span><span></span></div>' +
  V.map(v => '<a class="cvrow" href="' + v[1] + '"><b>' + esc(v[0]) + '</b>' + dot(v[2], 'med') + dot(v[3], 'sci') + '<span class="cvwhy">' + esc(v[4]) + '</span></a>').join('') +
  '<p class="cvkey"><span class="cv med v2"></span> all <span class="cv med v1"></span> in part <span class="cv med v0"></span> not in this view</p>';
try {
  const b = await loadJSON('build.json');
  const e = b.embedding, mp = b.maps || {};
  const lp = (b.layout && b.layout.params) || {};
  $('#flownote').textContent = 'Shared space: ' + fmt(e.n) + ' objects with a photograph, each placed by UMAP (n_neighbors ' +
    (lp.n_neighbors ?? 15) + ', min_dist ' + (lp.min_dist ?? 0.1) + ', cosine, seed ' + (lp.seed ?? 7) + ').';
  const mm = Object.keys(mp).map(k => mp[k].label || k).join(', ');
  $('#m-map').textContent = 'One page, one space, three modes on the same objects: ' + mm +
    '. Each mode is its own cached UMAP layout of the same vectors; the map switches between them without reloading. ' +
    'The date can be read as height on Map in time.';
  const lay = b.layout || {};
  if (lay.pipeline && $('#m-layout')) {
    const rows = (lay.sweep || []).slice();
    const ch = lay.sweep_choice || {};
    const tb = '<table class="laytable"><thead><tr><th>Layout</th><th>Trustworthiness</th><th>Continuity</th><th>k-NN preservation (k = 10)</th></tr></thead><tbody>' +
      rows.map(r => '<tr' + (r.name === ch.name ? ' class="chosen"' : '') + '><td>' + esc(r.name) + (r.name === ch.name ? ' · default' : '') + '</td><td>' +
        r.trustworthiness.toFixed(2) + '</td><td>' + r.continuity.toFixed(2) + '</td><td>' + r.knn_preservation.toFixed(2) + '</td></tr>').join('') +
      '</tbody></table>';
    const three = ['fusion', 'photo', 'title'].filter(k => lay[k] && lay[k].metrics).map(k =>
      '<li><b>' + {fusion: 'Photo + title', photo: 'Photo only', title: 'Title only'}[k] + '</b>: ' +
      `trustworthiness ${lay[k].metrics.trustworthiness.toFixed(2)}, continuity ${lay[k].metrics.continuity.toFixed(2)}, ` +
      `k-NN preservation ${lay[k].metrics.knn_preservation.toFixed(2)}` +
      (lay[k].pca_explained != null ? `; the 50 components carry ${Math.round(100 * lay[k].pca_explained)} % of the variance` : '') + '</li>').join('');
    const subs = (lay.subsets || []).length;
    $('#m-layout').innerHTML = (rows.length ? '<div class="tablewrap">' + tb + '</div>' + '<p class="scope">The sweep was run on the photo + title space — the map\'s default space — with ' +
        fmt(lay.eval_sample || 2000) + ' objects sampled for the metrics; t-SNE is the second nonlinear method because it is the standard reference and needs no dependency beyond scikit-learn. ' +
        'The other two spaces use the same chosen settings; their measured quality is below.</p>' : '') +
      (three ? '<ul class="layspaces">' + three + '</ul>' : '') +
      (subs ? '<p class="scope">' + fmt(subs) + ' sub-collection layouts are cached with the build; each carries its own metrics, shown with it on the map.</p>' : '');
    // T-042: what k-NN preservation means for a reader, in plain words, with the measured default.
    const kn = lay.fusion && lay.fusion.metrics ? lay.fusion.metrics.knn_preservation : null;
    const kk = (lay.fusion && lay.fusion.metrics && lay.fusion.metrics.k) || 10;
    if (kn != null && $('#m-neighbours')) {
      $('#m-neighbours').textContent = 'In plain words: the dots nearest an object on screen are not necessarily its ' +
        'nearest neighbours in the data. On the default layout, the ' + kk + ' dots nearest an object on the map hold ' +
        'on average only about ' + (kn * kk).toFixed(1) + ' of its ' + kk + ' nearest neighbours in the full space (' +
        Math.round(100 * kn) + ' in 100). Clicking an object opens its record, and the row "Similar across the whole ' +
        'collection" lists the real neighbours, not the dots that happen to sit beside it on the map.';
    }
  }
  const c = b.clusters || {};
  $('#m-clusters').textContent = (b.clusters && b.clusters.n ? fmt(b.clusters.n) + ' groups of at least 40 objects' : 'No groups') +
    (c.unclustered != null ? ', ' + fmt(c.unclustered) + ' objects between groups' : '') + '. Method: ' + esc(c.method || '') +
    '; parameters k = ' + (c.k ?? '') + ', minimum group size ' + (c.min_cluster_size ?? '') + ', seed ' + (c.seed ?? '') +
    '; the random seed is fixed, so the same vectors give the same groups. ' +
    (c.naming ? 'How a group is named, so that a name is not a finding its members do not support: ' + esc(c.naming.rule) +
      '. In this build ' + fmt(c.naming.pass) + ' of ' + fmt(c.naming.groups) + ' groups are named for a family that at least 30 % of their members share; ' +
      'the other ' + fmt(c.naming.groups - c.naming.pass) + ' say they are mixed groups, list their most common families, or are "Mixed group of N objects".'
      : 'A group is named by the device family its members most often carry in the codebook.');
  if (b.landing && b.landing.groups && $('#m-landing')) {
    const names = b.landing.groups.map(g => esc(g.name) + ' (' + fmt(g.n) + ' objects, ' + g.n_museums + ' museums)').join(', ');
    $('#m-landing').textContent = 'The "groups that cross museums" band on the landing page follows this rule: ' + b.landing.rule +
      '. In this build it shows ' + b.landing.groups.length + (b.landing.groups.length === 1 ? ' group: ' : ' groups: ') + names +
      '. The date rule was applied to catalogue records only, and only to broken dates (T-042); the curated releases and the Met keep their own checked ancient dates, written with their era (7000 BCE to 2000 CE).';
  }
} catch { $('#m-map').textContent = 'The map draws the frozen SigLIP 2 space of every object with a photograph.'; }
