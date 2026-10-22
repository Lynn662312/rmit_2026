# SafeSpeak: RMIT Hackathon 2026 · Challenge 2 (TideCloak / UNLOCKED)

A confidential campus bullying / harassment reporting website. The browser encrypts the report with TideCloak, and the server stores only ciphertext. Synthetic data only.

**Team contract and agent prompts:** [docs/SafeSpeak_VSCode_Parallel_Build.md](docs/SafeSpeak_VSCode_Parallel_Build.md). Read sections 0–4 before you start.

## Connect the Tide agent pack in VS Code

This repository includes a workspace-scoped MCP configuration for Raziel, Tide's
read-only agent pack. It gives GitHub Copilot Chat verified TideCloak guidance,
playbooks, and security review tools; it does not connect to the local
TideCloak instance or access application credentials.

1. Open this repository folder in VS Code with GitHub Copilot enabled.
2. When VS Code asks whether to start the `tide-raziel` MCP server, review the
   endpoint and approve it.
3. If it does not start automatically, open the Command Palette
   (`Ctrl+Shift+P`), run **MCP: List Servers**, select `tide-raziel`, and choose
   **Start**.
4. In Copilot Chat, use agent mode and ask:
   `Use Tide's guidance to review this app's TideCloak integration. Map my blast radius and list concrete fixes.`

The configuration is in [.vscode/mcp.json](.vscode/mcp.json) and uses Tide's
documented hosted endpoint, `https://mcp.tide.org/mcp`. It is read-only and
requires no TideCloak instance, API token, or Node.js installation. For a
local stdio alternative, use `npx -y @tideorg/mcp` in a user-level MCP
configuration instead of committing credentials to this repository.

## File structure and ownership

Every file below is a stub with its contract in a header comment. Each owner implements only their own paths.

```text
app/
├── api/reports/route.js          [C] POST / GET /api/reports
├── ui-preview/page.jsx           [B] TEMP, remove before submission
└── security-preview/page.jsx     [A] TEMP, remove before submission
features/
├── security/                     [A] useSafeSpeakSecurity.js, serialization.js
├── ui/                           [B] SafeSpeakApp.jsx, ReportForm.jsx, ReviewPanel.jsx,
│                                     SafeSpeakApp.module.css, dev/mockAdapters.js (TEMP)
└── api/                          [C] reportStore.js, reportsClient.js, verifyRequest.js
docs/                             [D] DEMO_SCRIPT.md, TEST_MATRIX.md, RUN_INSTRUCTIONS.md
submission/                       [D] summary-draft.md
```

| Role | Owns | Prompts |
|---|---|---|
| A: TideCloak Security | `features/security/`, `app/security-preview/`, all starter-generated files | A1–A3 |
| B: Frontend | `features/ui/`, `app/ui-preview/` | B1–B2 |
| C: Backend + Integrator | `features/api/`, `app/api/reports/`, final `app/home/page.jsx` | C1–C3 |
| D: Delivery | `docs/`, `submission/`, this README at submission | D1–D2 |

### Not created yet: the TideCloak starter (Role A)

`package.json`, `app/layout.jsx`, `app/page.jsx`, `app/auth/redirect/`, `middleware.js` / `proxy.js` and the Tide config JSON come from the official starter:

```powershell
npm init @tidecloak/nextjs@latest safespeak-starter
```

A generates the starter outside this repo (or in a scratch folder) and copies its files into the repo root unchanged. If the starter uses `src/`, move `app/` and `features/` under `src/` so there is only one app root. `app/home/page.jsx` is created by C at integration time, on whatever post-login route the starter uses.

## Rules

- Edit only the paths you own. Do not touch `package.json`, `app/layout.jsx` or auth redirects unless you are A.
- Never commit `.env`, credentials, `node_modules/` or `.next/`.
- Never fake auth, encryption or decryption. Mock adapters are for the UI preview only.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch and PR workflow.
