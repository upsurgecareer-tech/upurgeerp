const { Notice } = require('../models');
const { Op } = require('sequelize');

exports.createNotice = async (req, res) => {
  try {
    const { title, content, target_audience, targetAudience, priority, publish_date, publishDate, expiry_date, expiryDate, attachment_url, attachments, status } = req.body;
    
    const notice = await Notice.create({
      branch_id: req.user.branch_id || 1,
      title,
      content,
      target_audience: target_audience || targetAudience || 'All',
      priority: priority || 'Medium',
      publish_date: publish_date || publishDate || new Date(),
      expiry_date: expiry_date || expiryDate || null,
      attachment_url: attachment_url || attachments || null,
      created_by: req.user.id,
      status: status || 'Published'
    });
    
    res.status(201).json({ status: 'success', data: notice, notice });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, message: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const { audience, priority, status } = req.query;
    const where = {};
    if (req.user && req.user.branch_id) {
      where.branch_id = req.user.branch_id;
    }
    
    if (audience) {
      where.target_audience = { [Op.in]: ['All', audience] };
    }
    if (priority) where.priority = priority;
    if (status) where.status = status;
    
    const notices = await Notice.findAll({
      where,
      order: [['priority', 'DESC'], ['publish_date', 'DESC'], ['created_at', 'DESC']]
    });
    
    res.json({ status: 'success', data: notices, notices });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, message: error.message });
  }
};

exports.getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findByPk(id);
    
    if (!notice) {
      return res.status(404).json({ status: 'error', error: 'Notice not found', message: 'Notice not found' });
    }
    
    res.json({ status: 'success', data: notice, notice });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, message: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({ status: 'error', error: 'Notice not found', message: 'Notice not found' });
    }
    
    await notice.update(updates);
    res.json({ status: 'success', data: notice, notice });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, message: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({ status: 'error', error: 'Notice not found', message: 'Notice not found' });
    }
    await notice.destroy();
    res.json({ status: 'success', message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, message: error.message });
  }
};

exports.getActiveNotices = async (req, res) => {
  try {
    const now = new Date();
    const where = {
      status: 'Published',
      publish_date: { [Op.lte]: now },
      [Op.or]: [
        { expiry_date: null },
        { expiry_date: { [Op.gte]: now } }
      ]
    };
    if (req.user && req.user.branch_id) {
      where.branch_id = req.user.branch_id;
    }
    const notices = await Notice.findAll({
      where,
      order: [['priority', 'DESC'], ['publish_date', 'DESC']],
      limit: 10
    });
    
    res.json({ status: 'success', data: notices, notices });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message, message: error.message });
  }
};

module.exports = exports;
