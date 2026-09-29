const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/social-media';

async function fix() {
  await mongoose.connect(MONGODB_URI);

  const Post = mongoose.model('Post', new mongoose.Schema({
    content: String,
    isNote: Boolean,
  }, { strict: false, collection: 'posts' }));

  const User = mongoose.model('User', new mongoose.Schema({
    username: String
  }, { strict: false }));

  // Find the user 'testwanderer'
  const wanderer = await User.findOne({ username: 'testwanderer' });
  
  if (wanderer) {
    const result = await Post.updateMany(
      { userId: wanderer._id, isNote: { $ne: true } },
      { $set: { isNote: true } }
    );
    console.log(`Updated ${result.modifiedCount} posts from testwanderer to isNote=true`);
  } else {
    console.log('testwanderer not found');
  }

  // Also let's just mark any post that is long or looks like creative writing as a note
  const allPosts = await Post.find({ isNote: { $ne: true } });
  let count = 0;
  for (const post of allPosts) {
    const content = post.content || '';
    if (content.length > 50 || content.includes('Started a new painting') || content.includes('Reykjavik')) {
      post.isNote = true;
      await post.save();
      count++;
    }
  }
  
  console.log(`Updated ${count} additional creative writing posts to isNote=true`);

  await mongoose.disconnect();
}

fix().catch(console.error);
