'use strict';
// A deterministic branching layout and camera. No network or chart dependency.
// Hierarchy is a display scaffold; every historical link comes from D.edges.
const Tree = (() => {
  let svg, world, geometry, signature='', camera={x:0,y:0,k:1}, resizeObserver;
  let hideTimer, ignoreClickUntil=0, ignoreHoverUntil=0, fittedBounds=null;
  const points=new Map();
  const popup=()=>document.getElementById('tree-hover');
  const theme=()=>Object.fromEntries(['panel','paper','ink','muted','border','accent','bronze','wash','textual'].map(k=>[k,getComputedStyle(document.documentElement).getPropertyValue('--'+k).trim()]));

  function layout(nodes) {
    const result={nodes:{},groups:[],edges:[],rows:[],width:0,height:0};
    const shown=new Set(nodes.map(n=>n.id)),COLS=6,PITCH=305,LINE=260;
    const view=size(),aspect=view.w&&view.h?Math.max(1,view.w/view.h):1.8;
    let top=30;
    for(const name of lineages){
      const all=nodes.filter(n=>n.lineage===name);if(!all.length)continue;
      // Museum-layer records are laid out by thread (shared designer or maker), right of the curated witnesses.
      const ns=all.filter(n=>!n.museum);
      const threads=Museum.threads(name).map(t=>({...t,members:t.members.filter(id=>shown.has(id))})).filter(t=>t.members.length);
      const ids=new Set(ns.map(n=>n.id));
      const edges=D.edges.filter(e=>ids.has(e.source)&&ids.has(e.target));
      const incoming=Object.fromEntries(ns.map(n=>[n.id,edges.filter(e=>e.target===n.id)]));
      const outgoing=Object.fromEntries(ns.map(n=>[n.id,edges.filter(e=>e.source===n.id)]));
      const remaining=Object.fromEntries(ns.map(n=>[n.id,incoming[n.id].length]));
      const rank=Object.fromEntries(ns.map(n=>[n.id,0]));
      const queue=ns.filter(n=>remaining[n.id]===0).sort(byDate).map(n=>n.id);
      let visited=0;
      while(queue.length){
        const id=queue.shift();visited++;
        for(const e of outgoing[id]){
          rank[e.target]=Math.max(rank[e.target],rank[id]+1);
          if(--remaining[e.target]===0)queue.push(e.target);
        }
      }
      // Never silently discard cyclic relationships if a future curator adds one.
      if(visited!==ns.length)throw new Error('Tree layout requires acyclic comparisons: '+name);
      const children=Object.fromEntries(ns.map(n=>[n.id,[]])),roots=[];
      for(const n of ns){
        const parents=incoming[n.id].slice().sort((a,b)=>rank[b.source]-rank[a.source]);
        if(parents.length)children[parents[0].source].push(n.id);else roots.push(n.id);
      }
      let row=0;
      function place(id){
        const kids=children[id].sort((a,b)=>byDate(N[a],N[b]));
        const ys=kids.map(place);
        const y=ys.length?(ys[0]+ys[ys.length-1])/2:top+70+row++*260;
        result.nodes[id]={x:260+rank[id]*305,y,w:260,h:216};
        return y;
      }
      roots.sort((a,b)=>byDate(N[a],N[b])).forEach(place);
      // Threads are shelf-packed: short threads sit side by side, and the shelf width follows the
      // viewport's shape so a fitted branch stays legible instead of becoming a tall column.
      const x0=ns.length?260+(Math.max(0,...Object.values(rank))+1)*PITCH+90:260;
      const museumCount=threads.reduce((a,t)=>a+t.members.length,0);
      const cols=Math.max(COLS,Math.min(20,Math.round(Math.sqrt(museumCount*aspect*LINE/PITCH))));
      let line=0,shelf=0,cx=0;const rowsHere=[];
      for(const t of threads){
        const wide=Math.min(cols,t.members.length)*PITCH;
        if(cx&&cx+wide>cols*PITCH){line+=shelf;cx=shelf=0;}
        const x=x0+cx,y=top+70+line*LINE;
        t.members.forEach((id,i)=>{result.nodes[id]={x:x+(i%cols)*PITCH,y:y+Math.floor(i/cols)*LINE,w:260,h:216};});
        rowsHere.push({thread:t,x,y,w:wide-45,first:cx===0});
        cx+=wide+60;shelf=Math.max(shelf,Math.ceil(t.members.length/cols));
      }
      line+=shelf;
      result.rows.push(...rowsHere);
      const height=Math.max(330,Math.max(row,line)*LINE+110);
      const width=Math.max(560+Math.max(0,...Object.values(rank))*PITCH,...rowsHere.map(r=>r.x+r.w+40));
      const hub={x:25,y:top+Math.min(height/2,Math.max(row,1)*LINE/2+70)-45,w:200,h:90};
      // Branches with no curated witnesses link their hub to each chain; others link through bridges.
      const fan=ns.length?[]:rowsHere.filter(r=>r.first).map(r=>r.thread.members[0]);
      result.groups.push({name,x:8,y:top-15,w:width,h:height,hub,roots:roots.concat(fan),ids:all.map(n=>n.id),curated:ns.length,museum:museumCount,bridged:Museum.bridgedFrom(name)});
      result.edges.push(...edges);
      result.width=Math.max(result.width,width+30);top+=height+40;
    }
    result.edges.push(...Museum.edges().filter(e=>result.nodes[e.source]&&result.nodes[e.target]));
    result.height=top;return result;
  }

  function wrap(text,limit=26){
    const lines=[''];
    for(const word of text.split(' ')){
      const i=lines.length-1;
      if(lines[i]&&lines[i].length+word.length+1>limit)lines.push(word);
      else lines[i]+=(lines[i]?' ':'')+word;
    }
    return lines;
  }
  const curve=(a,b)=>`M ${a.x+a.w} ${a.y+a.h/2} C ${a.x+a.w+30} ${a.y+a.h/2}, ${b.x-30} ${b.y+b.h/2}, ${b.x} ${b.y+b.h/2}`;
  // Links that run backwards (thread wrap, cross-thread) are routed through the gap above the target card.
  const route=(a,b)=>b.x>=a.x+a.w+20?curve(a,b):`M ${a.x+a.w} ${a.y+a.h/2} h 18 V ${b.y-(b.y>a.y?32:-a.h-20)} H ${b.x-18} V ${b.y+b.h/2} H ${b.x}`;
  const edgeStyle=(e,c)=>({'documented transmission':[c.textual,2.2,''],'museum bridge':[c.accent,2.2,'7 5'],'shared design attribution':[c.bronze,2.8,''],'combined design attribution':[c.bronze,2.2,'2 5'],'same maker':[c.muted,1.5,'']}[e.kind]||[c.accent,2.2,'7 5']);
  function update(){
    if(!world)return;
    world.setAttribute('transform',`translate(${camera.x} ${camera.y}) scale(${camera.k})`);
    $('tree-scale').textContent=Math.round(camera.k*100)+'%';
  }
  function size(){return {w:$('graph').clientWidth,h:$('graph').clientHeight};}
  function fit(bounds){
    if(!svg||!bounds)return;
    fittedBounds=bounds;
    const {w,h}=size();
    camera.k=Math.max(.06,Math.min(1.25,(w-36)/bounds.w,(h-36)/bounds.h));
    camera.x=(w-bounds.w*camera.k)/2-bounds.x*camera.k;
    camera.y=(h-bounds.h*camera.k)/2-bounds.y*camera.k;
    hide();update();
  }
  function focus(name){
    const group=geometry?.groups.find(g=>g.name===name);
    if(group){$('tree-branch').value=name;markBranch(name);fit(group);}
  }
  function markBranch(name){
    $('tree-branches').querySelectorAll('[data-branch]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.branch===name)));
  }
  function zoom(factor,px,py){
    if(!svg)return;
    fittedBounds=null;
    const {w,h}=size();px??=w/2;py??=h/2;
    const k=Math.max(.06,Math.min(3,camera.k*factor)),ratio=k/camera.k;
    camera.x=px-(px-camera.x)*ratio;camera.y=py-(py-camera.y)*ratio;camera.k=k;
    hide();update();
  }
  function hide(){clearTimeout(hideTimer);popup().hidden=true;}
  function laterHide(){clearTimeout(hideTimer);hideTimer=setTimeout(hide,220);}
  function hover(el){
    if(points.size||performance.now()<Math.max(ignoreClickUntil,ignoreHoverUntil))return;
    clearTimeout(hideTimer);
    const id=el.dataset.node,edge=allEdges().find(e=>e.id===el.dataset.edge);
    let body;
    if(id){
      const n=N[id];
      const t=n.museum&&Museum.thread(id);
      const museumPhoto=(n.museum?.image_url||n.museum?.image_id)?`<img class="hover-museum-photo" src="${esc(Museum.photo(n))}" alt="${esc(n.label)}" onerror="this.remove()"><p class="hover-photo-credit">Photograph: ${esc(n.museum.institution||'Rijksmuseum Boerhaave, Leiden')}</p>${t?`<p class="hover-basis">${esc(Museum.threadText(t))}</p>`:''}`:'';
      body=`<div class="eyebrow">${esc(n.lineage)} · ${n.museum?'museum layer':esc(n.evidence)}</div><h3>${esc(n.label)}</h3>${museumPhoto}${photoFor(id)?`<button class="hover-photo photo-button" data-photo="${photoFor(id).id}" aria-label="Open photograph"><img src="${photoSrc(photoFor(id))}" alt="${esc(photoFor(id).caption)}"></button><p class="hover-photo-credit">${esc(photoFor(id).credit)} · <a href="${photoFor(id).license_url}">${esc(photoFor(id).license)}</a>${photoFor(id).relation==='reference objects'?' · Reference objects, not this specimen':''}</p>`:''}<strong class="hover-date">${date(n)}</strong><p class="hover-basis">${esc(n.date_basis)}</p><p>${esc(n.features)}</p><p class="hover-context">${esc(n.context)} · ${esc(n.material)}</p><p class="warning">${esc(n.caveat)}</p><div class="hover-sources">${refs(n.sources)}</div><div class="hover-actions"><button id="hover-pin">Full record</button>${Comparison.button(id)}</div>`;
    }else if(edge){
      body=`<div class="eyebrow">${esc(edge.kind)}</div><h3>${esc(N[edge.source].label)} ↔ ${esc(N[edge.target].label)}</h3><p>${esc(edge.claim)}</p>${edge.audit?`<p><strong>Evidence-date order:</strong> ${esc(edge.audit.primary_interval_relation)}.</p>${edge.audit.semantic_flag?`<p class="warning">${esc(edge.audit.semantic_flag)}</p>`:""}<p class="filter-help">${edge.audit.relation_scope==='documented book transmission'?'Book transmission; not tool adoption.':'Layout direction organizes comparisons; task matching and tool descent remain unvalidated.'}</p>`:""}${edge.museum?`<p class="hover-basis">Basis: ${esc(edge.basis)}</p>`:''}<p class="warning">${esc(edge.missing_evidence)}</p><div class="hover-sources">${refs(edge.sources)}</div>`;
    }else return;
    popup().innerHTML=body;popup().hidden=false;
    const rect=el.getBoundingClientRect(),box=popup().getBoundingClientRect();
    let left=rect.right+10;if(left+box.width>innerWidth-12)left=rect.left-box.width-10;
    popup().style.left=Math.max(12,Math.min(left,innerWidth-box.width-12))+'px';
    popup().style.top=Math.max(12,Math.min(rect.top,innerHeight-box.height-12))+'px';
    if(id)$('hover-pin').onclick=()=>select(id);
  }
  function reveal(id){
    const p=geometry?.nodes[id];if(!p){focus(N[id]?.lineage);return;}
    $('tree-branch').value=N[id].lineage;fit({x:p.x-420,y:p.y-260,w:p.w+840,h:p.h+520});select(id);
  }
  function select(id){
    // Docking changes hit targets under a stationary pointer; let that reflow finish before previews.
    ignoreHoverUntil=performance.now()+300;
    hide();detail(id);$('map').classList.add('detail-open');
    $('detail').scrollTop=0;$('detail').querySelector('.detail-close').focus({preventScroll:true});
    setTrace(id);
  }
  function markSelection(id){
    const c=theme();
    svg?.querySelectorAll('[data-node]').forEach(el=>{
      const active=el.dataset.node===id;el.setAttribute('aria-pressed',String(active));
      el.querySelector('rect').setAttribute('stroke',active?c.bronze:el.dataset.museum?c.textual:c.accent);
      el.querySelector('rect').setAttribute('stroke-width',active?'3':'1.4');
    });
  }
  function bind(){
    svg.addEventListener('wheel',e=>{
      e.preventDefault();const r=svg.getBoundingClientRect();
      const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?r.height:1);
      zoom(Math.exp(-dy*.0015),e.clientX-r.left,e.clientY-r.top);
    },{passive:false});
    svg.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      hide();points.set(e.pointerId,{x:e.clientX,y:e.clientY});
      e.target.setPointerCapture(e.pointerId);svg.classList.add('dragging');
    });
    svg.addEventListener('pointermove',e=>{
      if(!points.has(e.pointerId))return;
      fittedBounds=null;
      const before=[...points.values()],prev=points.get(e.pointerId);
      points.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(points.size===1){camera.x+=e.clientX-prev.x;camera.y+=e.clientY-prev.y;}
      else{
        const after=[...points.values()],mid=a=>({x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});
        const distance=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
        const b=mid(before),a=mid(after),r=svg.getBoundingClientRect();
        if(distance(before)>0)zoom(distance(after)/distance(before),b.x-r.left,b.y-r.top);
        camera.x+=a.x-b.x;camera.y+=a.y-b.y;
      }
      if(Math.hypot(e.clientX-prev.x,e.clientY-prev.y)>1)ignoreClickUntil=performance.now()+350;
      update();
    });
    const end=e=>{points.delete(e.pointerId);if(!points.size)svg.classList.remove('dragging');};
    svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
    svg.addEventListener('lostpointercapture',end);
    svg.addEventListener('click',e=>{
      if(performance.now()<ignoreClickUntil)return;
      const node=e.target.closest('[data-node]'),group=e.target.closest('[data-group]'),edge=e.target.closest('[data-edge]');
      if(node)select(node.dataset.node);else if(group)focus(group.dataset.group);else if(edge)hover(edge);
    });
    svg.addEventListener('keydown',e=>{
      const node=e.target.closest('[data-node]'),group=e.target.closest('[data-group]'),edge=e.target.closest('[data-edge]');
      if((e.key==='Enter'||e.key===' ')&&edge){e.preventDefault();hover(edge);return;}
      if((e.key==='Enter'||e.key===' ')&&(node||group)){e.preventDefault();node?select(node.dataset.node):focus(group.dataset.group);return;}
      if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.25);}
      if(e.key==='-'){e.preventDefault();zoom(.8);}
      if(e.key==='0'){e.preventDefault();focus($('tree-branch').value||geometry.groups[0]?.name);}
      const delta={ArrowLeft:[50,0],ArrowRight:[-50,0],ArrowUp:[0,50],ArrowDown:[0,-50]}[e.key];
      if(delta){e.preventDefault();fittedBounds=null;camera.x+=delta[0];camera.y+=delta[1];hide();update();}
    });
    svg.querySelectorAll('[data-node],[data-edge]').forEach(el=>{
      el.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')hover(el);});
      el.addEventListener('pointerleave',laterHide);
      el.addEventListener('focus',()=>hover(el));
      el.addEventListener('blur',laterHide);
    });
  }
  function render(nodes){
    hide();points.clear();resizeObserver?.disconnect();
    geometry=layout(nodes);
    $('graph-note').textContent='Comparison scaffold · links do not establish ancestry. Hover to inspect sources.';
    const previousBranch=$('tree-branch').value;
    const choices=geometry.groups.map(g=>`<option>${esc(g.name)}</option>`).join('');
    $('tree-branch').innerHTML=choices;
    $('branch-count').textContent=geometry.groups.length;
    $('tree-branches').innerHTML=geometry.groups.map(g=>`<button data-branch="${esc(g.name)}" aria-pressed="false"><span>${esc(g.name)}</span><small>${g.ids.length}</small></button>`).join('');
    if(!nodes.length){$('graph').innerHTML='<p class="empty">No records match these filters.</p>';svg=world=null;return;}
    const c=theme(),parts=[];
    for(const g of geometry.groups){
      parts.push(`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="2" fill="${c.panel}" stroke="${c.border}" stroke-width=".6"/>`);
      for(const id of g.roots)parts.push(`<path class="tree-group-link" d="${curve(g.hub,geometry.nodes[id])}" fill="none" stroke="${c.border}" stroke-width="2" stroke-dasharray="2 5"/>`);
      parts.push(`<g data-group="${esc(g.name)}" role="button" tabindex="0" aria-label="Focus ${esc(g.name)}" style="cursor:pointer"><rect x="${g.hub.x}" y="${g.hub.y}" width="${g.hub.w}" height="${g.hub.h}" fill="${c.wash}" rx="2"/>${wrap(g.name,21).map((s,i)=>`<text x="${g.hub.x+14}" y="${g.hub.y+28+i*22}" fill="${c.ink}" font-size="18" font-weight="600">${esc(s)}</text>`).join('')}<text x="${g.hub.x+14}" y="${g.hub.y+76}" fill="${c.muted}" font-size="12">${g.museum?`${g.curated} curated · ${g.museum} museum`:`${g.ids.length} records`}</text></g>`);
      if(g.bridged)parts.push(`<text x="${g.hub.x}" y="${g.hub.y+g.hub.h+20}" font-size="11" fill="${c.muted}">Bridged from ${esc(g.bridged.curated_lineages.join(', '))}</text><text x="${g.hub.x}" y="${g.hub.y+g.hub.h+35}" font-size="11" fill="${c.muted}">(same task family)</text>`);
    }
    for(const r of geometry.rows){
      const t=r.thread,full=Museum.threadText(t)+(t.possible_conflation?' · ⚠ name may join different people':'');
      const room=Math.floor(r.w/7.4),text=full.length>room?full.slice(0,room-1)+'…':full;
      parts.push(`<text x="${r.x}" y="${r.y-13}" font-size="13" font-weight="${t.kind==='design'||t.kind==='maker'?600:400}" fill="${t.kind==='design'?c.bronze:c.muted}"><title>${esc(full)}</title>${esc(text)}</text>`);
    }
    for(const e of geometry.edges){
      if(!shownEdge(e))continue;
      const a=geometry.nodes[e.source],b=geometry.nodes[e.target],path=e.museum?route(a,b):curve(a,b),[stroke,width,dash]=edgeStyle(e,c);
      parts.push(`<g data-edge="${esc(e.id)}" tabindex="0" role="button" aria-label="Inspect ${esc(e.kind)} between ${esc(N[e.source].label)} and ${esc(N[e.target].label)}"><path class="tree-edge" d="${path}" fill="none" stroke="${stroke}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/><path d="${path}" fill="none" stroke="transparent" stroke-width="16"/></g>`);
    }
    for(const n of nodes){
      const p=geometry.nodes[n.id],label=wrap(n.label),im=photoFor(n.id);
      if(n.museum){
        const src=(n.museum.image_url||n.museum.image_id)&&Museum.photo(n),maker=n.museum.people.find(q=>q.role==='maker');
        const pic=src?`<image data-photo-of="${n.id}" href="${esc(src)}" x="${p.x+9}" y="${p.y+9}" width="${p.w-18}" height="96" preserveAspectRatio="xMidYMid meet"/>`:`<text x="${p.x+p.w/2}" y="${p.y+61}" text-anchor="middle" fill="${c.muted}" font-size="11">No museum photograph</text>`;
        const foot=`${n.accession}${maker?' · '+maker.name.split(';')[0]:''}`;
        parts.push(`<g data-node="${n.id}" data-museum="1" role="button" tabindex="0" aria-pressed="${n.id===trace}" aria-label="${esc(n.label+', '+date(n)+', museum record')}" style="cursor:pointer"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3" fill="${c.paper||c.panel}" stroke="${n.id===trace?c.bronze:c.textual}" stroke-width="${n.id===trace?3:1.1}" stroke-dasharray="6 4"/>${pic}<text x="${p.x+14}" y="${p.y+126}" font-size="15" font-weight="700" fill="${c.accent}">${date(n)}</text>${label.slice(0,2).map((s,i)=>`<text x="${p.x+14}" y="${p.y+150+i*21}" font-size="16" font-weight="600">${esc(s)}${i===1&&label.length>2?'…':''}</text>`).join('')}<text x="${p.x+14}" y="${p.y+201}" font-size="10" fill="${c.muted}">MUSEUM · ${esc(foot.length>40?foot.slice(0,39)+'…':foot)}</text></g>`);
        continue;
      }
      const textWitness=`<text x="${p.x+14}" y="${p.y+25}" font-size="10" fill="${c.muted}">TEXT WITNESS · ${esc(n.accession)}</text>${wrap(n.features,36).slice(0,4).map((line,i)=>`<text x="${p.x+14}" y="${p.y+46+i*16}" font-size="12" fill="${c.ink}">${esc(line)}${i===3?'…':''}</text>`).join('')}`;
      const photograph=im?`<image href="${photoSrc(im)}" x="${p.x+9}" y="${p.y+9}" width="${p.w-18}" height="96" preserveAspectRatio="xMidYMid meet"><title>${esc(im.caption+' '+im.credit+' '+im.license)}</title></image>`:n.evidence==='text'?textWitness:`<text x="${p.x+p.w/2}" y="${p.y+61}" text-anchor="middle" fill="${c.muted}" font-size="11">${n.evidence==='illustration'?'Source image linked in record':'Image not yet sourced'}</text>`;
      parts.push(`<g data-node="${n.id}" role="button" tabindex="0" aria-pressed="${n.id===trace}" aria-label="${esc(n.label+', '+date(n))}" style="cursor:pointer"><rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="8" fill="${c.panel}" stroke="${n.id===trace?c.bronze:c.accent}" stroke-width="${n.id===trace?3:1.1}"/>${photograph}<text x="${p.x+14}" y="${p.y+126}" font-size="15" font-weight="700" fill="${c.accent}">${date(n)}</text>${label.map((s,i)=>`<text x="${p.x+14}" y="${p.y+150+i*21}" font-size="16" font-weight="600">${esc(s)}</text>`).join('')}<text x="${p.x+14}" y="${p.y+201}" font-size="10" fill="${c.muted}">${im?(im.relation==='reference objects'?'Reference plate · see record':esc(im.short_credit||'Science Museum Group · CC BY-NC-SA')):`${esc(n.date_kind)} · ${n.sources.length} source${n.sources.length===1?'':'s'}`}</text></g>`);
    }
    const {w,h}=size();
    $('graph').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" tabindex="0" role="group" aria-label="Zoomable surgical tool family tree" font-family="system-ui,sans-serif" fill="${c.ink}"><g id="tree-world">${parts.join('')}</g></svg>`;
    svg=$('graph').querySelector('svg');world=$('tree-world');
    const nextSignature=nodes.map(n=>n.id).join('|');
    const oldBranch=signature===nextSignature?previousBranch:N[selected]?.lineage;
    $('tree-branch').value=geometry.groups.some(g=>g.name===oldBranch)?oldBranch:geometry.groups[0].name;
    markBranch($('tree-branch').value);
    if(signature!==nextSignature)focus($('tree-branch').value);else update();
    signature=nextSignature;bind();
    resizeObserver=new ResizeObserver(()=>{
      if(!svg)return;
      const s=size();svg.setAttribute('width',s.w);svg.setAttribute('height',s.h);svg.setAttribute('viewBox',`0 0 ${s.w} ${s.h}`);
      if(s.w&&s.h&&fittedBounds)fit(fittedBounds);
    });resizeObserver.observe($('graph'));
  }
  function exportSvg(){
    if(!svg)return null;
    const clone=svg.cloneNode(true);clone.setAttribute('width',geometry.width);clone.setAttribute('height',geometry.height);
    clone.setAttribute('viewBox',`0 0 ${geometry.width} ${geometry.height}`);
    clone.querySelector('#tree-world').removeAttribute('transform');
    clone.querySelectorAll('[tabindex]').forEach(el=>el.removeAttribute('tabindex'));
    // Blob URLs do not survive export; write the embedded thumbnails back in.
    clone.querySelectorAll('image[data-photo-of]').forEach(el=>{const r=N[el.dataset.photoOf],uri=IMAGE_DATA[r.museum.image_id];if(uri)el.setAttribute('href',uri);else el.remove();});
    const photos=D.images.filter(im=>im.node_ids.some(id=>geometry.nodes[id]));
    const footerHeight=photos.length*36+65;
    clone.setAttribute('height',geometry.height+footerHeight);clone.setAttribute('viewBox',`0 0 ${geometry.width} ${geometry.height+footerHeight}`);
    const ns='http://www.w3.org/2000/svg';
    const credits=document.createElementNS(ns,'g');
    const museumNote=clone.querySelector('image[data-photo-of]')?` · Museum-record photographs: Rijksmuseum Boerhaave, Leiden; no rights statement in the records, ask the museum before publishing`:'';
    credits.innerHTML=`<text x="25" y="${geometry.height+25}" font-size="13">Photograph credits · original images fitted without cropping; not a common scale${museumNote}</text>`+photos.map((im,i)=>`<text x="25" y="${geometry.height+50+i*36}" font-size="10">${esc(im.credit+' · '+im.license+' · '+im.relation)}</text><a href="${esc(S[im.source].url)}"><text x="25" y="${geometry.height+63+i*36}" font-size="10">${esc(S[im.source].url)}</text></a>`).join('');
    clone.append(credits);
    return new XMLSerializer().serializeToString(clone);
  }
  function suspend(){document.querySelector('.graph-panel').classList.remove('expanded');$('tree-expand').textContent='Expand view';$('tree-expand').setAttribute('aria-pressed','false');hide();resizeObserver?.disconnect();points.clear();svg=world=null;signature='';}
  function init(){
    popup().addEventListener('pointerenter',()=>clearTimeout(hideTimer));
    popup().addEventListener('pointerleave',laterHide);
    popup().addEventListener('focusin',()=>clearTimeout(hideTimer));
    popup().addEventListener('focusout',e=>{if(!popup().contains(e.relatedTarget))laterHide();});
    $('tree-in').onclick=()=>zoom(1.25);$('tree-out').onclick=()=>zoom(.8);
    $('tree-fit').onclick=()=>focus($('tree-branch').value);
    $('tree-overview').onclick=()=>fit({x:0,y:0,w:geometry.width,h:geometry.height});
    $('tree-branch').onchange=()=>focus($('tree-branch').value);
    $('tree-branches').onclick=e=>{const branch=e.target.closest('[data-branch]');if(branch)focus(branch.dataset.branch);};
    $('tree-expand').onclick=()=>{
      const panel=document.querySelector('.graph-panel'),expanded=panel.classList.toggle('expanded');
      $('tree-expand').textContent=expanded?'Exit expanded view':'Expand view';
      $('tree-expand').setAttribute('aria-pressed',String(expanded));
      requestAnimationFrame(()=>focus($('tree-branch').value));
    };
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){hide();$('map').classList.remove('detail-open');if(document.querySelector('.graph-panel.expanded'))$('tree-expand').click();}});
  }
  return {init,render,suspend,hide,select,markSelection,exportSvg,focus,reveal};
})();
