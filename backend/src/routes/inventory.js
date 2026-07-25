const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

// Items
router.post('/items', inventoryController.createItem);
router.get('/items', inventoryController.getItems);
router.patch('/items/:id', inventoryController.updateItem);
router.get('/items/low-stock', inventoryController.getLowStockItems);

// Transactions
router.post('/transactions', inventoryController.createTransaction);
router.get('/transactions', inventoryController.getTransactions);

// Reports
router.get('/reports/stock', inventoryController.getStockReport);

module.exports = router;
