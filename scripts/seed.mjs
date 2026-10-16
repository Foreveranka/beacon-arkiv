import {profileRecord} from '../src/link-security.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createPublicClient,createWalletClient,ExpirationTime,jsonToPayload} from '@arkiv-network/sdk';
import {tiramisu} from '@arkiv-network/sdk/chains';import{http,formatEther,parseEther}from'viem';import{privateKeyToAccount}from'viem/accounts';
import{APP,RPC,CHAIN_ID,projects,samples,normalize,PUBLISHER,IMPOSTOR,assess}from'../src/model.mjs';
const dir=process.env.BEACON_KEYS_DIR||'/Users/mete/Documents/Yarisma-Cuzdanlari/beacon-arkiv';
const client=createPublicClient({chain:tiramisu,transport:http(RPC)});
const keys=await Promise.all(['publisher','impostor'].map(async role=>{const key=JSON.parse(await readFile(`${dir}/${role}.json`,'utf8'));return createWalletClient({chain:tiramisu,account:privateKeyToAccount(key.privateKey),transport:http(RPC)});}));
if(await client.getChainId()!==CHAIN_ID)throw new Error('Wrong network');
for(const w of keys)console.log(w.account.address,'test GLM:',formatEther(await client.getBalance({address:w.account.address})));
if(await client.getBalance({address:PUBLISHER})===0n){console.log('Awaiting test GLM funding. No entities written.');process.exit(2);}
if(await client.getBalance({address:IMPOSTOR})===0n){const balance=await client.getBalance({address:PUBLISHER});const value=balance/5n;const hash=await keys[0].sendTransaction({to:IMPOSTOR,value});await client.waitForTransactionReceipt({hash});console.log('Funded synthetic adversary wallet',hash);}
let evidence=JSON.parse(await readFile('public/evidence.json','utf8'));
for(const sample of [...samples(),profileRecord()]){
 if(evidence.transactions.some(t=>t.sampleId===sample.key))continue;
 const{key,creator,owner,createdAt,expiresAt,readonly,...data}=sample;
 const w=creator===IMPOSTOR?keys[1]:keys[0];
 const hours=data.type==='registry'?720:336;
 if(data.type==='registry')data.validUntil=Math.floor(Date.now()/1000)+hours*3600;
 const result=await w.createEntity({payload:jsonToPayload(data),contentType:'application/json',attributes:{app:APP,version:1,type:data.type,project:data.project,severity:data.severity||'info',validUntil:data.validUntil},expires:ExpirationTime.fromHours(hours),flags:{readonly:true,permissionlessExtension:true}});
 evidence.transactions.push({sampleId:key,creator:w.account.address,...result,expiresAt:String(result.expiresAt)});await writeFile('public/evidence.json',JSON.stringify(evidence,null,2));
 console.log('Created',key,result.txHash);
}
evidence.status='live';evidence.writtenAt=new Date().toISOString();await writeFile('public/evidence.json',JSON.stringify(evidence,null,2));
// Demonstrate ownership spoofing: the original creator remains the impersonator.
const fake=evidence.transactions.find(t=>t.sampleId==='sample-impostor');let entity=await client.getEntity(fake.entityKey);
if(entity.owner.toLowerCase()!==PUBLISHER.toLowerCase()){const result=await keys[1].changeOwnership({entityKey:fake.entityKey,newOwner:PUBLISHER});evidence.ownershipTransfer={...result};await writeFile('public/evidence.json',JSON.stringify(evidence,null,2));}
entity=await client.getEntity(fake.entityKey);const result=assess(normalize(entity),PUBLISHER,await client.getBlockNumber());if(result.status!=='untrusted')throw new Error('Spoof protection failed');console.log('On-chain ownership spoof correctly rejected');
