// OWNER: Role C (Backend + Integrator)
// Contract: docs/API_CONTRACT.md §4 (FROZEN v1.0)
// Browser fetch wrapper for /api/reports. Pass ciphertext only, never plaintext:
// callers must run security.encryptReport(text) first.
// Non-2xx responses throw an Error with a user-safe message. No mock fallback.

const FALLBACK_MESSAGES = {
  400: 'The request was invalid.',
  401: 'Please sign in again.',
  403: 'You do not have permission to change this report.',
  404: 'Report not found.',
  413: 'The report is too large.',
  500: 'Server error. Please try again.',
  503: 'Authentication service is unavailable.'
};

async function toError(response) {
  let message;
  try {
    message = (await response.json())?.error;
  } catch {
    // non-JSON error body
  }
  const error = new Error(message || FALLBACK_MESSAGES[response.status] || `Request failed (${response.status})`);
  error.status = response.status;
  return error;
}

export function makeReportsClient(token) {
  async function request(path, { method = 'GET', ciphertext } = {}) {
    if (!token) throw new Error('Please sign in first.');

    const headers = { Authorization: `Bearer ${token}` };
    const init = { method, headers, cache: 'no-store' };
    if (ciphertext !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify({ ciphertext });
    }

    const response = await fetch(path, init);
    if (!response.ok) throw await toError(response);
    if (response.status === 204) return undefined;
    return response.json();
  }

  const reportPath = (id) => `/api/reports/${encodeURIComponent(id)}`;

  return {
    // => { id, createdAt }
    createReport: async (ciphertext) => request('/api/reports', { method: 'POST', ciphertext }),
    // => [{ id, createdAt, ciphertext }, ...]
    listReports: async () => (await request('/api/reports')).reports,
    // => { id, createdAt, ciphertext }
    getReport: async (id) => (await request(reportPath(id))).report,
    // => { id, createdAt, ciphertext }
    updateReport: async (id, ciphertext) => (await request(reportPath(id), { method: 'PATCH', ciphertext })).report,
    // => undefined after HTTP 204
    deleteReport: async (id) => { await request(reportPath(id), { method: 'DELETE' }); }
  };
}
