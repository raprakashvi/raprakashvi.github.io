// Data and sources: download links resolve to the current versions.
import {boot, $} from './core.js';

const m = await boot();
$('#dl-index').href = 'data/unified/' + m.version + '/index.json';
try {
  const s = await (await fetch('data/current.json', {cache: 'no-store'})).json();
  $('#dl-surg').href = 'data/' + s.version + '/dataset.zip';
  $('#dl-surg-v').textContent = 'Release ' + s.version + ': records, schema, identifiers (ZIP)';
  $('#dl-cov').href = 'data/' + s.version + '/coverage.json';
} catch { /* links stay on this page */ }
