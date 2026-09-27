# Git Commands Quick Reference

## Initialize and Create First Commit

```bash
# Navigate to project directory
cd "D:\Claude\Social media web\Social media App"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Full-stack social media application"
```

## Push to Remote Repository

### Option 1: GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/yourusername/social-media-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Option 2: GitLab

```bash
# Add GitLab remote
git remote add origin https://gitlab.com/yourusername/social-media-app.git

# Push to GitLab
git branch -M main
git push -u origin main
```

### Option 3: Bitbucket

```bash
# Add Bitbucket remote
git remote add origin https://bitbucket.org/yourusername/social-media-app.git

# Push to Bitbucket
git branch -M main
git push -u origin main
```

## Useful Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature-branch-name

# Switch branches
git checkout branch-name

# Merge branch
git merge branch-name

# Pull latest changes
git pull origin main

# View remotes
git remote -v

# Remove remote
git remote remove origin
```

## Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Make your changes...

# 3. Check what changed
git status
git diff

# 4. Stage changes
git add .
# or stage specific files
git add filename.js

# 5. Commit changes
git commit -m "Add: description of your changes"

# 6. Push to remote
git push origin main
```

## Commit Message Conventions

```bash
# Feature
git commit -m "Add: user profile editing functionality"

# Bug fix
git commit -m "Fix: authentication token expiration issue"

# Update
git commit -m "Update: improve post feed performance"

# Refactor
git commit -m "Refactor: reorganize API route handlers"

# Documentation
git commit -m "Docs: add API endpoint documentation"
```

## Undo Changes

```bash
# Discard changes in working directory
git checkout -- filename.js

# Unstage file
git reset HEAD filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```
