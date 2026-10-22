# SafeSpeak — 2-Hour Parallel Website Build

**RMIT Hackathon 2026 · Challenge 2 / TideCloak / UNLOCKED**  
**Purpose:** Put this file in the VS Code project root. Each developer copies only the prompts for their assigned role into their AI coding agent.  
**Version:** 22 October 2026 · 120-minute build · WEBSITE ONLY, not a mobile app.

> **GOAL:** A working web prototype for **confidential campus bullying / sexual harassment reports**, where the browser encrypts the report using **real TideCloak**, the server stores ciphertext, and a real access test demonstrates what unauthorized users cannot decrypt. Use synthetic examples ONLY.
>
> **TIME RULE:** Freeze features by minute 85. If TideCloak integration is blocked, simplify UI instead of faking security.

## 0. Agree on roles NOW (no waiting)

| Role | Person | Primary ownership | Can start immediately with | Must deliver |
|---|---|---|---|---|
| **A — TideCloak Security Lead** | Most comfortable with Docker/auth | `features/security/` + generated Tide config/provider ONLY | Official quickstart + Tide docs | Real Tide login; encryption adapter; role tests; explicit status |
| **B — Frontend Lead** | Strongest UI / React | `features/ui/` + temporary `app/ui-preview/` | Hard-coded prop contracts + local mocks | Complete student/reviewer website UI, no backend dependency |
| **C — Backend + Integrator (you)** | You | `features/api/`, `app/api/reports/`; FINAL `app/home/` composition | Contract + in-memory store + route skeleton | POST/GET APIs; token verification; final wiring/build/tests |
| **D — Challenge 1 + Light QA/Delivery** | Teammate still doing C1 | `docs/`, `submission/`; **no code-critical path** | Challenge 1 work; prewritten demo script | Near the end: summary, 2-min video, zip, repo/form checks |

**Do not give D a blocking development task.** D may work on Challenge 1 until the last ~35 minutes; the other 3 must be able to complete the website without D.

### Independence plan (essential)

1. **Minute 0:** Share this exact Markdown in chat; roles + contracts are FROZEN. Each person begins locally; nobody needs another person's finished code.
2. **A** generates the official TideCloak starter as the **integration base**; keeps its original auth/provider, login redirect, `proxy.js` or `middleware.js` as produced.
3. **B** codes `features/ui/` using **local fake adapters only inside a preview route**. Must NOT fake security in the final application.
4. **C** codes the API and storage in a normal Next.js App Router test workspace. No new auth system. Unit-test storage independently; add real Tide token verification when A's starter is available.
5. **At integration (minute 60–75):** Copy/merge each role-owned folder into A's canonical starter. **C alone changes `app/home/page.jsx` to connect them.** D records the actual integrated app.
6. If each person uses Git branches, do **not** concurrently edit the root config, `package.json`, `app/layout.jsx`, or auth redirects. A owns generated starter files; C owns final merge.

## 1. Stack + non-goals

- **Website:** Next.js App Router, React, JavaScript / JSX (**match the official TideCloak starter**; do not migrate to TypeScript mid-hackathon).
- **Visual styling:** Existing starter CSS. Plain CSS / CSS modules or Tailwind **only if the scaffold already provides it**. Do not add an unrelated design system.
- **Identity, crypto and permissions:** `@tidecloak/nextjs` SDK + TideCloak Dev server (Docker).
- **API:** Next.js route handlers (`app/api/reports/route.js`); no separate FastAPI process.
- **Storage:** Server-only in-memory Map (demo data disappears on restart). No Supabase, PostgreSQL, Prisma or file uploads.
- **Data:** entirely synthetic. No victim name, phone, email, real evidence or sexual details.
- **Do NOT build:** mobile app, chatbot, NLP, ML, notifications, case tracking, uploads, dashboard analytics, blockchain, production deployment.

**Official:** https://docs.tide.org/get-started/Tidecloak%20Quickstart  
**E2EE:** https://docs.tide.org/Admin/e2ee  
**QEA:** https://docs.tide.org/Admin/SetupIGA  
**Tide MCP (optional for A):** https://docs.tide.org/ai-agent-pack

## 2. File structure — physically separated by role

The real quickstart may generate additional JS files. **Keep those unchanged**. This structure is the intended additional application code:

