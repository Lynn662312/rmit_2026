'use client';

import { makeReportsClient } from '../../features/api/reportsClient';
import { useSafeSpeakSecurity } from '../../features/security/useSafeSpeakSecurity';
import SafeSpeakApp from '../../features/ui/SafeSpeakApp';

export default function HomePage() {
  const security = useSafeSpeakSecurity();
  const api = makeReportsClient(security.token);

  return <SafeSpeakApp security={security} api={api} />;
}
