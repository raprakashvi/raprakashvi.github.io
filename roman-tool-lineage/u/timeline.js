// Timeline over every dated object: a decade histogram stacked by domain, then one photo strip per category
// (surgical instrument type, science subject), oldest first.  Long strips show evenly spaced objects and link on.
import {boot, loadIndex, $, esc, fmt, mus, thumb, dateLabel, objUrl, mid, inDomain, domainKey, errorBox} from './core.js';

await boot();
let IX;
try { IX = await loadIndex(); } catch (e) { errorBox($('#tls'), e); throw e; }
const CAP = 120, BRK = 1500, DC = ['#a8431f', '#284f7a', '#6f6a60'];

function hist(rows) {
  const dated = rows.filter(r => mid(r) != null);
  const tmax = Math.ceil(Math.max(...dated.map(mid), 2000) / 10) * 10;
  const bins = new Map(); let early = [0, 0, 0];
  dated.forEach(r => { const y = mid(r); if (y < BRK) { early[r.d]++; return; } const b = Math.floor(y / 10) * 10; const v = bins.get(b) || [0, 0, 0]; v[r.d]++; bins.set(b, v); });
  const keys = []; for (let y = BRK; y < tmax; y += 10) keys.push(y);
  const max = Math.max(1, ...keys.map(k => { const v = bins.get(k) || [0, 0, 0]; return v[0] + v[1] + v[2]; }), early[0] + early[1] + early[2]);
  const W = 1000, Hh = 170, bw = (W - 70) / keys.length, sc = (Hh - 30) / max;
  let s = '<svg viewBox="0 0 ' + W + ' ' + (Hh + 28) + '" role="img" aria-label="Dated objects per decade, by domain">';
  const bar = (x, w, v, label) => {
    let y = Hh;
    return [0, 1, 2].map(d => { const h = v[d] * sc; y -= h; return h > 0 ? '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(1, w - 1).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + DC[d] + '"><title>' + label + ': ' + v[d] + ' ' + ['surgical', 'science', 'catalogue'][d] + '</title></rect>' : ''; }).join('');
  };
  s += bar(0, 46, early, 'Before ' + BRK) + '<text x="23" y="' + (Hh + 18) + '" text-anchor="middle">before</text>';
  s += '<line x1="58" x2="58" y1="20" y2="' + Hh + '" stroke="#cfc9ba" stroke-dasharray="4 3"/>';
  keys.forEach((k, i) => { s += bar(66 + i * bw, bw, bins.get(k) || [0, 0, 0], k + 's'); if (k % 100 === 0) s += '<text x="' + (66 + i * bw).toFixed(1) + '" y="' + (Hh + 18) + '">' + k + '</text>'; });
  s += '<line x1="0" x2="' + W + '" y1="' + Hh + '" y2="' + Hh + '" stroke="#182230"/></svg>';
  const n = [0, 1, 2].map(d => dated.filter(r => r.d === d).length);
  return '<div class="histhead">' + [0, 1, 2].filter(d => n[d]).map(d => '<span><i class="dm ' + ['surg', 'sci', 'uns'][d] + '"></i>' + ['Surgical instruments', 'Science and technology', 'Not placed'][d] + ' <b>' + fmt(n[d]) + '</b> dated</span>').join('') + '</div>' + s;
}

function render() {
  const rows = IX.rows.filter(r => inDomain(r.d));
  $('#hist').innerHTML = hist(rows);
  const groups = new Map();
  rows.forEach(r => {
    if (mid(r) == null || !r.im) return;
    const keys = r.d === 0 ? r.ty.slice(0, 1).map(v => ['ty', v]) : r.c.slice(0, 2).map(v => ['c', v]);
    keys.forEach(([f, v]) => { const g = IX.dict[f][v], key = r.d + '|' + f + '|' + g; if (!groups.has(key)) groups.set(key, {d: r.d, f, g, rows: []}); groups.get(key).rows.push(r); });
  });
  const list = [...groups.values()].filter(g => g.rows.length >= 20).sort((a, b) => b.rows.length - a.rows.length).slice(0, 30);
  $('#tls').innerHTML = list.map((g, n) => {
    const a = g.rows.slice().sort((x, y) => mid(x) - mid(y) || (x.id < y.id ? -1 : 1));
    const pick = a.length > CAP ? Array.from({length: CAP}, (_, i) => a[Math.round(i * (a.length - 1) / (CAP - 1))]) : a;
    const lo = Math.round(mid(a[0])), hi = Math.round(mid(a[a.length - 1])), yl = y => y < 0 ? (-y) + ' BCE' : y;
    const more = a.length > CAP ? '<a class="more" href="collection.html?' + g.f + '=' + encodeURIComponent(g.g) + '&amp;sort=date">All ' + fmt(a.length) + ' in the collection</a>' : '';
    return '<section class="tl" aria-labelledby="t' + n + '"><h2 id="t' + n + '"><i class="dm ' + domainKey(g.d) + '"></i>' + esc(g.g) + ' <small>' + fmt(a.length) + ' dated objects, ' + yl(lo) + ' to ' + yl(hi) + (a.length > CAP ? ', ' + CAP + ' shown' : '') + '</small>' + more + '</h2>' +
      '<div class="scroller" tabindex="0" role="region" aria-label="' + esc(g.g) + ', photographs by date">' + pick.map((r, i) => {
        const m = mus(r.m);
        // a horizontal strip is 120 tiles wide; the first screenful loads eagerly so a strip never shows blank
        // tiles before the reader scrolls, the rest stay lazy (T-032)
        return '<a class="tile" style="--c:' + m.color + '" href="' + objUrl(r.id) + '"><div class="ph"><img' + (i < 40 ? ' decoding="async"' : ' loading="lazy" decoding="async"') + ' src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></div><div class="yr">' + esc(dateLabel(r.s, r.e)) + '</div><b>' + esc(r.t) + '</b></a>';
      }).join('') + '</div></section>';
  }).join('');
}
window.addEventListener('vestigium:domain', render);
render();
