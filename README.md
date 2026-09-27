# Social Media App

A full-stack social media application with user profiles, posts, feed, and interactions.

## Features

- User authentication and profile management
- Create posts with text and/or media references
- Real-time feed showing posts (most recent first)
- Like and comment on posts
- Persistent data storage with sample dataset

## Entity Schema

### User
```
{
  id: UUID (Primary Key)
  username: String (Unique, Required)
  email: String (Unique, Required)
  password: String (Hashed, Required)
  displayName: String
  bio: String
  profilePicture: String (URL/Reference)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Post
```
{
  id: UUID (Primary Key)
  userId: UUID (Foreign Key -> User.id)
  content: Text (Required)
  mediaUrl: String (Optional, URL/Reference)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Like
```
{
  id: UUID (Primary Key)
  postId: UUID (Foreign Key -> Post.id)
  userId: UUID (Foreign Key -> User.id)
  createdAt: DateTime
  
  Unique constraint: (postId, userId)
}
```

### Comment
```
{
  id: UUID (Primary Key)
  postId: UUID (Foreign Key -> Post.id)
  userId: UUID (Foreign Key -> User.id)
  content: Text (Required)
  createdAt: DateTime
  updatedAt: DateTime
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/:id` - Get user profile by ID
- `PUT /api/users/:id` - Update user profile (authenticated)
- `GET /api/users/:id/posts` - Get posts by user

### Posts
- `GET /api/posts` - Get all posts (feed, sorted by most recent)
- `GET /api/posts/:id` - Get single post by ID
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated, owner only)
- `DELETE /api/posts/:id` - Delete post (authenticated, owner only)

### Likes
- `POST /api/posts/:id/like` - Like a post (authenticated)
- `DELETE /api/posts/:id/like` - Unlike a post (authenticated)
- `GET /api/posts/:id/likes` - Get all likes for a post

### Comments
- `GET /api/posts/:id/comments` - Get all comments for a post
- `POST /api/posts/:id/comments` - Add comment to post (authenticated)
- `PUT /api/comments/:id` - Update comment (authenticated, owner only)
- `DELETE /api/comments/:id` - Delete comment (authenticated, owner only)

## Project Structure

```
social-media-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication, validation
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── data/                # Sample dataset
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── context/         # React context (auth, etc.)
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Helper functions
│   │   └── App.js           # Main app component
│   ├── public/
│   └── package.json
│
└── README.md

```

## Tech Stack

### Backend
- Node.js
- Express.js
- Database (PostgreSQL/MongoDB)
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React
- React Router
- Axios for API calls
- Context API for state management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Database (PostgreSQL/MongoDB)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd social-media-app
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables (create .env files in backend/)
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Run database migrations and seed sample data
```bash
cd backend
npm run migrate
npm run seed
```

6. Start the backend server
```bash
npm run dev
```

7. Start the frontend development server
```bash
cd ../frontend
npm start
```

## License

MIT
