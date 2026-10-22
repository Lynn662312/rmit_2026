// Run: node --test features/api/__tests__/
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createReport, listReports, getReport, updateReport, deleteReport, _resetForTests
} from '../reportStore.js';

const alice = { sub: 'sub-alice', isInvestigator: false };
const bob = { sub: 'sub-bob', isInvestigator: false };
const investigator = { sub: 'sub-inv', isInvestigator: true };

beforeEach(() => _resetForTests());

test('create returns only id + createdAt', () => {
  const created = createReport({ ciphertext: 'CT1', ownerSub: alice.sub });
  assert.deepEqual(Object.keys(created).sort(), ['createdAt', 'id']);
  assert.match(created.id, /^r_[0-9a-f-]{36}$/);
  assert.equal(new Date(created.createdAt).toISOString(), created.createdAt);
});

test('create rejects empty ciphertext or missing ownerSub', () => {
  assert.throws(() => createReport({ ciphertext: '', ownerSub: alice.sub }));
  assert.throws(() => createReport({ ciphertext: 'CT', ownerSub: undefined }));
  assert.equal(listReports(investigator).length, 0);
});

test('public records never expose ownerSub', () => {
  const { id } = createReport({ ciphertext: 'CT1', ownerSub: alice.sub });
  const all = [...listReports(alice), getReport(id, alice), updateReport(id, 'CT2', alice).report];
  for (const report of all) {
    assert.deepEqual(Object.keys(report).sort(), ['ciphertext', 'createdAt', 'id']);
    assert.ok(!JSON.stringify(report).includes(alice.sub));
  }
});

test('reporters list only their own; investigator lists all', () => {
  createReport({ ciphertext: 'A1', ownerSub: alice.sub });
  createReport({ ciphertext: 'B1', ownerSub: bob.sub });
  assert.deepEqual(listReports(alice).map((r) => r.ciphertext), ['A1']);
  assert.deepEqual(listReports(bob).map((r) => r.ciphertext), ['B1']);
  assert.deepEqual(listReports({ sub: 'sub-admin', isInvestigator: false }), []);
  assert.deepEqual(listReports(investigator).map((r) => r.ciphertext), ['A1', 'B1']);
});

test('get: owner and investigator can read; other user gets null (404)', () => {
  const { id } = createReport({ ciphertext: 'A1', ownerSub: alice.sub });
  assert.equal(getReport(id, alice).ciphertext, 'A1');
  assert.equal(getReport(id, investigator).ciphertext, 'A1');
  assert.equal(getReport(id, bob), null);
  assert.equal(getReport('r_00000000-0000-0000-0000-000000000000', alice), null);
});

test('update: owner only; id and createdAt unchanged', () => {
  const { id, createdAt } = createReport({ ciphertext: 'A1', ownerSub: alice.sub });
  assert.deepEqual(updateReport(id, 'X', bob), { status: 'not_found' });
  assert.deepEqual(updateReport(id, 'X', investigator), { status: 'forbidden' });
  assert.equal(getReport(id, alice).ciphertext, 'A1');

  const result = updateReport(id, 'A2', alice);
  assert.equal(result.status, 'ok');
  assert.deepEqual(result.report, { id, createdAt, ciphertext: 'A2' });
});

test('delete: owner only; second delete is not_found', () => {
  const { id } = createReport({ ciphertext: 'A1', ownerSub: alice.sub });
  assert.deepEqual(deleteReport(id, bob), { status: 'not_found' });
  assert.deepEqual(deleteReport(id, investigator), { status: 'forbidden' });
  assert.deepEqual(deleteReport(id, alice), { status: 'ok' });
  assert.equal(getReport(id, alice), null);
  assert.deepEqual(deleteReport(id, alice), { status: 'not_found' });
});
