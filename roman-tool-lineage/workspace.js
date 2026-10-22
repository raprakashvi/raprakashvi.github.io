// Shared navigation, responsive drawer and cross-workspace search. No dataset writes.
let initialized=false,returnFocus;
const $=id=>document.getElementById(id);
const titles={map:['Explore','Family tree'],world:['Explore','World & time'],browse:['Explore','Collection'],item:['Explore','Item record'],morph:['Analyze','Morphology'],analysis:['Analyze','Outline measurements'],compare:['Analyze','Compare'],ai:['Research','AI Methods'],review:['Research','Annotate'],about:['Research','Dataset & methods'],boundaries:['Research','Findings & boundaries'],weiss:['Research','1863 catalog study'],museum:['Research','Boerhaave museum'],research:['Research','Research audit'],study:['Research','Study & connections'],catalog:['Research','Research witnesses'],events:['Research','Historical context'],sources:['Research','Sources & images'],method:['Research','Research methods']};
export function setWorkspace(section){
 const [group,label]=titles[section]||titles.map;
 $('workspace-group').textContent=group;$('workspace-label').textContent=label;
 document.title=`Vestigium · ${label}`;
 document.querySelectorAll('.site-nav a[data-section]').forEach(a=>{const active=a.dataset.section===(section==='item'?'browse':section);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 const fromDrawer=document.body.classList.contains('drawer-open');closeDrawer(false);if(fromDrawer)$('main')?.focus({preventScroll:true});
}
function closeDrawer(focus=false){
 document.body.classList.remove('drawer-open');$('drawer-toggle')?.setAttribute('aria-expanded','false');if($('drawer-scrim'))$('drawer-scrim').hidden=true;
 if(innerWidth<=900)$('workspace-sidebar')?.setAttribute('inert','');
 $('main')?.removeAttribute('inert');document.querySelector('.workspace-topbar')?.removeAttribute('inert');$('workspace-sidebar')?.removeAttribute('role');$('workspace-sidebar')?.removeAttribute('aria-modal');if(focus)returnFocus?.focus();
}
export function initWorkspace(){
 if(initialized)return;initialized=true;
 const sidebar=$('workspace-sidebar');if(!sidebar)return;
 const media=matchMedia('(max-width:900px)');const sync=()=>{if(media.matches)closeDrawer();else{closeDrawer();sidebar.removeAttribute('inert')}};media.addEventListener('change',sync);sync();
 $('drawer-toggle').onclick=()=>{returnFocus=document.activeElement;document.body.classList.remove('search-open');sidebar.removeAttribute('inert');document.body.classList.add('drawer-open');$('drawer-toggle').setAttribute('aria-expanded','true');$('drawer-scrim').hidden=false;sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');$('main')?.setAttribute('inert','');document.querySelector('.workspace-topbar')?.setAttribute('inert','');$('drawer-close').focus()};
 $('drawer-close').onclick=() =>closeDrawer(true);$('drawer-scrim').onclick=()=>closeDrawer(true);
 sidebar.addEventListener('click',e=>{if(e.target.closest('a,button[data-tab]'))closeDrawer(false)});
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();closeDrawer(false);if(innerWidth<=500)document.body.classList.add('search-open');$('workspace-query').focus();return}
  if(e.key==='Escape'&&document.body.classList.contains('search-open')){document.body.classList.remove('search-open');$('mobile-search').focus();return}
  if(!document.body.classList.contains('drawer-open'))return;
  if(e.key==='Escape'){e.preventDefault();closeDrawer(true);return}
  if(e.key==='Tab'){const nodes=[...sidebar.querySelectorAll('a,button,summary,input')].filter(n=>n.getClientRects().length&&!n.disabled),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 });
 $('mobile-search').onclick=()=>{document.body.classList.add('search-open');$('workspace-query').focus()};
 document.querySelector('.global-search kbd').textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ K':'Ctrl K';
 document.querySelectorAll('.global-search').forEach(form=>form.addEventListener('submit',e=>{const q=$('workspace-query').value.trim();if(document.getElementById('browse-view')){e.preventDefault();const input=$('search');input.value=q;input.dispatchEvent(new Event('input',{bubbles:true}));location.hash='browse';input.focus()} }));
 // Non-atlas documents use the same evidence accordion behavior.
 document.querySelectorAll('.nav-trigger[aria-haspopup]').forEach(b=>{if(document.getElementById('map'))return;b.onclick=()=>{const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.nextElementSibling.hidden=!open}});
 window.addEventListener('vestigium:navigate',e=>setWorkspace(e.detail));
}
