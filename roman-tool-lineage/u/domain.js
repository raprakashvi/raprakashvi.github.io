// The tag filter (All · Medicine · Science and technology), shown at the top of every page and remembered across
// views in localStorage.  T-034: the tags overlap, so a record may be under both; there is no third "not placed"
// state.  ?d=med|sci|all in a URL sets it explicitly (old science links use ?d=sci; old ?d=surg and ?d=uns are read
// as their nearest tag so old links still land somewhere sensible).
const KEY = 'vestigium-domain', VALID = ['all', 'med', 'sci'];
const ALIAS = {surg: 'med', sur: 'med', uns: 'all'};
let cur = null, bound = false;

function stored() { try { return localStorage.getItem(KEY); } catch { return null; } }
function store(d) { try { localStorage.setItem(KEY, d); } catch { /* private mode: the filter still works for this page */ } }

export function getDomain() {
  if (cur) return cur;
  let d = new URLSearchParams(location.search).get('d');
  if (ALIAS[d]) d = ALIAS[d];
  if (!VALID.includes(d)) d = stored();
  if (!VALID.includes(d)) d = 'all';
  cur = d; store(d);
  return d;
}
/** d is the tag bitmask carried by the index: 1 medicine, 2 science and technology, 3 both, 0 neither. */
export function inDomain(d) { const c = getDomain(); return c === 'all' || !!(d & (c === 'med' ? 1 : 2)); }
export const DOMAIN_INDEX = {med: 0, sci: 1};

function paint() {
  document.documentElement.dataset.domain = cur;
  document.querySelectorAll('#domainbar [data-domain]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.domain === cur)));
}

// One default collection order per tag.  A skin over the same site, not a second site.  The framing line that used
// to sit under every page title is gone (T-036: one site-wide note is enough); the accent and the order stay.
const PERSONALITY = {
  all: {sort: 'name'},
  med: {sort: 'name'},
  sci: {sort: 'date'},
};
export function personality() { return PERSONALITY[getDomain()] || PERSONALITY.all; }

export function setDomain(d) {
  if (ALIAS[d]) d = ALIAS[d];
  if (!VALID.includes(d) || d === cur) return;
  cur = d; store(d);
  const u = new URL(location.href);
  if (u.searchParams.has('d')) { u.searchParams.delete('d'); history.replaceState(history.state, '', u); }
  paint();
  window.dispatchEvent(new CustomEvent('vestigium:domain', {detail: d}));
}
export function initDomain() {
  getDomain(); paint();
  if (bound) return; bound = true;
  const bar = document.getElementById('domainbar');
  if (!bar) return;
  bar.addEventListener('click', e => { const b = e.target.closest('[data-domain]'); if (b) setDomain(b.dataset.domain); });
  if (bar.querySelector('[data-count]') && !bar.querySelector('[data-count]').textContent) {
    fetch('data/unified/current.json', {cache: 'no-store'}).then(r => r.ok ? r.json() : null).then(m => {
      if (!m) return;
      bar.querySelectorAll('[data-count]').forEach(b => { b.textContent = (m.counts[b.dataset.count] || 0).toLocaleString('en'); });
    }).catch(() => {});
  }
}
