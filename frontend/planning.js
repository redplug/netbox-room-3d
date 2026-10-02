import { dimensions, footprint, errors } from './geometry.js';
import { entries } from './layout-tools.js';

export function placeRows(layout, racks, ids, options) {
  const next = structuredClone(layout), placed = new Set(layout.placements.map(p => p.rack_id));
  if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => placed.has(id) || !racks.some(r => r.id === id))) throw new Error('미배치 랙을 선택하세요.');
  const { x, z, columns, gapX, gapZ, rotation } = options;
  if (![x,z,gapX,gapZ].every(n => Number.isFinite(n) && n >= 0) || !Number.isInteger(columns) || columns < 1 || ![0,90,180,270].includes(rotation)) throw new Error('시작 좌표·열 개수·간격·방향을 확인하세요.');
  let cursorX = x, cursorZ = z, rowDepth = 0;
  ids.forEach((id, i) => {
    if (i && i % columns === 0) { cursorX = x; cursorZ += rowDepth + gapZ; rowDepth = 0; }
    const rack = racks.find(r => r.id === id), swap = rotation === 90 || rotation === 270;
    const width = swap ? rack.depth : rack.width, depth = swap ? rack.width : rack.depth;
    next.placements.push({ rack_id:id, x:cursorX + width/2, z:cursorZ + depth/2, rotation, locked:false, dimensions:{} });
    cursorX += width + gapX; rowDepth = Math.max(rowDepth, depth);
  });
  const issues = errors(next, racks); if (issues.length) throw new Error(issues.slice(0,3).join(' / '));
  return next;
}
export function layoutDiff(before, after, racks) {
  const items = l => [...entries(l,racks), ...(l.zones || []).map(z => ({...z,key:`zone:${z.id}`,kind:'zone',height:10}))];
  const a = new Map(items(before).map(e => [e.key,e])), b = new Map(items(after).map(e => [e.key,e]));
  const result = [];
  for (const key of new Set([...a.keys(),...b.keys()])) {
    const old = a.get(key), current = b.get(key);
    if (!old) result.push({key,name:current.name,type:'added',current});
    else if (!current) result.push({key,name:old.name,type:'removed',old});
    else {
      const fields = ['x','z','rotation','width','depth','height','locked','name','color'].filter(k => JSON.stringify(old[k]) !== JSON.stringify(current[k]));
      if (fields.length) result.push({key,name:current.name,type:'changed',old,current,fields});
    }
  }
  for (const key of ['name','width','depth','height','grid','grid_origin','include_descendants','clearance','appearances']) {
    if (JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null)) result.push({key:`setting:${key}`,name:key,type:'setting'});
  }
  return result;
}
export function validCamera(value) {
  return value && ['top','3d'].includes(value.mode) && ['position','target'].every(key => Array.isArray(value[key]) && value[key].length === 3 && value[key].every(n => Number.isFinite(n) && Math.abs(n) <= 1000)) && value.position[1] > 0 && Math.hypot(...value.position.map((n,i) => n-value.target[i])) > .01;
}
