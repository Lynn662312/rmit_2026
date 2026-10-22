# SafeSpeak

SafeSpeak is a campus reporting prototype for students facing bullying or harassment. Its calm, focused interface gives students space to speak up and share only what they feel ready to share.

## Project overview

### 1. Vision & originality

SafeSpeak explores a supportive reporting experience that avoids overwhelming students at a difficult moment. A student begins with one simple form, receives a clear submission reference, and can return to previous reports without repeatedly entering the same information.

### 2. Trust constraint insight

Reporting sensitive incidents normally requires students to trust the organisation operating the portal and everyone capable of accessing its systems. Fear of inappropriate access, exposure, or retaliation can prevent a report from being submitted. SafeSpeak separates report metadata from the protected-content experience and makes revealing content an explicit action.

### 3. Value & impact

Students receive a clearer and less intimidating way to document an incident. Investigators receive a focused review workflow, while administrator screens do not automatically present readable report content. This could help institutions hear about incidents that would otherwise remain unreported.

### 4. Why TideCloak matters

The intended TideCloak integration would provide real authentication, permission-aware encryption, and controlled decryption instead of relying only on interface states or ordinary backend access rules. This is important because privacy should be enforced technically, not merely promised. In the current recorded prototype, these security operations are simulated and still require integration and verification.

### 5. Prototype & storytelling

The prototype demonstrates a student submitting synthetic content, viewing submission history, an investigator explicitly revealing and hiding a simulated report, and an administrator-facing state where decryption is unavailable. The role selector demonstrates the intended experience; it does not enforce real security.

## Demo video

<!-- Replace VIDEO_ID_HERE after uploading the final recording. -->
[Watch the SafeSpeak demo on YouTube](https://youtu.be/VIDEO_ID_HERE)

The two-minute demonstration uses synthetic data and clearly labelled simulated roles and decryption results.

| Time | Website action | What the demo communicates |
|---|---|---|
| 0:00–0:20 | Show the SafeSpeak page and wisteria design | A calm, focused place for students to speak up. |
| 0:20–0:45 | Enter a synthetic report and select **Encrypt & submit** | A simple submission flow without unnecessary identity fields or attachments. |
| 0:45–1:05 | Select **View my reports** and open the new record | Students can retrieve the report reference, date, and encrypted-content view. |
| 1:05–1:30 | Switch to Investigator, select the report, reveal it, then hide it | Report content is revealed through an explicit simulated action and can be hidden again. |
| 1:30–1:45 | Switch to School Admin and show unavailable decryption | The administrator preview illustrates a restricted intended experience. |
| 1:45–2:00 | Return to the student page | The demonstration closes with the product value and its current security limitation. |

The complete narration is in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Current prototype status

- The frontend workflow and role workspaces use synthetic records and preview adapters.
- The backend implements an in-memory report store, API client, request validation, and route tests.
- Reports are lost whenever the server restarts.
- Real TideCloak authentication, permissions, encryption, decryption, and end-to-end verification remain pending.
- Do not enter real incidents or personal information into this prototype.

## Backend tests

The isolated backend tests do not require TideCloak:

```bash
node --test "features/api/__tests__/*.test.js"
```

## Repository layout

```text
app/api/reports/        Report API routes
app/ui-preview/         Simulated frontend demonstration
features/api/           Store, validation, API client, and tests
features/security/      TideCloak integration boundary; real implementation pending
features/ui/            SafeSpeak student, investigator, and administrator UI
docs/                   Demo script, API contract, and test documentation
```

## Team

Built for RMIT Hackathon 2026, Challenge 2: Tide UNLOCKED.
