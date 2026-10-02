import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const open = async page => { await page.goto('http://127.0.0.1:5173'); await expect(page.locator('#r3-canvas canvas')).toBeVisible(); await page.locator('#r3-studio-open').click(); };
const pick = (page, key) => page.locator(`[data-pick="${key}"]`);
const tool = (page, action) => page.locator(`[data-tool="${action}"]`);
test('footer belongs to app, bulk editing saves and undo preserves original', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page);
  await expect(page.locator('.r3-statusbar .r3-version')).toContainText('Room 3D v');
  await pick(page, 'rack:101').check(); await pick(page, 'rack:102').check();
  await expect(page.locator('#r3-measure')).toContainText('600 mm');
  await page.locator('#r3-dz').fill('1200'); await tool(page, 'move').click();
  await expect(page.locator('#r3-tool-status')).toContainText('적용했습니다');
  await tool(page, 'close').click(); await page.locator('[data-action=save]').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('room3d-demo-v1-1')));
  expect(saved.placements[0].z).toBe(4200); expect(saved.placements[1].z).toBe(4200); expect(saved.placements[2].z).toBe(3000);
  await page.locator('#r3-studio-open').click(); await page.locator('#r3-gap').fill('0'); await tool(page, 'space').click();
  await expect(page.locator('#r3-tool-status')).toContainText('적용했습니다');
  await tool(page, 'close').click(); await page.locator('[data-action=undo]').click();
  await expect(page.locator('[data-action=save]')).toBeDisabled();
  await page.screenshot({ path: 'artifacts/studio-footer.png', fullPage: true });
  expect(errors).toEqual([]);
});
test('repeat, snapshots, restore and PNG/PDF export work through UI', async ({ page }) => {
  await open(page); await pick(page, 'block:pillar1').check();
  await page.locator('#r3-repeat-count').fill('2'); await page.locator('#r3-gap').fill('0'); await tool(page, 'repeat').click();
  await expect(page.locator('#r3-tool-status')).toContainText('적용했습니다');
  await tool(page, 'close').click(); await page.locator('[data-action=save]').click();
  await expect(page.locator('#r3-block-list button')).toHaveCount(3);
  await page.reload(); await page.locator('#r3-studio-open').click(); await tool(page, 'history').click();
  await expect(page.locator('.r3-history-row')).toHaveCount(1);
  page.once('dialog', d => d.accept()); await tool(page, 'restore').click();
  await expect(page.locator('#r3-tool-status')).toContainText('배치를 불러왔습니다');
  await tool(page, 'close').click(); await expect(page.locator('#r3-block-list button')).toHaveCount(1);
  await page.locator('[data-action=save]').click(); await expect(page.locator('#r3-save-state')).toContainText('v2');
  await page.locator('#r3-studio-open').click();
  for (const format of ['png', 'pdf']) {
    const download = page.waitForEvent('download'); await tool(page, format).click(); const file = await download;
    const path = `artifacts/studio-plan.${format}`; await file.saveAs(path); const bytes = await fs.readFile(path);
    expect(bytes.length).toBeGreaterThan(1000); expect(bytes.subarray(0, format === 'pdf' ? 5 : 4).toString(format === 'pdf' ? 'ascii' : 'hex')).toBe(format === 'pdf' ? '%PDF-' : '89504e47');
  }
  await page.screenshot({ path: 'artifacts/studio-panel.png' });
});
test('Shift selection and group drag preserve relative distance', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173'); await page.locator('[data-view=top]').click();
  for (const name of ['A-01', 'A-02']) {
    const b = await page.locator('.rack-summary').filter({ hasText: name }).boundingBox();
    await page.keyboard.down('Shift'); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.keyboard.up('Shift');
  }
  await page.locator('#r3-studio-open').click(); await expect(page.locator('#r3-picked-count')).toHaveText('2개');
  await expect(pick(page, 'rack:101')).toBeChecked(); await expect(pick(page, 'rack:102')).toBeChecked();
  await tool(page, 'close').click();
  const b = await page.locator('.rack-summary').filter({ hasText: 'A-01' }).boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2 + 50, { steps: 10 }); await page.mouse.up();
  await page.locator('[data-action=save]').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('room3d-demo-v1-1')));
  expect(saved.placements[0].z).not.toBe(3000); expect(saved.placements[1].z).toBe(saved.placements[0].z);
  expect(saved.placements[1].x - saved.placements[0].x).toBe(1200);
});
test('alignment and zero edge gap apply through controls', async ({ page }) => {
  await open(page); await pick(page, 'rack:102').check();
  await page.locator('#r3-dz').fill('1200'); await tool(page, 'move').click();
  await pick(page, 'rack:101').check(); await page.locator('#r3-align').selectOption('top'); await tool(page, 'align').click();
  await expect(page.locator('#r3-tool-status')).toContainText('적용했습니다');
  await page.locator('#r3-gap').fill('0'); await tool(page, 'space').click();
  await expect(page.locator('#r3-measure')).toContainText('대상 사이: 0 mm');
  await tool(page, 'close').click(); await page.locator('[data-action=save]').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('room3d-demo-v1-1')));
  expect(saved.placements[1].z).toBe(3000); expect(saved.placements[1].x).toBe(3000);
});
test('NetBox history restores actual server data using current revision', async ({ page }) => {
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/');
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill('room3d-demo');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('room3d-local-demo');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.locator('#r3-location').selectOption({ label: 'Room3D Demo IDC / 서버실 A' });
  await expect(page.locator('.r3-statusbar .r3-version')).toHaveText('Room 3D v0.2.0');
  await page.getByRole('button', { name: '서버실 설정', exact: true }).click();
  const name = page.getByRole('textbox', { name: '서버실 이름' }), original = await name.inputValue();
  await name.fill(`${original} QA`); await page.getByRole('button', { name: '설정 적용' }).click();
  let response = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().includes('/data/locations/'));
  await page.locator('[data-action=save]').click(); const changed = await (await response).json();
  expect(changed.layout._history).toBeUndefined();
  await page.locator('#r3-studio-open').click(); await tool(page, 'history').click();
  await expect(page.locator('.r3-history-row').first()).toContainText(original);
  page.once('dialog', d => d.accept()); await tool(page, 'restore').first().click();
  await expect(page.locator('#r3-tool-status')).toContainText('배치를 불러왔습니다'); await tool(page, 'close').click();
  response = page.waitForResponse(r => r.request().method() === 'PUT' && r.url().includes('/data/locations/'));
  await page.locator('[data-action=save]').click(); const restored = await (await response).json();
  expect(restored.layout.name).toBe(original); expect(restored.layout.revision).toBe(changed.layout.revision + 1);
  await page.reload(); await expect(page.locator('#r3-room-summary')).toContainText(original);
  await page.screenshot({ path: 'artifacts/netbox-studio-verified.png', fullPage: true });
});
test('responsive footer and failed edits do not escape app', async ({ page }) => {
  await open(page); await pick(page, 'rack:101').check(); await page.locator('#r3-dx').fill('-10000'); await tool(page, 'move').click();
  await expect(page.locator('#r3-tool-status')).toContainText('경계'); await tool(page, 'close').click(); await expect(page.locator('[data-action=save]')).toBeDisabled();
  for (const size of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size); await expect.poll(() => page.locator('.r3-version').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(size.height);
    await page.screenshot({ path: `artifacts/studio-${size.width}.png` });
  }
});
