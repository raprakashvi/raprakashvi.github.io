// Compare any two objects, from either domain: photographs side by side, then the facts row by row.
import {boot, loadObject, loadIndex, $, $$, esc, mus, dateLabel, large, thumb, objUrl, cmpUrl, domainKey, domainLabel, params} from './core.js';

const q = params(), root = $('#cmp');
await boot();
let IX = null;
function picker(inputId, listId, side) {
  const inp = $('#' + inputId), ul = $('#' + listId);
  inp.addEventListener('focus', () => { loadIndex().then(x => IX = x).catch(() => {}); }, {once: true});
  inp.addEventListener('input', async () => {
    if (!IX) IX = await loadIndex();
    const t = inp.value.trim().toLowerCase(), hits = [];
    if (t.length >= 2) for (const r of IX.rows) { if ((r.t + ' ' + r.id).toLowerCase().includes(t)) { hits.push(r); if (hits.length >= 10) break; } }
    ul.hidden = !hits.length;
    ul.innerHTML = hits.map(r => {
      const a = side === 'a' ? r.id : q.a, b = side === 'b' ? r.id : q.b;
      return '<li><a href="' + cmpUrl(a || r.id, a ? b : '') + '"><img src="' + esc(thumb(r.im)) + '" alt=""><div>' + esc(r.t) + '<span><i class="dm ' + domainKey(r.d) + '"></i> ' + esc(mus(r.m).short) + (dateLabel(r.s, r.e) ? ' · ' + esc(dateLabel(r.s, r.e)) : '') + '</span></div></a></li>';
    }).join('');
  });
}
picker('pick-a', 'picks-a', 'a');
picker('pick-b', 'picks-b', 'b');

const ids = [q.a, q.b].filter(Boolean);
if (!ids.length) {
  root.innerHTML = '<p class="empty">Choose two objects above, or open any object and press Compare.</p>';
  $('#swap').style.display = 'none';
} else {
  const objs = await Promise.all(ids.map(i => loadObject(i).catch(() => null)));
  if (objs.some(o => !o)) root.innerHTML = '<p class="empty">One of these objects could not be found. Choose another above.</p>';
  else {
    if (objs.length === 2) { $('#swap').href = cmpUrl(q.b, q.a); document.title = objs[0].t + ' and ' + objs[1].t + ' · Compare · Vestigium'; }
    else $('#swap').style.display = 'none';
    $('#pick-a').placeholder = objs[0].t;
    if (objs[1]) $('#pick-b').placeholder = objs[1].t;
    root.innerHTML = objs.map(o => {
      const m = mus(o.m), d = o.dt || dateLabel(o.s, o.e);
      return '<div class="side" style="--c:' + m.color + '"><div class="plate">' + (o.im ? '<img src="' + esc(large(o.im)) + '" alt="' + esc(o.t) + '">' : '<span class="nophoto">No photograph</span>') + '</div>' +
        '<p class="museum"><i></i>' + esc(m.name) + '</p><h2><a href="' + objUrl(o.id) + '">' + esc(o.t) + '</a></h2>' +
        '<p class="dline"><span class="dtag ' + domainKey(o.d) + '"><i class="dm ' + domainKey(o.d) + '"></i>' + domainLabel(o.d) + '</span><span class="cdate">' + esc(d || 'Undated') + '</span></p></div>';
    }).join('') + (objs.length === 1 ? '<div class="side pickone"><p>Choose the second object above.</p></div>' : '');
    if (objs.length === 2) {
      const [a, b] = objs;
      const rel = a.nb?.includes(b.id) || b.nb?.includes(a.id) ? 'Among each other’s nearest objects by photograph and name.' :
        a.nbx?.includes(b.id) || b.nbx?.includes(a.id) ? 'The closest object of the other collection, by photograph and name.' : '';
      const list = v => (v || []).map(esc).join(', ');
      const fn = o => o.k !== 'surg' ? list(o.fn) : (o.working || []).map(w => esc(w.label)).join(', ');
      const R = [['Date', o => esc(o.dt || dateLabel(o.s, o.e) || 'Undated')], ['Category', o => list(o.c)], [null, o => list(o.ty.filter(v => !o.c.includes(v)))],
        ['Principle', o => o.pat?.pl ? esc(o.pat.pl) : o.pr?.length ? esc(o.pr[0]) : ''],
        ['Function', fn], ['Role', o => o.pat?.r ? esc(o.pat.r) : o.ro?.length ? esc(o.ro[0]) : ''], ['Maker', o => list(o.mk)],
        ['Place', o => esc(o.pl || '')], ['Material', o => list(o.mt)], ['Size', o => esc(o.dims || '')], ['Inventory number', o => esc(o.acc || '')]];
      const body = R.map(([label, f]) => {
        const va = f(a), vb = f(b);
        if (!va && !vb) return '';
        const l = label || (a.k === 'cat' || b.k === 'cat' ? 'Device family' : a.k !== 'surg' && b.k !== 'surg' ? 'Device' : a.k === 'surg' && b.k === 'surg' ? 'Type' : 'Type or device');
        const same = va && va === vb ? ' class="same"' : '';
        return '<tr' + same + '><th scope="row">' + l + '</th><td>' + (va || '<span class="none">none</span>') + '</td><td>' + (vb || '<span class="none">none</span>') + '</td></tr>';
      }).join('');
      $('#facts').innerHTML = (rel ? '<p class="scope sci">' + rel + '</p>' : '') + '<div class="tablewrap"><table class="ctable"><caption class="sr-only">Facts of both objects, row by row</caption><thead><tr><th></th><th scope="col">' + esc(a.t) + '</th><th scope="col">' + esc(b.t) + '</th></tr></thead><tbody>' + body + '</tbody></table></div>';
    }
  }
}
