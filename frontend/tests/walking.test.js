import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomScene } from '../scene.js';

const walker = () => Object.assign(Object.create(RoomScene.prototype), {
  layout: { width: 4000, depth: 4000, height: 3000 },
  walkObstacles: [[1000, 1000, 2000, 2000]],
});
test('walking collision keeps body clear of walls and equipment', () => {
  const scene = walker();
  assert.equal(scene.walkFree(.1, 3), false);
  assert.equal(scene.walkFree(3.9, 3), false);
  assert.equal(scene.walkFree(3, .1), false);
  assert.equal(scene.walkFree(3, 3.9), false);
  assert.equal(scene.walkFree(.9, 1.5), false);
  assert.equal(scene.walkFree(1.5, 1.5), false);
  assert.equal(scene.walkFree(.7, 1.5), true);
});
test('walking spawn finds free floor and rejects a fully occupied room', () => {
  const scene = walker(), start = scene.walkStart();
  assert.equal(start.y, 1.65);
  assert.equal(scene.walkFree(start.x, start.z), true);
  scene.walkObstacles = [[0, 0, 4000, 4000]];
  assert.equal(scene.walkStart(), null);
});

function elevatedWalker() {
  return Object.assign(walker(), { mode: 'walk', camera: { position: { x: .25, y: 1.65, z: 3.75 } }, handlers: {}, draw() {}, keys: new Set(), yaw: 0 });
}
test('walking height changes independently and clamps to floor and ceiling', () => {
  const scene = elevatedWalker(), before = JSON.stringify(scene.layout);
  let reported; scene.handlers.walkHeight = height => { reported = height; };
  scene.changeWalkHeight(.25); assert.equal(scene.camera.position.y, 1.9);
  scene.changeWalkHeight(-100); assert.equal(scene.camera.position.y, .2);
  scene.changeWalkHeight(100); assert.equal(scene.camera.position.y, 2.9);
  assert.equal(reported, 2.9); assert.equal(scene.camera.position.x, .25); assert.equal(scene.camera.position.z, 3.75);
  assert.equal(JSON.stringify(scene.layout), before);
});
test('height changes reject invalid inputs and clamp to reduced room height', () => {
  const scene = elevatedWalker();
  scene.changeWalkHeight(NaN); scene.changeWalkHeight(Infinity); assert.equal(scene.camera.position.y, 1.65);
  scene.mode = '3d'; scene.changeWalkHeight(.25); assert.equal(scene.camera.position.y, 1.65);
  scene.mode = 'walk'; scene.layout.height = 500; scene.setWalkHeight(scene.camera.position.y);
  assert.equal(scene.camera.position.y, .4);
  scene.setWalkHeight(-1); assert.equal(scene.camera.position.y, .2);
});
test('Q/E and Page Up/Down move height, with Shift acceleration', t => {
  const original = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 1;
  t.after(() => { if (original === undefined) delete globalThis.requestAnimationFrame; else globalThis.requestAnimationFrame = original; });
  const scene = elevatedWalker(); scene.walkTime = 0;
  scene.keys.add('KeyE'); scene.walkFrame(50); assert(Math.abs(scene.camera.position.y - 1.72) < 1e-9);
  scene.keys = new Set(['PageDown']); scene.walkFrame(100); assert(Math.abs(scene.camera.position.y - 1.65) < 1e-9);
  scene.keys = new Set(['KeyQ', 'ShiftLeft']); scene.walkFrame(150); assert(Math.abs(scene.camera.position.y - 1.51) < 1e-9);
  scene.keys = new Set(['PageUp']); scene.walkFrame(200); assert(Math.abs(scene.camera.position.y - 1.58) < 1e-9);
  assert.equal(scene.camera.position.x, .25); assert.equal(scene.camera.position.z, 3.75);
});
