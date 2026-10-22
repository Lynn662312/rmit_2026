// OWNER: Role C (Backend + Integrator)
// Contract: docs/API_CONTRACT.md §0, §1, §2 (FROZEN v1.0)
// Server-only in-memory Map. Internally stores { id, createdAt, ciphertext, ownerSub }.
// ownerSub comes ONLY from a server-verified token and is never returned.
// No plaintext, no persistence: data is lost on restart/rebuild. Single process only.
import { randomUUID } from 'node:crypto';

// Kept on globalThis so both route modules (and dev hot reloads) share one Map.
const reports = globalThis.__safespeakReports ?? (globalThis.__safespeakReports = new Map());

// identity: { sub: string, isInvestigator: boolean } from verifyRequest().

function toPublic(record) {
  return { id: record.id, createdAt: record.createdAt, ciphertext: record.ciphertext };
}

function canView(record, identity) {
  return record.ownerSub === identity.sub || identity.isInvestigator === true;
}

function requireNonEmptyString(value, name) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

export function createReport({ ciphertext, ownerSub }) {
  requireNonEmptyString(ciphertext, 'ciphertext');
  requireNonEmptyString(ownerSub, 'ownerSub');
  const record = {
    id: `r_${randomUUID()}`,
    createdAt: new Date().toISOString(),
    ciphertext,
    ownerSub
  };
  reports.set(record.id, record);
  return { id: record.id, createdAt: record.createdAt };
}

// Owner sees their own reports; a verified investigator sees all.
export function listReports(identity) {
  const visible = [];
  for (const record of reports.values()) {
    if (canView(record, identity)) visible.push(toPublic(record));
  }
  return visible;
}

// Returns the public report, or null when missing OR hidden (caller sends 404).
export function getReport(id, identity) {
  const record = reports.get(id);
  if (!record || !canView(record, identity)) return null;
  return toPublic(record);
}

// Owner-only. Returns { status: 'ok', report } | { status: 'forbidden' } | { status: 'not_found' }.
// 'forbidden' only when the caller can view the report (investigator, non-owner).
export function updateReport(id, ciphertext, identity) {
  requireNonEmptyString(ciphertext, 'ciphertext');
  const record = reports.get(id);
  if (!record || !canView(record, identity)) return { status: 'not_found' };
  if (record.ownerSub !== identity.sub) return { status: 'forbidden' };
  record.ciphertext = ciphertext;
  return { status: 'ok', report: toPublic(record) };
}

// Owner-only. Returns { status: 'ok' | 'forbidden' | 'not_found' }.
export function deleteReport(id, identity) {
  const record = reports.get(id);
  if (!record || !canView(record, identity)) return { status: 'not_found' };
  if (record.ownerSub !== identity.sub) return { status: 'forbidden' };
  reports.delete(id);
  return { status: 'ok' };
}

// Test helper only: clears the in-memory Map.
export function _resetForTests() {
  reports.clear();
}
