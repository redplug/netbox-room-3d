import { test, expect } from '@playwright/test';
test('grid size applies, validates, undoes and persists without moving racks', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  const input = page.getByRole('spinbutton', { name: '격자 한 칸 (mm)', exact: true });
  await expect(input).toHaveValue('600');
  const x = page.getByRole('spinbutton', { name: 'X (mm)', exact: true });
  const before = await x.inputValue();
  await input.fill('250'); await input.press('Tab');
  await expect(input).toHaveValue('250'); await expect(x).toHaveValue(before);
  await page.getByRole('button', { name: '↶ 되돌리기', exact: true }).click();
  await expect(input).toHaveValue('600');
  await input.fill('50'); await input.press('Tab'); await expect(input).toHaveValue('600');
  await input.fill('1000'); await input.press('Tab');
  await page.getByRole('checkbox', { name: '격자 표시', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: '격자 표시', exact: true }).check();
  await page.getByRole('button', { name: '배치 저장', exact: true }).click();
  await page.reload(); await expect(input).toHaveValue('1000'); await expect(x).toHaveValue(before);
});
