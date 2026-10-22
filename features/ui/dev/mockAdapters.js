// OWNER: Role B · UI PREVIEW ONLY: NOT real crypto or access control.
// Used solely by app/ui-preview/page.jsx. Remove before final submission.
// Must match the shapes in §3.3 (security) and §3.4 (api).

export function makeMockSecurity() {
  return {
    authenticated: true,
    token: 'UI-PREVIEW-NOT-A-REAL-TOKEN',
    canEncrypt: true,
    canDecrypt: false,
    login: async () => {},
    logout: async () => {},
    encryptReport: async () => { await delay(); return `UI-PREVIEW-NOT-ENCRYPTED:${Date.now()}`; },
    decryptReport: async () => { await delay(); return 'FICTIONAL UI SAMPLE: A student was repeatedly excluded during a fictional group activity. This text is a preview fixture, not a decrypted report.'; },
  };
}

export function makeMockApi() {
  const reports = [
    { id:'r_preview_01', createdAt:'2026-10-22T06:00:00.000Z', ciphertext:'UI-PREVIEW-NOT-ENCRYPTED: sample payload 01. Real TideCloak ciphertext will appear here after integration.' },
    { id:'r_preview_02', createdAt:'2026-10-22T05:30:00.000Z', ciphertext:'UI-PREVIEW-NOT-ENCRYPTED: sample payload 02.' },
  ];
  return {
    createReport: async (ciphertext) => {
      await delay();
      const record = { id:`r_preview_${reports.length + 1}`, createdAt:new Date().toISOString(), ciphertext };
      reports.unshift(record);
      return { id:record.id, createdAt:record.createdAt };
    },
    listReports: async () => { await delay(); return [...reports]; },
  };
}

function delay() { return new Promise((resolve) => setTimeout(resolve, 450)); }
