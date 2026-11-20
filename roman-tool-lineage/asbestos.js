// T-046: "Asbestos flagging" under Analyse → AI methods.  Every number on this page is a measurement from
// results/tables/asbestos_ai.json, exported as one file by scripts/web/unified/build.py
// (data/unified/<version>/asbestos.json, from scripts/analysis/asbestos_models.py).  This module draws that file;
// it does not score, train or fetch anything else.
//
// Lead's direction (2026-11-19): be direct.  The page leads with the call and how often it is right, in the
// order function / function + material / material, then shows the museum's own verdict beside the model's call for
// each of the 88 tested objects.  The frozen DINOv2/SigLIP probes are in the published table but are not charted.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const fmt = n => Number(n).toLocaleString('en');
const pct = (v, d = 1) => v == null ? '–' : (100 * Number(v)).toFixed(d) + ' %';
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
  const c = d.counts, m = d.markers, loc = d.location, inv = d.inventory, dec = d.decision;
  const best = dec.models.find(x => x.key === 'combination');
  const reference = {label: 'Always say "no"', sub: 'nothing contains asbestos; the number to beat',
    n: c.labelled, n_positive: c.positive, correct: dec.always_negative.correct,
    wrong: c.labelled - dec.always_negative.correct, accuracy: dec.always_negative.accuracy,
    accuracy_ci: null, sensitivity: 0, specificity: 1, best: null, auroc: 0.5};
  const steps = [
    ['data', 'Inspection list', `${fmt(inv.objects)} objects, ${fmt(inv.lines)} lines; ${fmt(inv.sampled_lines)} lines sampled`],
    ['data', 'Function labels', `${fmt(c.joined)} objects joined to the catalogue (${pct(c.join_rate)}), one codebook function each`],
    ['trained', 'Model trained here', `${fmt(c.labelled)} labelled objects (${fmt(c.positive)} positive, ${fmt(c.negative)} sampled negative)`],
    ['output', 'The call', `on the 88 it gets ${fmt(best.correct)} right; on the ${fmt(c.never_sampled)} unsampled it can only order a queue`],
  ];
  return `<div class="ai-asb">
  <div class="ai-toolbar"><div><h2>Asbestos flagging</h2><p>Museum Boerhaave's own sample results, and what a simple model makes of them.</p></div>
    <a href="figures/asbestos_by_function.pdf">Figure (PDF)</a></div>
  <p class="ai-lede">The museum sampled ${fmt(inv.sampled_lines)} of ${fmt(inv.lines)} inspection lines across ${fmt(inv.objects)} objects: <b>${fmt(c.positive)} objects contained asbestos</b>, ${fmt(c.negative)} were sampled and did not, and <b>${fmt(c.never_sampled)} were never sampled</b>. A model given the object's function and the materials named in the inspection gets <b>${fmt(best.correct)} of the ${fmt(c.labelled)} tested objects right (${pct(best.accuracy)})</b>, against ${fmt(dec.always_negative.correct)} of ${fmt(c.labelled)} (${pct(dec.always_negative.accuracy)}) for always saying no.</p>
  <p class="ai-caution">Not prevalence (the museum chose what to test); unknown is not negative; decision support, not a safety clearance.</p>

  <div class="ai-metrics">${[['Called right (function + material)', `${fmt(best.correct)} of ${fmt(best.n)}`],
    ['Always saying no', `${fmt(dec.always_negative.correct)} of ${fmt(c.labelled)}`],
    ['Objects that contained asbestos', `${fmt(c.positive)} of ${fmt(c.labelled)} sampled`],
    ['Never sampled (unknown)', fmt(c.never_sampled)]]
    .map(([name, n]) => `<div><strong>${esc(n)}</strong><span>${esc(name)}</span></div>`).join('')}</div>

  <section aria-labelledby="asb-call-h">
   <h3 class="ai-asb-h" id="asb-call-h">What the call is worth</h3>
   <p class="ai-asb-note">The call is "contains asbestos" when the model's probability is 0.5 or more. The probability is the mean of 20 repeats of out-of-fold predictions, so no object is scored by a model that saw it. Accuracy alone hides the error that matters, so the two ways of being right are shown separately.</p>
   ${accuracyTable([...dec.models, reference], c)}
   <p class="ai-asb-note">A <b>false "not"</b> is the costly error (an asbestos-containing object cleared): that is the "flags containing" column, ${fmt(Math.round(best.sensitivity * best.n_positive))} of ${fmt(best.n_positive)} here. Material alone is barely better than always saying no. "At its best cut-off" is optimistic — the cut-off is chosen on the same 88 objects — and only shows how much the 0.5 threshold costs. Full intervals and the frozen-vector probes (18 objects) are in the published table (<a href="data/unified/${esc(d.version)}/asbestos.json">asbestos.json</a>).</p>
  </section>

  <section aria-labelledby="asb-tested-h">
   <h3 class="ai-asb-h" id="asb-tested-h">The ${fmt(c.labelled)} objects the museum tested, and the model's call</h3>
   <p class="ai-asb-note">The museum's verdict first, then the model's call with function + material. ${fmt(dec.tested.filter(t => t.correct).length)} of ${fmt(dec.tested.length)} calls are right. Sorted: the objects that contain asbestos first, then those that do not, each by the model's score.</p>
   ${testedTable(dec.tested)}
  </section>

  <section aria-labelledby="asb-queue-h">
   <h3 class="ai-asb-h" id="asb-queue-h">Potentially containing: the ${fmt(c.never_sampled)} objects never tested</h3>
   <p class="asb-marker"><b>${fmt(m.never_sampled)} never-sampled objects carry the museum's own "Gevaarlijke stoffen / Hazardous substance" marker.</b> That is the museum's documentation, not a prediction, and it comes before any model score. The codes: ${m.codes.map(x => '<code>' + esc(x) + '</code>').join(' ')}.</p>
   <p class="ai-asb-note">Below that: the ${fmt(c.top30)} never-sampled objects the catalogue-words model ranks highest, out of ${fmt(c.scored_unknown)} it can score (${fmt(c.unknown_without_record)} have no catalogue record). That model is the only one that can be applied to an untested object, and it is weak (${pct(dec.models.find(x => x.key === 'text').accuracy)} right on the tested set, because it almost never says "contains"). So this list is a sampling order, not a verdict, and these objects are <b>unknown</b>, never "no asbestos". ${fmt(c.with_photo)} of the ${fmt(c.top30)} have a photograph in this collection.</p>
   ${queue(d.top30)}
  </section>

  <section aria-labelledby="asb-fn-h">
   <h3 class="ai-asb-h" id="asb-fn-h">How the sample splits by function</h3>
   <p class="ai-asb-note">Objects per codebook function, ${fmt(c.objects)} in all, and what the museum found. This is the sampling pattern, not prevalence: the museum chose what to test.</p>
   ${barLegend()}
   ${functionBars(d.functions, c.objects)}
  </section>

  <h3 class="ai-asb-h">How this was made</h3>
  <ol class="ai-flow" aria-label="How the inventory becomes a sampling queue">${steps.map(([k, t, s]) =>
    `<li data-kind="${k}"><small>${{data: 'Input', trained: 'AI trained here', output: 'Output'}[k]}</small><span><b>${esc(t)}</b><br>${esc(s)}</span></li>`).join('')}</ol>
  <p class="ai-flow-key"><b>AI trained here</b>: learned only from these ${fmt(c.labelled)} labels. The frozen DINOv2/SigLIP probes are in the published table and are not used here: they rest on ${fmt(18)} objects.</p>

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

function accuracyTable(rows, c) {
  return `<div class="table-wrap"><table class="ai-asb-table ai-asb-acc"><caption>At a 0.5 cut-off on the ${fmt(c.labelled)} tested objects. The interval is the 95 % group bootstrap over object numbers; "flags containing" counts the ${fmt(c.positive)} that contain asbestos, "clears clean" the ${fmt(c.negative)} that do not.</caption>
  <thead><tr><th scope="col">Model</th><th scope="col">Right</th><th scope="col">Accuracy (95 % CI)</th><th scope="col">Flags containing</th><th scope="col">Clears clean</th><th scope="col">At its best cut-off</th><th scope="col">AUROC</th></tr></thead>
  <tbody>${rows.map(r => `<tr${r.label === 'Function + material' ? ' class="picked"' : ''}>
    <th scope="row">${esc(r.label)}<small>${esc(r.sub)}</small></th>
    <td>${fmt(r.correct)} of ${fmt(r.n)}</td>
    <td><b>${pct(r.accuracy)}</b>${r.accuracy_ci ? ` <small>${pct(r.accuracy_ci[0])}–${pct(r.accuracy_ci[1])}</small>` : ''}</td>
    <td>${fmt(Math.round(r.sensitivity * r.n_positive))} of ${fmt(r.n_positive)}</td>
    <td>${fmt(Math.round(r.specificity * (r.n - r.n_positive)))} of ${fmt(r.n - r.n_positive)}</td>
    <td>${r.best ? `${pct(r.best.accuracy)} <small>at ${f2(r.best.threshold)}</small>` : '–'}</td>
    <td>${f2(r.auroc)}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function testedTable(tested) {
  const order = t => (t.label === 'asbestos_positive' ? 0 : 1);
  const rows = [...tested].sort((a, b) => order(a) - order(b) || b.p - a.p);
  const right = rows.filter(t => t.correct).length;
  return `<div class="table-wrap"><table class="ai-asb-table ai-asb-tested"><caption>${fmt(right)} of ${fmt(rows.length)} calls right. "The museum's sample" is the inspection result; "the model's call" is function + material at 0.5.</caption>
  <thead><tr><th scope="col">Object</th><th scope="col">Function</th><th scope="col">The museum's sample</th><th scope="col">The model's call</th><th scope="col">p</th><th scope="col">Right?</th></tr></thead>
  <tbody>${rows.map(t => `<tr>
    <td><b>${esc(t.objectnr)}</b><small>${esc(t.name)}</small></td>
    <td>${esc(words(t.function))}</td>
    <td><span class="asb-verdict ${t.label === 'asbestos_positive' ? 'pos' : 'neg'}">${t.label === 'asbestos_positive' ? 'contained asbestos' : 'no asbestos found'}</span></td>
    <td><span class="asb-verdict ${t.call === 'contains' ? 'pos' : 'neg'}">${t.call === 'contains' ? 'contains' : 'not'}</span></td>
    <td class="ai-asb-score">${Number(t.p).toFixed(2)}</td>
    <td><span class="asb-verdict ${t.correct ? 'ok' : 'bad'}">${t.correct ? 'right' : 'wrong'}</span></td></tr>`).join('')}
  </tbody></table></div>`;
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
