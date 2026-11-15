// For the two hosted research applications (atlas.html, analyse.html): domain filter in the header, the current
// menu item, and one line inside each view saying which objects it covers.  These views keep their behaviour.
import {initDomain, getDomain} from './domain.js';

const page = location.pathname.split('/').pop() || 'atlas.html';
const NOTES = {
  map: ['tree', 'The family tree links surgical instruments only.', 'Science objects follow their own lines on <a href="lineages.html">Lineages</a>.'],
  world: ['world', 'World and time maps place surgical records by catalogue city; science objects have no map places yet.', 'See science objects through time on the <a href="timeline.html">Timeline</a>.'],
  morph: ['morph', 'Outline morphology exists for the surgical shape set; science objects have photographs but no outline measurements.', 'Compare their forms on the <a href="map.html">Map of forms</a>.'],
  compare: ['compare', 'These dossiers compare family-tree records. To compare any two objects, from either domain, use <a href="compare.html">Compare</a>.', ''],
  research: ['research', 'The research audit checks the surgical family-tree links.', ''],
  method: ['method', 'Research methods of the surgical study.', 'The method of the whole collection is on <a href="method.html">Method</a>.'],
  analysis: ['analysis', 'Outline measurements exist for the surgical shape set; science objects are not measured.', 'Compare their forms on the <a href="map.html">Map of forms</a>.'],
  ai: ['ai', 'AI methods were run on the surgical release; science objects are not part of these runs.', 'Science objects share the photograph and name space of the <a href="map.html">Map of forms</a>.'],
  review: ['review', 'Annotation tasks cover surgical records.', ''],
  about: ['data', 'Dataset notes for the surgical release.', 'Both releases are on <a href="data.html">Data and sources</a>.'],
};
const EVIDENCE = ['boundaries', 'weiss', 'museum', 'study', 'catalog', 'events', 'sources'];

function view() { return (location.hash.slice(1) || (page.startsWith('atlas') ? 'map' : 'ai')).split('/')[0]; }
function note() {
  const v = view(), n = NOTES[v] || (EVIDENCE.includes(v) ? ['data', 'Evidence of the surgical study.', ''] : null);
  let el = document.getElementById('scope-note');
  if (!el) {
    el = document.createElement('p'); el.id = 'scope-note'; el.className = 'scope host-scope';
    const main = document.getElementById('main'); if (!main) return;
    main.parentNode.insertBefore(el, main);
  }
  if (!n) { el.hidden = true; return; }
  const sci = getDomain() === 'sci';
  el.className = 'scope host-scope' + (sci ? ' sci' : '');
  el.innerHTML = n[1] + (sci && n[2] ? ' ' + n[2] : '');
  el.hidden = false;
  document.querySelectorAll('header.vh [data-nav]').forEach(a => { if (a.dataset.nav === n[0] && (a.getAttribute('href').split('#')[0] === page || n[0] === 'data')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.querySelectorAll('header.vh .vh-menu').forEach(d => d.toggleAttribute('data-current', !!d.querySelector('[aria-current]')));
}
initDomain();
note();
window.addEventListener('hashchange', note);
window.addEventListener('vestigium:domain', note);
