'use client';
// OWNER: Role B · Student submit view (ONE textarea).
// Flow: await security.encryptReport(text) FIRST, then api.createReport(ciphertext).
// Never send plaintext, title, category or user data to the backend.
import { useState } from 'react';
import styles from './SafeSpeakApp.module.css';

// Keeps the encrypted payload well under the API's 64 KiB body limit.
const MAX_CHARS = 8000;

export default function ReportForm({ security, api }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // idle | encrypting | sending
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const busy = status !== 'idle';
  const canSubmit = security.canEncrypt && text.trim().length > 0 && !busy;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSubmitted(null);
    try {
      setStatus('encrypting');
      const ciphertext = await security.encryptReport(text);
      if (typeof ciphertext !== 'string' || ciphertext.length === 0) {
        throw new Error('Encryption did not return ciphertext; nothing was sent.');
      }
      setStatus('sending');
      const created = await api.createReport(ciphertext);
      setSubmitted(created);
      setText('');
    } catch (err) {
      setError(err?.message || 'Submission failed');
    } finally {
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Submit a confidential report</h2>
      {!security.canEncrypt && (
        <p className={styles.notice}>Your account does not have permission to encrypt reports.</p>
      )}
      <label htmlFor="report-text" className={styles.label}>
        Describe what happened (synthetic example only)
      </label>
      <textarea
        id="report-text"
        className={styles.textarea}
        rows={8}
        maxLength={MAX_CHARS}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy || !security.canEncrypt}
        placeholder="e.g. A synthetic example: repeated unwanted comments in a tutorial group."
      />
      <div className={styles.formFooter}>
        <span className={styles.hint}>{text.length}/{MAX_CHARS}</span>
        <button type="submit" className={styles.primaryButton} disabled={!canSubmit}>
          {status === 'encrypting' ? 'Encrypting…' : status === 'sending' ? 'Sending…' : 'Encrypt and submit'}
        </button>
      </div>
      <div aria-live="polite">
        {error && <p className={styles.error} role="alert">{error}</p>}
        {submitted && (
          <p className={styles.success}>
            Report submitted (encrypted). Reference <code>{submitted.id}</code> at{' '}
            {new Date(submitted.createdAt).toLocaleString()}.
          </p>
        )}
      </div>
    </form>
  );
}
