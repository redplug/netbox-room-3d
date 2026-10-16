import { test, expect } from '@playwright/test';

// Deterministic response fixtures: no identifier values are assumed in real inventory.
async function fixture(page, readonly = false) {
  await page.route('**/frontend/api.js*', async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace('const data = demoData(id);', `const data = demoData(id);
      const placed = data.racks[0], unplaced = data.racks[1];
      const template = structuredClone(placed.devices[0]);
      for (const rack of data.racks) rack.devices = [];
      placed.devices = [
        {...template, id: 90001, name: 'Search target', asset_number: '  AsSeT-42  ', serial: 'Sn-AbC', asset_tag: 'NATIVE-ONLY', status: 'active', primary_ips: ['192.0.2.222/24'], ip_addresses: ['2001:db8::222/64']},
        {...template, id: 90002, name: 'Zero U target', asset_number: 0, serial: null, position: null, u_height: 0, status: 'offline'},
        {...template, id: 90003, name: 'Literal HTML', asset_number: '<img src=x onerror="window.__searchXSS=1">&', serial: '   ', status: 'active'},
        {...template, id: 90004, name: 'No identifiers', asset_number: null, serial: '', asset_tag: 'NATIVE-ONLY', status: 'active'},
      ];
      unplaced.devices = [{...template, id: 90005, name: 'Unplaced target', asset_number: 'UNPLACED-ASSET', serial: 'UNPLACED-SN', status: 'active'}];
      data.layout.placements = data.layout.placements.filter(p => p.rack_id !== unplaced.id);
      data.can_edit = ${!readonly};
      window.__searchFixture = structuredClone(data);`);
    await route.fulfill({ response, body });
  });
  await page.route('**/frontend/main.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('scene = new RoomScene', 'scene = window.__searchScene = new RoomScene') });
  });
  await page.goto('http://127.0.0.1:5173');
  await expect(page.locator('#r3-canvas canvas')).toBeVisible();
  await page.waitForFunction(() => window.__searchScene?.layout);
  await page.evaluate(() => {
    window.__searchBefore = JSON.stringify(window.__searchScene.layout);
    window.__inventoryBefore = JSON.stringify(window.__searchScene.racks);
    window.__storageBefore = JSON.stringify({...localStorage});
  });
}
async function unchanged(page) {
  expect(await page.evaluate(() => ({
    layout: JSON.stringify(window.__searchScene.layout) === window.__searchBefore,
    inventory: JSON.stringify(window.__searchScene.racks) === window.__inventoryBefore,
    storage: JSON.stringify({...localStorage}) === window.__storageBefore,
  }))).toEqual({ layout: true, inventory: true, storage: true });
  await expect(page.locator('[data-action=save]')).toBeDisabled();
}

test('fixture identifier searches, match info, filtering and selection remain read-only', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await fixture(page);
  const search = page.getByRole('searchbox');
  await expect(search).toHaveAttribute('placeholder', /자산번호 · 시리얼/);
  await page.locator('#r3-assetTags').uncheck();
  await page.locator('#r3-serialNumbers').uncheck();
  await search.fill('  aSSet-4  ');
  const result = page.locator('[data-action=find-device]');
  await expect(result).toHaveCount(1);
  await expect(result.locator('[data-identifier=asset_number] mark')).toHaveText('AsSeT-42');
  await expect(result.locator('[data-identifier=serial]')).toHaveText('시리얼: Sn-AbC');
  await result.click();
  await expect(page.locator('.r3-focus-tag')).toContainText('Search target');
  await expect(page.locator('.r3-device.active')).toContainText('Search target');
  await search.fill('  sN-aB ');
  await expect(result.locator('[data-identifier=serial] mark')).toHaveText('Sn-AbC');
  await page.locator('#r3-status-filter').selectOption('offline');
  await expect(result).toHaveCount(0);
  await page.locator('#r3-status-filter').selectOption('active');
  await expect(result).toHaveCount(1);
  for (const query of ['192.0.2.222', '2001:db8::222', 'Search target']) {
    await search.fill(query); await expect(result).toHaveCount(1);
  }
  await search.fill('NATIVE-ONLY'); await expect(result).toHaveCount(0);
  await search.fill('0');
  await page.locator('#r3-status-filter').selectOption('offline');
  await expect(result).toHaveCount(1);
  await expect(result.locator('mark')).toHaveText('0');
  await result.click();
  const rackName = await page.evaluate(() => window.__searchFixture.racks[0].name);
  await expect(page.locator('.r3-focus-tag')).toContainText(rackName);
  await search.fill(rackName);
  await expect(page.locator('.r3-rack-card')).toHaveCount(1);
  await search.fill('UNPLACED-SN');
  await page.locator('#r3-status-filter').selectOption('');
  await expect(result).toHaveCount(1); await result.click();
  await expect(page.locator('#r3-notice')).toContainText('미배치 랙');
  await search.fill('No identifiers');
  await expect(result.locator('[data-identifier]')).toHaveCount(0);
  await unchanged(page); expect(errors).toEqual([]);
});

