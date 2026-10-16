import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiscoveryScope, candidateOverlayKey } from '../inventory-lifecycle.js';
import { API } from '../api.js';

test('closing discovery aborts its transport and permanently invalidates its ticket', () => {
  const scope=createDiscoveryScope(),ticket=scope.start();
  let aborted=false;
  ticket.signal.addEventListener('abort',()=>{aborted=true;});
  assert(ticket.current());scope.cancel();
  assert(aborted);assert(ticket.signal.aborted);assert(!ticket.current());
  const retry=scope.start();
  assert(retry.current());assert(!retry.signal.aborted);assert(!ticket.current());
});

test('a late response or failure from the closed session cannot replace reopened results', async () => {
  const scope=createDiscoveryScope();
  let releaseOld,releaseFailure,display='';
  const old=scope.start();
  const oldResponse=new Promise(resolve=>{releaseOld=resolve;}).then(value=>{if(old.current())display=value;});
  const oldFailure=new Promise((resolve,reject)=>{releaseFailure=reject;}).catch(error=>{if(old.current())display=error.message;});
  scope.cancel();const retry=scope.start();
  if(retry.current())display='new inventory';
  releaseOld('stale inventory');releaseFailure(new Error('stale error'));
  await Promise.all([oldResponse,oldFailure]);
  assert.equal(display,'new inventory');assert(retry.current());
});

test('device discovery forwards its abort signal through the real API request to fetch', async () => {
  const previousWindow=globalThis.window,previousDocument=globalThis.document,previousFetch=globalThis.fetch;
  globalThis.window={location:{href:'https://netbox.example/plugins/room-3d/'}};
  globalThis.document={querySelector:()=>null};
  const controller=new AbortController();let fetchSignal;
  globalThis.fetch=(url,options)=>new Promise((resolve,reject)=>{
    fetchSignal=options.signal;
    fetchSignal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
  });
  try {
    const api=new API({dataset:{api:'/plugins/room-3d/data/locations/'}});
    const pending=api.devices(undefined,{signal:controller.signal});
    assert.equal(fetchSignal,controller.signal);controller.abort();
    await assert.rejects(pending,{name:'AbortError'});
  }finally{globalThis.window=previousWindow;globalThis.document=previousDocument;globalThis.fetch=previousFetch;}
});

test('candidate key tracks rack movement, rotation, dimensions, unplacement and restoration without mutation', () => {
  const context={locationId:1,layout:{placements:[{rack_id:10,x:600,z:600,rotation:0,dimensions:{}}],planned_devices:[],include_descendants:true},racks:[{id:10}]};
  const baseline=structuredClone(context),original=candidateOverlayKey(context);
  for(const mutate of [
    c=>{c.layout.placements[0].x-=100;},
    c=>{c.layout.placements[0].z+=100;},
    c=>{c.layout.placements[0].rotation=90;},
    c=>{c.layout.placements[0].dimensions.height=2200;},
    c=>{c.layout.placements=[];},
  ]) {
    const draft=structuredClone(context);mutate(draft);
    assert.notEqual(candidateOverlayKey(draft),original);
    assert.equal(candidateOverlayKey(baseline),original);
  }
  assert.deepEqual(context,baseline);
  assert.equal(candidateOverlayKey({...context,selected:{rackId:10,deviceId:100}}),original);
});
