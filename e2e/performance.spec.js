import { test, expect } from '@playwright/test';

test('cached scene retains objects/resources across views and releases removed inventory', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await page.locator('#r3-canvas canvas').waitFor();
  const result = await page.evaluate(async () => {
    const { RoomScene } = await import('/frontend/scene.js');
    const { demoData } = await import('/frontend/demo.js');
    const { layout, racks } = demoData();
    const host = document.createElement('div'); host.style.cssText = 'position:fixed;inset:0;width:900px;height:700px'; document.body.append(host);
    const scene = new RoomScene(host, { imageError() {}, walkError() {}, exitWalk() {} });
    const opts = { labels: true, units: true, statuses: true, usage: true };
    scene.update(layout, racks, null, opts); scene.view('3d'); scene.flushDraw();
    const ids = [...scene.rackNodes.values()].map(n => n.group.uuid);
    const created = scene.pool.stats.created;
    const graphics = { ...scene.renderer.info.memory };
    for (let i = 0; i < 20; i++) {
      scene.view(i % 2 ? '3d' : 'top'); scene.update(layout, racks, null, opts);
      layout.placements[0].x += 1; scene.movePlacement('rack', racks[0].id, layout.placements[0]);
    }
    scene.flushDraw();
    const stable = JSON.stringify(ids) === JSON.stringify([...scene.rackNodes.values()].map(n => n.group.uuid));
    const noResourcesCreated = created === scene.pool.stats.created;
    const graphicsStable = JSON.stringify(graphics) === JSON.stringify(scene.renderer.info.memory);
    for (let i = 0; i < 8; i++) {
      scene.update({ ...layout, placements: [] }, racks, null, opts);
      scene.update(layout, racks, null, opts);
    }
    scene.update({ ...layout, placements: [], blocks: [] }, [], null, opts);
    const remaining = scene.pool.stats;
    scene.dispose(); const disposed = scene.pool.stats.entries === 0 && scene.rackNodes.size === 0;
    host.remove();
    return { stable, noResourcesCreated, graphicsStable, remaining, disposed };
  });
  expect(result.stable).toBe(true); expect(result.noResourcesCreated).toBe(true);
  expect(result.graphicsStable).toBe(true); expect(result.remaining.idle).toBeLessThanOrEqual(128);
  expect(result.remaining.entries).toBe(result.remaining.idle); expect(result.disposed).toBe(true);
  expect(errors).toEqual([]);
});

test('cancelled rack drag restores coordinates; one completed drag produces one undo', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('heading', { name: 'A-01', exact: true }).waitFor();
  await page.getByRole('button', { name: '평면 배치', exact: true }).click();
  const x = page.getByRole('spinbutton', { name: 'X (mm)', exact: true });
  const start = await x.inputValue();
  const drag = async () => {
    const r = await page.locator('.r3-label.active').boundingBox();
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2 + 12); await page.mouse.down();
    await page.mouse.move(r.x + r.width / 2 - 40, r.y + r.height / 2 + 12, { steps: 15 });
  };
  await drag();
  await page.locator('#r3-canvas canvas').dispatchEvent('pointercancel'); await page.mouse.up();
  await expect(x).toHaveValue(start);
  await expect(page.getByRole('button', { name: '배치 저장', exact: true })).toBeDisabled();
  await drag(); await page.mouse.up(); await expect(x).not.toHaveValue(start);
  await page.getByRole('button', { name: '↶ 되돌리기', exact: true }).click();
  await expect(x).toHaveValue(start);
  await expect(page.getByRole('button', { name: '↶ 되돌리기', exact: true })).toBeDisabled();
});
