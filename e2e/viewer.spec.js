import { test, expect } from '@playwright/test';

test('top view shows rack front and rear markers even with names hidden', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button', { name: '평면 배치', exact: true }).click();
  await expect(page.locator('.rack-front')).toHaveCount(4);
  await page.locator('#r3-labels').uncheck();
  await expect(page.locator('.rack-front').first()).toBeVisible();
  await page.getByRole('combobox', { name: '방향', exact: true }).selectOption('90');
  await expect(page.locator('.rack-rear')).toHaveCount(4);
  await page.screenshot({ path: 'artifacts/top-front-markers.png' });
  await page.getByRole('button', { name: '3D 보기', exact: true }).click();
  await expect(page.locator('.rack-front')).toHaveCount(0);
});

test('NetBox viewport keeps all footer controls visible without page scrolling', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/');
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill('room3d-demo');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('room3d-local-demo');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.locator('#r3-canvas canvas')).toBeVisible();
  for (const [width, height] of [[1440, 900], [1200, 700], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => page.locator('.r3-footer').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(height);
    const controls = await page.locator('.r3-footer input').evaluateAll(els => els.map(el => el.getBoundingClientRect().bottom));
    expect(controls.every(bottom => bottom <= height)).toBe(true);
    const box = await page.locator('#r3-canvas').boundingBox(); expect(box.height).toBeGreaterThan(100);
    await page.screenshot({ path: `artifacts/viewport-${width}-${height}.png` });
  }
  expect(errors).toEqual([]);
});

test('partial IP results show matching IPs and pulse both server and rack selection', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('searchbox').fill('192.0.2.1');
  const result = page.locator('[data-action=find-device]').first();
  await expect(result).toContainText('일치 IP: 192.0.2.12/24');
  await result.click();
  const marker = page.locator('.r3-focus-tag');
  await expect(marker).toContainText('srv-01-03');
  const initial = await marker.evaluate(el => el.style.opacity);
  await expect.poll(() => marker.evaluate(el => el.style.opacity)).not.toBe(initial);
  await page.screenshot({ path: 'artifacts/search-server-highlight.png' });
  await page.locator('.r3-rack-select[data-id="101"]').click();
  await expect(marker).toHaveCount(1);
  await expect(marker).toContainText('A-01');
  await page.screenshot({ path: 'artifacts/search-rack-highlight.png' });
  await expect(page.getByRole('button', { name: '배치 저장', exact: true })).toBeDisabled();
  await page.getByRole('searchbox').fill('no-match-xyz');
  await expect(marker).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('inventory tools: IP search focuses device, status filter and overlays do not edit layout', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  await page.getByRole('searchbox').fill('192.0.2.18');
  const result = page.locator('[data-action=find-device]').first();
  await expect(result).toContainText('srv-01-09');
  await result.click();
  await expect(page.locator('.r3-device.active')).toContainText('srv-01-09');
  await page.locator('#r3-status-filter').selectOption('active');
  await expect(page.locator('[data-action=find-device]')).toHaveCount(0);
  await page.locator('#r3-status-filter').selectOption('offline');
  await expect(page.locator('[data-action=find-device]')).toHaveCount(8);
  for (const id of ['units', 'usage', 'statuses']) {
    await page.locator(`#r3-${id}`).uncheck(); await page.locator(`#r3-${id}`).check();
  }
  await expect(page.getByRole('button', { name: '배치 저장', exact: true })).toBeDisabled();
  await page.screenshot({ path: 'artifacts/inventory-tools.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('server display: global color option and rear Primary IP hover', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  const colors = page.getByRole('checkbox', { name: '서버 상·하단 할당 색상', exact: true });
  await expect(colors).not.toBeChecked();
  await colors.check(); await colors.uncheck();
  await expect(page.getByRole('button', { name: '배치 저장', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '후면 보기', exact: true }).click();
  const hover = await page.locator('#r3-canvas canvas').evaluate(canvas => {
    const rect = canvas.getBoundingClientRect();
    for (let y = rect.top + 50; y < rect.bottom - 10; y += 2) {
      canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + rect.width / 2, clientY: y }));
      const tooltip = document.querySelector('.r3-device-tooltip');
      if (!tooltip.hidden) return tooltip.textContent;
    }
    return '';
  });
  expect(hover).toMatch(/srv-01-.*192\.0\.2\./);
  await page.screenshot({ path: 'artifacts/server-rear-tooltip.png' });
  await page.getByRole('button', { name: '전면 보기', exact: true }).click();
  await page.screenshot({ path: 'artifacts/server-front-names.png' });
  expect(errors).toEqual([]);
});

