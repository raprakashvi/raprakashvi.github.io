// Shared data layer for every page of the merged collection (T-027).
//   data/unified/current.json            version, shard count, counts, museums, domains (no-store, tiny)
//   data/unified/<v>/index.json          columnar index of every object (collection, maps, timeline, compare picker)
//   data/unified/<v>/text.json           search text, fetched on the first search only
//   data/unified/<v>/obj/<k>.json        object shards, k = FNV-1a(id) mod shards (object page, compare)
//   data/unified/<v>/{patterns,bridges,home}.json   pattern pages and the front page carry their own tile data
import {getDomain, inDomain, initDomain, personality} from './domain.js';
export {getDomain, inDomain, personality};

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
export const $ = (s, r) => (r || document).querySelector(s);
export const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
export const params = () => Object.fromEntries(new URLSearchParams(location.search));
export const fmt = n => Number(n).toLocaleString('en');

let MAN = null;
export function manifest() {
  if (!MAN) MAN = fetch('data/unified/current.json', {cache: 'no-store'}).then(r => { if (!r.ok) throw Error('The collection could not be loaded (' + r.status + ').'); return r.json(); })
    .catch(e => { MAN = null; throw e; });
  return MAN;
}
async function getJSON(name) {
  const m = await manifest(), r = await fetch('data/unified/' + m.version + '/' + name);
  if (!r.ok) throw Error('Could not load ' + name + ' (' + r.status + ').');
  return r.json();
}
export const loadJSON = getJSON;

// ---------------------------------------------------------------- museums and domains
export let MUSEUMS = [], DOMAINS = [];
export async function boot() {
  initDomain();
  const m = await manifest();
  MUSEUMS = m.museums; DOMAINS = m.domains;
  return m;
}
export const domainKey = d => d === 0 ? 'surg' : d === 1 ? 'sci' : 'uns';
export const domainLabel = d => d === 0 ? 'Surgical instruments' : d === 1 ? 'Science and technology' : 'Not placed';
export const mus = i => MUSEUMS[i] || {name: 'Unknown', short: 'Unknown', color: '#8a8f8c'};

// ---------------------------------------------------------------- dates
const ord = n => n + (n % 100 >= 10 && n % 100 <= 20 ? 'th' : ({1: 'st', 2: 'nd', 3: 'rd'}[n % 10] || 'th'));
const yr = n => n < 0 ? (-n) + ' BCE' : String(n);
export function dateLabel(s, e) {
  if (s == null) return '';
  if (e == null || e === s) return yr(s);
  if (s >= 0 && s % 100 === 0 && e === s + 99) return ord(s / 100 + 1) + ' c.';
  if (s < 0 && e > 0) return yr(s) + '–' + e + ' CE';
  return yr(s) + '–' + yr(e);
}
export const mid = r => r.s == null ? null : (r.s + (r.e == null ? r.s : r.e)) / 2;

// ---------------------------------------------------------------- images
// S…: science thumbnail hash; C…: catalogue thumbnail (the only catalogue image the site carries, there is no
// full-size copy — object pages link to the museum's own record); anything else is a path into this site.
export function thumb(im) { return !im ? '' : im[0] === 'S' ? 'science/img/t/' + im.slice(1) + '.jpg' : im[0] === 'C' ? 'img/c/' + im.slice(1, 3) + '/' + im.slice(1) + '.webp' : im; }
export function large(im) { return !im ? '' : im[0] === 'S' ? 'science/img/d/' + im.slice(1) + '.jpg' : thumb(im); }
export const objUrl = id => 'object.html?id=' + encodeURIComponent(id);
export const cmpUrl = (a, b) => 'compare.html?a=' + encodeURIComponent(a) + (b ? '&b=' + encodeURIComponent(b) : '');

/** a row from a [t, im, m, s, e, d] tuple carried by shards and pattern files */
export const fromMini = (id, x) => x ? {id, t: x[0], im: x[1], m: x[2], s: x[3], e: x[4], d: x[5]} : null;

