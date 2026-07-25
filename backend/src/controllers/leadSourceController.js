const LeadSource = require('../models/LeadSource');
const LeadStage = require('../models/LeadStage');

exports.getLeadSources = async (req, res) => {
  try {
    const sources = await LeadSource.findAll({ where: { is_active: true } });
    res.json({ sources });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createLeadSource = async (req, res) => {
  try {
    const { name } = req.body;
    const source = await LeadSource.create({ name, is_active: true });
    res.status(201).json({ message: 'Lead source created successfully', source });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLeadSource = async (req, res) => {
  try {
    const source = await LeadSource.findByPk(req.params.id);
    if (!source) {
      return res.status(404).json({ message: 'Lead source not found' });
    }
    await source.update(req.body);
    res.json({ message: 'Lead source updated successfully', source });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteLeadSource = async (req, res) => {
  try {
    const source = await LeadSource.findByPk(req.params.id);
    if (!source) {
      return res.status(404).json({ message: 'Lead source not found' });
    }
    await source.update({ is_active: false });
    res.json({ message: 'Lead source deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeadStages = async (req, res) => {
  try {
    const stages = await LeadStage.findAll({ order: [['order_sequence', 'ASC']] });
    res.json({ stages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createLeadStage = async (req, res) => {
  try {
    const { name, order_sequence, color_code } = req.body;
    const stage = await LeadStage.create({ name, order_sequence, color_code });
    res.status(201).json({ message: 'Lead stage created successfully', stage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLeadStage = async (req, res) => {
  try {
    const stage = await LeadStage.findByPk(req.params.id);
    if (!stage) {
      return res.status(404).json({ message: 'Lead stage not found' });
    }
    await stage.update(req.body);
    res.json({ message: 'Lead stage updated successfully', stage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
