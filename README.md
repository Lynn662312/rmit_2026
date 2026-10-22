# RMIT 2026 Hackathon

Private team repository for the RMIT 2026 hackathon.

## Project structure

| Folder | Purpose |
| --- | --- |
| `frontend/` | Client application, UI, and frontend tests |
| `backend/` | API, services, data access, and backend tests |
| `docs/` | Planning, design, API agreements, and project documentation |

Work is organized by application layer, not by contributor. Coordinate through pull requests when a change spans the frontend and backend.

## First-time setup

```powershell
git clone <YOUR-PRIVATE-REPOSITORY-URL>
cd rmit_2026
git switch -c feature/<short-task>
```

Before opening a pull request:

```powershell
git fetch origin
git rebase origin/main
git push -u origin HEAD
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the collaboration rules and `.github/CODEOWNERS` for ownership configuration.
