import {quotePair} from './pricing.mjs';
export function cents(v){const s=String(v);if(!/^\d{1,8}(\.\d{1,2})?$/.test(s))throw Error('Invalid registrar price');const [a,b='']=s.split('.');return Number(a)*100+Number(b.padEnd(2,'0'));}
export async function catalogQuote(domain,env,fetcher=fetch){
 const tld=domain.split('.').pop();
 if(domain.split('.').length!==2||!['com','net','org'].includes(tld))throw Error('Unsupported quote');
 if(!env.NAMESILO_API_KEY||!env.DB)throw Error('Not configured');
 const p=await env.DB.prepare('SELECT bdt_per_usd_minor, markup_bps FROM pricing_settings WHERE id=1').first();
 if(!p)throw Error('Pricing policy missing');
 const u=new URL('https://www.namesilo.com/api/getPrices');u.search=new URLSearchParams({version:'1',type:'json',key:env.NAMESILO_API_KEY,registration_domains:'1'}).toString();
 const r=await fetcher(u,{redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Registrar unavailable');
 const a=(await r.json()).reply;if(String(a?.code)!=='300'||!Object.hasOwn(a,tld))throw Error('Price unavailable');
 return {...quotePair({registrationCents:cents(a[tld].registration),renewalCents:cents(a[tld].renew)},{bdtPerUsdMinor:p.bdt_per_usd_minor,markupBps:p.markup_bps}),kind:'standard-extension-estimate',premiumExcluded:true,checkoutEnabled:false};
}
