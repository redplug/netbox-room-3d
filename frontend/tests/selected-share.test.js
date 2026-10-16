import test from 'node:test';
import assert from 'node:assert/strict';
import { selectedShareTarget, targetURL, targetFromURL } from '../inventory-discovery.js';

const parentContext = {
  locationId: 1,
  selected: {rackId: 10, deviceId: 100},
  racks: [{id: 10, location_id: 2}],
  demo: false,
};
const visibleChildDevice = {id: 100, rack_id: 10, location_id: 2};

test('selected descendant Device links use its actual Location and match discovery on reopen', () => {
  const target = selectedShareTarget(parentContext, visibleChildDevice);
  const reopened = targetFromURL(targetURL('https://netbox.example/plugins/room-3d/', target));
  assert.deepEqual(reopened, {location: 2, rack: 10, device: 100});
  assert.equal(reopened.location, visibleChildDevice.location_id);
  assert.equal(reopened.rack, visibleChildDevice.rack_id);
  assert.equal(parentContext.locationId, 1);
});

test('selected descendant Rack links also use its actual Location', () => {
  const target = selectedShareTarget({...parentContext, selected: {rackId: 10}});
  assert.deepEqual(target, {location: 2, rack: 10});
});

test('direct Location and Location-only selections retain their normal targets', () => {
  assert.deepEqual(selectedShareTarget({...parentContext, locationId: 2}, visibleChildDevice),
    {location: 2, rack: 10, device: 100});
  assert.deepEqual(selectedShareTarget({...parentContext, selected: null}), {location: 1});
});

test('hidden, missing, moved and mismatched Devices cannot produce a selected-target link', () => {
  for (const row of [undefined, {...visibleChildDevice, id: 101}, {...visibleChildDevice, rack_id: 11},
    {...visibleChildDevice, rack_id: null}, {...visibleChildDevice, location_id: null}]) {
    assert.throws(() => selectedShareTarget(parentContext, row));
  }
  assert.throws(() => selectedShareTarget({...parentContext, racks: []}, visibleChildDevice));
});

test('production Rack links never substitute the parent for unavailable Location metadata', () => {
  const context = {...parentContext, selected: {rackId: 10}, racks: [{id: 10}]};
  assert.throws(() => selectedShareTarget(context));
  assert.deepEqual(selectedShareTarget({...context, demo: true}), {location: 1, rack: 10});
});
