// Deep-representation views for Research -> AI Methods. Loaded on demand by ai.js.
// Every file is a static, SHA-256-verified projection of saved local experiments
// (data/<version>/ai-deep/). No model runs in the browser and nothing here writes labels.
let mapGen=null,betweenWindow=null,mapZoom={x0:0,y0:0,s:1},genPrompt=0,genView='space',summary,queryId,queryFilter='',mapName='silhouette',mapColor='category',mapClass=null,mapPage=0,mapSearch='',mapView=null,mapObserver,mapDim='2d',mapScale='compressed',mapRanges=true,mapTurn=[-0.6,0.42],space3d;
const loaded=new Map(),PAGE=20;
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
const f3=x=>Number.isFinite(x)?x.toFixed(3):'—',f2=x=>Number.isFinite(x)?x.toFixed(2):'—',pct=x=>Number.isFinite(x)?(x*100).toFixed(0)+'%':'—';
const pct1=x=>Number.isFinite(x)?(x>0&&x<0.1?(x*100).toFixed(1):(x*100).toFixed(0))+'%':'—';
const ci=(v,c)=>`${f3(v)}${c?` <small>[${f3(c[0])}, ${f3(c[1])}]</small>`:''}`;
const signed=x=>Number.isFinite(x)?(x>0?'+':x<0?'−':'±')+Math.abs(x).toFixed(3):'—';
const words=s=>String(s??'').replace(/_/g,' ');

// ---------- Verified loading (same contract as ai.js read()) ----------
async function readDeep(a,name){
 const r=await fetch(a.context.base+'ai-deep/'+name);
 if(!r.ok)throw Error(`Deep result unavailable (${r.status}). Retry when the dataset has finished publishing.`);
 const bytes=await r.arrayBuffer();
 if(name!=='summary.json'){
  if(!summary?.files?.[name])throw Error('Deep result is absent from the published manifest.');
  if(hex(await crypto.subtle.digest('SHA-256',bytes))!==summary.files[name])throw Error('Deep result checksum mismatch. Reload to use a consistent publication.');
 }
 const data=JSON.parse(new TextDecoder().decode(bytes));
 if(data.dataset_version&&data.dataset_version!==a.context.manifest.version)throw Error('Deep results belong to a different dataset release.');
 return data;
}
function cached(a,name){if(!loaded.has(name))loaded.set(name,readDeep(a,name).catch(err=>{loaded.delete(name);throw err}));return loaded.get(name)}
async function manifest(a){
 if(!summary){const s=await cached(a,'summary.json');if(s.schema_version!=='1.0.0'||s.dataset_version!==a.context.manifest.version){loaded.delete('summary.json');throw Error('Deep results do not match this dataset release.')}summary=s}
 return summary;
}
async function file(a,name){await manifest(a);return cached(a,name)}
async function item(a,id){await manifest(a);const shard=summary.shards[id];if(!shard)throw Error('No deep result for that identifier.');return (await cached(a,shard)).items[id]}

