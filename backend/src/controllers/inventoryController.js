const { InventoryItem, InventoryTransaction } = require('../models');
const { Op } = require('sequelize');

// Inventory Items
exports.createItem = async (req, res) => {
  try {
    const { item_code, name, category, quantity, unit, min_stock_level, unit_price, location } = req.body;
    
    const status = quantity <= 0 ? 'Out of Stock' : quantity <= min_stock_level ? 'Low Stock' : 'In Stock';
    
    const item = await InventoryItem.create({
      branch_id: req.user.branch_id,
      item_code, name, category, quantity, unit, min_stock_level, unit_price, location, status
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { item_code: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const items = await InventoryItem.findAll({ where, order: [['name', 'ASC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    await InventoryItem.update(req.body, {
      where: { id, branch_id: req.user.branch_id }
    });
    res.json({ message: 'Item updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Inventory Transactions
exports.createTransaction = async (req, res) => {
  try {
    const { item_id, transaction_type, quantity, transaction_date, reference_type, reference_id, remarks } = req.body;
    
    const item = await InventoryItem.findOne({
      where: { id: item_id, branch_id: req.user.branch_id }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    let newQuantity = item.quantity;
    if (transaction_type === 'Purchase' || transaction_type === 'Return') {
      newQuantity += quantity;
    } else if (transaction_type === 'Issue') {
      if (item.quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      newQuantity -= quantity;
    } else if (transaction_type === 'Adjustment') {
      newQuantity = quantity;
    }
    
    const status = newQuantity <= 0 ? 'Out of Stock' : newQuantity <= item.min_stock_level ? 'Low Stock' : 'In Stock';
    
    const transaction = await InventoryTransaction.create({
      branch_id: req.user.branch_id,
      item_id, transaction_type, quantity, transaction_date,
      reference_type, reference_id, remarks,
      created_by: req.user.id
    });
    
    await item.update({ quantity: newQuantity, status });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { item_id, transaction_type, start_date, end_date } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (item_id) where.item_id = item_id;
    if (transaction_type) where.transaction_type = transaction_type;
    if (start_date && end_date) {
      where.transaction_date = { [Op.between]: [start_date, end_date] };
    }
    
    const transactions = await InventoryTransaction.findAll({
      where,
      include: [{ model: InventoryItem, as: 'item' }],
      order: [['transaction_date', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLowStockItems = async (req, res) => {
  try {
    const items = await InventoryItem.findAll({
      where: {
        branch_id: req.user.branch_id,
        status: { [Op.in]: ['Low Stock', 'Out of Stock'] }
      },
      order: [['quantity', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStockReport = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { branch_id: req.user.branch_id };
    if (category) where.category = category;
    
    const items = await InventoryItem.findAll({
      where,
      attributes: ['category', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category', 'status']
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
