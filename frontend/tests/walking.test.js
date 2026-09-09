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
