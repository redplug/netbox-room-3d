import { errors, footprint, intersects, clearanceShape, collisionPairs } from './geometry.js';
import { entries } from './layout-tools.js';

const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const shifted = (item, dx, dz) => ({ ...item, x: item.x + dx, z: item.z + dz });
const inside = (item, layout) => {
  const b = footprint(clearanceShape(item, layout.clearance));
  return b[0] >= 0 && b[1] >= 0 && b[2] <= layout.width && b[3] <= layout.depth;
};
function validate(layout, racks) {
  const issues = errors(layout, racks);
  if (issues.length) throw new Error(issues.slice(0, 3).join(' / '));
  return layout;
}
function put(layout, item, dx, dz) {
  const target = item.kind === 'rack' ? layout.placements.find(p => p.rack_id === item.rack_id) : layout.blocks.find(b => b.id === item.id);
  target.x = item.x + dx; target.z = item.z + dz;
}
// Walk monotonically along one axis, jumping past each obstructing edge.
// No grid rounding here: collision clearance takes precedence over grid snapping.
function along(moving, fixed, layout, direction) {
  const axis = direction[0] ? 0 : 1, sign = direction[axis];
  let distance = 0;
  for (let step = 0; step <= Math.min(512, moving.length * fixed.length + 1); step++) {
    const trial = moving.map(item => shifted(item, direction[0] * distance, direction[1] * distance));
    if (trial.some(item => !inside(item, layout))) return null;
    let push = 0;
    for (const item of trial) for (const obstacle of fixed) {
      for (const [left, right] of collisionPairs(item, obstacle, layout.clearance)) {
        if (!intersects(left, right)) continue;
        const a = footprint(left), b = footprint(right);
        push = Math.max(push, sign > 0 ? b[axis + 2] - a[axis] : a[axis + 2] - b[axis]);
      }
    }
    if (!push) return { x: direction[0] * distance, z: direction[1] * distance, distance };
    distance += push;
  }
  return null;
}
function clearance(moving, fixed, layout, preferred) {
  if (preferred) {
    const result = along(moving, fixed, layout, preferred);
    if (result) return result;
  }
  return directions.map(direction => along(moving, fixed, layout, direction)).filter(Boolean).sort((a, b) => a.distance - b.distance)[0];
}
export function resolveMotion(before, proposed, racks, keys) {
  const next = structuredClone(proposed), all = entries(next, racks);
  const moving = all.filter(item => keys.includes(item.key)), fixed = all.filter(item => !keys.includes(item.key));
  if (!moving.length) throw new Error('이동할 대상을 선택하세요.');
  if (moving.some(item => item.locked)) throw new Error('잠긴 랙은 자동으로 이동할 수 없습니다.');
  if (moving.some(item => !inside(item, next))) throw new Error('서버실 경계를 벗어납니다. 이전 위치를 유지합니다.');
  const old = entries(before, racks).find(item => item.key === moving[0].key);
  const dx = old ? moving[0].x - old.x : 0, dz = old ? moving[0].z - old.z : 0;
  const preferred = dx || dz ? Math.abs(dx) >= Math.abs(dz) ? [-Math.sign(dx), 0] : [0, -Math.sign(dz)] : null;
  const delta = clearance(moving, fixed, next, preferred);
  if (!delta) throw new Error('겹침을 피할 공간이 부족합니다. 이전 위치를 유지합니다.');
  moving.forEach(item => put(next, item, delta.x, delta.z));
  return validate(next, racks);
}
export function repairOverlaps(layout, racks) {
  const next = structuredClone(layout), all = entries(next, racks);
  // Locked racks are anchors, regardless of their order in the saved layout.
  const fixed = all.filter(item => item.locked);
  if (fixed.some((item, i) => !inside(item, next) || fixed.slice(0, i).some(other => collisionPairs(item, other, next.clearance).some(([a,b]) => intersects(a,b))))) {
    throw new Error('잠긴 랙끼리 겹치거나 경계를 벗어납니다. 잠금을 해제하고 다시 시도하세요.');
  }
  for (const item of all.filter(item => !item.locked)) {
    const delta = clearance([item], fixed, next);
    if (!delta) throw new Error('겹침을 자동 수정할 공간을 찾지 못했습니다. 배치를 변경하지 않았습니다.');
    put(next, item, delta.x, delta.z);
    fixed.push(shifted(item, delta.x, delta.z));
  }
  return validate(next, racks);
}
