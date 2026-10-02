import './operations.css';
import { errors, safeURL } from './geometry.js';
import { layoutDiff, placeRows, validCamera } from './planning.js';
import { operation } from './operations-api.js';
import { createOverlays } from './scene-overlays.js';
import { createCapacityTools } from './capacity-ui.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const tabs = ['통로', '구역', '변경 비교', '열 배치', '참조 정리', '시점', '배치안', '케이블', '예약·용량', '설치 후보', '가상 증설'];
const button = (action, label, disabled = false, id = '') => `<button type="button" class="r3-btn small" data-op="${action}" data-id="${esc(id)}" ${disabled ? 'disabled' : ''}>${label}</button>`;
const field = (name, label, value, min = 0, max = 100000) => `<label>${label}<input name="${name}" type="number" value="${esc(value)}" min="${min}" max="${max}" step="any" required></label>`;

export function createOperations(root, get) {
  const launcher = document.createElement('button'); launcher.type = 'button'; launcher.id = 'r3-operations-open'; launcher.className = 'r3-btn small'; launcher.textContent = '운영 도구';
  root.querySelector('.r3-tools').append(launcher);
  const dialog = document.createElement('dialog'); dialog.className = 'r3-operations'; dialog.id = 'r3-operations';
  dialog.innerHTML = `<div class="r3-dialog-title"><h2>운영 도구</h2>${button('close','닫기')}</div><div class="r3-operation-tabs" role="tablist" aria-label="운영 도구">${tabs.map((label,i) => `<button class="r3-btn small" role="tab" data-tab="${i}" aria-selected="false">${i+1}. ${label}</button>`).join('')}</div><form class="r3-operation-body"></form><div class="r3-operation-status" role="status" aria-live="polite"></div>`;
  root.append(dialog);
  const body = dialog.querySelector('form'), status = dialog.querySelector('[role=status]');
  let tab = 0, location, selectedDevice, plans = [], preview = null, compare = null, cables = [], pending = false, zoneId = null, shareApplied = false;
  const overlays = createOverlays(get().scene);
  const message = (text = '', error = false) => { status.textContent = text; status.classList.toggle('error', error); };
  const value = name => body.elements.namedItem(name)?.value;
  const num = name => Number(value(name));
  const capacityTools = createCapacityTools({body,get,request,apply,message,render,redraw:refresh});
  const favoritesKey = () => `room3d-camera-v1-${get().locationId}`;
  function favorites() { try { const rows = JSON.parse(localStorage.getItem(favoritesKey()) || '[]'); return Array.isArray(rows) ? rows.filter(p => validCamera(p.camera)).slice(0,20) : []; } catch { return []; } }
  function capture() {
    const scene = get().scene;
    const camera = { mode: scene.mode, position: scene.camera.position.toArray(), target: scene.controls.target.toArray() };
    if (!validCamera(camera)) throw new Error('워킹 모드를 종료한 뒤 시점을 저장하세요.');
    return camera;
  }
  function restoreCamera(camera) {
    if (!validCamera(camera)) throw new Error('유효하지 않은 시점입니다.');
    const c = get(); c.view(camera.mode); c.scene.camera.position.fromArray(camera.position); c.scene.controls.target.fromArray(camera.target); c.scene.controls.update(); c.scene.draw();
  }
  function apply(next, validate = true) {
    const c = get(); if (!c.editable) throw new Error('읽기 전용입니다.');
    if (validate) { const issues = errors(next, c.racks); if (issues.length) throw new Error(issues.slice(0,3).join(' / ')); }
    c.apply(next); message('편집본에 적용했습니다. 배치 저장을 눌러 확정하세요.');
  }
  function render() {
    const c = get(); if (!c.layout) return;
    const l = c.layout, disabled = !c.editable || pending;
    dialog.querySelectorAll('[data-tab]').forEach(el => { el.setAttribute('aria-selected', String(Number(el.dataset.tab) === tab)); el.disabled = pending; });
    if (tab === 0) {
      const policy = l.clearance || { enabled:false, front:1000, rear:800 };
      body.innerHTML = `<p>랙 전면·후면 작업 공간을 확보합니다. 작업 공간끼리는 공유할 수 있지만 랙·장애물이 침범하면 저장을 차단합니다.</p><label class="r3-check"><input name="enabled" type="checkbox" ${policy.enabled ? 'checked' : ''}> 통로 검사 사용</label><div class="r3-operation-grid">${field('front','전면 여유 (mm)',policy.front,0,10000)}${field('rear','후면 여유 (mm)',policy.rear,0,10000)}</div>${button('clearance','설정 적용',disabled)}<p class="r3-help">적용 후 경고가 있으면 좌표를 수정하거나 화면의 겹침 자동 수정을 사용하세요. 노란 음영은 작업 공간입니다.</p>`;
    } else if (tab === 1) {
      const z = (l.zones || []).find(z => z.id === zoneId);
      body.innerHTML = `<p>구역은 바닥 표시 전용입니다. 랙 배치·워킹 이동을 막지 않습니다.</p><div class="r3-operation-list">${(l.zones || []).map(z => `<div class="r3-operation-row"><strong>${esc(z.name)}</strong> · ${z.width} × ${z.depth} mm ${button('zone-edit','편집',disabled,z.id)}${button('zone-delete','삭제',disabled,z.id)}</div>`).join('') || '등록된 구역 없음'}</div><label>구역 이름<input name="name" maxlength="100" required value="${esc(z?.name || '')}"></label><label>색상<input name="color" type="color" value="${esc(z?.color || '#277f9a')}"></label><div class="r3-operation-grid">${field('x','좌측 X (mm)',z ? z.x-z.width/2 : 0)}${field('z','상단 Z (mm)',z ? z.z-z.depth/2 : 0)}${field('width','폭 (mm)',z?.width || Math.min(3000,l.width),100)}${field('depth','깊이 (mm)',z?.depth || Math.min(2000,l.depth),100)}</div><div>${button('zone-save',z ? '구역 수정' : '구역 추가',disabled)}${button('zone-new','새 구역',disabled)}</div>`;
    } else if (tab === 2) {
      const diffs = layoutDiff(compare || c.baseline, l, c.racks);
      body.innerHTML = `<p>기준: ${compare ? '선택한 배치안' : '마지막 저장본'} / 비교 대상: 현재 편집본</p><p class="r3-zone-legend">빨강: 이전 위치·삭제 / 초록: 추가 / 노랑: 변경</p><div>${button('diff-show','3D 비교 표시')}${button('diff-clear','비교 표시 끄기')}${button('diff-baseline','저장본을 기준으로')}</div><div class="r3-operation-list">${diffs.map(d => `<div class="r3-operation-row"><strong>${esc(d.name || d.key)}</strong> · ${esc(({added:'추가',removed:'삭제',changed:'변경',setting:'설정 변경'})[d.type])}${d.fields ? `<br>${esc(d.fields.join(', '))}` : ''}</div>`).join('') || '변경 사항이 없습니다.'}</div>`;
    } else if (tab === 3) {
      const placed = new Set(l.placements.map(p => p.rack_id)), available = c.racks.filter(r => !placed.has(r.id));
      body.innerHTML = `<p>미배치 랙을 선택한 순서가 아닌 라이브러리 순서로 배치합니다. 좌표는 첫 랙의 좌측 상단 기준입니다. 실패하면 전체 배치를 유지합니다.</p><div class="r3-operation-list">${available.map(r => `<label class="r3-check"><input type="checkbox" name="racks" value="${r.id}" checked> ${esc(r.name)} · ${r.width} × ${r.depth} mm</label>`).join('') || '미배치 랙이 없습니다.'}</div><div class="r3-operation-grid">${field('x','시작 X (mm)',0)}${field('z','시작 Z (mm)',0)}${field('columns','한 행의 랙 개수',4,1,1000)}${field('gapX','열 사이 간격 (mm)',600)}${field('gapZ','행 사이 간격 (mm)',1200)}<label>방향<select name="rotation" class="no-ts">${[0,90,180,270].map(n => `<option value="${n}">${n}도</option>`).join('')}</select></label></div>${button('rows','선택 랙 일괄 배치',disabled || !available.length)}`;
    } else if (tab === 4) {
      body.innerHTML = `<p>관리자 전용: 삭제되거나 다른 Location으로 이동한 랙의 배치 참조, 남은 장비 표시 설정과 이미지 참조를 정리합니다. NetBox 랙·장비 자체는 삭제하지 않습니다. 대체 배치안은 유지됩니다.</p>${button('cleanup-preview','정리 대상 미리보기',!c.canCleanup || pending)}${preview ? `<div class="r3-operation-row">랙 ID: ${esc(preview.changes.rack_ids.join(', ') || '없음')}<br>장비 표시 ID: ${esc(preview.changes.device_ids.join(', ') || '없음')}<br>이미지 참조: ${esc(preview.changes.images.join(', ') || '없음')}</div>${button('cleanup-apply','확인 후 참조 정리',!c.canCleanup || pending || !Object.values(preview.changes).some(v => v.length))}` : ''}${!c.canCleanup ? '<p>NetBox 슈퍼유저로 저장된 배치를 열어야 사용할 수 있습니다.</p>' : ''}`;
    } else if (tab === 5) {
      body.innerHTML = `<p>즐겨찾기는 현재 브라우저·Location별로 저장됩니다. 공유 링크는 시점만 포함하며 NetBox 조회 권한을 우회하지 않습니다.</p><label>시점 이름<input name="name" maxlength="100" value="기본 시점"></label><div>${button('camera-save','현재 시점 저장')}${button('camera-share','공유 링크 만들기')}</div><label>공유 링크<input name="share" readonly aria-label="시점 공유 링크"></label><div class="r3-operation-list">${favorites().map(p => `<div class="r3-operation-row">${esc(p.name)} ${button('camera-load','이동',false,p.id)}${button('camera-delete','삭제',false,p.id)}</div>`).join('')}</div>`;
    } else if (tab === 6) {
      body.innerHTML = `<p>Location마다 최대 10개의 배치안을 저장합니다. 불러온 안은 편집본이며 배치 저장을 눌러야 현재 배치가 바뀝니다.</p><label>새 배치안 이름<input name="name" maxlength="100" placeholder="예: 증설 검토안"></label><div>${button('plan-create','현재 편집본을 배치안으로 저장',disabled)}${button('plans','목록 새로고침',pending)}</div><div class="r3-operation-list">${plans.map(p => `<div class="r3-operation-row"><strong>${esc(p.name)}</strong><br>${esc(p.saved_at)}${!p.valid ? '<p>참조가 유효하지 않은 배치안입니다.</p>' : ''}<div>${button('plan-load','불러오기',disabled || !p.valid,p.id)}${button('plan-compare','현재 편집본과 비교',!p.valid,p.id)}${button('plan-rename','이름 변경',disabled,p.id)}${button('plan-delete','삭제',disabled,p.id)}</div></div>`).join('') || '목록 새로고침으로 저장된 배치안을 조회하세요.'}</div>`;
    } else if (tab === 7) {
      const device = c.racks.flatMap(r => r.devices).find(d => d.id === c.selected?.deviceId);
      body.innerHTML = `<p>선택 장비: <strong>${esc(device?.name || '3D 화면에서 장비를 먼저 선택하세요')}</strong></p><p>직접 연결된 케이블만 조회합니다. 패치 패널을 통과한 전체 경로 추적은 포함하지 않습니다. 선은 랙 간 연결 개요이며 실제 케이블 경로·길이가 아닙니다.</p><div>${button('cables','선택 장비 케이블 조회',pending || !device)}${button('cables-clear','연결선 숨기기')}</div><div class="r3-operation-list">${cables.map(cable => { const url = safeURL(cable.url); return `<div class="r3-operation-row"><strong>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(cable.label)}</a>` : esc(cable.label)}</strong> · ${esc(cable.status)}<br>${cable.ends.map(e => `${esc(e.side)}: ${esc(e.device)} / ${esc(e.port)}${l.placements.some(p => p.rack_id === e.rack_id) ? '' : ' (방 밖 또는 미배치)'}`).join('<br>')}</div>`; }).join('') || '조회 결과가 없습니다.'}</div>`;
    } else {
      capacityTools.render(tab - 8);
    }
  }
  let showDiff = false;
  function refresh() {
    const c = get(); launcher.disabled = !c.layout || c.busy;
    if (!c.layout) return;
    if (location !== c.locationId) { location = c.locationId; plans = []; preview = null; compare = null; cables = []; showDiff = false; zoneId = null; if (dialog.open) { render(); message(); } }
    if (selectedDevice !== c.selected?.deviceId) { selectedDevice = c.selected?.deviceId; cables = []; if (dialog.open && tab === 7) render(); }
    overlays.update(c.layout,c.racks,showDiff ? layoutDiff(compare || c.baseline,c.layout,c.racks) : [],cables);
    capacityTools.sync();
    if (!shareApplied) {
      shareApplied = true;
      try { const encoded = new URLSearchParams(window.location.hash.slice(1)).get('view'); if (encoded && encoded.length < 2000) { const camera = JSON.parse(encoded); if (validCamera(camera)) requestAnimationFrame(() => { if (location === c.locationId) restoreCamera(camera); }); } } catch { /* Invalid shared views never prevent loading the room. */ }
    }
  }
  async function request(resource,payload,query = '') {
    const before = get(), id = before.locationId, snapshot = JSON.stringify(before.layout);
    pending = true; before.setBusy(true); render();
    try {
      const result = await operation(before,resource,payload,query);
      if (get().locationId !== id || JSON.stringify(get().layout) !== snapshot) throw new Error('화면이 변경되었습니다. 다시 조회하세요.');
      return result;
    } finally { pending = false; before.setBusy(false); }
  }
  async function action(name,id) {
    const c = get(), next = structuredClone(c.layout);
    if (name === 'close') { dialog.close(); return; }
    if (pending) return;
    if (await capacityTools.action(name,id)) return;
    if (name === 'clearance') { if (!body.reportValidity()) return; next.clearance = { enabled:body.elements.enabled.checked, front:num('front'), rear:num('rear') }; apply(next,false); }
    if (name === 'zone-edit') { zoneId = id; render(); }
    if (name === 'zone-new') { zoneId = null; render(); }
    if (name === 'zone-save') {
      if (!body.reportValidity()) return;
      const zone = { id:zoneId || crypto.randomUUID(), name:value('name').trim(), color:value('color'), width:num('width'), depth:num('depth'), x:num('x')+num('width')/2, z:num('z')+num('depth')/2 };
      next.zones = [...(next.zones || []).filter(z => z.id !== zone.id),zone]; apply(next); zoneId = null; render();
    }
    if (name === 'zone-delete') { next.zones = (next.zones || []).filter(z => z.id !== id); apply(next); zoneId = null; render(); }
    if (name === 'diff-show') { showDiff = true; refresh(); message('비교 표시를 켰습니다. 닫기를 누르면 3D 화면에서 확인할 수 있습니다.'); }
    if (name === 'diff-clear') { showDiff = false; refresh(); }
    if (name === 'diff-baseline') { compare = null; render(); refresh(); }
    if (name === 'rows') { if (!body.reportValidity()) return; apply(placeRows(next,c.racks,[...body.querySelectorAll('input[name=racks]:checked')].map(el => Number(el.value)), { x:num('x'),z:num('z'),columns:num('columns'),gapX:num('gapX'),gapZ:num('gapZ'),rotation:num('rotation') })); render(); }
    if (name === 'cleanup-preview') { preview = await request('cleanup'); render(); message(`대상을 확인하세요. 저장하지 않은 변경은 실행 시 폐기됩니다.${preview.changes.planned_ids?.length ? ` 가상 장비 참조: ${preview.changes.planned_ids.join(', ')}` : ''}`); }
    if (name === 'cleanup-apply') {
      if (!preview || !confirm('표시한 참조를 정리하고 저장하지 않은 편집을 버릴까요? NetBox 랙이나 장비 자체는 삭제하지 않습니다.')) return;
      const result = await request('cleanup',{ revision:preview.revision,token:preview.token,confirm:true }); get().replace(result); preview = null; render(); message('참조를 정리하고 저장했습니다.');
    }
    if (name === 'camera-save') { const name = value('name').trim(); if (!name || name.length > 100) throw new Error('이름을 1~100자로 입력하세요.'); const list = favorites(); if (list.length >= 20) throw new Error('시점은 최대 20개입니다.'); list.push({id:crypto.randomUUID(),name,camera:capture()}); localStorage.setItem(favoritesKey(),JSON.stringify(list)); render(); message('현재 브라우저에 시점을 저장했습니다.'); }
    if (name === 'camera-load') { const item = favorites().find(p => p.id === id); if (item) restoreCamera(item.camera); }
    if (name === 'camera-delete') { localStorage.setItem(favoritesKey(),JSON.stringify(favorites().filter(p => p.id !== id))); render(); }
    if (name === 'camera-share') { const url = new URL(window.location.href); url.searchParams.set('location',c.locationId); url.hash = new URLSearchParams({view:JSON.stringify(capture())}).toString(); body.elements.share.value = url.href; body.elements.share.select(); message('공유 링크를 선택했습니다. 복사해서 전달하세요.'); }
    if (name === 'plans') { const result = await request('plans'); plans = result.plans; render(); }
    if (['plan-create','plan-rename','plan-delete'].includes(name)) {
      if (!c.editable) throw new Error('읽기 전용입니다.');
      const action = name.slice(5), payload = { action,id,revision:c.layout.revision };
      if (action === 'create') { payload.name = value('name'); payload.layout = c.layout; const issues = errors(c.layout,c.racks); if (issues.length) throw new Error(issues.join(' / ')); }
      if (action === 'rename') { payload.name = prompt('새 배치안 이름',plans.find(p => p.id === id)?.name); if (payload.name === null) return; }
      if (action === 'delete' && !confirm('이 배치안을 삭제할까요? 현재 배치는 유지됩니다.')) return;
      const result = await request('plans',payload); get().revision(result.revision); plans = result.plans; render(); message('배치안 목록을 저장했습니다. 현재 편집본은 유지됩니다.');
    }
    if (name === 'plan-load') { const plan = plans.find(p => p.id === id); if (plan?.valid && confirm('현재 편집본을 선택한 배치안으로 바꿀까요? 적용 후 배치 저장이 필요합니다.')) { await c.restore(plan.layout); render(); message('배치안을 편집본으로 불러왔습니다. 배치 저장으로 확정하세요.'); } }
    if (name === 'plan-compare') { compare = structuredClone(plans.find(p => p.id === id)?.layout); if (compare) { tab = 2; showDiff = true; render(); refresh(); } }
    if (name === 'cables') { const result = await request('cables',undefined,`?device=${c.selected.deviceId}`); cables = result.cables; render(); refresh(); message(result.demo ? '데모에는 실제 NetBox 케이블이 없습니다.' : `${cables.length}개 직접 연결${result.truncated ? ' (최대 500개)' : ''}`); }
    if (name === 'cables-clear') { cables = []; refresh(); render(); }
  }
  launcher.addEventListener('click',() => { refresh(); render(); message(); dialog.showModal(); });
  dialog.addEventListener('click',event => {
    const target = event.target.closest('button'); if (!target) return;
    if (target.dataset.tab !== undefined && !pending) { tab = Number(target.dataset.tab); render(); message(); return; }
    if (target.dataset.op) action(target.dataset.op,target.dataset.id).catch(error => { render(); message(error.message,true); });
  });
  body.addEventListener('submit',event => event.preventDefault());
  dialog.addEventListener('cancel',event => { if (pending) event.preventDefault(); });
  return { refresh, dispose:() => { overlays.dispose(); capacityTools.dispose(); dialog.remove(); launcher.remove(); } };
}
