// T-046: "Asbestos flagging" under Analyse → AI methods.  Every number on this page is the T-045 measurement,
// exported as one file by scripts/web/unified/build.py (data/unified/<version>/asbestos.json, from
// results/tables/asbestos_ai.json).  This module draws that file; it does not score, train or fetch anything else.
// The four bar colours are the committed figure's (Okabe-Ito, unknown hatched), so the page and the PDF agree and
// the picture also reads in grayscale; every mark carries a text label.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const fmt = n => Number(n).toLocaleString('en');
const pct = v => v == null ? '–' : (100 * Number(v)).toFixed(1) + ' %';
const f2 = v => Number(v).toFixed(2);
const words = s => String(s || '').replace(/_/g, ' ');

async function load() {
  const cur = await (await fetch('data/unified/current.json', {cache: 'no-store'})).json();
  const r = await fetch('data/unified/' + cur.version + '/asbestos.json');
  if (!r.ok) throw Error('The asbestos view is not in this build (' + r.status + ').');
  return {...await r.json(), version: cur.version};
}

export async function render(context) {
  const host = context.root().querySelector('#ai-content');
  host.innerHTML = '<p role="status">Loading the asbestos table…</p>';
  try {
    const d = await load();
    host.innerHTML = view(d);
  } catch (e) {
    host.innerHTML = `<div class="empty" role="alert"><h2>The asbestos view could not load</h2><p>${esc(e.message)}</p></div>`;
  }
}

function view(d) {
  const c = d.counts, m = d.markers, loc = d.location, inv = d.inventory;
  const frozenN = d.models.find(x => x.group === 'frozen').n;
  const steps = [
    ['data', 'Inspection list', `${fmt(inv.objects)} objects, ${fmt(inv.lines)} lines; ${fmt(inv.sampled_lines)} lines sampled`],
    ['data', 'Function labels', `${fmt(c.joined)} objects joined to the catalogue (${pct(c.join_rate)}), one codebook function each`],
    ['trained', 'Model trained here', `${fmt(c.labelled)} labelled objects (${fmt(c.positive)} positive, ${fmt(c.negative)} sampled negative)`],
    ['frozen', 'Ready-made AI', `frozen image and title vectors, linear probe on ${fmt(frozenN)} objects`],
    ['output', 'Worth sampling', `${fmt(c.top30)} ranked by the catalogue-words model + ${fmt(m.never_sampled)} the museum itself marks hazardous`],
  ];
  return `<div class="ai-asb">
  <div class="ai-toolbar"><div><h2>Asbestos flagging</h2><p>Museum Boerhaave's own inventory and sample results, joined to the catalogue and put through three models.</p></div>
    <a href="figures/asbestos_by_function.pdf">Figure (PDF)</a></div>
  <p class="ai-lede">The museum inspected ${fmt(inv.objects)} objects for asbestos and sampled ${fmt(inv.sampled_lines)} of the ${fmt(inv.lines)} inspection lines. A positive line means the sampled component contains asbestos. A negative sample does not clear the object, and an object never sampled is unknown — never negative. This view orders a sampling queue; it is not a list of objects that contain asbestos.</p>
  <p class="ai-caution">Not prevalence (the museum chose what to test); unknown is not negative; decision support, not a safety clearance.</p>

  <div class="ai-metrics">${[['Objects in the inventory', fmt(inv.objects)], ['Joined to the catalogue', fmt(c.joined) + ' · ' + pct(c.join_rate)],
    ['Labelled (positive / negative)', c.labelled + ' · ' + c.positive + ' / ' + c.negative], ['Never sampled (unknown)', fmt(c.never_sampled)]]
    .map(([name, n]) => `<div><strong>${esc(n)}</strong><span>${esc(name)}</span></div>`).join('')}</div>

  <h3 class="ai-asb-h">How the inventory becomes a sampling queue</h3>
  <ol class="ai-flow" aria-label="How the inventory becomes a sampling queue">${steps.map(([k, t, s]) =>
    `<li data-kind="${k}"><small>${{data: 'Input', trained: 'AI trained here', frozen: 'Ready-made AI', output: 'Output'}[k]}</small><span><b>${esc(t)}</b><br>${esc(s)}</span></li>`).join('')}</ol>
  <p class="ai-flow-key"><b>AI trained here</b>: learned only from these ${fmt(c.labelled)} labels. <b>Ready-made AI</b>: downloaded and used unchanged. Two models cannot be applied to the unknown set — the material words exist only for objects already inspected, and the frozen vectors exist for ${fmt(frozenN)} objects.</p>

  <section aria-labelledby="asb-compare-h">
   <h3 class="ai-asb-h" id="asb-compare-h">Function, material, and function with material</h3>
   <p class="ai-asb-note">Ranking the ${fmt(c.labelled)} labelled objects, cross-validated in 5 folds grouped by object number, 20 repeats, seed 17. Dot = AUROC, bar = 95 % group-bootstrap interval. Grey rows are reference points, not candidates.</p>
   ${legend()}
   ${dotPlot(d.models)}
   <p class="ai-asb-note">Function alone (${f2(pick(d, 'three', 0).auroc)}) does not beat the per-function rate (${f2(pick(d, 'base', 1).auroc)}); the material words do most of the work, but they come from the inspection lines and exist for <b>1 of the ${fmt(c.never_sampled)}</b> never-sampled objects, so that model only re-describes what the museum already inspected. The museum's own catalogue phrase "Gevaarlijke stoffen / Hazardous substance" is a feature of no model, so none of these numbers restates it.</p>
  </section>

  <section aria-labelledby="asb-fn-h">
   <h3 class="ai-asb-h" id="asb-fn-h">Positive, sampled negative and never sampled, by function</h3>
   <p class="ai-asb-note">Objects per codebook function, ${fmt(c.objects)} in all. The bar length is the object count; the segments are what the museum found.</p>
   ${barLegend()}
   ${functionBars(d.functions, c.objects)}
  </section>

  <section aria-labelledby="asb-queue-h">
   <h3 class="ai-asb-h" id="asb-queue-h">Worth sampling next</h3>
   <p class="asb-marker"><b>${fmt(m.never_sampled)} never-sampled objects carry the museum's own "Gevaarlijke stoffen / Hazardous substance" marker.</b> That is documentation, not a prediction, and it comes before any model score. The codes: ${m.codes.map(x => '<code>' + esc(x) + '</code>').join(' ')}.</p>
   <p class="ai-asb-note">Below that: the ${fmt(c.top30)} never-sampled objects the catalogue-words model ranks highest, out of ${fmt(c.scored_unknown)} scored (${fmt(c.unknown_without_record)} have no catalogue record and cannot be scored). The score orders a queue; it is not a probability. ${fmt(c.with_photo)} of these ${fmt(c.top30)} have a photograph in this collection.</p>
   ${queue(d.top30)}
  </section>

  <section class="panel ai-asb-loc" aria-labelledby="asb-loc-h">
   <h2 id="asb-loc-h">Storage codes: waiting for the museum</h2>
   <p>${loc.ready ? `${fmt(loc.coded)} of ${fmt(loc.rows)} rows have a storage code; the depot plan is drawn from the filled template.` :
     `The location template has ${fmt(loc.rows)} rows and its <code>location_code</code> column is still empty (${fmt(loc.coded)} coded), so no depot plan can be drawn yet.`}
     The columns are <code>objectnr, location_code, function, label, score</code>; the filled file is read by <code>${esc(loc.script)}</code>, which groups by code and colours each cell by the worst label present.</p>
   <div class="ai-asb-codes" role="img" aria-label="Placeholder depot plan: ${esc(loc.rows)} objects, ${fmt(loc.coded)} storage codes">${Array.from({length: 24}, () => '<span aria-hidden="true">—</span>').join('')}</div>
   <p class="ai-asb-note">Placeholder, not a plan: one cell per storage code once the museum fills the template.</p>
  </section>
  </div>`;
}

