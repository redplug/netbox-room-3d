import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { RoomScene, hoverIPs } from '../scene.js';
import { demoData } from '../demo.js';

function fixture() {
  const scene = Object.assign(Object.create(RoomScene.prototype), {
    content: new THREE.Group(), tooltip: {}, mode: '3d', label() {}, textPanel() {}, draw() {}, texture: () => new THREE.Texture(),
  });
  return { scene, ...demoData() };
}
test('rear ports stay compact for one interface and wrap with primary metadata', () => {
  const { scene, layout, racks } = fixture();
  const device = racks[0].devices.find(d => d.u_height === 2);
  for (const count of [1, 12]) {
    device.interfaces = Array.from({ length: count }, (_, i) => ({ id: 900 + i, name: `nic-${i + 1}`, is_primary: i === 0 }));
    const panels = [];
    scene.textPanel = (...args) => { if (args[8]?.deviceId === device.id && args[8]?.interfaceId) panels.push(args); };
    scene.update(layout, racks, null);
    assert.equal(panels.length, count);
    assert.ok(panels.every(p => p[1] === p[2] && p[2] <= .022225001));
    assert.equal(panels.filter(p => p[8].isPrimary).length, 1);
    if (count > 8) assert.ok(panels[8][4] < panels[0][4]);
  }
  scene.clear();
});
test('top-view front arrow follows rack rotation and disappears outside top view', () => {
  const { scene, layout, racks } = fixture();
  for (const rotation of [0, 90, 180, 270]) {
    layout.placements[0].rotation = rotation; scene.mode = 'top'; scene.update(layout, racks, null);
    const markers = []; scene.content.traverse(o => { if (o.userData.frontMarker) markers.push(o); });
    assert.equal(markers.length, layout.placements.length);
    assert.equal(markers[0].parent.parent.rotation.y, -rotation * Math.PI / 180);
    const vertices = markers[0].geometry.attributes.position;
    assert.ok(vertices.getZ(2) > racks[0].depth / 2000);
  }
  scene.mode = '3d'; scene.update(layout, racks, null);
  scene.content.traverse(o => assert.ok(!o.userData.frontMarker));
  scene.clear();
});
test('single Primary IP shows on server; multiple IPs only show on their interface', () => {
  const deviceInfo = { primary_ips: ['192.0.2.1', '2001:db8::1'] };
  assert.deepEqual(hoverIPs({ deviceInfo }), []);
  assert.deepEqual(hoverIPs({ deviceInfo, interfaceId: 1, interfaceIPs: ['192.0.2.1'] }), ['192.0.2.1']);
  assert.deepEqual(hoverIPs({ deviceInfo, interfaceId: 2, interfaceIPs: [] }), []);
  assert.deepEqual(hoverIPs({ deviceInfo: { primary_ips: ['192.0.2.1'] } }), ['192.0.2.1']);
  assert.deepEqual(hoverIPs({ deviceInfo: { primary_ips: [] } }), []);
});
test('unselected racks receive device images including when nothing is selected', () => {
  const { scene, layout, racks } = fixture();
  for (const selected of [null, { rackId: racks[0].id }]) {
    scene.update(layout, racks, selected);
    const textured = new Set();
    scene.content.traverse(o => { if (Array.isArray(o.material) && o.material.some(m => m.map)) textured.add(o.userData.rackId); });
    assert.deepEqual([...textured], layout.placements.map(p => p.rack_id));
  }
  scene.clear();
});
test('device top and bottom default to grey, with global assigned-color override in both views', () => {
  const { scene, layout, racks } = fixture();
  for (const mode of ['3d', 'top']) for (const deviceColors of [false, true, false]) {
    scene.mode = mode; scene.update(layout, racks, null, { deviceColors });
    let count = 0;
    for (const node of scene.rackNodes.values()) node.details.traverse(o => {
      if (!o.userData.deviceInfo || !Array.isArray(o.material)) return;
      count++;
      const d = o.userData.deviceInfo;
      const expected = deviceColors ? (layout.appearances[String(d.id)]?.color || d.color) : '#808890';
      for (const index of [2, 3]) assert.equal(o.material[index].color.getHexString(), new THREE.Color(expected).getHexString());
    });
    assert.ok(count > 0);
  }
  scene.clear();
});
test('side toggle adds two opaque panels per rack and removes them on reopening', () => {
  const { scene, layout, racks } = fixture();
  for (const sides of [false, true, false]) {
    scene.update(layout, racks, null, { sides, transparent: true });
    const panels = [];
    scene.content.traverse(o => { if (o.userData.sidePanel) panels.push(o); });
    assert.equal(panels.length, sides ? layout.placements.length * 2 : 0);
    assert.ok(panels.every(p => !p.material.transparent && p.material.opacity === 1));
  }
  scene.clear();
});
