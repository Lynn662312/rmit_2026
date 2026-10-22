// OWNER: Role A (TideCloak Security Lead)
// Cross-user report access via Tide's built-in RelationshipAttestation:1 contract
// (Tide MCP: scenario relationship-attestation, playbook setup-forseti-e2ee).
//
// Why: plain doEncrypt/doDecrypt is SELF-encryption. The ciphertext is bound to
// the encrypting user, so Investigator B can never decrypt Reporter A's report,
// whatever roles B holds. Sharing needs a network-signed policy passed as the
// optional `decryption_policy: Uint8Array` of IAMService.doEncrypt/doDecrypt
// (@tidecloak/js 0.13.33). useTideCloak().doEncrypt drops that argument, so the
// facade calls IAMService directly.
//
// Two Role-subject policies, both on record id 'report' (= the only tag):
//   write: holders of _tide_encryptor may ENCRYPT, not decrypt (a drop box)
//   read:  holders of _tide_decryptor may DECRYPT, not encrypt
// A tide-realm-admin signs each ONCE in the browser enclave (signReportPolicy).
// The signed bytes are not secret (they name roles and the record id, no keys)
// and only work for callers the network accepts, so they ship as constants below.

import { bytesToBase64, base64ToBytes } from './serialization';

export const REPORT_RECORD_ID = 'report';
export const ENCRYPTOR_ROLE = '_tide_encryptor';
export const DECRYPTOR_ROLE = '_tide_decryptor';

const CONTRACT_ID = 'RelationshipAttestation:1';
const MODEL_IDS = ['PolicyEnabledEncryption:1', 'PolicyEnabledDecryption:1'];
const POLICY_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

const ACCESS = {
  write: { subjectId: ENCRYPTOR_ROLE, roles: [ENCRYPTOR_ROLE] },
  read: { subjectId: DECRYPTOR_ROLE, roles: [DECRYPTOR_ROLE] }
};

// Paste the base64 output of signReportPolicy here after the admin ceremony.
// Empty means "not signed yet": encrypt/decrypt then refuse instead of falling
// back to self-encryption (which would silently break cross-user access).
export const SIGNED_REPORT_POLICIES = {
  write: '',
  read: ''
};

const decoded = {};
export function getSignedReportPolicy(access) {
  const b64 = SIGNED_REPORT_POLICIES[access];
  if (!b64) return null;
  return (decoded[access] ??= base64ToBytes(b64));
}

// ADMIN ONLY, in the browser, logged in as tide-realm-admin. Opens one Tide
// enclave approval popup. Returns base64 of the network-signed policy bytes.
//   IAMService       - from useTideCloak()
//   vendorId         - from tidecloak.json (never IAMService._tc.vendorId)
//   adminPolicyBytes - Uint8Array, base64-decoded `policy` field of
//                      GET /admin/realms/{realm}/iga/role-policies (admin bearer)
//   access           - 'write' | 'read'
export async function signReportPolicy({ IAMService, vendorId, adminPolicyBytes, access }) {
  const grant = ACCESS[access];
  if (!grant) throw new Error(`signReportPolicy: access must be 'write' or 'read'`);
  if (!vendorId) throw new Error('signReportPolicy: vendorId missing (read it from tidecloak.json)');
  if (!(adminPolicyBytes instanceof Uint8Array) || adminPolicyBytes.length === 0) {
    throw new Error('signReportPolicy: adminPolicyBytes must be the decoded admin policy');
  }
  const tc = IAMService?._tc;
  if (!tc) throw new Error('signReportPolicy: TideCloak not initialised; log in first');

  const { Models } = await import('@tideorg/js');
  const { PolicySignRequest } = await import('heimdall-tide');
  const { Policy, ApprovalType, ExecutionType, BaseTideRequest } = Models;

  const policy = new Policy({
    version: Policy.latestVersion,
    contractId: CONTRACT_ID,
    modelId: MODEL_IDS,
    keyId: vendorId,
    approvalType: ApprovalType.IMPLICIT,
    executionType: ExecutionType.PRIVATE,
    params: new Map([
      ['subjectType', 'Role'],
      ['subjectId', grant.subjectId],
      ['assignmentId', REPORT_RECORD_ID],
      ['roles', JSON.stringify(grant.roles)] // a JSON string, not an array
    ])
  });

  const request = PolicySignRequest.New(policy);
  request.setCustomExpiry(POLICY_EXPIRY_SECONDS);
  const initialized = BaseTideRequest.decode(await tc.createTideRequest(request.encode()));

  const [approval] = await tc.requestTideOperatorApproval([
    { id: `safespeak-report-${access}`, request: initialized.encode() }
  ]);
  if (approval?.status !== 'approved') {
    throw new Error(`signReportPolicy: admin approval ${approval?.status ?? 'missing'}`);
  }

  const approved = BaseTideRequest.decode(approval.request);
  approved.addPolicy(adminPolicyBytes);
  const signatures = await tc.executeSignRequest(approved.encode(), true);
  if (!signatures?.[0]) throw new Error('signReportPolicy: network returned no signature');

  policy.signature = signatures[0];
  return bytesToBase64(new Uint8Array(policy.toBytes()));
}
