'use strict';
const Comparison=(()=>{
  const selection=['roman_spec','cusco_brass',''];
  const ids=()=>selection.filter(Boolean);
  function button(id){const chosen=selection.includes(id);return `<button data-compare="${id}" aria-pressed="${chosen}">${chosen?'Remove from comparison':'Compare this instrument'}</button>`;}
  function sync(){
    $('compare-count').textContent=ids().length?` (${ids().length})`:'';
    document.querySelectorAll('[data-compare]').forEach(b=>{const chosen=selection.includes(b.dataset.compare);b.textContent=chosen?'Remove from comparison':'Compare this instrument';b.setAttribute('aria-pressed',String(chosen));});
  }
  function toggle(id){
    const old=selection.indexOf(id),empty=selection.indexOf('');
    if(old>=0)selection[old]='';
    else if(empty>=0)selection[empty]=id;
    else{tab('compare');$('compare-message').textContent='Three instruments selected. Choose a replacement in one of the menus below.';return;}
    $('compare-message').textContent='';render();sync();
  }
  function cite(claim){return claim.sources.map(id=>`<a href="${esc(S[id].url)}" target="_blank" rel="noopener" title="${esc(S[id].title)}">Source ↗</a>`).join(' · ');}
  function cell(claim){return claim?.value?`${esc(claim.value)}<small>${esc(claim.status)} · ${cite(claim)}</small>`:'<span class="not-recorded">Not recorded</span>';}
  function render(){
    const options='<option value="">— No instrument —</option>'+lineages.filter(l=>l!=='Book transmission'&&D.nodes.concat(Museum.nodes()).some(n=>n.lineage===l)).map(l=>`<optgroup label="${esc(l)}">${D.nodes.concat(Museum.nodes()).filter(n=>n.lineage===l).sort(byDate).map(n=>`<option value="${n.id}">${esc(n.label)} · ${date(n)}</option>`).join('')}</optgroup>`).join('');
    $('compare-pickers').innerHTML=selection.map((id,i)=>`<label>Instrument ${i+1}<select data-slot="${i}">${options}</select></label>`).join('');
    $('compare-pickers').querySelectorAll('select').forEach(s=>{
      s.value=selection[+s.dataset.slot];s.onchange=()=>{
        const i=+s.dataset.slot,duplicate=selection.indexOf(s.value);
        if(s.value&&duplicate!==-1&&duplicate!==i){$('compare-message').textContent='That instrument is already selected.';s.value=selection[i];return;}
        selection[i]=s.value;$('compare-message').textContent='';render();sync();
      };
    });
    const ns=ids().map(id=>N[id]);
    $('compare-download').disabled=!ns.length;
    if(!ns.length){$('comparison-table').innerHTML='<p>Select two or three instruments to compare.</p>';return;}
    const head=ns.map(n=>{
      const im=photoFor(n.id);
      return `<th scope="col"><h3>${esc(n.label)}</h3><p class="compare-date">${date(n)}</p>${im?imageCard(im):n.museum?Museum.image(n,'compare'):'<div class="photo-missing">Photograph not yet sourced</div>'}<small>${esc(n.evidence)} · ${esc(n.accession||'No accession recorded')}</small></th>`;
    }).join('');
    const row=(name,values)=>`<tr><th scope="row">${esc(name)}</th>${values.map(v=>`<td>${v}</td>`).join('')}</tr>`;
    const rows=[row('Date basis',ns.map(n=>esc(n.date_basis))),row('Place / maker',ns.map(n=>esc(n.context)))];
    for(const f of D.comparison_fields){
      rows.push(row(f.label,ns.map(n=>cell(n.comparison[f.id]))));
      if(f.id==='form')rows.push(row('Materials (record wording)',ns.map(n=>cell({value:n.material,status:'legacy description; inspect components in Research audit',sources:n.sources}))));
    }
    rows.push(row('Record notes',ns.map(n=>esc(n.caveat))));
    $('comparison-table').innerHTML=`<table class="compare-table"><caption>Design comparison · photographs are fitted to their frames, not shown at the same scale</caption><thead><tr><th scope="col">Recorded feature</th>${head}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
    const lineagesShown=new Set(ns.map(n=>n.lineage));
    $('compare-context').textContent=lineagesShown.size>1?'These instruments perform different tasks. Use this view to compare construction and working principles; performance requires a shared task and test conditions.':'Compare the task, working action and construction separately. Similarity alone does not establish descent.';
  }
  function csv(){
    const rows=[['instrument_id','instrument','feature','value','evidence_status','sources']];
    for(const id of ids()){
      const n=N[id];
      const base=[['date',date(n)],['date_basis',n.date_basis],['material',n.material],['context',n.context],['caveat',n.caveat]];
      base.forEach(([key,value])=>rows.push([id,n.label,key,value,'catalog record',n.sources.map(s=>S[s].url).join(' | ')]));
      for(const f of D.comparison_fields){const c=n.comparison[f.id];rows.push([id,n.label,f.id,c.value??'',c.status,c.sources.map(s=>S[s].url).join(' | ')]);}
    }
    const quote=s=>'"'+String(s).replaceAll('"','""')+'"';
    download('instrument_comparison.csv','text/csv',rows.map(r=>r.map(quote).join(',')).join('\r\n'));
  }
  function init(){
    $('compare-download').onclick=csv;
    $('compare-clear').onclick=()=>{selection.fill('');$('compare-message').textContent='';render();sync();};
    document.addEventListener('click',e=>{const b=e.target.closest('[data-compare]');if(b)toggle(b.dataset.compare);});
    $('comparison-method').innerHTML=`<h3>How the comparison is organized</h3><p>The table separates intended task, working action, and physical construction. This is our adaptation of the function–behaviour–structure framework, which distinguishes purpose, behaviour and the arrangement of components. <a href="${S.method_fbs.url}">Gero &amp; Kannengiesser, 2004 ↗</a></p><p>Task labels use consistent verb–object descriptions, informed by the Functional Basis for Engineering Design. Our clinical vocabulary is an adaptation of that approach. <a href="${S.method_functional_basis.url}">Hirtz et al., 2002 ↗</a></p><p>Each cell identifies its evidence. “Analyst coding” marks our interpretation of a catalog identification. “Not recorded” means missing evidence, not absence of a feature. No performance or ancestry score is calculated.</p>`;
    render();sync();
  }
  return {init,button,toggle};
})();
