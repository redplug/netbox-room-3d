import * as THREE from 'three';
import './inventory-tools.css';
import { operation } from './operations-api.js';
import { dimensions, deviceBottom, U } from './geometry.js';
import { createDiscoveryScope, candidateOverlayKey } from './inventory-lifecycle.js';
import { escapeHTML as esc, identifierMatches, qualityRows, qualityCSV, deviceDetailsHTML, targetFromURL, targetURL, selectedShareTarget } from './inventory-discovery.js';

const button = (action,text,id='') => `<button type="button" class="r3-btn small" data-inventory="${action}" data-id="${esc(id)}">${text}</button>`;
export function createInventoryTools(root, api, get) {
  const launcher = document.createElement('button'); launcher.type = 'button'; launcher.className = 'r3-btn small'; launcher.textContent = '인벤토리 도구'; launcher.id = 'r3-inventory-open';
  root.querySelector('.r3-tools').append(launcher);
  const share = document.createElement('button'); share.type = 'button'; share.className = 'r3-btn small'; share.textContent = '선택 위치 링크'; share.id = 'r3-target-share';
  root.querySelector('.r3-tools').append(share);
  const dialog = document.createElement('dialog'); dialog.className = 'r3-inventory-dialog'; dialog.id = 'r3-inventory'; dialog.setAttribute('aria-labelledby','r3-inventory-title');
  dialog.innerHTML = `<div class="r3-dialog-title"><h2 id="r3-inventory-title">인벤토리 도구</h2>${button('close','닫기')}</div><div class="r3-inventory-tabs" role="group" aria-label="인벤토리 도구 선택">${button('search','전체 Location 식별자 검색')}${button('quality','품질 리포트')}${button('free','연속 빈 U')}</div><form class="r3-inventory-body"></form><div class="r3-inventory-status" role="status" aria-live="polite"></div><label hidden class="r3-inventory-fallback-label">자동 복사 실패 · 아래 값을 선택하여 복사하세요<textarea class="r3-inventory-fallback" readonly></textarea></label>`;
  root.append(dialog);
  const body = dialog.querySelector('form'), status = dialog.querySelector('[role=status]');
  let tab = 'search', rows = [], query = '', issues = [], detail = null, free = null, pending = false, generation = 0, freeKey = '', overlay = null, overlayKey = '', searchLimit = 100;
  const message = (text='',error=false) => {status.textContent=text;status.classList.toggle('error',error);};
  const discovery = createDiscoveryScope();
  const stopPending = () => {generation++;discovery.cancel();pending=false;};
  const contextKey = () => {const c=get();return JSON.stringify([c.locationId,c.layout?.include_descendants,c.layout?.planned_devices,c.racks]);};
  function clearOverlay() {
    if (overlay) {overlay.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});overlay.removeFromParent();overlay=null;get().scene?.draw();}
  }
  async function copy(value) {
    try {await navigator.clipboard.writeText(String(value));message('복사했습니다.');get().notice('복사했습니다.');}
    catch {
      if (!dialog.open) dialog.showModal();
      const label=dialog.querySelector('.r3-inventory-fallback-label'), field=label.querySelector('textarea');
      label.hidden=false;field.value=String(value);field.focus();field.select();message('자동 복사에 실패했습니다. 선택된 값을 직접 복사하세요.',true);
    }
  }
  function baseURL() {return api.demo ? window.location.href : new URL('../../',new URL(api.url,window.location.href)).href;}
  function rowContext(d) {return `${d.location || (d.location_unassigned?'Location 미할당':'Location 조회 불가')} / ${d.rack || (d.rack_unassigned?'랙 미할당':'랙 조회 불가')} / ${d.position==null?'U 없음':`U${d.position}`}`;}
  function resultHTML(d,extra='') {return `<div class="r3-inventory-result"><strong>${esc(d.name)}</strong><small>${esc(rowContext(d))}</small><small>자산번호: ${esc(d.asset_number??'') || '없음'} · 시리얼: ${esc(d.serial??'') || '없음'}</small>${extra}${button('focus','위치 보기',d.id)}${button('detail','상세',d.id)}${button('share','링크 복사',d.id)}</div>`;}
  function renderResults() {
    const target=body.querySelector('.r3-inventory-results');if(!target)return;
    const matches=rows.filter(d=>identifierMatches(d,query));
    target.innerHTML=query.trim() ? `<p>${matches.length}개 일치 · ${Math.min(matches.length,searchLimit)}개 표시</p>${matches.slice(0,searchLimit).map(d=>resultHTML(d)).join('') || '일치하는 장비 없음'}${matches.length>searchLimit?button('more','더 보기'):''}` : '<p>Asset_Number 또는 시리얼을 입력하세요.</p>';
  }
  function render() {
    if (tab==='search') {
      body.innerHTML=`<p>조회 권한이 있는 모든 Location의 Device만 검색합니다. Asset_Number·표준 시리얼의 대소문자 구분 없는 부분 일치입니다.</p><label>자산번호 / 시리얼<input type="search" name="identifier" value="${esc(query)}" aria-label="전체 Location 식별자 검색"></label>${button('refresh','인벤토리 새로고침')}<div class="r3-inventory-results"></div>`;renderResults();
    } else if (tab==='quality') {
      issues=qualityRows(rows);
      body.innerHTML=`<p>현재 조회 권한 범위의 장비 ${rows.length}개 중 ${issues.length}개에 문제가 있습니다. 중복은 공백 제거·대소문자 무시 기준이며, 숨겨진 장비는 검사하지 않습니다. 전체 NetBox의 유일성을 보장하지 않습니다.</p>${button('refresh','리포트 새로고침')}${button('csv','CSV 내보내기')}<div class="r3-inventory-results">${issues.map(({device,issues})=>resultHTML(device,`<small>${esc(issues.join(' · '))}</small>`)).join('') || '<p>조회 범위 내에서 발견된 문제가 없습니다.</p>'}</div>`;
    } else if(tab==='detail') body.innerHTML=detail?deviceDetailsHTML(detail):'<p>장비를 선택하세요.</p>';
    else {
      body.innerHTML=`<p>현재 Location과 하위 포함 설정, 저장 전 가상 계획을 사용합니다. 예약은 모든 상태를 점유로 처리합니다. 조회 범위가 불완전한 랙은 가용으로 추정하지 않습니다.</p><label>필요 높이 (정수 U)<input name="height" type="number" min="1" max="10000" step="1" value="${free?.device_type.u_height || 1}" required></label><label>장착면<select class="no-ts" name="face"><option value="front">전면</option><option value="rear" ${free?.face==='rear'?'selected':''}>후면</option></select></label><label><input name="full_depth" type="checkbox" ${free?.device_type.full_depth?'checked':''}> 전체 깊이 (양면 모두 비어 있어야 함)</label>${button('calculate','연속 공간 조회')}<p>전력·중량·실측 깊이는 별도 확인이 필요합니다. 시작 U는 0.5U 단위입니다.</p>${free?`<p>${free.candidates.length}개 후보 · ${free.unknown_racks}개 계산 불가</p><div class="r3-inventory-results">${free.candidates.map(r=>`<div class="r3-inventory-result"><strong>${esc(r.rack)}</strong><small>최대 연속 ${r.max_contiguous_u}U · 가용 ${r.free_u}U</small><label>시작 U<select class="no-ts" name="free-${r.rack_id}">${r.positions.map(u=>`<option value="${u}">U${u}</option>`).join('')}</select></label>${button('candidate','3D 후보 강조',r.rack_id)}</div>`).join('')}${free.excluded.map(r=>`<div class="r3-inventory-result">${esc(r.rack)}: ${esc(r.reason)}</div>`).join('')}</div>`:''}`;
    }
    body.querySelectorAll('button').forEach(b=>{if(!['more'].includes(b.dataset.inventory))b.disabled=pending;});
  }
  async function refreshRows() {
    const wanted=++generation,ticket=discovery.start();pending=true;render();message('조회 가능한 인벤토리를 불러오고 있습니다.');
    const current=()=>wanted===generation&&ticket.current()&&dialog.open;
    try {const result=await api.devices(undefined,{signal:ticket.signal});if(!current())return;rows=result.devices;message(`${rows.length}개 장비 · 조회 권한 범위`);}
    catch(error){if(current()){rows=[];message(error.message,true);}}
    finally{if(current()){pending=false;render();}}
  }
  async function currentDevice(id, options) {
    const result=await api.devices(id,options);const row=result.devices.find(d=>d.id===id);
    if(!row)throw Error('대상을 사용할 수 없습니다. 삭제·이동 또는 조회 권한을 확인하세요.');
    return row;
  }
  async function showDevice(id,focus=false) {
    const wanted=++generation,ticket=discovery.start();pending=true;render();
    const current=()=>wanted===generation&&ticket.current()&&dialog.open;
    try {
      const row=await currentDevice(id,{signal:ticket.signal});if(!current())return;
      detail=row;
      if(focus&&row.location_id&&row.rack_id) {
        const moved=await get().navigate({location:row.location_id,rack:row.rack_id,device:row.id});
        if(!current())return;
        if(moved){dialog.close();return;}
      }
      tab='detail';message(row.location_id&&row.rack_id?'장비 상세':'3D 위치를 사용할 수 없습니다. 조회 가능한 장비 상세를 표시합니다.');
    } catch(error){if(current())throw error;}
    finally {if(current()){pending=false;render();}}
  }
  async function shareDialogDevice(id) {
    const wanted=++generation,ticket=discovery.start();
    const current=()=>wanted===generation&&ticket.current()&&dialog.open;
    try {
      const row=await currentDevice(id,{signal:ticket.signal});
      if(current())await copy(targetURL(baseURL(),{location:row.location_id,rack:row.rack_id,device:row.id}));
    }catch(error){if(current())throw error;}
  }
  function highlightCandidate(rackId,position) {
    if(freeKey!==contextKey())throw Error('배치 또는 Location이 변경되었습니다. 다시 조회하세요.');
    const c=get(),rack=c.racks.find(r=>r.id===rackId),p=c.layout.placements.find(p=>p.rack_id===rackId);
    if(!rack||!p){message('3D 미배치 랙입니다. 후보 U는 목록에서 확인하세요.');return;}
    const record={position,u_height:free.device_type.u_height,face:free.face,full_depth:free.device_type.full_depth};
    const bottom=deviceBottom(rack,record);if(bottom==null)throw Error('후보 위치를 표시할 수 없습니다.');
    c.focusRack(rackId,free.face);clearOverlay();overlayKey=candidateOverlayKey(get());
    const dims=dimensions(rack,p),height=record.u_height*U/1000,depth=record.full_depth?dims.depth/1000-.08:dims.depth/1000*.42;
    overlay=new THREE.Group();overlay.position.set(p.x/1000,0,p.z/1000);overlay.rotation.y=-(p.rotation||0)*Math.PI/180;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(Math.min((rack.rail_width||482.6)/1000,dims.width/1000-.08),height,depth),new THREE.MeshBasicMaterial({color:'#00a5a1',transparent:true,opacity:.5,depthTest:false,depthWrite:false}));
    mesh.position.set(0,(dims.height-rack.u_height*U)/2000+bottom/1000+height/2,record.full_depth?0:(record.face==='rear'?-1:1)*(dims.depth/2000-depth/2-.03));mesh.raycast=()=>{};mesh.renderOrder=1050;overlay.add(mesh);c.scene.scene.add(overlay);c.scene.draw();dialog.close();c.notice(`${rack.name} · U${position}부터 ${record.u_height}U 후보 강조`);
  }
  dialog.addEventListener('cancel',()=>{stopPending();});
  dialog.addEventListener('close',()=>{if(!dialog.open)stopPending();});
  launcher.addEventListener('click',()=>{dialog.showModal();render();if(tab==='search'||tab==='quality')void refreshRows();});
  share.addEventListener('click',async()=>{
    const c=get();if(!c.locationId)return;
    const location=c.locationId,rackId=c.selected?.rackId,deviceId=c.selected?.deviceId;
    try {
      const device=deviceId?await currentDevice(deviceId):undefined;
      const current=get();
      if(current.locationId!==location||current.selected?.rackId!==rackId||current.selected?.deviceId!==deviceId)return;
      await copy(targetURL(baseURL(),selectedShareTarget(c,device)));
    }catch(error){get().notice(error.message,true);}
  });
  body.addEventListener('submit',e=>e.preventDefault());
  body.addEventListener('input',e=>{if(e.target.name==='identifier'){query=e.target.value;searchLimit=100;renderResults();}});
  root.addEventListener('click',async e=>{
    const copied=e.target.closest('[data-inventory-copy]'),shared=e.target.closest('[data-inventory-share]');
    if(copied){await copy(copied.dataset.inventoryCopy);return;}
    if(shared){try{if(dialog.contains(shared)){await shareDialogDevice(Number(shared.dataset.inventoryShare));return;}const row=await currentDevice(Number(shared.dataset.inventoryShare));await copy(targetURL(baseURL(),{location:row.location_id,rack:row.rack_id,device:row.id}));}catch(error){get().notice(error.message,true);}return;}
    const b=e.target.closest('[data-inventory]');if(!b||b.disabled)return;
    const action=b.dataset.inventory,id=Number(b.dataset.id);
    try {
      if(action==='close'){stopPending();dialog.close();return;}
      if(['search','quality','free'].includes(action)){stopPending();tab=action;render();if(action!=='free'&&!rows.length)await refreshRows();return;}
      if(action==='refresh'){await refreshRows();return;}
      if(action==='more'){searchLimit+=100;renderResults();return;}
      if(action==='focus'||action==='detail'){await showDevice(id,action==='focus');return;}
      if(action==='share'){await shareDialogDevice(id);return;}
      if(action==='csv'){
        const url=URL.createObjectURL(new Blob([qualityCSV(issues)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='room3d-inventory-quality.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
      }
      if(action==='calculate'){
        if(!body.reportValidity())return;
        const c=get();if(!c.layout||c.busy)throw Error('Location 로딩이 끝난 뒤 조회하세요.');
        const height=Number(body.elements.height.value),face=body.elements.face.value,full_depth=body.elements.full_depth.checked,wanted=contextKey(),ticket=++generation;
        pending=true;body.querySelectorAll('button').forEach(b=>b.disabled=true);message('실제 장비·예약·가상 계획을 반영하여 계산 중입니다.');
        try {const result=await operation(c,'free-units',{height,face,full_depth,include_descendants:c.layout.include_descendants,planned_devices:c.layout.planned_devices||[]});if(ticket!==generation||wanted!==contextKey())return;free={...result,face};freeKey=wanted;clearOverlay();message('가용 공간을 계산했습니다. 후보를 선택하여 강조하세요.');}
        finally{if(ticket===generation){pending=false;render();}}return;
      }
      if(action==='candidate')highlightCandidate(id,Number(body.elements.namedItem(`free-${id}`).value));
    } catch(error){message(error.message,true);get().notice(error.message,true);}
  });
  return {
    copy,
    clearCandidate:clearOverlay,
    refresh(){if(overlay&&overlayKey!==candidateOverlayKey(get()))clearOverlay();if(free&&freeKey!==contextKey()){free=null;if(dialog.open&&tab==='free')render();}},
    async resolveLink(){
      try {
        const target=targetFromURL(window.location.href);if(!target.device&&!target.rack)return;
        if(target.device){const d=await currentDevice(target.device);if(target.rack&&target.rack!==d.rack_id||target.location&&target.location!==d.location_id)throw Error('공유 대상이 이동했거나 사용할 수 없습니다.');if(!d.location_id||!d.rack_id){detail=d;tab='detail';render();dialog.showModal();return;}Object.assign(target,{location:d.location_id,rack:d.rack_id});}
        if(!target.location)throw Error('공유 링크에 Location이 없습니다.');
        await get().navigate(target);
      }catch(error){get().notice(error.message,true);}
    },
  };
}