test('sample: room setup, manual placement, collision, lock, undo, save and restore', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '서버실 설정', exact: true }).click();
  await page.getByRole('textbox', { name: '서버실 이름' }).fill('QA 서버실');
  await page.getByRole('spinbutton', { name: '가로 (mm)', exact: true }).fill('13200');
  await page.getByRole('button', { name: '설정 적용' }).click();
  await expect(page.locator('#r3-room-summary')).toContainText('13.2');
  await page.locator('[data-action=place]').first().click();
  await expect(page.getByRole('heading', { name: 'A-05', exact: true })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'X (mm)', exact: true }).fill('2400');
  await page.getByRole('spinbutton', { name: 'Z (mm)', exact: true }).fill('3000');
  await page.getByRole('spinbutton', { name: 'Z (mm)', exact: true }).press('Tab');
  await expect(page.locator('#r3-invalid')).toContainText('겹칩니다');
  await expect(page.getByRole('button', { name: '배치 저장', exact: true })).toBeDisabled();
  await page.getByRole('spinbutton', { name: 'X (mm)', exact: true }).fill('7200');
  await page.getByRole('spinbutton', { name: 'X (mm)', exact: true }).press('Tab');
  await page.getByRole('combobox', { name: '방향', exact: true }).selectOption('90');
  await expect(page.locator('#r3-invalid')).toBeHidden();
  await page.getByRole('checkbox', { name: '잠금', exact: true }).check();
  await expect(page.getByRole('spinbutton', { name: 'X (mm)', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '배치 해제', exact: true })).toBeDisabled();
  await page.getByRole('checkbox', { name: '잠금', exact: true }).uncheck();
  await page.getByRole('button', { name: '배치 해제', exact: true }).click();
  await expect(page.locator('#r3-scene-stats')).toContainText('4 / 8');
  await page.getByRole('button', { name: '↶ 되돌리기', exact: true }).click();
  await expect(page.locator('#r3-scene-stats')).toContainText('5 / 8');
  await page.getByRole('button', { name: '배치 저장', exact: true }).click();
  await expect(page.locator('#r3-save-state')).toContainText('v1');
  await page.reload();
  await expect(page.locator('#r3-room-summary')).toContainText('QA 서버실');
  await expect(page.locator('#r3-scene-stats')).toContainText('5 / 8');
  await page.getByRole('checkbox', { name: '배치된 랙 포함', exact: true }).check();
  await page.locator('[data-rack="105"] [data-action=select]').first().click();
  await expect(page.getByRole('spinbutton', { name: 'X (mm)', exact: true })).toHaveValue('7200');
  await expect(page.getByRole('combobox', { name: '방향', exact: true })).toHaveValue('90');
  expect(errors).toEqual([]);
});

test('sample: top view pointer drag persists the rack movement', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '평면 배치', exact: true }).click();
  // The CSS2D label tracks the actual projected centre of the rack; drag just below it.
  const label = page.locator('.r3-label.active');
  const bounds = await label.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 12);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 - 45, bounds.y + bounds.height / 2 + 12, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByRole('spinbutton', { name: 'X (mm)', exact: true })).not.toHaveValue('2400');
  await expect(page.locator('#r3-invalid')).toBeHidden();
  await page.getByRole('button', { name: '배치 저장', exact: true }).click();
  const x = await page.getByRole('spinbutton', { name: 'X (mm)', exact: true }).inputValue();
  await page.reload();
  await expect(page.getByRole('spinbutton', { name: 'X (mm)', exact: true })).toHaveValue(x);
});

