// OWNER: Role A (TideCloak Security Lead)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.3 · Agent prompt: A2
// Lossless round-trip of the real Tide encrypted payload so it survives
// JSON POST/GET. Inspect the actual SDK output type first; never String() it blindly.

export function serializeCiphertext(encrypted) {
  // TODO(A): SDK output -> opaque string
  throw new Error('serializeCiphertext: not implemented');
}

export function deserializeCiphertext(ciphertext) {
  // TODO(A): opaque string -> SDK input for doDecrypt
  throw new Error('deserializeCiphertext: not implemented');
}
