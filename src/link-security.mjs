import {APP,PUBLISHER,sameAddress} from './model.mjs';
export const scannerVersion='1.0.0';
// Beacon-maintained public-source observations, not an Arkiv-team endorsement.
export const arkivProfile={app:APP,version:1,type:'domain-profile',project:'arkiv',title:'Arkiv public domain references',body:'Maintained by Beacon from public first-party links; not endorsed or signed by the Arkiv team.',rootDomain:'arkiv.network',brand:'arkiv',hosts:['arkiv.network','docs.arkiv.network','hub.arkiv.network','data.arkiv.network','tiramisu.explorer.arkiv.network','status.arkiv.network'],sources:['https://arkiv.network/','https://docs.arkiv.network/','https://hub.arkiv.network/'],checkedAt:'2026-10-16',validUntil:Math.floor(Date.parse('2026-10-30T00:00:00Z')/1000)};
export function profileRecord(){return {...arkivProfile,key:'sample-domain-profile',creator:PUBLISHER,owner:PUBLISHER,readonly:true,createdAt:'1',expiresAt:'999999999'};}
export function resolveProfile(records,block,now=Math.floor(Date.now()/1000)){
 const candidates=records.filter(r=>r.type==='domain-profile'&&r.project==='arkiv'&&r.app===APP&&r.version===1&&r.readonly===true&&sameAddress(r.creator,PUBLISHER)&&typeof r.key==='string'&&/^\d+$/.test(r.createdAt)&&/^\d+$/.test(r.expiresAt)).sort((a,b)=>BigInt(a.createdAt)===BigInt(b.createdAt)?b.key.localeCompare(a.key):BigInt(a.createdAt)>BigInt(b.createdAt)?-1:1);
 const r=candidates[0];if(!r)return {...arkivProfile,available:now<arkivProfile.validUntil,source:'Bundled public-source reference · not an on-chain record'};
 const valid=r.rootDomain==='arkiv.network'&&r.brand==='arkiv'&&Array.isArray(r.hosts)&&r.hosts.length>0&&r.hosts.every(h=>typeof h==='string'&&h===h.toLowerCase()&&/^[a-z0-9.-]+$/.test(h)&&(h==='arkiv.network'||h.endsWith('.arkiv.network')))&&Array.isArray(r.sources)&&r.sources.every(x=>arkivProfile.sources.includes(x))&&Number.isSafeInteger(r.validUntil)&&r.validUntil>now&&BigInt(r.expiresAt)>BigInt(block);
 return {...arkivProfile,...(valid?r:{}),available:valid,source:valid?'Live Arkiv record · Beacon curator':'Latest curator record invalid or expired · no domain approval'};
}
export function extractMessageLinks(message){
 if(typeof message!=='string'||message.length>12000)throw new Error('Paste up to 12,000 characters.');
 const masked=[];
 const text=message.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi,(_,label,url)=>{masked.push({label,url});return url;});
 const links=[...new Set((text.match(/(?:https?:\/\/|www\.)[^\s<>"`]+/gi)||[]).map(url=>{while(url.endsWith(')')&&(url.match(/\)/g)||[]).length>(url.match(/\(/g)||[]).length)url=url.slice(0,-1);return url;}))];
 if(links.length>10)throw new Error('More than 10 links found. Split the message; none have been checked.');
 return {links,masked};
}
function distance(a,b){let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=row;}return prev[b.length];}
export function analyzeLink(raw,profile=arkivProfile,{label='',message=''}={}){
 const signals=[];const add=(code,severity,detail)=>{if(!signals.some(s=>s.code===code))signals.push({code,severity,detail});};
 let u;try{u=new URL(raw.startsWith('www.')?`https://${raw}`:raw);}catch{return {input:raw,host:'Unparseable',classification:'unknown',domainMatch:false,signals:[{code:'invalid',severity:'warning',detail:'This link could not be parsed.'}],unchecked:['Destination content and redirects were not checked.']};}
 const host=u.hostname.toLowerCase();const available=profile.available!==false&&profile.validUntil>Math.floor(Date.now()/1000);const domainMatch=available&&profile.hosts.includes(host);
 if(!['https:','http:'].includes(u.protocol))add('scheme','high','This is not an HTTP(S) web link.');
 if(u.protocol==='http:')add('http','warning','The URL uses unencrypted HTTP.');
 if(u.username||u.password)add('credentials','high',`Text before @ is not the destination. The actual host is ${host}.`);
 if(/[\u0000-\u0020\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f\\]/.test(raw))add('hidden','high','Hidden characters, whitespace or backslashes can disguise how the link is parsed.');
 const underRoot=host===profile.rootDomain||host.endsWith(`.${profile.rootDomain}`);
 if(!underRoot&&host.includes(profile.rootDomain))add('subdomain','high',`The text ${profile.rootDomain} appears inside a different host. It is not beneath the official domain.`);
 if(host.includes('xn--'))add('idn','warning','Internationalized domain (punycode). Similar-looking letters can conceal a different host.');
 if(!underRoot){const labels=host.split('.');const brand=profile.brand;
 if(labels.some(l=>l.includes(brand)))add('brand','warning','The project name appears in an unrelated domain; possible impersonation, not proof of fraud.');
 if(labels.some(l=>l!==brand&&(distance(l,brand)===1||l.replace(/[1l]/g,'i').replace(/0/g,'o')===brand)))add('lookalike','high','A domain label closely resembles the project name using a spelling or character substitution.');
 }
 if(!domainMatch)add('unlisted','info',available?'This exact host is not in the sourced reference list. Unlisted does not mean malicious.':'The reference is unavailable or expired; no official-domain conclusion is possible.');
 if(underRoot&&!domainMatch)add('subdomain-unreviewed','info','This is under the reference root, but this particular subdomain has not been reviewed.');
 if(label&&/^(?:https?:\/\/|www\.)/i.test(label)){try{const shown=new URL(label.startsWith('www.')?`https://${label}`:label);if(shown.href!==u.href)add('masked','high',`The visible URL says ${shown.hostname}, but its underlying link differs. Actual host: ${host}.`);}catch{add('masked','warning','The displayed URL cannot be validated against the actual target.');}}
 if(['bit.ly','t.co','tinyurl.com','is.gd','buff.ly','cutt.ly'].includes(host))add('shortener','warning','Shortened link: the destination is hidden. No redirect resolution was performed.');
 for(const [key,value] of u.searchParams){if(/^(url|redirect|redirect_uri|redirect_url|next|return|returnto|target|destination|continue)$/i.test(key)){if(/^(https?:)?\/\//i.test(value)){try{const target=new URL(value,u.origin);if(target.hostname!==host)add('redirect','warning',`The ${key} parameter names another host (${target.hostname}). This is a possible redirect, not an observed redirect.`);}catch{add('redirect','warning','An unparseable redirect parameter is present.');}}}}
 if(/\.(exe|msi|dmg|apk|scr|bat|ps1|zip)(?:$)/i.test(u.pathname))add('download','warning','The URL path suggests a downloadable file. Its contents have not been inspected.');
 if(/(seed phrase|recovery phrase|private key|secret phrase|kurtarma kelime|özel anahtar)/i.test(message))add('secrets','warning','The message mentions wallet secrets. This is a context flag, not proof that the message requests them.');
 if(/(airdrop|claim|migration|migrate)/i.test(message+' '+u.pathname))add('campaign','info','Campaign claims are unverified. An official host alone does not prove an airdrop exists or that a wallet request is safe.');
 const classification=signals.some(s=>s.severity==='high')?'high':signals.some(s=>s.severity==='warning')?'review':domainMatch?'reference':'unknown';
 return {input:raw,host,classification,domainMatch,signals,unchecked:['Site content, actual redirects and malware were not inspected.','Wallet permissions, transactions, domain ownership changes and compromise were not assessed.','No external phishing reputation feed is connected.']};
}
export function analyzeMessage(message,profile){const {links,masked}=extractMessageLinks(message);return links.map(url=>analyzeLink(url,profile,{message,label:masked.find(m=>m.url===url)?.label}));}
