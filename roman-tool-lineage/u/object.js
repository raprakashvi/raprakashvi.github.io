// One object page for both domains: photograph first, title, museum, date, then facts, then rows (similar objects
// across the whole collection, lineage, principle or function); domain sections only where the record has them.
import {boot, loadObject, $, $$, esc, mus, dateLabel, large, thumb, fromMini, strip, objUrl, cmpUrl, domainKey, domainLabel, params, errorBox} from './core.js';

const root = $('#obj'), id = params().id;
try {
  await boot();
  if (!id) throw Error('No object was named in the address.');
  const o = await loadObject(id);
  render(o);
} catch (e) {
  root.innerHTML = '<div class="pagehead"><h1>Object not found</h1><p>' + esc(e.message) + '</p></div><p><a class="btn" href="collection.html">Back to the collection</a></p>';
  document.title = 'Object not found · Vestigium';
}

function render(o) {
  const m = mus(o.m), M = i => fromMini(i, o.mini[i]), rows = ids => (ids || []).map(M).filter(Boolean);
  const sci = o.d === 1, date = o.dt || dateLabel(o.s, o.e);
  document.title = o.t + ' · Vestigium';
  const link = (href, text) => '<a href="' + href + '">' + esc(text) + '</a>';
  const facet = (k, v) => link('collection.html?' + k + '=' + encodeURIComponent(v), v);
  const pl = [];
  if (sci && o.pat) {
    if (o.pat.p) pl.push(o.pat.pg ? '<a href="principles.html?p=' + encodeURIComponent(o.pat.p) + '">' + esc(o.pat.pl) + '</a>' : esc(o.pat.pl));
    if (o.pat.r) pl.push(esc(o.pat.r)); if (o.pat.f) pl.push(esc(o.pat.f));
  }
  const fnText = sci ? o.fn.map(v => facet('fn', v)).join(', ')
    : (o.working || []).map(w => facet('fn', w.label) + ' <span class="conf">' + esc(w.confidence) + '</span>').join(', ');
  const facts = [
    ['Category', o.c.map(v => facet('c', v)).join(', ')],
    [sci ? 'Device' : 'Type', o.ty.filter(v => !o.c.includes(v)).map(v => facet('ty', v)).join(', ')],
    [sci ? 'Function' : 'Working function', fnText],
    ['Maker', o.mk.map(v => facet('mk', v)).join(', ')],
    ['Designer', (o.designer || []).map(esc).join(', ')],
    ['Place', esc(o.pl || '')],
    ['Culture', esc(o.culture || '')],
    ['Material', o.mt.map(v => facet('mt', v)).join(', ')],
    ['Size', esc(o.dims || '')],
    ['Inventory number', esc(o.acc || '')],
  ].filter(r => r[1]);
  const imgs = (o.images || []).slice(0, 6);
  const plate = o.im ? '<div class="plate"><img id="plate-img" src="' + esc(large(o.im)) + '" alt="' + esc(o.t) + '"></div>' +
      (imgs.length > 1 ? '<div class="pthumbs" role="group" aria-label="Other photographs">' + imgs.map((p, i) => '<button type="button" data-src="' + esc(p) + '" aria-label="Photograph ' + (i + 1) + '"><img src="' + esc(p) + '" alt=""></button>').join('') + '</div>' : '')
    : '<div class="plate none"><span class="nophoto">No photograph for this record</span></div>';
  const acts = ['<a class="fill" href="' + cmpUrl(o.id, (o.nbx || [])[0] || (o.nb || [])[0]) + '">Compare</a>'];
  if (o.url) acts.push('<a href="' + esc(o.url) + '" rel="noopener" target="_blank">Museum record ↗</a>');
  if (!sci) {
    if (o.branch) acts.push('<a href="atlas.html#map">Family tree</a>');
    if (o.morph) acts.push('<a href="analyse.html#analysis/' + encodeURIComponent(o.id) + '">Outline measurements</a>');
    acts.push('<a href="analyse.html#ai/' + encodeURIComponent(o.id) + '">AI methods</a>');
  }
  let html = '<article class="object" style="--c:' + m.color + '">' + '<div class="pcol">' + plate + '</div><div class="fcol">' +
    '<p class="museum"><i></i>' + esc(m.name) + '</p><h1>' + esc(o.t) + '</h1>' + (date ? '<p class="date">' + esc(date) + '</p>' : '<p class="date">Undated</p>') +
    '<p class="dline"><span class="dtag ' + domainKey(o.d) + '"><i class="dm ' + domainKey(o.d) + '"></i>' + domainLabel(o.d) + '</span>' + (pl.length ? '<span class="pline">' + pl.join(' <i>·</i> ') + '</span>' : '') + '</p>' +
    (facts.length ? '<dl>' + facts.map(r => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('') + '</dl>' : '') +
    (o.desc ? '<h2 class="sub">' + (sci ? 'Museum text' : 'Catalogue text') + '</h2><div class="desc">' + o.desc.slice(0, 4).map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' : '') +
    (sci && o.plate ? '<h2 class="sub">Read from the photograph</h2><p class="plate-text">' + esc(o.plate) + '</p>' : '') +
    (sci && o.outline ? '<h2 class="sub">Outline</h2><div class="outline"><img src="science/img/o/' + esc(o.h) + '.png" alt="Outline of ' + esc(o.t) + '"></div>' : '') +
    '<div class="act">' + acts.join('') + '</div></div></article>';
  // rows
  if (o.x) {
    html += strip('Similar across the whole collection', rows(o.nb), {compare: o.id, lede: 'Nearest by photograph and name, in either domain.'});
    html += strip(sci ? 'Closest surgical instruments' : 'Closest science objects', rows(o.nbx), {compare: o.id});
  } else html += '<section class="row"><h2>Similar across the whole collection</h2><p class="scope">This record has no photograph, so it has no place on the maps and no visual neighbours.</p></section>';
  if (sci) {
    html += (o.lin || []).map(l => {
      const chain = l.fams.map((f, i) => i === l.i ? '<b>' + esc(f) + '</b>' : esc(f)).join(' <i>→</i> ');
      const grp = (ids, f) => { const r = rows(ids); return r.length ? '<div class="lg"><h3>' + esc(f) + '</h3><div class="strip">' + r.map(x => '<div>' + tileOf(x) + '</div>').join('') + '</div></div>' : ''; };
      return '<section class="row lineage"><h2>Lineage</h2><p class="chainline">' + chain + ' <a href="lineages.html#chain-' + l.c + '">The whole lineage</a></p><div class="lgs">' + grp(l.prev, l.fams[l.i - 1]) + grp(l.next, l.fams[l.i + 1]) + '</div></section>';
    }).join('');
    if (o.row_pr) html += strip('Same principle, ' + esc(o.pr[0].toLowerCase()) + ', nearest in date', rows(o.row_pr), {compare: o.id});
    html += strip('In other museums', rows(o.other), {compare: o.id});
    html += strip('Same museum, similar', rows(o.same), {compare: o.id});
    html += strip('Listed with it by the museum site', rows(o.listed), {compare: o.id});
  } else {
    if (o.branch) html += strip('Family-tree branch: ' + esc(o.branch.name.toLowerCase()), rows(o.branch.ids), {compare: o.id, lede: '<a href="atlas.html#map">Open the family tree</a>'});
    else if (o.row_ty) html += strip('Same type through time: ' + esc(o.ty[0].toLowerCase()), rows(o.row_ty), {compare: o.id});
    if (o.row_fn) html += strip('Same working function, ' + esc(o.fn[0]) + ', nearest in date', rows(o.row_fn), {compare: o.id, lede: 'Surgical instruments carry no physics principle; their working function stands in for it.'});
    else html += '<section class="row"><h2>Principle</h2><p class="scope">No principle or working function is assigned to this record.</p></section>';
    html += surgicalEvidence(o);
  }
  root.innerHTML = html;
  $$('.pthumbs button', root).forEach(b => b.onclick = () => { $('#plate-img').src = b.dataset.src; });
}

function tileOf(r) {
  const m = mus(r.m), dl = dateLabel(r.s, r.e);
  return '<a class="tile" style="--c:' + m.color + '" href="' + objUrl(r.id) + '"><div class="ph">' + (r.im ? '<img loading="lazy" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '">' : '') + '</div><b>' + esc(r.t) + '</b><span>' + esc(m.short) + (dl ? ' · ' + esc(dl) : '') + '</span></a>';
}

function surgicalEvidence(o) {
  const li = a => a.map(x => '<li>' + esc(x) + '</li>').join('');
  const parts = [];
  if ((o.working || []).length || o.mech?.length) parts.push('<div class="ev"><h3>Working interpretation</h3><ul>' + o.working.map(w => '<li><b>' + esc(w.label) + '</b> · ' + esc(w.confidence) + '<br>' + esc(w.basis) + '</li>').join('') + '</ul>' +
    (o.mech?.length ? '<p>Mechanism: ' + o.mech.map(esc).join('; ') + '</p>' : '') + '</div>');
  if (o.documented?.length || o.interp?.length) parts.push('<div class="ev"><h3>Documented function</h3><ul>' + (li(o.documented || []) || '<li>Not documented</li>') + '</ul>' + (o.interp?.length ? '<h3>Catalogue interpretation</h3><ul>' + li(o.interp) + '</ul>' : '') + '</div>');
  if (o.uncertainty?.length) parts.push('<div class="ev"><h3>Uncertainty</h3><ul>' + li(o.uncertainty) + '</ul></div>');
  if (o.cite?.length || o.basis) parts.push('<div class="ev"><h3>Evidence</h3>' + (o.basis ? '<p>Date: ' + esc(o.basis) + '</p>' : '') + '<ul>' + o.cite.map(c => '<li>' + (c.u ? '<a href="' + esc(c.u) + '" rel="noopener" target="_blank">' + esc(c.t) + '</a>' : esc(c.t)) + (c.l ? ' ' + esc(c.l) : '') + '</li>').join('') + '</ul></div>');
  return parts.length ? '<section class="row"><h2>Surgical record</h2><div class="evgrid">' + parts.join('') + '</div></section>' : '';
}
