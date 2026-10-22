# Contributing

## Rules

1. Create a branch for every change: `feature/<task>` or `fix/<task>`.
2. Change only the paths your role owns (see the ownership rules in [docs/SafeSpeak_VSCode_Parallel_Build.md](docs/SafeSpeak_VSCode_Parallel_Build.md) §0 and §2): A `features/security/`, B `features/ui/`, C `features/api/` + `app/api/`, D `docs/` + `submission/`.
3. Do not push directly to `main`.
4. Open a pull request (PR) into `main`; its owner reviews it before merge.
5. For cross-layer changes or updates to `docs/`, request review from at least one teammate.
6. Keep one task per PR and describe how you tested it.

## GitHub settings to apply

After you create the private GitHub repository, protect the `main` branch:

- Require a pull request before merging.
- Require at least one approving review.
- Require review from Code Owners.
- Dismiss stale approvals when new commits are pushed.
- Restrict direct pushes to maintainers only.

`CODEOWNERS` governs who must approve a PR, not who can edit a file on their own computer. The combination above prevents unreviewed changes from being merged.
