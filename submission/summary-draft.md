# SafeSpeak: Summary Draft

> OWNER: Role D · Challenge 2 (TideCloak / UNLOCKED) · Claim only what the app has demonstrated.
> Source for `summary.doc`. Keep it consistent with the README project overview.

## Problem

Students who experience bullying or sexual harassment on campus often do not report it. They fear the report will leak to the person involved, to that person's colleagues, or to anyone with access to the university's systems. When reports go unmade, the institution cannot act on them.

## Trust constraint

Every conventional reporting portal requires students to trust whoever operates it. IT staff, database administrators, a compromised server, or a senior staff member protecting a colleague can all read the reports. Encrypting data on the server does not remove this risk, because the server holds the key. What holds reporting back is this need for trust, not a missing technology.

## Innovation

SafeSpeak makes confidentiality a property of the system's cryptography, so students do not have to trust the institution. A report is encrypted in the student's browser before it is sent. The server stores only ciphertext and has no decrypt function. Only an account holding the investigator decrypt role can recover the text, and that role is granted through TideCloak's governed change requests, not by changing a row in the app's database.

## How TideCloak is used

- **Authentication:** students, investigators and school admins sign in through TideCloak. Every API request carries a TideCloak access token that the server verifies with `verifyTideCloakToken`. Report ownership comes only from verified claims.
- **End-to-end encryption:** the browser calls the Tide SDK to encrypt the report under the `report` tag. Decryption keys are threshold-split across Tide's network, so neither the SafeSpeak server nor TideCloak itself holds them whole.
- **Authorisation:** `_tide_report.selfencrypt` is assigned to reporters and `_tide_report.selfdecrypt` only to investigators. Accounts without the decrypt role, including the school admin, cannot decrypt.

## Verified results

| Check | Result | Evidence |
|---|---|---|
| Backend unit and route tests (validation, 64 KiB limit, ownership, no plaintext fields, fail-closed auth) | PASS, 23/23 | `node --test "features/api/__tests__/*.test.js"` on 2026-10-22 |
| UI behaviour with simulated adapters (draft retention, explicit decrypt, plaintext cleared on view or session change, 390px layout) | PASS (simulated only) | [features/ui/README.md](../features/ui/README.md) |
| End-to-end Tide tests T1–T8 | TODO: copy from [docs/TEST_MATRIX.md](../docs/TEST_MATRIX.md) | |

## Limitations

- This is a hackathon prototype that uses synthetic data only. It is not a deployable incident-management system.
- Reports are held in server memory and are lost on restart. There is no evidence retention or audit trail.
- Reporting is confidential, not anonymous. The server stores the reporter's verified account ID so that it can check ownership.
- The dev realm has a single admin, so approval threshold is one. A real deployment would need a multi-admin quorum for role changes.
- Cross-account decryption (Reporter → Investigator) must be confirmed in T6. If T6 is not PASS, state that here and in the README.
