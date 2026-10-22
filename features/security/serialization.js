// OWNER: Role A (TideCloak Security Lead)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.3 · Agent prompt: A2
// Lossless round-trip of the real Tide encrypted payload so it survives
// JSON POST/GET. Inspect the actual SDK output type first; never String() it blindly.
//
// Verified against @tidecloak/js 0.13.33 (lib/tidecloak.js encrypt/decrypt):
//   doEncrypt -> Promise<(string | Uint8Array)[]>
//   - string input     -> base64 string of the ciphertext bytes
//   - Uint8Array input -> raw ciphertext Uint8Array
//   doDecrypt accepts the same two shapes; a string is base64-decoded by the SDK,
//   and the result type mirrors the input type (string -> string, bytes -> bytes).
// The envelope keeps which shape the SDK produced, so doDecrypt gets back exactly
// what doEncrypt returned.

const PREFIX = 'tide1';
const KIND_STRING = 's'; // SDK returned a base64 string; stored verbatim
const KIND_BYTES = 'b';  // SDK returned a Uint8Array; stored as base64

export function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

export function serializeCiphertext(encrypted) {
  if (typeof encrypted === 'string') {
    if (!encrypted || !BASE64_RE.test(encrypted)) {
      throw new Error('serializeCiphertext: SDK returned a non-base64 string');
    }
    return `${PREFIX}:${KIND_STRING}:${encrypted}`;
  }
  if (encrypted instanceof Uint8Array) {
    if (encrypted.length === 0) throw new Error('serializeCiphertext: empty ciphertext');
    return `${PREFIX}:${KIND_BYTES}:${bytesToBase64(encrypted)}`;
  }
  throw new Error(`serializeCiphertext: unexpected SDK output type ${Object.prototype.toString.call(encrypted)}`);
}

export function deserializeCiphertext(ciphertext) {
  if (typeof ciphertext !== 'string') {
    throw new Error('deserializeCiphertext: ciphertext must be a string');
  }
  const [prefix, kind, body] = ciphertext.split(':');
  if (prefix !== PREFIX || !body || !BASE64_RE.test(body)) {
    throw new Error('deserializeCiphertext: not a SafeSpeak ciphertext');
  }
  if (kind === KIND_STRING) return body;
  if (kind === KIND_BYTES) return base64ToBytes(body);
  throw new Error(`deserializeCiphertext: unknown kind '${kind}'`);
}