for (const mobile of [false, true]) test(`fixture literal HTML and readonly search (${mobile ? 'mobile' : 'desktop'})`, async ({ page }) => {
  if (mobile) await page.setViewportSize({ width: 390, height: 844 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await fixture(page, true);
  await expect(page.locator('#r3-save-state')).toHaveText('읽기 전용');
  await page.getByRole('searchbox').fill('<IMG SRC=X');
  const result = page.locator('[data-action=find-device]');
  await expect(result).toHaveCount(1);
  await expect(result.locator('mark')).toHaveText('<img src=x onerror="window.__searchXSS=1">&');
  await expect(result.locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => window.__searchXSS)).toBeUndefined();
  await result.click(); await expect(page.locator('.r3-focus-tag')).toContainText('Literal HTML');
  await page.getByRole('searchbox').fill('sn-abc');
  await expect(result.locator('mark')).toHaveText('Sn-AbC');
  await result.click();
  await expect(page.locator('.r3-focus-tag')).toContainText('Search target');
  const box = await result.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(mobile ? 390 : 1600);
  await page.screenshot({ path: `artifacts/identifier-search-${mobile ? 'mobile' : 'desktop'}.png` });
  await unchanged(page); expect(errors).toEqual([]);
});

test('compiled local NetBox search uses intercepted identifier response without writes', async ({ page }) => {
  const errors = [], writes = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (/\/plugins\/room-3d\/data\//.test(request.url()) && request.method() !== 'GET') writes.push(request.method());
  });
  await page.route('**/plugins/room-3d/data/locations/*/', async route => {
    if (route.request().method() !== 'GET') return route.continue();
    const response = await route.fetch(), data = await response.json();
    const rack = data.racks.find(r => data.layout.placements.some(p => p.rack_id === r.id) && r.devices.length);
    expect(rack, 'local test inventory must supply a placed device template').toBeTruthy();
    const template = structuredClone(rack.devices[0]);
    for (const r of data.racks) r.devices = [];
    rack.devices = [{...template, name: 'Compiled search fixture', asset_number: 'NB-ASSET-42', serial: 'NB-SERIAL-42', asset_tag: 'NB-NATIVE-ONLY'}];
    data.can_edit = false;
    await route.fulfill({ response, json: data });
  });
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/');
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill('room3d-demo');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('room3d-local-demo');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.locator('#r3-location').selectOption({ label: 'Room3D Demo IDC / 서버실 A' });
  await expect(page.locator('#r3-save-state')).toHaveText('읽기 전용');
  await expect(page.locator('.r3-version')).toHaveText('Room 3D v0.4.0');
  await page.locator('#r3-assetTags').uncheck(); await page.locator('#r3-serialNumbers').uncheck();
  const result = page.locator('[data-action=find-device]');
  for (const query of ['  nb-asset-4 ', ' nb-serial-4 ']) {
    await page.getByRole('searchbox').fill(query);
    await expect(result).toHaveCount(1);
    await expect(result.locator('mark')).toHaveText(query.includes('asset') ? 'NB-ASSET-42' : 'NB-SERIAL-42');
    await result.click();
    await expect(page.locator('.r3-focus-tag')).toContainText('Compiled search fixture');
    await expect(page.locator('[data-action=save]')).toBeDisabled();
  }
  await page.getByRole('searchbox').fill('NB-NATIVE-ONLY'); await expect(result).toHaveCount(0);
  expect(writes).toEqual([]); expect(errors).toEqual([]);
});
