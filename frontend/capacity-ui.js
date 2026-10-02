import { createCapacityOverlays } from './capacity-overlays.js';
import { safeURL } from './geometry.js';
import { operation } from './operations-api.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(action,label,id='',disabled=false)=>`<button type="button" class="r3-btn small" data-op="${action}" data-id="${esc(id)}" ${disabled?'disabled':''}>${label}</button>`;
export function createCapacityTools({body,get,request,apply,message,render,redraw}) {
  let result=null,recommendation=null,types=[],location,key='',resultKey='',selectedType='',face='front',editing=null,show=true,query='',timer,sourceRacks,failedKey='';
  const overlays=createCapacityOverlays(get().scene);
  const signature=c=>JSON.stringify([c.locationId,c.layout.include_descendants,c.layout.planned_devices||[]]);
  const payload=planned=>({include_descendants:get().layout.include_descendants,planned_devices:planned??get().layout.planned_devices??[]});
  const value=name=>body.elements.namedItem(name)?.value;
  function sync() {
    const c=get();if(!c.layout)return;
    if(location!==c.locationId){location=c.locationId;result=null;recommendation=null;types=[];editing=null;selectedType='';key='';query='';}
    if(sourceRacks!==c.racks){sourceRacks=c.racks;result=null;resultKey='';failedKey='';}
    const now=signature(c);if(now!==key){key=now;if(resultKey!==now){result=null;recommendation=null;}}
    overlays.update(c.layout,c.racks,result,show);
    if((c.layout.planned_devices||[]).length && resultKey!==now && failedKey!==now) {
      clearTimeout(timer);
      const context=c,draft=payload(),wanted=now;
      timer=setTimeout(async()=>{
        if(resultKey===wanted)return;
        try {const data=await operation(context,'capacity',draft);if(signature(get())===wanted){accept(data);redraw();}}
        catch {failedKey=wanted;}
      },150);
    }
  }
  function accept(data) {result=data;resultKey=signature(get());sync();}
  async function calculate(planned) {return request('capacity',payload(planned));}
  function summary(info) {return `${info.used_u}U 사용 · ${info.reserved_u}U 예약 · ${info.planned_u}U 가상 · ${info.free_u}U 가용 · 점유 ${info.occupancy_percent}%`;}
  function renderTab(tab) {
    const c=get(),disabled=!c.editable||c.busy,plans=c.layout.planned_devices||[];
    if(tab===0) {
      body.innerHTML=`<p>예약은 모든 상태를 공간 점유로 반영합니다. 점유율은 양면 중복을 제거하고, 전·후면 가용 공간은 별도로 계산합니다.</p><div>${btn('capacity-refresh','최신 용량 계산','',c.busy)}${btn('capacity-overlay',show?'3D 표시 끄기':'3D 표시 켜기')}</div>${result?`<p>${result.complete_racks}개 랙 계산 완료 · ${result.unknown_racks}개 계산 불가</p><div class="r3-operation-row"><strong>서버실 전체 · 계산 가능한 랙 기준</strong><br>현재: ${summary(result.totals.before)}<br>증설 후: ${summary(result.totals.after)}</div><div class="r3-operation-list">${result.racks.map(r=>`<div class="r3-operation-row"><strong>${esc(r.name)}</strong>${r.complete?`<br>${summary(r.after)}<br>전면: 가용 ${r.after.front.free_u}U / 최대 연속 ${r.after.front.max_contiguous_u}U<br>후면: 가용 ${r.after.rear.free_u}U / 최대 연속 ${r.after.rear.max_contiguous_u}U`:'<p>조회 범위 부족 또는 배치 정보 오류로 계산할 수 없습니다.</p>'}${r.reservations.map(b=>{const url=safeURL(b.url);return `<p>예약 U${esc(b.units.join(', '))} · ${esc(b.status)} · ${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(b.description||'예약 상세')}</a>`:esc(b.description)}</p>`;}).join('')}${btn('capacity-focus','랙 보기',r.id)}</div>`).join('')}</div>`:'<p>최신 용량 계산을 눌러 예약과 가용 U를 조회하세요.</p>'}`;
    } else if(tab===1) {
      body.innerHTML=`<p>U 공간 조건에 맞는 후보입니다. 전력·중량·실측 깊이는 별도로 확인하세요. 0U 장비는 추천하지 않습니다.</p><label>장비 유형 검색<input name="type-query" value="${esc(query)}" maxlength="100"></label>${btn('capacity-types','장비 유형 조회','',c.busy)}<div class="r3-operation-grid"><label>Device Type<select class="no-ts" name="device-type">${types.map(t=>`<option value="${t.id}" ${String(t.id)===String(selectedType)?'selected':''}>${esc(t.model)} · ${t.u_height}U · ${t.full_depth?'전체 깊이':'반깊이'}</option>`).join('')}</select></label><label>장착면<select class="no-ts" name="face"><option value="front" ${face==='front'?'selected':''}>전면</option><option value="rear" ${face==='rear'?'selected':''}>후면</option></select></label></div>${btn('capacity-recommend','설치 후보 조회','',c.busy||!types.length)}${recommendation?`<p>${recommendation.candidates.length}개 후보 · ${recommendation.unknown_racks}개 계산 불가</p><div class="r3-operation-list">${recommendation.candidates.map(r=>`<div class="r3-operation-row"><strong>${esc(r.rack)}</strong>${c.layout.placements.some(p=>p.rack_id===r.rack_id)?'':' · 3D 미배치'}<br>가용 ${r.free_u}U · 최대 연속 ${r.max_contiguous_u}U<label>시작 U<select name="candidate-${r.rack_id}" class="no-ts">${r.positions.map(u=>`<option value="${u}">U${u}</option>`).join('')}</select></label>${btn('capacity-add','가상 장비 추가',r.rack_id,disabled)}${btn('capacity-focus','랙 보기',r.rack_id)}</div>`).join('')||'설치 가능한 후보가 없습니다.'}</div>`:''}`;
    } else {
      const item=plans.find(p=>p.id===editing);
      body.innerHTML=`<p>가상 장비는 Room 3D 배치안에만 저장됩니다. 장비 추가는 설치 후보 탭을 사용하세요.</p><div>${btn('capacity-refresh','현재 계획 재검사','',c.busy)}${btn('capacity-overlay',show?'3D 표시 끄기':'3D 표시 켜기')}</div>${result?`<div class="r3-operation-row">현재: ${summary(result.totals.before)}<br>증설 후: ${summary(result.totals.after)}</div>${result.issues.map(i=>`<p class="error">${esc(i.message)}</p>`).join('')}`:''}<div class="r3-operation-list">${plans.map(p=>`<div class="r3-operation-row"><strong>${esc(p.name)}</strong> · ${esc(c.racks.find(r=>r.id===p.rack_id)?.name||'참조 없음')} · U${p.position} · ${p.face==='rear'?'후면':'전면'}${btn('capacity-edit','이동·이름 변경',p.id,disabled)}${btn('capacity-delete','삭제',p.id,disabled)}</div>`).join('')||'가상 장비가 없습니다.'}</div>${item?`<label>가상 장비 이름<input name="planned-name" value="${esc(item.name)}" maxlength="100" required></label><div class="r3-operation-grid"><label>랙<select name="planned-rack" class="no-ts">${c.racks.map(r=>`<option value="${r.id}" ${item.rack_id===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></label><label>시작 U<input name="planned-position" type="number" min="0.5" step="0.5" value="${item.position}" required></label><label>장착면<select name="planned-face" class="no-ts"><option value="front" ${item.face==='front'?'selected':''}>전면</option><option value="rear" ${item.face==='rear'?'selected':''}>후면</option></select></label></div>${btn('capacity-move','변경 적용',item.id,disabled)}`:''}`;
    }
  }
  async function action(name,id) {
    if(!name.startsWith('capacity-'))return false;
    const c=get();
    if(name==='capacity-overlay'){show=!show;sync();render();return true;}
    if(name==='capacity-focus'){c.highlight(Number(id));message('닫기를 눌러 선택한 랙을 확인하세요.');return true;}
    if(name==='capacity-refresh'){accept(await calculate());render();message(result.issues.length?'계획 충돌을 수정한 뒤 배치 저장을 누르세요.':'최신 예약과 인벤토리로 계산했습니다.',result.issues.length>0);return true;}
    if(name==='capacity-types'){query=value('type-query')||'';const rows=await request('device-types',undefined,`?q=${encodeURIComponent(query)}`);types=rows.device_types;render();message(rows.truncated?'200개를 표시합니다. 검색어를 더 구체적으로 입력하세요.':'조회 가능한 장비 유형을 불러왔습니다.');return true;}
    if(name==='capacity-recommend'){selectedType=value('device-type');face=value('face');recommendation=await request('recommendations',{...payload(),device_type_id:Number(selectedType),face});render();message('후보의 시작 U를 선택해 가상 장비를 추가하세요.');return true;}
    if(name==='capacity-edit'){editing=id;render();return true;}
    if(!c.editable)throw Error('읽기 전용입니다.');
    const next=structuredClone(c.layout);next.planned_devices??=[];
    if(name==='capacity-add') {
      const type=recommendation?.device_type;if(!type)throw Error('후보를 다시 조회하세요.');
      next.planned_devices.push({id:crypto.randomUUID(),name:`${type.model} 증설`.slice(0,100),device_type_id:type.id,rack_id:Number(id),position:Number(value(`candidate-${id}`)),face});
    } else if(name==='capacity-delete'){next.planned_devices=next.planned_devices.filter(p=>p.id!==id);editing=null;}
    else if(name==='capacity-move') {
      if(!body.reportValidity())return true;
      const target=next.planned_devices.find(p=>p.id===id);if(!target)throw Error('가상 장비를 다시 선택하세요.');
      Object.assign(target,{name:value('planned-name').trim(),rack_id:Number(value('planned-rack')),position:Number(value('planned-position')),face:value('planned-face')});
    } else return true;
    const data=await calculate(next.planned_devices);
    const changedIssues=data.issues.filter(i=>name==='capacity-add'||i.id===id);
    if(changedIssues.length){accept(await calculate());throw Error(changedIssues.map(i=>i.message).join(' / '));}
    apply(next,false);accept(data);recommendation=null;render();redraw();message(data.issues.length?'편집본에 적용했습니다. 남은 계획 충돌을 수정한 뒤 배치 저장을 누르세요.':'가상 증설 편집본에 적용했습니다. 배치 저장으로 확정하세요.',data.issues.length>0);return true;
  }
  return {render:renderTab,action,sync,dispose:()=>{clearTimeout(timer);overlays.dispose();}};
}
