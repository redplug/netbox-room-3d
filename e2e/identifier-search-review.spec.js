import { test, expect } from '@playwright/test';

// Independent review fixtures: browser-only data, no persistent inventory writes.
async function openReview(page) {
  await page.route('**/frontend/api.js*', async route => {
    const response = await route.fetch();
    let body = await response.text();
    expect(body).toContain('const data = demoData(id);');
    body = body.replace('const data = demoData(id);', `const data = demoData(id);
      const rack = data.racks.find(r => data.layout.placements.some(p => p.rack_id === r.id) && r.devices.length);
      const device = structuredClone(rack.devices.find(d => d.position != null && d.u_height > 0));
      for (const r of data.racks) r.devices = [];
      rack.custom_fields = { Asset_Number: 'RACK-ONLY-REVIEW' };
      rack.asset_number = 'RACK-ONLY-REVIEW';
      rack.devices = [{...device, name: 'Review device', asset_number: 'LOCATION-' + id + '-ONLY', serial: ''},
        {...device, id: 990002, position: null, name: 'Missing asset', asset_number: null, serial: '', asset_tag: 'NATIVE-ONLY-REVIEW'}];`);
    body = body.replace('async save(id, layout) {', `async save(id, layout) {
      window.__reviewSave = structuredClone(layout); throw new Error('QA captured save without persistence');`);
    await route.fulfill({ response, body });
  });
  await page.route('**/frontend/main.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('scene = new RoomScene', 'scene = window.__reviewScene = new RoomScene') });
  });
  await page.goto('http://127.0.0.1:5173');
  await expect(page.locator('#r3-canvas canvas')).toBeVisible();
  await page.waitForFunction(() => window.__reviewScene?.racks?.length);
}

test('review: Location transition excludes prior identifiers and Rack-only fallback', async ({ page }) => {
  await openReview(page);
  const search = page.getByRole('searchbox'), result = page.locator('[data-action=find-device]');
  await search.fill('LOCATION-1-ONLY'); await expect(result).toHaveCount(1);
  await page.locator('#r3-location').selectOption('2');
  await expect(result).toHaveCount(0);
  await search.fill('LOCATION-2-ONLY'); await expect(result).toHaveCount(1);
  await page.locator('#r3-location').selectOption('1'); await expect(result).toHaveCount(0);
  for (const query of ['RACK-ONLY-REVIEW', 'NATIVE-ONLY-REVIEW']) {
    await search.fill(query); await expect(result).toHaveCount(0);
  }
  await search.fill('Missing asset'); await expect(result).toHaveCount(1);
  await expect(result.locator('[data-identifier]')).toHaveCount(0);
});

test('review: search moves camera while preserving an existing unsaved layout and save payload', async ({ page }) => {
  await openReview(page);
  await page.locator('#r3-grid-size').fill('700');
  await page.locator('#r3-grid-size').dispatchEvent('change');
  await expect(page.locator('#r3-save-state')).toHaveText('저장하지 않은 변경');
  await expect(page.locator('[data-action=save]')).toBeEnabled();
  await page.locator('[data-view=top]').click();
  const before = await page.evaluate(() => ({ layout: structuredClone(window.__reviewScene.layout),
    racks: JSON.stringify(window.__reviewScene.racks), camera: window.__reviewScene.camera.position.toArray(),
    storage: JSON.stringify({...localStorage}) }));
  await page.getByRole('searchbox').fill('LOCATION-1-ONLY');
  await page.locator('[data-action=find-device]').click();
  await expect(page.locator('.r3-focus-tag')).toContainText('Review device');
  expect(await page.evaluate(() => window.__reviewScene.camera.position.toArray())).not.toEqual(before.camera);
  await expect(page.locator('#r3-save-state')).toHaveText('저장하지 않은 변경');
  await expect(page.locator('[data-action=save]')).toBeEnabled();
  const after = await page.evaluate(() => ({layout: structuredClone(window.__reviewScene.layout), racks: JSON.stringify(window.__reviewScene.racks), storage: JSON.stringify({...localStorage})}));
  expect(after).toEqual({layout: before.layout, racks: before.racks, storage: before.storage});
  await page.locator('[data-action=save]').click();
  await expect(page.locator('#r3-notice')).toContainText('QA captured save');
  expect(await page.evaluate(() => window.__reviewSave)).toEqual(before.layout);
});

test('review: compiled identifier textures align left on both faces and walking controls work', async ({ page }) => {
  await page.addInitScript(() => {
    window.__reviewPaint = [];
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
      if (/^(자산: QA-ALIGN|시리얼: QA-SERIAL)/.test(String(text))) window.__reviewPaint.push({text, align:this.textAlign});
      return fill.call(this, text, ...args);
    };
  });
  await page.route('**/plugins/room-3d/data/locations/*/', async route => {
    const response = await route.fetch(), data = await response.json();
    const rack = data.racks.find(r => data.layout.placements.some(p => p.rack_id === r.id) && r.devices.some(d => d.u_height >= 2 && d.position != null));
    const device = rack.devices.find(d => d.u_height >= 2 && d.position != null);
    device.asset_number = 'QA-ALIGN'; device.serial = 'QA-SERIAL';
    data.can_edit = false;
    await route.fulfill({response, json:data});
  });
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/');
  await page.getByRole('textbox', {name:'Username', exact:true}).fill('room3d-demo');
  await page.getByRole('textbox', {name:'Password', exact:true}).fill('room3d-local-demo');
  await page.getByRole('button', {name:'Sign In', exact:true}).click();
  await page.locator('#r3-location').selectOption({label:'Room3D Demo IDC / 서버실 A'});
  // Both faces share the cached texture; each distinct text is painted once.
  await expect.poll(() => page.evaluate(() => window.__reviewPaint.length)).toBeGreaterThanOrEqual(2);
  const paint = await page.evaluate(() => window.__reviewPaint);
  for (const text of ['자산: QA-ALIGN', '시리얼: QA-SERIAL']) {
    expect(paint.filter(row => row.text === text).length).toBeGreaterThanOrEqual(1);
    expect(paint.filter(row => row.text === text).every(row => row.align === 'left')).toBe(true);
  }
  await page.locator('[data-view=walk]').click();
  await page.getByRole('button', {name:'시점 높이 올리기', exact:true}).click();
  await expect(page.locator('#r3-walk-height-value')).toHaveText('1.90 m');
  await expect(page.locator('[data-action=save]')).toBeDisabled();
  await page.screenshot({path:'artifacts/qa-v0.3.3/compiled-walking.png'});
});
