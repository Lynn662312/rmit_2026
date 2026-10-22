'use client';
// OWNER: Role B · Investigator review view.
// Flow: api.listReports(), then show id + createdAt + ciphertext preview;
// call security.decryptReport(ciphertext) only when Decrypt is clicked.
// If !security.canDecrypt, show a disabled action. Show real SDK errors, never fabricated ones.

export default function ReviewPanel({ security, api }) {
  // TODO(B)
  return null;
}
