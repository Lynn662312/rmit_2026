// Run: node --test features/api/__tests__/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readCiphertextBody, isValidReportId, emptyResponse, jsonResponse, MAX_BODY_BYTES } from '../http.js';

function post(body, contentType = 'application/json') {
  const headers = contentType ? { 'Content-Type': contentType } : {};
  return new Request('http://localhost/api/reports', { method: 'POST', headers, body });
}

test('accepts exactly { ciphertext: non-empty string }', async () => {
  assert.deepEqual(await readCiphertextBody(post('{"ciphertext":"CT"}')), { ok: true, ciphertext: 'CT' });
  assert.equal((await readCiphertextBody(post('{"ciphertext":"CT"}', 'application/json; charset=utf-8'))).ok, true);
});

test('rejects bad bodies with 400', async () => {
  const cases = [
    'not json',
    '[]',
    'null',
    '"CT"',
    '{}',
    '{"ciphertext":""}',
    '{"ciphertext":"   "}',
    '{"ciphertext":123}',
    '{"ciphertext":"CT","title":"plaintext"}',
    '{"text":"plaintext"}'
  ];
  for (const body of cases) {
    const result = await readCiphertextBody(post(body));
    assert.equal(result.status, 400, `expected 400 for ${body}`);
  }
});

test('rejects non-JSON content type with 400', async () => {
  assert.equal((await readCiphertextBody(post('{"ciphertext":"CT"}', 'text/plain'))).status, 400);
  assert.equal((await readCiphertextBody(post('{"ciphertext":"CT"}', null))).status, 400);
});

test('64 KiB limit: exactly at limit ok, one byte over is 413', async () => {
  const overhead = '{"ciphertext":""}'.length;
  const atLimit = JSON.stringify({ ciphertext: 'a'.repeat(MAX_BODY_BYTES - overhead) });
  assert.equal(Buffer.byteLength(atLimit), MAX_BODY_BYTES);
  assert.equal((await readCiphertextBody(post(atLimit))).ok, true);

  const over = JSON.stringify({ ciphertext: 'a'.repeat(MAX_BODY_BYTES - overhead + 1) });
  assert.equal((await readCiphertextBody(post(over))).status, 413);
});

test('report id format', () => {
  assert.equal(isValidReportId('r_6f1c2a3b-1234-4abc-8def-0123456789ab'), true);
  for (const bad of ['', 'r_123', '6f1c2a3b-1234-4abc-8def-0123456789ab', 'r_../etc', undefined]) {
    assert.equal(isValidReportId(bad), false);
  }
});

test('responses are no-store; 204 has an empty body', async () => {
  const empty = emptyResponse(204);
  assert.equal(empty.status, 204);
  assert.equal((await empty.arrayBuffer()).byteLength, 0);
  assert.equal(empty.headers.get('cache-control'), 'no-store');
  assert.equal(jsonResponse({ a: 1 }, 200).headers.get('cache-control'), 'no-store');
});
