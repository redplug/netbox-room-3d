import test from 'node:test';
import assert from 'node:assert/strict';
import { identifierMatches, qualityRows, qualityCSV, csvCell, targetFromURL, targetURL, deviceDetailsHTML } from '../inventory-discovery.js';
import { findFreeUnits } from '../capacity.js';

test('identifier search is literal, trimmed, case insensitive and preserves zero',()=>{
  const d={asset_number:0,serial:' AbC[.*] ',asset_tag:'DO-NOT-SEARCH',name:'DO-NOT-SEARCH'};
  assert(identifierMatches(d,' 0 '));assert(identifierMatches(d,'abc[.*]'));
  assert(!identifierMatches(d,'DO-NOT-SEARCH'));assert(!identifierMatches(d,'^AbC'));
  assert(!identifierMatches(d,' '));assert(!identifierMatches({asset_tag:'fallback'},'fallback'));
});
test('quality report detects normalized duplicates, missing fields and unassigned context',()=>{
  const rows=qualityRows([{id:1,asset_number:' A ',serial:0},{id:2,asset_number:'a',serial:'',rack_unassigned:true,location_unassigned:true}]);
  assert.equal(rows.length,2);assert(rows[0].issues.includes('자산번호 중복 (조회 범위)'));
  assert(!rows[0].issues.some(i=>i.includes('시리얼')));assert(rows[1].issues.includes('랙 미할당'));
  assert.equal(qualityRows([{asset_number:0,serial:'S'}]).length,0);
});
test('CSV neutralizes formulas and quotes embedded newlines and quotes',()=>{
  for(const value of ['=SUM(A1)',' +1','\t@SUM(A1)','-1','\ntext'])assert(csvCell(value).startsWith('"\''));
  assert.equal(csvCell('a,"b"\nc'),'"a,""b""\nc"');
  assert(qualityCSV([{device:{id:1,name:'=HYPERLINK("x")'},issues:['missing']}]).includes("'=HYPERLINK"));
});
test('stable links contain IDs only and reject invalid identifiers',()=>{
  const link=targetURL('https://netbox.example/plugins/room-3d/?camera=old#old',{location:1,rack:2,device:3});
  assert.deepEqual(targetFromURL(link),{location:1,rack:2,device:3});assert(!link.includes('camera'));
  for(const query of ['device=0','rack=-1','location=abc','device=9007199254740992'])assert.throws(()=>targetFromURL(`https://example.com/?${query}`));
});
test('details escape content and copy attributes, reject script URLs, and show numeric zero',()=>{
  const html=deviceDetailsHTML({id:1,name:'<img onerror="x">',asset_number:0,serial:'" onclick="x',url:'javascript:alert(1)'});
  assert(!html.includes('<img'));assert(!html.includes('href="javascript:'));assert(html.includes('data-inventory-copy="0"'));
  assert(html.includes('&quot; onclick=&quot;x'));assert(html.includes('조회 가능한 값 없음'));
});
const rack={id:1,name:'R',u_height:6,starting_unit:1,desc_units:false,complete:true,reservations:[{units:[4]}],devices:[{position:1,u_height:1,face:'front',full_depth:false}]};
test('free U finder honors faces, reservations, full depth and half-U footprints',()=>{
  const front=findFreeUnits([rack],[],[],1,'front'),rear=findFreeUnits([rack],[],[],1,'rear'),full=findFreeUnits([rack],[],[],1,'rear',true);
  assert(!front.candidates[0].positions.includes(1));assert(rear.candidates[0].positions.includes(1));assert(!full.candidates[0].positions.includes(1));
  assert(!rear.candidates[0].positions.includes(3.5));assert(!rear.candidates[0].positions.includes(4));
  assert(front.candidates[0].positions.includes(2.5));
});
test('free U finder excludes unknown inventory and occupied virtual plans',()=>{
  const types=[{id:1,model:'1U',u_height:1,full_depth:true}],planned=[{id:'p',name:'Plan',rack_id:1,device_type_id:1,position:5,face:'rear'}];
  const result=findFreeUnits([rack,{...rack,id:2,complete:false}],types,planned,1,'front');
  assert.equal(result.unknown_racks,1);assert.equal(result.excluded[0].rack_id,2);
  assert(!result.candidates[0].positions.includes(5));
  for(const height of [0,-1,.5,NaN,Infinity,'1',true])assert.throws(()=>findFreeUnits([rack],[],[],height,'front'));
});
