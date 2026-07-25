const Asset = require('../models/Asset');
const { Employee, User } = require('../models');

exports.getAssets = async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const assets = await Asset.findAll({
      where,
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'employee_code', 'designation'],
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json({ assets });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const { name, asset_code, category, brand, model, serial_number, purchase_date, purchase_cost, warranty_expiry, location, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Asset name is required' });

    const asset = await Asset.create({
      name, asset_code, category, brand, model, serial_number,
      purchase_date, purchase_cost, warranty_expiry, location, notes,
      status: 'Available'
    });
    res.status(201).json({ message: 'Asset created', asset });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    await asset.update(req.body);
    res.json({ message: 'Asset updated', asset });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    await asset.destroy();
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.assignAsset = async (req, res) => {
  try {
    const { employee_id, assigned_date } = req.body;
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    await asset.update({
      assigned_to: employee_id,
      assigned_date: assigned_date || new Date().toISOString().split('T')[0],
      status: 'Assigned'
    });
    res.json({ message: 'Asset assigned successfully', asset });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.returnAsset = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    await asset.update({ assigned_to: null, assigned_date: null, status: 'Available' });
    res.json({ message: 'Asset returned', asset });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
