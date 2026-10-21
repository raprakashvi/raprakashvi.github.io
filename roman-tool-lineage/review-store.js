// Pure review-package contracts, shared by UI and Node checks. No network writes.
export const FUNCTIONS=['extraction','crushing','cutting','gripping','scraping','piercing','probing','dilation'];
export const FUNCTION_STATES=['unobserved','positive','negative','uncertain'];
export const PAIR_STATES=['unobserved','unassessable','0','1','2','3'];
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
function stable(x){return Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;}
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===[...keys].sort().join('|');
export function emptyPackage(pilot){return {schema_version:'1.0.0',dataset_version:pilot.dataset_version,pilot_version:pilot.pilot_version,revisions:[]};}
export function validatePackage(pkg,pilot){
 const fail=message=>{throw Error(message)};
 if(!exact(pkg,['schema_version','dataset_version','pilot_version','revisions'])||pkg.schema_version!=='1.0.0'||pkg.dataset_version!==pilot.dataset_version||pkg.pilot_version!==pilot.pilot_version)fail('Review schema, dataset or pilot version does not match. Keep the original export and use its frozen release.');
 if(!Array.isArray(pkg.revisions)||pkg.revisions.length>20000)fail('Invalid or oversized review history.');
 const ids=new Map();
 for(const r of pkg.revisions){
  if(!exact(r,['id','supersedes','reviewer','created_at','kind','target','targets','labels','evidence','confidence','notes','sources_revealed']))fail('Invalid revision fields.');
  if(!/^[a-f0-9-]{36}$/.test(r.id)||ids.has(r.id))fail('Duplicate or invalid revision identifier.');ids.set(r.id,r);
  if(typeof r.reviewer!=='string'||!/^[A-Za-z0-9_.-]{1,80}$/.test(r.reviewer)||typeof r.created_at!=='string'||!/^\d{4}-\d\d-\d\dT/.test(r.created_at)||!Number.isFinite(Date.parse(r.created_at)))fail('Use a reviewer alias and valid review timestamp.');
  const task=r.kind==='item'?pilot.items.find(x=>x.id===r.target):r.kind==='pair'?pilot.pairs.find(x=>x.id===r.target):null;
  const expected=r.kind==='item'?[r.target]:task?.targets;
  if(!task||!same(r.targets,expected))fail('Review target is outside this frozen pilot.');
  const keys=r.kind==='item'?FUNCTIONS:['shape','mechanism','function'],states=r.kind==='item'?FUNCTION_STATES:PAIR_STATES;
  if(!exact(r.labels,keys)||Object.values(r.labels).some(s=>!states.includes(s)))fail('Invalid labels. Unobserved, uncertain and negative are different states.');
  if(!exact(r.evidence,['basis','source_url','locator'])||!['source_documented','expert_interpretation','visual_affordance','observed_use','not_assessed'].includes(r.evidence.basis)||typeof r.evidence.locator!=='string'||r.evidence.locator.length>2000)fail('Invalid evidence fields.');
  if(r.evidence.source_url!==null&&(typeof r.evidence.source_url!=='string'||r.evidence.source_url.length>2000||!/^https?:\/\//.test(r.evidence.source_url)))fail('Evidence URL must be HTTP(S), or empty.');
  if(typeof r.notes!=='string'||r.notes.length>10000||typeof r.sources_revealed!=='boolean'||![null,'low','medium','high'].includes(r.confidence))fail('Invalid notes, confidence or reveal flag.');
  const asserted=Object.values(r.labels).some(s=>!['unobserved','unassessable'].includes(s));
  if(asserted&&(r.evidence.basis==='not_assessed'||!r.evidence.locator.trim()))fail('Describe the evidence for every asserted judgment. Use separate revisions when its basis changes.');
  if(asserted&&r.evidence.basis==='source_documented'&&!r.evidence.source_url)fail('Source-documented judgments require a source URL.');
  if(r.supersedes!==null&&typeof r.supersedes!=='string')fail('Invalid revision parent.');
 }
 for(const r of pkg.revisions){
  if(r.supersedes===null)continue;
  const parent=ids.get(r.supersedes);
  if(!parent||parent.reviewer!==r.reviewer||parent.kind!==r.kind||parent.target!==r.target||Date.parse(parent.created_at)>Date.parse(r.created_at))fail('Broken revision history; parent must belong to the same reviewer and task.');
  const seen=new Set([r.id]);let prev=parent;
  while(prev){if(seen.has(prev.id))fail('Cyclic revision history.');seen.add(prev.id);prev=ids.get(prev.supersedes);}
 }
 return pkg;
}
export function mergePackages(a,b,pilot){
 validatePackage(a,pilot);validatePackage(b,pilot);
 const rows=new Map(a.revisions.map(r=>[r.id,r]));
 for(const r of b.revisions){if(rows.has(r.id)&&!same(rows.get(r.id),r))throw Error('Revision identifier collision. Neither history was overwritten.');rows.set(r.id,r);}
 return validatePackage({...emptyPackage(pilot),revisions:[...rows.values()]},pilot);
}
export function heads(pkg,reviewer,kind,target){
 const rows=pkg.revisions.filter(r=>r.reviewer===reviewer&&r.kind===kind&&r.target===target),parents=new Set(rows.map(r=>r.supersedes));return rows.filter(r=>!parents.has(r.id));
}
export function allHeads(pkg){const parents=new Set(pkg.revisions.map(r=>r.supersedes));return pkg.revisions.filter(r=>!parents.has(r.id));}
