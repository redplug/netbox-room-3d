import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoomScene } from '../scene.js';
import { demoData } from '../demo.js';

function fixture() {
  const scene = Object.assign(Object.create(RoomScene.prototype), {
    content: new THREE.Group(), tooltip: {}, mode: '3d', label() {}, textPanel() {}, draw() {}, texture: () => new THREE.Texture(),
  });
  return { scene, ...demoData() };
}

test('movement, selection and mode switches preserve detailed rack objects', () => {
  const { scene, layout, racks } = fixture();
  scene.update(layout, racks, null);
  const nodes = [...scene.rackNodes.values()], meshes = nodes.map(n => [...n.devices.values()][0]);
  const environment = scene.environment;
  for (let i = 0; i < 20; i++) {
    layout.placements[0].x += 10; layout.placements[0].rotation = (i % 4) * 90;
    scene.movePlacement('rack', racks[0].id, layout.placements[0]);
    scene.mode = i % 2 ? 'top' : '3d';
    scene.update(layout, racks, { rackId: racks[i % nodes.length].id });
    assert.deepEqual([...scene.rackNodes.values()], nodes);
    assert.deepEqual(nodes.map(n => [...n.devices.values()][0]), meshes);
    assert.equal(scene.environment, environment);
    assert.equal(nodes[0].group.position.x, layout.placements[0].x / 1000);
    assert.equal(nodes[0].details.parent !== null, scene.mode !== 'top');
  }
  scene.clear(); assert.equal(scene.content.children.length, 0);
});

test('appearance changes rebuild only the affected rack; status hides without rebuilding', () => {
  const { scene, layout, racks } = fixture();
  scene.update(layout, racks, null);
  const nodes = [...scene.rackNodes.values()];
  const device = racks[0].devices[0];
  layout.appearances[String(device.id)] = { color: '#abcdef' };
  scene.update(layout, racks, null);
  assert.notEqual(scene.rackNodes.get(racks[0].id), nodes[0]);
  assert.equal(scene.rackNodes.get(racks[1].id), nodes[1]);
  const node = scene.rackNodes.get(racks[0].id);
  scene.update(layout, racks, null, { statusFilter: 'not-a-status' });
  assert.equal(scene.rackNodes.get(racks[0].id), node);
  for (const mesh of node.devices.values()) assert.equal(scene.isVisible(mesh), false);
  layout.placements = []; scene.update(layout, racks, null);
  assert.equal(scene.rackNodes.size, 0); scene.clear();
});

test('pointer moves coalesce, release flushes final coordinates, cancel discards pending work', t => {
  const frames = new Map(); let id = 0;
  globalThis.requestAnimationFrame = () => {};
  globalThis.cancelAnimationFrame = () => {};
  t.after(() => { delete globalThis.requestAnimationFrame; delete globalThis.cancelAnimationFrame; });
  t.mock.method(globalThis, 'requestAnimationFrame', fn => { frames.set(++id, fn); return id; });
  t.mock.method(globalThis, 'cancelAnimationFrame', id => frames.delete(id));
  const calls = [];
  const scene = Object.assign(Object.create(RoomScene.prototype), {
    tooltip: {}, mode: 'top', controls: {}, floorPoint: e => ({ x: e.clientX / 1000, z: e.clientY / 1000 }),
    drag: { id: 1, dx: 5, dz: 7 }, handlers: { drag: (...args) => calls.push(args), dragEnd: () => calls.push('end'), dragCancel: () => calls.push('cancel') },
  });
  for (let i = 0; i < 100; i++) scene.move({ clientX: i, clientY: i });
  assert.equal(frames.size, 1); assert.equal(calls.length, 0);
  scene.up({ clientX: 120, clientY: 130 });
  assert.deepEqual(calls, [[1, 125, 137], 'end']); assert.equal(frames.size, 0);
  scene.drag = { id: 1, dx: 0, dz: 0 }; scene.move({ clientX: 150, clientY: 150 }); scene.flushDrag();
  scene.up({ clientX: 175, clientY: 180 });
  assert.deepEqual(calls.slice(-2), [[1, 175, 180], 'end']);
  scene.drag = { id: 1, dx: 0, dz: 0 }; scene.move({ clientX: 500, clientY: 500 }); scene.cancelDrag();
  assert.equal(calls.at(-1), 'cancel'); assert.equal(frames.size, 0); assert.equal(scene.drag, null);
});
