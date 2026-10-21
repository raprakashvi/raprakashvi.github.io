/* Source-led exploratory findings. All interpretations remain inspectable. */
'use strict';
const Boundaries=(()=>{
  let selected='B1';
  const X=()=>D.boundaries;
  const obs=id=>X().observations.find(o=>o.id===id);
  const page=id=>X().page_images.find(p=>p.id===id);
  const match=o=>$('boundary-task').value==='all'||o.task===$('boundary-task').value;
  function evidence(o){
    const photos=[...o.images.map(id=>({im:page(id),pilot:true})),
      ...o.node_ids.flatMap(id=>photosFor(id)).slice(0,1).map(im=>({im,pilot:false}))];
    return `<article class="boundary-witness" id="witness-${esc(o.id)}">
      <span class="eyebrow">${esc(o.tradition)} · ${esc(o.task)}</span><h4>${esc(o.title)}</h4>
      <p class="boundary-date">${esc(o.witness_date)}<small>${esc(o.date_role)}</small></p>
      <p>${esc(o.summary)}</p>
      ${photos.length?`<div class="boundary-pages">${photos.map(({im,pilot})=>`<button ${pilot?'data-pilot-page':'data-photo'}="${esc(im.id)}" aria-label="Enlarge ${esc(im.caption)}"><img src="${photoSrc(im)}" alt="${esc(im.caption)}" loading="lazy"><small>${esc(im.caption)}</small></button>`).join('')}</div>`:''}
      <p class="citation">${esc(o.locator)}<br>${refs([o.source])}</p>
      <details><summary>Extracted fields &amp; reading limits</summary><dl>${Object.entries(o.features).map(([k,v])=>`<dt>${esc(X().features[k])}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <p class="warning">${esc(o.limit)}</p><small>${esc(o.review_status)}. Source anchor checked against a hashed local copy; this does not independently validate the reading.</small>
      ${o.node_ids.map(id=>`<button class="boundary-jump" data-pilot-node="${esc(id)}">Open ${esc(N[id].label)} in tree</button>`).join('')}</details></article>`;
  }
  function render(){
    const q=$('boundary-search').value.trim().toLowerCase();
    const findings=X().findings.filter(f=>f.evidence.some(id=>match(obs(id)))&&
      (!q||JSON.stringify([f,...f.evidence.map(obs)]).toLowerCase().includes(q)));
    if(!findings.some(f=>f.id===selected))selected=findings[0]?.id;
    $('boundary-result-count').textContent=`${findings.length} / ${X().findings.length} exploratory dossiers · observations and interpretations separated`;
    $('boundary-list').innerHTML=findings.map(f=>`<button data-boundary="${f.id}" aria-pressed="${f.id===selected}"><span>${esc(f.id)} · ${esc(f.kind)}</span>${esc(f.title)}</button>`).join('');
    const f=findings.find(f=>f.id===selected);
    $('boundary-detail').innerHTML=f?`<div class="boundary-finding"><span class="eyebrow">${esc(f.kind)} · ${esc(f.id)}</span><h3>${esc(f.title)}</h3><p class="boundary-status">${esc(f.status)}</p>
      <div class="boundary-reasoning"><div><span class="eyebrow">Observed in the sources</span><p>${esc(f.observation)}</p></div><div><span class="eyebrow">Our interpretation</span><p>${esc(f.inference)}</p></div></div>
      <p><strong>What changes in the study.</strong> ${esc(f.consequence)}</p>
      <details class="boundary-test"><summary>Alternative explanation &amp; decisive next evidence</summary><p>${esc(f.alternative)}</p><p><strong>Next test.</strong> ${esc(f.next_test)}</p></details>
      <h4 class="boundary-evidence-heading">Read the evidence together</h4><p class="filter-help">Order below groups the argument; it is not a chronological lineage. Click a page to inspect the scan.</p>
      <div class="boundary-evidence">${f.evidence.map(id=>evidence(obs(id))).join('')}</div></div>`:'<p class="panel">No dossier matches. Clear the search or change the task filter.</p>';
    renderMatrix();
  }
  function renderMatrix(){
    const rows=X().observations.filter(match);
    $('boundary-matrix').innerHTML=`<p>${rows.length} selected readings. A filled cell means a feature was extracted; a dash means it was not coded in this pilot. Neither describes historical prevalence.</p><div class="table-wrap"><table class="boundary-matrix"><caption>Descriptions are heterogeneous; no distance, rate or similarity score is computed.</caption><thead><tr><th>Source witness</th>${Object.entries(X().features).map(([k,v])=>`<th>${esc(v)}</th>`).join('')}</tr></thead><tbody>${rows.map(o=>`<tr><th scope="row">${esc(o.title)}<small>${esc(o.witness_date)}</small></th>${Object.keys(X().features).map(k=>`<td>${o.features[k]?`<button data-feature-observation="${esc(o.id)}" data-feature="${k}" aria-label="Read ${esc(X().features[k])} evidence for ${esc(o.title)}" title="${esc(o.features[k])}">●</button>`:'<span title="Not coded; not evidence of absence">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p id="boundary-cell" class="panel" aria-live="polite">Select a filled cell to read its value and source.</p>`;
  }
  function openPage(id){
    const im=page(id);
    $('photo-content').innerHTML=`<img src="${photoSrc(im)}" alt="${esc(im.caption)}"><h3>${esc(im.caption)}</h3><p>${esc(im.credit)} · ${esc(im.rights)}</p><p>${refs([im.source])} · <a href="${esc(im.image_url)}" target="_blank" rel="noopener">Original page image ↗</a> · <a href="${esc(im.license_url)}" target="_blank" rel="noopener">Rights / provider record ↗</a></p>`;
    $('photo-viewer').showModal();
  }
  function init(){
    const a=X().audit,s=a.screening;
    $('boundary-summary').innerHTML=`<span class="eyebrow">First evidence pass · ${esc(X().as_of)} · exploratory</span><h2>What has to travel with a surgical tool?</h2><p>Shape, words, materials, craft and use do not carry the same information. These source comparisons expose places where a description can be copied while the means to make, judge or use the instrument remain uncertain.</p><div class="boundary-counts"><span><strong>${a.observations}</strong> source readings</span><span><strong>${a.sources}</strong> cited sources</span><span><strong>${a.findings}</strong> exploratory dossiers</span><span><strong>${a.independent_reviews}</strong> independent reviews</span></div><p class="filter-help">${esc(X().scope)}</p>`;
    $('boundary-task').innerHTML='<option value="all">Both pilot tasks</option>'+[...new Set(X().observations.map(o=>o.task))].map(t=>`<option>${esc(t)}</option>`).join('');
    $('boundary-task').onchange=render;$('boundary-search').oninput=render;
    $('boundary-view').onchange=()=>{for(const id of ['findings','matrix','screen'])$('boundary-pane-'+id).hidden=$('boundary-view').value!==id;};
    $('boundary-screen').innerHTML=`<h3>A complete screen of one selected page</h3><p>Weiss, 1863, printed p. 19. All <strong>${s.screened_entries} named entries</strong> were retained: <strong>${s.strict_included} included</strong>, <strong>${s.borderline} borderline</strong>, <strong>${s.excluded} excluded</strong>. Including the combined pilot item raises the catheter-entry count to ${s.inclusive_upper}. These are eligibility bounds, not a confidence interval or innovation count.</p><p>Rule: include explicit catheter entries (including inherited ditto labels); exclude bougies, stylets, syringes and extraction devices. Retain the pilot bougie/canula as borderline because the plate key calls it a catheter. Variants and sizes are not expanded into invented SKUs.</p><button data-pilot-page="pilot_weiss_p19">Inspect the complete source page</button><div class="table-wrap"><table><thead><tr><th>Printed entry (expanded / paraphrased)</th><th>Decision</th><th>Reason</th><th>Plate reference</th></tr></thead><tbody>${X().screening.map(r=>`<tr><td>${esc(r.entry)}</td><td>${esc(r.decision)}</td><td>${esc(r.reason)}</td><td>${esc(r.plate||'Not supplied')}</td></tr>`).join('')}</tbody></table></div><p>${refs(['pilot_weiss'])}</p><details><summary>Selection, review and limits</summary><p>${esc(X().selection)}</p><p>This page was selected after a keyword hit. Entire-volume completeness and search recall are unknown. Plate and list descriptions are linked views of the same offering, not independent observations. All coding awaits independent review.</p></details>`;
    $('boundary-download').onclick=()=>download('boundary_pilot.json','application/json',JSON.stringify({...X(),sources:D.sources.filter(s=>X().observations.some(o=>o.source===s.id))},null,2));
    $('boundaries').addEventListener('click',e=>{
      const b=e.target.closest('[data-boundary]');if(b){selected=b.dataset.boundary;render();return;}
      const p=e.target.closest('[data-pilot-page]');if(p){openPage(p.dataset.pilotPage);return;}
      const n=e.target.closest('[data-pilot-node]');if(n){tab('map');detail(n.dataset.pilotNode);graph();if($('view').value==='family'){Tree.select(n.dataset.pilotNode);Tree.focus(N[n.dataset.pilotNode].lineage);}return;}
      const cell=e.target.closest('[data-feature-observation]');if(cell){const o=obs(cell.dataset.featureObservation);$('boundary-cell').innerHTML=`<strong>${esc(o.title)} · ${esc(X().features[cell.dataset.feature])}</strong><p>${esc(o.features[cell.dataset.feature])}</p><p>${esc(o.locator)} · ${esc(o.date_role)}</p><p>${esc(o.limit)}</p>${refs([o.source])}`;}
    });
    render();
  }
  return {init};
})();
