// Groups, four ways (T-044).  The same collection grouped by closeness (Look), by the record's own type, by shape
// only (Morphology) and by the codebook working function (Use).  Each group section shows its museums, one
// photograph per museum, the span of its dates and the closest cross-museum pairs with the family's similarity.
// Every group links to the map filtered to it; Type and Use also link to the collection filtered by their label.
import {boot, loadJSON, $, $$, esc, fmt, mus, thumb, objUrl, fromMini, legendMuseums, errorBox} from './core.js';

await boot();
let C;
try { C = await loadJSON('clusters.json'); } catch (e) { errorBox($('#clist'), e); throw e; }
const R = id => fromMini(id, C.mini[id]);
const FAMS = C.families || [], S = C.family_stats || {};
const yrs = c => {
  if (c.from == null) return 'undated';
  const y = v => v < 0 ? Math.abs(v) + ' BCE' : v + ' CE';
  if (c.from < 0 || (c.to != null && c.to < 0)) return y(c.from) + ' to ' + y(c.to == null ? c.from : c.to);
  return c.from === c.to ? String(c.from) : c.from + ' to ' + c.to;
};
const pct = x => Math.round(100 * x) + ' %';
const objTile = (id, cls = '') => {
  const r = R(id);
  if (!r) return '';
  return '<a class="ptile ' + cls + '" href="' + objUrl(id) + '"><span class="ph"><img loading="lazy" decoding="async" src="' +
    esc(thumb(r.im)) + '" alt="' + esc(r.t) + '" style="--c:' + mus(r.m).color + '"></span><b>' + esc(r.t) +
    '</b><span>' + esc(mus(r.m).short) + '</span></a>';
};

$('#csum').innerHTML = '<p class="clsum"><b>' + fmt(FAMS.length) + '</b> ways of grouping the one collection: ' +
  FAMS.map(f => '<b>' + fmt(f.groups.length) + '</b> ' + esc(f.label) + ' groups').join(', ') +
  '. No museum is an input to any grouping; museum is counted afterwards, and only the groups that cross museums are shown here. ' +
  'A group is named for a device family only when at least 30 % of its members carry it; otherwise the name says it is mixed, exactly as on the rest of the site.</p>' +
  '<p class="clmethod">Look: ' + esc(FAMS[0]?.definition || '') + '. Type: ' + esc(FAMS[1]?.definition || '') +
  '. Morphology: ' + esc(FAMS[2]?.definition || '') + '. Use: ' + esc(FAMS[3]?.definition || '') + '.</p>';

$('#cltabs').innerHTML = FAMS.map((f, i) => '<button class="cltab" role="tab" data-fam="' + f.key + '" aria-selected="' + (i === 0) +
  '" aria-controls="clist">' + esc(f.label) + '</button>').join('');

