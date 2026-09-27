@echo off
echo Fixing Git Remote and Pushing to GitHub...
echo.

cd /d "D:\Claude\Social media web\Social media App"

REM Remove the existing remote
git remote remove origin 2>nul

REM Add the remote again
git remote add origin https://github.com/bubblegunn1111/sys-social-media-lunar.git

REM Check if we have any commits
git log --oneline -1 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo No commits found. Creating initial commit...
    git add .
    git commit -m "Initial commit: Full-stack social media application"
)

echo.
echo Attempting to push to GitHub...
echo If prompted, please enter your GitHub credentials.
echo.

REM Push to GitHub
git push -u origin main

echo.
echo If you see an authentication error, you may need to:
echo 1. Use a Personal Access Token instead of password
echo 2. Or configure GitHub CLI (gh auth login)
echo.
pause
