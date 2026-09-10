import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourcePool } from '../resource-pool.js';
test('shared resources remain alive until unused; idle cache has a bounded LRU', () => {
  const disposed = [], pool = new ResourcePool(1);
  const create = key => () => ({ dispose: () => disposed.push(key) });
  const first = pool.acquire('U1', create('U1'));
  assert.equal(pool.acquire('U1', create('duplicate')), first);
  pool.release('U1'); pool.prune(); assert.deepEqual(disposed, []);
  pool.acquire('other', create('other')); pool.release('other');
  pool.release('U1'); pool.prune();
  assert.deepEqual(disposed, ['other']);
  assert.equal(pool.acquire('U1', create('duplicate')), first);
  pool.clear(); assert.deepEqual(disposed, ['other', 'U1']);
});
