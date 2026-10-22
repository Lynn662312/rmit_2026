[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

# SafeSpeak

## Project overview

_SafeSpeak is a campus harassment-reporting website where reports are encrypted in the student's browser, so only the designated investigator can read them, not the university's servers or administrators._

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

A reporting channel students can use without trusting the institution that runs it. The report stays confidential because of how it is encrypted, not because of a privacy policy.

### 2. Trust constraint insight

Students under-report because whoever runs the system can read it: IT staff, database admins, attackers, or the accused's colleagues. Server-side encryption doesn't help, because the server holds the key. If no single party ever holds the key, a reporting channel stays confidential even from its operator.

### 3. Value & impact

- **Students** report without fearing leaks or retaliation.
- **Universities** hear about incidents that now go unreported, and stop holding readable sensitive records.
- **Example:** a student reports a tutor. A school administrator with full server access sees only ciphertext. Only the investigator can decrypt it.

### 4. Why TideCloak matters

- **Identity:** TideCloak sign-in. The server verifies every token and takes ownership from verified claims.
- **Browser-side encryption:** reports are encrypted under Tide's `report` tag before leaving the browser. Tide splits the key across its decentralised network, so our server never holds it.
- **Policy-gated decryption:** only accounts with `_tide_report.selfdecrypt` can decrypt, granted through TideCloak's governed change requests, not the app's database.

With ordinary login, the operator could read every report. With TideCloak, it can't.

### 5. Prototype & storytelling

[Demo video](video.mp4) highlights:

1. A student signs in with Tide and submits a synthetic report.
2. The Network panel shows the POST body is only `{ "ciphertext": … }`.
3. A School Admin sees only ciphertext, and Tide refuses to decrypt it.
4. The Investigator decrypts the report on demand.

---

## Setup

Full instructions, including role provisioning and troubleshooting, are in [docs/RUN_INSTRUCTIONS.md](docs/RUN_INSTRUCTIONS.md).

**Prerequisites:** Node.js 20.9+, Docker, and a bash shell with `curl` and `jq`. On Windows, use Git Bash or WSL.

```bash
# 1. Start a local TideCloak dev server (pick your own admin password)
export KC_PASSWORD='<choose-an-admin-password>'
docker run --name safespeak-tidecloak -d -p 8080:8080 \
  -v safespeak-tidecloak-data:/opt/keycloak/data/h2 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD="$KC_PASSWORD" \
  tideorg/tidecloak-dev:latest

# 2. Install dependencies and provision the Tide realm (writes tidecloak.json)
npm install
SUBSCRIPTION_EMAIL='<your-licence-email>' npm run init

# 3. Run the website at http://localhost:3000
npm run dev
```

Running `npm run init` licenses the realm to your email under [Tide's Terms & Conditions](https://tide.org/legal). After provisioning, create the `_tide_report.selfencrypt` role (for reporters) and the `_tide_report.selfdecrypt` role (for investigators), then approve the change requests in the TideCloak admin console. The School Admin account receives neither role.

To run the backend tests (no TideCloak needed):

```bash
node --test "features/api/__tests__/*.test.js"
```

## How it works

```text
Browser (Tide SDK)                    Next.js API                    In-memory store
───────────────────                   ───────────                    ───────────────
login via TideCloak  ──token──▶  verifyTideCloakToken()
encrypt(report, tag) ──ciphertext──▶  POST /api/reports  ──────────▶  { id, createdAt, ciphertext, ownerSub }
decrypt(ciphertext)  ◀──ciphertext──  GET  /api/reports  ◀──────────  owner, or verified investigator role
```

- The API has no encrypt or decrypt endpoints. All cryptography runs in the browser through the Tide SDK.
- The API accepts only `{ "ciphertext" }`. It rejects plaintext fields, bodies over 64 KiB and unverified tokens, and it fails closed if the verifier is unavailable.
- The full contract is in [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

## Repository layout

```text
app/api/reports/        REST routes: POST/GET list, GET/PATCH/DELETE by id
app/home/               Post-login page that composes security + API + UI
features/security/      TideCloak facade: login, token, encryptReport, decryptReport
features/api/           Report store, token verification, browser API client, tests
features/ui/            SafeSpeak React UI (reporter and investigator views)
docs/                   Run instructions, API contract, demo script, test matrix
```

## Limitations

- This is a hackathon prototype that uses synthetic data only. Do not enter real incidents.
- Reports are held in server memory and are lost on restart.
- Reporting is confidential, not anonymous. The server stores the reporter's verified account ID so that it can check ownership.
- The local dev realm has a single admin, so the approval threshold is one. A real deployment would need a multi-admin quorum.
- Verified test results are recorded in [docs/TEST_MATRIX.md](docs/TEST_MATRIX.md).

## Team

Built for RMIT Hackathon 2026, Challenge 2 (Tide UNLOCKED). Team workflow: [CONTRIBUTING.md](CONTRIBUTING.md) · [Build plan](docs/SafeSpeak_VSCode_Parallel_Build.md).
