'use client';
// OWNER: Role B (Frontend). Backup implementation written by C on feature/integration.
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.5 · docs/API_CONTRACT.md §4
// Prop-driven only. Never import Tide, features/security or features/api directly.
//   security: object from useSafeSpeakSecurity()
//   api:      object from makeReportsClient(security.token)
import { useState } from 'react';
import styles from './SafeSpeakApp.module.css';
import ReportForm from './ReportForm';
import ReviewPanel from './ReviewPanel';

const TABS = [
  { id: 'submit', label: 'Submit a report' },
  { id: 'review', label: 'Reports' }
];

export default function SafeSpeakApp({ security, api }) {
  const [tab, setTab] = useState('submit');
  const [authError, setAuthError] = useState('');

  async function run(action) {
    setAuthError('');
    try {
      await action();
    } catch (err) {
      setAuthError(err?.message || 'Sign-in failed');
    }
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.brand}>SafeSpeak</h1>
          <p className={styles.tagline}>Confidential campus reporting</p>
        </div>
        {security.authenticated ? (
          <button type="button" className={styles.secondaryButton} onClick={() => run(security.logout)}>
            Sign out
          </button>
        ) : (
          <button type="button" className={styles.primaryButton} onClick={() => run(security.login)}>
            Sign in with Tide
          </button>
        )}
      </header>

      <p className={styles.disclaimer} role="note">
        Demo uses synthetic data only. Do not enter real names, contact details or incidents.
      </p>

      <section className={styles.intro}>
        <h2>How your report is protected</h2>
        <p>
          Your report is encrypted in this browser with TideCloak before it is sent. The server stores
          only the encrypted text. Decryption is attempted in the browser and only succeeds for accounts
          that TideCloak permits.
        </p>
      </section>

      {authError && <p className={styles.error} role="alert">{authError}</p>}

      {!security.authenticated ? (
        <section className={styles.card}>
          <h2>Sign in to continue</h2>
          <p>You need to sign in with your Tide account to submit or review reports.</p>
        </section>
      ) : (
        <>
          <nav className={styles.tabs} role="tablist" aria-label="SafeSpeak views">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                className={tab === t.id ? styles.tabActive : styles.tab}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <section id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className={styles.card}>
            {tab === 'submit' ? (
              <ReportForm security={security} api={api} />
            ) : (
              <ReviewPanel security={security} api={api} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
