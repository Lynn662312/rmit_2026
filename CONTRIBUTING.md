# Contributing

## Rules

1. Create a branch for every change: `feature/<name>-<task>` or `fix/<name>-<task>`.
2. Work only inside your assigned folder unless the team explicitly agrees otherwise.
3. Do not push directly to `main`.
4. Open a pull request (PR) into `main`; its owner reviews it before merge.
5. For `shared/` or `docs/`, request review from at least one teammate.
6. Keep one task per PR and describe how you tested it.

## GitHub settings to apply

After you create the private GitHub repository, protect the `main` branch:

- Require a pull request before merging.
- Require at least one approving review.
- Require review from Code Owners.
- Dismiss stale approvals when new commits are pushed.
- Restrict direct pushes to maintainers only.

`CODEOWNERS` governs who must approve a PR, not who can edit a file on their own computer. The combination above prevents unapproved changes to another member's folder from being merged.
