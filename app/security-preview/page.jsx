'use client';
// OWNER: Role A · TEMPORARY: remove before final submission.
// Real encrypt -> serialize -> deserialize -> decrypt smoke test (prompt A2)
// and the A3 permission tests.
//
// TEST NOTE: encryption is client-side. encryptReport() runs in the browser
// and returns only ciphertext; plaintext is never POSTed. This page makes no
// network request with report content at all. To verify, open DevTools >
// Network while clicking "Run round trip": no request body contains plaintext.
//
// In SIMULATED mode (the default) sign-in, roles and access checks are
// simulated (features/security/simulatedTide.js); the AES-GCM encryption is real.

import { useState } from 'react';
import { useSafeSpeakSecurity, useSimulatedPersona, SECURITY_MODE } from '../../features/security/useSafeSpeakSecurity';
import * as sim from '../../features/security/simulatedTide';

// A3 tests against the simulation, each persona as its own session.
async function runA3Tests() {
  const text = 'Synthetic A3 test report: no real people or events.';
  const results = [];
  const record = async (name, expectAllowed, fn) => {
    try {
      const out = await fn();
      results.push({ name, result: expectAllowed ? 'PASSED' : 'FAILED (was allowed)', detail: String(out).slice(0, 60) });
      return out;
    } catch (err) {
      results.push({ name, result: expectAllowed ? 'FAILED' : 'PASSED (refused)', detail: err.message });
      return null;
    }
  };
  const reporter = sim.signIn('reporter-a');
  const investigator = sim.signIn('investigator-b');
  const admin = sim.signIn('school-admin-c');
  const ct = await record('1. Reporter A encrypts', true, () => sim.encryptReport(reporter, text));
  await record('2. Reporter A decrypts own report (no decrypt role: must be refused)', false, () => sim.decryptReport(reporter, ct));
  await record('3. Investigator B decrypts Reporter A\'s ciphertext', true, async () => {
    const pt = await sim.decryptReport(investigator, ct);
    if (pt !== text) throw new Error('plaintext mismatch');
    return pt;
  });
  await record('4. School Admin C decrypts (no decrypt role: must be refused)', false, () => sim.decryptReport(admin, ct));
  await record('5. Investigator B encrypts (read-only: must be refused)', false, () => sim.encryptReport(investigator, text));
  return results;
}

export default function SecurityPreviewPage() {
  const security = useSafeSpeakSecurity();
  const persona = useSimulatedPersona();
  const [plaintext, setPlaintext] = useState('Synthetic test report: projector in room 80.4.12 is broken.');
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [lastCiphertext, setLastCiphertext] = useState('');
  const [pasted, setPasted] = useState('');
  const [pastedResult, setPastedResult] = useState('');
  const [a3, setA3] = useState([]);

  const add = (line) => setLog((l) => [...l, line]);

  async function runRoundTrip() {
    setLog([]);
    setBusy(true);
    try {
      const ciphertext = await security.encryptReport(plaintext);
      setLastCiphertext(ciphertext);
      add(`1. encrypted + serialized (${ciphertext.length} chars): ${ciphertext.slice(0, 80)}...`);
      add(`   ciphertext contains plaintext? ${ciphertext.includes(plaintext) ? 'YES (FAIL)' : 'no'}`);

      // Simulate the JSON POST body / GET response the API will carry.
      const wire = JSON.stringify({ ciphertext });
      const { ciphertext: fromWire } = JSON.parse(wire);
      add(`2. JSON round trip preserved string exactly? ${fromWire === ciphertext ? 'yes' : 'NO (FAIL)'}`);

      const decrypted = await security.decryptReport(fromWire);
      add(`3. decrypted: ${decrypted}`);
      add(decrypted === plaintext ? 'PASS: decrypted === original plaintext' : 'FAIL: decrypted text differs');
    } catch (err) {
      add(`ERROR: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function decryptPasted() {
    try {
      setPastedResult(`PLAINTEXT: ${await security.decryptReport(pasted.trim())}`);
    } catch (err) {
      setPastedResult(`REFUSED/ERROR: ${err?.message ?? String(err)}`);
    }
  }

  const pre = { whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f4f4f4', padding: '1rem' };

  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 760, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Security preview (TEMP)</h1>
      {SECURITY_MODE === 'simulated' && (
        <p style={{ background: '#fff3cd', padding: '0.5rem' }}>
          SIMULATED TideCloak: sign-in, roles and access checks are simulated. Not real security.
        </p>
      )}
      <p>
        mode: {SECURITY_MODE} · user: {persona?.name ?? (security.authenticated ? 'Tide user' : 'none')} ·
        authenticated: {String(security.authenticated)} · canEncrypt: {String(security.canEncrypt)} ·
        canDecrypt: {String(security.canDecrypt)}
      </p>
      {security.authenticated
        ? <button onClick={() => security.logout()}>Log out</button>
        : <button onClick={() => security.login()}>Log in</button>}
      {SECURITY_MODE === 'simulated' && Object.entries(sim.PERSONAS).map(([id, p]) => (
        <button key={id} style={{ marginLeft: 8 }} onClick={() => security.login(id)}>Sign in as {p.name}</button>
      ))}
      <hr />
      <textarea rows={4} style={{ width: '100%' }} value={plaintext} onChange={(e) => setPlaintext(e.target.value)} />
      <button disabled={busy || !security.authenticated} onClick={runRoundTrip}>
        {busy ? 'Running...' : 'Run round trip'}
      </button>
      <pre style={pre}>{log.join('\n') || 'No run yet.'}</pre>
      {lastCiphertext && <p>Last ciphertext (copy, switch user, paste below):</p>}
      {lastCiphertext && <pre style={pre}>{lastCiphertext}</pre>}

      <h2>Decrypt a ciphertext from another user</h2>
      <textarea rows={3} style={{ width: '100%' }} placeholder="sim1:... or tide1:..." value={pasted}
        onChange={(e) => setPasted(e.target.value)} />
      <button disabled={!security.authenticated || !pasted} onClick={decryptPasted}>Decrypt as current user</button>
      <pre style={pre}>{pastedResult}</pre>

      {SECURITY_MODE === 'simulated' && (
        <>
          <h2>A3 permission tests (simulated)</h2>
          <button onClick={async () => setA3(await runA3Tests())}>Run A3 tests</button>
          <pre style={pre}>{a3.map((r) => `${r.result.padEnd(18)} ${r.name}\n                   ${r.detail}`).join('\n') || 'Not run.'}</pre>
        </>
      )}
    </main>
  );
}
