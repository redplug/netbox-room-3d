import test from 'node:test';
import assert from 'node:assert/strict';
import { editMany, repeatBlock, measure } from '../layout-tools.js';
const block = (id, x, z, rotation = 0) => ({ id, name: id, type: 'desk', x, z, rotation, width: 600, depth: 400, height: 700 });
const layout = () => ({ width: 10000, depth: 8000, height: 3000, grid: 100, placements: [], appearances: {}, blocks: [block('a', 1000, 1000), block('b', 3000, 2000)] });
test('group edit is atomic, preserves offsets and rejects collisions and locked racks', () => {
  const l = layout(), next = editMany(l, [], ['block:a', 'block:b'], 'move', { x: 100, z: 200 });
  assert.equal(next.blocks[1].x - next.blocks[0].x, 2000); assert.equal(l.blocks[0].x, 1000);
  assert.throws(() => editMany(l, [], ['block:a'], 'move', { x: 2000, z: 1000 }), /겹칩니다/);
  assert.throws(() => editMany(l, [], ['block:a'], 'move', { x: -1000, z: 0 }), /경계/);
  l.placements = [{ rack_id: 1, x: 6000, z: 3000, rotation: 0, locked: true }];
  assert.throws(() => editMany(l, [{ id: 1, name: 'r', width: 600, depth: 1000, height: 2100, u_height: 42 }], ['rack:1'], 'move', { x: 1, z: 0 }), /잠긴/);
});
test('alignment and zero gap respect rotated footprint', () => {
  const l = layout(); l.blocks[1].rotation = 90;
  const aligned = editMany(l, [], ['block:a', 'block:b'], 'align', { edge: 'top' });
  assert.equal(aligned.blocks[1].z, 1100);
  const packed = editMany(aligned, [], ['block:a', 'block:b'], 'space', { axis: 'x', gap: 0 });
  assert.equal(packed.blocks[1].x, 1500);
  assert.equal(measure(packed, [], ['block:a', 'block:b']).distance, 0);
});
test('repeated copies preserve source and reject all on overflow', () => {
  const l = layout(), n = repeatBlock(l, [], 'block:a', 2, 'right', 100);
  assert.equal(n.blocks.length, 4); assert.equal(n.blocks[2].x, 1700);
  assert.equal(new Set(n.blocks.map(b => b.id)).size, 4);
  assert.throws(() => repeatBlock(l, [], 'block:a', 30, 'left', 0), /경계/);
  assert.equal(l.blocks.length, 2);
});
test('distance reports edge clearance and room margins', () => {
  const m = measure(layout(), [], ['block:a', 'block:b']);
  assert.equal(m.x, 1400); assert.equal(m.z, 600); assert.equal(m.walls.left, 700);
});
