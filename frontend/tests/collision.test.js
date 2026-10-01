import test from 'node:test';
import assert from 'node:assert/strict';
import { repairOverlaps, resolveMotion } from '../collision.js';
import { errors } from '../geometry.js';
const block = (id, x, z, extra = {}) => ({ id, name: id, x, z, width: 600, depth: 600, height: 700, rotation: 0, ...extra });
const room = blocks => ({ width: 6000, depth: 5000, height: 3000, grid: 600, placements: [], blocks, appearances: {} });
test('horizontal motion retreats opposite approach without moving obstacle', () => {
  const before = room([block('a', 1000, 1000), block('b', 2000, 1000)]), next = structuredClone(before); next.blocks[0].x = 2100;
  const result = resolveMotion(before, next, [], ['block:a']);
  assert.equal(result.blocks[0].x, 1400); assert.deepEqual(result.blocks[1], before.blocks[1]); assert.equal(next.blocks[0].x, 2100);
});
test('vertical and reverse approaches repel in their opposite directions', () => {
  for (const [axis, start, wanted, expected] of [['z', 1000, 2100, 1400], ['z', 3000, 1900, 2600], ['x', 3000, 1900, 2600]]) {
    const before = room([block('a', 2000, 2000), block('b', 2000, 2000)]); before.blocks[0][axis] = start;
    const next = structuredClone(before); next.blocks[0][axis] = wanted;
    assert.equal(resolveMotion(before, next, [], ['block:a']).blocks[0][axis], expected);
  }
});
test('group repulsion preserves all internal offsets', () => {
  const before = room([block('a', 1000, 1000), block('b', 1000, 2000), block('wall', 2000, 1000)]), next = structuredClone(before);
  next.blocks[0].x += 1000; next.blocks[1].x += 1000;
  const result = resolveMotion(before, next, [], ['block:a', 'block:b']);
  assert.equal(result.blocks[0].x, 1400); assert.equal(result.blocks[1].x, 1400); assert.equal(result.blocks[1].z - result.blocks[0].z, 1000);
});
test('repair resolves multiple coincident objects atomically and is idempotent', () => {
  const before = room(Array.from({ length: 10 }, (_, i) => block(String(i), 3000, 2500)));
  const result = repairOverlaps(before, []); assert.deepEqual(errors(result, []), []);
  assert.deepEqual(repairOverlaps(result, []), result); assert.equal(before.blocks[9].x, 3000);
});
test('repair preserves locked anchors; locked overlap is rejected', () => {
  const racks = [1, 2].map(id => ({ id, name: String(id), width: 600, depth: 1000, height: 2100, u_height: 42 }));
  const l = room([block('a', 2000, 2000)]); l.placements = [{ rack_id: 1, x: 2000, z: 2000, rotation: 90, locked: true }];
  const result = repairOverlaps(l, racks); assert.deepEqual(result.placements, l.placements); assert.deepEqual(errors(result, racks), []);
  l.placements.push({ ...l.placements[0], rack_id: 2 }); assert.throws(() => repairOverlaps(l, racks), /잠긴/);
});
test('full room cannot be repaired and input is unchanged', () => {
  const l = room([block('a', 500, 500, { width: 1000, depth: 1000 }), block('b', 500, 500)]); l.width = l.depth = 1000;
  const before = structuredClone(l); assert.throws(() => repairOverlaps(l, []), /공간/); assert.deepEqual(l, before);
});
test('rotation, chained obstacles and wall fallback produce valid clearance', () => {
  const before = room([block('a', 300, 3000, { width: 400, depth: 1000, rotation: 90 }), block('b', 500, 1000), block('c', 1300, 1000)]);
  const next = structuredClone(before); next.blocks[0].x = 1000; next.blocks[0].z = 1000;
  const result = resolveMotion(before, next, [], ['block:a']); assert.deepEqual(errors(result, []), []);
  assert.deepEqual(result.blocks.slice(1), before.blocks.slice(1));
});
test('touching edges stay unchanged; locked movement and bounds are rejected', () => {
  const l = room([block('a', 1000, 1000), block('b', 1600, 1000)]);
  assert.deepEqual(repairOverlaps(l, []), l);
  const next = structuredClone(l); next.blocks[0].x = 0; assert.throws(() => resolveMotion(l, next, [], ['block:a']), /경계/);
  next.blocks[0] = { ...l.blocks[0], locked: true }; assert.throws(() => resolveMotion(l, next, [], ['block:a']), /잠긴/);
});
