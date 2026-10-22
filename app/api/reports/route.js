// OWNER: Role C (Backend + Integrator)
// Contract: docs/API_CONTRACT.md §2.1, §2.2 (FROZEN v1.0)
// POST { ciphertext } -> 201 { id, createdAt }
// GET                 -> 200 { reports: [{ id, createdAt, ciphertext }] }
// In-memory storage: reports are lost when the server restarts.
import { verifyRequest } from '../../../features/api/verifyRequest.js';
import { createReport, listReports } from '../../../features/api/reportStore.js';
import { errorResponse, jsonResponse, readCiphertextBody, serverError } from '../../../features/api/http.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const auth = await verifyRequest(request);
    if (!auth.ok) return errorResponse(auth.status, auth.error);

    const body = await readCiphertextBody(request);
    if (!body.ok) return errorResponse(body.status, body.error);

    const created = createReport({ ciphertext: body.ciphertext, ownerSub: auth.identity.sub });
    return jsonResponse(created, 201);
  } catch {
    console.error('[safespeak] POST /api/reports failed');
    return serverError();
  }
}

export async function GET(request) {
  try {
    const auth = await verifyRequest(request);
    if (!auth.ok) return errorResponse(auth.status, auth.error);

    return jsonResponse({ reports: listReports(auth.identity) }, 200);
  } catch {
    console.error('[safespeak] GET /api/reports failed');
    return serverError();
  }
}
