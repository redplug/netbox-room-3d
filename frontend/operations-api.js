import { capacityPreview, candidateRacks, demoTypes, demoRacks } from './capacity.js';
// These endpoints share NetBox session authentication and CSRF protection.
export async function operation(context, resource, payload, query = '') {
  if (context.demo) {
    if (resource === 'device-types') return {device_types:demoTypes.filter(t=>t.model.includes(new URLSearchParams(query.replace(/^\?/, '')).get('q')||'')),truncated:false};
    if (resource === 'capacity') return capacityPreview(demoRacks(context.racks),demoTypes,payload?.planned_devices??context.layout.planned_devices??[]);
    if (resource === 'recommendations') return candidateRacks(demoRacks(context.racks),demoTypes,payload.planned_devices||[],payload.device_type_id,payload.face);
    if (resource === 'cables') return { cables: [], demo: true };
    if (resource === 'cleanup') throw new Error('참조 정리는 NetBox 관리자 화면에서만 사용할 수 있습니다.');
    const key = `room3d-plans-v1-${context.locationId}`;
    let plans = JSON.parse(localStorage.getItem(key) || '[]');
    if (payload) {
      const name = String(payload.name || '').trim();
      if (['create', 'rename'].includes(payload.action)) {
        if (!name || name.length > 100) throw new Error('이름은 1~100자여야 합니다.');
        if (plans.some(p => p.name === name && p.id !== payload.id)) throw new Error('같은 이름의 배치안이 있습니다.');
      }
      if (payload.action === 'create') {
        if (plans.length >= 10) throw new Error('배치안은 최대 10개입니다.');
        plans.push({ id: crypto.randomUUID(), name, layout: structuredClone(payload.layout), valid: true, saved_at: new Date().toISOString() });
      } else if (payload.action === 'rename') plans = plans.map(p => p.id === payload.id ? { ...p, name } : p);
      else if (payload.action === 'delete') plans = plans.filter(p => p.id !== payload.id);
      localStorage.setItem(key, JSON.stringify(plans));
    }
    return { plans, revision: context.layout.revision };
  }
  if (!context.url) throw new Error('Location 주소가 없습니다.');
  // Match the existing API client; NetBox may make its CSRF cookie HttpOnly.
  const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value || window.CSRF_TOKEN || '';
  const response = await fetch(`${context.url.replace(/\/$/, '')}/${resource}/${query}`, {
    method: payload ? 'POST' : 'GET', credentials: 'same-origin',
    headers: payload ? { 'Content-Type': 'application/json', 'X-CSRFToken': token } : {},
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `요청 실패 (${response.status})`);
  return result;
}
