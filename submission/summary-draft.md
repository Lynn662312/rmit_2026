# SafeSpeak: Submission Summary

> Challenge 2: Tide UNLOCKED. This summary describes only what the recorded prototype demonstrates.

## Problem

Students experiencing bullying or harassment may avoid reporting because the process feels intimidating and they are uncertain who can access a sensitive disclosure. When students stay silent, institutions lose the opportunity to respond.

## Trust constraint

A conventional reporting portal asks students to trust the organisation operating it and everyone capable of accessing its systems. Fear of inappropriate access, exposure, or retaliation can prevent a report from being submitted.

## Prototype

SafeSpeak presents a calm, focused reporting experience. Students can submit synthetic content, receive a report reference, and revisit their submission history. An investigator workspace demonstrates explicit reveal and hide actions, while the School Admin preview shows unavailable decryption.

The role selector, encrypted-content view, and decryption results in the recorded prototype are simulated interface states. They do not provide real authentication, encryption, or authorisation.

## Intended TideCloak role

TideCloak would allow SafeSpeak to replace simulated interface restrictions with real identity, permission-aware encryption, and controlled decryption. This matters because sensitive-report confidentiality should be technically enforced rather than relying only on application UI or organisational promises.

Real TideCloak integration and end-to-end verification remain future work and are not claimed in the demo.

## Verified results

| Check | Result | Evidence |
|---|---|---|
| Backend unit and route tests | PASS, 23/23 | `node --test "features/api/__tests__/*.test.js"` on 2026-10-22 |
| UI behaviour with simulated adapters | Demonstrated | [Demo video](https://youtu.be/ZXnvC7sGWug) |
| Real TideCloak authentication/encryption/decryption | Not integrated | Stated in the README and video |

## Limitations

- The prototype and video use synthetic data only.
- UI roles and decryption results are simulated.
- Reports use in-memory storage and are lost on restart.
- This branch is not a deployable incident-management system.
