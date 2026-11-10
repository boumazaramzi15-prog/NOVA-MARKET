import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/server.js';
import http from 'node:http';

async function withServer(run) {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  try {
    await run('http://127.0.0.1:' + server.address().port);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('health endpoint reports checkout disabled and database state', async () => {
  await withServer(async base => {
    const response = await fetch(base + '/api/health');
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.checkoutEnabled, false);
    assert.equal(body.service, 'nova-market-api');
    assert.equal(body.databaseConfigured, false);
  });
});

test('checkout is safely disabled', async () => {
  await withServer(async base => {
    const response = await fetch(base + '/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({})
    });
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.error, 'checkout_disabled');
  });
});

test('catalogue endpoint fails closed when no database is configured', async () => {
  await withServer(async base => {
    const response = await fetch(base + '/api/products?lang=en');
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.error, 'database_not_configured');
  });
});

test('admin endpoints fail closed when no database is configured', async () => {
  await withServer(async base => {
    const response = await fetch(base + '/api/admin/products');
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.equal(body.error, 'database_not_configured');
  });
});
