/* A source-bounded relation browser, separate from the historical lineage graph. */
const Weiss = (() => {
 let study, selected='W32-R01', page=32;
 const featured=['W32-R01','W09-R02','W10-R02','W14-R02','W19-R03','W16-R01','W31-R06','W37-R01'];
 const imageFor=p=>study.page_images.find(im=>im.page===p);
 const pageFor=p=>study.pages.find(row=>row.page===p);
 const link=p=>`<a href="${esc(pageFor(p).image_url)}" target="_blank" rel="noopener">Printed p. ${p} ↗</a>`;
 const opts=(values,all)=>`<option value="all">${all}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
 function sourceImage(p){
  const im=imageFor(p);
  return `<figure class="weiss-scan"><button data-weiss-image="${p}" aria-label="Enlarge source scan, printed page ${p}"><img loading="lazy" src="${photoSrc(im)}" alt="Weiss 1863, printed page ${p}; original catalog text"></button><figcaption>${link(p)} · Royal College of Surgeons of England / Wellcome · <a href="${study.source.license_url}">Public Domain Mark</a><br>Catalog text scan; click to enlarge.</figcaption></figure>`;
 }
 function rows(){
  const q=$('weiss-search').value.trim().toLowerCase();
  return study.relations.filter(r=>(['eligibility','task_relation','relation_type'].every((key,i)=>$( ['weiss-strength','weiss-task','weiss-type'][i]).value==='all'||r[key]===$( ['weiss-strength','weiss-task','weiss-type'][i]).value))&&(!q||JSON.stringify(r).toLowerCase().includes(q)));
 }
 function render(){
  const visible=rows();
  $('weiss-count').textContent=`${visible.length} of ${study.relations.length} screening nominations. Repeated passages remain included; these are not counts of instruments or innovations.`;
  if(!visible.some(r=>r.id===selected))selected=visible[0]?.id;
  $('weiss-list').innerHTML=visible.map(r=>`<button class="weiss-row" data-weiss-relation="${r.id}" aria-pressed="${r.id===selected}"><small>p. ${r.page} · ${esc(r.relation_type)}</small><strong>${esc(r.source_label)}</strong><span>${esc(r.target_label)}</span><small>${esc(r.eligibility)} · ${esc(r.task_relation)}</small></button>`).join('');
  const r=visible.find(r=>r.id===selected);
  if(!r){$('weiss-detail').innerHTML='<p class="empty">No nominations match these filters.</p>';return;}
  const target=r.target_check;
  const group=study.adjudication.assertion_groups?.find(g=>g.id===r.assertion_group);
  $('weiss-detail').innerHTML=`<div class="eyebrow">Weiss · 1863 edition · ${r.id} · ${link(r.page)}</div>
   <h3>${esc(r.relation_type)}</h3>
   <div class="weiss-pair" role="group" aria-label="Source-stated comparison; no chronological direction">
    <div><small>Described instrument</small><strong>${esc(r.source_label)}</strong></div><span class="weiss-join" aria-hidden="true">⋯</span><div><small>Named or implied referent</small><strong>${esc(r.target_label)}</strong></div>
   </div><p class="filter-help">${esc(r.task_relation)} · Source-stated relationship in one edition; no chronological direction.</p>
   <div class="weiss-evidence"><div><h4>What the passage supports</h4><p>${esc(r.interpretation)}</p><p class="warning">${esc(r.caveat)}</p>
    <h4>Eligibility decision</h4><p><strong>${esc(r.eligibility)}</strong>. ${esc(r.adjudication.reason)}</p>
    <h4>Source passage</h4><blockquote>${esc(r.anchor)}</blockquote><p class="filter-help">Exact OCR anchor; original spelling and OCR errors retained. ${esc(r.scan_status)}.</p><p>${esc(r.scan_note||'No scan correction recorded.')}</p>
    <h4>Target follow-up</h4><p><strong>${esc(target.status)}</strong>. ${esc(target.note)}</p>${target.target_page?`<button data-weiss-page="${target.target_page}">Read target entry on p. ${target.target_page}</button><blockquote>${esc(target.target_anchor)}</blockquote>`:''}
    ${group?`<h4>Repeated assertion</h4><p>${esc(group.reason)}</p><p>${group.members.map(id=>`<button data-weiss-jump="${id}">${id}</button>`).join(' ')}</p>`:''}
    <p><button data-weiss-page="${r.page}">Read full page and controls</button></p></div>${sourceImage(r.page)}</div>`;
 }
 function select(id){
  selected=id;['weiss-strength','weiss-task','weiss-type'].forEach(key=>$(key).value='all');$('weiss-search').value='';
  $('weiss-view').value='relations';view();render();
 }
 function renderPage(){
  const p=pageFor(page), mentions=study.relations.filter(r=>r.page===page), refs=study.pointer_lines.filter(r=>r.page===page);
  $('weiss-page-grid').innerHTML=study.pages.map(p=>`<button data-weiss-page="${p.page}" aria-pressed="${p.page===page}" title="${p.explicit_count} explicit relations, ${p.nomination_count} nominations, ${p.pointer_line_count} pointer-bearing OCR lines"><strong>${p.page}</strong><small>${p.explicit_count} explicit</small></button>`).join('');
  $('weiss-page-detail').innerHTML=`<h3>Printed page ${page}</h3><p>${esc(p.screen_result)} · ${p.nomination_count} nominations · ${p.pointer_line_count} pointer-bearing OCR lines</p><p>${esc(p.notes)}</p><p class="filter-help">Reader: ${esc(p.reader_role)} agent · ${esc(p.scan_status)} · not independent human verification</p><div class="weiss-evidence"><div><h4>Full page OCR</h4><pre class="weiss-ocr">${esc(p.ocr_text)}</pre><h4>Nominations retained on this page</h4>${mentions.length?mentions.map(r=>`<p><button data-weiss-jump="${r.id}">${r.id}</button> ${esc(r.source_label)} · ${esc(r.eligibility)}</p>`).join(''):'<p>No nominations. The page remains in the denominator.</p>'}<details><summary>${refs.length} mechanical pointer-line controls</summary><p class="filter-help">One record per matching OCR line, including overlaps with nominated passages. These are navigation controls, not extra relationships.</p>${refs.map(r=>`<p><code>${r.id}</code> ${esc(r.text)}</p>`).join('')}</details></div>${sourceImage(page)}</div>`;
 }
 function showPage(p){page=Number(p);$('weiss-view').value='pages';view();renderPage();}
 function view(){for(const id of ['relations','pages','methods'])$('weiss-pane-'+id).hidden=$('weiss-view').value!==id;}
 function init(){
  study=D.weiss_study;const s=study.summary;
  $('weiss-heading').innerHTML=`<div class="eyebrow">Bounded source study · 1863 · one maker, one edition</div><h2>What carries across a clinical task?</h2><p>Read the catalog’s own comparisons: shared construction, changes of scale, fitted working parts and alternative uses. The question is whether a whole instrument—or only part of its design—crosses a task boundary.</p><div class="audit-metrics"><div><strong>${s.pages_scan_checked} / 45</strong><span>printed pages scan checked</span></div><div><strong>${s.nominations}</strong><span>passage nominations retained</span></div><div><strong>${s.eligibility_counts['explicit relation']||0}</strong><span>explicit relation mentions, including repeats</span></div><div><strong>${s.target_entries_located}</strong><span>separate target entries matched</span></div></div><p class="warning">This is a catalog study, not a new ancestral branch. Relations describe claims in the 1863 edition; they do not date invention or prove transfer. All coding is provisional; independent human reviews: 0.</p>`;
  $('weiss-strength').innerHTML=opts(study.definitions.eligibility,'All nominations and controls');$('weiss-strength').value='explicit relation';
  $('weiss-type').innerHTML=opts(study.definitions.relation_types,'All relation types');
  $('weiss-task').innerHTML=opts(study.definitions.task_relations,'All task comparisons');
  $('weiss-featured').innerHTML=featured.filter(id=>study.relations.some(r=>r.id===id)).map(id=>{const r=study.relations.find(r=>r.id===id);return `<button data-weiss-jump="${id}">${esc(r.source_label)} <small>p. ${r.page}</small></button>`;}).join('');
  const statement=study.source_statements.find(r=>r.page===43);
  $('weiss-methods').innerHTML=`<h3>Denominator and decision trail</h3><p><a href="${study.source.url}" target="_blank" rel="noopener">Weiss, illustrated catalogue (1863) ↗</a>. Classified List, printed pp. 1–45; p. 46 begins instrument sets. Frame frozen ${esc(study.frame.frozen_utc.slice(0,10))} after the earlier page-19 discovery.</p><ol>${study.methods.map(m=>`<li>${esc(m)}</li>`).join('')}</ol><h3>Screening result</h3><div class="table-wrap"><table><thead><tr><th>Eligibility after reconciliation</th><th>Passage nominations</th></tr></thead><tbody>${study.definitions.eligibility.map(k=>`<tr><td>${esc(k)}</td><td>${s.eligibility_counts[k]||0}</td></tr>`).join('')}</tbody></table></div><p>${s.pages_with_explicit_relation}/45 pages contain at least one explicit relation nomination. Pages with none: ${s.pages_without_explicit_relation.join(', ')||'none'}. Absence of an explicit comparison does not establish absence of a historical relationship.</p><p>${s.pointer_bearing_ocr_lines} pointer-bearing OCR lines are preserved separately; ${s.repeat_groups} repeated-assertion groups have been reconciled, with every occurrence retained. Other repetition may remain unresolved.</p><h3>What the catalog itself leaves out</h3>${statement?`<blockquote>${esc(statement.anchor)}</blockquote><p>${esc(statement.interpretation)} ${link(43)}</p>`:''}<h3>Next discriminating test</h3><p>For the explicit construction and fit claims, compare the named parts in plates and surviving objects. Record which dimensions, joints, working ends and materials agree. A matching name or the seller’s analogy is insufficient. Then compare another dated edition or maker before claiming a pattern over time.</p><p class="warning">The source belongs to an exploratory discovery set. Count differences across reader blocks can reflect nomination policy and catalog layout. No prevalence estimate, uncertainty interval, innovation rate or causal effect is computed.</p>`;
  $('weiss-view').onchange=view;
  for(const id of ['weiss-strength','weiss-task','weiss-type','weiss-search'])$(id).addEventListener(id==='weiss-search'?'input':'change',render);
  $('weiss-download').onclick=()=>download('weiss1863_study.json','application/json',JSON.stringify(study,null,2));
  $('weiss').addEventListener('click',e=>{
   const relation=e.target.closest('[data-weiss-relation]'),jump=e.target.closest('[data-weiss-jump]'),p=e.target.closest('[data-weiss-page]'),im=e.target.closest('[data-weiss-image]');
   if(relation){selected=relation.dataset.weissRelation;render();}
   if(jump)select(jump.dataset.weissJump);
   if(p)showPage(p.dataset.weissPage);
   if(im){const n=Number(im.dataset.weissImage);$('photo-content').innerHTML=`<img src="${photoSrc(imageFor(n))}" alt="Full source scan, Weiss 1863 printed page ${n}"><p>${link(n)} · Royal College of Surgeons of England / Wellcome Collection · <a href="${study.source.license_url}">Public Domain Mark</a>. Text page; OCR and corrections are in the study register.</p>`;$('photo-viewer').showModal();}
  });
  view();render();renderPage();
 }
 return {init,select};
})();
