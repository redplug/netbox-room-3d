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
  });
  return issues;
}
// NetBox's position is the lowest numbered occupied U, including descending racks.
export function deviceBottom(rack, device) {
  if (device.position == null || device.u_height <= 0) return null;
  const offset = device.position - rack.starting_unit;
  if (offset < 0 || offset + device.u_height > rack.u_height) return null;
  return (rack.desc_units ? rack.u_height - offset - device.u_height : offset) * U;
}
export function snap(value, grid, enabled = true) {
  return enabled ? Math.round(value / grid) * grid : Math.round(value);
}
export function safeURL(value) {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
