[![Built with TideCloak](https://tide.org/badges/built-with-tidecloak.svg)](https://tide.org/tidecloak?utm_source=github&utm_medium=readme&utm_campaign=unlocked)

# SafeSpeak

**Team:** `Taylor_MYS_Onzz_C2`
**Challenge:** RMIT Hackathon 2026 Challenge 2 Tide UNLOCKED

## Demo video

[Watch the two-minute SafeSpeak demo on YouTube](https://youtu.be/ZXnvC7sGWug)

The video uses synthetic data and identifies the simulated records, roles, encryption, and decryption results. The complete narration is available in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).

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

The current repository contains the SafeSpeak frontend, backend feature modules, and documentation, but not a complete root-level Next.js starter or `package.json`. The recorded browser experience uses the clearly labelled UI preview. Full application startup remains pending TideCloak starter integration.

The isolated backend tests require Node.js and can be run from the repository root:

```bash
git clone https://github.com/Lynn662312/rmit_2026.git
cd rmit_2026
node --test "features/api/__tests__/*.test.js"
```

Detailed run notes, preview limitations, and remaining integration work are documented in [docs/RUN_INSTRUCTIONS.md](docs/RUN_INSTRUCTIONS.md).
