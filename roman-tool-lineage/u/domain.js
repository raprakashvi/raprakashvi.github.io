// The domain filter (All · Surgical instruments · Science and technology), shown at the top of every page and
// remembered across views in localStorage.  ?d=surg|sci|all in a URL sets it explicitly (old science links use it).
const KEY = 'vestigium-domain', VALID = ['all', 'surg', 'sci'];
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
/** 0 = surgical, 1 = science */
export function inDomain(d) { const c = getDomain(); return c === 'all' || (c === 'surg' ? d === 0 : d === 1); }
export const DOMAIN_INDEX = {surg: 0, sci: 1};

function paint() {
  document.documentElement.dataset.domain = cur;
  document.querySelectorAll('#domainbar [data-domain]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.domain === cur)));
}
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
