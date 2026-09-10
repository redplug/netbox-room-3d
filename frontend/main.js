import { rackUsage, deviceMatches, searchIPs } from './inventory.js';
import './style.css';
import { objectTypes } from './objects.js';
import { API } from './api.js';
import { RoomScene } from './scene.js';
import { dimensions, deviceBottom, errors, safeURL, snap } from './geometry.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = value => structuredClone(value);
const root = document.querySelector('#room3d');
const api = new API(root);
let data, layout, baseline, baselineRacks, locationId, locations = [], selected = null, scene, dirty = false, busy = false, undo = [], dragBefore;
let onlyRackLocations = false;
let mode = '3d', filter = '', showPlaced = false, loadGeneration = 0;
const opts = { units: true, usage: true, statuses: true, statusFilter: '', grid: true, walls: true, labels: true, transparent: true, sides: false, deviceColors: false, snap: true };

root.innerHTML = `
  <div class="r3-app">
    <div class="r3-location-bar"><label>LOCATION <select class="no-ts" id="r3-location" aria-label="Location 선택"></select></label><label class="r3-check"><input type="checkbox" id="r3-only-rack-locations"> 랙이 배치된 Location만</label><span id="r3-room-summary"></span><div class="r3-location-actions"><button class="r3-btn small" data-action="room">서버실 설정</button><button class="r3-btn small" data-action="reload">다시 불러오기</button><span id="r3-save-state" role="status">불러오는 중</span><button data-action="cancel" class="r3-btn small">취소</button><button data-action="save" class="r3-btn small primary">배치 저장</button></div></div>
    <div id="r3-notice" role="status" aria-live="polite" hidden></div>
    <div class="r3-workspace">
      <aside class="r3-library"><div class="r3-section-title"><h2>랙 라이브러리</h2><span id="r3-rack-count"></span></div><p class="r3-help">기존 랙을 화면으로 끌어다 배치하세요.</p><input id="r3-search" type="search" placeholder="랙 · 서버명 · IP 검색" aria-label="랙 또는 서버 검색"><label>장비 상태<select class="no-ts" id="r3-status-filter"><option value="">전체 상태</option></select></label><div id="r3-search-results"></div><label class="r3-check"><input type="checkbox" id="r3-show-placed"> 배치된 랙 포함</label><div id="r3-rack-list"></div><div class="r3-library-bottom"><span class="r3-eyebrow">ROOM OBJECTS</span><label>오브젝트 종류<select class="no-ts" id="r3-object-type" aria-label="오브젝트 종류">${Object.entries(objectTypes).map(([type, o]) => `<option value="${type}">${o.name}</option>`).join('')}</select></label><button data-action="add-block" class="r3-btn wide">＋ 룸 오브젝트 추가</button><div id="r3-block-list"></div></div></aside>
      <main class="r3-stage"><div class="r3-toolbar"><div class="r3-segment"><button data-action="view" data-view="3d" class="active">3D 보기</button><button data-action="view" data-view="top">평면 배치</button><button data-action="view" data-view="walk">워킹 모드</button></div><div class="r3-tools"><button data-action="fit" title="전체 보기">전체 보기</button><button data-action="undo" title="되돌리기">↶ 되돌리기</button><label><input id="r3-snap" type="checkbox" checked> 격자 맞춤</label></div></div><div id="r3-canvas"></div><div class="r3-stage-footer"><span id="r3-scene-stats"></span><span id="r3-controls-help">드래그 회전 · 우클릭 이동 · 휠 확대</span></div><div id="r3-invalid" role="alert" hidden></div></main>
      <aside id="r3-inspector" class="r3-inspector"></aside>
    </div>
    <footer class="r3-footer"><span><i></i> ${api.demo ? '샘플 데이터 · 이 브라우저에 저장됩니다' : 'NetBox 인벤토리 · 레이아웃만 저장됩니다'}</span><div><label><input id="r3-units" type="checkbox" checked> U 번호·빈 슬롯</label><label><input id="r3-usage" type="checkbox" checked> 사용 현황</label><label><input id="r3-statuses" type="checkbox" checked> 상태 표시</label><label><input id="r3-grid" type="checkbox" checked> 격자</label><label><input id="r3-walls" type="checkbox" checked> 벽</label><label><input id="r3-labels" type="checkbox" checked> 이름</label><label><input id="r3-transparent" type="checkbox" checked> 투명 프레임</label><label><input id="r3-sides" type="checkbox"> 랙 측면 덮개</label><label><input id="r3-deviceColors" type="checkbox"> 서버 상·하단 할당 색상</label></div></footer>
  </div>
  <dialog id="r3-room-dialog"><form id="r3-room-form"><div class="r3-dialog-title"><h2>서버실 기본 설정</h2><button type="button" class="r3-icon-button" data-action="close-room" aria-label="닫기">×</button></div><p>선택한 Location에 공간을 연결합니다. 모든 치수는 mm입니다.</p><label>서버실 이름<input name="name" required maxlength="100"></label><div class="r3-form-grid"><label>가로 (mm)<input type="number" name="width" min="500" max="100000" required></label><label>세로 (mm)<input type="number" name="depth" min="500" max="100000" required></label><label>높이 (mm)<input type="number" name="height" min="500" max="100000" required></label><label>격자 크기 (mm)<input type="number" name="grid" min="100" max="5000" required></label></div><label class="r3-check"><input name="include_descendants" type="checkbox"> 하위 Location의 랙 포함</label><p class="r3-help">공간을 줄이면 기존 배치가 경계를 벗어날 수 있습니다.</p><div class="r3-dialog-actions"><button type="button" data-action="close-room" class="r3-btn">닫기</button><button type="submit" class="r3-btn primary">설정 적용</button></div></form></dialog>`;
