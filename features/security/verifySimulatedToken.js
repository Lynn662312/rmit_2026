// OWNER: Role A (TideCloak Security Lead) · for Role C's verifyRequest()
// SERVER-SIDE stand-in for verifyTideCloakToken(tcConfig, token, roles) while
// TideCloak is simulated. Same idea: parse the Bearer token, check expiry and
// optional realm roles, return the claims or null.
//
// It is NOT authentication: the simulated token is unsigned, so anyone can
// forge one. When the real realm exists, replace the call with
//   verifyTideCloakToken(tcConfig, token, allowedRoles)  from '@tidecloak/nextjs/server'
// (Tide MCP playbook verify-jwt-server-side: local JWKS from tidecloak.json + DPoP).

import { parseSimulatedToken } from './simulatedTide';

export function verifySimulatedToken(authorizationHeader, allowedRoles = []) {
  if (typeof authorizationHeader !== 'string' || !authorizationHeader.startsWith('Bearer ')) return null;
  const claims = parseSimulatedToken(authorizationHeader.slice('Bearer '.length).trim());
  if (!claims) return null;
  const roles = claims.realm_access?.roles ?? [];
  if (allowedRoles.length && !allowedRoles.some((r) => roles.includes(r))) return null;
  return claims;
}
