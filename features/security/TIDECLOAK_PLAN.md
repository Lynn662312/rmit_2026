# Where TideCloak fits in SafeSpeak

The brief: build the app as though TideCloak protects it, plan where it fits with
Tide's MCP, and simulate its sign-in, roles and access checks for now.
Sources are Tide MCP v1.9.33: scenario `relationship-attestation`, playbooks
`configure-e2ee-roles-and-policies`, `setup-forseti-e2ee` and `verify-jwt-server-side`,
and the `@tidecloak/*` 0.13.33 type definitions.

## Simulated now, and the real Tide piece it stands in for

| Concern | Simulated now (`features/security`) | Real TideCloak |
|---|---|---|
| Sign-in | `signIn(persona)` with 3 demo personas; unsigned `sim.` token in sessionStorage | Tide login through the enclave; `useTideCloak().login()` |
| Token check on the server | `verifySimulatedToken(authHeader, roles)`: unsigned, forgeable | `verifyTideCloakToken(tcConfig, token, roles)` from `@tidecloak/nextjs/server`, local JWKS from `tidecloak.json`, plus DPoP |
| Roles | Hard-coded in `PERSONAS` | Realm roles, each assignment a change request approved in the enclave |
| Access check | `checkAccess()` in the browser | The ORK network runs `RelationshipAttestation:1` on every encrypt and decrypt |
| Encryption | Real AES-256-GCM, but with a demo key shipped in the code | Tide threshold encryption; no single party holds the key |
| Ciphertext format | `sim1:<b64(iv‖ct)>` | `tide1:s:<b64>` or `tide1:b:<b64>` (serialization.js) |

The server stores ciphertext only in both modes. What simulation does not give you: an
identity, an enforced role or a protected key. Anyone with the code can forge a
token or decrypt a report.

## Roles (identical in both modes)

| Account | Realm roles | Can |
|---|---|---|
| default-roles-* | `_tide_enabled`, `appUser`, `_tide_report.selfencrypt` | nothing on its own; never a decrypt role |
| Reporter A | default + `_tide_encryptor` | encrypt; cannot decrypt |
| Investigator B | default + `_tide_report.selfdecrypt`, `_tide_decryptor` | decrypt any report; cannot encrypt |
| School Admin C | default only | neither |

## Why not plain self-encryption

Tide's self-encryption (`doEncrypt` with no policy) binds the ciphertext to the user
who encrypted it, so Investigator B could never read Reporter A's report. Sharing
needs two policies on record `report`, each signed once by the realm admin in the
enclave:

- **write:** subject Role `_tide_encryptor`, roles `["_tide_encryptor"]`
- **read:** subject Role `_tide_decryptor`, roles `["_tide_decryptor"]`

Pass the policy as the second argument of `IAMService.doEncrypt` / `doDecrypt`. The
building blocks are in `reportPolicies.js` and `../../safespeak-starter/init/fetch-admin-policy.sh`.

## Switching to real Tide

1. Get the realm licensed. `npm run init` is blocked by Tide's `FinalizeWallet` 500.
2. Assign the roles above and approve each change request. With one admin, the threshold is 1.
3. Sign the two policies, then wire `reportPolicies.js` into the real hook.
4. Set `NEXT_PUBLIC_SAFESPEAK_TIDE_MODE=real`.
5. Role C swaps `verifySimulatedToken` for `verifyTideCloakToken`.
