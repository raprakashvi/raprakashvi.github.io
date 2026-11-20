// Printable one-page route sheet (T-047): six stops, minutes, what to show, what to say, and the fixed link of each.
// Printing hides the site chrome (see @media print in site.css).
import {boot, $, esc} from './core.js';
import {STOPS, stopHref} from './tourstops.js';

await boot();
const abs = p => new URL(p, location.href).href;
const total = STOPS.reduce((a, s) => a + s.min, 0);
let t = 0;
$('#route').innerHTML =
  '<header class="rhead"><h1>Vestigium: a 30-minute route</h1><p>Six stops, in order. Each link opens that stop directly; the bar at the bottom of every page goes to the previous or next one.</p></header>' +
  '<ol class="rlist">' + STOPS.map(s => { const at = t; t += s.min;
    return '<li><span class="rn">' + s.n + '</span><div class="rb"><h2>' + esc(s.name) + ' <small>' + at + '–' + t + ' min</small></h2>' +
      '<p><b>Show.</b> ' + esc(s.show) + '</p><p><b>Say.</b> ' + esc(s.say) + '</p>' +
      '<p class="rl"><a href="' + stopHref(s.n) + '">' + esc(abs(stopHref(s.n))) + '</a><a class="rlive" href="' + s.live + '">full view: ' + esc(s.liveLabel) + '</a></p></div></li>'; }).join('') + '</ol>' +
  '<p class="rtotal">' + total + ' minutes in all. Sign-in is required on first visit; open the first link once before the walkthrough so the gate is already passed.</p>' +
  '<div class="rcontact"><b>Contact for this walkthrough</b> <span>Ravi Prakash, Postdoctoral Fellow, Johns Hopkins University · ravi.prakash@jhu.edu · raprakashvi.github.io</span></div>' +
  '<p class="ract"><button class="btn fill" type="button" onclick="window.print()">Print this sheet</button> <a class="btn" href="tour.html?s=1">Start the tour</a></p>';
