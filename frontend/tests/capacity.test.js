import test from 'node:test';
import assert from 'node:assert/strict';
import { capacityPreview, candidateRacks, demoTypes } from '../capacity.js';
import { layoutDiff } from '../planning.js';
const rack={id:1,name:'A',u_height:6,starting_unit:10,desc_units:true,complete:true,devices:[{position:10,u_height:2,face:'front',full_depth:false}],reservations:[{id:1,units:[13],status:'stale',description:'Reserved'}]};
const plan=(overrides={})=>({id:'p',name:'Virtual',rack_id:1,device_type_id:3,position:12.5,face:'front',...overrides});
test('half-U capacity excludes all reservations and uses actual rack numbering',()=>{
  const r=capacityPreview([rack],demoTypes,[plan()]);assert.deepEqual(r.issues,[]);
  assert.equal(r.racks[0].before.used_u,2);assert.equal(r.racks[0].before.reserved_u,1);
  assert.equal(r.racks[0].after.planned_u,.5);assert.equal(r.racks[0].after.front.max_contiguous_u,2);
  const positions=candidateRacks([rack],demoTypes,[],3,'front').candidates[0].positions;
  assert.deepEqual(positions,[12,12.5,14,14.5,15,15.5]);
});
test('opposite shallow faces coexist; full depth and reservation collisions are rejected',()=>{
  assert.equal(capacityPreview([rack],demoTypes,[plan({position:10,face:'rear'})]).issues.length,0);
  assert.equal(capacityPreview([rack],demoTypes,[plan({position:10,face:'rear',device_type_id:2})]).issues[0].code,'collision');
  assert.equal(capacityPreview([rack],demoTypes,[plan({position:13})]).issues[0].code,'collision');
  assert.throws(()=>capacityPreview([rack],demoTypes,[plan({position:12.1})]));
});
test('partial inventory is unknown rather than free capacity',()=>{
  const hidden={...rack,complete:false};const result=capacityPreview([hidden],demoTypes,[]);
  assert.equal(result.racks[0].before,null);assert.equal(result.unknown_racks,1);
  assert.deepEqual(candidateRacks([hidden],demoTypes,[],3,'front').candidates,[]);
});
test('forecast is atomic, candidates account for draft devices, and diff lists moves',()=>{
  const before=structuredClone(rack);const planned=[plan()];const result=capacityPreview([rack],demoTypes,planned);
  assert.deepEqual(rack,before);assert.equal(result.planned_devices[0].valid,true);
  assert(!candidateRacks([rack],demoTypes,planned,3,'front').candidates[0].positions.includes(12.5));
  const layout={placements:[],blocks:[],planned_devices:planned};
  const changes=layoutDiff(layout,{...layout,planned_devices:[plan({position:14})]},[]);
  assert.equal(changes[0].key,'planned:p');assert(changes[0].fields.includes('position'));
});
