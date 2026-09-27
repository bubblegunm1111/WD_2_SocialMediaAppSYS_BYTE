# Demo Guide & Screenshots

This guide provides instructions for creating demo screenshots and testing the application.

## Application Flow

### 1. Authentication Flow

#### Register Page (`/register`)
- Form fields: Username, Display Name, Email, Password
- Validation: Minimum password length, unique username/email
- Success: Redirects to home feed

#### Login Page (`/login`)
- Form fields: Email, Password
- Error handling for invalid credentials
- Success: Redirects to home feed with auth token

### 2. Home Feed (`/`)

#### Features to Demonstrate:
- **Create Post Section** (top of feed)
  - Text input area for post content
  - Optional image URL input
  - "Post" button (disabled when empty)

- **Feed Display**
  - Posts sorted by most recent first
  - Each post shows:
    - User avatar and display name (clickable to profile)
    - Post timestamp (relative time)
    - Post content (text)
    - Image (if provided)
    - Like count and button
    - Comment count and button
    - Delete button (only on own posts)

- **Interactions**
  - Click 👍 to like/unlike a post
  - Click 💬 to view/hide comments
  - Add new comments in expanded view

### 3. User Profile (`/profile/:userId`)

#### Features to Demonstrate:
- **Profile Header**
  - Large profile picture (circular)
  - Display name and @username
  - Bio text
  - "Edit Profile" button (own profile only)

- **Edit Profile Mode**
  - Update display name
  - Update bio
  - Save/Cancel buttons

- **User Posts**
  - All posts by the user
  - Same interaction features as home feed
  - Post count displayed

### 4. Navigation
- **Navbar** (sticky top)
  - "Social Media" logo (links to home)
  - Current user display name
  - Logout button

## Demo Scenarios

### Scenario 1: New User Journey
1. Visit `/register`
2. Create account with valid credentials
3. Automatically logged in and redirected to home
4. See sample posts from other users
5. Create your first post
6. Like and comment on other posts

### Scenario 2: Social Interactions
1. Log in as existing user
2. Browse the feed
3. Like multiple posts (see count increment)
4. Unlike a post (see count decrement)
5. Click comment button on a post
6. Add several comments
7. View comments from other users

### Scenario 3: Profile Management
1. Click on your name in navbar
2. View your profile and posts
3. Click "Edit Profile"
4. Update display name and bio
5. Save changes
6. Verify updates appear in navbar and posts

### Scenario 4: Content Creation
1. From home feed, click post text area
2. Write meaningful content
3. Add an image URL (optional)
4. Click "Post" button
5. See new post appear at top of feed
6. Verify you can delete your own post

### Scenario 5: User Discovery
1. Click on another user's name/avatar
2. View their profile
3. See their bio and post history
4. Like and comment on their posts
5. Navigate back to home feed

## Sample Content for Demo

### Sample Post Content:
```
Just launched my first full-stack app! 🚀 #WebDev #React #NodeJS

Exploring the world one adventure at a time ✈️🌍

Morning coffee and code - the perfect start to any day ☕💻

Finished a great workout today! Feeling energized 💪

Creating art that speaks to the soul 🎨✨
```

### Sample Image URLs (Unsplash):
```
https://images.unsplash.com/photo-1507525428034-b723cf961d3e
https://images.unsplash.com/photo-1506905925346-21bda4d32df4
https://images.unsplash.com/photo-1541961017774-22349e4a1262
https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8
https://images.unsplash.com/photo-1498050108023-c5249f4df085
```

## Testing Checklist

### Authentication ✓
- [ ] User can register with valid data
- [ ] Cannot register with existing email
- [ ] Cannot register with short password
- [ ] User can login with valid credentials
- [ ] Cannot login with invalid credentials
- [ ] User stays logged in after page refresh
- [ ] Logout works correctly

### Posts ✓
- [ ] User can create post with text only
- [ ] User can create post with text and image
- [ ] Cannot create empty post
- [ ] Posts appear in feed (newest first)
- [ ] User can delete own posts
- [ ] Cannot delete other users' posts
- [ ] Post timestamps display correctly

### Likes ✓
- [ ] User can like a post
- [ ] Like count increments
- [ ] User can unlike a post
- [ ] Like count decrements
- [ ] Cannot like without authentication

### Comments ✓
- [ ] User can view comments on a post
- [ ] User can add comment
- [ ] Comments display with author info
- [ ] Cannot comment without authentication
- [ ] Comment count updates correctly

### Profile ✓
- [ ] Can view any user profile
- [ ] Profile shows user info correctly
- [ ] Profile shows user's posts
- [ ] Can edit own profile
- [ ] Cannot edit other users' profiles
- [ ] Profile updates reflect everywhere

### Navigation ✓
- [ ] Navbar persists across pages
- [ ] Logo links to home
- [ ] Profile link works
- [ ] Logout redirects to login
- [ ] Protected routes require authentication

## Performance Notes

### Expected Load Times:
- Initial page load: < 2 seconds
- Feed load: < 1 second
- Create post: < 500ms
- Like/Unlike: < 300ms
- Add comment: < 500ms
- Profile load: < 1 second

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Responsiveness

The app is responsive and works on:
- Desktop (1920x1080 and above)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667 and above)

## Screenshot Recommendations

For documentation, capture screenshots of:
1. Login page
2. Register page
3. Home feed with multiple posts
4. Post with expanded comments
5. User profile view
6. Profile edit mode
7. Create post interface
8. Post with image
9. Liked post (showing blue like button)
10. Mobile view (responsive design)

## Demo Video Script (5 minutes)

**0:00-0:30** - Introduction & Registration
- Show app homepage
- Register new account
- Automatic login

**0:30-1:30** - Home Feed
- Browse feed
- Show post with image
- Like a post
- Unlike a post

**1:30-2:30** - Comments
- Open comments section
- Add multiple comments
- Show comments from different users

**2:30-3:30** - Create Post
- Click create post area
- Write content
- Add image URL
- Post and see it appear at top

**3:30-4:30** - Profile
- Navigate to own profile
- Edit profile information
- Save changes
- Show updated info

**4:30-5:00** - Conclusion
- Navigate through app
- Show mobile responsive view
- Logout

## Notes for Presenters

- Emphasize real-time updates (likes, comments)
- Highlight authentication security (JWT)
- Mention database persistence (MongoDB)
- Show clean, modern UI design
- Demonstrate responsive design
- Explain full-stack architecture
