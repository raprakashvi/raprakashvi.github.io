'use strict';
// Independent SVG map cameras. Symbols and text grow gently as the map zooms.
const MapCamera=(()=>{
 const views=new Map(),MIN=1,MAX=64;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const radius=n=>(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--map-marker-radius'))||5.5)*Math.sqrt(n);
 function constrain(v){
  const [x0,x1,y0,y1]=v.bounds,c=v.camera;
  c.x=(x1-x0)*c.k<=v.width?(v.width-(x0+x1)*c.k)/2:clamp(c.x,v.width-x1*c.k,-x0*c.k);
  c.y=(y1-y0)*c.k<=v.height?(v.height-(y0+y1)*c.k)/2:clamp(c.y,v.height-y1*c.k,-y0*c.k);
 }
 function point(v,e){
  const svg=v.host.querySelector('svg'),matrix=svg?.getScreenCTM();
  return matrix?new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()):{x:0,y:0};
 }
 function update(v){
  const svg=v.host.querySelector('svg');if(!svg)return;
  constrain(v);
  const c=v.camera,matrix=svg.getScreenCTM(),screenScale=matrix?Math.hypot(matrix.a,matrix.b)||1:1;
  const symbolScale=1+Math.min(.65,Math.log2(c.k)*.14);
  svg.dataset.zoom=c.k.toFixed(4);
  svg.querySelector('.geo-scene').setAttribute('transform',`translate(${c.x} ${c.y}) scale(${c.k})`);
  const labels=[],frame=svg.getBoundingClientRect();
  const markers=[...svg.querySelectorAll('.geo-marker')].sort((a,b)=>Number(b.getAttribute('aria-pressed')==='true')-Number(a.getAttribute('aria-pressed')==='true'));
  let visibleCount=0;
  for(const marker of markers){
   const x=c.x+Number(marker.dataset.mapX)*c.k,y=c.y+Number(marker.dataset.mapY)*c.k;
   const margin=Math.max(32,(Number(marker.dataset.radius)+5)*symbolScale)/screenScale;
   const visible=x>=-margin&&x<=v.width+margin&&y>=-margin&&y<=v.height+margin;
   marker.toggleAttribute('hidden',!visible);marker.setAttribute('transform',`translate(${x} ${y})`);
   if(visible)visibleCount++;
   marker.querySelector('.geo-symbol').setAttribute('transform',`scale(${symbolScale/screenScale})`);
   const label=marker.querySelector('.geo-place-label');
   if(!label)continue;
   const selected=marker.getAttribute('aria-pressed')==='true';
   let show=visible&&(v.key!=='world'||c.k>=1.8||selected);
   if(show&&matrix){
    label.removeAttribute('hidden');
    const p=new DOMPoint(x,y).matrixTransform(matrix),b=label.getBBox();
    const box={x:p.x+b.x*symbolScale,y:p.y+b.y*symbolScale,w:b.width*symbolScale,h:b.height*symbolScale};
    show=selected||box.x+box.w<=frame.right-4&&box.y>=frame.top&&box.y+box.h<=frame.bottom&&
     !labels.some(b=>box.x<b.x+b.w+5&&box.x+box.w+5>b.x&&box.y<b.y+b.h+3&&box.y+box.h+3>b.y);
    if(show)labels.push(box);
   }
   label.toggleAttribute('hidden',!show);
  }
  svg.querySelector('.geo-map-empty')?.toggleAttribute('hidden',visibleCount>0);
  const output=v.host.querySelector('[data-map-scale]');if(output)output.textContent=+(c.k.toFixed(1))+'×';
  const sizeKey=document.querySelector(`[data-map-size-key="${v.host.id}"]`);
  if(sizeKey){
   sizeKey.dataset.symbolScale=symbolScale;
   for(const sample of sizeKey.querySelectorAll('[data-size-count]')){
    const diameter=2*radius(Number(sample.dataset.sizeCount))*symbolScale;
    sample.style.width=diameter+'px';sample.style.height=diameter+'px';
   }
  }
  v.host.querySelector('[data-map-action="out"]').disabled=c.k<=MIN;
  v.host.querySelector('[data-map-action="in"]').disabled=c.k>=MAX;
 }
 function zoom(v,factor,anchor={x:v.width/2,y:v.height/2}){
  const c=v.camera,k=clamp(c.k*factor,MIN,MAX),ratio=k/c.k;
  c.x=anchor.x-(anchor.x-c.x)*ratio;c.y=anchor.y-(anchor.y-c.y)*ratio;c.k=k;update(v);
 }
 function reset(v){v.camera={x:0,y:0,k:1};update(v);}
 function bind(v){
  const host=v.host;
  host.addEventListener('wheel',e=>{
   if(!e.target.closest('svg'))return;
   e.preventDefault();const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?420:1);
   zoom(v,Math.exp(-dy*.0018),point(v,e));
  },{passive:false});
  host.addEventListener('dblclick',e=>{if(e.target.closest('svg')){e.preventDefault();zoom(v,2,point(v,e));}});
  host.addEventListener('click',e=>{
   const action=e.target.closest('[data-map-action]')?.dataset.mapAction;
   if(!action)return;
   if(action==='reset')reset(v);else zoom(v,action==='in'?1.5:1/1.5);
  });
  host.addEventListener('pointerdown',e=>{
   if(e.button!==0||!e.target.closest('svg'))return;
   const p=point(v,e);v.pointers.set(e.pointerId,{x:p.x,y:p.y,startX:e.clientX,startY:e.clientY});
   e.target.setPointerCapture(e.pointerId);
  });
  host.addEventListener('pointermove',e=>{
   if(!v.pointers.has(e.pointerId))return;
   const before=[...v.pointers.values()],prev=v.pointers.get(e.pointerId),p=point(v,e);
   v.pointers.set(e.pointerId,{x:p.x,y:p.y,startX:prev.startX,startY:prev.startY});
   if(v.pointers.size===1&&Math.hypot(e.clientX-prev.startX,e.clientY-prev.startY)<4)return;
   v.ignoreClickUntil=performance.now()+300;host.classList.add('map-dragging');
   if(v.pointers.size===1){v.camera.x+=p.x-prev.x;v.camera.y+=p.y-prev.y;}
   else{
    const after=[...v.pointers.values()],mid=a=>({x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2});
    const distance=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),a=mid(after),b=mid(before);
    if(distance(before)>0)zoom(v,distance(after)/distance(before),b);
    v.camera.x+=a.x-b.x;v.camera.y+=a.y-b.y;
   }
   update(v);
  });
  const end=e=>{v.pointers.delete(e.pointerId);if(!v.pointers.size)host.classList.remove('map-dragging');};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(type,end);
  host.addEventListener('keydown',e=>{
   if(!e.target.closest('svg'))return;
   if(['+','=','-','0','Home','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
   if(e.key==='+'||e.key==='=')zoom(v,1.5);
   if(e.key==='-')zoom(v,1/1.5);
   if(e.key==='0'||e.key==='Home')reset(v);
   const delta={ArrowLeft:[45,0],ArrowRight:[-45,0],ArrowUp:[0,45],ArrowDown:[0,-45]}[e.key];
   if(delta){const s=v.host.querySelector('svg').getScreenCTM()?.a||1;v.camera.x+=delta[0]/s;v.camera.y+=delta[1]/s;update(v);}
  });
  v.observer=new ResizeObserver(()=>update(v));v.observer.observe(host);
 }
 function attach(id,{width,height,bounds,key}){
  let v=views.get(id);
  if(!v){
   v={host:document.getElementById(id),width,height,bounds,key,camera:{x:0,y:0,k:1},pointers:new Map(),ignoreClickUntil:0};
   views.set(id,v);bind(v);
  }else{
   if(v.key!==key)v.camera={x:0,y:0,k:1};
   Object.assign(v,{width,height,bounds,key});v.pointers.clear();v.host.classList.remove('map-dragging');
  }
  update(v);
 }
 return {attach,radius,ignoresClick:id=>performance.now()<(views.get(id)?.ignoreClickUntil||0)};
})();
