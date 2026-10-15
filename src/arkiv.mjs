import {createPublicClient,createWalletClient,ExpirationTime,jsonToPayload} from '@arkiv-network/sdk';
import {tiramisu} from '@arkiv-network/sdk/chains';
import {eq,and} from '@arkiv-network/sdk/query';
import {http,webSocket,custom,toHex} from 'viem';
import {APP,RPC,WS,CHAIN_ID,normalize,projects} from './model.mjs';
export const client=createPublicClient({chain:tiramisu,transport:http(RPC,{timeout:15000,retryCount:1})});
export async function readRecords(publisher){
 let query=client.select().where(and(eq('app',APP),eq('version',1))).limit(100);
 if(publisher) query=query.createdBy(publisher);
 let page=await query.fetch(); const records=[];let malformed=0, scanned=0;
 const block=page.blockNumber;
 while(true){for(const entity of page.entities){if(++scanned>2000)throw new Error('Too many records. Narrow the publisher filter.');try{records.push(normalize(entity));}catch{malformed++;}} if(!page.hasNextPage())break;if(records.length>2000)throw new Error('Too many records. Narrow the publisher filter.');page=await page.next();}
 return {records,block:String(block),malformed};
}
export function watch(onChange,onError){
 const live=createPublicClient({chain:tiramisu,transport:webSocket(WS,{reconnect:{attempts:3,delay:1500}})});
 return live.watchEntityEvents({onError,onEvent:onChange});
}
export async function wallet(){
 const provider=window.ethereum;
 if(!provider)throw new Error('Install an EVM wallet such as MetaMask or Rabby to publish. Reading needs no wallet.');
 const accounts=await provider.request({method:'eth_requestAccounts'});
 try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:toHex(CHAIN_ID)}]});}catch(e){if(e.code===4902 || /unrecognized|unknown chain/i.test(e.message)){await provider.request({method:'wallet_addEthereumChain',params:[{chainId:toHex(CHAIN_ID),chainName:'Arkiv Tiramisu',nativeCurrency:{name:'GLM',symbol:'GLM',decimals:18},rpcUrls:[RPC],blockExplorerUrls:['https://tiramisu.explorer.arkiv.network']}]});await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:toHex(CHAIN_ID)}]});}else throw e;}
 if(Number(await provider.request({method:'eth_chainId'}))!==CHAIN_ID)throw new Error('Select Tiramisu testnet before publishing.');
 return createWalletClient({account:accounts[0],chain:tiramisu,transport:custom(provider)});
}
export function noticeParams({project,title,body,severity,hours}){
 if(!projects.some(p=>p.id===project))throw new Error('Unknown project');
 if(!title?.trim()||title.length>100||!body?.trim()||body.length>1500)throw new Error('Use a title up to 100 characters and a message up to 1,500 characters.');
 if(!['info','warning','critical'].includes(severity)||![24,72,168,336].includes(Number(hours)))throw new Error('Invalid severity or duration');
 const data={app:APP,version:1,type:'notice',project,title:title.trim(),body:body.trim(),severity,validUntil:Math.floor(Date.now()/1000)+Number(hours)*3600};
 return {payload:jsonToPayload(data),contentType:'application/json',attributes:{app:APP,version:1,type:'notice',project,severity,validUntil:data.validUntil},expires:ExpirationTime.fromHours(Number(hours)),flags:{readonly:true,permissionlessExtension:true}};
}
