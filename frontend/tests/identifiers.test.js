import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildRack } from '../scene-builders.js';

function panels(device, options = {}) {
  const rows = [], content = new THREE.Group();
  const context = {
    content,
    cube(w, h, d, x, y, z, color, parent, options = {}) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, ...options }));
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    },
    textPanel(text, width, height, x, y, z, parent, rear, meta) { rows.push({ text, width, height, x, y, z, rear, ...meta }); },
    label(text, x, y, z, parent) { const label = new THREE.Object3D(); label.position.set(x, y, z); parent.add(label); return label; },
  };
  const rack = { id: 1, name: 'Rack', width: 600, depth: 1000, height: 2100, rail_width: 482.6, u_height: 42, starting_unit: 1, desc_units: false,
    devices: [{ id: 10, name: 'Device', u_height: 1, position: 1, face: 'front', full_depth: true, color: '#64748b', status: 'active', images: [], interfaces: [], ...device }] };
  buildRack.call(context, { rack_id: 1, x: 600, z: 600, rotation: 0 }, rack, { appearances: {} },
    { assetTags: true, serialNumbers: true, ...options });
  content.traverse(object => { object.geometry?.dispose(); for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) material.dispose(); });
  return rows;
}

test('asset tags and serials retain their full values on both device faces', () => {
  const asset = 'ASSET-' + '0123456789'.repeat(8), serial = 'SN-' + 'ABCDEFGH'.repeat(8);
  const rows = panels({ asset_tag: asset, serial });
  const identifiers = rows.filter(row => row.identifierKind);
  assert.equal(identifiers.length, 4);
  for (const rear of [false, true]) {
    assert(identifiers.some(row => row.rear === rear && row.text === `자산: ${asset}`));
    assert(identifiers.some(row => row.rear === rear && row.text === `시리얼: ${serial}`));
  }
});

test('global asset and serial toggles independently remove their labels', () => {
  const device = { asset_tag: 'A-10', serial: 'SN-10' };
  assert.deepEqual(panels(device, { assetTags: false }).filter(row => row.identifierKind).map(row => row.identifierKind), ['serial', 'serial']);
  assert.deepEqual(panels(device, { serialNumbers: false }).filter(row => row.identifierKind).map(row => row.identifierKind), ['asset_tag', 'asset_tag']);
  assert.equal(panels(device, { assetTags: false, serialNumbers: false }).filter(row => row.identifierKind).length, 0);
});

test('blank identifiers create no labels and half-U panels stay within their device', () => {
  assert.equal(panels({ asset_tag: '  ', serial: null }).filter(row => row.identifierKind).length, 0);
  assert.equal(panels({}).filter(row => row.identifierKind).length, 0);
  const height = .5 * .04445 - .003;
  for (const row of panels({ u_height: .5, asset_tag: 'A', serial: 'S' }).filter(row => row.identifierKind)) {
    assert(row.height > 0);
    assert(row.y - row.height / 2 >= -height / 2);
    assert(row.y + row.height / 2 <= height / 2);
  }
});
