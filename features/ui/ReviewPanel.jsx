'use client';
// OWNER: Role B · Investigator review view.
// Flow: api.listReports(), then show id + createdAt + ciphertext preview;
// call security.decryptReport(ciphertext) only when Decrypt is clicked.
// If !security.canDecrypt, show a disabled action. Show real SDK errors, never fabricated ones.
import { useCallback, useEffect, useState } from 'react';
import styles from './SafeSpeakApp.module.css';

const PREVIEW_CHARS = 60;

function preview(ciphertext) {
  return ciphertext.length > PREVIEW_CHARS ? `${ciphertext.slice(0, PREVIEW_CHARS)}…` : ciphertext;
}

export default function ReviewPanel({ security, api }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Per-report decrypt state: { [id]: { status: 'decrypting' | 'done' | 'error', plaintext, error } }
  const [decrypted, setDecrypted] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await api.listReports());
      setDecrypted({});
    } catch (err) {
      setError(err?.message || 'Could not load reports');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDecrypt(report) {
    setDecrypted((d) => ({ ...d, [report.id]: { status: 'decrypting' } }));
    try {
      const plaintext = await security.decryptReport(report.ciphertext);
      setDecrypted((d) => ({ ...d, [report.id]: { status: 'done', plaintext } }));
    } catch (err) {
      setDecrypted((d) => ({ ...d, [report.id]: { status: 'error', error: err?.message || 'Decryption failed' } }));
    }
  }

  function handleHide(id) {
    setDecrypted((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
  }

  return (
    <div>
      <div className={styles.panelHeader}>
        <h2>Encrypted reports</h2>
        <button type="button" className={styles.secondaryButton} onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      <p className={styles.hint}>
        Reporters see their own reports. Investigators see all reports. The server only holds ciphertext.
      </p>
      {!security.canDecrypt && (
        <p className={styles.notice}>No decrypt permission: this account can view ciphertext only.</p>
      )}

      <div aria-live="polite">
        {error && <p className={styles.error} role="alert">{error}</p>}
        {!loading && !error && reports.length === 0 && <p className={styles.empty}>No reports yet.</p>}
      </div>

      <ul className={styles.reportList}>
        {reports.map((report) => {
          const state = decrypted[report.id];
          return (
            <li key={report.id} className={styles.reportItem}>
              <div className={styles.reportMeta}>
                <code>{report.id}</code>
                <time dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleString()}</time>
              </div>
              <p className={styles.ciphertext} title="Encrypted payload as stored on the server">
                {preview(report.ciphertext)}
              </p>
              {state?.status === 'done' ? (
                <div className={styles.plaintext}>
                  <p>{state.plaintext}</p>
                  <button type="button" className={styles.linkButton} onClick={() => handleHide(report.id)}>
                    Hide
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => handleDecrypt(report)}
                  disabled={!security.canDecrypt || state?.status === 'decrypting'}
                >
                  {state?.status === 'decrypting' ? 'Decrypting…' : 'Decrypt'}
                </button>
              )}
              {state?.status === 'error' && (
                <p className={styles.error} role="alert">Decryption failed: {state.error}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
