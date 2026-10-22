'use client';
// OWNER: Role A (TideCloak Security Lead)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.3 · Agent prompts: A2, A3
// Stable facade over @tidecloak/nextjs. B and C depend on this exact shape,
// so do not rename fields. Never fake auth, encryption or decryption.

export function useSafeSpeakSecurity() {
  // TODO(A): wire to useTideCloak(): authenticated, login, logout, token,
  // hasRealmRole('_tide_report.selfencrypt' / '_tide_report.selfdecrypt'),
  // doEncrypt / doDecrypt with tags: ['report'].
  return {
    authenticated: false,
    login: async () => { throw new Error('login: not implemented'); },
    logout: async () => { throw new Error('logout: not implemented'); },
    token: null,
    canEncrypt: false,
    canDecrypt: false,
    encryptReport: async (text) => { throw new Error('encryptReport: not implemented'); },     // -> Promise<string> ciphertext
    decryptReport: async (ciphertext) => { throw new Error('decryptReport: not implemented'); } // -> Promise<string> plaintext
  };
}
