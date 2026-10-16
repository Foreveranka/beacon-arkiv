import test from 'node:test';import assert from 'node:assert/strict';
import {samples,assess,checkAddress,PUBLISHER,IMPOSTOR,normalize,escape} from '../src/model.mjs';
const now=1800000000,rs=samples(now),registry=rs[0];
test('trusted immutable current creator matches',()=>assert.equal(assess(registry,PUBLISHER,2n,now).status,'verified'));
test('a copied publisher field does not establish identity',()=>assert.equal(assess({...registry,creator:IMPOSTOR,publisher:PUBLISHER},PUBLISHER,2n,now).status,'untrusted'));
test('transferring ownership to a trusted wallet cannot launder a creator',()=>assert.equal(assess({...registry,creator:IMPOSTOR,owner:PUBLISHER},PUBLISHER,2n,now).status,'untrusted'));
test('mutable payload rejected even from trusted creator',()=>assert.equal(assess({...registry,readonly:false},PUBLISHER,2n,now).status,'invalid'));
test('business expiry cannot be extended by extending storage',()=>assert.equal(assess({...registry,validUntil:now-1,expiresAt:'999999999'},PUBLISHER,2n,now).status,'expired'));
test('chain expiration is independently checked',()=>assert.equal(assess({...registry,expiresAt:'2'},PUBLISHER,2n,now).status,'expired'));
test('unknown schema fails closed',()=>assert.equal(assess({...registry,version:2},PUBLISHER,2n,now).status,'invalid'));
test('exact address plus network required',()=>{assert.equal(checkAddress(registry.addresses[0].address,8453,'harbor',rs,PUBLISHER,2n,now).status,'verified');assert.equal(checkAddress(registry.addresses[0].address,1,'harbor',rs,PUBLISHER,2n,now).status,'mismatch');});
test('empty or partial address rejected',()=>assert.equal(checkAddress('0x111',8453,'harbor',rs,PUBLISHER,2n,now).status,'invalid'));
test('no registry means unknown, not safe',()=>assert.equal(checkAddress(registry.addresses[0].address,8453,'harbor',[],PUBLISHER,2n,now).status,'unknown'));
test('newer untrusted registry cannot override authentic data',()=>assert.equal(checkAddress(registry.addresses[0].address,8453,'harbor',[...rs,{...registry,createdAt:'999',creator:IMPOSTOR,addresses:[]}],PUBLISHER,2n,now).status,'verified'));
test('new authentic registry supersedes old one',()=>assert.equal(checkAddress(registry.addresses[0].address,8453,'harbor',[registry,{...registry,createdAt:'2',addresses:[]}],PUBLISHER,3n,now).status,'mismatch'));
test('untrusted JSON cannot overwrite actual system provenance',()=>{const n=normalize({toJson:()=>({...registry,creator:PUBLISHER,readonly:true}),key:'chain-key',creator:IMPOSTOR,owner:PUBLISHER,createdAt:1n,expiresAt:10n,creationFlags:{readonly:false}});assert.equal(n.creator,IMPOSTOR);assert.equal(n.readonly,false);});
test('malformed registry fails closed without throwing',()=>assert.equal(assess({...registry,addresses:'not-an-array'},PUBLISHER,2n,now).status,'invalid'));
test('rendered hostile markup is escaped',()=>assert.equal(escape('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));

test('invalid metadata is rejected before feed sorting',()=>assert.throws(()=>normalize({toJson:()=>registry,key:'chain-key',creator:PUBLISHER,owner:PUBLISHER,createdAt:'bad',expiresAt:10n}),/metadata/));
test('non-string payload fields cannot crash rendering',()=>assert.throws(()=>normalize({toJson:()=>({...registry,title:{x:'bad'}})}),/payload/));

// Regression for the first funded Tiramisu write: mixed-case index names revert.
test("publisher uses chain-compatible lowercase index names", async()=>{const {noticeParams}=await import("../src/arkiv.mjs");const p=noticeParams({project:"harbor",title:"Synthetic notice",body:"Synthetic test content",severity:"info",hours:24});assert.ok(Object.keys(p.attributes).every(name=>/^[a-z][a-z0-9_.-]*$/.test(name)));assert.ok(Number.isInteger(p.attributes.valid_until));});
