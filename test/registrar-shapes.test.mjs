import test from 'node:test';import assert from 'node:assert/strict';import {registrarMatch} from '../src/worker.mjs';
test('flat unavailable array',()=>assert.equal(registrarMatch(['google.com'],'google.com'),'google.com'));
test('flat available object array',()=>assert.equal(registrarMatch([{domain:'example.com',price:9.99}],'example.com').domain,'example.com'));
test('nested attributed domain',()=>assert.ok(registrarMatch({domain:{$t:'google.com'}},'google.com')));
test('unknown domain not matched',()=>assert.equal(registrarMatch(['other.com'],'google.com'),undefined));
