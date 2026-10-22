# SafeSpeak: Run Instructions

> OWNER: Role D (writes) · A and C supply the exact commands once verified.
> Synthetic data only. Never commit `.env`, `tidecloak.json` secrets, or the TideCloak database files.

## Prerequisites

- Node.js 20.9 or later (Next.js 16)
- Docker Desktop
- A bash shell with `curl` and `jq`. On Windows, use Git Bash or WSL; `npm run init` runs a bash script.
- An email address you control, to receive the Tide licence for the realm

## 1. Start TideCloak (Docker)

Choose your own admin password. Do not reuse the `password` default from the quickstart.

```bash
export KC_PASSWORD='<choose-an-admin-password>'
docker run --name safespeak-tidecloak -d -p 8080:8080 \
  -v safespeak-tidecloak-data:/opt/keycloak/data/h2 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD="$KC_PASSWORD" \
  tideorg/tidecloak-dev:latest
```

The named volume `safespeak-tidecloak-data` keeps the realm outside the repository. Do not mount the project folder (`-v .:...`): that writes `keycloakdb.*` files into the repo.

Wait until http://localhost:8080 loads before you continue.

## 2. Provision the realm

```bash
npm install
SUBSCRIPTION_EMAIL='<your-licence-email>' npm run init
```

`npm run init` runs `init/tcinit.sh`. It reads its defaults from `init/.env.example`, and environment variables you set override them. The script does the following:

1. Creates the realm from `init/realm.json`.
2. Licenses the realm with Tide. By running it, you accept [Tide's Terms & Conditions](https://tide.org/legal).
3. Enables governance (IGA), creates the first admin and grants it `tide-realm-admin`.
4. Writes the adapter config to `tidecloak.json`.

Follow the link the script prints to link the admin to a Tide account.

## 3. Tide roles for SafeSpeak

In the admin console (http://localhost:8080/admin), open the SafeSpeak realm and create these realm roles:

| Role | Assign to | Grants |
|---|---|---|
| `_tide_report.selfencrypt` | Reporter (student) accounts | Encrypt data under the `report` tag |
| `_tide_report.selfdecrypt` | Investigator accounts only | Decrypt data under the `report` tag |

- Do **not** add either role to `default-roles-<realm>`, and do not give School Admin accounts any `_tide_report.*` role.
- TideCloak records each role creation and assignment as a change request. Approve it under **Change Requests**, then check that its status is **COMMITTED**.
- Set `INVESTIGATOR_ROLE` in `features/api/verifyRequest.js` to the role the server uses to grant investigators read-all access.

## 4. Run the website

```bash
npm run dev
```

Open http://localhost:3000, sign in, and submit a synthetic report.

## 5. Test accounts (synthetic)

Create three accounts on the TideCloak sign-in page. Use invented names only.

| Account | Roles | Expected behaviour |
|---|---|---|
| Student / Reporter | `_tide_report.selfencrypt` | Can submit; sees only their own reports |
| Investigator | `_tide_report.selfdecrypt` | Can list all reports and decrypt on demand |
| School Admin | none | Sees only ciphertext; decryption is refused |

## 6. Automated tests

```bash
node --test "features/api/__tests__/*.test.js"
```

These tests cover the backend (storage, validation, ownership and fail-closed token handling) and need no TideCloak instance. The `failing closed` log lines are expected.

Record end-to-end results (T1–T8) in [TEST_MATRIX.md](TEST_MATRIX.md).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| API returns `503 Authentication service unavailable` | `tidecloak.json` is missing or `@tidecloak/nextjs` is not installed. The API fails closed by design. |
| API returns `401` with a valid session | The token was not sent as `Authorization: Bearer <token>`, or it has expired. |
| `400 DPoP proof is missing` at login | The realm requires DPoP but the client has not enabled it. See the starter's `tide_dpop` route. |
| Decrypt fails for the Investigator | The role assignment is not COMMITTED, or the account was not re-logged in after the role was granted. |

## Known limitations

- Reports are held in memory and are cleared when the server restarts. Run a single `npm run dev` process for the demo.
- Reporting is confidential, not anonymous. The server stores the reporter's verified `sub` so that it can check ownership.
- The dev realm has one admin, so the approval threshold is one. Multi-admin quorum is not demonstrated.
