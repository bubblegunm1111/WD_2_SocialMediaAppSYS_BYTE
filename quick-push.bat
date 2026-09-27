@echo off
cd /d "D:\Claude\Social media web\Social media App"
git init
git add .
git commit -m "Initial commit: Full-stack social media application"
git branch -M main
git remote add origin https://github.com/bubblegunn1111/sys-social-media-lunar.git
git push -u origin main
pause
