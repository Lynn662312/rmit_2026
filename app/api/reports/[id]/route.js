// OWNER: Role C (Backend + Integrator)
// Contract: docs/API_CONTRACT.md §2.3, §2.4, §2.5 (FROZEN v1.0)
// GET    -> 200 { report }   (owner or verified investigator; otherwise 404)
// PATCH  -> 200 { report }   (owner only; viewable non-owner 403, otherwise 404)
// DELETE -> 204 no body      (owner only; viewable non-owner 403, otherwise 404)
import { verifyRequest } from '../../../../features/api/verifyRequest.js';
import { deleteReport, getReport, updateReport } from '../../../../features/api/reportStore.js';
import {
  emptyResponse,
  errorResponse,
  isValidReportId,
  jsonResponse,
  readCiphertextBody,
  serverError
} from '../../../../features/api/http.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NOT_FOUND = 'Report not found';
const FORBIDDEN = 'Only the original reporter can modify this report';

export async function GET(request, { params }) {
  try {
    const auth = await verifyRequest(request);
    if (!auth.ok) return errorResponse(auth.status, auth.error);

    const { id } = await params;
    if (!isValidReportId(id)) return errorResponse(400, 'Invalid report id');

    const report = getReport(id, auth.identity);
    if (!report) return errorResponse(404, NOT_FOUND);
    return jsonResponse({ report }, 200);
  } catch {
    console.error('[safespeak] GET /api/reports/:id failed');
    return serverError();
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await verifyRequest(request);
    if (!auth.ok) return errorResponse(auth.status, auth.error);

    const { id } = await params;
    if (!isValidReportId(id)) return errorResponse(400, 'Invalid report id');

    const body = await readCiphertextBody(request);
    if (!body.ok) return errorResponse(body.status, body.error);

    const result = updateReport(id, body.ciphertext, auth.identity);
    if (result.status === 'not_found') return errorResponse(404, NOT_FOUND);
    if (result.status === 'forbidden') return errorResponse(403, FORBIDDEN);
    return jsonResponse({ report: result.report }, 200);
  } catch {
    console.error('[safespeak] PATCH /api/reports/:id failed');
    return serverError();
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyRequest(request);
    if (!auth.ok) return errorResponse(auth.status, auth.error);

    const { id } = await params;
    if (!isValidReportId(id)) return errorResponse(400, 'Invalid report id');

    const result = deleteReport(id, auth.identity);
    if (result.status === 'not_found') return errorResponse(404, NOT_FOUND);
    if (result.status === 'forbidden') return errorResponse(403, FORBIDDEN);
    return emptyResponse(204);
  } catch {
    console.error('[safespeak] DELETE /api/reports/:id failed');
    return serverError();
  }
}
