export const U = 44.45;
export function dimensions(rack, placement) {
  return { width: rack.width, depth: rack.depth, height: rack.height, ...placement?.dimensions };
}
export function footprint(item) {
  const swap = item.rotation === 90 || item.rotation === 270;
  const w = swap ? item.depth : item.width, d = swap ? item.width : item.depth;
  return [item.x - w / 2, item.z - d / 2, item.x + w / 2, item.z + d / 2];
}
export function intersects(a, b) {
  a = footprint(a); b = footprint(b);
  return a[0] < b[2] - .01 && a[2] > b[0] + .01 && a[1] < b[3] - .01 && a[3] > b[1] + .01;
}
export function clearanceShape(item, policy) {
  if (!policy?.enabled || item.rack_id == null) return item;
  const front = policy.front || 0, rear = policy.rear || 0, offset = (front - rear) / 2;
  const r = item.rotation || 0;
  return { ...item, depth: item.depth + front + rear,
    x: item.x + (r === 90 ? -offset : r === 270 ? offset : 0),
    z: item.z + (r === 0 ? offset : r === 180 ? -offset : 0) };
}
export function collisionPairs(a, b, policy) {
  return [[a, b], [clearanceShape(a, policy), b], [a, clearanceShape(b, policy)]];
}
export function errors(layout, racks) {
  const issues = [], items = [];
  for (const p of layout.placements) {
    const rack = racks.find(r => r.id === p.rack_id);
    if (!rack) { issues.push('배치된 랙을 찾을 수 없습니다. 다시 불러오세요.'); continue; }
    const dims = dimensions(rack, p);
    if (dims.height < rack.u_height * U + 80) issues.push(`${rack.name}: 높이가 U 공간보다 작습니다.`);
    items.push({ ...p, ...dims, name: rack.name });
  }
  items.push(...layout.blocks);
  for (const key of ['width', 'depth', 'height', 'grid']) {
    if (!Number.isFinite(layout[key]) || layout[key] <= 0) issues.push('서버실 크기와 격자를 확인하세요.');
  }
  items.forEach((item, i) => {
    const b = footprint(item);
    if (![item.x, item.z, item.width, item.depth, item.height].every(Number.isFinite) || item.width <= 0 || item.depth <= 0 || item.height <= 0) issues.push(`${item.name}: 치수가 올바르지 않습니다.`);
    else if (b[0] < 0 || b[1] < 0 || b[2] > layout.width || b[3] > layout.depth || item.height > layout.height) issues.push(`${item.name}: 서버실 경계를 벗어납니다.`);
    items.slice(0, i).forEach(other => { if (intersects(item, other)) issues.push(`${item.name} / ${other.name}: 서로 겹칩니다.`); });
    if (layout.clearance?.enabled) {
      const c = footprint(clearanceShape(item, layout.clearance));
      if (c[0] < 0 || c[1] < 0 || c[2] > layout.width || c[3] > layout.depth) issues.push(`${item.name}: 벽까지 작업 공간이 부족합니다.`);
      items.slice(0, i).forEach(other => {
        if (!intersects(item, other) && collisionPairs(item, other, layout.clearance).some(([a,b]) => intersects(a,b))) issues.push(`${item.name} / ${other.name}: 통로·작업 공간이 부족합니다.`);
      });
    }
  });
  for (const zone of layout.zones || []) {
    if (![zone.x, zone.z, zone.width, zone.depth].every(Number.isFinite) || zone.width < 100 || zone.depth < 100 || !/^#[0-9a-fA-F]{6}$/.test(zone.color) || !zone.name?.trim() || zone.name.length > 100) issues.push('구역의 이름·치수·색상을 확인하세요.');
    const b = footprint(zone); if (b[0] < 0 || b[1] < 0 || b[2] > layout.width || b[3] > layout.depth) issues.push(`${zone.name}: 구역이 방 경계를 벗어납니다.`);
  }
  if ((layout.zones || []).length > 100) issues.push('구역은 최대 100개입니다.');
  return issues;
}
// NetBox's position is the lowest numbered occupied U, including descending racks.
export function deviceBottom(rack, device) {
  if (device.position == null || device.u_height <= 0) return null;
  const offset = device.position - rack.starting_unit;
  if (offset < 0 || offset + device.u_height > rack.u_height) return null;
  return (rack.desc_units ? rack.u_height - offset - device.u_height : offset) * U;
}
export function snap(value, grid, enabled = true, origin = 0) {
  return enabled ? origin + Math.round((value - origin) / grid) * grid : Math.round(value);
}
export function safeURL(value) {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