// ---------- Shared markup ----------
function seg(label,values,active,kind){return `<div class="ai-segments" role="group" aria-label="${label}">${values.map(([key,text])=>`<button type="button" data-ai-deep="${kind}" data-value="${key}" aria-pressed="${key===active}">${text}</button>`).join('')}</div>`}
function thumb(a,id,extra=''){const r=a.rows.get(id),name=r?.name||id;return `<a class="ai-thumb" href="#item/${id}" title="${a.esc(name)} · #${id}">${a.context.preview(r?.image,name)}${extra}</a>`}
function recordLine(a,id){const r=a.rows.get(id);return `<a href="#item/${id}">${a.esc(r?.name||id)}</a> <small class="record-id">#${id}</small>`}
function table(caption,head,body,cls=''){return `<div class="ai-deep-table ${cls}"><p class="ai-table-note">${caption}</p><div class="table-wrap"><table aria-label="${caption.replace(/<[^>]+>/g,'').replace(/"/g,'&quot;')}"><thead><tr>${head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${body.map(r=>`<tr>${r.map((c,i)=>i?`<td>${c}</td>`:`<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div></div>`}
export async function browse(a){return file(a,'browse.json')}
// Plain name and one sentence per deep similarity method (technical label and note follow in small print).
const METHOD_PLAIN={
 adapted:['Photo, object only','How alike the objects look to an image model retrained here to ignore museum photography (background, lighting, framing).'],
 photo:['Whole photo','How alike the whole photographs look to a ready-made image model. Background and lighting count too, so tools photographed the same way cluster.'],
 posefree:['Outline, any angle','How alike the black outlines look once each is turned to the same standard pose, so the photo angle and mirror image do not count.'],
 silhouette:['Outline (image model)','How alike the black outlines look to an image model, as photographed (angle counts).'],
 ends:['Working ends','How alike the two ends of the tool look, where it touches the body.'],
 multimodal:['Photo + outline + words','The average of photo, outline and catalog-word similarity.']};
// One line of benchmark evidence for the chosen method (summary.method_evidence, from the saved benchmark run).
function whyText(a,m){
 const v=summary?.method_evidence?.[m];if(!v)return '';
 if(m==='posefree'){const P=v.posefree,O=v.outline,d=v.vs_outline_xinst_p10;return `Angle-independent: in other museums ${pct(P.cross_institution_p10)} of its 10 closest unseen tools are the same kind of tool, vs ${pct(O.cross_institution_p10)} for the outline as photographed (+${(d.difference*100).toFixed(1)} points, 95% CI ${(d.ci95[0]*100).toFixed(1)} to ${(d.ci95[1]*100).toFixed(1)}) and ${pct(v.adapted_xinst_p10_mean)} for the default photo model. No photo background in it (R² ${f2(P.bg_r2)}) and the weakest museum effect (${f2(P.within_category_institution_enrichment)}×). <small>n = ${a.fmt(v.n)} held-out tools; pre-registered test ${a.esc(v.run_id)}.</small> <button type="button" class="ai-link" data-ai-deep="goto-exp" data-value="ai-exp-benchmark">Benchmark →</button>`}
 if(m==='adapted'){const A=v.adapted,R=v.reference_photo;return `Default: on unseen tools it finds the same kind of tool in other museums as often as the whole photo (${pct(A.cross_institution_p10.mean)} vs ${pct(R.cross_institution_p10.mean)} of the top 10), with far less photo background in it (R² ${f2(A.bg_r2.mean)} vs ${f2(R.bg_r2.mean)}). <small>n = ${a.fmt(v.n)}, ${v.seeds.length} seeds. Trained on catalog categories, so its own training tools partly rank by category.</small> <button type="button" class="ai-link" data-ai-deep="goto-exp" data-value="ai-exp-adaptation">Adaptation →</button>`}
 const lead={photo:'Highest benchmark score among ready-made models, but it also groups tools by how each museum photographs them.',shape:'Form only: no photograph texture or background, and the weakest museum effect.',silhouette:'Matches but does not beat the outline measurement (finding F4).',multimodal:'Uses catalog words, so its benchmark score is partly circular.'}[m]||'';
 return `${lead} In other museums, ${pct(v.cross_institution_p10)} of its 10 closest tools are the same kind of tool (random: ${pct(v.cross_institution_random_p10)}); tools from the query’s own museum are ${f2(v.within_category_institution_enrichment)}× over-represented (1.0 = no museum effect). <small>Cross-museum P@10 ${f3(v.cross_institution_p10)} [${f3(v.cross_institution_p10_ci[0])}, ${f3(v.cross_institution_p10_ci[1])}] vs random ${f3(v.cross_institution_random_p10)}; n = ${a.fmt(v.n)}.</small> <button type="button" class="ai-link" data-ai-deep="goto-exp" data-value="ai-exp-benchmark">Benchmark →</button>`;
}
export async function methodWhy(a,m){await manifest(a);const host=a.$('ai-method-why');if(host)host.innerHTML=whyText(a,m)}

export async function render(a,tab){
 if(tab==='retrieval')return similarity(a);
 if(tab==='evidence')return evidence(a);
 if(tab==='search')return search(a);
 if(tab==='map')return map(a);
 if(tab==='generate')return generate(a);
 if(tab==='experiments')return experiments(a);
}

// ---------- Similarity: deep methods ----------
function missingReason(n,method){
 if(!n.photo)return 'no image linked to this record';
 if(!n.silhouette)return method==='multimodal'?'no segmentable image; multimodal ranks need photo, silhouette and catalog text':'no segmentable image (background removal gave no usable outline)';
 if(method==='posefree')return 'its outline could not be turned to a standard pose (excluded by the outline-preparation rules: specks, border strips or no clear long axis)';
 if(method==='ends')return 'no segmentable image passing outline quality control, so no working-end crops were made';
 return 'this representation was not computed for the record';
}
async function similarity(a){
 const data=await item(a,a.selected);if(!a.current())return;
 const m=a.method,meta=summary.methods[m],list=data.neighbours[m],why=whyText(a,m);
 a.$('ai-content').innerHTML=`<div class="ai-toolbar">${a.methodBar()}<button type="button" class="quiet" data-ai-export="neighbors"${list?'':' disabled'}>Export these ranks</button></div><p class="ai-method-line"><strong>${METHOD_PLAIN[m]?.[0]||a.esc(meta.label)}</strong> · ${METHOD_PLAIN[m]?.[1]||''} Score: similarity, higher is closer. <small>${a.esc(meta.label)}, cosine. ${a.esc(meta.note)}</small></p>${why?`<p id="ai-method-why" class="ai-method-why">${why}</p>`:''}${list?a.ranked(m,list,'similarity')+`<p class="ai-caution ai-caution-after">Look-alikes can share form, mechanism or simply the way they were photographed; looking alike does not show the same use or a shared history. The tool itself and its known duplicates are left out.</p>`:`<div class="empty ai-deep-missing" role="status"><h2>Not available for this record</h2><p>${a.esc(meta.label)} neighbours are not available for this record (reason: ${missingReason(data.neighbours,m)}). No ranks were imputed.</p><button type="button" data-ai-method="text">Try catalog text</button></div>`}`;
 a.context.syncComparisons();
}
export async function exportJson(a,name){
 const data=await item(a,a.selected);
 if(name==='evidence')a.download(`${a.selected}-deep-evidence.json`,{dataset_version:summary.dataset_version,schema_version:summary.schema_version,item_id:a.selected,meaning:'Weak, source-derived evidence states. Calibrated values estimate agreement with existing rules on held-out groups, not the probability of actual use. Not training ground truth; human review deferred.',result:{hypotheses:data.hypotheses,near_duplicates:data.near_duplicates,category_conflict:data.category_conflict,modern_analogs:data.modern_analogs}});
 else{const meta=summary.methods[a.method];a.download(`${a.selected}-${a.method}-neighbors.json`,{dataset_version:summary.dataset_version,item_id:a.selected,method:a.method,label:meta.label,note:meta.note,feature_sha256:meta.feature_sha256,score:'cosine similarity; higher is closer',result:data.neighbours[a.method]})}
}

// ---------- Evidence ----------
// State wording follows configs/ml/hypotheses.json (states); icons give a non-colour cue.
const STATES={
 documented:['■','Documented','Source text records this use.'],
 corroborated:['✓','Corroborated','A catalog-context rule asserts it and an independent image channel agrees.'],
 rule_only:['◐','Rule only','A catalog-context rule asserts it; the image channels neither support nor contradict.'],
 image_hypothesis:['◆','Image hypothesis','No rule or document asserts it; image neighbours strongly suggest it. A new, unverified hypothesis.'],
 conflict:['✕','Conflict','A catalog-context rule asserts it; the photo channel strongly contradicts.'],
 abstain:['○','Abstain · unknown','Insufficient evidence. Unobserved, never negative.']};
const STATE_ORDER=Object.keys(STATES);
const FLAGS={
 photography_dependent:['Photography-dependent','Photo agreement exceeds silhouette agreement by at least the configured gap, so the signal may come from how the object was photographed (background, scale card, resolution) rather than its outline.'],
 silhouette_concurs:['Silhouette concurs','The outline-only channel also agrees, so this hypothesis does not depend on photograph background or texture.'],
 atypical_for_catalog_category:['Atypical for catalog category','Fewer than 10% of records in this catalog category carry the function; image look-alikes often share a mechanism rather than a use.'],
 typical_for_catalog_category:['Typical for catalog category','More than half of records in this catalog category carry the function; the image channel may miss a use that is not visible in 2-D form.']};
const GEOMETRY={bifurcated_end:'bifurcated (two-pronged) end',ring_handle:'ring handle (enclosed hole)',tapered_tip:'tapered tip',hooked_tip:'hooked tip'};
const chip=state=>`<span class="ai-state ai-state-${state}"><span aria-hidden="true">${STATES[state][0]}</span>${STATES[state][1]}</span>`;
function channel(a,name,[value,ids]){
 const label=name==='photo'?'Photo · DINOv2-L':'Silhouette · DINOv2-B';
 return `<div class="ai-channel" data-channel="${name}"><span class="ai-channel-name">${label}</span><span class="ai-meter" aria-hidden="true"><i style="width:${Number.isFinite(value)?value*100:0}%"></i></span><strong>${Number.isFinite(value)?value.toFixed(2):'Not calibrated'}</strong><span class="ai-thumbs" aria-label="Nearest ${name} neighbours">${ids.map(id=>thumb(a,id)).join('')}</span></div>`;
}
function functionRow(a,name,v){
 const state=v?.state||'abstain',img=v?.image||{};
 return `<article class="panel ai-fn" data-function="${name}" data-state="${state}"><div class="ai-fn-head"><h3>${name}</h3>${chip(state)}</div><div class="ai-fn-body"><p class="ai-fn-desc">${STATES[state][2]}</p>
 ${v?.flags?.length?`<ul class="ai-flags">${v.flags.map(x=>`<li data-flag="${x}"><strong>${FLAGS[x]?.[0]||a.esc(words(x))}.</strong> ${FLAGS[x]?.[1]||''}</li>`).join('')}</ul>`:''}
 ${v?.documented?.length?`<h4>Documented statements</h4><ul class="ai-fn-list">${v.documented.map(d=>`<li>${a.esc(d)}</li>`).join('')}</ul>`:''}
 ${v?.rules?.length?`<h4>What the catalog text says <small>catalog-context rule</small></h4><ul class="ai-fn-list">${v.rules.map(([rule,text])=>`<li><q>${a.esc(text)}</q> <small>Rule ${a.esc(rule)}</small></li>`).join('')}</ul>`:''}
 ${img.photo||img.silhouette?`<h4>Do look-alike tools agree? <small>Agreement with existing rules on held-out groups</small></h4><div class="ai-channels">${['photo','silhouette'].filter(k=>img[k]).map(k=>channel(a,k,img[k])).join('')}</div>`:''}
 ${v?.cues?.length?`<p class="ai-fn-cues">Linked visible-form cues: ${v.cues.map(c=>a.esc(words(c))).join(', ')}</p>`:''}</div></article>`;
}
async function evidence(a){
 const data=await item(a,a.selected);if(!a.current())return;
 const h=data.hypotheses,fns=summary.functions,counts={},state=f=>h.functions[f]?.state||'abstain';for(const f of fns){const s=state(f);counts[s]=(counts[s]||0)+1}
 // Abstentions that still carry rule or documented text keep their full row so no evidence is hidden.
 const detail=f=>state(f)!=='abstain'||h.functions[f]?.rules?.length||h.functions[f]?.documented?.length;
 const shown=fns.filter(detail).sort((x,y)=>STATE_ORDER.indexOf(state(x))-STATE_ORDER.indexOf(state(y))),quiet=fns.filter(f=>!detail(f));
 const support=shown.filter(f=>state(f)!=='abstain'),verdict=support.length?`Evidence for <strong>${support.map(f=>`${f} <small>(${STATES[state(f)][1].toLowerCase()})</small>`).join(', ')}</strong>.`:'No function has supporting evidence for this record.';
 const conflict=data.category_conflict;let codes={};
 if(conflict?.inspection){try{codes=(await file(a,'experiments.json')).disagreements.inspection.codes}catch{codes={}}if(!a.current())return}
 a.$('ai-content').innerHTML=`<div class="ai-toolbar"><div><h2>Function evidence</h2><p id="ai-evidence-verdict" class="ai-evidence-verdict">${verdict}</p><p id="ai-evidence-counts">${STATE_ORDER.filter(s=>counts[s]).map(s=>`${counts[s]} ${STATES[s][1].toLowerCase()}`).join(' · ')}</p></div><button type="button" class="quiet" data-ai-export="evidence">Export evidence</button></div>
 <p class="ai-caution">What the catalog and the images suggest this tool was for: leads for a curator to check, not conclusions. “No evidence” means unknown, never “not used for”. Expert review is still to come. <small>Weak, source-derived states (Experiments → Hypotheses). Image values are calibrated agreement with existing catalog rules on held-out groups, not the probability that the object was used this way.</small></p>
 ${!h.single?'<p class="ai-deep-note" role="note"><strong>Not a single-object unit.</strong> Depictions, documents and kits do not receive image hypotheses.</p>':''}
 ${conflict?`<p class="ai-deep-note" role="note" data-conflict><strong>Category check.</strong> Catalog category <em>${a.esc(words(conflict.catalog))}</em>, but ${pct(conflict.agreement)} of the ten nearest photo neighbours share <em>${a.esc(words(conflict.neighbours))}</em> (flagged at ≥ 7 of 10). ${conflict.inspection?`Inspection code <span class="chip">${a.esc(conflict.inspection)}</span> ${a.esc(codes[conflict.inspection]||'')} <small>Single-coder visual inspection; not expert review.</small>`:'Not yet visually inspected.'}</p>`:''}
 <details class="ai-state-key"><summary>State key</summary><dl>${STATE_ORDER.map(s=>`<dt>${chip(s)}</dt><dd>${STATES[s][2]}</dd>`).join('')}</dl></details>
 <div id="ai-functions" class="ai-functions">${shown.map(f=>functionRow(a,f,h.functions[f])).join('')}</div>
 ${quiet.length?`<div id="ai-abstained" class="ai-abstained-row">${chip('abstain')}<span>No evidence for</span><ul>${quiet.map(f=>`<li data-function="${f}" data-state="abstain">${f}</li>`).join('')}</ul></div>`:''}
 <div class="ai-evidence-context">
 <section class="panel ai-affordance" aria-labelledby="ai-affordance-title"><h3 id="ai-affordance-title">What the shape suggests <small>Physical affordance cues (visible form, not use)</small></h3><p class="muted">Which simple descriptions best match the photo, and what the outline’s two ends look like. From a flat photo with no scale, so this describes form, not how it was used. <small>Zero-shot SigLIP 2 prompt scores, centred; compare only within this record.</small></p>
 ${h.cues?.length?`<ol class="ai-cues">${h.cues.map(([cue,text,score])=>`<li><strong>${a.esc(words(cue))}</strong> <span>${a.esc(text)}</span> <small>match ${score.toFixed(3)}</small></li>`).join('')}</ol>`:'<p>No prompt cues: this record has no usable photograph.</p>'}
 <h4>Outline geometry</h4>${h.geometry?h.geometry.length?`<ul class="ai-geometry">${h.geometry.map(g=>`<li>${a.esc(GEOMETRY[g]||words(g))}</li>`).join('')}</ul>`:'<p>No geometric end cue passed its threshold.</p>':'<p>Not measured: no outline passed segmentation quality control.</p>'}</section>
 <section class="panel" aria-labelledby="ai-documented-title"><h3 id="ai-documented-title">Documented source statements</h3>${h.documented?.length?`<ul class="ai-fn-list">${h.documented.map(d=>`<li>${a.esc(d)}</li>`).join('')}</ul>`:'<p>None recorded. Missing documentation is not a negative label.</p>'}</section>
 <section class="panel" aria-labelledby="ai-duplicates-title"><h3 id="ai-duplicates-title">Possible duplicate photographs</h3>${data.near_duplicates.length?`<p class="muted">DINOv2-L photo cosine ≥ 0.98 across different known groups; inspect before treating as one object.</p><ul class="ai-dup-list">${data.near_duplicates.map(([id,c])=>`<li>${thumb(a,id)}<span>${recordLine(a,id)}<small>cosine ${c.toFixed(4)}</small></span></li>`).join('')}</ul>`:'<p>No near-duplicate photograph above the 0.98 merge threshold.</p>'}</section>
 ${data.modern_analogs?`<section class="panel" aria-labelledby="ai-analogs-title"><h3 id="ai-analogs-title">Modern look-alikes</h3><p class="muted">Present-day instruments from outside collections that look like this one. Looking alike is not descent.</p>${analogs(a,data.modern_analogs)}</section>`:''}
 </div>`;
}
function externalSection(a,ext){
 const pct=v=>Number.isFinite(v)?v.toFixed(2):'—',t=ext.transfer||{},views=Object.keys(t);
 const rows=views.map(v=>`<tr><th scope="row">${a.esc(v)}</th><td>${t[v].n_test_external}</td><td>${pct(t[v].balanced_accuracy)}</td><td>${pct(t[v].macro_f1)}</td><td>${Object.entries(t[v].by_era||{}).map(([k,e])=>`${a.esc(k)} ${pct(e.balanced_accuracy)} (n ${e.n})`).join('<br>')}</td><td>${Object.entries(t[v].by_source||{}).map(([k,e])=>`${a.esc(k.replace(/_/g,' '))} ${pct(e.balanced_accuracy)}`).join('<br>')}</td></tr>`).join('');
 const cm=t.raw?.confusion,cmTable=cm?`<table><caption>Raw-view confusion (rows: external class; columns: predicted)</caption><thead><tr><th scope="col">External</th>${cm.labels.map(l=>`<th scope="col">${a.esc(l.replace(/_/g,' '))}</th>`).join('')}</tr></thead><tbody>${cm.matrix.map((r,i)=>`<tr><th scope="row">${a.esc(cm.labels[i].replace(/_/g,' '))}</th>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'';
 const ma=ext.modern_analogs||{},pairs=(ma.category_to_modern_class||[]).slice(0,12);
 return `<h3 id="ai-x-external">External corpus: transfer and modern analogs</h3>
 <p>A probe fit only on internal DINOv2-L features is tested on ${ext.external_counts?.images_used?.toLocaleString?.()||''} independently curated external images (Wikimedia Commons, Wellcome Collection) in four shared families. Chance balanced accuracy is 0.25. External labels are automatic, from source titles and categories.</p>
 <div class="ai-deep-table"><div class="table-wrap"><table><caption>Transfer to external photographs</caption><thead><tr><th scope="col">View</th><th scope="col">n</th><th scope="col">Balanced acc.</th><th scope="col">Macro-F1</th><th scope="col">By era</th><th scope="col">By source</th></tr></thead><tbody>${rows}</tbody></table></div></div>
 <div class="ai-deep-table"><div class="table-wrap">${cmTable}</div></div>
 <div class="ai-deep-table"><div class="table-wrap"><table><caption>Internal category → nearest contemporary family (top-5 vote; ${ma.n_contemporary_images||0} contemporary reference images)</caption><thead><tr><th scope="col">Internal category</th><th scope="col">Modern family</th><th scope="col">Records</th></tr></thead><tbody>${pairs.map(([c,m,n])=>`<tr><td>${a.esc(String(c).replace(/_/g,' '))}</td><td>${a.esc(String(m).replace(/_/g,' '))}</td><td>${n}</td></tr>`).join('')}</tbody></table></div></div>
 <p class="muted"><small>${a.esc(ma.note||'')} Silhouette transfer is low partly because segmentation was never validated on external backgrounds.</small></p>
 <details class="panel ai-provenance"><summary>Saved external analysis (JSON)</summary><pre>${a.esc(JSON.stringify(ext,null,1))}</pre></details>`;
}

function analogs(a,list){
 // External analogs are link-only (title, weak class, licence); external pixels are never shown.
 if(list&&Array.isArray(list.top)){
  const votes=Object.entries(list.class_votes||{}).sort((x,y)=>y[1]-x[1]).map(([k,v])=>`${a.esc(k.replace(/_/g,' '))} ${v}`).join(' · ');
  return `<p>Nearest contemporary family: <strong>${a.esc((list.nearest_modern_class||'none').replace(/_/g,' '))}</strong>${votes?` <small>(top-5 votes: ${votes})</small>`:''}</p><p class="muted"><small>Classes are automatic, from source titles and categories; 171 contemporary reference photographs (of 177 contemporary images in the corpus).</small></p>
  <ul class="ai-fn-list">${list.top.map(x=>`<li>${x.page?`<a href="${a.esc(x.page)}" target="_blank" rel="noopener">${a.esc(x.title||x.ext_id)}</a>`:a.esc(x.title||x.ext_id)} <small>cosine ${Number(x.cosine).toFixed(3)} · ${a.esc((x.classes||[]).join(', ')||'class unknown')} · ${a.esc(x.source.replace(/_/g,' '))}${x.license?` · ${a.esc(x.license)}`:''}</small></li>`).join('')}</ul>`;
 }
 if(!Array.isArray(list))return `<pre>${a.esc(JSON.stringify(list,null,1))}</pre>`;
 return `<ul class="ai-fn-list">${list.map(x=>typeof x!=='object'?`<li>${a.esc(x)}</li>`:`<li>${x.url?`<a href="${a.esc(x.url)}" target="_blank" rel="noopener">${a.esc(x.title||x.label||x.name||x.id||'Analog')}</a>`:a.esc(x.title||x.label||x.name||x.id||'Analog')}${Number.isFinite(x.cosine)?` <small>cosine ${x.cosine.toFixed(3)}</small>`:''}${x.source?` <small>${a.esc(x.source)}</small>`:''}${x.license?` <small>${a.esc(x.license)}</small>`:''}</li>`).join('')}</ul>`;
}

// ---------- Search by task (precomputed SigLIP 2 zero-shot queries) ----------
const LANG={en:'English',nl:'Dutch',sv:'Swedish'};
function queryMatches(q){const f=queryFilter.trim().toLowerCase();return !f||`${q.text} ${q.group} ${LANG[q.lang]||q.lang} ${q.expected||''}`.toLowerCase().includes(f)}
function queryList(a,d){
 const groups=d.groups.map(g=>[g,d.queries.filter(q=>q.group===g.id&&queryMatches(q))]).filter(([,qs])=>qs.length);
 return groups.length?groups.map(([g,qs])=>`<div class="ai-tq-group"><h3>${a.esc(g.label)}</h3><div class="ai-tq-buttons" role="group" aria-label="${a.esc(g.label)}">${qs.map(q=>`<button type="button" data-ai-deep="query" data-value="${q.id}" aria-pressed="${q.id===queryId}">${a.esc(q.text)}${q.lang!=='en'?` <small>${q.lang}</small>`:''}</button>`).join('')}</div></div>`).join(''):'<p role="status">No precomputed query matches. Clear the filter.</p>';
}
async function search(a){
 const d=await file(a,'tasks.json');if(!a.current())return;
 queryId||=d.queries[0].id;const q=d.queries.find(x=>x.id===queryId),scored=Number.isFinite(q.test_precision_at_20),fresh=q.origin!=='crossmodal-1.0.0';
 const group=d.groups.find(g=>g.id===q.group),s=d.summary,pre=s['crossmodal-1.0.0'],post=s['task-1.0.0'],max=q.top_categories[0]?.[1]||1;
 a.$('ai-content').innerHTML=`<div class="ai-toolbar"><div><h2>Search by task</h2><p>${d.queries.length} ready-made searches. An AI that links pictures and words (SigLIP 2) ranks ${a.fmt(d.images)} photographs by how well they match the words. <small>Zero-shot, text–image cosine.</small></p></div><a href="${a.context.base}ai-deep/tasks.json" download>Export queries (JSON)</a></div>
 <p class="ai-caution">Queries were embedded offline; no model runs in your browser, so free text is not available. Zero-shot search always returns a ranking: the controls (“a door key”, “a comb”) rank instruments too, so a high place is not evidence that a matching tool exists. Short object names work better than descriptions of a clinical task.</p>
 <div class="ai-tq-layout"><aside class="ai-tq-side" aria-label="Choose a query"><label class="ai-tq-filter">Filter queries<input id="ai-tq-filter" type="search" placeholder="e.g. ear, forceps, bone…" value="${a.esc(queryFilter)}" autocomplete="off"></label>
 <label class="ai-xm-select">Precomputed query<select id="ai-xm-select">${d.groups.map(g=>`<optgroup label="${a.esc(g.label)}">${d.queries.filter(x=>x.group===g.id).map(x=>`<option value="${x.id}"${x.id===queryId?' selected':''}>${a.esc(x.text)}${x.lang!=='en'?` (${x.lang})`:''}</option>`).join('')}</optgroup>`).join('')}</select></label>
 <div id="ai-tq-list" class="ai-tq-list">${queryList(a,d)}</div></aside>
 <section class="ai-tq-results" data-xm-method="siglip2_zero_shot" aria-labelledby="ai-xm-current">
 <h3 id="ai-xm-current" class="ai-tq-query">“${a.esc(q.text)}” <small>${a.esc(group?.label||q.group)} · ${LANG[q.lang]||q.lang}</small></h3>
 <div class="ai-tq-facts">${scored?`<div class="ai-xm-score"><span>Right kind of tool in the top 20 <strong>${pct(q.test_precision_at_20)}</strong></span><span>By chance <strong>${pct(q.test_base_rate)}</strong></span><small class="ai-xm-tech">test precision@20 ${f2(q.test_precision_at_20)} · base rate ${f2(q.test_base_rate)}</small><span class="ai-compare-bar" aria-hidden="true"><i class="ai-bar-value" style="width:${q.test_precision_at_20*100}%"></i><i class="ai-bar-ref" style="left:${q.test_base_rate*100}%"></i></span><small>Expected category <em>${a.esc(words(q.expected))}</em>, held-out test records only${fresh?'. Exploratory: query written after the pre-registered results':''}.</small></div>`:'<p class="ai-xm-score">Not scored: no single coarse category with enough test records. Inspect the ranking.</p>'}
 <figure class="ai-tq-mix"><figcaption>Catalog categories in the top 20</figcaption><ul>${q.top_categories.map(([c,n])=>`<li><span>${a.esc(words(c))}</span><span class="ai-hbar"><i style="width:${n/max*100}%"></i></span><b>${n}</b></li>`).join('')}</ul></figure></div>
 <ol id="ai-xm-results" class="ai-ranked ai-xm-list">${q.top.map(([id,c,cat],i)=>{const r=a.rows.get(id);return `<li class="ai-match" data-id="${id}"><span class="ai-rank-no" aria-hidden="true">${i+1}</span>${thumb(a,id)}<div class="ai-match-copy"><h2><a href="#item/${id}">${a.esc(r?.name||id)}</a></h2><p><span class="record-id">#${id}</span> · ${a.esc(r?.institution||'')}${cat?` · ${a.esc(words(cat))}`:''}</p></div><div class="ai-match-score"><span class="ai-xm-rank"><span class="ai-sr">Rank ${i+1}, cosine </span><strong>${c.toFixed(3)}</strong></span><small aria-hidden="true">cosine</small></div><div class="ai-match-actions"><button type="button" class="quiet" data-ai-deep="goto" data-tab="retrieval" data-value="${id}">Similar tools</button></div></li>`}).join('')}</ol></section></div>
 <p class="muted">Pre-registered queries (finding F10): mean test precision@20 ${f2(pre.precision_at_20.mean)} over ${pre.precision_at_20.n} scored queries vs base rate ${f2(pre.base_rate.mean)}. Queries added for browsing: ${f2(post.precision_at_20.mean)} over ${post.precision_at_20.n} vs ${f2(post.base_rate.mean)} (exploratory). The adapted encoder's comparison is in <button type="button" class="ai-link" data-ai-deep="goto-exp" data-value="ai-exp-crossmodal">Experiments → Cross-modal</button>.</p>`;
 a.$('ai-xm-select').onchange=async()=>{queryId=a.$('ai-xm-select').value;await a.render();a.$('ai-xm-select')?.focus({preventScroll:true})};
 a.$('ai-tq-filter').oninput=()=>{queryFilter=a.$('ai-tq-filter').value;a.$('ai-tq-list').innerHTML=queryList(a,d)};
}

// ---------- Embedding map ----------
const SHAPES={circle:(g,x,y,r)=>g.arc(x,y,r,0,Math.PI*2),square:(g,x,y,r)=>g.rect(x-r*.9,y-r*.9,r*1.8,r*1.8),triangle:(g,x,y,r)=>{g.moveTo(x,y-r*1.15);g.lineTo(x+r*1.05,y+r*.8);g.lineTo(x-r*1.05,y+r*.8);g.closePath()},'triangle-down':(g,x,y,r)=>{g.moveTo(x,y+r*1.15);g.lineTo(x+r*1.05,y-r*.8);g.lineTo(x-r*1.05,y-r*.8);g.closePath()},diamond:(g,x,y,r)=>{g.moveTo(x,y-r*1.2);g.lineTo(x+r,y);g.lineTo(x,y+r*1.2);g.lineTo(x-r,y);g.closePath()},plus:(g,x,y,r)=>{g.rect(x-r*1.1,y-r*.35,r*2.2,r*.7);g.rect(x-r*.35,y-r*1.1,r*.7,r*2.2)},cross:(g,x,y,r)=>{g.moveTo(x-r,y-r);g.lineTo(x+r,y+r);g.moveTo(x+r,y-r);g.lineTo(x-r,y+r)}};
const SVG_SHAPES={circle:'<circle cx="6" cy="6" r="4.5"/>',square:'<rect x="1.8" y="1.8" width="8.4" height="8.4"/>',triangle:'<path d="M6 1 11 10H1z"/>','triangle-down':'<path d="M6 11 11 2H1z"/>',diamond:'<path d="M6 .5 11 6 6 11.5 1 6z"/>',plus:'<path d="M4.6 1h2.8v3.6H11v2.8H7.4V11H4.6V7.4H1V4.6h3.6z"/>',cross:'<path d="M2 2 10 10M10 2 2 10" stroke-width="2.4"/>',dot:'<circle cx="6" cy="6" r="2.4"/>'};
const MAPS=[['silhouette','Outline shape'],['adapted','Photo, object only'],['text','Catalog words'],['photo','Whole photo (incl. photography)']];
// One plain sentence per map: what places two tools close together.
const MAP_HELP={
 silhouette:'Close = similar outline. Only the black outline counts, turned to a standard pose, so the angle, mirror image and size of the photo do not matter (DINOv2-B image model). Hover anywhere to see the outline the AI draws for that spot.',
 photo:'Close = similar-looking photograph, as a ready-made image model sees it (DINOv2-L). Background, lighting and camera angle pull photos from the same museum together (background R² 0.81), so prefer “Photo, object only”.',
 adapted:'Close = similar-looking object. An image model (DINOv2-B) retrained here to ignore museum photography: it finds same-type tools in an unseen museum as well as the best ready-made model (P@10 0.763 vs 0.760), but background explains far less of it (R² 0.36 vs 0.81).',
 text:'Close = similar catalog wording: names and descriptions, read by a multilingual text model (E5). Says nothing about shape.'};
function classOf(d,id){const v=(mapColor==='category'?d.category:d.institution)[id];return v||'(not mapped)'}
function legendClasses(a,d,points){
 const counts=new Map();for(const [id] of points){const c=classOf(d,id);counts.set(c,(counts.get(c)||0)+1)}
 const sorted=[...counts].sort((x,y)=>y[1]-x[1]),slots=a.palette.colorblind.length;
 const named=sorted.filter(([c])=>c!=='(not mapped)').slice(0,slots);
 const style=new Map(named.map(([c],i)=>[c,{color:a.palette.colorblind[i],shape:a.palette.markers[i]}]));
 const otherCount=sorted.filter(([c])=>!style.has(c)).reduce((n,[,k])=>n+k,0);
 return {style,named,otherCount,other:sorted.filter(([c])=>!style.has(c)).map(([c,k])=>`${words(c)} (${k})`)};
}
async function map(a){
 const d=await file(a,'maps.json');if(mapDim==='3d'&&!space3d){await import('./app/space3d.js');space3d=globalThis.Space3D}
 mapGen=mapName==='silhouette'&&mapDim==='2d'&&(await manifest(a)).files['mapgen.json']?await file(a,'mapgen.json'):null;if(!a.current())return;
 const m=d.maps[mapName],legend=legendClasses(a,d,m.points),plotted=new Set(m.points.map(p=>p[0]));
 const three=mapDim==='3d',time=three?dated(a,d,m,legend):null;
 a.$('ai-content').innerHTML=`<div class="ai-toolbar ai-map-toolbar">${seg('Embedding',MAPS,mapName,'map')}${seg('Colour by',[['category','Catalog category'],['institution','Source museum']],mapColor,'map-color')}${seg('View',[['2d','2D map'],['3d','3D · time']],mapDim,'map-dim')}<a href="${a.context.base}ai-deep/maps.json" download>Export map (JSON)</a></div>
 ${three?`<div class="ai-toolbar ai-map3d-controls">${seg('Time scale',[['compressed','Compressed'],['linear','Linear']],mapScale,'map-scale')}<div class="ai-segments" role="group" aria-label="Camera"><button type="button" data-ai-deep="map-turn" data-value="oblique">Oblique</button><button type="button" data-ai-deep="map-turn" data-value="time">Side (time)</button><button type="button" data-ai-deep="map-turn" data-value="map">Top (map)</button><button type="button" data-ai-deep="map-rot" data-value="-1" aria-label="Rotate left">↺</button><button type="button" data-ai-deep="map-rot" data-value="1" aria-label="Rotate right">↻</button></div><label class="ai-check"><input type="checkbox" id="ai-map-ranges"${mapRanges?' checked':''}> Date ranges</label></div>
 <p class="ai-caution" id="ai-map-time-note">Height is the catalog date: each point sits at the middle of its catalog date range and the faint vertical line spans the range. ${a.fmt(time.undated)} of ${a.fmt(m.points.length)} plotted records have no catalog date and are left out of the 3D view (they remain in the 2D map and the table)${time.reversed?`; ${time.reversed} reversed range drawn from earliest to latest`:''}. ${a.esc(time.top[0])} supplies ${a.fmt(time.top[1])} of ${a.fmt(time.points.length)} dated records, so a concentration in time mostly shows what museums collected and dated, not when a tool type appeared or how common it was.</p>`:''}
 <p class="ai-map-help" id="ai-map-help"><strong>${a.esc(MAPS.find(m=>m[0]===mapName)[1])}.</strong> ${a.esc(MAP_HELP[mapName])}</p>
 <p class="ai-caution">A flat picture of a 768-number space: nearby points are similar, but empty-looking areas are not necessarily empty, and distances between far-apart groups mean little. For exact look-alikes use Similar tools. <small>${a.esc(d.note)} UMAP (${d.params.n_neighbors} neighbours, min. distance ${d.params.min_dist}, ${a.esc(d.params.metric)} metric, seed ${d.params.random_state}); axes have no unit.</small></p>
 <div id="ai-map-legend" class="ai-cluster-legend ai-map-legend" role="group" aria-label="Highlight a ${mapColor==='category'?'category':'museum'}">${legend.named.map(([c,n])=>`<button type="button" data-ai-deep="map-class" data-value="${a.esc(c)}" aria-pressed="${mapClass===c}"><svg class="ai-marker" viewBox="0 0 12 12" aria-hidden="true" fill="${legend.style.get(c).color}" stroke="${legend.style.get(c).color}">${SVG_SHAPES[legend.style.get(c).shape]}</svg>${a.esc(words(c))} <small>${a.fmt(n)}</small></button>`).join('')}${legend.otherCount?`<button type="button" data-ai-deep="map-class" data-value="__other" aria-pressed="${mapClass==='__other'}" title="${a.esc(legend.other.join(', '))}"><svg class="ai-marker" viewBox="0 0 12 12" aria-hidden="true" fill="${a.palette.missing}">${SVG_SHAPES.dot}</svg>Other / not mapped <small>${a.fmt(legend.otherCount)}</small></button>`:''}</div>
 <p id="ai-map-status" role="status">${a.fmt(m.points.length)} records plotted from ${a.esc(m.source)} · ${a.fmt(a.rows.size-m.points.length)} without this representation${three?` · ${a.fmt(time.points.length)} dated in 3D`:''}. ${plotted.has(a.selected)?(three&&!time.points.some(p=>p.id===a.selected)?`The selected record #${a.selected} is undated and not shown in 3D.`:''):`The selected record #${a.selected} is not in this map.`}</p>
 <div class="ai-cluster-layout"><div class="ai-chart panel ai-map-chart">${three?'':`<div class="ai-map-zoom" role="group" aria-label="Zoom"><button type="button" data-ai-deep="map-zoom" data-value="in" aria-label="Zoom in">+</button><button type="button" data-ai-deep="map-zoom" data-value="out" aria-label="Zoom out">−</button><button type="button" data-ai-deep="map-zoom" data-value="reset" aria-label="Show the whole map">⤢</button></div>`}<canvas id="ai-map-canvas" tabindex="0" role="img"${three?' data-space3d="1"':''} aria-label="${three?`Three-dimensional view: UMAP display of ${a.esc(m.source)} embeddings with catalog date as height, coloured by ${mapColor}. Drag or use the camera buttons to rotate. Arrow keys step through points in date order, Enter selects.`:`Two-dimensional UMAP display of ${a.esc(m.source)} embeddings coloured by ${mapColor}. Scroll or use + and − to zoom, drag to move. Arrow keys step through points, Enter selects.`} The table below lists every point."></canvas><div id="ai-map-tip" class="ai-map-tip" hidden></div></div><aside class="panel ai-map-side"><div id="ai-map-hover" class="ai-map-hover"></div><div id="ai-map-detail" aria-live="polite"></div></aside></div>
 ${three?'<figure class="panel ai-time-hist"><figcaption id="ai-time-hist-caption"></figcaption><div id="ai-time-hist"></div><p class="muted">Each record is spread evenly over its catalog date range (fractional counts). Bins are equal width on the displayed time scale.</p></figure>':''}
 <label class="ai-map-find">Find a plotted record<input id="ai-map-search" type="search" placeholder="Name or identifier…" value="${a.esc(mapSearch)}"></label>
 <div id="ai-map-table" class="table-wrap"></div><div class="pagination"><button type="button" data-ai-deep="map-page" data-value="-1" id="ai-map-prev">← Previous</button><p id="ai-map-page" role="status"></p><button type="button" data-ai-deep="map-page" data-value="1" id="ai-map-next">Next →</button></div>`;
 mapView={d,m,legend,time,points:[],order:[],focus:-1,locked:null,cell:-1,hoverId:null,panned:false};
 const canvas=a.$('ai-map-canvas'),tip=a.$('ai-map-tip');
 const nearest=(x,y)=>{let best=110,hit=null;for(const p of mapView.points){const q=(p.x-x)**2+(p.y-y)**2;if(q<best){best=q;hit=p}}return hit};
 const show=(p)=>{if(!p){tip.hidden=true;return}const r=a.rows.get(p.id);tip.innerHTML=`${a.context.preview(r?.image,r?.name||p.id)}<span><strong>${a.esc(r?.name||p.id)}</strong><small>#${p.id} · ${a.esc(words(classOf(d,p.id)))}</small></span>`;tip.hidden=false;const w=canvas.clientWidth;tip.style.left=Math.min(Math.max(p.x+12,0),w-tip.offsetWidth-4)+'px';tip.style.top=Math.max(p.y-tip.offsetHeight-10,4)+'px'};
 // Pointer over a plotted tool: the side panel shows that real tool. Elsewhere: the AI drawing for the grid cell.
 const hoverAt=(x,y,p)=>{if(p){if(mapView.hoverId!==p.id){mapView.hoverId=p.id;mapView.cell=-1;mapHoverTool(a,p.id);draw(a)}return}
  if(!mapGen)return;const [u,v]=toPlane(canvas,x,y),G=mapGen.grid;if(u<0||u>1||v<0||v>1)return;const k=Math.min(G-1,Math.floor(v*G))*G+Math.min(G-1,Math.floor(u*G));if(k!==mapView.cell||mapView.hoverId){mapView.cell=k;mapView.hoverId=null;mapHover(a,k);draw(a)}};
 let pan=null;
 canvas.onpointermove=ev=>{const b=canvas.getBoundingClientRect(),x=ev.clientX-b.left,y=ev.clientY-b.top;
  if(pan&&!three){const dx=x-pan.x,dy=y-pan.y;if(pan.moved||Math.hypot(dx,dy)>4){pan.moved=true;const w=canvas.clientWidth,h=canvas.clientHeight;setZoom(pan.x0-dx/(w-32)*mapZoom.s,pan.y0+dy/(h-32)*mapZoom.s,mapZoom.s);tip.hidden=true;draw(a)}return}
  const p=nearest(x,y);canvas.style.cursor=p?'pointer':three?'default':'crosshair';show(p);hoverAt(x,y,p)};
 canvas.onpointerdown=ev=>{const b=canvas.getBoundingClientRect(),x=ev.clientX-b.left,y=ev.clientY-b.top;if(!three&&ev.button===0){pan={x,y,x0:mapZoom.x0,y0:mapZoom.y0,moved:false};canvas.setPointerCapture?.(ev.pointerId)}if(ev.pointerType!=='mouse')hoverAt(x,y,nearest(x,y))};
 canvas.onpointerup=()=>{if(pan){mapView.panned=pan.moved;pan=null}};canvas.onpointercancel=()=>{pan=null};
 canvas.onpointerleave=()=>{tip.hidden=true};
 if(!three)canvas.addEventListener('wheel',ev=>{ev.preventDefault();const b=canvas.getBoundingClientRect();zoomAt(canvas,ev.clientX-b.left,ev.clientY-b.top,ev.deltaY<0?1.25:0.8);tip.hidden=true;draw(a)},{passive:false});
 const dragged=three?space3d.rotate(canvas,()=>mapTurn,v=>{mapTurn=v;tip.hidden=true;draw(a)}):()=>{const m=mapView.panned;mapView.panned=false;return m};
 if(three)a.$('ai-map-ranges').onchange=ev=>{mapRanges=ev.target.checked;draw(a)};
 canvas.onclick=ev=>{if(dragged())return;const b=canvas.getBoundingClientRect(),p=nearest(ev.clientX-b.left,ev.clientY-b.top);if(p)a.choose(p.id,true)};
 canvas.onkeydown=ev=>{const order=mapView.order;if(!order.length)return;
  if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(ev.key)){ev.preventDefault();const step=ev.key==='ArrowRight'||ev.key==='ArrowDown'?1:-1;mapView.focus=mapView.focus<0?(step>0?0:order.length-1):(mapView.focus+step+order.length)%order.length;show(order[mapView.focus]);hoverAt(order[mapView.focus].x,order[mapView.focus].y,order[mapView.focus]);draw(a)}
  else if(!three&&['+','=','-','0'].includes(ev.key)){ev.preventDefault();const c=[canvas.clientWidth/2,canvas.clientHeight/2];if(ev.key==='0')setZoom(0,0,1);else zoomAt(canvas,...c,ev.key==='-'?0.8:1.25);draw(a)}
  else if((ev.key==='Enter'||ev.key===' ')&&mapView.focus>=0){ev.preventDefault();a.choose(order[mapView.focus].id,true)}
  else if(ev.key==='Escape'){tip.hidden=true;mapView.focus=-1;draw(a)}};
 canvas.onblur=()=>{tip.hidden=true;draw(a)};
 a.$('ai-map-search').oninput=()=>{mapSearch=a.$('ai-map-search').value;mapPage=0;mapTable(a)};
 mapObserver?.disconnect();mapObserver=new ResizeObserver(()=>{if(a.$('ai-map-canvas'))draw(a)});mapObserver.observe(canvas.parentElement);
 draw(a);mapHover(a,-1);mapDetail(a);mapTable(a);mapHist(a);
}
// Side-panel preview: the outline the latent decoder draws for the map cell under the pointer
// (precomputed on a grid by scripts/deep/map_decode.py; inverse UMAP, so a blend of nearby tools).
function mapHover(a,k){
 const host=a.$('ai-map-hover');if(!host)return;
 if(!mapGen){host.innerHTML=mapName!=='silhouette'?`<p class="muted">Switch to <button type="button" class="ai-link" data-ai-deep="map" data-value="silhouette">Outline shape</button> to see the outline the AI draws for any spot on the map.</p>`:mapDim==='3d'?'<p class="muted">AI drawings under the pointer are available in the 2D view.</p>':'';return}
 if(k<0){host.innerHTML=`<h3 class="ai-map-detail-title">AI drawing under the pointer</h3><div class="ai-map-hover-empty">Move the pointer over the map</div><p class="muted">For every spot, a model trained on these outlines draws the shape that would sit there.</p>`;return}
 const [near,,cycle,nid]=mapGen.cells[k],r=a.rows.get(nid),G=mapGen.grid,T=mapGen.tile,cx=k%G,cy=Math.floor(k/G);
 const tileName=mapGen.tile_name.replace('{tx}',Math.floor(cx/T)).replace('{ty}',Math.floor(cy/T)),slot=(cy%T)*T+cx%T;
 host.dataset.cell=k;host.dataset.near=String(Boolean(near));delete host.dataset.tool;
 host.innerHTML=`<h3 class="ai-map-detail-title">AI drawing under the pointer</h3>${maskCanvas(slot,'Outline the AI draws for this spot on the map','ai-map-hover-mask')}
 <p class="ai-map-hover-note">${near?'Not a real tool: a blend of the tools around this spot.':'<strong>Far from any real tool:</strong> the AI is guessing beyond the data.'}${cycle<mapGen.realisable_threshold_rho?' The drawing does not read back as this spot, so treat it with caution.':''}</p>
 <p class="muted">Closest real tool: <a href="#item/${nid}">${a.esc(r?.name||nid)}</a> <small>#${nid}</small></p>`;
 file(a,tileName).then(tile=>{if(host.dataset.cell===String(k)&&!host.dataset.tool)paintMasks(a,tile,host)});
}
function mapHoverTool(a,id){
 const host=a.$('ai-map-hover');if(!host)return;const r=a.rows.get(id);
 host.dataset.tool=id;delete host.dataset.cell;
 host.innerHTML=`<h3 class="ai-map-detail-title">Real tool under the pointer</h3>${a.context.preview(r?.image,r?.name||id)}<p class="ai-map-hover-note"><strong>${a.esc(r?.name||id)}</strong> <small>#${id}</small></p><p class="muted">${a.esc(r?.institution||'')}${mapGen?' · move off the point to see the AI drawing for that spot':''}</p>`;
}
// 2D zoom: the visible window [x0, x0+s] × [y0, y0+s] of the normalised plane, s from 1 (whole map) to 1/8.
function setZoom(x0,y0,s){s=Math.min(1,Math.max(1/8,s));mapZoom={x0:Math.min(Math.max(x0,0),1-s),y0:Math.min(Math.max(y0,0),1-s),s}}
function toPlane(canvas,x,y){const w=canvas.clientWidth,h=canvas.clientHeight,P=16;return [mapZoom.x0+(x-P)/(w-2*P)*mapZoom.s,mapZoom.y0+(h-P-y)/(h-2*P)*mapZoom.s]}
function zoomAt(canvas,x,y,f){const [u,v]=toPlane(canvas,x,y),w=canvas.clientWidth,h=canvas.clientHeight,P=16,s=Math.min(1,Math.max(1/8,mapZoom.s/f));setZoom(u-(x-P)/(w-2*P)*s,v-(h-P-y)/(h-2*P)*s,s)}
// Dated points for the 3D view, from the catalog date range of each plotted record. Undated records are
// counted and reported, never imputed; reversed ranges are reordered and counted.
function dated(a,d,m,legend){
 const points=[],museums=new Map();let undated=0,reversed=0;
 for(const [id,x,y] of m.points){const r=a.rows.get(id);if(r?.start==null){undated++;continue}if(r.end!=null&&r.end<r.start)reversed++;
  const [t0,t1]=space3d.range(r.start,r.end),c=classOf(d,id);points.push({id,x,y,t0,t1,c,color:legend.style.get(c)?.color||a.palette.missing});museums.set(d.institution[id]||'Unknown source',(museums.get(d.institution[id]||'Unknown source')||0)+1)}
 const lo=Math.min(...points.map(p=>p.t0)),hi=Math.max(...points.map(p=>p.t1));
 return {points,undated,reversed,top:[...museums].sort((p,q)=>q[1]-p[1])[0]||['No source',0],lo,hi,scale:points.length?space3d.timeScale(mapScale,lo,hi):null};
}
function mapHist(a){
 const host=a.$('ai-time-hist');if(!host||!mapView.time?.scale)return;const t=mapView.time,css=k=>getComputedStyle(a.root()).getPropertyValue('--'+k).trim();
 const sub=mapClass?t.points.filter(p=>visible(p.id)):null,name=mapClass==='__other'?'Other / not mapped':words(mapClass||'');
 host.innerHTML=space3d.histogram(t.scale,t.points,sub,{color:mapClass==='__other'?a.palette.missing:mapView.legend.style.get(mapClass)?.color,grey:css('muted'),ink:css('muted'),label:`Dated records per period${sub?`, ${name} highlighted`:''}`});
 a.$('ai-time-hist-caption').innerHTML=`Dated records per period: all ${a.fmt(t.points.length)} dated${sub?` (grey) · <strong>${a.esc(name)}</strong> ${a.fmt(sub.length)} (colour)`:'. Highlight a legend class to compare one group.'}`;
}
function visible(id){if(!mapClass)return true;const c=classOf(mapView.d,id);return mapClass==='__other'?!mapView.legend.style.has(c):c===mapClass}
function draw(a){
 const canvas=a.$('ai-map-canvas');if(!canvas||!mapView)return;const box=canvas.getBoundingClientRect(),w=box.width,h=box.height;if(!w||!h)return;
 const ratio=devicePixelRatio||1;canvas.width=w*ratio;canvas.height=h*ratio;const g=canvas.getContext('2d');g.scale(ratio,ratio);
 const css=k=>getComputedStyle(a.root()).getPropertyValue('--'+k).trim(),P=16;
 g.fillStyle=css('panel');g.fillRect(0,0,w,h);
 if(mapDim==='3d'&&mapView.time){draw3d(a,g,w,h,css);return rings(a,g,css,canvas)}
 const Z=mapZoom,sx=v=>P+(v-Z.x0)/Z.s*(w-2*P),sy=v=>h-P-(v-Z.y0)/Z.s*(h-2*P);
 mapView.points=mapView.m.points.map(([id,x,y])=>({id,x:sx(x),y:sy(y),c:classOf(mapView.d,id)}));
 mapView.order=mapView.points.filter(p=>visible(p.id)).sort((p,q)=>p.x-q.x);
 const r=w<500?2.4:3,others=mapView.points.filter(p=>!mapView.legend.style.has(p.c)),named=[...mapView.legend.named].reverse();
 const paint=(p,style)=>{g.globalAlpha=visible(p.id)?.78:.1;g.beginPath();if(!style){g.fillStyle=a.palette.missing;g.arc(p.x,p.y,r*.7,0,Math.PI*2);g.fill();return}SHAPES[style.shape](g,p.x,p.y,r);if(style.shape==='cross'){g.strokeStyle=style.color;g.lineWidth=1.4;g.stroke()}else{g.fillStyle=style.color;g.fill()}};
 for(const p of others)paint(p,null);
 for(const [c] of named){const style=mapView.legend.style.get(c);for(const p of mapView.points)if(p.c===c)paint(p,style)}
 g.globalAlpha=1;rings(a,g,css,canvas);
 g.fillStyle=css('muted');g.font='11px system-ui';g.textAlign='right';g.fillText(`UMAP display · dimensionless${Z.s<1?` · zoom ${(1/Z.s).toFixed(1)}×`:''}`,w-8,h-6);
 if(mapGen&&mapView.cell>=0&&!mapView.hoverId){const G=mapGen.grid,cx=mapView.cell%G,cy=Math.floor(mapView.cell/G);g.strokeStyle=css('accent');g.lineWidth=1.5;g.setLineDash([3,2]);g.strokeRect(sx(cx/G),sy((cy+1)/G),sx((cx+1)/G)-sx(cx/G),sy(cy/G)-sy((cy+1)/G));g.setLineDash([])}
}
function rings(a,g,css,canvas){
 const ring=(p,color,size)=>{g.beginPath();g.arc(p.x,p.y,size,0,Math.PI*2);g.lineWidth=2;g.strokeStyle=color;g.stroke()};
 const sel=mapView.points.find(p=>p.id===a.selected);if(sel){ring(sel,css('panel'),9);ring(sel,css('ink'),7.5)}
 const focus=mapView.order[mapView.focus];if(focus&&document.activeElement===canvas)ring(focus,css('accent'),6);
}
function draw3d(a,g,w,h,css){
 const t=mapView.time,base=w<500?2.4:3;if(!t.scale)return;
 const out=space3d.render(g,{w,h,view:mapTurn,scale:t.scale,points:t.points,whiskers:mapRanges,highlight:p=>visible(p.id),css:{border:css('border'),muted:css('muted')},
  paint:(p,x,y,depth)=>{const st=mapView.legend.style.get(p.c),r=base*(1.15-.35*depth);g.globalAlpha=(visible(p.id)?.85:.08)*(1-.3*depth);g.beginPath();
   if(!st){g.fillStyle=a.palette.missing;g.arc(x,y,r*.7,0,Math.PI*2);g.fill();return}SHAPES[st.shape](g,x,y,r);if(st.shape==='cross'){g.strokeStyle=st.color;g.lineWidth=1.4;g.stroke()}else{g.fillStyle=st.color;g.fill()}}});
 g.globalAlpha=1;mapView.points=out.map(o=>({id:o.p.id,x:o.x,y:o.y,c:o.p.c,t:(o.p.t0+o.p.t1)/2}));
 mapView.order=mapView.points.filter(p=>visible(p.id)).sort((p,q)=>p.t-q.t);
}
function mapDetail(a){
 const host=a.$('ai-map-detail');if(!host)return;const id=a.selected,r=a.rows.get(id),inMap=mapView.m.points.some(p=>p[0]===id);
 host.innerHTML=`<h3 class="ai-map-detail-title">Selected record</h3>${a.context.preview(r?.image,r?.name||id)}<span class="record-id">#${id}</span><h3>${a.esc(r?.name||id)}</h3><p>${a.esc(r?.institution||'')}</p><p>${inMap?`${mapColor==='category'?'Category':'Museum'}: ${a.esc(words(classOf(mapView.d,id)))}`:'Not in this map (representation unavailable).'}</p><a href="#item/${id}">Inspect record →</a><p class="ai-map-actions"><button type="button" data-ai-deep="goto" data-tab="retrieval" data-value="${id}">Similarity</button><button type="button" class="quiet" data-ai-deep="goto" data-tab="evidence" data-value="${id}">Evidence</button></p><p class="muted">Click a point or press Enter on a focused point to select it.</p>`;
}
function mapTable(a){
 const q=mapSearch.trim().replace(/^#/,'').toLowerCase(),d=mapView.d;
 const pts=mapView.m.points.filter(([id])=>visible(id)&&(!q||`${id} ${a.rows.get(id)?.name||''}`.toLowerCase().includes(q)));
 mapPage=Math.min(mapPage,Math.max(0,Math.ceil(pts.length/PAGE)-1));
 a.$('ai-map-table').innerHTML=`<table><caption>Accessible map table: ${a.fmt(pts.length)} matching plotted records. Coordinates are dimensionless display positions, not feature distances.</caption><thead><tr><th scope="col">Record</th><th scope="col">Catalog category</th><th scope="col">Source museum</th><th scope="col">x</th><th scope="col">y</th><th scope="col">Catalog date</th><th scope="col">Action</th></tr></thead><tbody>${pts.length?pts.slice(mapPage*PAGE,(mapPage+1)*PAGE).map(([id,x,y])=>`<tr${id===a.selected?' aria-current="true"':''}><td>${recordLine(a,id)}</td><td>${a.esc(words(d.category[id]||'not mapped'))}</td><td>${a.esc(d.institution[id]||'')}</td><td>${x.toFixed(3)}</td><td>${y.toFixed(3)}</td><td>${dateText(a,id)}</td><td><button type="button" class="quiet" data-ai-deep="map-select" data-value="${id}">Select on map</button></td></tr>`).join(''):'<tr><td colspan="7">No matching plotted records. Clear the search or highlighted group.</td></tr>'}</tbody></table>`;
 a.$('ai-map-page').textContent=`Page ${mapPage+1} of ${Math.max(1,Math.ceil(pts.length/PAGE))}`;a.$('ai-map-prev').disabled=mapPage===0;a.$('ai-map-next').disabled=(mapPage+1)*PAGE>=pts.length;
}
function dateText(a,id){const r=a.rows.get(id),y=v=>v<0?`${-v} BCE`:String(v);return r?.start==null?'undated':r.end==null||r.end===r.start?y(r.start):`${y(Math.min(r.start,r.end))}–${y(Math.max(r.start,r.end))}`}
export function selectionChanged(a){if(!mapView||!a.$('ai-map-canvas'))return a.render();draw(a);mapDetail(a);mapTable(a)}

// ---------- Experiments ----------
const ENCODERS={resnet18_in1k:'ResNet18 · ImageNet',dinov2_b14:'DINOv2-B/14',dinov2_l14:'DINOv2-L/14',clip_l14:'CLIP ViT-L/14',siglip2_b16:'SigLIP 2 B/16',e5_multilingual:'E5 multilingual',clip_l14_text:'CLIP text',siglip2_b16_text:'SigLIP 2 text',outline_multiblock:'Outline multiblock (earlier baseline)',photo_nuisance:'Photography-only control',fusion:'Fusion'};
const VIEWS={raw:'raw photograph',object_white:'object on white',silhouette:'silhouette only',text:'catalog text',existing:'hand-crafted outline','photo+silhouette':'photo + silhouette','photo+silhouette+text':'photo + silhouette + text'};
function repName(name){
 const [enc,view]=name.split(':');
 if(enc.startsWith('adapt-')){const t=enc.replace('adapt-','').split('-'),part=t.pop(),cfg=t.join('-');return [`Adapted DINOv2-B · ${{all:'all train museums','no-skane':'Region Skåne held out','all-nocomposite':'no background compositing'}[cfg]||cfg}`,`${part==='proj'?'projection':'backbone'} · ${VIEWS[view]||view}`]}
 return [ENCODERS[enc]||enc,VIEWS[view]||view];
}
const METRIC={p10:'category P@10',xinst_p10:'cross-museum P@10',subtype_p10:'subtype P@10',within_category_subtype_p10:'within-category subtype P@10'};
function pairedLabel(a,key,names={}){const [cmp,metric]=key.split(' | '),side=n=>names[n]||repName(n).join(', ');return `${cmp.split(' - ').map(n=>a.esc(side(n))).join(' <b>minus</b> ')} <small>${a.esc(METRIC[metric]||words(metric))}</small>`}
const SECTIONS=[['findings','Findings'],['benchmark','Benchmark'],['confounds','Confounds'],['adaptation','Adaptation'],['ends','Working ends'],['affordances','Affordance prompts'],['crossmodal','Cross-modal'],['duplicates','Near-duplicates'],['disagreements','Disagreements'],['hypotheses','Hypotheses'],['literature','Literature'],['limits','Limits & next']];
const STATUS={observation:['●','Observation'],inference:['◐','Inference'],speculation:['○','Speculation']};
function sectionHtml(id,title,lede,body){return `<section id="ai-exp-${id}" class="ai-exp-section" tabindex="-1" aria-labelledby="ai-exp-${id}-title"><h2 id="ai-exp-${id}-title">${title}</h2>${lede?`<p class="ai-exp-lede">${lede}</p>`:''}${body}</section>`}
// Plain meanings of the technical words used across AI Methods.
const GLOSSARY=[
 ['Embedding, shape space','A list of numbers an AI uses to describe a photo, outline or text. Tools with similar numbers look (or read) alike.'],
 ['Similarity (cosine)','How alike two embeddings are, from about 0 (unrelated) to 1 (identical).'],
 ['Ready-made vs trained here','Ready-made models are downloaded and used unchanged (DINOv2, SigLIP 2, E5). “Trained here” models learned only from this collection.'],
 ['P@10, P@20 (precision)','Of the 10 (or 20) closest results, the share that are the expected kind of tool. Always compared with what random picking would give.'],
 ['Cross-museum','Counted only over results from museums other than the query’s, so that shared photography cannot help.'],
 ['Background R²','How well the photo background can be predicted from the embedding (0 = not at all, 1 = perfectly). Lower means the model looks at the object, not the photo.'],
 ['Held-out, test split','Tools the model never saw while learning; scores on them show how it generalises.'],
 ['95% CI','The range the true value very likely lies in, given how many tools were tested.'],
 ['IoU (overlap)','How much two outlines overlap: 0 = not at all, 1 = identical.'],
 ['UMAP, t-SNE','Ways to flatten many numbers onto a 2-D map. Nearby points are similar; empty-looking space and long distances are not reliable.'],
 ['Diffusion model','An AI that draws by starting from random noise and cleaning it up step by step; each try from a different random start gives a different drawing.'],
 ['Akaike weight (AICc)','How strongly the data support one model over the others, adding up to 100% across the models compared.'],
 ['Pre-registered','The test and its pass/fail rule were written down before seeing the results.']];
const GLOSSARY_HTML=`<details class="ai-exp-details ai-glossary" id="ai-glossary"><summary>Words used here</summary><dl>${GLOSSARY.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl></details>`;
async function experiments(a){
 const s=await manifest(a),[x,cm,lit]=await Promise.all([file(a,'experiments.json'),file(a,'crossmodal.json'),s.files['literature.json']?file(a,'literature.json'):null]);if(!a.current())return;
 const body=[findingsSection(a,x),benchmarkSection(a,x),confoundSection(a,x),adaptationSection(a,x),endsSection(a,x),affordanceSection(a,x),crossmodalSection(a,cm),duplicateSection(a,x),disagreementSection(a,x),hypothesisSection(a,x),literatureSection(a,lit),limitsSection(a,x)];
 a.$('ai-content').innerHTML=`<div class="ai-toolbar"><div><h2>Deep-representation experiments</h2><p>Dataset ${a.esc(x.dataset_version)} · evaluation set ${a.fmt(x.evaluation_set.n)} records, ${Object.keys(x.evaluation_set.categories).length} weak catalog categories, ${Object.keys(x.evaluation_set.institutions).length} museums.</p></div><a href="${a.context.base}ai-deep/experiments.json" download>Export results (JSON)</a></div>
 <p class="ai-lede">The research record behind the other tabs: every test, with its numbers and uncertainty. Start with the findings; each says whether it is an observation, an inference or speculation.</p>
 ${GLOSSARY_HTML}
 <nav class="ai-exp-nav" aria-label="Experiment sections">${SECTIONS.map(([id,t])=>`<button type="button" data-ai-deep="jump" data-value="ai-exp-${id}">${t}</button>`).join('')}</nav>
 <div class="ai-exp">${body.join('')}</div>`;
}
function findingsSection(a,x){
 const f=x.findings,list=Array.isArray(f)?f:f?.findings;
 if(!list?.length)return sectionHtml('findings','Findings','',`<p class="ai-deep-note" role="status" id="ai-findings-pending">Findings are pending. The measured results below are available; their written interpretation has not yet been published.</p>`);
 const defs=f.status_definitions||{};
 return sectionHtml('findings','Findings',a.esc(f.evaluation_note||''),`<dl class="ai-status-key">${Object.keys(STATUS).map(s=>`<div><dt><span class="ai-status ai-status-${s}"><span aria-hidden="true">${STATUS[s][0]}</span>${STATUS[s][1]}</span></dt><dd>${a.esc(defs[s]||'')}</dd></div>`).join('')}</dl>
 <ol id="ai-findings" class="ai-findings">${list.map(item=>`<li class="panel ai-finding" data-status="${a.esc(item.status)}"><div class="ai-finding-head"><span class="record-id">${a.esc(item.id)}</span><span class="ai-status ai-status-${a.esc(item.status)}"><span aria-hidden="true">${STATUS[item.status]?.[0]||'·'}</span>${STATUS[item.status]?.[1]||a.esc(item.status)}</span></div><h3>${a.esc(item.title)}</h3><p>${a.esc(item.statement)}</p>${item.evidence?.length?`<h4>Evidence</h4><ul>${item.evidence.map(v=>`<li>${a.esc(typeof v==='string'?v:JSON.stringify(v))}</li>`).join('')}</ul>`:''}${item.caveats?.length?`<h4>Caveats</h4><ul class="ai-caveats">${item.caveats.map(v=>`<li>${a.esc(typeof v==='string'?v:JSON.stringify(v))}</li>`).join('')}</ul>`:''}</li>`).join('')}</ol>`);
}
function chance(x){const n=x.evaluation_set.n;return Object.values(x.evaluation_set.categories).reduce((s,c)=>s+c*(c-1),0)/(n*(n-1))}
function dotRows(a,rows,lo,hi,refLabel){
 const pos=v=>Math.max(0,Math.min(100,(v-lo)/(hi-lo)*100));
 const ticks=[];for(let t=lo;t<=hi+1e-9;t+=.1)ticks.push(t);
 return `<div class="ai-dotplot"><div class="ai-dot-axis" aria-hidden="true"><span></span><span class="ai-dot-track">${ticks.map(t=>`<i style="left:${pos(t)}%">${t.toFixed(1)}</i>`).join('')}</span><span></span></div>
 <ul>${rows.map(r=>`<li data-rep="${a.esc(r.key)}"${r.circular?' class="ai-circular"':''}><span class="ai-dot-label">${a.esc(r.label)}<small>${a.esc(r.sub)}${r.circular?' · <b class="ai-circular-tag">circular: labels derived from text</b>':''}</small></span><span class="ai-dot-track">${ticks.map(t=>`<i class="ai-grid" style="left:${pos(t)}%"></i>`).join('')}${Number.isFinite(r.ref)?`<i class="ai-dot-ref" style="left:${pos(r.ref)}%" title="${refLabel} ${f3(r.ref)}"></i>`:''}${r.ci?`<i class="ai-dot-ci" style="left:${pos(r.ci[0])}%;width:${pos(r.ci[1])-pos(r.ci[0])}%;background:${r.color}"></i>`:''}<i class="ai-dot ai-dot-${r.shape}${r.circular?' ai-dot-hollow':''}" style="left:${pos(r.value)}%;--dot:${r.color}"></i></span><span class="ai-dot-value">${ci(r.value,r.ci)}</span></li>`).join('')}</ul></div>`;
}
const KIND_ORDER={image:0,fusion:1,shape:2,control:3,fusion_with_text:4,text:5};
function benchmarkSection(a,x){
 const views=a.palette.views||{},shape={raw:'circle',object_white:'square',silhouette:'triangle'};
 const rows=[...x.benchmark].sort((p,q)=>KIND_ORDER[p.kind]-KIND_ORDER[q.kind]).map(r=>{const [label,sub]=repName(r.representation),view=r.representation.split(':')[1];return{key:r.representation,label,sub,value:r.cross_institution_p10,ci:r.cross_institution_p10_ci,ref:r.cross_institution_random_p10,circular:r.kind==='text'||r.kind==='fusion_with_text',color:views[view]||(r.kind==='control'?a.palette.missing:a.palette.reference||a.palette.missing),shape:r.kind==='text'||r.kind==='fusion_with_text'?'circle':shape[view]||(r.kind==='shape'?'diamond':r.kind==='control'?'cross':'square')}});
 const random=x.benchmark.find(r=>r.kind==='image')?.cross_institution_random_p10;
 const full=table(`All ${x.benchmark.length} representations on the same ${a.fmt(x.evaluation_set.n)} records. Precision values are fractions (0–1); intervals are 95% group-bootstrap (${x.benchmark_config?.bootstrap||1000} resamples). Weak-function mAP is against rule labels; its prevalence is the mAP of a random ranking.`,['Representation','Kind','Category P@1','Category P@10 [95% CI]','Cross-museum P@10 [95% CI]','Random cross-museum P@10','kNN macro-F1','Weak-function mAP (prevalence)'],[...x.benchmark].sort((p,q)=>KIND_ORDER[p.kind]-KIND_ORDER[q.kind]).map(r=>{const [l,s]=repName(r.representation);return[`${a.esc(l)}<small>${a.esc(s)}</small>`,`${a.esc(words(r.kind))}${r.kind==='text'||r.kind==='fusion_with_text'?' <b class="ai-circular-tag">circular</b>':''}`,f3(r.category_p1),ci(r.category_p10,r.category_p10_ci),ci(r.cross_institution_p10,r.cross_institution_p10_ci),f3(r.cross_institution_random_p10),f3(r.knn_macro_f1),`${f3(r.weak_function_map)} <small>(${f3(r.weak_function_map_prevalence)})</small>`]}),'ai-benchmark-table');
 return sectionHtml('benchmark','Representation benchmark',`Cross-museum precision@10: for each query, neighbours are restricted to <em>other</em> museums and scored by whether they share the weak catalog category. Leave-one-group-out retrieval; the query's whole known duplicate group is excluded. Chance category P@10 from class frequencies is ${f3(chance(x))}; the random cross-museum reference is about ${f3(random)}.`,
 `<div class="ai-dot-legend" aria-hidden="true"><span><i class="ai-dot ai-dot-circle" style="--dot:${views.raw}"></i>raw photograph</span><span><i class="ai-dot ai-dot-square" style="--dot:${views.object_white}"></i>object on white</span><span><i class="ai-dot ai-dot-triangle" style="--dot:${views.silhouette}"></i>silhouette</span><span><i class="ai-dot ai-dot-diamond" style="--dot:${a.palette.reference}"></i>outline baseline</span><span><i class="ai-dot ai-dot-hollow ai-dot-circle" style="--dot:${a.palette.reference}"></i>uses catalog text (circular)</span><span><i class="ai-dot-ref ai-dot-ref-key"></i>random cross-museum expectation</span></div>
 <figure class="panel ai-figure">${EXPAND}<figcaption>Cross-museum precision@10 (fraction of top-10 other-museum neighbours sharing the catalog category), dot = estimate, bar = 95% CI</figcaption>${dotRows(a,rows,.3,1,'Random cross-museum P@10')}</figure>
 <details class="ai-exp-details"><summary>Full benchmark table</summary>${full}</details>`);
}
function confoundSection(a,x){
 const meter=v=>`<span class="ai-inline-meter" aria-hidden="true"><i style="width:${Math.max(0,Math.min(1,v||0))*100}%"></i></span>`;
 const reps=x.benchmark.filter(r=>r.kind!=='text'&&r.kind!=='fusion_with_text');const control=x.benchmark.find(r=>r.kind==='control');const transfer=r=>Object.entries(r.institution_transfer||{}).map(([k,v])=>`${f2(v.macro_f1)}`).join(' / ')||'—';
 const short=t=>t.replace('Museum Boerhaave','Boerhaave').replace('Region Skåne medical history','Region Skåne').replace(' -> ',' → '),dirs=Object.keys(reps[0]?.institution_transfer||{}).map(short).join(' / ');
 return sectionHtml('confounds','Confound controls','Museum photography (background, resolution, framing) can make same-museum records look alike. Within-category enrichment compares how often top-10 neighbours of the same category come from the query’s own museum against random expectation (1.0 = no museum clustering). R² values are ridge-regression decodability of photographic descriptors from each embedding (0 = none).',
 `${control?`<p class="ai-deep-note" role="note"><strong>Photography-only control.</strong> Eight photographic descriptors alone reach category P@10 ${ci(control.category_p10,control.category_p10_ci)} but cross-museum P@10 ${ci(control.cross_institution_p10,control.cross_institution_p10_ci)} against a random ${f3(control.cross_institution_random_p10)}: photography predicts category inside a museum, not across museums.</p>`:''}
 ${table('Museum-signature measures per representation. Rows that use catalog text are omitted (circular).',['Representation','Within-category museum enrichment (×)','Museum probe balanced accuracy','Background R² (border green)','Image-size R² (log pixels)',`Held-out museum transfer macro-F1 (${a.esc(dirs)})`],reps.sort((p,q)=>KIND_ORDER[p.kind]-KIND_ORDER[q.kind]).map(r=>{const [l,s]=repName(r.representation);return[`${a.esc(l)}<small>${a.esc(s)}</small>`,f2(r.within_category_institution_enrichment),f3(r.institution_probe_balanced_accuracy),r.nuisance_r2?`${meter(r.nuisance_r2.border_g)} ${f2(r.nuisance_r2.border_g)}`:'—',r.nuisance_r2?`${meter(r.nuisance_r2.log_pixels)} ${f2(r.nuisance_r2.log_pixels)}`:'—',transfer(r)]}))}`);
}
function lossCurves(a,runs){
 const groups={};for(const [tag,run] of Object.entries(runs)){const [cfg,seed]=[tag.replace(/-s\d+$/,''),tag.match(/s(\d+)$/)?.[1]];(groups[cfg]||=[]).push({seed,run})}
 const all=Object.values(runs).flatMap(r=>r.log.map(l=>l.loss)),lo=Math.floor(Math.min(...all)),hi=Math.ceil(Math.max(...all));
 const colors=Object.values(a.palette.views||{}),dash=['','5 3','1.5 3'];
 const W=300,H=180,L=38,R=8,T=12,B=34;
 return `<div class="ai-loss-grid">${Object.entries(groups).map(([cfg,list])=>{const epochs=Math.max(...list.map(r=>r.run.log.length))-1;const x=e=>L+e/epochs*(W-L-R),y=v=>T+(hi-v)/(hi-lo)*(H-T-B);const yt=[];for(let v=lo;v<=hi;v++)yt.push(v);
  return `<figure class="panel ai-loss">${EXPAND}<figcaption>${a.esc(repName('adapt-'+cfg+'-proj:raw')[0].replace('Adapted DINOv2-B · ',''))} <small>${a.fmt(list[0].run.train_records)} training records · ${list.map(r=>r.run.seconds+' s').join(', ')} on ${a.esc(list[0].run.gpu||'GPU')}</small></figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Training loss by epoch for seeds ${list.map(r=>r.seed).join(', ')}; final losses ${list.map(r=>r.run.log.at(-1).loss.toFixed(2)).join(', ')}">${yt.map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" class="ai-svg-grid"/><text x="${L-5}" y="${y(v)+3}" text-anchor="end">${v}</text>`).join('')}${[0,Math.round(epochs/2),epochs].map(e=>`<text x="${x(e)}" y="${H-B+14}" text-anchor="middle">${e}</text>`).join('')}<text x="${(W+L)/2}" y="${H-4}" text-anchor="middle">Epoch</text><text transform="translate(10 ${(H-B+T)/2}) rotate(-90)" text-anchor="middle">Loss</text>${list.map((r,i)=>`<polyline fill="none" stroke="${colors[i%colors.length]||'currentColor'}" stroke-width="1.8" stroke-dasharray="${dash[i%3]}" points="${r.run.log.map(l=>`${x(l.epoch).toFixed(1)},${y(l.loss).toFixed(1)}`).join(' ')}"/>`).join('')}</svg><p class="ai-loss-key">${list.map((r,i)=>`<span><svg viewBox="0 0 22 6" aria-hidden="true"><line x1="0" x2="22" y1="3" y2="3" stroke="${colors[i%colors.length]}" stroke-width="2" stroke-dasharray="${dash[i%3]}"/></svg>seed ${r.seed}</span>`).join('')}</p></figure>`}).join('')}</div>`;
}
function adaptationSection(a,x){
 const ad=x.adaptation,metrics=[['category_p10','Category P@10'],['cross_institution_p10','Cross-museum P@10'],['within_category_institution_enrichment','Within-category museum enrichment (×)'],['institution_probe_balanced_accuracy','Museum probe bal. acc.'],['bg_r2','Background R²'],['pix_r2','Image-size R²'],['i2t','Image→text R@1']];
 const ms=v=>v?`${f3(v.mean)}${v.sd!=null?` <small>± ${f3(v.sd)}</small>`:''}`:'—';
 const setName={test_split:'Held-out test groups',skane_unseen_plus_other_test:'Test groups plus all of Region Skåne'};
 const sets=Object.entries(ad.sets).map(([k,s])=>`<h3>${a.esc(setName[k]||words(k))} <small>n = ${a.fmt(s.n)} records</small></h3>${table(`Mean ± SD over ${ad.seeds.length} seeds (${ad.seeds.join(', ')}). Frozen encoders give the same result for every seed (SD 0). R² can be negative when a descriptor is not decodable at all.`,['Representation',...metrics.map(m=>m[1])],Object.entries(s.representations).map(([name,v])=>{const [l,sub]=repName(name);return[`${a.esc(l)}<small>${a.esc(sub)}</small>`,...metrics.map(([k])=>ms(v[k]))]}),'ai-adapt-table')}
 <details class="ai-exp-details"><summary>Paired differences (${Object.keys(s.paired).length})</summary>${table('Paired per-query differences: seed 17 with 95% bootstrap CI, then mean and range over the three seeds.',['Comparison','Seed 17 difference [95% CI]','Mean over seeds','Range over seeds'],Object.entries(s.paired).map(([k,v])=>[pairedLabel(a,k),`${signed(v.seed17.difference)} <small>[${f3(v.seed17.ci95[0])}, ${f3(v.seed17.ci95[1])}]</small>`,signed(v.mean_over_seeds),`${signed(v.min_over_seeds)} to ${signed(v.max_over_seeds)}`]))}</details>`).join('');
 return sectionHtml('adaptation','Photo-randomised adaptation',`DINOv2-B partially fine-tuned against frozen multilingual-E5 catalog text with background compositing and resolution randomisation, on train-split groups only; three seeds. Region Skåne is held out entirely in the “Region Skåne held out” runs. Weights are not published.`,
 `${sets}<h3>Training loss</h3><p class="muted">Symmetric multi-positive InfoNCE on the training batches (dimensionless), mean per epoch.</p>${lossCurves(a,ad.runs)}`);
}
function endsSection(a,x){
 const p=x.parts,names={whole_object_white:'Whole object (on white)',best_end_pair:'Working ends only (best-matching pair)',whole_plus_ends:'Whole object + ends',end_geometry_only:'End geometry descriptors only',whole_raw_photo:'Whole raw photograph (reference)'};
 return sectionHtml('ends','Working ends vs whole object',`The two terminal 30% segments of each segmented outline were cropped (orientation-aligned) and embedded with DINOv2-B; similarity uses the best-matching pair of ends. ${a.fmt(p.category.n)} records for categories; ${a.fmt(p.fine_subtype.n)} records in ${Object.keys(p.fine_subtype.subtypes).length} fine subtypes (≥ 10 records each).`,
 table('Category retrieval by part (fractions; 95% CI).',['Representation','Category P@10','Cross-museum P@10','Weak-function mAP','Within-category museum enrichment (×)'],Object.entries(p.category.results).map(([k,v])=>[a.esc(names[k]||words(k)),ci(v.category_p10,v.category_p10_ci),ci(v.cross_institution_p10,v.cross_institution_p10_ci),f3(v.weak_function_map),f2(v.within_category_institution_enrichment)]))+
 table('Fine-subtype retrieval (e.g. nasal vs ear speculum).',['Representation','Subtype P@10','Within-category subtype P@10'],Object.entries(p.fine_subtype.results).map(([k,v])=>[a.esc(names[k]||words(k)),ci(v.subtype_p10,v.subtype_p10_ci),ci(v.within_category_subtype_p10,v.within_category_subtype_p10_ci)]))+
 `<details class="ai-exp-details"><summary>Paired differences</summary>${table('Paired per-query differences with 95% bootstrap CI.',['Comparison','Difference [95% CI]'],Object.entries(p.fine_subtype.paired||{}).map(([k,v])=>[pairedLabel(a,k,names),`${signed(v.difference)} <small>[${f3(v.ci95[0])}, ${f3(v.ci95[1])}]</small>`]))}</details>`);
}
function affordanceSection(a,x){
 const res=x.affordances,fns=Object.keys(Object.values(res)[0]?.function_ap||{});
 return sectionHtml('affordances','Zero-shot affordance prompts','Each record photograph is scored against text prompts that describe visible form (e.g. “two hinged jaws”), then prompts linked to a function are pooled. Average precision (AP) is measured against weak rule labels; prevalence is the AP of a random ranking. Prompts describe form, not use.',
 table('AP / prevalence per function and encoder view. Crushing and piercing have too few rule positives to evaluate.',['Function',...Object.keys(res).map(k=>{const [l,s]=repName(k);return `${a.esc(l)}<small>${a.esc(s)}</small>`})],[...fns.map(f=>[a.esc(f),...Object.values(res).map(r=>{const v=r.function_ap[f];return v?`${f3(v.ap)} <small>/ ${f3(v.prevalence)} · ×${(v.ap/v.prevalence).toFixed(1)}</small>`:'<small>not evaluated</small>'})]),['Mean AP',...Object.values(res).map(r=>`<strong>${f3(r.map)}</strong> <small>/ ${f3(r.map_prevalence)} · n = ${a.fmt(r.n_labelled)}</small>`)]],'ai-afford-table'));
}
function crossmodalSection(a,cm){
 const m=cm.methods,langs=[...new Set(Object.values(m).flatMap(v=>Object.keys(v.by_language)))];
 return sectionHtml('crossmodal','Cross-modal text → image retrieval','Catalog-language queries rank record photographs. Scored on the held-out test split only.',
 table('Mean test precision@20 over scored queries, against the mean base rate (random ranking).',['Method','Mean test P@20','Mean base rate',...langs.map(l=>`${LANG[l]||l} P@20`)],Object.entries(m).map(([k,v])=>[k==='adapted'?'Adapted image encoder':'SigLIP 2 zero-shot',f3(v.mean_test_precision_at_20),f3(v.mean_base_rate),...langs.map(l=>f3(v.by_language[l]))]))+`<p><button type="button" data-ai-tab="search">Browse the precomputed queries in Search by task →</button></p>`);
}
function duplicateSection(a,x){
 const n=x.near_duplicates,sens=x.near_duplicate_sensitivity,keys=['dinov2_l14:raw','dinov2_b14:silhouette','fusion:photo+silhouette','outline_multiblock:existing','e5_multilingual:text'].filter(k=>sens[k]);
 const base=Object.fromEntries(x.benchmark.map(r=>[r.representation,r]));
 return sectionHtml('duplicates','Near-duplicate audit',`Rule: ${a.esc(n.rule)}; pairs in the review band (cosine ${n.review_band?n.review_band.map(f3).join('–'):'below the rule'}) are listed for inspection only. ${a.fmt(n.merge_pairs)} merge pairs and ${a.fmt(n.review_pairs)} review pairs affect ${a.fmt(n.records_affected)} records; ${a.fmt(n.cross_institution_merge_pairs)} merge pairs cross museums and ${a.fmt(n.category_conflicts)} conflict in category.`,
 table('Sensitivity: benchmark rerun with near-duplicate pairs merged into one group.',['Representation','Category P@10 (original → merged)','Cross-museum P@10 (original → merged)'],keys.map(k=>{const [l,s]=repName(k);return[`${a.esc(l)}<small>${a.esc(s)}</small>`,`${f3(base[k]?.category_p10)} → ${f3(sens[k].category_p10)} <small>(${signed(sens[k].category_p10-base[k]?.category_p10)})</small>`,`${f3(base[k]?.cross_institution_p10)} → ${f3(sens[k].cross_institution_p10)} <small>(${signed(sens[k].cross_institution_p10-base[k]?.cross_institution_p10)})</small>`]}))+
 `<h3>Example merge pairs <small>${n.examples.length} of ${a.fmt(n.merge_pairs)}</small></h3><ul id="ai-dup-examples" class="ai-pair-grid">${n.examples.map(p=>`<li class="panel"><div class="ai-pair-thumbs">${thumb(a,p.a)}${thumb(a,p.b)}</div><p>cosine ${p.cosine.toFixed(4)} · ${p.same_institution?'same museum':'different museums'}</p><p>${recordLine(a,p.a)}</p><p>${recordLine(a,p.b)}</p></li>`).join('')}</ul>`);
}
function disagreementSection(a,x){
 const d=x.disagreements,cc=d.category_conflicts,ins=d.inspection,byId=Object.fromEntries(cc.items.map(i=>[i.id,i])),codeCount={};for(const i of ins.items)codeCount[i.code]=(codeCount[i.code]||0)+1;
 const md=d.modality_divergence,lk=d.cross_category_lookalikes,top=Object.entries(cc.by_pair).slice(0,10),max=Math.max(...top.map(t=>t[1]));
 return sectionHtml('disagreements','Disagreements',`Category conflicts: records whose catalog category disagrees with their image neighbours (${a.esc(cc.rule)}; ${a.esc(cc.source)}). ${a.fmt(cc.n)} records are flagged. A disagreement is a prompt for inspection, not a correction.`,
 `<div class="ai-two-col"><figure class="panel ai-figure"><figcaption>Most frequent catalog → neighbour category pairs (records)</figcaption><ul class="ai-hbars">${top.map(([k,v])=>`<li><span>${a.esc(words(k))}</span><span class="ai-hbar"><i style="width:${v/max*100}%"></i></span><b>${v}</b></li>`).join('')}</ul></figure>
 <div class="panel"><h3>Inspection codes</h3><p class="muted">${a.esc(ins.status)}. Scope: ${a.esc(ins.scope)}.</p><dl class="ai-codes">${Object.entries(ins.codes).map(([k,v])=>`<div><dt><span class="chip">${a.esc(k)}</span> <small>${codeCount[k]||0} coded</small></dt><dd>${a.esc(v)}</dd></div>`).join('')}</dl></div></div>
 <h3>Inspected conflicts <small>${ins.items.length} coded</small></h3><ul id="ai-disagreements" class="ai-conflict-grid">${ins.items.map(i=>{const c=byId[i.id];return `<li class="panel" data-id="${i.id}"><div class="ai-conflict-main">${thumb(a,i.id)}<div><p>${recordLine(a,i.id)}</p><p>${c?`<small>catalog</small> ${a.esc(words(c.catalog_category))} → <small>neighbours</small> ${a.esc(words(c.neighbour_category))} <small>(${pct(c.neighbour_agreement)})</small>`:'<small>No longer in the current conflict list (coded before the category remapping).</small>'}</p><p><span class="chip">${a.esc(i.code)}</span></p>${i.note?`<p class="muted">${a.esc(i.note)}</p>`:''}</div></div>${c?`<div class="ai-thumbs">${c.neighbours.slice(0,4).map(n=>thumb(a,n.id)).join('')}</div>`:''}</li>`}).join('')}</ul>
 ${ins.additional?.length?`<p class="muted">Additional: ${ins.additional.map(i=>`${recordLine(a,i.id)} <span class="chip">${a.esc(i.code)}</span> ${a.esc(i.note||'')}`).join('; ')}</p>`:''}
 <div class="ai-two-col">${table(`Cross-category look-alikes: ${a.fmt(lk.n)} highly similar silhouette pairs (${a.esc(lk.source)}) whose catalog categories differ.`,['Category pair','Pairs'],Object.entries(lk.by_pair).map(([k,v])=>[a.esc(words(k)),a.fmt(v)]))}
 ${table(`Modality divergence: overlap (Jaccard) of top-10 neighbour sets from ${a.esc(md.image_source)} and ${a.esc(md.text_source)}. Mean ${f3(md.mean_jaccard)}, median ${f3(md.median_jaccard)}; ${a.fmt(md.zero_overlap)} of ${a.fmt(md.n)} records share no neighbour.`,['Museum','Mean Jaccard'],Object.entries(md.by_institution_mean_jaccard).map(([k,v])=>[a.esc(k),f3(v)]))}</div>`);
}
function hypothesisSection(a,x){
 const h=x.hypotheses,fns=Object.keys(h.state_counts),tot={};for(const f of fns)for(const s of STATE_ORDER)tot[s]=(tot[s]||0)+(h.state_counts[f][s]||0);
 const th=h.config.thresholds;
 return sectionHtml('hypotheses','Function hypothesis states',`${a.esc(h.config.version)}: states combine documented statements, catalog-context rules and two image channels (photo DINOv2-L, silhouette DINOv2-B; k = ${h.config.k}). Image hypotheses need calibrated agreement ≥ ${th.image_hypothesis}; conflicts need photo agreement ≤ ${th.image_conflict}. ${a.esc(h.config.calibration.target)}.`,
 `<div class="ai-deep-table"><p class="ai-table-note">Records per function and state (each function sums to all ${a.fmt(STATE_ORDER.reduce((n,s)=>n+(h.state_counts[fns[0]][s]||0),0))} records).</p><div class="table-wrap"><table id="ai-state-counts" aria-label="Records per function and hypothesis state"><thead><tr><th scope="col">Function</th>${STATE_ORDER.map(s=>`<th scope="col">${chip(s)}</th>`).join('')}</tr></thead><tbody>${fns.map(f=>`<tr data-function="${f}"><th scope="row">${a.esc(f)}</th>${STATE_ORDER.map(s=>`<td data-state="${s}">${a.fmt(h.state_counts[f][s]||0)}</td>`).join('')}</tr>`).join('')}<tr class="ai-total"><th scope="row">All functions</th>${STATE_ORDER.map(s=>`<td>${a.fmt(tot[s])}</td>`).join('')}</tr></tbody></table></div></div>`+
 table(`Calibration (${a.esc(h.config.calibration.method)}, fit on ${a.esc(h.config.calibration.fit_split)}, reported on ${a.esc(h.config.calibration.report_split)}): expected calibration error (ECE) against existing rule labels, raw neighbour vote → calibrated; lower is better.`,['Function','Photo ECE (raw → calibrated)','Photo test records / positives','Silhouette ECE (raw → calibrated)','Silhouette test records / positives'],fns.map(f=>{const cell=k=>{const v=h.calibration[`${k}:${f}`];return v?[`${f3(v.ece_test_raw_vote)} → ${f3(v.ece_test_calibrated)}`,`${a.fmt(v.n_test)} / ${a.fmt(v.positives_test)}`]:['<small>not calibrated (no positives)</small>','—']};return[a.esc(f),...cell('photo'),...cell('silhouette')]}),'ai-calibration-table'));
}
function literatureSection(a,lit){
 if(!lit?.entries?.length)return sectionHtml('literature','Literature','','<p>The literature list is not published with this release.</p>');
 const topics=lit.topics||{},groups={};for(const e of lit.entries)(groups[e.topic]||=[]).push(e);
 return sectionHtml('literature','Literature',`${lit.entries.length} sources that shaped the methods and their limits, grouped by topic. Each entry states its implication for this project.`,
 `<div id="ai-literature">${Object.entries(groups).map(([t,list])=>`<details class="panel ai-lit"><summary>${a.esc(topics[t]||words(t))} <small>${list.length}</small></summary><ul>${list.map(e=>`<li><p><a href="${a.esc(e.doi_or_url)}" target="_blank" rel="noopener">${a.esc(e.title)}</a></p><p class="muted">${a.esc(e.authors)} (${a.esc(e.year)}). ${a.esc(e.venue)}.</p><p><strong>Implication:</strong> ${a.esc(e.implication)}</p></li>`).join('')}</ul></details>`).join('')}</div>`);
}
function limitsSection(a,x){
 const next=Array.isArray(x.findings)?null:x.findings?.next_experiments;
 const prov=summary.provenance;
 return sectionHtml('limits','Limitations & next experiments','',`<ul class="ai-limits">${summary.limitations.map(l=>`<li>${a.esc(l)}</li>`).join('')}</ul>
 <h3>Next experiments</h3>${next?.length?`<ol class="ai-next">${next.map(n=>`<li><strong>${a.esc(n.title)}.</strong> ${a.esc(n.detail)}</li>`).join('')}</ol>`:'<p>Next experiments will be listed with the published findings.</p>'}
 ${x.external?externalSection(a,x.external):''}
 <details class="panel ai-provenance"><summary>Provenance: run IDs, file and code hashes</summary><p>Training performed: ${a.esc(summary.training_performed)}. Weights published: ${summary.weights_published?'yes':'no'}. Vectors published: ${summary.vectors_published?'yes':'no'}.</p><pre>${a.esc(JSON.stringify({sources:prov.sources,encoders:prov.encoders,code_sha256:prov.code_sha256,files:summary.files},null,1))}</pre></details>
 <div class="analysis-actions">${['summary.json','experiments.json','crossmodal.json','maps.json','literature.json'].filter(n=>n==='summary.json'||summary.files[n]).map(n=>`<a href="${a.context.base}ai-deep/${n}" download>${n}</a>`).join('')}<a href="docs/AI_METHODS.md">Website methods</a></div>`);
}

// ---------- Generated outlines: text- and date-conditioned silhouette diffusion (exploratory) ----------
const GEN_METHODS=[['generator','Generator (name + date)'],['text_only','Generator (name only)'],['retrieval_text','Nearest training name'],['family_random','Random, same family'],['unconditional','Generator (no condition)']];
const GEN_ERA={up_to_1850:'Catalog date ≤ 1850',from_1850:'Catalog date ≥ 1850',straddling_1850:'Range spans 1850',undated:'Undated'};
const yearOf=v=>v==null?'undated':v<0?`${-v} BCE`:String(v);
const span=(s,e)=>s==null?'undated':e==null||e===s?yearOf(s):`${yearOf(s)}–${yearOf(e)}`;
const cis=c=>`<small>[${signed(c.ci95[0])}, ${signed(c.ci95[1])}]</small>`;
function maskCanvas(i,label,cls=''){return `<canvas class="ai-mask ${cls}" width="128" height="128" data-mask="${i}" role="img" aria-label="${label}"></canvas>`}
function paintMasks(a,d,scope=a.root()){
 const ink=getComputedStyle(a.root()).getPropertyValue('--ink').trim()||'#1f1f1f',n=d.mask_size;
 scope.querySelectorAll('canvas[data-mask]').forEach(c=>{const bytes=atob(d.masks[Number(c.dataset.mask)]),g=c.getContext('2d'),img=g.createImageData(n,n);for(let i=0;i<n*n;i++)if((bytes.charCodeAt(i>>3)>>(7-(i&7)))&1)img.data[i*4+3]=255;g.putImageData(img,0,0);g.globalCompositeOperation='source-in';g.fillStyle=ink;g.fillRect(0,0,n,n);g.globalCompositeOperation='source-over'});
}
function verdictCard(a,id,title,sub,e){
 const d=e.generator_minus_retrieval,yes=e.decision.startsWith('adds');
 return `<div class="panel ai-gen-verdict" id="${id}" data-decision="${yes?'beyond':'none'}"><h3>${title}</h3><p class="muted">${sub}</p><p class="ai-gen-decision">${yes?'Adds information beyond retrieval':'No evidence of generation beyond retrieval'}</p>
 <dl><div><dt>Outline overlap (IoU)</dt><dd><strong>${signed(d.iou_mean.mean)}</strong> ${cis(d.iou_mean)}</dd></div><div><dt>Look-alike score (DINOv2 cosine)</dt><dd><strong>${signed(d.dino_mean.mean)}</strong> ${cis(d.dino_mean)}</dd></div></dl>
 <p class="ai-gen-foot">Generator minus nearest-name retrieval, mean of ${a.fmt(4)} candidates per record · n = ${a.fmt(e.evaluated_records)} records (${a.fmt(d.iou_mean.groups)} leakage groups) · ${e.runs?.length||e.per_seed_generator_minus_retrieval.length} seed${e.per_seed_generator_minus_retrieval.length>1?'s pooled':''}</p></div>`;
}
function galleryHtml(a,d){
 const g=d.gallery,prompt=g.prompts[genPrompt].prompt,cells=g.cells.filter(c=>c.prompt===prompt),stat=g.prompts[genPrompt],last=g.prompts.length-1;
 return `<div class="ai-gen-prompts ai-segments" role="group" aria-label="Prompt">${g.prompts.map((x,i)=>`<button type="button" data-ai-deep="gen-prompt" data-value="${i}" aria-pressed="${i===genPrompt}">${a.esc(x.prompt)}${i===last?' <small>(control)</small>':''}</button>`).join('')}</div>
 <p class="ai-table-note" id="ai-gen-prompt-note">“${a.esc(prompt)}”: median IoU of the ${stat.n} samples with their nearest training outline ${f2(stat.nearest_train_iou_median)}; ${pct(stat['share_iou_ge_0.9'])} at or above 0.9 (near copies).${genPrompt===last?' Control prompt: an object outside the collection. The model still draws an instrument-like outline, because it can only draw what it was trained on.':''}</p>
 <div class="ai-gen-gallery" id="ai-gen-gallery">${cells.map(c=>`<figure class="ai-gen-cell"><figcaption>${c.date==null?'No date':a.esc(String(c.date))}</figcaption>${c.samples.map((s,j)=>`<div class="ai-gen-pair">${maskCanvas(s.mask,`Generated outline ${j+1} for “${a.esc(prompt)}”, ${c.date??'no date'}`)}<a class="ai-gen-near" href="#item/${s.nearest.id}" title="${a.esc(s.nearest.name)} · #${s.nearest.id}">${maskCanvas(s.nearest.mask,`Nearest training outline: ${a.esc(s.nearest.name)}`,'ai-mask-ref')}<span>${a.esc(s.nearest.name)} <small>IoU ${f2(s.nearest.iou)}</small></span></a></div>`).join('')}</figure>`).join('')}</div>`;
}
function retroHtml(a,d){
 return `<div class="ai-gen-retro" id="ai-gen-retro" role="table" aria-label="After-1850 records, nearest pre-1850 name and generated outlines"><div class="ai-gen-retro-head" role="row"><span role="columnheader">After-1850 record (real)</span><span role="columnheader">Nearest pre-1850 name</span><span role="columnheader">Generated from name + date (seed 17)</span></div>
 ${d.retro_examples.map(r=>`<div class="ai-gen-retro-row" role="row"${r.clamp?' data-clamp="true"':''}><div role="cell">${maskCanvas(r.real,`Real outline of ${a.esc(r.name)}`)}<p><a href="#item/${r.id}">${a.esc(r.name)}</a><small>#${r.id} · ${span(r.start,r.end)} · ${a.esc(words(r.family))}</small></p></div>
 <div role="cell">${maskCanvas(r.retrieval.mask,`Training outline of ${a.esc(r.retrieval.name)}`,'ai-mask-ref')}<p><a href="#item/${r.retrieval.id}">${a.esc(r.retrieval.name)}</a><small>${yearOf(r.retrieval.start)}</small></p></div>
 <div role="cell" class="ai-gen-three">${r.generated.map((m,j)=>`<span>${maskCanvas(m,`Generated outline ${j+1} for ${a.esc(r.name)}`)}<small>nearest train IoU ${f2(r.nearest_train_iou[j])}</small></span>`).join('')}</div></div>`).join('')}</div>`;
}
function genScores(a,d){
 const F=d.experiments.full,R=d.experiments.retro1850,cell=(e,m,k)=>e.methods[m]?ci(e.methods[m][k].mean,e.methods[m][k].ci95):'—';
 const methods=table(`Mean over ${d.k} candidates per record. Mask IoU and DINOv2 cosine are dimensionless (0–1, higher = closer to the real outline). 95% intervals from ${a.fmt(d.bootstrap)} leakage-group bootstrap resamples. “Name only” ran on seed 17 of the after-1850 test.`,['Method','Held-out IoU','Held-out DINOv2','After-1850 IoU','After-1850 DINOv2'],GEN_METHODS.map(([m,l])=>[a.esc(l),cell(F,m,'iou_mean'),cell(F,m,'dino_mean'),cell(R,m,'iou_mean'),cell(R,m,'dino_mean')]),'ai-gen-methods');
 const eras=F.by_era?table('Full model, held-out records split by catalog date (descriptive; not part of the decision rule). After-1850 tools here have their era in training, unlike the retrodiction test.',['Era','n','Generator IoU','Retrieval IoU','Difference','Generator DINOv2','Retrieval DINOv2','Difference'],Object.entries(F.by_era).map(([k,v])=>[GEN_ERA[k]||words(k),a.fmt(v.n),ci(v.generator.iou_mean.mean,v.generator.iou_mean.ci95),ci(v.retrieval_text.iou_mean.mean,v.retrieval_text.iou_mean.ci95),`${signed(v.generator_minus_retrieval.iou_mean.mean)} ${cis(v.generator_minus_retrieval.iou_mean)}`,ci(v.generator.dino_mean.mean,v.generator.dino_mean.ci95),ci(v.retrieval_text.dino_mean.mean,v.retrieval_text.dino_mean.ci95),`${signed(v.generator_minus_retrieval.dino_mean.mean)} ${cis(v.generator_minus_retrieval.dino_mean)}`]),'ai-gen-era'):'';
 const c=R.clamp_subset,clamp=c?table(`After-1850 records named as clamps or artery forceps (n = ${c.n}); the pre-1850 training set has ${c.train_clamp_named} clamp-named outlines. Descriptive subset.`,['Method','IoU','DINOv2'],[['generator','Generator (name + date)'],['retrieval_text','Nearest training name'],['family_random','Random, same family']].map(([m,l])=>[l,ci(c.methods[m].iou_mean.mean,c.methods[m].iou_mean.ci95),ci(c.methods[m].dino_mean.mean,c.methods[m].dino_mean.ci95)]).concat([[`Generator minus retrieval`,`${signed(c.generator_minus_retrieval.iou_mean.mean)} ${cis(c.generator_minus_retrieval.iou_mean)}`,`${signed(c.generator_minus_retrieval.dino_mean.mean)} ${cis(c.generator_minus_retrieval.dino_mean)}`]]),'ai-gen-clamp'):'';
 const mean=(l,k)=>l.reduce((s,x)=>s+x[k],0)/l.length;
 const memo=table('Memorisation: for every generated outline, IoU with its nearest training outline. Real held-out outlines give the reference for how close an unseen tool naturally sits to the training set. Coverage: k-NN precision (generated outlines that fall on the real manifold) and recall (real outlines the generator reaches), DINOv2 features, k = 5, one sample per record; mean over seeds.',['Test','Generated: median nearest-train IoU','Generated: share ≥ 0.9','Real held-out: median','Real held-out: share ≥ 0.9','Precision','Recall'],[['Held-out test split',F],['After 1850, trained before',R]].map(([l,e])=>[l,f3(mean(e.memorisation.runs,'generated_nearest_train_iou_median')),pct(mean(e.memorisation.runs,'generated_share_iou_ge_0.9')),f3(e.memorisation.reference_real_heldout_nearest_train_iou_median),pct(e.memorisation['reference_real_heldout_share_iou_ge_0.9']),f3(mean(e.coverage,'precision')),f3(mean(e.coverage,'recall'))]),'ai-gen-memo');
 const t=R.generator_minus_text_only_seed17,seeds=R.per_seed_generator_minus_retrieval;
 const extra=`<ul class="ai-gen-facts">${t?`<li>Adding the date (after-1850 test, seed 17): IoU ${signed(t.iou_mean.mean)} ${cis(t.iou_mean)}, DINOv2 ${signed(t.dino_mean.mean)} ${cis(t.dino_mean)} relative to name only.</li>`:''}<li>Per seed, generator minus retrieval (after-1850): ${seeds.map(s=>`seed ${s.seed}: IoU ${signed(s.iou_mean.mean)}, DINOv2 ${signed(s.dino_mean.mean)}`).join('; ')}.</li><li>Generator minus a random outline of the same family: held-out IoU ${signed(F.generator_minus_family_random.iou_mean.mean)} ${cis(F.generator_minus_family_random.iou_mean)}; after-1850 IoU ${signed(R.generator_minus_family_random.iou_mean.mean)} ${cis(R.generator_minus_family_random.iou_mean)}.</li></ul>`;
 return methods+extra+eras+clamp+memo;
}
// Flowcharts: each step is labelled by kind in text and border style, not by colour alone.
const FLOW_KIND={data:'Input',step:'Step',frozen:'Ready-made AI',trained:'AI trained here',output:'Output',test:'Check'};
const FLOWS={
 name:[['data','A catalog name and date'],['frozen','A text model reads the name'],['trained','An outline drawer'],['output','4 drawn outlines (4 tries from different random starts)'],['test','Better than copying the tool with the closest name?']],
 space:[['data','A tool’s outline, cut out of its photo'],['step','Standard pose: angle, mirror image and size removed'],['frozen','An image model reads the outline'],['output','Its shape fingerprint: one point in shape space'],['trained','An outline drawer turns any point back into an outline'],['output','A drawn outline'],['test','Read the drawing again: does it land on the same point?']],
 tempo:[['data','Dated outlines of one tool family'],['step','Find the 2 main ways their shapes differ'],['step','Average shape every 25 years'],['test','Fit 5 patterns of change used for fossils'],['output','The pattern that fits best'],['test','Simulate: with this much data, would we pick the right pattern?']]};
const FLOW_NOTE={frozen:'<b>Ready-made AI</b>: downloaded and used unchanged.',trained:'<b>AI trained here</b>: learned only from this collection’s outlines.'};
function flow(id,steps){const kinds=new Set(steps.map(s=>s[0]));return `<ol class="ai-flow" id="${id}" aria-label="How it works, step by step">${steps.map(([k,t])=>`<li data-kind="${k}"><small>${FLOW_KIND[k]}</small><span>${t}</span></li>`).join('')}</ol>${[...kinds].some(k=>FLOW_NOTE[k])?`<p class="ai-flow-key">${Object.entries(FLOW_NOTE).filter(([k])=>kinds.has(k)).map(([,t])=>t).join(' ')}</p>`:''}`}
const GEN_VIEWS=[['space','Fill the gaps?','latent.json'],['tempo','Gradual or jumps?','tempo.json']],GEN_NAME=['name','Earlier test: drawing from a catalog name','generate.json'];
function genHead(a,views,file){return `<div class="ai-toolbar ai-gen-toolbar"><div><h2>Generate</h2></div>${seg('View',views.map(([k,l])=>[k,l]),genView,'gen-view')}<a href="${a.context.base}ai-deep/${file}" download>Export results (JSON)</a></div>`}
async function generate(a){
 const s=await manifest(a),views=GEN_VIEWS.filter(v=>s.files[v[2]]),hasName=Boolean(s.files[GEN_NAME[2]]);
 if(!views.length&&!hasName){a.$('ai-content').innerHTML=`<div class="ai-toolbar"><div><h2>Generate</h2></div></div><p class="ai-deep-note" role="status">No generative run has been published for this dataset release.</p>`;return}
 if(!(views.some(v=>v[0]===genView)||(genView==='name'&&hasName)))genView=(views[0]||GEN_NAME)[0];
 const name=(views.find(v=>v[0]===genView)||GEN_NAME)[2],d=await file(a,name);if(!a.current())return;
 const head=genHead(a,views,name);
 if(genView==='name')genName(a,head,d);else if(genView==='space')genSpace(a,head,d);else genTempo(a,head,d);
 if(hasName&&genView!=='name')a.$('ai-content').insertAdjacentHTML('beforeend',`<p class="ai-gen-earlier">${GEN_NAME[1]}: <button type="button" class="ai-link" data-ai-deep="gen-view" data-value="name">open</button>. Dropped from the main view because museums name the same tool differently.</p>`);
 paintMasks(a,d);
 if(genView==='tempo'&&s.files['between.json']){const b=await file(a,'between.json');if(!a.current())return;a.$('ai-tempo-refs').insertAdjacentHTML('beforebegin',betweenSection(a,b));paintMasks(a,b,a.$('ai-between'))}
}
function genName(a,head,d){
 const F=d.experiments.full,R=d.experiments.retro1850,ex=R.excluded;
 a.$('ai-content').innerHTML=`${head}${flow('ai-flow-name',FLOWS.name)}
 <p class="ai-caution">An earlier test, kept for the record. Museums name the same tool differently, so drawing from a name mostly measures catalog wording. Drawings are 2-D form hypotheses, not designs: no scale, mechanism, material or function. Run ${a.esc(d.run_id)}.</p>
 <div class="ai-gen-verdicts">${verdictCard(a,'ai-gen-v-full','Held-out tools','Trained on the train split, scored on unseen tools.',F)}${verdictCard(a,'ai-gen-v-retro','Trained before 1850, tested after','Only outlines dated ≤ 1850 in training; scored on tools dated ≥ 1850.',R)}</div>
 <h3 class="ai-gen-h">Draw from a prompt</h3>
 <p class="ai-exp-lede">Generated outline (black) beside the nearest real tool (grey).</p>
 <div id="ai-gen-prompt-host">${galleryHtml(a,d)}</div>
 <h3 class="ai-gen-h">Before 1850 → after 1850</h3>
 ${retroHtml(a,d)}
 <details class="ai-exp-details"><summary>All scores and checks</summary>${genScores(a,d)}</details>
 <details class="ai-exp-details"><summary>Method, data and decision rule</summary><p>${a.esc(d.note)}</p><p><strong>Decision rule.</strong> ${a.esc(d.decision_rule)}</p><p class="ai-gen-excl">After-1850 test exclusions: ${a.fmt(ex.undated)} undated, ${a.fmt(ex.straddle_1850)} with a range spanning 1850, ${a.fmt(ex.post_sharing_group_with_train)} sharing a duplicate group with training. Before 1850 the collection has ${a.fmt(R.train_records)} usable outlines. The text encoder learned language from modern web data, so the test is blind to later shapes but not to later words.</p><p><strong>Data.</strong> ${a.fmt(d.prep.records)} outlines, ${a.fmt(d.prep.distinct_names)} distinct names, ${a.fmt(d.prep.undated)} undated. ${d.prep.masks_with_specks_removed} masks had stray specks removed and ${d.prep.masks_with_border_strips_removed} had a frame-edge strip removed; ${d.prep.excluded_only_border_strip.length} records were only a strip and are excluded (${d.prep.excluded_only_border_strip.map(a.esc).join(', ')}).</p><p><strong>Known issue.</strong> ${a.esc(d.known_issue)}</p><p>Config ${a.esc(d.config_version)}. Metric encoder ${a.esc(d.metric_encoder)}. Weights are not published. Methods: <a href="docs/AI_DEEP_METHODS.md">AI_DEEP_METHODS.md</a>.</p></details>`;
}
// ---------- Generate from the shape space: frozen encoder, trained decoder ----------
function tile(id,question,answer,detail,state){return `<div class="panel ai-lat-tile" id="${id}" data-state="${state}"><h3>${question}</h3><p class="ai-lat-answer">${answer}</p><p class="ai-gen-foot">${detail}</p></div>`}
const recLink=(a,r)=>`<a href="#item/${r.id}">${a.esc(r.name)}</a><small>#${r.id} · ${span(r.start,r.end)}</small>`;
function latStrip(a,d,e){
 const tau=d.geometry.gap_threshold_k10,rho=d.reconstruction.realisable_threshold_rho;
 return `<div class="ai-lat-path" data-set="${e.set}" role="group" aria-label="Path from ${a.esc(e.a.name)} to ${a.esc(e.b.name)}"><div class="ai-lat-end">${maskCanvas(e.a.mask,`Real outline of ${a.esc(e.a.name)}`)}<p>${recLink(a,e.a)}</p></div>
 <div class="ai-lat-steps">${e.decoded.map((m,t)=>`<span class="${e.density[t]<tau?'ai-lat-gap':''}${e.cycle[t]<rho?' ai-lat-miss':''}">${maskCanvas(m,`Decoded outline at ${t}/8 of the way, density ${f2(e.density[t])}, cycle cosine ${f2(e.cycle[t])}`)}</span>`).join('')}</div>
 <div class="ai-lat-end">${maskCanvas(e.b.mask,`Real outline of ${a.esc(e.b.name)}`)}<p>${recLink(a,e.b)}</p></div></div>`;
}
function quintileChart(P,rho){
 const q=P.by_density_quintile,W=320,H=150,l=34,b=26,w=(W-l-8)/q.length,y=v=>H-b-(H-b-10)*v;
 return `<svg class="ai-lat-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Share of prior draws that decode back to their point, by density quintile">${[0,.5,1].map(v=>`<line x1="${l}" x2="${W-8}" y1="${y(v)}" y2="${y(v)}" class="ai-grid"/><text x="${l-4}" y="${y(v)+3}" text-anchor="end">${pct(v)}</text>`).join('')}
 ${q.map((r,i)=>{const x=l+i*w+w*.18,s=r.realisable_share;return `<rect x="${x}" y="${y(s.mean)}" width="${w*.64}" height="${y(0)-y(s.mean)}" class="ai-bar${i===0?' ai-bar-low':''}"><title>${pct(s.mean)} realisable, density ${f2(r.density_range[0])}–${f2(r.density_range[1])}, n ${r.n}</title></rect><line x1="${x+w*.32}" x2="${x+w*.32}" y1="${y(s.ci95[0])}" y2="${y(s.ci95[1])}" class="ai-whisker"/><text x="${x+w*.32}" y="${H-b+12}" text-anchor="middle">${i===0?'sparse':i===q.length-1?'dense':''}</text>`}).join('')}
 <text x="${l+(W-l)/2}" y="${H-2}" text-anchor="middle">density quintile of the drawn point</text></svg>`;
}
function genSpace(a,head,d){
 const R=d.reconstruction,df=R.decoder_minus_latent_retrieval,yes=R.decision.startsWith('decoder produces'),P=d.prior,G=d.geometry,sets=Object.values(d.paths);
 const gapShare=Math.max(...sets.map(s=>s.interior_gap_share_k10.mean)),ab=sets.map(s=>s.abruptness.all.mean),tau=G.gap_threshold_k10;
 const groups=[['neighbour','Between close look-alikes'],['random','Between two random tools'],['chronological','From a tool dated before 1850 to one dated after, same family']],M=R.methods,maxOne=d.path_steps?Math.max(...Object.values(d.path_steps).map(x=>x.share_one_step_over_half)):null;
 a.$('ai-content').innerHTML=`${head}
 <p class="ai-lede">The map has white space between groups of tools. Is that real empty space, so that shapes jumped from one group to another, or is there room for in-between forms? Here the AI works only in shape space: it walks between real tools and draws what it finds on the way.</p>
 ${flow('ai-flow-space',FLOWS.space)}

 <p class="ai-callout">Try it yourself: <button type="button" data-ai-deep="goto-map">Map of tools → Outline shape</button> and hover anywhere to see the AI’s drawing for that spot.</p>
 <p class="ai-caution">Drawings are 2-D shape suggestions with no size, mechanism or material, not designs. Run ${a.esc(d.run_id)}.</p>
 <div class="ai-lat-tiles">
 ${tile('ai-lat-v-recon','Can it redraw a tool it never saw, better than copying the closest known tool?',yes?'Yes':'No',`Overlap with the real outline (0–1): drawing ${f2(M.decoder.iou_mean.mean)}, copy ${f2(M.latent_retrieval.iou_mean.mean)}; difference ${signed(df.iou_mean.mean)} ${cis(df.iou_mean)}. Image-model similarity difference ${signed(df.dino_mean.mean)} ${cis(df.dino_mean)} · ${a.fmt(R.evaluated_records)} unseen tools.`,yes?'yes':'no')}
 ${tile('ai-lat-v-gap','Is there empty space between tools?',pct1(gapShare),`of the stops on a straight walk between two tools land where no real tools are nearby (at most, over three kinds of walks). Even between the 2,000 least alike pairs: ${pct1(G.least_similar_test_pairs.midpoint_gap_share_k10)}.`,gapShare>0.05?'yes':'no')}
 ${tile('ai-lat-v-prior','Can it draw shapes far from every real tool?',P.gap.realisable_share?`${pct(P.gap.realisable_share.mean)} vs ${pct(P.not_gap.realisable_share.mean)}`:'—',`of random spots whose drawing reads back as the spot asked for: spots far from real tools (${a.fmt(P.gap.n)}) vs the rest (${a.fmt(P.not_gap.n)}). Mostly no.`,'info')}
 ${tile('ai-lat-v-abrupt','Does the shape change smoothly along a walk?',pct(Math.max(...ab)),`of the total change happens in the biggest of the 8 steps (12.5% = perfectly even, 100% = all in one jump).${maxOne!=null?` One step carried more than half the change in ${pct1(maxOne)} of walks.`:''}`,'info')}
 </div>
 <h3 class="ai-gen-h">Walk between two tools</h3>
 <p class="ai-exp-lede">Start at a real tool (left), walk in a straight line through shape space to another real tool (right), and let the AI draw 9 stops on the way. Every stop uses the same random start, so changes come from the position only. <span class="ai-key ai-lat-gap-key">no real tools nearby</span> <span class="ai-key ai-lat-miss-key">drawing does not read back as this stop</span></p>
 <div id="ai-lat-paths">${groups.map(([k,l])=>{const rows=d.path_examples.filter(e=>e.set===k);return rows.length?`<h4>${l}</h4>${rows.map(e=>latStrip(a,d,e)).join('')}`:''}).join('')}</div>
 <h3 class="ai-gen-h">Random spots in shape space</h3>
 <p class="ai-exp-lede">Spots picked at random, more often where tools are common (a bell curve fitted to the real tools, as in a VAE), then drawn. Top row: the spots furthest from any real tool.</p>
 <div class="ai-lat-prior-layout"><div id="ai-lat-prior">${[['lowest','Far from tools'],['median','Typical'],['highest','Among many tools']].map(([k,l])=>`<div class="ai-lat-prior-row" data-band="${k}"><span class="ai-lat-band">${l}</span><div>${d.prior_examples[k].map((x,i)=>`<span class="${x.density<tau?'ai-lat-gap':''}${x.cycle<R.realisable_threshold_rho?' ai-lat-miss':''}">${maskCanvas(x.mask,`${l} draw ${i+1}: density ${f2(x.density)}, cycle cosine ${f2(x.cycle)}, nearest real outline IoU ${f2(x.nearest_iou)}`)}</span>`).join('')}</div></div>`).join('')}</div>
 <figure class="panel ai-lat-figure">${EXPAND}${quintileChart(P,R.realisable_threshold_rho)}<figcaption>Share of drawings that read back as their spot, from spots far from tools (left) to spots among many tools (right), with 95% CI · Spearman(density, cycle) ${f2(P.spearman_density_vs_cycle)}</figcaption></figure></div>
 <h3 class="ai-gen-h">Redrawing tools the AI never saw</h3>
 <p class="ai-exp-lede">The real outline, three drawings from its fingerprint (three tries from different random starts) and the most similar tool the AI did see in training.</p>
 <div class="ai-lat-recon" id="ai-lat-recon" role="table" aria-label="Held-out tools: real outline, decoded outlines and nearest training tool"><div class="ai-lat-recon-head" role="row"><span role="columnheader">Real tool (never seen)</span><span role="columnheader">AI drawings, 3 tries</span><span role="columnheader">Closest tool it saw</span></div>
 ${d.recon_examples.map(r=>`<div class="ai-lat-recon-row" role="row"><div role="cell">${maskCanvas(r.mask,`Real outline of ${a.esc(r.name)}`)}<p>${recLink(a,r)}</p></div><div role="cell" class="ai-gen-three">${r.decoded.map((m,j)=>`<span>${maskCanvas(m,`Decoded outline ${j+1} of ${a.esc(r.name)}`)}<small>cycle ${f2(r.cycle[j])}</small></span>`).join('')}</div><div role="cell">${maskCanvas(r.retrieval.mask,`Training outline of ${a.esc(r.retrieval.name)}`,'ai-mask-ref')}<p>${recLink(a,r.retrieval)}</p></div></div>`).join('')}</div>
 <details class="ai-exp-details"><summary>All scores and checks</summary>
 ${table(`Reconstruction of ${a.fmt(R.evaluated_records)} held-out tools, mean of ${d.k}; 95% leakage-group bootstrap. Guidance ${R.guidance} chosen on the validation split.`,['Method','IoU','DINOv2'],[['decoder','Decoder'],['latent_retrieval','Nearest training point']].map(([m,l])=>[l,ci(R.methods[m].iou_mean.mean,R.methods[m].iou_mean.ci95),ci(R.methods[m].dino_mean.mean,R.methods[m].dino_mean.ci95)]),'ai-lat-recon-table')}
 ${table('Paths between two tools (bootstrap over pairs).',['Pairs','n','Endpoint cosine','Sparse points','Lands back (all points)','Abruptness'],groups.filter(([k])=>d.paths[k]).map(([k,l])=>{const s=d.paths[k];return [l,a.fmt(s.pairs),f2(s.endpoint_cosine.mean),pct(s.interior_gap_share_k10.mean),s.realisable_share.occupied_interior_points?pct(s.realisable_share.occupied_interior_points.mean):'—',ci(s.abruptness.all.mean,s.abruptness.all.ci95)]}),'ai-lat-paths-table')}
 <ul class="ai-gen-facts"><li>Cycle cosine of real held-out tools: ${ci(R.cycle_cosine.mean,R.cycle_cosine.ci95)}; “lands back” means at least ${f2(R.realisable_threshold_rho)} (their 5th percentile).</li><li>Memorisation: decoded outlines' median IoU with the nearest training outline ${f2(R.memorisation.decoded_nearest_train_iou_median)} (real held-out: ${f2(R.memorisation.real_heldout_nearest_train_iou_median)}); ${pct(R.memorisation['decoded_share_iou_ge_0.9'])} at or above 0.9.</li><li>The 2-D map is UMAP: it keeps ${pct(G.map.knn10_overlap_map_features_vs_plane)} of each tool's 10 nearest neighbours, so white space on the map is not empty space. The map now uses this pose-normalised space.</li></ul></details>
 <details class="ai-exp-details"><summary>Method and amendments</summary><p>${a.esc(d.question)}</p><p>${a.esc(d.note)}</p><p><strong>Decision rule.</strong> ${a.esc(d.decision_rule)}</p>${d.amendments.map(x=>`<p><strong>Amendment.</strong> ${a.esc(x)}</p>`).join('')}<p>Config ${a.esc(d.config_version)}. Decoder trained ${a.fmt(d.run.steps)} steps on ${a.fmt(d.run.train_records)} outlines. Weights are not published.</p></details>`;
}
// ---------- Gradual or jumps: paleontology model comparison on the dated record ----------
const TEMPO_MODELS=[['stasis','Stays put'],['URW','Wanders'],['GRW','Trend'],['OU','Settles'],['punctuation','One jump']];
// Plain description, paleontology name, and a small example curve (x 0-60, y 2-22) for each pattern.
const TEMPO_PLAIN={
 stasis:['Wobbles around one average shape; no lasting change.','stasis','0,12 6,9 12,14 18,10 24,13 30,11 36,15 42,10 48,13 54,11 60,12'],
 URW:['Each period starts from the last and drifts a random way.','random walk','0,14 6,12 12,15 18,11 24,8 30,10 36,7 42,9 48,13 54,12 60,16'],
 GRW:['Drifts steadily in one direction.','directional trend','0,20 6,19 12,17 18,17 24,14 30,13 36,11 42,10 48,7 54,6 60,4'],
 OU:['Moves toward a preferred shape, then stays near it.','pull to an optimum (Ornstein-Uhlenbeck)','0,21 6,15 12,11 18,9 24,8 30,7 36,8 42,7 48,6 54,7 60,7'],
 punctuation:['Stable, a sudden shift, then stable again.','punctuated change','0,17 6,18 12,16 18,17 24,18 30,17 31,7 36,6 42,8 48,7 54,6 60,7']};
