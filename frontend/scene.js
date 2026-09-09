import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { dimensions, deviceBottom, U } from './geometry.js';

const m = n => n / 1000;
export class RoomScene {
  constructor(host, handlers) {
    this.host = host; this.handlers = handlers; this.textures = new Map(); this.mode = '3d';
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#e8edf0');
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor('#e8edf0');
    this.renderer.domElement.setAttribute('aria-label', '서버실 3D 배치 화면');
    this.renderer.domElement.tabIndex = 0;
    host.appendChild(this.renderer.domElement);
    this.labels = new CSS2DRenderer(); Object.assign(this.labels.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' }); host.appendChild(this.labels.domElement);
    this.camera = new THREE.PerspectiveCamera(42, 1, .01, 300);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI / 2 - .02; this.controls.minDistance = .6; this.controls.maxDistance = 100;
    this.controls.addEventListener('change', () => this.draw());
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x657582, 2.5));
    const sun = new THREE.DirectionalLight(0xffffff, 3); sun.position.set(5, 12, 7); this.scene.add(sun);
    this.content = new THREE.Group(); this.scene.add(this.content);
    this.ray = new THREE.Raycaster(); this.floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.renderer.domElement.addEventListener('pointerdown', e => this.down(e), { capture: true });
    this.renderer.domElement.addEventListener('pointermove', e => this.move(e));
    this.renderer.domElement.addEventListener('pointerup', e => this.up(e));
    this.renderer.domElement.addEventListener('pointercancel', () => { this.drag = null; this.controls.enabled = true; });
    this.renderer.domElement.addEventListener('dragover', e => e.preventDefault());
    this.renderer.domElement.addEventListener('drop', e => { e.preventDefault(); const p = this.floorPoint(e); if (p) handlers.drop(Number(e.dataTransfer.getData('text/plain')), p.x * 1000, p.z * 1000); });
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host);
    this.resize();
  }
  resize() {
    const { width, height } = this.host.getBoundingClientRect(); if (!width || !height) return;
    this.renderer.setSize(width, height); this.labels.setSize(width, height);
    this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); this.draw();
  }
  draw() { this.renderer.render(this.scene, this.camera); this.labels.render(this.scene, this.camera); }
  point(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), this.camera);
  }
  floorPoint(e) { this.point(e); return this.ray.ray.intersectPlane(this.floor, new THREE.Vector3()); }
  hit(e) {
    this.point(e);
    for (const hit of this.ray.intersectObjects(this.content.children, true)) {
      if (hit.object.userData.rackId) return hit.object.userData;
    }
    return null;
  }
  down(e) {
    if (e.button !== 0) return;
    const hit = this.hit(e); this.pointerStart = { x: e.clientX, y: e.clientY, hit };
    if (hit && this.mode === 'top' && this.editable) {
      const placement = this.layout.placements.find(p => p.rack_id === hit.rackId);
      if (!placement || placement.locked) return;
      const p = this.floorPoint(e);
      if (!p) return;
      this.drag = { id: hit.rackId, dx: placement.x - p.x * 1000, dz: placement.z - p.z * 1000 };
      this.controls.enabled = false; e.stopImmediatePropagation(); this.renderer.domElement.setPointerCapture(e.pointerId);
    }
  }
  move(e) {
    if (!this.drag) return;
    const p = this.floorPoint(e); if (p) this.handlers.drag(this.drag.id, p.x * 1000 + this.drag.dx, p.z * 1000 + this.drag.dz);
  }
  up(e) {
    const start = this.pointerStart;
    if (this.drag) { this.drag = null; this.controls.enabled = true; this.handlers.dragEnd(); }
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 5 && start.hit) this.handlers.select(start.hit.rackId, this.mode === 'top' ? null : start.hit.deviceId);
    this.pointerStart = null;
  }
  cube(w, h, d, x, y, z, color, parent = this.content, options = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: .78, ...options }));
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  label(text, x, y, z, parent, className = '') {
    const div = document.createElement('div'); div.className = `r3-label ${className}`; div.textContent = text;
    const obj = new CSS2DObject(div); obj.position.set(x, y, z); parent.add(obj);
  }
  texture(url, color, aspect) {
    const key = `${url}|${color}|${aspect.toFixed(2)}`;
    if (this.textures.has(key)) return this.textures.get(key);
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = Math.max(32, Math.round(1024 / aspect));
    const ctx = canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.set(key, texture);
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      ctx.drawImage(img, (canvas.width - img.width * scale) / 2, (canvas.height - img.height * scale) / 2, img.width * scale, img.height * scale);
      texture.needsUpdate = true; this.draw();
    };
    img.onerror = () => this.handlers.imageError?.(); img.src = url;
    return texture;
  }
  clear() {
    this.content.traverse(o => { o.geometry?.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(v => v.dispose()); if (o.isCSS2DObject) o.element.remove(); });
    this.content.clear();
  }
  update(layout, racks, selected, opts = {}) {
    this.layout = layout; this.racks = racks; this.editable = opts.editable; this.clear();
    const w = m(layout.width), d = m(layout.depth), h = m(layout.height);
    this.cube(w, .08, d, w / 2, -.06, d / 2, '#fafcfd');
    if (opts.grid) {
      const points = [], step = Math.max(.1, m(layout.grid));
      for (let x = 0; x <= w; x += step) points.push(new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, 0, d));
      for (let z = 0; z <= d; z += step) points.push(new THREE.Vector3(0, 0, z), new THREE.Vector3(w, 0, z));
      const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#cbd5df', transparent: true, opacity: .65 })); this.content.add(lines);
    }
    if (opts.walls) {
      this.cube(w, h, .07, w / 2, h / 2, 0, '#cdd9df', this.content, { transparent: true, opacity: .24, depthWrite: false });
      this.cube(.07, h, d, 0, h / 2, d / 2, '#cdd9df', this.content, { transparent: true, opacity: .24, depthWrite: false });
    }
    this.label(`${(w).toFixed(1)} m`, w / 2, .05, d + .4, this.content, 'dimension');
    this.label(`${(d).toFixed(1)} m`, w + .45, .05, d / 2, this.content, 'dimension');
    for (const b of layout.blocks) {
      this.cube(m(b.width), m(b.height), m(b.depth), m(b.x), m(b.height) / 2, m(b.z), '#b9c3cc');
      if (opts.labels) this.label(b.name, m(b.x), m(b.height) + .12, m(b.z), this.content, 'muted');
    }
    for (const placement of layout.placements) {
      const rack = racks.find(r => r.id === placement.rack_id); if (!rack) continue;
      const dims = dimensions(rack, placement), rw = m(dims.width), rd = m(dims.depth), rh = m(dims.height);
      const group = new THREE.Group(); group.position.set(m(placement.x), 0, m(placement.z)); group.rotation.y = -placement.rotation * Math.PI / 180; this.content.add(group);
      const meta = { rackId: rack.id }, active = selected?.rackId === rack.id;
      const baseColor = active ? '#0d9488' : '#273847';
      this.cube(rw, .07, rd, 0, .035, 0, baseColor, group).userData = meta;
      this.cube(rw, .07, rd, 0, rh - .035, 0, baseColor, group, { transparent: !!opts.transparent, opacity: opts.transparent ? .18 : 1, depthWrite: !opts.transparent }).userData = meta;
      for (const x of [-rw / 2 + .025, rw / 2 - .025]) for (const z of [-rd / 2 + .025, rd / 2 - .025]) this.cube(.04, rh, .04, x, rh / 2, z, baseColor, group).userData = meta;
      const railW = Math.min(m(rack.rail_width || 482.6), rw - .08), base = (rh - m(rack.u_height * U)) / 2;
      for (const x of [-railW / 2 - .012, railW / 2 + .012]) for (const z of [-rd / 2 + .065, rd / 2 - .065]) this.cube(.018, m(rack.u_height * U), .025, x, rh / 2, z, '#82929f', group).userData = meta;
      if (opts.labels) this.label(`${rack.name}${placement.locked ? ' · 잠금' : ''}`, 0, rh + .18, 0, group, active ? 'active' : '');
      if (active) {
        const marker = this.cube(rw + .12, .012, rd + .12, 0, .008, 0, '#2dd4bf', group, { transparent: true, opacity: .45 }); marker.userData = meta;
        this.label('FRONT', 0, .03, rd / 2 + .16, group, 'front');
      }
      for (const device of rack.devices) {
        const bottom = deviceBottom(rack, device); if (bottom == null) continue;
        const style = layout.appearances[String(device.id)] || {}, color = style.color || device.color || '#64748b';
        const dh = m(device.u_height * U) - .003, dd = Math.min(m(style.depth || (device.full_depth ? dims.depth - 140 : dims.depth * .42)), rd - .12);
        const rear = device.face === 'rear', z = rear ? -rd / 2 + .065 + dd / 2 : rd / 2 - .065 - dd / 2;
        const deviceGroup = new THREE.Group(); deviceGroup.position.set(0, base + m(bottom) + dh / 2, z); deviceGroup.rotation.y = rear ? Math.PI : 0; group.add(deviceGroup);
        const mesh = this.cube(railW, dh, dd, 0, 0, 0, color, deviceGroup); mesh.userData = { ...meta, deviceId: device.id };
        if (active && this.mode !== 'top') {
          const mats = Array.from({ length: 6 }, () => new THREE.MeshStandardMaterial({ color, roughness: .8 }));
          for (const [face, index] of [['front', 4], ['rear', 5]]) {
            const override = device.images.find(i => i.id === style[`${face}_image_id`]);
            const url = override?.url || device[`${face}_image`];
            if (url) { mats[index].color.set('#ffffff'); mats[index].map = this.texture(url, color, railW / dh); }
          }
          mesh.material.dispose(); mesh.material = mats;
          if (selected.deviceId === device.id) { const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: '#fbbf24' })); deviceGroup.add(edges); }
        }
      }
    }
    this.draw();
  }
  view(mode, selected) {
    this.mode = mode === 'top' ? 'top' : '3d'; this.controls.enableRotate = mode !== 'top';
    const l = this.layout; if (!l) return;
    const center = new THREE.Vector3(m(l.width) / 2, 0, m(l.depth) / 2), span = Math.max(m(l.width), m(l.depth));
    if ((mode === 'front' || mode === 'rear') && selected) {
      const p = l.placements.find(p => p.rack_id === selected.rackId), rack = this.racks.find(r => r.id === selected.rackId);
      if (p && rack) {
        const dims = dimensions(rack, p), rotation = -p.rotation * Math.PI / 180;
        center.set(m(p.x), m(dims.height) / 2, m(p.z));
        const offset = new THREE.Vector3(0, .12, (mode === 'rear' ? -1 : 1) * (m(dims.depth) / 2 + 3.4)).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
        this.camera.position.copy(center).add(offset);
      }
    } else if (mode === 'top') this.camera.position.set(center.x, span * 1.5, center.z + .001);
    else this.camera.position.set(center.x + span * .8, span * .8, center.z + span * .85);
    this.controls.target.copy(center); this.controls.update(); this.draw();
  }
}
