'use strict';
const D=JSON.parse(document.getElementById('dataset').textContent);
const $=id=>document.getElementById(id), S=Object.fromEntries(D.sources.map(s=>[s.id,s])), N=Object.fromEntries(D.nodes.map(n=>[n.id,n]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const year=y=>y<0?`${-y} BCE`:`${y} CE`;
const date=n=>n.date_start===null?(n.museum?'Undated catalog record':'Undated · Roman type'):n.date_start===n.date_end?year(n.date_start):n.date_start>0?`${n.date_start}–${n.date_end} CE`:`${year(n.date_start)}–${year(n.date_end)}`;
const byDate=(a,b)=>(a.date_start??Infinity)-(b.date_start??Infinity)||(a.date_end??Infinity)-(b.date_end??Infinity)||a.label.localeCompare(b.label);
const lineages=[...new Set(D.nodes.map(n=>n.lineage))];
const families=[...new Set(D.nodes.map(n=>n.family))];
const refs=ids=>ids.map(id=>`<a href="${esc(S[id].url)}" target="_blank" rel="noopener">${esc(S[id].title)} ↗</a>`).join('<br>');
const IMAGE_DATA=JSON.parse($('image-data').textContent);
const photoFor=id=>D.images.find(im=>im.node_ids.includes(id));
const photosFor=id=>D.images.filter(im=>im.node_ids.includes(id));
const photoSrc=im=>IMAGE_DATA[im.id]||im.path;
const imageRole=im=>({'reference objects':'Reference plate · different objects','text illustration':'Printed illustration','historical object plate':'Historical plate · this object','cataloged object':'Object photograph','patent drawing':'Patent drawing'}[im.relation]||im.relation);
function imageCard(im){return `<figure class="object-image"><div class="image-role">${esc(imageRole(im))}</div><button class="photo-button" data-photo="${im.id}" aria-label="Open image: ${esc(im.caption)}"><img loading="lazy" decoding="async" src="${photoSrc(im)}" alt="${esc(im.caption)}"></button><figcaption>${im.relation==='reference objects'?'<strong>Reference objects; not this specimen.</strong><br>':''}${esc(im.caption)}<br>${esc(im.credit)} · <a href="${esc(im.license_url)}">${esc(im.license)}</a> · <a href="${esc(S[im.source].url)}">Source ↗</a></figcaption></figure>`;}
function researchNotes(n){
 const images=photosFor(n.id).slice(1);
 const dimensions=n.comparison.dimensions;
 return `${n.permanent_id?`<p><a href="collection.html#item/${n.permanent_id}">#${n.permanent_id} · Structured item record</a></p>`:''}${dimensions.value?`<h3>Recorded measurements</h3><p>${esc(dimensions.value)}</p>`:''}${n.witness_history?.length?`<h3>Dates in this record</h3><dl class="witness-history">${n.witness_history.map(h=>`<dt>${esc(h.label)}</dt><dd>${esc(h.date)} <a href="${esc(S[h.source].url)}" target="_blank" rel="noopener" aria-label="Date source">↗</a></dd>`).join('')}</dl>`:''}${n.evidence_notes?.length?`<h3>Reading the evidence</h3>${n.evidence_notes.map(note=>`<article class="evidence-note"><span class="eyebrow">${esc(note.status)}</span><p>${esc(note.summary)}</p>${note.excerpt?`<blockquote>${esc(note.excerpt)}</blockquote>`:''}<a href="${esc(S[note.source].url)}" target="_blank" rel="noopener">${esc(note.locator)} ↗</a></article>`).join('')}`:''}${images.length?`<h3>More images / reference plates</h3>${images.map(imageCard).join('')}`:''}`;
}
function openPhoto(id){const im=D.images.find(im=>im.id===id);if(!im)return;Tree.hide();$('photo-content').innerHTML=`<img loading="lazy" decoding="async" src="${photoSrc(im)}" alt="${esc(im.caption)}"><p>${esc(im.caption)}</p><p>${esc(im.credit)} · <a href="${im.license_url}">${esc(im.license)}</a> · <a href="${S[im.source].url}" target="_blank" rel="noopener">Source record ↗</a></p>`;$('photo-viewer').showModal();}
let selected='roman_spec', positions={}, currentNodes=[];
families.forEach(f=>$('family').insertAdjacentHTML('beforeend',`<option>${esc(f)}</option>`));
lineages.forEach(f=>$('lineage').insertAdjacentHTML('beforeend',`<option>${esc(f)}</option>`));
const stats=()=>{document.querySelectorAll('.museum-legend').forEach(el=>el.hidden=!Museum.merged());$('stats').textContent=`${D.nodes.length} records${Museum.merged()?` + ${Museum.nodes().length} merged museum records`:''} · ${D.images.length} images · ${D.sources.length} sources`;};
const pool=()=>D.nodes.concat(Museum.nodes());
const allEdges=()=>D.edges.concat(Museum.edges());
const shownEdge=e=>$('comparisons').checked||!['functional comparison','museum bridge'].includes(e.kind);
// Selected-record line: everything reachable upstream (elders) or downstream (descendants) along
// the drawn links. Links run from the earlier to the later record and the graph is acyclic.
let trace=null,retain=null;
function lineage(id){
 const edges=allEdges().filter(shownEdge),up=new Set(),down=new Set(),used=new Set();
 const walk=(seen,next)=>{const q=[id];while(q.length){const x=q.shift();for(const e of edges){const [from,to]=next(e);if(from!==x)continue;used.add(e.id);if(!seen.has(to)){seen.add(to);q.push(to);}}}};
 walk(up,e=>[e.target,e.source]);walk(down,e=>[e.source,e.target]);
 return {up,down,edges:used,all:new Set([id,...up,...down])};
}
function applyTrace(){
 const L=trace&&N[trace]?lineage(trace):null,g=$('graph');
 g.querySelectorAll('[data-node]').forEach(el=>{
  (el.closest('.witness')||el).classList.toggle('dim',!!L&&!L.all.has(el.dataset.node));
  el.setAttribute('aria-pressed',String(el.dataset.node===trace));
 });
 g.querySelectorAll('[data-edge]').forEach(el=>{el.classList.toggle('dim',!!L&&!L.edges.has(el.dataset.edge));el.classList.toggle('traced',!!L&&L.edges.has(el.dataset.edge));});
 g.querySelectorAll('[data-group]').forEach(el=>el.classList.toggle('dim',!!L&&!currentNodes.some(n=>n.lineage===el.dataset.group&&L.all.has(n.id))));
 Tree.markSelection(trace);
 $('lineage-deselect').disabled=!L&&!retain;
 $('lineage-select').disabled=!!L||!currentNodes.length;
 $('selection-hint').hidden=!!L||!!retain;
 const b=$('lineage-bar');
 if(!L&&!retain){b.hidden=true;return;}
 const name=id=>`<strong>${esc(N[id].label)}</strong>`;
 b.hidden=false;
 const shown=L?[...L.all].filter(id=>currentNodes.some(n=>n.id===id)).length:0;
 b.innerHTML=`<div class="selection-summary"><span class="selection-label">${retain?'Isolated lineage':'Selected lineage'}</span>${L?`<span>Line of ${name(trace)}</span><small>${L.up.size} elder${L.up.size===1?'':'s'} · ${L.down.size} descendant${L.down.size===1?'':'s'} · ${shown} of ${L.all.size} linked records visible</small>`:`<span>Line of ${name(retain.id)} (${retain.size} records)</span>`}</div><span class="lineage-actions">${L&&(!retain||retain.id!==trace)&&L.all.size>1?'<button data-lineage="only">Show only this line</button>':''}${retain?'<button data-lineage="all">Show all records</button>':''}</span>`;
}
function setTrace(id){trace=id;applyTrace();}
function deselectLineage(){
 const isolated=!!retain;
 trace=null;retain=null;Tree.hide();$('map').classList.remove('detail-open');
 if(isolated){graph();catalog();}else applyTrace();
}
function retainLine(on){
 retain=on&&trace?{id:trace,ids:lineage(trace).all,size:lineage(trace).all.size}:null;
 stats();graph();catalog();
 if(retain&&$('view').value==='family')requestAnimationFrame(()=>$('tree-overview').click());
}
function visible(){
 const q=$('search').value.trim().toLowerCase(), from=$('from-year').value, to=$('to-year').value;
 const valid=(!from||Number.isInteger(+from)&&+from!==0)&&(!to||Number.isInteger(+to)&&+to!==0)&&(!from||!to||+from<=+to);
 if(!valid){$('filter-status').textContent='Use whole calendar years without zero, with From no later than To.';return [];}
 const all=pool(), ns=all.filter(n=>
  ($('knowledge').checked||n.family!=='Knowledge transfer')&&
  ($('family').value==='all'||n.family===$('family').value)&&
  ($('lineage').value==='all'||n.lineage===$('lineage').value)&&
  (!retain||retain.ids.has(n.id))&&
  ($('evidence').value==='all'||n.evidence===$('evidence').value||$('evidence').value==='type'&&n.evidence.includes('type'))&&
  (n.date_start===null?$('undated').checked:(!from||n.date_end>=+from)&&(!to||n.date_start<=+to))&&
  `${n.label} ${n.lineage} ${n.context} ${n.material} ${n.accession} ${n.features} ${n.caveat} ${n.date_basis} ${JSON.stringify(n.evidence_notes)} ${JSON.stringify(n.comparison)}`.toLowerCase().includes(q));
 $('filter-status').textContent=`${ns.length} of ${all.length} records shown · ${ns.filter(n=>n.date_start===null).length} undated · ${$('knowledge').checked?'book branch included':'book branch hidden'}${Museum.merged()?` · Museum layer merged (${ns.filter(n=>n.museum).length} shown; dashed outline)`:''}${retain?` · only the line of ${N[retain.id].label}`:''}.`;
 return ns;
}
function detail(id){
 selected=id;const n=N[id],ee=allEdges().filter(e=>e.source===id||e.target===id);
 if(n.museum){$('detail').innerHTML=`<button class="detail-close" aria-label="Close pinned details" onclick="document.getElementById('map').classList.remove('detail-open')">Close ×</button><div class="eyebrow">${esc(n.lineage)} · museum layer</div><h2>${esc(n.label)}</h2><span class="date-prominent">${date(n)}</span><p class="date-basis">${esc(n.date_basis)}</p><div class="detail-actions">${Comparison.button(id)} <button data-open-compare>Open comparison</button></div><div class="warning">${esc(n.caveat)}</div>${Museum.block(n)}`;return;}
 $('detail').innerHTML=`<button class="detail-close" aria-label="Close pinned details" onclick="document.getElementById('map').classList.remove('detail-open')">Close ×</button><div class="eyebrow">${esc(n.lineage)}</div><h2>${esc(n.label)}</h2><span class="date-prominent">${date(n)}</span><p class="date-basis">${esc(n.date_basis)}</p><span class="badge">${esc(n.evidence)}</span>${photoFor(id)?imageCard(photoFor(id)):''}<div class="detail-actions">${Comparison.button(id)} <button data-open-compare>Open comparison</button></div><h3>Design</h3><p>${esc(n.features)}</p><div class="warning">${esc(n.caveat)}</div>${n.date_claims.length?'<h3>Other date claims in the source</h3><ul class="date-claims">'+n.date_claims.map(c=>`<li>${esc(c.label)}: ${esc(c.precision||String(c.start))}</li>`).join('')+'</ul>':''}<dl><dt>Context / maker</dt><dd>${esc(n.context)}</dd><dt>Material / medium</dt><dd>${esc(n.material)}</dd><dt>Accession / catalog</dt><dd>${esc(n.accession||'Individual accession unresolved')}</dd>${n.excavation_year?`<dt>Excavation year</dt><dd>${n.excavation_year}</dd>`:''}</dl><p class="date-basis">${esc(n.dating_note)} Excavation dates are separate; this record has ${n.excavation_year?'a curated excavation date':'no curated object excavation year'}.</p>${researchNotes(n)}<h3>Sources</h3><p>${refs(n.sources)}</p>${ee.length?'<h3>Related records</h3>'+ee.map(e=>`<details><summary>${esc(N[e.source===id?e.target:e.source].label)}${e.museum?' · museum record':''}</summary>${e.museum?`<p><button class="record-link" data-museum-goto="${e.source===id?e.target:e.source}">Open this museum record</button></p>`:''}<p><strong>${esc(e.kind)}</strong></p><p>${esc(e.claim)}</p><p>${esc(e.missing_evidence)}</p><p>${refs(e.sources)}</p></details>`).join(''):'<p>No later relationship curated yet. An empty branch is a research gap.</p>'}`;
}
function bindNodes(){
 $('graph').querySelectorAll('[data-node]').forEach(el=>{
  const click=()=>{const scroll=$('graph').scrollTop;trace=el.dataset.node;detail(el.dataset.node);graph();$('graph').scrollTop=scroll;const replacement=$('graph').querySelector(`[data-node="${el.dataset.node}"]`);replacement?.focus({preventScroll:true});};
  el.addEventListener('click',click);
  if(el.tagName.toLowerCase()!=='button')el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();click();}});
 });
}
function evolution(){
 $('graph-note').textContent='Dated witnesses by tool type. Read the date and its basis together. Sequence order is not proven descent; overlapping intervals cannot establish priority. Click a tool for sources and comparisons.';
 $('graph').innerHTML=lineages.map(lineage=>{
  const ns=currentNodes.filter(n=>n.lineage===lineage).sort(byDate);if(!ns.length)return '';
  let end=null,undated=false;
  const cards=ns.map(n=>{
   let gap='';
   if(n.date_start===null&&!undated){undated=true;gap='<p class="undated-label">UNDATED TYPE EVIDENCE · NOT PLACED ON THE TIME AXIS</p>';}
   else if(n.date_start!==null&&end!==null&&n.date_start>end+100)gap=`<div class="sequence-gap">No witness in this filtered sequence between ${year(end)} and ${year(n.date_start)}. Coverage gap; persistence or change is unresolved.</div>`;
   if(n.date_end!==null)end=Math.max(end??-Infinity,n.date_end);
   return gap+`<article class="witness ${n.id===selected?'selected':''}"><div class="witness-date">${date(n)}<small>${esc(n.date_kind)}</small></div><div class="witness-content"><button data-node="${n.id}" aria-label="${esc(n.label+', '+date(n))}">${esc(n.label)}</button><div><span class="badge">${esc(n.evidence)}</span>${n.date_claims.length?'<span class="badge">Additional date claims</span>':''}</div><p>${esc(n.features)}</p><p class="date-basis">${esc(n.context)} · ${esc(n.material)}</p><div class="citation">${refs(n.sources)}</div></div></article>`;
  }).join('');
  return `<section class="sequence"><h3>${esc(lineage)}</h3><p class="sequence-note">${ns.length} witnesses in this selection · comparisons can branch and overlap</p>${cards}</section>`;
 }).join('')||'<p class="empty">No records match these filters.</p>';
 bindNodes();
}
function graph(){ const isTree=$('view').value==='family';$('map').classList.toggle('tree-mode',isTree);$('tree-controls').hidden=!isTree;$('tree-sidebar').hidden=!isTree;$('map-title').textContent={family:'Family tree',evolution:'Dated list',time:'Evidence timeline'}[$('view').value];$('map-subtitle').textContent=isTree?'Explore instruments and the evidence connecting them.':'Inspect dated witnesses, source intervals, and linked records.';Tree.hide();if(!isTree)Tree.suspend(); $("event-ribbon").hidden=!$("overlays").checked||$("view").value==="time"; $("event-ribbon").innerHTML=D.events.map(e=>`<article title="${esc(e.note)}"><strong>${esc(e.label)}</strong>${date(e)} · ${esc(e.kind)}</article>`).join("");currentNodes=visible();$('comparisons').disabled=$('view').value==='evolution';document.querySelector('.legend').hidden=$('view').value==='evolution';$('svg-export').disabled=$('view').value==='evolution';$('svg-export').title=$('view').value==='evolution'?'Choose Family map or Evidence timeline to export SVG':'';if(isTree){Tree.render(currentNodes);applyTrace();return;}if($('view').value==='evolution'){evolution();applyTrace();return;}positions={};const time=$('view').value==='time', w=time?1750:1580, left=time?370:25;let y=time?210:110, parts=[];
const theme=getComputedStyle(document.documentElement), color=k=>theme.getPropertyValue('--'+k).trim();
const ink=color('ink'),muted=color('muted'),border=color('border'),accent=color('accent'),textcolor=color('textual'),wash=color('wash'),panel=color('panel'),bronze=color('bronze'),eventcolor=color('event');
if(time)currentNodes=currentNodes.filter(n=>n.date_start!==null);
const x=yr=>left+((yr<0?yr:yr-1)+100)/2080*(w-left-45);
if(time){for(const yr of [-100,1,500,1000,1500,1800,2000]){parts.push(`<line x1="${x(yr)}" y1="180" x2="${x(yr)}" y2="__HEIGHT__" stroke="${border}"/><text x="${x(yr)}" y="172" font-size="12">${year(yr)}</text>`);}if($('overlays').checked)D.events.forEach((ev,i)=>{const xx=x(ev.date_start), yy=25+(i%4)*31;parts.push(`<g><title>${esc(ev.note)}</title><rect x="${xx}" y="180" width="${Math.max(2,x(ev.date_end)-xx)}" height="__OVERLAYHEIGHT__" fill="${eventcolor}" opacity=".35"/><text x="${Math.min(xx,w-260)}" y="${yy}" font-size="12" fill="${muted}">${esc(ev.label)}</text><line x1="${xx}" y1="${yy+6}" x2="${xx}" y2="180" stroke="${border}"/></g>`);});
 currentNodes.sort(byDate).forEach(n=>{positions[n.id]={x:x(n.date_start),y:y,w:Math.max(7,x(n.date_end)-x(n.date_start)),h:25};parts.push(`<text x="15" y="${y+18}" font-size="13">${esc(n.label)}</text>`);y+=45;});
}
const shown=new Set(currentNodes.map(n=>n.id));allEdges().filter(e=>shown.has(e.source)&&shown.has(e.target)&&shownEdge(e)).forEach(e=>{const a=positions[e.source],b=positions[e.target], ax=a.x+a.w,ay=a.y+a.h/2,bx=(!time&&a.x===b.x)?b.x+b.w:b.x,by=b.y+b.h/2, solid=e.kind==='documented transmission'; const curve=(!time&&a.x===b.x)?`M ${ax} ${ay} C ${ax+55} ${ay}, ${bx+55} ${by}, ${bx} ${by}`:`M ${ax} ${ay} C ${ax+75} ${ay}, ${bx-75} ${by}, ${bx} ${by}`;parts.push(`<path data-edge="${esc(e.id)}" d="${curve}" fill="none" stroke="${solid?textcolor:muted}" stroke-width="1.6" ${solid?'':'stroke-dasharray="6 6"'} opacity=".7"><title>${esc(e.kind+': '+e.claim)}</title></path>`);});
currentNodes.forEach(n=>{const p=positions[n.id],color=['text','illustration'].includes(n.evidence)?textcolor:accent;parts.push(`<g tabindex="0" role="button" data-node="${n.id}" aria-label="${esc(n.label+', '+date(n))}" style="cursor:pointer"><title>${esc(n.label+' • '+date(n)+' • '+n.date_basis)}</title><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${time?3:8}" fill="${time?wash:panel}" stroke="${selected===n.id?bronze:color}" stroke-width="${selected===n.id?3:1.2}"/>${time?`<text x="${Math.min(p.x+p.w+9,w-170)}" y="${p.y+18}" font-size="11" fill="${muted}">${date(n)}</text>`:`<text x="${p.x+12}" y="${p.y+22}" font-size="14" font-weight="600">${esc(n.label)}</text><text x="${p.x+12}" y="${p.y+43}" font-size="11" fill="${muted}">${date(n)} · ${esc(n.evidence)}</text>`}</g>`);});
const h=y+35;$('graph-note').textContent=time?'Linear calendar axis. Bars show object/context or publication intervals, not invention dates. Undated types have no bar; inspect them in Dated tool sequences or the catalog.':'Grouped witness stages, not a time scale. Dashed links propose shared functions; intermediate evidence is missing. Scroll to explore every family.';
$('graph').innerHTML=currentNodes.length?`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="svg-title" font-family="system-ui,sans-serif" fill="${ink}"><title id="svg-title">Roman surgical instrument relationships; exploratory evidence graph</title><rect width="100%" height="100%" fill="${panel}"/>${parts.join('').replaceAll('__HEIGHT__',h).replaceAll('__OVERLAYHEIGHT__',h-180)}</svg>`:'<p class="empty">No records match these filters.</p>';
bindNodes();applyTrace();}
function catalog(){const ns=visible().sort(byDate);$('catalog-note').textContent=`${ns.length} filtered records, ordered by the lower bound of each date range; undated entries last. Overlapping intervals cannot establish a strict earliest order. Dates never mean invention.`;$('rows').innerHTML=ns.map(n=>`<tr><td><button data-id="${n.id}">${esc(n.label)}</button><br>${esc(n.lineage)}<br>${n.roman?'Roman':'Later'}<br>${esc(n.accession)}</td><td><strong>${date(n)}</strong><br>${esc(n.date_basis)}${n.date_claims.length?'<br>Additional date claims: inspect record':''}</td><td>${esc(n.context)}<br>${esc(n.material)}<p>${esc(n.features)}</p></td><td><span class="badge">${esc(n.evidence)}</span><br>${esc(n.caveat)}</td><td>${refs(n.sources)}</td></tr>`).join('');$('rows').querySelectorAll('button').forEach(b=>b.onclick=()=>{tab('map');detail(b.dataset.id);graph();if($('view').value==='family'){Tree.select(b.dataset.id);Tree.focus(N[b.dataset.id].lineage);}});}
function tab(t,remember=true){if(!document.getElementById(t))return;if(remember&&location.hash.split('/')[0]!=='#'+t)history.pushState(null,'','#'+t);Tree.hide();if(t!=='world')World.stop();if(t==='map'&&$('view').value==='family')requestAnimationFrame(()=>Tree.focus($('tree-branch').value));for(const s of ['map','world','compare','research','study','boundaries','weiss','museum','catalog','events','sources','method','morph'])$(s).hidden=s!==t;document.querySelectorAll('[data-tab]').forEach(b=>{b.removeAttribute('aria-selected');if(b.dataset.tab===t)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('filters').hidden=!['map','catalog'].includes(t);$('view').disabled=t==='catalog';$('date-help').hidden=$('filter-status').hidden=!['map','catalog'].includes(t);$('svg-export').disabled=t==='catalog'||$('view').value==='evolution';navState(t);window.dispatchEvent(new CustomEvent('vestigium:navigate',{detail:t}));requestAnimationFrame(()=>window.scrollTo(0,0));if(t==='morph'&&typeof Morph!=='undefined'){if(!Morph.store()&&window.VestigiumLoadMorph){$('m-status').textContent='Loading shape space…';window.VestigiumLoadMorph().then(()=>{if(!$('morph').hidden)Morph.show()}).catch(e=>{$('m-status').textContent=e.message+'. Reopen Morphology to retry.'})}else Morph.show();}}
function closeMenus(){document.querySelectorAll('.nav-menu').forEach(m=>m.hidden=true);document.querySelectorAll('.nav-trigger[aria-haspopup]').forEach(b=>b.setAttribute('aria-expanded','false'));}
function navState(t){closeMenus();document.querySelectorAll('.nav-group').forEach(g=>g.classList.toggle('current',!!g.querySelector(`[data-tab="${t}"]`)));}
document.querySelectorAll('.nav-trigger[aria-haspopup]').forEach(b=>b.onclick=e=>{e.stopPropagation();const m=b.nextElementSibling,open=m.hidden;closeMenus();m.hidden=!open;b.setAttribute('aria-expanded',String(open));if(open)m.querySelector('button')?.focus();});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-group'))closeMenus();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){const open=document.querySelector('.nav-trigger[aria-expanded="true"]');closeMenus();open?.focus();}});
const mEl=document.getElementById('morph-data');if(mEl&&mEl.textContent.trim()!=='null'&&typeof Morph!=='undefined'){Morph.init(JSON.parse(mEl.textContent));}else{const nm=document.getElementById('nav-morph');if(nm&&!window.VestigiumLoadMorph)nm.hidden=true;}
function download(name,type,body){const u=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
$('event-grid').innerHTML=D.events.map(e=>`<article class="panel event-card"><div class="eyebrow">${esc(e.kind)}</div><h3>${esc(e.label)}</h3><span class="badge">${date(e)}</span><p>${esc(e.region)}</p><p>${esc(e.note)}</p><p class="warning">${esc(e.effect)}</p><p>${e.sources.length?refs(e.sources):'Analyst-defined research window; no historical effect assigned.'}</p></article>`).join('');
$('image-gallery').innerHTML=D.images.map(imageCard).join('');
$('source-grid').innerHTML=D.sources.map(s=>`<article class="source-card panel"><span class="badge">${esc(s.kind)}</span><h3><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a></h3><p>${esc(s.locator)}</p><p>${esc(s.note)}</p><p>Consulted ${s.accessed}</p></article>`).join('');
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));for(const id of ['family','lineage','evidence','from-year','to-year','undated','knowledge','search','view','comparisons','overlays','merge-museum'])$(id).addEventListener(['search','from-year','to-year'].includes(id)?'input':'change',()=>{stats();const ns=visible();if(trace&&!ns.some(n=>n.id===trace)){trace=null;$('map').classList.remove('detail-open');}if(ns.length&&!ns.some(n=>n.id===selected))detail(ns[0].id);if(!ns.length)$('detail').innerHTML='<p>No matching evidence. Adjust the filters to inspect a tool.</p>';graph();catalog();});
$('svg-export').onclick=()=>{if($('view').value==='family'){const body=Tree.exportSvg();if(body)download('vestigium_family_tree.svg','image/svg+xml',body);return;}const svg=$('graph').querySelector('svg');if(svg)download('vestigium_timeline.svg','image/svg+xml',new XMLSerializer().serializeToString(svg));};
$('json-export').onclick=async()=>{try{await Museum.ensureOther();download('vestigium_research_catalog.json','application/json',JSON.stringify(D,null,2));}catch(e){$('filter-status').textContent=e.message+'. Retry export.';}};   // morphology data is exported separately (results/tables)
$('csv-export').onclick=()=>{const cols=['id','label','family','lineage','date_start','date_end','date_kind','date_basis','date_claims','features','evidence_notes','witness_history','context','material','evidence','roman','accession','caveat','sources'];const cell=v=>'"'+String(Array.isArray(v)?JSON.stringify(v):v??'').replaceAll('"','""')+'"';download('vestigium_research_catalog.csv','text/csv',[cols.join(','),...visible().map(n=>cols.map(c=>cell(c==='sources'?n.sources.map(id=>S[id].url).join(' | '):n[c])).join(','))].join('\r\n'));};
Research.init();Study.init();Boundaries.init();Weiss.init();Comparison.init();Tree.init();Museum.init();World.init();stats();detail(selected);graph();catalog();
$('lineage-bar').addEventListener('click',e=>{const a=e.target.closest('[data-lineage]')?.dataset.lineage;if(a==='only')retainLine(true);if(a==='all')retainLine(false);});
$('lineage-select').onclick=()=>{
 const candidates=$('view').value==='family'?currentNodes.filter(n=>n.lineage===$('tree-branch').value):currentNodes;
 const id=candidates.some(n=>n.id===selected)?selected:candidates[0]?.id;
 if(id){if($('view').value==='family')Tree.select(id);else{detail(id);setTrace(id);}}
};
$('lineage-deselect').onclick=deselectLineage;
$('graph').addEventListener('contextmenu',e=>{e.preventDefault();deselectLineage();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('photo-viewer').open&&(trace||retain))deselectLineage();});
$('photo-close').onclick=()=>$('photo-viewer').close();
$('photo-viewer').addEventListener('click',e=>{if(e.target===$('photo-viewer'))$('photo-viewer').close();});
document.addEventListener('click',e=>{const photo=e.target.closest('[data-photo]');if(photo)openPhoto(photo.dataset.photo);if(e.target.closest('[data-open-compare]')){tab('compare');Tree.hide();}});

function routeAtlas(){
 const [name,detailId]=(location.hash.slice(1)||'map').split('/');
 const tabs=['map','world','compare','research','study','boundaries','weiss','museum','catalog','events','sources','method','morph'];
 const t=tabs.includes(name)?name:'map';tab(t,false);
 if(t==='morph'&&detailId)Morph.setView(detailId);
 if(t==='weiss'&&detailId&&D.weiss_study.relations.some(r=>r.id===detailId))Weiss.select(detailId);
}
window.addEventListener('hashchange',routeAtlas);routeAtlas();