const tempoIcon=k=>`<svg class="ai-tempo-icon" viewBox="0 0 60 24" aria-hidden="true"><polyline points="${TEMPO_PLAIN[k][2]}" fill="none" data-model="${k}"/></svg>`;
// Strength of evidence for the best pattern, from its Akaike weight, how often the simulation recovers it,
// and (for a jump) how often patterns without a jump fake one. Rule stated on the page.
function tempoConfidence(s){
 const w=s.models[s.best].weight,rec=s.recovery.recovered[s.best],fj=Math.max(...Object.values(s.recovery.false_jump_rate)),why=[];
 if(w<0.5)why.push('other patterns fit almost as well');
 if(rec<0.5)why.push('with this much data the pattern is usually not recognised');
 if(s.best==='punctuation'&&fj>0.2)why.push(`patterns without a jump still produce one in ${pct(fj)} of simulations`);
 if(why.length)return ['weak',why];
 return w>=0.7&&rec>=0.8&&(s.best!=='punctuation'||fj<=0.1)?['strong',[]]:['moderate',[]];
}
function tempoChart(a,s){
 const W=420,H=150,l=8,r=8,t=10,b=20,x0=1650,x1=2025,X=v=>l+(W-l-r)*(v-x0)/(x1-x0);
 const c=s.bin_centre_years,se=s.n.map(n=>1.96*Math.sqrt(s.pooled_within_bin_variance/n)),f=s.models[s.best];
 let lo=Math.min(...s.mean.map((m,i)=>m-se[i])),hi=Math.max(...s.mean.map((m,i)=>m+se[i]));const pad=(hi-lo)*.08;lo-=pad;hi+=pad;const Y=v=>t+(H-t-b)*(hi-v)/(hi-lo);
 let fit='';
 if(s.best==='stasis')fit=`<line x1="${X(c[0])}" x2="${X(c.at(-1))}" y1="${Y(f.theta)}" y2="${Y(f.theta)}" class="ai-fit"/>`;
 else if(s.best==='punctuation'){const k=f.shift_index,m=(c[k-1]+c[k])/2;fit=`<line x1="${X(c[0])}" x2="${X(c[k-1])}" y1="${Y(f.theta1)}" y2="${Y(f.theta1)}" class="ai-fit"/><line x1="${X(c[k])}" x2="${X(c.at(-1))}" y1="${Y(f.theta2)}" y2="${Y(f.theta2)}" class="ai-fit"/><line x1="${X(m)}" x2="${X(m)}" y1="${t}" y2="${H-b}" class="ai-jump"/><text x="${X(m)+3}" y="${t+9}">jump ≈ ${Math.round(m)}</text>`}
 else if(s.best==='GRW')fit=`<line x1="${X(c[0])}" x2="${X(c.at(-1))}" y1="${Y(f.anc)}" y2="${Y(f.anc+f.mu*(c.at(-1)-c[0])/100)}" class="ai-fit"/>`;
 else if(s.best==='OU'){const xs=Array.from({length:40},(_,i)=>c[0]+(c.at(-1)-c[0])*i/39);fit=`<polyline fill="none" points="${xs.map(x=>`${X(x)},${Y(f.theta+(f.anc-f.theta)*Math.exp(-f.alpha*(x-c[0])/100))}`).join(' ')}" class="ai-fit"/>`}
 return `<svg class="ai-tempo-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mean score per 25-year bin with 95% intervals; best model ${s.best}">${[1700,1800,1900,2000].map(v=>`<line x1="${X(v)}" x2="${X(v)}" y1="${t}" y2="${H-b}" class="ai-grid"/><text x="${X(v)}" y="${H-6}" text-anchor="middle">${v}</text>`).join('')}${fit}${c.map((v,i)=>`<line x1="${X(v)}" x2="${X(v)}" y1="${Y(s.mean[i]+se[i])}" y2="${Y(s.mean[i]-se[i])}" class="ai-whisker"/><circle cx="${X(v)}" cy="${Y(s.mean[i])}" r="${Math.min(5,1.6+Math.sqrt(s.n[i])/4)}" class="ai-tdot"><title>${s.bin_start_years[i]}–${s.bin_start_years[i]+24}: n ${s.n[i]}</title></circle>`).join('')}</svg>`;
}
const weightBar=s=>`<div class="ai-tempo-weights" role="img" aria-label="Akaike weights: ${TEMPO_MODELS.map(([k,l])=>`${l} ${pct(s.models[k].weight)}`).join(', ')}">${TEMPO_MODELS.map(([k])=>`<i data-model="${k}" style="width:${(s.models[k].weight*100).toFixed(1)}%"></i>`).join('')}</div>`;
function genTempo(a,head,d){
 const c=d.counts,inst=Object.entries(c.institutions).sort((x,y)=>y[1]-x[1]),label=k=>TEMPO_MODELS.find(m=>m[0]===k)?.[1]||k;
 const fams=Object.entries(d.families).filter(([,v])=>v.pc1_25y?.fitted||v.pc2_25y?.fitted);
 const doi=r=>r.doi?`<a href="https://doi.org/${a.esc(r.doi)}" target="_blank" rel="noopener">${a.esc(r.key)}</a>`:a.esc(r.key);
 const end=(e,where)=>e?`<a class="ai-tempo-end" href="#item/${e.id}" title="${a.esc(e.name)} (#${e.id})">${maskCanvas(e.mask,`${where} end of this axis: ${a.esc(e.name)}`)}</a>`:'';
 const card=(f,v,i)=>{const s=v[`pc${i}_25y`],r=v[`pc${i}_50y`];if(!s?.fitted)return '';const rec=s.recovery,fj=Math.max(...Object.values(rec.false_jump_rate)),[conf,why]=tempoConfidence(s),ends=d.axis_ends?.[f]?.[`pc${i}`];
  return `<figure class="panel ai-tempo-card" data-family="${a.esc(f)}" data-best="${s.best}" data-confidence="${conf}">${EXPAND}<figcaption><strong>${a.esc(words(f))}</strong> · ${i===1?'main':'second'} shape difference <span class="ai-tempo-best" data-model="${s.best}">${tempoIcon(s.best)}${label(s.best)}</span></figcaption>
  <p class="ai-tempo-verdict">${a.esc(TEMPO_PLAIN[s.best][0])} Evidence: <strong data-confidence="${conf}">${conf}</strong>${why.length?` (${why.join('; ')})`:''}.</p>
  <div class="ai-tempo-plot">${ends?`<div class="ai-tempo-ends">${end(ends.high,'Upper')}<small>shape along this axis</small>${end(ends.low,'Lower')}</div>`:''}${tempoChart(a,s)}</div>${weightBar(s)}
  <p class="ai-gen-foot">${a.fmt(v.n_records)} outlines in ${s.bins} periods of 25 years · with 50-year periods: ${r?.fitted?label(r.best):'too few periods'}</p><p class="ai-gen-foot ai-tempo-rec" data-recovered="${rec.recovered[s.best]}">If “${label(s.best)}” were true, the test would pick it ${pct(rec.recovered[s.best])} of the time (${rec.simulations} simulations). Without a real jump it would still report one up to ${pct(fj)} of the time.</p></figure>`};
 a.$('ai-content').innerHTML=`${head}
 <p class="ai-lede">Paleontologists ask whether species change gradually or in sudden jumps (Eldredge & Gould 1972). We ask the same of tool shapes with the same statistical test (Hunt 2006–2008): for each tool family, follow the average outline through time and see which of five patterns fits best.</p>
 ${flow('ai-flow-tempo',FLOWS.tempo)}
 <ul class="ai-tempo-patterns" id="ai-tempo-patterns" aria-label="The five patterns of change">${TEMPO_MODELS.map(([k,l])=>`<li data-model="${k}">${tempoIcon(k)}<strong>${l}</strong><span>${a.esc(TEMPO_PLAIN[k][0])}</span><small>${a.esc(TEMPO_PLAIN[k][1])}</small></li>`).join('')}</ul>
 <p class="ai-caution">${a.fmt(inst[0][1])} of ${a.fmt(c.included)} dated outlines are from ${a.esc(inst[0][0])}: a jump can be collecting history, not design history. More museums will change this.</p>
 <div class="ai-tempo-context panel" id="ai-tempo-context"><div><h3>Our tool families</h3><p>${TEMPO_MODELS.filter(([k])=>d.best_counts_25y[k]).map(([k,l])=>`<span class="ai-tempo-best" data-model="${k}">${tempoIcon(k)}${l} ${d.best_counts_25y[k]}</span>`).join(' ')}</p><p class="ai-gen-foot">best pattern in ${d.series_fitted_25y} family axes (25-year periods)</p></div><div><h3>Fossil lineages, for comparison</h3><p class="ai-gen-foot">${a.esc(d.context)}</p></div></div>
 <details class="ai-exp-details ai-tempo-howto"><summary>How to read a card</summary><ul class="ai-gen-facts"><li><strong>Dots</strong>: the average shape of the family’s tools in each 25-year period, along one direction in which their outlines differ most (bigger dot = more tools; line = 95% range). The two outlines on the left show real tools near the lower and upper end of that direction.</li><li><strong>Blue line</strong>: the best-fitting pattern (none for “Wanders”, which has no fixed path). A dashed line marks the year of a jump.</li><li><strong>Coloured bar</strong>: how strongly each of the five patterns is supported (Akaike weights, adding up to 100%).</li><li><strong>Evidence</strong>: strong when the best pattern has at least 70% of the weight and the simulation recovers it at least 80% of the time (for a jump, also: other patterns fake a jump at most 10% of the time); weak when it has under 50% of the weight, is recovered under 50% of the time, or (for a jump) other patterns fake one more than 20% of the time; moderate otherwise.</li></ul></details>
 <div class="ai-tempo-key" aria-hidden="true">${TEMPO_MODELS.map(([k,l])=>`<span><i data-model="${k}"></i>${l}</span>`).join('')}</div>
 <div class="ai-tempo-grid" id="ai-tempo-grid">${fams.map(([f,v])=>card(f,v,1)+card(f,v,2)).join('')}</div>
 <p class="ai-tempo-refs" id="ai-tempo-refs">Method: ${d.references.filter(r=>r.key!=='Valverde & Solé 2015').map(doi).join(' · ')} · the same idea applied to technology: ${doi(d.references.find(r=>r.key==='Valverde & Solé 2015')||{key:''})}</p>
 <details class="ai-exp-details"><summary>Models, data and references</summary><ul class="ai-gen-facts">${Object.entries(d.model_descriptions).map(([k,t])=>`<li><strong>${label(k)}</strong> (${a.esc(TEMPO_PLAIN[k]?.[1]||k)}) — ${a.esc(t)}</li>`).join('')}<li>${a.esc(d.selection)}. ${a.esc(d.recovery_design)}.</li><li>Records: ${a.fmt(c.records)}; undated ${a.fmt(c.undated)}; date range wider than 100 years ${a.fmt(c.range_wider_than_100y)}; outside 1650–2025 ${a.fmt(c.midpoint_outside_1650_2025)}; included ${a.fmt(c.included)}.</li><li>${a.esc(d.note)}</li></ul><ol class="ai-gen-facts">${d.references.map(r=>`<li>${a.esc(r.text)}${r.doi?` <a href="https://doi.org/${a.esc(r.doi)}" target="_blank" rel="noopener">doi:${a.esc(r.doi)}</a>`:''}</li>`).join('')}</ol><p>Run ${a.esc(d.run_id)} · config ${a.esc(d.config_version)}.</p></details>`;
}

