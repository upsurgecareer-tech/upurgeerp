const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middlewares/auth');

router.get('/conversations', authenticate, chatController.getConversations);
router.get('/messages', authenticate, chatController.getMessages);
router.post('/send', authenticate, chatController.sendMessage);
router.put('/messages/:id/read', authenticate, chatController.markAsRead);

module.exports = router;
