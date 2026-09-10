import * as THREE from 'three';
import { dimensions, deviceBottom, U } from './geometry.js';
import { rackUsage, statusColor, usageColor } from './inventory.js';
const m = n => n / 1000;

// Called only when the content signature of this rack changes, never per drag frame.
export function buildRack(placement, rack, layout, opts) {
  const dims = dimensions(rack, placement), rw = m(dims.width), rd = m(dims.depth), rh = m(dims.height);
  const root = new THREE.Group(); root.position.set(m(placement.x), 0, m(placement.z)); root.rotation.y = -placement.rotation * Math.PI / 180;
  const group = new THREE.Group(), top = new THREE.Group(); root.add(group); this.content.add(root);
  const meta = { rackId: rack.id };
  {
    const points = new Float32Array([-.09, .015, rd / 2 + .07, .09, .015, rd / 2 + .07, 0, .015, rd / 2 + .25]);
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const arrow = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#089b88', side: THREE.DoubleSide, depthTest: false }));
    arrow.userData = { ...meta, frontMarker: true }; arrow.renderOrder = 10; top.add(arrow);
    this.label('앞 · FRONT', 0, .03, rd / 2 + .38, top, 'rack-front');
    this.label('뒤', 0, .03, -rd / 2 - .15, top, 'rack-rear');
  }
  const usage = rackUsage(rack);
  const baseColor = '#273847';
  this.cube(rw, .07, rd, 0, rh - .035, 0, baseColor, top).userData = meta;
  this.cube(rw, .07, rd, 0, .035, 0, baseColor, group).userData = meta;
  this.cube(rw, .07, rd, 0, rh - .035, 0, baseColor, group, { transparent: !!opts.transparent, opacity: opts.transparent ? .18 : 1, depthWrite: !opts.transparent }).userData = meta;
  for (const x of [-rw / 2 + .025, rw / 2 - .025]) for (const z of [-rd / 2 + .025, rd / 2 - .025]) this.cube(.04, rh, .04, x, rh / 2, z, baseColor, group).userData = meta;
  if (opts.sides) {
    for (const x of [-rw / 2 + .012, rw / 2 - .012]) {
      const panel = this.cube(.024, rh - .14, rd - .08, x, rh / 2, 0, baseColor, group);
      panel.userData = { ...meta, sidePanel: true };
    }
  }
  const railW = Math.min(m(rack.rail_width || 482.6), rw - .08), base = (rh - m(rack.u_height * U)) / 2;
  if (opts.usage) this.label(`${usage.used}/${rack.u_height}U · 잔여 ${usage.free}U · ${usage.count}대 · ${usage.percent}%`, 0, rh + .35, 0, root, 'usage');
  if (opts.usage) this.cube(rw, .025, rd, 0, rh + .02, 0, usageColor(usage.percent), group).userData = meta;
  if (opts.units) for (let i = 0; i < rack.u_height; i++) {
    const number = rack.starting_unit + (rack.desc_units ? rack.u_height - i - 1 : i);
    const y = base + m((i + .5) * U);
    for (const rear of [false, true]) {
      const z = (rear ? -1 : 1) * (rd / 2 + .003);
      this.textPanel(String(number), .045, m(U) * .85, -rw / 2 - .025, y, z, group, rear, { ...meta, unitLabel: true });
      if (!usage.occupied.has(i)) this.cube(railW, .002, .003, 0, y, z, '#94a3b8', group).userData = meta;
    }
  }
  for (const x of [-railW / 2 - .012, railW / 2 + .012]) for (const z of [-rd / 2 + .065, rd / 2 - .065]) this.cube(.018, m(rack.u_height * U), .025, x, rh / 2, z, '#82929f', group).userData = meta;
  const nameLabel = opts.labels ? this.label(`${rack.name}${placement.locked ? ' · 잠금' : ''}`, 0, rh + .18, 0, root) : null;
  this.textPanel('FRONT · 전면', rw * .85, .065, 0, rh - .035, rd / 2 + .002, group, false, meta);
  this.textPanel('REAR · 후면', rw * .85, .065, 0, rh - .035, -rd / 2 - .002, group, true, meta);
  for (const device of rack.devices) {
    const bottom = deviceBottom(rack, device); if (bottom == null) continue;
    const style = layout.appearances[String(device.id)] || {}, color = style.color || device.color || '#64748b';
    const dh = m(device.u_height * U) - .003, dd = Math.min(m(style.depth || (device.full_depth ? dims.depth - 140 : dims.depth * .42)), rd - .12);
    const rear = device.face === 'rear', z = rear ? -rd / 2 + .065 + dd / 2 : rd / 2 - .065 - dd / 2;
    const deviceGroup = new THREE.Group(); deviceGroup.position.set(0, base + m(bottom) + dh / 2, z); deviceGroup.rotation.y = rear ? Math.PI : 0; group.add(deviceGroup);
    const deviceMeta = { ...meta, deviceId: device.id, deviceInfo: device };
    const mesh = this.cube(railW, dh, dd, 0, 0, 0, color, deviceGroup); mesh.userData = deviceMeta;
    {
      const mats = Array.from({ length: 6 }, (_, index) => new THREE.MeshStandardMaterial({ color: (index === 2 || index === 3) && !opts.deviceColors ? '#808890' : color, roughness: .8 }));
      for (const [face, index] of [['front', 4], ['rear', 5]]) {
        const override = device.images.find(i => i.id === style[`${face}_image_id`]);
        const url = override?.url || device[`${face}_image`];
        if (url) { mats[index].color.set('#ffffff'); mats[index].map = this.texture(url, color, railW / dh); mats[index].userData.imageKey = mats[index].map.userData.poolKey; }
      }
      mesh.material.dispose(); mesh.material = mats;
      if (opts.statuses) for (const rearFace of [false, true]) this.textPanel(device.status_label || device.status, railW * .35, Math.min(dh * .3, .025), railW * .3, -dh * .3, (rearFace ? -1 : 1) * (dd / 2 + .004), deviceGroup, rearFace, { ...deviceMeta, statusColor: statusColor(device.status) });
      const nameHeight = Math.min(dh * .65, .04);
      this.textPanel(device.name, railW * .94, nameHeight, 0, (dh - nameHeight) / 2 - .001, dd / 2 + .001, deviceGroup, false, deviceMeta);
      const ports = device.interfaces || [];
      const columns = 8, rows = Math.ceil(ports.length / columns);
      const size = Math.min(m(U) / 2, dh * .85 / Math.max(1, rows) * .8, railW * .94 / columns * .8);
      const pitchX = size * 1.25, pitchY = size * 1.25;
      ports.forEach((port, i) => this.textPanel(port.name, size, size,
        railW * .47 - ((i % columns) + .5) * pitchX, dh * .425 - (Math.floor(i / columns) + .5) * pitchY,
        -dd / 2 - .002, deviceGroup, true, { ...deviceMeta, rearInfo: device, interfaceId: port.id, interfaceName: port.name, interfaceIPs: port.primary_ips || [], isPrimary: !!port.is_primary }));
    }
  }
  const devices = new Map(), frameMeshes = [];
  root.add(top);
  root.traverse(o => {
    if (o.isMesh && !Array.isArray(o.material) && !o.userData.deviceInfo && !o.userData.textPanel && o.material.color?.getHexString() === '273847') frameMeshes.push(o);
    if (o.isMesh && o.userData.deviceInfo && Array.isArray(o.material)) devices.set(o.userData.deviceId, o);
  });
  root.remove(top);
  return { group: root, details: group, top, devices, frameMeshes, nameLabel };

}

export function buildRoom(layout, opts) {
  const group = new THREE.Group(); this.content.add(group);
  const w = m(layout.width), d = m(layout.depth), h = m(layout.height);
  this.cube(w, .08, d, w / 2, -.06, d / 2, '#fafcfd', group);
  if (opts.grid) {
    const points = [], step = Math.max(.1, m(layout.grid));
    for (let x = 0; x <= w; x += step) points.push(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, 0, d));
    for (let z = 0; z <= d; z += step) points.push(new THREE.Vector3(0, 0, z), new THREE.Vector3(w, 0, z));
    group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#cbd5df', transparent: true, opacity: .65 })));
  }
  if (opts.walls) {
    this.cube(w, h, .07, w / 2, h / 2, 0, '#cdd9df', group, { transparent: true, opacity: .24, depthWrite: false });
    this.cube(.07, h, d, 0, h / 2, d / 2, '#cdd9df', group, { transparent: true, opacity: .24, depthWrite: false });
  }
  this.label(w.toFixed(1) + ' m', w / 2, .05, d + .4, group, 'dimension');
  this.label(d.toFixed(1) + ' m', w + .45, .05, d / 2, group, 'dimension');
  return group;
}
