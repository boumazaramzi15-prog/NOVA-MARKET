import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/server.js';
import http from 'node:http';

test('health endpoint reports checkout disabled', async () => {
  const server=http.createServer(app);
  await new Promise(resolve=>server.listen(0,resolve));
  try {
    const port=server.address().port;
    const response=await fetch(`http://127.0.0.1:${port}/api/health`);
    const body=await response.json();
    assert.equal(response.status,200);
    assert.equal(body.checkoutEnabled,false);
    assert.equal(body.service,'nova-market-api');
  } finally { await new Promise(resolve=>server.close(resolve)); }
});

test('checkout is safely disabled', async () => {
  const server=http.createServer(app);
  await new Promise(resolve=>server.listen(0,resolve));
  try {
    const response=await fetch(`http://127.0.0.1:${server.address().port}/api/checkout`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({})});
    const body=await response.json();
    assert.equal(response.status,503);
    assert.equal(body.error,'checkout_disabled');
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
