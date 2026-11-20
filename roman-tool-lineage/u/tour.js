// The tour (T-047): six stops, one page each, opened as tour.html?s=1 .. tour.html?s=6.  Each stop leads with a picture
// (a strip, a chart or a chain), links to the full view and onward to the next stop; the explaining text is folded.
// Data is the small front-page file (home.json) and, for stop 3, the group file (clusters.json); the large
// collection index is only loaded when a visitor opens the full view.
import {boot, loadJSON, $, esc, fmt, fromMini, mus, MUSEUMS, thumb, objUrl, cmpUrl, dateLabel, params, errorBox} from './core.js';
import {STOPS, stopHref, setTour} from './tourstops.js';

const main = $('#tour');
const N = Math.min(STOPS.length, Math.max(1, Number(params().s) || 1));
const S = STOPS[N - 1];
setTour(N);
document.title = 'Stop ' + N + ' · ' + S.name + ' · Vestigium';
try {
  const m = await boot(), H = await loadJSON('home.json');
  const R = id => fromMini(id, H.mini[id]);
  const col = r => 'style="--c:' + mus(r.m).color + '"';
  const photo = (id, cap) => { const r = R(id); return r ? '<a class="tph" href="' + objUrl(id) + '" ' + col(r) + '><span class="tpi"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span><b>' + esc(r.t) + '</b><span>' + esc(mus(r.m).short) + (r.s != null ? ' · ' + esc(dateLabel(r.s, r.e)) : '') + '</span>' + (cap ? '<i>' + cap + '</i>' : '') + '</a>' : ''; };
  const ar = '<span class="tar" aria-hidden="true">→</span>';
  const btn = (h, t, fill) => '<a class="btn' + (fill ? ' fill' : '') + '" href="' + h + '">' + t + '</a>';
  const flow = '<ol class="tflow" aria-label="The six stops">' + STOPS.map(t => '<li' + (t.n === N ? ' class="cur"' : t.n < N ? ' class="done"' : '') + '><a href="' + stopHref(t.n) + '"' + (t.n === N ? ' aria-current="step"' : '') + '><span class="tfn">' + t.n + '</span><span class="tfl">' + esc(t.name) + '</span><span class="tfm">' + t.min + ' min</span></a></li>').join('') + '</ol>';
  const next = STOPS[N];
  const onward = next ? btn(stopHref(next.n), 'Next stop: ' + esc(next.name) + ' →', true) : btn('route.html', 'Route sheet to print →', true);
  const fold = (summary, html) => '<details class="tfold"><summary>' + esc(summary) + '</summary>' + html + '</details>';
  const barsHtml = (list, maxN) => list.map(x => '<div class="whrow"><span class="whlab">' + esc(x.short) + '</span><span class="whbar" style="--c:' + x.color + ';--w:' + (100 * x.n / maxN).toFixed(1) + '%"></span><b>' + fmt(x.n) + '</b></div>').join('');
  let body = '', live = S.live, liveLabel = S.liveLabel, fine = '';

  if (N === 1) {
    const C = await loadJSON('clusters.json');
    const g = C.families[0].groups.find(x => x.gkey === H.families[0].groups[0].gkey) || C.families[0].groups[0];
    const mini = id => fromMini(id, C.mini[id]);
    const seen = new Set(), ids = (g.photos_clean || g.photos).filter(id => { const r = mini(id); if (!r || seen.has(r.m)) return false; seen.add(r.m); return true; });
    const strip = ids.slice(0, 6).map(id => { const r = mini(id); return '<a class="tph" href="' + objUrl(id) + '" ' + col(r) + '><span class="tpi"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span><b>' + esc(mus(r.m).short) + '</b><span>' + esc(r.t) + '</span></a>'; }).join('');
    const maxn = Math.max(...H.by_museum.map(x => x.n), 1);
    const big = H.by_museum.filter(x => x.n >= 100).sort((a, b) => b.n - a.n);
    body = '<h2 class="tq">' + esc(g.name) + ': ' + g.n_museums + ' museums hold it, each under its own catalogue.</h2>' +
      '<div class="tstrip">' + strip + '</div>' +
      '<div class="tfig"><div class="tmus"><div class="tin">' + ids.slice(0, 6).map(id => '<span class="tbox" style="--c:' + mus(mini(id).m).color + '">' + esc(mus(mini(id).m).short) + '</span>').join('') + '</div><span class="tar big" aria-hidden="true">→</span><div class="tout"><span class="tbox one">One shared space of photos and titles</span><span class="tar" aria-hidden="true">↓</span><span class="tbox out">Groups that reach across museums</span></div></div></div>' +
      '<div class="tcols"><div><h3 class="tsm">Collections with 100 or more objects (' + fmt(m.counts.all) + ' in all)</h3><div class="whbars">' + barsHtml(big, maxn) + '</div></div>' +
      '<div class="tfact"><b>' + fmt(m.counts.all) + '</b><span>objects</span><b>' + m.counts.museums + '</b><span>collections</span><b>' + fmt(H.n_principles) + '</b><span>working principles</span></div></div>' +
      fold('Where these photographs come from', '<p>The strip shows the first group on the next stop: ' + esc(g.line) + '. One photograph per museum. Photographs are the museums\' own and open to each object\'s page, which links to the museum record.</p>');
    live = 'collection.html'; liveLabel = 'Browse the collection';
  }

  if (N === 2) {
    const FAMS = H.families || [];
    const tile = g => '<a class="cltile" data-museums="' + g.n_museums + '" href="clusters.html#' + g.anchor + '"><span class="clpics">' + g.pics.map(id => { const r = R(id); return r ? '<img loading="lazy" decoding="async" style="--c:' + mus(r.m).color + '" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t + ' · ' + mus(r.m).short) + '">' : ''; }).join('') + '</span><h3>' + esc(g.name) + '</h3><b class="cln">' + fmt(g.n) + ' objects · ' + g.n_museums + ' museums</b></a>';
    body = '<h2 class="tq">Four ways to group the same ' + fmt(m.counts.all) + ' objects. Every group below crosses museums.</h2>' +
      '<div class="cltabs" role="tablist" aria-label="Kinds of group" id="ttabs">' + FAMS.map((f, i) => '<button class="cltab" role="tab" data-fam="' + f.key + '" aria-selected="' + (i === 0) + '" title="' + esc(f.definition) + '">' + esc(f.label) + '</button>').join('') + '</div>' +
      '<p class="tdef" id="tdef"></p><div class="clgrid" id="tgrid" role="tabpanel"></div>' +
      fold('How each group was found, and how well (the AI tour)', '<p>The groups come from AI methods. <a href="aitour.html?s=2">The 10-minute AI tour</a> shows what worked, how well, real predictions and what did not work.</p>') +
      fold('How each group is formed', '<ul class="tl2">' + FAMS.map(f => '<li><b>' + esc(f.label) + '.</b> ' + esc(f.definition) + '.</li>').join('') + '</ul><p>The museum is never an input; it is counted afterwards. Morphology covers only the surgical release (2,434 objects), not the whole collection.</p>');
    main.dataset.fams = JSON.stringify(FAMS.map(f => [f.key, f.definition, f.groups.map(tile)]));
  }

  if (N === 3) {
    const C = await loadJSON('clusters.json');
    const mini = id => fromMini(id, C.mini[id]);
    const all = C.families.flatMap(f => f.groups);
    const gkey = params().g || H.families[0].groups[0].gkey;
    const g = all.find(x => x.gkey === gkey) || all[0];
    const seen = new Set(), ids = (g.photos_clean || g.photos).filter(id => { const r = mini(id); if (!r || seen.has(r.m)) return false; seen.add(r.m); return true; });
    const cell = id => { const r = mini(id); return '<a class="tph big" href="' + objUrl(id) + '" ' + col(r) + '><span class="tpi"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span><b>' + esc(mus(r.m).short) + '</b><span>' + esc(r.t) + '</span><i>' + esc(dateLabel(r.s, r.e) || 'undated') + '</i></a>'; };
    // a small date chart: one dot per photographed object on the group's own span
    const dated = ids.map(id => ({id, r: mini(id)})).filter(x => x.r.s != null);
    let chart = '';
    if (dated.length > 1) {
      const mid = r => (r.s + (r.e == null ? r.s : r.e)) / 2, lo = Math.min(...dated.map(x => mid(x.r))), hi = Math.max(...dated.map(x => mid(x.r))), sp = Math.max(1, hi - lo);
      const X = v => 30 + 540 * (v - lo) / sp;
      const yr = v => v < 0 ? Math.round(-v) + ' BCE' : String(Math.round(v));
      chart = '<svg class="tdates" viewBox="0 0 600 78" role="img" aria-label="Dates of the photographed objects"><line x1="30" y1="40" x2="570" y2="40" stroke="currentColor" stroke-width="1.5"/>' +
        dated.map((x, i) => '<circle cx="' + X(mid(x.r)).toFixed(1) + '" cy="40" r="9" fill="' + mus(x.r.m).color + '" stroke="#faf9f6" stroke-width="2"><title>' + esc(mus(x.r.m).short + ' · ' + dateLabel(x.r.s, x.r.e)) + '</title></circle>').join('') +
        '<text x="30" y="68" font-size="13" text-anchor="start" fill="currentColor">' + yr(lo) + '</text><text x="570" y="68" font-size="13" text-anchor="end" fill="currentColor">' + yr(hi) + '</text></svg>';
    }
    const yv = v => v < 0 ? Math.abs(v) + ' BCE' : String(v);
    const span = g => g.from == null ? 'undated' : yv(g.from) + ' to ' + yv(g.to == null ? g.from : g.to);
    const pairs = (g.pairs || []).slice(0, 3).map(p => { const a = mini(p[0]), b = mini(p[1]); if (!a || !b) return ''; const one = (id, r) => '<a class="tpp" href="' + objUrl(id) + '" ' + col(r) + '><span class="tpi"><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"></span><span>' + esc(mus(r.m).short) + '</span></a>'; return '<div class="tpair">' + one(p[0], a) + '<span class="tswap" aria-hidden="true">↔</span>' + one(p[1], b) + '<small>' + p[2].toFixed(2) + ' similarity</small><a class="tcmp" href="' + cmpUrl(p[0], p[1]) + '">Compare</a></div>'; }).join('');
    body = '<h2 class="tq">' + esc(g.name) + ': ' + fmt(g.n) + ' objects in ' + g.n_museums + ' museums.</h2>' +
      '<div class="tstrip big">' + ids.slice(0, 6).map(cell).join('') + '</div>' +
      '<div class="tcols"><div><h3 class="tsm">When the pictured objects were made</h3>' + chart + '<p class="whnote">' + dated.length + ' of the ' + Math.min(ids.length, 6) + ' pictured objects carry a usable date; the group as a whole runs ' + esc(span(g)) + '.</p></div>' +
      '<div class="tfact"><b>' + fmt(g.n) + '</b><span>objects</span><b>' + g.n_museums + '</b><span>museums</span></div></div>' +
      '<h3 class="tsm">Closest pairs between museums</h3><div class="tpairs">' + pairs + '</div>' +
      fold('About this group', '<p>' + esc(g.line) + '. Purity ' + g.purity.toFixed(2) + ' against ' + esc(g.purity_kind || 'the codebook') + '; similarity is ' + esc(g.metric) + '. Change the group by putting its number in the address: <code>tour.html?s=3&amp;g=look:&hellip;</code>.</p>');
    live = 'clusters.html#' + g.anchor; liveLabel = 'Open this group';
    fine = btn('map.html?g=' + encodeURIComponent(g.gkey), 'Show it on the map');
  }

  if (N === 4) {
    const maxn = Math.max(...H.by_museum.map(x => x.n), 1);
    const chips = H.by_museum.map((x, i) => ({x, i})).filter(o => o.x.n > 0).sort((a, b) => b.x.n - a.x.n);
    const maxc = Math.max(...H.by_century.map(x => x.n), 1);
    const hist = H.by_century.map(x => { let y = 100; const seg = x.by_museum.map((n, i) => { const h = 100 * n / maxc; y -= h; return h > 0 ? '<i style="height:' + h.toFixed(2) + '%;bottom:' + y.toFixed(2) + '%;background:' + mus(i).color + '"></i>' : ''; }).join(''); return '<div class="whcol"><span class="whstack">' + seg + '</span><b>' + (x.n >= 1000 ? Math.round(x.n / 1000) + 'k' : fmt(x.n)) + '</b><span class="whcl">' + esc(x.label) + '</span></div>'; }).join('');
    body = '<h2 class="tq">Objects that look alike sit together. Choose a museum to see where it lies.</h2>' +
      '<div class="tmap"><a class="tmapimg" href="map.html" title="Open the map"><img src="img/u/map-preview.png" alt="Map of every object with a photograph; look-alikes sit together"></a>' +
      '<div class="tmapside"><h3 class="tsm">Show one museum on the map</h3><div class="tchips" id="tchips">' +
      '<a class="tchip" href="map.html" data-m="all"><i style="background:var(--ink)"></i>All museums</a>' +
      chips.map(o => '<a class="tchip" href="map.html?m=' + o.i + '" data-m="' + o.i + '"><i style="background:' + o.x.color + '"></i>' + esc(o.x.short) + '<b>' + fmt(o.x.n) + '</b></a>').join('') + '</div></div></div>' +
      '<div class="tcols"><div><h3 class="tsm">When: objects by century, stacked by museum</h3><div class="whhist">' + hist + '</div><p class="whnote">' + fmt(H.by_century.find(x => x.label === 'undated').n) + ' objects carry no usable date (last column).</p></div>' +
      '<div class="tfact"><b>' + fmt(m.counts.med) + '</b><span>tagged Medicine</span><b>' + fmt(m.counts.sci) + '</b><span>tagged Science and technology</span><a class="btn" href="map3d.html">See the map with time as height</a></div></div>' +
      fold('How the map is made', '<p>Photographs and titles are embedded with SigLIP 2 and placed with UMAP, so closeness means look and wording, not provenance. Objects without a usable photograph have no position; they stay in the collection. Counts under each museum are all its objects, not only those on the map.</p>');
    live = 'map.html'; liveLabel = 'Open the map';
  }

  if (N === 5) {
    const dl = id => { const r = R(id); return r ? dateLabel(r.s, r.e) : ''; };
    const chain = (ids, cls) => '<div class="tchain ' + (cls || '') + '">' + ids.map((id, i) => (i ? ar : '') + photo(id)).join('') + '</div>';
    body = '<h2 class="tq">A device grows out of another; a principle runs through many devices.</h2>' +
      '<div class="trow"><div class="trowh"><h3 class="tsm">Lineages</h3><a href="lineages.html">All lineages →</a></div>' + chain(H.lin) + '</div>' +
      '<div class="trow"><div class="trowh"><h3 class="tsm">Family tree: ' + esc(H.tree_name) + '</h3><a href="atlas.html#map">Open the family tree →</a></div>' + chain(H.tree) + '</div>' +
      '<div class="trow"><div class="trowh"><h3 class="tsm">One principle through time</h3><a href="principles.html">Life of a principle →</a></div>' + chain(H.life) + '</div>' +
      fold('What the arrows mean', '<p>Arrows run from the earlier object to the later one. In the family tree, instrument links are documented comparisons; the scientific objects are joined by device chains and maker series. The Missing links page lists the stages no museum holds.</p>');
    live = 'atlas.html#map'; liveLabel = 'Open the family tree';
    fine = btn('lineages.html', 'Lineages across museums');
  }

  if (N === 6) {
    const cross = H.cross;
    const pairB = [H.lin[0], H.tree[0]], cmpH = cmpUrl(pairB[0], pairB[1]);
    body = '<h2 class="tq">Neighbours, missing stages and comparisons, in one place.</h2>' +
      '<div class="t3">' +
      '<a class="tcard" href="gaps.html"><h3>Gaps</h3>' + photo2(H.gap.id) + '<p class="tgap">' + esc(H.gap.text) + '</p><span class="tgo">Missing links →</span></a>' +
      '<a class="tcard" href="bridges.html"><h3>Bridges</h3><div class="tbr">' + cross.map(id => photo2(id)).join('<span class="tswap" aria-hidden="true">↔</span>') + '</div><span class="tgo">Medicine meets science →</span></a>' +
      '<a class="tcard" href="' + cmpH + '"><h3>Compare</h3><div class="tbr">' + pairB.map(id => photo2(id)).join('<span class="tswap" aria-hidden="true">vs</span>') + '</div><span class="tgo">Any two objects, side by side →</span></a></div>' +
      '<div class="tcontact"><h3 class="tsm">Contact for this walkthrough</h3><p class="tcontact-who"><b>Ravi Prakash</b> <span>Postdoctoral Fellow, Johns Hopkins University</span> <a href="mailto:ravi.prakash@jhu.edu">ravi.prakash@jhu.edu</a> · <a href="https://raprakashvi.github.io">raprakashvi.github.io</a></p><p><a href="index.html#contact">Project contacts on the front page</a></p></div>' +
      fold('What a museum can ask of this', '<p>Is an object of ours close to something elsewhere? Which stage of a principle does no collection here hold? Which pair would be worth showing together? Every view links back to the museum\'s own record.</p>');
    live = 'gaps.html'; liveLabel = 'Open the gaps';
    fine = btn(cmpH, 'Compare two objects') + btn('aitour.html?s=1', 'AI tour: how the models did');
  }
  function photo2(id) { const r = R(id); return r ? '<span class="tph2" ' + col(r) + '><img loading="lazy" decoding="async" src="' + esc(thumb(r.im)) + '" alt="' + esc(r.t) + '"><i>' + esc(mus(r.m).short) + '</i></span>' : ''; }

  main.innerHTML = flow +
    '<header class="thead"><p class="tkick">Stop ' + N + ' of ' + STOPS.length + ' · about ' + S.min + ' minutes</p><h1>' + esc(S.title) + '</h1><p class="tshow">' + esc(S.show) + '</p></header>' +
    '<section class="tbody" data-stop="' + N + '">' + body + '</section>' +
    '<div class="act tact">' + (next ? onward : btn('route.html', 'Route sheet to print', true)) + btn(live, esc(liveLabel)) + fine + '</div>';
  if (N === 2) {
    const FD = JSON.parse(main.dataset.fams), show = key => { const f = FD.find(x => x[0] === key) || FD[0]; $('#tgrid').innerHTML = f[2].join(''); $('#tdef').textContent = 'Groups of ' + f[1] + '.'; document.querySelectorAll('#ttabs .cltab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.fam === f[0]))); };
    $('#ttabs').addEventListener('click', e => { const b = e.target.closest('.cltab'); if (b) show(b.dataset.fam); });
    show(FD[0][0]);
  }
  main.dataset.ready = String(N);
} catch (e) { errorBox(main, e); }
