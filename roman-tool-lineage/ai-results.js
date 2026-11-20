// T-048: the results-first opening view of Analyse -> AI methods, and the cards the AI tour reuses.
// Every number comes from data/unified/<version>/ai_results.json, which scripts/web/unified/ai_results.py copies from
// tables that already exist (ai-deep/summary.json, experiments.json, tasks.json, asbestos_ai.json, cluster_families.json).
// This module draws that file; it does not score, train or fetch anything else.  No tables on the opening view.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const fmt = n => Number(n).toLocaleString('en');
const pct = v => (100 * v).toFixed(1) + ' %';
const pc = v => (100 * v).toFixed(1);
export const thumb = im => !im ? '' : im[0] === 'S' ? 'science/img/t/' + im.slice(1) + '.jpg' : im[0] === 'C' ? 'img/c/' + im.slice(1, 3) + '/' + im.slice(1) + '.webp' : im;

export async function loadResults(prefix = '') {
  const cur = await (await fetch(prefix + 'data/unified/current.json', {cache: 'no-store'})).json();
  const r = await fetch(prefix + 'data/unified/' + cur.version + '/ai_results.json');
  if (!r.ok) throw Error('The AI results are not in this build (' + r.status + ').');
  return {...await r.json(), version: cur.version};
}

const WORKED = {yes: ['Worked', '✓'], partly: ['Partly', '~'], modest: ['Modest', '~']};
const chip = (kind, text) => '<span class="air-chip ' + kind + '"><i aria-hidden="true">' + ({right: '✓', wrong: '✗', none: '○', new: '+'}[kind] || '') + '</i>' + esc(text) + '</span>';

// a row of the dot chart: the point (and its 95 % interval) on a 0 to 100 % scale, beside what it is compared with
function dotRow(label, v, ci, cls, shown) {
  const lo = ci ? ci[0] : v, hi = ci ? ci[1] : v;
  return '<div class="air-row ' + cls + '"><span class="air-rl">' + esc(label) + '</span><span class="air-track" aria-hidden="true">' +
    (ci ? '<i class="air-ci" style="left:' + (100 * lo).toFixed(2) + '%;width:' + Math.max(0.6, 100 * (hi - lo)).toFixed(2) + '%"></i>' : '') +
    '<i class="air-dot" style="left:' + (100 * v).toFixed(2) + '%"></i></span><b>' + esc(shown) + '</b></div>';
}
function chart(m) {
  const h = m.headline, rows = [];
  const mainLabel = {lookalike: 'Photograph alone', groups: 'Median purity of the look-groups', search: 'Plain-word search', function: 'Supported by image neighbours', asbestos: 'Function + material'}[m.key];
  rows.push(dotRow(mainLabel, h.value, h.ci, 'main', pct(h.value) + (h.ci ? ' (' + pc(h.ci[0]) + ' to ' + pc(h.ci[1]) + ')' : '')));
  if (h.best) rows.push(dotRow(h.best.label, h.best.value, h.best.ci, 'best', pct(h.best.value) + ' (' + pc(h.best.ci[0]) + ' to ' + pc(h.best.ci[1]) + ')'));
  for (const b of h.baselines || []) if (b.value != null) rows.push(dotRow(b.label, b.value, b.ci, 'base', pct(b.value) + (b.ci ? ' (' + pc(b.ci[0]) + ' to ' + pc(b.ci[1]) + ')' : '')));
  return '<div class="air-chart" role="img" aria-label="' + esc(mainLabel + ' ' + pct(h.value) + (h.baselines || []).filter(b => b.value != null).map(b => ', against ' + b.label + ' ' + pct(b.value)).join('')) + '">' + rows.join('') + '</div>' +
    '<p class="air-scale" aria-hidden="true"><span>0</span><span>50 %</span><span>100 %</span></p>';
}

function pic(mini, id, cls, extra) {
  const x = mini[id];
  if (!x) return '';
  return '<a class="air-pic ' + (cls || '') + '" href="object.html?id=' + encodeURIComponent(id) + '" title="' + esc(x[0]) + '"><img loading="lazy" decoding="async" src="' + esc(thumb(x[1])) + '" alt="' + esc(x[0]) + '"><span>' + esc(x[2]) + '</span>' + (extra || '') + '</a>';
}

