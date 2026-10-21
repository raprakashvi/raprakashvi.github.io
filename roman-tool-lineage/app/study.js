/* Independent scoping register: no cases are silently inserted into the genealogy. */
'use strict';
const Study=(()=>{
  const X=()=>D.study;
  const sourceLinks=ids=>refs(ids);
  function renderCases(){
    const region=$('study-region').value,status=$('study-status').value,q=$('study-search').value.trim().toLowerCase();
    const cases=X().cases.filter(c=>(region==='all'||c.region===region)&&(status==='all'||c.status===status)&&(!q||Object.values(c).join(' ').toLowerCase().includes(q)));
    $('study-case-count').textContent=`${cases.length} of ${X().cases.length} scoping dossiers · excluded from instrument counts`;
    $('study-cases').innerHTML=cases.length?cases.map(c=>`<article class="study-case" id="case-${esc(c.id)}"><div class="eyebrow">${esc(c.region)} · ${esc(c.status)}</div><h3>${esc(c.title)}</h3><p class="study-period">${esc(c.period)}<small>${esc(c.date_role)}</small></p><p>${esc(c.observation)}</p><p><strong>Compare.</strong> ${esc(c.comparison)}</p><details><summary>Evidence, limits &amp; next step</summary><p><strong>Task.</strong> ${esc(c.task)}</p><p class="warning">${esc(c.boundary)}</p><p><strong>Next.</strong> ${esc(c.next_step)}</p><p>${esc(c.locator)}</p><p>${sourceLinks(c.sources)}</p><small>${esc(c.review_status)}</small></details></article>`).join(''):'<p class="panel">No dossier matches these filters. This is a search result within the scoping register, not historical absence.</p>';
  }
  function renderRoutes(){
    const status=$('study-route-status').value;
    const routes=X().routes.filter(r=>status==='all'||(status==='documented'?r.status.startsWith('documented'):r.status==='comparison hypothesis'));
    $('study-routes').innerHTML=routes.map(r=>`<article class="study-route"><div class="eyebrow">${esc(r.status)}</div><h3>${esc(r.title)}</h3><p>${esc(r.support)}</p><p class="warning">${esc(r.limit)}</p><details><summary>What would establish the connection?</summary><p>${esc(r.test)}</p><p>${sourceLinks(r.sources)}</p><div class="study-jumps">${r.cases.map(id=>`<button data-study-case="${esc(id)}">Open ${esc(X().cases.find(c=>c.id===id).title)}</button>`).join('')}</div></details></article>`).join('');
  }
  function renderImages(){
    const later=D.nodes.filter(n=>n.family!=='Knowledge transfer'&&n.date_end!==null&&n.date_end>=1500);
    const missing=later.filter(n=>!photoFor(n.id));
    $('study-images').innerHTML=`<h3>Later-tool image coverage</h3><p><strong>${later.length-missing.length} / ${later.length}</strong> records overlapping 1500 CE or later have an image. Includes photographs, historical illustrations and patent drawings; an image does not establish adoption or a modern introduction date.</p><div class="study-photo-strip">${D.images.filter(im=>im.id.includes('phase2')||im.relation==='patent drawing').map(im=>`<figure><button class="photo-button" data-photo="${esc(im.id)}" aria-label="Enlarge ${esc(im.caption)}"><img src="${photoSrc(im)}" alt="${esc(im.caption)}" loading="lazy"></button><figcaption>${esc(N[im.node_ids[0]].label)}<small>${esc(imageRole(im))}</small></figcaption></figure>`).join('')}</div><details><summary>${missing.length} remaining image gaps and source links</summary>${missing.map(n=>`<article class="evidence-note"><h4>${esc(n.label)}</h4><p>${esc(X().image_gap_notes[n.id]||'A matched reusable image is not yet curated.')}</p><p>${sourceLinks(n.sources)}</p></article>`).join('')}</details><p>Images enlarge with source and rights. Historical coverage still ends in 1980; contemporary catalogs are a separate acquisition task.</p>`;
  }
  function init(){
    $('study-heading').innerHTML=`<span class="eyebrow">Phase II · ${esc(X().as_of)} · research draft</span><h2>${esc(X().question)}</h2><p>Roman tools are a reference panel within a wider comparative study. Explore witnesses across traditions, inspect possible connections, and see the evidence needed for each proposed contribution.</p><p class="warning">${esc(X().status)}. Similarity, text transmission and tool adoption are different claims.</p>`;
    $('study-contributions').innerHTML=X().contributions.map(c=>`<article><span class="eyebrow">${esc(c.id)}</span><h3>${esc(c.title)}</h3><p>${esc(c.deliverable)}</p><details><summary>Acceptance test</summary><p>${esc(c.test)}</p></details><small>${esc(c.status)}</small></article>`).join('');
    $('study-stages').innerHTML=X().stages.map(s=>`<li><h3>${esc(s.title)}</h3><p>${esc(s.output)}</p></li>`).join('');
    $('study-gaps').textContent=X().unrepresented.join(' · ');
    $('study-region').innerHTML='<option value="all">All regions</option>'+[...new Set(X().cases.map(c=>c.region))].map(s=>`<option>${esc(s)}</option>`).join('');
    $('study-status').innerHTML='<option value="all">All evidence states</option>'+[...new Set(X().cases.map(c=>c.status))].map(s=>`<option>${esc(s)}</option>`).join('');
    for(const id of ['study-region','study-status'])$(id).onchange=renderCases;
    $('study-search').oninput=renderCases;
    $('study-route-status').onchange=renderRoutes;
    $('study-view').onchange=()=>{for(const id of ['scope','routes','plan','images'])$('study-pane-'+id).hidden=$('study-view').value!==id;};
    $('study-download').onclick=()=>download('phase2_study.json','application/json',JSON.stringify({...X(),sources:D.sources},null,2));
    $('study').addEventListener('click',e=>{const b=e.target.closest('[data-study-case]');if(!b)return;
      $('study-region').value=$('study-status').value='all';$('study-search').value='';renderCases();
      $('study-view').value='scope';$('study-view').dispatchEvent(new Event('change'));
      const c=$('case-'+b.dataset.studyCase);c.querySelector('details').open=true;c.scrollIntoView({block:'center',behavior:'smooth'});
    });
    renderCases();renderRoutes();renderImages();
  }
  return {init};
})();
