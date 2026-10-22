'use client';
// OWNER: Role C · FINAL composition only (build guide §3.6).
// If the starter redirects somewhere other than /home after login, move this file there.
import { useMemo } from 'react';
import SafeSpeakApp from '../../features/ui/SafeSpeakApp';
import { useSafeSpeakSecurity } from '../../features/security/useSafeSpeakSecurity';
import { makeReportsClient } from '../../features/api/reportsClient';

export default function HomePage() {
  const security = useSafeSpeakSecurity();
  const api = useMemo(() => makeReportsClient(security.token), [security.token]);
  return <SafeSpeakApp security={security} api={api} />;
}
