// Missing links: principle x role slots for the science objects; acquisition pairs per museum.
// Roles and principles exist only for science objects, which the page says when surgical instruments are selected.
import {boot, loadJSON, $, esc, mus, thumb, fromMini, getDomain, tile, legendMuseums, scopeNote, errorBox} from './core.js';

await boot();
let PAT;
try { PAT = await loadJSON('patterns.json'); } catch (e) { errorBox($('#gaps'), e); throw e; }
const P = PAT.sci, R = id => fromMini(id, PAT.mini[id]);
$('#legend').innerHTML = legendMuseums([0, 1, 2, 3, 4]);
function slot(g, s) {
  if (s.n) {
    const r = R(s.rep), m = mus(r.m);
    return '<a class="slot full" style="--c:' + m.color + '" href="principles.html?p=' + encodeURIComponent(g.k) + '" aria-label="' + esc(s.title + ': ' + s.n + ' objects') + '"><span class="ph"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span><b>' + s.n + '</b>' +
      '<span class="mu">' + s.m.map(i => '<i style="background:' + mus(i).color + '"></i>' + esc(mus(i).short)).join(' ') + '</span></a>';
  }
  return '<div class="slot gap ' + s.state + '" role="img" aria-label="' + esc(s.text) + '"><span class="frame"><span>' + (s.state === 'none' ? esc(s.text) : 'annotators disagree') + '</span></span></div>';
}
$('#gaps').innerHTML = P.gaps.map(g => '<div class="grow"><h3>' + esc(g.label) + '<span>' + g.n + ' objects</span></h3><div class="slots">' +
  g.slots.map(s => '<div class="cell"><h4>' + esc(s.title) + '</h4>' + slot(g, s) + '</div>').join('') + '</div></div>').join('');
$('#acq').innerHTML = P.acq.map(a => {
  const m = mus(a.m);
  return '<div class="amus" style="--c:' + m.color + '"><h3><i></i>' + esc(m.short) + '</h3><div class="pairs2">' + a.items.map(x =>
    '<div class="pr"><div class="two">' + (x.own ? tile(R(x.own)) : '<div class="nofill"></div>') + '<span class="swap" aria-hidden="true">↔</span>' + tile(R(x.donor)) + '</div>' +
    '<p>Holds the ' + esc(x.holds) + '; lacks its ' + x.rel + ', the ' + esc(x.lacks) + '.</p></div>').join('') + '</div></div>';
}).join('');
function apply() {
  const d = getDomain();
  $('#scope').innerHTML = d === 'sci' ? '' : scopeNote('Missing links are worked out from principles and roles, which the science and technology objects and the catalogues carry; surgical instruments are not part of this view.' + (d === 'med' ? ' See <a href="principles.html">their working functions</a>.' : ''));
}
window.addEventListener('vestigium:domain', apply);
apply();
