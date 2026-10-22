'use client';
import { useState } from 'react';
import styles from './SafeSpeakApp.module.css';
import ReportForm from './ReportForm';
import ReviewPanel from './ReviewPanel';
import { Icon, Wisteria } from './Visuals';

// Role B: presentation only. Real authentication and crypto come from Role A.
export default function SafeSpeakApp({ security, api, headerNavigation = null }) {
  const [view, setView] = useState('submit');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sessionVersion, setSessionVersion] = useState(0);
  async function authenticate(action) {
    setPending(true);
    setError('');
    setSessionVersion((value) => value + 1);
    try { await action(); }
    catch (failure) { setError(failure?.message || 'Unable to update your session. Please try again.'); }
    finally { setPending(false); }
  }
  const active = !security.canEncrypt ? 'review' : !security.canDecrypt ? 'submit' : view;
  // Token changes clear decrypted review content. Preserve the writing form across
  // routine token refreshes; logout and unauthenticated transitions clear it.
  const sessionKey = `${security.token || 'session'}:${sessionVersion}`;
  return <div className={styles.root}>
    <header className={styles.header}>
      <a className={styles.brand} href="#main-content" aria-label="SafeSpeak, skip to content"><span className={styles.brandMark}><Icon name="sprout" /></span><span>SafeSpeak<span className={styles.purple}>.</span></span></a>
      <span className={styles.headerCaption}>A little space. A stronger voice.</span>
      {headerNavigation}
      {security.authenticated && <button className={styles.textButton} disabled={pending} onClick={() => authenticate(security.logout)}><Icon name="logout" />Sign out</button>}
    </header>
    <main id="main-content" className={styles.main} tabIndex={-1}>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!security.authenticated ? <section className={styles.landing}>
        <div><span className={styles.eyebrow}>YOUR VOICE MATTERS</span><h1>A safe place to<br />speak up<span className={styles.purple}>.</span></h1><p className={styles.intro}>A confidential space to report campus bullying or harassment. Take your time. Start when you’re ready.</p><button className={styles.primaryButton} disabled={pending} onClick={() => authenticate(security.login)}>{pending ? 'Connecting…' : 'Continue with TideCloak'}<Icon name="arrow" /></button><p className={styles.helper}>Sign in to access your reporting permissions.</p></div>
        <div className={styles.landingArt}><Wisteria /><div className={styles.artNote}><Icon name="heart" /><span>Every voice deserves<br />to be heard.</span></div></div>
      </section> : <>
        <section className={styles.pageHeading}><div><span className={styles.eyebrow}>{active === 'submit' ? 'A SPACE TO BE HEARD' : 'HANDLE WITH CARE'}</span><h1>{active === 'submit' ? 'Your voice matters.' : 'A thoughtful review.'}</h1><p>{active === 'submit' ? 'Take a breath. Share what you feel ready to share.' : 'Read carefully. Access report content only when permitted.'}</p></div><span className={styles.sessionBadge}><span />Signed in</span></section>
        {security.canEncrypt && security.canDecrypt && <nav className={styles.tabs} aria-label="Workspace"><button aria-current={active === 'submit' ? 'page' : undefined} className={active === 'submit' ? styles.activeTab : ''} onClick={() => setView('submit')}><Icon name="write" />Submit a report</button><button aria-current={active === 'review' ? 'page' : undefined} className={active === 'review' ? styles.activeTab : ''} onClick={() => setView('review')}><Icon name="folder" />Review reports</button></nav>}
        {!pending && (active === 'submit' ? <ReportForm key={sessionVersion} security={security} api={api} /> : <ReviewPanel key={sessionKey} security={security} api={api} />)}
      </>}
      <div className={styles.demoNotice}><Icon name="info" /><span><strong>Demonstration only.</strong> Please use synthetic reports. Do not enter names, contact details, or real incidents. Reports are stored temporarily and may be cleared when the server restarts.</span></div>
    </main>
    <footer className={styles.footer}><span>SafeSpeak · A more caring campus starts with listening.</span><span>Built for RMIT Hackathon 2026</span></footer>
  </div>;
}
