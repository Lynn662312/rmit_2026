// OWNER: Role C (Backend + Integrator)
// Contract: docs/SafeSpeak_VSCode_Parallel_Build.md §3.2 · Agent prompt: C1
// POST { ciphertext } -> 201 { id, createdAt }
// GET                 -> 200 { reports: [{ id, createdAt, ciphertext }] }
// Errors: 400 / 401 / 413 (>64 KiB) / 500 as { error: message }. Never log contents.

export const runtime = 'nodejs';

export async function POST(request) {
  // TODO(C)
  return Response.json({ error: 'Not implemented' }, { status: 501 });
}

export async function GET(request) {
  // TODO(C)
  return Response.json({ error: 'Not implemented' }, { status: 501 });
}
