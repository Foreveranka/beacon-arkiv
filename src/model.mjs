export const APP = 'beacon-arkiv-v1';
export const CHAIN_ID = 7738577;
export const RPC = 'https://rpc.tiramisu.db-chain.testnet.arkiv.network';
export const WS = 'wss://rpc.tiramisu.db-chain.testnet.arkiv.network';
export const EXPLORER = 'https://tiramisu.explorer.arkiv.network';
export const PUBLISHER = '0xdbDFa0f7290e32642D1AcBc9eFae267D66Dd5458';
export const IMPOSTOR = '0xB72cD749e0b63093395512133583F2DD764aF791';
export const projects = [
 {id:'harbor',name:'Harbor',symbol:'H',category:'Lending',color:'#d6efdc',description:'A fictional lending protocol for the Beacon demonstration.',website:'https://harbor.example',address:'0x1111111111111111111111111111111111111111',chainId:8453,publisher:PUBLISHER},
 {id:'orbit',name:'Orbit',symbol:'O',category:'Exchange',color:'#dedbf5',description:'A fictional exchange for the Beacon demonstration.',website:'https://orbit.example',address:'0x2222222222222222222222222222222222222222',chainId:1,publisher:PUBLISHER},
 {id:'fern',name:'Fern',symbol:'F',category:'Payments',color:'#f2e5c9',description:'A fictional payments protocol for the Beacon demonstration.',website:'https://fern.example',address:'0x3333333333333333333333333333333333333333',chainId:42161,publisher:PUBLISHER}
];
export const short = v => v ? `${v.slice(0,8)}…${v.slice(-6)}` : 'Unknown';
export const isAddress = v => /^0x[\da-f]{40}$/i.test(v || '');
export const sameAddress = (a,b) => isAddress(a) && isAddress(b) && a.toLowerCase()===b.toLowerCase();
export const escape = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function assess(record,publisher,block,now=Math.floor(Date.now()/1000)) {
 if (!record || record.app!==APP || record.version!==1 || !['registry','notice'].includes(record.type) || !projects.some(p=>p.id===record.project) || typeof record.title!=='string' || typeof record.body!=='string' || !/^\d+$/.test(record.createdAt||'') || !/^\d+$/.test(record.expiresAt||'')) return {status:'invalid',reason:'Unrecognized record schema'};
 if(record.type==='registry' && (!Array.isArray(record.addresses) || !record.addresses.every(a=>a&&isAddress(a.address)&&Number.isSafeInteger(a.chainId)&&a.chainId>0)))return {status:'invalid',reason:'Malformed address registry'};
 if (!record.readonly) return {status:'invalid',reason:'Mutable content cannot establish publisher provenance'};
 if (!sameAddress(record.creator,publisher)) return {status:'untrusted',reason:'On-chain creator does not match the pinned publisher'};
 if (!Number.isSafeInteger(record.validUntil) || record.validUntil <= now || !record.expiresAt || BigInt(record.expiresAt)<=BigInt(block)) return {status:'expired',reason:'This record is no longer current'};
 return {status:'verified',reason:'Immutable record created by the pinned publisher'};
}
export function checkAddress(input,chainId,project,records,publisher,block,now) {
 if(!isAddress(input)) return {status:'invalid',reason:'Enter a full EVM address (0x followed by 40 hex characters).'};
 const candidates=records.filter(r=>r.type==='registry' && r.project===project && assess(r,publisher,block,now).status==='verified').sort((a,b)=>Number(BigInt(b.createdAt)-BigInt(a.createdAt)) || b.key.localeCompare(a.key));
 if(!candidates.length) return {status:'unknown',reason:'No current registry from this publisher. No conclusion can be drawn.'};
 const registry=candidates[0];
 const match=registry.addresses?.find(a=>a.chainId===Number(chainId)&&sameAddress(a.address,input));
 return match ? {status:'verified',reason:'This address matches the latest registry from your pinned publisher.',record:registry} : {status:'mismatch',reason:'This address is not in the latest registry for this project and network.',record:registry};
}
export function normalize(entity){
 const d=entity.toJson();
 if (!d || typeof d!=='object' || Array.isArray(d) || typeof d.title!=='string' || typeof d.body!=='string' || typeof d.project!=='string' || (d.severity !== undefined && typeof d.severity !== 'string') || !Number.isSafeInteger(d.validUntil)) throw new Error('Invalid payload');
 if(typeof entity.key !== 'string' || !isAddress(entity.creator) || !isAddress(entity.owner) || !/^\d+$/.test(String(entity.createdAt)) || !/^\d+$/.test(String(entity.expiresAt))) throw new Error('Invalid system metadata');
 // Provenance always comes from system fields, never from the payload.
 return {...d,key:entity.key,creator:entity.creator,owner:entity.owner,createdAt:String(entity.createdAt),expiresAt:String(entity.expiresAt),readonly:entity.creationFlags?.readonly===true};
}
export function samples(now=Math.floor(Date.now()/1000)){
 const base={app:APP,version:1,creator:PUBLISHER,owner:PUBLISHER,createdAt:'1',expiresAt:'999999999',readonly:true,validUntil:now+86400*14};
 return [...projects.map((p,i)=>({...base,key:`sample-registry-${i}`,type:'registry',project:p.id,title:`${p.name} address registry`,body:p.description,addresses:[{address:p.address,chainId:p.chainId,label:'Demo contract'}]})),
 {...base,key:'sample-maintenance',type:'notice',project:'harbor',severity:'warning',title:'Scheduled maintenance window',body:'Harbor deposits are paused during a planned upgrade. Existing positions are unaffected. This is a synthetic demonstration.'},
 {...base,key:'sample-orbit',type:'notice',project:'orbit',severity:'info',title:'Contract registry refreshed',body:'Check the current registry before interacting with any address shared in a chat. Synthetic test data.'},
 {...base,key:'sample-impostor',creator:IMPOSTOR,owner:PUBLISHER,type:'notice',project:'harbor',severity:'critical',title:'Urgent: migrate your funds',body:'Synthetic impersonation example. The name and claimed publisher are copied, but the on-chain creator is different.',publisher:PUBLISHER},
 {...base,key:'sample-expired',type:'notice',project:'fern',severity:'info',title:'Previous service notice',body:'An expired notice is not a current statement.',validUntil:now-60}];
}
