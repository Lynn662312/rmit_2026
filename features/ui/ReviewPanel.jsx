'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './SafeSpeakApp.module.css';
import { Icon } from './Visuals';

export default function ReviewPanel({ security, api }) {
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [decryptError, setDecryptError] = useState('');
  const [plaintext, setPlaintext] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);
  const generation = useRef(0);
  const mounted = useRef(false);
  const listRequest = useRef(0);
  const apiRef = useRef(api);
  apiRef.current = api;
  const selected = reports.find((report) => report.id === selectedId);
  function clearContent() {
    generation.current += 1;
    setPlaintext(null); setDecryptError(''); setDecrypting(false);
  }
  async function loadReports() {
    const request = ++listRequest.current;
    clearContent(); setLoading(true); setListError('');
    try {
      const records = await apiRef.current.listReports();
      if (!mounted.current || request !== listRequest.current) return;
      if (!Array.isArray(records)) throw new Error('The server returned an invalid report list.');
      setReports(records);
      setSelectedId((previous) => records.some((record) => record.id === previous) ? previous : records[0]?.id || null);
    } catch (error) {
      if (mounted.current && request === listRequest.current) { setListError(error?.message || 'Unable to load reports. Please try again.'); setReports([]); setSelectedId(null); }
    } finally { if (mounted.current && request === listRequest.current) setLoading(false); }
  }
  useEffect(() => {
    mounted.current = true;
    loadReports();
    return () => { mounted.current = false; generation.current += 1; listRequest.current += 1; };
  }, [security.token]); // Do not reload when the integration creates a fresh API object.
  useEffect(() => { clearContent(); }, [security.canDecrypt]);
  async function decrypt() {
    if (!security.canDecrypt || !selected || decrypting) return;
    const current = ++generation.current;
    setPlaintext(null); setDecryptError(''); setDecrypting(true);
    try {
      const content = await security.decryptReport(selected.ciphertext);
      if (typeof content !== 'string') throw new Error('Decryption did not return readable report text.');
      if (mounted.current && current === generation.current) setPlaintext(content);
    } catch (error) {
      if (mounted.current && current === generation.current) setDecryptError(error?.message || 'Decryption failed. Please check your permissions and try again.');
    } finally { if (mounted.current && current === generation.current) setDecrypting(false); }
  }
  return <section className={`${styles.reviewGrid} ${mobileDetail ? styles.showDetail : ''}`} aria-label="Report review workspace">
    <div className={styles.reportList}>
      <div className={styles.listHeading}><div><h2>Report inbox</h2><p>{loading ? 'Loading reports…' : `${reports.length} encrypted report${reports.length === 1 ? '' : 's'}`}</p></div><button className={styles.iconButton} disabled={loading} onClick={loadReports} aria-label="Refresh reports"><Icon name="refresh" /></button></div>
      {listError && <div className={styles.listMessage}><p className={styles.error} role="alert">{listError}</p><button className={styles.secondaryButton} onClick={loadReports}>Try again</button></div>}
      {loading && <p className={styles.listMessage} role="status">Loading encrypted reports…</p>}
      {!loading && !listError && reports.length === 0 && <div className={styles.empty}><Icon name="mail" width="36" height="36" /><h3>A quiet inbox.</h3><p>Submitted reports will appear here.</p></div>}
      {!loading && <ul className={styles.reportItems}>{reports.map((report) => <li key={report.id}><button className={`${styles.reportItem} ${selectedId === report.id ? styles.selectedReport : ''}`} aria-current={selectedId === report.id ? 'true' : undefined} onClick={() => { clearContent(); setSelectedId(report.id); setMobileDetail(true); }}><span className={styles.reportIcon}><Icon name="mail" /></span><span><strong>{report.id}</strong><time dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleString()}</time><span className={styles.encryptedLabel}><Icon name="lock" width="12" height="12" />Encrypted content</span></span><Icon name="arrow" width="16" height="16" /></button></li>)}</ul>}
    </div>
    <div className={styles.reportDetail} aria-busy={decrypting}>
      <button className={`${styles.textButton} ${styles.mobileBack}`} onClick={() => { clearContent(); setMobileDetail(false); }}><Icon name="back" />Back to inbox</button>
      {!selected || loading ? <div className={styles.empty}><span className={styles.largeIcon}><Icon name="folder" width="32" height="32" /></span><h2>A space for careful listening.</h2><p>{loading ? 'Retrieving encrypted reports…' : 'Select a report to see its encrypted content.'}</p></div> : <>
        <div className={styles.detailHeading}><span className={styles.iconTile}><Icon name="mail" /></span><div><span className={styles.eyebrow}>CONFIDENTIAL REPORT</span><h2>{selected.id}</h2><time dateTime={selected.createdAt}>{new Date(selected.createdAt).toLocaleString()}</time></div></div>
        <div className={styles.contentHeading}><h3>{plaintext !== null && security.canDecrypt ? 'Report content' : 'Encrypted content'}</h3><span className={styles.smallBadge}><Icon name="lock" />{plaintext !== null && security.canDecrypt ? 'Decrypted for this session' : 'Ciphertext'}</span></div>
        {plaintext !== null && security.canDecrypt ? <div className={styles.plaintext}>{plaintext}</div> : <pre className={styles.ciphertext}>{selected.ciphertext}</pre>}
        <p className={styles.helper}>{plaintext !== null && security.canDecrypt ? 'Hide this content before leaving your screen. It is not saved by this interface.' : 'This is the encrypted payload. Report text is revealed only after a permitted decryption.'}</p>
        {!security.canDecrypt && <p className={styles.permissionNotice}><Icon name="lock" />No decrypt permission. Reports returned for your account remain encrypted.</p>}
        {decryptError && <p className={styles.error} role="alert">{decryptError}</p>}
        <div className={styles.detailActions}>{plaintext !== null && security.canDecrypt ? <button className={styles.secondaryButton} onClick={clearContent}>Hide report content</button> : <button className={styles.primaryButton} disabled={!security.canDecrypt || decrypting} onClick={decrypt}>{decrypting ? <span className={styles.spinner} /> : <Icon name="eye" />}{decrypting ? 'Decrypting…' : 'Decrypt report'}</button>}</div>
        <p className={styles.reviewFootnote}>The server determines which reports you can view. Decryption depends on TideCloak permissions and data sharing. A disabled button is not proof of an SDK denial.</p>
      </>}
      <span className={styles.srOnly} role="status">{decrypting ? 'Decrypting report.' : plaintext !== null ? 'Report decrypted.' : ''}</span>
    </div>
  </section>;
}
