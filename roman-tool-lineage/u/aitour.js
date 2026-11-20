// The AI tour (T-048): five stops, about ten minutes, opened as aitour.html?s=1 .. 5.  Same pattern as the main tour:
// a flowchart header, one lead picture per stop, a button to the next stop, details folded.  Every number is drawn by
// ../ai-results.js from ai_results.json (itself copied from existing tables); nothing is computed or fetched here.
import {boot, $, esc} from './core.js';
import {AI_STOPS, stopHref, setAiTour} from './tourstops.js';
import {loadResults, compactHtml, examples, failHtml, thumb} from '../ai-results.js';

const main = $('#tour');
const N = Math.min(AI_STOPS.length, Math.max(1, Number(new URLSearchParams(location.search).get('s')) || 1));
const S = AI_STOPS[N - 1];
setAiTour(N);
document.title = 'AI stop ' + N + ' · ' + S.name + ' · Vestigium';
try {
  await boot();
  const d = await loadResults();
  const by = k => d.methods.find(m => m.key === k);
  const btn = (h, t, fill) => '<a class="btn' + (fill ? ' fill' : '') + '" href="' + h + '">' + t + '</a>';
  const fold = (summary, html) => '<details class="tfold"><summary>' + esc(summary) + '</summary>' + html + '</details>';
  const flow = '<ol class="tflow n5" aria-label="The five AI stops">' + AI_STOPS.map(t => '<li' + (t.n === N ? ' class="cur"' : t.n < N ? ' class="done"' : '') + '><a href="' + stopHref(t.n, 'ai') + '"' + (t.n === N ? ' aria-current="step"' : '') + '><span class="tfn">' + t.n + '</span><span class="tfl">' + esc(t.name) + '</span><span class="tfm">' + t.min + ' min</span></a></li>').join('') + '</ol>';
  const next = AI_STOPS[N];
  const badge = m => '<span class="air-badge ' + m.worked + '">' + ({yes: '✓ Worked', partly: '~ Partly', modest: '~ Modest'}[m.worked]) + '</span>';
  let body = '', fine = '';

  if (N === 1) {
    const q = d.methods[0].examples.items[1], one = d.mini[q.q];
    const pic = one ? '<a class="air-pic" href="object.html?id=' + encodeURIComponent(q.q) + '"><img src="' + esc(thumb(one[1])) + '" alt="' + esc(one[0]) + '"><span>' + esc(one[2]) + '</span></a>' : '';
    body = '<h2 class="tq">Models see a photograph, an outline and catalogue words. We asked five things of them.</h2>' +
      '<div class="tfig"><div class="aflow"><div class="ain"><b>One object</b>' + pic + '<span class="abox">Photograph</span><span class="abox">Outline</span><span class="abox">Catalogue words</span></div>' +
      '<span class="tar big" aria-hidden="true">→</span><div class="aq">' + d.methods.map(m => '<div class="aqi">' + badge(m) + '<b>' + esc(m.label) + '</b><span>' + esc(m.line) + '</span></div>').join('') + '</div></div></div>' +
      fold('How the questions were measured', '<p>Each question has a plain baseline (random choice, a hand-made outline distance, or always saying no) and a 95 % interval where a sample was drawn. No model was trained for this page; every number is copied from a table named on the results page.</p>');
  }
  if (N === 2) {
    body = '<h2 class="tq">Look-alike search and plain-word search clearly beat their baselines. The other three are weaker or unverified.</h2>' +
      '<div class="air-score">' + d.methods.map(compactHtml).join('') + '</div>' +
      fold('How to read the dot chart', '<p>The dark dot is the result and the line through it its 95 % interval. Open circles are what it is compared with. Everything is on a 0 to 100 % scale.</p>');
  }
  if (N === 3) {
    body = '<h2 class="tq">Real predictions, drawn by a fixed rule, with the wrong ones shown.</h2>' +
      d.methods.map(m => '<section class="air-tex"><h3>' + esc(m.label) + '</h3>' + examples(m, d) + '</section>').join('');
  }
  if (N === 4) {
    body = '<h2 class="tq">Several ideas did not beat a simple baseline, and the function view often declines to answer.</h2>' +
      '<div class="air-fail air-fail-tour">' + failHtml(d) + '</div>';
  }
  if (N === 5) {
    const asb = by('asbestos'), grp = by('groups');
    body = '<h2 class="tq">Candidates to check, never verdicts.</h2>' +
      '<div class="t3"><a class="tcard" href="clusters.html"><h3>Links across museums</h3><p>Groups found from look alone, then counted by museum: ' + esc(grp.headline.spread) + '. Median purity ' + (100 * grp.headline.value).toFixed(1) + ' %.</p><span class="tgo">Open every group →</span></a>' +
      '<a class="tcard" href="analyse.html#ai"><h3>What to sample first</h3><p>A ranked list of Boerhaave objects never tested for asbestos, from the catalogue words. A sampling order, not a verdict: the model flags few containing objects (see stop 4).</p><span class="tgo">Open the asbestos view →</span></a>' +
      '<a class="tcard" href="analyse.html#ai"><h3>Where image and catalogue disagree</h3><p>Records whose photograph neighbours contradict the catalogue point to wrong mappings or to mechanism shared across functions. Each needs a curator.</p><span class="tgo">Open the results →</span></a></div>' +
      '<div class="tcontact"><h3 class="tsm">Contact for this walkthrough</h3><p class="tcontact-who"><b>Ravi Prakash</b> <span>Postdoctoral Fellow, Johns Hopkins University</span> <a href="mailto:ravi.prakash@jhu.edu">ravi.prakash@jhu.edu</a> · <a href="https://raprakashvi.github.io">raprakashvi.github.io</a></p></div>' +
      fold('What a museum can ask of this', '<p>Is an object of ours close to one elsewhere, and do we agree? Which of our objects should be sampled for asbestos first? Which catalogue entries does the photograph contradict? Every view links back to the record.</p>');
    fine = btn('tour.html?s=6', 'Back to the main tour, stop 6');
  }
  const onward = next ? btn(stopHref(next.n, 'ai'), 'Next stop: ' + esc(next.name) + ' →', true) : btn('analyse.html#ai', 'Open the results page →', true);
  main.innerHTML = flow +
    '<header class="thead"><p class="tkick">AI tour · stop ' + N + ' of ' + AI_STOPS.length + ' · about ' + S.min + ' minute' + (S.min > 1 ? 's' : '') + '</p><h1>' + esc(S.title) + '</h1><p class="tshow">' + esc(S.show) + '</p></header>' +
    '<section class="tbody air" data-stop="' + N + '">' + body + '</section>' +
    '<p class="air-blanket">' + esc(d.blanket) + '</p>' +
    '<div class="act tact">' + onward + (next ? btn(S.live, esc(S.liveLabel)) : '') + fine + '</div>';
  main.dataset.ready = String(N);
} catch (e) { main.innerHTML = '<div class="empty" role="alert"><h2>The AI tour could not load</h2><p>' + esc(e.message) + '</p></div>'; }