```text
safespeak/
├── app/                                  # generated Next.js App Router
│   ├── page.jsx                          # [A] preserve generated login page
│   ├── layout.jsx                        # [A] preserve Tide provider
│   ├── auth/redirect/page.jsx            # [A] preserve redirect
│   ├── home/page.jsx                     # [C] FINAL wiring ONLY
│   ├── api/reports/route.js              # [C] POST / GET bridge
│   ├── ui-preview/page.jsx               # [B] TEMP preview (REMOVE before final)
│   └── security-preview/page.jsx         # [A] TEMP crypto smoke test (REMOVE)
├── features/
│   ├── security/                          # [A] NO files shared with B/C
│   │   ├── useSafeSpeakSecurity.js        # export hook; stable facade
│   │   └── serialization.js              # Tide encrypted payload round-trip
│   ├── ui/                                # [B] ALL presentation in one folder
│   │   ├── SafeSpeakApp.jsx               # export component accepting props
│   │   ├── ReportForm.jsx
│   │   ├── ReviewPanel.jsx
│   │   ├── SafeSpeakApp.module.css         # or existing CSS
│   │   └── dev/mockAdapters.js            # TEMP preview only, remove later
│   └── api/                               # [C] data/service ownership
│       ├── reportStore.js                 # Map; no plaintext
│       ├── reportsClient.js               # browser fetch wrapper
│       └── verifyRequest.js               # Tide JWT verification adapter
├── docs/                                  # [D] light, non-blocking
│   ├── DEMO_SCRIPT.md
│   ├── TEST_MATRIX.md
│   └── RUN_INSTRUCTIONS.md
├── submission/                            # [D] work products, no real data
│   └── summary-draft.md
├── README.md                               # [D] update at submission, short
├── tidecloak.json / tidecloakAdapter.json  # [A] whatever starter generates
├── proxy.js / middleware.js               # [A] preserve starter-generated file
├── package.json                           # [A] starter owns until final merge
└── SafeSpeak_VSCode_Parallel_Build.md      # team contract + prompts
```

**If starter places files under `src/`**, prepend `src/` to these app/ and features/ paths everywhere. Keep the existing scaffold convention; do not create both `app/` and `src/app/`.

### Hard file-ownership rule

- A can edit starter-owned Tide config and `features/security/**`; **not B/C folders**.
- B edits `features/ui/**`, temporary UI preview; **not global `app/layout.jsx`, `app/home/page.jsx`, API**.
- C edits `features/api/**`, `app/api/reports/route.js`, and **final** `app/home/page.jsx`; C does not rewrite A's authentication config.
- D edits docs/submission only. Do not commit `.env`, real credentials, `node_modules/`, `.next/` or raw sensitive data.

## 3. CONTRACTS — freeze before anyone starts coding

**These are TEAM-DESIGNED contracts**, not Tide SDK API signatures. A/C adapt the real SDK behind them.

### 3.1 Record schema (all data encrypted except id and timestamp)

```js
// EncryptedReport — the one shared shape across all components
{
  id: "r_123",                     // server-generated opaque id
  createdAt: "2026-10-22T06:00:00.000Z",
  ciphertext: "<serialized-Tide-payload>" // OPAQUE string; never plaintext
}
```

**Protected plaintext** is the single string the student types, including all incident details; do **not** send title, category, reporter name, incident type, or excerpts as unencrypted top-level API fields. Encrypt text in browser using Tide's `report` tag.

### 3.2 REST API — C implementation, B consumer, A token supplier

| Operation | Request | Success | Failure |
|---|---|---|---|
| `POST /api/reports` | `Authorization: Bearer <Tide access token>` + JSON `{ "ciphertext": "..." }` | `201` `{ "id": "r_...", "createdAt": "ISO-8601" }` | `400` invalid; `401` no/invalid token; `413` oversized; `500` server error |
| `GET /api/reports` | `Authorization: Bearer <Tide access token>` | `200` `{ "reports": [{"id":"...","createdAt":"...","ciphertext":"..."}] }` | `401` no/invalid token; `500` server error |

Do not invent `/api/login`, `/api/decrypt`, `/api/encrypt`, `/api/users` or `/api/admin`: **Tide SDK in browser does crypto; TideCloak does auth**. No PATCH/DELETE needed.