export function examples(m, d) {
  const mini = d.mini, items = m.examples.items;
  let out = '';
  if (m.key === 'lookalike') {
    const pick = [items[0], items[1], items.find(x => x.kind === 'miss') || items[2]].filter(Boolean);
    out = pick.map(x => '<div class="air-ex"><p class="air-exh">' + (x.kind === 'miss' ? chip('wrong', 'A miss, picked because it is wrong') : '<span class="air-draw">Drawn at random</span>') + ' <span>Query: ' + esc(x.cat) + '</span></p><div class="air-pics">' +
      pic(mini, x.q, 'q') + '<span class="air-arrow" aria-hidden="true">→</span>' + x.nb.map(n => pic(mini, n.id, '', chip(n.hit == null ? 'none' : n.hit ? 'right' : 'wrong', n.hit == null ? 'no category' : n.hit ? 'same category' : 'different category'))).join('') + '</div></div>').join('');
  } else if (m.key === 'groups') {
    out = items.map(x => '<div class="air-ex"><p class="air-exh">' + (x.kind === 'clean' ? chip('right', 'A clean group') : chip('wrong', 'A mixed group')) + ' <a href="clusters.html#' + esc(x.anchor) + '">' + esc(x.name) + '</a> <span>' + fmt(x.n) + ' objects, ' + x.n_museums + ' museums, purity ' + x.purity.toFixed(2) + '</span></p><div class="air-pics">' + x.ids.map(i => pic(mini, i)).join('') + '</div></div>').join('');
  } else if (m.key === 'search') {
    const pick = [items.find(x => x.lang === 'en'), items.find(x => x.lang === 'nl'), items.find(x => x.kind === 'worst') || items.find(x => x.lang === 'sv')].filter((x, i, a) => x && a.indexOf(x) === i);
    out = pick.map(x => '<div class="air-ex"><p class="air-exh">' + (x.kind === 'worst' ? chip('wrong', 'Weakest query') : '<span class="air-draw">Drawn at random</span>') + ' <b class="air-q">“' + esc(x.text) + '”</b> <span>' + x.lang.toUpperCase() + ', expects ' + esc(x.expected) + ', ' + pc(x.p20) + ' % of the top 20 right</span></p><div class="air-pics">' +
      x.hits.map(h => pic(mini, h.id, '', chip(h.hit == null ? 'none' : h.hit ? 'right' : 'wrong', h.hit == null ? 'unscored' : h.hit ? 'right' : 'wrong'))).join('') + '</div></div>').join('');
  } else if (m.key === 'function') {
    const say = {corroborated: ['right', 'supported by image neighbours'], image_hypothesis: ['new', 'image-only suggestion'], conflict: ['wrong', 'image neighbours disagree']};
    out = '<div class="air-ex"><div class="air-pics">' + items.map(x => pic(mini, x.id, 'fn', '<em class="air-fn">' + esc(x.fn) + '</em>' + chip(say[x.state][0], say[x.state][1]) +
      (x.state === 'conflict' ? '<small>The catalogue rule “' + esc(x.rule || '') + '” was right here: these are dental forceps, which extract teeth. The model was wrong.</small>' : x.state === 'image_hypothesis' ? '<small>No catalogue rule says this; not verified.</small>' : '<small>Catalogue rule “' + esc(x.rule || '') + '” agrees; not expert-checked.</small>'))).join('') + '</div></div>';
  } else if (m.key === 'asbestos') {
    out = '<div class="air-ex"><div class="air-pics">' + items.map(x => {
      const truth = x.label === 'asbestos_positive' ? 'contained asbestos' : 'sample was clean', call = x.call === 'contains' ? 'model: flags it' : 'model: clears it';
      return '<a class="air-pic fn"><img loading="lazy" decoding="async" src="' + esc(x.photo) + '" alt="' + esc(x.name) + '"><span>' + esc(x.name) + '</span><em class="air-fn">Museum test: ' + truth + '</em>' + chip(x.correct ? 'right' : 'wrong', call + (x.correct ? ', right' : ', wrong')) + '</a>';
    }).join('') + '</div></div>';
  }
  return '<div class="air-exs"><h4>Real predictions</h4>' + out + '<p class="air-rule">' + esc(m.examples.rule) + (m.examples.draw ? ' In this draw ' + m.examples.draw.same_category + ' of ' + m.examples.draw.neighbours_judged + ' judged neighbours share the query\'s category; ' + esc(m.examples.draw.note) + '.' : '') + '</p></div>';
}

