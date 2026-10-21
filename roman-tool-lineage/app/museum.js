'use strict';
/* Rijksmuseum Boerhaave catalog records: a separate layer that can be merged into the atlas views. */
const Museum=(()=>{
 // D is defined by app.js (loaded last), so the layer is read in init(), like the other modules.
 let M=null,R=[],X=[],byId={},selected=null,threadOf={};
 const blobs={};
 // Embedded thumbnails are decoded once into blob URLs so the tree's SVG stays small.
 function photo(r){
  const id=r.museum.image_id;
  if(!id||!IMAGE_DATA[id])return r.museum.image_url;
  if(!IMAGE_DATA[id].startsWith('data:'))return IMAGE_DATA[id];
  if(!blobs[id]){const [head,body]=IMAGE_DATA[id].split(','),bin=atob(body),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);blobs[id]=URL.createObjectURL(new Blob([a],{type:head.slice(5).split(';')[0]}));}
  return blobs[id];
 }
 const embedded=r=>!!(r.museum.image_id&&IMAGE_DATA[r.museum.image_id]);
 const kindLabel={design:'design thread',maker:'maker thread',singles:'single-object designs',collection:'one collection',unattributed:'no shared attribution'};
 const span=t=>t.span?`${t.span[0]}–${t.span[1]}`:'undated';
 const threadText=t=>t.kind==='design'||t.kind==='maker'?`${t.name} · ${kindLabel[t.kind]} · ${t.members.length} objects${t.makers.length?` · ${t.makers.length} maker${t.makers.length===1?'':'s'}`:''} · ${span(t)}`:`${t.name} · ${t.members.length}`;
 const edgesOf=id=>M.edges.filter(e=>e.source===id||e.target===id);
 const mergeable=()=>R.filter(r=>r.museum.mergeable);
 const merged=()=>!!M&&$('merge-museum').checked;
 const people=r=>r.museum.people.length?r.museum.people.map(p=>`${esc(p.name)} <small>(${esc(p.role)})</small>`).join('<br>'):'<span class="not-recorded">None recorded</span>';
 const opts=(values,all)=>`<option value="all">${all}</option>`+values.map(v=>`<option>${esc(v)}</option>`).join('');
 const statusClass=s=>s.startsWith('matches listed maker')?'':'museum-stamp-flag';
 function image(r,size='detail'){
  const u=photo(r);
  if(!u)return '<div class="photo-missing">No image reference in the catalog</div>';
  return `<figure class="object-image museum-image museum-image-${size}"><button class="photo-button" data-museum-photo="${r.id}" aria-label="Enlarge museum photograph"><img src="${esc(u)}" alt="${esc(r.label)}, museum photograph" onerror="this.closest('figure').classList.add('offline')"></button><figcaption>${embedded(r)?esc(r.museum.image_credit||M.source.image_credit):"Rijksmuseum Boerhaave · not cached; loaded from the museum's server (needs internet)."} <a href="${esc(r.museum.detail_url)}" target="_blank" rel="noopener">Museum record ↗</a></figcaption></figure>`;
 }
 // Shared by the atlas detail panel and this tab.
 function block(r){
  const m=r.museum,t=m.traits;
  return `<div class="museum-block">${r.permanent_id?`<p><a href="index.html#item/${r.permanent_id}">#${r.permanent_id} · Structured item record</a></p>`:''}<div class="eyebrow">${esc(m.institution||'Rijksmuseum Boerhaave')} · ${esc(m.object_number)} · ${esc(m.kind)}</div>${image(r)}
  <dl><dt>Object name</dt><dd>${esc(m.object_name)}${m.object_name_en&&m.object_name_en!==m.object_name?` <small>(${esc(m.object_name_en)})</small>`:''}</dd>
  <dt>Makers and designers (catalog production field)</dt><dd>${people(r)}</dd>
  ${m.title_eponyms?`<dt>Design attribution in title</dt><dd>volgens ${esc(m.title_eponyms)}</dd>`:''}
  <dt>Dimensions</dt><dd>${esc(m.dimensions||'Not recorded')}${m.overall_length_cm?` <small>· largest ${m.overall_length_cm} cm</small>`:''}</dd>
  <dt>Subject / geography</dt><dd>${esc(m.subjects||'—')}${m.geography?` · ${esc(m.geography)}`:''}</dd>
  <dt>Atlas branch</dt><dd>${esc(r.lineage)} <small>(${esc(m.branch_rule)})</small></dd></dl>
  ${m.inscription&&m.inscription.toLowerCase()!=='geen'?`<h3>Inscription</h3><blockquote>${esc(m.inscription)}</blockquote>${m.stamps.length?`<table class="audit-table museum-stamps"><thead><tr><th>Stamp text</th><th>Parsed status</th><th>Coded role</th></tr></thead><tbody>${m.stamps.map(s=>`<tr><td>${esc(s.text)}</td><td class="${statusClass(s.status)}">${esc(s.status)}</td><td>${esc(s.coded_role||'—')}</td></tr>`).join('')}</tbody></table>`:''}`:''}
  ${m.ip_marks.length?`<p><span class="badge">IP / authenticity marks</span> ${m.ip_marks.map(esc).join(' · ')}</p>`:''}
  ${m.assembly_number_note?'<p><span class="badge">Matching numbers on both parts</span></p>':''}
  ${m.description?`<h3>Curator description (Dutch)</h3><p>${esc(m.description)}</p>`:''}
  ${t?`<h3>Coded forceps traits</h3><dl class="museum-traits">${Object.entries(t).map(([k,v])=>`<dt>${esc(k)}</dt><dd class="${v==='not mentioned'||v==='no description'?'not-recorded':''}">${esc(v)}</dd>`).join('')}</dl><p class="filter-help">Coded from the description with a fixed Dutch term list; "not mentioned" is not "absent".</p>`:''}
  ${m.exhibit_label?`<h3>Museum exhibition text</h3><p class="filter-help">Interpretive museum text, not catalog data.</p><p>${esc(m.exhibit_label)}</p>`:''}
  ${m.mergeable?links(r):''}
  ${m.detail_url?`<p><a href="${esc(m.detail_url)}" target="_blank" rel="noopener">Open the museum's record ↗</a></p>`:''}${m.morph_key?`<p><button data-morph-key="${esc(m.morph_key)}">Shape neighbours in the morphology view</button></p>`:''}</div>`;
 }
 const goto=(id,text)=>`<button class="record-link" data-museum-goto="${id}">${esc(text)}</button>`;
 function links(r){
  const t=threadOf[r.id],ee=edgesOf(r.id);
  const makers=new Set(r.museum.maker_keys),same=makers.size?R.filter(o=>o.id!==r.id&&o.museum.mergeable&&o.museum.maker_keys.some(k=>makers.has(k))).sort(byDate):[];
  const other=e=>e.source===r.id?e.target:e.source;
  return `<h3>Links</h3>${t?`<p><span class="badge">${esc(kindLabel[t.kind])}</span> ${esc(threadText(t))}${t.possible_conflation?' <span class="museum-stamp-flag">· name variants may join different people: '+esc(t.name_variants.join('; '))+'</span>':''}</p>`:''}
  ${ee.length?`<ul class="museum-links">${ee.map(e=>`<li><span class="badge">${esc(e.kind)}</span>${e.source===r.id?'→':'←'} ${goto(other(e),`${N[other(e)].label} · ${date(N[other(e)])}`)}<br><small>${esc(e.claim)} ${esc(e.missing_evidence)}</small></li>`).join('')}</ul>`:'<p class="filter-help">No link: this record shares no catalogued designer or maker with another record in its branch.</p>'}
  ${same.length?`<details><summary>Same maker, any branch (${same.length})</summary><ul class="museum-links">${same.slice(0,40).map(o=>`<li>${goto(o.id,`${o.label} · ${date(o)} · ${o.lineage}`)}</li>`).join('')}</ul>${same.length>40?`<p class="filter-help">First 40 of ${same.length}.</p>`:''}</details>`:''}
  <p class="filter-help">Links come from the catalog's designer and maker fields, oriented by catalog date. They show shared attribution, not copying or descent.</p>`;
 }
 function rows(){
  const q=$('museum-search').value.trim().toLowerCase(),set=$('museum-set').value,kind=$('museum-kind').value,br=$('museum-branch').value,ev=$('museum-evidence').value;
  return R.filter(r=>(set==='all'||r.museum.result_sets.includes(set))&&(kind==='all'||r.museum.kind===kind)&&(br==='all'||r.lineage===br)&&
   (ev==='all'||ev==='maker'&&r.museum.people.some(p=>p.role==='maker')||ev==='designer'&&r.museum.people.some(p=>p.role==='designer')||ev==='unlisted'&&r.museum.stamps.some(s=>s.coded_role)||ev==='ip'&&r.museum.ip_marks.length||ev==='inscription'&&r.museum.inscription&&r.museum.inscription.toLowerCase()!=='geen')&&
   (!q||`${r.label} ${r.context} ${r.museum.object_number} ${r.museum.inscription} ${r.museum.description} ${r.museum.object_name}`.toLowerCase().includes(q)))
   .sort((a,b)=>(a.date_start??9999)-(b.date_start??9999)||a.label.localeCompare(b.label));
 }
 function renderRecords(){
  const rs=rows();
  $('museum-count').textContent=`${rs.length} of ${R.length} catalog records · sorted by catalog start date`;
  if(!rs.some(r=>r.id===selected))selected=rs[0]?.id;
  $('museum-list').innerHTML=rs.slice(0,400).map(r=>`<button class="museum-row" data-museum="${r.id}" aria-pressed="${r.id===selected}">${r.museum.image_url?`<img loading="lazy" src="${esc(photo(r))}" alt="" onerror="this.remove()">`:'<span class="museum-noimg"></span>'}<span><small>${date(r)} · ${esc(r.museum.object_number)}</small><strong>${esc(r.label)}</strong><small>${esc(r.context)}</small></span></button>`).join('')+(rs.length>400?`<p class="filter-help">First 400 shown; narrow the search to see the remaining ${rs.length-400}.</p>`:'');
  const r=byId[selected];
  $('museum-detail').innerHTML=r?`<h3>${esc(r.label)}</h3><span class="date-prominent">${date(r)}</span><p class="date-basis">${esc(r.date_basis)}</p>${r.museum.mergeable?`<button data-museum-tree="${r.id}">Show in merged family tree</button>`:'<p class="filter-help">Depiction or document: kept in this tab, not merged into instrument branches.</p>'}${block(r)}`:'<p class="empty">No records match these filters.</p>';
 }
 function renderSummary(){
  const s=M.summary,fr=M.frame,c=s.forceps_length_contrast.date_mid;
  $('museum-heading').innerHTML=`<div class="eyebrow">Imported layer · ${esc(M.source.institution)} · accessed ${esc(M.source.accessed)}</div><h2>Museum catalog records</h2>
  <p>Three result PDFs shared by the museum were parsed and every linked record was harvested from the museum's public catalog API. These records are <strong>separate from the curated atlas</strong>. Use <em>Merge into atlas</em> to place them in the family tree, dated list, timeline and catalog by tool type and date. In the tree, records sharing a catalogued designer form <strong>design threads</strong>, records with no designer but a shared maker form <strong>maker threads</strong>, and each thread is bridged to the nearest earlier curated witness of its branch. These links show shared attribution, not descent.</p>
  <div class="boundary-counts"><span><strong>${s.records}</strong>catalog records</span><span><strong>${mergeable().length}</strong>mergeable instruments and kits</span><span><strong>${s.distinct_makers}</strong>makers named</span><span><strong>${s.distinct_designers}</strong>designers named</span><span><strong>${s.obstetric_forceps}</strong>obstetric forceps</span><span><strong>${M.names.filter(n=>n.coded_role).length}</strong>inscription names hand-coded</span><span><strong>${M.threads.filter(t=>t.kind==='design').length}</strong>design threads</span><span><strong>${M.edges.length}</strong>links (${M.edges.filter(e=>e.kind==='museum bridge').length} to curated tree)</span><span><strong>${R.filter(embedded).length}</strong>photographs embedded</span></div>
  <div class="detail-actions"><button id="museum-merge-button" aria-pressed="${merged()}">${merged()?'Unmerge from atlas':'Merge into atlas and view tree'}</button></div>
  <p class="warning">One Dutch museum's holdings, not a production sample. Attributions are the museum's own. Catalog dates are often 25–50-year bins. ${fr.files.filter(f=>f.stated_result_count===null).map(f=>`The ${esc(f.result_set)} PDF is only the first results page (${f.cards} records).`).join(' ')}</p>`;
  $('museum-merge-button').onclick=()=>toggleMerge(!merged(),true);
  $('museum-patterns').innerHTML=`<p>Median largest dimension of obstetric forceps: <strong>${c.median_1700_1799} cm</strong> (1700–1799, n = ${c.n_1700_1799}) vs <strong>${c.median_1850_1899} cm</strong> (1850–1899, n = ${c.n_1850_1899}); difference ${c.difference_cm} cm, bootstrap 95% interval ${c.bootstrap_95[0]}–${c.bootstrap_95[1]} cm (interval-midpoint binning; start/end binning agree). Objects are treated as exchangeable draws, which a collection is not.</p>`+
   M.figures.map(f=>`<figure class="museum-figure"><button class="photo-button" data-museum-figure="${f.id}" aria-label="Enlarge figure: ${esc(f.title)}"><img src="${f.src}" alt="${esc(f.title)}"></button></figure>`).join('');
  $('museum-names').innerHTML=`<h3>Names and marks found only in inscriptions</h3><p>Stamp text that does not match the catalog's maker field. Rows with a coded role were classified by hand (AI-assisted, unreviewed). "Maker" in this catalog can mean the retailer whose name is stamped.</p><div class="table-wrap"><table class="audit-table"><thead><tr><th>Object</th><th>Date</th><th>Stamp text</th><th>Parsed status</th><th>Coded role</th><th>Listed maker</th></tr></thead><tbody>${M.names.map(n=>`<tr><td><button class="record-link" data-museum-open="bh_${n.priref}">${esc(n.object_number)}</button></td><td>${esc(n.date_start)}–${esc(n.date_end)}</td><td>${esc(n.text)}</td><td>${esc(n.status)}</td><td>${esc(n.coded_role||'—')}</td><td>${esc(n.listed_makers||'—')}</td></tr>`).join('')}</tbody></table></div>`;
  const y=M.yield_rows,fields=Object.keys(y[0]).filter(k=>!['result_set','records'].includes(k));
  $('museum-method').innerHTML=`<h3>Ingestion</h3><table class="audit-table"><thead><tr><th>PDF</th><th>Cards</th><th>Printed count</th><th>Completeness</th></tr></thead><tbody>${fr.files.map(f=>`<tr><td>${esc(f.file.split('/').pop())}</td><td>${f.cards}</td><td>${f.stated_result_count??'not printed'}</td><td>${esc(f.completeness)}</td></tr>`).join('')}</tbody></table>
  <p>Links in the forceps and verlostang PDFs omit the database segment (<code>/Details//795</code>) and return an error; records here use the working form (<code>/Details/collect/795</code>). All ${s.records} records were retrieved from the API; object numbers and dates agree with the PDF cards for every record.</p>
  <h3>Field yield</h3><div class="table-wrap"><table class="audit-table"><thead><tr><th>Field</th>${y.map(r=>`<th>${esc(r.result_set)} (n=${r.records})</th>`).join('')}</tr></thead><tbody>${fields.map(f=>`<tr><td>${esc(f)}</td>${y.map(r=>`<td>${r[f]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  <h3>Branch rule for merging</h3><p>Ordered; the first matching pattern on the Dutch object name decides. Kits form their own branch; depictions and documents are not merged.</p><table class="audit-table"><thead><tr><th>Pattern</th><th>Family</th><th>Branch</th></tr></thead><tbody>${M.branch_rules.map(b=>`<tr><td><code>${esc(b.pattern)}</code></td><td>${esc(b.family)}</td><td>${esc(b.lineage)}</td></tr>`).join('')}</tbody></table>
  <h3>Links</h3><table class="audit-table"><thead><tr><th>Kind</th><th>n</th><th>Rule</th></tr></thead><tbody>${[['shared design attribution','Consecutive records (catalog date order) sharing the first catalogued designer, within a branch. Title eponyms are used only when no designer is catalogued.'],['same maker','Consecutive records with no designer that share their first catalogued maker, within a branch.'],['combined design attribution','A record with two or more designers, linked to the nearest-dated record of the other designer\'s thread.'],['museum bridge','From the latest-starting curated witness that starts no later than the thread\'s first dated object; same branch, or same task family when the branch is new ('+M.branch_links.map(b=>esc(b.museum_lineage)+' ← '+esc(b.curated_lineages.join(', '))).join('; ')+').']].map(([k,rule])=>`<tr><td>${esc(k)}</td><td>${M.edges.filter(e=>e.kind===k).length}</td><td>${rule}</td></tr>`).join('')}</tbody></table><p class="filter-help">Obstetric, dental, kit and other branches have no task family in the curated atlas, so they get no bridge. That is a gap in the curated tree, not evidence of independent origin.</p>
  <h3>Limits</h3><ul><li>Holdings reflect acquisition and donation history and are strongly Dutch.</li><li>"Maker" can denote a retailer; one record lists an IP mark as maker.</li><li>Traits are coded from descriptions; absence of a term is not absence of the feature.</li><li>Photographs are 320 px thumbnails cached from the museum's server and embedded for local viewing. The records carry no rights statement; ask the museum before publishing this atlas.</li><li>Design threads join records by catalogued designer surname. Father and son (Antoine and Paul Dubois; A. E. and E. C. J. von Siebold) can share a thread; such threads are flagged. Spelling variants (e.g. Fergusson/Ferguson) stay separate.</li><li>Independent human review: 0.</li></ul>`;
 }
 function toggleMerge(on,go){
  $('merge-museum').checked=on;
  $('merge-museum').dispatchEvent(new Event('change'));
  const b=$('museum-merge-button');if(b){b.textContent=on?'Unmerge from atlas':'Merge into atlas and view tree';b.setAttribute('aria-pressed',String(on));}
  if(on&&go){tab('map');$('view').value='family';graph();requestAnimationFrame(()=>Tree.focus('Obstetric forceps'));}
 }
 function showInTree(id){
  if(!merged())toggleMerge(true,false);
  tab('map');$('view').value='family';detail(id);graph();
  requestAnimationFrame(()=>{Tree.focus(N[id].lineage);Tree.select(id);});
 }
 function init(){
  M=D.museum||null;R=M?M.records:[];X=(D.museum_other&&D.museum_other.records)||[];byId=Object.fromEntries(R.concat(X).map(r=>[r.id,r]));selected=null;
  if(!M){$('museum-tab').hidden=true;$('merge-museum-label').hidden=true;return;}
  for(const s of M.sources)S[s.id]=s;
  for(const r of R.concat(X))N[r.id]=r;if(D.museum_other)for(const s of D.museum_other.sources)S[s.id]=s;
  for(const t of M.threads.concat(D.museum_other?D.museum_other.threads:[]))for(const id of t.members)threadOf[id]=t;
  // New branches sit after the curated branch they are bridged to, otherwise at the end.
  for(const r of mergeable().concat(X)){
   if(!families.includes(r.family))families.push(r.family);
   if(lineages.includes(r.lineage))continue;
   const anchor=M.branch_links.find(b=>b.museum_lineage===r.lineage)?.curated_lineages.at(-1),i=lineages.indexOf(anchor);
   if(i<0){lineages.push(r.lineage);continue;}
   let j=i+1;while(j<lineages.length&&M.branch_links.some(b=>b.museum_lineage===lineages[j]))j++;
   lineages.splice(j,0,r.lineage);
  }
  const newLineages=[...new Set(mergeable().concat(X).map(r=>r.lineage))].filter(l=>!D.nodes.some(n=>n.lineage===l));
  newLineages.forEach(l=>$('lineage').insertAdjacentHTML('beforeend',`<option>${esc(l)}</option>`));
  [...new Set(mergeable().concat(X).map(r=>r.family))].filter(f=>!D.nodes.some(n=>n.family===f)).forEach(f=>$('family').insertAdjacentHTML('beforeend',`<option>${esc(f)}</option>`));
  $('merge-museum-count').textContent=mergeable().length+X.length;
  $('museum-set').innerHTML=opts(M.frame.files.map(f=>f.result_set),'All PDF result sets');
  $('museum-kind').innerHTML=opts([...new Set(R.map(r=>r.museum.kind))],'All record kinds');
  $('museum-branch').innerHTML=opts([...new Set(R.map(r=>r.lineage))].sort(),'All branches');
  for(const id of ['museum-search','museum-set','museum-kind','museum-branch','museum-evidence'])$(id).addEventListener(id==='museum-search'?'input':'change',renderRecords);
  $('museum-view').onchange=()=>{for(const v of ['records','patterns','names','method'])$('museum-pane-'+v).hidden=v!==$('museum-view').value;};
  $('museum').addEventListener('click',e=>{
   const row=e.target.closest('[data-museum]');if(row){selected=row.dataset.museum;renderRecords();$('museum-detail').scrollIntoView({block:'nearest'});}
   const tree=e.target.closest('[data-museum-tree]');if(tree)showInTree(tree.dataset.museumTree);
   const open=e.target.closest('[data-museum-open]');if(open){selected=open.dataset.museumOpen;$('museum-view').value='records';$('museum-view').onchange();for(const id of ['museum-set','museum-kind','museum-branch','museum-evidence'])$(id).value='all';$('museum-search').value='';renderRecords();}
   const fig=e.target.closest('[data-museum-figure]');if(fig){const f=M.figures.find(f=>f.id===fig.dataset.museumFigure);Tree.hide();$('photo-content').innerHTML=`<img src="${f.src}" alt="${esc(f.title)}"><p>${esc(f.title)} · generated from the harvested records (scripts/plotting/boerhaave_figures.py).</p>`;$('photo-viewer').showModal();}
  });
  // Links in the atlas detail panel and in this tab.
  document.addEventListener('click',e=>{
   const ph=e.target.closest('[data-museum-photo]');if(ph){const r=byId[ph.dataset.museumPhoto];Tree.hide();$('photo-content').innerHTML=`<img src="${esc(photo(r))}" alt="${esc(r.label)}"><p>${esc(r.label)} · ${esc(r.museum.object_number)} · ${date(r)}</p><p>${esc(r.museum.image_credit||M.source.image_credit)} Thumbnail; <a href="${esc(r.museum.detail_url)}" target="_blank" rel="noopener">full record and larger image at the museum ↗</a></p>`;$('photo-viewer').showModal();}
   const mk=e.target.closest('[data-morph-key]');if(mk&&typeof Morph!=='undefined'){tab('morph');Morph.pinKey(mk.dataset.morphKey);return;}
   const g=e.target.closest('[data-museum-goto]');if(!g)return;
   const id=g.dataset.museumGoto;
   if(!$('map').hidden&&merged()){detail(id);if($('view').value==='family')Tree.reveal(id);else graph();return;}
   selected=id;tab('museum');$('museum-view').value='records';$('museum-view').onchange();for(const k of ['museum-set','museum-kind','museum-branch','museum-evidence'])$(k).value='all';$('museum-search').value='';renderRecords();$('museum-detail').scrollIntoView({block:'nearest'});
  });
  $('museum-download').onclick=()=>download('boerhaave_records.json','application/json',JSON.stringify({source:M.source,records:R},null,2));
  renderSummary();renderRecords();
 }
 return {init,block,merged,photo,image,nodes:()=>merged()?mergeable().concat(X):[],isMuseum:id=>!!byId[id],showInTree,
  edges:()=>merged()?M.edges:[],threads:lineage=>merged()?M.threads.concat(D.museum_other?D.museum_other.threads:[]).filter(t=>t.lineage===lineage):[],thread:id=>threadOf[id],threadText,
  bridgedFrom:lineage=>M?.branch_links.find(b=>b.museum_lineage===lineage)};
})();
