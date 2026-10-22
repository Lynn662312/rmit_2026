'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Visuals';
import styles from './SafeSpeakApp.module.css';

function isReport(record) {
  return record && typeof record.id === 'string' && typeof record.createdAt === 'string' && typeof record.ciphertext === 'string';
}

function Failure({ error, onRetry, onSignIn }) {
  const message = error.status === 404
    ? 'This report is no longer available to this account. Refresh the list to continue.'
    : error.message || 'Unable to retrieve reports. Please try again.';
  return <div><p className={styles.error} role="alert">{message}</p><div className={styles.historyActions}>
    {error.status === 401 && onSignIn && <button className={styles.secondaryButton} onClick={onSignIn}>Sign in again</button>}
    <button className={styles.secondaryButton} onClick={onRetry}>Try again</button>
  </div></div>;
}

// Only consumes the frozen client contract. The server determines ownership;
// no role, owner id, plaintext, or client-side filtering is used as authorization.
export default function ReportHistory({ security, api, personal = true, onSignIn }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [plaintext, setPlaintext] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState(null);
  const mounted = useRef(false);
  const listVersion = useRef(0);
  const detailVersion = useRef(0);
  const decryptVersion = useRef(0);
  const apiRef = useRef(api);
  apiRef.current = api;

  function hideContent() {
    decryptVersion.current += 1;
    setPlaintext(null); setDecryptError(null); setDecrypting(false);
  }

  function closeReport() {
    detailVersion.current += 1;
    hideContent(); setReport(null); setSelectedId(null); setDetailError(null); setLoadingReport(false);
  }

  async function loadReports() {
    const version = ++listVersion.current;
    closeReport(); setReports([]); setListError(null); setLoading(true);
    try {
      // listReports unwraps GET /api/reports -> { reports: [...] } in C's client.
      const records = await apiRef.current.listReports();
      if (!mounted.current || version !== listVersion.current) return;
      if (!Array.isArray(records) || !records.every(isReport)) throw new Error('The server returned an invalid report list.');
      setReports([...records].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
    } catch (error) {
      if (mounted.current && version === listVersion.current) setListError(error);
    } finally { if (mounted.current && version === listVersion.current) setLoading(false); }
  }

  async function openReport(id) {
    const version = ++detailVersion.current;
    hideContent(); setSelectedId(id); setReport(null); setDetailError(null); setLoadingReport(true);
    try {
      // getReport unwraps GET /api/reports/:id -> { report: {...} }.
      // Always fetch afresh so the server rechecks access for this specific id.
      const record = await apiRef.current.getReport(id);
      if (!mounted.current || version !== detailVersion.current) return;
      if (!isReport(record) || record.id !== id) throw new Error('The server returned an invalid report.');
      setReport(record);
    } catch (error) {
      if (mounted.current && version === detailVersion.current) setDetailError(error);
    } finally { if (mounted.current && version === detailVersion.current) setLoadingReport(false); }
  }

  async function decrypt() {
    if (!report || !security.canDecrypt || decrypting) return;
    const version = ++decryptVersion.current;
    setPlaintext(null); setDecryptError(null); setDecrypting(true);
    try {
      const content = await security.decryptReport(report.ciphertext);
      if (typeof content !== 'string') throw new Error('Decryption did not return readable report text.');
      if (mounted.current && version === decryptVersion.current) setPlaintext(content);
    } catch (error) {
      if (mounted.current && version === decryptVersion.current) setDecryptError(error);
    } finally { if (mounted.current && version === decryptVersion.current) setDecrypting(false); }
  }

  useEffect(() => {
    mounted.current = true;
    loadReports();
    return () => { mounted.current = false; listVersion.current += 1; detailVersion.current += 1; decryptVersion.current += 1; };
  }, [security.token]);
  useEffect(() => { hideContent(); }, [security.canDecrypt]);

  return <div>
    <p className={styles.historyNotice}><Icon name="lock" /><span>{personal ? 'Your submissions are retrieved for your signed-in account.' : 'This list contains the reports the server permits your account to access.'} Report text stays encrypted until decryption is permitted.</span></p>
    <section className={`${styles.reviewGrid} ${selectedId ? styles.showDetail : ''}`} aria-label={personal ? 'My submitted reports' : 'Accessible submitted reports'}>
      <div className={styles.reportList}>
        <div className={styles.listHeading}><div><h2>{personal ? 'My reports' : 'Accessible reports'}</h2><p>{loading ? 'Loading submissions…' : `${reports.length} submission${reports.length === 1 ? '' : 's'}`}</p></div><button className={styles.iconButton} disabled={loading} onClick={loadReports} aria-label="Refresh my reports"><Icon name="refresh" /></button></div>
        {loading && <p className={styles.listMessage} role="status">Retrieving your submissions…</p>}
        {listError && <div className={styles.listMessage}><Failure error={listError} onRetry={loadReports} onSignIn={onSignIn} /></div>}
        {!loading && !listError && reports.length === 0 && <div className={styles.empty}><Icon name="mail" width="36" height="36" /><h3>No submissions yet.</h3><p>Reports available to your account will appear here after submission. Temporary records may disappear after a server restart.</p></div>}
        <ul className={styles.reportItems}>{reports.map((record) => <li key={record.id}><button className={`${styles.reportItem} ${selectedId === record.id ? styles.selectedReport : ''}`} aria-current={selectedId === record.id ? 'true' : undefined} onClick={() => openReport(record.id)}><span className={styles.reportIcon}><Icon name="mail" /></span><span><strong>{record.id}</strong><time dateTime={record.createdAt}>{new Date(record.createdAt).toLocaleString()}</time><span className={styles.encryptedLabel}><Icon name="lock" width="12" height="12" />Encrypted submission</span></span><Icon name="arrow" width="16" height="16" /></button></li>)}</ul>
      </div>
      <div className={styles.reportDetail} aria-busy={loadingReport || decrypting}>
        <button className={`${styles.textButton} ${styles.mobileBack}`} onClick={closeReport}><Icon name="back" />Back to my reports</button>
        {loadingReport ? <div className={styles.empty} role="status"><span className={styles.largeIcon}><Icon name="lock" width="30" height="30" /></span><h2>Retrieving your report…</h2></div> : detailError ? <Failure error={detailError} onRetry={detailError.status === 404 ? loadReports : () => openReport(selectedId)} onSignIn={onSignIn} /> : !report ? <div className={styles.empty}><span className={styles.largeIcon}><Icon name="folder" width="32" height="32" /></span><h2>Your words have a place here.</h2><p>Select a submission to retrieve its reference, date and encrypted content.</p></div> : <>
          <div className={styles.detailHeading}><span className={styles.iconTile}><Icon name="mail" /></span><div><span className={styles.eyebrow}>SUBMITTED REPORT</span><h2>{report.id}</h2><time dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleString()}</time></div></div>
          <div className={styles.contentHeading}><h3>{plaintext !== null && security.canDecrypt ? 'Report content' : 'Encrypted submission'}</h3><span className={styles.smallBadge}><Icon name="lock" />{plaintext !== null && security.canDecrypt ? 'Decrypted for this session' : 'Ciphertext'}</span></div>
          {plaintext !== null && security.canDecrypt ? <div className={styles.plaintext}>{plaintext}</div> : <pre className={styles.ciphertext}>{report.ciphertext}</pre>}
          {!security.canDecrypt && <p className={styles.permissionNotice}><Icon name="lock" />Your submission was retrieved. Reading the original text requires TideCloak decryption permission, which this account does not currently have.</p>}
          {decryptError && <Failure error={decryptError} onRetry={decrypt} onSignIn={onSignIn} />}
          <div className={styles.detailActions}>{plaintext !== null && security.canDecrypt ? <button className={styles.secondaryButton} onClick={hideContent}>Hide report content</button> : <button className={styles.primaryButton} disabled={!security.canDecrypt || decrypting} onClick={decrypt}>{decrypting ? <span className={styles.spinner} /> : <Icon name="eye" />}{decrypting ? 'Decrypting…' : 'Decrypt report'}</button>}</div>
          <p className={styles.reviewFootnote}>Report retrieval and decryption are separate permissions. No readable copy is stored in this interface.</p>
        </>}
        <span className={styles.srOnly} role="status">{decrypting ? 'Decrypting report.' : plaintext !== null ? 'Report decrypted.' : ''}</span>
      </div>
    </section>
    <details className={styles.protectionDetails}><summary>Privacy and prototype limits</summary><p>Your report is encrypted before submission. The server decides which records this account may retrieve; TideCloak decides whether decryption is permitted. The navigation menu cannot grant access.</p><p>This prototype stores reports temporarily. They may be lost when the server restarts and are not a permanent case history. Please use fictional details only.</p></details>
  </div>;
}
