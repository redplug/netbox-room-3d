import * as THREE from 'three';
import { clearanceShape, dimensions, footprint } from './geometry.js';

const m = n => n / 1000;
export function createOverlays(scene) {
  let group, signature;
  function clear() {
    if (!group) return;
    group.traverse(o => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } });
    group.removeFromParent(); group = null;
  }
  function floor(item, color, opacity, y = .012) {
    const shape = new THREE.PlaneGeometry(m(item.width), m(item.depth));
    const mesh = new THREE.Mesh(shape, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }));
    mesh.rotation.set(-Math.PI / 2, 0, (item.rotation || 0) * Math.PI / 180);
    mesh.position.set(m(item.x), y, m(item.z)); group.add(mesh);
  }
  function outline(item, color) {
    if (![item.x,item.z,item.width,item.depth].every(Number.isFinite)) return;
    const box = new THREE.BoxGeometry(m(item.width), Math.max(.02, m(item.height || 10)), m(item.depth));
    const edges = new THREE.EdgesGeometry(box); box.dispose();
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .9, depthTest: false }));
    line.position.set(m(item.x), Math.max(.02, m(item.height || 10)) / 2 + .025, m(item.z));
    line.rotation.y = -(item.rotation || 0) * Math.PI / 180; line.renderOrder = 30; group.add(line);
  }
  return {
    update(layout, racks, diffs = [], cables = []) {
      const key = JSON.stringify([layout.zones, layout.clearance, layout.placements, racks.map(r => [r.id,r.width,r.depth,r.height]), diffs, cables]);
      if (key === signature) return;
      signature = key; clear(); group = new THREE.Group(); scene.scene.add(group);
      for (const zone of layout.zones || []) {
        floor(zone, zone.color, .2);
        const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 128;
        const ctx = canvas.getContext('2d'); ctx.font = 'bold 60px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = zone.color; ctx.fillText(zone.name, 512, 64, 1000);
        const texture = new THREE.CanvasTexture(canvas);
        const label = new THREE.Mesh(new THREE.PlaneGeometry(m(zone.width) * .85, Math.min(m(zone.depth) * .4, m(zone.width) * .10625)), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        label.rotation.x = -Math.PI / 2; label.position.set(m(zone.x), .019, m(zone.z)); group.add(label);
      }
      if (layout.clearance?.enabled) for (const p of layout.placements) {
        const rack = racks.find(r => r.id === p.rack_id); if (!rack) continue;
        const shape = { ...p, ...dimensions(rack, p) };
        const protectedShape = clearanceShape(shape, layout.clearance);
        floor(protectedShape, '#d69b24', .13, .021);
      }
      for (const diff of diffs) {
        if (diff.old) outline(diff.old, '#e66c59');
        if (diff.current) outline(diff.current, diff.type === 'added' ? '#19a783' : '#dda323');
      }
      for (const cable of cables) {
        const a = cable.ends.filter(e => e.side === 'A'), b = cable.ends.filter(e => e.side === 'B');
        for (const left of a) for (const right of b) {
          const p = layout.placements.find(p => p.rack_id === left.rack_id), q = layout.placements.find(p => p.rack_id === right.rack_id);
          if (!p || !q) continue;
          const r = racks.find(r => r.id === p.rack_id), s = racks.find(r => r.id === q.rack_id); if (!r || !s) continue;
          const start = new THREE.Vector3(m(p.x), m(dimensions(r,p).height) + .08, m(p.z));
          const end = new THREE.Vector3(m(q.x), m(dimensions(s,q).height) + .08, m(q.z));
          const middle = start.clone().add(end).multiplyScalar(.5); middle.y = Math.max(start.y,end.y) + .5;
          if (p.rack_id === q.rack_id) middle.x += .5;
          const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), new THREE.LineBasicMaterial({ color: /^#[0-9a-fA-F]{6}$/.test(cable.color) ? cable.color : '#168a87', depthTest: false }));
          line.renderOrder = 31; group.add(line);
        }
      }
      scene.draw();
    },
    dispose: clear,
  };
}
