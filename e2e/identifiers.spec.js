import { test, expect } from '@playwright/test';

const identifiers = page => page.evaluate(() => {
  const rows = [], scene = window.__identifierScene, target = window.__identifierTarget;
  scene.rackNodes.get(target.rackId).group.traverse(object => {
    if (object.userData.identifierKind && object.userData.deviceId === target.deviceId) rows.push({
      kind: object.userData.identifierKind, text: JSON.parse(object.userData.textKey)[1], rear: object.rotation.y !== 0,
    });
  });
  return rows;
});

test('device faces and independent global toggles update without editing the layout', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/frontend/main.js*', async route => {
    const response = await route.fetch(), body = await response.text();
    expect(body).toContain('scene = new RoomScene');
    await route.fulfill({ response, body: body.replace('scene = new RoomScene', 'scene = window.__identifierScene = new RoomScene') });
  });
  await page.goto('http://127.0.0.1:5173');
  await expect(page.locator('#r3-canvas canvas')).toBeVisible();
  await page.waitForFunction(() => window.__identifierScene?.racks?.length);
  await page.evaluate(() => {
    const scene = window.__identifierScene, rack = scene.racks.find(r => scene.layout.placements.some(p => p.rack_id === r.id));
    const device = rack.devices.find(d => d.u_height >= 2 && d.position != null);
    device.asset_number = 'ASSET-2026-000123'; device.asset_tag = 'NATIVE-TAG-NOT-SHOWN'; device.serial = 'SERIAL-ABC123456789';
    window.__identifierTarget = { rackId: rack.id, deviceId: device.id };
    window.__identifierOriginalLayout = JSON.stringify(scene.layout);
  });
  await expect(page.locator('#r3-assetTags')).toBeChecked();
  await expect(page.locator('#r3-serialNumbers')).toBeChecked();
  await page.locator('#r3-assetTags').dispatchEvent('change');
  expect(await identifiers(page)).toHaveLength(4);
  expect((await identifiers(page)).filter(row => row.text === '자산: ASSET-2026-000123')).toHaveLength(2);
  expect((await identifiers(page)).filter(row => row.text === '시리얼: SERIAL-ABC123456789')).toHaveLength(2);
  await page.evaluate(() => window.__identifierScene.view('front', window.__identifierTarget));
  await page.screenshot({ path: 'artifacts/identifiers-front.png' });
  await page.evaluate(() => window.__identifierScene.view('rear', window.__identifierTarget));
  await page.screenshot({ path: 'artifacts/identifiers-rear.png' });
  await page.locator('#r3-assetTags').uncheck();
  expect((await identifiers(page)).map(row => row.kind)).toEqual(['serial', 'serial']);
  await page.locator('#r3-serialNumbers').uncheck(); expect(await identifiers(page)).toHaveLength(0);
  await page.locator('#r3-assetTags').check();
  expect((await identifiers(page)).map(row => row.kind)).toEqual(['asset_number', 'asset_number']);
  await page.locator('#r3-serialNumbers').check(); expect(await identifiers(page)).toHaveLength(4);
  await page.evaluate(() => {
    const target = window.__identifierTarget;
    window.__identifierScene.racks.find(r => r.id === target.rackId).devices.find(d => d.id === target.deviceId).asset_number = null;
  });
  await page.locator('#r3-assetTags').dispatchEvent('change');
  expect((await identifiers(page)).map(row => row.kind)).toEqual(['serial', 'serial']);
  await page.evaluate(() => {
    const target = window.__identifierTarget;
    window.__identifierScene.racks.find(r => r.id === target.rackId).devices.find(d => d.id === target.deviceId).asset_number = 'ASSET-2026-000123';
  });
  await page.locator('#r3-assetTags').dispatchEvent('change'); expect(await identifiers(page)).toHaveLength(4);
  await expect(page.locator('[data-action=save]')).toBeDisabled();
  expect(await page.evaluate(() => JSON.stringify(window.__identifierScene.layout) === window.__identifierOriginalLayout)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const selector of ['#r3-assetTags', '#r3-serialNumbers', '.r3-version']) {
    const box = await page.locator(selector).boundingBox(); expect(box.y + box.height).toBeLessThanOrEqual(844);
  }
  await page.screenshot({ path: 'artifacts/identifiers-mobile.png' });
  expect(errors).toEqual([]);
});

test('compiled NetBox viewer renders identifier response fixtures with both controls', async ({ page }) => {
  let rackId;
  await page.addInitScript(() => {
    window.__identifierPaint = [];
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
      if (String(text).startsWith('자산: ') || String(text).startsWith('시리얼: ')) window.__identifierPaint.push(String(text));
      return original.call(this, text, ...args);
    };
  });
  await page.route('**/plugins/room-3d/data/locations/*/', async route => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch(), data = await response.json();
    const rack = data.racks.find(r => r.devices.some(d => d.u_height >= 2 && d.position != null) && data.layout.placements.some(p => p.rack_id === r.id));
    if (rack) {
      const device = rack.devices.find(d => d.u_height >= 2 && d.position != null);
      rackId = rack.id; device.asset_number = 'NETBOX-ASSET-123'; device.asset_tag = 'NATIVE-TAG-NOT-SHOWN'; device.serial = 'NETBOX-SERIAL-123456';
    }
    await route.fulfill({ response, json: data });
  });
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/');
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill('room3d-demo');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('room3d-local-demo');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.locator('#r3-location').selectOption({ label: 'Room3D Demo IDC / 서버실 A' });
  await expect.poll(() => page.evaluate(() => window.__identifierPaint)).toContain('자산: NETBOX-ASSET-123');
  await expect.poll(() => page.evaluate(() => window.__identifierPaint)).toContain('시리얼: NETBOX-SERIAL-123456');
  expect(await page.evaluate(() => window.__identifierPaint)).not.toContain('자산: NATIVE-TAG-NOT-SHOWN');
  await expect(page.locator('#r3-assetTags')).toBeChecked();
  await expect(page.locator('#r3-serialNumbers')).toBeChecked();
  await page.locator('#r3-show-placed').check();
  await page.locator(`.r3-rack-select[data-id="${rackId}"]`).click();
  await page.getByRole('button', { name: '전면 보기', exact: true }).click();
  await page.screenshot({ path: 'artifacts/identifiers-netbox.png' });
  await expect(page.locator('[data-action=save]')).toBeDisabled();
});
