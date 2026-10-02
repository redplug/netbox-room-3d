import { test, expect } from '@playwright/test';
const tab=(p,n)=>p.locator(`#r3-operations [data-tab="${n}"]`).click();
const op=(p,n)=>p.locator(`#r3-operations [data-op="${n}"]`).click();
const field=(p,n)=>p.locator(`#r3-operations [name="${n}"]`);
test('zones, comparison, row placement and camera favorites persist',async({page})=>{
  await page.goto('http://127.0.0.1:5173'); await page.locator('#r3-operations-open').click();
  await tab(page,1); await field(page,'name').fill('QA floor'); await field(page,'width').fill('1000'); await field(page,'depth').fill('1000'); await op(page,'zone-save');
  await tab(page,2); await expect(page.locator('.r3-operation-list')).toContainText('QA floor'); await op(page,'diff-show');
  await tab(page,3); await field(page,'x').fill('600'); await field(page,'z').fill('5000'); await op(page,'rows'); await expect(page.locator('.r3-operation-status')).toContainText('적용');
  await tab(page,5); await field(page,'name').fill('QA camera'); await op(page,'camera-save'); await op(page,'camera-share'); expect(await field(page,'share').inputValue()).toContain('view=');
  await op(page,'close'); await page.locator('[data-action=save]').click(); await page.reload(); await page.locator('#r3-operations-open').click(); await tab(page,1); await expect(page.locator('.r3-operation-list')).toContainText('QA floor');
  await tab(page,5); await expect(page.locator('.r3-operation-list')).toContainText('QA camera');
});
test('all operational tabs fit mobile viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.goto('http://127.0.0.1:5173'); await page.locator('#r3-operations-open').click();
  for(let i=0;i<8;i++){await tab(page,i); const b=await page.locator('#r3-operations').boundingBox(); expect(b.x).toBeGreaterThanOrEqual(0); expect(b.x+b.width).toBeLessThanOrEqual(391); expect(b.height).toBeLessThanOrEqual(844);}
});
test('live NetBox plans use page CSRF token when cookie is HttpOnly',async({page})=>{
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/'); await page.getByRole('textbox',{name:'Username',exact:true}).fill('room3d-demo'); await page.getByRole('textbox',{name:'Password',exact:true}).fill('room3d-local-demo'); await page.getByRole('button',{name:'Sign In',exact:true}).click();
  await page.locator('#r3-location').selectOption({label:'Room3D Demo IDC / 서버실 A'}); await page.locator('#r3-operations-open').click(); await tab(page,6);
  const name=`QA plan ${Date.now()}`; await field(page,'name').fill(name);
  let response=page.waitForResponse(r=>r.url().includes('/plans/')&&r.request().method()==='POST'); await op(page,'plan-create'); expect((await response).status()).toBe(200); await expect(page.locator('.r3-operation-list')).toContainText(name);
  page.once('dialog',d=>d.accept()); response=page.waitForResponse(r=>r.url().includes('/plans/')&&r.request().method()==='POST'); await page.locator('.r3-operation-row').filter({hasText:name}).locator('[data-op=plan-delete]').click(); expect((await response).status()).toBe(200); await expect(page.locator('.r3-operation-list')).not.toContainText(name);
  await tab(page,4); await op(page,'cleanup-preview'); await expect(page.locator('.r3-operation-status')).toContainText('대상을 확인');
});