let h = '';
for (const f of FAMS) {
  const st = S[f.key] || {};
  const cross = f.groups.slice().sort((a, b) => (b.n_museums - a.n_museums) || (b.n - a.n) || a.name.localeCompare(b.name));
  const rest = (f.smaller || []).slice().sort((a, b) => (b.n_museums - a.n_museums) || (b.n - a.n) || a.name.localeCompare(b.name));
  h += '<section class="fam" data-family="' + f.key + '" hidden>' +
    '<h2 class="famh">' + esc(f.label) + '</h2>' +
    '<p class="clmethod">' + esc(f.definition) + '. In this build: <b>' + fmt(st.groups) + '</b> groups, <b>' +
    fmt(st.cross_museum_groups) + '</b> of them crossing a museum, covering <b>' + fmt(st.objects_covered) + '</b> objects (' +
    pct(st.share_of_collection) + ' of the collection). Median group size ' + fmt(st.size_median) + '; median museums per group ' +
    st.museums_median + '. Similarity on this tab: <b>' + esc(f.metric) + '</b>.</p>';
  for (const g of cross) {
    if (!g.photos.length) continue;
    const pics = g.photos.filter(id => R(id));
    const extra = g.family === 'type' ? '<a class="more" href="collection.html?ty=' + encodeURIComponent(g.name) + '">In the collection</a>'
      : g.family === 'use' ? '<a class="more" href="collection.html?fn=' + encodeURIComponent(g.families?.[0]?.[0] || g.name.toLowerCase()) + '">In the collection</a>' : '';
    h += '<section class="cl" data-family="' + f.key + '" id="' + g.anchor + '">' +
      '<header><h2>' + esc(g.name) + '</h2><p>' + esc(g.line) + '</p>' +
      '<a class="more" href="map.html?g=' + encodeURIComponent(g.gkey) + '">Show on the map</a>' + extra + '</header>' +
      '<p class="clspan"><b>' + fmt(g.n) + '</b> objects · <b>' + g.n_museums + '</b> museums · ' + esc(yrs(g)) +
      ' · purity ' + g.purity.toFixed(2) + ' against ' + esc(g.purity_kind) +
      (g.cross_purity && g.cross_purity.label ? ' · most common ' + esc(g.cross_purity.kind) + ': ' + esc(g.cross_purity.label) +
        ' ' + g.cross_purity.share.toFixed(2) : '') +
      (g.principle ? ' · principle ' + esc(g.principle) : '') + '</p>' +
      legendMuseums([...new Set(pics.map(id => R(id).m))]) +
      '<div class="strip">' + pics.map(id => objTile(id)).join('') + '</div>' +
      (g.pairs.length ? '<div class="clpairs"><h3>Closest pairs across museums</h3><p class="clmethod">' + esc(g.metric) +
        '; a higher value is closer' + (g.family === 'morphology' ? ' (1 = the same outline, 0.37 = the collection\'s median shape distance)' : '') + '.</p><div class="pairsgrid">' +
        g.pairs.map(p => '<div class="pair">' + objTile(p[0]) + objTile(p[1]) + '<b class="sim">' + p[2].toFixed(3) + '</b></div>').join('') +
        '</div></div>' : '') + '</section>';
  }
  if (rest.length) h += '<section class="cl rest"><h2>Smaller groups and groups within one museum</h2><p class="clmethod">Every ' + esc(f.label) +
    ' group with fewer than 40 objects or with objects from one museum is listed here with its counts; the full sections above are the groups of 40 or more that cross museums. Nothing is dropped.</p><ul class="cll">' +
    rest.slice(0, 400).map(g => '<li><a href="map.html?g=' + encodeURIComponent(g.gkey) + '"><b>' + esc(g.name) + '</b></a> <span>' + fmt(g.n) + ' objects, ' + g.n_museums + (g.n_museums === 1 ? ' museum' : ' museums') + ', ' + esc(yrs(g)) + '</span></li>').join('') +
    '</ul></section>';
  h += '</section>';
}
$('#clist').innerHTML = h;

function activate(key, anchor, scroll) {
  const fam = FAMS.find(f => f.key === key) ? key : (FAMS[0] && FAMS[0].key);
  $$('.fam').forEach(s => { s.hidden = s.dataset.family !== fam; });
  $$('#cltabs .cltab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.fam === fam)));
  if (anchor && scroll) {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({block: 'start'});
  }
}
function fromHash(scroll = true) {
  const hash = decodeURIComponent(location.hash.slice(1));
  const fam = FAMS.find(f => f.groups.some(g => g.anchor === hash));
  activate(fam ? fam.key : (FAMS[0] && FAMS[0].key), hash, scroll);
}
$('#cltabs').addEventListener('click', e => {
  const b = e.target.closest('.cltab');
  if (b) { history.replaceState(null, '', location.pathname + location.search); activate(b.dataset.fam, '', false); }
});
window.addEventListener('hashchange', () => fromHash(true));
fromHash(false);
