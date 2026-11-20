// The persistent next/previous bar of the tour (T-047).  It appears on every page, including the hosted atlas and
// workbench, once a stop has been opened in this browser tab, and goes away with "End tour".
// T-048: the same bar serves the AI route (aitour.html, five stops); the route last opened in this tab wins.
import {STOPS, AI_STOPS, stopHref, getTour, setTour, getAiTour, setAiTour, getRoute, clearTour} from './tourstops.js';

const q = new URLSearchParams(location.search);
const onTour = /(^|\/)tour\.html$/.test(location.pathname), onAi = /(^|\/)aitour\.html$/.test(location.pathname);
let route = onAi ? 'ai' : onTour ? 'main' : getRoute(), n = 0;
const LIST = route === 'ai' ? AI_STOPS : STOPS;
if (route === 'ai') { n = Number(onAi ? (q.get('s') || 1) : 0) || 0; if (n >= 1 && n <= LIST.length) setAiTour(n); else n = getAiTour(); }
else { n = Number(onTour ? (q.get('s') || 1) : q.get('tour')) || 0; if (n >= 1 && n <= LIST.length) setTour(n); else n = getTour(); }
if (n && !document.getElementById('tourbar')) {
  const s = LIST[n - 1], prev = LIST[n - 2], next = LIST[n], here = onTour || onAi, href = k => stopHref(k, route);
  const bar = document.createElement('nav');
  bar.className = 'tourbar'; bar.id = 'tourbar'; bar.setAttribute('aria-label', route === 'ai' ? 'AI tour' : 'Tour');
  bar.innerHTML =
    '<a class="tb-route" href="route.html" title="Printable route sheet">' + (route === 'ai' ? 'AI tour' : 'Tour') + '</a>' +
    '<ol class="tb-dots">' + LIST.map(t => '<li><a href="' + href(t.n) + '" data-stop="' + t.n + '"' + (t.n === n ? ' aria-current="step"' : '') +
      ' title="' + t.n + ' · ' + t.name + '">' + t.n + '</a></li>').join('') + '</ol>' +
    '<span class="tb-now"><b>Stop ' + n + ' of ' + LIST.length + '</b> ' + s.name + '</span>' +
    (here ? '' : '<a class="tb-back" href="' + href(n) + '">Back to stop ' + n + '</a>') +
    '<span class="tb-go">' +
    (prev ? '<a class="tb-prev" href="' + href(prev.n) + '">‹ ' + prev.name + '</a>' : '<span class="tb-prev off">‹ Start</span>') +
    (next ? '<a class="tb-next" href="' + href(next.n) + '">' + next.name + ' ›</a>' : '<a class="tb-next" href="' + (route === 'ai' ? 'analyse.html#ai' : 'route.html') + '">' + (route === 'ai' ? 'Results ›' : 'Route sheet ›') + '</a>') +
    '</span><button type="button" class="tb-end" aria-label="End tour">End tour</button>';
  document.body.appendChild(bar);
  document.body.classList.add('has-tourbar');
  bar.querySelector('.tb-end').onclick = () => { clearTour(); bar.remove(); document.body.classList.remove('has-tourbar'); };
}
