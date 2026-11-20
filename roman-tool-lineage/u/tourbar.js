// The persistent next/previous bar of the tour (T-047).  It appears on every page, including the hosted atlas and
// workbench, once a stop has been opened in this browser tab, and goes away with "End tour".
import {STOPS, stopHref, getTour, setTour, clearTour} from './tourstops.js';

const q = new URLSearchParams(location.search);
const onTour = /(^|\/)tour\.html$/.test(location.pathname);
let n = Number(onTour ? (q.get('s') || 1) : q.get('tour')) || 0;
if (n >= 1 && n <= STOPS.length) setTour(n); else n = getTour();
if (n && !document.getElementById('tourbar')) {
  const s = STOPS[n - 1], prev = STOPS[n - 2], next = STOPS[n];
  const bar = document.createElement('nav');
  bar.className = 'tourbar'; bar.id = 'tourbar'; bar.setAttribute('aria-label', 'Tour');
  bar.innerHTML =
    '<a class="tb-route" href="route.html" title="Printable route sheet">Tour</a>' +
    '<ol class="tb-dots">' + STOPS.map(t => '<li><a href="' + stopHref(t.n) + '" data-stop="' + t.n + '"' + (t.n === n ? ' aria-current="step"' : '') +
      ' title="' + t.n + ' · ' + t.name + '">' + t.n + '</a></li>').join('') + '</ol>' +
    '<span class="tb-now"><b>Stop ' + n + ' of ' + STOPS.length + '</b> ' + s.name + '</span>' +
    (onTour ? '' : '<a class="tb-back" href="' + stopHref(n) + '">Back to stop ' + n + '</a>') +
    '<span class="tb-go">' +
    (prev ? '<a class="tb-prev" href="' + stopHref(prev.n) + '">‹ ' + prev.name + '</a>' : '<span class="tb-prev off">‹ Start</span>') +
    (next ? '<a class="tb-next" href="' + stopHref(next.n) + '">' + next.name + ' ›</a>' : '<a class="tb-next" href="route.html">Route sheet ›</a>') +
    '</span><button type="button" class="tb-end" aria-label="End tour">End tour</button>';
  document.body.appendChild(bar);
  document.body.classList.add('has-tourbar');
  bar.querySelector('.tb-end').onclick = () => { clearTour(); bar.remove(); document.body.classList.remove('has-tourbar'); };
}
