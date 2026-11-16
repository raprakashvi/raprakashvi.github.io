// Method: the four-step flow, the domain rule and a picture of which objects each view covers.
import {boot, loadJSON, $, esc, fmt} from './core.js';

const m = await boot();
$('#m-surg').textContent = fmt(m.counts.surg) + ' records';
$('#m-sci').textContent = fmt(m.counts.sci) + ' records';
$('#m-surg-src').textContent = m.museums.filter(x => x.n[0]).length + ' collections';
if (m.catalogue) {
  $('#m-cat').textContent = fmt(m.catalogue.records) + ' records';
  $('#m-rule').textContent = 'In this build: ' + fmt(m.catalogue.records) + ' catalogue records, ' + fmt(m.catalogue.duplicates) +
    ' already in the collection, ' + fmt(m.catalogue.kept) + ' added. Placed surgical: ' + fmt(m.catalogue.by_domain['0'] || 0) +
    '; science: ' + fmt(m.catalogue.by_domain['1'] || 0) + '; not placed: ' + fmt(m.catalogue.by_domain['2'] || 0) + '.';
}
// [view, href, surgical coverage, science coverage, what it uses] ; 2 = all objects, 1 = in part, 0 = not in this view
const V = [
  ['Collection', 'collection.html', 2, 2, 'every record, including the three catalogues'],
  ['Map of forms, Map in time', 'map.html', 2, 2, 'every object with a photograph'],
  ['Timeline', 'timeline.html', 2, 2, 'every dated object'],
  ['Compare', 'compare.html', 2, 2, 'any two objects'],
  ['Life of a principle', 'principles.html', 1, 2, 'science: principle and role; surgical: working function'],
  ['Lineages', 'lineages.html', 1, 2, 'science: device chains and makers; surgical: family-tree branches'],
  ['Bridges', 'bridges.html', 1, 2, 'pairs across domains; museum pairs for science'],
  ['Missing links', 'gaps.html', 0, 2, 'principles and roles'],
  ['Family tree', 'atlas.html#map', 2, 0, 'documented comparisons between surgical records'],
  ['World and time', 'atlas.html#world', 1, 0, 'catalogue cities of surgical records'],
  ['Morphology, outline measurements', 'atlas.html#morph', 1, 0, 'the surgical shape set'],
  ['AI methods', 'analyse.html#ai', 2, 0, 'runs on the surgical release'],
  ['Annotate, research audit', 'analyse.html#review', 1, 0, 'surgical tasks and links'],
];
const dot = (v, dom) => '<span class="cv ' + dom + ' v' + v + '" title="' + ['not in this view', 'in part', 'all'][v] + '"><span class="sr-only">' + ['not in this view', 'in part', 'all'][v] + '</span></span>';
$('#cover').innerHTML = '<div class="cvhead"><span></span><span><i class="dm surg"></i>Surgical</span><span><i class="dm sci"></i>Science</span><span></span></div>' +
  V.map(v => '<a class="cvrow" href="' + v[1] + '"><b>' + esc(v[0]) + '</b>' + dot(v[2], 'surg') + dot(v[3], 'sci') + '<span class="cvwhy">' + esc(v[4]) + '</span></a>').join('') +
  '<p class="cvkey"><span class="cv surg v2"></span> all <span class="cv surg v1"></span> in part <span class="cv surg v0"></span> not in this view</p>';
try {
  const b = await loadJSON('build.json');
  const e = b.embedding;
  $('#flow').insertAdjacentHTML('afterend', '<p class="flownote">Shared space: ' + fmt(e.n) + ' objects with a photograph, ' + esc(e.map) + '. ' + fmt(e.cross_domain_mutual_pairs) + ' surgical instruments and science objects are each other’s closest match.</p>');
} catch { /* the figure stands without the numbers */ }
