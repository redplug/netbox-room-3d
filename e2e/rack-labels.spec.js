import { test, expect } from '@playwright/test';
test('dense top-view rack cards do not overlap; usage does not change rack geometry', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  await page.locator('#r3-canvas canvas').waitFor();
  const result = await page.evaluate(async () => {
    const { RoomScene } = await import('/frontend/scene.js');
    const { demoData } = await import('/frontend/demo.js');
    const base = demoData();
    const racks = Array.from({ length: 9 }, (_, i) => ({ ...base.racks[0], id: i + 1, name: `YTC-7F-B-0${i + 1}`, devices: [] }));
    const layout = { ...base.layout, width: 6500, depth: 3000, blocks: [], placements: racks.map((r, i) => ({ rack_id:r.id, x:600 + i * 600, z:1500, rotation:0, dimensions:{} })) };
    const host = document.createElement('div'); host.id = 'dense-host'; host.style.cssText='position:absolute;inset:0;width:1500px;height:850px;background:white;z-index:10000'; document.querySelector('#room3d').append(host);
    const scene = new RoomScene(host, {});
    scene.update(layout, racks, null, { labels:true, usage:true }); scene.view('top'); scene.flushDraw();
    const cards = [...host.querySelectorAll('.rack-summary')].map(e => { const r=e.getBoundingClientRect(); return {left:r.left,right:r.right,name:e.querySelector('.rack-name')?.textContent,usage:!!e.querySelector('.rack-usage')}; });
    let markersAbove = true;
    scene.content.traverse(o => { if (o.userData.frontMarker && o.geometry.attributes.position.getY(0) <= racks[0].height/1000) markersAbove=false; });
    const meshCount = () => { let n=0; for(const node of scene.rackNodes.values())node.details.traverse(o=>{if(o.isMesh)n++;});return n; };
    const before=meshCount(); scene.update(layout,racks,null,{labels:true,usage:false});const after=meshCount();
    scene.update(layout,racks,null,{labels:true,usage:true});scene.flushDraw();
    window.denseScene = scene;
    return { cards, before, after, markersAbove };
  });
  expect(result.cards).toHaveLength(9);
  for(let i=1;i<9;i++)expect(result.cards[i-1].right).toBeLessThanOrEqual(result.cards[i].left);
  expect(result.cards.every(c=>c.name&&c.usage)).toBe(true);
  expect(result.before).toBe(result.after); expect(result.markersAbove).toBe(true);
  await page.screenshot({path:'artifacts/dense-rack-labels.png'});
  await page.evaluate(()=>{window.denseScene.dispose();document.querySelector('#dense-host').remove();});
});
