// Lineages: surgical family-tree branches and science device chains, form-follows-time groups and maker series.
import {boot, loadJSON, $, $$, esc, fmt, mus, thumb, objUrl, cmpUrl, fromMini, dateLabel, getDomain, tile, scopeNote, errorBox} from './core.js';

await boot();
let PAT;
try { PAT = await loadJSON('patterns.json'); } catch (e) { errorBox($('#lin-t'), e); throw e; }
const P = PAT.sci, R = id => fromMini(id, PAT.mini[id]);
const dots = ms => '<span class="dots">' + ms.map(m => '<i style="background:' + mus(m).color + '" title="' + esc(mus(m).short) + '"></i>').join('') + '</span>';
function thumbA(id, yr) {
  const r = R(id); if (!r) return '';
  const m = mus(r.m);
  return '<a class="lthumb" style="--c:' + m.color + '" href="' + objUrl(id) + '" title="' + esc(r.t + ', ' + m.short) + '"><span class="ph"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span><em>' + esc(yr || dateLabel(r.s, r.e) || 'undated') + '</em></a>';
}
const arrowSvg = '<div class="arrow" aria-hidden="true"><svg viewBox="0 0 40 24" width="40" height="24"><path d="M2 12h32M26 4l10 8-10 8" fill="none" stroke="currentColor" stroke-width="2"/></svg></div>';
function chain(c) {
  const fams = c.fams.map(esc).join(' <i aria-hidden="true">→</i> ');
  const s = c.groups.map((g, i) => (i ? arrowSvg : '') + '<div class="fam"><h4>' + esc(g.f) + '<span>' + g.n + (g.n === 1 ? ' object' : ' objects') + '</span>' + dots(g.m) + '</h4><div class="thumbs">' + g.items.map(x => thumbA(x[0], x[1])).join('') + '</div></div>').join('');
  return '<article class="chain" id="chain-' + c.id + '"><header><h3>' + fams + '</h3><p>' + c.n + ' objects in ' + c.museums.length + ' museums, ' + c.span + ' years from first to last</p>' +
    '<a class="btn" href="' + cmpUrl(c.first, c.last) + '">Compare earliest and latest</a></header><div class="cstrip" tabindex="0" role="region" aria-label="' + esc(c.fams.join(' to ')) + '">' + s + '</div></article>';
}
const stripOf = (items, label) => '<div class="cstrip" tabindex="0" role="region" aria-label="' + esc(label) + ', photographs in date order"><div class="thumbs">' + items.map(x => thumbA(x[0], x[1])).join('') + '</div></div>';
const yl = y => y == null ? '?' : y < 0 ? (-y) + ' BCE' : y;
$('#lin-t').innerHTML = PAT.branches.map(b => {
  const ids = b.ids.filter(id => R(id));
  return '<article class="chain" id="branch-' + esc(b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) + '"><header><h3>' + esc(b.name) + '</h3><p>' + b.n + (b.n === 1 ? ' record' : ' records') + ', ' + yl(b.from) + ' to ' + yl(b.to) + '</p>' + dots(b.museums) +
    '<a class="btn" href="atlas.html#map">Open in the family tree</a>' + (ids.length > 1 ? '<a class="btn" href="' + cmpUrl(ids[0], ids[ids.length - 1]) + '">Compare earliest and latest</a>' : '') + '</header>' + stripOf(ids.map(id => [id, '']), b.name) + '</article>';
}).join('');
$('#lin-a').innerHTML = P.chains.filter(c => c.agree).map(chain).join('');
$('#lin-m').innerHTML = P.chains.filter(c => !c.agree).map(chain).join('');
const X = P.lin_form;
const musList = list => '<span class="mus">' + list.map(m => '<span><i style="background:' + mus(m[0]).color + '"></i>' + esc(mus(m[0]).short) + ' ' + m[1] + '</span>').join('') + '</span>';
$('#lf-lede').textContent = 'In ' + X.form.length + ' groups, objects closer in time also look more alike. Each strip runs from the oldest to the newest object; ρ is the rank correlation between date gap and visual distance.';
$('#lin-f').innerHTML = X.form.map(g => '<article class="chain" id="form-' + esc(g.k.replace(/[^a-z0-9]+/gi, '-').toLowerCase()) + '"><header><h3>' + esc(g.title) + '</h3><p>' + (g.orig ? esc(g.orig) + ' · ' : '') + esc(g.kind) + ' · ' + g.n + ' objects, ' + g.from + ' to ' + g.to +
  '</p><b class="rho" title="Spearman rho between date gap and visual distance">ρ = +' + g.rho.toFixed(2) + '</b></header><div class="museums">' + g.m.map(i => '<span><i style="background:' + mus(i).color + '"></i>' + esc(mus(i).short) + '</span>').join('') + '</div>' + stripOf(g.items, g.title) + '</article>').join('');
$('#ls-lede').textContent = 'Every maker with five or more objects, in date order. The border colour is the museum.';
$('#lin-s').innerHTML = X.series.map(s => '<article class="chain" id="series-' + esc(s.key.replace(/[^a-z0-9]+/gi, '-')) + '"><header><h3>' + esc(s.name) + '</h3><p>' + s.n + ' objects' + (s.dated < s.n ? ', ' + s.dated + ' dated' : '') + ', ' + s.from + ' to ' + s.to + '</p>' + musList(s.mus) +
  '<a class="btn" href="collection.html?mk=' + encodeURIComponent(s.name) + '">All objects</a></header>' + stripOf(s.items, s.name) + '</article>').join('');
$('#lp-lede').textContent = X.pairs.length + ' makers appear in two museums. Each pair shows their objects closest in date.';
$('#lin-p').innerHTML = X.pairs.map(p => '<article class="mpair"><h3>' + esc(p.name) + '</h3>' + musList(p.mus) + '<div class="two">' + tile(R(p.a)) + tile(R(p.b)) + '</div><a class="btn" href="' + cmpUrl(p.a, p.b) + '">Compare</a></article>').join('');

function apply() {
  const d = getDomain();
  $$('section[data-dom]').forEach(s => { s.hidden = (d === 'med' && s.dataset.dom === 'sci') || (d === 'sci' && s.dataset.dom === 'surg'); });
  $('#scope').innerHTML = d === 'med' ? scopeNote('Science lineages (device chains, makers) are hidden while only Medicine-tagged objects are shown.')
    : d === 'sci' ? scopeNote('Surgical family-tree branches are hidden while only science objects are shown.', 'sci') : '';
  $('#jump').innerHTML = $$('section[data-dom]').filter(s => !s.hidden).map(s => { const h = s.querySelector('h2'); return '<a href="#' + h.id + '">' + esc(h.textContent) + '</a>'; }).join('');
}
window.addEventListener('vestigium:domain', apply);
apply();
if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
