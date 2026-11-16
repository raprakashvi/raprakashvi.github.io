// The domain filter (All · Surgical instruments · Science and technology), shown at the top of every page and
// remembered across views in localStorage.  ?d=surg|sci|all in a URL sets it explicitly (old science links use it).
const KEY = 'vestigium-domain', VALID = ['all', 'surg', 'sci', 'uns'];
let cur = null, bound = false;

function stored() { try { return localStorage.getItem(KEY); } catch { return null; } }
function store(d) { try { localStorage.setItem(KEY, d); } catch { /* private mode: the filter still works for this page */ } }

export function getDomain() {
  if (cur) return cur;
  let d = new URLSearchParams(location.search).get('d');
  if (!VALID.includes(d)) d = stored();
  if (!VALID.includes(d)) d = 'all';
  cur = d; store(d);
  return d;
}
/** 0 = surgical, 1 = science, 2 = not placed by the domain rule */
export function inDomain(d) { const c = getDomain(); return c === 'all' || (c === 'surg' ? d === 0 : c === 'sci' ? d === 1 : d === 2); }
export const DOMAIN_INDEX = {surg: 0, sci: 1, uns: 2};

function paint() {
  document.documentElement.dataset.domain = cur;
  document.querySelectorAll('#domainbar [data-domain]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.domain === cur)));
  // The optional personality: the accent colour comes from CSS (html[data-domain=…]); the line and the default
  // order of the collection are here, so every page can use them without a separate page per domain.
  document.querySelectorAll('[data-personality]').forEach(el => { el.textContent = personality().line; });
}

// One framing line and one default collection order per domain.  A skin over the same site, not a second site.
const PERSONALITY = {
  all: {line: 'Every object from the surgical collection, the science collection and three complete museum catalogues, in one place.',
        sort: 'name'},
  surg: {line: 'Instruments made to cut, clamp, open and close: the surgeon’s hands, from Roman times to the operating theatre.',
         sort: 'name'},
  sci: {line: 'Objects that measure, light, heat, sound and switch: physics in the laboratory and in the home.',
        sort: 'date'},
  uns: {line: 'Prints, drawings, letters and specimens that the codebook could not place in a principle. Kept with the collection, counted, never dropped.',
        sort: 'museum'},
};
export function personality() { return PERSONALITY[getDomain()] || PERSONALITY.all; }

export function setDomain(d) {
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
