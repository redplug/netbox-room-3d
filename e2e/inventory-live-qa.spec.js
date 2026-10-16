import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const out='artifacts/inventory-qa-20261016-low';
test('packaged NetBox viewer reads real inventory and free U without saving',async({page,context})=>{
 const text=await fs.readFile('/tmp/room3d-qa-session-20261016','utf8'),key=text.match(/QA_SESSION=(\w+)/)?.[1];expect(key).toBeTruthy();await context.addCookies([{name:text.match(/QA_COOKIE=(\w+)/)?.[1]||'sessionid',value:key,url:'http://127.0.0.1:18080',httpOnly:true,sameSite:'Lax'}]);
 const writes=[];page.on('request',r=>{if(['PUT','DELETE','PATCH'].includes(r.method()))writes.push(r.url());});
 await page.goto('http://127.0.0.1:18080/plugins/room-3d/');await expect(page.locator('#r3-inventory-open')).toBeVisible();await expect(page.locator('#r3-canvas canvas')).toBeVisible();
 await page.locator('#r3-inventory-open').click();await expect(page.locator('[data-inventory=refresh]')).toBeEnabled();const result=await page.evaluate(async()=>{const r=await fetch('/plugins/room-3d/data/devices/');const j=await r.json();return {status:r.status,scope:j.scope,count:j.devices.length,device:j.devices[0]?.id};});expect(result.status).toBe(200);expect(result.scope).toBe('permission-filtered');expect(result.count).toBeGreaterThan(0);await fs.writeFile(out+'/live-summary.json',JSON.stringify(result,null,2));
 await page.locator('[data-inventory=quality]').click();await expect(page.locator('#r3-inventory form')).toContainText('조회 권한 범위');await page.screenshot({path:out+'/live-quality.png'});
 await page.locator('[data-inventory=free]').click();const response=page.waitForResponse(r=>r.url().includes('/free-units/'));await page.locator('[data-inventory=calculate]').click();expect((await response).status()).toBe(200);await expect(page.locator('[data-inventory=candidate]').first()).toBeEnabled();await page.locator('[data-inventory=candidate]').first().click();await page.screenshot({path:out+'/live-candidate.png'});expect(writes).toEqual([]);
});
test('R1 pending discovery request is aborted on close',async({page})=>{
 await page.route('**/frontend/api.js*',async r=>{const s=await r.fetch();await r.fulfill({response:s,body:(await s.text())+`\nAPI.prototype.devices=function(id,options){return this.request('/qa-delayed-devices',options);};`});});
 let finish;const gate=new Promise(r=>finish=r);let failed=false;page.on('requestfailed',r=>{if(r.url().includes('qa-delayed'))failed=true;});
 await page.route('**/qa-delayed-devices',async r=>{await gate;await r.fulfill({json:{devices:[]}}).catch(()=>{});});
 await page.goto('http://127.0.0.1:5173/');await page.locator('#r3-inventory-open').click();await expect(page.locator('.r3-inventory-status')).toContainText('불러오고');await page.locator('[data-inventory=close]').click();await page.waitForTimeout(250);finish();await page.waitForTimeout(100);expect(failed,'Closing discovery must abort its pending network request').toBe(true);
});
