// OWNER: Role C (Backend + Integrator)
// Contract: docs/API_CONTRACT.md §0.3, §0.5 (FROZEN v1.0)
// Verifies `Authorization: Bearer <access-token>` with the REAL TideCloak verifier
// (verifyTideCloakToken from @tidecloak/nextjs/server) and the starter's adapter config.
// Identity is derived only from verified claims; browser-sent role/userId is ignored.
// Fails closed: no SDK or no config -> 503, never a bypass.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// TODO(A): confirm the server-verifiable investigator role and set it here,
// e.g. '_tide_report.selfdecrypt' if A assigns it ONLY to investigators.
// While null, nobody gets investigator (read-all) access: reporters see only their own.
export const INVESTIGATOR_ROLE = null;

// Starter-generated adapter config (owned by A). The docs use both names.
const CONFIG_FILES = ['tidecloak.json', 'tidecloakAdapter.json'];

// Memoizes a successful load; a failed load is retried on the next request.
function loadOnce(loader) {
  let promise;
  return () => (promise ??= loader().catch((err) => { promise = undefined; throw err; }));
}

const getConfig = loadOnce(async () => {
  for (const name of CONFIG_FILES) {
    try {
      return JSON.parse(await readFile(path.join(process.cwd(), name), 'utf8'));
    } catch {
      // try the next name
    }
  }
  throw new Error('TideCloak adapter config not found');
});

const getVerifier = loadOnce(async () => {
  const mod = await import('@tidecloak/nextjs/server');
  if (typeof mod.verifyTideCloakToken !== 'function') {
    throw new Error('verifyTideCloakToken export not found');
  }
  return mod.verifyTideCloakToken;
});

function hasRole(claims, config, role) {
  const realmRoles = claims?.realm_access?.roles ?? [];
  const clientRoles = (config?.resource && claims?.resource_access?.[config.resource]?.roles) || [];
  return realmRoles.includes(role) || clientRoles.includes(role);
}

// Returns { ok: true, identity: { sub, isInvestigator } } or { ok: false, status, error }.
export async function verifyRequest(request) {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization') || '');
  if (!match) {
    return { ok: false, status: 401, error: 'Missing or invalid access token' };
  }

  let config;
  let verifyTideCloakToken;
  try {
    config = await getConfig();
    verifyTideCloakToken = await getVerifier();
  } catch {
    console.error('[safespeak] TideCloak verifier/config unavailable; failing closed');
    return { ok: false, status: 503, error: 'Authentication service unavailable' };
  }

  let claims;
  try {
    claims = await verifyTideCloakToken(config, match[1]);
  } catch {
    console.error('[safespeak] TideCloak token verification error; failing closed');
    return { ok: false, status: 503, error: 'Authentication service unavailable' };
  }

  if (!claims || typeof claims.sub !== 'string' || claims.sub.length === 0) {
    return { ok: false, status: 401, error: 'Missing or invalid access token' };
  }

  return {
    ok: true,
    identity: {
      sub: claims.sub,
      isInvestigator: INVESTIGATOR_ROLE !== null && hasRole(claims, config, INVESTIGATOR_ROLE)
    }
  };
}
