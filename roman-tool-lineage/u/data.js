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
  const rows = IX.museums.map((mu, i) => ({name: mu.name, n: mu.n}));
  const sum = k => rows.reduce((a, r) => a + (r.n[k] || 0), 0);
  const tr = (name, n, cls) => '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th scope="row">' + esc(name) + '</th>' +
    [0, 1, 2, null].map(k => '<td>' + fmt(k === null ? (n[0] || 0) + (n[1] || 0) + (n[2] || 0) : (n[k] || 0)) + '</td>').join('') + '</tr>';
  const head = '<thead><tr><th scope="col">Collection</th><th scope="col"><i class="dm surg"></i> Surgical instruments</th>' +
    '<th scope="col"><i class="dm sci"></i> Science and technology</th><th scope="col"><i class="dm uns"></i> Not placed</th><th scope="col">All</th></tr></thead>';
  const body = rows.filter(r => r.n.some(v => v)).map(r => tr(r.name, r.n)).join('') +
    tr('Total in the collection', [sum(0), sum(1), sum(2)], 'tot');
  $('#counts').innerHTML = '<div class="tablewrap"><table class="ctable" id="counts-table"><caption>Every object in the collection, by museum and domain.</caption>' +
    head + '<tbody>' + body + '</tbody></table></div>' +
    '<p class="scope">' + (C.records ? fmt(C.records) + ' catalogue records were read from the three museums\' own catalogues. ' + fmt(C.duplicates) +
      ' were already in the collection (the same museum and inventory number) and are not shown twice; ' + fmt(C.kept) +
      ' were added. ' : '') + 'A record the domain rule cannot place is kept under <em>Not placed</em> and is never dropped: ' +
    fmt(sum(2)) + ' such records here. The rule: ' + esc(C.rule || '') + '.</p>';
} catch (e) { $('#counts').innerHTML = '<p class="scope" role="alert">The counts could not be loaded: ' + esc(e.message) + '</p>'; }
