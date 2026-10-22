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
- `getReport(id)`, `updateReport(id, newCiphertext)`, and `deleteReport(id)` are documented in the new contract but unused by this agreed UI. No editing, deletion, tracking or categorization features were added.
- Adapter errors must throw a safe `Error`; the UI displays `error.message` and retains drafts on submission failure. Encryption failure never calls `createReport`.

## Views and state

- Signed out: real adapter login action.
- Encrypt permission only: reporter form and receipt.
- Decrypt permission only: review workspace.
- Both: submit/review navigation.
- Neither: server-filtered ciphertext list with disabled decrypt action.
- Token changes, logout, report changes, hiding content and leaving review clear decrypted text. Late decrypt results are ignored after a view/session change.
- No plaintext is stored in local/session storage or written to logs by this UI.
- Responsive list-to-detail navigation, keyboard focus indicators and reduced-motion support.

## Temporary preview

`app/ui-preview/page.jsx` is a development-only route, defaulting to the normal reporter view. The dark development toolbar and state selector have been removed. A styled Role menu in the header opens on hover or button activation and navigates between Student / Reporter, Investigator and School Admin preview workspaces. A footer explicitly identifies simulated data, sign-in and encryption. It imports `features/ui/dev/mockAdapters.js`. Fixtures are not Tide encryption, authorization, or evidence of successful backend integration. No mock adapter is imported by `SafeSpeakApp` or its production children.

The optional `headerNavigation` React node on `SafeSpeakApp` lets the preview place its Role menu in the header. Existing `<SafeSpeakApp security={security} api={api} />` integration remains unchanged and displays no simulated role switcher. `RoleMenu` only calls its supplied navigation handler; it never grants real account roles. Any production role navigation must use actual account permissions from the security adapter.

Remove the preview route and `features/ui/dev/` during final integration, as required by the team guide. Real login, bearer token verification, role provisioning and cross-account decryption must be tested with A/C's implementations; UI preview results cannot establish those capabilities.

## Verification performed

The repository has no generated starter/package manifest yet. A temporary React/Vite harness outside the repository compiled this UI successfully; no harness dependencies were added to the project. The Next.js-specific `use client` directives remain in the source for the final starter.

Browser preview checks passed for submission receipt, draft retention on API failure, invalid encryption output, explicit decrypt/hide, report/view changes clearing plaintext, disabled decrypt without permission, crypto errors, list errors/retry controls, empty inbox, dual-permission navigation and logout. Desktop layout and 390px mobile submission were checked; the mobile page had no horizontal overflow. These checks use simulated adapters only. Real Tide/REST integration and the final Next.js build remain unverified until the team's starter and adapters are available.
