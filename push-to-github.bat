@echo off
REM Git Repository Setup and Push Script
REM This script will initialize git and push to GitHub

echo ========================================
echo Social Media App - Git Push to GitHub
echo ========================================
echo.

REM Navigate to project directory
cd /d "D:\Claude\Social media web\Social media App"

echo Step 1: Initializing Git Repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to initialize git repository
    pause
    exit /b 1
)
echo ✓ Git repository initialized
echo.

echo Step 2: Adding all files to staging...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to add files
    pause
    exit /b 1
)
echo ✓ Files added to staging
echo.

echo Step 3: Creating initial commit...
git commit -m "Initial commit: Full-stack social media application" -m "Features:" -m "- User authentication (register/login)" -m "- User profiles with CRUD operations" -m "- Create posts with text/media" -m "- Feed with most recent posts first" -m "- Like/unlike posts" -m "- Comment on posts" -m "- JWT authentication" -m "- MongoDB database with sample data" -m "- React frontend with routing" -m "- Express.js backend API"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create commit
    pause
    exit /b 1
)
echo ✓ Initial commit created
echo.

echo Step 4: Renaming branch to main...
git branch -M main
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to rename branch
    pause
    exit /b 1
)
echo ✓ Branch renamed to main
echo.

echo Step 5: Adding remote repository...
git remote add origin https://github.com/bubblegunn1111/sys-social-media-lunar.git
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Remote may already exist, trying to set URL...
    git remote set-url origin https://github.com/bubblegunn1111/sys-social-media-lunar.git
)
echo ✓ Remote repository added
echo.

echo Step 6: Pushing to GitHub...
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to push to GitHub
    echo.
    echo Please check:
    echo 1. Your GitHub credentials are correct
    echo 2. You have access to the repository
    echo 3. The repository exists on GitHub
    pause
    exit /b 1
)
echo.
echo ========================================
echo ✓ SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Repository: https://github.com/bubblegunn1111/sys-social-media-lunar
echo.
echo Next steps:
echo 1. Visit your GitHub repository to verify
echo 2. Follow SETUP.md to run the application locally
echo 3. See DEMO_GUIDE.md for testing instructions
echo.
pause
