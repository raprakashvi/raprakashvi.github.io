// Groups by closeness (T-036).  Each group found in the map's space gets its own section: photographs, the museums
// it spans, the centuries it covers, and one plain line from its members' most common device family.
import {boot, loadJSON, $, esc, fmt, mus, thumb, objUrl, fromMini, legendMuseums, errorBox} from './core.js';

await boot();
let C;
try { C = await loadJSON('clusters.json'); } catch (e) { errorBox($('#clist'), e); throw e; }
const P = C.params, R = id => fromMini(id, C.mini[id]);
const yrs = c => c.from == null ? 'undated' : (c.from === c.to ? String(c.from) : c.from + ' to ' + c.to);
const cross = C.clusters.filter(c => c.n_museums >= 2 && c.n >= 40);
const rest = C.clusters.filter(c => !(c.n_museums >= 2 && c.n >= 40));
$('#csum').innerHTML = '<p class="clsum"><b>' + fmt(C.clusters.length) + '</b> groups of 40 objects or more; <b>' + fmt(cross.length) +
  '</b> of them cross a museum. ' + fmt(P.unclustered) + ' objects (' + Math.round(100 * P.unclustered / P.n) + ' %) sit between groups and are not assigned to one. ' +
  'Sizes run from ' + fmt(P.min_cluster_size) + ' to ' + fmt(Math.max(...C.clusters.map(c => c.n))) + ' objects.</p>' +
  '<p class="clmethod">' + esc(P.method) + ', parameters: k = ' + P.k + ', minimum group size ' + P.min_cluster_size + ', seed ' + P.seed + '. ' +
  'The same groups are outlined on the <a href="map.html">map</a>.</p>';

let h = '';
for (const c of cross) {
  const pics = c.photos.filter(id => R(id));
  h += '<section class="cl" id="c' + c.id + '">' +
    '<header><h2>' + esc(c.name || 'Objects') + '</h2><p>' + esc(C_line(c)) + '</p>' +
    '<a class="more" href="map.html">Show on the map</a></header>' +
    legendMuseums([...new Set(pics.map(id => R(id).m))]) +
    '<div class="strip">' + pics.map(id => { const r = R(id); const m = mus(r.m); return '<div><a class="tile" style="--c:' + m.color + '" href="' + objUrl(id) + '"><div class="ph"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></div><b>' + esc(r.t) + '</b><span>' + esc(m.short) + '</span></a></div>'; }).join('') + '</div></section>';
}
if (rest.length) h += '<section class="cl rest"><h2>Groups within one museum</h2><p class="clmethod">These groups stay inside a single collection; the page above shows the ones that cross museums. They are outlined on the map too.</p><ul class="cll">' + rest.slice(0, 120).map(c => '<li><b>' + esc(c.name || 'Objects') + '</b> <span>' + fmt(c.n) + ' objects, ' + c.n_museums + (c.n_museums === 1 ? ' museum' : ' museums') + ', ' + esc(yrs(c)) + '</span></li>').join('') + '</ul></section>';
$('#clist').innerHTML = h;

function C_line(c) {
  const ms = c.museums.map(i => mus(i).short);
  const joiner = ms.length > 1 ? ms.slice(0, -1).join(', ') + ' and ' + ms[ms.length - 1] : ms[0] || '';
  return fmt(c.n) + ' objects from ' + joiner + ', ' + yrs(c) + '. ' + c.n_museums + (c.n_museums === 1 ? ' museum' : ' museums') + '.';
}
