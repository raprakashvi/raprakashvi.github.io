// Shared navigation, responsive drawer and cross-workspace search. No dataset writes.
let initialized=false,returnFocus;
const $=id=>document.getElementById(id);
const titles={map:['Patterns','Family tree'],world:['Explore','World and time'],browse:['Explore','Collection'],item:['Explore','Item record'],morph:['Analyze','Morphology'],analysis:['Analyze','Outline measurements'],compare:['Analyze','Compare'],ai:['Analyse','AI methods'],review:['Analyse','Annotate'],about:['About','Dataset notes'],boundaries:['Research','Findings & boundaries'],weiss:['Research','1863 catalog study'],museum:['Research','Boerhaave museum'],research:['Research','Research audit'],study:['Research','Study & connections'],catalog:['Research','Research witnesses'],events:['Research','Historical context'],sources:['Research','Sources & images'],method:['Research','Research methods']};
export function setWorkspace(section){
 const [group,label]=titles[section]||titles.map;
 // T-027: the merged header has no breadcrumb; the page title still follows the view.
 if($('workspace-group'))$('workspace-group').textContent=group;if($('workspace-label'))$('workspace-label').textContent=label;
 document.title=`${label} · Vestigium`;
 document.querySelectorAll('.site-nav a[data-section]').forEach(a=>{const active=a.dataset.section===(section==='item'?'browse':section);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 const fromDrawer=document.body.classList.contains('drawer-open');closeDrawer(false);if(fromDrawer)$('main')?.focus({preventScroll:true});
}
function closeDrawer(focus=false){
 document.body.classList.remove('drawer-open');document.querySelectorAll('details.vh-menu[open]').forEach(d=>d.open=false);$('drawer-toggle')?.setAttribute('aria-expanded','false');if($('drawer-scrim'))$('drawer-scrim').hidden=true;
 if(innerWidth<=900)$('workspace-sidebar')?.setAttribute('inert','');
 $('main')?.removeAttribute('inert');document.querySelector('.workspace-topbar')?.removeAttribute('inert');$('workspace-sidebar')?.removeAttribute('role');$('workspace-sidebar')?.removeAttribute('aria-modal');if(focus)returnFocus?.focus();
}
export function initWorkspace(){
 if(initialized)return;initialized=true;
 const sidebar=$('workspace-sidebar');if(!sidebar)return;
 const media=matchMedia('(max-width:900px)');const sync=()=>{if(media.matches)closeDrawer();else{closeDrawer();sidebar.removeAttribute('inert')}};media.addEventListener('change',sync);sync();
 $('drawer-toggle').onclick=()=>{returnFocus=document.activeElement;document.querySelectorAll('details.vh-menu').forEach(d=>d.open=true);document.body.classList.remove('search-open');sidebar.removeAttribute('inert');document.body.classList.add('drawer-open');$('drawer-toggle').setAttribute('aria-expanded','true');$('drawer-scrim').hidden=false;sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');$('main')?.setAttribute('inert','');document.querySelector('.workspace-topbar')?.setAttribute('inert','');$('drawer-close').focus()};
 $('drawer-close').onclick=() =>closeDrawer(true);$('drawer-scrim').onclick=()=>closeDrawer(true);
 // T-027: a destination in the same document (atlas.html#morph from atlas.html) must hand focus to the content.
 // The link's own fragment navigation lands after this handler, so focus runs in a 0-timer; a cross-page link
 // unloads the page and only needs the drawer closed.
 sidebar.addEventListener('click',e=>{const t=e.target.closest('a,button[data-tab]');if(!t)return;const was=document.body.classList.contains('drawer-open'),same=t.tagName==='BUTTON'||(t.getAttribute('href')||'').startsWith('#')||new URL(t.href,location.href).pathname===location.pathname;closeDrawer(false);if(was&&same)setTimeout(()=>$('main')?.focus({preventScroll:true}),0)});
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();closeDrawer(false);if(innerWidth<=500)document.body.classList.add('search-open');$('workspace-query').focus();return}
  if(e.key==='Escape'&&document.body.classList.contains('search-open')){document.body.classList.remove('search-open');$('mobile-search').focus();return}
  if(!document.body.classList.contains('drawer-open'))return;
  if(e.key==='Escape'){e.preventDefault();closeDrawer(true);return}
  if(e.key==='Tab'){const nodes=[...sidebar.querySelectorAll('a,button,summary,input')].filter(n=>n.getClientRects().length&&!n.disabled),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 });
 if($('mobile-search'))$('mobile-search').onclick=()=>{document.body.classList.add('search-open');$('workspace-query').focus()};
 const kbd=document.querySelector('.global-search kbd');if(kbd)kbd.textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ K':'Ctrl K';
 // T-027: the header search always opens the one collection (collection.html?q=…); that page filters in place.
 // Non-atlas documents use the same evidence accordion behavior.
 document.querySelectorAll('.nav-trigger[aria-haspopup]').forEach(b=>{if(document.getElementById('map'))return;b.onclick=()=>{const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));b.nextElementSibling.hidden=!open}});
 // Top-navigation dropdowns (T-019): one open at a time; close on outside click or Escape.
 const MENU='details.navmore,details.vh-menu';
 document.querySelectorAll(MENU).forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&innerWidth>900)document.querySelectorAll(MENU).forEach(o=>{if(o!==d&&o.open)o.removeAttribute('open')})}));
 document.addEventListener('click',e=>{if(innerWidth>900)document.querySelectorAll(MENU).forEach(d=>{if(d.open&&!d.contains(e.target))d.removeAttribute('open')})});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll(MENU).forEach(d=>{if(d.open){d.removeAttribute('open');d.querySelector('summary')?.focus()}})});
 window.addEventListener('vestigium:navigate',e=>setWorkspace(e.detail));
}
