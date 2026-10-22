// Deep-representation views for Research -> AI Methods. Loaded on demand by ai.js.
// Every file is a static, SHA-256-verified projection of saved local experiments
// (data/<version>/ai-deep/). No model runs in the browser and nothing here writes labels.
let summary,queryId,mapName='photo',mapColor='category',mapClass=null,mapPage=0,mapSearch='',mapView=null,mapObserver;
const loaded=new Map(),PAGE=20;
const hex=buffer=>Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,'0')).join('');
const f3=x=>Number.isFinite(x)?x.toFixed(3):'—',f2=x=>Number.isFinite(x)?x.toFixed(2):'—',pct=x=>Number.isFinite(x)?(x*100).toFixed(0)+'%':'—';
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
function match(a,id,rank,score){const r=a.rows.get(id);return `<article class="panel ai-match"><a class="ai-match-image" href="#item/${id}">${a.context.preview(r?.image,r?.name||id)}</a><div class="ai-match-copy"><div class="ai-match-rank">Rank ${rank} <strong>${a.num(score)}</strong></div><span class="record-id">#${id}</span><h2><a href="#item/${id}">${a.esc(r?.name||id)}</a></h2><p>${a.esc(r?.institution||'Source not recorded')}</p><div class="ai-match-actions"><button class="compare-toggle" data-compare="${id}" aria-pressed="false">+ Compare</button><button class="quiet" data-ai-select="${id}">Use as query</button></div></div></article>`}

export async function render(a,tab){
 if(tab==='retrieval')return similarity(a);
 if(tab==='evidence')return evidence(a);
 if(tab==='search')return search(a);
 if(tab==='map')return map(a);
 if(tab==='experiments')return experiments(a);
}

