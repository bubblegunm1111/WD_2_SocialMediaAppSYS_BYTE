# Social Media App - Setup Instructions

This project has been initialized with a git repository structure. Follow the steps below to complete the setup.

## Initialize Git Repository

Run these commands in your project root directory:

```bash
cd "D:\Claude\Social media web\Social media App"
git init
git add .
git commit -m "Initial commit: Full-stack social media application"
```

## Setup Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create your .env file:
```bash
cp .env.example .env
```

4. Edit `.env` and update with your MongoDB connection string and JWT secret

5. Start MongoDB (make sure it's running)

6. Seed the database with sample data:
```bash
node data/seed.js
```

7. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

## Setup Frontend

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Sample User Accounts

After seeding the database, you can login with these accounts (all passwords: `password123`):

- john@example.com
- jane@example.com
- mike@example.com
- sarah@example.com

## Push to Remote Repository

To push to a remote git repository:

```bash
# Add your remote repository
git remote add origin <your-repository-url>

# Push to main branch
git branch -M main
git push -u origin main
```

## Project Structure

```
social-media-app/
├── backend/               # Node.js/Express backend
│   ├── src/
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── server.js     # Express server
│   └── data/
│       └── seed.js       # Sample dataset
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── services/    # API services
│   └── public/
│
├── .gitignore
└── README.md
```

## Features Implemented

✅ User authentication (register/login)
✅ User profiles with create/update capability
✅ Create posts with text and/or media reference
✅ Functional feed showing posts (most recent first)
✅ Like and unlike posts
✅ Comment on posts
✅ Authentication required for post creation and interaction
✅ Posts and interactions persisted in MongoDB
✅ Sample dataset included

## API Documentation

See README.md for complete API endpoint documentation.

## Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router v6
- Axios for API calls
- Context API for state management

## Next Steps

1. Initialize the git repository
2. Install dependencies for both backend and frontend
3. Set up MongoDB and update .env
4. Seed the database
5. Start both servers
6. Access the app at http://localhost:3000
7. Push to your remote repository

Enjoy building your social media app! 🚀
