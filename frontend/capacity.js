// Demo calculator mirrors the server's half-U rules; production results come from NetBox.
export const demoTypes = [
  {id:1,model:'샘플 1U · 반깊이',u_height:1,full_depth:false},
  {id:2,model:'샘플 2U · 전체 깊이',u_height:2,full_depth:true},
  {id:3,model:'샘플 0.5U · 반깊이',u_height:.5,full_depth:false},
];
export const demoRacks = racks => racks.map(r => ({...r,complete:true,reservations:[{id:`demo-${r.id}`,units:[35,36],status:'pending',description:'샘플 예약 공간',url:''}]}));
const union = (...sets) => new Set(sets.flatMap(s => [...s]));
const minus = (a,...sets) => { const blocked=union(...sets); return new Set([...a].filter(v=>!blocked.has(v))); };
const cells = (position,height) => new Set(Array.from({length:Math.ceil(height*2)},(_,i)=>Math.round(position*2)+i));
const subset = (a,b) => [...a].every(v=>b.has(v));
export function longest(free) { let best=0,run=0,previous; for(const cell of [...free].sort((a,b)=>a-b)){run=cell===previous+1?run+1:1;best=Math.max(best,run);previous=cell;} return best/2; }
function states(racks,types,planned) {
  if(!Array.isArray(planned)||planned.length>1000) throw Error('가상 장비는 최대 1,000개입니다.');
  const map=new Map(racks.map(r=>[r.id,{rack:r,base:new Set(Array.from({length:r.u_height*2},(_,i)=>r.starting_unit*2+i)),actual:{front:new Set(),rear:new Set()},planned:{front:new Set(),rear:new Set()},reserved:new Set(),complete:r.complete!==false}]));
  for(const s of map.values()) {
    for(const d of s.rack.devices) {
      if(d.position==null||d.u_height<=0) continue;
      const footprint=cells(d.position,d.u_height);
      if(d.position*2!==Math.round(d.position*2)||!subset(footprint,s.base)) s.complete=false;
      for(const face of d.full_depth?['front','rear']:[d.face]) {
        if(!s.actual[face]){s.complete=false;continue;}
        s.actual[face]=union(s.actual[face],new Set([...footprint].filter(v=>s.base.has(v))));
      }
    }
    for(const r of s.rack.reservations||[]) for(const unit of r.units){const part=cells(unit,1);if(!subset(part,s.base))s.complete=false;s.reserved=union(s.reserved,new Set([...part].filter(v=>s.base.has(v))));}
  }
  const catalog=new Map(types.map(t=>[t.id,t])),enriched=[],issues=[],seen=new Set();
  for(const p of planned) {
    if(!/^[A-Za-z0-9_-]{1,64}$/.test(p.id)||seen.has(p.id)||!p.name?.trim()||p.name.length>100||!Number.isInteger(p.rack_id)||!Number.isInteger(p.device_type_id)||!Number.isFinite(p.position)||p.position<.5||p.position*2!==Math.round(p.position*2)||!['front','rear'].includes(p.face))throw Error('가상 장비 이름·식별자·0.5U 위치·장착면을 확인하세요.');
    seen.add(p.id);
    const s=map.get(p.rack_id),dt=catalog.get(p.device_type_id),row={...p,valid:false}; let error='',code='';
    if(!s||!dt||!s.complete){code='visibility';error='랙·장비 유형·장비·예약의 조회 범위가 부족하거나 참조가 유효하지 않습니다.';}
    else if(dt.u_height<=0){code='height';error='0U 장비는 U 공간 증설 계획을 지원하지 않습니다.';}
    else {
      const footprint=cells(p.position,dt.u_height),faces=dt.full_depth?['front','rear']:[p.face];
      if(!subset(footprint,s.base)){code='bounds';error='가상 장비가 랙 U 범위를 벗어납니다.';}
      else if(faces.some(f=>[...footprint].some(v=>s.actual[f].has(v)||s.reserved.has(v)||s.planned[f].has(v)))){code='collision';error='가상 장비가 실제 장비·예약·다른 가상 장비와 겹칩니다.';}
      else {for(const f of faces)s.planned[f]=union(s.planned[f],footprint);row.valid=true;}
    }
    if(dt)Object.assign(row,{model:dt.model,u_height:dt.u_height,full_depth:dt.full_depth});
    if(error){row.error=error;issues.push({id:p.id,code,message:`${p.name}: ${error}`});} enriched.push(row);
  }
  return {map,enriched,issues,catalog};
}
function stats(s,forecast) {
  const installed=union(s.actual.front,s.actual.rear),virtual=forecast?union(s.planned.front,s.planned.rear):new Set(),occupied=union(installed,s.reserved,virtual);
  const result={total_u:s.base.size/2,used_u:installed.size/2,reserved_u:minus(s.reserved,installed).size/2,planned_u:minus(virtual,installed,s.reserved).size/2,free_u:minus(s.base,occupied).size/2,occupancy_percent:Math.round(occupied.size/s.base.size*100)};
  for(const f of ['front','rear']){const free=minus(s.base,s.actual[f],s.reserved,forecast?s.planned[f]:new Set());result[f]={free_u:free.size/2,max_contiguous_u:longest(free)};}return result;
}
export function capacityPreview(racks,types,planned=[]) {
  const {map,enriched,issues}=states(racks,types,planned),rows=[],totals={};
  for(const key of ['before','after']) totals[key]={total_u:0,used_u:0,reserved_u:0,planned_u:0,free_u:0};
  for(const s of map.values()) {
    const r=s.rack,row={id:r.id,name:r.name,u_height:r.u_height,starting_unit:r.starting_unit,desc_units:r.desc_units,reservations:r.reservations||[],complete:s.complete,before:null,after:null};
    if(s.complete) for(const key of ['before','after']){row[key]=stats(s,key==='after');for(const metric in totals[key])totals[key][metric]+=row[key][metric];} rows.push(row);
  }
  for(const t of Object.values(totals))t.occupancy_percent=t.total_u?Math.round((t.total_u-t.free_u)/t.total_u*100):0;
  return {racks:rows,planned_devices:enriched,issues,totals,complete_racks:rows.filter(r=>r.complete).length,unknown_racks:rows.filter(r=>!r.complete).length};
}
export function candidateRacks(racks,types,planned,typeId,face) {
  const {map,catalog,issues}=states(racks,types,planned),dt=catalog.get(typeId);
  if(!dt||!['front','rear'].includes(face))throw Error('조회 가능한 장비 유형과 전·후면을 선택하세요.');
  if(dt.u_height<=0)throw Error('0U 장비는 U 공간 추천을 지원하지 않습니다.');
  if(issues.length)throw Error(`가상 증설 계획을 먼저 수정하세요. ${issues[0].message}`);
  const candidates=[];
  for(const s of map.values()) {
    if(!s.complete)continue;
    let free=new Set(s.base);for(const f of dt.full_depth?['front','rear']:[face])free=minus(free,s.actual[f],s.reserved,s.planned[f]);
    const positions=[...free].sort((a,b)=>a-b).filter(c=>subset(cells(c/2,dt.u_height),free)).map(c=>c/2);
    if(positions.length)candidates.push({rack_id:s.rack.id,rack:s.rack.name,positions,free_u:free.size/2,max_contiguous_u:longest(free)});
  }
  candidates.sort((a,b)=>b.free_u-a.free_u||b.max_contiguous_u-a.max_contiguous_u||(a.rack<b.rack?-1:a.rack>b.rack?1:0)||a.rack_id-b.rack_id);
  return {candidates,device_type:dt,unknown_racks:[...map.values()].filter(s=>!s.complete).length};
}
