import {catalogQuote} from './catalog.mjs';
const headers={"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"};
export function validDomain(s){return typeof s==="string"&&s.length<=253&&s.split(".").length>=2&&s.split(".").every(x=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(x))&&/^[a-z]{2,63}$/.test(s.split(".").pop());}
export function registrarMatch(bucket,d){
 const entries=Array.isArray(bucket)?bucket:[bucket?.domain??bucket].flat();
 return entries.find(v=>{const n=typeof v==="string"?v:v?.domain??v?.["$t"]??v?.["#text"];return typeof n==="string"&&n.toLowerCase()===d;});
}
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers});
export default {async fetch(req,env){
 const u=new URL(req.url);
 if(req.method!=="GET")return json({error:"Method not allowed"},405);
 if(u.pathname==="/api/search"){
 const d=(u.searchParams.get("domain")||"").trim().toLowerCase();
 if(!validDomain(d))return json({error:"Enter a valid ASCII domain name."},400);
 if(!env.NAMESILO_API_KEY)return json({error:"Registrar not configured."},503);
 if(!env.SEARCH_LIMITER||!req.headers.get("CF-Connecting-IP"))return json({error:"Search protection not configured."},503);
 try{const limit=await env.SEARCH_LIMITER.limit({key:req.headers.get("CF-Connecting-IP")});if(!limit.success)return json({error:"Too many searches. Try again in a minute."},429);}catch{return json({error:"Search protection unavailable."},503);}
 let stage="prepare", diagnostic="REG-PREPARE";
 try{
 const q=new URL("https://www.namesilo.com/api/checkRegisterAvailability");
 q.search=new URLSearchParams({version:"1",type:"json",key:env.NAMESILO_API_KEY,domains:d}).toString();
 stage="fetch";diagnostic="REG-FETCH";
 const r=await fetch(q.toString(),{redirect:"manual",signal:AbortSignal.timeout(10000)});
 stage="http";
 if(!r.ok){diagnostic=r.status>=300&&r.status<400?"REG-REDIRECT":r.status===401||r.status===403?"REG-HTTP-AUTH":r.status===429?"REG-HTTP-LIMIT":"REG-HTTP";console.warn("registrar_http",r.status);throw Error();}
 stage="json";diagnostic="REG-JSON";
 const a=(await r.json()).reply;
 stage="reply";diagnostic="REG-REPLY";
 if(String(a?.code)!=="300"){console.warn("registrar_code",/^\d{3}$/.test(String(a?.code))?String(a.code):"unknown");throw Error();}
 diagnostic="REG-SHAPE";
 const match=x=>registrarMatch(x,d);
 const yes=match(a.available),no=match(a.unavailable);
 if(Boolean(yes)===Boolean(no)){console.warn("registrar_response_mismatch");throw Error();}
 let pricing=null;if(yes){ /* Price remains disabled until premium attributes and live catalog are verified. */ }
 return json({domain:d,available:!!yes,pricing});
 }catch(e){const kind=["TypeError","SyntaxError","AbortError","TimeoutError"].includes(e?.name)?e.name:"Error";console.warn("registrar_lookup_failed",stage,kind);return json({error:"Registrar lookup unavailable. Try again later.",diagnostic:stage==="fetch"&&(kind==="TimeoutError"||kind==="AbortError")?"REG-TIMEOUT":diagnostic,release:"010.3"},502);}
 }
 if(u.pathname!=="/")return json({error:"Not found"},404);
 return new Response(page,{headers:{"content-type":"text/html; charset=utf-8","x-content-type-options":"nosniff","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"}});
}};
const page=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Slickk Domains</title><style>*{box-sizing:border-box}body{margin:0;background:#090d14;color:#f4f8fc;font:16px system-ui}main,header,footer{max-width:960px;margin:auto;padding:24px}header{font-weight:800;letter-spacing:2px}b{color:#44cfe3}main{padding-top:12vh;padding-bottom:12vh}h1{font-size:clamp(36px,7vw,72px);line-height:1.05}p{color:#aab8c9;line-height:1.6}form{display:flex;flex-wrap:wrap;gap:10px}input,button{font:inherit;padding:16px;border-radius:10px;border:1px solid #334155}input{flex:1;min-width:200px;background:#151e2b;color:white}button{background:#44cfe3;color:#090d14;font-weight:700;cursor:pointer}#result{padding:20px 0;white-space:pre-wrap}footer{border-top:1px solid #334155;color:#aab8c9}header{display:flex;align-items:center;gap:12px}header svg{width:36px;height:36px}main{max-width:960px}form{padding:12px;background:#101824;border:1px solid #243449;border-radius:16px}button:disabled{opacity:.6}input:focus,button:focus-visible{outline:2px solid #44cfe3;outline-offset:3px}#result:not(:empty){margin-top:16px;padding:20px;border:1px solid #334155;border-radius:12px;background:#101824}.extensions{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.extensions span{border:1px solid #334155;border-radius:20px;padding:8px 16px;color:#aab8c9}@media(max-width:480px){main{padding-top:7vh}form button{width:100%}}</style><header><svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#151e2b"/><path d="M29 10H15L9 20H24L18 30H11M29 10L23 20H31L25 30H18" fill="none" stroke="#44cfe3" stroke-width="3" stroke-linejoin="round"/></svg> SLICKK DOMAINS</header><main><p>DOMAIN SEARCH · EARLY ACCESS</p><h1>Your next idea<br>starts with a <b>domain.</b></h1><p>Search for your preferred domain name using our registrar connection.</p><form id="search"><input id="domain" aria-label="Domain name" placeholder="yourbusiness.com" autocapitalize="none" autocomplete="off" spellcheck="false" required maxlength="253"><button>Search domain</button></form><div class="extensions" aria-label="Supported standard price estimates"><span>.com</span><span>.net</span><span>.org</span></div><div id="result" role="status" aria-live="polite"></div><p>Standard extension estimates exclude premium domains. Registration and checkout are not yet enabled. Availability is not a reservation.</p></main><footer>Slickk Domains · Developer preview · 010.3</footer><script>document.getElementById('search').addEventListener('submit',async e=>{e.preventDefault();const out=document.getElementById('result'),btn=e.target.querySelector('button');btn.disabled=true;out.textContent='Checking availability…';try{const r=await fetch('/api/search?domain='+encodeURIComponent(document.getElementById('domain').value));const j=await r.json();out.textContent=j.error||j.domain+(j.available?' is available.':' is unavailable.');if(j.diagnostic&&j.release==='010.3'){out.textContent+='\\nSupport code: '+j.diagnostic+' · 010.3';}if(j.pricing){out.textContent+='\\nEstimated standard registration: BDT '+(j.pricing.registrationMinor/100).toFixed(2)+' / year\\nEstimated renewal: BDT '+(j.pricing.renewalMinor/100).toFixed(2)+' / year (premium excluded)';}}catch{out.textContent='Search failed. Please retry.';}finally{btn.disabled=false;}});</script></html>`;
