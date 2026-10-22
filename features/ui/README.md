# SafeSpeak frontend integration

Frontend-only implementation of the frozen `docs/API_CONTRACT.md` v1.0 and the security/UI interfaces in `docs/SafeSpeak_VSCode_Parallel_Build.md`. No new runtime dependencies or changes to backend, authentication, root configuration, or final composition.

## Entry point

```jsx
import SafeSpeakApp from '../../features/ui/SafeSpeakApp';

// Integration owner supplies these existing adapters:
const security = useSafeSpeakSecurity();
const api = makeReportsClient(security.token);
return <SafeSpeakApp security={security} api={api} />;
```

Keep the actual starter's provider, redirect, and path convention. If it uses `src/`, move the existing directories consistently; do not create two app roots.

## Names and payloads

- Security properties used unchanged: `authenticated`, `login`, `logout`, `token`, `canEncrypt`, `canDecrypt`, `encryptReport(text)`, `decryptReport(ciphertext)`.
- Submit: `await security.encryptReport(text)` must return a nonempty string, then `await api.createReport(ciphertext)` returns `{ id, createdAt }`.
- The API client owned by C sends `POST /api/reports` with only `{ ciphertext }` and the bearer access token. The UI never constructs an alternative API route or sends plaintext metadata.
- Review: `await api.listReports()` returns an array of `{ id, createdAt, ciphertext }`, not the HTTP `{ reports: [...] }` wrapper. The client unwraps that response.
- The server controls list visibility/ownership. The UI does not derive roles from unverified JWT claims or treat `canDecrypt` as API authorization.
- Only an explicit button click invokes `security.decryptReport(ciphertext)`. No bulk or automatic decryption.
- Student history calls `api.getReport(id)` for each selected submission. This unwraps `GET /api/reports/:id` into `{ id, createdAt, ciphertext }` in C's existing client. No new endpoint or client method was introduced. `updateReport` and `deleteReport` remain unused; no editing, deletion, tracking or categorization features were added.
- Adapter errors must throw a safe `Error`; the UI displays `error.message` and retains drafts on submission failure. Encryption failure never calls `createReport`.

## Views and state

- Signed out: real adapter login action.
- Encrypt permission only: reporter form, receipt, and My reports navigation. The receipt includes a shortcut to history.
- Decrypt permission only: review workspace.
- Both: submit/accessible-reports/review navigation. The history is labelled Accessible reports for this account because a server-verified investigator may receive all records; the API does not return an owner identifier for client-side filtering.
- Neither: server-filtered ciphertext list with disabled decrypt action.
- Token changes, logout, report changes, hiding content and leaving review clear decrypted text. Late decrypt results are ignored after a view/session change. Routine token refreshes preserve a report draft; logout or an unauthenticated transition clears it. An account switch must pass through the security adapter's signed-out state (or the integration must remount the app for the new identity).
- No plaintext is stored in local/session storage or written to logs by this UI.
- Responsive list-to-detail navigation, keyboard focus indicators and reduced-motion support.

## Temporary preview

`app/ui-preview/page.jsx` is a development-only route, defaulting to the normal reporter view. The dark development toolbar and state selector have been removed. A styled Role menu in the header opens on hover or button activation and navigates between Student / Reporter, Investigator and School Admin preview workspaces. A footer explicitly identifies simulated data, sign-in and encryption. It imports `features/ui/dev/mockAdapters.js`. Fixtures are not Tide encryption, authorization, or evidence of successful backend integration. No mock adapter is imported by `SafeSpeakApp` or its production children.

The optional `headerNavigation` React node on `SafeSpeakApp` lets the preview place its Role menu in the header. Existing `<SafeSpeakApp security={security} api={api} />` integration remains unchanged and displays no simulated role switcher. `RoleMenu` only calls its supplied navigation handler; it never grants real account roles. Any production role navigation must use actual account permissions from the security adapter.

Remove the preview route and `features/ui/dev/` during final integration, as required by the team guide. Real login, bearer token verification, role provisioning and cross-account decryption must be tested with A/C's implementations; UI preview results cannot establish those capabilities.

## Verification performed

The repository has no generated starter/package manifest yet. A temporary React/Vite harness outside the repository compiled this UI successfully; no harness dependencies were added to the project. The Next.js-specific `use client` directives remain in the source for the final starter.

Browser preview checks passed for submission receipt, draft retention on API failure, invalid encryption output, explicit decrypt/hide, report/view changes clearing plaintext, disabled decrypt without permission, crypto errors, list errors/retry controls, empty inbox, dual-permission navigation and logout. Desktop layout and 390px mobile submission were checked; the mobile page had no horizontal overflow. These checks use simulated adapters only. Real Tide/REST integration and the final Next.js build remain unverified until the team's starter and adapters are available.

Final handoff checks also verified that a simulated access-token refresh preserves the typed report, while logout followed by login clears the draft. The header Role menu was checked for role-specific navigation, permission states, keyboard dismissal and 390px layout.

## Student report history and trust boundaries

`ReportHistory.jsx` consumes `listReports()` and `getReport(id)` from the existing frozen API client. The API supplies bearer headers and unwraps response envelopes. The history reloads from the API when opened or refreshed; report detail is fetched afresh on selection. Selection changes, session changes and unmounts invalidate late responses and clear decrypted text. No report is recovered from a browser plaintext cache.

History includes loading/empty states, refresh, 401 sign-in recovery, a safe 404 missing/inaccessible message, service-error retry, and mobile list/detail navigation. The UI does not fabricate an ownership filter or claim the role-preview menu is real authorization.

An owner can retrieve ciphertext without permission to decrypt it. A student with `canDecrypt === false` sees their reference/date/encrypted content and an explanation; the decrypt action remains disabled, following the original security contract. Reading original text requires A to provision actual permitted Tide decryption and verify that the SDK can decrypt the stored payload. No UI permission bypass or plaintext fallback was added. Records remain temporary under the existing in-memory storage.

Checks performed for this change:

- Existing backend tests ran unchanged: 23 passed (storage ownership, request/response/client shapes, missing-auth rejection and verifier-unavailable fail-closed behavior). Storage identities and client tokens in these tests are fixtures; they do not establish real Tide login or role provisioning.
- Browser contract harness used the actual `makeReportsClient` with simulated HTTP responses: collection GET and item GET used their frozen paths and bearer header; POST contained ciphertext only; list/report envelopes were correctly unwrapped.
- History navigation and receipt shortcut, empty state, 401 sign-in action, 404 refresh, 503 error, permission-gated decrypt and clearing plaintext on leaving the view were checked.
- Real session login/ownership and real encryption/decryption remain unverified: this branch still contains placeholder security methods, no merged runnable Tide starter, and an unset backend investigator role. Backend/security files were not changed by this frontend work.