export function cardHtml(m, d, o = {}) {
  const h = m.headline, w = WORKED[m.worked];
  const sd = '';
  const link = m.tab ? (o.href ? '<a class="btn" href="' + o.href + '">Open the details</a>' : '<button type="button" class="btn" data-ai-tab="' + m.tab + '">Open the details</button>') : '<a class="btn" href="' + (o.prefix || '') + m.link + '">' + esc(m.link_label) + '</a>';
  return '<article class="air-card" data-method="' + m.key + '" data-worked="' + m.worked + '"><div class="air-main"><p class="air-kick"><span class="air-badge ' + m.worked + '"><i aria-hidden="true">' + w[1] + '</i>' + w[0] + '</span></p>' +
    '<h3>' + esc(m.label) + '</h3><p class="air-line">' + esc(m.line) + '</p>' +
    '<p class="air-big"><b>' + pct(h.value) + '</b> <span>' + esc(h.what) + '</span></p>' + chart(m) +
    '<p class="air-n">' + esc(fmt(h.n)) + ' ' + esc(h.n_what) + (h.ci ? ' · 95 % interval shown as the whisker' + (h.ci_note ? ' (' + h.ci_note + ')' : '') : '') + sd + '.' + (h.spread ? ' ' + esc(h.spread[0].toUpperCase() + h.spread.slice(1)) + '.' : '') + '</p>' +
    (h.baseline_note ? '<p class="air-n air-bnote">' + esc(h.baseline_note) + '</p>' : '') +
    '<p class="air-cav">' + esc(m.caveat) + '</p><p class="air-act">' + link + '</p></div>' + examples(m, d) + '</article>';
}

// the scoreboard form of a card for the tour: question, one number, the dot chart, no pictures
export function compactHtml(m) {
  const h = m.headline, w = WORKED[m.worked];
  return '<article class="air-card air-compact" data-method="' + m.key + '" data-worked="' + m.worked + '"><div class="air-main"><p class="air-kick"><span class="air-badge ' + m.worked + '"><i aria-hidden="true">' + w[1] + '</i>' + w[0] + '</span></p><h3>' + esc(m.label) + '</h3>' +
    '<p class="air-big"><b>' + pct(h.value) + '</b> <span>' + esc(h.what) + '</span></p>' + chart(m) +
    '<p class="air-n">' + esc(fmt(h.n)) + ' ' + esc(h.n_what) + '.</p><p class="air-cav">' + esc(m.caveat) + '</p></div></article>';
}

export function failHtml(d, limit) {
  const rows = d.not_worked.slice(0, limit || d.not_worked.length);
  return '<ul class="air-fails">' + rows.map(x => '<li><b>' + esc(x.claim) + '</b><span>' + esc(x.evidence) + '</span><small>' + esc(x.finding === 'asbestos' ? 'asbestos_ai.json' : 'experiments.json, finding ' + x.finding) + '</small></li>').join('') + '</ul>' +
    '<p class="air-abst">' + esc(d.abstain.line) + '</p>';
}

// the AI-methods opening view
export function view(d, tabs) {
  return '<div class="air" id="ai-results"><header class="air-head"><h2>What the AI methods did here, and how well</h2>' +
    '<p class="air-lead">Five questions we asked of the models. For each: what it does, one number against what it is compared with, and real predictions, wrong ones included.</p>' +
    '<p class="air-act"><a class="btn fill" href="aitour.html?s=1">Take the 10-minute AI tour</a></p></header>' +
    d.methods.map(m => cardHtml(m, d)).join('') +
    '<section class="air-fail" aria-labelledby="air-fail-h"><h3 id="air-fail-h">What did not work, and where the models stay silent</h3>' + failHtml(d) + '</section>' +
    '<p class="air-blanket">' + esc(d.blanket) + '</p></div>';
}