**Request/response exact examples** (illustrative strings; ciphertext isn't real):

```http
POST /api/reports HTTP/1.1
Content-Type: application/json
Authorization: Bearer <valid TideCloak access token>

{"ciphertext":"<opaque-serialized-payload>"}
```

```json
// 201
{"id":"r_9dc2","createdAt":"2026-10-22T06:00:00.000Z"}
```

```http
GET /api/reports HTTP/1.1
Authorization: Bearer <valid TideCloak access token>
```

```json
// 200
{"reports":[{"id":"r_9dc2","createdAt":"2026-10-22T06:00:00.000Z","ciphertext":"<opaque-serialized-payload>"}]}
```

```json
// generic error (400/401/413/500)
{"error":"Short human-readable message"}
```

**Security rules:**
1. Verify token **server-side**, using installed TideCloak SDK/server utility and the starter's actual config. A browser-provided `role`, `userId`, `isAdmin` is NOT proof.
2. `POST` accepts **only** `ciphertext` as nonempty string; reject extra fields and overly large payloads (e.g. 64 KiB); never log contents.
3. `GET` may return ciphertext to any authenticated user for this **demo only**. Metadata kept minimal. Authorization to *decrypt* is enforced by TideCloak roles in the browser SDK. This is **not production data minimization**.
4. Encryption shape is opaque. Checking that a string exists **does not cryptographically prove** a client submitted ciphertext (a malicious client could lie). Treat it as a demo contract and disclose the limitation.
5. Keep report store server-side. Restart clears it, no durable records. Do not simulate API auth denial using a flag.

### 3.3 A → B/C: security adapter contract

```js
// features/security/useSafeSpeakSecurity.js
export function useSafeSpeakSecurity() {
  return {
    authenticated: false,              // actual SDK value
    login: async () => {},              // real Tide login
    logout: async () => {},             // real Tide logout
    token: null,                        // Tide access token or null
    canEncrypt: false,                  // actual realm role check
    canDecrypt: false,                  // actual realm role check
    encryptReport: async (text) => "", // browser E2EE, RETURNS serialized ciphertext STRING
    decryptReport: async (ciphertext) => "" // browser E2EE, RETURNS plaintext STRING
  };
}
```

**SDK integration hint (verified in Tide docs, but inspect installed package!):**

```js
const { authenticated, login, logout, token, hasRealmRole,
        doEncrypt, doDecrypt } = useTideCloak();
const [encrypted] = await doEncrypt([{ data: plaintext, tags: ['report'] }]);
const [decrypted] = await doDecrypt([{ encrypted, tags: ['report'] }]);
```

Required Tide realm roles: `_tide_report.selfencrypt` / `_tide_report.selfdecrypt`. **Never assign decrypt to `default-roles-*`.** Create changes, approve in QEA, assign to correct test accounts. Serialization must handle actual SDK output without losing bytes/types; test `encrypt -> serialize -> deserialize -> decrypt` after JSON POST/GET round trip.

**CRITICAL UNVERIFIED ASSUMPTION:** A student encrypting under their Tide identity **may not** imply a different investigator identity can decrypt merely because it has `_tide_report.selfdecrypt`. The documentation's basic example does not establish that cross-user sharing works. **A must test Reporter A → Investigator B and ask Tide MCP for a supported shared-data mechanism if this fails. DO NOT fake an investigator decrypt success.**

### 3.4 C → B: API client contract

```js
// features/api/reportsClient.js
export function makeReportsClient(token) {
  return {
    createReport: async (ciphertext) => ({ id: 'r_...', createdAt: '...' }),
    listReports: async () => ([ { id: 'r_...', createdAt: '...', ciphertext: '...' } ])
  };
}
```

Real implementation uses `fetch('/api/reports', { method: 'POST', headers: {'Content-Type':'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify({ciphertext}) })` and `GET` with bearer token. **Do not call these functions with plaintext.** Throw meaningful errors on non-2xx. No hardcoded token or fake auth.

### 3.5 B → C: UI contract

```jsx
// features/ui/SafeSpeakApp.jsx
export default function SafeSpeakApp({ security, api }) {
  // security: exact object from useSafeSpeakSecurity()
  // api: exact object from makeReportsClient(security.token)
  // Render: login notice / student form / reviewer list / decrypt button
}
```

B must NEVER import Tide directly, backend storage directly, or mutate `app/home/page.jsx`. Its preview uses local `mockAdapters.js`, clearly labelled **UI PREVIEW ONLY**, never submitted as actual crypto/access control.

### 3.6 Ownership of the only integration composition

```jsx
// app/home/page.jsx — ONLY C edits this during integration
'use client';
import SafeSpeakApp from '../../features/ui/SafeSpeakApp';
import { useSafeSpeakSecurity } from '../../features/security/useSafeSpeakSecurity';
import { makeReportsClient } from '../../features/api/reportsClient';

export default function HomePage() {
  const security = useSafeSpeakSecurity();
  const api = makeReportsClient(security.token);
  return <SafeSpeakApp security={security} api={api} />;
}
```

**This is an interface illustration, not a promise the scaffold uses these exact route paths.** C adapts imports to `src/` if generated there. Keep TideCloak provider from generated `app/layout.jsx`. To avoid routing conflict, follow whatever route the starter uses after login.

## 4. Two-hour clock + hard decision gates

| Elapsed time | A: Security | B: Frontend | C: Backend/integration | D: Challenge 1/light delivery |
|---|---|---|---|---|
| **00–10 min** | Docker + official starter; confirm scaffold | Build UI components against mocks | Build Map + API contract | Continue C1; skim submission list |
| **10–30 min** | Tide login; setup `report` roles; smoke encryption | Student textarea, reviewer list, empty/loading/error states | Token verification + POST/GET routes | C1; create synthetic sample text |
| **30–55 min** | **Critical:** actual cross-user decrypt test; role denial | UI preview works independently | Unit/smoke tests and error handling | C1 |
| **55–75 min** | Export final security facade; unblock C | Handoff `features/ui/`; fix missing callbacks | Merge A/B folders; connect `app/home/page.jsx` | C1, then help smoke tests if free |
| **75–90 min** | Role + E2EE debug ONLY | Fix integration only | Full real browser roundtrip | Start summary/video outline |
| **90–105 min** | Freeze features; screenshot real proof | Freeze features | Final bugfix + git push | Film actual demo; package files |
| **105–120 min** | Help final test | Help final test | Public repo / run instructions check | Finish 2-min video + form |

**Gate 1 — minute 25:** Did A achieve real Tide login and single-account encryption? If not, STOP UI polish and help setup.  
**Gate 2 — minute 50:** Did Reporter A → Investigator B decrypt actually succeed? If not, **do not claim cross-user access**. Ask Tide MCP/support; narrow demonstration to verified capabilities, flag limitations in summary.  
**Gate 3 — minute 85:** Freeze changes except actual security/integration bugs. Protect submission time.  
**Gate 4 — minute 105:** Submit a smaller but honest working app over an unfinished fancy one.

## 5. Agent prompts — use IN ORDER (one prompt at a time)

> **Instructions for all agents:** Read this file first. Only edit owned paths. Follow contracts exactly. Keep the existing TideCloak scaffold and its package versions. Do not invent functions or claim a test passed without running it. After each prompt, report changed files, actual tests run, and blockers.

### A / Security — Prompt A1: official starter and real auth

```text
Read SafeSpeak_VSCode_Parallel_Build.md sections 0-4 fully. I am Role A (TideCloak security). Website only, 2-hour hackathon.
Use the OFFICIAL TideCloak Next.js quickstart: https://docs.tide.org/get-started/Tidecloak%20Quickstart . Start Docker TideCloak and scaffold exactly as official docs; preserve generated config, login, redirect, provider, middleware/proxy and Next.js version. Do not replace with a fresh generic Next app. Use JavaScript/JSX if this is the generated format.
Within 10 minutes report: exact generated folder structure; real login page works/not; Docker/env requirements; exact JSON config filename. Create features/security/ folder. Do not touch features/ui/ or features/api/. Do not commit credentials. If prerequisites block progress, state the error verbatim; never simulate auth.
```

### A / Security — Prompt A2: real E2EE adapter

```text
I am Role A. Read https://docs.tide.org/Admin/e2ee and inspect @tidecloak/nextjs package exports/types in THIS starter.
Build ONLY features/security/useSafeSpeakSecurity.js and features/security/serialization.js. Export useSafeSpeakSecurity() returning authenticated, login, logout, token, canEncrypt, canDecrypt, encryptReport(plaintext)->Promise<string>, decryptReport(ciphertext)->Promise<string> exactly as in the contract.
Use Tide doEncrypt([{data:plaintext,tags:['report']}]) and doDecrypt([{encrypted,tags:['report']}]) with actual SDK signatures. Serialize actual encrypted payload in a lossless way that survives JSON POST/GET; if output is Uint8Array or object, inspect real type, don't blindly String() it. Add a temporary app/security-preview/page.jsx page for real encrypt->serialize->deserialize->decrypt testing only. Include a test note: client-side encryption never POSTs plaintext.
Give me a concise verified result and any missing realm roles. Do not fake encrypted values or decryption.
```

### A / Security — Prompt A3: permissions and CROSS-USER reality check

```text
I am Role A. In the Tide admin console, set up _tide_report.selfencrypt for Reporter and _tide_report.selfdecrypt for Investigator; explicitly DO NOT grant decrypt to default-roles-* or School Admin. Tide role creation/assignment requests require QEA approvals; verify COMMITTED status.
Execute and document these REAL tests: (1) Reporter user encrypts; (2) same user decrypts only if actually permitted; (3) Investigator B decrypts a ciphertext created by Reporter A; (4) School Admin without decrypt role fails to decrypt. Do not simply assume selfencrypt/selfdecrypt roles support cross-account sharing. If (3) fails, consult Tide MCP 'set up encrypted data sharing between users with Tide', and clearly report the unsupported flow / required changes; do not simulate success. Return actual role assignments and tests PASSED/FAILED/BLOCKED.
IMPORTANT: One realm admin has QEA threshold 1. Never claim multi-admin approval with only one admin.
```

### B / Frontend — Prompt B1: UI INDEPENDENTLY

```text
Read SafeSpeak_VSCode_Parallel_Build.md sections 0-4. I am Role B, frontend, WEBSITE ONLY, React/Next.js JavaScript. Do not edit app/layout.jsx, app/home/page.jsx, app/api/**, tidecloak config, package.json, features/security/** or features/api/**.
Create features/ui/SafeSpeakApp.jsx, ReportForm.jsx, ReviewPanel.jsx, SafeSpeakApp.module.css, dev/mockAdapters.js. Interface MUST be default export SafeSpeakApp({security,api}). security has authenticated/login/logout/token/canEncrypt/canDecrypt/encryptReport/decryptReport; api has createReport(ciphertext) / listReports().
Design a clean university-grade desktop responsive website: SafeSpeak name, short confidentiality explanation, Student Submit view with ONE textarea, Investigator Review view with ciphertext preview and Decrypt button, login/logout state, loading/errors, a visible 'Demo uses synthetic data' disclaimer. No uploads, chatbot, database login, status tracker. Use CSS already available; no new library. Create app/ui-preview/page.jsx importing mockAdapters solely for local preview, label it UI PREVIEW ONLY. Ensure UI compiles even when A/C modules do not exist. Never present mock access-denied screens as real security proof.
```

### B / Frontend — Prompt B2: connect exact contracts and no plaintext leak

```text
I am Role B. Inspect my UI and enforce contract strictly. On submit: await security.encryptReport(text) FIRST, verify ciphertext is a nonempty opaque string, then await api.createReport(ciphertext). Never send text/title/category/user data to the backend. On Review: await api.listReports(), display id and timestamp; call security.decryptReport(ciphertext) only on clicking Decrypt. If canDecrypt false, show a disabled action and an honest 'No decrypt permission' message. A real failed decrypt should show SDK error, not a fabricated 'blocked' animation.
Keep SafeSpeakApp({security,api}) prop-driven; do not import Tide directly. Confirm CSS and keyboard/accessible controls. Report changed files, exports, and an example integration usage, then hand off only features/ui/ to C. Remove preview route before final submission (C can do this at merge).
```

### C / Backend (you) — Prompt C1: implement storage/API independent of A

```text
Read SafeSpeak_VSCode_Parallel_Build.md sections 0-4. I am Role C, backend + final integrator. Next.js App Router, JavaScript, one project only.
Create features/api/reportStore.js with a server-only Map and createReport/getReports. Store ONLY {id,createdAt,ciphertext}, no plaintext, no real PII, no persistence. Create features/api/reportsClient.js exposing makeReportsClient(token) with createReport(ciphertext) and listReports(). Implement exact REST response shapes in app/api/reports/route.js: POST /api/reports accepts {ciphertext} ONLY and returns 201 {id,createdAt}; GET returns 200 {reports:[{id,createdAt,ciphertext}]}; 400 malformed/extra fields, 401 invalid/missing JWT, 413 >64KiB, JSON {error:message} on failure. Use crypto.randomUUID() for ids. Mark Node.js runtime and explain storage reset on restart.
For the token check create features/api/verifyRequest.js using ACTUAL TideCloak server verifier @tidecloak/nextjs/server and REAL starter config; inspect installed export signature, support Bearer token. Never fake JWT validation; if security SDK/config unavailable, leave a clearly labelled blocker and unit-test only pure storage while waiting. Do not build FastAPI or Supabase. Do not edit security/UI folders.
```

### C / Backend — Prompt C2: integration owner

```text
I am Role C. Integrate independently created features/security (A), features/ui (B), features/api (C) into the existing official TideCloak Next.js starter. Only I edit app/home/page.jsx. Use useSafeSpeakSecurity(), makeReportsClient(security.token), and <SafeSpeakApp security={security} api={api} />. Preserve existing Tide provider, login redirects, config files and proxy/middleware. Match actual scaffold path conventions, and do not create conflicting src/app and app roots.
Run npm install, npm run dev; verify login, POST, GET and actual SDK encrypt/decrypt through stored ciphertext. Ensure auth header is sent, server token verified, no plaintext appears in DevTools Network request body or server storage, unauthorized decrypt uses REAL SDK failure. If A reports cross-user decrypt unsupported, adapt UI/copy to what is actually proven rather than faking. Resolve merge conflicts only in owned root integration file. Return a pass/fail checklist and final URL/commands.
```

### C / Backend — Prompt C3: hardening and merge smoke

```text
I am Role C. Do a 10-minute final SafeSpeak security + integration smoke test: GET/POST unauthenticated -> 401; POST missing/extra/plaintext fields -> 400; valid session -> store opaque ciphertext only; browser cannot see plaintext in network POST; reset-on-restart limitation is documented; no real info in logs; no secret files or mockAdapters/preview routes in final repo. npm run build if time permits. Report exact tests actually run, not imagined results. Freeze code once submission video recording starts.
```

### D / Challenge 1 + light delivery — Prompt D1: minimal draft while C1 runs

```text
I am Role D. Continue Challenge 1 as my primary work; Challenge 2 tasks must NOT block the other three. Using the RMIT briefing PDF pp.19-26, make docs/DEMO_SCRIPT.md (2-min narration), docs/TEST_MATRIX.md (Reporter encrypt, School Admin denied, Investigator decrypt: PASS/FAIL/BLOCKED), and submission/summary-draft.md (problem, trust constraint, innovation, TideCloak, real results, limitations). Use ONLY synthetic reports. Do not make claims the app has not demonstrated. No coding or API edits.
```

### D / Challenge 1 + light delivery — Prompt D2: FINAL deliverables (~last 35 min)

```text
I am Role D. Prepare delivery from the ACTUAL final integrated SafeSpeak app only. Record 2-minute screen demo showing (a) issue, (b) real submit->encrypted storage, (c) real unauthorized attempt if implemented, (d) real decrypt if implemented, (e) honest limitations. Produce a real summary.doc (or additionally summary.docx if tool requires) and sourcecodes.zip excluding .env, credentials, node_modules, .next, .git; write docs/RUN_INSTRUCTIONS.md and repository README with at most 300 words overview answering Tide website's five questions. If anything is mocked, identify explicitly.
RMIT briefing PDF pp.21-22,26 requires PUBLIC GitHub repo containing sourcecodes.zip, summary.doc, video.mp4 and launch instructions; team name <university>_<campus>_<team>_C2; Google Form https://forms.gle/HRHYjnqB86j1LFS97. Tide website ALSO asks for README overview and video.mp4 <100MB: satisfy BOTH sets of instructions. Check repo public, final git commit, form confirmation before 6:00 PM MYT. Return missing-item list, not an invented success claim.
```

## 6. Real demo test matrix (D collects, A/C run)

| ID | Action | Expected observable evidence | Honest limitation |
|---|---|---|---|
| T1 | Reporter logs in through Tide | Actual authenticated SDK session | Test account, not real student |
| T2 | Reporter types synthetic report and submits | Browser encryption success; network POST contains **only serialized ciphertext** | Client can still choose to violate contract; app is prototype |
| T3 | API receives without access token | 401 from **server verifier** | No fake client-only 401 |
| T4 | Reviewer GET gets encrypted record | Ciphertext and opaque id/time, never original report | GET visibility restricted only to logged-in users in demo |
| T5 | Non-decrypt-role School Admin clicks decrypt | Real SDK denies operation | UI disabled state alone is not proof |
| T6 | Investigator account decrypts Reporter A's ciphertext | **Must test separately; NOT guaranteed by E2EE tutorial** | If fails, mark BLOCKED and describe required shared-data design |
| T7 | Restart app/server | Data may be cleared | In-memory storage is deliberately nonproduction |
| T8 | Check repository secrets | No env creds / sensitive samples | Do not publish generated confidential config if it contains secrets |

## 7. Script for the actual 2-minute demo

- **0:00–0:20 — Situation:** Students fear retaliation if confidential reports leak to campus personnel.
- **0:20–0:45 — Product:** Show real student login and synthetic report submission.
- **0:45–1:05 — What Tide adds:** Show real encrypted payload in network/server storage (no plaintext).
- **1:05–1:30 — Access test:** Show actual unauthorized decryption failure, if confirmed; otherwise state precisely what is demonstrated.
- **1:30–1:50 — Authorized use:** Show real permitted decrypt; **do not substitute same-user decrypt for another user's access** without saying so.
- **1:50–2:00 — Outcome:** A safer architecture reducing reliance on one trusted server; explicitly mention prototype limits.

### Critical language for judges

**Safe statement:** "In this verified demo, TideCloak encrypts sensitive report text in the browser, the server only stores ciphertext, and decrypt operations follow Tide's configured permissions."  
**Unsafe if unproven:** "No admin can ever view student identity", "Anonymous reporting", "Any investigator can decrypt a student's report", "Multi-admin approval is enabled".  
**QEA reality:** With **one** `tide-realm-admin`, threshold is **one**. Do not claim no single admin can approve configuration changes without a real multi-admin quorum.

## 8. Submission checklist — PDF + Tide site combined

- [ ] Challenge 1 valid Kaggle submission completed separately; D can own.
- [ ] SafeSpeak publicly accessible **GitHub repository**, team named `<university>_<campus>_<team>_C2`.
- [ ] `sourcecodes.zip` contains runnable source; no secrets; exclude build dependencies.
- [ ] `summary.doc` covers problem, value, trust constraint, Tide role, verified results, limitations.
- [ ] `video.mp4`: real working demonstration, about 2 minutes, under 100 MB.
- [ ] `docs/RUN_INSTRUCTIONS.md` includes Docker, Tide enrollment, npm commands and role provisioning notes.
- [ ] `README.md` has ≤300-word project overview based on the Tide site's five README prompts, plus separate setup instructions.
- [ ] All simulations/mock screens explicitly labelled; temp preview routes removed.
- [ ] Submit public repo link via https://forms.gle/HRHYjnqB86j1LFS97 **before Thu 22 Oct 2026, 6:00 PM MYT**.

> **Different official formats:** RMIT participant briefing (pp.21–22, 26) calls for `sourcecodes.zip`, `summary.doc`, `video.mp4`, and run instructions. The Tide website additionally requests a short README project overview. This checklist deliberately satisfies **both**; confirm with a live organiser if the form differs.

## 9. Official references

1. RMIT Hackathon 2026 participant PDF, **Challenge 2 pages 14–26** (problem, rubric, deliverables, five-hour event timeline and 6 PM MYT submission).
2. UNLOCKED challenge: https://tide.org/unlocked/
3. TideCloak Quickstart: https://docs.tide.org/get-started/Tidecloak%20Quickstart
4. Tag-based E2EE roles + API: https://docs.tide.org/Admin/e2ee
5. Quorum Enforced Authorization: https://docs.tide.org/Admin/SetupIGA
6. Tide AI Agent MCP: https://docs.tide.org/ai-agent-pack

**Stop rule:** A smaller **genuine** integrated TideCloak website beats a polished but mocked security demo. The team should prioritize factual proof and on-time submission over extra features.