const pick = (d, group, i) => d.models.filter(x => x.group === group)[i];
function legend() {
  return '<p class="ai-asb-legend" aria-hidden="true"><span><i class="ai-dot ai-dot-circle" style="--dot:var(--accent)"></i>Trained here</span>' +
    '<span><i class="ai-dot ai-dot-square" style="--dot:var(--muted)"></i>Baseline</span>' +
    '<span><i class="ai-dot ai-dot-diamond" style="--dot:var(--textual)"></i>Catalogue words</span>' +
    '<span><i class="ai-dot ai-dot-hollow ai-dot-circle" style="--dot:var(--bronze)"></i>Ready-made AI</span></p>';
}
function dotPlot(models) {
  const lo = 0.4, hi = 1, pos = v => Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100));
  const ticks = [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const shape = {three: 'circle', base: 'square', text: 'diamond', frozen: 'hollow'};
  const colour = {three: 'var(--accent)', base: 'var(--muted)', text: 'var(--textual)', frozen: 'var(--bronze)'};
  return `<div class="ai-dotplot"><div class="ai-dot-axis" aria-hidden="true"><span></span><span class="ai-dot-track">${ticks.map(t => `<i style="left:${pos(t)}%">${t.toFixed(1)}</i>`).join('')}</span><span></span></div>
  <ul>${models.map(m => `<li><span class="ai-dot-label">${esc(m.label)}<small>${esc(m.sub)} · n = ${fmt(m.n)}</small></span>
    <span class="ai-dot-track">${ticks.map(t => `<i class="ai-grid" style="left:${pos(t)}%"></i>`).join('')}
      <i class="ai-dot-ci" style="left:${pos(m.ci[0])}%;width:${pos(m.ci[1]) - pos(m.ci[0])}%;background:${colour[m.group]}"></i>
      <i class="ai-dot ai-dot-${shape[m.group]}" style="left:${pos(m.auroc)}%;--dot:${colour[m.group]}"></i></span>
    <span class="ai-dot-value">${f2(m.auroc)}<small>${f2(m.ci[0])}–${f2(m.ci[1])}</small></span></li>`).join('')}</ul></div>`;
}
function barLegend() {
  return '<p class="ai-asb-legend" aria-hidden="true"><span><i class="sw pos"></i>asbestos-containing</span><span><i class="sw neg"></i>sampled, not asbestos</span>' +
    '<span><i class="sw unk"></i>never sampled (unknown)</span><span><i class="sw vis"></i>seen as a copy by eye</span></p>';
}
function functionBars(functions, total) {
  const rows = [...functions].sort((a, b) => (a.function === 'no catalogue record') - (b.function === 'no catalogue record') || b.objects - a.objects);
  const max = Math.max(...rows.map(r => r.objects));
  return `<ul class="ai-asb-bars">${rows.map(r => {
    const seg = [['pos', r.positive, 'asbestos-containing'], ['neg', r.sampled_negative, 'sampled, not asbestos'],
      ['unk', r.unknown, 'never sampled (unknown)'], ['vis', r.visual_copy, 'seen as a copy by eye']]
      .filter(([, v]) => v).map(([k, v, t]) => `<i class="${k}" style="width:${v / max * 100}%" title="${v} ${t}"></i>`).join('');
    return `<li><span class="ai-asb-fn">${esc(r.function)}${r.function === 'no catalogue record' ? ' <small>(not a function)</small>' : ''}</span>
      <span class="ai-asb-stack" role="img" aria-label="${esc(r.function)}: ${r.objects} objects, ${r.positive} asbestos-containing, ${r.sampled_negative} sampled not asbestos, ${r.unknown} never sampled, ${r.visual_copy} seen as a copy">${seg}</span>
      <b>${r.objects}</b></li>`;
  }).join('')}</ul>
  <details class="ai-exp-details"><summary>Counts, and the positive share among sampled objects</summary>
  <div class="table-wrap"><table class="ai-asb-table"><caption>${fmt(total)} objects in 16 rows, including "no catalogue record". The share is among objects the museum sampled, with a Wilson 95 % interval.</caption>
  <thead><tr><th scope="col">Function</th><th scope="col">Objects</th><th scope="col">Asbestos-containing</th><th scope="col">Sampled negative</th><th scope="col">Never sampled</th><th scope="col">Seen as copy</th><th scope="col">Share of sampled (95 % CI)</th></tr></thead>
  <tbody>${rows.map(r => `<tr><th scope="row">${esc(r.function)}</th><td>${r.objects}</td><td>${r.positive}</td><td>${r.sampled_negative}</td><td>${r.unknown}</td><td>${r.visual_copy}</td>
    <td>${r.positive_rate_among_sampled == null ? '–' : `${pct(r.positive_rate_among_sampled)} <small>(${pct(r.positive_rate_ci95[0])}–${pct(r.positive_rate_ci95[1])})</small>`}</td></tr>`).join('')}</tbody></table></div></details>`;
}
function queue(top) {
  return `<div class="table-wrap"><table class="ai-asb-table ai-asb-queue"><caption>The catalogue-words model's queue of never-sampled objects. Evidence words are the three largest contributions to that object's score.</caption>
  <thead><tr><th scope="col">#</th><th scope="col">Object</th><th scope="col">Function</th><th scope="col">Score</th><th scope="col">Evidence words</th></tr></thead>
  <tbody>${top.map(t => `<tr><td class="ai-asb-rank">${t.rank}</td>
    <td><span class="ai-asb-obj">${t.photo ? `<span class="ai-thumb"><img src="${esc(t.photo)}" alt="" loading="lazy" decoding="async" width="44" height="44"></span>` :
      '<span class="ai-thumb" aria-hidden="true">—</span>'}<span><b>${esc(t.objectnr)}</b><small>${esc(t.name)}</small>${t.documented_marker ? '<em class="ai-asb-tag">museum marks it hazardous</em>' : ''}</span></span></td>
    <td>${esc(words(t.function))}</td><td class="ai-asb-score">${t.score.toFixed(3)}</td><td>${esc(t.evidence)}</td></tr>`).join('')}</tbody></table></div>
  <p class="ai-asb-note">A photograph is shown only where this collection already holds one; the other images were never downloaded (T-045 fetched the records, not the photographs).</p>`;
}
