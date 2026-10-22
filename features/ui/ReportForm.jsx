'use client';
import { useRef, useState } from 'react';
import styles from './SafeSpeakApp.module.css';
import { Icon, Wisteria } from './Visuals';

export default function ReportForm({ security, api, onViewReports, viewReportsLabel = 'My reports' }) {
  const [text, setText] = useState('');
  const [stage, setStage] = useState('idle');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const submitting = useRef(false);
  const busy = stage === 'encrypting' || stage === 'sending';
  async function submit(event) {
    event.preventDefault();
    if (submitting.current || !text.trim() || !security.canEncrypt) return;
    submitting.current = true;
    setError(''); setStage('encrypting');
    try {
      const ciphertext = await security.encryptReport(text);
      if (typeof ciphertext !== 'string' || !ciphertext.trim()) throw new Error('Encryption did not return a valid payload. Your report was not sent.');
      setStage('sending');
      const result = await api.createReport(ciphertext);
      setReceipt(result); setText(''); setStage('success');
    } catch (failure) {
      setError(failure?.message || 'Unable to submit. Your draft is still here; please try again.'); setStage('idle');
    } finally { submitting.current = false; }
  }
  return <div className={styles.submitGrid}>
    <section className={styles.formCard} aria-labelledby={stage === 'success' ? 'receipt-heading' : 'report-heading'}>
      {stage === 'success' ? <div className={styles.success} role="status">
        <div className={styles.delivery}><span className={styles.envelope}><Icon name="mail" width="44" height="44" /></span><span className={styles.inbox} /></div>
        <span className={styles.successBadge}><Icon name="check" />Report received</span>
        <h2 id="receipt-heading">Your voice has a place here.</h2><p>Your encrypted report was submitted successfully.</p>
        <dl className={styles.receipt}><div><dt>Reference</dt><dd>{receipt?.id}</dd></div><div><dt>Submitted</dt><dd>{receipt?.createdAt ? new Date(receipt.createdAt).toLocaleString() : 'Just now'}</dd></div></dl>
        <p className={styles.helper}>This is a submission receipt, not a case tracking number.</p>
        <button className={styles.primaryButton} onClick={() => { setReceipt(null); setStage('idle'); }}>Write another report<Icon name="arrow" /></button>
        {onViewReports && <div className={styles.receiptHistoryLink}><button className={styles.secondaryButton} onClick={onViewReports}><Icon name="folder" />View {viewReportsLabel.toLowerCase()}</button></div>}
      </div> : <form onSubmit={submit} aria-busy={busy}>
        <div className={styles.cardHeading}><span className={styles.iconTile}><Icon name="write" /></span><div><h2 id="report-heading">Share what happened</h2><p>Start wherever feels comfortable.</p></div><span className={styles.smallBadge}><Icon name="lock" />Encrypted submission</span></div>
        <label className={styles.label} htmlFor="report-text">Your report</label>
        <p id="report-help" className={styles.fieldHelp}>For this demo, describe a fictional situation without personal details.</p>
        <textarea id="report-text" value={text} onChange={(event) => setText(event.target.value)} placeholder="You can start here, in your own words..." rows={9} required disabled={busy || !security.canEncrypt} aria-describedby={`report-help${error ? ' report-error' : ''}`} />
        <div className={styles.fieldFooter}><span><Icon name="lock" />Encrypted in your browser before sending</span><span>{text.length.toLocaleString()} characters</span></div>
        {error && <p id="report-error" className={styles.error} role="alert">{error}</p>}
        {!security.canEncrypt && <p className={styles.error}>Your account does not have permission to encrypt reports.</p>}
        <div className={styles.submitRow}><p>Please use fictional details for this demo.</p><button className={styles.primaryButton} disabled={busy || !text.trim() || !security.canEncrypt} type="submit">{busy && <span className={styles.spinner} />}{stage === 'encrypting' ? 'Encrypting…' : stage === 'sending' ? 'Submitting…' : 'Encrypt & submit'}{!busy && <Icon name="arrow" />}</button></div>
        <span className={styles.srOnly} role="status">{stage === 'encrypting' ? 'Encrypting report in your browser.' : stage === 'sending' ? 'Submitting encrypted report.' : ''}</span>
      </form>}
    </section>
    <aside className={styles.supportColumn}>
      <div className={styles.supportArt}><Wisteria /><div><span className={styles.eyebrow}>ONE STEP AT A TIME</span><h2>You don’t have to find<br />the perfect words.</h2><p>What you have to say matters.</p></div></div>
      <section className={styles.privacyCard}><span className={styles.iconTile}><Icon name="lock" /></span><h3>Care, built into the process.</h3><p>The server receives encrypted content. Decryption depends on TideCloak permissions.</p></section>
      <p className={styles.emergencyNote}>This prototype is not an emergency service or a monitored support channel.</p>
    </aside>
  </div>;
}