// ---------- Between dates: are middle-period outlines in between? (configs/ml/between.json) ----------
const BETWEEN_PLAIN={'in between':'sit in between','still like the early tools':'still look like the early tools','already like the late tools':'already look like the late tools','unclear':'cannot be placed (too uncertain)','no clear change to locate':'no clear change between early and late'};
const shortName=n=>String(n||'').replace(/[\(,].*$/,'').trim().toLowerCase();
function betweenChart(a,r,w){
 const all=Object.values(r.positions).flat().map(p=>p[1]).sort((x,y)=>x-y),q=f=>all[Math.floor(f*(all.length-1))];
 const lo=Math.min(-0.3,q(.01)),hi=Math.max(1.3,q(.99)),W=420,H=128,l=86,rr=8,X=v=>l+(W-l-rr)*(Math.min(Math.max(v,lo),hi)-lo)/(hi-lo),rows=[['late',`after ${w.middle[1]}`],['middle',`${w.middle[0]}–${w.middle[1]}`],['early',`before ${w.middle[0]}`]];
 let seed=7;const jit=()=>{seed=(seed*16807)%2147483647;return (seed/2147483647-.5)*14};
 return `<svg class="ai-between-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Position of each tool between the average early (0) and late (1) shape, by period; middle-period mean ${f2(r.t)} with 95% interval ${f2(r.t_ci95[0])} to ${f2(r.t_ci95[1])}">
 ${[0,1].map(v=>`<line x1="${X(v)}" x2="${X(v)}" y1="6" y2="${H-18}" class="ai-grid"/><text x="${X(v)}" y="${H-6}" text-anchor="middle">${v?'late avg':'early avg'}</text>`).join('')}
 ${rows.map(([k,lab],i)=>{const y=22+i*34;return `<text x="${l-6}" y="${y+3}" text-anchor="end">${lab} · ${r.counts[k]}</text>${r.positions[k].map(([,t])=>`<circle cx="${X(t)}" cy="${y+jit()}" r="1.6" class="ai-between-dot" data-period="${k}"/>`).join('')}`}).join('')}
 <line x1="${X(r.t_ci95[0])}" x2="${X(r.t_ci95[1])}" y1="56" y2="56" class="ai-between-ci"/><rect x="${X(r.t)-4}" y="52" width="8" height="8" transform="rotate(45 ${X(r.t)} 56)" class="ai-between-mean"/></svg>`;
}
function betweenCard(a,b,w,fam,r){
 const far=k=>{const v=r.positions[k];return v.length?v.filter(p=>p[1]>1.5).length/v.length:0};
 const names=Object.entries(r.positions.late.filter(p=>p[1]>1.5).reduce((m,[id])=>{const n=shortName(a.rows.get(id)?.name);if(n)m[n]=(m[n]||0)+1;return m},{})).sort((x,y)=>y[1]-x[1]).slice(0,3).map(([n])=>n);
 const P=r.pictures,labels=['early avg','¼','½','¾','late avg'];
 return `<figure class="panel ai-between-card" data-family="${a.esc(fam)}" data-verdict="${a.esc(r.verdict)}">${EXPAND}<figcaption><strong>${a.esc(words(fam))}</strong> <span class="ai-between-verdict" data-verdict="${a.esc(r.verdict)}">${a.esc(r.verdict)}</span></figcaption>
 <p class="ai-tempo-verdict">Tools from ${w.middle[0]}–${w.middle[1]} ${BETWEEN_PLAIN[r.verdict]||a.esc(r.verdict)}: on average ${pct(r.t)} of the way from the early to the late shape (95% range ${pct(r.t_ci95[0])} to ${pct(r.t_ci95[1])}).${r.off_the_way?' Their average also lies off the line between them, so they may be a different form rather than a step on the way.':''}</p>
 ${betweenChart(a,r,w)}
 <div class="ai-between-pics"><div class="ai-between-path">${P.path.map((m,i)=>`<span>${maskCanvas(m,`AI drawing ${labels[i]} of the way from the early to the late average`)}<small>${labels[i]}</small></span>`).join('')}</div><span class="ai-between-mid">${maskCanvas(P.middle_mean,`AI drawing of the ${w.middle[0]}–${w.middle[1]} average`)}<small>${w.middle[0]}–${w.middle[1]} avg</small></span><div class="ai-between-real">${r.middle_examples.map(e=>`<a href="#item/${e.id}" title="${a.esc(a.rows.get(e.id)?.name||e.id)} (#${e.id})">${maskCanvas(e.mask,`Real ${w.middle[0]}–${w.middle[1]} outline: ${a.esc(a.rows.get(e.id)?.name||e.id)}`)}</a>`).join('')}<small>real ${w.middle[0]}–${w.middle[1]} tools closest to that average</small></div></div>
 <p class="ai-gen-foot ai-between-explore">Exploratory: far beyond the late average (position above 1.5) are ${pct(far('early'))} of early, ${pct(far('middle'))} of middle and ${pct(far('late'))} of late tools${names.length?`, mostly ${names.map(n=>a.esc(n)).join(', ')}`:''}. A rising share of one form can move the average without older forms changing.</p>
 <p class="ai-gen-foot">Early vs late averages differ: p = ${r.change_p<0.001?'< 0.001':f3(r.change_p)} (${a.fmt(b.permutations)} label shuffles). Offset from the line ${f2(r.offset)} of the early–late distance; shuffled labels give at least this ${pct(r.offset_share_null_at_least)} of the time.</p></figure>`;
}
function betweenSection(a,b){
 const names=Object.keys(b.windows);if(!betweenWindow||!b.windows[betweenWindow])betweenWindow=names[0];
 const w=b.windows[betweenWindow],tested=Object.entries(w.families).filter(([,r])=>r.tested),skipped=Object.entries(w.families).filter(([,r])=>!r.tested);
 return `<section class="ai-between" id="ai-between"><h3 class="ai-gen-h">Are tools from in-between dates in between in shape?</h3>
 <p class="ai-exp-lede">For each tool family, draw a line in shape space from the average early tool to the average late tool, and see where the tools from the middle period sit (0 = like the early tools, 1 = like the late ones). A tool counts only if its whole catalog date range lies inside one period.</p>
 <div class="ai-toolbar">${seg('Middle period',names.map(n=>[n,`${n}${b.windows[n].role.startsWith('primary')?'':' (alternative)'}`]),betweenWindow,'between-window')}</div>
 <div class="ai-tempo-grid ai-between-grid" id="ai-between-grid">${tested.map(([f,r])=>betweenCard(a,b,w,f,r)).join('')||'<p>No family has enough dated tools in all three periods.</p>'}</div>
 ${skipped.length?`<p class="ai-gen-foot" id="ai-between-skipped">Not enough dated tools (fewer than ${b.min_records_per_period} in a period; before / during / after): ${skipped.map(([f,r])=>`${a.esc(words(f))} ${r.counts.early} / ${r.counts.middle} / ${r.counts.late}`).join(' · ')}.</p>`:''}
 <details class="ai-exp-details"><summary>Method and decision rule</summary><p>${a.esc(b.question)}</p><p>${a.esc(b.periods_rule)}</p><ul class="ai-gen-facts">${Object.entries(b.statistics).map(([k,v])=>`<li><strong>${a.esc(words(k))}</strong>: ${a.esc(v)}</li>`).join('')}</ul><p><strong>Decision rule.</strong> ${a.esc(b.decision_rule)}</p><p>${a.esc(b.pictures_rule)}</p><p>${a.esc(b.note)}</p><p>Run ${a.esc(b.run_id)} · config ${a.esc(b.config_version)}.</p></details></section>`;
}

// ---------- Enlarge a plot: the whole card, magnified, with zoom and pan ----------
const EXPAND='<button type="button" class="ai-expand" data-ai-deep="expand" aria-label="Enlarge this plot" title="Enlarge">⤢</button>';
function openExpand(a,fig){
 document.querySelector('dialog.ai-expand-dialog')?.remove();
 const dlg=document.createElement('dialog'),clone=fig.cloneNode(true),title=fig.querySelector('figcaption')?.textContent.trim().replace(/\s+/g,' ')||'Plot';
 dlg.className='ai-expand-dialog';dlg.setAttribute('aria-label',`Enlarged: ${title}`);
 clone.querySelector('.ai-expand')?.remove();clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));clone.removeAttribute('id');
 const from=[...fig.querySelectorAll('canvas')];clone.querySelectorAll('canvas').forEach((c,i)=>c.getContext('2d').drawImage(from[i],0,0));
 const w=fig.getBoundingClientRect().width;clone.style.width=`${w}px`;clone.classList.add('ai-expand-figure');
 dlg.innerHTML=`<div class="ai-expand-bar"><strong>${a.esc(title)}</strong><span role="group" aria-label="Zoom"><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="fit" aria-label="Fit to window">Fit</button><button type="button" data-z="close" aria-label="Close">✕</button></span></div><div class="ai-expand-view" tabindex="0" aria-label="Scroll or use + and − to zoom, drag to move, Escape to close"><div class="ai-expand-stage"></div></div>`;
 const view=dlg.querySelector('.ai-expand-view'),stage=dlg.querySelector('.ai-expand-stage');stage.append(clone);
 (a.$('ai-content')||a.root()).append(dlg);dlg.showModal();   // inside #ai-content so its colour rules apply
 let z={s:1,x:0,y:0},fit=1,drag=null,moved=false;
 const apply=()=>{stage.style.transform=`translate(${z.x}px,${z.y}px) scale(${z.s})`;stage.dataset.scale=z.s.toFixed(3)};
 const fitNow=()=>{const vw=view.clientWidth,vh=view.clientHeight,h=clone.offsetHeight;fit=Math.min(vw/w,vh/h);z={s:fit,x:(vw-w*fit)/2,y:Math.max(0,(vh-h*fit)/2)};apply()};
 const zoom=(f,cx=view.clientWidth/2,cy=view.clientHeight/2)=>{const s=Math.min(fit*8,Math.max(fit,z.s*f));z={s,x:cx-(cx-z.x)*s/z.s,y:cy-(cy-z.y)*s/z.s};apply()};
 fitNow();
 dlg.addEventListener('click',e=>{const b=e.target.closest('[data-z]');if(b){const k=b.dataset.z;if(k==='close')dlg.close();else if(k==='fit')fitNow();else zoom(k==='in'?1.5:1/1.5);return}
  const link=e.target.closest('a[href]');if(link){if(moved){e.preventDefault();return}dlg.close()}});
 view.addEventListener('wheel',e=>{e.preventDefault();const r=view.getBoundingClientRect();zoom(Math.exp(-e.deltaY*0.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 view.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,zx:z.x,zy:z.y};moved=false});
 view.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<4)return;if(!moved)view.setPointerCapture(e.pointerId);moved=true;z.x=drag.zx+dx;z.y=drag.zy+dy;apply()});
 view.addEventListener('pointerup',()=>{drag=null});
 view.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='=')zoom(1.5);else if(e.key==='-')zoom(1/1.5);else if(e.key==='0')fitNow();else return;e.preventDefault()});
 dlg.addEventListener('close',()=>{dlg.remove();fig.querySelector('.ai-expand')?.focus({preventScroll:true})});
 view.focus({preventScroll:true});
}

