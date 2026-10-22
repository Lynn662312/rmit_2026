// OWNER: Role C (Backend + Integrator)
// Contract: docs/API_CONTRACT.md §1, §3 (FROZEN v1.0)
// Shared request validation and response helpers for the /api/reports routes.
// Never put ciphertext, tokens or identity into error messages or logs.

export const MAX_BODY_BYTES = 64 * 1024;

const REPORT_ID_PATTERN = /^r_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const NO_STORE = { 'Cache-Control': 'no-store' };

export function jsonResponse(body, status) {
  return Response.json(body, { status, headers: NO_STORE });
}

export function errorResponse(status, error) {
  return jsonResponse({ error }, status);
}

export function emptyResponse(status) {
  return new Response(null, { status, headers: NO_STORE });
}

export function serverError() {
  return errorResponse(500, 'Internal server error');
}

export function isValidReportId(id) {
  return typeof id === 'string' && REPORT_ID_PATTERN.test(id);
}

// Parses a POST/PATCH body that must be exactly { "ciphertext": "<non-empty string>" }.
// Returns { ok: true, ciphertext } or { ok: false, status, error }.
export async function readCiphertextBody(request) {
  const contentType = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return { ok: false, status: 400, error: 'Content-Type must be application/json' };
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'Request body exceeds 64 KiB' };
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'Request body exceeds 64 KiB' };
  }

  let body;
  try {
    body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return { ok: false, status: 400, error: 'Malformed JSON body' };
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, status: 400, error: 'Body must be a JSON object' };
  }
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== 'ciphertext') {
    return { ok: false, status: 400, error: 'Body must contain only "ciphertext"' };
  }
  if (typeof body.ciphertext !== 'string' || body.ciphertext.trim().length === 0) {
    return { ok: false, status: 400, error: '"ciphertext" must be a non-empty string' };
  }
  return { ok: true, ciphertext: body.ciphertext };
}
