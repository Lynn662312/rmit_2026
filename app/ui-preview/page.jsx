'use client';
// OWNER: Role B · TEMPORARY, UI PREVIEW ONLY: remove before final submission.
// Uses mock adapters: no real Tide login, encryption or access control.
import { useState } from 'react';
import SafeSpeakApp from '../../features/ui/SafeSpeakApp';
import { useMockApi, useMockSecurity } from '../../features/ui/dev/mockAdapters';

export default function UiPreviewPage() {
  const [canDecrypt, setCanDecrypt] = useState(true);
  const security = useMockSecurity({ canDecrypt });
  const api = useMockApi();

  return (
    <main>
      <div style={{ background: '#9b1c1c', color: '#fff', padding: '10px 16px', fontWeight: 700 }}>
        UI PREVIEW ONLY: mock login and fake &quot;encryption&quot;. Not a security demonstration.
        <label style={{ marginLeft: 16, fontWeight: 400 }}>
          <input type="checkbox" checked={canDecrypt} onChange={(e) => setCanDecrypt(e.target.checked)} />{' '}
          mock canDecrypt
        </label>
      </div>
      <SafeSpeakApp security={security} api={api} />
    </main>
  );
}
