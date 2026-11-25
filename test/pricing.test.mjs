import test from 'node:test';import assert from 'node:assert/strict';import {quote,quotePair} from '../src/pricing.mjs';
test('markup and fees',()=>assert.deepEqual(quote(1000,12500,2500,5000),{currency:'BDT',costMinor:130000,retailMinor:162500,grossProfitMinor:32500}));
test('round upward',()=>assert.equal(quote(1,12345,1).retailMinor,125));
test('reject invalid values',()=>{for(const x of [0,-1,NaN,1.5,Infinity])assert.throws(()=>quote(x,12500,2500));});
test('separate renewal and registration without wholesale exposure',()=>assert.deepEqual(quotePair({registrationCents:1000,renewalCents:1500},{bdtPerUsdMinor:12500,markupBps:2000}),{currency:'BDT',registrationMinor:150000,renewalMinor:225000}));
test('overflow rejected',()=>assert.throws(()=>quote(Number.MAX_SAFE_INTEGER,12500,2500)));
