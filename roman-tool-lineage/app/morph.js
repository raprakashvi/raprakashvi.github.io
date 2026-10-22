/* Morphology view: shape space, coverage, Europe, similar pairs, method.  Data: D.morph (see morph_export_atlas.py).
 * Silhouettes are derived outlines, never the third-party photographs.  Filtering uses Query.ColumnStore; "similar" uses the kNN graph. */
const Morph = (() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const REG_COL = { 'Europe (post-classical)': '#52648b', 'Greece / Rome / Byzantium': '#94603c', 'Egypt / Nile': '#E69F00', 'West Asia / Islamic world': '#CC79A7', 'South / Southeast Asia': '#009E73', 'East Asia': '#D55E00', 'Americas (pre-/colonial)': '#56B4E9', 'North America (Euro-American)': '#7b6d8d', 'Africa (sub-Saharan)': '#7f7f7f', 'Oceania': '#000000', unassigned: '#596764' };
  const FAM_COL = { 'grasping (forceps/tweezers)': '#28685e', blade: '#94603c', 'probe / spatula / spoon': '#52648b', 'speculum / dilator': '#CC79A7' };
  const GROUP_COL = { 'Non-Western': '#D55E00', 'Western reference': '#52648b', Unassigned: '#596764' };
  const CAT = ['#28685e', '#94603c', '#52648b', '#E69F00', '#CC79A7', '#009E73', '#D55E00', '#56B4E9', '#7f7f7f', '#8c6d1f', '#4d4d4d'];
  const MAT_LABEL = { copper_alloy: 'Copper alloy', iron_steel: 'Iron / steel', gold: 'Gold', silver: 'Silver', lead_tin: 'Lead / tin', bone_ivory: 'Bone / ivory', wood: 'Wood', stone_glass: 'Stone / glass', textile_leather: 'Textile / leather', lacquer_resin: 'Lacquer / resin / rubber' };
  const REFERENCE = new Set(['Europe (post-classical)', 'Greece / Rome / Byzantium', 'North America (Euro-American)']);
  let M, T, G, ready = false, sel, shown = [], pinned = -1, hover = -1, view = 'space', cv, ctx, geo = null, bboxCache = {};

  const lab = (name, i) => T.label(name, i);
  const yearTxt = i => { const a = M.cols.y0[i], b = M.cols.y1[i]; if (a == null) return 'undated'; const f = y => y < 0 ? `${-y} BCE` : `${y} CE`; return a === b ? f(a) : `${f(a)} – ${f(b)}`; };
  const matTxt = i => M.material_classes.filter((m, k) => M.cols.mat[i] & (1 << k)).map(m => MAT_LABEL[m] || m).join(', ') || 'not recorded';

  function sil(i, w, h, color, extra) {
    const d = M.cols.sil[i]; if (!d) return '';
    let b = bboxCache[i];
    if (!b) { const nums = d.match(/-?\d+/g).map(Number); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let k = 0; k + 1 < nums.length; k += 2) { x0 = Math.min(x0, nums[k]); x1 = Math.max(x1, nums[k]); y0 = Math.min(y0, nums[k + 1]); y1 = Math.max(y1, nums[k + 1]); } b = bboxCache[i] = [x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6]; }
    return `<svg role="img" aria-label="Outline of ${esc(M.cols.title[i])}" width="${w}" height="${h}" viewBox="${b.join(' ')}" preserveAspectRatio="xMidYMid meet" ${extra || ''}><path d="${d}" fill="${color}" fill-rule="evenodd"/></svg>`;
  }

  function colorFn(mode) {
    const col = M.cols, dicts = M.dicts;
    if (mode === 'family') return i => FAM_COL[dicts.family[col.family[i]]] || '#7f7f7f';
    if (mode === 'region') return i => REG_COL[dicts.region[col.region[i]]] || '#7f7f7f';
    if (mode === 'group') return i => GROUP_COL[grp(i)];
    if (mode === 'material') { const cols = { 0: '#94603c', 1: '#243b3b', 2: '#E69F00', 3: '#8c8c8c', 4: '#4d4d4d', 5: '#56B4E9', 6: '#009E73', 7: '#7b6d8d', 8: '#c9a227', 9: '#a05195' }; return i => { const m = col.mat[i]; if (!m) return '#d6ded6'; return cols[Math.log2(m & -m)] || '#7f7f7f'; }; }
    if (mode === 'date') return i => { const y = col.y0[i]; if (y == null) return '#d6ded6'; const t = Math.max(0, Math.min(1, (y - 1600) / 400)); return `hsl(${200 - 170 * t},55%,${55 - 12 * t}%)`; };
    const order = T.groupCount('coll').map(r => r.label); return i => CAT[Math.min(order.indexOf(lab('coll', i)), CAT.length - 1)];
  }
  const grp = i => { const r = lab('region', i); return M.cols.nw[i] ? 'Non-Western' : (REFERENCE.has(r) ? 'Western reference' : 'Unassigned'); };

  function legendFor(mode) {
    const item = (c, t, n) => `<span><i style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${c};margin-right:6px;vertical-align:-1px"></i>${esc(t)}${n != null ? ` (${n})` : ''}</span>`;
    const g = T.groupCount(mode === 'group' ? 'grp' : mode === 'material' ? 'matfirst' : mode === 'date' ? 'family' : mode === 'collection' ? 'coll' : mode, sel);
    if (mode === 'date') return item('hsl(200,55%,55%)', '1600') + item('hsl(115,55%,49%)', '1800') + item('hsl(30,55%,43%)', '2000 CE') + item('#d6ded6', 'undated');
    const colour = colorFn(mode);
    return g.slice(0, 12).map(r => { const k = shown.length ? shown.find(j => lab(mode === 'group' ? 'grp' : mode === 'material' ? 'matfirst' : mode === 'collection' ? 'coll' : mode, j) === r.label) : null; return item(k != null ? colour(k) : '#999', r.label || 'none', r.n); }).join('');
  }

  // ------------------------------------------------------------------ filtering
  function spec() {
    const v = id => $(id).value, s = {};
    if (v('m-coll')) s.coll = [v('m-coll')];
    if (v('m-region')) s.region = [v('m-region')];
    if (v('m-family')) s.family = [v('m-family')];
    if (v('m-group')) s.grp = [v('m-group')];
    const m = v('m-mat'); if (m === 'none') s.mat = { none: -1 }; else if (m === 'any') s.mat = { any: -1 }; else if (m) s.mat = { any: 1 << M.material_classes.indexOf(m) };
    const p = v('m-period'); if (p) { const [a, b] = p.split(','); s.y0 = { from: +a, to: +b }; }
    if ($('m-q').value.trim()) s.text = $('m-q').value.trim();
    return s;
  }
  function refresh() {
    sel = T.select(spec()); shown = T.indices(sel);
    const n = shown.length, nw = shown.filter(i => M.cols.nw[i]).length;
    const filterCount=Object.keys(spec()).length,filterSummary=document.querySelector('.morph-filters summary');if(filterSummary)filterSummary.textContent=filterCount?`Filter specimens (${filterCount} active)`:'Filter specimens';
    $('m-status').textContent = `${n.toLocaleString()} of ${M.n.toLocaleString()} analysed specimens match (${nw.toLocaleString()} non-Western). Shapes are dimensionless; physical size is unknown for most records.`;
    if (pinned >= 0 && !sel[pinned]) pinned = -1;
    render();
  }

  // ------------------------------------------------------------------ views
  function render() {
    for (const v of ['space', 'coverage', 'europe', 'pairs', 'method']) $('m-v-' + v).hidden = v !== view;
    $('m-colour-wrap').hidden = view !== 'space';
    ({ space: drawSpace, coverage: drawCoverage, europe: drawEurope, pairs: drawPairs, method: drawMethod })[view]();
  }

  function layout() {
    const r = cv.parentElement.getBoundingClientRect(), dpr = window.devicePixelRatio || 1, w = Math.max(240, Math.floor(r.width)), h = Math.max(420, Math.min(640, Math.floor(w * 0.62)));
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }
  let xs, ys, X0, X1, Y0, Y1;
  function proj(i, w, h) { const pad = 14; return [pad + (xs[i] - X0) / (X1 - X0) * (w - 2 * pad), h - pad - (ys[i] - Y0) / (Y1 - Y0) * (h - 2 * pad)]; }
  function drawSpace() {
    const { w, h } = layout(), colour = colorFn($('m-colour').value);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#d6ded6';
    for (let i = 0; i < M.n; i++) if (!sel[i]) { const [x, y] = proj(i, w, h); ctx.fillRect(x - 1, y - 1, 2, 2); }
    ctx.globalAlpha = 0.85;
    for (const i of shown) { const [x, y] = proj(i, w, h); ctx.fillStyle = colour(i); ctx.beginPath(); ctx.arc(x, y, M.cols.nw[i] ? 3.6 : 2.4, 0, 6.2832); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (pinned >= 0) {
      const [px, py] = proj(pinned, w, h); ctx.strokeStyle = '#94603c'; ctx.lineWidth = 1.2;
      for (const j of M.cols.nn[pinned]) { const [x, y] = proj(j, w, h); ctx.globalAlpha = sel[j] ? 0.9 : 0.35; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(px, py, 8, 0, 6.2832); ctx.stroke();
    }
    $('m-legend').innerHTML = legendFor($('m-colour').value);
    $('m-table').innerHTML = shown.slice(0, 40).map(i => `<tr data-i="${i}"><td><button class="record-link" data-pin="${i}">${esc(M.cols.title[i] || M.cols.id[i])}</button></td><td>${esc(lab('coll', i))}</td><td>${esc(lab('region', i))}</td><td>${esc(lab('family', i))}</td><td>${yearTxt(i)}</td><td>${esc(matTxt(i))}</td></tr>`).join('') || '<tr><td colspan="6">No specimens match these filters.</td></tr>';
    $('m-table-note').textContent = shown.length > 40 ? `First 40 of ${shown.length.toLocaleString()} matches. Narrow the filters or search to see others.` : '';
    detail();
  }
  function nearest(mx, my) {
    const { w, h } = { w: parseFloat(cv.style.width), h: parseFloat(cv.style.height) }; let best = -1, bd = 100;
    for (const i of shown) { const [x, y] = proj(i, w, h), d = (x - mx) ** 2 + (y - my) ** 2; if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function card(i, big) {
    const link = M.cols.url[i] ? `<a href="${esc(M.cols.url[i])}" target="_blank" rel="noopener">Source record</a>` : 'No source URL in dataset';
    const tree = M.cols.tree[i] ? `<p><button data-tree="${esc(M.cols.tree[i])}">Open in the family tree</button></p>` : '';
    const permanent=M.cols.permanent_id?.[i];
    return `<div class="m-card">${permanent?`<p class="record-id"><a href="collection.html#item/${permanent}">#${permanent} · Full record →</a></p>`:''}${sil(i, big ? 300 : 150, big ? 90 : 46, '#243b3b')}<h3>${esc(M.cols.title[i] || M.cols.id[i])}</h3><dl><dt>Collection</dt><dd>${esc(lab('coll', i))} · ${esc(M.cols.id[i])}</dd><dt>Region · family</dt><dd>${esc(lab('region', i))} · ${esc(lab('family', i))}</dd><dt>Date</dt><dd>${yearTxt(i)}</dd><dt>Material (catalogue)</dt><dd>${esc(matTxt(i))}</dd>${M.cols.places[i] ? `<dt>Maker place(s)</dt><dd>${esc(M.cols.places[i].replace(/;/g, ', '))}</dd>` : ''}<dt>Silhouette aspect</dt><dd>${M.cols.aspect[i]} (length : breadth, from one photograph)</dd></dl><p class="filter-help">${link}. Outline derived from a third-party photograph; shape only, no scale.</p>${tree}</div>`;
  }
  function detail() {
    const box = $('m-detail');
    if (pinned < 0) { box.innerHTML = '<p class="filter-help">Hover a point for an outline; click to pin it. Lines then join the pinned specimen to its eight nearest neighbours in shape space (the similarity graph). Dim dots are outside the current filters.</p>'; return; }
    box.innerHTML = card(pinned, true) + `<h3>Eight most similar outlines</h3><div class="m-nn">${M.cols.nn[pinned].map(j => `<button class="m-nnbtn" data-pin="${j}" title="${esc(M.cols.title[j])}">${sil(j, 110, 38, REG_COL[lab('region', j)] || '#243b3b')}<small>${esc(lab('region', j).split(' (')[0])} · ${esc(lab('coll', j))}</small></button>`).join('')}</div><p class="filter-help">Nearest by combined profile, Fourier and scalar distance. Similar shape is not evidence of contact or descent.</p>`;
  }

  function drawCoverage() {
    const ct = T.crossCount('region', 'family', sel), total = shown.length, nw = shown.filter(i => M.cols.nw[i]).length;
    const mx = Math.max(1, ...ct.m.flatMap(r => Array.from(r)));
    const rows = ct.rows.map((r, a) => ({ r, tot: ct.m[a].reduce((p, q) => p + q, 0), m: ct.m[a] })).filter(x => x.tot > 0).sort((p, q) => q.tot - p.tot);
    $('m-v-coverage').innerHTML = `<h3>Who is in the data</h3><p>${total.toLocaleString()} specimens in view; <strong>${nw.toLocaleString()} (${total ? (100 * nw / total).toFixed(1) : 0}%) are non-Western</strong> by our coding (Egypt/Nile is counted as non-Western here; the stricter definition is in the method view). Zero or tiny rows are data gaps, not absence of instruments.</p>
    <div class="table-wrap"><table class="audit-table"><caption>Specimens passing shape QC by region and morphological family (current filters)</caption><thead><tr><th>Region</th>${ct.cols.map(c => `<th>${esc(c || 'unlabelled')}</th>`).join('')}<th>Total</th></tr></thead><tbody>${rows.map(x => `<tr><th>${esc(x.r)}</th>${Array.from(x.m).map(v => `<td style="background:rgba(40,104,94,${v ? 0.12 + 0.6 * Math.sqrt(v / mx) : 0});font-variant-numeric:tabular-nums">${v || ''}</td>`).join('')}<td><strong>${x.tot}</strong></td></tr>`).join('')}</tbody></table></div>
    <h3>By collection</h3><div class="audit-bars">${T.groupCount('coll', sel).map(r => `<div><span>${esc(r.label)}</span><meter min="0" max="${total}" value="${r.n}"></meter><strong>${r.n}</strong></div>`).join('')}</div>
    <h3>Not harvested (and why)</h3><ul>${Object.entries(M.access.not_harvested || {}).map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('')}</ul>`;
  }

  function drawEurope() {
    const W = 760, H = 520, k = 24, X = lon => (lon + 8) * k * 0.62, Y = lat => (62 - lat) * k * 0.98;
    const counts = {};
    for (const i of shown) { const ps = (M.cols.places[i] || '').split(';').filter(Boolean); for (const p of ps) counts[p] = (counts[p] || 0) + 1 / ps.length; }
    const holders = {}; for (const i of shown) { const c = lab('coll', i); if (M.holders[c]) holders[c] = (holders[c] || 0) + 1; }
    const landPath = M.land.replace(/M([-\d.]+) ([-\d.]+)|L([-\d.]+) ([-\d.]+)/g, (m, a, b, c, d) => (a !== undefined ? 'M' : 'L') + X(+(a ?? c)).toFixed(1) + ' ' + Y(+(b ?? d)).toFixed(1));
    const lx = M.holders['Museum Boerhaave'][1], ly = M.holders['Museum Boerhaave'][0];
    const pl = Object.entries(counts).filter(([p]) => M.places[p]).sort((a, b) => b[1] - a[1]);
    const lines = pl.filter(([p]) => M.places[p][2] !== 'NL' && holders['Museum Boerhaave']).map(([p, n]) => `<line x1="${X(M.places[p][1])}" y1="${Y(M.places[p][0])}" x2="${X(lx)}" y2="${Y(ly)}" stroke="#28685e" stroke-opacity=".3" stroke-width="${0.4 + 0.18 * n}"/>`).join('');
    const dots = pl.map(([p, n]) => `<circle cx="${X(M.places[p][1])}" cy="${Y(M.places[p][0])}" r="${(3 + 2.2 * Math.sqrt(n)).toFixed(1)}" fill="#28685e" fill-opacity=".8" stroke="#fff"><title>${esc(p)}: ${n.toFixed(0)} records</title></circle>`).join('');
    const nlTotal = pl.filter(([p]) => M.places[p][2] === 'NL').reduce((a, [, n]) => a + n, 0);
    const labels = pl.filter(([p]) => M.places[p][2] !== 'NL').slice(0, 9).map(([p, n]) => `<text x="${X(M.places[p][1]) + 8}" y="${Y(M.places[p][0]) - 6}" font-size="11" fill="#243b3b">${esc(p)} (${n.toFixed(0)})</text>`).join('') + (nlTotal ? `<text x="${X(lx) - 6}" y="${Y(ly) - 22}" text-anchor="end" font-size="11" fill="#243b3b">Netherlands: ${nlTotal.toFixed(0)} records</text>` : '');
    const stars = Object.entries(holders).map(([c, n], si) => `<g><path d="M0-9L2.6-3 9-3 3.8 1 5.6 8 0 4-5.6 8-3.8 1-9-3-2.6-3Z" transform="translate(${X(M.holders[c][1])} ${Y(M.holders[c][0])}) scale(${(0.9 + Math.sqrt(n) / 14).toFixed(2)})" fill="#243b3b" stroke="#fff"><title>${esc(c)}: ${n} specimens in view</title></path><text x="${X(M.holders[c][1]) + 10}" y="${Y(M.holders[c][0]) + 16 + (c === 'Museum Boerhaave' ? 10 : (c.startsWith('The Museum of Med') ? 12 : 0))}" font-size="10" fill="#596764">${esc(c.replace('The Museum of Mediterranean and Near Eastern Antiquities', 'Medelhavsmuseet').replace('Region Skåne medical history', 'Skåne'))}: ${n}</text></g>`).join('');
    const nPlaced = shown.filter(i => M.cols.places[i]).length, ed = M.results.europe_distribution;
    $('m-v-europe').innerHTML = `<h3>Maker/designer workshops named in catalogues, and the collections that hold the pieces</h3><p>Circles: workshops named in ${nPlaced.toLocaleString()} of the ${shown.length.toLocaleString()} specimens in view (lines run to Leiden, the largest holder). Stars: holding collections in Europe within the current filters. Use the filters above (period, collection, family) to change the picture.</p>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of workshops and holders in Europe" style="width:100%;max-width:${W}px;background:#e9eee8;border:1px solid var(--border)"><path d="${landPath}" fill="#fffdf8" stroke="#d6ded6" stroke-width=".6"/>${lines}${dots}${labels}${stars}</svg>
    <p class="warning">Reading limit: only ${(100 * ed.share_with_maker_place).toFixed(0)}% of Museum Boerhaave specimens carry a workshop place and this is one Dutch-dominated sample (${(100 * ed.share_makers_outside_NL).toFixed(0)}% of placed records name a place outside the Netherlands). It shows what reached and stayed in these collections, not the European distribution of instruments. Place = workshop named in a catalogue, not place of use.</p>`;
  }

  function drawPairs() {
    $('m-v-pairs').innerHTML = `<h3>Reciprocal nearest neighbours across regions</h3><p>Each pair: both specimens are the other's closest same-family outline in a different region, at least one outside the Western reference panel. These are <strong>similarity nominations to check, not evidence of transmission</strong>: shared function, shared physical constraint and independent invention also produce similar outlines.</p><div class="m-pairs">${M.pairs.map(([a, b, d]) => `<div class="m-pair"><div>${[a, b].map(i => `<button class="m-pairbtn" data-pin="${i}" data-go="space">${sil(i, 260, 54, REG_COL[lab('region', i)])}<small>${esc(lab('region', i).split(' (')[0])} · ${esc(M.cols.title[i] || M.cols.id[i])} · ${yearTxt(i)} · ${esc(matTxt(i))}</small></button>`).join('')}</div><span class="badge">distance ${d}</span></div>`).join('')}</div>`;
  }

  function drawMethod() {
    const R = M.results, vf = R.validation_function.boerhaave_function, bt = R.balanced_transfer, inc = R.inclusion, rs = R.region_signature_boerhaave, dn = R.design_name_coherence_obstetric, mc = R.material_coupling, dr = R.shape_vs_time_boerhaave;
    const f = (x, d = 2) => (x == null ? '–' : (+x).toFixed(d)), ci = c => c && c[0] != null ? `${f(c[0])}–${f(c[1])}` : '–';
    const names = { 'combined k=1': 'Combined distance, 1-NN', 'combined k=5': 'Combined distance, 5-NN', 'profile only k=1': 'Width/centreline profile only', 'fourier only k=1': 'Fourier outline only', 'scalar only k=1': 'Scalars only', 'background colour only (confound control) k=1': 'Photo background colour only (control)' };
    const nwRows = Object.entries(bt).filter(([k, v]) => v && v.n >= 4 && !/chance|Europe|Greece|North America|unassigned/.test(k)).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.n}</td><td>${f(v.own_region_in_reference)}</td><td>${f(v.own_region_held_out)}</td></tr>`).join('');
    $('m-v-method').innerHTML = `<div class="prose"><h3>What was measured</h3><p>Photographs are segmented against a fitted background, rotated to their principal axis and summarised by a width profile, a centreline-bend profile, rotation-invariant Fourier magnitudes and six scalars. All are dimensionless. Material is the catalogue's own wording mapped to a small vocabulary; it is missing for most Museum Boerhaave records. Of ${R.n_images_total.toLocaleString()} images, ${R.n_analysed.toLocaleString()} are analysed; exclusions: ${Object.entries(M.exclusions).map(([k, v]) => `${esc(k)} (${v})`).join('; ')}.</p>
    <h3>Does outline carry function information? (Museum Boerhaave, leave-one-out balanced accuracy, chance 0.33)</h3>
    <table class="audit-table"><thead><tr><th>Descriptor</th><th>Accuracy</th><th>95% CI</th></tr></thead><tbody>${Object.entries(names).map(([k, nm]) => `<tr><td>${nm}</td><td>${f(vf[k].bal_acc)}</td><td>${ci(vf[k].ci)}</td></tr>`).join('')}</tbody></table>
    <h3>What does having a region in the reference set buy? (class-balanced 1-NN, family label)</h3>
    <table class="audit-table"><thead><tr><th>Non-Western region</th><th>n</th><th>Own region in reference</th><th>Held out</th></tr></thead><tbody>${nwRows}<tr><td><strong>All non-Western</strong></td><td>${bt['ALL non-Western (all collections)'].n}</td><td>${f(bt['ALL non-Western (all collections)'].own_region_in_reference)}</td><td>${f(bt['ALL non-Western (all collections)'].own_region_held_out)}</td></tr></tbody></table>
    <p class="filter-help">Chance is 0.33. Held-out accuracy is near chance, and for Andean "tweezers" it is below chance: single-view silhouettes of folded flat plates resemble speculum blades, which says as much about the limits of outline-only description as about naming. Part of the in-reference gain is sibling objects from one find.</p>
    <h3>Other tests</h3><ul>
    <li><strong>Maker country</strong> (${Object.entries(rs.groups).map(([k, v]) => k + ' ' + v).join(', ')}): R² ${f(rs.permanova_unstratified.R2, 3)}, p ${f(rs.permanova_unstratified.p, 3)}; within function × 50-year strata p ${f(rs.permanova_within_function_x_50yr.p, 3)}. Small effect, not established.</li>
    <li><strong>Named obstetric designs</strong> (${Object.keys(dn.names).join(', ')}; n ${dn.n}): R² ${f(dn.permanova.R2, 3)}, p ${f(dn.permanova.p, 3)} (within period p ${f(dn.permanova_within_period.p, 3)}). The outline descriptor does not reliably recover documented design names.</li>
    <li><strong>Drift with date</strong> (Mantel ρ): ${Object.entries(dr).map(([k, v]) => `${esc(k)} ${f(v.spearman)} (p ${f(v.p, 3)}, n ${v.n})`).join('; ')}. Uncorrected for multiple tests.</li>
    <li><strong>Material</strong>: shape and material distance correlate weakly overall (ρ ${f(mc.mantel_shape_vs_material_within_family.spearman)}, p ${f(mc.mantel_shape_vs_material_within_family.p, 3)}); within region for grasping forms ρ ${f(mc.mantel_grasping_within_region.spearman)}, p ${f(mc.mantel_grasping_within_region.p, 2)} (n ${mc.mantel_grasping_within_region.n}). No material–shape coupling is established.</li></ul>
    <h3>Limits</h3><ul><li>Single uncontrolled-pose photographs; no scale; burnt-in labels and shadows occasionally enter masks.</li><li>Family labels come from catalogue wording and search provenance, not expert coding.</li><li>Several tests; p-values are not corrected across the study. AI-curated; no independent human review.</li><li>Non-Western coverage: ${inc.non_western_n} of ${inc.n} (${(100 * inc.non_western_share).toFixed(1)}%); most are tweezers or spatulas of undocumented use, so they test form comparison, not clinical practice.</li></ul>
    <p>Full write-up: <a href="MORPHOLOGY.md">MORPHOLOGY.md</a>, <a href="MUSEUM_SOURCES.md">MUSEUM_SOURCES.md</a>, <a href="DATA_ARCHITECTURE.md">DATA_ARCHITECTURE.md</a> in this folder.</p></div>`;
  }

  // ------------------------------------------------------------------ setup
  function fillSelect(id, entries, all) { $(id).innerHTML = `<option value="">${all}</option>` + entries.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join(''); }
  function init(data) {
    M = data; const c = M.cols, d = M.dicts;
    T = new Query.ColumnStore(M.n);
    T.addCategorical('coll', c.coll.map(k => d.collection[k])).addCategorical('region', c.region.map(k => d.region[k])).addCategorical('family', c.family.map(k => d.family[k]));
    T.addNumeric('y0', c.y0).addNumeric('y0_hi', c.y1).addBitmask('mat', c.mat);
    T.addCategorical('grp', Array.from({ length: M.n }, (_, i) => grp(i)));
    T.addCategorical('matfirst', c.mat.map(m => m ? (MAT_LABEL[M.material_classes[Math.log2(m & -m)]] || '') : 'not recorded'));
    T.addText('text', Array.from({ length: M.n }, (_, i) => `${c.title[i]} ${c.id[i]} ${c.places[i]} ${d.collection[c.coll[i]]} ${d.function[c.function[i]]}`));
    G = Query.Graph.fromKnn(c.nn);
    xs = c.x; ys = c.yy; X0 = Math.min(...xs); X1 = Math.max(...xs); Y0 = Math.min(...ys); Y1 = Math.max(...ys);
    const cnt = col => T.groupCount(col);
    fillSelect('m-coll', cnt('coll').map(r => [r.label, `${r.label} (${r.n})`]), 'All collections');
    fillSelect('m-region', cnt('region').map(r => [r.label, `${r.label} (${r.n})`]), 'All regions');
    fillSelect('m-family', cnt('family').map(r => [r.label, `${r.label} (${r.n})`]), 'All families');
    fillSelect('m-group', cnt('grp').map(r => [r.label, `${r.label} (${r.n})`]), 'Western reference + non-Western');
    const matCount = M.material_classes.map((m, k) => [m, T.count(T.select({ mat: { any: 1 << k } }))]).filter(x => x[1] > 0);
    fillSelect('m-mat', [['any', 'Any material recorded'], ['none', 'No material recorded'], ...matCount.map(([m, n]) => [m, `${MAT_LABEL[m] || m} (${n})`])], 'Any / unrecorded');
    fillSelect('m-period', [['-3000,1', 'Before 1 CE'], ['1,1199', '1–1199'], ['1200,1599', '1200–1599'], ['1600,1699', '17th century'], ['1700,1799', '18th century'], ['1800,1899', '19th century'], ['1900,1999', '20th century']], 'Any date');
    cv = $('m-canvas'); ctx = cv.getContext('2d');
    for (const id of ['m-view', 'm-coll', 'm-region', 'm-family', 'm-group', 'm-mat', 'm-period', 'm-colour']) $(id).addEventListener('change', () => { if (id === 'm-view') {view = $('m-view').value; history.replaceState(null,'','#morph/'+view);} refresh(); });
    $('m-q').addEventListener('input', refresh);
    $('m-reset').onclick = () => { for (const id of ['m-coll', 'm-region', 'm-family', 'm-group', 'm-mat', 'm-period']) $(id).value = ''; $('m-q').value = ''; pinned = -1; refresh(); };
    cv.addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(), i = nearest(e.clientX - r.left, e.clientY - r.top), tip = $('m-tip'); if (i === hover) { if (i >= 0) { tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 270) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; } return; } hover = i; if (i < 0) { tip.hidden = true; cv.style.cursor = 'default'; return; } cv.style.cursor = 'pointer'; tip.hidden = false; tip.innerHTML = `${sil(i, 240, 56, '#243b3b')}<strong>${esc(M.cols.title[i] || M.cols.id[i])}</strong><br><small>${esc(lab('coll', i))} · ${esc(lab('region', i).split(' (')[0])} · ${yearTxt(i)}<br>${esc(matTxt(i))}</small>`; tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 270) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; });
    cv.addEventListener('mouseleave', () => { $('m-tip').hidden = true; hover = -1; });
    cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(), i = nearest(e.clientX - r.left, e.clientY - r.top); if (i >= 0) { pinned = i; drawSpace(); } });
    $('morph').addEventListener('click', e => { const tr = e.target.closest('[data-tree]'); if (tr && typeof Museum !== 'undefined') { Museum.showInTree(tr.dataset.tree); return; } const b = e.target.closest('[data-pin]'); if (!b) return; pinned = +b.dataset.pin; if (b.dataset.go) { view = b.dataset.go; $('m-view').value = view; } if (!sel[pinned]) { $('m-reset').click(); pinned = +b.dataset.pin; } render(); });
    window.addEventListener('resize', () => { if (ready && !$('morph').hidden && view === 'space') drawSpace(); });
    ready = true; sel = new Uint8Array(M.n).fill(1); shown = T.indices(sel);
  }
  function show() { if (!ready) return; refresh(); }
  // Called from the family tree: open the shape space with this specimen pinned (filters cleared so it is visible).
  function pinKey(key) {
    if (!ready) {window.VestigiumLoadMorph?.().then(()=>pinKey(key)).catch(()=>{});return;} const i = M.cols.key.indexOf(key); if (i < 0) return;
    for (const id of ['m-coll', 'm-region', 'm-family', 'm-group', 'm-mat', 'm-period']) $(id).value = ''; $('m-q').value = '';
    view = 'space'; $('m-view').value = 'space'; pinned = i; refresh();
  }
  function setView(v) { if(!ready&&window.VestigiumLoadMorph){window.VestigiumLoadMorph().then(()=>setView(v)).catch(()=>{});return;} if (!ready || !['space', 'coverage', 'europe', 'pairs', 'method'].includes(v)) return; view = v; $('m-view').value = v; refresh(); }
  return { init, show, setView, pinKey, store: () => T, graph: () => G };
})();
