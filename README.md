[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

# SafeSpeak

## Project overview

_SafeSpeak is a calm campus reporting prototype for documenting bullying or harassment through a permission-aware review process._

Built with [TideCloak](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked).

### 1. Vision & originality

SafeSpeak proposes a supportive reporting experience that avoids overwhelming students. A student begins with one focused form, receives a submission reference, and can return to previous reports without re-entering information.

### 2. Trust constraint insight

Sensitive reporting requires students to trust the organisation operating the portal and those with system access. Fear of exposure or retaliation can prevent a report from being submitted. Removing this bottleneck could let students seek help without giving every operator automatic access to readable disclosures.

### 3. Value & impact

Students receive a less intimidating way to document an incident. Investigators receive a focused review workflow, while administrator screens do not automatically display readable content. A student can submit a synthetic report, revisit its reference and date, and see that reading it is a separate review step.

### 4. Why TideCloak matters

TideCloak is intended to replace simulated interface restrictions with real authentication, permission-aware encryption, and controlled decryption. This matters because confidentiality should be technically enforced rather than relying only on application UI or organisational promises. In the recorded prototype, these security operations remain simulated and require integration and verification.

### 5. Prototype & storytelling

The prototype demonstrates student submission history, an investigator explicitly revealing and hiding a simulated report, and a School Admin state where decryption is unavailable. Judges should watch the transition between these workspaces. The role selector demonstrates the intended experience; it does not enforce real security.

## Setup

The current branch contains the SafeSpeak frontend, backend feature modules, and documentation, but not a complete root-level Next.js starter or `package.json`. The recorded browser experience uses the clearly labelled UI preview. Full application startup remains pending TideCloak starter integration.

The isolated backend tests can be run with Node.js:

```bash
git clone https://github.com/Lynn662312/rmit_2026.git
cd rmit_2026
node --test "features/api/__tests__/*.test.js"
```

See [docs/RUN_INSTRUCTIONS.md](docs/RUN_INSTRUCTIONS.md) for the current preview status, limitations, and remaining integration work.

## Demo video

[Watch the two-minute SafeSpeak demo on YouTube](https://youtu.be/ZXnvC7sGWug)

The video uses synthetic data and clearly identifies simulated records, roles, encryption, and decryption results. The complete narration is in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

## Challenge 2 submission checklist

Status audited against the RMIT Hackathon 2026 final team submission checklist. An item is checked only when it can be verified from the public repository.

Detailed evidence and next actions are tracked in [submission/SUBMISSION_CHECKLIST.md](submission/SUBMISSION_CHECKLIST.md).

- [ ] **Correct Challenge 2 team name:** confirm the submitted name follows `<university>_<campus>_<team>_C2`.
- [x] **Public GitHub repository accessible:** [Lynn662312/rmit_2026](https://github.com/Lynn662312/rmit_2026).
- [ ] **`sourcecodes.zip` and `summary.doc` uploaded:** neither required file is currently present.
- [ ] **Two-minute `video.mp4` uploaded:** the [YouTube video](https://youtu.be/ZXnvC7sGWug) is available, but `video.mp4` is not currently present in the repository.
- [x] **Run instructions included:** see [docs/RUN_INSTRUCTIONS.md](docs/RUN_INSTRUCTIONS.md).
- [x] **Simulated components identified:** the README, demo script, run instructions, and video distinguish simulated behaviour from real TideCloak security.
- [ ] **Google Form submitted before 6:00 PM MYT:** requires confirmation from the team member submitting the form.

### Additional Tide UNLOCKED checks

- [x] README begins with the required five-question project overview.
- [x] Project overview is no more than 300 words.
- [x] Demo video link is publicly accessible.
- [ ] Add the final `.mp4` under 100 MB to the public repository if required by the submission form.
- [ ] Confirm the repository link has been entered in the official Google Form.

## Current prototype status

- The frontend workflow and role workspaces use synthetic records and preview adapters.
- The backend implements an in-memory report store, API client, request validation, and route tests.
- Reports are lost whenever the server restarts.
- Real TideCloak authentication, permissions, encryption, decryption, and end-to-end verification remain pending.
- Do not enter real incidents or personal information into this prototype.

## Repository layout

```text
app/api/reports/        Report API routes
app/ui-preview/         Simulated frontend demonstration
features/api/           Store, validation, API client, and tests
features/security/      TideCloak integration boundary; real implementation pending
features/ui/            SafeSpeak student, investigator, and administrator UI
docs/                   Demo script, API contract, run notes, and test documentation
submission/             Submission summary source
```

## Team

Built for RMIT Hackathon 2026, Challenge 2: Tide UNLOCKED.
