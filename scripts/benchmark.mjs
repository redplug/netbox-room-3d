// Run with the local Vite server: node scripts/benchmark.mjs baseline|optimized [racks=24]
// Synthetic data only. Never points at an operational NetBox.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const label = process.argv[2] || 'optimized';
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid report label');
const count = Number(process.argv[3] || 24);
if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('Use 1–100 racks');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:5173');
  await page.locator('#r3-canvas canvas').waitFor();
  const result = await page.evaluate(async count => {
    const { RoomScene } = await import('/frontend/scene.js');
    const { demoData } = await import('/frontend/demo.js');
    const base = demoData();
    const racks = Array.from({ length: count }, (_, i) => ({
      ...base.racks[0], id: i + 1, name: `BENCH-${i + 1}`,
      devices: Array.from({ length: 20 }, (_, j) => ({
        ...base.racks[0].devices[2], id: i * 100 + j + 1, name: `server-${i + 1}-${j + 1}`,
        position: j * 2 + 1, front_image: null, rear_image: null,
        interfaces: Array.from({ length: 4 }, (_, k) => ({ id: i * 1000 + j * 4 + k + 1, name: `eth${k}` })),
      })),
    }));
    const layout = { ...base.layout, width: 24000, depth: 24000, blocks: [], appearances: {},
      placements: racks.map((r, i) => ({ rack_id: r.id, x: 1500 + (i % 8) * 2400, z: 2000 + Math.floor(i / 8) * 3000, rotation: 0, locked: false, dimensions: {} })) };
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;inset:0;width:1280px;height:800px;z-index:100000'; document.body.append(host);
    const scene = new RoomScene(host, { imageError() {}, exitWalk() {}, walkError() {} });
    // Measure JavaScript scene preparation separately from GPU/driver performance.
    // The UI tests exercise the actual renderer and pointer events independently.
    scene.draw = () => {}; scene.flushDraw = () => {}; scene.labels.render = () => {};
    const opts = { labels: true, units: true, usage: true, statuses: true, transparent: true, grid: true, walls: true, editable: true };
    const selected = { rackId: 1 };
    let clears = 0, texts = 0;
    const clear = scene.clear.bind(scene), text = scene.textPanel.bind(scene);
    scene.clear = (...args) => { clears++; return clear(...args); };
    scene.textPanel = (...args) => { texts++; return text(...args); };
    const flush = () => scene.flushDraw?.();
    let start = performance.now(); scene.update(layout, racks, selected, opts); scene.view('3d', selected); flush();
    const initialMs = performance.now() - start;
    await new Promise(requestAnimationFrame);
    const measure = fn => { const t = performance.now(); fn(); flush(); return performance.now() - t; };
    const stats = values => ({ medianMs: [...values].sort((a,b) => a-b)[Math.floor(values.length / 2)], maxMs: Math.max(...values), samplesMs: values });
    clears = 0; texts = 0;
    const switches = [];
    for (let i = 0; i < 3; i++) {
      switches.push(measure(() => { scene.view('top', selected); scene.update(layout, racks, selected, opts); }));
      switches.push(measure(() => { scene.view('3d', selected); scene.update(layout, racks, selected, opts); }));
    }
    const switching = { ...stats(switches), clears, textPanelsCreated: texts };
    scene.view('top', selected); scene.update(layout, racks, selected, opts); flush();
    clears = 0; texts = 0;
    const moves = [];
    for (let i = 0; i < 12; i++) moves.push(measure(() => {
      layout.placements[0].x += 10;
      if (scene.movePlacement) scene.movePlacement('rack', 1, layout.placements[0]);
      else scene.update(layout, racks, selected, opts);
    }));
    const dragging = { ...stats(moves), clears, textPanelsCreated: texts };
    const metrics = { measurement: 'JavaScript scene preparation; GPU rendering excluded', racks: count, devices: count * 20, interfaces: count * 80, initialMs, switching, dragging,
      diagnostics: scene.diagnostics || null, userAgent: navigator.userAgent };
    if (scene.dispose) scene.dispose(); else { scene.clear(); scene.renderer.dispose(); scene.observer.disconnect(); }
    host.remove(); return metrics;
  }, count);
  await mkdir('artifacts', { recursive: true });
  await writeFile(`artifacts/performance-${label}.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
