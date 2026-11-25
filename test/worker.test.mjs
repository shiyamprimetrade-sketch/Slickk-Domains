import test from 'node:test';import assert from 'node:assert/strict';import worker,{validDomain} from '../src/worker.mjs';
test('domain validation',()=>{for(const d of ['example.com','a-b.co.uk'])assert.equal(validDomain(d),true);for(const d of ['https://example.com','-a.com','a..com','a.com/path','a.com&key=x'])assert.equal(validDomain(d),false)});
test('missing secret fails closed',async()=>{const r=await worker.fetch(new Request('https://example.com/api/search?domain=example.com'),{});assert.equal(r.status,503)});
test('reject writes',async()=>{assert.equal((await worker.fetch(new Request('https://example.com/',{method:'POST'}),{})).status,405)});
test('storefront',async()=>{const r=await worker.fetch(new Request('https://example.com/'),{});assert.equal(r.status,200);assert.match(await r.text(),/SLICKK DOMAINS/)});
