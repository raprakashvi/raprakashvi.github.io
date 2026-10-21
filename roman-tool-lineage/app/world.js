'use strict';
// Offline geography: city associations and complete primary date intervals, never inferred routes.
const World=(()=>{
 let G, timer=null, city=null, active=[], groups=[];
 const mapBackgrounds=new Map();
 const roles=['Archaeological context','Curated maker / supplier','Printed witness','Museum maker / supplier'];
 const role=r=>r.cohort==='museum'?3:r.locations[0]?.role==='archaeological context'?0:r.locations[0]?.role==='publication location'?2:1;
 const extents={world:[-180,180,-60,85],europe:[-13,38,32,62],netherlands:[2,8,50.4,54]};
 const periods=()=>G.periods;
 const period=()=>periods()[+$('world-time').value];
 const dated=r=>r.date_start!==null;
 const earlier=r=>dated(r)&&r.date_end<period().start;
 const category=r=>$('world-color').value==='type'?r.lineage:$('world-color').value==='family'?r.family:roles[role(r)];
 const palette=()=>G.palette[$('world-color').value];
 const categoryColor=r=>palette()[category(r)]||'var(--muted)';
 function filtered(){
  return G.records.filter(r=>($('world-cohort').value==='all'||r.cohort===$('world-cohort').value)&&
   ($('world-lineage').value==='all'||r.lineage===$('world-lineage').value)&&
   ($('world-design').value==='all'||r.designs.includes($('world-design').value)));
 }
 function inTime(r){
  if(!dated(r))return false;
  const p=period();
  if($('world-mode').value==='by_end')return r.date_end<=p.end;
  return r.date_start<=p.end&&r.date_end>=p.start||$('world-persist').checked&&earlier(r);
 }
 function group(records){
  const by=new Map();
  for(const r of records)for(const loc of r.locations){
   if(!by.has(loc.place))by.set(loc.place,{key:loc.place,records:[],counts:new Map()});
   const g=by.get(loc.place),key=category(r);g.records.push(r);
   if(!g.counts.has(key))g.counts.set(key,{current:0,past:0});
   g.counts.get(key)[earlier(r)?'past':'current']++;
  }
  return [...by.values()].sort((a,b)=>b.records.length-a.records.length||a.key.localeCompare(b.key));
 }
 function map(target,extent,width,height){
  const [left,right,bottom,top]=extent,pad=18;
  const scale=Math.min((width-pad*2)/(right-left),(height-pad*2)/(top-bottom));
  const ox=(width-(right-left)*scale)/2,oy=(height-(top-bottom)*scale)/2;
  const project=([lon,lat])=>[ox+(lon-left)*scale,oy+(top-lat)*scale];
  const key=target==='world-overview'?'world':$('world-region').value;
  if(!mapBackgrounds.has(key))mapBackgrounds.set(key,G.land.map(poly=>`<path d="${poly.map(ring=>ring.map((p,i)=>{const [x,y]=project(p);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join('')+'Z').join('')}"/>`).join(''));
  const path=mapBackgrounds.get(key);
  const graticule=[];
  const grid=extent===extents.world?30:extent===extents.netherlands?1:10;
  const [bx0,by0]=project([-180,85]),[bx1,by1]=project([180,-60]);
  for(let lon=-180;lon<=180;lon+=grid){const [x]=project([lon,0]);graticule.push(`<path d="M${x} ${by0}V${by1}"/>`);}
  for(let lat=-60;lat<=85;lat+=grid){const [,y]=project([0,lat]);graticule.push(`<path d="M${bx0} ${y}H${bx1}"/>`);}
  const markers=[];
  // Draw largest first so a smaller neighboring city keeps an accessible hit target.
  for(const g of groups){
   const p=G.places[g.key];
   const [x,y]=project([+p.longitude,+p.latitude]),n=g.records.length,r=MapCamera.radius(n);
   const past=g.records.filter(earlier).length;
   let start=-Math.PI/2;
   const sectors=Object.keys(palette()).map(label=>{
    const counts=g.counts.get(label);if(!counts)return '';
    return ['past','current'].map(era=>{
     const count=counts[era];if(!count)return '';
     const end=start+count/n*Math.PI*2,attrs=`fill="${palette()[label]}" class="geo-sector geo-sector-${era}" data-category="${esc(label)}"`;
     const part=count===n?`<circle r="${r}" ${attrs}/>`:`<path d="M0 0L${r*Math.cos(start)} ${r*Math.sin(start)}A${r} ${r} 0 ${end-start>Math.PI?1:0} 1 ${r*Math.cos(end)} ${r*Math.sin(end)}Z" ${attrs}/>`;
     start=end;return part;
    }).join('');
   }).join('');
   const breakdown=[...g.counts].map(([label,c])=>`\n${label}: ${c.current+c.past} (${c.current} period, ${c.past} earlier)`).join('');
   markers.push(`<g class="geo-marker${past===n?' geo-only-past':''}" data-city="${g.key}" data-map-x="${x}" data-map-y="${y}" data-radius="${r}" data-current="${n-past}" data-past="${past}" role="button" tabindex="0" aria-pressed="${city===g.key}" aria-label="${esc(p.label)}: ${n-past} period records, ${past} earlier records"><title>${esc(p.label)} · ${n} records${esc(breakdown)}\nApproximate city/area locator</title><g class="geo-symbol"><circle class="geo-hit" r="${Math.max(12,r+3)}" fill="transparent"/>${sectors}<circle class="geo-outline" r="${r}"/>${n>=4?`<text class="geo-count" y="4.5" text-anchor="middle">${n}</text>`:''}<text class="geo-place-label" x="${r+8}" y="4.5">${esc(p.label)}</text></g></g>`);
  }
  const name=target==='world-overview'?'World':'Regional';
  $(target).classList.add('geo-map');
  $(target).innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" tabindex="0" role="group" aria-label="${name} map, ${esc(period().label)}. Drag to pan, scroll or pinch to zoom; plus, minus, arrows, and zero work with map focus."><defs><clipPath id="clip-${target}"><rect width="${width}" height="${height}"/></clipPath><clipPath id="land-${target}"><rect x="${bx0}" y="${by0}" width="${bx1-bx0}" height="${by1-by0}"/></clipPath></defs><g clip-path="url(#clip-${target})"><g class="geo-scene"><g clip-path="url(#land-${target})"><g class="geo-grid">${graticule.join('')}</g><g class="geo-land">${path}</g></g></g><g class="geo-markers">${markers.join('')}</g></g><text x="${width/2}" y="${height/2}" text-anchor="middle" class="geo-empty geo-map-empty">${groups.length?'Pan or reset to see mapped places':'No eligible city locations for these filters'}</text></svg><div class="geo-map-actions" role="group" aria-label="${name} map navigation"><button data-map-action="in" aria-label="Zoom in ${name.toLowerCase()} map">+</button><button data-map-action="out" aria-label="Zoom out ${name.toLowerCase()} map">−</button><output data-map-scale aria-label="${name} map zoom">1×</output><button data-map-action="reset" aria-label="Reset ${name.toLowerCase()} map">Reset</button></div>`;
  MapCamera.attach(target,{width,height,bounds:[bx0,bx1,by0,by1],key});
 }
 function recordCard(r,unplaced=false){
  const locs=r.locations.map(l=>`${G.places[l.place].label} · ${l.role}`).join('; ');
  return `<article class="geo-record${earlier(r)?' geo-record-past':''}"><div class="eyebrow"><i class="geo-category-dot" style="background:${categoryColor(r)}" aria-hidden="true"></i>${esc(r.cohort==='museum'?'Museum catalog':r.evidence)} · ${esc(r.lineage)}</div><strong>${esc(r.label)}</strong><span class="geo-record-date">${date(r)}</span> <span class="geo-record-era">${!dated(r)?'Undated':earlier(r)?'Earlier witness':'Period witness'}</span><p>${esc(r.date_basis)}</p>${locs?`<p>${esc(locs)}</p>`:''}${r.mapping_status==='partial city coverage'?'<p class="warning">Some listed makers have no usable city; only explicit cities are mapped.</p>':''}${unplaced?`<p class="warning">${esc(r.context)}<br>${esc(r.unresolved.map(u=>u.reason).join(' '))}</p>`:''}<details><summary>Location evidence &amp; precision</summary>${r.locations.map(l=>`<p>${esc(l.note)} ${esc(l.catalog_names.join('; '))}<br>${esc(G.places[l.place].coordinate_note)} <a href="${esc(G.places[l.place].coordinate_source)}" target="_blank" rel="noopener">Coordinate source ↗</a></p>`).join('')||'<p>No city assigned.</p>'}</details><a href="${esc(r.source_url)}" target="_blank" rel="noopener">Original source ↗</a> · <button class="record-link" ${r.cohort==='museum'?'data-museum-goto':'data-world-record'}="${r.id}">Full atlas record</button></article>`;
 }
 function legend(){
  const counts=new Map();
  for(const r of active.filter(r=>r.locations.length)){
   const key=category(r);if(!counts.has(key))counts.set(key,{current:0,past:0});
   counts.get(key)[earlier(r)?'past':'current']++;
  }
  $('world-color-title').textContent={type:'Tool types',family:'Task families',role:'Evidence roles'}[$('world-color').value];
  $('world-color-legend').innerHTML=Object.entries(palette()).filter(([key])=>counts.has(key)).map(([key,color])=>{
   const c=counts.get(key);
   return `<div class="world-legend-item" data-legend-category="${esc(key)}" data-color="${color}"><i style="background:${color}" aria-hidden="true"></i><span>${esc(key)}<small>${c.current} period${c.past?` · ${c.past} earlier`:''}</small></span><strong>${c.current+c.past}</strong></div>`;
  }).join('')||'<p class="filter-help">No mapped categories match these filters.</p>';
 }
 function inspect(){
  $('world-clear-city').disabled=!city;
  $('world-cities').innerHTML=groups.map(g=>`<button data-city="${g.key}" aria-pressed="${city===g.key}"><span>${esc(G.places[g.key].label)}<small>${g.records.filter(r=>!earlier(r)).length} period · ${g.records.filter(earlier).length} earlier</small></span><strong>${g.records.length}</strong></button>`).join('')||'<p class="empty">No usable cities in this period. Inspect the unplaced records.</p>';
  const shown=city?groups.find(g=>g.key===city)?.records||[]:active.filter(r=>r.locations.length);
  $('world-record-title').textContent=city?G.places[city].label+' · '+shown.length+' records':'Mapped records · '+shown.length;
  $('world-records').innerHTML=shown.slice().sort(byDate).map(r=>recordCard(r)).join('')||'<p class="empty">No mapped records match this selection.</p>';
  const unplaced=active.filter(r=>!r.locations.length),undated=filtered().filter(r=>!dated(r));
  $('world-unplaced-count').textContent=`Retained off map: ${unplaced.length} dated records without a usable city · ${undated.length} undated records`;
  $('world-unplaced').innerHTML=unplaced.concat(undated).sort(byDate).map(r=>recordCard(r,true)).join('');
 }
 function render(){
  active=filtered().filter(inTime);groups=group(active);
  if(!groups.some(g=>g.key===city))city=null;
  const mapped=active.filter(r=>r.locations.length),unmapped=active.length-mapped.length,all=filtered();
  const stat=(n,label)=>`<div><strong>${n}</strong><span>${label}</span></div>`;
  $('world-period').textContent=period().label;
  $('world-time').setAttribute('aria-valuetext',period().label);
  $('world-prev').disabled=+$('world-time').value===0;$('world-next').disabled=+$('world-time').value===periods().length-1;
  $('world-stats').innerHTML=stat(active.length,'dated records eligible')+stat(mapped.length,'records mapped')+stat(mapped.filter(r=>!earlier(r)).length,'mapped in period')+stat(mapped.filter(earlier).length,'earlier mapped witnesses')+stat(groups.length,'city / area locators')+stat(unmapped,'dated records unplaced');
  const cumulative=$('world-mode').value==='by_end';
  $('world-persist').disabled=cumulative;
  $('world-persist-note').textContent=cumulative?'The selected time rule already includes earlier witnesses.':'Earlier dated records stay visible, faded and dashed.';
  $('world-time-note').textContent=cumulative?'Includes only records whose complete date interval ends by this period’s end. Faded records predate the period; display does not imply continued manufacture or use.':
   ($('world-persist').checked?'Includes this period plus all earlier fully dated witnesses. Older records remain faded and dashed; future records stay excluded. ':'')+'Periods have different durations. Overlap uses the full date interval; repeated appearances can reflect dating uncertainty.';
  map('world-overview',extents.world,900,420);
  map('world-detail-map',extents[$('world-region').value],600,420);
  legend();inspect();
 }
 function stop(){clearInterval(timer);timer=null;if($('world-play')){$('world-play').textContent='Play through time';$('world-play').setAttribute('aria-pressed','false');}}
 function step(delta){stop();$('world-time').value=Math.max(0,Math.min(periods().length-1,+$('world-time').value+delta));render();}
 function init(){
  G=D.geography;
  $('world-time').max=periods().length-1;
  $('world-era-labels').innerHTML=periods().map((p,i)=>`<span style="left:${i/(periods().length-1)*100}%">${p.start<0?`${-p.start} BCE`:i===periods().length-1?`${p.start}–${p.end}`:p.start}</span>`).join('');
  $('world-lineage').insertAdjacentHTML('beforeend',[...new Set(G.records.map(r=>r.lineage))].sort().map(l=>`<option>${esc(l)}</option>`).join(''));
  $('world-design').insertAdjacentHTML('beforeend',[...new Set(G.records.flatMap(r=>r.designs))].sort().map(k=>`<option value="${esc(k)}">${esc(k)}</option>`).join(''));
  for(const id of ['world-time','world-cohort','world-lineage','world-design','world-mode','world-region','world-color','world-persist'])$(id).addEventListener(id==='world-time'?'input':'change',()=>{stop();render();});
  $('world-prev').onclick=()=>step(-1);$('world-next').onclick=()=>step(1);$('world-clear-city').onclick=()=>{city=null;render();};
  $('world-play').onclick=()=>{
   if(timer){stop();return;}
   if(+$('world-time').value===periods().length-1)$('world-time').value=0;
   render();$('world-play').textContent='Pause';$('world-play').setAttribute('aria-pressed','true');
   timer=setInterval(()=>{if(+$('world-time').value===periods().length-1){stop();return;}$('world-time').value=+$('world-time').value+1;render();},1400);
  };
  $('world').addEventListener('click',e=>{
   const marker=e.target.closest('[data-city]');
   const mapHost=e.target.closest('.geo-map');
   if(marker&&(!mapHost||!MapCamera.ignoresClick(mapHost.id))){city=marker.dataset.city;render();}
   const rec=e.target.closest('[data-world-record]');
   if(rec){
    const r=G.records.find(r=>r.id===rec.dataset.worldRecord);
    for(const id of ['family','lineage','evidence'])$(id).value='all';
    for(const id of ['search','from-year','to-year'])$(id).value='';
    $('undated').checked=true;if(N[r.id].family==='Knowledge transfer')$('knowledge').checked=true;
    trace=null;retain=null;$('view').value='family';tab('map');graph();catalog();Tree.reveal(r.id);
   }
  });
  $('world').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('g[data-city]')){e.preventDefault();city=e.target.closest('[data-city]').dataset.city;render();}if(e.key==='Escape'){city=null;render();}});
  for(const id of ['world-overview','world-detail-map'])$(id).addEventListener('contextmenu',e=>{e.preventDefault();city=null;render();});
  $('world-export').onclick=()=>download('instrument_geography_register.json','application/json',JSON.stringify({records:filtered(),places:G.places,summary:G.summary,provenance:G.provenance,palette:G.palette,selected_period:period(),time_rule:$('world-mode').value,keep_earlier:$('world-persist').checked,color_by:$('world-color').value},null,2));
  const contrast=D.museum.summary.forceps_length_contrast?.date_mid;
  $('world-patterns').innerHTML=[
   ['Functional persistence','Roman contexts already contain cutting, probing, grasping and retraction tools. Eight Stanway records belong to one burial kit; counts do not represent eight independent sites.'],
   ['Branching configurations','Folding and detachable blades, rigid and flexible saws, bivalve and tubular specula, and distinct catheter functions form overlapping alternatives. Their witnesses do not establish a universal replacement sequence.'],
   ['Named designs across makers','Naegele-attributed forceps: 38 single objects, 14 makers, catalog dates 1825–1975 in the existing museum analysis. Matching attributions motivate a transfer question; the paths between workshops remain unproved.'],
   ['A measurable form change',contrast?`Obstetric forceps: median largest catalog dimension ${contrast.median_1700_1799} → ${contrast.median_1850_1899} cm (${contrast.n_1700_1799} vs ${contrast.n_1850_1899} measured records; midpoint groups). Difference ${contrast.difference_cm} cm; bootstrap 95% interval ${contrast.bootstrap_95.join('–')} cm. Protocol and collection bias limit interpretation.`:'See the museum analysis for size and lock-type contrasts.'],
   ['Interfaces and production knowledge','The inspected sources distinguish materials, working ends, joints, locking, fitment, manufacture and quality checks. These provide candidate dimensions of change beyond external shape.'],
   ['Geographic coverage is the first result',`${G.summary.cohorts.curated.dated_and_located}/${G.summary.cohorts.curated.records} curated records and ${G.summary.cohorts.museum.dated_and_located}/${G.summary.cohorts.museum.records} museum instruments/kits have explicit eligible city/area locators. The resulting map describes this evidence base, with substantial unplaced and unsampled geography.`]
  ].map(([title,body])=>`<article><h4>${esc(title)}</h4><p>${esc(body)}</p></article>`).join('');
  render();
 }
 return {init,render,stop};
})();
