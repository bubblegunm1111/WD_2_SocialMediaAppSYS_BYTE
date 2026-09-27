const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Like = require('../src/models/Like');
const Comment = require('../src/models/Comment');

dotenv.config();

const sampleUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    displayName: 'John Doe',
    bio: 'Tech enthusiast and coffee lover ☕',
    profilePicture: 'https://i.pravatar.cc/150?img=12'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    displayName: 'Jane Smith',
    bio: 'Travel blogger | Photography 📸',
    profilePicture: 'https://i.pravatar.cc/150?img=5'
  },
  {
    username: 'mike_wilson',
    email: 'mike@example.com',
    password: 'password123',
    displayName: 'Mike Wilson',
    bio: 'Fitness coach and nutrition expert 💪',
    profilePicture: 'https://i.pravatar.cc/150?img=33'
  },
  {
    username: 'sarah_johnson',
    email: 'sarah@example.com',
    password: 'password123',
    displayName: 'Sarah Johnson',
    bio: 'Digital artist | Creative soul 🎨',
    profilePicture: 'https://i.pravatar.cc/150?img=20'
  }
];

const samplePosts = [
  {
    content: 'Just finished building my first full-stack social media app! Excited to share it with everyone. 🚀',
    mediaUrl: ''
  },
  {
    content: 'Beautiful sunset at the beach today. Nature never ceases to amaze me! 🌅',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
  },
  {
    content: 'Completed a 10K run this morning! Feeling energized and ready for the day. Remember, consistency is key! 🏃‍♂️',
    mediaUrl: ''
  },
  {
    content: 'Working on a new digital illustration. Here\'s a sneak peek! What do you think?',
    mediaUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'
  },
  {
    content: 'Coffee and code - the perfect combination for a productive morning ☕💻',
    mediaUrl: ''
  },
  {
    content: 'Exploring the mountains this weekend. The view from the top is absolutely breathtaking!',
    mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
  },
  {
    content: 'Meal prep Sunday! Healthy eating starts with good preparation. 🥗',
    mediaUrl: ''
  },
  {
    content: 'Just finished this abstract piece. Art is all about expressing your inner thoughts.',
    mediaUrl: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800'
  }
];

const sampleComments = [
  'Amazing work! Keep it up! 👏',
  'This is so inspiring!',
  'Love this! 😍',
  'Great job!',
  'This looks incredible!',
  'Can\'t wait to see more!',
  'Wow, absolutely beautiful!',
  'You\'re so talented!',
  'This made my day!',
  'Keep sharing more content like this!'
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      createdUsers.push(user);
    }

    console.log(`Created ${createdUsers.length} users`);

    // Create posts
    const createdPosts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const userIndex = i % createdUsers.length;
      const post = new Post({
        userId: createdUsers[userIndex]._id,
        ...samplePosts[i]
      });

      await post.save();
      createdPosts.push(post);
    }

    console.log(`Created ${createdPosts.length} posts`);

    // Create likes (random distribution)
    let likesCount = 0;
    for (const post of createdPosts) {
      const numLikes = Math.floor(Math.random() * createdUsers.length);
      const shuffledUsers = [...createdUsers].sort(() => Math.random() - 0.5);

      for (let i = 0; i < numLikes; i++) {
        const like = new Like({
          postId: post._id,
          userId: shuffledUsers[i]._id
        });

        try {
          await like.save();
          post.likesCount += 1;
          likesCount++;
        } catch (error) {
          // Skip duplicate likes
        }
      }

      await post.save();
    }

    console.log(`Created ${likesCount} likes`);

    // Create comments
    let commentsCount = 0;
    for (const post of createdPosts) {
      const numComments = Math.floor(Math.random() * 4) + 1; // 1-4 comments per post

      for (let i = 0; i < numComments; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        const comment = new Comment({
          postId: post._id,
          userId: randomUser._id,
          content: randomComment
        });

        await comment.save();
        post.commentsCount += 1;
        commentsCount++;
      }

      await post.save();
    }

    console.log(`Created ${commentsCount} comments`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample accounts (all passwords: password123):');
    sampleUsers.forEach(user => {
      console.log(`- ${user.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
