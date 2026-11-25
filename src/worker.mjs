const headers={"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"};
export function validDomain(s){return typeof s==="string"&&s.length<=253&&s.split(".").length>=2&&s.split(".").every(x=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(x))&&/^[a-z]{2,63}$/.test(s.split(".").pop());}
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers});
export default {async fetch(req,env){
 const u=new URL(req.url);
 if(req.method!=="GET")return json({error:"Method not allowed"},405);
 if(u.pathname==="/api/search"){
 const d=(u.searchParams.get("domain")||"").trim().toLowerCase();
 if(!validDomain(d))return json({error:"Enter a valid ASCII domain name."},400);
 if(!env.NAMESILO_API_KEY)return json({error:"Registrar not configured."},503);
 try{
 const q=new URL("https://www.namesilo.com/api/checkRegisterAvailability");
 q.search=new URLSearchParams({version:"1",type:"json",key:env.NAMESILO_API_KEY,domains:d}).toString();
 const r=await fetch(q,{redirect:"error",signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error();
 const a=(await r.json()).reply;
 if(String(a?.code)!=="300")throw Error();
 const match=x=>[x?.domain].flat().find(v=>typeof v==="string"?v===d:v?.domain===d||v?.["#text"]===d);
 const yes=match(a.available),no=match(a.unavailable);
 if(!yes&&!no)throw Error();
 return json({domain:d,available:!!yes});
 }catch{return json({error:"Registrar lookup unavailable. Try again later."},502);}
 }
 if(u.pathname!=="/")return json({error:"Not found"},404);
 return new Response(page,{headers:{"content-type":"text/html; charset=utf-8","x-content-type-options":"nosniff","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"}});
}};
const page=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Slickk Domains</title><style>*{box-sizing:border-box}body{margin:0;background:#090d14;color:#f4f8fc;font:16px system-ui}main,header,footer{max-width:960px;margin:auto;padding:24px}header{font-weight:800;letter-spacing:2px}b{color:#44cfe3}main{padding-top:12vh;padding-bottom:12vh}h1{font-size:clamp(36px,7vw,72px);line-height:1.05}p{color:#aab8c9;line-height:1.6}form{display:flex;flex-wrap:wrap;gap:10px}input,button{font:inherit;padding:16px;border-radius:10px;border:1px solid #334155}input{flex:1;min-width:200px;background:#151e2b;color:white}button{background:#44cfe3;color:#090d14;font-weight:700;cursor:pointer}#result{padding:20px 0;white-space:pre-wrap}footer{border-top:1px solid #334155;color:#aab8c9}</style><header><b>S</b> SLICKK DOMAINS</header><main><p>DOMAIN SEARCH · EARLY ACCESS</p><h1>Your next idea<br>starts with a <b>domain.</b></h1><p>Search for your preferred domain name using our registrar connection.</p><form id="search"><input id="domain" aria-label="Domain name" placeholder="yourbusiness.com" required maxlength="253"><button>Search domain</button></form><div id="result" role="status" aria-live="polite"></div><p>Registration, pricing and checkout are not yet enabled. Availability is not a reservation.</p></main><footer>Slickk Domains · Developer preview</footer><script>document.getElementById('search').addEventListener('submit',async e=>{e.preventDefault();const out=document.getElementById('result'),btn=e.target.querySelector('button');btn.disabled=true;out.textContent='Checking availability…';try{const r=await fetch('/api/search?domain='+encodeURIComponent(document.getElementById('domain').value));const j=await r.json();out.textContent=j.error||j.domain+(j.available?' is available.':' is unavailable.');}catch{out.textContent='Search failed. Please retry.';}finally{btn.disabled=false;}});</script></html>`;
