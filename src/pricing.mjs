// All money inputs and outputs are integer minor units; markup is basis points.
export function quote(usdCents, bdtPerUsdMinor, markupBps, feeMinor=0) {
 for(const x of [usdCents,bdtPerUsdMinor,markupBps,feeMinor]) if(!Number.isSafeInteger(x)||x<0) throw new RangeError("Invalid pricing input");
 if(!usdCents||!bdtPerUsdMinor||markupBps>100000) throw new RangeError("Invalid pricing policy");
 const ceil=(a,b)=>(a+b-1n)/b;
 const cost=ceil(BigInt(usdCents)*BigInt(bdtPerUsdMinor),100n)+BigInt(feeMinor);
 const retail=ceil(cost*(10000n+BigInt(markupBps)),10000n);
 if(retail>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError("Price overflow");
 return {currency:"BDT",costMinor:Number(cost),retailMinor:Number(retail),grossProfitMinor:Number(retail-cost)};
}
export function quotePair({registrationCents,renewalCents},policy){
 const calc=x=>quote(x,policy.bdtPerUsdMinor,policy.markupBps,policy.feeMinor??0).retailMinor;
 return {currency:"BDT",registrationMinor:calc(registrationCents),renewalMinor:calc(renewalCents)};
}
