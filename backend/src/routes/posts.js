const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.userId) query.userId = req.query.userId;
    
    if (req.query.isArchived !== undefined) {
      query.isArchived = req.query.isArchived === 'true';
    } else {
      query.isArchived = false;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username displayName profilePicture');

    const total = await Post.countDocuments();

    res.json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username displayName profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', auth, [
  body('content').optional({ checkFalsy: true }).trim().isLength({ max: 5000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content, mediaUrl, isStory } = req.body;

    const post = new Post({
      userId: req.user._id,
      content: content || '',
      mediaUrl: mediaUrl || '',
      isStory: !!isStory
    });

    await post.save();
    await post.populate('userId', 'username displayName profilePicture');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (owner only)
router.put('/:id', auth, [
  body('content').optional({ checkFalsy: true }).trim().isLength({ max: 5000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { content, mediaUrl, isArchived } = req.body;

    if (content !== undefined) post.content = content;
    if (mediaUrl !== undefined) post.mediaUrl = mediaUrl;
    if (isArchived !== undefined) post.isArchived = isArchived;

    await post.save();
    await post.populate('userId', 'username displayName profilePicture');

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    // Delete associated likes and comments
    await Like.deleteMany({ postId: req.params.id });
    await Comment.deleteMany({ postId: req.params.id });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Post already liked'
      });
    }

    post.likes.push(req.user._id);
    post.likesCount = post.likes.length;
    await post.save();

    res.json({
      success: true,
      message: 'Post liked successfully',
      data: { likesCount: post.likesCount }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id/like
// @desc    Unlike a post
// @access  Private
router.delete('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Post not liked yet'
      });
    }

    post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    post.likesCount = post.likes.length;
    await post.save();

    res.json({
      success: true,
      message: 'Post unliked successfully',
      data: { likesCount: post.likesCount }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/save
// @desc    Save a post to memories
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.savedBy.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Post already saved' });
    }

    post.savedBy.push(req.user._id);
    await post.save();
    res.json({ success: true, message: 'Post saved to memories' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id/save
// @desc    Unsave a post
// @access  Private
router.delete('/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.savedBy = post.savedBy.filter(id => id.toString() !== req.user._id.toString());
    await post.save();
    res.json({ success: true, message: 'Post removed from memories' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/posts/:id/likes
// @desc    Get all likes for a post
// @access  Public
router.get('/:id/likes', async (req, res) => {
  try {
    const likes = await Like.find({ postId: req.params.id })
      .populate('userId', 'username displayName profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: likes.length,
      data: likes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/posts/:id/comments
// @desc    Get all comments for a post
// @access  Public
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .populate('userId', 'username displayName profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/:id/comments', auth, [
  body('content').trim().notEmpty().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = new Comment({
      postId: req.params.id,
      userId: req.user._id,
      content: req.body.content
    });

    await comment.save();
    await comment.populate('userId', 'username displayName profilePicture');

    // Update comments count
    post.commentsCount += 1;
    await post.save();

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
