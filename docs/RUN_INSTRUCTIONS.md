# SafeSpeak: Run and Test Notes

> Synthetic data only. Never enter a real incident or commit credentials, tokens, environment files, TideCloak configuration secrets, or local database files.

## Current status

The submitted video demonstrates the SafeSpeak UI preview with simulated records, role states, and decryption results. Real TideCloak authentication, permissions, encryption, and decryption have not been integrated or verified in this branch.

This branch contains the frontend components and backend feature modules, but it does not currently contain a root `package.json` or complete runnable Next.js starter. Consequently, `npm install` and `npm run dev` are not valid root-level commands yet.

## Backend tests

With Node.js installed, run the isolated backend tests from the repository root:

```bash
node --test "features/api/__tests__/*.test.js"
```

The tests cover request validation, size limits, report ownership, API-client payloads, route exports, unauthenticated responses, and fail-closed behaviour when TideCloak verification is unavailable.

## UI preview

The preview entry point is `app/ui-preview/page.jsx`. It imports `features/ui/dev/mockAdapters.js` and demonstrates:

- Student report submission and history.
- Investigator report review and explicit reveal/hide interaction.
- School Admin presentation with unavailable decryption.
- Responsive SafeSpeak styling using synthetic content.

The preview role menu changes UI state only. It is not authentication or authorisation and must not be used as evidence of TideCloak security.

To run the preview in the future, first compose these files into a compatible Next.js starter with a root `package.json` and layout. Do not add a fake authentication bypass to the production routes.

## Remaining integration work

1. Add the official TideCloak Next.js starter at the repository root.
2. Implement the security adapter in `features/security/useSafeSpeakSecurity.js` using the real SDK.
3. Configure and verify reporter and investigator permissions.
4. Connect the final `/home` page to the security adapter, reports client, and SafeSpeak UI.
5. Verify browser-side encryption, ciphertext-only API traffic, and authorised cross-account decryption.
6. Run a production build and record the results in `docs/TEST_MATRIX.md`.

## Known limitations

- All video content and report data are synthetic.
- The recorded roles and decryption results are simulated.
- Backend reports are held in memory and are lost when the server restarts.
- The current repository branch is not a deployable incident-management system.
