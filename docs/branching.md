# Branching Strategy & Workflow

## Overview
We use a Feature Branch Workflow. The `main` branch is protected and contains production-ready code. All changes happen in short-lived feature branches and are merged via Pull Requests (PRs).

## Branch Naming Convention
Format: `type/short-description`

| Type | Use Case | Example |
| :--- | :--- | :--- |
| `feat` | New features | `feat/user-auth` |
| `fix` | Bug fixes | `fix/login-error` |
| `chore` | Maintenance, config, docs | `chore/update-deps` |
| `refactor` | Code restructuring | `refactor/api-layer` |
| `docs` | Documentation only | `docs/api-guide` |

## Workflow Steps

1.  **Sync Main**:
    ```bash
    git checkout main
    git pull origin main
    ```

2.  **Create Branch**:
    ```bash
    git checkout -b feat/your-feature-name
    ```

3.  **Work & Commit**:
    ```bash
    git add .
    git commit -m "feat: add login page"
    ```

4.  **Push**:
    ```bash
    git push -u origin feat/your-feature-name
    ```

5.  **Pull Request**:
    - Open PR on GitHub.
    - Request review.
    - Merge after approval.

## Branch Protection (One-time Setup)
1.  Go to **Settings** > **Branches** > **Add branch protection rule**.
2.  **Branch name pattern**: `main`.
3.  Check **Require a pull request before merging**.
4.  Check **Require approvals** (1 approval).
5.  Check **Do not allow bypassing the above settings**.
6.  Click **Create**.
