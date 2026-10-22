'use client';
// OWNER: Role A (TideCloak Security Lead)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.3 · Agent prompts: A2, A3
// Stable facade. B and C depend on this exact shape, so do not rename fields.
//
// MODE (build time): NEXT_PUBLIC_SAFESPEAK_TIDE_MODE
//   unset / 'simulated' -> simulated TideCloak (simulatedTide.js), as the brief asks
//   'real'              -> real @tidecloak/nextjs self-encryption (needs a licensed realm)
// The simulated mode is labelled everywhere it shows; never present it as real security.

import { useCallback, useSyncExternalStore } from 'react';
import { useTideCloak } from '@tidecloak/nextjs';
import { serializeCiphertext, deserializeCiphertext } from './serialization';
import * as sim from './simulatedTide';

export const SECURITY_MODE = process.env.NEXT_PUBLIC_SAFESPEAK_TIDE_MODE === 'real' ? 'real' : 'simulated';

const TAG = 'report';
const ENCRYPT_ROLE = `_tide_${TAG}.selfencrypt`;
const DECRYPT_ROLE = `_tide_${TAG}.selfdecrypt`;

// ── Real TideCloak (self-encryption, docs.tide.org/Admin/e2ee) ──────────────
// Self-encrypted ciphertext is bound to the encrypting user: an investigator
// cannot decrypt a reporter's report this way (Tide MCP). Cross-user access in
// the real realm needs signed policies: see reportPolicies.js.
function useTideSecurity() {
  const { authenticated, login, logout, token, hasRealmRole, doEncrypt, doDecrypt } = useTideCloak();

  const canEncrypt = Boolean(authenticated && hasRealmRole(ENCRYPT_ROLE));
  const canDecrypt = Boolean(authenticated && hasRealmRole(DECRYPT_ROLE));

  // Encryption happens in the browser via the Tide enclave; only the
  // serialized ciphertext string ever leaves this function.
  const encryptReport = useCallback(async (plaintext) => {
    if (!authenticated) throw new Error('encryptReport: not logged in');
    if (typeof plaintext !== 'string' || !plaintext.trim()) {
      throw new Error('encryptReport: plaintext must be a non-empty string');
    }
    if (!hasRealmRole(ENCRYPT_ROLE)) throw new Error(`encryptReport: missing realm role ${ENCRYPT_ROLE}`);
    const [encrypted] = await doEncrypt([{ data: plaintext, tags: [TAG] }]);
    return serializeCiphertext(encrypted);
  }, [authenticated, hasRealmRole, doEncrypt]);

  const decryptReport = useCallback(async (ciphertext) => {
    if (!authenticated) throw new Error('decryptReport: not logged in');
    if (!hasRealmRole(DECRYPT_ROLE)) throw new Error(`decryptReport: missing realm role ${DECRYPT_ROLE}`);
    const encrypted = deserializeCiphertext(ciphertext);
    const [decrypted] = await doDecrypt([{ encrypted, tags: [TAG] }]);
    if (typeof decrypted === 'string') return decrypted;
    if (decrypted instanceof Uint8Array) return new TextDecoder().decode(decrypted);
    throw new Error('decryptReport: unexpected SDK output type');
  }, [authenticated, hasRealmRole, doDecrypt]);

  return {
    authenticated,
    login,
    logout,
    token: token ?? null,
    canEncrypt,
    canDecrypt,
    encryptReport,  // -> Promise<string> serialized ciphertext
    decryptReport   // -> Promise<string> plaintext
  };
}

// ── Simulated TideCloak ─────────────────────────────────────────────────────
// One session shared by every component, kept per tab (sessionStorage).
const STORAGE_KEY = 'safespeak.simulatedTideSession';
let session = null;
const listeners = new Set();

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw && JSON.parse(raw);
    return parsed && sim.parseSimulatedToken(parsed.token) ? parsed : null;
  } catch {
    return null;
  }
}
function setSession(next) {
  session = next;
  try {
    if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* storage blocked: session lives in memory only */ }
  listeners.forEach((l) => l());
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
let loaded = false;
function getSnapshot() {
  if (!loaded && typeof window !== 'undefined') {
    loaded = true;
    session = loadSession();
  }
  return session;
}

// login(personaId?) - without an id, asks which demo persona to sign in as.
function simulatedLogin(personaId) {
  let id = personaId;
  if (!id) {
    const ids = Object.keys(sim.PERSONAS);
    const menu = ids.map((k, i) => `${i + 1}. ${sim.PERSONAS[k].name}`).join('\n');
    const pick = window.prompt(`SIMULATED TideCloak sign-in (no real Tide login)\n\n${menu}\n\nEnter a number:`);
    id = ids[Number(pick) - 1];
    if (!id) return;
  }
  setSession(sim.signIn(id));
}

function useSimulatedSecurity() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const authenticated = Boolean(current && sim.parseSimulatedToken(current.token));

  const encryptReport = useCallback((plaintext) => sim.encryptReport(current, plaintext), [current]);
  const decryptReport = useCallback((ciphertext) => sim.decryptReport(current, ciphertext), [current]);

  return {
    authenticated,
    login: simulatedLogin,
    logout: () => setSession(null),
    token: authenticated ? current.token : null,
    canEncrypt: authenticated && sim.hasRealmRole(current, sim.ROLES.selfEncrypt) && sim.hasRealmRole(current, sim.ROLES.encryptor),
    canDecrypt: authenticated && sim.hasRealmRole(current, sim.ROLES.selfDecrypt) && sim.hasRealmRole(current, sim.ROLES.decryptor),
    encryptReport,
    decryptReport
  };
}

// Display-only helper for labelling the UI (not part of the frozen contract).
export function useSimulatedPersona() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return SECURITY_MODE === 'simulated' && current ? sim.PERSONAS[current.personaId] : null;
}

export const useSafeSpeakSecurity = SECURITY_MODE === 'real' ? useTideSecurity : useSimulatedSecurity;
