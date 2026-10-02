import {test,expect} from '@playwright/test';
const tab=(p,n)=>p.locator(`#r3-operations [data-tab="${n}"]`).click();
const op=(p,n)=>p.locator(`#r3-operations [data-op="${n}"]`);
const field=(p,n)=>p.locator(`#r3-operations [name="${n}"]`);
async function demo(page) {await page.goto('http://127.0.0.1:5173');await page.locator('#r3-operations-open').click();await tab(page,9);await op(page,'capacity-types').click();await field(page,'device-type').selectOption('3');await op(page,'capacity-recommend').click();}
test('recommend, half-U virtual move, comparison and save/reload preserve inventory',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await demo(page);
  await op(page,'capacity-add').first().click();await expect(page.locator('.r3-operation-status')).toContainText('적용');await tab(page,10);
  await op(page,'capacity-edit').click();await field(page,'planned-name').fill('QA half-U');await field(page,'planned-position').fill('34.5');await op(page,'capacity-move').click();await expect(page.locator('.r3-operation-status')).toContainText('적용');
  await op(page,'capacity-edit').click();await field(page,'planned-position').fill('35');await op(page,'capacity-move').click();await expect(page.locator('.r3-operation-status')).toContainText('겹칩니다');
  await tab(page,2);await expect(page.locator('.r3-operation-list')).toContainText('QA half-U');await tab(page,8);await op(page,'capacity-refresh').click();await expect(page.locator('.r3-operation-body')).toContainText('샘플 예약 공간');
  await op(page,'close').click();await page.locator('[data-action=save]').click();await page.reload();await page.locator('#r3-operations-open').click();await tab(page,10);await expect(page.locator('.r3-operation-list')).toContainText('QA half-U');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('room3d-demo-v1-1')));expect(saved.planned_devices[0].position).toBe(34.5);
  await op(page,'capacity-refresh').click();await op(page,'close').click();await expect(page.locator('.planned-device')).toBeVisible();await page.screenshot({path:'artifacts/capacity-ghosts.png'});expect(errors).toEqual([]);
});
test('virtual plans persist in alternatives, can be deleted, and all tabs fit mobile',async({page})=>{
  await demo(page);await op(page,'capacity-add').first().click();await tab(page,6);await field(page,'name').fill('Expansion');await op(page,'plan-create').click();await expect(page.locator('.r3-operation-list')).toContainText('Expansion');
  await tab(page,10);await op(page,'capacity-delete').click();await expect(page.locator('.r3-operation-list')).toContainText('없습니다');
  await tab(page,6);page.once('dialog',d=>d.accept());await op(page,'plan-load').click();await tab(page,10);await expect(page.locator('.r3-operation-list')).toContainText('증설');
  await page.setViewportSize({width:390,height:844});for(let i=8;i<11;i++){await tab(page,i);const b=await page.locator('#r3-operations').boundingBox();expect(b.x+b.width).toBeLessThanOrEqual(391);expect(b.height).toBeLessThanOrEqual(844);}await page.screenshot({path:'artifacts/capacity-mobile.png'});
});
test('live NetBox recommendation, virtual plan, save, reload and restore original layout',async({page})=>{
  await page.goto('http://127.0.0.1:18080/plugins/room-3d/');await page.getByRole('textbox',{name:'Username',exact:true}).fill('room3d-demo');await page.getByRole('textbox',{name:'Password',exact:true}).fill('room3d-local-demo');await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.locator('#r3-location').selectOption({label:'Room3D Demo IDC / 서버실 A'});await expect(page.locator('#r3-operations-open')).toBeEnabled();
  const sceneUrl='/plugins/room-3d/data/locations/1/';const original=await page.evaluate(async url=>(await(await fetch(url)).json()).layout,sceneUrl);
  let planId;
  try {
    await page.locator('#r3-operations-open').click();await tab(page,9);
    let response=page.waitForResponse(r=>r.url().includes('/device-types/'));await op(page,'capacity-types').click();const types=(await(await response).json()).device_types;const type=types.find(t=>t.u_height>0);expect(type).toBeTruthy();await expect(op(page,'capacity-types')).toBeEnabled();await field(page,'device-type').selectOption(String(type.id));
    response=page.waitForResponse(r=>r.url().includes('/recommendations/'));await op(page,'capacity-recommend').click();expect((await response).status()).toBe(200);await expect(op(page,'capacity-add').first()).toBeEnabled();
    await op(page,'capacity-add').first().click();await expect(page.locator('.r3-operation-status')).toContainText('적용');await tab(page,6);await field(page,'name').fill(`QA expansion ${Date.now()}`);
    response=page.waitForResponse(r=>r.url().includes('/plans/')&&r.request().method()==='POST');await op(page,'plan-create').click();const stored=await(await response).json();const plan=stored.plans.find(p=>p.name.startsWith('QA expansion'));planId=plan.id;expect(plan.layout.planned_devices.length).toBe((original.planned_devices||[]).length+1);
    await tab(page,10);await op(page,'capacity-refresh').click();await expect(page.locator('.r3-operation-body')).toContainText('증설 후');await op(page,'close').click();
    response=page.waitForResponse(r=>r.url().includes('/data/locations/')&&r.request().method()==='PUT');await page.locator('[data-action=save]').click();expect((await response).status()).toBe(200);await page.reload();await expect(page.locator('#r3-operations-open')).toBeEnabled();await page.locator('#r3-operations-open').click();await tab(page,10);await expect(page.locator('.r3-operation-list')).toContainText('증설');await op(page,'capacity-refresh').click();await page.screenshot({path:'artifacts/capacity-netbox-verified.png'});
  } finally {
    const result=await page.evaluate(async({url,original,planId})=>{
      const token=document.querySelector('[name=csrfmiddlewaretoken]').value,headers={'Content-Type':'application/json','X-CSRFToken':token};let current=(await(await fetch(url)).json()).layout;
      if(planId){const deleted=await fetch(url+'plans/',{method:'POST',headers,body:JSON.stringify({action:'delete',id:planId,revision:current.revision})});if(!deleted.ok)return {error:'Temporary plan cleanup failed'};current=(await(await fetch(url)).json()).layout;}
      const restored=await fetch(url,{method:'PUT',headers,body:JSON.stringify({...original,planned_devices:original.planned_devices||[],revision:current.revision})});return {status:restored.status};
    },{url:sceneUrl,original,planId});expect(result.status).toBe(200);
  }
});
