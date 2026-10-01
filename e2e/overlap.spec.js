import { test, expect } from '@playwright/test';
const open = async page => { await page.goto('http://127.0.0.1:5173'); await expect(page.locator('#r3-repel')).toBeChecked(); };
const x = page => page.getByRole('spinbutton', { name: '좌측 X (mm)', exact: true });
const setX = async (page, value) => { await x(page).fill(String(value)); await x(page).press('Tab'); };
const save = async page => { await page.locator('[data-action=save]').click(); return page.evaluate(() => JSON.parse(localStorage.getItem('room3d-demo-v1-1'))); };
test('coordinate collision repels moving rack and preserves its neighbour', async ({ page }) => {
  await open(page); await setX(page, 3300);
  await expect(x(page)).toHaveValue('2700'); await expect(page.locator('#r3-invalid')).toBeHidden();
  const saved = await save(page); expect(saved.placements[0].x).toBe(3000); expect(saved.placements[1].x).toBe(3600);
  await page.reload(); await expect(x(page)).toHaveValue('2700');
});
test('repair button resolves existing overlap, supports undo and persists', async ({ page }) => {
  await open(page); await page.locator('#r3-repel').uncheck(); await setX(page, 3300);
  await expect(page.locator('#r3-invalid')).toContainText('겹칩니다');
  await page.locator('[data-action=fix-overlap]').click(); await expect(page.locator('#r3-invalid')).toBeHidden();
  await page.locator('[data-action=undo]').click(); await expect(page.locator('#r3-invalid')).toContainText('겹칩니다');
  await page.locator('[data-action=fix-overlap]').click(); const saved = await save(page);
  const issues = await page.evaluate(async layout => { const { errors } = await import('/frontend/geometry.js'); const { demoData } = await import('/frontend/demo.js'); return errors(layout, demoData().racks); }, saved);
  expect(issues).toEqual([]); await page.reload(); await expect(page.locator('#r3-invalid')).toBeHidden();
  await page.locator('[data-view=top]').click(); await page.screenshot({ path: 'artifacts/overlap-repaired.png', fullPage: true });
});
test('pointer drag against another rack repels and undoes in one step', async ({ page }) => {
  await open(page); await page.locator('[data-view=top]').click(); await page.locator('#r3-snap').uncheck();
  const a = await page.locator('.rack-summary').filter({ hasText: 'A-01' }).boundingBox();
  const b = await page.locator('.rack-summary').filter({ hasText: 'A-02' }).boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await page.mouse.up();
  await expect(page.locator('#r3-invalid')).toBeHidden(); await expect(x(page)).not.toHaveValue('2100');
  expect(Number(await x(page).inputValue())).toBeLessThanOrEqual(2700);
  await page.screenshot({ path: 'artifacts/overlap-repel-drag.png' });
  await page.locator('[data-action=undo]').click(); await expect(x(page)).toHaveValue('2100');
  await expect(page.locator('[data-action=undo]')).toBeDisabled();
});
test('group motion repels as a rigid group', async ({ page }) => {
  await open(page); await page.locator('#r3-studio-open').click();
  for (const id of [101, 102]) await page.locator(`[data-pick="rack:${id}"]`).check();
  await page.locator('#r3-dx').fill('1200'); await page.locator('[data-tool=move]').click();
  await page.locator('[data-tool=close]').click(); const saved = await save(page);
  expect(saved.placements[0].x).toBe(3000); expect(saved.placements[1].x).toBe(4200); expect(saved.placements[2].x).toBe(4800);
});
test('locked overlapping racks cannot be repaired or partially moved', async ({ page }) => {
  await open(page);
  await page.evaluate(async () => { const { demoData } = await import('/frontend/demo.js'); const { layout } = demoData(); layout.placements[0].locked = layout.placements[1].locked = true; layout.placements[1].x = layout.placements[0].x; localStorage.setItem('room3d-demo-v1-1', JSON.stringify(layout)); });
  await page.reload(); await page.locator('[data-action=fix-overlap]').click();
  await expect(page.locator('#r3-notice')).toContainText('잠긴'); await expect(page.locator('[data-action=undo]')).toBeDisabled();
  await expect(page.locator('[data-action=save]')).toBeDisabled();
});
test('read-only users cannot use repair or auto movement controls', async ({ page }) => {
  await page.route('**/frontend/api.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\nconst originalLoad = API.prototype.load; API.prototype.load = async function(...args) { return { ...await originalLoad.apply(this,args), can_edit: false }; };` });
  });
  await page.goto('http://127.0.0.1:5173'); await expect(page.locator('[data-action=fix-overlap]')).toBeDisabled(); await expect(page.locator('#r3-repel')).toBeDisabled();
});