const $ = selector => root.querySelector(selector);
function fitViewport() {
  const top = Math.max(0, root.getBoundingClientRect().top);
  const height = Math.max(240, (window.visualViewport?.height || window.innerHeight) - top - 12);
  const value = `${Math.floor(height)}px`;
  if (root.style.getPropertyValue('--r3-available-height') !== value) root.style.setProperty('--r3-available-height', value);
}
fitViewport();
window.addEventListener('resize', fitViewport);
window.visualViewport?.addEventListener('resize', fitViewport);
document.addEventListener('fullscreenchange', fitViewport);
const viewportObserver = new ResizeObserver(fitViewport);
viewportObserver.observe(root.parentElement);
document.fonts?.ready.then(fitViewport);
function notice(message = '', error = false) { const el = $('#r3-notice'); el.textContent = message; el.hidden = !message; el.className = error ? 'error' : ''; }
function remember() { undo.push({ layout: clone(layout), racks: data.racks }); if (undo.length > 30) undo.shift(); }
function changed(keepInspector = false) { dirty = JSON.stringify(layout) !== JSON.stringify(baseline); render(keepInspector); }
function canEdit() { return !!data?.can_edit && !busy; }
function setBusy(value) { busy = value; render(); }
function numberField(label, key, value, kind = 'placement', disabled = false, min = 0) {
  return `<label>${label}<input type="number" min="${min}" step="any" data-edit="${kind}" data-key="${key}" value="${esc(value)}" ${disabled || !canEdit() ? 'disabled' : ''}></label>`;
}
function link(url, text) { const safe = safeURL(url); return safe ? `<a href="${esc(safe)}" target="_blank" rel="noopener noreferrer">${text} ↗</a>` : `<span class="r3-help">샘플 장비</span>`; }
function renderLocations() {
  const visible = locations.filter(l => !onlyRackLocations || l.has_racks);
  const currentVisible = visible.some(l => l.id === locationId);
  const placeholder = !currentVisible ? `<option value="" disabled selected>${visible.length ? 'Location 선택 (현재 화면 유지)' : '조건에 맞는 Location이 없습니다'}</option>` : '';
  $('#r3-location').innerHTML = placeholder + visible.map(l => `<option value="${l.id}">${esc(l.site)} / ${esc(l.name)}</option>`).join('');
  if (currentVisible) $('#r3-location').value = String(locationId);
  $('#r3-location').disabled = busy || !visible.length;
  $('#r3-only-rack-locations').disabled = busy;
}
function render(keepInspector = false, syncScene = true) {
  if (!data || !layout) return;
  const problems = errors(layout, data.racks);
  $('#r3-save-state').textContent = !data.can_edit ? '읽기 전용' : busy ? '처리 중…' : dirty ? '저장하지 않은 변경' : `저장됨 · v${layout.revision}`;
  $('#r3-save-state').className = dirty ? 'unsaved' : '';
  $('[data-action=save]').disabled = !canEdit() || !dirty || problems.length > 0;
  $('[data-action=cancel]').disabled = busy || !dirty;
  $('[data-action=undo]').disabled = !canEdit() || !undo.length;
  $('[data-action=add-block]').disabled = !canEdit();
  renderLocations();
  $('[data-action=room]').disabled = !canEdit();
  $('#r3-room-summary').textContent = `${layout.name} · ${layout.width / 1000} × ${layout.depth / 1000} m · ${layout.height / 1000} m 높이`;
  $('#r3-rack-count').textContent = `${data.racks.length}`;
  const placed = new Set(layout.placements.map(p => p.rack_id));
  const query = filter.trim().toLowerCase();
  const statuses = new Map(data.racks.flatMap(r => r.devices.map(d => [d.status, d.status_label || d.status])));
  if (opts.statusFilter && !statuses.has(opts.statusFilter)) opts.statusFilter = '';
  $('#r3-status-filter').innerHTML = '<option value="">전체 상태</option>' + [...statuses].map(([s, label]) => `<option value="${esc(s)}" ${opts.statusFilter === s ? 'selected' : ''}>${esc(label)}</option>`).join('');
  const matches = data.racks.flatMap(r => r.devices.filter(d => deviceMatches(d, query, opts.statusFilter)).map(d => ({ r, d })));
  $('#r3-search-results').innerHTML = query || opts.statusFilter ? `<p class="r3-help">장비 검색 ${matches.length}개 · 현재 Location</p>` + matches.map(({r,d}) => `<button class="r3-btn wide" data-action="find-device" data-rack-id="${r.id}" data-id="${d.id}">${esc(d.name)} · ${esc(r.name)} · ${esc(d.status_label || d.status)}${placed.has(r.id) ? '' : ' · 미배치'}<small class="r3-result-ips">${searchIPs(d, query).matched ? '일치 IP' : 'IP'}: ${searchIPs(d, query).ips.map(ip => esc(ip)).join(' · ') || '조회 가능한 IP 없음'}</small></button>`).join('') : '';
  const filtered = data.racks.filter(r => (showPlaced || query || opts.statusFilter || !placed.has(r.id)) && (!opts.statusFilter || r.devices.some(d => d.status === opts.statusFilter)) && (!query || r.name.toLowerCase().includes(query) || r.devices.some(d => deviceMatches(d, query, opts.statusFilter))));
  $('#r3-rack-list').innerHTML = filtered.length ? filtered.map(r => `<div class="r3-rack-card ${selected?.rackId === r.id ? 'selected' : ''}" draggable="${canEdit() && !placed.has(r.id)}" data-rack="${r.id}"><button class="r3-rack-select" data-action="select" data-id="${r.id}"><span class="r3-rack-icon">▥</span><span><strong>${esc(r.name)}</strong><small>${r.u_height}U · ${r.width} × ${r.depth} mm</small></span></button><div class="r3-rack-meta"><span>${r.devices.length} 장비 · ${rackUsage(r).used}/${r.u_height}U · 잔여 ${rackUsage(r).free}U</span><button data-action="${placed.has(r.id) ? 'select' : 'place'}" data-id="${r.id}" ${!placed.has(r.id) && !canEdit() ? 'disabled' : ''}>${placed.has(r.id) ? '배치됨 ↗' : '＋ 배치'}</button></div></div>`).join('') : '<div class="r3-empty">미배치 랙이 없습니다.<br>배치된 랙 포함을 켜서 확인하세요.</div>';
  $('#r3-block-list').innerHTML = layout.blocks.map(b => `<button class="r3-block-item" data-action="select-block" data-id="${esc(b.id)}">▧ ${esc(b.name)}</button>`).join('');
  $('#r3-scene-stats').textContent = `${layout.placements.length} / ${data.racks.length} 랙 배치 · ${data.racks.filter(r => placed.has(r.id)).reduce((n, r) => n + r.devices.length, 0)} 장비`;
  $('#r3-invalid').hidden = !problems.length; $('#r3-invalid').textContent = problems.length ? `저장 전 확인 · ${problems.slice(0, 3).join(' / ')}` : '';
  $('#r3-controls-help').textContent = mode === 'walk' ? 'WASD / 방향키 이동 · 드래그 둘러보기 · Shift 빠르게 · Esc 종료' : mode === 'top' ? '랙 드래그 배치 · 우클릭 이동 · 휠 확대' : '드래그 회전 · 우클릭 이동 · 휠 확대';
  $('[data-action=fit]').textContent = mode === 'walk' ? '시작 위치' : '전체 보기';
  $('[data-action=fit]').title = mode === 'walk' ? '워킹 시작 위치로 이동' : '전체 보기';
  root.querySelectorAll('[data-action=view]').forEach(b => b.classList.toggle('active', b.dataset.view === mode));
  if (!keepInspector) inspector();
  root.querySelectorAll('select').forEach(el => el.classList.add('no-ts'));
  if (syncScene) scene?.update(layout, data.racks, selected, { ...opts, editable: canEdit() });
}
function inspector() {
  const panel = $('#r3-inspector');
  if (selected?.blockId) {
    const b = layout.blocks.find(b => b.id === selected.blockId);
    if (!b) { selected = null; return inspector(); }
    panel.innerHTML = `<div class="r3-section-title"><h2>${esc(objectTypes[b.type || 'pillar']?.name || '룸 오브젝트')}</h2><span class="r3-tag">BLOCK</span></div><label>이름<input data-edit="block" data-key="name" value="${esc(b.name)}" maxlength="100" ${!canEdit() ? 'disabled' : ''}></label><div class="r3-form-grid">${numberField('X (mm)', 'x', b.x, 'block')}${numberField('Z (mm)', 'z', b.z, 'block')}${numberField('폭 (mm)', 'width', b.width, 'block', false, 100)}${numberField('깊이 (mm)', 'depth', b.depth, 'block', false, 100)}${numberField('높이 (mm)', 'height', b.height, 'block', false, 100)}</div><label>방향<select data-edit="block" data-key="rotation" ${!canEdit() ? 'disabled' : ''}>${[0, 90, 180, 270].map(n => `<option value="${n}" ${n === (b.rotation || 0) ? 'selected' : ''}>${n}°</option>`).join('')}</select></label><p class="r3-help">평면 모드에서 드래그하거나 좌표를 입력하세요. 문은 닫힌 문으로 표시합니다.</p><button data-action="remove-block" class="r3-btn danger wide" ${!canEdit() ? 'disabled' : ''}>블록 제거</button>`; return;
  }
  const rack = data.racks.find(r => r.id === selected?.rackId);
  if (!rack) { panel.innerHTML = '<div class="r3-section-title"><h2>선택 정보</h2></div><div class="r3-inspector-empty"><span>◇</span><h3>공간을 구성해 보세요</h3><p>랙을 선택하면 위치와 치수를<br>조정하고 내부 장비를 확인할 수 있습니다.</p></div><div class="r3-tip"><strong>시작하기</strong><p>① 서버실 크기를 설정하세요.<br>② 평면 모드에서 랙을 배치하세요.<br>③ 3D로 앞뒤를 확인하고 저장하세요.</p></div>'; return; }
  const placement = layout.placements.find(p => p.rack_id === rack.id), dims = dimensions(rack, placement);
  const device = rack.devices.find(d => d.id === selected.deviceId);
  const unmanaged = rack.devices.filter(d => deviceBottom(rack, d) == null);
  panel.innerHTML = `<div class="r3-section-title"><h2>${esc(rack.name)}</h2><span class="r3-tag">${rack.u_height}U</span></div>${link(rack.url, 'NetBox 랙 상세')}<div class="r3-view-buttons"><button data-action="front" ${!placement ? 'disabled' : ''}>전면 보기</button><button data-action="rear" ${!placement ? 'disabled' : ''}>후면 보기</button></div>
    ${placement ? `<div class="r3-subtitle">배치 좌표 <label class="r3-check"><input type="checkbox" data-edit="placement" data-key="locked" ${placement.locked ? 'checked' : ''} ${!canEdit() ? 'disabled' : ''}> 잠금</label></div><div class="r3-form-grid">${numberField('X (mm)', 'x', placement.x, 'placement', placement.locked)}${numberField('Z (mm)', 'z', placement.z, 'placement', placement.locked)}</div><label>방향<select data-edit="placement" data-key="rotation" ${placement.locked || !canEdit() ? 'disabled' : ''}>${[0, 90, 180, 270].map(n => `<option value="${n}" ${n === placement.rotation ? 'selected' : ''}>${n}°</option>`).join('')}</select></label><details><summary>랙 표시 치수 보정</summary><p class="r3-help">원본 랙 치수는 변경되지 않습니다.${rack.estimated.length ? ' 일부 치수는 추정값입니다.' : ''}</p><div class="r3-form-grid">${numberField('폭 (mm)', 'width', dims.width, 'dimensions', placement.locked, 100)}${numberField('깊이 (mm)', 'depth', dims.depth, 'dimensions', placement.locked, 100)}${numberField('높이 (mm)', 'height', dims.height, 'dimensions', placement.locked, 100)}</div></details><button data-action="unplace" class="r3-btn danger wide" ${placement.locked || !canEdit() ? 'disabled' : ''}>배치 해제</button>` : `<p class="r3-help">아직 배치되지 않은 랙입니다.</p><button data-action="place" data-id="${rack.id}" class="r3-btn primary wide" ${!canEdit() ? 'disabled' : ''}>서버실에 배치</button>`}
    <div class="r3-subtitle">장비 <span>${rack.devices.length}</span></div>${rack.desc_units ? '<p class="r3-help">U 번호: 위에서 아래로 증가</p>' : ''}${unmanaged.length ? `<p class="r3-warning">위치 없음·0U·범위 초과 ${unmanaged.length}개: 목록에서만 표시</p>` : ''}<div class="r3-devices">${rack.devices.filter(d => !opts.statusFilter || d.status === opts.statusFilter).map(d => `<button data-action="device" data-id="${d.id}" class="r3-device ${device?.id === d.id ? 'active' : ''}"><i style="background:${esc(layout.appearances[String(d.id)]?.color || d.color)}"></i><span>${esc(d.name)}<small>${esc(d.model)}</small></span><b>${d.position == null ? '—' : 'U' + d.position}</b></button>`).join('') || '<p class="r3-help">장비가 없습니다.</p>'}</div>${device ? deviceInspector(device) : '<p class="r3-help">장비를 선택하면 이미지와 색상을 설정할 수 있습니다.</p>'}`;
}
function deviceInspector(d) {
  const style = layout.appearances[String(d.id)] || {};
  const previews = ['front', 'rear'].map(face => {
    const image = d.images.find(i => i.id === style[`${face}_image_id`])?.url || d[`${face}_image`];
    // Demo images are authored local SVG data, NetBox images must be HTTP(S).
    const url = api.demo ? image : safeURL(image);
    return `<div class="r3-face-preview"><span>${face === 'front' ? '전면' : '후면'}</span>${url ? `<img src="${esc(url)}" alt="${esc(d.name)} ${face === 'front' ? '전면' : '후면'} 이미지">` : `<div style="background:${esc(style.color || d.color)}">설정 색상</div>`}</div>`;
  }).join('');
  return `<div class="r3-device-detail"><div class="r3-subtitle">${esc(d.name)}</div><p class="r3-help">${d.u_height}U · ${d.face === 'rear' ? '후면 장착' : '전면 장착'} · ${esc(d.status)}</p>${link(d.url, 'NetBox 장비 상세')}<div class="r3-previews">${previews}</div><label>이미지가 없는 면의 색상<input type="color" data-edit="appearance" data-key="color" value="${esc(style.color || d.color)}" ${!canEdit() ? 'disabled' : ''}></label>${numberField('표시 깊이 (mm, 빈 값은 추정)', 'depth', style.depth ?? '', 'appearance', false, 20)}${['front', 'rear'].map(face => `<label>${face === 'front' ? '전면' : '후면'} 이미지<select data-edit="appearance" data-key="${face}_image_id" ${!canEdit() ? 'disabled' : ''}><option value="">Device Type 이미지 사용</option>${d.images.map(i => `<option value="${i.id}" ${style[`${face}_image_id`] === i.id ? 'selected' : ''}>${esc(i.name)}</option>`).join('')}</select></label>`).join('')}<button data-action="reset-appearance" class="r3-btn small" ${!canEdit() ? 'disabled' : ''}>장비 표시 설정 초기화</button></div>`;
}
async function load(id) {
  const generation = ++loadGeneration;
  busy = true; $('#r3-location').disabled = true; notice('서버실 정보를 불러오고 있습니다.');
  try {
    const next = await api.load(id);
    if (generation !== loadGeneration) return;
    data = next; layout = clone(next.layout); baseline = clone(layout); baselineRacks = data.racks; locationId = id;
    selected = layout.placements[0] ? { rackId: layout.placements[0].rack_id } : null; undo = []; dirty = false;
    $('#r3-location').value = String(id); notice(data.warning);
    busy = false; render(); scene?.view(mode, selected);
  } catch (error) { if (generation !== loadGeneration) return; busy = false; $('#r3-location').disabled = false; notice(error.message, true); if (locationId) $('#r3-location').value = String(locationId); render(); }
}
function place(id, x = layout.width / 2, z = layout.depth / 2, renderAfter = true) {
  if (!canEdit() || !data.racks.some(r => r.id === id) || layout.placements.some(p => p.rack_id === id)) return;
  remember(); layout.placements.push({ rack_id: id, x: snap(x, layout.grid, opts.snap), z: snap(z, layout.grid, opts.snap), rotation: 0, locked: false, dimensions: {} });
  selected = { rackId: id }; if (renderAfter) changed(); notice('랙을 배치했습니다. 평면 모드에서 위치를 조정한 뒤 저장하세요.');
}
root.addEventListener('dragstart', e => { const card = e.target.closest('[data-rack]'); if (card) { e.dataTransfer.setData('text/plain', card.dataset.rack); e.dataTransfer.effectAllowed = 'copy'; } });
root.addEventListener('click', async e => {
  const button = e.target.closest('[data-action]'); if (!button || button.disabled || !layout) return;
  const action = button.dataset.action, id = Number(button.dataset.id);
  if (action === 'find-device' || scene.drag) return;
  try {
    if (action === 'select') { selected = { rackId: id }; }
    else if (action === 'select-block') { selected = { blockId: button.dataset.id }; }
    else if (action === 'device') { selected.deviceId = id; }
    else if (action === 'place') place(id, undefined, undefined, false);
    else if (action === 'view') { mode = button.dataset.view; scene.view(mode, selected); mode = scene.mode; }
    else if (action === 'fit') scene.view(mode, selected);
    else if (action === 'front' || action === 'rear') { mode = '3d'; scene.view(action, selected); }
    else if (action === 'save' && canEdit() && !errors(layout, data.racks).length) {
      setBusy(true); const result = await api.save(locationId, layout); data = result; layout = clone(result.layout); baseline = clone(layout); baselineRacks = data.racks; dirty = false; undo = []; notice('배치를 저장했습니다.');
    } else if (action === 'cancel') { layout = clone(baseline); data.racks = baselineRacks; dirty = false; undo = []; notice('저장 전 변경을 취소했습니다.'); }
    else if (action === 'reload') { if (!dirty || window.confirm('저장하지 않은 변경을 버리고 다시 불러올까요?')) await load(locationId); }
    else if (action === 'undo' && canEdit() && undo.length) { const previous = undo.pop(); layout = previous.layout; data.racks = previous.racks; dirty = JSON.stringify(layout) !== JSON.stringify(baseline); }
    else if (action === 'room') { const form = $('#r3-room-form'); for (const key of ['name', 'width', 'depth', 'height', 'grid']) form.elements[key].value = layout[key]; form.elements.include_descendants.checked = layout.include_descendants; $('#r3-room-dialog').showModal(); }
    else if (action === 'close-room') $('#r3-room-dialog').close();
    else if (action === 'unplace' && canEdit()) { const placement = layout.placements.find(p => p.rack_id === selected.rackId); if (!placement.locked) { remember(); layout.placements = layout.placements.filter(p => p.rack_id !== selected.rackId); } }
    else if (action === 'add-block' && canEdit()) { const type = $('#r3-object-type').value, preset = objectTypes[type];
      if (!preset) return;
      const id = crypto.randomUUID(), block = { id, type, name: preset.name, rotation: 0, width: Math.min(preset.width, layout.width), depth: Math.min(preset.depth, layout.depth), height: Math.min(preset.height, layout.height), x: layout.width / 2, z: layout.depth / 2 };
      let found = false;
      for (let z = block.depth / 2; z <= layout.depth - block.depth / 2 && !found; z += Math.max(100, layout.grid, layout.depth / 80)) {
        for (let x = block.width / 2; x <= layout.width - block.width / 2; x += Math.max(100, layout.grid, layout.width / 80)) {
          block.x = x; block.z = z;
          if (!errors({ ...layout, blocks: [...layout.blocks, block] }, data.racks).length) { found = true; break; }
        }
      }
      if (!found) { block.x = layout.width / 2; block.z = layout.depth / 2; notice('빈 공간이 부족합니다. 좌표와 크기를 조정한 뒤 저장하세요.', true); }
      remember(); layout.blocks.push(block); selected = { blockId: id }; }
    else if (action === 'remove-block' && canEdit()) { remember(); layout.blocks = layout.blocks.filter(b => b.id !== selected.blockId); selected = null; }
    else if (action === 'reset-appearance' && canEdit()) { remember(); delete layout.appearances[String(selected.deviceId)]; }
  } catch (error) { notice(error.message, true); }
  finally { busy = false; if (layout) { dirty = JSON.stringify(layout) !== JSON.stringify(baseline); render(false, !['view', 'fit', 'front', 'rear', 'room', 'close-room'].includes(action)); if (['select', 'device'].includes(action) && selected && layout.placements.some(p => p.rack_id === selected.rackId)) { if (filter.trim()) { mode = '3d'; scene.view('front', selected); render(false, false); } scene.highlight(selected); } } }
});
root.addEventListener('click', e => {
  const button = e.target.closest('[data-action=find-device]'); if (!button || !layout) return;
  selected = { rackId: Number(button.dataset.rackId), deviceId: Number(button.dataset.id) };
  if (layout.placements.some(p => p.rack_id === selected.rackId)) { mode = '3d'; scene.view('front', selected); render(); scene.highlight(selected); }
  else { render(); notice('미배치 랙의 장비입니다. 랙을 배치하면 3D 위치로 이동할 수 있습니다.'); }
});
root.addEventListener('input', e => { if (e.target.id === 'r3-search') { filter = e.target.value; scene.clearFocus(); render(false, false); } });
root.addEventListener('change', async e => {
  const el = e.target;
  if (el.id === 'r3-status-filter') { opts.statusFilter = el.value; render(); return; }
  if (el.id === 'r3-only-rack-locations') { onlyRackLocations = el.checked; renderLocations(); return; }
  if (el.id === 'r3-location') { if (!dirty || window.confirm('저장하지 않은 변경을 버리고 Location을 전환할까요?')) await load(Number(el.value)); else el.value = String(locationId); return; }
  if (el.id === 'r3-show-placed') { showPlaced = el.checked; render(); return; }
  for (const key of Object.keys(opts)) if (el.id === `r3-${key}`) { opts[key] = el.checked; render(); return; }
  if (!el.dataset.edit || !canEdit()) return;
  const key = el.dataset.key, kind = el.dataset.edit;
  let value = el.type === 'checkbox' ? el.checked : el.type === 'number' || el.tagName === 'SELECT' ? el.value === '' ? null : Number(el.value) : el.value;
  if (el.type === 'number' && ((el.value === '' && kind !== 'appearance') || (el.value !== '' && (!el.validity.valid || !Number.isFinite(value))))) { notice('치수와 좌표 범위를 확인하세요.', true); render(); return; }
  remember();
  if (kind === 'block') layout.blocks.find(b => b.id === selected.blockId)[key] = value;
  else if (kind === 'appearance') { const a = layout.appearances[String(selected.deviceId)] ||= {}; if (value == null) delete a[key]; else a[key] = value; }
  else { const p = layout.placements.find(p => p.rack_id === selected.rackId); if (p.locked && key !== 'locked') return; if (kind === 'dimensions') p.dimensions[key] = value; else p[key] = value; }
  if (kind === 'appearance' && key === 'color') root.querySelectorAll('.r3-face-preview > div').forEach(preview => { preview.style.background = value; });
  // Keep the focused form nodes alive while a blur/change moves into the next field.
  changed(el.type === 'number' || el.type === 'color' || kind === 'block' && key === 'name');
});
$('#r3-room-form').addEventListener('submit', async e => {
  e.preventDefault(); if (!canEdit()) return;
  const form = e.target, next = clone(layout);
  next.name = form.elements.name.value.trim(); if (!next.name) return;
  for (const key of ['width', 'depth', 'height', 'grid']) next[key] = Number(form.elements[key].value);
  next.include_descendants = form.elements.include_descendants.checked;
  try {
    let nextRacks = data.racks;
    if (next.include_descendants !== layout.include_descendants) {
      const updated = await api.load(locationId, next.include_descendants);
      const visible = new Set(updated.racks.map(r => r.id));
      if (next.placements.some(p => !visible.has(p.rack_id))) throw new Error('하위 Location의 배치된 랙을 먼저 배치 해제하세요.');
      const deviceIds = new Set(updated.racks.flatMap(r => r.devices.map(d => String(d.id))));
      if (Object.keys(next.appearances).some(id => !deviceIds.has(id))) throw new Error('하위 Location 장비의 표시 설정을 먼저 초기화하세요.');
      nextRacks = updated.racks;
    }
    remember(); data.racks = nextRacks; layout = next; $('#r3-room-dialog').close(); changed(); scene.view(mode, selected);
  } catch (error) { notice(error.message, true); $('#r3-room-dialog').close(); }
});
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
async function start() {
  try {
    scene = new RoomScene($('#r3-canvas'), {
      exitWalk: () => { mode = '3d'; scene.view(mode, selected); render(); },
      walkError: () => notice('걸어 다닐 빈 공간이 없습니다. 서버실 배치를 확인하세요.', true),
      selectBlock: blockId => { selected = { blockId }; render(); },
      dragStart: hit => { selected = hit.blockId ? { blockId: hit.blockId } : { rackId: hit.rackId }; render(); $('[data-action=save]').disabled = true; },
      dragBlock: (id, x, z) => {
        if (!canEdit()) return;
        const b = layout.blocks.find(b => b.id === id); if (!b) return;
        dragBefore ||= { layout: clone(layout), racks: data.racks };
        b.x = snap(x, layout.grid, opts.snap); b.z = snap(z, layout.grid, opts.snap); selected = { blockId: id }; dirty = true; scene.movePlacement('block', id, b);
      },
      select: (rackId, deviceId) => { selected = { rackId, deviceId }; render(); }, drop: place,
      drag: (id, x, z) => {
        if (!canEdit()) return;
        const p = layout.placements.find(p => p.rack_id === id); if (p.locked) return;
        dragBefore ||= { layout: clone(layout), racks: data.racks }; p.x = snap(x, layout.grid, opts.snap); p.z = snap(z, layout.grid, opts.snap); selected = { rackId: id }; dirty = true; scene.movePlacement('rack', id, p);
      },
      dragEnd: () => { if (dragBefore) { if (JSON.stringify(layout) !== JSON.stringify(dragBefore.layout)) { undo.push(dragBefore); if (undo.length > 30) undo.shift(); } dragBefore = null; } changed(); },
      dragCancel: () => { if (dragBefore) { layout = dragBefore.layout; dragBefore = null; } changed(); },
      imageError: () => notice('일부 이미지를 불러오지 못해 해당 면을 장비 색상으로 표시합니다.', true),
    });
    locations = await api.list(); renderLocations();
    if (!locations.length) { notice('조회할 수 있는 Location이 없습니다. NetBox의 Location과 권한을 확인하세요.', true); return; }
    const requested = Number(root.dataset.initialLocation || new URLSearchParams(window.location.search).get('location'));
    await load(locations.some(l => l.id === requested) ? requested : (locations.find(l => l.configured)?.id || locations[0].id));
  } catch (error) { notice(`뷰어를 시작할 수 없습니다: ${error.message}`, true); }
}
start();
