# Git Synchronization Guide

## ❓ Issue: "This branch is X commits behind main"

If GitHub says your branch is **"behind"**, it means the remote repository has changes (commits) that are not yet on your local computer.

This happens when:
1. Teammates push code to the repository.
2. You merge a Pull Request on GitHub, but haven't pulled those changes locally.
3. Automated workflows (like GitHub Actions) push changes.

---

## ✅ The Fix: Sync Your Local Branch

Run these commands in your terminal to update your local `main` branch:

```bash
# 1. Download the latest info from GitHub
git fetch origin

# 2. Switch to your main branch
git checkout main

# 3. Pull the latest changes
git pull origin main
```

Your local `main` is now up to date!

---

## 🔄 Updating Your Feature Branch

If you are working on a feature branch (e.g., `feat/login`) and want to include the latest changes from `main`:

```bash
# 1. Ensure your local main is up to date (see above)
git checkout main
git pull origin main

# 2. Switch back to your feature branch
git checkout feat/login

# 3. Merge main into your branch
git merge main
```

### ⚠️ Handling Conflicts
If `git merge main` reports conflicts:
1. Open the files with conflicts (VS Code highlights them).
2. Choose which changes to keep ("Accept Current", "Accept Incoming", or both).
3. Save the files.
4. Run:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts"
   ```
