const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  mood: {
    type: String,
    enum: ['Peaceful', 'Happy', 'Restless', 'Tired', 'Lost', 'Inspired', 'Grateful', null],
    default: null
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  musicUrl: {
    type: String,
    default: ''
  },
  linkUrl: {
    type: String,
    default: ''
  },
  isStarred: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reflectionSchema.index({ userId: 1 });
reflectionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reflection', reflectionSchema);
