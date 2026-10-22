// OWNER: Role C (Backend + Integrator)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.2 (security rules) · Agent prompt: C1
// Verify the Bearer token server-side with the REAL TideCloak verifier
// (@tidecloak/nextjs/server + starter config). Never trust browser-sent role/userId.

export async function verifyRequest(request) {
  // TODO(C): return the verified token payload, or signal failure -> 401
  throw new Error('verifyRequest: not implemented');
}
