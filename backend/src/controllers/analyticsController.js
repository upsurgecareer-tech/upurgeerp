const sequelize = require('../config/database');
const Lead = require('../models/Lead');
const { fn, col } = require('sequelize');

exports.getLeadSourceAnalytics = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const [data] = await sequelize.query(`
      SELECT COALESCE(source, 'Unknown') as source, COUNT(*) as count
      FROM leads WHERE branch_id = ?
      GROUP BY source ORDER BY count DESC
    `, { replacements: [branch_id] });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeadStageFunnel = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const data = await Lead.findAll({
      where: { branch_id },
      attributes: ['stage', [fn('COUNT', col('id')), 'count']],
      group: ['stage'],
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeadConversionRate = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const [result] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN stage = 'Converted' THEN 1 ELSE 0 END) as converted,
        ROUND(SUM(CASE WHEN stage = 'Converted' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as conversion_rate
      FROM leads WHERE branch_id = ?
    `, { replacements: [branch_id] });
    res.json({ data: result[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCounsellorPerformance = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const [data] = await sequelize.query(`
      SELECT u.first_name, u.last_name,
        COUNT(l.id) as total_leads,
        SUM(CASE WHEN l.stage = 'Converted' THEN 1 ELSE 0 END) as converted_leads
      FROM users u
      LEFT JOIN leads l ON l.assigned_to = u.id
      WHERE u.branch_id = ?
      GROUP BY u.id, u.first_name, u.last_name
    `, { replacements: [branch_id] });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseWiseEnquiry = async (req, res) => {
  try {
    const branch_id = req.user.branch_id;
    const [data] = await sequelize.query(`
      SELECT COALESCE(course_interest, 'Not Specified') as course, COUNT(*) as count
      FROM leads WHERE branch_id = ?
      GROUP BY course_interest ORDER BY count DESC LIMIT 10
    `, { replacements: [branch_id] });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
