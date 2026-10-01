import { dimensions, footprint, errors } from './geometry.js';

export function entries(layout, racks) {
  const byId = new Map(racks.map(r => [r.id, r]));
  return [...layout.placements.flatMap(p => {
    const r = byId.get(p.rack_id);
    return r ? [{ ...p, ...dimensions(r, p), key: `rack:${r.id}`, name: r.name, kind: 'rack' }] : [];
  }), ...layout.blocks.map(b => ({ ...b, key: `block:${b.id}`, kind: 'block' }))];
}
function checked(layout, racks) {
  const issues = errors(layout, racks);
  if (layout.blocks.length > 200) issues.unshift('룸 오브젝트는 최대 200개입니다.');
  if (issues.length) throw new Error(issues.slice(0, 3).join(' / '));
  return layout;
}
export function editMany(layout, racks, keys, action, options = {}) {
  const next = structuredClone(layout), chosen = entries(next, racks).filter(e => keys.includes(e.key));
  if (!chosen.length) throw new Error('배치 대상을 선택하세요.');
  if (chosen.some(e => e.locked)) throw new Error('잠긴 랙을 선택에서 제외하거나 잠금을 해제하세요.');
  const put = (e, x, z) => {
    const target = e.kind === 'rack' ? next.placements.find(p => p.rack_id === e.rack_id) : next.blocks.find(b => b.id === e.id);
    Object.assign(target, { x, z });
  };
  if (action === 'move') {
    if (![options.x, options.z].every(Number.isFinite)) throw new Error('이동 거리를 숫자로 입력하세요.');
    chosen.forEach(e => put(e, e.x + options.x, e.z + options.z));
  } else if (action === 'align') {
    if (chosen.length < 2) throw new Error('두 개 이상 선택하세요.');
    const boxes = chosen.map(footprint), index = { left: 0, top: 1, right: 2, bottom: 3 }[options.edge];
    if (index === undefined) throw new Error('정렬 방향을 선택하세요.');
    const edge = (index < 2 ? Math.min : Math.max)(...boxes.map(b => b[index]));
    chosen.forEach((e, i) => put(e, e.x + (index % 2 === 0 ? edge - boxes[i][index] : 0), e.z + (index % 2 ? edge - boxes[i][index] : 0)));
  } else if (action === 'space') {
    if (chosen.length < 2 || !Number.isFinite(options.gap) || options.gap < 0) throw new Error('두 개 이상 선택하고 0 이상의 간격을 입력하세요.');
    const axis = options.axis === 'z' ? 1 : 0;
    chosen.sort((a, b) => footprint(a)[axis] - footprint(b)[axis]);
    let cursor = footprint(chosen[0])[axis];
    chosen.forEach(e => {
      const box = footprint(e), delta = cursor - box[axis];
      put(e, e.x + (axis === 0 ? delta : 0), e.z + (axis === 1 ? delta : 0));
      cursor += box[axis + 2] - box[axis] + options.gap;
    });
  } else throw new Error('지원하지 않는 작업입니다.');
  return checked(next, racks);
}
export function repeatBlock(layout, racks, key, count, direction, gap) {
  const source = entries(layout, racks).find(e => e.key === key && e.kind === 'block');
  if (!source) throw new Error('룸 오브젝트 한 개를 선택하세요.');
  if (!Number.isInteger(count) || count < 1 || count > 199 || !Number.isFinite(gap) || gap < 0) throw new Error('복사 개수는 1~199, 간격은 0 이상이어야 합니다.');
  const next = structuredClone(layout), box = footprint(source), names = new Set(next.blocks.map(b => b.name));
  const axis = ['up', 'down'].includes(direction) ? 'z' : 'x', sign = ['up', 'left'].includes(direction) ? -1 : 1;
  const pitch = (axis === 'x' ? box[2] - box[0] : box[3] - box[1]) + gap;
  for (let i = 1; i <= count; i++) {
    let n = 1, name;
    do { const suffix = ` 복사본 ${n++}`; name = source.name.slice(0, 100 - suffix.length) + suffix; } while (names.has(name));
    names.add(name);
    const copy = structuredClone(layout.blocks.find(b => b.id === source.id));
    Object.assign(copy, { id: crypto.randomUUID(), name, [axis]: source[axis] + sign * pitch * i });
    next.blocks.push(copy);
  }
  return checked(next, racks);
}
export function measure(layout, racks, keys) {
  const byKey = new Map(entries(layout, racks).map(e => [e.key, e]));
  const chosen = keys.map(key => byKey.get(key)).filter(Boolean);
  if (!chosen.length) return null;
  const a = footprint(chosen[0]);
  const walls = { left: a[0], top: a[1], right: layout.width - a[2], bottom: layout.depth - a[3] };
  if (chosen.length !== 2) return { walls };
  const b = footprint(chosen[1]);
  const x = Math.max(0, a[0] - b[2], b[0] - a[2]), z = Math.max(0, a[1] - b[3], b[1] - a[3]);
  return { walls, x, z, distance: Math.hypot(x, z) };
}
