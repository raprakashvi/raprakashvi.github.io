// Data and sources: download links resolve to the current versions, and every record is counted in one table.
import {boot, loadIndex, $, esc, fmt, mus} from './core.js';

const m = await boot();
$('#dl-index').href = 'data/unified/' + m.version + '/index.json';
try {
  const s = await (await fetch('data/current.json', {cache: 'no-store'})).json();
  $('#dl-surg').href = 'data/' + s.version + '/dataset.zip';
  $('#dl-surg-v').textContent = 'Release ' + s.version + ': records, schema, identifiers (ZIP)';
  $('#dl-cov').href = 'data/' + s.version + '/coverage.json';
} catch { /* links stay on this page */ }
try {
  const IX = await loadIndex(), C = m.catalogue || {};
  const rows = IX.museums.map(mu => ({name: mu.name, n: mu.n}));
  const sum = k => rows.reduce((a, r) => a + (r.n[k] || 0), 0);
  const tr = (name, n, cls) => '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th scope="row">' + esc(name) + '</th>' +
    ['med', 'sci', 'both', 'none', 'all'].map(k => '<td>' + fmt(n[k] || 0) + '</td>').join('') + '</tr>';
  const head = '<thead><tr><th scope="col">Collection</th><th scope="col"><i class="dm med"></i> Medicine</th>' +
    '<th scope="col"><i class="dm sci"></i> Science and technology</th><th scope="col"><i class="dm both"></i> Both</th>' +
    '<th scope="col"><i class="dm none"></i> Neither</th><th scope="col">All</th></tr></thead>';
  const body = rows.filter(r => r.n.all).map(r => tr(r.name, r.n)).join('') +
    tr('Total in the collection', {med: sum('med'), sci: sum('sci'), both: sum('both'), none: sum('none'), all: sum('all')}, 'tot');
  $('#counts').innerHTML = '<div class="tablewrap"><table class="ctable" id="counts-table"><caption>Every object in the collection, by museum and tag. The tags overlap, so Medicine and Science count a record that carries both; Both and Neither are the overlap and the remainder.</caption>' +
    head + '<tbody>' + body + '</tbody></table></div>' +
    '<p class="scope">' + (C.records ? fmt(C.records) + ' catalogue records were read from the three museums\' own catalogues. ' + fmt(C.duplicates) +
      ' were already in the collection (the same museum and inventory number) and are not shown twice; ' + fmt(C.kept) +
      ' were added. ' : '') + 'A record may carry neither tag; it stays under <em>All</em> and is never dropped (' +
    fmt(sum('none')) + ' here). ' + (C.paper ? fmt(C.paper) + ' records are paper media; ' + fmt(C.paper_science_dropped) +
      ' of them carry a codebook principle that came from the medium, and paper media get no Science tag from such a label. ' : '') +
    (C.registration_cards ? fmt(C.registration_cards) + ' catalogue photographs are the museum\'s registration cards, not objects: they are not shown as photographs and have no map position. ' : '') +
    (m.other && m.other.kept ? fmt(m.other.kept) + ' records come from ' + fmt(m.other.museums) + ' further museums (Science Museum Group, the museums behind Europeana, the Rijksmuseum, museum-digital and the Met); this new material has not yet been reviewed by a curator. ' : '') +
    'The rule: ' + esc(C.rule || '') + '.</p>';
} catch (e) { $('#counts').innerHTML = '<p class="scope" role="alert">The counts could not be loaded: ' + esc(e.message) + '</p>'; }
