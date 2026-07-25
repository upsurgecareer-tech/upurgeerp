const LiveClass = require('../models/LiveClass');

exports.scheduleLiveClass = async (req, res) => {
  try {
    const { batch_id, title, scheduled_at, duration_minutes, platform } = req.body;
    const branch_id = req.user.branch_id;

    // TODO: Generate meeting link via Zoom/Jitsi API
    const meeting_link = `https://zoom.us/j/meeting-${Date.now()}`;
    const meeting_id = `MEET${Date.now()}`;

    const liveClass = await LiveClass.create({
      branch_id,
      batch_id,
      faculty_id: req.user.id,
      title,
      scheduled_at,
      duration_minutes,
      platform: platform || 'Zoom',
      meeting_link,
      meeting_id,
      status: 'Scheduled'
    });

    // TODO: Send notification to students

    res.status(201).json({ message: 'Live class scheduled successfully', liveClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLiveClasses = async (req, res) => {
  try {
    const { batch_id, status } = req.query;
    const where = { branch_id: req.user.branch_id };

    if (batch_id) where.batch_id = batch_id;
    if (status) where.status = status;

    const liveClasses = await LiveClass.findAll({ where, order: [['scheduled_at', 'DESC']] });
    res.json({ liveClasses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLiveClassById = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }
    res.json({ liveClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findByPk(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    await liveClass.update(req.body);
    res.json({ message: 'Live class updated successfully', liveClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const liveClass = await LiveClass.findByPk(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }

    await liveClass.update({ status });
    res.json({ message: 'Live class status updated successfully', liveClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const liveClasses = await LiveClass.findAll({
      where: {
        branch_id: req.user.branch_id,
        scheduled_at: { [Op.gte]: new Date() },
        status: 'Scheduled'
      },
      order: [['scheduled_at', 'ASC']],
      limit: 10
    });
    res.json({ liveClasses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
