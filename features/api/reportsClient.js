// OWNER: Role C (Backend + Integrator)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.4 · Agent prompt: C1
// Browser fetch wrapper for /api/reports. Ciphertext only, never plaintext.
// Throw meaningful errors on non-2xx. No hardcoded token or fake auth.

export function makeReportsClient(token) {
  return {
    createReport: async (ciphertext) => {
      // TODO(C): POST /api/reports with Bearer token -> { id, createdAt }
      throw new Error('createReport: not implemented');
    },
    listReports: async () => {
      // TODO(C): GET /api/reports with Bearer token -> [{ id, createdAt, ciphertext }]
      throw new Error('listReports: not implemented');
    }
  };
}
