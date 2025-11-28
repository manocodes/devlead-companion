# Git Worktree Tutorial: Working on Two Branches at Once

This guide shows you how to use `git worktree` to work on multiple branches simultaneously without switching back and forth in the same folder.

## Scenario
You are working on a feature in your main folder (`devlead-companion`), but you need to fix a critical bug on `main` immediately.

## Step 1: Create a New Worktree
Run this command from your terminal inside `devlead-companion`:

```bash
# Syntax: git worktree add <path-to-new-folder> <branch-name>
git worktree add ../devlead-hotfix main
```

**What this does:**
- Creates a new folder `../devlead-hotfix` (sibling to your current folder).
- Checks out the `main` branch in that folder.
- Your current folder stays on your feature branch.

## Step 2: Switch Context
You now have two separate folders:
1.  `devlead-companion/` (Feature Branch)
2.  `devlead-hotfix/` (Main Branch)

**How to work:**
- **Terminal**: Just `cd ../devlead-hotfix` to run commands for that branch.
- **Antigravity (AI)**: You can ask me to edit files in either folder. Just specify which one!
  - Example: "Fix the bug in `../devlead-hotfix/backend/server.ts`"

## Step 3: Do Your Work
Make your changes in the `devlead-hotfix` folder.

```bash
cd ../devlead-hotfix
# make changes...
git add .
git commit -m "fix: critical bug"
git push origin main
```

## Step 4: Cleanup
When you are done with the hotfix, close the second VS Code window and remove the worktree:

```bash
# Go back to your main repo
cd ../devlead-companion

# Remove the worktree
git worktree remove ../devlead-hotfix
```

## List Active Worktrees
To see what worktrees you have:
```bash
git worktree list
```
