import { test, expect } from '@playwright/test';

async function open(page) {
  await page.route('**/frontend/main.js*', async route => {
    const response = await route.fetch(), body = await response.text();
    expect(body).toContain('scene = new RoomScene');
    await route.fulfill({ response, body: body.replace('scene = new RoomScene', 'scene = window.__walkingScene = new RoomScene') });
  });
  await page.goto('http://127.0.0.1:5173');
  await expect(page.locator('#r3-canvas canvas')).toBeVisible();
  await page.locator('[data-view=walk]').click();
  await expect(page.locator('#r3-walk-height-controls')).toBeVisible();
  await expect(page.locator('#r3-walk-height-value')).toHaveText('1.65 m');
}
const height = page => page.evaluate(() => window.__walkingScene.camera.position.y);
const raise = page => page.getByRole('button', { name: '시점 높이 올리기', exact: true });
const lower = page => page.getByRole('button', { name: '시점 높이 내리기', exact: true });

test('walking buttons, Q/E and Page keys change height without editing and survive display changes', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await open(page);
  const before = await page.evaluate(() => JSON.stringify(window.__walkingScene.layout));
  await raise(page).click(); await expect(page.locator('#r3-walk-height-value')).toHaveText('1.90 m');
  await page.locator('#r3-assetTags').uncheck(); expect(await height(page)).toBeCloseTo(1.9);
  await page.locator('#r3-canvas canvas').focus();
  for (const [key, direction] of [['KeyE', 1], ['KeyQ', -1], ['PageUp', 1], ['PageDown', -1]]) {
    const previous = await height(page); await page.keyboard.down(key);
    if (direction > 0) await expect.poll(() => height(page)).toBeGreaterThan(previous + .03);
    else await expect.poll(() => height(page)).toBeLessThan(previous - .03);
    await page.keyboard.up(key);
  }
  await page.evaluate(() => window.__walkingScene.changeWalkHeight(100));
  await expect(page.locator('#r3-walk-height-value')).toHaveText('2.90 m'); await expect(raise(page)).toBeDisabled();
  await page.evaluate(() => window.__walkingScene.changeWalkHeight(-100));
  await expect(page.locator('#r3-walk-height-value')).toHaveText('0.20 m'); await expect(lower(page)).toBeDisabled();
  await page.evaluate(() => window.__walkingScene.changeWalkHeight(1.8));
  await page.screenshot({ path: 'artifacts/walking-height-desktop.png' });
  await expect(page.locator('[data-action=save]')).toBeDisabled();
  expect(await page.evaluate(() => JSON.stringify(window.__walkingScene.layout))).toBe(before);
  await page.locator('#r3-canvas canvas').focus(); await page.keyboard.press('Escape');
  await expect(page.locator('#r3-walk-height-controls')).toBeHidden(); expect(errors).toEqual([]);
});

test('mobile walking height buttons remain on screen and change the eye height', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await open(page);
  await raise(page).click(); await expect(page.locator('#r3-walk-height-value')).toHaveText('1.90 m');
  await lower(page).click(); await expect(page.locator('#r3-walk-height-value')).toHaveText('1.65 m');
  for (const locator of [raise(page), lower(page), page.locator('#r3-walk-height-value')]) {
    const box = await locator.boundingBox(); expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(box.y).toBeGreaterThanOrEqual(0); expect(box.y + box.height).toBeLessThanOrEqual(844);
  }
  await page.screenshot({ path: 'artifacts/walking-height-mobile.png' });
  await expect(page.locator('[data-action=save]')).toBeDisabled();
});
