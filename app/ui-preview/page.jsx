'use client';
// OWNER: Role B · TEMPORARY, UI PREVIEW ONLY: remove before final submission.
import { useMemo, useState } from 'react';
import SafeSpeakApp from '../../features/ui/SafeSpeakApp';
import { makeMockApi, makeMockSecurity } from '../../features/ui/dev/mockAdapters';

export default function UiPreviewPage() {
  const [role, setRole] = useState('reporter');
  const [authenticated, setAuthenticated] = useState(true);
  const [scenario, setScenario] = useState('normal');
  const baseSecurity = useMemo(() => makeMockSecurity(), []);
  const baseApi = useMemo(() => makeMockApi(), []);
  const fail = async () => { throw new Error('UI PREVIEW: simulated adapter failure. No real security or backend request was made.'); };
  const security = {
    ...baseSecurity, authenticated,
    token: `UI-PREVIEW:${role}:${authenticated}:${scenario}`,
    canEncrypt: role === 'reporter' || role === 'both',
    canDecrypt: role === 'reviewer' || role === 'both',
    login: async () => setAuthenticated(true),
    logout: async () => setAuthenticated(false),
    encryptReport: scenario === 'crypto-error' ? fail : scenario === 'invalid-payload' ? async () => '' : baseSecurity.encryptReport,
    decryptReport: scenario === 'crypto-error' ? fail : baseSecurity.decryptReport,
  };
  const api = {
    createReport: scenario === 'api-error' ? fail : baseApi.createReport,
    listReports: scenario === 'api-error' ? fail : scenario === 'empty' ? async () => [] : baseApi.listReports,
  };
  return <>
    <div style={{background:'#302b38',color:'#fff',padding:'12px 20px',font:'12px/1.6 system-ui',display:'flex',gap:16,flexWrap:'wrap',alignItems:'center'}}>
      <strong>UI PREVIEW ONLY · Simulated data, authentication & crypto</strong>
      <label>Preview role <select value={role} onChange={(event) => setRole(event.target.value)}><option value="reporter">Reporter</option><option value="reviewer">Reviewer</option><option value="restricted">No decrypt permission</option><option value="both">Both permissions</option></select></label>
      <label>Preview state <select value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="normal">Normal</option><option value="empty">Empty inbox</option><option value="api-error">API error</option><option value="crypto-error">Crypto error</option><option value="invalid-payload">Invalid encryption output</option></select></label>
    </div>
    <SafeSpeakApp security={security} api={api} />
  </>;
}
