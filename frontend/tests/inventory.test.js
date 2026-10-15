import test from 'node:test';
import assert from 'node:assert/strict';
import { rackUsage, deviceMatches, searchIPs } from '../inventory.js';
test('usage counts front/rear overlap once and excludes unpositioned and 0U', () => {
  const rack = { u_height: 42, starting_unit: 1, devices: [
    { position: 1, u_height: 2 }, { position: 1, u_height: 2, face: 'rear' },
    { position: null, u_height: 2 }, { position: 4, u_height: 0 }, { position: 42, u_height: 2 },
  ] };
  assert.equal(rackUsage(rack).used, 2); assert.equal(rackUsage(rack).free, 40);
  rack.desc_units = true; assert.deepEqual([...rackUsage(rack).occupied], [40, 41]);
  rack.devices = [{ position: 10, u_height: 2 }];
  assert.equal(rackUsage(rack).used, 2);
});
test('search combines name, primary/assigned IP and status', () => {
  const d = { name: 'SERVER-1', status: 'active', primary_ips: ['192.0.2.1/24'], ip_addresses: ['2001:db8::1/64'] };
  assert.ok(deviceMatches(d, 'server', 'active'));
  assert.ok(deviceMatches(d, '2001:db8::1'));
  assert.ok(deviceMatches(d, '192.0.2.1'));
  assert.equal(deviceMatches(d, 'server', 'offline'), false);
});
test('partial IP results only list matching addresses without duplicates', () => {
  const d = { primary_ips: ['192.0.2.18/24'], ip_addresses: ['192.0.2.18/24', '2001:db8::1/64'] };
  assert.deepEqual(searchIPs(d, '192.0.2.1'), { ips: ['192.0.2.18/24'], matched: true });
  assert.equal(searchIPs(d, 'server').ips.length, 2);
  assert.deepEqual(searchIPs({}, '192'), { ips: [], matched: false });
});

test('identifier matching normalizes query, preserves zero and combines status', () => {
  const d = { asset_number: '  AsSeT-42  ', serial: 'Sn-AbC', status: 'active', asset_tag: 'native-only' };
  for (const query of [' asset-4 ', ' SN-aB ']) assert.equal(deviceMatches(d, query, 'active'), true);
  assert.equal(deviceMatches(d, 'asset', 'offline'), false);
  assert.equal(deviceMatches(d, 'native-only'), false);
  assert.equal(deviceMatches({ asset_number: 0 }, '0'), true);
  assert.equal(deviceMatches({ serial: 0 }, '0'), true);
  for (const value of [undefined, null, '', '   ']) {
    assert.equal(deviceMatches({ asset_number: value, serial: value }, 'null'), false);
    assert.equal(deviceMatches({ asset_number: value, serial: value }, 'undefined'), false);
  }
  assert.equal(deviceMatches({ asset_number: '<img src=x onerror="alert(1)">' }, '<IMG'), true);
});

test('result identifiers share matching rules and never use native or rack tags', async () => {
  const { searchIdentifiers } = await import('../inventory.js');
  assert.deepEqual(searchIdentifiers({ asset_number: '  AsSeT-42 ', serial: 0, asset_tag: 'native' }, ' asset '), [
    { kind: 'asset_number', label: '자산번호', value: 'AsSeT-42', matched: true },
    { kind: 'serial', label: '시리얼', value: '0', matched: false },
  ]);
  assert.deepEqual(searchIdentifiers({ asset_number: null, serial: '  ', asset_tag: 'native', custom_fields: { Asset_Number: 'wrong-contract' } }), []);
  assert.equal(searchIdentifiers({ serial: 'abc' }, '   ')[0].matched, false);
});
