const { Notice } = require('../models/Notice');
const { Op } = require('sequelize');

exports.createNotice = async (req, res) => {
  try {
    const { title, content, targetAudience, priority, publishDate, expiryDate, attachments } = req.body;
    
    const notice = await Notice.create({
      organizationId: req.user.organizationId,
      branchId: req.user.branchId,
      title,
      content,
      targetAudience,
      priority,
      publishDate,
      expiryDate,
      attachments,
      createdBy: req.user.id
    });
    
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const { audience, priority, active } = req.query;
    const where = { organizationId: req.user.organizationId };
    
    if (audience) {
      where.targetAudience = { [Op.in]: ['All', audience] };
    }
    if (priority) where.priority = priority;
    if (active !== undefined) where.isActive = active === 'true';
    
    // Only show notices within publish/expiry dates
    const now = new Date();
    where.publishDate = { [Op.lte]: now };
    where[Op.or] = [
      { expiryDate: null },
      { expiryDate: { [Op.gte]: now } }
    ];
    
    const notices = await Notice.findAll({
      where,
      order: [['priority', 'DESC'], ['publishDate', 'DESC']]
    });
    
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findOne({
      where: { id, organizationId: req.user.organizationId }
    });
    
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updated] = await Notice.update(updates, {
      where: { id, organizationId: req.user.organizationId }
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    const notice = await Notice.findByPk(id);
    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Notice.destroy({
      where: { id, organizationId: req.user.organizationId }
    });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveNotices = async (req, res) => {
  try {
    const now = new Date();
    const notices = await Notice.findAll({
      where: {
        organizationId: req.user.organizationId,
        isActive: true,
        publishDate: { [Op.lte]: now },
        [Op.or]: [
          { expiryDate: null },
          { expiryDate: { [Op.gte]: now } }
        ]
      },
      order: [['priority', 'DESC'], ['publishDate', 'DESC']],
      limit: 10
    });
    
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
