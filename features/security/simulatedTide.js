// OWNER: Role A (TideCloak Security Lead)
// SIMULATED TideCloak: sign-in, realm roles and access checks, per the brief
// ("simulate TideCloak's sign-in, roles and access checks for now").
// Plan and the real Tide piece each part stands in for: TIDECLOAK_PLAN.md.
//
// What is real here:   AES-256-GCM encryption in the browser (WebCrypto), so the
//                      server only ever receives ciphertext.
// What is simulated:   identity (no Tide login), roles (hard-coded personas),
//                      the access check (this file, not the ORK network), and
//                      the key (a demo key shipped in the bundle; anyone with the
//                      code can decrypt). This is NOT security; it is a stand-in
//                      with the same shape and the same allow/deny decisions.
//
// Roles and decisions mirror Tide's built-in RelationshipAttestation:1 contract
// (Tide MCP, scenario relationship-attestation) with two policies on record 'report':
//   write policy: holders of _tide_encryptor may encrypt, not decrypt
//   read policy:  holders of _tide_decryptor may decrypt, not encrypt
// plus the voucher-gate roles _tide_report.selfencrypt / _tide_report.selfdecrypt.

export const SIMULATED = true;
export const TAG = 'report';
export const ROLES = {
  selfEncrypt: `_tide_${TAG}.selfencrypt`,
  selfDecrypt: `_tide_${TAG}.selfdecrypt`,
  encryptor: '_tide_encryptor',
  decryptor: '_tide_decryptor'
};

const DEFAULT_ROLES = ['_tide_enabled', 'appUser', ROLES.selfEncrypt]; // default-roles-*: never a decrypt role

export const PERSONAS = {
  'reporter-a': { name: 'Reporter A (student)', roles: [...DEFAULT_ROLES, ROLES.encryptor] },
  'investigator-b': { name: 'Investigator B', roles: [...DEFAULT_ROLES, ROLES.selfDecrypt, ROLES.decryptor] },
  'school-admin-c': { name: 'School Admin C', roles: [...DEFAULT_ROLES] }
};

const PREFIX = 'sim1'; // never confusable with real Tide ciphertext ('tide1:')
const TOKEN_PREFIX = 'sim.';
const SESSION_SECONDS = 60 * 60;
const DEMO_KEY_MATERIAL = 'safespeak-simulated-tide-demo-key-v1 (NOT A SECRET)';

function b64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4);
  return decodeURIComponent(escape(atob(b64)));
}
function bytesToB64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ── Simulated sign-in ────────────────────────────────────────────────────────
// The token is UNSIGNED: it carries Tide-shaped claims so server code can be
// written against the real claim names, but anyone can forge it.
export function signIn(personaId, now = Date.now()) {
  const persona = PERSONAS[personaId];
  if (!persona) throw new Error(`[SIMULATED] unknown persona '${personaId}'`);
  const iat = Math.floor(now / 1000);
  const claims = {
    sim: true,
    sub: personaId,
    vuid: `sim-vuid-${personaId}`,
    name: persona.name,
    realm_access: { roles: [...persona.roles] },
    iat,
    exp: iat + SESSION_SECONDS
  };
  return { personaId, claims, token: TOKEN_PREFIX + b64urlEncode(JSON.stringify(claims)) };
}

export function parseSimulatedToken(token, now = Date.now()) {
  if (typeof token !== 'string' || !token.startsWith(TOKEN_PREFIX)) return null;
  try {
    const claims = JSON.parse(b64urlDecode(token.slice(TOKEN_PREFIX.length)));
    if (claims?.sim !== true || !PERSONAS[claims.sub]) return null;
    if (typeof claims.exp !== 'number' || claims.exp * 1000 <= now) return null;
    return claims;
  } catch {
    return null;
  }
}

export function hasRealmRole(session, role) {
  return Boolean(session?.claims?.realm_access?.roles?.includes(role));
}

// ── Simulated access check (stands in for the ORK running the contract) ─────
function deny(message) {
  throw new Error(`[SIMULATED Tide] ${message}`);
}
function checkAccess(session, op) {
  if (!session || !parseSimulatedToken(session.token)) deny('not signed in or session expired');
  if (op === 'encrypt') {
    if (!hasRealmRole(session, ROLES.selfEncrypt)) deny(`voucher refused: missing ${ROLES.selfEncrypt}`);
    if (!hasRealmRole(session, ROLES.encryptor)) deny(`'${ROLES.encryptor}' role not found for this encryption request.`);
  } else {
    if (!hasRealmRole(session, ROLES.selfDecrypt)) deny(`session has not been allowed a voucher action of type vendordecrypt (missing ${ROLES.selfDecrypt})`);
    if (!hasRealmRole(session, ROLES.decryptor)) deny(`'${ROLES.decryptor}' role not found for this decryption request.`);
  }
}

// ── Real AES-256-GCM, simulated key management ───────────────────────────────
let keyPromise;
function demoKey() {
  keyPromise ??= (async () => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(DEMO_KEY_MATERIAL));
    return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  })();
  return keyPromise;
}

export async function encryptReport(session, plaintext) {
  if (typeof plaintext !== 'string' || !plaintext.trim()) {
    throw new Error('encryptReport: plaintext must be a non-empty string');
  }
  checkAccess(session, 'encrypt');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aad = new TextEncoder().encode(`${PREFIX}:${TAG}`); // binds ciphertext to the 'report' tag
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: aad }, await demoKey(), new TextEncoder().encode(plaintext)
  ));
  const packed = new Uint8Array(iv.length + ct.length);
  packed.set(iv);
  packed.set(ct, iv.length);
  return `${PREFIX}:${bytesToB64(packed)}`;
}

export async function decryptReport(session, ciphertext) {
  checkAccess(session, 'decrypt');
  if (typeof ciphertext !== 'string' || !ciphertext.startsWith(`${PREFIX}:`)) {
    throw new Error('decryptReport: not a simulated SafeSpeak ciphertext');
  }
  const packed = b64ToBytes(ciphertext.slice(PREFIX.length + 1));
  if (packed.length < 12 + 16) throw new Error('decryptReport: ciphertext too short');
  const aad = new TextEncoder().encode(`${PREFIX}:${TAG}`);
  try {
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: packed.subarray(0, 12), additionalData: aad }, await demoKey(), packed.subarray(12)
    );
    return new TextDecoder().decode(pt);
  } catch {
    throw new Error('decryptReport: ciphertext corrupted or tampered (AES-GCM auth failed)');
  }
}