const NOPHOTO = '<span class="nophoto" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="6" width="24" height="20" rx="3"/><circle cx="12" cy="13" r="2.2"/><path d="m5 24 8-7 5 4 4-5 6 8"/></svg>No photograph</span>';
export function photo(r, cls) {
  return '<div class="ph' + (cls ? ' ' + cls : '') + '">' + (r.im ? '<img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '">' : NOPHOTO) +
    '<i class="dm ' + domainKey(r.d) + '" title="' + domainLabel(r.d) + '"></i></div>';
}
/** a photograph tile: museum colour as the top rule, domain mark in the corner */
export function tile(r, o = {}) {
  const m = mus(r.m), dl = dateLabel(r.s, r.e);
  return '<a class="tile" style="--c:' + m.color + '" href="' + objUrl(r.id) + '">' + photo(r) + '<b>' + esc(r.t) + '</b><span>' + esc(m.short) + (dl ? ' · ' + esc(dl) : '') + '</span></a>' +
    (o.compare ? '<a class="more" href="' + cmpUrl(o.compare, r.id) + '">Compare</a>' : '');
}
export function strip(title, rows, o = {}) {
  rows = rows.filter(Boolean);
  if (!rows.length) return '';
  return '<section class="row"' + (o.id ? ' id="' + o.id + '"' : '') + '><h2>' + title + '</h2>' + (o.lede ? '<p class="rowlede">' + o.lede + '</p>' : '') +
    '<div class="strip">' + rows.map(r => '<div>' + tile(r, o) + '</div>').join('') + '</div></section>';
}
export function legendMuseums(list) {
  return '<div class="legend" aria-label="Museum colours">' + list.map(i => '<span style="--c:' + mus(i).color + '"><i></i>' + esc(mus(i).short) + '</span>').join('') + '</div>';
}
export function scopeNote(text, cls) { return '<p class="scope' + (cls ? ' ' + cls : '') + '">' + text + '</p>'; }

// ---------------------------------------------------------------- the index
let IX = null;
export function loadIndex() {
  if (IX) return IX;
  IX = getJSON('index.json').then(raw => {
    const t0 = performance.now(), C = raw.cols, D = raw.dict, n = raw.n;
    const arr = v => v == null ? [] : Array.isArray(v) ? v : [v];
    const rows = new Array(n), by = Object.create(null);
    for (let i = 0; i < n; i++) {
      const r = {i, id: C.id[i], d: C.d[i], m: C.m[i], t: C.t[i], s: C.s[i], e: C.e[i], im: C.im[i],
        c: arr(C.c[i]), ty: arr(C.ty[i]), fn: arr(C.fn[i]), pr: arr(C.pr[i]), ro: arr(C.ro[i]), mk: arr(C.mk[i]), mt: arr(C.mt[i]),
        x: C.x[i], y: C.y[i], o: C.o[i]};
      rows[i] = r; by[r.id] = r;
    }
    MUSEUMS = raw.museums; DOMAINS = raw.domains;
    return {rows, by, dict: D, museums: raw.museums, map: raw.map, ms: performance.now() - t0};
  }).catch(e => { IX = null; throw e; });
  return IX;
}
let TX = null;
export function loadText() { if (!TX) TX = getJSON('text.json').catch(e => { TX = null; throw e; }); return TX; }

// ---------------------------------------------------------------- object shards
const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; };
const SH = new Map();
export async function loadObject(id) {
  const m = await manifest(), k = fnv(id) % m.shards;
  if (!SH.has(k)) SH.set(k, getJSON('obj/' + k + '.json').catch(e => { SH.delete(k); throw e; }));
  const o = (await SH.get(k))[id];
  if (!o) throw Error('No object with the identifier ' + id + '.');
  return o;
}

export function errorBox(root, e, retry) {
  root.innerHTML = '<div class="empty" role="alert"><h2>Could not load this view</h2><p>' + esc(e.message) + '</p><button type="button" class="btn" id="retry">Try again</button></div>';
  $('#retry', root).onclick = retry || (() => location.reload());
}
