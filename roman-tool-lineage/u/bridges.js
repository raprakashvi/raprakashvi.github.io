// Bridges: mutual nearest pairs across the two domains (shared photograph+title space), and the science
// cross-museum bridges (agreeing signals).  Both are proposals to look at, not established relations.
import {boot, loadJSON, $, $$, esc, fmt, mus, thumb, cmpUrl, fromMini, dateLabel, getDomain, domainKey, scopeNote, errorBox} from './core.js';

await boot();
let B;
try { B = await loadJSON('bridges.json'); } catch (e) { errorBox($('#cross'), e); throw e; }
const R = id => fromMini(id, B.mini[id]);
const CHIP = {principle: 'same principle', name: 'same name', title_word: 'shared title word', image: 'looks alike', text: 'similar description'};
const one = r => '<div class="ph" style="--c:' + mus(r.m).color + '"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"><i class="dm ' + domainKey(r.d) + '"></i></div>';
const cap = r => '<div><b>' + esc(r.t) + '</b><span>' + esc(mus(r.m).short) + (dateLabel(r.s, r.e) ? ' · ' + esc(dateLabel(r.s, r.e)) : '') + '</span></div>';
const pair = (b, chips, key) => { const A = R(b.a), C = R(b.b); return '<a class="pair"' + (key ? ' data-k="' + key + '"' : '') + ' href="' + cmpUrl(b.a, b.b) + '"><div class="two">' + one(A) + one(C) + '</div><div class="caps">' + cap(A) + cap(C) + '</div>' + (chips || '') + '<span class="go">Compare</span></a>'; };
$('#bx-lede').textContent = 'Each surgical instrument here is the closest object to its science partner, and the other way round. ' + fmt(B.n_cross_mutual) + ' such pairs; the ' + B.cross.length + ' closest are shown.';
$('#cross').innerHTML = B.cross.map(b => pair(b)).join('');
const key = b => { const m = [R(b.a).m, R(b.b).m].sort((x, y) => x - y); return m[0] + '-' + m[1]; };
const cnt = {}; B.sci.forEach(b => { const k = key(b); cnt[k] = (cnt[k] || 0) + 1; });
const name = k => k.split('-').map(i => mus(+i).short).join(' and ');
$('#pair').innerHTML = '<option value="">All museum pairs (' + B.sci.length + ')</option>' + Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).map(k => '<option value="' + k + '">' + name(k) + ' (' + cnt[k] + ')</option>').join('');
$('#pairs').innerHTML = B.sci.slice().sort((x, y) => (y.n - x.n) || (x.r - y.r)).map(b => pair(b, b.g.length ? '<span class="chips2">' + b.g.map(k => '<em>' + CHIP[k] + '</em>').join('') + '</span>' : '', key(b))).join('');
function apply() {
  const v = $('#pair').value; let n = 0;
  $$('#pairs .pair').forEach(e => { const ok = !v || e.dataset.k === v; e.hidden = !ok; if (ok) n++; });
  $('#count').textContent = n + ' pairs';
  const d = getDomain();
  $$('section[data-dom=sci]').forEach(s => s.hidden = d === 'med');
  $('#scope').innerHTML = d === 'med' ? scopeNote('Bridges between museums are worked out for the science objects only; the pairs across the two releases include every surgical instrument with a photograph.') : '';
}
$('#pair').addEventListener('change', apply);
window.addEventListener('vestigium:domain', apply);
apply();
