// Run: node --test features/api/__tests__/
// Exercises the real route handlers and the real verifier adapter (no mock auth).
// Before A's starter is merged the SDK/config are absent, so a token is rejected with 503.
// After the merge an invalid token is rejected with 401. Either way nothing is stored.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as collection from '../../../app/api/reports/route.js';
import * as item from '../../../app/api/reports/[id]/route.js';
import { listReports, _resetForTests } from '../reportStore.js';

const ID = 'r_6f1c2a3b-1234-4abc-8def-0123456789ab';
const params = { params: Promise.resolve({ id: ID }) };
const body = JSON.stringify({ ciphertext: 'CT' });

function req(method, headers = {}, withBody = false) {
  const init = { method, headers: withBody ? { 'Content-Type': 'application/json', ...headers } : headers };
  if (withBody) init.body = body;
  return new Request(`http://localhost/api/reports/${ID}`, init);
}

const calls = [
  ['POST /api/reports', (h) => collection.POST(req('POST', h, true))],
  ['GET /api/reports', (h) => collection.GET(req('GET', h))],
  ['GET /api/reports/:id', (h) => item.GET(req('GET', h), params)],
  ['PATCH /api/reports/:id', (h) => item.PATCH(req('PATCH', h, true), params)],
  ['DELETE /api/reports/:id', (h) => item.DELETE(req('DELETE', h), params)]
];

beforeEach(() => _resetForTests());

test('route modules use the Node.js runtime and export the frozen methods', () => {
  assert.equal(collection.runtime, 'nodejs');
  assert.equal(item.runtime, 'nodejs');
  assert.deepEqual(['GET', 'POST'].map((m) => typeof collection[m]), ['function', 'function']);
  assert.deepEqual(['GET', 'PATCH', 'DELETE'].map((m) => typeof item[m]), ['function', 'function', 'function']);
});

test('missing or non-Bearer Authorization -> 401 JSON error on every endpoint', async () => {
  for (const headers of [{}, { Authorization: 'Basic abc' }, { Authorization: 'Bearer' }]) {
    for (const [name, call] of calls) {
      const res = await call(headers);
      assert.equal(res.status, 401, `${name} with ${JSON.stringify(headers)}`);
      assert.equal(typeof (await res.json()).error, 'string');
      assert.equal(res.headers.get('cache-control'), 'no-store');
    }
  }
});

test('browser-supplied identity fields are not trusted', async () => {
  const res = await collection.GET(req('GET', { 'X-User-Id': 'sub-alice', 'X-Role': 'investigator' }));
  assert.equal(res.status, 401);
});

test('unverifiable token fails closed (401 or 503), never 2xx, nothing stored', async () => {
  for (const [name, call] of calls) {
    const res = await call({ Authorization: 'Bearer not-a-real-token' });
    assert.ok([401, 503].includes(res.status), `${name} returned ${res.status}`);
    assert.equal(typeof (await res.json()).error, 'string');
  }
  assert.equal(listReports({ sub: 'x', isInvestigator: true }).length, 0);
});
