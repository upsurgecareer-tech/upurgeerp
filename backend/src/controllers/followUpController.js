const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const { Op } = require('sequelize');

exports.createFollowUp = async (req, res) => {
  try {
    const { lead_id } = req.params;
    const { follow_up_date, follow_up_type, notes } = req.body;

    const lead = await Lead.findByPk(lead_id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const followUp = await FollowUp.create({
      lead_id,
      counsellor_id: req.user.id,
      follow_up_date,
      follow_up_type,
      notes,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Follow-up scheduled successfully', followUp });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFollowUpsByLead = async (req, res) => {
  try {
    const { lead_id } = req.params;
    const followUps = await FollowUp.findAll({
      where: { lead_id },
      order: [['follow_up_date', 'DESC']]
    });
    res.json({ followUps });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTodayFollowUps = async (req, res) => {
  try {
    const { getLocalTodayDate } = require('../utils/timezoneHelper');
    const todayStr = getLocalTodayDate();
    
    // Create boundaries to perfectly capture today from 00:00:00 to 23:59:59 in DB UTC equivalent
    const startDate = new Date(`${todayStr}T00:00:00Z`);
    const endDate = new Date(`${todayStr}T23:59:59Z`);

    const followUps = await FollowUp.findAll({
      where: {
        follow_up_date: { [Op.between]: [startDate, endDate] }
      },
      include: [{
        model: Lead,
        as: 'lead',
        attributes: ['id', 'name', 'mobile', 'email', 'branch_id'],
        where: req.user.role_id !== 1 ? { branch_id: req.user.branch_id } : {}
      }],
      order: [['follow_up_date', 'ASC']]
    });

    const formattedFollowUps = followUps.map(fu => ({
      ...fu.toJSON(),
      lead_name: fu.lead?.name || 'Unknown'
    }));

    res.json({ followUps: formattedFollowUps });
  } catch (error) {
    console.error('getTodayFollowUps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUpcomingFollowUps = async (req, res) => {
  try {
    const { getLocalTodayDate } = require('../utils/timezoneHelper');
    const todayStr = getLocalTodayDate();
    
    // Tomorrow starts exactly at the end of today
    const tomorrowStart = new Date(`${todayStr}T23:59:59Z`);
    tomorrowStart.setSeconds(tomorrowStart.getSeconds() + 1);

    const followUps = await FollowUp.findAll({
      where: {
        follow_up_date: { [Op.gte]: tomorrowStart }
      },
      include: [{
        model: Lead,
        as: 'lead',
        attributes: ['id', 'name', 'mobile', 'email', 'branch_id'],
        where: req.user.role_id !== 1 ? { branch_id: req.user.branch_id } : {}
      }],
      order: [['follow_up_date', 'ASC']],
      limit: 100
    });

    const formattedFollowUps = followUps.map(fu => ({
      ...fu.toJSON(),
      lead_name: fu.lead?.name || 'Unknown'
    }));

    res.json({ followUps: formattedFollowUps });
  } catch (error) {
    console.error('getUpcomingFollowUps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByPk(req.params.id, {
      include: [{ model: Lead, as: 'lead', attributes: ['branch_id'] }]
    });
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    if (req.user.role_id !== 1 && followUp.lead?.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Lead belongs to another branch' });
    }

    await followUp.update(req.body);
    res.json({ message: 'Follow-up updated successfully', followUp });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByPk(req.params.id, {
      include: [{ model: Lead, as: 'lead', attributes: ['branch_id'] }]
    });
    if (!followUp) {
      return res.status(404).json({ message: 'Follow-up not found' });
    }

    if (req.user.role_id !== 1 && followUp.lead?.branch_id !== req.user.branch_id) {
      return res.status(403).json({ message: 'Permission denied: Lead belongs to another branch' });
    }

    await followUp.destroy();
    res.json({ message: 'Follow-up deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
