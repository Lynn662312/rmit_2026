# Member C (Backend + Integrator) Checklist

> Tick `[x]` only after you have actually run or seen it. Contract: [API_CONTRACT.md](API_CONTRACT.md) (FROZEN v1.0).
> Legend: ⛔ = blocked on another member.

## Status vs build guide prompts (updated 3:27 PM, 2026-10-22)

| Guide prompt | Status |
|---|---|
| **C1: storage + API + verifier** | ✅ **DONE** (all 5 contract endpoints, client, 23 tests passing). Only remaining part: run against the installed SDK → ⛔ waiting for A's starter |
| **C2: integration** | ⛔ Not started: waiting for A's starter + B's UI |
| **C3: hardening smoke test** | 🟡 Partly covered by unit tests (401 / 400 / 413 / no plaintext fields). Build + browser checks pending integration |

**Deadline plan:** settle by **4:30 PM**, then demo.
- 3:30: commit + push backend branch, open PR
- 3:35–4:00: help A get the starter (real login) pushed; ask A the 4 questions
- 4:00–4:15: C2 integration: merge A + B, `app/home/page.jsx`, `npm run dev`, real POST/GET
- 4:15–4:30: C3 smoke + `npm run build`, remove preview/mock files → freeze, hand to D

## Phase 1: Contract and API code (no TideCloak needed)

- [x] `docs/API_CONTRACT.md` written (FROZEN v1.0)
- [x] API contract merged to `main` (PR #2) — still tell A, B, D to pull
- [x] `features/api/reportStore.js`: in-memory Map, stores `{id, createdAt, ciphertext, ownerSub}`, never returns `ownerSub`
- [x] `features/api/http.js`: body validation (only `ciphertext`, JSON only, 64 KiB → 413), id format, `no-store` responses
- [x] `features/api/verifyRequest.js`: real `verifyTideCloakToken` adapter, fails closed (503) without SDK/config
- [x] `app/api/reports/route.js`: POST + GET
- [x] `app/api/reports/[id]/route.js`: GET + PATCH + DELETE (`await params`)
- [x] `features/api/reportsClient.js`: `createReport`, `listReports`, `getReport`, `updateReport`, `deleteReport`
- [x] Unit/route tests pass: `node --test "features/api/__tests__/*.test.js"` (23/23 on 2026-10-22)
- [ ] Backend code committed and merged to `main` via PR

## Phase 2: Real TideCloak verification (needs A's starter)

- [ ] ⛔ A has merged the official starter: `package.json` with `@tidecloak/nextjs`, `tidecloak.json` (or `tidecloakAdapter.json`) at the repo root
- [ ] `npm install` succeeds
- [ ] Re-run backend tests after the merge (invalid token should now be **401**, not 503)
- [ ] ⛔ A confirms the access token is a plain Bearer token (DPoP off, or tell C how DPoP works)
- [ ] ⛔ A confirms the investigator role name and that it appears in the token (realm or client roles)
- [ ] Set `INVESTIGATOR_ROLE` in `features/api/verifyRequest.js` to the confirmed role
- [ ] Real token: POST → 201 `{id, createdAt}`
- [ ] Real token: GET list → reporter sees only own reports
- [ ] Real token: investigator GET list → sees all reports
- [ ] Real token: school admin (no investigator role) → sees only own (empty) list; GET other's id → 404
- [ ] Real token: owner PATCH → 200; investigator PATCH other's → 403; other user → 404
- [ ] Real token: owner DELETE → 204 empty body; next GET → 404
- [ ] Expired / tampered token → 401

## Phase 3: Integration (needs A + B)

- [x] Backup frontend written by C on `feature/integration` (`features/ui/*`, `app/ui-preview/`): use only if B's UI is not ready
- [x] `app/home/page.jsx` composition written (`useSafeSpeakSecurity` → `makeReportsClient` → `SafeSpeakApp`)
- [ ] Backup UI compiles and `/ui-preview` renders (needs `npm install` from A's starter)
- [ ] ⛔ B hands off `features/ui/` (uses `makeReportsClient`)
- [ ] ⛔ A hands off `features/security/useSafeSpeakSecurity.js`
- [ ] Create `app/home/page.jsx` (or the starter's post-login route) wiring `useSafeSpeakSecurity` → `makeReportsClient(security.token)` → `<SafeSpeakApp />`
- [ ] Starter files (layout, provider, redirect, middleware/proxy, config) left unchanged
- [ ] `npm run dev`: real login works
- [ ] Browser submit: DevTools Network POST body contains **only** `{"ciphertext": ...}`
- [ ] Browser review: list shows ciphertext; Decrypt uses the real SDK
- [ ] Unauthorized decrypt shows a **real** SDK failure (not a fake UI message)
- [ ] ⛔ A's cross-user test (Reporter A → Investigator B decrypt) result recorded: PASS / FAIL / BLOCKED

## Phase 4: Hardening and submission

- [ ] `npm run build` passes
- [ ] Remove `app/ui-preview/`, `app/security-preview/`, `features/ui/dev/mockAdapters.js`
- [ ] No `.env`, credentials, `node_modules/`, `.next/` in the repo
- [ ] Server logs contain no ciphertext, tokens or report text
- [ ] Results sent to D for `docs/TEST_MATRIX.md` and `docs/RUN_INSTRUCTIONS.md`
- [ ] Final push; repo public; code frozen before video recording

---

## How to test

### Now (no TideCloak needed)

```powershell
node --test "features/api/__tests__/*.test.js"
```

Expect `pass 23, fail 0`. The `failing closed` log lines are expected: they show the API refuses tokens while the SDK/config is missing.

### After A's starter is merged

1. `npm install`, then `npm run dev`.
2. Log in in the browser and copy the access token. Ask A how the starter exposes it, or temporarily log `security.token`. Never commit a token.
3. Call the API (PowerShell, `curl.exe`):

```powershell
$T = "<paste-access-token>"
# Create
curl.exe -i -X POST http://localhost:3000/api/reports -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{\"ciphertext\":\"test-ct-1\"}'
# List
curl.exe -i http://localhost:3000/api/reports -H "Authorization: Bearer $T"
# Read / update / delete one (use the id from Create)
curl.exe -i http://localhost:3000/api/reports/<id> -H "Authorization: Bearer $T"
curl.exe -i -X PATCH http://localhost:3000/api/reports/<id> -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{\"ciphertext\":\"test-ct-2\"}'
curl.exe -i -X DELETE http://localhost:3000/api/reports/<id> -H "Authorization: Bearer $T"
# Negative checks
curl.exe -i http://localhost:3000/api/reports                                    # expect 401
curl.exe -i -X POST http://localhost:3000/api/reports -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{\"ciphertext\":\"x\",\"title\":\"plain\"}'   # expect 400
```

4. Repeat with a second account's token to check ownership (403/404).

`test-ct-1` is a placeholder string for API testing only. Real reports must be encrypted in the browser by A's `encryptReport`.
