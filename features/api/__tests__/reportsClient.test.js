// Run: node --test features/api/__tests__/
// Stubs global fetch to check the client's requests and unwrapping. The token is a placeholder string.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { makeReportsClient } from '../reportsClient.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const report = { id: 'r_1', createdAt: '2026-10-22T06:00:00.000Z', ciphertext: 'CT' };

function stubFetch(status, body) {
  const seen = [];
  globalThis.fetch = async (url, init) => {
    seen.push({ url, init });
    if (body === undefined) return new Response(null, { status });
    return Response.json(body, { status });
  };
  return seen;
}

test('createReport POSTs only { ciphertext } with Bearer token', async () => {
  const seen = stubFetch(201, { id: 'r_1', createdAt: report.createdAt });
  assert.deepEqual(await makeReportsClient('TOKEN').createReport('CT'), { id: 'r_1', createdAt: report.createdAt });
  assert.equal(seen[0].url, '/api/reports');
  assert.equal(seen[0].init.method, 'POST');
  assert.equal(seen[0].init.headers.Authorization, 'Bearer TOKEN');
  assert.equal(seen[0].init.headers['Content-Type'], 'application/json');
  assert.equal(seen[0].init.body, '{"ciphertext":"CT"}');
});

test('listReports unwraps { reports }', async () => {
  stubFetch(200, { reports: [report] });
  assert.deepEqual(await makeReportsClient('TOKEN').listReports(), [report]);
});

test('getReport / updateReport unwrap { report }', async () => {
  let seen = stubFetch(200, { report });
  assert.deepEqual(await makeReportsClient('TOKEN').getReport('r_1'), report);
  assert.equal(seen[0].url, '/api/reports/r_1');

  seen = stubFetch(200, { report: { ...report, ciphertext: 'CT2' } });
  assert.equal((await makeReportsClient('TOKEN').updateReport('r_1', 'CT2')).ciphertext, 'CT2');
  assert.equal(seen[0].init.method, 'PATCH');
  assert.equal(seen[0].init.body, '{"ciphertext":"CT2"}');
});

test('deleteReport handles 204 without parsing JSON', async () => {
  const seen = stubFetch(204);
  assert.equal(await makeReportsClient('TOKEN').deleteReport('r_1'), undefined);
  assert.equal(seen[0].init.method, 'DELETE');
  assert.equal(seen[0].init.body, undefined);
});

test('non-2xx throws Error with server message and status', async () => {
  stubFetch(403, { error: 'Only the original reporter can modify this report' });
  await assert.rejects(makeReportsClient('TOKEN').deleteReport('r_1'), (err) => {
    assert.equal(err.status, 403);
    assert.equal(err.message, 'Only the original reporter can modify this report');
    return true;
  });
});

test('no token: throws before any request is sent', async () => {
  const seen = stubFetch(200, { reports: [] });
  await assert.rejects(makeReportsClient(null).listReports(), /sign in/);
  assert.equal(seen.length, 0);
});
