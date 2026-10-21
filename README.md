# RMIT 2026 Hackathon

Private team repository for the RMIT 2026 hackathon.

## Workspace ownership

| Folder | Owner | Purpose |
| --- | --- | --- |
| `Cynthia/` | Cynthia | Cynthia's feature and notes |
| `dana/` | Dana | Dana's feature and notes |
| `lynn/` | Lynn | Lynn's feature and notes |
| `xuanyu/` | XY | XY's feature and notes |
| `shared/` | Whole team | Deliberately shared code, assets, and interfaces |
| `docs/` | Whole team | Planning, design, and project documentation |

Do work in your own folder. Make changes to `shared/` only through a pull request agreed by the team.

## First-time setup

```powershell
git clone <YOUR-PRIVATE-REPOSITORY-URL>
cd rmit_2026
git switch -c feature/<your-name>-<short-task>
```

Before opening a pull request:

```powershell
git fetch origin
git rebase origin/main
git push -u origin HEAD
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the collaboration rules and `.github/CODEOWNERS` for ownership configuration.
