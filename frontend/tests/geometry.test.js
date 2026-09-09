import test from 'node:test';
import assert from 'node:assert/strict';
import { footprint, intersects, deviceBottom, errors } from '../geometry.js';

test('90° racks swap footprint dimensions; edge touching is valid', () => {
  const a = { x: 1000, z: 1000, width: 600, depth: 1000, rotation: 90 };
  assert.deepEqual(footprint(a), [500, 700, 1500, 1300]);
  assert.equal(intersects(a, { ...a, x: 2000 }), false);
  assert.equal(intersects(a, { ...a, x: 1999 }), true);
});
test('ascending and descending multi-U positions use lowest numbered U', () => {
  const r = { starting_unit: 1, u_height: 42, desc_units: false }, d = { position: 8, u_height: 3 };
  assert.equal(deviceBottom(r, d), 7 * 44.45);
  assert.equal(deviceBottom({ ...r, desc_units: true }, d), 32 * 44.45);
  assert.equal(deviceBottom({ ...r, starting_unit: 5 }, { ...d, position: 5 }), 0);
  assert.equal(deviceBottom(r, { ...d, position: 41 }), null);
  assert.equal(deviceBottom(r, { ...d, position: null }), null);
  assert.equal(deviceBottom(r, { ...d, u_height: 0 }), null);
});
test('room validation detects rotated overflow and obstacle collision', () => {
  const racks = [{ id: 1, name: 'R1', width: 600, depth: 1000, height: 2100, u_height: 42 }];
  const l = { width: 4000, depth: 4000, height: 3000, grid: 600, blocks: [], placements: [{ rack_id: 1, x: 300, z: 1000, rotation: 90 }] };
  assert.match(errors(l, racks).join(), /경계/);
  l.placements[0].x = 1000;
  assert.deepEqual(errors(l, racks), []);
  l.blocks.push({ x: 1000, z: 1000, width: 100, depth: 100, height: 300, name: '기둥' });
  assert.match(errors(l, racks).join(), /겹칩니다/);
});
