@echo off
REM Social Media App - Git Repository Initialization Script (Windows)

echo Initializing Git Repository for Social Media App...
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Please install Git first.
    exit /b 1
)

REM Initialize git repository
echo Initializing git repository...
git init

REM Add all files
echo Adding all files to staging...
git add .

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit: Full-stack social media application" -m "Features:" -m "- User authentication (register/login)" -m "- User profiles with CRUD operations" -m "- Create posts with text/media" -m "- Feed with most recent posts first" -m "- Like/unlike posts" -m "- Comment on posts" -m "- JWT authentication" -m "- MongoDB database with sample data" -m "- React frontend with routing" -m "- Express.js backend API"

echo.
echo Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Add remote repository: git remote add origin ^<your-repo-url^>
echo 2. Push to remote: git push -u origin main
echo.
echo See SETUP.md for complete setup instructions
pause
