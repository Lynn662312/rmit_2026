'use client';
// OWNER: Role B · UI PREVIEW ONLY: NOT real crypto or access control.
// Used solely by app/ui-preview/page.jsx. Remove before final submission.
// Shapes match §3.3 (security) and API_CONTRACT.md §4 (api).
import { useMemo, useState } from 'react';

const MOCK_PREFIX = 'MOCK-NOT-ENCRYPTED:';

// Base64 so the preview "looks" opaque. This is NOT encryption.
function toBase64(text) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

function fromBase64(value) {
  return new TextDecoder().decode(Uint8Array.from(atob(value), (c) => c.charCodeAt(0)));
}

export function useMockSecurity({ canEncrypt = true, canDecrypt = true } = {}) {
  const [authenticated, setAuthenticated] = useState(false);
  return {
    authenticated,
    login: async () => setAuthenticated(true),
    logout: async () => setAuthenticated(false),
    token: authenticated ? 'mock-preview-token' : null,
    canEncrypt,
    canDecrypt,
    encryptReport: async (text) => MOCK_PREFIX + toBase64(text),
    decryptReport: async (ciphertext) => {
      if (!canDecrypt) throw new Error('MOCK: no decrypt permission');
      if (!ciphertext.startsWith(MOCK_PREFIX)) throw new Error('MOCK: unknown payload');
      return fromBase64(ciphertext.slice(MOCK_PREFIX.length));
    }
  };
}

export function useMockApi() {
  return useMemo(() => {
    const reports = [];
    return {
      createReport: async (ciphertext) => {
        const report = { id: `r_mock_${reports.length + 1}`, createdAt: new Date().toISOString(), ciphertext };
        reports.unshift(report);
        return { id: report.id, createdAt: report.createdAt };
      },
      listReports: async () => reports.map((r) => ({ ...r })),
      getReport: async (id) => ({ ...reports.find((r) => r.id === id) }),
      updateReport: async () => { throw new Error('MOCK: not implemented'); },
      deleteReport: async () => { throw new Error('MOCK: not implemented'); }
    };
  }, []);
}
