const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Assuming auth middleware exists (checking other routes)
const auth = require('../middleware/auth'); 

// 1. Get recent conversations (users you have chatted with)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    // Extract unique other users
    const userIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== userId) userIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId) userIds.add(msg.receiver.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } })
      .select('username displayName profilePicture')
      .lean();

    // Attach latest message for each user
    const conversations = users.map(u => {
      const latestMsg = messages.find(m => m.sender.toString() === u._id.toString() || m.receiver.toString() === u._id.toString());
      return {
        user: u,
        latestMessage: latestMsg
      };
    }).sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

    res.json({ success: true, data: conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 2. Get messages with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const userId1 = req.user.id;
    const userId2 = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort({ createdAt: 1 }); // Oldest to newest

    // Mark messages as read
    await Message.updateMany(
      { sender: userId2, receiver: userId1, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 3. Send a message
router.post('/:userId', auth, async (req, res) => {
  try {
    const sender = req.user.id;
    const receiver = req.params.userId;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const newMessage = new Message({
      sender,
      receiver,
      content
    });

    await newMessage.save();

    res.status(201).json({ success: true, data: newMessage });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// 4. Search users to start a new chat
router.get('/users/search', auth, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ success: true, data: [] });

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Exclude current user
    }).select('username displayName profilePicture').limit(10);

    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