test('NetBox: save through UI, verify database API, front/rear images and appearance', async ({ page }) => {
  const errors = [], failedImages = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.url().includes('/media/') && r.status() >= 400) failedImages.push(r.url()); });
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/');
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill('room3d-demo');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('room3d-local-demo');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('combobox', { name: 'Location 선택', exact: true }).selectOption({ label: 'Room3D Demo IDC / 서버실 A' });
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  await expect(page.locator('#r3-location')).toBeVisible();
  await expect(page.locator('#room3d .ts-wrapper')).toHaveCount(0);
  const previousX = await page.getByRole('spinbutton', { name: 'X (mm)', exact: true }).inputValue();
  const changedX = previousX === '1800' ? '2400' : '1800';
  await page.getByRole('spinbutton', { name: 'X (mm)', exact: true }).fill(changedX);
  await page.getByRole('spinbutton', { name: 'X (mm)', exact: true }).press('Tab');
  const saveResponse = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().includes('/data/locations/'));
  await page.getByRole('button', { name: '배치 저장', exact: true }).click();
  expect((await saveResponse).status()).toBe(200);
  await expect(page.locator('#r3-notice')).toContainText('저장했습니다');
  await page.getByRole('button', { name: '다시 불러오기', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'X (mm)', exact: true })).toHaveValue(changedX);
  await page.getByRole('button', { name: '전면 보기', exact: true }).click();
  await page.getByRole('button', { name: 'room3d-srv-01-01 Demo 2U with images U2', exact: true }).click();
  await expect(page.locator('.r3-face-preview img')).toHaveCount(2);
  await expect.poll(() => page.locator('.r3-face-preview img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0))).toBe(true);
  await page.screenshot({ path: 'artifacts/netbox-front.png', fullPage: true });
  await page.getByRole('button', { name: '후면 보기', exact: true }).click();
  await page.screenshot({ path: 'artifacts/netbox-rear.png', fullPage: true });
  await page.getByRole('button', { name: 'room3d-srv-01-03 Demo 2U color U10', exact: true }).click();
  const colorInput = page.getByLabel('이미지가 없는 면의 색상', { exact: true });
  const nextColor = (await colorInput.inputValue()) === '#f97316' ? '#a855f7' : '#f97316';
  await colorInput.fill(nextColor);
  await page.getByLabel('이미지가 없는 면의 색상', { exact: true }).press('Tab');
  await page.getByRole('button', { name: '배치 저장', exact: true }).click();
  await expect(page.locator('#r3-save-state')).not.toContainText('변경');
  await page.getByRole('button', { name: '다시 불러오기', exact: true }).click();
  await page.getByRole('button', { name: 'room3d-srv-01-03 Demo 2U color U10', exact: true }).click();
  await expect(page.getByLabel('이미지가 없는 면의 색상', { exact: true })).toHaveValue(nextColor);
  await page.getByRole('button', { name: '3D 보기', exact: true }).click();
  await page.screenshot({ path: 'artifacts/netbox-verified.png', fullPage: true });
  expect(errors).toEqual([]); expect(failedImages).toEqual([]);
});

test('sample: walking mode moves, looks around, stops on blur and exits without editing', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '워킹 모드', exact: true }).click();
  const canvas = page.locator('#r3-canvas canvas');
  await expect(canvas).toBeFocused();
  await expect(page.locator('#r3-controls-help')).toContainText('WASD');
  const initial = await canvas.screenshot();
  await page.keyboard.down('w'); await page.waitForTimeout(400); await page.keyboard.up('w');
  expect((await canvas.screenshot()).equals(initial)).toBe(false);
  const bounds = await canvas.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width / 2 + 120, bounds.y + bounds.height / 2 + 30, { steps: 8 }); await page.mouse.up();
  await page.screenshot({ path: 'artifacts/walking-mode.png', fullPage: true });
  await page.keyboard.down('w');
  await page.locator('#r3-search').focus();
  await page.keyboard.up('w');
  const stopped = await canvas.screenshot(); await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(stopped)).toBe(true);
  await canvas.focus(); await page.keyboard.press('Escape');
  await expect(page.locator('[data-view="3d"]')).toHaveClass('active');
  await expect(page.getByRole('button', { name: '배치 저장', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '평면 배치', exact: true }).click();
  await expect(page.locator('#r3-controls-help')).toContainText('랙 드래그');
  expect(errors).toEqual([]);
});

