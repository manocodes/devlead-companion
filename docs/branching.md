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

## Working on Multiple Branches
Sometimes you need to switch tasks (e.g., fix a critical bug while working on a feature).

### Option 1: Git Stash (Quick Switch)
Use this if you just need to pause your current work for a moment.
1.  **Save changes**: `git stash`
2.  **Switch branch**: `git checkout main` (or other branch)
3.  **Do work & commit**.
4.  **Return**: `git checkout feat/original-branch`
5.  **Restore changes**: `git stash pop`

### Option 2: Git Worktree (Simultaneous Work)
Use this to have two separate folders for different branches (no stashing needed).
1.  **Create new worktree**: `git worktree add ../devlead-hotfix main`
    - This creates a folder `../devlead-hotfix` checked out to `main`.
2.  **Work in that folder** as if it's a separate repo.
3.  **Remove when done**:
    - `git worktree remove ../devlead-hotfix`

