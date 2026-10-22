'use client';
// Role B: temporary simulated preview. The production entry imports SafeSpeakApp directly.
import { useMemo, useState } from 'react';
import SafeSpeakApp from '../../features/ui/SafeSpeakApp';
import RoleMenu from '../../features/ui/RoleMenu';
import { makeMockApi, makeMockSecurity } from '../../features/ui/dev/mockAdapters';

export default function UiPreviewPage() {
  const [role, setRole] = useState('reporter');
  const [authenticated, setAuthenticated] = useState(true);
  const baseSecurity = useMemo(() => makeMockSecurity(), []);
  const api = useMemo(() => makeMockApi(), []);
  const security = {
    ...baseSecurity,
    authenticated,
    token: authenticated ? `UI-PREVIEW-${role}-NOT-A-REAL-TOKEN` : null,
    canEncrypt: role === 'reporter',
    canDecrypt: role === 'investigator',
    login: async () => setAuthenticated(true),
    logout: async () => setAuthenticated(false),
  };
  return <>
    <SafeSpeakApp security={security} api={api} headerNavigation={<RoleMenu value={role} onChange={setRole} roles={[
      { id:'reporter', label:'Student / Reporter', description:'Write and submit an encrypted report' },
      { id:'investigator', label:'Investigator', description:'Review reports and request decryption' },
      { id:'admin', label:'School Admin', description:'View permitted ciphertext without decryption' },
    ]} />} />
    <p role="note" style={{margin:0,padding:'12px 20px',textAlign:'center',background:'#f1ecf6',color:'#65536f',font:'12px/1.6 system-ui'}}>
      UI preview only · Simulated data, sign-in and encryption. Not connected to the real backend.
    </p>
  </>;
}