test('sample: side panels toggle without changing saved layout', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  const toggle = page.getByRole('checkbox', { name: '랙 측면 덮개', exact: true });
  await expect(toggle).not.toBeChecked();
  const canvas = page.locator('#r3-canvas canvas');
  await page.screenshot({ path: 'artifacts/rack-sides-open.png', fullPage: true });
  const open = await canvas.screenshot();
  await toggle.check();
  expect((await canvas.screenshot()).equals(open)).toBe(false);
  await page.screenshot({ path: 'artifacts/rack-sides-closed.png', fullPage: true });
  await toggle.uncheck();
  await expect(page.getByRole('button', { name: '배치 저장', exact: true })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('sample: room object catalog saves types and rotation across reload', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173');
  await expect(page.getByRole('heading', { name: 'A-01', exact: true })).toBeVisible();
  for (const [type, name] of [['ups','UPS'], ['cooling','항온항습기'], ['battery','배터리 캐비닛'], ['desk','책상'], ['door','문'], ['glass','유리벽'], ['wall','벽'], ['solid','사용 불가 공간']]) {
    await page.getByRole('combobox', { name: '오브젝트 종류', exact: true }).selectOption(type);
    await page.getByRole('button', { name: '＋ 룸 오브젝트 추가', exact: true }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(page.locator('#r3-invalid')).toBeHidden();
  }
  await page.getByRole('combobox', { name: '방향', exact: true }).selectOption('90');
  await page.getByRole('button', { name: '배치 저장', exact: true }).click();
  await expect(page.locator('#r3-save-state')).toContainText('v1');
  await page.reload();
  await page.getByRole('button', { name: '▧ 사용 불가 공간', exact: true }).click();
  await expect(page.getByRole('combobox', { name: '방향', exact: true })).toHaveValue('90');
  await expect(page.locator('#r3-block-list button')).toHaveCount(9);
  await page.screenshot({ path: 'artifacts/room-objects.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('sample: room object can be dragged in top view and restored', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button', { name: '▧ 기둥', exact: true }).click();
  await page.getByRole('button', { name: '평면 배치', exact: true }).click();
  const bounds = await page.locator('.r3-label.active').boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 12);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 - 40, bounds.y + bounds.height / 2 + 12, { steps: 8 });
  await page.mouse.up();
  const x = page.getByRole('spinbutton', { name: 'X (mm)', exact: true });
  await expect(x).not.toHaveValue('9000');
  const value = await x.inputValue();
  await page.getByRole('button', { name: '배치 저장', exact: true }).click();
  await expect(page.locator('#r3-save-state')).toContainText('v1');
  await page.reload();
  await page.getByRole('button', { name: '▧ 기둥', exact: true }).click();
  await expect(x).toHaveValue(value);
});

test('location filter hides empty locations and preserves current edits', async ({ page }) => {
  await page.route('**/frontend/api.js*', async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace("name: '네트워크실 B', has_racks: true", "name: '네트워크실 B', has_racks: false");
    await route.fulfill({ response, body });
  });
  await page.goto('http://127.0.0.1:5173');
  const select = page.getByRole('combobox', { name: 'Location 선택', exact: true });
  await select.selectOption('2');
  await page.getByRole('button', { name: '＋ 룸 오브젝트 추가', exact: true }).click();
  await expect(page.locator('#r3-save-state')).toContainText('저장하지 않은 변경');
  const filter = page.getByRole('checkbox', { name: '랙이 배치된 Location만', exact: true });
  await filter.check();
  await expect(select.locator('option[value="2"]')).toHaveCount(0);
  await expect(select.locator('option[value="1"]')).toHaveCount(1);
  await expect(page.locator('#r3-room-summary')).toContainText('네트워크실 B');
  await expect(page.locator('#r3-save-state')).toContainText('저장하지 않은 변경');
  await filter.uncheck();
  await expect(select).toHaveValue('2');
  await expect(select.locator('option')).toHaveCount(2);
});
