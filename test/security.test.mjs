import test from 'node:test';import assert from 'node:assert/strict';import worker from '../src/worker.mjs';
const req=()=>new Request('https://example.com/api/search?domain=example.com',{headers:{'CF-Connecting-IP':'192.0.2.1'}});
test('missing limiter fails closed',async()=>assert.equal((await worker.fetch(req(),{NAMESILO_API_KEY:'test'})).status,503));
test('rate limit rejects before registrar call',async()=>assert.equal((await worker.fetch(req(),{NAMESILO_API_KEY:'test',SEARCH_LIMITER:{limit:async()=>({success:false})}})).status,429));
test('limiter failure fails closed',async()=>assert.equal((await worker.fetch(req(),{NAMESILO_API_KEY:'test',SEARCH_LIMITER:{limit:async()=>{throw Error()}}})).status,503));
