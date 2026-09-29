const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Reflection = require('../models/Reflection');

// @route   POST /api/reflections
// @desc    Create a new reflection
// @access  Private
router.post('/', auth, [
  check('content', 'Content is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content, mood, mediaUrl } = req.body;

    const reflection = new Reflection({
      userId: req.user._id,
      content,
      mood: mood || null,
      mediaUrl: mediaUrl || ''
    });

    await reflection.save();

    res.status(201).json({
      success: true,
      data: reflection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reflections
// @desc    Get user's reflections
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const reflections = await Reflection.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reflections.length,
      data: reflections
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