// ---------- Similarity: deep methods ----------
function missingReason(n,method){
 if(!n.photo)return 'no image linked to this record';
 if(!n.silhouette)return method==='multimodal'?'no segmentable image; multimodal ranks need photo, silhouette and catalog text':'no segmentable image (background removal gave no usable outline)';
 if(method==='ends')return 'no segmentable image passing outline quality control, so no working-end crops were made';
 return 'this representation was not computed for the record';
}
async function similarity(a){
 const data=await item(a,a.selected);if(!a.current())return;
 const m=a.method,meta=summary.methods[m],list=data.neighbours[m];
 a.$('ai-content').innerHTML=`<div class="ai-toolbar">${a.methodBar()}<button type="button" class="quiet" data-ai-export="neighbors"${list?'':' disabled'}>Export these ranks</button></div><p class="ai-method-line"><strong>${a.esc(meta.label)}</strong> · cosine similarity, higher is closer. ${a.esc(meta.note)}</p><p class="ai-caution">Saved embeddings from the deep-representation study. Neighbours share visible 2-D form, mechanism or photography; similarity does not establish function or ancestry. Self and known duplicate groups are excluded.</p>
 ${list?`<p role="status">${list.length} ranked candidates · <a href="#compare">Open comparison</a></p><div id="ai-neighbors" class="ai-neighbors" data-method="${m}">${list.map(([id,score],i)=>match(a,id,i+1,score)).join('')}</div>`:`<div class="empty ai-deep-missing" role="status"><h2>Not available for this record</h2><p>${a.esc(meta.label)} neighbours are not available for this record (reason: ${missingReason(data.neighbours,m)}). No ranks were imputed.</p><button type="button" data-ai-method="text">Try catalog text</button></div>`}`;
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
 ${v?.rules?.length?`<h4>Catalog-context rule evidence</h4><ul class="ai-fn-list">${v.rules.map(([rule,text])=>`<li><q>${a.esc(text)}</q> <small>Rule ${a.esc(rule)}</small></li>`).join('')}</ul>`:''}
 ${img.photo||img.silhouette?`<h4>Agreement with existing rules on held-out groups</h4><div class="ai-channels">${['photo','silhouette'].filter(k=>img[k]).map(k=>channel(a,k,img[k])).join('')}</div>`:''}
 ${v?.cues?.length?`<p class="ai-fn-cues">Linked visible-form cues: ${v.cues.map(c=>a.esc(words(c))).join(', ')}</p>`:''}</div></article>`;
}
async function evidence(a){
 const data=await item(a,a.selected);if(!a.current())return;
 const h=data.hypotheses,fns=summary.functions,counts={};for(const f of fns){const s=h.functions[f]?.state||'abstain';counts[s]=(counts[s]||0)+1}
 const conflict=data.category_conflict;let codes={};
 if(conflict?.inspection){try{codes=(await file(a,'experiments.json')).disagreements.inspection.codes}catch{codes={}}if(!a.current())return}
 a.$('ai-content').innerHTML=`<div class="ai-toolbar"><div><h2>Function evidence</h2><p id="ai-evidence-counts">${STATE_ORDER.filter(s=>counts[s]).map(s=>`${counts[s]} ${STATES[s][1].toLowerCase()}`).join(' · ')}</p></div><button type="button" class="quiet" data-ai-export="evidence">Export evidence</button></div>
 <p class="ai-caution">Weak, source-derived states (thresholds and rule version: Experiments → Hypotheses). Image values are isotonic-calibrated agreement with existing catalog rules on held-out groups — not the probability that the object was used this way. Abstention means unknown. Human review is deferred; these states are not training ground truth.</p>
 ${!h.single?'<p class="ai-deep-note" role="note"><strong>Not a single-object unit.</strong> Depictions, documents and kits do not receive image hypotheses.</p>':''}
 ${conflict?`<p class="ai-deep-note" role="note" data-conflict><strong>Category check.</strong> Catalog category <em>${a.esc(words(conflict.catalog))}</em>, but ${pct(conflict.agreement)} of the ten nearest photo neighbours share <em>${a.esc(words(conflict.neighbours))}</em> (flagged at ≥ 7 of 10). ${conflict.inspection?`Inspection code <span class="chip">${a.esc(conflict.inspection)}</span> ${a.esc(codes[conflict.inspection]||'')} <small>Single-coder visual inspection; not expert review.</small>`:'Not yet visually inspected.'}</p>`:''}
 <details class="ai-state-key"><summary>State key</summary><dl>${STATE_ORDER.map(s=>`<dt>${chip(s)}</dt><dd>${STATES[s][2]}</dd>`).join('')}</dl></details>
 <div id="ai-functions" class="ai-functions">${fns.map(f=>functionRow(a,f,h.functions[f])).join('')}</div>
 <div class="ai-evidence-context">
 <section class="panel ai-affordance" aria-labelledby="ai-affordance-title"><h3 id="ai-affordance-title">Physical affordance cues <small>(visible form, not use)</small></h3><p class="muted">Zero-shot SigLIP 2 prompt scores (centred; compare only within this record) and outline geometry of the two terminal segments. 2-D photograph form without physical scale.</p>
 ${h.cues?.length?`<ol class="ai-cues">${h.cues.map(([cue,text,score])=>`<li><strong>${a.esc(words(cue))}</strong> <span>${a.esc(text)}</span> <small>centred score ${score.toFixed(3)}</small></li>`).join('')}</ol>`:'<p>No prompt cues: this record has no usable photograph.</p>'}
 <h4>Outline geometry</h4>${h.geometry?h.geometry.length?`<ul class="ai-geometry">${h.geometry.map(g=>`<li>${a.esc(GEOMETRY[g]||words(g))}</li>`).join('')}</ul>`:'<p>No geometric end cue passed its threshold.</p>':'<p>Not measured: no outline passed segmentation quality control.</p>'}</section>
 <section class="panel" aria-labelledby="ai-documented-title"><h3 id="ai-documented-title">Documented source statements</h3>${h.documented?.length?`<ul class="ai-fn-list">${h.documented.map(d=>`<li>${a.esc(d)}</li>`).join('')}</ul>`:'<p>None recorded. Missing documentation is not a negative label.</p>'}</section>
 <section class="panel" aria-labelledby="ai-duplicates-title"><h3 id="ai-duplicates-title">Possible duplicate photographs</h3>${data.near_duplicates.length?`<p class="muted">DINOv2-L photo cosine ≥ 0.98 across different known groups; inspect before treating as one object.</p><ul class="ai-dup-list">${data.near_duplicates.map(([id,c])=>`<li>${thumb(a,id)}<span>${recordLine(a,id)}<small>cosine ${c.toFixed(4)}</small></span></li>`).join('')}</ul>`:'<p>No near-duplicate photograph above the 0.98 merge threshold.</p>'}</section>
 ${data.modern_analogs?`<section class="panel" aria-labelledby="ai-analogs-title"><h3 id="ai-analogs-title">Modern analogs</h3><p class="muted">Externally curated instrument images that resemble this record. Resemblance is not descent.</p>${analogs(a,data.modern_analogs)}</section>`:''}
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

// ---------- Text search (precomputed cross-modal queries) ----------
const LANG={en:'English',nl:'Dutch',sv:'Swedish'};
async function search(a){
 const d=await file(a,'crossmodal.json');if(!a.current())return;
 const zs=d.methods.siglip2_zero_shot,ad=d.methods.adapted,queries=zs.queries;queryId||=queries[0].id;
 const langs=[...new Set(queries.map(q=>q.lang))];
 const column=(key,title,method,note)=>{const q=method.queries.find(x=>x.id===queryId);const scored=Number.isFinite(q.test_precision_at_20);
  return `<section class="panel ai-xm-col" data-xm-method="${key}" aria-labelledby="ai-xm-${key}"><h3 id="ai-xm-${key}">${title}</h3><p class="muted">${note}</p>${scored?`<div class="ai-xm-score"><span>Test precision@20 <strong>${f2(q.test_precision_at_20)}</strong></span><span>Base rate <strong>${f2(q.test_base_rate)}</strong></span><span class="ai-compare-bar" aria-hidden="true"><i class="ai-bar-value" style="width:${q.test_precision_at_20*100}%"></i><i class="ai-bar-ref" style="left:${q.test_base_rate*100}%"></i></span></div>`:'<p class="ai-xm-score">Not scored: no matching category in the evaluation split.</p>'}
  <ol class="ai-xm-list">${q.top.map(([id,c],i)=>`<li data-id="${id}">${thumb(a,id)}<span><span class="ai-xm-rank">${i+1} · cosine ${c.toFixed(3)}</span>${recordLine(a,id)}</span></li>`).join('')}</ol></section>`};
 const q=queries.find(x=>x.id===queryId);
 a.$('ai-content').innerHTML=`<div class="ai-toolbar"><div><h2>Text search</h2><p>${queries.length} precomputed queries in ${langs.length} languages · results rank record photographs by text–image cosine.</p></div><a href="${a.context.base}ai-deep/crossmodal.json" download>Export queries (JSON)</a></div>
 <p class="ai-caution">Queries were embedded offline; no model runs in your browser and free-text search is not available. Test precision@20 is the share of the 20 highest-ranked held-out test records whose catalog category is the expected one; the base rate is that category's share of the test split (the expected precision of a random ranking). The lists show the 12 highest-ranked records in the whole collection, including training records; precision is computed on held-out test records only. Categories are weak, catalog-derived labels.</p>
 <label class="ai-xm-select">Precomputed query<select id="ai-xm-select">${langs.map(l=>`<optgroup label="${LANG[l]||l}">${queries.filter(x=>x.lang===l).map(x=>`<option value="${x.id}"${x.id===queryId?' selected':''}>${a.esc(x.text)}</option>`).join('')}</optgroup>`).join('')}</select></label><div class="ai-xm-queries">${langs.map(l=>`<div class="ai-xm-lang"><h3>${LANG[l]||l}</h3>${seg(`${LANG[l]||l} queries`,queries.filter(x=>x.lang===l).map(x=>[x.id,a.esc(x.text)]),queryId,'query')}</div>`).join('')}</div>
 <p id="ai-xm-current" class="ai-method-line" role="status">Query <strong>“${a.esc(q.text)}”</strong> (${LANG[q.lang]||q.lang}) · expected category <em>${a.esc(words(q.expected||'not mapped'))}</em></p>
 <div class="ai-xm-grid">${column('siglip2_zero_shot','SigLIP 2 · zero-shot',zs,'Frozen SigLIP 2 B/16 text and image towers.')}${column('adapted','Adapted image encoder',ad,`Photo-randomised DINOv2-B adapted to multilingual E5 catalog text (${a.esc(d.adapted_tag)}).`)}</div>
 <p class="muted">Mean over scored queries: SigLIP 2 ${f2(zs.mean_test_precision_at_20)} and adapted ${f2(ad.mean_test_precision_at_20)} test precision@20, against a mean base rate of ${f2(zs.mean_base_rate)}.</p>`;
 a.$('ai-xm-select').onchange=async()=>{queryId=a.$('ai-xm-select').value;await a.render();a.$('ai-xm-select')?.focus({preventScroll:true})};
}

// ---------- Embedding map ----------
const SHAPES={circle:(g,x,y,r)=>g.arc(x,y,r,0,Math.PI*2),square:(g,x,y,r)=>g.rect(x-r*.9,y-r*.9,r*1.8,r*1.8),triangle:(g,x,y,r)=>{g.moveTo(x,y-r*1.15);g.lineTo(x+r*1.05,y+r*.8);g.lineTo(x-r*1.05,y+r*.8);g.closePath()},'triangle-down':(g,x,y,r)=>{g.moveTo(x,y+r*1.15);g.lineTo(x+r*1.05,y-r*.8);g.lineTo(x-r*1.05,y-r*.8);g.closePath()},diamond:(g,x,y,r)=>{g.moveTo(x,y-r*1.2);g.lineTo(x+r,y);g.lineTo(x,y+r*1.2);g.lineTo(x-r,y);g.closePath()},plus:(g,x,y,r)=>{g.rect(x-r*1.1,y-r*.35,r*2.2,r*.7);g.rect(x-r*.35,y-r*1.1,r*.7,r*2.2)},cross:(g,x,y,r)=>{g.moveTo(x-r,y-r);g.lineTo(x+r,y+r);g.moveTo(x+r,y-r);g.lineTo(x-r,y+r)}};
const SVG_SHAPES={circle:'<circle cx="6" cy="6" r="4.5"/>',square:'<rect x="1.8" y="1.8" width="8.4" height="8.4"/>',triangle:'<path d="M6 1 11 10H1z"/>','triangle-down':'<path d="M6 11 11 2H1z"/>',diamond:'<path d="M6 .5 11 6 6 11.5 1 6z"/>',plus:'<path d="M4.6 1h2.8v3.6H11v2.8H7.4V11H4.6V7.4H1V4.6h3.6z"/>',cross:'<path d="M2 2 10 10M10 2 2 10" stroke-width="2.4"/>',dot:'<circle cx="6" cy="6" r="2.4"/>'};
const MAPS=[['photo','Photo · DINOv2-L'],['silhouette','Silhouette · DINOv2-B'],['adapted','Adapted'],['text','Catalog text · E5']];
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
 const d=await file(a,'maps.json');if(!a.current())return;
 const m=d.maps[mapName],legend=legendClasses(a,d,m.points),plotted=new Set(m.points.map(p=>p[0]));
 a.$('ai-content').innerHTML=`<div class="ai-toolbar ai-map-toolbar">${seg('Embedding',MAPS,mapName,'map')}${seg('Colour by',[['category','Catalog category'],['institution','Source museum']],mapColor,'map-color')}<a href="${a.context.base}ai-deep/maps.json" download>Export map (JSON)</a></div>
 <p class="ai-caution">${a.esc(d.note)} UMAP (${d.params.n_neighbors} neighbours, min. distance ${d.params.min_dist}, ${a.esc(d.params.metric)} metric, seed ${d.params.random_state}); both axes are dimensionless and normalised to 0–1. Use Similarity for actual nearest neighbours.</p>
 <div id="ai-map-legend" class="ai-cluster-legend ai-map-legend" role="group" aria-label="Highlight a ${mapColor==='category'?'category':'museum'}">${legend.named.map(([c,n])=>`<button type="button" data-ai-deep="map-class" data-value="${a.esc(c)}" aria-pressed="${mapClass===c}"><svg class="ai-marker" viewBox="0 0 12 12" aria-hidden="true" fill="${legend.style.get(c).color}" stroke="${legend.style.get(c).color}">${SVG_SHAPES[legend.style.get(c).shape]}</svg>${a.esc(words(c))} <small>${a.fmt(n)}</small></button>`).join('')}${legend.otherCount?`<button type="button" data-ai-deep="map-class" data-value="__other" aria-pressed="${mapClass==='__other'}" title="${a.esc(legend.other.join(', '))}"><svg class="ai-marker" viewBox="0 0 12 12" aria-hidden="true" fill="${a.palette.missing}">${SVG_SHAPES.dot}</svg>Other / not mapped <small>${a.fmt(legend.otherCount)}</small></button>`:''}</div>
 <p id="ai-map-status" role="status">${a.fmt(m.points.length)} records plotted from ${a.esc(m.source)} · ${a.fmt(a.rows.size-m.points.length)} without this representation. ${plotted.has(a.selected)?'':`The selected record #${a.selected} is not in this map.`}</p>
 <div class="ai-cluster-layout"><div class="ai-chart panel ai-map-chart"><canvas id="ai-map-canvas" tabindex="0" role="img" aria-label="Two-dimensional UMAP display of ${a.esc(m.source)} embeddings coloured by ${mapColor}. Arrow keys step through points, Enter selects. The table below lists every point."></canvas><div id="ai-map-tip" class="ai-map-tip" hidden></div></div><aside id="ai-map-detail" class="panel" aria-live="polite"></aside></div>
 <label class="ai-map-find">Find a plotted record<input id="ai-map-search" type="search" placeholder="Name or identifier…" value="${a.esc(mapSearch)}"></label>
 <div id="ai-map-table" class="table-wrap"></div><div class="pagination"><button type="button" data-ai-deep="map-page" data-value="-1" id="ai-map-prev">← Previous</button><p id="ai-map-page" role="status"></p><button type="button" data-ai-deep="map-page" data-value="1" id="ai-map-next">Next →</button></div>`;
 mapView={d,m,legend,points:[],order:[],focus:-1,locked:null};
 const canvas=a.$('ai-map-canvas'),tip=a.$('ai-map-tip');
 const nearest=(x,y)=>{let best=110,hit=null;for(const p of mapView.points){const q=(p.x-x)**2+(p.y-y)**2;if(q<best){best=q;hit=p}}return hit};
 const show=(p)=>{if(!p){tip.hidden=true;return}const r=a.rows.get(p.id);tip.innerHTML=`${a.context.preview(r?.image,r?.name||p.id)}<span><strong>${a.esc(r?.name||p.id)}</strong><small>#${p.id} · ${a.esc(words(classOf(d,p.id)))}</small></span>`;tip.hidden=false;const w=canvas.clientWidth;tip.style.left=Math.min(Math.max(p.x+12,0),w-tip.offsetWidth-4)+'px';tip.style.top=Math.max(p.y-tip.offsetHeight-10,4)+'px'};
 canvas.onpointermove=ev=>{const b=canvas.getBoundingClientRect(),p=nearest(ev.clientX-b.left,ev.clientY-b.top);canvas.style.cursor=p?'pointer':'default';show(p)};
 canvas.onpointerleave=()=>{tip.hidden=true};
 canvas.onclick=ev=>{const b=canvas.getBoundingClientRect(),p=nearest(ev.clientX-b.left,ev.clientY-b.top);if(p)a.choose(p.id,true)};
 canvas.onkeydown=ev=>{const order=mapView.order;if(!order.length)return;
  if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(ev.key)){ev.preventDefault();const step=ev.key==='ArrowRight'||ev.key==='ArrowDown'?1:-1;mapView.focus=mapView.focus<0?(step>0?0:order.length-1):(mapView.focus+step+order.length)%order.length;show(order[mapView.focus]);draw(a)}
  else if((ev.key==='Enter'||ev.key===' ')&&mapView.focus>=0){ev.preventDefault();a.choose(order[mapView.focus].id,true)}
  else if(ev.key==='Escape'){tip.hidden=true;mapView.focus=-1;draw(a)}};
 canvas.onblur=()=>{tip.hidden=true};
 a.$('ai-map-search').oninput=()=>{mapSearch=a.$('ai-map-search').value;mapPage=0;mapTable(a)};
 mapObserver?.disconnect();mapObserver=new ResizeObserver(()=>{if(a.$('ai-map-canvas'))draw(a)});mapObserver.observe(canvas.parentElement);
 draw(a);mapDetail(a);mapTable(a);
}
function visible(id){if(!mapClass)return true;const c=classOf(mapView.d,id);return mapClass==='__other'?!mapView.legend.style.has(c):c===mapClass}
function draw(a){
 const canvas=a.$('ai-map-canvas');if(!canvas||!mapView)return;const box=canvas.getBoundingClientRect(),w=box.width,h=box.height;if(!w||!h)return;
 const ratio=devicePixelRatio||1;canvas.width=w*ratio;canvas.height=h*ratio;const g=canvas.getContext('2d');g.scale(ratio,ratio);
 const css=k=>getComputedStyle(a.root()).getPropertyValue('--'+k).trim(),P=16;
 g.fillStyle=css('panel');g.fillRect(0,0,w,h);
 const sx=v=>P+v*(w-2*P),sy=v=>h-P-v*(h-2*P);
 mapView.points=mapView.m.points.map(([id,x,y])=>({id,x:sx(x),y:sy(y),c:classOf(mapView.d,id)}));
 mapView.order=mapView.points.filter(p=>visible(p.id)).sort((p,q)=>p.x-q.x);
 const r=w<500?2.4:3,others=mapView.points.filter(p=>!mapView.legend.style.has(p.c)),named=[...mapView.legend.named].reverse();
 const paint=(p,style)=>{g.globalAlpha=visible(p.id)?.78:.1;g.beginPath();if(!style){g.fillStyle=a.palette.missing;g.arc(p.x,p.y,r*.7,0,Math.PI*2);g.fill();return}SHAPES[style.shape](g,p.x,p.y,r);if(style.shape==='cross'){g.strokeStyle=style.color;g.lineWidth=1.4;g.stroke()}else{g.fillStyle=style.color;g.fill()}};
 for(const p of others)paint(p,null);
 for(const [c] of named){const style=mapView.legend.style.get(c);for(const p of mapView.points)if(p.c===c)paint(p,style)}
 g.globalAlpha=1;
 const ring=(p,color,size)=>{g.beginPath();g.arc(p.x,p.y,size,0,Math.PI*2);g.lineWidth=2;g.strokeStyle=color;g.stroke()};
 const sel=mapView.points.find(p=>p.id===a.selected);if(sel){ring(sel,css('panel'),9);ring(sel,css('ink'),7.5)}
 const focus=mapView.order[mapView.focus];if(focus&&document.activeElement===canvas)ring(focus,css('accent'),6);
 g.fillStyle=css('muted');g.font='11px system-ui';g.textAlign='right';g.fillText('UMAP display · dimensionless',w-8,h-6);
}
function mapDetail(a){
 const host=a.$('ai-map-detail');if(!host)return;const id=a.selected,r=a.rows.get(id),inMap=mapView.m.points.some(p=>p[0]===id);
 host.innerHTML=`<h3 class="ai-map-detail-title">Selected record</h3>${a.context.preview(r?.image,r?.name||id)}<span class="record-id">#${id}</span><h3>${a.esc(r?.name||id)}</h3><p>${a.esc(r?.institution||'')}</p><p>${inMap?`${mapColor==='category'?'Category':'Museum'}: ${a.esc(words(classOf(mapView.d,id)))}`:'Not in this map (representation unavailable).'}</p><a href="#item/${id}">Inspect record →</a><p class="ai-map-actions"><button type="button" data-ai-deep="goto" data-tab="retrieval" data-value="${id}">Similarity</button><button type="button" class="quiet" data-ai-deep="goto" data-tab="evidence" data-value="${id}">Evidence</button></p><p class="muted">Click a point or press Enter on a focused point to select it.</p>`;
}
function mapTable(a){
 const q=mapSearch.trim().replace(/^#/,'').toLowerCase(),d=mapView.d;
 const pts=mapView.m.points.filter(([id])=>visible(id)&&(!q||`${id} ${a.rows.get(id)?.name||''}`.toLowerCase().includes(q)));
 mapPage=Math.min(mapPage,Math.max(0,Math.ceil(pts.length/PAGE)-1));
 a.$('ai-map-table').innerHTML=`<table><caption>Accessible map table: ${a.fmt(pts.length)} matching plotted records. Coordinates are dimensionless display positions, not feature distances.</caption><thead><tr><th scope="col">Record</th><th scope="col">Catalog category</th><th scope="col">Source museum</th><th scope="col">x</th><th scope="col">y</th><th scope="col">Action</th></tr></thead><tbody>${pts.length?pts.slice(mapPage*PAGE,(mapPage+1)*PAGE).map(([id,x,y])=>`<tr${id===a.selected?' aria-current="true"':''}><td>${recordLine(a,id)}</td><td>${a.esc(words(d.category[id]||'not mapped'))}</td><td>${a.esc(d.institution[id]||'')}</td><td>${x.toFixed(3)}</td><td>${y.toFixed(3)}</td><td><button type="button" class="quiet" data-ai-deep="map-select" data-value="${id}">Select on map</button></td></tr>`).join(''):'<tr><td colspan="6">No matching plotted records. Clear the search or highlighted group.</td></tr>'}</tbody></table>`;
 a.$('ai-map-page').textContent=`Page ${mapPage+1} of ${Math.max(1,Math.ceil(pts.length/PAGE))}`;a.$('ai-map-prev').disabled=mapPage===0;a.$('ai-map-next').disabled=(mapPage+1)*PAGE>=pts.length;
}
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
async function experiments(a){
 const s=await manifest(a),[x,cm,lit]=await Promise.all([file(a,'experiments.json'),file(a,'crossmodal.json'),s.files['literature.json']?file(a,'literature.json'):null]);if(!a.current())return;
 const body=[findingsSection(a,x),benchmarkSection(a,x),confoundSection(a,x),adaptationSection(a,x),endsSection(a,x),affordanceSection(a,x),crossmodalSection(a,cm),duplicateSection(a,x),disagreementSection(a,x),hypothesisSection(a,x),literatureSection(a,lit),limitsSection(a,x)];
 a.$('ai-content').innerHTML=`<div class="ai-toolbar"><div><h2>Deep-representation experiments</h2><p>Dataset ${a.esc(x.dataset_version)} · evaluation set ${a.fmt(x.evaluation_set.n)} records, ${Object.keys(x.evaluation_set.categories).length} weak catalog categories, ${Object.keys(x.evaluation_set.institutions).length} museums.</p></div><a href="${a.context.base}ai-deep/experiments.json" download>Export results (JSON)</a></div>
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
 <figure class="panel ai-figure"><figcaption>Cross-museum precision@10 (fraction of top-10 other-museum neighbours sharing the catalog category), dot = estimate, bar = 95% CI</figcaption>${dotRows(a,rows,.3,1,'Random cross-museum P@10')}</figure>
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
  return `<figure class="panel ai-loss"><figcaption>${a.esc(repName('adapt-'+cfg+'-proj:raw')[0].replace('Adapted DINOv2-B · ',''))} <small>${a.fmt(list[0].run.train_records)} training records · ${list.map(r=>r.run.seconds+' s').join(', ')} on ${a.esc(list[0].run.gpu||'GPU')}</small></figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Training loss by epoch for seeds ${list.map(r=>r.seed).join(', ')}; final losses ${list.map(r=>r.run.log.at(-1).loss.toFixed(2)).join(', ')}">${yt.map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" class="ai-svg-grid"/><text x="${L-5}" y="${y(v)+3}" text-anchor="end">${v}</text>`).join('')}${[0,Math.round(epochs/2),epochs].map(e=>`<text x="${x(e)}" y="${H-B+14}" text-anchor="middle">${e}</text>`).join('')}<text x="${(W+L)/2}" y="${H-4}" text-anchor="middle">Epoch</text><text transform="translate(10 ${(H-B+T)/2}) rotate(-90)" text-anchor="middle">Loss</text>${list.map((r,i)=>`<polyline fill="none" stroke="${colors[i%colors.length]||'currentColor'}" stroke-width="1.8" stroke-dasharray="${dash[i%3]}" points="${r.run.log.map(l=>`${x(l.epoch).toFixed(1)},${y(l.loss).toFixed(1)}`).join(' ')}"/>`).join('')}</svg><p class="ai-loss-key">${list.map((r,i)=>`<span><svg viewBox="0 0 22 6" aria-hidden="true"><line x1="0" x2="22" y1="3" y2="3" stroke="${colors[i%colors.length]}" stroke-width="2" stroke-dasharray="${dash[i%3]}"/></svg>seed ${r.seed}</span>`).join('')}</p></figure>`}).join('')}</div>`;
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
 table('Mean test precision@20 over scored queries, against the mean base rate (random ranking).',['Method','Mean test P@20','Mean base rate',...langs.map(l=>`${LANG[l]||l} P@20`)],Object.entries(m).map(([k,v])=>[k==='adapted'?'Adapted image encoder':'SigLIP 2 zero-shot',f3(v.mean_test_precision_at_20),f3(v.mean_base_rate),...langs.map(l=>f3(v.by_language[l]))]))+`<p><button type="button" data-ai-tab="search">Browse the precomputed queries in Text search →</button></p>`);
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

// ---------- Actions ----------
export async function action(a,button){
 const kind=button.dataset.aiDeep,value=button.dataset.value;
 if(kind==='query'){queryId=value;await a.render();a.root().querySelector(`[data-ai-deep="query"][data-value="${value}"]`)?.focus({preventScroll:true});return}
 if(kind==='map'||kind==='map-color'){if(kind==='map')mapName=value;else mapColor=value;mapClass=null;mapPage=0;await a.render();a.root().querySelector(`[data-ai-deep="${kind}"][data-value="${value}"]`)?.focus({preventScroll:true});return}
 if(kind==='map-class'){mapClass=mapClass===value?null:value;mapPage=0;a.root().querySelectorAll('[data-ai-deep="map-class"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===mapClass)));draw(a);mapTable(a);return}
 if(kind==='map-page'){mapPage+=Number(value);mapTable(a);return}
 if(kind==='map-select'){a.choose(value,true);a.$('ai-map-canvas')?.scrollIntoView({block:'center',behavior:'instant'});return}
 if(kind==='goto'){a.setTab(button.dataset.tab);if(a.selected===value)await a.render();else a.choose(value,true);return}
 if(kind==='jump'){const target=a.$(value);if(target){target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true})}}
}
