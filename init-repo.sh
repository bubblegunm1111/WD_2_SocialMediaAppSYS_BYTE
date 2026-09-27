#!/bin/bash

# Social Media App - Git Repository Initialization Script

echo "🚀 Initializing Git Repository for Social Media App..."
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git repository
echo "📦 Initializing git repository..."
git init

# Add all files
echo "➕ Adding all files to staging..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Full-stack social media application

Features:
- User authentication (register/login)
- User profiles with CRUD operations
- Create posts with text/media
- Feed with most recent posts first
- Like/unlike posts
- Comment on posts
- JWT authentication
- MongoDB database with sample data
- React frontend with routing
- Express.js backend API"

echo ""
echo "✅ Git repository initialized successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Add remote repository: git remote add origin <your-repo-url>"
echo "2. Push to remote: git push -u origin main"
echo ""
echo "📖 See SETUP.md for complete setup instructions"
