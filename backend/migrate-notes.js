const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/social-media';

async function check() {
  await mongoose.connect(MONGODB_URI);

  const Post = mongoose.model('Post', new mongoose.Schema({
    content: String,
    isNote: Boolean,
    userId: mongoose.Schema.Types.ObjectId,
  }, { strict: false, collection: 'posts' }));

  const notes = await Post.find({ isNote: true }, { content: 1 });
  console.log('Posts marked as isNote=true:');
  notes.forEach(p => console.log(' -', (p.content || '(empty)').substring(0, 80)));

  await mongoose.disconnect();
}

check().catch(console.error);
