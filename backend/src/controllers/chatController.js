const ChatMessage = require('../models/ChatMessage');
const { Op } = require('sequelize');

exports.getConversations = async (req, res) => {
  try {
    const user_id = req.user.id;
    const user_type = req.user.role_id === 3 ? 'Student' : 'Parent'; // Assuming role_id 3 is student

    const sequelize = require('../config/database');
    const [conversations] = await sequelize.query(`
      SELECT DISTINCT 
        CASE 
          WHEN sender_id = ? AND sender_type = ? THEN receiver_id
          ELSE sender_id
        END as contact_id,
        CASE 
          WHEN sender_id = ? AND sender_type = ? THEN receiver_type
          ELSE sender_type
        END as contact_type,
        MAX(sent_at) as last_message_time
      FROM chat_messages
      WHERE (sender_id = ? AND sender_type = ?) OR (receiver_id = ? AND receiver_type = ?)
      GROUP BY contact_id, contact_type
      ORDER BY last_message_time DESC
    `, { replacements: [user_id, user_type, user_id, user_type, user_id, user_type, user_id, user_type] });

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { contactId, contactType } = req.query;
    const user_id = req.user.id;
    const user_type = req.user.role_id === 3 ? 'Student' : 'Parent';

    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { sender_id: user_id, sender_type: user_type, receiver_id: contactId, receiver_type: contactType },
          { sender_id: contactId, sender_type: contactType, receiver_id: user_id, receiver_type: user_type }
        ]
      },
      order: [['sent_at', 'ASC']],
      limit: 100
    });

    // Mark messages as read
    await ChatMessage.update(
      { is_read: true, read_at: new Date() },
      { 
        where: { 
          receiver_id: user_id, 
          receiver_type: user_type, 
          sender_id: contactId, 
          sender_type: contactType,
          is_read: false 
        } 
      }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, receiver_type, message_text, attachment_url } = req.body;
    const user_id = req.user.id;
    const user_type = req.user.role_id === 3 ? 'Student' : 'Parent';

    const message = await ChatMessage.create({
      sender_id: user_id,
      sender_type: user_type,
      receiver_id,
      receiver_type,
      message_text,
      attachment_url,
      sent_at: new Date()
    });

    // TODO: Send real-time notification via Socket.io

    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ChatMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ is_read: true, read_at: new Date() });
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
