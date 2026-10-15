import {createPublicClient} from '@arkiv-network/sdk';import{tiramisu}from'@arkiv-network/sdk/chains';import{http}from'viem';import{and,eq}from'@arkiv-network/sdk/query';
import{APP,RPC,PUBLISHER,normalize,assess}from'../src/model.mjs';
const client=createPublicClient({chain:tiramisu,transport:http(RPC,{timeout:15000,retryCount:1})});
for(const pinnedOnly of [false,true]){
 let q=client.select().where(and(eq('app',APP),eq('version',1))).limit(2);if(pinnedOnly)q=q.createdBy(PUBLISHER);
 let page=await q.fetch(),count=0,pages=0;
 while(true){pages++;for(const entity of page.entities){const r=normalize(entity);count++;console.log(JSON.stringify({key:r.key,creator:r.creator,owner:r.owner,title:r.title,status:assess(r,PUBLISHER,page.blockNumber).status}));}if(!page.hasNextPage())break;page=await page.next();}
 console.log(JSON.stringify({pinnedOnly,records:count,pages,block:String(page.blockNumber)}));
}
