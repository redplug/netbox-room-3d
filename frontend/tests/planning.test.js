import test from 'node:test';
import assert from 'node:assert/strict';
import { placeRows, layoutDiff, validCamera } from '../planning.js';
import { clearanceShape, errors } from '../geometry.js';
const rack = { id:1, name:'R1', width:600, depth:1000, height:2100, u_height:42, devices:[] };
const racks = [rack, { ...rack, id:2, name:'R2' }];
const room = { name:'QA', width:12000, depth:8000, height:3000, grid:600, placements:[], blocks:[], appearances:{} };
test('row placement is atomic and rejects occupied racks or overflow', () => {
  const next = placeRows(room,racks,[1,2],{x:1000,z:1000,columns:2,gapX:600,gapZ:1000,rotation:0});
  assert.equal(next.placements[1].x-next.placements[0].x,1200); assert.equal(room.placements.length,0);
  assert.throws(() => placeRows(next,racks,[1],{x:0,z:0,columns:1,gapX:0,gapZ:0,rotation:0}));
  assert.throws(() => placeRows(room,racks,[1,2],{x:11900,z:0,columns:2,gapX:0,gapZ:0,rotation:0}));
});
test('clearance rotates with the front and shared aisles are allowed', () => {
  const shape={rack_id:1,x:2000,z:2000,width:600,depth:1000,rotation:90};
  assert.equal(clearanceShape(shape,{enabled:true,front:1000,rear:600}).x,1800);
  const next=placeRows(room,racks,[1,2],{x:1000,z:1000,columns:1,gapX:0,gapZ:1000,rotation:0});
  next.clearance={enabled:true,front:800,rear:800}; assert.equal(errors(next,racks).length,0);
});
test('zones are nonblocking and changes are reported independently', () => {
  const next=placeRows(room,racks,[1],{x:1000,z:1000,columns:1,gapX:0,gapZ:0,rotation:0});
  const zone={id:'zone',name:'Floor',color:'#277f9a',x:1300,z:1500,width:600,depth:1000};
  assert.equal(errors({...next,zones:[zone]},racks).length,0);
  assert.equal(layoutDiff(next,{...next,zones:[zone]},racks)[0].key,'zone:zone');
});
test('shared camera inputs reject walking, nonfinite and coincident views', () => {
  assert(validCamera({mode:'top',position:[1,10,1],target:[1,0,1]}));
  assert(!validCamera({mode:'walk',position:[1,10,1],target:[1,0,1]}));
  assert(!validCamera({mode:'3d',position:[1,NaN,1],target:[1,0,1]}));
  assert(!validCamera({mode:'3d',position:[1,10,1],target:[1,10,1]}));
});
