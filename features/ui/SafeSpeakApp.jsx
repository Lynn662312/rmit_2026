'use client';
// OWNER: Role B (Frontend Lead)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.5 · Agent prompts: B1, B2
// Prop-driven only. Never import Tide, features/security or features/api directly.
//   security: object from useSafeSpeakSecurity()
//   api:      object from makeReportsClient(security.token)
import styles from './SafeSpeakApp.module.css';
import ReportForm from './ReportForm';
import ReviewPanel from './ReviewPanel';

export default function SafeSpeakApp({ security, api }) {
  // TODO(B): login notice / student form / reviewer list / decrypt button,
  // plus a visible "Demo uses synthetic data" disclaimer.
  return (
    <main className={styles.root}>
      <h1>SafeSpeak</h1>
      <ReportForm security={security} api={api} />
      <ReviewPanel security={security} api={api} />
    </main>
  );
}