// ---------- Actions ----------
export async function action(a,button){
 const kind=button.dataset.aiDeep,value=button.dataset.value;
 if(kind==='query'){queryId=value;await a.render();a.root().querySelector(`[data-ai-deep="query"][data-value="${value}"]`)?.focus({preventScroll:true});return}
 if(kind==='map-zoom'){const c=a.$('ai-map-canvas');if(!c)return;if(value==='reset')setZoom(0,0,1);else zoomAt(c,c.clientWidth/2,c.clientHeight/2,value==='in'?1.5:1/1.5);draw(a);return}
 if(kind==='map'||kind==='map-color'){if(kind==='map'){mapName=value;mapZoom={x0:0,y0:0,s:1}}else mapColor=value;mapClass=null;mapPage=0;await a.render();a.root().querySelector(`[data-ai-deep="${kind}"][data-value="${value}"]`)?.focus({preventScroll:true});return}
 if(kind==='map-dim'||kind==='map-scale'){if(kind==='map-dim')mapDim=value;else mapScale=value;await a.render();a.root().querySelector(`[data-ai-deep="${kind}"][data-value="${value}"]`)?.focus({preventScroll:true});return}
 if(kind==='map-turn'||kind==='map-rot'){mapTurn=kind==='map-turn'?[...space3d.PRESETS[value]]:[mapTurn[0]+Number(value)*Math.PI/8,mapTurn[1]];draw(a);return}
 if(kind==='map-class'){mapClass=mapClass===value?null:value;mapPage=0;a.root().querySelectorAll('[data-ai-deep="map-class"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===mapClass)));draw(a);mapTable(a);mapHist(a);return}
 if(kind==='goto-map'){mapName='silhouette';mapDim='2d';mapZoom={x0:0,y0:0,s:1};mapClass=null;mapPage=0;a.setTab('map');await a.render();a.$('ai-map-canvas')?.scrollIntoView({block:'center',behavior:'instant'});a.$('ai-map-canvas')?.focus({preventScroll:true});return}
 if(kind==='between-window'){betweenWindow=value;const b=await file(a,'between.json'),host=a.$('ai-between');if(host){host.outerHTML=betweenSection(a,b);paintMasks(a,b,a.$('ai-between'));a.root().querySelector(`[data-ai-deep="between-window"][data-value="${value}"]`)?.focus({preventScroll:true})}return}
 if(kind==='expand'){const fig=button.closest('figure');if(fig)openExpand(a,fig);return}
 if(kind==='gen-view'){genView=value;await a.render();a.root().querySelector(`[data-ai-deep="gen-view"][data-value="${value}"]`)?.focus({preventScroll:true});return}
 if(kind==='gen-prompt'){genPrompt=Number(value);const d=await file(a,'generate.json');a.$('ai-gen-prompt-host').innerHTML=galleryHtml(a,d);paintMasks(a,d);a.root().querySelector(`[data-ai-deep="gen-prompt"][data-value="${value}"]`)?.focus({preventScroll:true});return}
 if(kind==='map-page'){mapPage+=Number(value);mapTable(a);return}
 if(kind==='map-select'){a.choose(value,true);a.$('ai-map-canvas')?.scrollIntoView({block:'center',behavior:'instant'});return}
 if(kind==='goto'){a.setTab(button.dataset.tab);if(a.selected===value)await a.render();else a.choose(value,true);return}
 if(kind==='goto-exp'){a.setTab('experiments');await a.render();const target=a.$(value);if(target){target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true})}return}
 if(kind==='jump'){const target=a.$(value);if(target){target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true})}}
}
