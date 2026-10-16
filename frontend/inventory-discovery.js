import { safeURL } from './geometry.js';

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const identifierValue = value => String(value ?? '').trim();
export function identifierMatches(device, query) {
  const q = identifierValue(query).toLowerCase();
  return !!q && [device.asset_number, device.serial].some(v => identifierValue(v).toLowerCase().includes(q));
}
export function qualityRows(devices) {
  const counts = {};
  for (const field of ['asset_number','serial']) {
    counts[field] = new Map();
    for (const d of devices) {
      const key = identifierValue(d[field]).toLowerCase();
      if (key) counts[field].set(key, (counts[field].get(key) || 0) + 1);
    }
  }
  return devices.flatMap(device => {
    const issues = [];
    for (const [field,label] of [['asset_number','자산번호'],['serial','시리얼']]) {
      const key = identifierValue(device[field]).toLowerCase();
      if (!key) issues.push(`${label} 없음`);
      else if (counts[field].get(key) > 1) issues.push(`${label} 중복 (조회 범위)`);
    }
    if (device.rack_unassigned) issues.push('랙 미할당');
    if (device.location_unassigned) issues.push('Location 미할당');
    return issues.length ? [{device,issues}] : [];
  });
}
export function csvCell(value) {
  let text = String(value ?? '');
  // Quote every cell and neutralize spreadsheet formulas, including leading controls/whitespace.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g,'""')}"`;
}
export function qualityCSV(rows) {
  const records = [['Device ID','Device','Asset_Number','Serial','Location','Rack','U','Issues (permission-scoped)'],
    ...rows.map(({device:d,issues}) => [d.id,d.name,d.asset_number,d.serial,d.location,d.rack,d.position,issues.join('; ')])];
  return '\ufeff' + records.map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function targetFromURL(url) {
  const params = new URL(url).searchParams, target = {};
  for (const key of ['location','rack','device']) {
    const value = params.get(key);
    if (value === null) continue;
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw Error('공유 링크의 대상이 유효하지 않습니다.');
    target[key] = Number(value);
  }
  return target;
}
export function targetURL(base, target) {
  const url = new URL(base);
  url.search = ''; url.hash = '';
  for (const key of ['location','rack','device']) if (target[key] != null) url.searchParams.set(key,target[key]);
  return url.href;
}
export function selectedShareTarget(context, device) {
  const {locationId, selected, racks, demo} = context;
  if (!selected?.rackId) return {location: locationId};
  const rack = racks.find(row => row.id === selected.rackId);
  if (!rack) throw Error('공유 대상을 사용할 수 없습니다. 다시 선택하세요.');
  if (selected.deviceId) {
    // Discovery is authoritative for the Device's current, visible placement.
    if (!device || device.id !== selected.deviceId || device.rack_id !== rack.id || !device.location_id)
      throw Error('공유 대상이 이동했거나 사용할 수 없습니다.');
    return {location: device.location_id, rack: rack.id, device: device.id};
  }
  // Production rack rows already carry independently authorized Location metadata.
  const location = rack.location_id ?? (demo ? locationId : null);
  if (!location) throw Error('대상 Location을 사용할 수 없습니다.');
  return {location, rack: rack.id};
}
export function deviceDetailsHTML(d, rack = '') {
  const esc = escapeHTML;
  const fields = [['자산번호 (Asset_Number)',d.asset_number],['시리얼',d.serial],
    ['IP',[...new Set([...(d.primary_ips || []),...(d.ip_addresses || [])])].join(' · ')],
    ['모델',d.model],['상태',d.status_label || d.status],['Location',d.location],['랙',d.rack || rack],
    ['U',d.position == null ? '' : `U${d.position} · ${d.face === 'rear' ? '후면' : '전면'}`]];
  const url = safeURL(d.url);
  return `<section class="r3-inventory-details" aria-label="장비 상세"><h3>${esc(d.name)}</h3><dl>${fields.map(([label,value]) => {
    const text = identifierValue(value);
    return `<div><dt>${esc(label)}</dt><dd>${esc(text || '조회 가능한 값 없음')}${text ? `<button type="button" class="r3-btn small" data-inventory-copy="${esc(text)}" aria-label="${esc(label)} 복사">복사</button>` : ''}</dd></div>`;
  }).join('')}</dl>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">NetBox 장비 상세</a>` : ''}<button type="button" class="r3-btn small" data-inventory-share="${d.id}">장비 링크 복사</button></section>`;
}
