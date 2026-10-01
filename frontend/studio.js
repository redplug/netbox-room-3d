import { entries, editMany, repeatBlock, measure } from './layout-tools.js';
import { exportPlan } from './plan-export.js';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function createStudio(root, context) {
  const keys = new Set(); let history = [], location;
  const panel = document.createElement('dialog'); panel.id = 'r3-studio';
  panel.innerHTML = `<div class="r3-dialog-title"><h2>배치 도구</h2><button type="button" class="r3-icon-button" data-tool="close" aria-label="배치 도구 닫기">×</button></div>
    <p>대상을 체크하거나 평면에서 Shift+클릭으로 선택하세요. 선택한 대상은 함께 드래그할 수 있습니다.</p>
    <div class="r3-studio-grid"><section><h3>다중 선택 <span id="r3-picked-count"></span></h3><button class="r3-btn small" data-tool="all">전체 선택</button> <button class="r3-btn small" data-tool="none">선택 해제</button><div id="r3-pick-list"></div></section>
    <section><h3>일괄 이동</h3><div class="r3-form-grid"><label>X 이동 (mm)<input id="r3-dx" type="number" value="0"></label><label>Z 이동 (mm)<input id="r3-dz" type="number" value="0"></label></div><button class="r3-btn" data-tool="move" data-write>이동 적용</button>
    <h3>정렬 / 간격</h3><label>정렬 기준<select id="r3-align"><option value="left">좌측</option><option value="right">우측</option><option value="top">상단</option><option value="bottom">하단</option></select></label><button class="r3-btn" data-tool="align" data-write>정렬 적용</button>
    <div class="r3-form-grid"><label>배치 축<select id="r3-axis"><option value="x">가로 X</option><option value="z">세로 Z</option></select></label><label>가장자리 간격 (mm)<input id="r3-gap" type="number" min="0" value="600"></label></div><button class="r3-btn" data-tool="space" data-write>간격 적용</button><p>간격 0은 붙여 배치입니다. 정렬·간격은 충돌 시 거부하며, 이동은 상단 자동 밀림 설정을 따릅니다.</p>
    <h3>룸 오브젝트 반복 복사</h3><div class="r3-form-grid"><label>추가 개수<input id="r3-repeat-count" type="number" min="1" max="199" value="2"></label><label>복사 방향<select id="r3-repeat-direction"><option value="right">오른쪽</option><option value="left">왼쪽</option><option value="down">아래</option><option value="up">위</option></select></label></div><p>위의 가장자리 간격을 사용합니다. 룸 오브젝트 하나를 선택하세요.</p><button class="r3-btn" data-tool="repeat" data-write>반복 복사</button>
    <h3>거리 측정</h3><p id="r3-measure"></p>
    <h3>평면도 내보내기</h3><button class="r3-btn" data-tool="png">PNG 다운로드</button> <button class="r3-btn" data-tool="pdf">PDF 다운로드</button><p>이름·치수·전면 방향을 포함한 전체 평면도입니다.</p>
    <h3>저장 이력</h3><button class="r3-btn" data-tool="history">이력 불러오기</button><div id="r3-history-list"></div><p>최근 20개 저장 전 배치. 복원 후 검토하고 배치 저장을 눌러 확정하세요.</p></section></div><p id="r3-tool-status" role="status"></p>`;
  panel.querySelectorAll('select').forEach(select => select.classList.add('no-ts'));
  root.append(panel);
  const button = document.createElement('button'); button.className = 'r3-btn small'; button.textContent = '배치 도구'; button.id = 'r3-studio-open'; root.querySelector('.r3-location-actions').prepend(button);
  const $ = s => panel.querySelector(s), value = id => $(`#r3-${id}`).value, number = id => { const v = value(id); if (!v.trim() || !Number.isFinite(Number(v))) throw new Error('숫자를 입력하세요.'); return Number(v); };
  function refresh() {
    const c = context(); if (!c.layout) { button.disabled = true; return; } button.disabled = false;
    if (location !== c.locationId) { location = c.locationId; keys.clear(); history = []; $('#r3-history-list').replaceChildren(); }
    const list = entries(c.layout, c.racks), existing = new Set(list.map(e => e.key));
    for (const key of keys) if (!existing.has(key)) keys.delete(key);
    $('#r3-pick-list').innerHTML = list.map(e => `<label class="r3-check"><input type="checkbox" data-pick="${esc(e.key)}" ${keys.has(e.key) ? 'checked' : ''}>${esc(e.name)}${e.locked ? ' (잠금)' : ''}</label>`).join('');
    $('#r3-picked-count').textContent = `${keys.size}개`;
    panel.querySelectorAll('[data-write]').forEach(b => b.disabled = !c.editable);
    const m = measure(c.layout, c.racks, [...keys]), mm = n => `${Math.round(n).toLocaleString()} mm`;
    $('#r3-measure').textContent = !m ? '하나 선택: 벽까지 거리 / 둘 선택: 가장자리 사이 최단 거리' : `첫 선택 대상의 벽까지: 좌 ${mm(m.walls.left)}, 상 ${mm(m.walls.top)}, 우 ${mm(m.walls.right)}, 하 ${mm(m.walls.bottom)}${m.distance !== undefined ? ` / 대상 사이: ${mm(m.distance)} (X ${mm(m.x)}, Z ${mm(m.z)})` : ''}`;
    c.mark([...keys]);
  }
  button.onclick = () => { refresh(); panel.showModal(); };
  panel.addEventListener('change', e => { if (e.target.dataset.pick) { const key = e.target.dataset.pick; e.target.checked ? keys.add(key) : keys.delete(key); refresh(); } });
  panel.addEventListener('click', async e => {
    const button = e.target.closest('[data-tool]'); if (!button || button.disabled) return;
    const c = context(), action = button.dataset.tool, chosen = [...keys];
    try {
      $('#r3-tool-status').textContent = '';
      if (action === 'close') { panel.close(); return; }
      if (action === 'all') entries(c.layout, c.racks).forEach(e => keys.add(e.key));
      else if (action === 'none') keys.clear();
      else if (action === 'move') c.apply(c.move(chosen, number('dx'), number('dz')));
      else if (['align', 'space'].includes(action)) c.apply(editMany(c.layout, c.racks, chosen, action, { edge: value('align'), axis: value('axis'), gap: number('gap') }));
      else if (action === 'repeat') { if (keys.size !== 1) throw new Error('룸 오브젝트 하나만 선택하세요.'); c.apply(repeatBlock(c.layout, c.racks, chosen[0], number('repeat-count'), value('repeat-direction'), number('gap'))); }
      else if (action === 'png' || action === 'pdf') await exportPlan(c.layout, c.racks, action);
      else if (action === 'history') {
        const loaded = (await c.history()).history;
        if (context().locationId !== c.locationId) return;
        history = loaded;
        $('#r3-history-list').innerHTML = history.length ? history.map((h, i) => `<div class="r3-history-row"><span>r${h.layout.revision} · ${esc(h.saved_at)}<small>${esc(h.layout.name)} · 랙 ${h.layout.placements.length} / 오브젝트 ${h.layout.blocks.length}</small></span><button class="r3-btn small" data-tool="restore" data-index="${i}" data-write ${c.editable ? '' : 'disabled'}>불러오기</button></div>`).join('') : '<p>저장 이력이 없습니다. 업데이트 이후 저장부터 기록됩니다.</p>';
      } else if (action === 'restore') {
        const h = history[Number(button.dataset.index)]; if (!h) return;
        if (!window.confirm('현재 편집 내용을 이 배치로 바꿀까요? 되돌리기로 취소할 수 있습니다.')) return;
        const restored = await c.restore(h.layout);
        if (!restored) return;
        $('#r3-tool-status').textContent = '배치를 불러왔습니다. 화면을 검토한 뒤 배치 저장으로 확정하세요.';
      }
      refresh();
      if (['move', 'align', 'space', 'repeat'].includes(action)) $('#r3-tool-status').textContent = '적용했습니다. 닫기 후 화면을 확인하고 배치 저장을 누르세요.';
    } catch (error) { $('#r3-tool-status').textContent = error.message; }
  });
  return { refresh, keys, toggle(hit) { const key = hit.blockId ? `block:${hit.blockId}` : `rack:${hit.rackId}`; keys.has(key) ? keys.delete(key) : keys.add(key); refresh(); } };
}
